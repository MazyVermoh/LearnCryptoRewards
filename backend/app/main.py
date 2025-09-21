"""FastAPI application bootstrap."""

import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import api_router
from app.core.config import settings
from app.services.telegram_bot import initialise_telegram_bot

app = FastAPI(title=settings.app_name)

logger = logging.getLogger(__name__)

# Basic CORS setup; adjust origins later when frontend domains are known.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")


@app.get("/", summary="Root health check")
async def root_health() -> dict[str, str]:
    return {"status": "ok", "service": settings.app_name}


@app.on_event("startup")
async def on_startup() -> None:
    manager = initialise_telegram_bot()
    if manager:
        logger.info("Telegram bot initialised")
    else:
        logger.info("Telegram bot token not configured; skipping initialisation")
