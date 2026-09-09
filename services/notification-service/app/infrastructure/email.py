"""Email configuration."""
from __future__ import annotations

import aiosmtplib
from app.config import settings


async def send_email(to: str, subject: str, body: str):
    message = aiosmtplib.EmailMessage(
        subject=subject,
        body=body,
        from_=settings.smtp_user,
        to=[to],
    )
    await aiosmtplib.send(
        message,
        hostname=settings.smtp_host,
        port=settings.smtp_port,
        username=settings.smtp_user,
        password=settings.smtp_password,
        start_tls=True,
    )