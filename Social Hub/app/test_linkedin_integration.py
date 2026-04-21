"""LinkedIn Integration — Comprehensive Test Suite"""
import asyncio
import sys

PASS = "\033[92m[PASS]\033[0m"
FAIL = "\033[91m[FAIL]\033[0m"
WARN = "\033[93m[WARN]\033[0m"

failures = 0


def check(label: str, condition: bool):
    global failures
    if condition:
        print(f"  {PASS} {label}")
    else:
        print(f"  {FAIL} {label}")
        failures += 1


def warn(label: str, detail: str):
    print(f"  {WARN} {label}: {detail}")


def section(title: str):
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}")


# ── TEST 1: Configuration ───────────────────────────────────
section("TEST 1: Configuration Loading")
from app.config import settings

check("LINKEDIN_CLIENT_ID set", bool(settings.LINKEDIN_CLIENT_ID))
check("LINKEDIN_CLIENT_SECRET set", bool(settings.LINKEDIN_CLIENT_SECRET))
check("LINKEDIN_REDIRECT_URI set", bool(settings.LINKEDIN_REDIRECT_URI))
check("Redirect URI is production", "momentum-marketing.app" in settings.LINKEDIN_REDIRECT_URI)
check("TOKEN_ENCRYPTION_KEY set", bool(settings.TOKEN_ENCRYPTION_KEY))
check("GOOGLE_API_KEY set", bool(settings.GOOGLE_API_KEY))
check("SUPABASE_URL set", bool(settings.SUPABASE_URL))
check("Database is Supabase", settings.USES_SUPABASE_DATABASE)
check("APP_SECRET_KEY not default", settings.APP_SECRET_KEY != "")
print(f"  Redirect URI: {settings.LINKEDIN_REDIRECT_URI}")

# ── TEST 2: Database Connection ─────────────────────────────
section("TEST 2: Database Connection & Tables")
from sqlmodel import Session, select, text
from app.database import engine
from app.momentum_models import (
    MomentumConnectedAccount, MomentumScheduledPost,
    MomentumEngagementMetric, MomentumCompany, SocialHubSettings,
    SocialAnalyticsSnapshot, MomentumContent,
)

with Session(engine) as session:
    result = session.exec(text("SELECT 1")).first()
    check("Database connection alive", result is not None)

    tables = {
        "connected_accounts": MomentumConnectedAccount,
        "scheduled_posts": MomentumScheduledPost,
        "engagement_metrics": MomentumEngagementMetric,
        "companies": MomentumCompany,
        "social_hub_settings": SocialHubSettings,
        "social_analytics_snapshots": SocialAnalyticsSnapshot,
        "contents": MomentumContent,
    }
    for name, model in tables.items():
        try:
            rows = session.exec(select(model)).all()
            check(f"{name}: {len(rows)} rows", True)
        except Exception as e:
            check(f"{name}: accessible", False)
            warn(name, str(e)[:80])

    # LinkedIn account check
    li_accounts = session.exec(
        select(MomentumConnectedAccount).where(
            MomentumConnectedAccount.platform == "linkedin",
            MomentumConnectedAccount.is_active == True,
        )
    ).all()
    check("LinkedIn account exists in DB", len(li_accounts) > 0)
    for a in li_accounts:
        check(f"  Account '{a.account_name}' has token", bool(a.access_token_encrypted))
        check(f"  Account '{a.account_name}' has platform_user_id", bool(a.platform_user_id))
        if a.token_expires_at:
            from datetime import datetime, timezone
            is_valid = a.token_expires_at > datetime.now(timezone.utc)
            check(f"  Account '{a.account_name}' token not expired", is_valid)
            print(f"    Token expires: {a.token_expires_at.isoformat()}")

# ── TEST 3: OAuth URL ───────────────────────────────────────
section("TEST 3: LinkedIn OAuth URL Generation")
from app.services.linkedin_service import get_authorization_url, SCOPES

url = get_authorization_url("test_state_abc123")
check("URL contains LinkedIn auth endpoint", "linkedin.com/oauth/v2/authorization" in url)
check("URL contains client_id", "client_id=77gisv9l63msl2" in url)
check("URL contains redirect_uri", "momentum-marketing.app" in url)
check("URL contains response_type=code", "response_type=code" in url)
check("URL contains state parameter", "state=test_state_abc123" in url)
check("URL contains w_member_social scope", "w_member_social" in url)
check("URL contains openid scope", "openid" in url)
print(f"  Scopes: {SCOPES}")

# ── TEST 4: Token Encryption ────────────────────────────────
section("TEST 4: Token Encryption Round-Trip")
from app.services.token_encryption import encrypt_token, decrypt_token

test_tokens = [
    "ya29.a0ARrdaM_test_access_token_12345",
    "dQw4w9WgXcQ_refresh_token_67890",
    "",
    "short",
    "x" * 500,
]
for tok in test_tokens:
    enc = encrypt_token(tok)
    dec = decrypt_token(enc)
    label = tok[:40] + "..." if len(tok) > 40 else (tok or "(empty string)")
    check(f"Roundtrip: {label}", dec == tok)
    if tok:
        check(f"  Actually encrypted (not plaintext)", enc != tok)

# ── TEST 5: API Routes ──────────────────────────────────────
section("TEST 5: API Route Registration")
from app.api_v1 import router

