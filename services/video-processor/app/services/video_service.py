"""Video service layer."""
from __future__ import annotations

import uuid
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.storage import get_s3_client
from app.config import settings
from shared.domain.video import VideoAsset, VideoStatus


class VideoService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def upload(self, file, user_id: uuid.UUID) -> VideoAsset:
        # Create video record first to get ID
        video = VideoAsset(
            user_id=user_id,
            title=file.filename,
            original_filename=file.filename,
            format=file.content_type,
            status=VideoStatus.PENDING,
            storage_path="",  # Will be updated after upload
            file_size=0,
        )
        self.db.add(video)
        await self.db.commit()
        await self.db.refresh(video)
        
        # Upload file to storage
        content = await file.read()
        video.file_size = len(content)
        
        s3_key = f"uploads/{user_id}/{video.id}/{file.filename}"
        async with get_s3_client() as s3:
            await s3.put_object(
                Bucket=settings.minio_bucket,
                Key=s3_key,
                Body=content,
                ContentType=file.content_type,
            )
        
        video.storage_path = s3_key
        await self.db.commit()
        await self.db.refresh(video)
        return video
