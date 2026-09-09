"""Order repository."""
from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from shared.domain.payment import Order


class OrderRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, order_id: str) -> Order | None:
        result = await self.db.execute(select(Order).where(Order.id == order_id))
        return result.scalar_one_or_none()

    async def list_by_user(self, user_id: str) -> list[Order]:
        result = await self.db.execute(select(Order).where(Order.user_id == user_id))
        return list(result.scalars().all())