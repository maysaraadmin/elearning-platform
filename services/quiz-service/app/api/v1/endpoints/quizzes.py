"""Quiz endpoints."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db
from app.schemas.quiz import QuizCreate, QuizRead
from app.services.quiz_service import QuizService
from shared.domain.quiz import Quiz

router = APIRouter()


@router.post("/", response_model=QuizRead, status_code=201)
async def create_quiz(quiz_in: QuizCreate, db: AsyncSession = Depends(get_db)):
    service = QuizService(db)
    quiz = await service.create(quiz_in)
    return quiz


@router.get("/{quiz_id}", response_model=QuizRead)
async def get_quiz(quiz_id: str, db: AsyncSession = Depends(get_db)):
    service = QuizService(db)
    quiz = await service.get_by_id(quiz_id)
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    return quiz
