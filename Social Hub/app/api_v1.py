# Social Hub — REST API v1 (Momentum Integration)
"""
JSON API endpoints that the Momentum App calls to trigger Social Hub actions.
All endpoints are company-scoped (project-scoped) and require authentication.

Endpoints:
  POST /api/v1/generate              — Generate AI post (text + image)
  POST /api/v1/generate-from-task    — Generate post from Momentum task context
  POST /api/v1/generate-from-campaign — Generate post from campaign context
  POST /api/v1/publish/{id}          — Publish an approved post immediately
  GET  /api/v1/readiness/{cid}       — Company readiness score
  POST /api/v1/topics/suggest        — AI topic suggestions
  POST /api/v1/regenerate-text/{id}  — AI rewrite post text
  POST /api/v1/regenerate-image/{id} — Regenerate post image
  GET  /api/v1/posts/{cid}           — List scheduled posts for company
  GET  /api/v1/posts/{cid}/{pid}     — Single post detail (full)
  PUT  /api/v1/posts/{pid}/approve   — Approve a draft post
  PUT  /api/v1/posts/{pid}/reject    — Reject a post
  GET  /api/v1/accounts/{cid}        — Connected accounts health status
  GET  /api/v1/settings/{cid}        — Project Social Hub settings
  PUT  /api/v1/settings/{cid}        — Update project Social Hub settings
  GET  /api/v1/analytics/{cid}       — Project social analytics summary
  GET  /api/v1/health                — System health check
"""
import asyncio
import logging
import time
from collections import defaultdict, deque
from datetime import datetime, timezone, timedelta
from threading import Lock
from uuid import UUID, uuid4

from fastapi import APIRouter, Request, HTTPException, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field as PydanticField
from sqlmodel import Session, select, col, func

from app.config import settings, DATA_DIR
from app.database import (
    engine, TopicIdea, AppLog, DynamicSetting,
    get_setting, get_settings, set_setting,
)
from app.momentum_models import (
    MomentumScheduledPost, MomentumConnectedAccount,
    MomentumEngagementMetric, MomentumContent, MomentumCompany,
    SocialHubSettings, SocialAnalyticsSnapshot,
    _momentum_schema,
)
from app.auth import get_auth_context, AuthContext
from app.services import gemini_service, imagen_service, linkedin_service, instagram_service
from app.services.resilience import public_error_message
from app.services.token_encryption import decrypt_token

logger = logging.getLogger("api_v1")

router = APIRouter(prefix="/api/v1", tags=["v1"])

# ── Rate Limiting ────────────────────────────────────────────────────────

_RATE_BUCKETS: dict[str, deque[float]] = defaultdict(deque)
_RATE_LOCK = Lock()


def _api_client_id(request: Request) -> str:
    """Identify the API caller for rate limiting."""
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        # Use a hash of the token to avoid storing it in memory
        import hashlib
        return hashlib.sha256(auth_header[7:50].encode()).hexdigest()[:16]
    if request.client and request.client.host:
        return request.client.host
    return "anonymous"


def _check_rate_limit(request: Request, scope: str, limit: int, window: int = 60) -> None:
    """Raise 429 if the caller exceeds the rate limit."""
    key = f"api:{scope}:{_api_client_id(request)}"
    now = time.monotonic()
    with _RATE_LOCK:
        bucket = _RATE_BUCKETS[key]
        while bucket and now - bucket[0] >= window:
            bucket.popleft()
        if len(bucket) >= limit:
            retry_after = max(1, int(window - (now - bucket[0])))
            raise HTTPException(
                status_code=429,
                detail=f"Rate limit exceeded. Try again in {retry_after}s.",
                headers={"Retry-After": str(retry_after)},
            )
        bucket.append(now)


def _to_uuid(value: str) -> UUID:
    """Convert a string to UUID, raising HTTPException on invalid format."""
    try:
        return UUID(value)
    except (ValueError, AttributeError):
        raise HTTPException(400, detail=f"Invalid UUID format: {value}")


# ── Request / Response Models ────────────────────────────────────────────

class GenerateRequest(BaseModel):
    company_id: str
    platform: str = "linkedin"
    topic: str = ""
    content_item_id: str | None = None
    connected_account_id: str | None = None

class GenerateResponse(BaseModel):
    post_id: str
    topic: str
    platform: str
    status: str
    message: str

class PublishResponse(BaseModel):
    post_id: str
    status: str
    platform_post_id: str | None = None
    message: str

class TopicSuggestRequest(BaseModel):
    company_id: str
    count: int = 5

class TopicSuggestResponse(BaseModel):
    topics: list[str]

class RegenerateTextRequest(BaseModel):
    instruction: str

class ReadinessItem(BaseModel):
    label: str
    state: str  # ready | warn | issue
    detail: str

class ReadinessResponse(BaseModel):
    score: int
    items: list[ReadinessItem]

class ErrorResponse(BaseModel):
    error: str
    detail: str = ""


class SettingsUpdateRequest(BaseModel):
    """Partial update for project Social Hub settings."""
    publishing_cadence: str | None = None
    preferred_days: list[str] | None = None
    preferred_times: list[str] | None = None
    timezone: str | None = None
    ai_language: str | None = None
    ai_tone: str | None = None
    ai_persona: str | None = None
    content_pillars: list[str] | None = None
    auto_approve: bool | None = None
    require_approval_from: list[str] | None = None
    default_platform: str | None = None
    value_comments_enabled: bool | None = None
    image_generation_enabled: bool | None = None
    hashtag_strategy: str | None = None


class GenerateFromCampaignRequest(BaseModel):
    """Generate a social post from campaign context."""
    company_id: str
    campaign_id: str
    platform: str = "linkedin"
    language: str = "de"
    focus_angle: str = ""  # optional creative direction


# ── Helpers ──────────────────────────────────────────────────────────────

def _db_log_api(level: str, source: str, message: str):
    """Thin wrapper for DB logging from API context."""
    try:
        with Session(engine) as session:
            session.add(AppLog(level=level, source=f"api:{source}", message=message))
            session.commit()
    except Exception:
        logger.warning("Could not write API log: %s", message)


def _get_account_for_platform(
    session: Session, company_id: str, platform: str, account_id: str | None = None
) -> MomentumConnectedAccount | None:
    """Find the best connected account for a platform."""
    query = (
        select(MomentumConnectedAccount)
        .where(
            MomentumConnectedAccount.company_id == company_id,
            MomentumConnectedAccount.platform == platform,
            MomentumConnectedAccount.is_active == True,  # noqa: E712
        )
    )
    if account_id:
        query = query.where(MomentumConnectedAccount.id == account_id)
    return session.exec(query).first()


