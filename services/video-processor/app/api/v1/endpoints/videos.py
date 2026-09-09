"""Video endpoints."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import JSONResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.database import get_session
from app.schemas.video import VideoAssetRead
from app.services.video_service import VideoService
from shared.domain.video import VideoAsset, VideoStatus

router = APIRouter()


@router.post("/upload", response_model=VideoAssetRead, status_code=201)
async def upload_video(file: UploadFile = File(...), db: AsyncSession = Depends(get_db)):
    service = VideoService(db)
    video = await service.upload(file)
    return video


@router.get("/{video_id}", response_model=VideoAssetRead)
async def get_video(video_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(VideoAsset).where(VideoAsset.id == video_id))
    video = result.scalar_one_or_none()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    return video


@router.get("/{video_id}/status")
async def get_video_status(video_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(VideoAsset).where(VideoAsset.id == video_id))
    video = result.scalar_one_or_none()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    return {"video_id": video.id, "status": video.status, "progress": None}
