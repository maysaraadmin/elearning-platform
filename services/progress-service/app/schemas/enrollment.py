"""Enrollment schemas."""
from __future__ import annotations

from datetime import datetime
from pydantic import BaseModel
from shared.domain.progress import EnrollmentStatus


class EnrollmentBase(BaseModel):
    user_id: str
    course_id: str
    status: EnrollmentStatus = EnrollmentStatus.ACTIVE


class EnrollmentCreate(EnrollmentBase):
    pass


class EnrollmentRead(EnrollmentBase):
    id: str
    progress_percentage: float
    completed_lessons: int
    total_lessons: int
    watch_time_minutes: int
    last_accessed_at: datetime | None
    completed_at: datetime | None
    certificate_url: str | None

    model_config = {"from_attributes": True}