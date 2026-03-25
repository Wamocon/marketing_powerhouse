# Social Media Marketing Hub — Main Application
"""
FastAPI app with Jinja2 dashboard for LinkedIn + Instagram automation.
Run with: uvicorn app.main:app --reload
"""
import csv
import hashlib
import hmac
import io
import json
import logging
import math
import secrets
import time
from collections import defaultdict, deque
from base64 import urlsafe_b64encode, urlsafe_b64decode
from contextlib import asynccontextmanager
from datetime import datetime, timezone, timedelta
from pathlib import Path
from threading import Lock

from fastapi import FastAPI, Request, Form, HTTPException, Query
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import HTMLResponse, RedirectResponse, FileResponse, JSONResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from sqlmodel import Session, select, desc, func, col

from app.config import settings, DATA_DIR
from app.database import (
    init_db, engine, Post, PostStatus, Platform,
    LinkedInAccount, InstagramAccount, AppLog,
    TopicIdea, get_setting, get_settings, set_setting,
)
from app.momentum_models import (
    MomentumScheduledPost, MomentumConnectedAccount, MomentumCompany,
    SocialHubSettings, SocialAnalyticsSnapshot, MomentumEngagementMetric,
)
from app.services import gemini_service, imagen_service, linkedin_service, instagram_service, supabase_service
from app.services.resilience import public_error_message
from app.services.scheduler_service_v2 import (
    setup_scheduler, reschedule, get_next_run,
)
from app.api_v1 import router as api_v1_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("app")

templates = Jinja2Templates(directory=Path(__file__).parent / "templates")
SOCIAL_HUB_PATH_PREFIX = (settings.SOCIAL_HUB_PATH_PREFIX or "").rstrip("/")

ITEMS_PER_PAGE = 20
ACTION_BUCKETS: dict[str, deque[float]] = defaultdict(deque)
ACTION_BUCKETS_LOCK = Lock()
VIEW_CACHE: dict[tuple[str, str], tuple[float, object]] = {}
VIEW_CACHE_LOCK = Lock()


def _sh_url(path: str) -> str:
    if not path:
        return SOCIAL_HUB_PATH_PREFIX or "/"
    if path.startswith(("http://", "https://")):
        return path
    normalized = path if path.startswith("/") else f"/{path}"
    if SOCIAL_HUB_PATH_PREFIX and normalized.startswith(SOCIAL_HUB_PATH_PREFIX + "/"):
        return normalized
    if SOCIAL_HUB_PATH_PREFIX and normalized == SOCIAL_HUB_PATH_PREFIX:
        return normalized
    return f"{SOCIAL_HUB_PATH_PREFIX}{normalized}" if SOCIAL_HUB_PATH_PREFIX else normalized


templates.env.globals["sh_url"] = _sh_url


def _invalidate_view_cache():
    with VIEW_CACHE_LOCK:
        VIEW_CACHE.clear()


def _get_cached_view_data(cache_name: str, cache_key: str, builder, ttl_seconds: int | None = None):
    ttl = ttl_seconds if ttl_seconds is not None else settings.READ_VIEW_CACHE_TTL_SECONDS
    if ttl <= 0:
        return builder()

    lookup_key = (cache_name, cache_key)
    now = time.monotonic()
    with VIEW_CACHE_LOCK:
        cached = VIEW_CACHE.get(lookup_key)
        if cached and cached[0] > now:
            return cached[1]

    value = builder()
    with VIEW_CACHE_LOCK:
        VIEW_CACHE[lookup_key] = (now + ttl, value)
    return value


def _set_cached_view_data(cache_name: str, cache_key: str, value, ttl_seconds: int | None = None):
    ttl = ttl_seconds if ttl_seconds is not None else settings.READ_VIEW_CACHE_TTL_SECONDS
    if ttl <= 0:
        return

    with VIEW_CACHE_LOCK:
        VIEW_CACHE[(cache_name, cache_key)] = (time.monotonic() + ttl, value)


def _warm_read_caches():
    if settings.READ_VIEW_CACHE_TTL_SECONDS <= 0:
        return

    dashboard_settings = get_settings(
        [
            "posting_days", "ig_posting_days",
            "posting_hour", "posting_minute",
            "ig_posting_hour", "ig_posting_minute",
            "max_pending_drafts",
        ],
        defaults={
            "posting_days": "1,3",
            "ig_posting_days": "0,2,4",
            "posting_hour": "9",
            "posting_minute": "0",
            "ig_posting_hour": "12",
            "ig_posting_minute": "0",
            "max_pending_drafts": "3",
        },
    )

    with Session(engine) as session:
        status_rows = session.exec(
            select(Post.status, func.count(col(Post.id))).group_by(Post.status)
        ).all()
        platform_rows = session.exec(
            select(Post.platform, func.count(col(Post.id)))
            .where(Post.status == PostStatus.PUBLISHED)
            .group_by(Post.platform)
        ).all()
        upcoming = session.exec(
            select(Post)
            .where(col(Post.status).in_([PostStatus.DRAFT, PostStatus.APPROVED, PostStatus.SCHEDULED]))
            .order_by(col(Post.created_at)).limit(10)
        ).all()
        li_account = session.exec(select(LinkedInAccount).where(LinkedInAccount.is_active == True)).first()
        ig_account = session.exec(select(InstagramAccount).where(InstagramAccount.is_active == True)).first()
        topic_count = session.exec(select(func.count(col(TopicIdea.id))).where(TopicIdea.used == False)).one()

        default_posts_total = session.exec(select(func.count(col(Post.id)))).one()
        default_posts = session.exec(
            select(Post).order_by(desc(Post.created_at)).limit(ITEMS_PER_PAGE)
        ).all()
        queued_topics = session.exec(
            select(TopicIdea).where(TopicIdea.used == False).order_by(col(TopicIdea.created_at))
        ).all()
        all_topics = session.exec(
            select(TopicIdea).order_by(desc(TopicIdea.created_at))
        ).all()
        logs = session.exec(
            select(AppLog).order_by(desc(AppLog.timestamp)).limit(200)
        ).all()

    _set_cached_view_data("dashboard", settings.DATABASE_SCHEMA, {
        "dashboard_settings": dashboard_settings,
        "status_counts": {status: count for status, count in status_rows},
        "platform_counts": {platform: count for platform, count in platform_rows},
        "upcoming": upcoming,
        "li_account": li_account,
        "ig_account": ig_account,
        "topic_count": topic_count,
    })
    _set_cached_view_data("posts", f"{settings.DATABASE_SCHEMA}||||1", {
        "posts": default_posts,
        "total_count": default_posts_total,
        "total_pages": max(1, math.ceil(default_posts_total / ITEMS_PER_PAGE)),
        "page": 1,
    })
    _set_cached_view_data("generate", settings.DATABASE_SCHEMA, queued_topics)
    _set_cached_view_data("topics", settings.DATABASE_SCHEMA, all_topics)
    _set_cached_view_data("settings", settings.DATABASE_SCHEMA, {
        "li_account": li_account,
        "ig_account": ig_account,
        "current": get_settings(SETTING_KEYS),
    })
    _set_cached_view_data("logs", f"{settings.DATABASE_SCHEMA}|", logs)


def _warm_template_cache():
    for template_name in [
        "base.html",
        "dashboard.html",
        "posts.html",
        "post_detail.html",
        "generate.html",
        "topics.html",
        "settings.html",
        "logs.html",
        "error.html",
    ]:
        templates.get_template(template_name)


def _build_warm_request(path: str) -> Request:
    return Request({
        "type": "http",
        "http_version": "1.1",
        "method": "GET",
        "scheme": "http",
        "path": path,
        "raw_path": path.encode(),
        "query_string": b"",
        "headers": [],
        "client": ("127.0.0.1", 0),
        "server": ("127.0.0.1", 8000),
    })


async def _warm_route_renders():
    for response in [
        await dashboard(_build_warm_request("/")),
        await posts_list(_build_warm_request("/posts"), page=1),
        await generate_page(_build_warm_request("/generate")),
        await topics_page(_build_warm_request("/topics")),
        await settings_page(_build_warm_request("/settings")),
        await logs_page(_build_warm_request("/logs")),
    ]:
        response.render(response.body)


# ── CSRF Protection ──────────────────────────────────────────────────────

def _generate_csrf_token(session_id: str) -> str:
    """Generate an HMAC-based CSRF token tied to the session."""
    return hmac.new(
        settings.APP_SECRET_KEY.encode(),
        session_id.encode(),
        hashlib.sha256,
    ).hexdigest()


def _get_session_id(request: Request) -> str:
    """Get or create a session ID from cookies."""
    return request.cookies.get("_session_id", "")


def _validate_csrf(request: Request, token: str) -> bool:
    """Validate CSRF token against the session."""
    session_id = _get_session_id(request)
    if not session_id or not token:
        return False
    expected = _generate_csrf_token(session_id)
    return hmac.compare_digest(expected, token)


def _request_csrf_token(request: Request, form_token: str = "") -> str:
    return form_token or request.headers.get("X-CSRF-Token", "")


def _client_identity(request: Request) -> str:
    session_id = _get_session_id(request)
    if session_id:
        return session_id
    if request.client and request.client.host:
        return request.client.host
    return "anonymous"


