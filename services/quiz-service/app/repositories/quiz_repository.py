"""Quiz repository."""
from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from shared.domain.quiz import Quiz


class QuizRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, quiz_id: str) -> Quiz | None:
        result = await self.db.execute(select(Quiz).where(Quiz.id == quiz_id))
        return result.scalar_one_or_none()

    async def list_by_course(self, course_id: str) -> list[Quiz]:
        result = await self.db.execute(select(Quiz).where(Quiz.course_id == course_id))
        return list(result.scalars().all())