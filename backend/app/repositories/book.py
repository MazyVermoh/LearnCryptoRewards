"""Book repository."""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.exc import NoResultFound

from app.db.models import Book
from app.repositories.base import BaseRepository


class BookRepository(BaseRepository):
    async def list(self, category: str | None = None, search: str | None = None, only_visible: bool = True) -> list[Book]:
        stmt = select(Book)
        if category and category != "all":
            stmt = stmt.where(Book.category == category)
        if search:
            stmt = stmt.where(Book.title.ilike(f"%{search}%"))
        if only_visible:
            stmt = stmt.where(Book.is_visible.is_(True), Book.is_active.is_(True))
        result = await self.session.execute(stmt.order_by(Book.id))
        return list(result.scalars().all())

    async def get(self, book_id: int) -> Book | None:
        result = await self.session.execute(select(Book).where(Book.id == book_id))
        return result.scalar_one_or_none()

    async def create(self, data: dict) -> Book:
        book = Book(**data)
        self.session.add(book)
        await self.flush()
        await self.refresh(book)
        return book

    async def update(self, book_id: int, data: dict) -> Book:
        book = await self.get(book_id)
        if not book:
            raise NoResultFound(f"Book {book_id} not found")
        for key, value in data.items():
            if value is not None and hasattr(book, key):
                setattr(book, key, value)
        await self.flush()
        await self.refresh(book)
        return book

    async def soft_delete(self, book_id: int) -> None:
        book = await self.get(book_id)
        if not book:
            raise NoResultFound(f"Book {book_id} not found")
        book.is_active = False
        await self.flush()

    async def set_visibility(self, book_id: int, is_visible: bool) -> Book:
        book = await self.get(book_id)
        if not book:
            raise NoResultFound(f"Book {book_id} not found")
        book.is_visible = is_visible
        await self.flush()
        await self.refresh(book)
        return book
