"""Base repository abstractions."""

from sqlalchemy.ext.asyncio import AsyncSession


class BaseRepository:
    """Common repository helpers."""

    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def commit(self) -> None:
        await self.session.commit()

    async def flush(self) -> None:
        await self.session.flush()

    async def refresh(self, instance) -> None:
        await self.session.refresh(instance)
