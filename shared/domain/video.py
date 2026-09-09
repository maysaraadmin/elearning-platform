"""Video processing domain models."""
from __future__ import annotations

import enum
import uuid
from typing import Optional

from sqlalchemy import Boolean, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from shared.domain import BaseModel, IDMixin, TimestampMixin


class VideoStatus(str, enum.Enum):
    """Video processing status."""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class VideoRendition(str, enum.Enum):
    """Video quality renditions."""
    LOW_240p = "240p"
    MEDIUM_480p = "480p"
    HIGH_720p = "720p"
    HD_1080p = "1080p"
    UHD_4k = "4k"


class VideoAsset(BaseModel, IDMixin, TimestampMixin):
    """Video asset entity."""
    __tablename__ = "video_assets"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    original_filename: Mapped[str] = mapped_column(String(255), nullable=False)
    file_size: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    duration_seconds: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    status: Mapped[VideoStatus] = mapped_column(default=VideoStatus.PENDING, nullable=False)
    format: Mapped[str] = mapped_column(String(20), nullable=False)
    storage_path: Mapped[str] = mapped_column(Text, nullable=False)
    hls_path: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    thumbnail_path: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    renditions: Mapped[Optional[list]] = mapped_column(JSONB, nullable=True)
    subtitles: Mapped[Optional[list]] = mapped_column(JSONB, nullable=True)
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_transcoded: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    user: Mapped["User"] = relationship("User")
    lessons: Mapped[list["Lesson"]] = relationship("Lesson", back_populates="video")