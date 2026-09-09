"""User Service main application."""
from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.infrastructure.database import init_db
from app.api.v1.router import api_router
from shared.exceptions import add_exception_handlers
from shared.observability import setup_observability


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(
    title="User Service",
    description="User management and authentication service",
    version="1.0.0",
    lifespan=lifespan,
)

add_exception_handlers(app)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")

setup_observability(app, "user-service")


@app.get("/health")
async def health():
    return {"status": "healthy", "service": "user-service"}
