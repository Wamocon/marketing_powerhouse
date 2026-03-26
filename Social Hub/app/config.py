# Social Media Marketing Hub — App Configuration
import os
import re
from pathlib import Path

from dotenv import load_dotenv


def normalize_database_url(database_url: str) -> str:
    normalized = database_url.strip()
    if normalized.startswith("postgres://"):
        normalized = "postgresql+psycopg://" + normalized[len("postgres://"):]
    elif normalized.startswith("postgresql://"):
        normalized = "postgresql+psycopg://" + normalized[len("postgresql://"):]

    if is_supabase_database_url(normalized) and "sslmode=" not in normalized:
        separator = "&" if "?" in normalized else "?"
        normalized = f"{normalized}{separator}sslmode=require"

    return normalized


def env_first(*names: str, default: str = "") -> str:
    for name in names:
        value = os.getenv(name)
        if value is not None and value.strip() != "":
            return value.strip()
    return default


def normalize_identifier(raw_value: str, default: str) -> str:
    normalized = (raw_value or default).strip().lower().replace("-", "_")
    if not normalized:
        return default
    if not re.fullmatch(r"[a-z_][a-z0-9_]*", normalized):
        return default
    return normalized


def normalize_table_prefix(raw_value: str, default: str = "socialhub_") -> str:
    normalized = (raw_value or default).strip().lower().replace("-", "_")
    if not normalized:
        return ""
    if not re.fullmatch(r"[a-z_][a-z0-9_]*", normalized):
        return default
    return normalized


def normalize_app_env(raw_value: str, default: str = "test") -> str:
    normalized = (raw_value or default).strip().lower()
    if normalized in {"prod", "production"}:
        return "production"
    if normalized == "test":
        return "test"
    return default


def default_schema_for_env(app_env: str) -> str:
    # Both frontend and backend use `public` for production (Supabase default)
    return "public" if app_env == "production" else "test"


def is_supabase_database_url(database_url: str) -> bool:
    return any(host in database_url for host in ("supabase.co", "supabase.com", "pooler.supabase.com"))


def env_bool(name: str, default: bool) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


BASE_DIR = Path(__file__).resolve().parent
REPO_ROOT = BASE_DIR.parent
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(exist_ok=True)

load_dotenv(BASE_DIR / ".env")
load_dotenv(REPO_ROOT / ".env")


