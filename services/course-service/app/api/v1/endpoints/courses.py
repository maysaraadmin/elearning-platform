"""Course endpoints."""
from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db
from app.schemas.course import CourseCreate, CourseRead, CourseUpdate
from app.services.course_service import CourseService
from shared.domain.course import Course

router = APIRouter()


@router.post("/", response_model=CourseRead, status_code=status.HTTP_201_CREATED)
async def create_course(course_in: CourseCreate, db: AsyncSession = Depends(get_db)):
    service = CourseService(db)
    course = await service.create(course_in)
    return course


@router.get("/{course_id}", response_model=CourseRead)
async def get_course(course_id: str, db: AsyncSession = Depends(get_db)):
    service = CourseService(db)
    course = await service.get_by_id(course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course


@router.get("/", response_model=list[CourseRead])
async def list_courses(db: AsyncSession = Depends(get_db), skip: int = 0, limit: int = 100):
    service = CourseService(db)
    return await service.list(skip=skip, limit=limit)