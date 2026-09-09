"""API v1 router with proxy routes."""
from __future__ import annotations

from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import JSONResponse
import httpx

from app.config import settings

router = APIRouter()


SERVICE_MAP = {
    "users": settings.user_service_url,
    "courses": settings.course_service_url,
    "videos": settings.video_service_url,
    "quizzes": settings.quiz_service_url,
    "progress": settings.progress_service_url,
    "payments": settings.payment_service_url,
    "analytics": settings.analytics_service_url,
    "notifications": settings.notification_service_url,
}


@router.api_route("/{service}/{path:path}", methods=["GET", "POST", "PUT", "PATCH", "DELETE"])
async def proxy(service: str, path: str, request: Request):
    base_url = SERVICE_MAP.get(service)
    if not base_url:
        raise HTTPException(status_code=404, detail="Service not found")

    url = f"{base_url}/{path}"
    async with httpx.AsyncClient() as client:
        req = client.build_request(
            request.method,
            url,
            headers=request.headers.raw,
            content=await request.body(),
        )
        response = await client.send(req, stream=False)
    return JSONResponse(
        status_code=response.status_code,
        content=response.json(),
        headers=dict(response.headers),
    )