def _account_health(account: MomentumConnectedAccount | None) -> tuple[str, int]:
    """Return (status_str, days_left) for an account."""
    if not account:
        return "none", 0
    if not account.access_token_encrypted:
        return "disconnected", 0
    if account.token_expires_at and account.token_expires_at < datetime.now(timezone.utc):
        return "expired", 0
    if account.token_expires_at:
        days = (account.token_expires_at - datetime.now(timezone.utc)).days
        return ("warning" if days < 7 else "ok"), days
    return "ok", 0


def _build_readiness(company_id: str) -> tuple[list[dict], int]:
    """Build go-live readiness items for a company."""
    with Session(engine) as session:
        li_account = _get_account_for_platform(session, company_id, "linkedin")
        ig_account = _get_account_for_platform(session, company_id, "instagram")

    li_status, li_days = _account_health(li_account)
    ig_status, ig_days = _account_health(ig_account)

    google_api_ready = bool(settings.GOOGLE_API_KEY)
    linkedin_api_ready = bool(settings.LINKEDIN_CLIENT_ID and settings.LINKEDIN_CLIENT_SECRET)
    instagram_api_ready = bool(settings.INSTAGRAM_APP_ID and settings.INSTAGRAM_APP_SECRET)
    media_host_ready = bool(settings.MEDIA_PUBLIC_BASE_URL)

    def _acc_item(name: str, status: str, days: int) -> dict:
        if status == "ok":
            return {"label": f"{name} account", "state": "ready", "detail": "Connected and ready."}
        if status == "warning":
            return {"label": f"{name} account", "state": "warn", "detail": f"Token expires in {days} day(s)."}
        if status == "expired":
            return {"label": f"{name} account", "state": "issue", "detail": "Token expired. Reconnect."}
        if status == "disconnected":
            return {"label": f"{name} account", "state": "issue", "detail": "Not authenticated."}
        return {"label": f"{name} account", "state": "issue", "detail": "Not configured."}

    items = [
        {"label": "Google AI services", "state": "ready" if google_api_ready else "issue",
         "detail": "Gemini + Imagen configured." if google_api_ready else "GOOGLE_API_KEY missing."},
        {"label": "LinkedIn credentials", "state": "ready" if linkedin_api_ready else "issue",
         "detail": "App credentials set." if linkedin_api_ready else "LINKEDIN_CLIENT_ID/SECRET missing."},
        {"label": "Instagram credentials", "state": "ready" if instagram_api_ready else "issue",
         "detail": "App credentials set." if instagram_api_ready else "INSTAGRAM_APP_ID/SECRET missing."},
        {"label": "Media hosting", "state": "ready" if media_host_ready else "warn",
         "detail": "Public URL configured." if media_host_ready else "MEDIA_PUBLIC_BASE_URL missing for IG."},
        _acc_item("LinkedIn", li_status, li_days),
        _acc_item("Instagram", ig_status, ig_days),
    ]
    ready = sum(1 for i in items if i["state"] == "ready")
    score = round((ready / len(items)) * 100) if items else 0
    return items, score


# ── Endpoints ────────────────────────────────────────────────────────────

@router.post("/generate", response_model=GenerateResponse)
async def api_generate(req: GenerateRequest, request: Request):
    """Generate an AI-powered social media post."""
    _check_rate_limit(request, "generate", limit=4, window=300)
    auth = await get_auth_context(request)

    if not settings.GOOGLE_API_KEY:
        raise HTTPException(400, detail="Google API Key not configured on Social Hub server.")

    platform = req.platform if req.platform in ("linkedin", "instagram") else "linkedin"
    company_id = req.company_id or auth.company_id

    # Find connected account for the platform
    with Session(engine) as session:
        account = _get_account_for_platform(session, company_id, platform, req.connected_account_id)
        if not account:
            raise HTTPException(400, detail=f"No active {platform} account found for company.")

    # Generate topic if not provided
    topic = req.topic.strip() if req.topic else ""
    if not topic:
        with Session(engine) as session:
            queued = session.exec(
                select(TopicIdea).where(TopicIdea.used == False).order_by(col(TopicIdea.created_at))
            ).first()
            if queued:
                topic = queued.topic
                queued.used = True
                session.add(queued)
                session.commit()

    if not topic:
        topics = await gemini_service.suggest_topics(count=1)
        topic = topics[0] if topics else "Aktuelle Trends am deutschen Arbeitsmarkt"

    try:
        result = await gemini_service.generate_post(topic, platform=platform)
        value_comment = await gemini_service.generate_value_comment(result["body"])

        post_id = uuid4()
        content_item_id = req.content_item_id

        with Session(engine) as session:
            # If no content_item_id provided, create a content entry so it
            # appears on Momentum's editorial calendar
            if not content_item_id:
                content_item_id = str(uuid4())
                content = MomentumContent(
                    id=content_item_id,
                    title=topic[:200],
                    description=result["body"][:500],
                    status="scheduled",
                    publish_date=(datetime.now(timezone.utc) + timedelta(hours=24)).strftime("%Y-%m-%d"),
                    platform=platform,
                    campaign_id=None,
                    author="Social Hub AI",
                    content_type="social",
                    journey_phase="awareness",
                    company_id=company_id,
                    created_at=datetime.now(timezone.utc).isoformat(),
                )
                session.add(content)
                session.commit()

            # Create in Momentum's scheduled_posts table
            post = MomentumScheduledPost(
                id=post_id,
                company_id=company_id,
                content_item_id=content_item_id,
                connected_account_id=account.id,
                post_text=result["body"],
                post_type="image",
                hashtags=result.get("hashtags", "").split() if result.get("hashtags") else [],
                scheduled_at=datetime.now(timezone.utc) + timedelta(hours=24),
                status="draft",
                auto_comment_text=value_comment,
                created_by=auth.user_id,
                image_prompt=result["image_prompt"],
                sources=result.get("sources", ""),
                topic=topic,
                platform=platform,
                notes="",
            )
            session.add(post)
            session.commit()

            # Generate image
            try:
                image_path = await imagen_service.generate_image(
                    result["image_prompt"], post_id, platform=platform,
                )
                if image_path:
                    if settings.MEDIA_PUBLIC_BASE_URL:
                        image_url = f"{settings.MEDIA_PUBLIC_BASE_URL.rstrip('/')}/images/{post_id}"
                    else:
                        image_url = f"/images/{post_id}"
                    post_record = session.get(MomentumScheduledPost, post_id)
                    if post_record:
                        post_record.post_image_url = image_url
                        post_record.updated_at = datetime.now(timezone.utc)
                        session.add(post_record)
                        session.commit()
            except Exception as img_err:
                logger.warning("Image generation failed for post %s: %s", post_id, img_err)

        _db_log_api("INFO", "generate", f"[{platform}] Post generated: '{topic}' → {post_id}")

        return GenerateResponse(
            post_id=post_id,
            topic=topic,
            platform=platform,
            status="draft",
            message=f"AI post generated for {platform}.",
        )

    except Exception as e:
        logger.exception("AI generation failed")
        raise HTTPException(500, detail=public_error_message(e, "Content generation failed."))


