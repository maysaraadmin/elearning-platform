"""API v1 router."""
from fastapi import APIRouter

from app.api.v1.endpoints import orders, webhooks

api_router = APIRouter()

api_router.include_router(orders.router, prefix="/orders", tags=["orders"])
api_router.include_router(webhooks.router, prefix="/webhooks", tags=["webhooks"])