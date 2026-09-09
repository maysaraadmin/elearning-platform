"""Video processing worker."""
from __future__ import annotations

import asyncio
import logging

import aio_pika
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker

from app.config import settings
from app.services.transcoder import Transcoder
from shared.domain.video import VideoAsset, VideoStatus

logger = logging.getLogger(__name__)
engine = create_async_engine(settings.database_url, echo=False)
session_factory = async_sessionmaker(engine, expire_on_commit=False)
transcoder = Transcoder()


async def process_video(message: aio_pika.IncomingMessage):
    async with message.process():
        video_id = message.body.decode()
        async with session_factory() as session:
            result = await session.execute(
                select(VideoAsset).where(VideoAsset.id == video_id)
            )
            video = result.scalar_one_or_none()
            if not video:
                return
            video.status = VideoStatus.PROCESSING
            await session.commit()
        try:
            await transcoder.transcode(video.storage_path, f"/tmp/{video_id}")
            async with session_factory() as session:
                result = await session.execute(
                    select(VideoAsset).where(VideoAsset.id == video_id)
                )
                video = result.scalar_one_or_none()
                if video:
                    video.status = VideoStatus.COMPLETED
                    video.hls_path = f"/tmp/{video_id}/output.m3u8"
                    video.is_transcoded = True
                    await session.commit()
        except Exception as exc:
            async with session_factory() as session:
                result = await session.execute(
                    select(VideoAsset).where(VideoAsset.id == video_id)
                )
                video = result.scalar_one_or_none()
                if video:
                    video.status = VideoStatus.FAILED
                    video.error_message = str(exc)
                    await session.commit()


async def start_worker():
    connection = await aio_pika.connect_robust(settings.rabbitmq_url)
    channel = await connection.channel()
    queue = await channel.declare_queue("video-processing", durable=True)
    await queue.consume(process_video)
    logger.info("Video worker started")


if __name__ == "__main__":
    asyncio.run(start_worker())