class Settings:
    APP_ENV: str = normalize_app_env(env_first("APP_ENV", "SOCIALHUB_ENV", default="test"))

    # Google AI
    GOOGLE_API_KEY: str = env_first("GOOGLE_API_KEY", "NEXT_PUBLIC_GEMINI_API_KEY")

    # Supabase public/project configuration
    SUPABASE_URL: str = env_first("SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL")
    SUPABASE_ANON_KEY: str = env_first("SUPABASE_ANON_KEY", "NEXT_PUBLIC_SUPABASE_ANON_KEY")
    SUPABASE_JWT_SECRET: str = os.getenv("SUPABASE_JWT_SECRET", "")
    SUPABASE_PUBLISHABLE_KEY: str = env_first("SUPABASE_PUBLISHABLE_KEY", "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY")
    SOCIAL_HUB_PATH_PREFIX: str = env_first("SOCIAL_HUB_PATH_PREFIX", default="/social-hub")
    SUPABASE_SCHEMA: str = normalize_identifier(
        env_first("SUPABASE_SCHEMA", "NEXT_PUBLIC_SUPABASE_SCHEMA", default=default_schema_for_env(APP_ENV)),
        default_schema_for_env(APP_ENV),
    )
    DATABASE_SCHEMA: str = normalize_identifier(
        env_first("DATABASE_SCHEMA", default=SUPABASE_SCHEMA),
        SUPABASE_SCHEMA,
    )
    DATABASE_TABLE_PREFIX: str = normalize_table_prefix(env_first("DATABASE_TABLE_PREFIX", default="socialhub_"))

    # LinkedIn OAuth
    LINKEDIN_CLIENT_ID: str = os.getenv("LINKEDIN_CLIENT_ID", "")
    LINKEDIN_CLIENT_SECRET: str = os.getenv("LINKEDIN_CLIENT_SECRET", "")
    LINKEDIN_REDIRECT_URI: str = os.getenv(
        "LINKEDIN_REDIRECT_URI", "http://localhost:3000/social-hub/auth/linkedin/callback"
    )

    # Instagram OAuth
    INSTAGRAM_APP_ID: str = os.getenv("INSTAGRAM_APP_ID", "")
    INSTAGRAM_APP_SECRET: str = os.getenv("INSTAGRAM_APP_SECRET", "")
    INSTAGRAM_REDIRECT_URI: str = os.getenv(
        "INSTAGRAM_REDIRECT_URI", "http://localhost:3000/social-hub/auth/instagram/callback"
    )
    IG_WEBHOOK_VERIFY_TOKEN: str = os.getenv("IG_WEBHOOK_VERIFY_TOKEN", "")

    # Media hosting (public URL for Instagram image uploads)
    MEDIA_PUBLIC_BASE_URL: str = os.getenv("MEDIA_PUBLIC_BASE_URL", "")

    # CORS — comma-separated origins (empty = localhost defaults)
    CORS_ORIGINS: str = os.getenv("CORS_ORIGINS", "")

    # Token encryption key (Fernet-compatible, 32 bytes URL-safe base64)
    TOKEN_ENCRYPTION_KEY: str = os.getenv("TOKEN_ENCRYPTION_KEY", "")

    # App
    APP_SECRET_KEY: str = os.getenv("APP_SECRET_KEY", "dev-secret-change-me")
    _RAW_DATABASE_URL: str = env_first("DATABASE_URL", "SUPABASE_DB_URL")
    if not _RAW_DATABASE_URL:
        raise RuntimeError(
            "Cloud database configuration is required. Set SUPABASE_DB_URL or DATABASE_URL to the shared Supabase Postgres connection string."
        )
    _NORMALIZED_DATABASE_URL: str = normalize_database_url(_RAW_DATABASE_URL)
    if not is_supabase_database_url(_NORMALIZED_DATABASE_URL):
        raise RuntimeError(
            "SocialHub is configured for Supabase-only operation. Use the shared Supabase connection string from the project pooler."
        )
    DATABASE_URL: str = _NORMALIZED_DATABASE_URL
    DATABASE_POOL_SIZE: int = int(os.getenv("DATABASE_POOL_SIZE", "5"))
    DATABASE_MAX_OVERFLOW: int = int(os.getenv("DATABASE_MAX_OVERFLOW", "10"))
    DATABASE_POOL_PRE_PING: bool = env_bool("DATABASE_POOL_PRE_PING", not is_supabase_database_url(DATABASE_URL))
    SETTINGS_CACHE_TTL_SECONDS: int = int(os.getenv("SETTINGS_CACHE_TTL_SECONDS", "15"))
    READ_VIEW_CACHE_TTL_SECONDS: int = int(os.getenv("READ_VIEW_CACHE_TTL_SECONDS", "5"))
    HTTP_TIMEOUT_SECONDS: float = float(os.getenv("HTTP_TIMEOUT_SECONDS", "30"))
    HTTP_MAX_RETRIES: int = int(os.getenv("HTTP_MAX_RETRIES", "3"))
    ACTION_RATE_LIMIT_WINDOW_SECONDS: int = int(os.getenv("ACTION_RATE_LIMIT_WINDOW_SECONDS", "60"))
    SCHEDULER_LOCK_TTL_SECONDS: int = int(os.getenv("SCHEDULER_LOCK_TTL_SECONDS", "900"))

    # Schedule — Waleri: Dienstag (1) + Donnerstag (3)
    POSTING_DAYS: list[int] = [
        int(d) for d in os.getenv("POSTING_DAYS", "1,3").split(",")
    ]
    POSTING_HOUR: int = int(os.getenv("POSTING_HOUR", "9"))
    POSTING_MINUTE: int = int(os.getenv("POSTING_MINUTE", "0"))

    # Gemini model — no version lock (Waleri's decision)
    GEMINI_MODEL: str = "gemini-2.5-pro"
    IMAGEN_MODEL: str = "imagen-4-ultra"

    # LinkedIn post constraints
    POST_MAX_CHARS: int = 3000
    IG_POST_MAX_CHARS: int = 2200

    @property
    def SUPABASE_PUBLIC_KEY(self) -> str:
        return self.SUPABASE_PUBLISHABLE_KEY or self.SUPABASE_ANON_KEY

    @property
    def USES_SUPABASE_DATABASE(self) -> bool:
        return is_supabase_database_url(self.DATABASE_URL)


settings = Settings()
