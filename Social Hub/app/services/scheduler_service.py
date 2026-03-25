# Social Media Marketing Hub — Scheduler Service
"""
Handles the automated posting pipeline for LinkedIn AND Instagram:
1. Generate content (Gemini) → save as platform-specific draft
2. On schedule: publish approved posts to the target platform
3. Post value comment after publishing (configurable delay)

Separate schedule settings exist for each platform.
"""
import asyncio
import logging
import os
import socket
from datetime import datetime, timezone, timedelta
from pathlib import Path

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from sqlmodel import Session, select, col

from app.config import settings, DATA_DIR
from app.database import (
    engine, Post, PostStatus, Platform,
    LinkedInAccount, InstagramAccount, AppLog, JobLease, get_setting, get_settings, TopicIdea,
)
from app.services import gemini_service, imagen_service, linkedin_service, instagram_service

logger = logging.getLogger("scheduler")

scheduler = AsyncIOScheduler()
SCHEDULER_OWNER = f"{socket.gethostname()}:{os.getpid()}"


def _log(level: str, source: str, message: str):
    """Persist a log entry to the database."""
    with Session(engine) as session:
        session.add(AppLog(level=level, source=source, message=message))
        session.commit()


def _acquire_job_lease(lease_key: str, ttl_seconds: int | None = None) -> bool:
    ttl = ttl_seconds or settings.SCHEDULER_LOCK_TTL_SECONDS
    now = datetime.now(timezone.utc)
    with Session(engine) as session:
        lease = session.get(JobLease, lease_key)
        if lease and lease.expires_at > now and lease.owner != SCHEDULER_OWNER:
            return False
        if not lease:
            lease = JobLease(key=lease_key)
        lease.owner = SCHEDULER_OWNER
        lease.expires_at = now + timedelta(seconds=ttl)
        lease.updated_at = now
        session.add(lease)
        session.commit()
    return True


def _release_job_lease(lease_key: str):
    now = datetime.now(timezone.utc)
    with Session(engine) as session:
        lease = session.get(JobLease, lease_key)
        if lease and lease.owner == SCHEDULER_OWNER:
            lease.expires_at = now - timedelta(seconds=1)
            lease.updated_at = now
            session.add(lease)
            session.commit()


def _extract_instagram_quota_usage(payload: dict) -> int | None:
    if isinstance(payload.get("quota_usage"), int):
        return payload["quota_usage"]
    data = payload.get("data")
    if isinstance(data, list) and data:
        quota_usage = data[0].get("quota_usage")
        if isinstance(quota_usage, int):
            return quota_usage
    return None


# ── Job: Generate draft post (per platform) ──────────────────────────────