def _rate_limit_retry_after(request: Request, scope: str, limit: int, window_seconds: int | None = None) -> int | None:
    window = window_seconds or settings.ACTION_RATE_LIMIT_WINDOW_SECONDS
    bucket_key = f"{scope}:{_client_identity(request)}"
    now = time.monotonic()
    with ACTION_BUCKETS_LOCK:
        bucket = ACTION_BUCKETS[bucket_key]
        while bucket and now - bucket[0] >= window:
            bucket.popleft()
        if len(bucket) >= limit:
            return max(1, int(window - (now - bucket[0])))
        bucket.append(now)
    return None


def _json_error(message: str, status_code: int = 400, retry_after: int | None = None) -> JSONResponse:
    response = JSONResponse({"error": message}, status_code=status_code)
    if retry_after is not None:
        response.headers["Retry-After"] = str(retry_after)
    return response


def _publish_now_blocker(platform: Platform) -> str | None:
    with Session(engine) as session:
        if platform == Platform.INSTAGRAM:
            account = session.exec(select(InstagramAccount).where(InstagramAccount.is_active == True)).first()
            if not account or not account.access_token or not account.ig_user_id:
                return "Instagram is not fully connected. Reconnect the account before publishing."
            if not settings.MEDIA_PUBLIC_BASE_URL:
                return "Instagram publishing requires MEDIA_PUBLIC_BASE_URL for public image hosting."
            return None

        account = session.exec(select(LinkedInAccount).where(LinkedInAccount.is_active == True)).first()
        if not account or not account.access_token or not account.linkedin_user_id:
            return "LinkedIn is not fully connected. Reconnect the account before publishing."
    return None


# ── Cookie-based flash messages ──────────────────────────────────────────

def flash(response, text: str, category: str = "info"):
    """Store a flash message in a cookie."""
    msg = json.dumps({"text": text, "category": category})
    encoded = urlsafe_b64encode(msg.encode()).decode()
    response.set_cookie("_flash", encoded, max_age=30, httponly=True, samesite="lax")


def get_flashed(request: Request) -> list[dict]:
    """Read and consume flash message from request cookie."""
    raw = request.cookies.get("_flash")
    if not raw:
        return []
    try:
        msg = json.loads(urlsafe_b64decode(raw))
        return [msg]
    except Exception:
        return []


def _template(request: Request, name: str, ctx: dict, **kwargs):
    """Render a template with flash messages and CSRF token injected."""
    ctx["request"] = request
    ctx["flashes"] = get_flashed(request)
    session_id = _get_session_id(request)
    ctx["csrf_token"] = _generate_csrf_token(session_id) if session_id else ""
    ctx["theme"] = request.cookies.get("theme", get_setting("theme", "light"))
    ctx["sh_base_path"] = SOCIAL_HUB_PATH_PREFIX or ""
    # Project context for nav — set by project routes, defaults to empty
    ctx.setdefault("project_id", "")
    ctx.setdefault("project_name", "")
    resp = templates.TemplateResponse(name, ctx, **kwargs)
    if request.cookies.get("_flash"):
        resp.delete_cookie("_flash")
    # Ensure session ID cookie always exists
    if not session_id:
        new_id = secrets.token_urlsafe(32)
        resp.set_cookie("_session_id", new_id, max_age=86400 * 30, httponly=True, samesite="lax")
    return resp


def _redirect(url: str, flash_text: str = "", flash_cat: str = "info") -> RedirectResponse:
    """Redirect with optional flash message."""
    resp = RedirectResponse(_sh_url(url), status_code=303)
    if flash_text:
        flash(resp, flash_text, flash_cat)
    return resp


# ── App lifecycle ────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    setup_scheduler()
    try:
        _warm_template_cache()
        _warm_read_caches()
        await _warm_route_renders()
    except Exception as exc:
        logger.warning("Could not warm read caches: %s", exc)
    _db_log("INFO", "app", "App started.")
    logger.info("App started.")
    yield
    logger.info("App shutting down.")


app = FastAPI(title="Social Media Marketing Hub", lifespan=lifespan)

_DEFAULT_CORS_ORIGINS = [
    "http://localhost:8000", "http://127.0.0.1:8000",
    "http://localhost:8001", "http://127.0.0.1:8001",
    "http://localhost:3000", "http://127.0.0.1:3000",
    "http://localhost:3001", "http://127.0.0.1:3001",
]
_cors_origins = (
    [o.strip() for o in settings.CORS_ORIGINS.split(",") if o.strip()]
    if settings.CORS_ORIGINS
    else _DEFAULT_CORS_ORIGINS
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    allow_credentials=True,
)
app.add_middleware(GZipMiddleware, minimum_size=1024)

# Mount API v1 router (Momentum integration endpoints)
app.include_router(api_v1_router)

app.mount("/static", StaticFiles(directory=Path(__file__).parent / "static"), name="static")


# ── Security middleware ──────────────────────────────────────────────────

@app.middleware("http")
async def security_headers_middleware(request: Request, call_next):
    response = await call_next(request)
    if request.method not in {"GET", "HEAD", "OPTIONS"}:
        _invalidate_view_cache()
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    return response


# ── Error handlers ───────────────────────────────────────────────────────

@app.exception_handler(404)
async def not_found_handler(request: Request, exc):
    if request.url.path.startswith("/api/"):
        return JSONResponse({"error": "Not found"}, status_code=404)
    return _template(request, "error.html", {"error_code": 404, "error_message": "Page not found"}, status_code=404)


@app.exception_handler(500)
async def server_error_handler(request: Request, exc):
    logger.exception("Internal server error: %s", exc)
    if request.url.path.startswith("/api/"):
        return JSONResponse(
            {"error": "Internal server error",
             "detail": str(exc) if settings.APP_ENV != "production" else "An unexpected error occurred.",
             "timestamp": datetime.now(timezone.utc).isoformat()},
            status_code=500,
        )
    return _template(request, "error.html", {"error_code": 500, "error_message": "Internal server error"}, status_code=500)


@app.exception_handler(RequestValidationError)
async def validation_error_handler(request: Request, exc):
    if request.url.path.startswith("/api/"):
        return JSONResponse(
            {"error": "Validation error",
             "detail": str(exc),
             "timestamp": datetime.now(timezone.utc).isoformat()},
            status_code=422,
        )
    return _template(request, "error.html", {"error_code": 422, "error_message": "Invalid input"}, status_code=422)


# ── DB logging helper ───────────────────────────────────────────────────

def _db_log(level: str, source: str, message: str):
    """Write a log entry to AppLog table."""
    try:
        with Session(engine) as session:
            session.add(AppLog(level=level, source=source, message=message))
            session.commit()
    except Exception:
        logger.warning("Could not write to AppLog: %s", message)


# ── Dashboard ────────────────────────────────────────────────────────────

DAY_NAMES = {0: "Monday", 1: "Tuesday", 2: "Wednesday", 3: "Thursday",
             4: "Friday", 5: "Saturday", 6: "Sunday"}
DAY_SHORT = {0: "Mo", 1: "Tu", 2: "We", 3: "Th", 4: "Fr", 5: "Sa", 6: "Su"}

DAY_NAME_TO_CRON = {
    "Monday": "0", "Tuesday": "1", "Wednesday": "2",
    "Thursday": "3", "Friday": "4", "Saturday": "5", "Sunday": "6",
}
CRON_TO_DAY_NAME = {v: k for k, v in DAY_NAME_TO_CRON.items()}


def _format_days(raw: str) -> str:
    return ", ".join(DAY_SHORT.get(int(d.strip()), d.strip()) for d in raw.split(",") if d.strip())


def _account_health(account) -> tuple[str, int]:
    """Return (status_str, days_left) for any account with token_expires_at."""
    if not account:
        return "none", 0
    if not account.access_token:
        return "disconnected", 0
    if account.token_expires_at and account.token_expires_at < datetime.now(timezone.utc):
        return "expired", 0
    if account.token_expires_at:
        days = (account.token_expires_at - datetime.now(timezone.utc)).days
        return ("warning" if days < 7 else "ok"), days
    return "ok", 0


