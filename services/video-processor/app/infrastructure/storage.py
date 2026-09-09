"""Storage configuration."""
from __future__ import annotations

import asyncio
from contextlib import asynccontextmanager
from typing import AsyncGenerator

import aiobotocore.session
from app.config import settings

_session = aiobotocore.session.get_session()


@asynccontextmanager
async def get_s3_client() -> AsyncGenerator:
    async with _session.create_client(
        "s3",
        endpoint_url=settings.minio_endpoint,
        aws_access_key_id=settings.minio_access_key,
        aws_secret_access_key=settings.minio_secret_key,
    ) as client:
        yield client


async def ensure_bucket_exists():
    async with get_s3_client() as client:
        try:
            await client.head_bucket(Bucket=settings.minio_bucket)
        except client.exceptions.ClientError:
            await client.create_bucket(Bucket=settings.minio_bucket)
