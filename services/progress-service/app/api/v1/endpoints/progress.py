"""Progress endpoints."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.database import get_session
from app.schemas.progress import LessonProgressCreate, LessonProgressRead
from shared.domain.progress import LessonProgress

router = APIRouter()


@router.post("/", response_model=LessonProgressRead, status_code=201)
async def create_progress(progress_in: LessonProgressCreate, db: AsyncSession = Depends(get_db)):
    progress = LessonProgress(**progress_in.model_dump())
    db.add(progress)
    await db.commit()
    await db.refresh(progress)
    return progress


@router.get("/{progress_id}", response_model=LessonProgressRead)
async def get_progress(progress_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(LessonProgress).where(LessonProgress.id == progress_id))
    progress = result.scalar_one_or_none()
    if not progress:
        raise HTTPException(status_code=404, detail="Progress not found")
    return progress