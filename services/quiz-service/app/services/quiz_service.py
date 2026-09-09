"""Quiz service layer."""
from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.quiz import QuizCreate
from shared.domain.quiz import Quiz


class QuizService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, quiz_in: QuizCreate) -> Quiz:
        quiz = Quiz(**quiz_in.model_dump())
        self.db.add(quiz)
        await self.db.commit()
        await self.db.refresh(quiz)
        return quiz

    async def get_by_id(self, quiz_id: str) -> Quiz | None:
        result = await self.db.execute(select(Quiz).where(Quiz.id == quiz_id))
        return result.scalar_one_or_none()