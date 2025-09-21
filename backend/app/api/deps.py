"""Common FastAPI dependencies."""

from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_session
from app.services import StorageService, get_reward_engine, RewardEngine

AsyncSessionDep = Annotated[AsyncSession, Depends(get_session)]


async def get_storage_service(session: AsyncSessionDep) -> StorageService:
    return StorageService(session)


StorageServiceDep = Annotated[StorageService, Depends(get_storage_service)]
RewardEngineDep = Annotated[RewardEngine, Depends(get_reward_engine)]
