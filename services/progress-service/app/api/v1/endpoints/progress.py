"""Progress endpoints."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db
from app.schemas.progress import LessonProgressCreate, LessonProgressRead
from app.services.progress_service import ProgressService
from shared.domain.progress import LessonProgress

router = APIRouter()


@router.post("/", response_model=LessonProgressRead, status_code=201)
async def create_progress(progress_in: LessonProgressCreate, db: AsyncSession = Depends(get_db)):
    service = ProgressService(db)
    progress = await service.update_progress(progress_in.model_dump())
    return progress


@router.get("/{progress_id}", response_model=LessonProgressRead)
async def get_progress(progress_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(LessonProgress).where(LessonProgress.id == progress_id))
    progress = result.scalar_one_or_none()
    if not progress:
        raise HTTPException(status_code=404, detail="Progress not found")
    return progress
