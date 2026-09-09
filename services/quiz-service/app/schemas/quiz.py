"""Quiz schemas."""
from __future__ import annotations

from pydantic import BaseModel
from shared.domain.quiz import QuizStatus


class QuizBase(BaseModel):
    course_id: str
    title: str
    description: str | None = None
    time_limit_minutes: int = 0
    max_attempts: int = 3
    passing_score: float = 70.0


class QuizCreate(QuizBase):
    pass


class QuizUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    status: QuizStatus | None = None
    passing_score: float | None = None


class QuizRead(QuizBase):
    id: str
    status: QuizStatus
    total_points: float
    randomize_questions: bool
    show_correct_answers: bool

    model_config = {"from_attributes": True}