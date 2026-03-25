"""End-to-end QA validation for SocialHub using isolated seeded test data."""
from __future__ import annotations

import os
import re
import subprocess
import sys
import time
from pathlib import Path

import httpx

REPO_ROOT = Path(__file__).resolve().parent.parent
PYTHON_EXE = REPO_ROOT / ".venv" / "Scripts" / "python.exe"
HOST = os.getenv("QA_HOST", "127.0.0.1")
PORT = int(os.getenv("QA_PORT", "8011"))
BASE_URL = os.getenv("QA_BASE_URL", f"http://{HOST}:{PORT}")
QA_DB_PATH = REPO_ROOT / "app" / "data" / "socialhub_qa.db"
CSRF_RE = re.compile(r'<meta name="csrf-token" content="([^"]+)"')


def assert_true(condition: bool, message: str):
    if not condition:
        raise AssertionError(message)
    print(f"OK - {message}")


def extract_csrf_token(html: str) -> str:
    match = CSRF_RE.search(html)
    if not match:
        raise AssertionError("Unable to find CSRF token in page HTML")
    return match.group(1)


def wait_for_server(client: httpx.Client, timeout_seconds: int = 25):
    deadline = time.time() + timeout_seconds
    last_error = "server did not respond"
    while time.time() < deadline:
        try:
            response = client.get("/api/health")
            if response.status_code == 200:
                return
            last_error = f"unexpected status {response.status_code}"
        except Exception as exc:
            last_error = str(exc)
        time.sleep(0.5)
    raise RuntimeError(f"Server did not become ready: {last_error}")


def seed_database(env: dict[str, str]):
    if QA_DB_PATH.exists():
        QA_DB_PATH.unlink()
    subprocess.run(
        [str(PYTHON_EXE), "-m", "app.seed_test_data", "--reset"],
        cwd=REPO_ROOT,
        env=env,
        check=True,
        capture_output=True,
        text=True,
    )


def start_server(env: dict[str, str]) -> subprocess.Popen[str]:
    return subprocess.Popen(
        [str(PYTHON_EXE), "-m", "uvicorn", "app.main:app", "--host", HOST, "--port", str(PORT)],
        cwd=REPO_ROOT,
        env=env,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
    )


def stop_server(process: subprocess.Popen[str]):
    process.terminate()
    try:
        process.wait(timeout=10)
    except subprocess.TimeoutExpired:
        process.kill()
        process.wait(timeout=5)


def dump_server_output(process: subprocess.Popen[str]):
    if process.stdout:
        output = process.stdout.read().strip()
        if output:
            print("\n--- uvicorn output ---")
            print(output)