def _build_readiness_items(li_status: str, ig_status: str, li_days_left: int = 0, ig_days_left: int = 0) -> tuple[list[dict], int]:
    """Build go-live readiness items used by the dashboard and settings page."""

    def account_item(platform_name: str, status: str, days_left: int) -> dict:
        if status == "ok":
            return {
                "label": f"{platform_name} account connection",
                "state": "ready",
                "detail": "Authenticated and ready for publishing.",
            }
        if status == "warning":
            return {
                "label": f"{platform_name} account connection",
                "state": "warn",
                "detail": f"Token expires in {days_left} day(s). Refresh before client go-live.",
            }
        if status == "expired":
            return {
                "label": f"{platform_name} account connection",
                "state": "issue",
                "detail": "Token expired. Reconnect before publishing.",
            }
        if status == "disconnected":
            return {
                "label": f"{platform_name} account connection",
                "state": "issue",
                "detail": "Account exists but is not authenticated.",
            }
        return {
            "label": f"{platform_name} account connection",
            "state": "issue",
            "detail": "No active account configured yet.",
        }

    linkedin_api_ready = bool(settings.LINKEDIN_CLIENT_ID and settings.LINKEDIN_CLIENT_SECRET)
    instagram_api_ready = bool(settings.INSTAGRAM_APP_ID and settings.INSTAGRAM_APP_SECRET)
    google_api_ready = bool(settings.GOOGLE_API_KEY)
    media_host_ready = bool(settings.MEDIA_PUBLIC_BASE_URL)

    items = [
        {
            "label": "Human approval gate",
            "state": "ready",
            "detail": "Only approved posts can be published, which keeps a human in the loop.",
        },
        {
            "label": "Official API stack",
            "state": "ready",
            "detail": "The app uses official LinkedIn OAuth/Share APIs and Instagram Graph publishing APIs.",
        },
        {
            "label": "Google AI services",
            "state": "ready" if google_api_ready else "issue",
            "detail": "Gemini and Imagen are configured." if google_api_ready else "Add GOOGLE_API_KEY to enable content and image generation.",
        },
        {
            "label": "LinkedIn app credentials",
            "state": "ready" if linkedin_api_ready else "issue",
            "detail": "Client credentials are configured." if linkedin_api_ready else "Add LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET.",
        },
        {
            "label": "Instagram app credentials",
            "state": "ready" if instagram_api_ready else "issue",
            "detail": "App credentials are configured." if instagram_api_ready else "Add INSTAGRAM_APP_ID and INSTAGRAM_APP_SECRET.",
        },
        {
            "label": "Public media hosting",
            "state": "ready" if media_host_ready else "warn",
            "detail": f"Instagram media can be fetched from {settings.MEDIA_PUBLIC_BASE_URL}." if media_host_ready else "Instagram publishing requires a public image URL or CDN/tunnel.",
        },
        {
            "label": "Production scheduler durability",
            "state": "warn",
            "detail": "The current APScheduler setup is process-local. It is fine for a single app instance, but a client production rollout should use a persistent worker or job queue.",
        },
        account_item("LinkedIn", li_status, li_days_left),
        account_item("Instagram", ig_status, ig_days_left),
    ]

    ready_count = sum(1 for item in items if item["state"] == "ready")
    score = round((ready_count / len(items)) * 100)
    return items, score


@app.get("/", response_class=HTMLResponse)
async def dashboard(request: Request):
    def build_dashboard_data():
        dashboard_settings = get_settings(
            [
                "posting_days", "ig_posting_days",
                "posting_hour", "posting_minute",
                "ig_posting_hour", "ig_posting_minute",
                "max_pending_drafts",
            ],
            defaults={
                "posting_days": "1,3",
                "ig_posting_days": "0,2,4",
                "posting_hour": "9",
                "posting_minute": "0",
                "ig_posting_hour": "12",
                "ig_posting_minute": "0",
                "max_pending_drafts": "3",
            },
        )

        with Session(engine) as session:
            status_rows = session.exec(
                select(Post.status, func.count(col(Post.id))).group_by(Post.status)
            ).all()
            platform_rows = session.exec(
                select(Post.platform, func.count(col(Post.id)))
                .where(Post.status == PostStatus.PUBLISHED)
                .group_by(Post.platform)
            ).all()

            upcoming = session.exec(
                select(Post)
                .where(col(Post.status).in_([PostStatus.DRAFT, PostStatus.APPROVED, PostStatus.SCHEDULED]))
                .order_by(col(Post.created_at)).limit(10)
            ).all()

            li_account = session.exec(select(LinkedInAccount).where(LinkedInAccount.is_active == True)).first()
            ig_account = session.exec(select(InstagramAccount).where(InstagramAccount.is_active == True)).first()
            topic_count = session.exec(select(func.count(col(TopicIdea.id))).where(TopicIdea.used == False)).one()

        return {
            "dashboard_settings": dashboard_settings,
            "status_counts": {status: count for status, count in status_rows},
            "platform_counts": {platform: count for platform, count in platform_rows},
            "upcoming": upcoming,
            "li_account": li_account,
            "ig_account": ig_account,
            "topic_count": topic_count,
        }

    dashboard_data = _get_cached_view_data("dashboard", settings.DATABASE_SCHEMA, build_dashboard_data)
    dashboard_settings = dashboard_data["dashboard_settings"]
    status_counts = dashboard_data["status_counts"]
    platform_counts = dashboard_data["platform_counts"]
    upcoming = dashboard_data["upcoming"]
    li_account = dashboard_data["li_account"]
    ig_account = dashboard_data["ig_account"]
    topic_count = dashboard_data["topic_count"]

    li_status, li_days_left = _account_health(li_account)
    ig_status, ig_days_left = _account_health(ig_account)
    readiness_items, readiness_score = _build_readiness_items(
        li_status, ig_status, li_days_left, ig_days_left,
    )

    return _template(request, "dashboard.html", {
        "stats": {
            "total": sum(status_counts.values()),
            "drafts": status_counts.get(PostStatus.DRAFT, 0),
            "approved": status_counts.get(PostStatus.APPROVED, 0),
            "published": status_counts.get(PostStatus.PUBLISHED, 0),
            "failed": status_counts.get(PostStatus.FAILED, 0),
            "li_published": platform_counts.get(Platform.LINKEDIN, 0),
            "ig_published": platform_counts.get(Platform.INSTAGRAM, 0),
        },
        "upcoming": upcoming,
        "li_account": li_account, "ig_account": ig_account,
        "li_status": li_status, "li_days_left": li_days_left,
        "ig_status": ig_status, "ig_days_left": ig_days_left,
        "li_next": get_next_run("linkedin"),
        "ig_next": get_next_run("instagram"),
        "li_days_str": _format_days(dashboard_settings["posting_days"]),
        "ig_days_str": _format_days(dashboard_settings["ig_posting_days"]),
        "li_time": f"{int(dashboard_settings['posting_hour']):02d}:{int(dashboard_settings['posting_minute']):02d}",
        "ig_time": f"{int(dashboard_settings['ig_posting_hour']):02d}:{int(dashboard_settings['ig_posting_minute']):02d}",
        "topic_count": topic_count,
        "max_pending": int(dashboard_settings["max_pending_drafts"]),
        "readiness_items": readiness_items,
        "readiness_score": readiness_score,
        "media_public_base_url": settings.MEDIA_PUBLIC_BASE_URL,
    })


# ── Posts ────────────────────────────────────────────────────────────────

@app.get("/posts", response_class=HTMLResponse)
async def posts_list(
    request: Request,
    status: str | None = None,
    platform: str | None = None,
    q: str | None = None,
    page: int = Query(1, ge=1),
):
    status_filter = status or ""
    platform_filter = platform or ""
    search_query = q.strip() if q else ""

    def build_posts_data():
        with Session(engine) as session:
            query = select(Post).order_by(desc(Post.created_at))
            count_query = select(func.count(col(Post.id)))

            if status_filter:
                query = query.where(Post.status == status_filter)
                count_query = count_query.where(Post.status == status_filter)
            if platform_filter and platform_filter in ("linkedin", "instagram"):
                query = query.where(Post.platform == platform_filter)
                count_query = count_query.where(Post.platform == platform_filter)
            if search_query:
                search = f"%{search_query}%"
                filt = col(Post.topic).ilike(search) | col(Post.body).ilike(search) | col(Post.hashtags).ilike(search)
                query = query.where(filt)
                count_query = count_query.where(filt)

            total_count = session.exec(count_query).one()
            total_pages = max(1, math.ceil(total_count / ITEMS_PER_PAGE))
            resolved_page = min(page, total_pages)
            offset = (resolved_page - 1) * ITEMS_PER_PAGE
            posts = session.exec(query.offset(offset).limit(ITEMS_PER_PAGE)).all()

        return {
            "posts": posts,
            "total_count": total_count,
            "total_pages": total_pages,
            "page": resolved_page,
        }

    posts_data = _get_cached_view_data(
        "posts",
        f"{settings.DATABASE_SCHEMA}|{status_filter}|{platform_filter}|{search_query}|{page}",
        build_posts_data,
    )

    return _template(request, "posts.html", {
        "posts": posts_data["posts"],
        "filter": status,
        "platform_filter": platform,
        "search": q or "",
        "page": posts_data["page"],
        "total_pages": posts_data["total_pages"],
        "total_count": posts_data["total_count"],
    })


@app.get("/posts/{post_id}", response_class=HTMLResponse)
async def post_detail(request: Request, post_id: int):
    with Session(engine) as session:
        post = session.get(Post, post_id)
        if not post:
            raise HTTPException(404)
    pf = post.platform or "linkedin"
    max_chars = int(get_setting("ig_post_max_chars" if pf == "instagram" else "post_max_chars", "3000"))
    return _template(request, "post_detail.html", {"post": post, "max_chars": max_chars})


@app.post("/posts/{post_id}/update")
async def post_update(
    request: Request,
    post_id: int,
    topic: str = Form(""),
    body: str = Form(""),
    sources: str = Form(""),
    hashtags: str = Form(""),
    value_comment: str = Form(""),
    notes: str = Form(""),
    scheduled_for: str = Form(""),
    csrf_token: str = Form(""),
):
    if not _validate_csrf(request, _request_csrf_token(request, csrf_token)):
        return _redirect(f"/posts/{post_id}", "Invalid session. Please try again.", "error")
    with Session(engine) as session:
        post = session.get(Post, post_id)
        if not post:
            return _redirect("/posts", "Post not found.", "error")
        pf = post.platform or "linkedin"
        max_chars = int(get_setting("ig_post_max_chars" if pf == "instagram" else "post_max_chars", "3000"))
        post.topic = topic.strip()
        post.body = body[:max_chars]
        post.sources = sources.strip()
        post.hashtags = hashtags.strip()
        post.value_comment = value_comment[:500] if value_comment else None
        post.notes = notes.strip()
        if scheduled_for and scheduled_for.strip():
            try:
                post.scheduled_for = datetime.fromisoformat(scheduled_for.strip())
            except ValueError:
                pass
        post.updated_at = datetime.now(timezone.utc)
        session.add(post)
        session.commit()
    return _redirect(f"/posts/{post_id}", "Post saved.", "success")


