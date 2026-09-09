"""Invoice service layer."""
from __future__ import annotations

from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession

from shared.domain.payment import Invoice, Order


class InvoiceService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_from_order(self, order: Order) -> Invoice:
        invoice = Invoice(
            order_id=order.id,
            user_id=order.user_id,
            invoice_number=f"INV-{order.id.hex[:8]}",
            amount=order.amount,
            currency=order.currency,
            total_amount=order.amount,
            due_date=datetime.now(),
        )
        self.db.add(invoice)
        await self.db.commit()
        await db.refresh(invoice)
        return invoice