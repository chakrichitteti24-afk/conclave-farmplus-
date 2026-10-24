"""
FarmPulse FastAPI Application Entry Point
IC26-01-01 — Explainable Crop Stress Advisory
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import structlog

from app.core.config import settings
from app.core.database import init_db
from app.api.routes import (
    fields,
    crop_stress,
    alerts,
    judge,
    health,
)

log = structlog.get_logger()


@asynccontextmanager
async def lifespan(app: FastAPI):
    log.info("FarmPulse API starting up", version=settings.APP_VERSION)
    await init_db()
    yield
    log.info("FarmPulse API shutting down")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Explainable Crop Stress Advisory — IC26-01-01",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    lifespan=lifespan,
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
API_PREFIX = "/api/v1"

app.include_router(health.router,       prefix=API_PREFIX, tags=["Health"])
app.include_router(fields.router,       prefix=API_PREFIX, tags=["Field Profiles"])
app.include_router(crop_stress.router,  prefix=API_PREFIX, tags=["Crop Stress"])
app.include_router(alerts.router,       prefix=API_PREFIX, tags=["Proactive Alerts"])
app.include_router(judge.router,        prefix=API_PREFIX, tags=["Judge Test Suite"])


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    log.error("unhandled_exception", error=str(exc))
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error. Please try again."},
    )
