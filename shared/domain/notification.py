"""Notification domain models."""
from __future__ import annotations

import enum
import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, ForeignKey, Integer, String, Text, DateTime, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from shared.domain import BaseModel, IDMixin, TimestampMixin


class NotificationType(str, enum.Enum):
    ENROLLMENT = "enrollment"
    COURSE_COMPLETION = "course_completion"
    QUIZ_ASSIGNED = "quiz_assigned"
    QUIZ_RESULT = "quiz_result"
    PAYMENT_SUCCESS = "payment_success"
    PAYMENT_FAILED = "payment_failed"
    INSTRUCTOR_REPLY = "instructor_reply"
    SYSTEM = "system"
    PROMOTION = "promotion"


class NotificationChannel(str, enum.Enum):
    EMAIL = "email"
    IN_APP = "in_app"
    WEBSOCKET = "websocket"
    SMS = "sms"


class Notification(BaseModel, IDMixin, TimestampMixin):
    """Notification entity."""
    __tablename__ = "notifications"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID, nullable=False, index=True
    )
    type: Mapped[NotificationType] = mapped_column(nullable=False)
    channel: Mapped[NotificationChannel] = mapped_column(nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    data: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    read_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    sent_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    delivery_status: Mapped[str] = mapped_column(String(20), default="pending", nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="notifications")


class NotificationTemplate(BaseModel, IDMixin, TimestampMixin):
    """Notification template entity."""
    __tablename__ = "notification_templates"

    type: Mapped[NotificationType] = mapped_column(nullable=False, unique=True)
    channel: Mapped[NotificationChannel] = mapped_column(nullable=False)
    subject: Mapped[str] = mapped_column(String(255), nullable=False)
    body: Mapped[str] = mapped_column(Text, nullable=False)
    variables: Mapped[Optional[list]] = mapped_column(JSONB, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)


class EmailLog(BaseModel, IDMixin, TimestampMixin):
    """Email delivery log entity."""
    __tablename__ = "email_logs"

    notification_id: Mapped[uuid.UUID] = mapped_column(
        UUID, ForeignKey("notifications.id", ondelete="CASCADE"), nullable=False, index=True
    )
    recipient: Mapped[str] = mapped_column(String(255), nullable=False)
    subject: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="pending", nullable=False)
    provider_message_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    sent_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    notification: Mapped["Notification"] = relationship("Notification")