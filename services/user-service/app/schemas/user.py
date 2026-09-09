"""User schemas."""
from __future__ import annotations

from pydantic import BaseModel, EmailStr
from shared.domain.user import Role


class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: Role = Role.STUDENT


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    email: EmailStr | None = None
    full_name: str | None = None
    bio: str | None = None
    avatar_url: str | None = None


class UserRead(UserBase):
    id: str
    is_active: bool
    is_verified: bool
    avatar_url: str | None
    bio: str | None

    model_config = {"from_attributes": True}