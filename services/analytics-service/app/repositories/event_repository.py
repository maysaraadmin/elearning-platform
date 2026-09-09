"""Event repository."""
from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from shared.domain.analytics import Event


class EventRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, event_id: str) -> Event | None:
        result = await self.db.execute(select(Event).where(Event.id == event_id))
        return result.scalar_one_or_none()

    async def list(self, skip: int = 0, limit: int = 100) -> list[Event]:
        result = await self.db.execute(select(Event).offset(skip).limit(limit))
        return list(result.scalars().all())