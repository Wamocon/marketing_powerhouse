# Social Hub — Momentum App Database Models (Read/Write Bridge)
"""
SQLModel definitions for tables owned by the Momentum App.
Social Hub reads and writes to these tables directly via the shared
Supabase Postgres connection.

Schema usage:
  - Development: test schema
  - Production:  public schema (Supabase default, matches frontend)

Tables:
  - scheduled_posts   (owned by Momentum, SH reads/writes)
  - connected_accounts (owned by Momentum, SH reads + writes tokens)
  - engagement_metrics (owned by Momentum, SH writes after publish)
  - contents           (owned by Momentum, SH reads for context)
"""
from datetime import datetime, timezone
from typing import Optional
from uuid import UUID, uuid4

from sqlmodel import Field, SQLModel, Column
from sqlalchemy import JSON, Text, ARRAY
from sqlalchemy.dialects.postgresql import UUID as PG_UUID

from app.config import settings


def _momentum_schema() -> str:
    """Return the schema Momentum uses (same Supabase project)."""
    return settings.DATABASE_SCHEMA


def _momentum_table_args() -> dict:
    schema = _momentum_schema()
    if schema and schema != "public":
        return {"schema": schema}
    return {}


# ── Connected Accounts (Momentum-owned) ──────────────────────────────────

class MomentumConnectedAccount(SQLModel, table=True):
    """Maps to Momentum's `connected_accounts` table."""

    __tablename__ = "connected_accounts"
    __table_args__ = _momentum_table_args()

    id: Optional[UUID] = Field(
        default_factory=uuid4,
        sa_column=Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4),
    )
    company_id: str = Field(index=True)
    platform: str  # 'linkedin' | 'instagram' | 'telegram' | 'twitter'
    account_name: str = ""
    account_id: str = ""
    platform_user_id: Optional[str] = None
    access_token_encrypted: Optional[str] = None
    refresh_token_encrypted: Optional[str] = None
    token_expires_at: Optional[datetime] = None
    token_scopes: Optional[list] = Field(default=None, sa_column=Column(JSON))
    is_active: bool = True
    account_metadata: Optional[dict] = Field(default=None, sa_column=Column("metadata", JSON))
    connected_by: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ── Scheduled Posts (Momentum-owned, SH reads/writes) ────────────────────

class MomentumScheduledPost(SQLModel, table=True):
    """Maps to Momentum's `scheduled_posts` table."""

    __tablename__ = "scheduled_posts"
    __table_args__ = _momentum_table_args()

    id: Optional[UUID] = Field(
        default_factory=uuid4,
        sa_column=Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4),
    )
    company_id: str = Field(index=True)
    content_item_id: Optional[str] = None
    connected_account_id: Optional[UUID] = Field(
        default=None,
        sa_column=Column(PG_UUID(as_uuid=True), index=True),
    )
    post_text: str = ""
    post_image_url: Optional[str] = None
    post_type: str = "text"  # text | image | carousel | video | reel
    hashtags: Optional[list] = Field(default=None, sa_column=Column("hashtags", ARRAY(Text)))
    scheduled_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    published_at: Optional[datetime] = None
    status: str = "draft"
    platform_post_id: Optional[str] = None
    platform_post_url: Optional[str] = None
    error_message: Optional[str] = None
    retry_count: int = 0
    max_retries: int = 3
    auto_comment_text: Optional[str] = None
    auto_comment_posted: bool = False
    auto_comment_at: Optional[datetime] = None
    created_by: Optional[str] = None
    approved_by: Optional[str] = None
    approved_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    # New columns added by migration
    image_prompt: Optional[str] = None
    sources: str = ""
    topic: str = ""
    socialhub_job_id: Optional[str] = None
    ig_container_id: Optional[str] = None
    ig_media_type: Optional[str] = None
    platform_comment_id: Optional[str] = None
    notes: str = ""
    # Project-scoped columns (added by migration)
    campaign_id: Optional[str] = None
    task_id: Optional[str] = None
    platform: Optional[str] = None  # resolved platform string


