"""Event schemas."""
from __future__ import annotations

from pydantic import BaseModel
from shared.domain.analytics import EventType


class EventBase(BaseModel):
    user_id: str | None = None
    session_id: str | None = None
    event_type: EventType
    entity_type: str | None = None
    entity_id: str | None = None
    properties: dict | None = None


class EventCreate(EventBase):
    pass


class EventRead(EventBase):
    id: str

    model_config = {"from_attributes": True}