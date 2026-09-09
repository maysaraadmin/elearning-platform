"""Webhook endpoints."""
from __future__ import annotations

from fastapi import APIRouter, Request

router = APIRouter()


@router.post("/stripe")
async def stripe_webhook(request: Request):
    payload = await request.body()
    signature = request.headers.get("stripe-signature", "")
    # Placeholder: verify signature and process event
    return {"received": True}