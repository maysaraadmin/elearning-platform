"""Analytics event endpoints."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.database import get_session
from app.schemas.event import EventCreate, EventRead
from shared.domain.analytics import Event

router = APIRouter()


@router.post("/", response_model=EventRead, status_code=201)
async def track_event(event_in: EventCreate, db: AsyncSession = Depends(get_session)):
    event = Event(**event_in.model_dump())
    db.add(event)
    await db.commit()
    await db.refresh(event)
    return event


@router.get("/{event_id}", response_model=EventRead)
async def get_event(event_id: str, db: AsyncSession = Depends(get_session)):
    result = await db.execute(select(Event).where(Event.id == event_id))
    event = result.scalar_one_or_none()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event