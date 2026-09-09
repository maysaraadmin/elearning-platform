"""Database infrastructure shared across services."""
from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from typing import AsyncIterator

from shared.domain import BaseModel


def create_database_session(database_url: str, pool_size: int = 10, max_overflow: int = 20) -> tuple[object, async_sessionmaker]:
    """Create an async engine and session factory with tuned connection pooling."""
    engine_kwargs = {
        "echo": False,
        "pool_pre_ping": True,
    }
    if database_url.startswith("sqlite"):
        engine_kwargs["connect_args"] = {"check_same_thread": False}
    else:
        engine_kwargs.update(
            {
                "pool_size": pool_size,
                "max_overflow": max_overflow,
                "pool_recycle": 3600,
            }
        )
    engine = create_async_engine(database_url, **engine_kwargs)
    session_factory = async_sessionmaker(engine, expire_on_commit=False)
    return engine, session_factory


async def get_session(session_factory) -> AsyncIterator[AsyncSession]:
    """Dependency generator for database sessions."""
    async with session_factory() as session:
        yield session


async def init_db(engine) -> None:
    """Create all tables from the shared metadata."""
    async with engine.begin() as conn:
        await conn.run_sync(BaseModel.metadata.create_all)