@app.post("/posts/{post_id}/approve")
async def post_approve(request: Request, post_id: int, csrf_token: str = Form("")):
    if not _validate_csrf(request, _request_csrf_token(request, csrf_token)):
        return _redirect(f"/posts/{post_id}", "Invalid session. Please try again.", "error")
    with Session(engine) as session:
        post = session.get(Post, post_id)
        if not post:
            return _redirect("/posts", "Post not found.", "error")
        post.status = PostStatus.APPROVED
        post.updated_at = datetime.now(timezone.utc)
        session.add(post)
        session.commit()
    return _redirect(f"/posts/{post_id}", "Post approved!", "success")


@app.post("/posts/{post_id}/reject")
async def post_reject(request: Request, post_id: int, csrf_token: str = Form("")):
    if not _validate_csrf(request, _request_csrf_token(request, csrf_token)):
        return _redirect(f"/posts/{post_id}", "Invalid session. Please try again.", "error")
    with Session(engine) as session:
        post = session.get(Post, post_id)
        if not post:
            return _redirect("/posts", "Post not found.", "error")
        post.status = PostStatus.REJECTED
        post.updated_at = datetime.now(timezone.utc)
        session.add(post)
        session.commit()
    return _redirect(f"/posts/{post_id}", "Post rejected.", "info")


@app.post("/posts/{post_id}/publish-now")
async def post_publish_now(request: Request, post_id: int, csrf_token: str = Form("")):
    if not _validate_csrf(request, _request_csrf_token(request, csrf_token)):
        return _redirect(f"/posts/{post_id}", "Invalid session. Please try again.", "error")
    retry_after = _rate_limit_retry_after(request, "publish-now", limit=4, window_seconds=60)
    if retry_after is not None:
        return _redirect(f"/posts/{post_id}", f"Too many publish attempts. Please wait {retry_after}s.", "error")

    with Session(engine) as session:
        post = session.get(Post, post_id)
        if not post or post.status != PostStatus.APPROVED:
            return _redirect(f"/posts/{post_id}", "Only approved posts can be published.", "error")
        blocker = _publish_now_blocker(post.platform)
        if blocker:
            return _redirect(f"/posts/{post_id}", blocker, "error")
        post.status = PostStatus.SCHEDULED
        platform = post.platform
        session.add(post)
        session.commit()

    # Legacy publish via old tables (kept for backward compatibility)
    from app.services.scheduler_service import job_publish_linkedin, job_publish_instagram
    if platform == Platform.INSTAGRAM:
        await job_publish_instagram()
    else:
        await job_publish_linkedin()

    with Session(engine) as session:
        refreshed = session.get(Post, post_id)
        if refreshed and refreshed.status == PostStatus.PUBLISHED:
            return _redirect(f"/posts/{post_id}", "Post published successfully.", "success")
        if refreshed and refreshed.status == PostStatus.FAILED:
            return _redirect(
                f"/posts/{post_id}",
                refreshed.notes or "Publishing failed. Review the post details for more information.",
                "error",
            )

    return _redirect(f"/posts/{post_id}", "Publishing started.", "info")


@app.post("/posts/{post_id}/duplicate")
async def post_duplicate(request: Request, post_id: int, csrf_token: str = Form("")):
    """Duplicate a post as a new draft."""
    if not _validate_csrf(request, _request_csrf_token(request, csrf_token)):
        return _redirect(f"/posts/{post_id}", "Invalid session. Please try again.", "error")
    with Session(engine) as session:
        original = session.get(Post, post_id)
        if not original:
            return _redirect("/posts", "Post not found.", "error")
        clone = Post(
            platform=original.platform,
            topic=f"[Copy] {original.topic}",
            body=original.body,
            sources=original.sources,
            hashtags=original.hashtags,
            image_prompt=original.image_prompt,
            value_comment=original.value_comment,
            status=PostStatus.DRAFT,
        )
        session.add(clone)
        session.commit()
        session.refresh(clone)
        new_id = clone.id
    return _redirect(f"/posts/{new_id}", "Post duplicated.", "success")


@app.post("/posts/{post_id}/regenerate-image")
async def post_regenerate_image(request: Request, post_id: int, csrf_token: str = Form("")):
    """Regenerate the image for a post."""
    if not _validate_csrf(request, _request_csrf_token(request, csrf_token)):
        return _redirect(f"/posts/{post_id}", "Invalid session. Please try again.", "error")
    retry_after = _rate_limit_retry_after(request, "regenerate-image", limit=6, window_seconds=300)
    if retry_after is not None:
        return _redirect(f"/posts/{post_id}", f"Too many image regenerations. Please wait {retry_after}s.", "error")

    with Session(engine) as session:
        post = session.get(Post, post_id)
        if not post or not post.image_prompt:
            return _redirect(f"/posts/{post_id}", "No image prompt available.", "error")
        prompt = post.image_prompt
        platform = post.platform or "linkedin"

    try:
        image_path = await imagen_service.generate_image(prompt, post_id, platform=platform)
        with Session(engine) as session:
            post = session.get(Post, post_id)
            if not post:
                return _redirect("/posts", "Post not found.", "error")
            post.image_path = image_path
            post.updated_at = datetime.now(timezone.utc)
            session.add(post)
            session.commit()
        return _redirect(f"/posts/{post_id}", "Image regenerated.", "success")
    except Exception as e:
        logger.exception("Image regeneration failed")
        return _redirect(
            f"/posts/{post_id}",
            public_error_message(e, "Image generation failed. Please try again."),
            "error",
        )


@app.post("/posts/{post_id}/delete")
async def post_delete(request: Request, post_id: int, csrf_token: str = Form("")):
    """Delete a post (only drafts/rejected)."""
    if not _validate_csrf(request, _request_csrf_token(request, csrf_token)):
        return _redirect(f"/posts/{post_id}", "Invalid session. Please try again.", "error")
    with Session(engine) as session:
        post = session.get(Post, post_id)
        if not post:
            return _redirect("/posts", "Post not found.", "error")
        if post.status in (PostStatus.PUBLISHED, PostStatus.SCHEDULED):
            return _redirect(f"/posts/{post_id}", "Published posts cannot be deleted.", "error")
        session.delete(post)
        session.commit()
    return _redirect("/posts", "Post deleted.", "info")


# ── API: Text regeneration ───────────────────────────────────────────────

@app.post("/api/posts/{post_id}/regenerate-text")
async def api_regenerate_text(post_id: int, request: Request):
    """AJAX: Rewrite post text based on user instruction."""
    if not _validate_csrf(request, _request_csrf_token(request)):
        return _json_error("Invalid session. Please refresh the page and try again.", status_code=403)
    retry_after = _rate_limit_retry_after(request, "rewrite-text", limit=8, window_seconds=300)
    if retry_after is not None:
        return _json_error(f"Too many rewrite requests. Please wait {retry_after}s.", status_code=429, retry_after=retry_after)

    data = await request.json()
    instruction = data.get("instruction", "").strip()
    if not instruction:
        return _json_error("Please provide an instruction.", status_code=400)

    with Session(engine) as session:
        post = session.get(Post, post_id)
        if not post:
            return _json_error("Post not found.", status_code=404)
        body = post.body

    try:
        new_body = await gemini_service.regenerate_text(body, instruction)
        return JSONResponse({"body": new_body})
    except Exception as e:
        return _json_error(public_error_message(e, "Text rewrite failed. Please try again."), status_code=500)


# ── Generate ─────────────────────────────────────────────────────────────

@app.get("/generate", response_class=HTMLResponse)
async def generate_page(request: Request):
    def build_generate_data():
        with Session(engine) as session:
            return session.exec(
                select(TopicIdea).where(TopicIdea.used == False).order_by(col(TopicIdea.created_at))
            ).all()

    queued_topics = _get_cached_view_data("generate", settings.DATABASE_SCHEMA, build_generate_data)
    return _template(request, "generate.html", {"queued_topics": queued_topics})


