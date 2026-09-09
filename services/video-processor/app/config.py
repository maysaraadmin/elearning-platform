"""Application configuration."""
from __future__ import annotations

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str
    redis_url: str
    rabbitmq_url: str
    minio_endpoint: str
    minio_access_key: str
    minio_secret_key: str
    minio_bucket: str = "elearning-videos"
    cors_origins: list[str] = ["http://localhost:3000"]
    service_name: str = "video-processor"
    service_port: int = 8003
    log_level: str = "info"


settings = Settings()
