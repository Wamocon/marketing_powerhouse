# Social Hub — Scheduler Service v2 (Momentum-Integrated)
"""
Automated publishing pipeline that reads from Momentum's `scheduled_posts` table.

Jobs:
1. Draft generation: Create AI drafts into scheduled_posts (per company/platform)
2. Publish: Find posts with status='scheduled' whose scheduled_at has arrived
3. Value comments: Auto-comment after publish delay

The scheduler polls Momentum's tables directly via the shared Supabase connection.
"""
import asyncio
import logging
import os
import socket
from datetime import datetime, timezone, timedelta

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from sqlmodel import Session, select, col

from app.config import settings, DATA_DIR
from app.database import (
    engine, AppLog, JobLease, TopicIdea,
    get_setting, get_settings,
)
from app.momentum_models import (
    MomentumScheduledPost, MomentumConnectedAccount, MomentumCompany,
)
from app.services import gemini_service, imagen_service, linkedin_service, instagram_service
from app.services.token_encryption import encrypt_token, decrypt_token

logger = logging.getLogger("scheduler_v2")

scheduler = AsyncIOScheduler()
SCHEDULER_OWNER = f"{socket.gethostname()}:{os.getpid()}"


def _log(level: str, source: str, message: str):
    """Persist a log entry to the database."""
    try:
        with Session(engine) as session:
            session.add(AppLog(level=level, source=source, message=message))
            session.commit()
    except Exception:
        logger.warning("Could not write log: %s", message)


def _acquire_lease(key: str, ttl: int | None = None) -> bool:
    """Acquire a distributed lock for a job."""
    ttl_val = ttl or settings.SCHEDULER_LOCK_TTL_SECONDS
    now = datetime.now(timezone.utc)
    with Session(engine) as session:
        lease = session.get(JobLease, key)
        if lease and lease.expires_at:
            # Ensure timezone-aware comparison
            expires = lease.expires_at.replace(tzinfo=timezone.utc) if lease.expires_at.tzinfo is None else lease.expires_at
            if expires > now and lease.owner != SCHEDULER_OWNER:
                return False
        if not lease:
            lease = JobLease(key=key)
        lease.owner = SCHEDULER_OWNER
        lease.expires_at = now + timedelta(seconds=ttl_val)
        lease.updated_at = now
        session.add(lease)
        session.commit()
    return True


def _release_lease(key: str):
    """Release a distributed lock."""
    now = datetime.now(timezone.utc)
    with Session(engine) as session:
        lease = session.get(JobLease, key)
        if lease and lease.owner == SCHEDULER_OWNER:
            lease.expires_at = now - timedelta(seconds=1)
            lease.updated_at = now
            session.add(lease)
            session.commit()


# ── Job: Publish due posts ───────────────────────────────────────────────

async def job_publish_due():
    """
    Find all scheduled_posts with status='scheduled' and scheduled_at <= now.
    Publish them to the appropriate platform.
    """
    lease_key = "publish:due"
    if not _acquire_lease(lease_key):
        return

    try:
        now = datetime.now(timezone.utc)
        with Session(engine) as session:
            due_posts = session.exec(
                select(MomentumScheduledPost)
                .where(
                    MomentumScheduledPost.status == "scheduled",
                    col(MomentumScheduledPost.scheduled_at) <= now,
                )
                .order_by(col(MomentumScheduledPost.scheduled_at))
                .limit(10)
            ).all()

            if not due_posts:
                return

            for post in due_posts:
                try:
                    account = session.get(MomentumConnectedAccount, post.connected_account_id)
                    if not account or not account.access_token_encrypted:
                        post.status = "failed"
                        post.error_message = "Connected account missing or not authenticated."
                        post.updated_at = datetime.now(timezone.utc)
                        session.add(post)
                        session.commit()
                        _log("WARNING", "scheduler", f"No account for post {post.id}")
                        continue

                    post.status = "publishing"
                    post.updated_at = datetime.now(timezone.utc)
                    session.add(post)
                    session.commit()

                    platform = account.platform
                    access_token = decrypt_token(account.access_token_encrypted)

                    if platform == "linkedin":
                        await _do_publish_linkedin(post, access_token, account, session)
                    elif platform == "instagram":
                        await _do_publish_instagram(post, access_token, account, session)
                    else:
                        post.status = "failed"
                        post.error_message = f"Unsupported platform: {platform}"
                        post.updated_at = datetime.now(timezone.utc)
                        session.add(post)
                        session.commit()

                except Exception as e:
                    logger.exception("Publish failed for post %s", post.id)
                    post.status = "failed"
                    post.error_message = str(e)[:500]
                    post.retry_count = (post.retry_count or 0) + 1
                    post.updated_at = datetime.now(timezone.utc)
                    session.add(post)
                    session.commit()
                    _log("ERROR", "scheduler", f"Publish failed for {post.id}: {e}")

    finally:
        _release_lease(lease_key)


