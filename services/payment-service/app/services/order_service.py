"""Order service layer."""
from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from shared.domain.payment import Order


class OrderService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, data: dict) -> Order:
        order = Order(**data)
        self.db.add(order)
        await self.db.commit()
        await self.db.refresh(order)
        return order

    async def get_by_id(self, order_id: str) -> Order | None:
        result = await self.db.execute(select(Order).where(Order.id == order_id))
        return result.scalar_one_or_none()