async def job_generate_draft(platform: str = "linkedin"):
    """Generate a new draft post for the specified platform."""
    lease_key = f"generate:{platform}"
    if not _acquire_job_lease(lease_key, ttl_seconds=600):
        logger.info("Skipping draft generation because lease is held: %s", lease_key)
        return

    prefix = "ig_" if platform == "instagram" else ""
    platform_enum = Platform.INSTAGRAM if platform == "instagram" else Platform.LINKEDIN
    auto_key = f"{prefix}auto_generate_drafts"
    pending_key = f"{prefix}max_pending_drafts"
    try:
        if get_setting(auto_key, "true") != "true":
            return

        max_pending = int(get_setting(pending_key, "3"))

        with Session(engine) as session:
            pending = session.exec(
                select(Post).where(
                    Post.platform == platform_enum,
                    col(Post.status).in_([PostStatus.DRAFT, PostStatus.APPROVED, PostStatus.SCHEDULED]),
                )
            ).all()
            if len(pending) >= max_pending:
                _log("INFO", "scheduler", f"[{platform}] Pipeline full ({len(pending)}/{max_pending}) — skipping.")
                return

            queued = session.exec(
                select(TopicIdea).where(TopicIdea.used == False).order_by(col(TopicIdea.created_at))
            ).first()
            if queued:
                topic = queued.topic
                queued.used = True
                session.add(queued)
                session.commit()
            else:
                topic = None

        if not topic:
            topics = await gemini_service.suggest_topics(count=1)
            topic = topics[0] if topics else "Aktuelle Trends am deutschen Arbeitsmarkt"

        result = await gemini_service.generate_post(topic, platform=platform)
        value_comment = await gemini_service.generate_value_comment(result["body"])

        with Session(engine) as session:
            post = Post(
                platform=platform_enum,
                topic=topic,
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

        _log("INFO", "scheduler", f"[{platform}] Draft generated: '{topic}' (Post #{post.id})")

    except Exception as e:
        _log("ERROR", "scheduler", f"[{platform}] Draft generation failed: {e}")
        logger.exception("Draft generation failed")
    finally:
        _release_job_lease(lease_key)


# ── Job: Publish scheduled post — LinkedIn ───────────────────────────────

async def job_publish_linkedin():
    """Publish the next approved/scheduled LinkedIn post."""
    lease_key = "publish:linkedin"
    if not _acquire_job_lease(lease_key):
        logger.info("Skipping LinkedIn publish because lease is already held")
        return

    try:
        with Session(engine) as session:
            account = session.exec(
                select(LinkedInAccount).where(LinkedInAccount.is_active == True)
            ).first()
            if not account or not account.access_token:
                _log("WARNING", "scheduler", "[linkedin] No active account — skipping publish.")
                return

            if linkedin_service.token_needs_refresh(account.token_expires_at):
                if account.refresh_token:
                    try:
                        tokens = await linkedin_service.refresh_access_token(account.refresh_token)
                        account.access_token = tokens["access_token"]
                        account.refresh_token = tokens.get("refresh_token", account.refresh_token)
                        account.token_expires_at = datetime.now(timezone.utc) + timedelta(
                            seconds=tokens["expires_in"]
                        )
                        session.add(account)
                        session.commit()
                        _log("INFO", "linkedin", "Token refreshed successfully.")
                    except Exception as e:
                        _log("ERROR", "linkedin", f"Token refresh failed: {e}")
                        return
                else:
                    _log("WARNING", "linkedin", "Token expired and no refresh token — re-auth needed.")
                    return

            post = session.exec(
                select(Post)
                .where(
                    Post.platform == Platform.LINKEDIN,
                    col(Post.status).in_([PostStatus.SCHEDULED, PostStatus.APPROVED]),
                )
                .order_by(col(Post.created_at))
            ).first()

            if not post:
                _log("INFO", "scheduler", "[linkedin] No posts ready to publish.")
                return

            person_urn = f"urn:li:person:{account.linkedin_user_id}"

            try:
                image_urn = None
                if post.image_path:
                    image_urn = await linkedin_service.upload_image(
                        str(account.access_token), person_urn, post.image_path
                    )

                post_urn = await linkedin_service.create_post(
                    str(account.access_token), person_urn, post.body, image_urn
                )

                post.platform_post_id = post_urn
                post.status = PostStatus.PUBLISHED
                post.published_at = datetime.now(timezone.utc)
                session.add(post)
                session.commit()

                _log("INFO", "linkedin", f"Published Post #{post.id}: {post_urn}")

                if post.value_comment:
                    delay_min = int(get_setting("value_comment_delay_min", "60"))
                    scheduler.add_job(
                        _post_linkedin_comment,
                        "date",
                        run_date=datetime.now(timezone.utc) + timedelta(minutes=delay_min),
                        args=[post.id],
                        id=f"li_comment_{post.id}",
                    )

            except Exception as e:
                post.status = PostStatus.FAILED
                post.notes = f"Publish error: {e}"
                session.add(post)
                session.commit()
                _log("ERROR", "linkedin", f"Publish failed for Post #{post.id}: {e}")
                logger.exception("Publish failed")
    finally:
        _release_job_lease(lease_key)


async def _post_linkedin_comment(post_id: int):
    """Post the value comment under the published LinkedIn post."""
    with Session(engine) as session:
        post = session.get(Post, post_id)
        if not post or not post.platform_post_id or not post.value_comment:
            return

        account = session.exec(
            select(LinkedInAccount).where(LinkedInAccount.is_active == True)
        ).first()
        if not account or not account.access_token:
            return

        person_urn = f"urn:li:person:{account.linkedin_user_id}"

        try:
            comment_urn = await linkedin_service.create_comment(
                account.access_token,
                post.platform_post_id,
                person_urn,
                post.value_comment,
            )
            post.platform_comment_id = comment_urn
            session.add(post)
            session.commit()
            _log("INFO", "linkedin", f"Value comment posted on Post #{post_id}")
        except Exception as e:
            _log("ERROR", "linkedin", f"Value comment failed for Post #{post_id}: {e}")


# ── Job: Publish scheduled post — Instagram ──────────────────────────────

async def job_publish_instagram():
    """Publish the next approved/scheduled Instagram post."""
    lease_key = "publish:instagram"
    if not _acquire_job_lease(lease_key):
        logger.info("Skipping Instagram publish because lease is already held")
        return

    try:
        with Session(engine) as session:
            account = session.exec(
                select(InstagramAccount).where(InstagramAccount.is_active == True)
            ).first()
            if not account or not account.access_token:
                _log("WARNING", "scheduler", "[instagram] No active account — skipping publish.")
                return

            if instagram_service.token_needs_refresh(account.token_expires_at):
                try:
                    tokens = await instagram_service.refresh_long_lived_token(account.access_token)
                    account.access_token = tokens["access_token"]
                    account.token_expires_at = datetime.now(timezone.utc) + timedelta(
                        seconds=tokens["expires_in"]
                    )
                    session.add(account)
                    session.commit()
                    _log("INFO", "instagram", "Token refreshed successfully.")
                except Exception as e:
                    _log("ERROR", "instagram", f"Token refresh failed: {e}")
                    return

            post = session.exec(
                select(Post)
                .where(
                    Post.platform == Platform.INSTAGRAM,
                    col(Post.status).in_([PostStatus.SCHEDULED, PostStatus.APPROVED]),
                )
                .order_by(col(Post.created_at))
            ).first()

            if not post:
                _log("INFO", "scheduler", "[instagram] No posts ready to publish.")
                return

            try:
                rate_payload = await instagram_service.check_rate_limit(str(account.access_token), account.ig_user_id)
                quota_usage = _extract_instagram_quota_usage(rate_payload)
                if quota_usage is not None and quota_usage >= 100:
                    raise RuntimeError("Instagram publishing limit reached for the current 24-hour window")

                if not post.image_path or not settings.MEDIA_PUBLIC_BASE_URL:
                    raise RuntimeError("Instagram publishing requires MEDIA_PUBLIC_BASE_URL and a generated image.")

                base = settings.MEDIA_PUBLIC_BASE_URL.rstrip("/")
                image_url = f"{base}/images/{post.id}"

                caption = post.body
                if post.hashtags:
                    placement = get_setting("ig_hashtag_placement", "caption")
                    if placement == "caption":
                        caption = f"{caption}\n\n{post.hashtags}"

                container_id = await instagram_service.create_image_container(
                    str(account.access_token), account.ig_user_id, image_url, caption,
                )
                post.ig_container_id = container_id

                for _ in range(12):
                    await asyncio.sleep(5)
                    status = await instagram_service.check_container_status(
                        str(account.access_token), container_id,
                    )
                    if status == "FINISHED":
                        break
                    if status == "ERROR":
                        raise RuntimeError(f"Container {container_id} errored during processing")
                else:
                    raise RuntimeError(f"Container {container_id} timed out after 60s")

                media_id = await instagram_service.publish_container(
                    str(account.access_token), account.ig_user_id, container_id,
                )

                post.platform_post_id = media_id
                post.status = PostStatus.PUBLISHED
                post.published_at = datetime.now(timezone.utc)
                session.add(post)
                session.commit()

                _log("INFO", "instagram", f"Published Post #{post.id}: {media_id}")

                if post.value_comment:
                    delay_min = int(get_setting("value_comment_delay_min", "60"))
                    scheduler.add_job(
                        _post_instagram_comment,
                        "date",
                        run_date=datetime.now(timezone.utc) + timedelta(minutes=delay_min),
                        args=[post.id],
                        id=f"ig_comment_{post.id}",
                    )

            except Exception as e:
                post.status = PostStatus.FAILED
                post.notes = f"Publish error: {e}"
                session.add(post)
                session.commit()
                _log("ERROR", "instagram", f"Publish failed for Post #{post.id}: {e}")
                logger.exception("IG publish failed")
    finally:
        _release_job_lease(lease_key)


async def _post_instagram_comment(post_id: int):
    """Post the value comment under the published Instagram post."""
    with Session(engine) as session:
        post = session.get(Post, post_id)
        if not post or not post.platform_post_id or not post.value_comment:
            return

        account = session.exec(
            select(InstagramAccount).where(InstagramAccount.is_active == True)
        ).first()
        if not account or not account.access_token:
            return

        try:
            comment_id = await instagram_service.post_comment(
                account.access_token, post.platform_post_id, post.value_comment,
            )
            post.platform_comment_id = comment_id
            session.add(post)
            session.commit()
            _log("INFO", "instagram", f"Value comment posted on Post #{post_id}")
        except Exception as e:
            _log("ERROR", "instagram", f"Value comment failed for Post #{post_id}: {e}")


# ── Scheduler Setup ──────────────────────────────────────────────────────

def _read_schedule_settings() -> dict:
    """Read current schedule parameters for both platforms."""
    values = get_settings(
        [
            "posting_days", "posting_hour", "posting_minute",
            "ig_posting_days", "ig_posting_hour", "ig_posting_minute",
        ],
        defaults={
            "posting_days": "1,3",
            "posting_hour": "9",
            "posting_minute": "0",
            "ig_posting_days": "0,2,4",
            "ig_posting_hour": "12",
            "ig_posting_minute": "0",
        },
    )
    return {
        "li_days": values["posting_days"],
        "li_hour": int(values["posting_hour"]),
        "li_minute": int(values["posting_minute"]),
        "ig_days": values["ig_posting_days"],
        "ig_hour": int(values["ig_posting_hour"]),
        "ig_minute": int(values["ig_posting_minute"]),
    }


def setup_scheduler():
    """Configure all scheduled jobs from DB settings."""
    if scheduler.running:
        logger.info("Scheduler already running; startup skipped")
        return

    sched = _read_schedule_settings()

    # LinkedIn draft generation (daily 07:00)
    scheduler.add_job(
        job_generate_draft, "cron", hour=7, minute=0,
        args=["linkedin"], id="li_generate_draft", replace_existing=True,
    )
    # Instagram draft generation (daily 07:30)
    scheduler.add_job(
        job_generate_draft, "cron", hour=7, minute=30,
        args=["instagram"], id="ig_generate_draft", replace_existing=True,
    )

    # LinkedIn publish
    scheduler.add_job(
        job_publish_linkedin, "cron",
        day_of_week=sched["li_days"],
        hour=sched["li_hour"], minute=sched["li_minute"],
        id="li_publish", replace_existing=True,
    )
    # Instagram publish
    scheduler.add_job(
        job_publish_instagram, "cron",
        day_of_week=sched["ig_days"],
        hour=sched["ig_hour"], minute=sched["ig_minute"],
        id="ig_publish", replace_existing=True,
    )

    scheduler.start()
    logger.info(
        "Scheduler started — LI: days=%s @%02d:%02d | IG: days=%s @%02d:%02d",
        sched["li_days"], sched["li_hour"], sched["li_minute"],
        sched["ig_days"], sched["ig_hour"], sched["ig_minute"],
    )


def reschedule(platform: str = "all"):
    """Re-read settings and update publish job schedules."""
    sched = _read_schedule_settings()
    if platform in ("all", "linkedin"):
        scheduler.reschedule_job(
            "li_publish", trigger="cron",
            day_of_week=sched["li_days"],
            hour=sched["li_hour"], minute=sched["li_minute"],
        )
    if platform in ("all", "instagram"):
        scheduler.reschedule_job(
            "ig_publish", trigger="cron",
            day_of_week=sched["ig_days"],
            hour=sched["ig_hour"], minute=sched["ig_minute"],
        )
    logger.info("Scheduler rescheduled for platform=%s", platform)


def get_next_run(platform: str = "linkedin") -> datetime | None:
    """Get the next scheduled publish time for a platform."""
    job_id = "li_publish" if platform == "linkedin" else "ig_publish"
    job = scheduler.get_job(job_id)
    if job and job.next_run_time:
        return job.next_run_time
    return None
