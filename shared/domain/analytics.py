"""Analytics domain models."""
from __future__ import annotations

import enum
import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, ForeignKey, Integer, String, Text, Float, DateTime, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from shared.domain import BaseModel, IDMixin, TimestampMixin


class EventType(str, enum.Enum):
    LOGIN = "login"
    LOGOUT = "logout"
    COURSE_VIEW = "course_view"
    LESSON_START = "lesson_start"
    LESSON_COMPLETE = "lesson_complete"
    VIDEO_PLAY = "video_play"
    VIDEO_PAUSE = "video_pause"
    VIDEO_COMPLETE = "video_complete"
    QUIZ_START = "quiz_start"
    QUIZ_SUBMIT = "quiz_submit"
    ENROLLMENT = "enrollment"
    PURCHASE = "purchase"
    CERTIFICATE_DOWNLOAD = "certificate_download"
    SEARCH = "search"


class Event(BaseModel, IDMixin, TimestampMixin):
    """Analytics event entity."""
    __tablename__ = "events"

    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    session_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True, index=True)
    event_type: Mapped[EventType] = mapped_column(nullable=False, index=True)
    entity_type: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    entity_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID, nullable=True)
    properties: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    ip_address: Mapped[Optional[str]] = mapped_column(String(45), nullable=True)
    user_agent: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    referrer: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    user: Mapped[Optional["User"]] = relationship("User")


class Metric(BaseModel, IDMixin, TimestampMixin):
    """Aggregated metric entity."""
    __tablename__ = "metrics"

    name: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    value: Mapped[float] = mapped_column(Float, nullable=False)
    dimensions: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    period_start: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    period_end: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    aggregation: Mapped[str] = mapped_column(String(20), default="sum", nullable=False)


class Report(BaseModel, IDMixin, TimestampMixin):
    """Generated report entity."""
    __tablename__ = "reports"

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    report_type: Mapped[str] = mapped_column(String(50), nullable=False)
    parameters: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    result: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    file_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    generated_by: Mapped[uuid.UUID] = mapped_column(
        UUID, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    generated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    generated_by_user: Mapped["User"] = relationship("User")