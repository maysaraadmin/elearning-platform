"""Notification schemas."""
from __future__ import annotations

from datetime import datetime
from pydantic import BaseModel
from shared.domain.notification import NotificationType, NotificationChannel


class NotificationBase(BaseModel):
    user_id: str
    type: NotificationType
    channel: NotificationChannel
    title: str
    message: str
    data: dict | None = None


class NotificationCreate(NotificationBase):
    pass


class NotificationRead(NotificationBase):
    id: str
    is_read: bool
    read_at: datetime | None
    sent_at: datetime | None
    delivery_status: str

    model_config = {"from_attributes": True}