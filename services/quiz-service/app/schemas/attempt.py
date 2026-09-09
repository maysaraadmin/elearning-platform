"""Quiz attempt schemas."""
from __future__ import annotations

from datetime import datetime
from pydantic import BaseModel
from shared.domain.quiz import QuizStatus


class AttemptBase(BaseModel):
    quiz_id: str
    user_id: str
    attempt_number: int = 1


class AttemptCreate(AttemptBase):
    pass


class AttemptRead(AttemptBase):
    id: str
    started_at: datetime
    completed_at: datetime | None
    total_score: float
    max_score: float
    percentage: float
    passed: bool
    time_taken_seconds: int

    model_config = {"from_attributes": True}