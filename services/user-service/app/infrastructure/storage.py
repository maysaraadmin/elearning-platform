"""Storage configuration."""
from __future__ import annotations

import boto3
from app.config import settings

s3_client = boto3.client("s3", endpoint_url="http://minio:9000")


async def get_storage():
    return s3_client