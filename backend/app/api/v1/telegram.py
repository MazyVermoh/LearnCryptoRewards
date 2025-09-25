"""Telegram webhook endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Body, Header, HTTPException
from pydantic import BaseModel, HttpUrl

from app.api.deps import AsyncSessionDep
from app.core.config import settings
from app.services.telegram_bot import initialise_telegram_bot

router = APIRouter()
public_router = APIRouter()


class SetWebhookRequest(BaseModel):
    url: HttpUrl


def _get_manager():
    manager = initialise_telegram_bot()
    if manager is None:
        raise HTTPException(status_code=503, detail="Telegram bot not configured")
    return manager


def _validate_secret(header_value: str | None) -> None:
    expected = settings.telegram_webhook_secret
    if expected and header_value != expected:
        raise HTTPException(status_code=403, detail="Invalid webhook secret")


async def _process_webhook(
    session: AsyncSessionDep,
    payload: dict,
    secret_header: str | None,
) -> dict[str, bool]:
    _validate_secret(secret_header)
    manager = _get_manager()
    await manager.process_update(session, payload)
    await session.commit()
    return {"ok": True}


@router.post("/webhook", summary="Telegram webhook endpoint")
async def telegram_webhook(
    session: AsyncSessionDep,
    payload: dict = Body(..., description="Webhook update payload"),
    secret_token: str | None = Header(
        default=None, alias="X-Telegram-Bot-Api-Secret-Token"
    ),
) -> dict[str, bool]:
    return await _process_webhook(session, payload, secret_token)


@public_router.post("/telegram/webhook", summary="Telegram webhook endpoint (public)")
async def telegram_webhook_public(
    session: AsyncSessionDep,
    payload: dict = Body(..., description="Webhook update payload"),
    secret_token: str | None = Header(
        default=None, alias="X-Telegram-Bot-Api-Secret-Token"
    ),
) -> dict[str, bool]:
    return await _process_webhook(session, payload, secret_token)


@router.get("/info", summary="Telegram bot info")
async def telegram_info() -> dict:
    manager = _get_manager()
    return await manager.get_me()


@public_router.get("/telegram/info", summary="Telegram bot info (public)")
async def telegram_info_public() -> dict:
    manager = _get_manager()
    return await manager.get_me()


@router.post("/set-webhook", summary="Configure Telegram webhook")
async def telegram_set_webhook(request: SetWebhookRequest) -> dict:
    manager = _get_manager()
    return await manager.set_webhook(str(request.url))


@public_router.post("/telegram/set-webhook", summary="Configure Telegram webhook (public)")
async def telegram_set_webhook_public(request: SetWebhookRequest) -> dict:
    manager = _get_manager()
    return await manager.set_webhook(str(request.url))
