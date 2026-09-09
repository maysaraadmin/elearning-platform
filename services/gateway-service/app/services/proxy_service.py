"""Proxy service layer."""
from __future__ import annotations

import httpx
from app.config import settings


class ProxyService:
    def __init__(self):
        self.client = httpx.AsyncClient()

    async def proxy(self, service: str, path: str, method: str, headers: dict, body: bytes):
        base_url = {
            "users": settings.user_service_url,
            "courses": settings.course_service_url,
            "videos": settings.video_service_url,
            "quizzes": settings.quiz_service_url,
            "progress": settings.progress_service_url,
            "payments": settings.payment_service_url,
            "analytics": settings.analytics_service_url,
            "notifications": settings.notification_service_url,
        }.get(service)
        if not base_url:
            raise ValueError("Unknown service")
        url = f"{base_url}/{path}"
        request = self.client.build_request(method, url, headers=headers, content=body)
        response = await self.client.send(request, stream=False)
        return response