def run_checks():
    env = os.environ.copy()
    env["DATABASE_URL"] = f"sqlite:///{QA_DB_PATH.as_posix()}"
    env["GOOGLE_API_KEY"] = ""
    env["NEXT_PUBLIC_GEMINI_API_KEY"] = ""
    env["SUPABASE_URL"] = ""
    env["SUPABASE_ANON_KEY"] = ""
    env["SUPABASE_PUBLISHABLE_KEY"] = ""
    env["NEXT_PUBLIC_SUPABASE_URL"] = ""
    env["NEXT_PUBLIC_SUPABASE_ANON_KEY"] = ""
    env["NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"] = ""

    seed_database(env)
    server = start_server(env)

    try:
        with httpx.Client(base_url=BASE_URL, follow_redirects=False, timeout=15.0) as client:
            wait_for_server(client)

            pages = [
                ("/", ["SocialHub", "Dashboard", "LinkedIn", "Instagram", "Published", "Draft"], ["Einstellungen", "Beitraege"]),
                ("/posts", ["Posts", "LinkedIn", "Instagram", "platform-badge"], []),
                ("/posts?platform=instagram", ["Instagram", "AI Tools", "Morning Routine"], []),
                ("/generate", ["Generate Post", "Platform", "LinkedIn", "Instagram", "Topic Suggestions"], []),
                ("/topics", ["Topic Queue", "New Topic", "AI Suggestions", "Load Suggestions"], []),
                ("/settings", ["Settings", "LinkedIn Account", "Instagram Account", "Save Settings"], []),
                ("/logs", ["Logs", "System log", "All", "Info", "Warnings", "Errors"], []),
                ("/posts/1", ["IT Skills Shortage", "LinkedIn", "platform-badge"], []),
                ("/posts/6", ["AI Tools", "Instagram", "platform-badge"], []),
            ]
            for path, must_contain, must_not_contain in pages:
                response = client.get(path)
                assert_true(response.status_code == 200, f"GET {path} returned 200")
                body = response.text
                for text in must_contain:
                    assert_true(text in body, f"{path} contains '{text}'")
                for text in must_not_contain:
                    assert_true(text not in body, f"{path} does not contain '{text}'")

            health = client.get("/api/health")
            assert_true(health.status_code == 200, "health endpoint returned 200")
            health_json = health.json()
            for key in ["status", "database", "instagram_api", "linkedin_api", "next_instagram_publish", "next_linkedin_publish"]:
                assert_true(key in health_json, f"health payload contains '{key}'")

            csv_export = client.get("/api/posts/export?format=csv")
            assert_true(csv_export.status_code == 200, "CSV export returned 200")
            assert_true("platform" in csv_export.text and "linkedin" in csv_export.text and "instagram" in csv_export.text, "CSV export includes both platform values")

            posts_json = client.get("/api/posts/export?format=json")
            assert_true(posts_json.status_code == 200, "JSON export returned 200")
            exported_posts = posts_json.json()
            assert_true(len(exported_posts) == 8, "seeded export contains 8 posts")

            dashboard = client.get("/")
            csrf_token = extract_csrf_token(dashboard.text)

            invalid_bulk = client.post("/api/posts/bulk", json={"action": "approve", "ids": [1]})
            assert_true(invalid_bulk.status_code == 403, "bulk action rejects missing CSRF token")
            assert_true("error" in invalid_bulk.json(), "bulk CSRF rejection returns JSON error")

            theme_response = client.post("/api/theme", headers={"X-CSRF-Token": csrf_token}, json={"theme": "dark"})
            assert_true(theme_response.status_code == 200, "theme toggle returned 200")
            assert_true(theme_response.json().get("theme") == "dark", "theme toggle returned selected theme")

            topics_page = client.get("/topics")
            topics_csrf = extract_csrf_token(topics_page.text)
            topic_name = "QA Topic: Multi-tenant social approval"
            add_topic = client.post("/topics/add", data={"topic": topic_name, "csrf_token": topics_csrf})
            assert_true(add_topic.status_code in (302, 303), "topic add redirected successfully")
            assert_true(add_topic.headers.get("location") == "/topics", "topic add redirected to /topics")
            topics_after_add = client.get("/topics")
            assert_true(topic_name in topics_after_add.text, "new topic is visible after add")

            topic_delete_match = re.search(
                rf"{re.escape(topic_name)}.*?action=\"/topics/(\d+)/delete\"",
                topics_after_add.text,
                flags=re.S,
            )
            assert_true(topic_delete_match is not None, "new topic exposes a delete action")
            created_topic_id = int(topic_delete_match.group(1)) if topic_delete_match else 0

            delete_topic = client.post(f"/topics/{created_topic_id}/delete", data={"csrf_token": topics_csrf})
            assert_true(delete_topic.status_code in (302, 303), "topic delete redirected successfully")
            topics_after_delete = client.get("/topics")
            assert_true(topic_name not in topics_after_delete.text, "topic is removed after delete")

            settings_page = client.get("/settings")
            settings_csrf = extract_csrf_token(settings_page.text)
            save_settings = client.post(
                "/settings/save",
                data={
                    "csrf_token": settings_csrf,
                    "posting_days": "Monday,Wednesday",
                    "ig_posting_days": "Sunday,Tuesday,Thursday",
                    "posting_time": "10:30",
                    "ig_posting_time": "13:15",
                    "language": "English",
                    "tone": "consultative",
                    "max_pending_drafts": "4",
                    "ig_max_pending_drafts": "5",
                    "auto_generate_drafts": "on",
                    "ig_auto_generate_drafts": "on",
                },
            )
            assert_true(save_settings.status_code in (302, 303), "settings save redirected successfully")
            settings_after_save = client.get("/settings")
            assert_true("English" in settings_after_save.text, "saved language appears in settings page")
            assert_true("consultative" in settings_after_save.text, "saved tone appears in settings page")

            bulk_approve = client.post(
                "/api/posts/bulk",
                headers={"X-CSRF-Token": csrf_token},
                json={"action": "approve", "ids": [1]},
            )
            assert_true(bulk_approve.status_code == 200, "bulk approve returned 200")
            assert_true(bulk_approve.json().get("success") is True, "bulk approve returned success")

            updated_posts = client.get("/api/posts/export?format=json").json()
            post_one = next(post for post in updated_posts if post["id"] == 1)
            assert_true(post_one["status"] == "approved", "bulk approve changed post 1 to approved")

            rewrite_response = client.post(
                "/api/posts/1/regenerate-text",
                headers={"X-CSRF-Token": csrf_token},
                json={"instruction": "Shorten this into a punchier version."},
            )
            assert_true(rewrite_response.status_code in (200, 500), "rewrite endpoint returned controlled status")
            rewrite_json = rewrite_response.json()
            if rewrite_response.status_code == 200:
                assert_true(bool(rewrite_json.get("body")), "rewrite endpoint returned rewritten body")
            else:
                assert_true("error" in rewrite_json, "rewrite failure returned JSON error")

            generate_response = client.post(
                "/generate",
                data={"topic": "QA generation topic", "platform": "linkedin", "csrf_token": csrf_token},
            )
            assert_true(generate_response.status_code in (302, 303), "generate action redirected instead of crashing")
            assert_true(generate_response.headers.get("location") == "/generate", "generate failure redirected back to /generate")

            duplicate_response = client.post("/posts/1/duplicate", data={"csrf_token": csrf_token})
            assert_true(duplicate_response.status_code in (302, 303), "duplicate post redirected successfully")
            duplicate_location = duplicate_response.headers.get("location", "")
            assert_true(duplicate_location.startswith("/posts/"), "duplicate redirect points to new post")
            duplicate_detail = client.get(duplicate_location)
            assert_true("[Copy] IT Skills Shortage in 2026" in duplicate_detail.text, "duplicate post detail renders new copy")

            duplicate_post_id = int(duplicate_location.rsplit("/", 1)[-1])
            delete_duplicate = client.post(f"/posts/{duplicate_post_id}/delete", data={"csrf_token": csrf_token})
            assert_true(delete_duplicate.status_code in (302, 303), "delete duplicate redirected successfully")

            publish_now = client.post("/posts/2/publish-now", data={"csrf_token": csrf_token})
            assert_true(publish_now.status_code in (302, 303), "publish-now redirected with user-safe response")
            publish_state = client.get("/api/posts/export?format=json").json()
            approved_post = next(post for post in publish_state if post["id"] == 2)
            assert_true(approved_post["status"] == "approved", "publish-now preflight left approved post unchanged when account is disconnected")

        print("\nALL END-TO-END QA CHECKS PASSED")
    finally:
        stop_server(server)
        dump_server_output(server)


if __name__ == "__main__":
    try:
        run_checks()
    except Exception as exc:
        print(f"QA FAILED: {exc}")
        sys.exit(1)