@router.post("/publish/{post_id}", response_model=PublishResponse)
async def api_publish(post_id: str, request: Request):
    """Immediately publish an approved scheduled post."""
    _check_rate_limit(request, "publish", limit=6, window=60)
    auth = await get_auth_context(request)
    pk = _to_uuid(post_id)

    with Session(engine) as session:
        post = session.get(MomentumScheduledPost, pk)
        if not post:
            raise HTTPException(404, detail="Post not found.")
        if post.company_id != auth.company_id:
            raise HTTPException(403, detail="Access denied.")
        if post.status not in ("approved", "scheduled"):
            raise HTTPException(400, detail=f"Post must be approved to publish. Current status: {post.status}")

        account = session.get(MomentumConnectedAccount, post.connected_account_id)
        if not account or not account.access_token_encrypted:
            raise HTTPException(400, detail="Connected account not found or not authenticated.")

        # Determine platform from account
        platform = account.platform
        access_token = decrypt_token(account.access_token_encrypted)

        post.status = "publishing"
        post.updated_at = datetime.now(timezone.utc)
        session.add(post)
        session.commit()

    try:
        if platform == "linkedin":
            result = await _publish_linkedin(pk, access_token, account)
        elif platform == "instagram":
            result = await _publish_instagram(pk, access_token, account)
        else:
            raise HTTPException(400, detail=f"Unsupported platform: {platform}")

        return PublishResponse(
            post_id=post_id,
            status="published",
            platform_post_id=result.get("platform_post_id"),
            message=f"Published to {platform} successfully.",
        )

    except HTTPException:
        raise
    except Exception as e:
        # Mark as failed
        with Session(engine) as session:
            post = session.get(MomentumScheduledPost, pk)
            if post:
                post.status = "failed"
                post.error_message = str(e)[:500]
                post.retry_count = (post.retry_count or 0) + 1
                post.updated_at = datetime.now(timezone.utc)
                session.add(post)
                session.commit()
        _db_log_api("ERROR", "publish", f"Publish failed for {post_id}: {e}")
        raise HTTPException(500, detail=public_error_message(e, "Publishing failed."))


async def _publish_linkedin(post_id: str, access_token: str, account: MomentumConnectedAccount) -> dict:
    """Handle LinkedIn publishing pipeline."""
    platform_user_id = account.platform_user_id or (account.account_metadata or {}).get("linkedin_user_id", "")
    if not platform_user_id:
        raise HTTPException(400, detail="LinkedIn account missing platform_user_id.")

    person_urn = f"urn:li:person:{platform_user_id}"

    with Session(engine) as session:
        post = session.get(MomentumScheduledPost, post_id)
        if not post:
            raise HTTPException(404, detail="Post not found.")

        image_urn = None
        if post.post_image_url and post.post_image_url.startswith("/images/"):
            # Local image — upload to LinkedIn
            image_path_str = str(DATA_DIR / "images" / f"{post_id}.png")
            try:
                image_urn = await linkedin_service.upload_image(access_token, person_urn, image_path_str)
            except Exception as e:
                logger.warning("LinkedIn image upload failed: %s", e)

        post_urn = await linkedin_service.create_post(access_token, person_urn, post.post_text, image_urn)

        post.platform_post_id = post_urn
        post.status = "published"
        post.published_at = datetime.now(timezone.utc)
        post.updated_at = datetime.now(timezone.utc)
        session.add(post)
        session.commit()

        _db_log_api("INFO", "linkedin", f"Published post {post_id}: {post_urn}")

        # Schedule value comment via APScheduler (consistent with scheduler_v2)
        if post.auto_comment_text:
            delay_min = int(get_setting("value_comment_delay_min", "60"))
            try:
                from app.services.scheduler_service_v2 import scheduler
                scheduler.add_job(
                    _post_linkedin_comment,
                    "date",
                    run_date=datetime.now(timezone.utc) + timedelta(minutes=delay_min),
                    args=[str(pk), access_token, person_urn],
                    id=f"comment_{post_id}",
                    replace_existing=True,
                )
            except Exception as e:
                logger.warning("Could not schedule value comment: %s", e)

        return {"platform_post_id": post_urn}


async def _publish_instagram(post_id: str, access_token: str, account: MomentumConnectedAccount) -> dict:
    """Handle Instagram publishing pipeline."""
    ig_user_id = account.platform_user_id or (account.account_metadata or {}).get("ig_user_id", "")
    if not ig_user_id:
        raise HTTPException(400, detail="Instagram account missing ig_user_id.")

    if not settings.MEDIA_PUBLIC_BASE_URL:
        raise HTTPException(400, detail="MEDIA_PUBLIC_BASE_URL required for Instagram publishing.")

    with Session(engine) as session:
        post = session.get(MomentumScheduledPost, post_id)
        if not post:
            raise HTTPException(404, detail="Post not found.")

        base = settings.MEDIA_PUBLIC_BASE_URL.rstrip("/")
        image_url = post.post_image_url or f"{base}/images/{post_id}"

        caption = post.post_text
        if post.hashtags:
            hashtag_str = " ".join(post.hashtags) if isinstance(post.hashtags, list) else str(post.hashtags)
            caption = f"{caption}\n\n{hashtag_str}"

        # Create container
        container_id = await instagram_service.create_image_container(
            access_token, ig_user_id, image_url, caption,
        )
        post.ig_container_id = container_id
        session.add(post)
        session.commit()

        # Poll for container readiness
        for _ in range(12):
            await asyncio.sleep(5)
            status = await instagram_service.check_container_status(access_token, container_id)
            if status == "FINISHED":
                break
            if status == "ERROR":
                raise RuntimeError(f"Instagram container {container_id} failed processing.")
        else:
            raise RuntimeError(f"Instagram container {container_id} timed out.")

        # Publish
        media_id = await instagram_service.publish_container(access_token, ig_user_id, container_id)

        post.platform_post_id = media_id
        post.status = "published"
        post.published_at = datetime.now(timezone.utc)
        post.updated_at = datetime.now(timezone.utc)
        session.add(post)
        session.commit()

        _db_log_api("INFO", "instagram", f"Published post {post_id}: {media_id}")

        # Schedule value comment via APScheduler
        if post.auto_comment_text:
            delay_min = int(get_setting("value_comment_delay_min", "60"))
            try:
                from app.services.scheduler_service_v2 import scheduler
                scheduler.add_job(
                    _post_instagram_comment,
                    "date",
                    run_date=datetime.now(timezone.utc) + timedelta(minutes=delay_min),
                    args=[str(pk), access_token],
                    id=f"comment_{post_id}",
                    replace_existing=True,
                )
            except Exception as e:
                logger.warning("Could not schedule value comment: %s", e)

        return {"platform_post_id": media_id}