async def _do_publish_linkedin(
    post: MomentumScheduledPost,
    access_token: str,
    account: MomentumConnectedAccount,
    session: Session,
):
    """Publish a single post to LinkedIn."""
    platform_user_id = account.platform_user_id or (account.account_metadata or {}).get("linkedin_user_id", "")
    if not platform_user_id:
        post.status = "failed"
        post.error_message = "LinkedIn account missing platform_user_id."
        session.add(post)
        session.commit()
        return

    person_urn = f"urn:li:person:{platform_user_id}"

    # Check token refresh
    if linkedin_service.token_needs_refresh(account.token_expires_at):
        refresh_token = decrypt_token(account.refresh_token_encrypted)
        if refresh_token:
            try:
                tokens = await linkedin_service.refresh_access_token(refresh_token)
                account.access_token_encrypted = encrypt_token(tokens["access_token"])
                account.refresh_token_encrypted = encrypt_token(tokens.get("refresh_token", refresh_token))
                account.token_expires_at = datetime.now(timezone.utc) + timedelta(seconds=tokens["expires_in"])
                access_token = tokens["access_token"]
                session.add(account)
                session.commit()
                _log("INFO", "linkedin", "Token refreshed.")
            except Exception as e:
                post.status = "failed"
                post.error_message = f"Token refresh failed: {e}"
                session.add(post)
                session.commit()
                return
        else:
            post.status = "failed"
            post.error_message = "Token expired, no refresh token."
            session.add(post)
            session.commit()
            return

    # Upload image if present
    image_urn = None
    if post.post_image_url:
        image_file = DATA_DIR / "images" / f"{post.id}.png"
        if image_file.exists():
            try:
                image_urn = await linkedin_service.upload_image(access_token, person_urn, str(image_file))
            except Exception as e:
                logger.warning("LinkedIn image upload failed: %s", e)

    # Create post
    post_urn = await linkedin_service.create_post(access_token, person_urn, post.post_text, image_urn)

    post.platform_post_id = post_urn
    post.status = "published"
    post.published_at = datetime.now(timezone.utc)
    post.updated_at = datetime.now(timezone.utc)
    session.add(post)
    session.commit()
    _log("INFO", "linkedin", f"Published {post.id}: {post_urn}")

    # Schedule value comment
    if post.auto_comment_text:
        delay_min = int(get_setting("value_comment_delay_min", "60"))
        scheduler.add_job(
            _post_value_comment,
            "date",
            run_date=datetime.now(timezone.utc) + timedelta(minutes=delay_min),
            args=[post.id, "linkedin"],
            id=f"comment_{post.id}",
            replace_existing=True,
        )


async def _do_publish_instagram(
    post: MomentumScheduledPost,
    access_token: str,
    account: MomentumConnectedAccount,
    session: Session,
):
    """Publish a single post to Instagram."""
    ig_user_id = account.platform_user_id or (account.account_metadata or {}).get("ig_user_id", "")
    if not ig_user_id:
        post.status = "failed"
        post.error_message = "Instagram account missing ig_user_id."
        session.add(post)
        session.commit()
        return

    if not settings.MEDIA_PUBLIC_BASE_URL:
        post.status = "failed"
        post.error_message = "MEDIA_PUBLIC_BASE_URL required for Instagram."
        session.add(post)
        session.commit()
        return

    # Token refresh
    if instagram_service.token_needs_refresh(account.token_expires_at):
        try:
            tokens = await instagram_service.refresh_long_lived_token(access_token)
            account.access_token_encrypted = encrypt_token(tokens["access_token"])
            account.token_expires_at = datetime.now(timezone.utc) + timedelta(seconds=tokens["expires_in"])
            access_token = tokens["access_token"]
            session.add(account)
            session.commit()
            _log("INFO", "instagram", "Token refreshed.")
        except Exception as e:
            post.status = "failed"
            post.error_message = f"Token refresh failed: {e}"
            session.add(post)
            session.commit()
            return

    # Rate limit check
    try:
        rate = await instagram_service.check_rate_limit(access_token, ig_user_id)
        quota = rate.get("quota_usage") if isinstance(rate, dict) else None
        if isinstance(quota, int) and quota >= 100:
            post.status = "failed"
            post.error_message = "Instagram publishing limit reached (24h window)."
            session.add(post)
            session.commit()
            return
    except Exception:
        pass  # Non-fatal, proceed with publish attempt

    base = settings.MEDIA_PUBLIC_BASE_URL.rstrip("/")
    image_url = post.post_image_url or f"{base}/images/{post.id}"

    caption = post.post_text
    if post.hashtags:
        hashtag_str = " ".join(post.hashtags) if isinstance(post.hashtags, list) else str(post.hashtags)
        caption = f"{caption}\n\n{hashtag_str}"

    container_id = await instagram_service.create_image_container(access_token, ig_user_id, image_url, caption)
    post.ig_container_id = container_id
    session.add(post)
    session.commit()

    # Poll
    for _ in range(12):
        await asyncio.sleep(5)
        container_status = await instagram_service.check_container_status(access_token, container_id)
        if container_status == "FINISHED":
            break
        if container_status == "ERROR":
            raise RuntimeError(f"Instagram container {container_id} failed.")
    else:
        raise RuntimeError(f"Instagram container {container_id} timed out.")

    media_id = await instagram_service.publish_container(access_token, ig_user_id, container_id)

    post.platform_post_id = media_id
    post.status = "published"
    post.published_at = datetime.now(timezone.utc)
    post.updated_at = datetime.now(timezone.utc)
    session.add(post)
    session.commit()
    _log("INFO", "instagram", f"Published {post.id}: {media_id}")

    if post.auto_comment_text:
        delay_min = int(get_setting("value_comment_delay_min", "60"))
        scheduler.add_job(
            _post_value_comment,
            "date",
            run_date=datetime.now(timezone.utc) + timedelta(minutes=delay_min),
            args=[post.id, "instagram"],
            id=f"comment_{post.id}",
            replace_existing=True,
        )


