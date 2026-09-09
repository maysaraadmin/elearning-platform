"""API v1 router."""
from fastapi import APIRouter

from app.api.v1.endpoints import quizzes, attempts

api_router = APIRouter()

api_router.include_router(quizzes.router, prefix="/quizzes", tags=["quizzes"])
api_router.include_router(attempts.router, prefix="/attempts", tags=["attempts"])