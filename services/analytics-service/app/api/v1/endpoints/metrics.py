"""Metrics endpoints."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.database import get_session
from app.schemas.metric import MetricCreate, MetricRead
from shared.domain.analytics import Metric

router = APIRouter()


@router.post("/", response_model=MetricRead, status_code=201)
async def create_metric(metric_in: MetricCreate, db: AsyncSession = Depends(get_session)):
    metric = Metric(**metric_in.model_dump())
    db.add(metric)
    await db.commit()
    await db.refresh(metric)
    return metric