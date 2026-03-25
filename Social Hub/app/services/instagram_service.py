# Social Media Marketing Hub — Instagram API Service
"""
Handles Instagram Business Login OAuth and Content Publishing API.
- OAuth: Business Login → short-lived token → long-lived token → refresh
- Publishing: create container → publish → check status
- Comments: post value comments under published media
"""
import asyncio
from datetime import datetime, timezone, timedelta

import httpx

from app.config import settings
from app.services.resilience import request_with_retry

IG_GRAPH_BASE = "https://graph.instagram.com"
IG_GRAPH_VERSION = "v25.0"
IG_AUTH_URL = "https://www.instagram.com/oauth/authorize"
IG_TOKEN_URL = "https://api.instagram.com/oauth/access_token"

SCOPES = "instagram_business_basic,instagram_business_content_publish,instagram_business_manage_comments"


# ── OAuth ────────────────────────────────────────────────────────────────

def get_authorization_url(state: str) -> str:
    """Build the Instagram Business Login authorization URL."""
    params = {
        "client_id": settings.INSTAGRAM_APP_ID,
        "redirect_uri": settings.INSTAGRAM_REDIRECT_URI,
        "response_type": "code",
        "scope": SCOPES,
        "state": state,
    }
    qs = "&".join(f"{k}={httpx.URL('', params={k: v}).params[k]}" for k, v in params.items())
    return f"{IG_AUTH_URL}?{qs}"


async def exchange_code_for_token(code: str) -> dict:
    """Exchange authorization code for a short-lived access token."""
    resp = await request_with_retry(
        "POST",
        IG_TOKEN_URL,
        service_name="Instagram",
        data={
            "client_id": settings.INSTAGRAM_APP_ID,
            "client_secret": settings.INSTAGRAM_APP_SECRET,
            "grant_type": "authorization_code",
            "redirect_uri": settings.INSTAGRAM_REDIRECT_URI,
            "code": code,
        },
    )
    data = resp.json()
    if "data" in data and isinstance(data["data"], list):
        data = data["data"][0]
    return {
        "access_token": data["access_token"],
        "user_id": str(data.get("user_id", "")),
        "permissions": data.get("permissions", ""),
    }


async def exchange_for_long_lived_token(short_lived_token: str) -> dict:
    """Exchange a short-lived token for a long-lived token (60 days)."""
    resp = await request_with_retry(
        "GET",
        f"{IG_GRAPH_BASE}/access_token",
        service_name="Instagram",
        params={
            "grant_type": "ig_exchange_token",
            "client_secret": settings.INSTAGRAM_APP_SECRET,
            "access_token": short_lived_token,
        },
    )
    data = resp.json()
    return {
        "access_token": data["access_token"],
        "token_type": data.get("token_type", "bearer"),
        "expires_in": data.get("expires_in", 5183944),
    }


async def refresh_long_lived_token(token: str) -> dict:
    """Refresh a long-lived token for another 60 days."""
    resp = await request_with_retry(
        "GET",
        f"{IG_GRAPH_BASE}/refresh_access_token",
        service_name="Instagram",
        params={
            "grant_type": "ig_refresh_token",
            "access_token": token,
        },
    )
    data = resp.json()
    return {
        "access_token": data["access_token"],
        "token_type": data.get("token_type", "bearer"),
        "expires_in": data.get("expires_in", 5183944),
    }


async def get_user_profile(access_token: str) -> dict:
    """Get the authenticated user's Instagram profile."""
    resp = await request_with_retry(
        "GET",
        f"{IG_GRAPH_BASE}/{IG_GRAPH_VERSION}/me",
        service_name="Instagram",
        params={
            "fields": "user_id,username",
            "access_token": access_token,
        },
    )
    data = resp.json()
    if "data" in data and isinstance(data["data"], list):
        data = data["data"][0]
    return data


# ── Content Publishing ───────────────────────────────────────────────────

async def create_image_container(
    access_token: str,
    ig_user_id: str,
    image_url: str,
    caption: str,
    alt_text: str = "",
) -> str:
    """Create an image media container. Returns container ID."""
    payload = {
        "image_url": image_url,
        "caption": caption,
        "access_token": access_token,
    }
    if alt_text:
        payload["alt_text"] = alt_text

    resp = await request_with_retry(
        "POST",
        f"{IG_GRAPH_BASE}/{IG_GRAPH_VERSION}/{ig_user_id}/media",
        service_name="Instagram",
        data=payload,
    )
    return resp.json()["id"]


