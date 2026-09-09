"""Lesson endpoints."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.database import get_session
from app.schemas.lesson import LessonCreate, LessonRead
from shared.domain.course import Lesson

router = APIRouter()


@router.post("/", response_model=LessonRead, status_code=201)
async def create_lesson(lesson_in: LessonCreate, db: AsyncSession = Depends(get_db)):
    lesson = Lesson(**lesson_in.model_dump())
    db.add(lesson)
    await db.commit()
    await db.refresh(lesson)
    return lesson


@router.get("/{lesson_id}", response_model=LessonRead)
async def get_lesson(lesson_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Lesson).where(Lesson.id == lesson_id))
    lesson = result.scalar_one_or_none()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return lesson