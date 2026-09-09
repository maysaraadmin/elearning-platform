"""Course domain models."""
from __future__ import annotations

import enum
import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import (
    Boolean,
    ForeignKey,
    Integer,
    Float,
    LargeBinary,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from shared.domain import BaseModel, IDMixin, TimestampMixin
from shared.domain.video import VideoAsset


class LessonType(str, enum.Enum):
    """Lesson content type."""
    VIDEO = "video"
    PDF = "pdf"
    TEXT = "text"
    QUIZ = "quiz"
    ASSIGNMENT = "assignment"
    LIVE = "live"


class CourseStatus(str, enum.Enum):
    """Course publication status."""
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"
    PENDING_REVIEW = "pending_review"


class Course(BaseModel, IDMixin, TimestampMixin):
    """Course entity."""
    __tablename__ = "courses"

    title: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    short_description: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    instructor_id: Mapped[uuid.UUID] = mapped_column(
        UUID, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    status: Mapped[CourseStatus] = mapped_column(default=CourseStatus.DRAFT, nullable=False)
    category: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    subcategory: Mapped[Optional[str]] = mapped_column(String(100), nullable=True, index=True)
    price: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    currency: Mapped[str] = mapped_column(String(3), default="USD", nullable=False)
    is_free: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    thumbnail_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    preview_video_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID, ForeignKey("video_assets.id", ondelete="SET NULL"), nullable=True
    )
    level: Mapped[str] = mapped_column(String(20), default="beginner", nullable=False)
    language: Mapped[str] = mapped_column(String(10), default="en", nullable=False)
    duration_minutes: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    total_lessons: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    rating: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    rating_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    enrollment_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    tags: Mapped[Optional[list]] = mapped_column(JSONB, nullable=True)
    metadata: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)

    instructor: Mapped["User"] = relationship("User", back_populates="courses")
    modules: Mapped[list["Module"]] = relationship(
        "Module", back_populates="course", cascade="all, delete-orphan"
    )
    enrollments: Mapped[list["Enrollment"]] = relationship(
        "Enrollment", back_populates="course"
    )
    reviews: Mapped[list["CourseReview"]] = relationship(
        "CourseReview", back_populates="course", cascade="all, delete-orphan"
    )


class Module(BaseModel, IDMixin, TimestampMixin):
    """Course module entity."""
    __tablename__ = "modules"

    course_id: Mapped[uuid.UUID] = mapped_column(
        UUID, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    order_index: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    duration_minutes: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    course: Mapped["Course"] = relationship("Course", back_populates="modules")
    lessons: Mapped[list["Lesson"]] = relationship(
        "Lesson", back_populates="module", cascade="all, delete-orphan"
    )


class Lesson(BaseModel, IDMixin, TimestampMixin):
    """Lesson entity."""
    __tablename__ = "lessons"

    module_id: Mapped[uuid.UUID] = mapped_column(
        UUID, ForeignKey("modules.id", ondelete="CASCADE"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    type: Mapped[LessonType] = mapped_column(nullable=False)
    content: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    order_index: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    duration_minutes: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    is_free: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    video_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID, ForeignKey("video_assets.id", ondelete="SET NULL"), nullable=True
    )
    file_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    quiz_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID, ForeignKey("quizzes.id", ondelete="SET NULL"), nullable=True
    )
    metadata: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)

    module: Mapped["Module"] = relationship("Module", back_populates="lessons")
    video: Mapped[Optional["VideoAsset"]] = relationship("VideoAsset", back_populates="lessons")
    progress: Mapped[list["LessonProgress"]] = relationship(
        "LessonProgress", back_populates="lesson"
    )


class CourseReview(BaseModel, IDMixin, TimestampMixin):
    """Course review entity."""
    __tablename__ = "course_reviews"

    course_id: Mapped[uuid.UUID] = mapped_column(
        UUID, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    rating: Mapped[int] = mapped_column(Integer, nullable=False)
    comment: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    course: Mapped["Course"] = relationship("Course", back_populates="reviews")