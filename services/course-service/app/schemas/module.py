"""Module schemas."""
from __future__ import annotations

from pydantic import BaseModel


class ModuleBase(BaseModel):
    course_id: str
    title: str
    description: str | None = None
    order_index: int = 0


class ModuleCreate(ModuleBase):
    pass


class ModuleRead(ModuleBase):
    id: str
    duration_minutes: int

    model_config = {"from_attributes": True}