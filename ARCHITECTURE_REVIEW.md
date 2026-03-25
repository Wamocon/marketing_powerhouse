# Architecture & System Design Review
## Social Hub ↔ Momentum Integration

**Date:** 2026-03-24  
**Status:** ✅ 42/42 QA tests passing  
**Reviewed:** Full integration — auth, API, database bridge, scheduler, client

---

## 1. System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        MOMENTUM APP                             │
│                     (Next.js 16 / React 19)                     │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐  ┌──────────────┐   │
│  │ Calendar  │  │ Campaigns│  │ Content   │  │ Social Hub   │   │
│  │ View      │  │ Manager  │  │ Editor    │  │ Client       │   │
│  └─────┬────┘  └────┬─────┘  └─────┬─────┘  │ (socialHub.ts│   │
│        │            │              │         └──────┬───────┘   │
│        └────────────┴──────────────┴────────────────┘           │
│                          │                                      │
│                    Supabase Auth JWT                             │
│                          │                                      │
└──────────────────────────┼──────────────────────────────────────┘
                           │ REST API + Bearer Token
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SOCIAL HUB                                 │
│                  (FastAPI / Python)                              │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐  ┌──────────────┐   │
│  │ API v1   │  │ Auth     │  │ Scheduler │  │ AI Services  │   │
│  │ Router   │  │ Bridge   │  │ v2        │  │ Gemini/Imagen│   │
│  └─────┬────┘  └────┬─────┘  └─────┬─────┘  └──────┬───────┘   │
│        │            │              │               │            │
│  ┌─────┴────────────┴──────────────┴───────────────┘            │
│  │           Momentum Models (SQLModel Bridge)                  │
│  └──────────────────────────┬───────────────────────            │
│                             │                                   │
│  ┌──────────────────────────┴───────────────────────┐           │
│  │           Legacy Dashboard (Jinja2 Web UI)       │           │
│  └──────────────────────────────────────────────────┘           │
└──────────────────────────┬──────────────────────────────────────┘
                           │ SQLModel / psycopg3
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                  SUPABASE POSTGRES                               │
│                  Schema: test                                    │
│                                                                 │
│  Momentum-owned tables:         Social Hub tables:              │
│  ├── connected_accounts         ├── socialhub_posts             │
│  ├── scheduled_posts            ├── socialhub_topic_ideas       │
│  ├── contents                   ├── socialhub_linkedin_accounts │
│  ├── engagement_metrics         ├── socialhub_app_logs          │
│  ├── companies                  ├── socialhub_dynamic_settings  │
│  └── ...                        └── socialhub_job_leases        │
└─────────────────────────────────────────────────────────────────┘
```

## 2. Data Flow

### 2.1 AI Post Generation (Momentum → Social Hub → DB)
```
Momentum User → socialHub.ts.generateAiPost()
    → POST /api/v1/generate (Bearer JWT + X-Company-Id)
    → auth.py validates JWT, extracts user_id + company_id
    → Finds connected_account for platform
    → gemini_service generates text + image prompt
    → Creates MomentumContent entry (appears on editorial calendar)
    → Creates MomentumScheduledPost entry (status: draft)
    → imagen_service generates image asynchronously
    → Returns { post_id, topic, platform, status }
```

### 2.2 Scheduled Publishing (Scheduler → Platform APIs)
```
APScheduler (every 2 min) → job_publish_due()
    → _acquire_lease("publish:due") for distributed locking
    → SELECT from scheduled_posts WHERE status='scheduled' AND scheduled_at <= now
    → For each post:
        → Lookup connected_account for access token
        → Refresh token if expiring
        → Upload image + create post on LinkedIn/Instagram
        → Update status to 'published', store platform_post_id
        → Schedule value comment via one-shot APScheduler job
```

### 2.3 Real-Time Calendar Sync
```
Both apps read/write the same scheduled_posts table.
Momentum sees changes immediately via Supabase Realtime subscriptions.
Social Hub writes create draft → Momentum user approves → status changes to 'scheduled'
→ Scheduler picks it up at scheduled_at time.
```

## 3. Issues Found & Fixed

### 3.1 CRITICAL — JWT Signature Verification Disabled
- **File:** `auth.py:74`
- **Issue:** `verify_signature: False` — any valid-looking JWT was accepted, including forged tokens
- **Fix:** Added `SUPABASE_JWT_SECRET` config. When set, JWT signature is verified with HS256 + audience="authenticated". When not set (dev), falls back to unverified mode with a warning log.
- **Action Required:** Set `SUPABASE_JWT_SECRET` env var in production (from Supabase Dashboard → Settings → API → JWT Secret)

### 3.2 CRITICAL — `hashtags` Column Type Mismatch
- **File:** `momentum_models.py:85`
- **Issue:** DB column is `text[]` (Postgres array) but model used `JSON` type → INSERT failed with `DatatypeMismatch`
- **Fix:** Changed to `Column("hashtags", ARRAY(Text))` with proper SQLAlchemy `ARRAY` + `Text` imports

### 3.3 HIGH — UUID Serialization in List Posts
- **File:** `api_v1.py` list-posts endpoint
- **Issue:** UUID objects passed to `JSONResponse` aren't serializable → would crash on any company with posts
- **Fix:** Explicit `str(p.id)` and `str(p.connected_account_id)` conversion

### 3.4 HIGH — Deprecated `asyncio.get_event_loop().call_later()`
- **File:** `api_v1.py` publish endpoints (LinkedIn + Instagram)
- **Issue:** `call_later` with `ensure_future` is deprecated, unreliable in async contexts, and duplicates scheduler_v2 logic
- **Fix:** Replaced with `scheduler.add_job()` one-shot APScheduler jobs (consistent with scheduler_v2)

### 3.5 HIGH — Timezone-Naive vs Aware Datetime Comparison
- **File:** `scheduler_service_v2.py:53`
- **Issue:** `lease.expires_at` from DB is naive, `datetime.now(timezone.utc)` is aware → `TypeError` on every scheduler tick
- **Fix:** Normalize naive datetimes to UTC-aware before comparison

### 3.6 MEDIUM — Session Cookie Auth Has No Server-Side Validation
- **File:** `auth.py:115-123`
- **Issue:** Any `_session_id` + `_company_id` cookie combo is trusted — no session store verification
- **Status:** Acceptable for dev/internal dashboard. For production, implement server-side session validation or replace with Supabase Auth for the dashboard too.

### 3.7 LOW — `access_token_encrypted` Field Name Misleading
- **Issue:** The field name implies encryption but tokens are stored/read as plaintext
- **Status:** Not a code bug, but a naming concern. Real encryption should be added before production (encrypt at rest, decrypt on use).

## 4. Architecture Assessment

### 4.1 What's Working Well ✅

| Aspect | Assessment |
|--------|-----------|
| **Separation of Concerns** | Clean microservice boundary — Social Hub handles AI + publishing, Momentum handles UX + business logic |
| **Shared Database** | Direct table access eliminates sync latency. Both apps see changes immediately. |
| **API Contract** | 8 well-defined endpoints with Pydantic request/response models |
| **Error Handling** | Structured JSON errors with timestamps for API paths, HTML templates for dashboard |
| **Security Headers** | X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy all set |
| **CORS** | Properly configured for localhost development with credentials support |
| **Distributed Locking** | Job leases prevent duplicate publishing in multi-instance deployments |
| **Backward Compatibility** | Legacy dashboard routes (37) still work alongside new API (8 endpoints) |
| **Scheduler** | Polls every 2 min across ALL companies — no per-company job sprawl |
| **Token Refresh** | LinkedIn + Instagram tokens auto-refreshed before publish |

### 4.2 Edge Cases Handled ✅

| Edge Case | Handling |
|-----------|---------|
| Expired OAuth tokens | Auto-refresh attempted; fails gracefully with error_message on post |
| Missing connected account | 400 error before any API call attempted |
| Image generation failure | Caught and logged; post created without image |
| Instagram container timeout | Polls 12x at 5s intervals (60s total); raises RuntimeError |
| Instagram rate limits | Checks `quota_usage` before publish; fails gracefully |
| Concurrent scheduler instances | `_acquire_lease()` with TTL prevents duplicate execution |
| Invalid UUID path params | `_to_uuid()` helper returns 400 with clear message |
| Non-existent post operations | 404 before any side effects |
| Cross-company access | Auth context checks `company_id` match on all endpoints |

### 4.3 Remaining Risks & Recommendations

| # | Risk | Severity | Recommendation |
|---|------|----------|----------------|
| 1 | **Scheduler single-point-of-failure** | MEDIUM | If the Social Hub process crashes, no posts get published until restart. Consider a health check monitor or a fallback worker. |
| 2 | **Image storage is local filesystem** | MEDIUM | `DATA_DIR/images/` is lost on container restart. Move to Supabase Storage or S3 for persistence. |
| 3 | **No webhook for real-time Momentum updates** | LOW | Momentum polls via Supabase Realtime (already works). For faster UX, Social Hub could POST a webhook after publish completes. |
| 4 | **Session cookie auth for dashboard** | LOW | Acceptable for internal use. For multi-user dashboard, integrate Supabase Auth. |

## 5. Production Readiness Checklist

| Item | Status |
|------|--------|
| JWT signature verification | ✅ Implemented (requires `SUPABASE_JWT_SECRET` env var) |
| CORS origins | ✅ Configurable via `CORS_ORIGINS` env var (comma-separated) |
| Error messages | ✅ Production mode hides internal details |
| Database schema | ✅ Migration applied, models match |
| Scheduler | ✅ Running with distributed locking + retry job |
| Health endpoint | ✅ Includes DB, scheduler, and API status |
| QA test suite | ✅ 42/42 passing |
| Security headers | ✅ Applied via middleware |
| Token refresh | ✅ LinkedIn + Instagram |
| Rate limiting | ✅ Per-endpoint limits on all AI + publish endpoints |
| Token encryption | ✅ Fernet encryption via `TOKEN_ENCRYPTION_KEY` env var |
| Failed post retry | ✅ Auto-retry every 10 min (up to max_retries) |
| Image persistence | ❌ Local filesystem only |

## 6. File Inventory

### New Files (Created for Integration)
| File | Purpose |
|------|---------|
| `Social Hub/app/momentum_models.py` | SQLModel bridge to Momentum's DB tables |
| `Social Hub/app/auth.py` | JWT authentication bridge (Supabase tokens) |
| `Social Hub/app/api_v1.py` | REST API v1 — 8 endpoints for Momentum |
| `Social Hub/app/services/token_encryption.py` | Fernet encrypt/decrypt for OAuth tokens at rest |
| `Social Hub/app/services/scheduler_service_v2.py` | Automated publisher reading from Momentum tables |
| `Social Hub/app/qa_integration_test.py` | E2E integration test suite (42 tests) |
| `src/lib/socialHub.ts` | TypeScript client for Momentum → Social Hub calls |
| `INTEGRATION_PLAN.md` | Detailed integration plan document |

### Modified Files
| File | Changes |
|------|---------|
| `Social Hub/app/main.py` | Added API v1 router, updated CORS, scheduler v2 |
| `Social Hub/app/config.py` | Added `SUPABASE_JWT_SECRET`, `CORS_ORIGINS`, `TOKEN_ENCRYPTION_KEY` |
| `Social Hub/app/requirements.txt` | Added PyJWT, pydantic, cryptography |

## 7. API Contract Summary

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/generate` | JWT | Generate AI post (text + image) |
| POST | `/api/v1/publish/{post_id}` | JWT | Publish approved post immediately |
| GET | `/api/v1/readiness/{company_id}` | JWT | Company go-live readiness score |
| POST | `/api/v1/topics/suggest` | JWT | AI topic suggestions |
| POST | `/api/v1/regenerate-text/{post_id}` | JWT | AI rewrite post text |
| POST | `/api/v1/regenerate-image/{post_id}` | JWT | Regenerate post image |
| GET | `/api/v1/posts/{company_id}` | JWT | List scheduled posts |
| GET | `/api/v1/health` | None | System health check |

## 8. QA Results

```
42/42 passed, 0 failed

Sections:
 1. Health & System ............ 7/7  ✅
 2. Authentication ............. 3/3  ✅
 3. Readiness Check ............ 4/4  ✅
 4. Posts Management ........... 5/5  ✅
 5. AI Generation .............. 1/1  ✅
 6. Error Handling ............. 4/4  ✅
 7. Database Bridge ............ 6/6  ✅
 8. Legacy Dashboard ........... 6/6  ✅
 9. CORS & Security ............ 3/3  ✅
10. Scheduler .................. 3/3  ✅
```

## 9. Conclusion

The integration is **architecturally sound** for a Phase 1 deployment. The two apps communicate cleanly through a shared database and REST API, with proper company-scoped authentication and error handling. 

**Before production**, prioritize:
1. Set `SUPABASE_JWT_SECRET` environment variable
2. Set `TOKEN_ENCRYPTION_KEY` environment variable (generate via `python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"`)  
3. Set `CORS_ORIGINS` to production domains (comma-separated)
4. Move image storage to Supabase Storage / S3