async def create_reel_container(
    access_token: str,
    ig_user_id: str,
    video_url: str,
    caption: str,
) -> str:
    """Create a Reel media container. Returns container ID."""
    resp = await request_with_retry(
        "POST",
        f"{IG_GRAPH_BASE}/{IG_GRAPH_VERSION}/{ig_user_id}/media",
        service_name="Instagram",
        data={
            "media_type": "REELS",
            "video_url": video_url,
            "caption": caption,
            "access_token": access_token,
        },
    )
    return resp.json()["id"]


async def create_carousel_container(
    access_token: str,
    ig_user_id: str,
    children_ids: list[str],
    caption: str,
) -> str:
    """Create a carousel container from child container IDs."""
    resp = await request_with_retry(
        "POST",
        f"{IG_GRAPH_BASE}/{IG_GRAPH_VERSION}/{ig_user_id}/media",
        service_name="Instagram",
        data={
            "media_type": "CAROUSEL",
            "children": ",".join(children_ids),
            "caption": caption,
            "access_token": access_token,
        },
    )
    return resp.json()["id"]


async def publish_container(
    access_token: str,
    ig_user_id: str,
    container_id: str,
) -> str:
    """Publish a media container. Returns the published media ID."""
    resp = await request_with_retry(
        "POST",
        f"{IG_GRAPH_BASE}/{IG_GRAPH_VERSION}/{ig_user_id}/media_publish",
        service_name="Instagram",
        data={
            "creation_id": container_id,
            "access_token": access_token,
        },
    )
    return resp.json()["id"]


async def check_container_status(access_token: str, container_id: str) -> str:
    """Check publishing status. Returns: FINISHED, IN_PROGRESS, ERROR, EXPIRED, PUBLISHED."""
    resp = await request_with_retry(
        "GET",
        f"{IG_GRAPH_BASE}/{IG_GRAPH_VERSION}/{container_id}",
        service_name="Instagram",
        params={
            "fields": "status_code",
            "access_token": access_token,
        },
    )
    return resp.json().get("status_code", "ERROR")


async def check_rate_limit(access_token: str, ig_user_id: str) -> dict:
    """Check current publishing rate limit usage."""
    resp = await request_with_retry(
        "GET",
        f"{IG_GRAPH_BASE}/{IG_GRAPH_VERSION}/{ig_user_id}/content_publishing_limit",
        service_name="Instagram",
        params={"access_token": access_token},
    )
    return resp.json()


# ── Comments ─────────────────────────────────────────────────────────────

async def post_comment(access_token: str, media_id: str, text: str) -> str:
    """Post a comment on a published media object. Returns comment ID."""
    resp = await request_with_retry(
        "POST",
        f"{IG_GRAPH_BASE}/{IG_GRAPH_VERSION}/{media_id}/comments",
        service_name="Instagram",
        data={
            "message": text,
            "access_token": access_token,
        },
    )
    return resp.json().get("id", "")


# ── Insights ─────────────────────────────────────────────────────────────

async def get_media_insights(access_token: str, media_id: str) -> dict:
    """Get insights for a published media object."""
    resp = await request_with_retry(
        "GET",
        f"{IG_GRAPH_BASE}/{IG_GRAPH_VERSION}/{media_id}/insights",
        service_name="Instagram",
        params={
            "metric": "impressions,reach,engagement",
            "access_token": access_token,
        },
    )
    result = {}
    for item in resp.json().get("data", []):
        name = item.get("name", "")
        values = item.get("values", [{}])
        result[name] = values[0].get("value", 0) if values else 0
    return result


async def get_account_insights(
    access_token: str,
    ig_user_id: str,
    period: str = "day",
) -> dict:
    """Get account-level insights."""
    resp = await request_with_retry(
        "GET",
        f"{IG_GRAPH_BASE}/{IG_GRAPH_VERSION}/{ig_user_id}/insights",
        service_name="Instagram",
        params={
            "metric": "impressions,reach,profile_views",
            "period": period,
            "access_token": access_token,
        },
    )
    result = {}
    for item in resp.json().get("data", []):
        name = item.get("name", "")
        values = item.get("values", [{}])
        result[name] = values[-1].get("value", 0) if values else 0
    return result


# ── Helpers ──────────────────────────────────────────────────────────────

def token_needs_refresh(expires_at: datetime | None) -> bool:
    """Check if the token is expired or will expire within 7 days."""
    if not expires_at:
        return True
    return datetime.now(timezone.utc) > expires_at - timedelta(days=7)
