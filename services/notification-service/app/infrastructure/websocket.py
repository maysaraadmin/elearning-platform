"""WebSocket configuration."""
from __future__ import annotations

import websockets
from app.config import settings

active_connections: dict[str, websockets.WebSocketServerProtocol] = {}


async def broadcast(user_id: str, message: dict):
    connection = active_connections.get(user_id)
    if connection:
        await connection.send_json(message)