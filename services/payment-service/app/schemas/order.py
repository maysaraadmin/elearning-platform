"""Order schemas."""
from __future__ import annotations

from pydantic import BaseModel
from shared.domain.payment import PaymentMethod, PaymentStatus


class OrderBase(BaseModel):
    user_id: str
    course_id: str
    amount: float
    currency: str = "USD"
    payment_method: PaymentMethod


class OrderCreate(OrderBase):
    pass


class OrderRead(OrderBase):
    id: str
    status: PaymentStatus
    payment_intent_id: str | None
    receipt_url: str | None

    model_config = {"from_attributes": True}