"""Authentication and authorization shared across services."""
from __future__ import annotations

import uuid
from typing import Annotated

from fastapi import Depends, Header, HTTPException, status
from jose import JWTError, jwt

from shared.config import get_settings


class UserClaims:
    """Decoded JWT claims."""

    def __init__(self, user_id: str, role: str):
        self.user_id = uuid.UUID(user_id)
        self.role = role


def get_current_user(authorization: Annotated[str, Header(alias="Authorization")]) -> UserClaims:
    """Decode and validate JWT from Authorization header."""
    settings = get_settings()
    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication scheme",
        )
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm],
        )
        return UserClaims(user_id=payload["sub"], role=payload["role"])
    except (JWTError, KeyError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )


def require_role(*allowed_roles: str):
    """Dependency factory for role-based access control."""

    async def role_checker(user: UserClaims = Depends(get_current_user)) -> UserClaims:
        if user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Role '{user.role}' not authorized for this action",
            )
        return user

    return Depends(role_checker)