"""Database seeding utility."""

from __future__ import annotations

import asyncio
from decimal import Decimal

from sqlalchemy import select

from app.core.config import settings
from app.db.models import Book, BookCategory, Course, CourseCategory, TransactionType
from app.db.session import SessionLocal
from app.services.storage_service import StorageService


async def seed_demo_data() -> None:
    async with SessionLocal() as session:
        storage = StorageService(session)

        # Demo user
        await storage.upsert_user(
            {
                "id": "user123",
                "email": "demo@educrypto.com",
                "first_name": "Demo",
                "last_name": "User",
                "token_balance": Decimal("1000"),
                "daily_steps": 8500,
                "language": "en",
            }
        )

        # Courses
        existing_course = await session.scalar(select(Course).where(Course.title == "Speed Reading and Memory"))
        if not existing_course:
            await storage.create_course(
                {
                    "title": "Speed Reading and Memory",
                    "title_ru": "Скорочтение и память",
                    "description": "Master techniques to read faster and improve memory retention",
                    "description_ru": "Овладейте техниками быстрого чтения и улучшения памяти",
                    "instructor": "Dr. Rachel Evans",
                    "category": CourseCategory.MIND_THINKING,
                    "price": Decimal("0"),
                }
            )

        # Books
        existing_book = await session.scalar(select(Book).where(Book.title == "Mindset Mastery"))
        if not existing_book:
            await storage.create_book(
                {
                    "title": "Mindset Mastery",
                    "title_ru": "Мастерство мышления",
                    "author": "John Smith",
                    "author_ru": "Джон Смит",
                    "category": BookCategory.PSYCHOLOGY_THINKING,
                    "price": Decimal("0"),
                }
            )

        # Sponsor channel
        await storage.create_sponsor_channel(
            {
                "name": "Crypto News Daily",
                "channel_url": "https://t.me/cryptonewsdaily",
                "reward": Decimal("100"),
            }
        )

        # Sample transaction
        await storage.create_transaction(
            {
                "user_id": "user123",
                "type": TransactionType.REWARD,
                "amount": Decimal("100"),
                "description": "Daily steps challenge completed",
            }
        )

        await session.commit()
        print("✅ Database seeded")


async def main() -> None:
    print("Seeding database with demo data…")
    await seed_demo_data()


if __name__ == "__main__":
    asyncio.run(main())
