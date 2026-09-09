"""Lesson schemas."""
from __future__ import annotations

from pydantic import BaseModel
from shared.domain.course import LessonType


class LessonBase(BaseModel):
    module_id: str
    title: str
    type: LessonType
    content: str | None = None
    order_index: int = 0
    duration_minutes: int = 0
    is_free: bool = False


class LessonCreate(LessonBase):
    pass


class LessonUpdate(BaseModel):
    title: str | None = None
    content: str | None = None
    order_index: int | None = None


class LessonRead(LessonBase):
    id: str
    file_url: str | None
    video_id: str | None
    quiz_id: str | None

    model_config = {"from_attributes": True}