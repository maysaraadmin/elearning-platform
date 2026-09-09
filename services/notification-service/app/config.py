"""Application configuration."""
from __future__ import annotations

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql+asyncpg://elearning:elearning@postgres:5432/elearning"
    redis_url: str = "redis://redis:6379/0"
    rabbitmq_url: str = "amqp://guest:guest@rabbitmq:5672/"
    smtp_host: str = "smtp.example.com"
    smtp_port: int = 587
    smtp_user: str = "user"
    smtp_password: str = "password"
    cors_origins: list[str] = ["*"]
    service_name: str = "notification-service"
    service_port: int = 8008
    log_level: str = "info"


settings = Settings()