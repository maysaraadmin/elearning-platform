"""Course service layer."""
from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from shared.domain.course import Course


class CourseService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, data: dict) -> Course:
        course = Course(**data)
        self.db.add(course)
        await self.db.commit()
        await self.db.refresh(course)
        return course

    async def get_by_id(self, course_id: str) -> Course | None:
        result = await self.db.execute(select(Course).where(Course.id == course_id))
        return result.scalar_one_or_none()

    async def list(self, skip: int = 0, limit: int = 100) -> list[Course]:
        result = await self.db.execute(select(Course).offset(skip).limit(limit))
        return list(result.scalars().all())