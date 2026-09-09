"""Application configuration."""
from __future__ import annotations

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    user_service_url: str = "http://user-service:8001"
    course_service_url: str = "http://course-service:8002"
    video_service_url: str = "http://video-processor:8003"
    quiz_service_url: str = "http://quiz-service:8004"
    progress_service_url: str = "http://progress-service:8005"
    payment_service_url: str = "http://payment-service:8006"
    analytics_service_url: str = "http://analytics-service:8007"
    notification_service_url: str = "http://notification-service:8008"
    cors_origins: list[str] = ["*"]
    service_name: str = "gateway-service"
    service_port: int = 8000
    log_level: str = "info"


settings = Settings()
