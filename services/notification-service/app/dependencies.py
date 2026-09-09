"""Shared dependencies."""
from __future__ import annotations

from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.database import get_session
from shared.auth import get_current_user, require_role


async def get_db() -> AsyncSession:
    async with get_session() as session:
        yield session


def get_current_user_id(user: Annotated[dict, Depends(get_current_user)]) -> str:
    return user.user_id