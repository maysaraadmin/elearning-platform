"""Notification endpoints."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.database import get_session
from app.schemas.notification import NotificationCreate, NotificationRead
from shared.domain.notification import Notification

router = APIRouter()


@router.post("/", response_model=NotificationRead, status_code=201)
async def create_notification(notification_in: NotificationCreate, db: AsyncSession = Depends(get_db)):
    notification = Notification(**notification_in.model_dump())
    db.add(notification)
    await db.commit()
    await db.refresh(notification)
    return notification


@router.get("/user/{user_id}", response_model=list[NotificationRead])
async def list_notifications(user_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Notification).where(Notification.user_id == user_id).order_by(Notification.created_at.desc())
    )
    notifications = result.scalars().all()
    return notifications