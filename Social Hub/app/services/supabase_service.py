"""Supabase project connectivity helpers for public API validation."""

from app.config import settings
from app.services.resilience import public_error_message, request_with_retry


def is_configured() -> bool:
    return bool(settings.SUPABASE_URL and settings.SUPABASE_PUBLIC_KEY)


async def check_public_api() -> dict[str, str]:
    if not is_configured():
        return {"status": "missing", "schema": settings.SUPABASE_SCHEMA}

    key = settings.SUPABASE_PUBLIC_KEY
    key_type = "publishable" if settings.SUPABASE_PUBLISHABLE_KEY else "anon"
    headers = {
        "apikey": key,
    }

    try:
        await request_with_retry(
            "GET",
            f"{settings.SUPABASE_URL.rstrip('/')}/auth/v1/settings",
            service_name="Supabase",
            headers=headers,
            retries=1,
        )
        return {
            "status": "ok",
            "schema": settings.SUPABASE_SCHEMA,
            "key_type": key_type,
        }
    except Exception as exc:
        return {
            "status": "error",
            "schema": settings.SUPABASE_SCHEMA,
            "key_type": key_type,
            "message": public_error_message(exc, "Supabase Data API check failed."),
        }