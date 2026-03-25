# Social Hub ↔ Momentum App Integration Plan

## 1. Executive Summary

The **Momentum App** (Marketing Powerhouse) is a multi-tenant SaaS marketing orchestration platform built with Next.js/React. The **Social Hub** is a standalone Python/FastAPI application for AI-powered social media content generation and publishing to LinkedIn and Instagram.

**Problem**: Both apps duplicate significant functionality (social account management, post scheduling, analytics dashboards, content calendars). Running two parallel systems creates data inconsistency, user confusion, and maintenance overhead.

**Solution**: Transform Social Hub into a **lean publishing microservice** — strip out all features Momentum already handles, and connect them through Supabase as the single source of truth.

---

## 2. Redundancy Analysis (Brutally Honest)

### Features That ALREADY Exist in Momentum (REMOVE from Social Hub)

| Feature | Momentum | Social Hub | Verdict |
|---------|----------|------------|---------|
| **Social account management** | `connected_accounts` table, full CRUD API, multi-tenant | `socialhub_linkedin_accounts`, `socialhub_instagram_accounts` — single-tenant, no company scope | **REMOVE from SH** — Momentum's model is superior (multi-platform, multi-tenant, company-scoped) |
| **Post scheduling & lifecycle** | `scheduled_posts` table with 12 statuses, content linking, approval workflow | `socialhub_posts` with 6 statuses, no company scope, no content linking | **REMOVE from SH** — Momentum has richer model with `contentItemId`, `connectedAccountId`, approval chain |
| **Analytics/Engagement** | `engagement_metrics` table linked to posts | Basic status counts on dashboard | **REMOVE from SH** — Momentum already tracks impressions, clicks, likes, shares, reach, saves |
| **Content calendar** | `ContentContext` with publishDate, scheduling, status management | Dashboard with upcoming posts | **REMOVE from SH** — Momentum has full redactorial calendar |
| **Dashboard/Statistics** | Full KPI dashboards, budget tracking, channel performance | Status counts, platform counts | **REMOVE from SH** — completely outclassed |
| **Settings/Configuration** | Company-level settings, admin panel | `dynamic_settings` table | **KEEP simplified** — only for SH-specific configs (AI model, posting cadence) |
| **Topic queue** | No equivalent | `topic_ideas` table, AI suggestions | **KEEP** — unique to SH |
| **User auth** | Supabase Auth with RBAC (4 roles) | Cookie-based session (no real auth) | **REMOVE from SH** — add Momentum auth pass-through |

### Features UNIQUE to Social Hub (KEEP and Enhance)

| Feature | Description | Value |
|---------|-------------|-------|
| **AI Content Generation** | Gemini 2.5 Pro with Google Search Grounding, platform-specific prompts | **HIGH** — core differentiator |
| **AI Image Generation** | Imagen 4 Ultra with branded fallback | **HIGH** — unique capability |
| **LinkedIn Publishing** | Full OAuth + Posts API + image upload + value comments | **CRITICAL** — the actual publishing engine |
| **Instagram Publishing** | Meta Graph API container flow + rate limiting | **CRITICAL** — the actual publishing engine |
| **Automated Pipeline** | APScheduler for draft generation + scheduled publishing | **HIGH** — automation backbone |
| **Human-in-the-Loop** | Approval workflow before publishing | **KEEP** — but bridge to Momentum's approval |
| **Value Comments** | Auto-comment on published posts for engagement | **KEEP** — unique engagement feature |

---

## 3. Target Architecture

```
┌─────────────────────────────────────────────────┐
│              Momentum App (Next.js)              │
│  Content Planning → Calendar → Schedule Posts    │
│  Company Settings → Social Accounts → Analytics  │
│                                                  │
│  User clicks "Publish" or "Generate AI Post"     │
│  → Opens Social Hub in new window/iframe         │
│  → Passes: company_id, user_id, post_id (JWT)   │
└──────────────────┬──────────────────────────────┘
                   │ Supabase (shared DB)
                   │ Tables: scheduled_posts,
                   │ connected_accounts, contents
                   ▼
┌─────────────────────────────────────────────────┐
│         Social Hub (FastAPI Microservice)         │
│                                                  │
│  KEPT:                                           │
│  • AI Content Generation (Gemini)                │
│  • AI Image Generation (Imagen)                  │
│  • Platform Publishing (LinkedIn + Instagram)    │
│  • Scheduling Engine (APScheduler)               │
│  • Value Comments Automation                     │
│  • Topic Queue & AI Suggestions                  │
│  • Go-Live Readiness Check                       │
│  • Logs (operational, not analytics)             │
│                                                  │
│  REMOVED:                                        │
│  • Own dashboard/statistics                      │
│  • Own account management tables                 │
│  • Own post management (uses Momentum's)         │
│  • Own analytics                                 │
│                                                  │
│  NEW:                                            │
│  • REST API for Momentum to trigger actions      │
│  • Reads from Momentum's scheduled_posts         │
│  • Reads from Momentum's connected_accounts      │
│  • Writes back results to Momentum's tables      │
│  • JWT-based auth from Momentum                  │
│  • Company-scoped operations                     │
└─────────────────────────────────────────────────┘
```

