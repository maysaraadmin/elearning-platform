"""Shared observability setup."""
from __future__ import annotations

from fastapi import FastAPI
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.sdk.trace.export.in_memory_span_exporter import InMemorySpanExporter
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.instrumentation.sqlalchemy import SQLAlchemyInstrumentor

from shared.config import get_settings


def setup_observability(app: FastAPI, service_name: str, engine=None) -> None:
    """Initialize OpenTelemetry for the service."""
    settings = get_settings()

    provider = TracerProvider()
    provider.add_span_processor(BatchSpanProcessor(InMemorySpanExporter()))
    trace.set_tracer_provider(provider)

    FastAPIInstrumentor.instrument_app(app)
    if engine is not None:
        SQLAlchemyInstrumentor().instrument(engine=engine)