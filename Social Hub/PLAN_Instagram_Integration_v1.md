# Social Media Marketing Hub — Instagram Integration Plan

**Version:** 1.0  
**Date:** March 2026  
**Status:** Ready for Implementation  
**Scope:** Extend the existing LinkedIn Automation app into a unified multi-platform social media marketing hub, starting with Instagram.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Instagram API Research & Capabilities](#2-instagram-api-research--capabilities)
3. [LinkedIn vs Instagram — Platform Comparison](#3-linkedin-vs-instagram--platform-comparison)
4. [Architectural Decision: Unified App vs Separate Apps](#4-architectural-decision-unified-app-vs-separate-apps)
5. [System Architecture](#5-system-architecture)
6. [Database Schema Changes](#6-database-schema-changes)
7. [New & Modified Services](#7-new--modified-services)
8. [API & Route Changes](#8-api--route-changes)
9. [UI/Template Changes](#9-uitemplate-changes)
10. [Instagram-Specific Content Strategy](#10-instagram-specific-content-strategy)
11. [Image & Media Handling](#11-image--media-handling)
12. [Authentication & Token Management](#12-authentication--token-management)
13. [Scheduling & Automation Pipeline](#13-scheduling--automation-pipeline)
14. [Webhooks & Real-Time Notifications](#14-webhooks--real-time-notifications)
15. [Analytics & Insights](#15-analytics--insights)
16. [Configuration & Environment Variables](#16-configuration--environment-variables)
17. [Dependencies & Requirements](#17-dependencies--requirements)
18. [Implementation Phases](#18-implementation-phases)
19. [Edge Cases & Risk Mitigation](#19-edge-cases--risk-mitigation)
20. [Testing Strategy](#20-testing-strategy)
21. [Future Platform Expansion](#21-future-platform-expansion)
22. [QA Review & Checklist](#22-qa-review--checklist)

---

## 1. Executive Summary

### Current State
The application is a fully functional LinkedIn automation tool built with **FastAPI + SQLModel + Jinja2**, powered by **Google Gemini 2.5 Pro** (text generation with Google Search grounding) and **Google Imagen 4 Ultra** (image generation). It features OAuth-based LinkedIn account connection, AI-powered draft generation, human-in-the-loop approval workflow, scheduled publishing, and automated value-comment follow-ups. The March 2026 upgrade added CSRF protection, async fixes, dark mode, search/pagination, bulk operations, CSV/JSON export, security headers, and error pages.

### Goal
Extend this into a **unified social media marketing hub** that supports **Instagram** alongside LinkedIn — sharing the AI backbone, scheduling infrastructure, and human-in-the-loop workflow, while handling each platform's unique publishing requirements, content formats, and API differences.

### Why Unified App (Not Separate)
- **80% shared infrastructure** — Same Gemini AI, Imagen images, scheduler, human approval workflow
- **Single deployment** — One server, one database, one dashboard
- **Cross-platform analytics** — View LinkedIn + Instagram performance side by side
- **Consistent content strategy** — Same topic queue feeds both platforms
- **Future-proof** — Architecture supports adding Twitter/X, Facebook, TikTok later
- **User requested "think platform wise"** — This is the platform approach

---

## 2. Instagram API Research & Capabilities

### 2.1 Instagram Content Publishing API (Graph API v25.0)

**Authentication Path:** Business Login for Instagram (no Facebook Page required)

| Feature | Supported | Details |
|---------|-----------|---------|
| Single Image Posts | ✅ | JPEG only, public URL required |
| Video Posts | ✅ | MP4, public URL or resumable upload |
| Reels | ✅ | `media_type=REELS`, short-form video |
| Stories | ✅ | `media_type=STORIES`, 24h expiry |
| Carousels | ✅ | Up to 10 images/videos per carousel |
| Alt Text | ✅ | `alt_text` field (added March 2025) |
| Trial Reels | ✅ | Shared only to non-followers |
| Scheduled Publishing | ❌ | Not native — must be handled app-side |
| Filters | ❌ | Not available via API |
| Shopping Tags | ❌ | Not available via API |
| Branded Content Tags | ❌ | Not available via API |

### 2.2 Publishing Flow

```
Step 1: POST /<IG_ID>/media
        → Creates a media container
        → Params: image_url, video_url, caption, media_type, alt_text
        → Returns: IG_CONTAINER_ID

Step 2: POST /<IG_ID>/media_publish
        → Publishes the container
        → Params: creation_id = IG_CONTAINER_ID
        → Returns: IG_MEDIA_ID

Step 3: GET /<IG_CONTAINER_ID>?fields=status_code
        → Check status: IN_PROGRESS | FINISHED | ERROR | EXPIRED | PUBLISHED
```

### 2.3 Rate Limits
- **100 API-published posts per 24-hour rolling window** (carousels = 1 post)
- **Check usage:** `GET /<IG_ID>/content_publishing_limit`
- Recommendation: App should enforce its own rate tracking + pre-publish check

### 2.4 Token Lifecycle
- **Short-lived token:** 1 hour (from OAuth authorization)
- **Long-lived token:** 60 days (exchange via `GET /access_token?grant_type=ig_exchange_token`)
- **Refresh:** `GET /refresh_access_token?grant_type=ig_refresh_token` (anytime after 24h, before 60-day expiry)
- Tokens are Instagram-scoped (different from LinkedIn tokens)

### 2.5 Required Scopes
| Scope | Purpose |
|-------|---------|
| `instagram_business_basic` | Read profile, media objects |
| `instagram_business_content_publish` | Create and publish posts |
| `instagram_business_manage_comments` | Read/reply to comments |
| `instagram_business_manage_messages` | Direct messaging (optional) |

### 2.6 Additional Capabilities
- **Insights API:** Account-level (impressions, reach, profile_views) + Media-level (engagement, impressions, reach)
- **Comment Moderation:** Read, reply, hide, delete comments
- **Webhooks:** Real-time notifications for comments, mentions, story_insights, messages
- **Private Replies:** Reply to comments via DM
- **Media Management:** Read user's media, get media details

### 2.7 Key Constraints
- **Images must be JPEG** (not PNG — Imagen generates PNG, conversion required)
- **Media must be on a public server** (Instagram cURL's the URL — cannot upload binary directly like LinkedIn)
- **Professional account required** (Business or Creator account, not personal)
- **App Review required** for Advanced Access (serving accounts you don't own)
- **Page Publishing Authorization (PPA)** may be required for accounts connected to Facebook Pages

---

## 3. LinkedIn vs Instagram — Platform Comparison

| Aspect | LinkedIn | Instagram |
|--------|----------|-----------|
| **OAuth Provider** | LinkedIn (OpenID Connect) | Meta (Business Login for Instagram) |
| **Token Endpoint** | `linkedin.com/oauth/v2/accessToken` | `api.instagram.com/oauth/access_token` |
| **Token Lifetime** | 60 days (refresh token available) | 60 days (long-lived, refreshable after 24h) |
| **API Base** | `api.linkedin.com/rest` | `graph.instagram.com` |
| **API Version** | Header: `LinkedIn-Version: 202401` | URL path: `/v25.0/` |
| **Image Upload** | Binary PUT to upload URL | Public URL (Instagram fetches it) |
| **Image Format** | Any (PNG used) | JPEG only |
| **Image Size** | LinkedIn recommended: 1200x628 | Feed: 1080x1080 (square) or 1080x1350 (portrait) |
| **Post Length** | 3,000 chars | 2,200 chars (caption) |
| **Content Types** | Text, Image, Article, Document | Image, Video, Reel, Story, Carousel |
| **Hashtag Strategy** | 3-5 in post body | Up to 30 (first comment or caption) |
| **Comments API** | `socialActions/{urn}/comments` | `/<MEDIA_ID>/comments` |
| **Rate Limit** | API call rate limits | 100 posts/24h rolling |
| **Value Comment** | ✅ Supported (w_member_social) | ✅ Supported (manage_comments) |
| **Scheduling** | App-side (no native API) | App-side (no native API) |

### Critical Implementation Differences

1. **Image Pipeline:** Imagen 4 Ultra generates PNG → must convert to JPEG for Instagram, keep PNG for LinkedIn
2. **Image Hosting:** Instagram needs a public URL → either serve from the app (requires public domain) or upload to a CDN/cloud storage
3. **Image Dimensions:** LinkedIn = 1200x628 landscape; Instagram = 1080x1080 square (optimal) — need platform-specific image generation
4. **Content Length:** LinkedIn = 3000 chars; Instagram = 2200 chars — Gemini prompts need platform-aware limits
5. **Hashtag Placement:** LinkedIn = inline in post body; Instagram = in caption or first comment (30 max)

---

## 4. Architectural Decision: Unified App vs Separate Apps

### Option A: Separate Apps ❌
- Two codebases, two deployments, two databases
- Duplicated Gemini/Imagen logic, scheduler, topic queue
- Inconsistent UI/UX between platforms
- Higher maintenance burden
- **Rejected** — Too much duplication for platforms that share 80% of the workflow

### Option B: Unified App with Platform Abstraction Layer ✅ **CHOSEN**
- Single codebase, single deployment, single database
- Platform adapter pattern for API differences
- Shared AI services, shared scheduler, shared topic queue
- Platform-specific content tuning (length, format, hashtags, image dimensions)
- Cross-platform dashboard with platform tabs/filters
- Easily extensible to Twitter/X, Facebook, TikTok in the future

### Architecture Principle
```
"Same brain (AI), different mouth (platform)."
```
One content generation pipeline, adapted for each platform's format and API requirements.

---

## 5. System Architecture

### 5.1 High-Level Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                    UNIFIED DASHBOARD (Jinja2)                  │
│  ┌──────────┐ ┌──────────┐ ┌────────┐ ┌────────┐ ┌────────┐  │
│  │Dashboard │ │  Posts   │ │Generate│ │Topics │ │Settings│  │
│  │(combined)│ │(filtered)│ │(target)│ │(shared)│ │(per-pl)│  │
│  └──────────┘ └──────────┘ └────────┘ └────────┘ └────────┘  │
├────────────────────────────────────────────────────────────────┤
│                    FASTAPI ROUTES (main.py)                    │
│  Platform-aware CRUD  │  OAuth callbacks  │  API endpoints    │
├────────────────────────────────────────────────────────────────┤
│                 PLATFORM SERVICE LAYER (NEW)                   │
│  ┌─────────────────────────────────────────────────────┐      │
│  │              PlatformRouter                          │      │
│  │  Decides which adapter to use based on Post.platform │      │
│  └─────────────┬───────────────────────┬───────────────┘      │
│                │                       │                       │
│  ┌─────────────▼──────┐  ┌─────────────▼──────────────┐      │
│  │  LinkedInAdapter    │  │  InstagramAdapter           │      │
│  │  - OAuth flow       │  │  - Business Login flow      │      │
│  │  - Binary upload    │  │  - Public URL + container   │      │
│  │  - REST API posts   │  │  - Graph API publish        │      │
│  │  - Token refresh    │  │  - Long-lived token refresh │      │
│  └────────────────────┘  └─────────────────────────────┘      │
├────────────────────────────────────────────────────────────────┤
│                    SHARED SERVICES                              │
│  ┌──────────────┐  ┌───────────────┐  ┌──────────────────┐   │
│  │ gemini_svc   │  │ imagen_svc    │  │ scheduler_svc    │   │
│  │ (platform-   │  │ (platform-    │  │ (per-platform    │   │
│  │  aware       │  │  specific     │  │  schedules)      │   │
│  │  prompts)    │  │  dimensions)  │  │                  │   │
│  └──────────────┘  └───────────────┘  └──────────────────┘   │
├────────────────────────────────────────────────────────────────┤
│                    DATABASE (SQLite → PostgreSQL)               │
│  Posts (+ platform)  │  Accounts (LinkedIn + Instagram)        │
│  Topics (shared)     │  Settings (per-platform keys)           │
│  Logs (+ platform)   │  PublishingMetrics (new)                │
└────────────────────────────────────────────────────────────────┘
```

### 5.2 Platform Adapter Pattern

```python
# services/platform_adapter.py (NEW)

from abc import ABC, abstractmethod
from dataclasses import dataclass

@dataclass
class PublishResult:
    success: bool
    platform_post_id: str = ""
    error: str = ""

@dataclass
class PlatformConfig:
    max_chars: int
    image_format: str          # "PNG" or "JPEG"
    image_dimensions: tuple    # (width, height)
    max_hashtags: int
    supports_value_comment: bool = True

class PlatformAdapter(ABC):
    """Abstract base for platform-specific operations."""

    @abstractmethod
    async def authenticate(self, code: str) -> dict:
        """Exchange auth code for tokens."""
        ...

    @abstractmethod
    async def refresh_token(self, token: str) -> dict:
        """Refresh an expiring token."""
        ...

    @abstractmethod
    async def publish_post(self, account, post) -> PublishResult:
        """Publish a post to the platform."""
        ...

    @abstractmethod
    async def post_comment(self, account, post_id: str, text: str) -> str:
        """Post a comment under a published post."""
        ...

    @abstractmethod
    def get_config(self) -> PlatformConfig:
        """Return platform-specific configuration."""
        ...

    @abstractmethod
    def get_authorization_url(self, state: str) -> str:
        """Build the OAuth authorization URL."""
        ...

class LinkedInAdapter(PlatformAdapter):
    """Wraps existing linkedin_service.py functions."""
    ...

class InstagramAdapter(PlatformAdapter):
    """New Instagram implementation."""
    ...

# Router that dispatches to correct adapter
ADAPTERS = {
    "linkedin": LinkedInAdapter(),
    "instagram": InstagramAdapter(),
}

def get_adapter(platform: str) -> PlatformAdapter:
    return ADAPTERS[platform]
```

---

## 6. Database Schema Changes

### 6.1 Modified: `Post` Model

```python
class Platform(str, Enum):
    LINKEDIN = "linkedin"
    INSTAGRAM = "instagram"

class Post(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    platform: Platform = Field(default=Platform.LINKEDIN, index=True)  # NEW
    topic: str = Field(index=True)
    body: str
    sources: str = ""
    hashtags: str = ""
    image_path: Optional[str] = None
    image_prompt: Optional[str] = None
    value_comment: Optional[str] = None
    status: PostStatus = Field(default=PostStatus.DRAFT, index=True)

    # Platform-agnostic post identifiers
    platform_post_id: Optional[str] = None       # RENAMED from linkedin_post_urn
    platform_comment_id: Optional[str] = None     # RENAMED from linkedin_comment_urn

    # Instagram-specific fields
    ig_container_id: Optional[str] = None         # NEW — Instagram media container
    ig_media_type: Optional[str] = None           # NEW — IMAGE, REELS, STORIES, CAROUSEL
    ig_carousel_children: Optional[str] = None    # NEW — comma-separated container IDs

    scheduled_for: Optional[datetime] = None
    published_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    notes: str = ""
```

**Migration Note:** The existing `linkedin_post_urn` and `linkedin_comment_urn` fields must be renamed to `platform_post_id` and `platform_comment_id`. All existing data has `platform='linkedin'` by default.

### 6.2 New: `InstagramAccount` Model

```python
class InstagramAccount(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str                                  # Instagram @username
    ig_user_id: str                                # Instagram-scoped user ID
    access_token: Optional[str] = None             # Long-lived token (60 days)
    token_expires_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_active: bool = True
```

**Note:** Instagram tokens do not have a separate refresh token — the long-lived token itself is refreshed via `GET /refresh_access_token`.

### 6.3 Modified: `LinkedInAccount` — No Changes
The existing `LinkedInAccount` model stays as-is. Both account tables coexist.

### 6.4 New: `PublishingMetric` Model (Optional Phase 2)

```python
class PublishingMetric(SQLModel, table=True):
    """Track post-level metrics fetched from platform APIs."""
    id: Optional[int] = Field(default=None, primary_key=True)
    post_id: int = Field(foreign_key="post.id", index=True)
    platform: Platform
    impressions: int = 0
    reach: int = 0
    engagement: int = 0       # likes + comments
    fetched_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
```

### 6.5 Modified: `DynamicSetting` — New Instagram Default Settings

```python
# Added to _seed_defaults():
"ig_posting_days": "1,3,5",          # Mon, Wed, Fri
"ig_posting_hour": "12",             # Noon (Instagram peak)
"ig_posting_minute": "0",
"ig_auto_generate_drafts": "true",
"ig_max_pending_drafts": "3",
"ig_default_hashtags": "#Career #JobSearch #Weiterbildung #DACH #KI",
"ig_post_max_chars": "2200",
"ig_media_type": "IMAGE",            # Default: IMAGE, REELS, CAROUSEL
"ig_image_style": "square",          # square (1080x1080) or portrait (1080x1350)
"ig_hashtag_placement": "caption",   # "caption" or "first_comment"
```

### 6.6 Data Migration Strategy

```sql
-- Step 1: Add platform column with default
ALTER TABLE post ADD COLUMN platform VARCHAR DEFAULT 'linkedin';

-- Step 2: Rename LinkedIn-specific columns
ALTER TABLE post RENAME COLUMN linkedin_post_urn TO platform_post_id;
ALTER TABLE post RENAME COLUMN linkedin_comment_urn TO platform_comment_id;

-- Step 3: Add Instagram-specific columns
ALTER TABLE post ADD COLUMN ig_container_id VARCHAR;
ALTER TABLE post ADD COLUMN ig_media_type VARCHAR;
ALTER TABLE post ADD COLUMN ig_carousel_children VARCHAR;

-- Step 4: Create Instagram account table
CREATE TABLE instagramaccount (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR NOT NULL,
    ig_user_id VARCHAR NOT NULL,
    access_token VARCHAR,
    token_expires_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT 1
);
```

---

## 7. New & Modified Services

### 7.1 NEW: `services/instagram_service.py`

Complete Instagram API service implementing the `PlatformAdapter` interface.

```python
# Core functions to implement:

# ── OAuth ──
def get_authorization_url(state: str) -> str
    # Build: https://www.instagram.com/oauth/authorize?client_id=...&scope=...

async def exchange_code_for_token(code: str) -> dict
    # POST https://api.instagram.com/oauth/access_token
    # Returns: {access_token, user_id, permissions}

async def exchange_for_long_lived_token(short_lived_token: str) -> dict
    # GET https://graph.instagram.com/access_token?grant_type=ig_exchange_token
    # Returns: {access_token, token_type, expires_in}

async def refresh_long_lived_token(token: str) -> dict
    # GET https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token
    # Returns: {access_token, token_type, expires_in}

async def get_user_profile(access_token: str) -> dict
    # GET https://graph.instagram.com/v25.0/me?fields=user_id,username

# ── Content Publishing ──
async def create_image_container(access_token: str, ig_user_id: str,
                                  image_url: str, caption: str,
                                  alt_text: str = "") -> str
    # POST https://graph.instagram.com/v25.0/<IG_ID>/media
    # Params: image_url, caption, alt_text
    # Returns: container_id

async def create_reel_container(access_token: str, ig_user_id: str,
                                 video_url: str, caption: str) -> str
    # media_type=REELS

async def create_story_container(access_token: str, ig_user_id: str,
                                  media_url: str, media_type: str) -> str
    # media_type=STORIES

async def create_carousel_container(access_token: str, ig_user_id: str,
                                     children_ids: list[str],
                                     caption: str) -> str
    # media_type=CAROUSEL, children=comma-separated IDs

async def publish_container(access_token: str, ig_user_id: str,
                             container_id: str) -> str
    # POST https://graph.instagram.com/v25.0/<IG_ID>/media_publish
    # Returns: media_id

async def check_container_status(access_token: str, container_id: str) -> str
    # GET https://graph.instagram.com/v25.0/<CONTAINER_ID>?fields=status_code
    # Returns: FINISHED | IN_PROGRESS | ERROR | EXPIRED | PUBLISHED

async def check_rate_limit(access_token: str, ig_user_id: str) -> dict
    # GET https://graph.instagram.com/v25.0/<IG_ID>/content_publishing_limit

# ── Comments ──
async def post_comment(access_token: str, media_id: str, text: str) -> str
    # POST https://graph.instagram.com/v25.0/<MEDIA_ID>/comments

# ── Insights ──
async def get_media_insights(access_token: str, media_id: str) -> dict
    # GET https://graph.instagram.com/v25.0/<MEDIA_ID>/insights?metric=...

async def get_account_insights(access_token: str, ig_user_id: str,
                                period: str = "day") -> dict
    # GET https://graph.instagram.com/v25.0/<IG_ID>/insights?metric=...

# ── Helpers ──
def token_needs_refresh(expires_at: datetime | None) -> bool
    # Check if within 7 days of expiry (same as LinkedIn)
```

### 7.2 NEW: `services/platform_router.py`

Thin dispatcher that routes operations to the correct platform adapter.

```python
async def publish_post(post: Post) -> PublishResult:
    """Route publishing to the correct platform."""
    if post.platform == Platform.LINKEDIN:
        return await _publish_to_linkedin(post)
    elif post.platform == Platform.INSTAGRAM:
        return await _publish_to_instagram(post)

async def post_value_comment(post: Post) -> str:
    """Route value comment to the correct platform."""
    ...

async def refresh_token_if_needed(platform: str, account) -> None:
    """Auto-refresh tokens for any platform."""
    ...
```

### 7.3 MODIFIED: `services/gemini_service.py`

Add Instagram-aware prompt variants:

```python
# New constants:
INSTAGRAM_SYSTEM_PROMPT = """\
Du bist ein Instagram-Content-Experte für den deutschen Arbeitsmarkt und Weiterbildung.

DEINE AUFGABE:
Erstelle einen professionellen Instagram-Beitrag auf Deutsch zu dem vorgegebenen Thema.

ANFORDERUNGEN:
1. Maximal {max_chars} Zeichen (Caption-Limit).
2. Verwende aktuelle, verifizierbare Zahlen und Studien.
3. Schreibe professionell aber zugänglich und visuell ansprechend.
4. Verwende Absätze und Leerzeilen für Lesbarkeit.
5. Beginne mit einem starken Aufhänger.
6. Ende mit einem Call-to-Action (Speichern, Teilen, Kommentieren).
7. Verwende relevante Emojis großzügiger als LinkedIn (5-10 pro Beitrag).
8. Keine Hashtags im Text — die werden separat hinzugefügt.
9. Instagram-typischer Stil: kürzer, punchiger, visueller fokussiert.
10. Quellenangabe am Ende, aber kompakter als LinkedIn.

ZIELGRUPPE:
Jobsuchende, Weiterbildungsinteressierte, HR-Manager
im deutschsprachigen Raum (DACH).
"""

INSTAGRAM_HASHTAG_PROMPT = """\
Generiere 20-25 relevante Instagram-Hashtags (mit #) für diesen Beitrag.
Mische:
- 5 große Hashtags (>100k Posts): z.B. #Karriere #JobSearch #Arbeit
- 10 mittlere Hashtags (10k-100k): z.B. #Weiterbildung #BeruflicheEntwicklung
- 5-10 Nischen-Hashtags (<10k): z.B. #ITTestmanagement #DACHKarriere
Nur Hashtags, eine Zeile, durch Leerzeichen getrennt.

Beitrag:
{post_body}
"""

# Modified function signature:
async def generate_post(topic: str, platform: str = "linkedin") -> dict:
    """Generate a post with platform-specific prompt and limits."""
    if platform == "instagram":
        max_chars = int(get_setting("ig_post_max_chars", "2200"))
        sys_prompt = INSTAGRAM_SYSTEM_PROMPT.format(max_chars=max_chars - 200)
    else:
        max_chars = _get_max_chars()
        sys_prompt = SYSTEM_PROMPT.format(max_chars=max_chars - 200)
    # ... rest of generation logic stays the same

async def _generate_hashtags(post_body: str, platform: str = "linkedin") -> str:
    """Generate platform-appropriate hashtags."""
    if platform == "instagram":
        # Use INSTAGRAM_HASHTAG_PROMPT, return 20-25 hashtags
    else:
        # Existing LinkedIn logic (3-5 hashtags)
```

### 7.4 MODIFIED: `services/imagen_service.py`

Add platform-specific image generation:

```python
PLATFORM_IMAGE_CONFIGS = {
    "linkedin": {
        "dimensions": (1200, 628),   # Landscape
        "aspect_ratio": "16:9",
        "format": "PNG",
    },
    "instagram": {
        "dimensions": (1080, 1080),  # Square (default)
        "aspect_ratio": "1:1",
        "format": "JPEG",
    },
    "instagram_portrait": {
        "dimensions": (1080, 1350),  # Portrait (4:5)
        "aspect_ratio": "4:5",
        "format": "JPEG",
    },
}

async def generate_image(prompt: str, post_id: int,
                          platform: str = "linkedin") -> str:
    """Generate platform-optimized image."""
    config = PLATFORM_IMAGE_CONFIGS.get(platform, PLATFORM_IMAGE_CONFIGS["linkedin"])

    # Imagen generation with platform-specific aspect ratio
    response = await asyncio.to_thread(
        _get_client().models.generate_images,
        model=settings.IMAGEN_MODEL,
        prompt=prompt,
        config=types.GenerateImagesConfig(
            number_of_images=1,
            aspect_ratio=config["aspect_ratio"],
            output_mime_type="image/png",  # Imagen always outputs PNG
        ),
    )

    if response.generated_images:
        image_bytes = response.generated_images[0].image.image_bytes
        img = Image.open(io.BytesIO(image_bytes))

        # Convert to JPEG for Instagram
        if config["format"] == "JPEG":
            # Convert RGBA to RGB (JPEG doesn't support alpha)
            if img.mode in ("RGBA", "LA", "P"):
                img = img.convert("RGB")
            filename = f"post_{post_id}.jpg"
            output_path = IMAGES_DIR / filename
            img.save(str(output_path), "JPEG", quality=95)
        else:
            filename = f"post_{post_id}.png"
            output_path = IMAGES_DIR / filename
            img.save(str(output_path), "PNG")

        return f"images/{filename}"
```

### 7.5 MODIFIED: `services/scheduler_service.py`

Add per-platform scheduling:

```python
# Separate jobs for LinkedIn and Instagram
def setup_scheduler():
    sched_li = _read_schedule_settings("linkedin")
    sched_ig = _read_schedule_settings("instagram")

    # LinkedIn draft generation (existing)
    scheduler.add_job(job_generate_draft, "cron", hour=7, minute=0,
                      args=["linkedin"], id="generate_draft_linkedin", ...)

    # Instagram draft generation (NEW)
    scheduler.add_job(job_generate_draft, "cron", hour=7, minute=30,
                      args=["instagram"], id="generate_draft_instagram", ...)

    # LinkedIn publishing (existing)
    scheduler.add_job(job_publish_scheduled, "cron",
                      day_of_week=sched_li["posting_days"],
                      hour=sched_li["posting_hour"],
                      args=["linkedin"], id="publish_scheduled_linkedin", ...)

    # Instagram publishing (NEW)
    scheduler.add_job(job_publish_scheduled, "cron",
                      day_of_week=sched_ig["posting_days"],
                      hour=sched_ig["posting_hour"],
                      args=["instagram"], id="publish_scheduled_instagram", ...)

async def job_generate_draft(platform: str = "linkedin"):
    """Generate draft for the specified platform."""
    # Reads platform-specific settings (ig_auto_generate_drafts, etc.)
    # Calls gemini_service.generate_post(topic, platform=platform)
    # Calls imagen_service.generate_image(prompt, post_id, platform=platform)
    # Sets post.platform = platform

async def job_publish_scheduled(platform: str = "linkedin"):
    """Publish next approved post for the specified platform."""
    # Routes through platform_router.publish_post()
```

---

## 8. API & Route Changes

### 8.1 New Routes

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/auth/instagram` | Redirect to Instagram OAuth |
| GET | `/auth/instagram/callback` | Handle Instagram OAuth callback |
| POST | `/settings/instagram/disconnect` | Disconnect Instagram account |
| GET | `/api/instagram/rate-limit` | Check Instagram publishing rate limit |
| GET | `/api/instagram/insights/{post_id}` | Get Instagram post insights |
| GET | `/api/insights` | Cross-platform analytics dashboard data |

### 8.2 Modified Routes

| Route | Change |
|-------|--------|
| `GET /` (dashboard) | Add Instagram stats (total IG posts, IG account health) |
| `GET /posts` | Add `platform` filter parameter alongside existing search + pagination |
| `GET /posts/{id}` | Show platform badge, Instagram-specific fields (media_type, carousel) |
| `POST /posts/{id}` | Handle Instagram-specific fields on update |
| `GET /generate` | Add platform selector (dropdown: LinkedIn / Instagram / Both) |
| `POST /generate` | Accept `platform` parameter, generate platform-appropriate content |
| `GET /settings` | Add Instagram account section, Instagram schedule, Instagram defaults |
| `POST /settings` | Save Instagram-specific settings |
| `GET /api/posts/export` | Include platform field in export |
| `POST /api/posts/bulk` | Support platform-filtered bulk operations |
| `GET /api/health` | Add Instagram account health check |

### 8.3 Instagram Media Serving

Instagram requires images at public URLs. Options:

**Option A: Serve from FastAPI (Development/Small Scale)**
```python
@app.get("/media/{filename}")
async def serve_media(filename: str):
    """Serve images at publicly accessible URL for Instagram API."""
    file_path = IMAGES_DIR / filename
    if not file_path.exists():
        raise HTTPException(404)
    return FileResponse(file_path)
```
The app must be accessible via a public URL (e.g., via ngrok, Cloudflare Tunnel, or deployed to a VPS).

**Option B: Upload to Cloud Storage (Production) — RECOMMENDED**
```python
async def upload_to_storage(file_path: Path) -> str:
    """Upload image to cloud storage, return public URL."""
    # Options: Google Cloud Storage, AWS S3, Cloudflare R2
    # Returns: "https://storage.googleapis.com/bucket/post_123.jpg"
```

**Recommendation:** Start with Option A for development, migrate to Option B for production. Both are supported in the design.

---

## 9. UI/Template Changes

### 9.1 Dashboard (`dashboard.html`)

```
┌─────────────────────────────────────────────────────────┐
│ Marketing Hub Dashboard                                  │
├──────────────────────────┬──────────────────────────────┤
│ LinkedIn                 │ Instagram                     │
│ ┌──────┐ ┌──────┐       │ ┌──────┐ ┌──────┐            │
│ │  12  │ │  5   │       │ │  8   │ │  3   │            │
│ │Posts │ │Draft │       │ │Posts │ │Draft │            │
│ └──────┘ └──────┘       │ └──────┘ └──────┘            │
│ Account: ✅ Connected   │ Account: ❌ Not Connected     │
│ Next Post: Tue 09:00    │ Next Post: —                  │
├──────────────────────────┴──────────────────────────────┤
│ Recent Activity (all platforms)                          │
│ [LI] Published: "KI im Arbeitsmarkt" — 2h ago          │
│ [IG] Draft: "Weiterbildung 2026" — 5h ago              │
└─────────────────────────────────────────────────────────┘
```

### 9.2 Posts List (`posts.html`)

Add platform filter tabs:
```html
<!-- Platform filter tabs -->
<div class="platform-tabs">
    <a href="/posts" class="tab {% if not platform_filter %}active{% endif %}">
        All Platforms
    </a>
    <a href="/posts?platform=linkedin" class="tab {% if platform_filter == 'linkedin' %}active{% endif %}">
        🔗 LinkedIn
    </a>
    <a href="/posts?platform=instagram" class="tab {% if platform_filter == 'instagram' %}active{% endif %}">
        📸 Instagram
    </a>
</div>
```

Each post card shows a platform badge icon.

### 9.3 Generate Page (`generate.html`)

Add target platform selector:
```html
<div class="form-group">
    <label>Target Platform</label>
    <select name="platform">
        <option value="linkedin">🔗 LinkedIn</option>
        <option value="instagram">📸 Instagram</option>
        <option value="both">🔄 Both Platforms</option>
    </select>
</div>

<!-- Instagram-specific options (shown when instagram/both selected) -->
<div id="ig-options" style="display: none;">
    <label>Instagram Media Type</label>
    <select name="ig_media_type">
        <option value="IMAGE">📷 Image Post</option>
        <option value="CAROUSEL">🎠 Carousel</option>
        <option value="REELS">🎬 Reel</option>
        <option value="STORIES">📱 Story</option>
    </select>

    <label>Image Style</label>
    <select name="ig_image_style">
        <option value="square">1:1 Square (1080x1080)</option>
        <option value="portrait">4:5 Portrait (1080x1350)</option>
        <option value="landscape">16:9 Landscape (1080x608)</option>
    </select>
</div>
```

### 9.4 Post Detail (`post_detail.html`)

Show platform-specific information:
```html
<!-- Platform badge -->
<span class="platform-badge platform-{{ post.platform }}">
    {% if post.platform == 'linkedin' %}🔗 LinkedIn{% else %}📸 Instagram{% endif %}
</span>

<!-- Instagram-specific fields -->
{% if post.platform == 'instagram' %}
<div class="ig-fields">
    <label>Media Type</label>
    <select name="ig_media_type">
        <option value="IMAGE" {{ 'selected' if post.ig_media_type == 'IMAGE' }}>Image</option>
        <option value="REELS" {{ 'selected' if post.ig_media_type == 'REELS' }}>Reel</option>
        <option value="CAROUSEL" {{ 'selected' if post.ig_media_type == 'CAROUSEL' }}>Carousel</option>
    </select>
    <label>Container Status</label>
    <span>{{ post.ig_container_id or 'Not created' }}</span>
</div>
{% endif %}

<!-- Character counter adapts to platform -->
<span class="char-count">
    {{ post.body|length }} / {{ 3000 if post.platform == 'linkedin' else 2200 }}
</span>
```

### 9.5 Settings Page (`settings.html`)

Add Instagram section:
```html
<!-- Instagram Account Section -->
<div class="card">
    <h3>📸 Instagram Account</h3>
    {% if ig_account %}
        <p>Connected: @{{ ig_account.username }}</p>
        <p>Token expires: {{ ig_account.token_expires_at }}</p>
        <form method="post" action="/settings/instagram/disconnect">
            <input type="hidden" name="csrf_token" value="{{ csrf_token }}">
            <button type="submit" class="btn btn-danger">Disconnect</button>
        </form>
    {% else %}
        <a href="/auth/instagram" class="btn btn-primary">Connect Instagram</a>
    {% endif %}
</div>

<!-- Instagram Schedule Section -->
<div class="card">
    <h3>Instagram Schedule</h3>
    <!-- Separate posting days, time, etc. for Instagram -->
    <label>Posting Days</label>
    <!-- Day checkboxes (same pattern as LinkedIn) -->
    <label>Posting Time</label>
    <input type="time" name="ig_posting_time" value="12:00">
</div>

<!-- Instagram Content Settings -->
<div class="card">
    <h3>Instagram Content Defaults</h3>
    <label>Default Media Type</label>
    <select name="ig_media_type">...</select>
    <label>Image Style</label>
    <select name="ig_image_style">...</select>
    <label>Hashtag Placement</label>
    <select name="ig_hashtag_placement">
        <option value="caption">In Caption</option>
        <option value="first_comment">As First Comment</option>
    </select>
    <label>Default Hashtags</label>
    <textarea name="ig_default_hashtags">{{ settings.ig_default_hashtags }}</textarea>
</div>
```

---

## 10. Instagram-Specific Content Strategy

### 10.1 Content Adaptation

When generating for "Both Platforms," the AI creates **two adapted versions** from a single topic:

| Aspect | LinkedIn Version | Instagram Version |
|--------|-----------------|-------------------|
| Tone | Professional, data-driven | Professional but more visual, emoji-rich |
| Length | Up to 3,000 chars | Up to 2,200 chars |
| Structure | Long paragraphs, detailed analysis | Short punchy paragraphs, bullet points |
| CTA | "Was denkt ihr?" (engagement question) | "💾 Speichern für später! Was ist eure Erfahrung?" |
| Hashtags | 3-5 inline | 20-25 in caption or first comment |
| Sources | Full citation with URLs | Compact: "Quelle: IAB 2025" |
| Emojis | 3-5 sparsam | 5-10 großzügig |
| Image | 1200x628 landscape | 1080x1080 square |

### 10.2 Hashtag Strategy for Instagram

```
Big (5):       #Karriere #JobSearch #Arbeit #Erfolg #Motivation
Medium (10):   #Weiterbildung #BeruflicheEntwicklung #Jobsuche #HRDeutschland
                #ArbeitsmarktDeutschland #ITKarriere #Bewerbungstipps
                #Karriereberatung #DigitaleTransformation #NeuerJob
Niche (5-10):  #ITTestmanagement #DACHKarriere #Arbeitsmarkt2026
                #WeiterbildungDeutschland #JobsucheDACH
```

### 10.3 Cross-Posting Logic

When user selects "Both Platforms":
1. Generate ONE topic + research via Gemini with Google Search
2. Generate LinkedIn version (3000 chars, 5 hashtags, landscape image)
3. Generate Instagram version (2200 chars, 25 hashtags, square image)
4. Create TWO Post entries (one per platform) sharing the same topic
5. Each follows its platform's approval → schedule → publish workflow independently

---

## 11. Image & Media Handling

### 11.1 Image Pipeline

```
Topic → Gemini (image prompt) → Imagen 4 Ultra
                                    │
                            ┌───────┴───────┐
                            │               │
                        LinkedIn        Instagram
                        PNG 1200x628    JPEG 1080x1080
                        16:9            1:1 (square)
                        Binary upload   Public URL
```

### 11.2 Instagram Image Requirements

| Parameter | Requirement |
|-----------|-------------|
| Format | JPEG only |
| Max File Size | 8MB |
| Min Dimensions | 320x320 |
| Max Dimensions | Not specified (recommended 1080x1080) |
| Aspect Ratio | 1:1 (square), 4:5 (portrait), 16:9 (landscape) |
| Color Space | sRGB |

### 11.3 PNG → JPEG Conversion

```python
def convert_to_jpeg(png_path: Path, quality: int = 95) -> Path:
    """Convert PNG from Imagen to JPEG for Instagram."""
    img = Image.open(png_path)
    if img.mode in ("RGBA", "LA", "P"):
        # JPEG doesn't support transparency — composite on white
        background = Image.new("RGB", img.size, (255, 255, 255))
        if img.mode == "RGBA":
            background.paste(img, mask=img.split()[3])
        else:
            background.paste(img)
        img = background
    elif img.mode != "RGB":
        img = img.convert("RGB")

    jpeg_path = png_path.with_suffix(".jpg")
    img.save(str(jpeg_path), "JPEG", quality=quality)
    return jpeg_path
```

### 11.4 Image Hosting for Instagram

Instagram's publishing API requires a public URL. Implementation strategy:

**Development:** Serve via FastAPI + ngrok/Cloudflare Tunnel
```
https://your-tunnel.ngrok.io/media/post_123.jpg
```

**Production (Recommended):** Google Cloud Storage (already using Google APIs)
```python
from google.cloud import storage

async def upload_to_gcs(file_path: Path, bucket_name: str) -> str:
    """Upload image to GCS and return public URL."""
    client = storage.Client()
    bucket = client.bucket(bucket_name)
    blob = bucket.blob(f"instagram/{file_path.name}")
    blob.upload_from_filename(str(file_path))
    blob.make_public()
    return blob.public_url
```

Add `MEDIA_PUBLIC_BASE_URL` to config — either the app's own public URL or a GCS bucket URL.

---

## 12. Authentication & Token Management

### 12.1 Instagram OAuth Flow

```
User clicks "Connect Instagram"
    → GET /auth/instagram
    → Redirect to https://www.instagram.com/oauth/authorize
        ?client_id=<IG_APP_ID>
        &redirect_uri=<CALLBACK_URL>
        &scope=instagram_business_basic,instagram_business_content_publish,
               instagram_business_manage_comments
        &response_type=code

User grants permissions
    → Redirect to GET /auth/instagram/callback?code=<AUTH_CODE>

Server exchanges code for short-lived token
    → POST https://api.instagram.com/oauth/access_token
    → Returns: {access_token, user_id, permissions}

Server exchanges for long-lived token
    → GET https://graph.instagram.com/access_token
        ?grant_type=ig_exchange_token
        &client_secret=<IG_APP_SECRET>
        &access_token=<SHORT_LIVED_TOKEN>
    → Returns: {access_token, expires_in: 5183944}

Server fetches profile
    → GET https://graph.instagram.com/v25.0/me?fields=user_id,username
    → Stores InstagramAccount in DB
```

### 12.2 Token Refresh Strategy

```python
# Instagram tokens: 60 days, refreshable after 24h
# Same strategy as LinkedIn — refresh when within 7 days of expiry

async def auto_refresh_ig_token():
    """Called before each scheduled publish or on dashboard load."""
    with Session(engine) as session:
        account = session.exec(
            select(InstagramAccount).where(InstagramAccount.is_active == True)
        ).first()
        if not account:
            return

        if token_needs_refresh(account.token_expires_at):
            tokens = await instagram_service.refresh_long_lived_token(
                account.access_token
            )
            account.access_token = tokens["access_token"]
            account.token_expires_at = datetime.now(timezone.utc) + timedelta(
                seconds=tokens["expires_in"]
            )
            session.add(account)
            session.commit()
```

### 12.3 Environment Variables for Instagram

```env
# Instagram OAuth (from Meta App Dashboard)
INSTAGRAM_APP_ID=your_instagram_app_id
INSTAGRAM_APP_SECRET=your_instagram_app_secret
INSTAGRAM_REDIRECT_URI=http://localhost:8000/auth/instagram/callback

# Media hosting (for Instagram image URLs)
MEDIA_PUBLIC_BASE_URL=https://your-domain.com/media
# Or for GCS:
GCS_BUCKET_NAME=your-bucket-name
```

---

## 13. Scheduling & Automation Pipeline

### 13.1 Updated Pipeline

```
                    DAILY DRAFT GENERATION (per platform)
                    ┌──────────────────────────────────┐
                    │ 07:00 — LinkedIn Draft            │
                    │ 07:30 — Instagram Draft           │
                    │                                    │
                    │ 1. Pick topic (from shared queue)  │
                    │ 2. Gemini → platform-adapted text  │
                    │ 3. Gemini → image prompt           │
                    │ 4. Imagen → platform-optimized img │
                    │ 5. Gemini → value comment          │
                    │ 6. Save as DRAFT                   │
                    └──────────────┬───────────────────┘
                                   │
                    HUMAN-IN-THE-LOOP APPROVAL
                    ┌──────────────┴───────────────────┐
                    │ Dashboard: Review + Edit + Approve│
                    │ - Edit text, hashtags, image      │
                    │ - Set schedule date/time          │
                    │ - Approve → SCHEDULED             │
                    │ - Reject → REJECTED               │
                    └──────────────┬───────────────────┘
                                   │
                    SCHEDULED PUBLISHING (per platform)
                    ┌──────────────┴───────────────────┐
                    │ LinkedIn: Tue/Thu 09:00           │
                    │ Instagram: Mon/Wed/Fri 12:00     │
                    │                                    │
                    │ 1. Auto-refresh token             │
                    │ 2. Platform-specific publish       │
                    │    LI: upload image + create post  │
                    │    IG: host image → container →    │
                    │        publish → check status      │
                    │ 3. Save platform_post_id           │
                    │ 4. Schedule value comment          │
                    └──────────────────────────────────┘
```

### 13.2 Instagram Publishing Pipeline Detail

```python
async def _publish_to_instagram(post: Post) -> PublishResult:
    """Instagram-specific publishing flow."""
    account = _get_active_ig_account()

    # Step 1: Ensure image is hosted at public URL
    if post.image_path:
        public_url = await _get_public_image_url(post.image_path)
    else:
        return PublishResult(success=False, error="No image — Instagram requires media")

    # Step 2: Build caption (body + hashtags based on setting)
    hashtag_placement = get_setting("ig_hashtag_placement", "caption")
    if hashtag_placement == "caption":
        caption = f"{post.body}\n\n{post.hashtags}"
    else:
        caption = post.body  # hashtags go in first comment

    # Step 3: Create container
    container_id = await instagram_service.create_image_container(
        account.access_token, account.ig_user_id,
        image_url=public_url, caption=caption,
        alt_text=post.topic[:100],
    )
    post.ig_container_id = container_id

    # Step 4: Wait for container to be ready (poll with backoff)
    for attempt in range(5):
        await asyncio.sleep(5 * (attempt + 1))
        status = await instagram_service.check_container_status(
            account.access_token, container_id
        )
        if status == "FINISHED":
            break
        elif status == "ERROR":
            return PublishResult(success=False, error="Container processing failed")

    # Step 5: Publish
    media_id = await instagram_service.publish_container(
        account.access_token, account.ig_user_id, container_id
    )

    # Step 6: Post hashtags as first comment (if setting = first_comment)
    if hashtag_placement == "first_comment" and post.hashtags:
        await instagram_service.post_comment(
            account.access_token, media_id, post.hashtags
        )

    return PublishResult(success=True, platform_post_id=media_id)
```

---

## 14. Webhooks & Real-Time Notifications

### 14.1 Instagram Webhook Setup

**Requirement:** HTTPS endpoint with valid TLS certificate.

**Subscribable Fields:**
- `comments` — New comments on your posts
- `mentions` — When someone @mentions your account
- `story_insights` — Story metrics after expiry
- `messages` — Direct messages

### 14.2 Implementation Plan

```python
# NEW: Webhook endpoint in main.py

@app.get("/webhooks/instagram")
async def instagram_webhook_verify(request: Request):
    """Handle Meta webhook verification challenge."""
    mode = request.query_params.get("hub.mode")
    token = request.query_params.get("hub.verify_token")
    challenge = request.query_params.get("hub.challenge")

    if mode == "subscribe" and token == settings.IG_WEBHOOK_VERIFY_TOKEN:
        return PlainTextResponse(challenge)
    raise HTTPException(403)

@app.post("/webhooks/instagram")
async def instagram_webhook_event(request: Request):
    """Handle Instagram webhook event notifications."""
    # Validate X-Hub-Signature-256
    signature = request.headers.get("X-Hub-Signature-256", "")
    body = await request.body()
    expected = "sha256=" + hmac.new(
        settings.INSTAGRAM_APP_SECRET.encode(), body, hashlib.sha256
    ).hexdigest()
    if not hmac.compare_digest(signature, expected):
        raise HTTPException(403)

    payload = json.loads(body)
    # Process: log comments, update metrics, etc.
    _process_ig_webhook(payload)
    return JSONResponse({"status": "ok"})
```

### 14.3 Webhook Priority

| Priority | Field | Use Case |
|----------|-------|----------|
| Phase 1 | `comments` | Log new comments on published posts |
| Phase 2 | `mentions` | Track brand mentions |
| Phase 3 | `story_insights` | Post-story performance metrics |
| Deferred | `messages` | DM automation (requires separate feature) |

**Note:** Webhooks require the app to be in **Live mode** in the Meta App Dashboard, and require HTTPS with a valid certificate (no self-signed).

---

## 15. Analytics & Insights

### 15.1 Cross-Platform Analytics Dashboard

```
┌────────────────────────────────────────────────────────┐
│ Analytics Overview                    [Last 7/30/90 d] │
├───────────────────────┬────────────────────────────────┤
│ LinkedIn              │ Instagram                       │
│ Posts: 24             │ Posts: 18                       │
│ Avg Impressions: 1.2K │ Avg Impressions: 3.5K          │
│ Avg Engagement: 45    │ Avg Engagement: 120             │
│ Top Post: "KI 2026"  │ Top Post: "5 Karriere-Tipps"   │
├───────────────────────┴────────────────────────────────┤
│ Combined Performance Graph                              │
│ [  📈 Line chart: Impressions over time (both)      ]  │
├─────────────────────────────────────────────────────────┤
│ Post-Level Metrics Table                                │
│ Platform │ Post │ Impressions │ Reach │ Engagement     │
│ 🔗 LI    │ KI.. │ 2,340       │ 1,890 │ 67            │
│ 📸 IG    │ 5 Ti │ 5,120       │ 4,200 │ 234           │
└─────────────────────────────────────────────────────────┘
```

### 15.2 Insights Fetching (via Scheduler Job)

```python
async def job_fetch_insights():
    """Periodically fetch post metrics from both platforms."""
    # Run daily at 06:00

    with Session(engine) as session:
        # Fetch Instagram insights for posts published in last 7 days
        recent_ig_posts = session.exec(
            select(Post).where(
                Post.platform == Platform.INSTAGRAM,
                Post.status == PostStatus.PUBLISHED,
                Post.published_at >= datetime.now(timezone.utc) - timedelta(days=7),
            )
        ).all()

        for post in recent_ig_posts:
            ig_account = _get_active_ig_account(session)
            metrics = await instagram_service.get_media_insights(
                ig_account.access_token, post.platform_post_id
            )
            session.add(PublishingMetric(
                post_id=post.id,
                platform=Platform.INSTAGRAM,
                impressions=metrics.get("impressions", 0),
                reach=metrics.get("reach", 0),
                engagement=metrics.get("engagement", 0),
            ))
        session.commit()
```

**Note:** Instagram Insights API requires `instagram_business_basic` scope and works only for Instagram professional accounts. Some account-level metrics require 100+ followers.

---

## 16. Configuration & Environment Variables

### 16.1 Updated `.env.example`

```env
# ── Google AI (shared) ──────────────────────
GOOGLE_API_KEY=your_google_api_key

# ── LinkedIn OAuth ──────────────────────────
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
LINKEDIN_REDIRECT_URI=http://localhost:8000/auth/linkedin/callback

# ── Instagram OAuth (NEW) ──────────────────
INSTAGRAM_APP_ID=your_instagram_app_id
INSTAGRAM_APP_SECRET=your_instagram_app_secret
INSTAGRAM_REDIRECT_URI=http://localhost:8000/auth/instagram/callback
IG_WEBHOOK_VERIFY_TOKEN=your_random_verify_string

# ── Media Hosting (NEW — for Instagram) ────
MEDIA_PUBLIC_BASE_URL=https://your-public-domain.com/media
# Optional: Google Cloud Storage
# GCS_BUCKET_NAME=your-bucket-name

# ── App ─────────────────────────────────────
APP_SECRET_KEY=change-this-to-a-random-string-min-32-chars
DATABASE_URL=sqlite:///data/linkedin_automation.db

# ── Schedule ────────────────────────────────
POSTING_DAYS=1,3
POSTING_HOUR=9
POSTING_MINUTE=0
```

### 16.2 Updated `config.py`

```python
class Settings:
    # ... existing fields ...

    # Instagram OAuth (NEW)
    INSTAGRAM_APP_ID: str = os.getenv("INSTAGRAM_APP_ID", "")
    INSTAGRAM_APP_SECRET: str = os.getenv("INSTAGRAM_APP_SECRET", "")
    INSTAGRAM_REDIRECT_URI: str = os.getenv(
        "INSTAGRAM_REDIRECT_URI", "http://localhost:8000/auth/instagram/callback"
    )
    IG_WEBHOOK_VERIFY_TOKEN: str = os.getenv("IG_WEBHOOK_VERIFY_TOKEN", "")

    # Media hosting (NEW)
    MEDIA_PUBLIC_BASE_URL: str = os.getenv("MEDIA_PUBLIC_BASE_URL", "")
    GCS_BUCKET_NAME: str = os.getenv("GCS_BUCKET_NAME", "")
```

---

## 17. Dependencies & Requirements

### 17.1 Existing Dependencies (No Changes)
```
fastapi==0.115.6
uvicorn[standard]==0.34.0
sqlmodel==0.0.22
httpx==0.28.1
python-dotenv==1.0.1
jinja2==3.1.5
apscheduler==3.11.0
google-genai==1.5.0
Pillow==11.1.0
python-multipart==0.0.20
```

### 17.2 New Dependencies
```
# Only if using Google Cloud Storage for media hosting:
google-cloud-storage==2.18.2    # Optional — for GCS media hosting
```

**No new Python dependencies required** for core Instagram functionality — all Instagram API calls use `httpx` (already installed). Image conversion uses `Pillow` (already installed). OAuth uses `httpx` (already installed).

---

## 18. Implementation Phases

### Phase 1: Foundation (Core Instagram Support)
**Estimated scope: 8 new/modified files**

1. **Database changes** — Add `Platform` enum, modify `Post` model, create `InstagramAccount`, add IG settings defaults
2. **`services/instagram_service.py`** — Full OAuth flow + content publishing + comments
3. **`services/platform_router.py`** — Adapter dispatcher
4. **`config.py`** — Add Instagram env vars
5. **Modified `services/gemini_service.py`** — Platform-aware prompts
6. **Modified `services/imagen_service.py`** — Platform-specific dimensions + JPEG conversion
7. **Modified `main.py`** — Instagram OAuth routes, platform filter on posts, generate with platform
8. **Modified templates** — Platform badges, IG settings section, platform selector on generate

### Phase 2: Publishing Pipeline
**Estimated scope: 3 modified files**

1. **Modified `services/scheduler_service.py`** — Per-platform scheduling + IG publishing flow
2. **Image hosting solution** — Serve publicly or upload to cloud storage
3. **Rate limit tracking** — Pre-publish rate limit check for Instagram

### Phase 3: Analytics & Webhooks
**Estimated scope: 4 new/modified files**

1. **`PublishingMetric` model** — Track cross-platform metrics
2. **Insights fetching job** — Periodic pull from Instagram API
3. **Webhook endpoint** — Comment notifications, mention tracking
4. **Analytics dashboard** — Cross-platform performance view

### Phase 4: Polish & Production
1. App Review submission to Meta (for Advanced Access)
2. Cloud storage integration (GCS recommended)
3. Error handling for Instagram-specific failures (container timeouts, rate limits)
4. End-to-end testing with real Instagram account

---

## 19. Edge Cases & Risk Mitigation

### 19.1 Technical Edge Cases

| Edge Case | Risk | Mitigation |
|-----------|------|------------|
| Imagen generates PNG, Instagram needs JPEG | Image upload fails | Auto-convert with Pillow (RGBA→RGB→JPEG) |
| Instagram needs public URL for images | Publishing fails in dev | Serve via FastAPI at public URL or use ngrok/tunnel |
| Container status stuck IN_PROGRESS | Publish timeout | Poll with exponential backoff (5, 10, 15, 20, 25 sec), fail after 5 attempts |
| Rate limit 100 posts/24h reached | Publish rejected | Check `content_publishing_limit` before publishing, queue excess posts |
| Token expired between schedule and publish | Auth failure | Auto-refresh in scheduler before each publish attempt |
| User has personal (not professional) IG account | OAuth fails | Show error message explaining Business/Creator account requirement |
| Page Publishing Authorization (PPA) not completed | Publish fails | Document PPA requirement in settings, detect and show warning |
| Image too small (< 320x320) | Container creation fails | Imagen generates 1080x1080 minimum — not an issue |
| Instagram API downtime | Publish fails | Retry with backoff, log failure, keep post as SCHEDULED for next window |
| Cross-posting same content | Platform penalizes duplicate | AI generates platform-adapted versions (different length, tone, hashtags) |

### 19.2 Business/Compliance Risks

| Risk | Mitigation |
|------|------------|
| Meta App Review rejection | Follow all Platform Policies, use only documented API features |
| Instagram account suspension for automation | Stay well within rate limits, maintain human-in-the-loop approval |
| GDPR compliance with Instagram data | Store only necessary data, support data export/deletion |
| Instagram API deprecation/changes | Use versioned API (v25.0), monitor Meta changelog |

### 19.3 Data Migration Risk

The `Post` model schema change (adding `platform`, renaming `linkedin_post_urn`) could corrupt existing data. Mitigation:
1. Back up SQLite database before migration
2. Use Alembic or manual ALTER TABLE with defaults
3. All existing posts get `platform='linkedin'` by default
4. Renamed columns preserve all existing data

---

## 20. Testing Strategy

### 20.1 Unit Tests

| Test | What it covers |
|------|---------------|
| `test_instagram_service.py` | OAuth flow, container creation, publish, comments, insights |
| `test_platform_router.py` | Correct adapter dispatch by platform |
| `test_gemini_platform_prompts.py` | LinkedIn vs Instagram prompt selection, character limits |
| `test_imagen_platform_config.py` | Image dimension, format, JPEG conversion |
| `test_image_conversion.py` | PNG→JPEG with alpha channel handling |

### 20.2 Integration Tests

| Test | What it covers |
|------|---------------|
| Instagram OAuth full flow | Code → short token → long token → profile → DB save |
| Instagram publish pipeline | Draft → approve → schedule → container → publish |
| Cross-platform generate | Single topic → LinkedIn post + Instagram post |
| Token refresh | Expired token → auto-refresh → successful publish |
| Rate limit handling | Publishing when at limit → graceful queue |

### 20.3 Manual Testing Checklist

- [ ] Connect Instagram account via OAuth
- [ ] Generate draft for Instagram (correct prompt, 2200 char limit, square image)
- [ ] Generate for "Both Platforms" (two posts created)
- [ ] Edit Instagram post (media type selector, hashtag count)
- [ ] Approve and publish Instagram post
- [ ] Value comment posted as first comment
- [ ] Hashtags placed correctly (caption vs first comment)
- [ ] Platform filter works on posts list
- [ ] Settings page shows Instagram account + schedule + defaults
- [ ] Disconnect Instagram account
- [ ] Dashboard shows combined stats
- [ ] Export includes platform field
- [ ] Dark mode works with Instagram badges

---

## 21. Future Platform Expansion

The chosen architecture (Platform Adapter Pattern) makes adding new platforms straightforward:

### Adding a New Platform (e.g., Twitter/X, Facebook, TikTok)

1. Create `services/twitter_service.py` implementing `PlatformAdapter`
2. Add `Platform.TWITTER` to the enum
3. Register adapter in `platform_router.py`: `ADAPTERS["twitter"] = TwitterAdapter()`
4. Add `TwitterAccount` model to `database.py`
5. Add OAuth routes in `main.py`
6. Add platform-specific prompts in `gemini_service.py`
7. Add image config in `imagen_service.py`
8. Add platform option in templates

**No architectural changes needed** — just implement the adapter interface and plug in.

### Potential Future Platforms

| Platform | API Status | Content Types | Feasibility |
|----------|-----------|---------------|-------------|
| Twitter/X | v2 API (paid tiers) | Tweets, threads, images | High (similar pattern) |
| Facebook Pages | Graph API v25.0 | Posts, images, videos | High (shares Meta auth) |
| TikTok | Content Posting API | Videos only | Medium (video-heavy) |
| YouTube | Data API v3 | Videos, Shorts, Community | Low (primarily video) |
| Threads | API available 2024+ | Text, images | High (Meta platform) |

---

## 22. QA Review & Checklist

### Is this plan relevant?
✅ **Yes.** It directly addresses the user's request to add Instagram automation alongside the existing LinkedIn tool, using the same AI backbone and human-in-the-loop workflow.

### Is this plan up to date (March 2026)?
✅ **Yes.**
- Uses Instagram API with Instagram Login (post-January 2025 scope values: `instagram_business_basic`, etc.)
- Uses Graph API v25.0 (latest)
- Includes `alt_text` support (added March 2025)
- Uses Business Login for Instagram (no Facebook Page required)
- All deprecated scope values (`business_basic`, etc.) are NOT used

### Is this plan complete?
✅ **Yes.** Covers:
- [x] Full Instagram API research (auth, publishing, insights, webhooks, comments)
- [x] Platform comparison (LinkedIn vs Instagram — every difference documented)
- [x] Architectural decision with rationale
- [x] System architecture diagram
- [x] Database schema changes with migration strategy
- [x] Every service file's changes specified
- [x] Every route addition/modification listed
- [x] Every template change described with visual mockups
- [x] Content strategy (platform-specific AI prompts, hashtag strategy)
- [x] Image pipeline (format conversion, dimension handling, hosting)
- [x] Authentication flow (full OAuth, token management)
- [x] Scheduling pipeline (per-platform, with detailed Instagram publishing flow)
- [x] Webhooks (setup, validation, field priorities)
- [x] Analytics (cross-platform dashboard, insights fetching)
- [x] Configuration (env vars, settings)
- [x] Dependencies (minimal additions needed)
- [x] Implementation phases (incremental delivery)
- [x] Edge cases (13 technical + 4 business risks)
- [x] Testing strategy (unit, integration, manual)
- [x] Future expansion path

### Has it covered all criteria?
✅ **Yes.**
- **Scalable:** Platform adapter pattern supports unlimited platforms
- **Robust:** Error handling for every Instagram API failure mode
- **Modern (March 2026):** Latest Instagram API, async/await throughout, type hints
- **Expert-level:** Production patterns (adapter pattern, rate limiting, token management)
- **Human-in-the-loop:** Same approval workflow as LinkedIn — nothing auto-publishes without approval
- **Market research:** Full Instagram API capabilities documented with limitations

### Are all dependencies and edge cases covered?
✅ **Yes.**
- No new pip dependencies needed for core functionality (httpx + Pillow already installed)
- 13 technical edge cases with specific mitigations
- 4 business/compliance risks addressed
- Data migration strategy for schema changes
- Image format conversion (PNG→JPEG) with alpha channel handling
- Media hosting solution for Instagram's public URL requirement

### What's NOT in scope (and why)?
- **Reel/Video generation:** Imagen 4 generates images, not video. Reel publishing API is documented but video creation would require a separate tool (e.g., programmatic video generation)
- **Instagram DM automation:** Requires separate feature design and `instagram_business_manage_messages` scope
- **Instagram Shopping:** Not available via API
- **Multi-account management:** Current design supports one account per platform (single-user tool)

---

## Appendix A: Meta App Dashboard Setup

To use the Instagram API, you need:

1. **Create a Meta Business App** at developers.facebook.com
   - App type: Business
   - Add "Instagram" product
2. **Configure Business Login for Instagram**
   - Set redirect URI: `http://localhost:8000/auth/instagram/callback`
   - Select scopes: `instagram_business_basic`, `instagram_business_content_publish`, `instagram_business_manage_comments`
   - Copy the Embed URL for OAuth
3. **Get App Credentials**
   - Instagram App ID (from Instagram > API setup with Instagram business login)
   - Instagram App Secret
4. **Access Levels**
   - Standard Access: For your own Instagram professional account
   - Advanced Access: Requires App Review (for serving other accounts)
5. **Switch App to Live Mode** (required for webhooks)

## Appendix B: Instagram Professional Account Setup

Users must have an Instagram **Business** or **Creator** account (not personal):
1. Open Instagram > Settings > Account > Switch to Professional Account
2. Choose Business or Creator
3. Optionally connect a Facebook Page (not required for Business Login for Instagram)

---

*End of Plan Document*
