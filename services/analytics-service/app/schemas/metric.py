"""Metric schemas."""
from __future__ import annotations

from datetime import datetime
from pydantic import BaseModel


class MetricBase(BaseModel):
    name: str
    value: float
    dimensions: dict | None = None
    period_start: datetime
    period_end: datetime
    aggregation: str = "sum"


class MetricCreate(MetricBase):
    pass


class MetricRead(MetricBase):
    id: str

    model_config = {"from_attributes": True}