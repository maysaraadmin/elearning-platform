"""Video service layer."""
from __future__ import annotations

import uuid
from sqlalchemy.ext.asyncio import AsyncSession

from shared.domain.video import VideoAsset, VideoStatus


class VideoService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def upload(self, file) -> VideoAsset:
        video = VideoAsset(
            user_id=uuid.uuid4(),
            title=file.filename,
            original_filename=file.filename,
            format=file.content_type,
            status=VideoStatus.PENDING,
        )
        self.db.add(video)
        await self.db.commit()
        await self.db.refresh(video)
        return video
