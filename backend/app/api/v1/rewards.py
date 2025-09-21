"""Reward engine endpoints."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.api.deps import RewardEngineDep, StorageServiceDep
from app.services.reward_engine import RewardEvent

router = APIRouter()


class RewardEventRequest(BaseModel):
    user_id: str = Field(alias="user_id")
    action_id: str = Field(alias="action_id")
    value: float | None = None
    idempotency_key: str = Field(alias="idempotency_key")
    metadata: dict | None = None

    def to_model(self) -> RewardEvent:
        return RewardEvent(**self.model_dump())


class RewardBatchRequest(BaseModel):
    events: list[RewardEventRequest]


@router.post("/process", summary="Process single reward event")
async def process_reward(
    storage: StorageServiceDep,
    engine: RewardEngineDep,
    payload: RewardEventRequest,
) -> dict[str, str]:
    await engine.process_batch(storage, [payload.to_model()])
    return {"status": "processed"}


@router.post("/batch", summary="Process batch of reward events")
async def process_reward_batch(
    storage: StorageServiceDep,
    engine: RewardEngineDep,
    payload: RewardBatchRequest,
) -> dict[str, int]:
    if len(payload.events) > 100:
        raise HTTPException(status_code=400, detail="Batch limit is 100 events")
    await engine.process_batch(storage, [event.to_model() for event in payload.events])
    return {"processed": len(payload.events)}


@router.get("/user/{user_id}/stats", summary="Get user daily reward stats")
async def user_reward_stats(
    storage: StorageServiceDep,
    engine: RewardEngineDep,
    user_id: str,
) -> dict:
    return await engine.get_user_daily_stats(storage, user_id)


@router.post("/reset-daily", summary="Reset daily counters")
async def reset_daily_counters(storage: StorageServiceDep, engine: RewardEngineDep) -> dict:
    await engine.reset_daily_counters(storage.session)
    return {"status": "ok"}


@router.post("/rebalance", summary="Run auto rebalance")
async def run_auto_rebalance(storage: StorageServiceDep, engine: RewardEngineDep) -> dict:
    coefficient = await engine.execute_monthly_rebalance(storage.session)
    return {"rebalanceCoefficient": str(coefficient)}
