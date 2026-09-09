"""Enrollment and progress domain models."""
from __future__ import annotations

import enum
import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, ForeignKey, Integer, String, Text, Float, DateTime, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from shared.domain.base import BaseModel, IDMixin, TimestampMixin


class EnrollmentStatus(str, enum.Enum):
    """Enrollment status."""
    ACTIVE = "active"
    COMPLETED = "completed"
    DROPPED = "dropped"
    SUSPENDED = "suspended"


class Enrollment(BaseModel, IDMixin, TimestampMixin):
    """Course enrollment entity."""
    __tablename__ = "enrollments"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    course_id: Mapped[uuid.UUID] = mapped_column(
        UUID, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True
    )
    status: Mapped[EnrollmentStatus] = mapped_column(
        default=EnrollmentStatus.ACTIVE, nullable=False
    )
    progress_percentage: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    completed_lessons: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    total_lessons: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    watch_time_minutes: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    last_accessed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    certificate_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    metadata: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)

    user: Mapped["User"] = relationship("User", back_populates="enrollments")
    course: Mapped["Course"] = relationship("Course", back_populates="enrollments")
    lesson_progress: Mapped[list["LessonProgress"]] = relationship(
        "LessonProgress", back_populates="enrollment", cascade="all, delete-orphan"
    )


class LessonProgress(BaseModel, IDMixin, TimestampMixin):
    """Lesson progress entity."""
    __tablename__ = "lesson_progress"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    lesson_id: Mapped[uuid.UUID] = mapped_column(
        UUID, ForeignKey("lessons.id", ondelete="CASCADE"), nullable=False, index=True
    )
    enrollment_id: Mapped[uuid.UUID] = mapped_column(
        UUID, ForeignKey("enrollments.id", ondelete="CASCADE"), nullable=False, index=True
    )
    completed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    watch_time_seconds: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    last_position_seconds: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    enrollment: Mapped["Enrollment"] = relationship("Enrollment", back_populates="lesson_progress")
    lesson: Mapped["Lesson"] = relationship("Lesson", back_populates="progress")


class CourseCompletion(BaseModel, IDMixin, TimestampMixin):
    """Course completion certificate entity."""
    __tablename__ = "course_completions"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    course_id: Mapped[uuid.UUID] = mapped_column(
        UUID, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True
    )
    enrollment_id: Mapped[uuid.UUID] = mapped_column(
        UUID, ForeignKey("enrollments.id", ondelete="CASCADE"), nullable=False, unique=True
    )
    certificate_url: Mapped[str] = mapped_column(Text, nullable=False)
    certificate_number: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    final_score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    issued_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    metadata: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)