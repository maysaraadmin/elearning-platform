"""Video Processor main application."""
from __future__ import annotations

from contextlib import asynccontextmanager
from time import time

from fastapi import FastAPI, Request, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.infrastructure.database import init_db
from app.infrastructure.messaging import close_rabbitmq
from app.api.v1.router import api_router
from shared.exceptions import add_exception_handlers
from shared.observability import setup_observability


# Simple in-memory rate limiter
_rate_limit_store: dict[str, list[float]] = {}
RATE_LIMIT_REQUESTS = 100
RATE_LIMIT_WINDOW = 60  # seconds


def check_rate_limit(client_ip: str) -> bool:
    now = time()
    if client_ip not in _rate_limit_store:
        _rate_limit_store[client_ip] = []
    # Clean old entries
    _rate_limit_store[client_ip] = [t for t in _rate_limit_store[client_ip] if now - t < RATE_LIMIT_WINDOW]
    if len(_rate_limit_store[client_ip]) >= RATE_LIMIT_REQUESTS:
        return False
    _rate_limit_store[client_ip].append(now)
    return True


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield
    await close_rabbitmq()


app = FastAPI(
    title="Video Processor",
    description="Video transcoding and processing service",
    version="1.0.0",
    lifespan=lifespan,
)

add_exception_handlers(app)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-User-ID"],
)


@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    client_ip = request.client.host if request.client else "unknown"
    if not check_rate_limit(client_ip):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded",
        )
    response = await call_next(request)
    return response


app.include_router(api_router, prefix="/api/v1")

setup_observability(app, "video-processor")


@app.get("/")
async def root():
    return {
        "service": "video-processor",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health",
        "api": "/api/v1"
    }


@app.get("/health")
async def health():
    return {"status": "healthy", "service": "video-processor"}