@app.post("/generate")
async def generate_post(
    request: Request,
    topic: str = Form(""),
    platform: str = Form("linkedin"),
    csrf_token: str = Form(""),
):
    if not _validate_csrf(request, _request_csrf_token(request, csrf_token)):
        return _redirect("/generate", "Invalid session. Please try again.", "error")
    retry_after = _rate_limit_retry_after(request, "generate-post", limit=4, window_seconds=300)
    if retry_after is not None:
        return _redirect("/generate", f"Too many generation requests. Please wait {retry_after}s.", "error")

    if not settings.GOOGLE_API_KEY:
        return _redirect("/generate", "Google API Key is missing. Please add it to .env.", "error")
    if platform not in ("linkedin", "instagram"):
        platform = "linkedin"
    platform_enum = Platform.INSTAGRAM if platform == "instagram" else Platform.LINKEDIN

    if not topic.strip():
        topics = await gemini_service.suggest_topics(count=1)
        topic = topics[0] if topics else "Aktuelle Trends am deutschen Arbeitsmarkt"

    try:
        result = await gemini_service.generate_post(topic.strip(), platform=platform)
        value_comment = await gemini_service.generate_value_comment(result["body"])

        with Session(engine) as session:
            post = Post(
                platform=platform_enum,
                topic=topic.strip(),
                body=result["body"],
                sources=result["sources"],
                hashtags=result.get("hashtags", ""),
                image_prompt=result["image_prompt"],
                value_comment=value_comment,
                status=PostStatus.DRAFT,
            )
            session.add(post)
            session.commit()
            session.refresh(post)
            if post.id is None:
                raise RuntimeError("Failed to persist generated post before image creation.")

            image_path = await imagen_service.generate_image(
                result["image_prompt"], post.id, platform=platform,
            )
            post.image_path = image_path
            session.add(post)
            session.commit()
            post_id = post.id

        pname = "Instagram" if platform == "instagram" else "LinkedIn"
        return _redirect(f"/posts/{post_id}", f"{pname} post generated: {topic}", "success")

    except Exception as e:
        logger.exception("Generation failed")
        return _redirect("/generate", public_error_message(e, "Generation failed. Please try again."), "error")


# ── API: Topic suggestions ───────────────────────────────────────────────

@app.get("/api/topics/suggest")
async def api_suggest_topics(request: Request):
    """AJAX: Get AI-generated topic suggestions."""
    retry_after = _rate_limit_retry_after(request, "suggest-topics", limit=12, window_seconds=300)
    if retry_after is not None:
        return JSONResponse({"error": f"Too many topic requests. Please wait {retry_after}s.", "topics": []}, status_code=429)
    if not settings.GOOGLE_API_KEY:
        return JSONResponse({"topics": []})
    try:
        topics = await gemini_service.suggest_topics(count=5)
        return JSONResponse({"topics": topics})
    except Exception as e:
        return JSONResponse({"error": public_error_message(e, "Topic suggestion failed."), "topics": []}, status_code=500)


# ── Topic Queue ──────────────────────────────────────────────────────────

@app.get("/topics", response_class=HTMLResponse)
async def topics_page(request: Request):
    def build_topics_data():
        with Session(engine) as session:
            return session.exec(
                select(TopicIdea).order_by(desc(TopicIdea.created_at))
            ).all()

    topics = _get_cached_view_data("topics", settings.DATABASE_SCHEMA, build_topics_data)
    return _template(request, "topics.html", {"topics": topics})


@app.post("/topics/add")
async def topic_add(request: Request, topic: str = Form(""), csrf_token: str = Form("")):
    if not _validate_csrf(request, _request_csrf_token(request, csrf_token)):
        return _redirect("/topics", "Invalid session. Please try again.", "error")
    if not topic.strip():
        return _redirect("/topics", "Please enter a topic.", "error")
    with Session(engine) as session:
        session.add(TopicIdea(topic=topic.strip()))
        session.commit()
    return _redirect("/topics", "Topic added to queue.", "success")


@app.post("/topics/{topic_id}/delete")
async def topic_delete(request: Request, topic_id: int, csrf_token: str = Form("")):
    if not _validate_csrf(request, _request_csrf_token(request, csrf_token)):
        return _redirect("/topics", "Invalid session. Please try again.", "error")
    with Session(engine) as session:
        t = session.get(TopicIdea, topic_id)
        if t:
            session.delete(t)
            session.commit()
    return _redirect("/topics", "Topic removed.", "info")


# ── Images ───────────────────────────────────────────────────────────────

@app.get("/images/{post_id}")
async def serve_image(post_id: int):
    with Session(engine) as session:
        post = session.get(Post, post_id)
        if not post or not post.image_path:
            raise HTTPException(404)
        # Support both relative (new) and absolute (legacy) paths
        path = Path(post.image_path)
        if not path.is_absolute():
            path = DATA_DIR / path
        if not path.exists():
            raise HTTPException(404)
        suffix = path.suffix.lower()
        media_type = "image/jpeg" if suffix in (".jpg", ".jpeg") else "image/png"
        return FileResponse(path, media_type=media_type)


# ── LinkedIn OAuth ───────────────────────────────────────────────────────

@app.get("/auth/linkedin")
async def auth_linkedin():
    if not settings.LINKEDIN_CLIENT_ID or not settings.LINKEDIN_CLIENT_SECRET:
        return _redirect("/settings", "LinkedIn Client ID or Secret missing in .env.", "error")

    state = secrets.token_urlsafe(32)
    url = linkedin_service.get_authorization_url(state)
    response = RedirectResponse(url)
    response.set_cookie(
        "li_oauth_state",
        state,
        max_age=600,
        httponly=True,
        samesite="lax",
    )
    return response


@app.get("/auth/linkedin/callback")
async def auth_linkedin_callback(
    request: Request,
    code: str | None = None,
    state: str | None = None,
    error: str | None = None,
):
    saved_state = request.cookies.get("li_oauth_state")

    if error:
        response = _redirect("/settings", f"LinkedIn connection cancelled: {error}", "error")
        response.delete_cookie("li_oauth_state")
        return response

    if not code or not state or not saved_state or state != saved_state:
        response = _redirect("/settings", "Invalid or expired OAuth state. Please reconnect.", "error")
        response.delete_cookie("li_oauth_state")
        return response

    try:
        tokens = await linkedin_service.exchange_code_for_token(code)
        profile = await linkedin_service.get_user_profile(tokens["access_token"])

        with Session(engine) as session:
            account = session.exec(
                select(LinkedInAccount).where(LinkedInAccount.is_active == True)
            ).first()
            if not account:
                account = LinkedInAccount(name="Hauptaccount")

            account.access_token = tokens["access_token"]
            account.refresh_token = tokens.get("refresh_token")
            account.token_expires_at = datetime.now(timezone.utc) + timedelta(
                seconds=tokens["expires_in"]
            )
            account.linkedin_user_id = profile.get("sub", "")
            account.name = profile.get("name", account.name)
            session.add(account)
            session.commit()

        response = _redirect("/settings", f"LinkedIn connected: {account.name}", "success")
        response.delete_cookie("li_oauth_state")
        return response

    except Exception as e:
        logger.exception("OAuth callback failed")
        response = _redirect(
            "/settings",
            public_error_message(e, "LinkedIn connection failed. Check app credentials, permissions, and callback settings."),
            "error",
        )
        response.delete_cookie("li_oauth_state")
        return response


# ── Instagram OAuth ──────────────────────────────────────────────────────

@app.get("/auth/instagram")
async def auth_instagram():
    if not settings.INSTAGRAM_APP_ID or not settings.INSTAGRAM_APP_SECRET:
        return _redirect("/settings", "Instagram App ID or Secret missing in .env.", "error")
    state = secrets.token_urlsafe(32)
    url = instagram_service.get_authorization_url(state)
    response = RedirectResponse(url)
    response.set_cookie("ig_oauth_state", state, max_age=600, httponly=True, samesite="lax")
    return response


@app.get("/auth/instagram/callback")
async def auth_instagram_callback(
    request: Request,
    code: str | None = None,
    state: str | None = None,
    error: str | None = None,
):
    saved_state = request.cookies.get("ig_oauth_state")
    if error:
        response = _redirect("/settings", f"Instagram connection cancelled: {error}", "error")
        response.delete_cookie("ig_oauth_state")
        return response

    if not code or not state or not saved_state or state != saved_state:
        response = _redirect("/settings", "Invalid or expired Instagram OAuth state.", "error")
        response.delete_cookie("ig_oauth_state")
        return response

    try:
        short_lived = await instagram_service.exchange_code_for_token(code)
        long_lived = await instagram_service.exchange_for_long_lived_token(short_lived["access_token"])
        profile = await instagram_service.get_user_profile(long_lived["access_token"])

        with Session(engine) as session:
            account = session.exec(
                select(InstagramAccount).where(InstagramAccount.is_active == True)
            ).first()
            if not account:
                account = InstagramAccount()

            account.access_token = long_lived["access_token"]
            account.token_expires_at = datetime.now(timezone.utc) + timedelta(
                seconds=long_lived.get("expires_in", 5183944)
            )
            account.ig_user_id = str(profile.get("user_id", short_lived.get("user_id", "")))
            account.username = profile.get("username", "")
            session.add(account)
            session.commit()

        response = _redirect("/settings", f"Instagram connected: @{account.username}", "success")
        response.delete_cookie("ig_oauth_state")
        return response

    except Exception as e:
        logger.exception("Instagram OAuth callback failed")
        response = _redirect(
            "/settings",
            public_error_message(e, "Instagram connection failed. Check app credentials, permissions, and callback settings."),
            "error",
        )
        response.delete_cookie("ig_oauth_state")
        return response


# ── Settings ─────────────────────────────────────────────────────────────

