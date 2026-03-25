# LinkedIn Automation — LinkedIn API Service
"""
Handles LinkedIn OAuth 2.0 and Posts API (w_member_social).
- OAuth: authorization code flow → access token → refresh
- Posts: create text+image posts, upload images, write comments
"""
from datetime import datetime, timezone, timedelta
from pathlib import Path

import httpx

from app.config import settings
from app.services.resilience import request_with_retry

LINKEDIN_AUTH_URL = "https://www.linkedin.com/oauth/v2/authorization"
LINKEDIN_TOKEN_URL = "https://www.linkedin.com/oauth/v2/accessToken"
LINKEDIN_API_BASE = "https://api.linkedin.com/rest"

# Required scopes for "Share on LinkedIn" product
SCOPES = "openid profile w_member_social"


# ── OAuth ────────────────────────────────────────────────────────────────

def get_authorization_url(state: str) -> str:
    """Build the LinkedIn OAuth authorization URL."""
    params = {
        "response_type": "code",
        "client_id": settings.LINKEDIN_CLIENT_ID,
        "redirect_uri": settings.LINKEDIN_REDIRECT_URI,
        "state": state,
        "scope": SCOPES,
    }
    qs = "&".join(f"{k}={httpx.URL('', params={k: v}).params[k]}" for k, v in params.items())
    return f"{LINKEDIN_AUTH_URL}?{qs}"


async def exchange_code_for_token(code: str) -> dict:
    """Exchange authorization code for access + refresh tokens."""
    resp = await request_with_retry(
        "POST",
        LINKEDIN_TOKEN_URL,
        service_name="LinkedIn",
        data={
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": settings.LINKEDIN_REDIRECT_URI,
            "client_id": settings.LINKEDIN_CLIENT_ID,
            "client_secret": settings.LINKEDIN_CLIENT_SECRET,
        },
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    data = resp.json()
    return {
        "access_token": data["access_token"],
        "expires_in": data.get("expires_in", 5184000),
        "refresh_token": data.get("refresh_token"),
        "refresh_token_expires_in": data.get("refresh_token_expires_in"),
    }


async def refresh_access_token(refresh_token: str) -> dict:
    """Refresh an expired access token."""
    resp = await request_with_retry(
        "POST",
        LINKEDIN_TOKEN_URL,
        service_name="LinkedIn",
        data={
            "grant_type": "refresh_token",
            "refresh_token": refresh_token,
            "client_id": settings.LINKEDIN_CLIENT_ID,
            "client_secret": settings.LINKEDIN_CLIENT_SECRET,
        },
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    data = resp.json()
    return {
        "access_token": data["access_token"],
        "expires_in": data.get("expires_in", 5184000),
        "refresh_token": data.get("refresh_token", refresh_token),
    }


async def get_user_profile(access_token: str) -> dict:
    """Get the authenticated user's profile (name, sub/URN)."""
    resp = await request_with_retry(
        "GET",
        "https://api.linkedin.com/v2/userinfo",
        service_name="LinkedIn",
        headers={"Authorization": f"Bearer {access_token}"},
    )
    return resp.json()


# ── Posts API ────────────────────────────────────────────────────────────

async def upload_image(access_token: str, person_urn: str, image_path: str) -> str:
    """
    Upload an image to LinkedIn and return the image URN.
    Uses the Images API (initialize upload → PUT binary → get URN).
    """
    headers = {
        "Authorization": f"Bearer {access_token}",
        "LinkedIn-Version": "202401",
        "X-Restli-Protocol-Version": "2.0.0",
        "Content-Type": "application/json",
    }

    # Step 1: Initialize upload
    init_resp = await request_with_retry(
        "POST",
        f"{LINKEDIN_API_BASE}/images?action=initializeUpload",
        service_name="LinkedIn",
        headers=headers,
        json={"initializeUploadRequest": {"owner": person_urn}},
    )
    init_data = init_resp.json()
    upload_url = init_data["value"]["uploadUrl"]
    image_urn = init_data["value"]["image"]

    # Step 2: Upload the binary — resolve relative paths
    img_path = Path(image_path)
    if not img_path.is_absolute():
        from app.config import DATA_DIR
        img_path = DATA_DIR / img_path
    image_bytes = img_path.read_bytes()
    await request_with_retry(
        "PUT",
        upload_url,
        service_name="LinkedIn image upload",
        content=image_bytes,
        headers={
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/octet-stream",
        },
    )

    return image_urn


async def create_post(
    access_token: str,
    person_urn: str,
    text: str,
    image_urn: str | None = None,
) -> str:
    """
    Create a LinkedIn post (text, optionally with image).
    Returns the post URN.
    """
    headers = {
        "Authorization": f"Bearer {access_token}",
        "LinkedIn-Version": "202401",
        "X-Restli-Protocol-Version": "2.0.0",
        "Content-Type": "application/json",
    }

    payload: dict = {
        "author": person_urn,
        "lifecycleState": "PUBLISHED",
        "visibility": "PUBLIC",
        "commentary": text,
        "distribution": {
            "feedDistribution": "MAIN_FEED",
            "targetEntities": [],
            "thirdPartyDistributionChannels": [],
        },
    }

    if image_urn:
        payload["content"] = {
            "media": {
                "id": image_urn,
            }
        }

    resp = await request_with_retry(
        "POST",
        f"{LINKEDIN_API_BASE}/posts",
        service_name="LinkedIn",
        headers=headers,
        json=payload,
    )
    return resp.headers.get("x-restli-id", "")


async def create_comment(
    access_token: str,
    post_urn: str,
    person_urn: str,
    text: str,
) -> str:
    """
    Write a comment under a LinkedIn post.
    Uses w_member_social — works for own posts and others' posts.
    Returns the comment URN.
    """
    headers = {
        "Authorization": f"Bearer {access_token}",
        "LinkedIn-Version": "202401",
        "X-Restli-Protocol-Version": "2.0.0",
        "Content-Type": "application/json",
    }

    payload = {
        "actor": person_urn,
        "message": {
            "text": text,
        },
    }

    # URL-encode the post URN for the path
    encoded_urn = httpx.URL("", params={"urn": post_urn}).params["urn"]
    resp = await request_with_retry(
        "POST",
        f"{LINKEDIN_API_BASE}/socialActions/{encoded_urn}/comments",
        service_name="LinkedIn",
        headers=headers,
        json=payload,
    )
    return resp.headers.get("x-restli-id", "")


def token_needs_refresh(expires_at: datetime | None) -> bool:
    """Check if the token is expired or will expire within 7 days."""
    if not expires_at:
        return True
    return datetime.now(timezone.utc) > expires_at - timedelta(days=7)
