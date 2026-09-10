"""Enrollment endpoints."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db
from app.schemas.enrollment import EnrollmentCreate, EnrollmentRead
from shared.domain.progress import Enrollment

router = APIRouter()


@router.post("/", response_model=EnrollmentRead, status_code=201)
async def create_enrollment(enrollment_in: EnrollmentCreate, db: AsyncSession = Depends(get_db)):
    enrollment = Enrollment(**enrollment_in.model_dump())
    db.add(enrollment)
    await db.commit()
    await db.refresh(enrollment)
    return enrollment


@router.get("/{enrollment_id}", response_model=EnrollmentRead)
async def get_enrollment(enrollment_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Enrollment).where(Enrollment.id == enrollment_id))
    enrollment = result.scalar_one_or_none()
    if not enrollment:
        raise HTTPException(status_code=404, detail="Enrollment not found")
    return enrollment