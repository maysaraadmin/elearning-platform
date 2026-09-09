"""Video endpoints."""
from __future__ import annotations

import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from fastapi.responses import JSONResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db, get_current_user_id
from app.schemas.video import VideoAssetRead
from app.services.video_service import VideoService
from shared.domain.video import VideoAsset, VideoStatus

router = APIRouter()

ALLOWED_VIDEO_TYPES = {
    "video/mp4",
    "video/webm",
    "video/quicktime",
    "video/x-msvideo",
    "video/x-matroska",
}
MAX_FILE_SIZE = 5 * 1024 * 1024 * 1024  # 5GB


def validate_video_file(file: UploadFile) -> None:
    if file.content_type not in ALLOWED_VIDEO_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type: {file.content_type}. Allowed: {', '.join(ALLOWED_VIDEO_TYPES)}",
        )
    # Note: file.size may not be available until read, so we check after reading


@router.post("/upload", response_model=VideoAssetRead, status_code=201)
async def upload_video(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    user_id: uuid.UUID = Depends(get_current_user_id),
):
    validate_video_file(file)
    
    # Read file to check size and save
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File too large. Maximum size: {MAX_FILE_SIZE / (1024**3):.1f}GB",
        )
    
    # Reset file pointer for service to read
    await file.seek(0)
    
    service = VideoService(db)
    video = await service.upload(file, user_id)
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
