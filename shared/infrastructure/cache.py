"""Cache infrastructure shared across services."""
from __future__ import annotations

import redis.asyncio as redis
from typing import AsyncIterator


def create_redis_client(redis_url: str):
    """Create a Redis client."""
    return redis.from_url(redis_url, decode_responses=True)


async def get_cache(client) -> AsyncIterator:
    """Dependency generator for cache access."""
    yield client