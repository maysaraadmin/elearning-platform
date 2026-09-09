"""Invoice schemas."""
from __future__ import annotations

from datetime import datetime
from pydantic import BaseModel
from shared.domain.payment import PaymentStatus


class InvoiceRead(BaseModel):
    id: str
    order_id: str | None
    user_id: str
    invoice_number: str
    amount: float
    currency: str
    tax_amount: float
    total_amount: float
    status: PaymentStatus
    due_date: datetime
    paid_at: datetime | None
    pdf_url: str | None

    model_config = {"from_attributes": True}