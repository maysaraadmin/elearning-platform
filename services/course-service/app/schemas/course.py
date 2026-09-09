"""Course schemas."""
from __future__ import annotations

from pydantic import BaseModel
from shared.domain.course import CourseStatus


class CourseBase(BaseModel):
    title: str
    description: str | None = None
    short_description: str | None = None
    instructor_id: str
    category: str
    price: float = 0.0
    currency: str = "USD"
    is_free: bool = False
    level: str = "beginner"
    language: str = "en"


class CourseCreate(CourseBase):
    pass


class CourseUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    price: float | None = None
    category: str | None = None
    status: CourseStatus | None = None


class CourseRead(CourseBase):
    id: str
    status: CourseStatus
    rating: float
    enrollment_count: int
    total_lessons: int

    model_config = {"from_attributes": True}