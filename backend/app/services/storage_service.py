"""Comprehensive storage layer ported from the original Node.js implementation."""

from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from typing import Sequence

from sqlalchemy import delete, desc, func, select
from sqlalchemy.exc import NoResultFound
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import (
    Book,
    BookCategory,
    BookChapter,
    BookPurchase,
    BookReadingProgress,
    ChannelSubscription,
    ChapterTest,
    Course,
    CourseCategory,
    CourseLesson,
    CourseReadingProgress,
    DailyChallenge,
    Enrollment,
    LessonTest,
    SponsorChannel,
    TestAttempt,
    Transaction,
    TransactionType,
    TextContent,
    User,
    UserDailyCounter,
    UserReward,
)


class StorageService:
    """High-level data access helpers."""

    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    # ------------------------------------------------------------------
    # Users
    # ------------------------------------------------------------------
    async def get_user(self, user_id: str) -> User | None:
        result = await self.session.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()

    async def update_user_steps(self, user_id: str, steps: int) -> None:
        user = await self.get_user(user_id)
        if not user:
            raise NoResultFound(f"User {user_id} not found")
        user.daily_steps = steps
        await self.session.flush()

    async def generate_referral_code(self, user_id: str) -> str:
        code = f"USER{user_id[-4:]}{datetime.utcnow().strftime('%H%M')}"
        user = await self.get_user(user_id)
        if not user:
            raise NoResultFound(f"User {user_id} not found")
        user.referral_code = code
        await self.session.flush()
        return code

    async def upsert_user(self, data: dict) -> User:
        user = await self.get_user(data["id"])
        if user:
            for key, value in data.items():
                if key != "id" and hasattr(user, key) and value is not None:
                    setattr(user, key, value)
        else:
            user = User(**data)
            self.session.add(user)
        await self.session.flush()
        await self.session.refresh(user)
        return user

    async def update_user_tokens(self, user_id: str, delta: str | Decimal | float | int) -> None:
        user = await self.get_user(user_id)
        if not user:
            raise NoResultFound(f"User {user_id} not found")
        current = Decimal(user.token_balance or 0)
        user.token_balance = current + Decimal(str(delta))
        await self.session.flush()
        await self.session.refresh(user)

    # ------------------------------------------------------------------
    # Courses
    # ------------------------------------------------------------------
    async def get_courses(self, category: CourseCategory | None = None, only_visible: bool = True) -> Sequence[Course]:
        stmt = select(Course)
        if category and category != "all":
            stmt = stmt.where(Course.category == category)
        if only_visible:
            stmt = stmt.where(Course.is_active.is_(True), Course.is_visible.is_(True))
        stmt = stmt.order_by(Course.id)
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def get_course(self, course_id: int) -> Course | None:
        result = await self.session.execute(select(Course).where(Course.id == course_id))
        return result.scalar_one_or_none()

    async def update_course(self, course_id: int, data: dict) -> Course:
        course = await self.get_course(course_id)
        if not course:
            raise NoResultFound(f"Course {course_id} not found")
        for key, value in data.items():
            if hasattr(course, key) and value is not None:
                setattr(course, key, value)
        course.updated_at = datetime.utcnow()
        await self.session.flush()
        await self.session.refresh(course)
        return course

    async def create_course(self, data: dict) -> Course:
        course = Course(**data)
        self.session.add(course)
        await self.session.flush()
        await self.session.refresh(course)
        return course

    async def delete_course(self, course_id: int, *, permanent: bool = False) -> None:
        course = await self.get_course(course_id)
        if not course:
            raise NoResultFound(f"Course {course_id} not found")
        if permanent:
            await self.session.delete(course)
        else:
            course.is_active = False
            await self.session.flush()

    async def update_course_visibility(self, course_id: int, is_visible: bool) -> None:
        course = await self.get_course(course_id)
        if not course:
            raise NoResultFound(f"Course {course_id} not found")
        course.is_visible = is_visible
        course.updated_at = datetime.utcnow()
        await self.session.flush()

    # ------------------------------------------------------------------
    # Lessons
    # ------------------------------------------------------------------
    async def get_course_lessons(self, course_id: int) -> Sequence[CourseLesson]:
        result = await self.session.execute(
            select(CourseLesson)
            .where(CourseLesson.course_id == course_id)
            .order_by(CourseLesson.order_index)
        )
        return result.scalars().all()

    async def create_course_lesson(self, data: dict) -> CourseLesson:
        lesson = CourseLesson(**data)
        self.session.add(lesson)
        await self.session.flush()
        await self.session.refresh(lesson)
        return lesson

    async def update_course_lesson(self, lesson_id: int, data: dict) -> CourseLesson:
        result = await self.session.execute(select(CourseLesson).where(CourseLesson.id == lesson_id))
        lesson = result.scalar_one_or_none()
        if not lesson:
            raise NoResultFound(f"Course lesson {lesson_id} not found")
        for key, value in data.items():
            if hasattr(lesson, key) and value is not None:
                setattr(lesson, key, value)
        lesson.updated_at = datetime.utcnow()
        await self.session.flush()
        await self.session.refresh(lesson)
        return lesson

    async def delete_course_lesson(self, lesson_id: int) -> None:
        lesson = await self.session.get(CourseLesson, lesson_id)
        if not lesson:
            raise NoResultFound(f"Course lesson {lesson_id} not found")
        await self.session.delete(lesson)

    async def generate_course_lessons(self, course_id: int, number_of_lessons: int) -> Sequence[CourseLesson]:
        # delete existing
        await self.session.execute(delete(CourseLesson).where(CourseLesson.course_id == course_id))
        lessons = [
            CourseLesson(
                course_id=course_id,
                title=f"Lesson {i}",
                title_ru=f"Урок {i}",
                description=f"Description for Lesson {i}...",
                description_ru=f"Описание для урока {i}...",
                content=f"Content for Lesson {i}...",
                content_ru=f"Содержание для урока {i}...",
                duration=10,
                order_index=i,
            )
            for i in range(1, number_of_lessons + 1)
        ]
        self.session.add_all(lessons)
        await self.session.flush()
        return lessons

    # ------------------------------------------------------------------
    # Books
    # ------------------------------------------------------------------
    async def get_books(self, category: BookCategory | None = None, search: str | None = None, only_visible: bool = True) -> Sequence[Book]:
        stmt = select(Book)
        if category and category != "all":
            stmt = stmt.where(Book.category == category)
        if search:
            stmt = stmt.where(Book.title.ilike(f"%{search}%"))
        if only_visible:
            stmt = stmt.where(Book.is_active.is_(True), Book.is_visible.is_(True))
        stmt = stmt.order_by(Book.id)
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def get_book(self, book_id: int) -> Book | None:
        result = await self.session.execute(select(Book).where(Book.id == book_id))
        return result.scalar_one_or_none()

    async def update_book(self, book_id: int, data: dict) -> Book:
        book = await self.get_book(book_id)
        if not book:
            raise NoResultFound(f"Book {book_id} not found")
        for key, value in data.items():
            if hasattr(book, key) and value is not None:
                setattr(book, key, value)
        book.updated_at = datetime.utcnow()
        await self.session.flush()
        await self.session.refresh(book)
        return book

    async def create_book(self, data: dict) -> Book:
        book = Book(**data)
        self.session.add(book)
        await self.session.flush()
        await self.session.refresh(book)
        return book

    async def delete_book(self, book_id: int, *, permanent: bool = False) -> None:
        book = await self.get_book(book_id)
        if not book:
            raise NoResultFound(f"Book {book_id} not found")
        if permanent:
            await self.session.delete(book)
        else:
            book.is_active = False
            await self.session.flush()

    async def update_book_visibility(self, book_id: int, is_visible: bool) -> None:
        book = await self.get_book(book_id)
        if not book:
            raise NoResultFound(f"Book {book_id} not found")
        book.is_visible = is_visible
        book.updated_at = datetime.utcnow()
        await self.session.flush()

    # ------------------------------------------------------------------
    # Chapters
    # ------------------------------------------------------------------
    async def get_book_chapters(self, book_id: int) -> Sequence[BookChapter]:
        result = await self.session.execute(
            select(BookChapter)
            .where(BookChapter.book_id == book_id)
            .order_by(BookChapter.order_index)
        )
        return result.scalars().all()

    async def create_book_chapter(self, data: dict) -> BookChapter:
        chapter = BookChapter(**data)
        self.session.add(chapter)
        await self.session.flush()
        await self.session.refresh(chapter)
        return chapter

    async def update_book_chapter(self, chapter_id: int, data: dict) -> BookChapter:
        chapter = await self.session.get(BookChapter, chapter_id)
        if not chapter:
            raise NoResultFound(f"Book chapter {chapter_id} not found")
        for key, value in data.items():
            if hasattr(chapter, key) and value is not None:
                setattr(chapter, key, value)
        chapter.updated_at = datetime.utcnow()
        await self.session.flush()
        await self.session.refresh(chapter)
        return chapter

    async def delete_book_chapter(self, chapter_id: int) -> None:
        chapter = await self.session.get(BookChapter, chapter_id)
        if not chapter:
            raise NoResultFound(f"Book chapter {chapter_id} not found")
        await self.session.delete(chapter)

    async def generate_book_chapters(self, book_id: int, number_of_chapters: int) -> Sequence[BookChapter]:
        await self.session.execute(delete(BookChapter).where(BookChapter.book_id == book_id))
        chapters = [
            BookChapter(
                book_id=book_id,
                title=f"Chapter {i}",
                title_ru=f"Глава {i}",
                content=f"Content for Chapter {i}...",
                content_ru=f"Содержание для главы {i}...",
                order_index=i,
            )
            for i in range(1, number_of_chapters + 1)
        ]
        self.session.add_all(chapters)
        await self.session.flush()
        return chapters

    # ------------------------------------------------------------------
    # Enrollments & Purchases
    # ------------------------------------------------------------------
    async def enroll_user(self, data: dict) -> Enrollment:
        stmt = select(Enrollment).where(
            Enrollment.user_id == data["user_id"],
            Enrollment.course_id == data["course_id"],
        )
        result = await self.session.execute(stmt)
        if result.scalar_one_or_none():
            raise ValueError("User is already enrolled in this course")
        enrollment = Enrollment(**data)
        self.session.add(enrollment)
        await self.session.flush()
        await self.session.refresh(enrollment)
        return enrollment

    async def get_user_enrollments(self, user_id: str) -> Sequence[Enrollment]:
        result = await self.session.execute(
            select(Enrollment)
            .where(Enrollment.user_id == user_id)
            .order_by(Enrollment.enrolled_at.desc())
        )
        return result.scalars().all()

    async def update_enrollment_progress(self, enrollment_id: int, progress: int) -> None:
        enrollment = await self.session.get(Enrollment, enrollment_id)
        if not enrollment:
            raise NoResultFound(f"Enrollment {enrollment_id} not found")
        enrollment.progress = progress
        enrollment.completed_at = datetime.utcnow() if progress == 100 else None
        await self.session.flush()

    async def purchase_book(self, data: dict) -> BookPurchase:
        stmt = select(BookPurchase).where(
            BookPurchase.user_id == data["user_id"],
            BookPurchase.book_id == data["book_id"],
        )
        result = await self.session.execute(stmt)
        if result.scalar_one_or_none():
            raise ValueError("User has already purchased this book")
        purchase = BookPurchase(**data)
        self.session.add(purchase)
        await self.session.flush()
        await self.session.refresh(purchase)
        return purchase

    async def get_user_books(self, user_id: str) -> Sequence[BookPurchase]:
        result = await self.session.execute(
            select(BookPurchase)
            .where(BookPurchase.user_id == user_id)
            .order_by(BookPurchase.purchased_at.desc())
        )
        return result.scalars().all()

    # ------------------------------------------------------------------
    # Transactions
    # ------------------------------------------------------------------
    async def create_transaction(self, data: dict) -> Transaction:
        transaction = Transaction(**data)
        self.session.add(transaction)
        await self.session.flush()
        await self.session.refresh(transaction)
        return transaction

    async def get_user_transactions(self, user_id: str, limit: int | None = None) -> Sequence[Transaction]:
        stmt = (
            select(Transaction)
            .where(Transaction.user_id == user_id)
            .order_by(desc(Transaction.created_at))
        )
        if limit:
            stmt = stmt.limit(limit)
        result = await self.session.execute(stmt)
        return result.scalars().all()

    # ------------------------------------------------------------------
    # Sponsor channels & subscriptions
    # ------------------------------------------------------------------
    async def get_sponsor_channels(self) -> Sequence[SponsorChannel]:
        result = await self.session.execute(
            select(SponsorChannel).where(SponsorChannel.is_active.is_(True))
        )
        return result.scalars().all()

    async def create_sponsor_channel(self, data: dict) -> SponsorChannel:
        channel = SponsorChannel(**data)
        self.session.add(channel)
        await self.session.flush()
        await self.session.refresh(channel)
        return channel

    async def subscribe_to_channel(self, data: dict) -> ChannelSubscription:
        subscription = ChannelSubscription(**data)
        self.session.add(subscription)
        await self.session.flush()
        await self.session.refresh(subscription)
        return subscription

    async def get_user_subscriptions(self, user_id: str) -> Sequence[ChannelSubscription]:
        result = await self.session.execute(
            select(ChannelSubscription).where(ChannelSubscription.user_id == user_id)
        )
        return result.scalars().all()

    async def verify_subscription(self, subscription_id: int) -> None:
        subscription = await self.session.get(ChannelSubscription, subscription_id)
        if not subscription:
            raise NoResultFound(f"Subscription {subscription_id} not found")
        subscription.verified = True
        await self.session.flush()

    # ------------------------------------------------------------------
    # Daily challenges
    # ------------------------------------------------------------------
    async def get_today_challenge(self, user_id: str) -> DailyChallenge | None:
        today = datetime.utcnow().date().isoformat()
        result = await self.session.execute(
            select(DailyChallenge).where(
                DailyChallenge.user_id == user_id,
                DailyChallenge.date == today,
            )
        )
        return result.scalar_one_or_none()

    async def create_daily_challenge(self, data: dict) -> DailyChallenge:
        challenge = DailyChallenge(**data)
        self.session.add(challenge)
        await self.session.flush()
        await self.session.refresh(challenge)
        return challenge

    async def update_daily_challenge(self, challenge_id: int, data: dict) -> None:
        challenge = await self.session.get(DailyChallenge, challenge_id)
        if not challenge:
            raise NoResultFound(f"Daily challenge {challenge_id} not found")
        for key, value in data.items():
            if hasattr(challenge, key) and value is not None:
                setattr(challenge, key, value)
        await self.session.flush()

    # ------------------------------------------------------------------
    # Reading progress
    # ------------------------------------------------------------------
    async def get_book_reading_progress(self, user_id: str, book_id: int) -> BookReadingProgress | None:
        result = await self.session.execute(
            select(BookReadingProgress).where(
                BookReadingProgress.user_id == user_id,
                BookReadingProgress.book_id == book_id,
            )
        )
        return result.scalar_one_or_none()

    async def upsert_book_progress(self, user_id: str, book_id: int, current_chapter: int) -> BookReadingProgress:
        progress = await self.get_book_reading_progress(user_id, book_id)
        if progress:
            progress.current_chapter = current_chapter
            progress.updated_at = datetime.utcnow()
        else:
            chapters_result = await self.session.execute(
                select(func.count()).select_from(BookChapter).where(BookChapter.book_id == book_id)
            )
            total = chapters_result.scalar_one()
            progress = BookReadingProgress(
                user_id=user_id,
                book_id=book_id,
                current_chapter=current_chapter,
                total_chapters=total,
            )
            self.session.add(progress)
        await self.session.flush()
        await self.session.refresh(progress)
        return progress

    async def complete_book_reading(self, user_id: str, book_id: int) -> None:
        progress = await self.get_book_reading_progress(user_id, book_id)
        if not progress:
            progress = await self.upsert_book_progress(user_id, book_id, current_chapter=1)
        progress.is_completed = True
        progress.completed_at = datetime.utcnow()
        progress.reward_claimed = True
        await self.session.flush()

    async def get_all_book_progress(self, user_id: str) -> Sequence[BookReadingProgress]:
        result = await self.session.execute(
            select(BookReadingProgress).where(BookReadingProgress.user_id == user_id)
        )
        return result.scalars().all()

    async def get_course_reading_progress(self, user_id: str, course_id: int) -> CourseReadingProgress | None:
        result = await self.session.execute(
            select(CourseReadingProgress).where(
                CourseReadingProgress.user_id == user_id,
                CourseReadingProgress.course_id == course_id,
            )
        )
        return result.scalar_one_or_none()

    async def upsert_course_progress(self, user_id: str, course_id: int, current_lesson: int) -> CourseReadingProgress:
        progress = await self.get_course_reading_progress(user_id, course_id)
        if progress:
            progress.current_lesson = current_lesson
            progress.updated_at = datetime.utcnow()
        else:
            lessons_result = await self.session.execute(
                select(func.count()).select_from(CourseLesson).where(CourseLesson.course_id == course_id)
            )
            total = lessons_result.scalar_one()
            progress = CourseReadingProgress(
                user_id=user_id,
                course_id=course_id,
                current_lesson=current_lesson,
                total_lessons=total,
            )
            self.session.add(progress)
        await self.session.flush()
        await self.session.refresh(progress)
        return progress

    async def complete_course_reading(self, user_id: str, course_id: int) -> None:
        progress = await self.get_course_reading_progress(user_id, course_id)
        if not progress:
            progress = await self.upsert_course_progress(user_id, course_id, current_lesson=1)
        progress.is_completed = True
        progress.completed_at = datetime.utcnow()
        progress.reward_claimed = True
        await self.session.flush()

    # ------------------------------------------------------------------
    # Tests
    # ------------------------------------------------------------------
    async def get_chapter_tests(self, chapter_id: int) -> Sequence[ChapterTest]:
        result = await self.session.execute(
            select(ChapterTest).where(ChapterTest.chapter_id == chapter_id)
        )
        return result.scalars().all()

    async def create_chapter_test(self, data: dict) -> ChapterTest:
        test = ChapterTest(**data)
        self.session.add(test)
        await self.session.flush()
        await self.session.refresh(test)
        return test

    async def update_chapter_test(self, test_id: int, data: dict) -> ChapterTest:
        test = await self.session.get(ChapterTest, test_id)
        if not test:
            raise NoResultFound(f"Chapter test {test_id} not found")
        for key, value in data.items():
            if hasattr(test, key) and value is not None:
                setattr(test, key, value)
        test.updated_at = datetime.utcnow()
        await self.session.flush()
        await self.session.refresh(test)
        return test

    async def delete_chapter_test(self, test_id: int) -> None:
        test = await self.session.get(ChapterTest, test_id)
        if not test:
            raise NoResultFound(f"Chapter test {test_id} not found")
        await self.session.delete(test)

    async def get_lesson_tests(self, lesson_id: int) -> Sequence[LessonTest]:
        result = await self.session.execute(
            select(LessonTest).where(LessonTest.lesson_id == lesson_id)
        )
        return result.scalars().all()

    async def create_lesson_test(self, data: dict) -> LessonTest:
        test = LessonTest(**data)
        self.session.add(test)
        await self.session.flush()
        await self.session.refresh(test)
        return test

    async def update_lesson_test(self, test_id: int, data: dict) -> LessonTest:
        test = await self.session.get(LessonTest, test_id)
        if not test:
            raise NoResultFound(f"Lesson test {test_id} not found")
        for key, value in data.items():
            if hasattr(test, key) and value is not None:
                setattr(test, key, value)
        test.updated_at = datetime.utcnow()
        await self.session.flush()
        await self.session.refresh(test)
        return test

    async def delete_lesson_test(self, test_id: int) -> None:
        test = await self.session.get(LessonTest, test_id)
        if not test:
            raise NoResultFound(f"Lesson test {test_id} not found")
        await self.session.delete(test)

    async def submit_test_attempt(self, data: dict) -> TestAttempt:
        attempt = TestAttempt(**data)
        self.session.add(attempt)
        await self.session.flush()
        await self.session.refresh(attempt)
        return attempt

    async def get_user_test_attempts(self, user_id: str, test_type: str, test_id: int) -> Sequence[TestAttempt]:
        result = await self.session.execute(
            select(TestAttempt)
            .where(
                TestAttempt.user_id == user_id,
                TestAttempt.test_type == test_type,
                TestAttempt.test_id == test_id,
            )
            .order_by(desc(TestAttempt.attempted_at))
        )
        return result.scalars().all()

    async def has_user_passed_test(self, user_id: str, test_type: str, test_id: int) -> bool:
        attempts = await self.get_user_test_attempts(user_id, test_type, test_id)
        return bool(attempts and attempts[0].is_correct)

    # ------------------------------------------------------------------
    # Admin stats
    # ------------------------------------------------------------------
    async def get_admin_stats(self) -> dict[str, int | str]:
        total_users = await self.session.scalar(select(func.count()).select_from(User))
        active_courses = await self.session.scalar(
            select(func.count()).select_from(Course).where(Course.is_active.is_(True))
        )
        total_books = await self.session.scalar(
            select(func.count()).select_from(Book).where(Book.is_active.is_(True))
        )
        tokens_sum = await self.session.scalar(select(func.coalesce(func.sum(User.token_balance), 0)))
        return {
            "totalUsers": int(total_users or 0),
            "activeCourses": int(active_courses or 0),
            "totalBooks": int(total_books or 0),
            "tokensDistributed": str(tokens_sum or 0),
        }

    async def get_all_courses_admin(self) -> Sequence[Course]:
        result = await self.session.execute(select(Course).order_by(Course.id))
        return result.scalars().all()

    async def get_all_books_admin(self) -> Sequence[Book]:
        result = await self.session.execute(select(Book).order_by(Book.id))
        return result.scalars().all()

    async def get_all_users(self) -> Sequence[User]:
        result = await self.session.execute(select(User).order_by(desc(User.created_at)))
        return result.scalars().all()

    # ------------------------------------------------------------------
    # Text content
    # ------------------------------------------------------------------
    async def get_all_text_content(self) -> Sequence[TextContent]:
        result = await self.session.execute(
            select(TextContent).order_by(TextContent.category, TextContent.key)
        )
        return result.scalars().all()

    async def get_text_content_by_key(self, key: str) -> TextContent | None:
        result = await self.session.execute(select(TextContent).where(TextContent.key == key))
        return result.scalar_one_or_none()

    async def get_text_content_by_category(self, category: str) -> Sequence[TextContent]:
        result = await self.session.execute(
            select(TextContent).where(TextContent.category == category)
        )
        return result.scalars().all()

    async def create_text_content(self, data: dict) -> TextContent:
        content = TextContent(**data)
        self.session.add(content)
        await self.session.flush()
        await self.session.refresh(content)
        return content

    async def update_text_content(self, content_id: int, data: dict) -> TextContent:
        content = await self.session.get(TextContent, content_id)
        if not content:
            raise NoResultFound(f"Text content {content_id} not found")
        for key, value in data.items():
            if hasattr(content, key) and value is not None:
                setattr(content, key, value)
        content.updated_at = datetime.utcnow()
        await self.session.flush()
        await self.session.refresh(content)
        return content

    async def delete_text_content(self, content_id: int) -> None:
        content = await self.session.get(TextContent, content_id)
        if not content:
            raise NoResultFound(f"Text content {content_id} not found")
        await self.session.delete(content)

    # ------------------------------------------------------------------
    # Rewards (basic helpers)
    # ------------------------------------------------------------------
    async def get_daily_counter(self, user_id: str, date: str) -> UserDailyCounter:
        result = await self.session.execute(
            select(UserDailyCounter).where(
                UserDailyCounter.user_id == user_id,
                UserDailyCounter.date == date,
            )
        )
        counter = result.scalar_one_or_none()
        if counter:
            return counter
        counter = UserDailyCounter(user_id=user_id, date=date)
        self.session.add(counter)
        await self.session.flush()
        await self.session.refresh(counter)
        return counter

    async def record_reward(self, data: dict) -> UserReward:
        reward = UserReward(**data)
        self.session.add(reward)
        await self.session.flush()
        await self.session.refresh(reward)
        return reward

    async def reward_exists(self, idempotency_key: str) -> bool:
        result = await self.session.execute(
            select(UserReward.id).where(UserReward.idempotency_key == idempotency_key)
        )
        return result.scalar_one_or_none() is not None

    async def increment_daily_counter(
        self,
        user_id: str,
        date: str,
        *,
        steps: int = 0,
        books: int = 0,
        courses: int = 0,
        subs: int = 0,
    ) -> UserDailyCounter:
        counter = await self.get_daily_counter(user_id, date)
        counter.steps_mind += steps
        counter.books_mind += books
        counter.courses_mind += courses
        counter.subs_mind += subs
        counter.updated_at = datetime.utcnow()
        await self.session.flush()
        await self.session.refresh(counter)
        return counter


__all__ = ["StorageService"]
