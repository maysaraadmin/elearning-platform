"""Notification service layer."""
from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from shared.domain.notification import Notification


class NotificationService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, data: dict) -> Notification:
        notification = Notification(**data)
        self.db.add(notification)
        await db.commit()
        await db.refresh(notification)
        return notification

    async def list_for_user(self, user_id: str) -> list[Notification]:
        result = await self.db.execute(
            select(Notification).where(Notification.user_id == user_id).order_by(Notification.created_at.desc())
        )
        return list(result.scalars().all())