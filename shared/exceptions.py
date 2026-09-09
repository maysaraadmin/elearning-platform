"""Shared exception handlers."""
from __future__ import annotations

import logging
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError, SQLAlchemyError

logger = logging.getLogger(__name__)


def add_exception_handlers(app: FastAPI) -> None:
    """Register common exception handlers on the app."""

    @app.exception_handler(IntegrityError)
    async def integrity_error_handler(request: Request, exc: IntegrityError):
        logger.warning(f"Integrity error on {request.url.path}: {exc}")
        return JSONResponse(
            status_code=409,
            content={"detail": "Resource already exists or constraint violated"},
        )

    @app.exception_handler(SQLAlchemyError)
    async def database_error_handler(request: Request, exc: SQLAlchemyError):
        logger.error(f"Database error on {request.url.path}: {exc}")
        return JSONResponse(
            status_code=500,
            content={"detail": "Database operation failed"},
        )