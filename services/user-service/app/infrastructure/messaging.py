"""Messaging configuration."""
from __future__ import annotations

from app.config import settings

RABBITMQ_URL = settings.redis_url.replace("redis", "amqp")


async def get_rabbitmq_channel():
    import aio_pika
    connection = await aio_pika.connect_robust(RABBITMQ_URL)
    channel = await connection.channel()
    return channel