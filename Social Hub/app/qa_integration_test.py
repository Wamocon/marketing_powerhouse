# Social Hub — Integration QA Test Suite
"""
End-to-end tests for the Social Hub ↔ Momentum App integration.
Tests the API v1 endpoints, database bridge, auth, and error handling.

Run: python -m pytest app/qa_integration_test.py -v
  or: python app/qa_integration_test.py
"""
import asyncio
import json
import os
import sys
import time
import traceback
from datetime import datetime, timezone, timedelta
from uuid import uuid4

# Ensure app module is importable
SOCIAL_HUB_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if SOCIAL_HUB_DIR not in sys.path:
    sys.path.insert(0, SOCIAL_HUB_DIR)

import httpx

BASE_URL = "http://127.0.0.1:8000"
TEST_COMPANY_ID = "c1"
TEST_SESSION_ID = "qa-test-session"

# Simulates a cookie-authenticated session
AUTH_COOKIES = {
    "_session_id": TEST_SESSION_ID,
    "_company_id": TEST_COMPANY_ID,
}

results: list[dict] = []


def _log(test_name: str, passed: bool, detail: str = ""):
    status = "PASS" if passed else "FAIL"
    results.append({"name": test_name, "passed": passed, "detail": detail})
    icon = "✅" if passed else "❌"
    print(f"  {icon} {test_name}" + (f" — {detail}" if detail else ""))


