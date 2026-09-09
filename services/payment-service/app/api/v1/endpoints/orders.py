"""Order endpoints."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.database import get_session
from app.schemas.order import OrderCreate, OrderRead
from shared.domain.payment import Order

router = APIRouter()


@router.post("/", response_model=OrderRead, status_code=201)
async def create_order(order_in: OrderCreate, db: AsyncSession = Depends(get_db)):
    order = Order(**order_in.model_dump())
    db.add(order)
    await db.commit()
    await db.refresh(order)
    return order


@router.get("/{order_id}", response_model=OrderRead)
async def get_order(order_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Order).where(Order.id == order_id))
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order