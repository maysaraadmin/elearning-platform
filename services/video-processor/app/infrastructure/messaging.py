"""Messaging configuration."""
from __future__ import annotations

import asyncio
from contextlib import asynccontextmanager
from typing import AsyncGenerator

import aio_pika
from app.config import settings

_connection: aio_pika.RobustConnection | None = None
_channel: aio_pika.Channel | None = None
_lock = asyncio.Lock()


async def get_rabbitmq_connection() -> aio_pika.RobustConnection:
    global _connection
    if _connection is None or _connection.is_closed:
        async with _lock:
            if _connection is None or _connection.is_closed:
                _connection = await aio_pika.connect_robust(settings.rabbitmq_url)
    return _connection


async def get_rabbitmq_channel() -> aio_pika.Channel:
    global _channel
    connection = await get_rabbitmq_connection()
    if _channel is None or _channel.is_closed:
        async with _lock:
            if _channel is None or _channel.is_closed:
                _channel = await connection.channel()
                await _channel.set_qos(prefetch_count=10)
    return _channel


async def close_rabbitmq():
    global _connection, _channel
    if _channel and not _channel.is_closed:
        await _channel.close()
    if _connection and not _connection.is_closed:
        await _connection.close()
    _channel = None
    _connection = None
