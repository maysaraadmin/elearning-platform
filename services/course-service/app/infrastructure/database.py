"""Database configuration."""
from __future__ import annotations

from app.config import settings
from shared.infrastructure.database import create_database_session, get_session, init_db as shared_init_db

engine, async_session_factory = create_database_session(settings.database_url)


async def init_db():
    await shared_init_db(engine)