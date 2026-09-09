"""Certificate schemas."""
from __future__ import annotations

from datetime import datetime
from pydantic import BaseModel


class CertificateRead(BaseModel):
    id: str
    user_id: str
    course_id: str
    enrollment_id: str
    certificate_url: str
    certificate_number: str
    final_score: float
    issued_at: datetime

    model_config = {"from_attributes": True}