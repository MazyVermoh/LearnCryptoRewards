"""Reward engine implementation mirroring the original Node.js logic."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta
from decimal import Decimal
from pathlib import Path
from typing import Any, Iterable

import yaml
from pydantic import BaseModel
from sqlalchemy import select, func, between
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.storage_service import StorageService
from app.db.models import TransactionType, UserReward, UserDailyCounter

CONFIG_PATH = Path(__file__).resolve().parents[3] / "rewards.yml"


@dataclass
class RewardRule:
    action_id: str
    base_reward: Decimal
    daily_cap: Decimal | None


class RewardEvent(BaseModel):
    user_id: str
    action_id: str
    value: float | None = None
    idempotency_key: str
    metadata: dict[str, Any] | None = None


class RewardEngine:
    def __init__(self) -> None:
        self.config_path = CONFIG_PATH
        self.config = self._load_config()

    # ------------------------------------------------------------------
    # Config helpers
    # ------------------------------------------------------------------
    def _load_config(self) -> dict[str, Any]:
        if not self.config_path.exists():
            raise FileNotFoundError("rewards.yml configuration is missing")
        with self.config_path.open("r", encoding="utf-8") as fh:
            data = yaml.safe_load(fh)
        return data or {}

    def save_config(self) -> None:
        with self.config_path.open("w", encoding="utf-8") as fh:
            yaml.safe_dump(self.config, fh, allow_unicode=True, sort_keys=False)

    # ------------------------------------------------------------------
    # Reward processing
    # ------------------------------------------------------------------
    async def process_batch(
        self,
        storage: StorageService,
        events: Iterable[RewardEvent],
    ) -> None:
        for event in events:
            await self._process_event(storage, event)

    async def _process_event(self, storage: StorageService, event: RewardEvent) -> None:
        if self.config.get("security", {}).get("idempotency_enabled", True):
            if await storage.reward_exists(event.idempotency_key):
                return

        reward_cfg = self._get_rule(event.action_id)
        if reward_cfg is None:
            return

        reward_amount = self._calculate_base_reward(event, reward_cfg)
        if reward_amount <= 0:
            return

        reward_amount = reward_amount * Decimal(str(self.config.get("rebalance_coefficient", 1)))
        reward_amount = await self._apply_daily_cap(storage, event.user_id, event.action_id, reward_cfg, reward_amount)

        if reward_amount <= 0:
            return

        await storage.update_user_tokens(event.user_id, reward_amount)
        await storage.record_reward(
            {
                "user_id": event.user_id,
                "action_id": event.action_id,
                "mind_amount": int(reward_amount),
                "idempotency_key": event.idempotency_key,
                "metadata": event.metadata,
                "timestamp": datetime.utcnow(),
            }
        )
        await storage.create_transaction(
            {
                "user_id": event.user_id,
                "type": TransactionType.REWARD,
                "amount": Decimal(reward_amount),
                "description": f"Reward for {event.action_id}",
                "metadata": event.metadata,
            }
        )
        await self._update_daily_counter(storage, event.user_id, event.action_id, int(reward_amount))

    def _get_rule(self, action_id: str) -> RewardRule | None:
        rewards = self.config.get("rewards", {})
        rule = rewards.get(action_id)
        if not rule:
            return None
        return RewardRule(
            action_id=rule.get("action_id", action_id),
            base_reward=Decimal(str(rule.get("base_reward", 0))),
            daily_cap=Decimal(str(rule["daily_cap"])) if rule.get("daily_cap") is not None else None,
        )

    def _calculate_base_reward(self, event: RewardEvent, rule: RewardRule) -> Decimal:
        if event.action_id == "steps":
            steps = int(event.value or 0)
            return (steps // 1000) * rule.base_reward
        if event.action_id == "book_completion":
            progress = Decimal(str(event.value or 0))
            return rule.base_reward if progress >= Decimal("0.8") else Decimal("0")
        return rule.base_reward

    async def _apply_daily_cap(
        self,
        storage: StorageService,
        user_id: str,
        action_id: str,
        rule: RewardRule,
        proposed_amount: Decimal,
    ) -> Decimal:
        if rule.daily_cap is None:
            return proposed_amount
        today = datetime.utcnow().date().isoformat()
        counter = await storage.get_daily_counter(user_id, today)
        current = {
            "steps": counter.steps_mind,
            "book_completion": counter.books_mind,
            "course_completion_basic": counter.courses_mind,
            "course_completion_intermediate": counter.courses_mind,
            "course_completion_advanced": counter.courses_mind,
            "partner_subscription": counter.subs_mind,
            "referral_bonus": counter.subs_mind,
        }.get(action_id, 0)
        remaining = max(Decimal("0"), rule.daily_cap - Decimal(str(current)))
        return min(proposed_amount, remaining)

    async def _update_daily_counter(
        self,
        storage: StorageService,
        user_id: str,
        action_id: str,
        amount: int,
    ) -> None:
        today = datetime.utcnow().date().isoformat()
        kwargs = {
            "steps": 0,
            "books": 0,
            "courses": 0,
            "subs": 0,
        }
        if action_id == "steps":
            kwargs["steps"] = amount
        elif action_id == "book_completion":
            kwargs["books"] = amount
        elif action_id in {"course_completion_basic", "course_completion_intermediate", "course_completion_advanced"}:
            kwargs["courses"] = amount
        elif action_id in {"partner_subscription", "referral_bonus"}:
            kwargs["subs"] = amount
        await storage.increment_daily_counter(user_id, today, **kwargs)

    # ------------------------------------------------------------------
    # Stats & maintenance
    # ------------------------------------------------------------------
    async def get_user_daily_stats(self, storage: StorageService, user_id: str) -> dict[str, Any]:
        today = datetime.utcnow().date().isoformat()
        counter = await storage.get_daily_counter(user_id, today)
        rewards_cfg = self.config.get("rewards", {})
        steps_cap = rewards_cfg.get("steps", {}).get("daily_cap")
        subs_cap = rewards_cfg.get("partner_subscription", {}).get("daily_cap")
        return {
            "date": today,
            "steps_mind": counter.steps_mind,
            "books_mind": counter.books_mind,
            "courses_mind": counter.courses_mind,
            "subs_mind": counter.subs_mind,
            "remaining_caps": {
                "steps": max(0, (steps_cap or 0) - counter.steps_mind) if steps_cap else None,
                "subs": max(0, (subs_cap or 0) - counter.subs_mind) if subs_cap else None,
            },
        }

    async def reset_daily_counters(self, session: AsyncSession) -> None:
        yesterday = datetime.utcnow().date() - timedelta(days=1)
        # No explicit reset needed; counters are per-date rows.
        await session.execute(
            select(func.count()).select_from(UserDailyCounter)  # touch table to ensure connection
        )

    async def execute_monthly_rebalance(self, session: AsyncSession) -> Decimal:
        if not self.config.get("auto_rebalance", {}).get("enabled", True):
            return Decimal(str(self.config.get("rebalance_coefficient", 1)))

        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        result = await session.execute(
            select(func.coalesce(func.sum(UserReward.mind_amount), 0)).where(
                between(UserReward.timestamp, thirty_days_ago, datetime.utcnow())
            )
        )
        actual_emission = Decimal(result.scalar_one())

        total_distributed = await session.scalar(select(func.coalesce(func.sum(UserReward.mind_amount), 0)))
        remaining_pool = Decimal("2000000000") - Decimal(total_distributed or 0)
        months_left = Decimal(str(self.config.get("auto_rebalance", {}).get("remaining_pool_months", 24)))
        if months_left <= 0:
            return Decimal(str(self.config.get("rebalance_coefficient", 1)))
        target_emission = remaining_pool / months_left

        new_coefficient = Decimal(str(self.config.get("rebalance_coefficient", 1)))
        if actual_emission > target_emission * Decimal("1.1") and actual_emission > 0:
            new_coefficient = (target_emission / actual_emission).quantize(Decimal("0.0001"))
        elif actual_emission < target_emission * Decimal("0.9") and actual_emission > 0:
            new_coefficient = min(Decimal("1"), (target_emission / actual_emission).quantize(Decimal("0.0001")))

        self.config["rebalance_coefficient"] = float(new_coefficient)
        self.save_config()
        return new_coefficient


_reward_engine: RewardEngine | None = None


def get_reward_engine() -> RewardEngine:
    global _reward_engine
    if _reward_engine is None:
        _reward_engine = RewardEngine()
    return _reward_engine
