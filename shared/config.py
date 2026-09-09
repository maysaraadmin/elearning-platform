"""Shared configuration helpers."""
from __future__ import annotations

from functools import lru_cache
from pydantic_settings import BaseSettings


class SharedSettings(BaseSettings):
    """Common settings used by all services."""

    jwt_secret_key: str = "changeme"
    jwt_algorithm: str = "HS256"
    cors_origins: list[str] = ["http://localhost:3000"]


@lru_cache
def get_settings() -> SharedSettings:
    """Return cached shared settings."""
    return SharedSettings()