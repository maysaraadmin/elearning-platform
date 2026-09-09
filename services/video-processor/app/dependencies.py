"""Authentication dependencies."""
from __future__ import annotations

import uuid
from typing import Annotated

from fastapi import Depends, Header, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.database import get_session


async def get_db() -> AsyncSession:
    async with get_session() as session:
        yield session


async def get_current_user_id(x_user_id: Annotated[str, Header(alias="X-User-ID")]) -> uuid.UUID:
    """Extract user ID from X-User-ID header (set by API Gateway after auth)."""
    try:
        return uuid.UUID(x_user_id)
    except (ValueError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user ID",
        )


async def get_current_user_role(x_user_role: Annotated[str, Header(alias="X-User-Role")]) -> str:
    """Extract user role from X-User-Role header."""
    if x_user_role not in ("student", "instructor", "admin", "moderator"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid role",
        )
    return x_user_role


def require_role(*allowed_roles: str):
    """Dependency factory for role-based access control."""
    async def role_checker(role: str = Depends(get_current_user_role)) -> str:
        if role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Role '{role}' not authorized for this action",
            )
        return role
    return role_checker