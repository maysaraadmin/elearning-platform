"""Video repository."""
from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from shared.domain.video import VideoAsset


class VideoRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, video_id: str) -> VideoAsset | None:
        result = await self.db.execute(select(VideoAsset).where(VideoAsset.id == video_id))
        return result.scalar_one_or_none()
