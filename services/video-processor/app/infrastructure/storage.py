"""Storage configuration."""
from __future__ import annotations

import boto3
from app.config import settings

s3_client = boto3.client(
    "s3",
    endpoint_url=settings.minio_endpoint,
    aws_access_key_id=settings.minio_access_key,
    aws_secret_access_key=settings.minio_secret_key,
)


async def get_storage():
    return s3_client
