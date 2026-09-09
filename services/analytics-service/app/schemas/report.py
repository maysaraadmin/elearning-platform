"""Report schemas."""
from __future__ import annotations

from datetime import datetime
from pydantic import BaseModel


class ReportBase(BaseModel):
    name: str
    report_type: str
    parameters: dict | None = None
    file_url: str | None = None


class ReportCreate(ReportBase):
    generated_by: str


class ReportRead(ReportBase):
    id: str
    generated_by: str
    generated_at: datetime
    result: dict | None

    model_config = {"from_attributes": True}