routes = [r.path for r in router.routes if hasattr(r, "path")]
required_routes = [
    "/api/v1/generate",
    "/api/v1/publish/{post_id}",
    "/api/v1/readiness/{company_id}",
    "/api/v1/posts/{company_id}",
    "/api/v1/accounts/{company_id}",
    "/api/v1/analytics/{company_id}",
    "/api/v1/auth/linkedin/url",
    "/api/v1/auth/linkedin/disconnect",
    "/api/v1/stats/sync/{company_id}",
    "/api/v1/settings/{company_id}",
    "/api/v1/health",
    "/api/v1/topics/suggest",
    "/api/v1/regenerate-text/{post_id}",
    "/api/v1/regenerate-image/{post_id}",
    "/api/v1/posts/{post_id}/approve",
    "/api/v1/posts/{post_id}/reject",
    "/api/v1/generate-from-task",
    "/api/v1/generate-from-campaign",
]
for route in required_routes:
    check(f"Route: {route}", route in routes)
print(f"  Total routes registered: {len(routes)}")

# ── TEST 6: App Loads ───────────────────────────────────────
section("TEST 6: FastAPI App Initialization")
from app.main import app

check("App object created", app is not None)
check("App has routes", len(app.routes) > 0)
print(f"  Total app routes: {len(app.routes)}")

# OAuth routes in main app
main_paths = [r.path for r in app.routes if hasattr(r, "path")]
check("OAuth /auth/linkedin route exists", "/auth/linkedin" in main_paths)
check("OAuth /auth/linkedin/callback exists", "/auth/linkedin/callback" in main_paths)

# ── TEST 7: LinkedIn API Connectivity ────────────────────────
section("TEST 7: LinkedIn API Connectivity (Live)")


async def test_linkedin_api():
    import httpx

    # Test 1: LinkedIn OAuth endpoint is reachable
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(
                "https://www.linkedin.com/oauth/v2/authorization",
                params={"response_type": "code", "client_id": settings.LINKEDIN_CLIENT_ID},
                follow_redirects=False,
            )
            # LinkedIn returns 200 (login page) or 302 — both mean it's reachable
            check("LinkedIn OAuth endpoint reachable", resp.status_code in (200, 302, 303, 400))
            print(f"    Status: {resp.status_code}")
    except Exception as e:
        check("LinkedIn OAuth endpoint reachable", False)
        warn("Network", str(e)[:80])

    # Test 2: LinkedIn API base is reachable (will 401 without token, that's OK)
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(
                "https://api.linkedin.com/v2/userinfo",
                headers={"Authorization": "Bearer invalid_test"},
            )
            # 401 means the API is reachable but auth failed (expected)
            check("LinkedIn API endpoint reachable", resp.status_code in (401, 403))
            print(f"    Status: {resp.status_code} (401/403 expected — API is alive)")
    except Exception as e:
        check("LinkedIn API endpoint reachable", False)
        warn("Network", str(e)[:80])


asyncio.run(test_linkedin_api())

# ── TEST 8: OAuth State HMAC ────────────────────────────────
section("TEST 8: OAuth State HMAC Integrity")
import hmac
import hashlib
import secrets

raw_state = secrets.token_urlsafe(32)
company_id = "test-company-123"
user_id = "test-user-456"
state_payload = f"{raw_state}:{company_id}:{user_id}"
state_mac = hmac.new(
    settings.APP_SECRET_KEY.encode(), state_payload.encode(), hashlib.sha256
).hexdigest()[:16]
full_state = f"{state_payload}:{state_mac}"

# Verify parsing
parts = full_state.split(":")
check("State has 4 parts", len(parts) == 4)
check("Raw state matches", parts[0] == raw_state)
check("Company ID matches", parts[1] == company_id)
check("User ID matches", parts[2] == user_id)

# Verify HMAC
expected_payload = f"{parts[0]}:{parts[1]}:{parts[2]}"
expected_mac = hmac.new(
    settings.APP_SECRET_KEY.encode(), expected_payload.encode(), hashlib.sha256
).hexdigest()[:16]
check("HMAC verification passes", hmac.compare_digest(parts[3], expected_mac))

# Tamper test
tampered_payload = f"{parts[0]}:hacked-company:{parts[2]}"
tampered_mac = hmac.new(
    settings.APP_SECRET_KEY.encode(), tampered_payload.encode(), hashlib.sha256
).hexdigest()[:16]
check("Tampered HMAC differs", not hmac.compare_digest(parts[3], tampered_mac))

# ── TEST 9: Gemini AI Service ───────────────────────────────
section("TEST 9: Google AI (Gemini) Configuration")
try:
    from app.services import gemini_service
    check("Gemini service module loads", True)
    check("Gemini model configured", settings.GEMINI_MODEL == "gemini-2.5-pro")
    check("Imagen model configured", settings.IMAGEN_MODEL == "imagen-4-ultra")
except Exception as e:
    check("Gemini service module loads", False)
    warn("Import", str(e)[:80])

# ── SUMMARY ─────────────────────────────────────────────────
section("SUMMARY")
if failures == 0:
    print(f"  \033[92mALL TESTS PASSED\033[0m")
else:
    print(f"  \033[91m{failures} TEST(S) FAILED\033[0m")
print()
sys.exit(failures)