SETTING_KEYS = [
    "posting_days", "posting_hour", "posting_minute",
    "gemini_model", "imagen_model", "post_max_chars",
    "value_comment_delay_min", "auto_generate_drafts",
    "max_pending_drafts", "default_hashtags",
    "language", "tone", "target_audience", "core_topics",
    "ig_posting_days", "ig_posting_hour", "ig_posting_minute",
    "ig_auto_generate_drafts", "ig_max_pending_drafts",
    "ig_default_hashtags", "ig_post_max_chars",
    "ig_media_type", "ig_image_style", "ig_hashtag_placement",
]


@app.get("/settings", response_class=HTMLResponse)
async def settings_page(request: Request):
    def build_settings_data():
        with Session(engine) as session:
            li_account = session.exec(select(LinkedInAccount).where(LinkedInAccount.is_active == True)).first()
            ig_account = session.exec(select(InstagramAccount).where(InstagramAccount.is_active == True)).first()
        return {
            "li_account": li_account,
            "ig_account": ig_account,
            "current": get_settings(SETTING_KEYS),
        }

    settings_data = _get_cached_view_data("settings", settings.DATABASE_SCHEMA, build_settings_data)
    li_account = settings_data["li_account"]
    ig_account = settings_data["ig_account"]
    current: dict[str, object] = dict(settings_data["current"])

    # Convert cron day numbers to names for template
    for raw_key, display_key in [("posting_days", "posting_days_display"), ("ig_posting_days", "ig_posting_days_display")]:
        raw = current.get(raw_key, "1,3")
        raw_value = str(raw)
        current[display_key] = [CRON_TO_DAY_NAME.get(d.strip(), d.strip()) for d in raw_value.split(",") if d.strip()]

    for h_key, m_key, t_key in [
        ("posting_hour", "posting_minute", "posting_time"),
        ("ig_posting_hour", "ig_posting_minute", "ig_posting_time"),
    ]:
        hour = int(str(current.get(h_key, "9") or "9"))
        minute = int(str(current.get(m_key, "0") or "0"))
        current[t_key] = f"{hour:02d}:{minute:02d}"

    readiness_items, readiness_score = _build_readiness_items(
        _account_health(li_account)[0],
        _account_health(ig_account)[0],
        _account_health(li_account)[1],
        _account_health(ig_account)[1],
    )

    return _template(request, "settings.html", {
        "li_account": li_account,
        "ig_account": ig_account,
        "s": current,
        "google_api_ok": bool(settings.GOOGLE_API_KEY),
        "linkedin_ok": bool(settings.LINKEDIN_CLIENT_ID),
        "instagram_ok": bool(settings.INSTAGRAM_APP_ID),
        "now": datetime.now(timezone.utc),
        "readiness_items": readiness_items,
        "readiness_score": readiness_score,
        "media_public_base_url": settings.MEDIA_PUBLIC_BASE_URL,
    })


@app.post("/settings/save")
async def settings_save(request: Request):
    form = await request.form()
    csrf = form.get("csrf_token", "")
    if not _validate_csrf(request, _request_csrf_token(request, str(csrf))):
        return _redirect("/settings", "Invalid session. Please try again.", "error")
    retry_after = _rate_limit_retry_after(request, "settings-save", limit=10, window_seconds=120)
    if retry_after is not None:
        return _redirect("/settings", f"Too many save attempts. Please wait {retry_after}s.", "error")

    # Process posting_days for both platforms
    for days_field in ["posting_days", "ig_posting_days"]:
        raw_value = form.get(days_field, "")
        raw = str(raw_value) if raw_value else ""
        if raw:
            day_nums = []
            for name in raw.split(","):
                name = name.strip()
                if name in DAY_NAME_TO_CRON:
                    day_nums.append(DAY_NAME_TO_CRON[name])
                elif name.isdigit():
                    day_nums.append(name)
            if day_nums:
                set_setting(days_field, ",".join(day_nums))

    # Process posting_time for both platforms
    for time_field, h_key, m_key in [
        ("posting_time", "posting_hour", "posting_minute"),
        ("ig_posting_time", "ig_posting_hour", "ig_posting_minute"),
    ]:
        time_raw = form.get(time_field, "")
        time_val = str(time_raw) if time_raw else ""
        if time_val and ":" in time_val:
            parts = time_val.split(":")
            set_setting(h_key, str(int(parts[0])))
            set_setting(m_key, str(int(parts[1])))

    direct_keys = [
        "gemini_model", "imagen_model", "post_max_chars",
        "value_comment_delay_min", "max_pending_drafts", "default_hashtags",
        "language", "tone", "target_audience", "core_topics",
        "ig_max_pending_drafts", "ig_default_hashtags", "ig_post_max_chars",
        "ig_media_type", "ig_image_style", "ig_hashtag_placement",
    ]
    for key in direct_keys:
        if key in form:
            val = str(form[key]).strip()
            if val:
                set_setting(key, val)

    set_setting("auto_generate_drafts", "true" if "auto_generate_drafts" in form else "false")
    set_setting("ig_auto_generate_drafts", "true" if "ig_auto_generate_drafts" in form else "false")

    try:
        reschedule("all")
    except Exception as e:
        logger.warning("Reschedule failed: %s", e)

    _db_log("INFO", "settings", "Settings updated")
    return _redirect("/settings", "Settings saved.", "success")


@app.post("/settings/account")
async def create_account(request: Request, name: str = Form(""), csrf_token: str = Form("")):
    if not _validate_csrf(request, _request_csrf_token(request, csrf_token)):
        return _redirect("/settings", "Invalid session. Please try again.", "error")
    if not name.strip():
        return _redirect("/settings", "Please enter an account name.", "error")
    with Session(engine) as session:
        account = LinkedInAccount(name=name.strip())
        session.add(account)
        session.commit()
    return _redirect("/settings", f"Account '{name}' created.", "success")


@app.post("/settings/account/disconnect")
async def disconnect_li_account(request: Request, csrf_token: str = Form("")):
    if not _validate_csrf(request, _request_csrf_token(request, csrf_token)):
        return _redirect("/settings", "Invalid session. Please try again.", "error")
    with Session(engine) as session:
        account = session.exec(select(LinkedInAccount).where(LinkedInAccount.is_active == True)).first()
        if account:
            account.access_token = None
            account.refresh_token = None
            account.token_expires_at = None
            session.add(account)
            session.commit()
            _db_log("INFO", "linkedin", f"Account '{account.name}' disconnected")
    return _redirect("/settings", "LinkedIn account disconnected.", "info")


@app.post("/settings/ig-account/disconnect")
async def disconnect_ig_account(request: Request, csrf_token: str = Form("")):
    if not _validate_csrf(request, _request_csrf_token(request, csrf_token)):
        return _redirect("/settings", "Invalid session. Please try again.", "error")
    with Session(engine) as session:
        account = session.exec(select(InstagramAccount).where(InstagramAccount.is_active == True)).first()
        if account:
            account.access_token = None
            account.token_expires_at = None
            session.add(account)
            session.commit()
            _db_log("INFO", "instagram", f"Account '@{account.username}' disconnected")
    return _redirect("/settings", "Instagram account disconnected.", "info")


# ── Theme toggle ─────────────────────────────────────────────────────────

@app.post("/api/theme")
async def toggle_theme(request: Request):
    """Toggle between light and dark theme."""
    if not _validate_csrf(request, _request_csrf_token(request)):
        return _json_error("Invalid session. Please refresh the page and try again.", status_code=403)
    data = await request.json()
    theme = data.get("theme", "light")
    if theme not in ("light", "dark"):
        theme = "light"
    resp = JSONResponse({"theme": theme})
    resp.set_cookie("theme", theme, max_age=86400 * 365, samesite="lax")
    return resp


# ── Bulk Operations ──────────────────────────────────────────────────────

@app.post("/api/posts/bulk")
async def bulk_post_action(request: Request):
    """Bulk approve, reject, or delete posts."""
    if not _validate_csrf(request, _request_csrf_token(request)):
        return _json_error("Invalid session. Please refresh the page and try again.", status_code=403)
    retry_after = _rate_limit_retry_after(request, "bulk-post-action", limit=6, window_seconds=120)
    if retry_after is not None:
        return _json_error(f"Too many bulk actions. Please wait {retry_after}s.", status_code=429, retry_after=retry_after)

    data = await request.json()
    action = data.get("action", "")
    post_ids = data.get("ids", [])

    if not post_ids or not isinstance(post_ids, list):
        return JSONResponse({"error": "No posts selected."}, status_code=400)
    if action not in ("approve", "reject", "delete"):
        return JSONResponse({"error": "Invalid action."}, status_code=400)

    count = 0
    with Session(engine) as session:
        for pid in post_ids:
            post = session.get(Post, int(pid))
            if not post:
                continue
            if action == "approve" and post.status in (PostStatus.DRAFT, PostStatus.REJECTED):
                post.status = PostStatus.APPROVED
                post.updated_at = datetime.now(timezone.utc)
                session.add(post)
                count += 1
            elif action == "reject" and post.status in (PostStatus.DRAFT, PostStatus.APPROVED):
                post.status = PostStatus.REJECTED
                post.updated_at = datetime.now(timezone.utc)
                session.add(post)
                count += 1
            elif action == "delete" and post.status not in (PostStatus.PUBLISHED, PostStatus.SCHEDULED):
                session.delete(post)
                count += 1
        session.commit()

    _db_log("INFO", "bulk", f"Bulk {action}: {count} posts affected")
    return JSONResponse({"success": True, "count": count})


# ── Export ───────────────────────────────────────────────────────────────

