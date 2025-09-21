"""User repository."""

from __future__ import annotations

from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.exc import NoResultFound

from app.db.models import User
from app.repositories.base import BaseRepository


class UserRepository(BaseRepository):
    async def get(self, user_id: str) -> User | None:
        result = await self.session.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()

    async def upsert(self, data: dict) -> User:
        user = await self.get(data["id"])
        if user:
            for key, value in data.items():
                if hasattr(user, key) and value is not None and key != "id":
                    setattr(user, key, value)
        else:
            user = User(**data)
            self.session.add(user)
        await self.flush()
        await self.refresh(user)
        return user

    async def update_steps(self, user_id: str, steps: int) -> User:
        user = await self.get(user_id)
        if not user:
            raise NoResultFound(f"User {user_id} not found")
        user.daily_steps = steps
        await self.flush()
        await self.refresh(user)
        return user

    async def adjust_tokens(self, user_id: str, amount: Decimal | float | int) -> User:
        user = await self.get(user_id)
        if not user:
            raise NoResultFound(f"User {user_id} not found")
        delta = Decimal(str(amount))
        current = Decimal(user.token_balance or 0)
        user.token_balance = current + delta
        await self.flush()
        await self.refresh(user)
        return user