# ── Engagement Metrics (Momentum-owned, SH writes) ──────────────────────

class MomentumEngagementMetric(SQLModel, table=True):
    """Maps to Momentum's `engagement_metrics` table."""

    __tablename__ = "engagement_metrics"
    __table_args__ = _momentum_table_args()

    id: Optional[UUID] = Field(
        default_factory=uuid4,
        sa_column=Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4),
    )
    scheduled_post_id: Optional[UUID] = Field(
        default=None,
        sa_column=Column(PG_UUID(as_uuid=True), index=True),
    )
    impressions: int = 0
    clicks: int = 0
    likes: int = 0
    comments: int = 0
    shares: int = 0
    reach: int = 0
    saves: int = 0
    video_views: int = 0
    engagement_rate: float = 0.0
    raw_data: Optional[dict] = Field(default=None, sa_column=Column("raw_data", JSON))
    pulled_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ── Content Items (Momentum-owned, SH reads) ────────────────────────────

class MomentumContent(SQLModel, table=True):
    """Maps to Momentum's `contents` table (read-only for context)."""

    __tablename__ = "contents"
    __table_args__ = _momentum_table_args()

    id: str = Field(primary_key=True)
    title: str = ""
    description: str = ""
    status: str = "idea"
    publish_date: Optional[str] = None
    platform: str = ""
    touchpoint_id: Optional[str] = None
    campaign_id: Optional[str] = None
    author: str = ""
    content_type: str = ""
    journey_phase: str = ""
    company_id: str = Field(index=True)
    created_at: Optional[str] = None


# ── Company (Momentum-owned, SH reads) ──────────────────────────────────

class MomentumCompany(SQLModel, table=True):
    """Maps to Momentum's `companies` table (read-only for validation)."""

    __tablename__ = "companies"
    __table_args__ = _momentum_table_args()

    id: str = Field(primary_key=True)
    name: str = ""
    slug: str = ""
    industry: str = ""


# ── Social Hub Settings (per-project config) ────────────────────────────

class SocialHubSettings(SQLModel, table=True):
    """Per-project Social Hub configuration."""

    __tablename__ = "social_hub_settings"
    __table_args__ = _momentum_table_args()

    id: Optional[UUID] = Field(
        default_factory=uuid4,
        sa_column=Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4),
    )
    company_id: str = Field(index=True)
    publishing_cadence: str = "moderate"
    preferred_days: Optional[list] = Field(default=None, sa_column=Column(ARRAY(Text)))
    preferred_times: Optional[list] = Field(default=None, sa_column=Column(ARRAY(Text)))
    timezone: str = "Europe/Berlin"
    ai_language: str = "de"
    ai_tone: str = ""
    ai_persona: str = ""
    content_pillars: Optional[list] = Field(default=None, sa_column=Column(ARRAY(Text)))
    auto_approve: bool = False
    require_approval_from: Optional[list] = Field(default=None, sa_column=Column(ARRAY(Text)))
    default_platform: str = "linkedin"
    value_comments_enabled: bool = True
    image_generation_enabled: bool = True
    hashtag_strategy: str = "moderate"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ── Social Analytics Snapshots (per-project historical metrics) ─────────

class SocialAnalyticsSnapshot(SQLModel, table=True):
    """Daily aggregate social performance per project per platform."""

    __tablename__ = "social_analytics_snapshots"
    __table_args__ = _momentum_table_args()

    id: Optional[UUID] = Field(
        default_factory=uuid4,
        sa_column=Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4),
    )
    company_id: str = Field(index=True)
    snapshot_date: str = ""  # ISO date
    platform: str = "all"
    total_posts: int = 0
    posts_published: int = 0
    total_impressions: int = 0
    total_clicks: int = 0
    total_likes: int = 0
    total_comments: int = 0
    total_shares: int = 0
    total_reach: int = 0
    avg_engagement_rate: float = 0.0
    top_post_id: Optional[UUID] = Field(
        default=None,
        sa_column=Column(PG_UUID(as_uuid=True)),
    )
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
