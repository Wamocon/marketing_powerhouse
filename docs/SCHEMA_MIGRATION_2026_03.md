# Schema Synchronization Migration — March 2026

**Date:** 2026-03-26  
**Author:** GitHub Copilot (automated migration)  
**Status:** Completed  
**Affects:** Supabase database (project `ftbkqtteavvdqmhbmzoy`), Social Hub backend config

---

## Problem Statement

The Supabase project had three PostgreSQL schemas with significant drift:

| Schema | Tables | Purpose |
|--------|--------|---------|
| `public` | 28 | Frontend production (Next.js Supabase client) |
| `test` | 37 | Development/testing (fully up-to-date) |
| `production` | 7 | Social Hub backend production (vestigial) |

**Critical issues identified:**

1. **Frontend/Backend schema mismatch** — The Next.js frontend defaulted to `public` in production, while the Social Hub backend defaulted to `production`. This meant they operated on different schemas.
2. **Missing tables in `public`** — 9 tables existed in `test` but not in `public`: `social_hub_settings`, `social_analytics_snapshots`, and 7 `socialhub_*` tables.
3. **Missing columns in `public.scheduled_posts`** — 11 columns added for AI/Social Hub integration existed only in `test` (35 cols vs 24).
4. **Plan features drift** — `public.plans` Pro tier had `max_ai_generations_month: 200` while `test` and the codebase defined it as `-1` (unlimited).

---

## Decision: Consolidate on `public` Schema

**Why `public` over `production`:**

- Supabase RLS policies, auth, and the JS client SDK all target `public` by default
- The frontend (`src/lib/supabase.ts`) already correctly uses `public` in production
- The `production` schema had only 7 Social Hub-specific tables with no real data
- Using `public` eliminates the frontend/backend mismatch with zero frontend changes
- The `test` schema remains for development with `NODE_ENV=development`

---

## Changes Applied

### 1. Database: Added 11 columns to `public.scheduled_posts`

```sql
ALTER TABLE public.scheduled_posts
  ADD COLUMN IF NOT EXISTS image_prompt text,
  ADD COLUMN IF NOT EXISTS sources text DEFAULT '',
  ADD COLUMN IF NOT EXISTS topic text DEFAULT '',
  ADD COLUMN IF NOT EXISTS socialhub_job_id text,
  ADD COLUMN IF NOT EXISTS ig_container_id text,
  ADD COLUMN IF NOT EXISTS ig_media_type text,
  ADD COLUMN IF NOT EXISTS platform_comment_id text,
  ADD COLUMN IF NOT EXISTS notes text DEFAULT '',
  ADD COLUMN IF NOT EXISTS campaign_id text,
  ADD COLUMN IF NOT EXISTS task_id text,
  ADD COLUMN IF NOT EXISTS platform text;
```

### 2. Database: Created `public.social_hub_settings`

Per-company Social Hub configuration (publishing cadence, AI settings, approval workflow).

- Unique constraint on `company_id`
- Index on `company_id`

### 3. Database: Created `public.social_analytics_snapshots`

Daily aggregated social media analytics per company per platform.

- Unique constraint on `(company_id, snapshot_date, platform)`
- Index on `(company_id, snapshot_date DESC)`

### 4. Database: Created 7 `socialhub_*` tables in `public`

| Table | Purpose |
|-------|---------|
| `socialhub_dynamic_settings` | Key-value runtime settings |
| `socialhub_app_logs` | Application logs with timestamp index |
| `socialhub_linkedin_accounts` | LinkedIn OAuth accounts |
| `socialhub_instagram_accounts` | Instagram OAuth accounts |
| `socialhub_job_leases` | Distributed scheduling locks |
| `socialhub_topic_ideas` | AI-generated topic suggestions |
| `socialhub_posts` | Social Hub native posts (with enum types + 7 indexes) |

### 5. Database: Fixed Pro plan features

```sql
UPDATE public.plans
SET features = jsonb_set(features::jsonb, '{max_ai_generations_month}', '-1')
WHERE slug = 'pro';
```

Changed `max_ai_generations_month` from `200` to `-1` (unlimited) to match the codebase definition in `src/lib/pricing.ts`.

### 6. Code: Updated `Social Hub/app/config.py`

Changed `default_schema_for_env()`:

```python
# Before
def default_schema_for_env(app_env: str) -> str:
    return "production" if app_env == "production" else "test"

# After
def default_schema_for_env(app_env: str) -> str:
    return "public" if app_env == "production" else "test"
```

### 7. Code: Updated documentation

- `Social Hub/app/momentum_models.py` — Updated docstring to document schema strategy
- `Social Hub/app/README.md` — Changed schema reference from `production` to `public`

### 8. Cleanup: Removed stale files

- `BRANDING_IMPLEMENTATION.md` — Completed StratAI→Momentum migration checklist (all tasks done)
- `TESTPLAN_EXPLORATIV.md` — Updated version/date header to March 2026

---

## Verification Results

| Check | Before | After |
|-------|--------|-------|
| `public` table count | 28 | **37** (matches `test`) |
| `public.scheduled_posts` columns | 24 | **35** (matches `test`) |
| `public.plans` Pro `max_ai_generations_month` | 200 | **-1** (matches code) |
| Backend production schema | `production` | **`public`** (matches frontend) |

---

## Schema Architecture (Post-Migration)

```
Supabase Project (ftbkqtteavvdqmhbmzoy)
│
├── public (37 tables) ── Production schema
│   ├── App tables: users, companies, campaigns, tasks, contents, ...
│   ├── Social Hub bridge: scheduled_posts, connected_accounts, engagement_metrics
│   ├── Social Hub app: social_hub_settings, social_analytics_snapshots
│   ├── Social Hub internal: socialhub_posts, socialhub_linkedin_accounts, ...
│   └── Billing: plans, subscriptions, usage_records
│
├── test (37 tables) ── Development/testing schema (mirrors public)
│
└── production (7 tables) ── DEPRECATED (vestigial Social Hub tables)
```

---

## Impact Assessment

| Component | Impact | Risk |
|-----------|--------|------|
| Next.js Frontend | **None** — already uses `public` in production | None |
| Social Hub Backend | **Low** — config default changed, env var can override | Low |
| Supabase RLS | **None** — RLS operates on `public` by default | None |
| Existing data | **None** — `public` tables retained existing data, new tables are empty | None |

---

## Rollback Procedure

If needed, revert the backend config change:

```python
def default_schema_for_env(app_env: str) -> str:
    return "production" if app_env == "production" else "test"
```

The database changes (new tables/columns) are additive and non-destructive — they can be left in place safely.