@app.get("/api/posts/export")
async def export_posts(format: str = Query("json")):
    """Export all posts as JSON or CSV."""
    with Session(engine) as session:
        posts = session.exec(select(Post).order_by(desc(Post.created_at))).all()

    if format == "csv":
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow([
            "id", "platform", "topic", "body", "hashtags", "sources",
            "status", "created_at", "published_at", "platform_post_id",
        ])
        for p in posts:
            writer.writerow([
                p.id, p.platform, p.topic, p.body, p.hashtags, p.sources,
                p.status.value, p.created_at.isoformat(),
                p.published_at.isoformat() if p.published_at else "",
                p.platform_post_id or "",
            ])
        output.seek(0)
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=posts_export.csv"},
        )
    else:
        data = [
            {
                "id": p.id, "platform": p.platform, "topic": p.topic,
                "body": p.body, "hashtags": p.hashtags, "sources": p.sources,
                "status": p.status.value,
                "created_at": p.created_at.isoformat(),
                "published_at": p.published_at.isoformat() if p.published_at else None,
                "platform_post_id": p.platform_post_id,
                "value_comment": p.value_comment,
            }
            for p in posts
        ]
        return JSONResponse(data)


# ── Health Check ─────────────────────────────────────────────────────────

@app.get("/api/health")
async def health_check():
    """Health/status endpoint for monitoring."""
    status: dict[str, object] = {"status": "ok", "timestamp": datetime.now(timezone.utc).isoformat()}
    try:
        with Session(engine) as session:
            session.exec(select(func.count(col(Post.id)))).one()
        status["database"] = "ok"
    except Exception:
        status["database"] = "error"
        status["status"] = "degraded"

    status["google_api"] = "configured" if settings.GOOGLE_API_KEY else "missing"
    status["linkedin_api"] = "configured" if settings.LINKEDIN_CLIENT_ID else "missing"
    status["instagram_api"] = "configured" if settings.INSTAGRAM_APP_ID else "missing"
    status["app_env"] = settings.APP_ENV
    status["database_target"] = "supabase" if settings.USES_SUPABASE_DATABASE else "external"
    status["database_schema"] = settings.DATABASE_SCHEMA
    status["database_table_prefix"] = settings.DATABASE_TABLE_PREFIX
    status["supabase_project"] = "configured" if settings.SUPABASE_URL else "missing"
    status["supabase_schema"] = settings.SUPABASE_SCHEMA
    status["supabase_public_api"] = await supabase_service.check_public_api()

    with Session(engine) as session:
        li_account = session.exec(select(LinkedInAccount).where(LinkedInAccount.is_active == True)).first()
        if li_account and li_account.access_token:
            if li_account.token_expires_at and li_account.token_expires_at > datetime.now(timezone.utc):
                status["linkedin_token"] = "valid"
                status["linkedin_token_days_left"] = (li_account.token_expires_at - datetime.now(timezone.utc)).days
            else:
                status["linkedin_token"] = "expired"
        else:
            status["linkedin_token"] = "none"

        ig_account = session.exec(select(InstagramAccount).where(InstagramAccount.is_active == True)).first()
        if ig_account and ig_account.access_token:
            if ig_account.token_expires_at and ig_account.token_expires_at > datetime.now(timezone.utc):
                status["instagram_token"] = "valid"
                status["instagram_token_days_left"] = (ig_account.token_expires_at - datetime.now(timezone.utc)).days
            else:
                status["instagram_token"] = "expired"
        else:
            status["instagram_token"] = "none"

    li_next = get_next_run("linkedin")
    ig_next = get_next_run("instagram")
    status["next_linkedin_publish"] = li_next.isoformat() if li_next else None
    status["next_instagram_publish"] = ig_next.isoformat() if ig_next else None

    return JSONResponse(status)


# ── Logs ─────────────────────────────────────────────────────────────────

@app.get("/logs", response_class=HTMLResponse)
async def logs_page(request: Request, level: str | None = None):
    level_filter = (level or "").upper()

    def build_logs_data():
        with Session(engine) as session:
            query = select(AppLog).order_by(desc(AppLog.timestamp)).limit(200)
            if level_filter:
                query = query.where(AppLog.level == level_filter)
            return session.exec(query).all()

    logs = _get_cached_view_data("logs", f"{settings.DATABASE_SCHEMA}|{level_filter}", build_logs_data)
    return _template(request, "logs.html", {"logs": logs, "level_filter": level})


# ══════════════════════════════════════════════════════════════════════════
# PROJECT-BASED ROUTES (Momentum Integration)
# These routes read companies/campaigns from the shared Supabase database
# and provide project-scoped views within the Social Hub microservice.
# ══════════════════════════════════════════════════════════════════════════

def _get_project(company_id: str) -> MomentumCompany | None:
    """Load a project (company) from the shared database."""
    with Session(engine) as session:
        return session.exec(
            select(MomentumCompany).where(MomentumCompany.id == company_id)
        ).first()


def _get_or_create_project_settings(session: Session, company_id: str) -> SocialHubSettings:
    """Get or create default Social Hub settings for a project."""
    row = session.exec(
        select(SocialHubSettings).where(SocialHubSettings.company_id == company_id)
    ).first()
    if not row:
        row = SocialHubSettings(company_id=company_id)
        session.add(row)
        session.commit()
        session.refresh(row)
    return row


@app.get("/projects", response_class=HTMLResponse)
async def projects_list(request: Request):
    """List all available projects (companies) from the shared database."""
    with Session(engine) as session:
        companies = session.exec(select(MomentumCompany)).all()

        company_stats = {}
        for c in companies:
            post_count = session.exec(
                select(func.count(col(MomentumScheduledPost.id)))
                .where(MomentumScheduledPost.company_id == c.id)
            ).one()
            account_count = session.exec(
                select(func.count(col(MomentumConnectedAccount.id)))
                .where(MomentumConnectedAccount.company_id == c.id)
                .where(MomentumConnectedAccount.is_active == True)  # noqa: E712
            ).one()
            company_stats[c.id] = {"posts": post_count, "accounts": account_count}

    return _template(request, "projects.html", {
        "companies": companies,
        "company_stats": company_stats,
    })


@app.get("/project/{company_id}", response_class=HTMLResponse)
async def project_dashboard(request: Request, company_id: str):
    """Project-scoped dashboard showing posts, accounts, and stats."""
    company = _get_project(company_id)
    if not company:
        raise HTTPException(404, "Project not found")

    with Session(engine) as session:
        posts = session.exec(
            select(MomentumScheduledPost)
            .where(MomentumScheduledPost.company_id == company_id)
            .order_by(col(MomentumScheduledPost.created_at).desc())
            .limit(20)
        ).all()

        accounts = session.exec(
            select(MomentumConnectedAccount)
            .where(MomentumConnectedAccount.company_id == company_id)
            .where(MomentumConnectedAccount.is_active == True)  # noqa: E712
        ).all()

        sh_settings = _get_or_create_project_settings(session, company_id)

        total_posts = session.exec(
            select(func.count(col(MomentumScheduledPost.id)))
            .where(MomentumScheduledPost.company_id == company_id)
        ).one()
        published_posts = session.exec(
            select(func.count(col(MomentumScheduledPost.id)))
            .where(MomentumScheduledPost.company_id == company_id)
            .where(MomentumScheduledPost.status == "published")
        ).one()
        draft_posts = session.exec(
            select(func.count(col(MomentumScheduledPost.id)))
            .where(MomentumScheduledPost.company_id == company_id)
            .where(MomentumScheduledPost.status == "draft")
        ).one()

    return _template(request, "project_dashboard.html", {
        "project_id": company_id,
        "project_name": company.name,
        "company": company,
        "posts": posts,
        "accounts": accounts,
        "sh_settings": sh_settings,
        "total_posts": total_posts,
        "published_posts": published_posts,
        "draft_posts": draft_posts,
    })


@app.get("/project/{company_id}/posts", response_class=HTMLResponse)
async def project_posts(request: Request, company_id: str, status: str = "", campaign_id: str = ""):
    """Project-scoped posts list."""
    company = _get_project(company_id)
    if not company:
        raise HTTPException(404, "Project not found")

    with Session(engine) as session:
        query = (
            select(MomentumScheduledPost)
            .where(MomentumScheduledPost.company_id == company_id)
            .order_by(col(MomentumScheduledPost.created_at).desc())
            .limit(100)
        )
        if status:
            query = query.where(MomentumScheduledPost.status == status)
        if campaign_id:
            query = query.where(MomentumScheduledPost.campaign_id == campaign_id)
        posts = session.exec(query).all()

    return _template(request, "project_posts.html", {
        "project_id": company_id,
        "project_name": company.name,
        "posts": posts,
        "status_filter": status,
        "campaign_filter": campaign_id,
    })


