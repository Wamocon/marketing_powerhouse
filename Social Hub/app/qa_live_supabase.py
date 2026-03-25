"""Non-destructive smoke test for a live Supabase-backed SocialHub deployment."""
from __future__ import annotations

import os
import subprocess
import sys
import time
from pathlib import Path

import httpx
from sqlalchemy import inspect

from app.config import settings
from app.database import engine

REPO_ROOT = Path(__file__).resolve().parent.parent
PYTHON_EXE = REPO_ROOT / ".venv" / "Scripts" / "python.exe"
HOST = os.getenv("QA_LIVE_HOST", "127.0.0.1")
PORT = int(os.getenv("QA_LIVE_PORT", "8013"))
BASE_URL = f"http://{HOST}:{PORT}"


def assert_true(condition: bool, message: str):
    if not condition:
        raise AssertionError(message)
    print(f"OK - {message}")


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


def main():
    if not settings.USES_SUPABASE_DATABASE:
        raise SystemExit("Live Supabase QA requires DATABASE_URL or SUPABASE_DB_URL to point to Supabase Postgres.")

    inspector = inspect(engine)
    table_names = set(inspector.get_table_names(schema=settings.DATABASE_SCHEMA))
    expected_tables = {
        f"{settings.DATABASE_TABLE_PREFIX}posts",
        f"{settings.DATABASE_TABLE_PREFIX}linkedin_accounts",
        f"{settings.DATABASE_TABLE_PREFIX}instagram_accounts",
        f"{settings.DATABASE_TABLE_PREFIX}topic_ideas",
        f"{settings.DATABASE_TABLE_PREFIX}dynamic_settings",
        f"{settings.DATABASE_TABLE_PREFIX}app_logs",
        f"{settings.DATABASE_TABLE_PREFIX}job_leases",
    }
    missing_tables = sorted(expected_tables - table_names)
    assert_true(not missing_tables, f"live schema '{settings.DATABASE_SCHEMA}' has all SocialHub tables")

    env = os.environ.copy()
    server = start_server(env)
    try:
        with httpx.Client(base_url=BASE_URL, follow_redirects=False, timeout=15.0) as client:
            wait_for_server(client)

            health = client.get("/api/health")
            assert_true(health.status_code == 200, "health endpoint returned 200")
            payload = health.json()
            assert_true(payload.get("database") == "ok", "database health is ok")
            assert_true(payload.get("database_target") == "supabase", "runtime database target is Supabase")
            assert_true(payload.get("database_schema") == settings.DATABASE_SCHEMA, "runtime database schema matches configuration")
            supabase_api = payload.get("supabase_public_api", {})
            assert_true(supabase_api.get("status") == "ok", "Supabase public API check passed")

            for path in ["/", "/posts", "/generate", "/topics", "/settings", "/logs"]:
                response = client.get(path)
                assert_true(response.status_code == 200, f"GET {path} returned 200")

        print("\nLIVE SUPABASE SMOKE TEST PASSED")
    finally:
        stop_server(server)
        dump_server_output(server)


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"LIVE SUPABASE QA FAILED: {exc}")
        sys.exit(1)