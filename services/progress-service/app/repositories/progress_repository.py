"""Progress repository."""
from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from shared.domain.progress import Enrollment, LessonProgress


class ProgressRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_enrollment(self, user_id: str, course_id: str) -> Enrollment | None:
        result = await self.db.execute(
            select(Enrollment).where(
                Enrollment.user_id == user_id,
                Enrollment.course_id == course_id,
            )
        )
        return result.scalar_one_or_none()

    async def get_lesson_progress(self, user_id: str, lesson_id: str) -> LessonProgress | None:
        result = await self.db.execute(
            select(LessonProgress).where(
                LessonProgress.user_id == user_id,
                LessonProgress.lesson_id == lesson_id,
            )
        )
        return result.scalar_one_or_none()