"""Sponsor channel endpoints."""

from __future__ import annotations

from fastapi import APIRouter

from app.api.deps import StorageServiceDep
from app.schemas import (
    ChannelSubscriptionCreate,
    ChannelSubscriptionRead,
    SponsorChannelCreate,
    SponsorChannelRead,
)

router = APIRouter()


@router.get("/channels", response_model=list[SponsorChannelRead], summary="List sponsor channels")
async def list_channels(storage: StorageServiceDep) -> list[SponsorChannelRead]:
    channels = await storage.get_sponsor_channels()
    return [SponsorChannelRead.model_validate(channel) for channel in channels]


@router.post("/channels", response_model=SponsorChannelRead, status_code=201, summary="Create sponsor channel")
async def create_channel(storage: StorageServiceDep, payload: SponsorChannelCreate) -> SponsorChannelRead:
    channel = await storage.create_sponsor_channel(payload.model_dump(by_alias=False))
    return SponsorChannelRead.model_validate(channel)


@router.post(
    "/subscriptions",
    response_model=ChannelSubscriptionRead,
    status_code=201,
    summary="Subscribe to channel",
)
async def create_subscription(storage: StorageServiceDep, payload: ChannelSubscriptionCreate) -> ChannelSubscriptionRead:
    subscription = await storage.subscribe_to_channel(payload.model_dump(by_alias=False))
    return ChannelSubscriptionRead.model_validate(subscription)


@router.get(
    "/users/{user_id}/subscriptions",
    response_model=list[ChannelSubscriptionRead],
    summary="List user subscriptions",
)
async def list_user_subscriptions(storage: StorageServiceDep, user_id: str) -> list[ChannelSubscriptionRead]:
    subscriptions = await storage.get_user_subscriptions(user_id)
    return [ChannelSubscriptionRead.model_validate(item) for item in subscriptions]


@router.put("/subscriptions/{subscription_id}/verify", status_code=204, summary="Verify subscription")
async def verify_subscription(storage: StorageServiceDep, subscription_id: int) -> None:
    await storage.verify_subscription(subscription_id)
