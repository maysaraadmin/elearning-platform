"""Report endpoints."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.database import get_session
from app.schemas.report import ReportCreate, ReportRead
from shared.domain.analytics import Report

router = APIRouter()


@router.post("/", response_model=ReportRead, status_code=201)
async def generate_report(report_in: ReportCreate, db: AsyncSession = Depends(get_session)):
    report = Report(**report_in.model_dump())
    db.add(report)
    await db.commit()
    await db.refresh(report)
    return report