async def _post_linkedin_comment(post_id: str, access_token: str, person_urn: str):
    """Post value comment on LinkedIn."""
    try:
        with Session(engine) as session:
            post = session.get(MomentumScheduledPost, post_id)
            if not post or not post.platform_post_id or not post.auto_comment_text:
                return
            comment_urn = await linkedin_service.create_comment(
                access_token, post.platform_post_id, person_urn, post.auto_comment_text,
            )
            post.platform_comment_id = comment_urn
            post.auto_comment_posted = True
            post.auto_comment_at = datetime.now(timezone.utc)
            post.updated_at = datetime.now(timezone.utc)
            session.add(post)
            session.commit()
        _db_log_api("INFO", "linkedin", f"Value comment posted on {post_id}")
    except Exception as e:
        _db_log_api("ERROR", "linkedin", f"Value comment failed for {post_id}: {e}")


async def _post_instagram_comment(post_id: str, access_token: str):
    """Post value comment on Instagram."""
    try:
        with Session(engine) as session:
            post = session.get(MomentumScheduledPost, post_id)
            if not post or not post.platform_post_id or not post.auto_comment_text:
                return
            comment_id = await instagram_service.post_comment(
                access_token, post.platform_post_id, post.auto_comment_text,
            )
            post.platform_comment_id = comment_id
            post.auto_comment_posted = True
            post.auto_comment_at = datetime.now(timezone.utc)
            post.updated_at = datetime.now(timezone.utc)
            session.add(post)
            session.commit()
        _db_log_api("INFO", "instagram", f"Value comment posted on {post_id}")
    except Exception as e:
        _db_log_api("ERROR", "instagram", f"Value comment failed for {post_id}: {e}")


@router.get("/readiness/{company_id}", response_model=ReadinessResponse)
async def api_readiness(company_id: str, request: Request):
    """Get go-live readiness score for a company."""
    auth = await get_auth_context(request)
    if auth.company_id != company_id:
        raise HTTPException(403, detail="Access denied.")

    items, score = _build_readiness(company_id)
    return ReadinessResponse(
        score=score,
        items=[ReadinessItem(**i) for i in items],
    )


@router.post("/topics/suggest", response_model=TopicSuggestResponse)
async def api_suggest_topics(req: TopicSuggestRequest, request: Request):
    """Get AI-generated topic suggestions."""
    _check_rate_limit(request, "topics", limit=12, window=300)
    await get_auth_context(request)

    if not settings.GOOGLE_API_KEY:
        return TopicSuggestResponse(topics=[])

    count = min(req.count, 10)
    try:
        topics = await gemini_service.suggest_topics(count=count)
        return TopicSuggestResponse(topics=topics)
    except Exception as e:
        raise HTTPException(500, detail=public_error_message(e, "Topic suggestion failed."))


@router.post("/regenerate-text/{post_id}")
async def api_regenerate_text(post_id: str, req: RegenerateTextRequest, request: Request):
    """Rewrite post text using AI instruction."""
    _check_rate_limit(request, "regenerate-text", limit=8, window=300)
    auth = await get_auth_context(request)
    pk = _to_uuid(post_id)

    if not req.instruction.strip():
        raise HTTPException(400, detail="Instruction required.")

    with Session(engine) as session:
        post = session.get(MomentumScheduledPost, pk)
        if not post:
            raise HTTPException(404, detail="Post not found.")
        if post.company_id != auth.company_id:
            raise HTTPException(403, detail="Access denied.")
        body = post.post_text

    try:
        new_body = await gemini_service.regenerate_text(body, req.instruction)
        with Session(engine) as session:
            post = session.get(MomentumScheduledPost, pk)
            if post:
                post.post_text = new_body
                post.updated_at = datetime.now(timezone.utc)
                session.add(post)
                session.commit()
        return JSONResponse({"body": new_body, "post_id": post_id})
    except Exception as e:
        raise HTTPException(500, detail=public_error_message(e, "Text rewrite failed."))


@router.post("/regenerate-image/{post_id}")
async def api_regenerate_image(post_id: str, request: Request):
    """Regenerate the AI image for a post."""
    _check_rate_limit(request, "regenerate-image", limit=6, window=300)
    auth = await get_auth_context(request)
    pk = _to_uuid(post_id)

    with Session(engine) as session:
        post = session.get(MomentumScheduledPost, pk)
        if not post:
            raise HTTPException(404, detail="Post not found.")
        if post.company_id != auth.company_id:
            raise HTTPException(403, detail="Access denied.")
        if not post.image_prompt:
            raise HTTPException(400, detail="No image prompt available for this post.")
        prompt = post.image_prompt
        # Detect platform from connected account
        account = session.get(MomentumConnectedAccount, post.connected_account_id)
        platform = account.platform if account else "linkedin"

    try:
        image_path = await imagen_service.generate_image(prompt, post_id, platform=platform)
        with Session(engine) as session:
            post = session.get(MomentumScheduledPost, pk)
            if post and image_path:
                if settings.MEDIA_PUBLIC_BASE_URL:
                    post.post_image_url = f"{settings.MEDIA_PUBLIC_BASE_URL.rstrip('/')}/images/{post_id}"
                else:
                    post.post_image_url = f"/images/{post_id}"
                post.updated_at = datetime.now(timezone.utc)
                session.add(post)
                session.commit()
        return JSONResponse({"message": "Image regenerated.", "post_id": post_id})
    except Exception as e:
        raise HTTPException(500, detail=public_error_message(e, "Image regeneration failed."))


