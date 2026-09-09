"""Video processing worker."""
from __future__ import annotations

import asyncio
import logging
import tempfile
import shutil
from pathlib import Path

import aio_pika
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker

from app.config import settings
from app.services.transcoder import Transcoder
from app.infrastructure.storage import get_s3_client, ensure_bucket_exists
from shared.domain.video import VideoAsset, VideoStatus

logger = logging.getLogger(__name__)
engine = create_async_engine(settings.database_url, echo=False)
session_factory = async_sessionmaker(engine, expire_on_commit=False)
transcoder = Transcoder()


async def upload_to_storage(local_path: str, s3_key: str) -> str:
    async with get_s3_client() as s3:
        await s3.upload_file(local_path, settings.minio_bucket, s3_key)
    return f"{settings.minio_endpoint}/{settings.minio_bucket}/{s3_key}"


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
        
        with tempfile.TemporaryDirectory() as tmp_dir:
            try:
                output_paths = await transcoder.transcode_multi_rendition(video.storage_path, tmp_dir)
                
                # Upload all renditions to S3
                uploaded_paths = {}
                for name, path in output_paths.items():
                    s3_key = f"{video_id}/{name}/output.m3u8" if name != "master" else f"{video_id}/master.m3u8"
                    uploaded_paths[name] = await upload_to_storage(path, s3_key)
                
                async with session_factory() as session:
                    result = await session.execute(
                        select(VideoAsset).where(VideoAsset.id == video_id)
                    )
                    video = result.scalar_one_or_none()
                    if video:
                        video.status = VideoStatus.COMPLETED
                        video.hls_path = uploaded_paths.get("master")
                        video.renditions = uploaded_paths
                        video.is_transcoded = True
                        await session.commit()
            except Exception as exc:
                logger.error(f"Video processing failed for {video_id}: {exc}")
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
    await ensure_bucket_exists()
    connection = await aio_pika.connect_robust(settings.rabbitmq_url)
    channel = await connection.channel()
    await channel.set_qos(prefetch_count=5)
    queue = await channel.declare_queue("video-processing", durable=True)
    await queue.consume(process_video)
    logger.info("Video worker started")
    try:
        await asyncio.Future()  # Run forever
    finally:
        await connection.close()


if __name__ == "__main__":
    asyncio.run(start_worker())
