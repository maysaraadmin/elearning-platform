"""Messaging configuration."""
from __future__ import annotations

from app.config import settings


async def get_rabbitmq_channel():
    import aio_pika
    connection = await aio_pika.connect_robust(settings.rabbitmq_url)
    channel = await connection.channel()
    return channel
