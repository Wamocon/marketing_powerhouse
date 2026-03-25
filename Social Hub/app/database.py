# Social Media Marketing Hub — Database Setup & Models
from datetime import datetime, timezone
from enum import Enum
from threading import Lock
from time import monotonic
from typing import Optional

from sqlalchemy import text
from sqlmodel import Field, SQLModel, create_engine, Session, select

from app.config import settings


# ── Enums ────────────────────────────────────────────────────────────────

APP_SCHEMA = None
if not settings.DATABASE_URL.startswith("sqlite"):
    schema = settings.DATABASE_SCHEMA.strip().lower()
    APP_SCHEMA = schema or None


def _table_name(base_name: str) -> str:
    prefix = settings.DATABASE_TABLE_PREFIX
    return f"{prefix}{base_name}" if prefix else base_name


def _table_args() -> dict[str, str]:
    if APP_SCHEMA and APP_SCHEMA != "public":
        return {"schema": APP_SCHEMA}
    return {}

class Platform(str, Enum):
    LINKEDIN = "linkedin"
    INSTAGRAM = "instagram"


class PostStatus(str, Enum):
    DRAFT = "draft"
    APPROVED = "approved"
    SCHEDULED = "scheduled"
    PUBLISHED = "published"
    FAILED = "failed"
    REJECTED = "rejected"


# ── Models ───────────────────────────────────────────────────────────────

class Post(SQLModel, table=True):
    __tablename__ = _table_name("posts")
    __table_args__ = _table_args()

    id: Optional[int] = Field(default=None, primary_key=True)
    platform: Platform = Field(default=Platform.LINKEDIN, index=True)
    topic: str = Field(index=True)
    body: str
    sources: str = ""
    hashtags: str = ""
    image_path: Optional[str] = None
    image_prompt: Optional[str] = None
    value_comment: Optional[str] = None
    status: PostStatus = Field(default=PostStatus.DRAFT, index=True)
    platform_post_id: Optional[str] = None
    platform_comment_id: Optional[str] = None
    ig_container_id: Optional[str] = None
    ig_media_type: Optional[str] = None
    scheduled_for: Optional[datetime] = Field(default=None, index=True)
    published_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), index=True)
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    notes: str = ""


class LinkedInAccount(SQLModel, table=True):
    __tablename__ = _table_name("linkedin_accounts")
    __table_args__ = _table_args()

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    linkedin_user_id: Optional[str] = None
    access_token: Optional[str] = None
    refresh_token: Optional[str] = None
    token_expires_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_active: bool = True


class InstagramAccount(SQLModel, table=True):
    __tablename__ = _table_name("instagram_accounts")
    __table_args__ = _table_args()

    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = ""
    ig_user_id: str = ""
    access_token: Optional[str] = None
    token_expires_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_active: bool = True


class TopicIdea(SQLModel, table=True):
    """Saved topic ideas — queue for future posts."""

    __tablename__ = _table_name("topic_ideas")
    __table_args__ = _table_args()

    id: Optional[int] = Field(default=None, primary_key=True)
    topic: str
    used: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), index=True)


class DynamicSetting(SQLModel, table=True):
    """Key-value settings editable from the dashboard."""

    __tablename__ = _table_name("dynamic_settings")
    __table_args__ = _table_args()

    key: str = Field(primary_key=True)
    value: str = ""


class AppLog(SQLModel, table=True):
    __tablename__ = _table_name("app_logs")
    __table_args__ = _table_args()

    id: Optional[int] = Field(default=None, primary_key=True)
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), index=True)
    level: str = "INFO"
    source: str = ""
    message: str = ""


class JobLease(SQLModel, table=True):
    __tablename__ = _table_name("job_leases")
    __table_args__ = _table_args()

    key: str = Field(primary_key=True)
    owner: str = ""
    expires_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ── Engine ───────────────────────────────────────────────────────────────

def _create_database_engine():
    engine_kwargs: dict[str, object] = {
        "echo": False,
        "pool_pre_ping": settings.DATABASE_POOL_PRE_PING,
    }
    if settings.DATABASE_URL.startswith("sqlite"):
        engine_kwargs["connect_args"] = {"check_same_thread": False}
    else:
        if APP_SCHEMA:
            engine_kwargs["connect_args"] = {"options": f"-csearch_path={APP_SCHEMA},public"}
        engine_kwargs["pool_size"] = settings.DATABASE_POOL_SIZE
        engine_kwargs["max_overflow"] = settings.DATABASE_MAX_OVERFLOW
        engine_kwargs["pool_use_lifo"] = True
        engine_kwargs["pool_recycle"] = 1800
    return create_engine(settings.DATABASE_URL, **engine_kwargs)


engine = _create_database_engine()

