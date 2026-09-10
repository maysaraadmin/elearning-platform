"""Gateway Service main application."""
from __future__ import annotations

from contextlib import asynccontextmanager

import httpx
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware

from app.config import settings
from app.api.v1.router import router as api_router
from shared.observability import setup_observability


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.http_client = httpx.AsyncClient(timeout=30.0)
    yield
    await app.state.http_client.aclose()


app = FastAPI(
    title="E-Learning Platform API Gateway",
    description="Unified API gateway for all microservices",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(TrustedHostMiddleware, allowed_hosts=["localhost", "127.0.0.1"])

app.include_router(api_router, prefix="/api/v1")

setup_observability(app, "gateway-service")


@app.get("/")
async def root():
    return {
        "service": "gateway-service",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health",
        "api": "/api/v1"
    }


@app.get("/health")
async def health():
    return {"status": "healthy", "service": "gateway-service"}