async def _post_value_comment(post_id: str, platform: str):
    """Post auto-comment on a published post."""
    with Session(engine) as session:
        post = session.get(MomentumScheduledPost, post_id)
        if not post or not post.platform_post_id or not post.auto_comment_text:
            return

        account = session.get(MomentumConnectedAccount, post.connected_account_id)
        if not account or not account.access_token_encrypted:
            return

        access_token = decrypt_token(account.access_token_encrypted)

        try:
            if platform == "linkedin":
                person_urn = f"urn:li:person:{account.platform_user_id}"
                comment_id = await linkedin_service.create_comment(
                    access_token, post.platform_post_id, person_urn, post.auto_comment_text,
                )
            else:
                comment_id = await instagram_service.post_comment(
                    access_token, post.platform_post_id, post.auto_comment_text,
                )

            post.platform_comment_id = comment_id
            post.auto_comment_posted = True
            post.auto_comment_at = datetime.now(timezone.utc)
            post.updated_at = datetime.now(timezone.utc)
            session.add(post)
            session.commit()
            _log("INFO", platform, f"Value comment posted on {post_id}")

        except Exception as e:
            _log("ERROR", platform, f"Value comment failed for {post_id}: {e}")


# ── Job: Retry failed publishes ──────────────────────────────────────────

async def job_retry_failed():
    """
    Find posts with status='failed' and retry_count < max_retries.
    Reset them to 'scheduled' so job_publish_due picks them up.
    """
    lease_key = "retry:failed"
    if not _acquire_lease(lease_key, ttl=120):
        return

    try:
        now = datetime.now(timezone.utc)
        with Session(engine) as session:
            failed_posts = session.exec(
                select(MomentumScheduledPost)
                .where(
                    MomentumScheduledPost.status == "failed",
                    col(MomentumScheduledPost.retry_count) < col(MomentumScheduledPost.max_retries),
                )
                .order_by(col(MomentumScheduledPost.updated_at))
                .limit(5)
            ).all()

            for post in failed_posts:
                post.status = "scheduled"
                post.scheduled_at = now + timedelta(minutes=5 * (post.retry_count + 1))
                post.error_message = None
                post.updated_at = now
                session.add(post)
                _log("INFO", "retry", f"Retrying post {post.id} (attempt {post.retry_count + 1}/{post.max_retries})")

            if failed_posts:
                session.commit()
                logger.info("Requeued %d failed posts for retry.", len(failed_posts))
    finally:
        _release_lease(lease_key)


# ── Scheduler Setup ──────────────────────────────────────────────────────

def _read_schedule_settings() -> dict:
    """Read interval settings from dynamic_settings."""
    values = get_settings(
        ["posting_days", "posting_hour", "posting_minute",
         "ig_posting_days", "ig_posting_hour", "ig_posting_minute"],
        defaults={
            "posting_days": "1,3", "posting_hour": "9", "posting_minute": "0",
            "ig_posting_days": "0,2,4", "ig_posting_hour": "12", "ig_posting_minute": "0",
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
    """Start the scheduler with all automated jobs."""
    if scheduler.running:
        logger.info("Scheduler already running")
        return

    # Check every 2 minutes for due posts (across ALL companies)
    scheduler.add_job(
        job_publish_due, "interval", minutes=2,
        id="publish_due", replace_existing=True,
    )

    # Retry failed posts every 10 minutes
    scheduler.add_job(
        job_retry_failed, "interval", minutes=10,
        id="retry_failed", replace_existing=True,
    )

    scheduler.start()
    logger.info("Scheduler v2 started — polling every 2 min for due posts, retrying failed every 10 min.")


def reschedule(platform: str = "all"):
    """Re-read settings (no-op in v2 since we use interval polling)."""
    logger.info("Reschedule requested for %s (no-op in polling mode).", platform)


def get_next_run(platform: str) -> datetime | None:
    """Get next scheduled publish run."""
    job = scheduler.get_job("publish_due")
    if job and job.next_run_time:
        return job.next_run_time
    return None
