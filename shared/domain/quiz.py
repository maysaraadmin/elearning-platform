"""Quiz domain models."""
from __future__ import annotations

import enum
import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, ForeignKey, Integer, String, Text, Float, DateTime, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from shared.domain import BaseModel, IDMixin, TimestampMixin


class QuestionType(str, enum.Enum):
    """Question type enumeration."""
    MULTIPLE_CHOICE = "multiple_choice"
    TRUE_FALSE = "true_false"
    FILL_IN_THE_BLANK = "fill_in_the_blank"
    ESSAY = "essay"
    MATCHING = "matching"
    ORDERING = "ordering"


class QuizStatus(str, enum.Enum):
    """Quiz status."""
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"


class Quiz(BaseModel, IDMixin, TimestampMixin):
    """Quiz entity."""
    __tablename__ = "quizzes"

    course_id: Mapped[uuid.UUID] = mapped_column(
        UUID, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[QuizStatus] = mapped_column(default=QuizStatus.DRAFT, nullable=False)
    time_limit_minutes: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    max_attempts: Mapped[int] = mapped_column(Integer, default=3, nullable=False)
    passing_score: Mapped[float] = mapped_column(Float, default=70.0, nullable=False)
    randomize_questions: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    show_correct_answers: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    total_points: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)

    questions: Mapped[list["Question"]] = relationship(
        "Question", back_populates="quiz", cascade="all, delete-orphan"
    )
    attempts: Mapped[list["QuizAttempt"]] = relationship(
        "QuizAttempt", back_populates="quiz"
    )


class Question(BaseModel, IDMixin, TimestampMixin):
    """Question entity."""
    __tablename__ = "questions"

    quiz_id: Mapped[uuid.UUID] = mapped_column(
        UUID, ForeignKey("quizzes.id", ondelete="CASCADE"), nullable=False, index=True
    )
    type: Mapped[QuestionType] = mapped_column(nullable=False)
    question_text: Mapped[str] = mapped_column(Text, nullable=False)
    points: Mapped[float] = mapped_column(Float, default=1.0, nullable=False)
    order_index: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    explanation: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    options: Mapped[Optional[list]] = mapped_column(JSONB, nullable=True)
    correct_answer: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    media_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    quiz: Mapped["Quiz"] = relationship("Quiz", back_populates="questions")


class QuizAttempt(BaseModel, IDMixin, TimestampMixin):
    """Quiz attempt entity."""
    __tablename__ = "quiz_attempts"

    quiz_id: Mapped[uuid.UUID] = mapped_column(
        UUID, ForeignKey("quizzes.id", ondelete="CASCADE"), nullable=False, index=True
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    attempt_number: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    total_score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    max_score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    percentage: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    passed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    answers: Mapped[Optional[list]] = mapped_column(JSONB, nullable=True)
    time_taken_seconds: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    quiz: Mapped["Quiz"] = relationship("Quiz", back_populates="attempts")
    results: Mapped[list["QuizResult"]] = relationship(
        "QuizResult", back_populates="attempt", cascade="all, delete-orphan"
    )


class QuizResult(BaseModel, IDMixin, TimestampMixin):
    """Quiz result per question entity."""
    __tablename__ = "quiz_results"

    attempt_id: Mapped[uuid.UUID] = mapped_column(
        UUID, ForeignKey("quiz_attempts.id", ondelete="CASCADE"), nullable=False, index=True
    )
    question_id: Mapped[uuid.UUID] = mapped_column(
        UUID, ForeignKey("questions.id", ondelete="CASCADE"), nullable=False
    )
    user_answer: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_correct: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    feedback: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    attempt: Mapped["QuizAttempt"] = relationship("QuizAttempt", back_populates="results")