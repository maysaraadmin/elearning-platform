"""Notification endpoints."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db
from app.schemas.notification import NotificationCreate, NotificationRead
from app.services.notification_service import NotificationService
from shared.domain.notification import Notification

router = APIRouter()


@router.post("/", response_model=NotificationRead, status_code=201)
async def create_notification(notification_in: NotificationCreate, db: AsyncSession = Depends(get_db)):
    service = NotificationService(db)
    notification = await service.create(notification_in)
    return notification


@router.get("/user/{user_id}", response_model=list[NotificationRead])
async def list_notifications(user_id: str, db: AsyncSession = Depends(get_db)):
    service = NotificationService(db)
    notifications = await service.list_for_user(user_id)
    return notifications
