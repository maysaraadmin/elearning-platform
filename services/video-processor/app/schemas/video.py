"""Video schemas."""
from __future__ import annotations

from pydantic import BaseModel
from shared.domain.video import VideoStatus, VideoRendition


class VideoAssetBase(BaseModel):
    title: str
    description: str | None = None
    original_filename: str
    file_size: int = 0
    duration_seconds: int = 0


class VideoAssetCreate(VideoAssetBase):
    user_id: str


class VideoAssetRead(VideoAssetBase):
    id: str
    status: VideoStatus
    format: str
    storage_path: str
    hls_path: str | None
    thumbnail_path: str | None
    renditions: list[VideoRendition] | None
    is_transcoded: bool

    model_config = {"from_attributes": True}
