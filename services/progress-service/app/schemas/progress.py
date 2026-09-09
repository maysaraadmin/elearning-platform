"""Progress schemas."""
from __future__ import annotations

from datetime import datetime
from pydantic import BaseModel


class LessonProgressBase(BaseModel):
    user_id: str
    lesson_id: str
    enrollment_id: str
    completed: bool = False
    watch_time_seconds: int = 0
    last_position_seconds: int = 0


class LessonProgressCreate(LessonProgressBase):
    pass


class LessonProgressRead(LessonProgressBase):
    id: str
    completed_at: datetime | None

    model_config = {"from_attributes": True}