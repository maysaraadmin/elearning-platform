"""API v1 router."""
from fastapi import APIRouter

from app.api.v1.endpoints import enrollments, progress, certificates

api_router = APIRouter()

api_router.include_router(enrollments.router, prefix="/enrollments", tags=["enrollments"])
api_router.include_router(progress.router, prefix="/progress", tags=["progress"])
api_router.include_router(certificates.router, prefix="/certificates", tags=["certificates"])