---

## 4. Database Integration Strategy

### Phase 1: Social Hub reads/writes Momentum's tables directly

Since both apps share the same Supabase project and schema (`test`), Social Hub will:

1. **READ** `connected_accounts` to get OAuth tokens for LinkedIn/Instagram
2. **READ** `scheduled_posts` to find posts that need publishing
3. **WRITE** `scheduled_posts` to update status (publishing → published / failed)
4. **WRITE** `engagement_metrics` after successful publish
5. **KEEP** its own prefixed tables only for SH-specific data:
   - `socialhub_topic_ideas` — topic queue
   - `socialhub_dynamic_settings` — AI config only
   - `socialhub_app_logs` — operational logs
   - `socialhub_job_leases` — scheduler locks

### Phase 2: Remove redundant Social Hub tables
- DROP `socialhub_posts` → replaced by Momentum's `scheduled_posts`
- DROP `socialhub_linkedin_accounts` → replaced by `connected_accounts`
- DROP `socialhub_instagram_accounts` → replaced by `connected_accounts`

### New Column Additions to Momentum's tables

**`scheduled_posts`** — add:
- `image_prompt TEXT` — for AI image generation
- `sources TEXT` — for source references
- `value_comment TEXT` — for auto-engagement
- `value_comment_posted BOOLEAN DEFAULT FALSE`
- `value_comment_at TIMESTAMPTZ`
- `socialhub_job_id TEXT` — tracks SH processing

**`connected_accounts`** — add (via metadata JSON, already exists):
- Store LinkedIn `refresh_token`, `linkedin_user_id` in metadata
- Store Instagram `ig_user_id`, `media_type` in metadata
- These are already flexible via the `metadata JSONB` column

---

## 5. API Contract (Social Hub exposes for Momentum)

### Authentication
All API endpoints require a JWT issued by Momentum's Supabase Auth. Social Hub validates the token server-side using the shared Supabase project keys.

### Endpoints

```
POST /api/v1/generate
  Body: { company_id, platform, topic?, content_item_id? }
  → Generates AI post text + image, saves to scheduled_posts
  
POST /api/v1/publish/{post_id}
  → Immediately publishes a scheduled_post that is 'approved'
  
GET  /api/v1/readiness/{company_id}
  → Returns go-live readiness score for a company
  
POST /api/v1/topics/suggest
  Body: { company_id, count? }
  → Returns AI-generated topic suggestions

GET  /api/v1/health
  → System health check

POST /api/v1/regenerate-text/{post_id}
  Body: { instruction }
  → AI rewrite of post text

POST /api/v1/regenerate-image/{post_id}
  → Re-generate image for a post
```

### Calendar Integration
The calendar is real-time through Supabase's shared `scheduled_posts` table:
- Momentum's calendar reads `scheduled_posts` with `scheduled_at` dates
- Social Hub's scheduler reads the same table to find posts due for publishing
- When Social Hub publishes a post, Momentum's Realtime subscription sees the update instantly

---

## 6. Implementation Checklist

### Social Hub Changes (this is where all code changes happen)

1. ✅ Add JWT authentication middleware (validate Supabase tokens)
2. ✅ Create new database models for reading Momentum's tables 
3. ✅ Create `/api/v1/` REST endpoints
4. ✅ Refactor scheduler to read from `scheduled_posts` instead of `socialhub_posts`
5. ✅ Refactor publisher services to read tokens from `connected_accounts`
6. ✅ Strip dashboard to minimal operational view (logs + readiness only)
7. ✅ Add company_id scoping throughout
8. ✅ Proper error handling with structured error responses
9. ✅ CORS configuration for Momentum's domain
10. ✅ Migration script for database changes
11. ✅ Full QA test suite

### Momentum Changes (minimal — connection only)
- Add "Open Social Hub" button/link in content detail that opens new window with JWT params
- This is a URL construction, not a code change in Momentum (handled later)
