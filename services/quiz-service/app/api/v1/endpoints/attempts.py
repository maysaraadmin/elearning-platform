"""Quiz attempt endpoints."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db
from app.schemas.attempt import AttemptCreate, AttemptRead
from shared.domain.quiz import QuizAttempt

router = APIRouter()


@router.post("/", response_model=AttemptRead, status_code=201)
async def create_attempt(attempt_in: AttemptCreate, db: AsyncSession = Depends(get_db)):
    attempt = QuizAttempt(**attempt_in.model_dump())
    db.add(attempt)
    await db.commit()
    await db.refresh(attempt)
    return attempt


@router.get("/{attempt_id}", response_model=AttemptRead)
async def get_attempt(attempt_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(QuizAttempt).where(QuizAttempt.id == attempt_id))
    attempt = result.scalar_one_or_none()
    if not attempt:
        raise HTTPException(status_code=404, detail="Attempt not found")
    return attempt