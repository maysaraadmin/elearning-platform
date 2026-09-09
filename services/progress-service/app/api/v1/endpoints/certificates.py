"""Certificate endpoints."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.database import get_session
from app.schemas.certificate import CertificateRead
from shared.domain.progress import CourseCompletion

router = APIRouter()


@router.get("/{user_id}/courses/{course_id}", response_model=CertificateRead)
async def get_certificate(user_id: str, course_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(CourseCompletion).where(
            CourseCompletion.user_id == user_id,
            CourseCompletion.course_id == course_id,
        )
    )
    certificate = result.scalar_one_or_none()
    if not certificate:
        raise HTTPException(status_code=404, detail="Certificate not found")
    return certificate