@router.get("/posts/{company_id}")
async def api_list_posts(
    company_id: str,
    request: Request,
    status: str = "",
    campaign_id: str = "",
    task_id: str = "",
    content_item_id: str = "",
    platform: str = "",
    limit: int = 50,
):
    """List scheduled posts for a company. Supports filtering by status, campaign, task, content, and platform."""
    auth = await get_auth_context(request)
    if auth.company_id != company_id:
        raise HTTPException(403, detail="Access denied.")

    with Session(engine) as session:
        query = (
            select(MomentumScheduledPost)
            .where(MomentumScheduledPost.company_id == company_id)
            .order_by(col(MomentumScheduledPost.created_at).desc())
            .limit(min(limit, 200))
        )
        if status:
            query = query.where(MomentumScheduledPost.status == status)
        if campaign_id:
            query = query.where(MomentumScheduledPost.campaign_id == campaign_id)
        if task_id:
            query = query.where(MomentumScheduledPost.task_id == task_id)
        if content_item_id:
            query = query.where(MomentumScheduledPost.content_item_id == content_item_id)
        if platform:
            query = query.where(MomentumScheduledPost.platform == platform)
        posts = session.exec(query).all()

    return JSONResponse([
        {
            "id": str(p.id),
            "topic": p.topic,
            "status": p.status,
            "platform": p.platform,
            "campaign_id": p.campaign_id,
            "task_id": p.task_id,
            "content_item_id": p.content_item_id,
            "connected_account_id": str(p.connected_account_id) if p.connected_account_id else None,
            "post_text": p.post_text[:200],
            "post_image_url": p.post_image_url,
            "hashtags": p.hashtags if isinstance(p.hashtags, list) else [],
            "auto_comment_text": p.auto_comment_text[:100] if p.auto_comment_text else None,
            "scheduled_at": p.scheduled_at.isoformat() if p.scheduled_at else None,
            "published_at": p.published_at.isoformat() if p.published_at else None,
            "created_at": p.created_at.isoformat() if p.created_at else None,
        }
        for p in posts
    ])


# ── Post Detail ──────────────────────────────────────────────────────────

@router.get("/posts/{company_id}/{post_id}")
async def api_get_post_detail(company_id: str, post_id: str, request: Request):
    """Return full post detail including text, image, hashtags, value comment."""
    _check_rate_limit(request, "post_detail", 60)
    auth: AuthContext = get_auth_context(request)

    with Session(engine) as session:
        post = session.exec(
            select(MomentumScheduledPost)
            .where(MomentumScheduledPost.id == UUID(post_id))
            .where(MomentumScheduledPost.company_id == company_id)
        ).first()
        if not post:
            raise HTTPException(404, "Post not found")

        # Resolve platform from connected account
        resolved_platform = post.platform
        account_name = None
        if post.connected_account_id:
            account = session.exec(
                select(MomentumConnectedAccount)
                .where(MomentumConnectedAccount.id == post.connected_account_id)
            ).first()
            if account:
                resolved_platform = resolved_platform or account.platform
                account_name = account.account_name

        return JSONResponse({
            "id": str(post.id),
            "company_id": post.company_id,
            "topic": post.topic,
            "status": post.status,
            "platform": resolved_platform,
            "account_name": account_name,
            "connected_account_id": str(post.connected_account_id) if post.connected_account_id else None,
            "campaign_id": post.campaign_id,
            "task_id": post.task_id,
            "content_item_id": post.content_item_id,
            "post_text": post.post_text,
            "post_image_url": post.post_image_url,
            "post_type": post.post_type,
            "hashtags": post.hashtags if isinstance(post.hashtags, list) else [],
            "auto_comment_text": post.auto_comment_text,
            "image_prompt": post.image_prompt,
            "sources": post.sources,
            "notes": post.notes,
            "platform_post_url": post.platform_post_url,
            "error_message": post.error_message,
            "scheduled_at": post.scheduled_at.isoformat() if post.scheduled_at else None,
            "published_at": post.published_at.isoformat() if post.published_at else None,
            "approved_at": post.approved_at.isoformat() if post.approved_at else None,
            "approved_by": post.approved_by,
            "created_by": post.created_by,
            "created_at": post.created_at.isoformat() if post.created_at else None,
            "updated_at": post.updated_at.isoformat() if post.updated_at else None,
        })


# ── Approve / Reject ────────────────────────────────────────────────────

class ApproveRejectRequest(BaseModel):
    user_id: str = PydanticField(..., description="ID of the user performing the action")
    notes: str = PydanticField("", description="Optional reviewer notes")


@router.put("/posts/{post_id}/approve")
async def api_approve_post(post_id: str, body: ApproveRejectRequest, request: Request):
    """Approve a draft post so it can be published."""
    _check_rate_limit(request, "approve", 30)
    auth: AuthContext = get_auth_context(request)

    with Session(engine) as session:
        post = session.exec(
            select(MomentumScheduledPost)
            .where(MomentumScheduledPost.id == UUID(post_id))
        ).first()
        if not post:
            raise HTTPException(404, "Post not found")
        if post.status not in ("draft", "rejected"):
            raise HTTPException(400, f"Cannot approve post with status '{post.status}'")

        post.status = "approved"
        post.approved_by = body.user_id
        post.approved_at = datetime.now(timezone.utc)
        post.updated_at = datetime.now(timezone.utc)
        if body.notes:
            post.notes = body.notes
        session.add(post)
        session.commit()
        session.refresh(post)

        logger.info("Post %s approved by %s", post_id, body.user_id)
        return JSONResponse({"id": str(post.id), "status": post.status, "approved_at": post.approved_at.isoformat()})


@router.put("/posts/{post_id}/reject")
async def api_reject_post(post_id: str, body: ApproveRejectRequest, request: Request):
    """Reject a draft post."""
    _check_rate_limit(request, "reject", 30)
    auth: AuthContext = get_auth_context(request)

    with Session(engine) as session:
        post = session.exec(
            select(MomentumScheduledPost)
            .where(MomentumScheduledPost.id == UUID(post_id))
        ).first()
        if not post:
            raise HTTPException(404, "Post not found")
        if post.status in ("published",):
            raise HTTPException(400, "Cannot reject a published post")

        post.status = "rejected"
        post.updated_at = datetime.now(timezone.utc)
        if body.notes:
            post.notes = body.notes
        session.add(post)
        session.commit()
        session.refresh(post)

        logger.info("Post %s rejected by %s", post_id, body.user_id)
        return JSONResponse({"id": str(post.id), "status": post.status})


# ── Connected Accounts Status ───────────────────────────────────────────

