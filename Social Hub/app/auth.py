# Social Hub — Authentication Bridge
"""
JWT-based authentication that validates tokens issued by Momentum's Supabase Auth.
Social Hub trusts the same Supabase project for identity verification.

Flow:
  1. Momentum creates a short-lived JWT with user_id, company_id
  2. Social Hub validates the JWT signature using the Supabase JWT secret
  3. Extracts company_id and user_id for request scoping

For the web dashboard, we also support a simple API key fallback
for server-to-server calls.
"""
import hmac
import hashlib
import logging
import time
from dataclasses import dataclass
from typing import Optional

import jwt
from fastapi import Request, HTTPException

from app.config import settings

logger = logging.getLogger("auth")

# Supabase JWT secret — from project settings (Settings > API > JWT Secret)
_SUPABASE_JWT_SECRET = settings.SUPABASE_JWT_SECRET


@dataclass
class AuthContext:
    """Authenticated request context."""
    user_id: str
    company_id: str
    role: str = "member"
    email: str = ""


def _extract_bearer_token(request: Request) -> Optional[str]:
    """Extract Bearer token from Authorization header."""
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        return auth_header[7:].strip()
    return None


def _extract_company_id(request: Request) -> Optional[str]:
    """Extract company_id from query params or header."""
    company_id = request.query_params.get("company_id")
    if not company_id:
        company_id = request.headers.get("X-Company-Id")
    return company_id


def validate_supabase_jwt(token: str) -> dict:
    """
    Validate a Supabase-issued JWT.
    Returns the decoded payload or raises HTTPException.
    """
    if not _SUPABASE_JWT_SECRET:
        logger.warning("SUPABASE_JWT_SECRET not configured — JWT signature verification disabled")
        try:
            payload = jwt.decode(
                token,
                options={"verify_signature": False, "verify_exp": True},
                algorithms=["HS256"],
            )
            return payload
        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=401, detail="Token expired")
        except jwt.InvalidTokenError as e:
            raise HTTPException(status_code=401, detail=f"Invalid token: {e}")

    try:
        payload = jwt.decode(
            token,
            _SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            options={"verify_exp": True},
            audience="authenticated",
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {e}")


async def get_auth_context(request: Request) -> AuthContext:
    """
    Extract and validate authentication from the request.
    
    Supports:
    1. Supabase JWT in Authorization header (from Momentum App)
    2. Session-based auth (for Social Hub web dashboard)
    """
    # Try JWT token first
    token = _extract_bearer_token(request)
    if token:
        payload = validate_supabase_jwt(token)
        user_id = payload.get("sub", "")
        if not user_id:
            raise HTTPException(status_code=401, detail="Missing user identity in token")
        
        company_id = _extract_company_id(request)
        if not company_id:
            # Try to get from token metadata
            user_metadata = payload.get("user_metadata", {})
            company_id = user_metadata.get("company_id", "")
        
        if not company_id:
            raise HTTPException(status_code=400, detail="company_id required")
        
        role = payload.get("role", "authenticated")
        email = payload.get("email", "")
        
        return AuthContext(
            user_id=user_id,
            company_id=company_id,
            role=role,
            email=email,
        )
    
    # Fallback: session-based for web dashboard
    session_id = request.cookies.get("_session_id")
    company_id = _extract_company_id(request) or request.cookies.get("_company_id", "")
    
    if session_id and company_id:
        return AuthContext(
            user_id=session_id,
            company_id=company_id,
            role="dashboard",
        )
    
    raise HTTPException(status_code=401, detail="Authentication required")


async def get_optional_auth(request: Request) -> Optional[AuthContext]:
    """Same as get_auth_context but returns None instead of raising."""
    try:
        return await get_auth_context(request)
    except HTTPException:
        return None
