"""Analytics service layer."""
from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from shared.domain.analytics import Event, Metric, Report


class AnalyticsService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def track_event(self, event_in: dict) -> Event:
        event = Event(**event_in)
        self.db.add(event)
        await self.db.commit()
        await self.db.refresh(event)
        return event

    async def get_events(self, skip: int = 0, limit: int = 100) -> list[Event]:
        result = await self.db.execute(select(Event).offset(skip).limit(limit))
        return list(result.scalars().all())