async def run_all_tests():
    print("\n" + "=" * 70)
    print("  SOCIAL HUB ↔ MOMENTUM INTEGRATION QA")
    print("  " + datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
    print("=" * 70 + "\n")

    async with httpx.AsyncClient(base_url=BASE_URL, timeout=30.0) as client:
        # ────────────────────────────────────────────────────────
        # 1. Health & System Check
        # ────────────────────────────────────────────────────────
        print("── 1. Health & System ──────────────────────────")

        # 1.1 API v1 Health
        try:
            r = await client.get("/api/v1/health")
            data = r.json()
            _log("API v1 health endpoint returns 200", r.status_code == 200)
            _log("API v1 health reports version 2.0.0", data.get("version") == "2.0.0")
            _log("API v1 health reports momentum-integrated mode", data.get("mode") == "momentum-integrated")
            _log("API v1 health database is ok", data.get("database") == "ok")
            _log("API v1 health schema is test", data.get("schema") == "test")
        except Exception as e:
            _log("API v1 health endpoint", False, str(e))

        # 1.2 Old health endpoint still works
        try:
            r = await client.get("/api/health")
            _log("Legacy health endpoint backward-compatible", r.status_code == 200)
        except Exception as e:
            _log("Legacy health endpoint", False, str(e))

        # 1.3 Dashboard still works
        try:
            r = await client.get("/")
            _log("Dashboard page loads", r.status_code == 200 and "SocialHub" in r.text)
        except Exception as e:
            _log("Dashboard page", False, str(e))

        # ────────────────────────────────────────────────────────
        # 2. Authentication
        # ────────────────────────────────────────────────────────
        print("\n── 2. Authentication ──────────────────────────")

        # 2.1 No auth → 401
        try:
            r = await client.get(f"/api/v1/readiness/{TEST_COMPANY_ID}")
            _log("Unauthenticated request returns 401", r.status_code == 401)
        except Exception as e:
            _log("Unauthenticated request", False, str(e))

        # 2.2 Cookie auth → 200
        try:
            r = await client.get(
                f"/api/v1/readiness/{TEST_COMPANY_ID}",
                cookies=AUTH_COOKIES,
            )
            _log("Cookie-authenticated request returns 200", r.status_code == 200)
        except Exception as e:
            _log("Cookie auth", False, str(e))

        # 2.3 Wrong company → 403
        try:
            r = await client.get(
                "/api/v1/readiness/wrong-company",
                cookies=AUTH_COOKIES,
            )
            _log("Cross-company access returns 403", r.status_code == 403)
        except Exception as e:
            _log("Cross-company access", False, str(e))

        # ────────────────────────────────────────────────────────
        # 3. Readiness Check
        # ────────────────────────────────────────────────────────
        print("\n── 3. Readiness Check ─────────────────────────")

        try:
            r = await client.get(
                f"/api/v1/readiness/{TEST_COMPANY_ID}",
                cookies=AUTH_COOKIES,
            )
            data = r.json()
            _log("Readiness returns score", "score" in data and isinstance(data["score"], int))
            _log("Readiness returns items list", "items" in data and isinstance(data["items"], list))
            _log("Readiness items have correct structure",
                 all({"label", "state", "detail"} <= set(item) for item in data["items"]))
            _log("Readiness item states are valid",
                 all(item["state"] in ("ready", "warn", "issue") for item in data["items"]))
        except Exception as e:
            _log("Readiness check", False, str(e))

        # ────────────────────────────────────────────────────────
        # 4. Posts CRUD (via Momentum tables)
        # ────────────────────────────────────────────────────────
        print("\n── 4. Posts Management ────────────────────────")

        # 4.1 List posts (empty company)
        try:
            r = await client.get(
                f"/api/v1/posts/{TEST_COMPANY_ID}",
                cookies=AUTH_COOKIES,
            )
            data = r.json()
            _log("List posts returns 200", r.status_code == 200)
            _log("List posts returns array", isinstance(data, list))
        except Exception as e:
            _log("List posts", False, str(e))

        # 4.2 Publish non-existent post → 404
        try:
            fake_id = str(uuid4())
            r = await client.post(
                f"/api/v1/publish/{fake_id}",
                cookies=AUTH_COOKIES,
            )
            _log("Publish non-existent post returns 404", r.status_code == 404)
        except Exception as e:
            _log("Publish non-existent", False, str(e))

        # 4.3 Regenerate text on non-existent post → 404
        try:
            r = await client.post(
                f"/api/v1/regenerate-text/{str(uuid4())}",
                json={"instruction": "make it shorter"},
                cookies=AUTH_COOKIES,
            )
            _log("Regenerate text non-existent returns 404", r.status_code == 404)
        except Exception as e:
            _log("Regenerate text non-existent", False, str(e))

        # 4.4 Regenerate image on non-existent post → 404
        try:
            r = await client.post(
                f"/api/v1/regenerate-image/{str(uuid4())}",
                cookies=AUTH_COOKIES,
            )
            _log("Regenerate image non-existent returns 404", r.status_code == 404)
        except Exception as e:
            _log("Regenerate image non-existent", False, str(e))

        # ────────────────────────────────────────────────────────
        # 5. Generate AI Post (requires Google API key)
        # ────────────────────────────────────────────────────────
        print("\n── 5. AI Generation ───────────────────────────")

        # 5.1 Generate without account → 400
        try:
            r = await client.post(
                "/api/v1/generate",
                json={
                    "company_id": TEST_COMPANY_ID,
                    "platform": "linkedin",
                    "topic": "Test topic for QA",
                },
                cookies=AUTH_COOKIES,
            )
            # Expected: 400 because no connected_accounts exist for c1
            _log("Generate without connected account returns 400",
                 r.status_code == 400 and "account" in r.json().get("detail", "").lower())
        except Exception as e:
            _log("Generate without account", False, str(e))

        # ────────────────────────────────────────────────────────
        # 6. Error Handling
        # ────────────────────────────────────────────────────────
        print("\n── 6. Error Handling ──────────────────────────")

        # 6.1 Validation error (missing body fields)
        try:
            r = await client.post(
                "/api/v1/topics/suggest",
                content=b"not-json",
                headers={"Content-Type": "application/json"},
                cookies=AUTH_COOKIES,
            )
            _log("Malformed JSON returns 422", r.status_code == 422)
            data = r.json()
            _log("Validation error has structured response", "detail" in data or "error" in data)
        except Exception as e:
            _log("Validation error", False, str(e))

        # 6.2 404 on API returns JSON
        try:
            r = await client.get("/api/v1/nonexistent-endpoint")
            _log("Unknown API path returns 404 or 405", r.status_code in (404, 405))
        except Exception as e:
            _log("Unknown API path", False, str(e))

        # 6.3 404 on HTML returns error page
        try:
            r = await client.get("/nonexistent-page")
            _log("Unknown page returns error template", r.status_code == 404 and "error" in r.text.lower())
        except Exception as e:
            _log("Unknown page", False, str(e))

        # ────────────────────────────────────────────────────────
        # 7. Database Bridge Verification
        # ────────────────────────────────────────────────────────
        print("\n── 7. Database Bridge ─────────────────────────")

        try:
            from sqlmodel import Session, select
            from app.database import engine
            from app.momentum_models import (
                MomentumScheduledPost, MomentumConnectedAccount,
                MomentumContent, MomentumCompany,
            )

            with Session(engine) as session:
                # 7.1 Can read connected_accounts
                accounts = session.exec(select(MomentumConnectedAccount).limit(5)).all()
                _log("Can read Momentum connected_accounts table", True, f"{len(accounts)} records")

                # 7.2 Can read scheduled_posts
                posts = session.exec(select(MomentumScheduledPost).limit(5)).all()
                _log("Can read Momentum scheduled_posts table", True, f"{len(posts)} records")

                # 7.3 Can read contents
                contents = session.exec(select(MomentumContent).limit(5)).all()
                _log("Can read Momentum contents table", True, f"{len(contents)} records")

                # 7.4 Verify new columns exist on scheduled_posts
                test_post = MomentumScheduledPost(
                    id=str(uuid4()),
                    company_id="qa-test",
                    connected_account_id=str(uuid4()),
                    post_text="QA test post",
                    scheduled_at=datetime.now(timezone.utc),
                    status="draft",
                    topic="QA Test Topic",
                    image_prompt="test prompt",
                    sources="test source",
                    notes="QA test note",
                )
                session.add(test_post)
                session.commit()
                _log("Can write to scheduled_posts with new columns", True, f"ID: {test_post.id}")

                # 7.5 Read it back
                readback = session.get(MomentumScheduledPost, test_post.id)
                _log("New columns persisted correctly",
                     readback is not None
                     and readback.topic == "QA Test Topic"
                     and readback.image_prompt == "test prompt"
                     and readback.sources == "test source")

                # Cleanup
                session.delete(readback)
                session.commit()
                _log("Cleanup: test post deleted", True)

        except Exception as e:
            _log("Database bridge", False, f"{e}\n{traceback.format_exc()}")

        # ────────────────────────────────────────────────────────
        # 8. Legacy Dashboard & Routes
        # ────────────────────────────────────────────────────────
        print("\n── 8. Legacy Dashboard ────────────────────────")

        for path, name in [
            ("/", "Dashboard"),
            ("/posts", "Posts list"),
            ("/generate", "Generate page"),
            ("/topics", "Topics page"),
            ("/settings", "Settings page"),
            ("/logs", "Logs page"),
        ]:
            try:
                r = await client.get(path)
                _log(f"{name} ({path}) returns 200", r.status_code == 200)
            except Exception as e:
                _log(f"{name} ({path})", False, str(e))

        # ────────────────────────────────────────────────────────
        # 9. CORS Headers
        # ────────────────────────────────────────────────────────
        print("\n── 9. CORS & Security ─────────────────────────")

        try:
            r = await client.options(
                "/api/v1/health",
                headers={
                    "Origin": "http://localhost:3000",
                    "Access-Control-Request-Method": "GET",
                },
            )
            cors_origin = r.headers.get("access-control-allow-origin", "")
            _log("CORS allows localhost:3000", "localhost:3000" in cors_origin or cors_origin == "*")
        except Exception as e:
            _log("CORS check", False, str(e))

        try:
            r = await client.get("/")
            _log("X-Content-Type-Options header set",
                 r.headers.get("x-content-type-options") == "nosniff")
            _log("X-Frame-Options header set",
                 r.headers.get("x-frame-options") == "DENY")
        except Exception as e:
            _log("Security headers", False, str(e))

        # ────────────────────────────────────────────────────────
        # 10. Scheduler Verification
        # ────────────────────────────────────────────────────────
        print("\n── 10. Scheduler ──────────────────────────────")

        try:
            r = await client.get("/api/v1/health")
            data = r.json()
            _log("Scheduler is running", data.get("scheduler_running", False))
            jobs = data.get("scheduler_jobs", [])
            _log("publish_due job registered", "publish_due" in jobs)
            _log("Scheduler jobs reported via health API", len(jobs) > 0, str(jobs))
        except Exception as e:
            _log("Scheduler", False, str(e))

    # ────────────────────────────────────────────────────────
    # Summary
    # ────────────────────────────────────────────────────────
    print("\n" + "=" * 70)
    passed = sum(1 for r in results if r["passed"])
    failed = sum(1 for r in results if not r["passed"])
    total = len(results)
    print(f"  RESULTS: {passed}/{total} passed, {failed} failed")
    if failed:
        print(f"\n  FAILED TESTS:")
        for r in results:
            if not r["passed"]:
                print(f"    ❌ {r['name']}" + (f" — {r['detail']}" if r['detail'] else ""))
    print("=" * 70 + "\n")
    return failed == 0


if __name__ == "__main__":
    success = asyncio.run(run_all_tests())
    sys.exit(0 if success else 1)
