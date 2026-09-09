"""Progress service layer."""
from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from shared.domain.progress import Enrollment, LessonProgress


class ProgressService:
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

    async def update_progress(self, progress_in: dict) -> LessonProgress:
        progress = LessonProgress(**progress_in)
        self.db.add(progress)
        await self.db.commit()
        await self.db.refresh(progress)
        return progress