@app.get("/project/{company_id}/generate", response_class=HTMLResponse)
async def project_generate(request: Request, company_id: str):
    """Project-scoped AI post generation page."""
    company = _get_project(company_id)
    if not company:
        raise HTTPException(404, "Project not found")

    with Session(engine) as session:
        accounts = session.exec(
            select(MomentumConnectedAccount)
            .where(MomentumConnectedAccount.company_id == company_id)
            .where(MomentumConnectedAccount.is_active == True)  # noqa: E712
        ).all()

        sh_settings = _get_or_create_project_settings(session, company_id)

        # Load campaigns for this project from the shared table
        from sqlalchemy import text as sa_text
        schema = settings.DATABASE_SCHEMA
        campaigns = session.exec(
            sa_text(f'SELECT id, name, status FROM "{schema}".campaigns WHERE company_id = :cid ORDER BY name'),
            params={"cid": company_id},
        ).all()

    return _template(request, "project_generate.html", {
        "project_id": company_id,
        "project_name": company.name,
        "accounts": accounts,
        "sh_settings": sh_settings,
        "campaigns": campaigns,
    })


@app.post("/project/{company_id}/generate", response_class=HTMLResponse)
async def project_generate_post(request: Request, company_id: str):
    """Generate an AI post for a project."""
    company = _get_project(company_id)
    if not company:
        raise HTTPException(404, "Project not found")

    form = await request.form()
    csrf = form.get("csrf_token", "")
    if not _validate_csrf(request, _request_csrf_token(request, str(csrf))):
        return _redirect(f"/project/{company_id}/generate", "Invalid session.", "error")

    topic = str(form.get("topic", "")).strip()
    platform = str(form.get("platform", "linkedin")).strip()
    campaign_id = str(form.get("campaign_id", "")).strip() or None

    if not topic:
        return _redirect(f"/project/{company_id}/generate", "Topic is required.", "error")

    with Session(engine) as session:
        sh_settings = _get_or_create_project_settings(session, company_id)

    # Build generation prompt with project settings
    tone = sh_settings.ai_tone or "professional"
    persona = sh_settings.ai_persona or ""
    lang = sh_settings.ai_language or "de"
    pillars = sh_settings.content_pillars or []

    system_prompt = (
        f"You are a social media content creator for '{company.name}'.\n"
        f"Industry: {company.industry or 'general'}.\n"
        f"Platform: {platform}.\n"
        f"Tone: {tone}.\n"
        f"Language: {'German' if lang == 'de' else 'English'}.\n"
    )
    if persona:
        system_prompt += f"Persona: {persona}.\n"
    if pillars:
        system_prompt += f"Content pillars: {', '.join(pillars)}.\n"

    system_prompt += (
        "\nGenerate a single social media post about the given topic. "
        "Return ONLY the post text, including hashtags if appropriate. "
        "Do NOT include explanations or meta-text."
    )

    try:
        from app.services.gemini_service import GeminiService
        gemini = GeminiService()
        generated_text = await gemini.generate_post_text(
            topic=topic,
            platform=platform,
            tone=tone,
            language=lang,
            company_context=system_prompt,
        )
    except Exception as exc:
        _db_log("ERROR", "project-generate", f"AI generation failed: {exc}")
        return _redirect(f"/project/{company_id}/generate", f"Generation failed: {exc}", "error")

    # Save as scheduled post in the shared table
    with Session(engine) as session:
        post = MomentumScheduledPost(
            company_id=company_id,
            content=generated_text,
            platform=platform,
            status="draft",
            campaign_id=campaign_id,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
        session.add(post)
        session.commit()
        session.refresh(post)

    _db_log("INFO", "project-generate", f"Post generated for project {company_id}: {post.id}")
    return _redirect(f"/project/{company_id}/posts", "Post generated successfully!", "success")


@app.get("/project/{company_id}/campaigns", response_class=HTMLResponse)
async def project_campaigns(request: Request, company_id: str):
    """Project-scoped campaigns view from shared Momentum campaigns table."""
    company = _get_project(company_id)
    if not company:
        raise HTTPException(404, "Project not found")

    from sqlalchemy import text as sa_text
    schema = settings.DATABASE_SCHEMA
    with Session(engine) as session:
        campaigns = session.exec(
            sa_text(
                f'SELECT c.id, c.name, c.status, c.description, '
                f'(SELECT count(*) FROM "{schema}".scheduled_posts sp WHERE sp.campaign_id = c.id) as post_count '
                f'FROM "{schema}".campaigns c WHERE c.company_id = :cid ORDER BY c.name'
            ),
            params={"cid": company_id},
        ).all()

    return _template(request, "project_campaigns.html", {
        "project_id": company_id,
        "project_name": company.name,
        "campaigns": campaigns,
    })


@app.get("/project/{company_id}/analytics", response_class=HTMLResponse)
async def project_analytics(request: Request, company_id: str):
    """Project-scoped social analytics dashboard."""
    company = _get_project(company_id)
    if not company:
        raise HTTPException(404, "Project not found")

    with Session(engine) as session:
        posts = session.exec(
            select(MomentumScheduledPost)
            .where(MomentumScheduledPost.company_id == company_id)
        ).all()

        total = len(posts)
        published = sum(1 for p in posts if p.status == "published")
        drafts = sum(1 for p in posts if p.status == "draft")
        approved = sum(1 for p in posts if p.status == "approved")
        failed = sum(1 for p in posts if p.status == "failed")

        platform_stats: dict[str, dict] = {}
        for p in posts:
            plat = p.platform or "unknown"
            if plat not in platform_stats:
                platform_stats[plat] = {"total": 0, "published": 0}
            platform_stats[plat]["total"] += 1
            if p.status == "published":
                platform_stats[plat]["published"] += 1

        published_ids = [p.id for p in posts if p.status == "published"]
        engagement = {"impressions": 0, "clicks": 0, "likes": 0, "comments": 0, "shares": 0, "reach": 0}
        if published_ids:
            metrics = session.exec(
                select(MomentumEngagementMetric)
                .where(col(MomentumEngagementMetric.scheduled_post_id).in_(published_ids))
            ).all()
            for m in metrics:
                engagement["impressions"] += m.impressions
                engagement["clicks"] += m.clicks
                engagement["likes"] += m.likes
                engagement["comments"] += m.comments
                engagement["shares"] += m.shares
                engagement["reach"] += m.reach

        accounts = session.exec(
            select(MomentumConnectedAccount)
            .where(MomentumConnectedAccount.company_id == company_id)
            .where(MomentumConnectedAccount.is_active == True)  # noqa: E712
        ).all()

    return _template(request, "project_analytics.html", {
        "project_id": company_id,
        "project_name": company.name,
        "total": total,
        "published": published,
        "drafts": drafts,
        "approved": approved,
        "failed": failed,
        "platform_stats": platform_stats,
        "engagement": engagement,
        "accounts": accounts,
    })


@app.get("/project/{company_id}/settings", response_class=HTMLResponse)
async def project_settings_page(request: Request, company_id: str):
    """Project-scoped Social Hub settings page."""
    company = _get_project(company_id)
    if not company:
        raise HTTPException(404, "Project not found")

    with Session(engine) as session:
        sh_settings = _get_or_create_project_settings(session, company_id)
        accounts = session.exec(
            select(MomentumConnectedAccount)
            .where(MomentumConnectedAccount.company_id == company_id)
            .where(MomentumConnectedAccount.is_active == True)  # noqa: E712
        ).all()

    return _template(request, "project_settings.html", {
        "project_id": company_id,
        "project_name": company.name,
        "sh_settings": sh_settings,
        "accounts": accounts,
    })


@app.post("/project/{company_id}/settings/save")
async def project_settings_save(request: Request, company_id: str):
    """Save project-scoped Social Hub settings."""
    form = await request.form()
    csrf = form.get("csrf_token", "")
    if not _validate_csrf(request, _request_csrf_token(request, str(csrf))):
        return _redirect(f"/project/{company_id}/settings", "Invalid session.", "error")

    company = _get_project(company_id)
    if not company:
        raise HTTPException(404, "Project not found")

    with Session(engine) as session:
        sh_settings = _get_or_create_project_settings(session, company_id)

        sh_settings.publishing_cadence = str(form.get("publishing_cadence", sh_settings.publishing_cadence))
        sh_settings.default_platform = str(form.get("default_platform", sh_settings.default_platform))
        sh_settings.ai_language = str(form.get("ai_language", sh_settings.ai_language))
        sh_settings.ai_tone = str(form.get("ai_tone", ""))
        sh_settings.ai_persona = str(form.get("ai_persona", ""))
        sh_settings.hashtag_strategy = str(form.get("hashtag_strategy", sh_settings.hashtag_strategy))
        sh_settings.timezone = str(form.get("timezone", sh_settings.timezone))
        sh_settings.auto_approve = "auto_approve" in form
        sh_settings.value_comments_enabled = "value_comments_enabled" in form
        sh_settings.image_generation_enabled = "image_generation_enabled" in form

        pillars_raw = str(form.get("content_pillars", ""))
        sh_settings.content_pillars = [p.strip() for p in pillars_raw.split(",") if p.strip()] if pillars_raw.strip() else []

        days_raw = str(form.get("preferred_days", ""))
        sh_settings.preferred_days = [d.strip() for d in days_raw.split(",") if d.strip()] if days_raw.strip() else []

        times_raw = str(form.get("preferred_times", ""))
        sh_settings.preferred_times = [t.strip() for t in times_raw.split(",") if t.strip()] if times_raw.strip() else []

        sh_settings.updated_at = datetime.now(timezone.utc)
        session.add(sh_settings)
        session.commit()

    _db_log("INFO", "project-settings", f"Settings updated for project {company_id}")
    return _redirect(f"/project/{company_id}/settings", "Project settings saved.", "success")
