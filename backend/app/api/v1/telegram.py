"""Telegram webhook endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Body, HTTPException
from pydantic import BaseModel, HttpUrl

from app.api.deps import AsyncSessionDep
from app.services.telegram_bot import initialise_telegram_bot

router = APIRouter()


class SetWebhookRequest(BaseModel):
    url: HttpUrl


@router.post("/webhook", summary="Telegram webhook endpoint")
async def telegram_webhook(
    session: AsyncSessionDep,
    payload: dict = Body(..., description="Webhook update payload"),
) -> dict[str, bool]:
    manager = initialise_telegram_bot()
    if manager is None:
        raise HTTPException(status_code=503, detail="Telegram bot not configured")

    await manager.process_update(session, payload)
    await session.commit()
    return {"ok": True}


@router.get("/info", summary="Telegram bot info")
async def telegram_info() -> dict:
    manager = initialise_telegram_bot()
    if manager is None:
        raise HTTPException(status_code=503, detail="Telegram bot not configured")
    return await manager.get_me()


@router.post("/set-webhook", summary="Configure Telegram webhook")
async def telegram_set_webhook(request: SetWebhookRequest) -> dict:
    manager = initialise_telegram_bot()
    if manager is None:
        raise HTTPException(status_code=503, detail="Telegram bot not configured")
    return await manager.set_webhook(str(request.url))
