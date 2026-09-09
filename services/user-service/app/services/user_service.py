"""User service layer."""
from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from shared.domain.user import User


class UserService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_email(self, email: str) -> User | None:
        result = await self.db.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()

    async def create(self, user_in: dict) -> User:
        user = User(**user_in)
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)
        return user