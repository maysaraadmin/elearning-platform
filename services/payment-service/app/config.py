"""Application configuration."""
from __future__ import annotations

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql+asyncpg://elearning:elearning@postgres:5432/elearning"
    redis_url: str = "redis://redis:6379/0"
    stripe_secret_key: str = ""
    stripe_webhook_secret: str = ""
    cors_origins: list[str] = ["*"]
    service_name: str = "payment-service"
    service_port: int = 8006
    log_level: str = "info"


settings = Settings()