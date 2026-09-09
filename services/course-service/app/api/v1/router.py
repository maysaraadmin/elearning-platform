"""API v1 router."""
from fastapi import APIRouter

from app.api.v1.endpoints import courses, modules, lessons

api_router = APIRouter()

api_router.include_router(courses.router, prefix="/courses", tags=["courses"])
api_router.include_router(modules.router, prefix="/modules", tags=["modules"])
api_router.include_router(lessons.router, prefix="/lessons", tags=["lessons"])