@router.get("/accounts/{company_id}")
async def api_get_accounts(company_id: str, request: Request):
    """Return connected social accounts with health status for a company."""
    _check_rate_limit(request, "accounts", 30)
    auth: AuthContext = get_auth_context(request)

    with Session(engine) as session:
        accounts = session.exec(
            select(MomentumConnectedAccount)
            .where(MomentumConnectedAccount.company_id == company_id)
            .where(MomentumConnectedAccount.is_active == True)
        ).all()

        result = []
        now = datetime.now(timezone.utc)
        for acc in accounts:
            token_status = "ok"
            if acc.token_expires_at:
                if acc.token_expires_at < now:
                    token_status = "expired"
                elif acc.token_expires_at < now + timedelta(days=7):
                    token_status = "expiring_soon"

            result.append({
                "id": str(acc.id),
                "platform": acc.platform,
                "account_name": acc.account_name,
                "account_id": acc.account_id,
                "token_status": token_status,
                "token_expires_at": acc.token_expires_at.isoformat() if acc.token_expires_at else None,
                "connected_by": acc.connected_by,
                "created_at": acc.created_at.isoformat() if acc.created_at else None,
            })

        return JSONResponse(result)


# ── Generate from Task Context ──────────────────────────────────────────

class GenerateFromTaskRequest(BaseModel):
    company_id: str
    task_title: str
    task_description: str = ""
    platform: str = "linkedin"  # linkedin | instagram
    campaign_name: str = ""
    target_audience: str = ""
    tone: str = ""
    language: str = "de"


@router.post("/generate-from-task")
async def api_generate_from_task(body: GenerateFromTaskRequest, request: Request):
    """Generate a social post using task context from Momentum.

    Builds a rich prompt from the task metadata and delegates to the
    standard AI generation pipeline (Gemini text + Imagen image).
    """
    _check_rate_limit(request, "generate_task", 10, window=60)
    auth: AuthContext = get_auth_context(request)

    # Build contextual topic from task data
    topic_parts = [body.task_title]
    if body.task_description:
        topic_parts.append(body.task_description[:500])

    context_hint = ""
    if body.campaign_name:
        context_hint += f"\nKampagne: {body.campaign_name}"
    if body.target_audience:
        context_hint += f"\nZielgruppe: {body.target_audience}"
    if body.tone:
        context_hint += f"\nTonalität: {body.tone}"

    rich_topic = " — ".join(topic_parts)
    if context_hint:
        rich_topic += f"\n\nKontext:{context_hint}"

    # Find connected account for the target platform
    with Session(engine) as session:
        acc = session.exec(
            select(MomentumConnectedAccount)
            .where(MomentumConnectedAccount.company_id == body.company_id)
            .where(MomentumConnectedAccount.platform == body.platform)
            .where(MomentumConnectedAccount.is_active == True)
        ).first()
        connected_account_id = str(acc.id) if acc else None

    # Delegate to the internal generation helper
    result = await _generate_post_internal(
        company_id=body.company_id,
        topic=rich_topic,
        platform=body.platform,
        connected_account_id=connected_account_id,
        language=body.language,
        auth=auth,
    )
    return JSONResponse(result)


async def _generate_post_internal(
    company_id: str,
    topic: str,
    platform: str,
    connected_account_id: str | None,
    language: str,
    auth: AuthContext,
    campaign_id: str | None = None,
    task_id: str | None = None,
) -> dict:
    """Internal helper: generate AI post (text + image) and persist.

    Extracted from the /generate endpoint so it can be reused by
    /generate-from-task without code duplication.
    """
    # ── Gather company context + project settings ────────────────────
    company_context = ""
    settings_context = ""
    with Session(engine) as session:
        company = session.exec(
            select(MomentumCompany).where(MomentumCompany.id == company_id)
        ).first()
        if company:
            company_context = (
                f"Unternehmen: {company.name}\n"
                f"Branche: {getattr(company, 'industry', '')}\n"
                f"Zielgruppe: {getattr(company, 'target_audience', '')}\n"
            )

        # Load project Social Hub settings for AI tuning
        proj_settings = session.exec(
            select(SocialHubSettings)
            .where(SocialHubSettings.company_id == company_id)
        ).first()
        if proj_settings:
            if proj_settings.ai_tone:
                settings_context += f"Tonalität: {proj_settings.ai_tone}\n"
            if proj_settings.ai_persona:
                settings_context += f"Persona: {proj_settings.ai_persona}\n"
            if proj_settings.content_pillars:
                settings_context += f"Content-Säulen: {', '.join(proj_settings.content_pillars)}\n"
            if proj_settings.hashtag_strategy:
                settings_context += f"Hashtag-Strategie: {proj_settings.hashtag_strategy}\n"
            # Prefer project language over request language
            if proj_settings.ai_language:
                language = proj_settings.ai_language

    # ── AI text generation via Gemini ────────────────────────────────
    language_label = {"de": "Deutsch", "en": "Englisch", "fr": "Französisch"}.get(language, language)
    text_prompt = (
        f"Erstelle einen professionellen {platform.capitalize()}-Post zum Thema:\n\n"
        f"{topic}\n\n"
        f"{company_context}"
        f"{settings_context}\n"
        f"Sprache: {language_label}\n"
        f"Der Post soll informativ, engagierend und zur Plattform {platform} passend sein.\n"
        f"Füge passende Hashtags am Ende hinzu.\n"
        f"Liefere NUR den Post-Text, keine Erklärungen."
    )
    post_text = await asyncio.to_thread(gemini_service.generate_text, text_prompt)
    if not post_text:
        raise HTTPException(502, "AI text generation failed")

    # Extract hashtags
    hashtags = [w for w in post_text.split() if w.startswith("#")]

    # ── Value comment generation ─────────────────────────────────────
    comment_prompt = (
        f"Erstelle einen kurzen, wertvollen Kommentar als Ergänzung zu diesem {platform}-Post:\n\n"
        f"{post_text[:500]}\n\n"
        f"Der Kommentar soll einen zusätzlichen Mehrwert bieten. "
        f"Sprache: {language_label}. Maximal 2-3 Sätze."
    )
    auto_comment = await asyncio.to_thread(gemini_service.generate_text, comment_prompt)

    # ── AI image generation via Imagen ───────────────────────────────
    image_prompt = f"Professional {platform} social media image for: {topic[:200]}"
    image_url = None
    try:
        image_url = await asyncio.to_thread(imagen_service.generate_image, image_prompt)
    except Exception as exc:
        logger.warning("Image generation failed: %s", exc)

    # ── Persist to database ──────────────────────────────────────────
    post_id = uuid4()
    now = datetime.now(timezone.utc)
    with Session(engine) as session:
        new_post = MomentumScheduledPost(
            id=post_id,
            company_id=company_id,
            topic=topic[:500],
            post_text=post_text,
            post_image_url=image_url,
            post_type="image" if image_url else "text",
            hashtags=hashtags,
            auto_comment_text=auto_comment,
            image_prompt=image_prompt,
            status="draft",
            connected_account_id=UUID(connected_account_id) if connected_account_id else None,
            created_by=auth.user_id,
            campaign_id=campaign_id,
            task_id=task_id,
            platform=platform,
            created_at=now,
            updated_at=now,
        )
        session.add(new_post)

        # Also create a Content entry in Momentum
        content = MomentumContent(
            id=str(uuid4()),
            company_id=company_id,
            title=f"Social: {topic[:80]}",
            type="social_post",
            status="draft",
            channel=platform,
            notes=f"Generated by Social Hub AI",
            createdAt=now,
            updatedAt=now,
        )
        session.add(content)
        session.commit()

    return {
        "post_id": str(post_id),
        "post_text": post_text,
        "post_image_url": image_url,
        "hashtags": hashtags,
        "auto_comment_text": auto_comment,
        "image_prompt": image_prompt,
        "status": "draft",
        "platform": platform,
        "campaign_id": campaign_id,
        "task_id": task_id,
    }