_SETTINGS_CACHE: dict[str, str] = {}
_SETTINGS_CACHE_EXPIRES_AT = 0.0
_SETTINGS_CACHE_LOCK = Lock()


def invalidate_settings_cache():
    global _SETTINGS_CACHE_EXPIRES_AT
    with _SETTINGS_CACHE_LOCK:
        _SETTINGS_CACHE.clear()
        _SETTINGS_CACHE_EXPIRES_AT = 0.0


def _settings_cache_is_valid() -> bool:
    return settings.SETTINGS_CACHE_TTL_SECONDS > 0 and monotonic() < _SETTINGS_CACHE_EXPIRES_AT


def _update_settings_cache(values: dict[str, str]):
    global _SETTINGS_CACHE_EXPIRES_AT
    if settings.SETTINGS_CACHE_TTL_SECONDS <= 0:
        return
    with _SETTINGS_CACHE_LOCK:
        _SETTINGS_CACHE.update(values)
        _SETTINGS_CACHE_EXPIRES_AT = monotonic() + settings.SETTINGS_CACHE_TTL_SECONDS


def _truncate_app_tables():
    table_names: list[str] = []
    for table in SQLModel.metadata.sorted_tables:
        if APP_SCHEMA and table.schema != APP_SCHEMA:
            continue
        if table.schema:
            table_names.append(f"{table.schema}.{table.name}")
        else:
            table_names.append(table.name)

    if not table_names:
        return

    statement = text(f"TRUNCATE TABLE {', '.join(table_names)} RESTART IDENTITY CASCADE")
    with engine.begin() as connection:
        connection.execute(statement)


def init_db(reset: bool = False):
    if APP_SCHEMA and not settings.DATABASE_URL.startswith("sqlite"):
        with engine.begin() as connection:
            connection.execute(text(f"create schema if not exists {APP_SCHEMA}"))
    if reset:
        if settings.DATABASE_URL.startswith("sqlite"):
            SQLModel.metadata.drop_all(engine)
        else:
            SQLModel.metadata.create_all(engine)
            _truncate_app_tables()
    SQLModel.metadata.create_all(engine)
    _seed_defaults()


def _seed_defaults():
    """Insert default dynamic settings if not already present."""
    defaults = {
        "posting_days": "1,3",
        "posting_hour": "9",
        "posting_minute": "0",
        "gemini_model": "gemini-2.5-pro",
        "imagen_model": "imagen-4-ultra",
        "post_max_chars": "3000",
        "value_comment_delay_min": "60",
        "auto_generate_drafts": "true",
        "max_pending_drafts": "3",
        "default_hashtags": "#Arbeitsmarkt #Weiterbildung #Karriere #Deutschland",
        "language": "Deutsch",
        "tone": "professionell-freundlich",
        "target_audience": "Jobsuchende & Weiterbildungsinteressierte im DACH-Raum",
        "core_topics": "IT-Testmanagement, Weiterbildung, Karriere-Tipps",
        "theme": "light",
        # Instagram defaults
        "ig_posting_days": "0,2,4",
        "ig_posting_hour": "12",
        "ig_posting_minute": "0",
        "ig_auto_generate_drafts": "true",
        "ig_max_pending_drafts": "3",
        "ig_default_hashtags": "#Karriere #JobSearch #Weiterbildung #DACH #Arbeitsmarkt",
        "ig_post_max_chars": "2200",
        "ig_media_type": "IMAGE",
        "ig_image_style": "square",
        "ig_hashtag_placement": "caption",
    }
    with Session(engine) as session:
        for k, v in defaults.items():
            existing = session.get(DynamicSetting, k)
            if not existing:
                session.add(DynamicSetting(key=k, value=v))
        session.commit()
    invalidate_settings_cache()


def get_setting(key: str, default: str = "") -> str:
    return get_settings([key], defaults={key: default}).get(key, default)


def get_settings(keys: list[str], defaults: dict[str, str] | None = None) -> dict[str, str]:
    defaults = defaults or {}
    if not keys:
        return {}

    with _SETTINGS_CACHE_LOCK:
        if _settings_cache_is_valid() and all(key in _SETTINGS_CACHE for key in keys):
            return {key: _SETTINGS_CACHE.get(key, defaults.get(key, "")) for key in keys}

    with Session(engine) as session:
        rows = session.exec(select(DynamicSetting).where(DynamicSetting.key.in_(keys))).all()

    values = {row.key: row.value for row in rows}
    _update_settings_cache(values)
    return {key: values.get(key, defaults.get(key, "")) for key in keys}


def set_setting(key: str, value: str):
    with Session(engine) as session:
        row = session.get(DynamicSetting, key)
        if row:
            row.value = value
            session.add(row)
        else:
            session.add(DynamicSetting(key=key, value=value))
        session.commit()
    invalidate_settings_cache()


def get_session():
    with Session(engine) as session:
        yield session
