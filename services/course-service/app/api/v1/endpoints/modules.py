"""Module endpoints."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db
from app.schemas.module import ModuleCreate, ModuleRead
from shared.domain.course import Module

router = APIRouter()


@router.post("/", response_model=ModuleRead, status_code=201)
async def create_module(module_in: ModuleCreate, db: AsyncSession = Depends(get_db)):
    module = Module(**module_in.model_dump())
    db.add(module)
    await db.commit()
    await db.refresh(module)
    return module


@router.get("/{module_id}", response_model=ModuleRead)
async def get_module(module_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Module).where(Module.id == module_id))
    module = result.scalar_one_or_none()
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    return module