@router.get("/health")
async def api_health():
    """System health check."""
    status: dict[str, object] = {
        "status": "ok",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "version": "2.0.0",
        "mode": "momentum-integrated",
    }
    try:
        with Session(engine) as session:
            session.exec(select(func.count(col(TopicIdea.id)))).one()
        status["database"] = "ok"
    except Exception:
        status["database"] = "error"
        status["status"] = "degraded"

    status["google_api"] = "configured" if settings.GOOGLE_API_KEY else "missing"
    status["linkedin_api"] = "configured" if settings.LINKEDIN_CLIENT_ID else "missing"
    status["instagram_api"] = "configured" if settings.INSTAGRAM_APP_ID else "missing"
    status["app_env"] = settings.APP_ENV
    status["schema"] = settings.DATABASE_SCHEMA

    # Scheduler status
    try:
        from app.services.scheduler_service_v2 import scheduler
        status["scheduler_running"] = scheduler.running
        jobs = scheduler.get_jobs()
        status["scheduler_jobs"] = [j.id for j in jobs]
    except Exception:
        status["scheduler_running"] = False
        status["scheduler_jobs"] = []

    return JSONResponse(status)


# ── Project Settings ─────────────────────────────────────────────────────

@router.get("/settings/{company_id}")
async def api_get_settings(company_id: str, request: Request):
    """Get Social Hub settings for a project."""
    _check_rate_limit(request, "settings", 30)
    auth: AuthContext = await get_auth_context(request)
    if auth.company_id != company_id:
        raise HTTPException(403, detail="Access denied.")

    with Session(engine) as session:
        row = session.exec(
            select(SocialHubSettings)
            .where(SocialHubSettings.company_id == company_id)
        ).first()
        if not row:
            # Auto-create default settings for this project
            row = SocialHubSettings(company_id=company_id)
            session.add(row)
            session.commit()
            session.refresh(row)

        return JSONResponse({
            "id": str(row.id),
            "company_id": row.company_id,
            "publishing_cadence": row.publishing_cadence,
            "preferred_days": row.preferred_days or [],
            "preferred_times": row.preferred_times or [],
            "timezone": row.timezone,
            "ai_language": row.ai_language,
            "ai_tone": row.ai_tone,
            "ai_persona": row.ai_persona,
            "content_pillars": row.content_pillars or [],
            "auto_approve": row.auto_approve,
            "require_approval_from": row.require_approval_from or [],
            "default_platform": row.default_platform,
            "value_comments_enabled": row.value_comments_enabled,
            "image_generation_enabled": row.image_generation_enabled,
            "hashtag_strategy": row.hashtag_strategy,
            "updated_at": row.updated_at.isoformat() if row.updated_at else None,
        })


@router.put("/settings/{company_id}")
async def api_update_settings(company_id: str, body: SettingsUpdateRequest, request: Request):
    """Update Social Hub settings for a project (partial update)."""
    _check_rate_limit(request, "settings", 20)
    auth: AuthContext = await get_auth_context(request)
    if auth.company_id != company_id:
        raise HTTPException(403, detail="Access denied.")

    VALID_CADENCES = {"conservative", "moderate", "aggressive"}
    VALID_STRATEGIES = {"none", "minimal", "moderate", "aggressive"}
    VALID_PLATFORMS = {"linkedin", "instagram"}

    if body.publishing_cadence and body.publishing_cadence not in VALID_CADENCES:
        raise HTTPException(400, detail=f"Invalid cadence. Must be one of: {VALID_CADENCES}")
    if body.hashtag_strategy and body.hashtag_strategy not in VALID_STRATEGIES:
        raise HTTPException(400, detail=f"Invalid hashtag_strategy. Must be one of: {VALID_STRATEGIES}")
    if body.default_platform and body.default_platform not in VALID_PLATFORMS:
        raise HTTPException(400, detail=f"Invalid default_platform. Must be one of: {VALID_PLATFORMS}")

    with Session(engine) as session:
        row = session.exec(
            select(SocialHubSettings)
            .where(SocialHubSettings.company_id == company_id)
        ).first()
        if not row:
            row = SocialHubSettings(company_id=company_id)
            session.add(row)
            session.commit()
            session.refresh(row)

        # Apply only non-None fields from the request
        update_data = body.model_dump(exclude_none=True)
        for field, value in update_data.items():
            setattr(row, field, value)
        row.updated_at = datetime.now(timezone.utc)
        session.add(row)
        session.commit()
        session.refresh(row)

        _db_log_api("INFO", "settings", f"Settings updated for company {company_id}")

        return JSONResponse({
            "id": str(row.id),
            "company_id": row.company_id,
            "publishing_cadence": row.publishing_cadence,
            "preferred_days": row.preferred_days or [],
            "preferred_times": row.preferred_times or [],
            "timezone": row.timezone,
            "ai_language": row.ai_language,
            "ai_tone": row.ai_tone,
            "ai_persona": row.ai_persona,
            "content_pillars": row.content_pillars or [],
            "auto_approve": row.auto_approve,
            "require_approval_from": row.require_approval_from or [],
            "default_platform": row.default_platform,
            "value_comments_enabled": row.value_comments_enabled,
            "image_generation_enabled": row.image_generation_enabled,
            "hashtag_strategy": row.hashtag_strategy,
            "updated_at": row.updated_at.isoformat() if row.updated_at else None,
        })


# ── Project Analytics ────────────────────────────────────────────────────

