"""API v1 router."""
from fastapi import APIRouter

from app.api.v1.endpoints import events, reports, metrics

api_router = APIRouter()

api_router.include_router(events.router, prefix="/events", tags=["events"])
api_router.include_router(metrics.router, prefix="/metrics", tags=["metrics"])
api_router.include_router(reports.router, prefix="/reports", tags=["reports"])