@router.get("/analytics/{company_id}")
async def api_get_analytics(company_id: str, request: Request, days: int = 30):
    """Get social analytics summary for a project.

    Combines live post statistics with historical analytics snapshots.
    """
    _check_rate_limit(request, "analytics", 20)
    auth: AuthContext = await get_auth_context(request)
    if auth.company_id != company_id:
        raise HTTPException(403, detail="Access denied.")

    days = min(max(days, 1), 365)
    since = datetime.now(timezone.utc) - timedelta(days=days)

    with Session(engine) as session:
        # ── Live post statistics ─────────────────────────────────────
        posts = session.exec(
            select(MomentumScheduledPost)
            .where(MomentumScheduledPost.company_id == company_id)
        ).all()

        total = len(posts)
        published = sum(1 for p in posts if p.status == "published")
        drafts = sum(1 for p in posts if p.status == "draft")
        approved = sum(1 for p in posts if p.status == "approved")
        failed = sum(1 for p in posts if p.status == "failed")
        rejected = sum(1 for p in posts if p.status == "rejected")

        # Posts in the last N days
        recent_posts = [
            p for p in posts
            if p.created_at and p.created_at >= since
        ]
        recent_published = [p for p in recent_posts if p.status == "published"]

        # Platform breakdown
        platform_stats: dict[str, dict] = {}
        for p in posts:
            plat = p.platform or "unknown"
            if plat not in platform_stats:
                platform_stats[plat] = {"total": 0, "published": 0}
            platform_stats[plat]["total"] += 1
            if p.status == "published":
                platform_stats[plat]["published"] += 1

        # ── Engagement aggregates from engagement_metrics ────────────
        published_ids = [p.id for p in posts if p.status == "published"]
        total_impressions = 0
        total_clicks = 0
        total_likes = 0
        total_comments = 0
        total_shares = 0
        total_reach = 0
        best_post_id = None
        best_engagement = 0.0

        if published_ids:
            metrics = session.exec(
                select(MomentumEngagementMetric)
                .where(col(MomentumEngagementMetric.scheduled_post_id).in_(published_ids))
            ).all()
            for m in metrics:
                total_impressions += m.impressions
                total_clicks += m.clicks
                total_likes += m.likes
                total_comments += m.comments
                total_shares += m.shares
                total_reach += m.reach
                if m.engagement_rate > best_engagement:
                    best_engagement = m.engagement_rate
                    best_post_id = str(m.scheduled_post_id)

        avg_engagement_rate = 0.0
        if published:
            total_interactions = total_likes + total_comments + total_shares
            avg_engagement_rate = round(
                (total_interactions / max(total_impressions, 1)) * 100, 2
            )

        # ── Historical snapshots ─────────────────────────────────────
        snapshots = session.exec(
            select(SocialAnalyticsSnapshot)
            .where(SocialAnalyticsSnapshot.company_id == company_id)
            .where(SocialAnalyticsSnapshot.snapshot_date >= since.strftime("%Y-%m-%d"))
            .order_by(col(SocialAnalyticsSnapshot.snapshot_date).asc())
        ).all()

        trends = [
            {
                "date": s.snapshot_date,
                "platform": s.platform,
                "impressions": s.total_impressions,
                "likes": s.total_likes,
                "comments": s.total_comments,
                "shares": s.total_shares,
                "reach": s.total_reach,
                "engagement_rate": s.avg_engagement_rate,
            }
            for s in snapshots
        ]

        # ── Connected accounts ───────────────────────────────────────
        accounts = session.exec(
            select(MomentumConnectedAccount)
            .where(MomentumConnectedAccount.company_id == company_id)
            .where(MomentumConnectedAccount.is_active == True)  # noqa: E712
        ).all()

        return JSONResponse({
            "company_id": company_id,
            "period_days": days,
            "posts": {
                "total": total,
                "published": published,
                "drafts": drafts,
                "approved": approved,
                "failed": failed,
                "rejected": rejected,
                "recent_total": len(recent_posts),
                "recent_published": len(recent_published),
            },
            "engagement": {
                "impressions": total_impressions,
                "clicks": total_clicks,
                "likes": total_likes,
                "comments": total_comments,
                "shares": total_shares,
                "reach": total_reach,
                "avg_engagement_rate": avg_engagement_rate,
                "best_post_id": best_post_id,
            },
            "platform_breakdown": platform_stats,
            "connected_accounts": len(accounts),
            "trends": trends,
        })


# ── Generate from Campaign ───────────────────────────────────────────────

@router.post("/generate-from-campaign")
async def api_generate_from_campaign(body: GenerateFromCampaignRequest, request: Request):
    """Generate a social post from campaign context.

    Pulls campaign metadata (name, keywords, audience, master_prompt) from
    Momentum's campaigns table and uses it for rich AI generation.
    """
    _check_rate_limit(request, "generate_campaign", 10, window=60)
    auth: AuthContext = await get_auth_context(request)

    with Session(engine) as session:
        # Load campaign data
        from sqlalchemy import text as sa_text
        schema = _momentum_schema()
        result = session.exec(
            sa_text(
                f'SELECT name, keywords, target_audience, master_prompt, status '
                f'FROM {schema}.campaigns WHERE id = :cid AND company_id = :company_id'
            ),
            params={"cid": body.campaign_id, "company_id": body.company_id},
        ).first()
        if not result:
            raise HTTPException(404, detail="Campaign not found.")

        campaign_name, keywords, target_audience, master_prompt, campaign_status = result

        # Build a rich, campaign-aware topic
        topic_parts = [f"Kampagne: {campaign_name}"]
        if body.focus_angle:
            topic_parts.append(f"Schwerpunkt: {body.focus_angle}")
        if keywords:
            kw_str = ", ".join(keywords) if isinstance(keywords, list) else str(keywords)
            topic_parts.append(f"Keywords: {kw_str}")
        if target_audience:
            topic_parts.append(f"Zielgruppe: {target_audience}")
        if master_prompt:
            topic_parts.append(f"Kampagnen-Briefing: {master_prompt[:500]}")

        rich_topic = "\n".join(topic_parts)

        # Find connected account for the target platform
        acc = session.exec(
            select(MomentumConnectedAccount)
            .where(MomentumConnectedAccount.company_id == body.company_id)
            .where(MomentumConnectedAccount.platform == body.platform)
            .where(MomentumConnectedAccount.is_active == True)  # noqa: E712
        ).first()
        connected_account_id = str(acc.id) if acc else None

    # Delegate to the internal generation helper
    post_result = await _generate_post_internal(
        company_id=body.company_id,
        topic=rich_topic,
        platform=body.platform,
        connected_account_id=connected_account_id,
        language=body.language,
        auth=auth,
    )

    # Tag the generated post with campaign_id
    with Session(engine) as session:
        post = session.get(MomentumScheduledPost, UUID(post_result["post_id"]))
        if post:
            post.campaign_id = body.campaign_id
            post.platform = body.platform
            post.updated_at = datetime.now(timezone.utc)
            session.add(post)
            session.commit()

    post_result["campaign_id"] = body.campaign_id
    return JSONResponse(post_result)
