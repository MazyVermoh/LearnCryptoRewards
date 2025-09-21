"""SQLAlchemy models mirroring the original Drizzle schema."""

from __future__ import annotations

import enum
from datetime import datetime

from sqlalchemy import (
    Boolean,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
    text,
    Index,
    JSON,
)
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.db.base import Base


class CourseCategory(str, enum.Enum):
    MIND_THINKING = "mind-thinking"
    FINANCE_ECONOMICS = "finance-economics"
    CAREER_SKILLS = "career-skills"
    FUTURE_THINKING = "future-thinking"
    HEALTH_BODY = "health-body"


class BookCategory(str, enum.Enum):
    PSYCHOLOGY_THINKING = "psychology-thinking-development"
    FINANCIAL_LITERACY = "financial-literacy-economics"
    MARKETING = "marketing"
    HEALTH_FITNESS = "health-fitness-nutrition"
    COMMUNICATION = "communication-soft-skills"
    ENTREPRENEURSHIP = "entrepreneurship-career"
    TECHNOLOGY_FUTURE = "technology-future"
    RELATIONSHIPS = "relationships"
    POPULAR_PERSONALITIES = "popular-personalities"


class TransactionType(str, enum.Enum):
    REWARD = "reward"
    PURCHASE = "purchase"
    REFERRAL = "referral"
    STEPS = "steps"
    SUBSCRIPTION = "subscription"


class Session(Base):
    __tablename__ = "sessions"
    __table_args__ = (
        Index("IDX_session_expire", "expire"),
    )

    sid: Mapped[str] = mapped_column(String, primary_key=True)
    sess: Mapped[dict] = mapped_column(JSON, nullable=False)
    expire: Mapped[datetime] = mapped_column(DateTime, nullable=False)


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    email: Mapped[str | None] = mapped_column(String, unique=True)
    first_name: Mapped[str | None] = mapped_column(String)
    last_name: Mapped[str | None] = mapped_column(String)
    profile_image_url: Mapped[str | None] = mapped_column(String)
    token_balance: Mapped[Numeric] = mapped_column(
        Numeric(10, 2), server_default=text("0")
    )
    daily_steps: Mapped[int] = mapped_column(Integer, server_default=text("0"))
    level: Mapped[int] = mapped_column(Integer, server_default=text("1"))
    referral_code: Mapped[str | None] = mapped_column(String, unique=True)
    referred_by: Mapped[str | None] = mapped_column(
        String, ForeignKey("users.id"), nullable=True
    )
    language: Mapped[str] = mapped_column(String, server_default=text("'en'"))
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now(), nullable=False
    )

    referrer: Mapped["User"] = relationship(
        "User", remote_side=[id], back_populates="referrals"
    )
    referrals: Mapped[list["User"]] = relationship(
        "User", back_populates="referrer", cascade="all, delete-orphan"
    )
    enrollments: Mapped[list["Enrollment"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    book_purchases: Mapped[list["BookPurchase"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    transactions: Mapped[list["Transaction"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    channel_subscriptions: Mapped[list["ChannelSubscription"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    daily_challenges: Mapped[list["DailyChallenge"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    book_reading_progress: Mapped[list["BookReadingProgress"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    course_reading_progress: Mapped[list["CourseReadingProgress"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )


class Course(Base):
    __tablename__ = "courses"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String, nullable=False)
    title_ru: Mapped[str | None] = mapped_column(String)
    description: Mapped[str | None] = mapped_column(Text)
    description_ru: Mapped[str | None] = mapped_column(Text)
    content: Mapped[str | None] = mapped_column(Text)
    content_ru: Mapped[str | None] = mapped_column(Text)
    instructor: Mapped[str] = mapped_column(String, nullable=False)
    instructor_ru: Mapped[str | None] = mapped_column(String)
    category: Mapped[CourseCategory] = mapped_column(
        Enum(CourseCategory, name="course_category"), nullable=False
    )
    price: Mapped[Numeric] = mapped_column(Numeric(10, 2), server_default=text("0"))
    rating: Mapped[Numeric] = mapped_column(Numeric(3, 2), server_default=text("0"))
    review_count: Mapped[int] = mapped_column(Integer, server_default=text("0"))
    image_url: Mapped[str | None] = mapped_column(String)
    duration: Mapped[int | None] = mapped_column(Integer)
    is_active: Mapped[bool] = mapped_column(Boolean, server_default=text("true"))
    is_visible: Mapped[bool] = mapped_column(Boolean, server_default=text("true"))
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now(), nullable=False
    )

    enrollments: Mapped[list["Enrollment"]] = relationship(
        back_populates="course", cascade="all, delete-orphan"
    )
    lessons: Mapped[list["CourseLesson"]] = relationship(
        back_populates="course", cascade="all, delete-orphan"
    )
    reading_progress: Mapped[list["CourseReadingProgress"]] = relationship(
        back_populates="course", cascade="all, delete-orphan"
    )


class Enrollment(Base):
    __tablename__ = "enrollments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(
        String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    course_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False
    )
    progress: Mapped[int] = mapped_column(Integer, server_default=text("0"))
    completed_at: Mapped[datetime | None] = mapped_column(DateTime)
    enrolled_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False
    )

    user: Mapped[User] = relationship(back_populates="enrollments")
    course: Mapped[Course] = relationship(back_populates="enrollments")


class Book(Base):
    __tablename__ = "books"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String, nullable=False)
    title_ru: Mapped[str | None] = mapped_column(String)
    author: Mapped[str] = mapped_column(String, nullable=False)
    author_ru: Mapped[str | None] = mapped_column(String)
    description: Mapped[str | None] = mapped_column(Text)
    description_ru: Mapped[str | None] = mapped_column(Text)
    category: Mapped[BookCategory] = mapped_column(
        Enum(BookCategory, name="book_category"), nullable=False
    )
    price: Mapped[Numeric] = mapped_column(Numeric(10, 2), server_default=text("0"))
    cover_image_url: Mapped[str | None] = mapped_column(String)
    file_url: Mapped[str | None] = mapped_column(String)
    page_count: Mapped[int | None] = mapped_column(Integer)
    is_active: Mapped[bool] = mapped_column(Boolean, server_default=text("true"))
    is_visible: Mapped[bool] = mapped_column(Boolean, server_default=text("true"))
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now(), nullable=False
    )

    purchases: Mapped[list["BookPurchase"]] = relationship(
        back_populates="book", cascade="all, delete-orphan"
    )
    chapters: Mapped[list["BookChapter"]] = relationship(
        back_populates="book", cascade="all, delete-orphan"
    )
    reading_progress: Mapped[list["BookReadingProgress"]] = relationship(
        back_populates="book", cascade="all, delete-orphan"
    )


class BookPurchase(Base):
    __tablename__ = "book_purchases"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(
        String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    book_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("books.id", ondelete="CASCADE"), nullable=False
    )
    purchased_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False
    )

    user: Mapped[User] = relationship(back_populates="book_purchases")
    book: Mapped[Book] = relationship(back_populates="purchases")


class Transaction(Base):
    __tablename__ = "transactions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(
        String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    type: Mapped[TransactionType] = mapped_column(
        Enum(TransactionType, name="transaction_type"), nullable=False
    )
    amount: Mapped[Numeric] = mapped_column(Numeric(10, 2), nullable=False)
    description: Mapped[str] = mapped_column(String, nullable=False)
    metadata: Mapped[dict | None] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False
    )

    user: Mapped[User] = relationship(back_populates="transactions")


class SponsorChannel(Base):
    __tablename__ = "sponsor_channels"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    channel_url: Mapped[str] = mapped_column(String, nullable=False)
    reward: Mapped[Numeric] = mapped_column(Numeric(10, 2), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, server_default=text("true"))
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False
    )

    subscriptions: Mapped[list["ChannelSubscription"]] = relationship(
        back_populates="channel", cascade="all, delete-orphan"
    )


class ChannelSubscription(Base):
    __tablename__ = "channel_subscriptions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(
        String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    channel_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("sponsor_channels.id", ondelete="CASCADE"), nullable=False
    )
    verified: Mapped[bool] = mapped_column(Boolean, server_default=text("false"))
    subscribed_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False
    )

    user: Mapped[User] = relationship(back_populates="channel_subscriptions")
    channel: Mapped[SponsorChannel] = relationship(back_populates="subscriptions")


class DailyChallenge(Base):
    __tablename__ = "daily_challenges"
    __table_args__ = (
        UniqueConstraint("user_id", "date", name="daily_challenges_user_date_key"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(
        String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    date: Mapped[str] = mapped_column(String, nullable=False)
    target_steps: Mapped[int] = mapped_column(Integer, server_default=text("10000"))
    actual_steps: Mapped[int] = mapped_column(Integer, server_default=text("0"))
    completed: Mapped[bool] = mapped_column(Boolean, server_default=text("false"))
    reward_claimed: Mapped[bool] = mapped_column(Boolean, server_default=text("false"))
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False
    )

    user: Mapped[User] = relationship(back_populates="daily_challenges")


class CourseLesson(Base):
    __tablename__ = "course_lessons"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    course_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False
    )
    title: Mapped[str] = mapped_column(String, nullable=False)
    title_ru: Mapped[str | None] = mapped_column(String)
    description: Mapped[str | None] = mapped_column(Text)
    description_ru: Mapped[str | None] = mapped_column(Text)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    content_ru: Mapped[str | None] = mapped_column(Text)
    video_url: Mapped[str | None] = mapped_column(String)
    duration: Mapped[int | None] = mapped_column(Integer)
    order_index: Mapped[int] = mapped_column(Integer, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now(), nullable=False
    )

    course: Mapped[Course] = relationship(back_populates="lessons")
    tests: Mapped[list["LessonTest"]] = relationship(
        back_populates="lesson", cascade="all, delete-orphan"
    )


class BookChapter(Base):
    __tablename__ = "book_chapters"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    book_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("books.id", ondelete="CASCADE"), nullable=False
    )
    title: Mapped[str] = mapped_column(String, nullable=False)
    title_ru: Mapped[str | None] = mapped_column(String)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    content_ru: Mapped[str | None] = mapped_column(Text)
    order_index: Mapped[int] = mapped_column(Integer, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now(), nullable=False
    )

    book: Mapped[Book] = relationship(back_populates="chapters")
    tests: Mapped[list["ChapterTest"]] = relationship(
        back_populates="chapter", cascade="all, delete-orphan"
    )


class BookReadingProgress(Base):
    __tablename__ = "book_reading_progress"
    __table_args__ = (
        UniqueConstraint("user_id", "book_id", name="book_reading_progress_user_book_key"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(
        String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    book_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("books.id", ondelete="CASCADE"), nullable=False
    )
    current_chapter: Mapped[int] = mapped_column(Integer, server_default=text("1"))
    total_chapters: Mapped[int] = mapped_column(Integer, nullable=False)
    is_completed: Mapped[bool] = mapped_column(Boolean, server_default=text("false"))
    completed_at: Mapped[datetime | None] = mapped_column(DateTime)
    reward_claimed: Mapped[bool] = mapped_column(Boolean, server_default=text("false"))
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now(), nullable=False
    )

    user: Mapped[User] = relationship(back_populates="book_reading_progress")
    book: Mapped[Book] = relationship(back_populates="reading_progress")


class CourseReadingProgress(Base):
    __tablename__ = "course_reading_progress"
    __table_args__ = (
        UniqueConstraint("user_id", "course_id", name="course_reading_progress_user_course_key"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(
        String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    course_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False
    )
    current_lesson: Mapped[int] = mapped_column(Integer, server_default=text("1"))
    total_lessons: Mapped[int] = mapped_column(Integer, nullable=False)
    is_completed: Mapped[bool] = mapped_column(Boolean, server_default=text("false"))
    completed_at: Mapped[datetime | None] = mapped_column(DateTime)
    reward_claimed: Mapped[bool] = mapped_column(Boolean, server_default=text("false"))
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now(), nullable=False
    )

    user: Mapped[User] = relationship(back_populates="course_reading_progress")
    course: Mapped[Course] = relationship(back_populates="reading_progress")


class ChapterTest(Base):
    __tablename__ = "chapter_tests"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    chapter_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("book_chapters.id", ondelete="CASCADE"), nullable=False
    )
    question: Mapped[str] = mapped_column(Text, nullable=False)
    question_ru: Mapped[str | None] = mapped_column(Text)
    options: Mapped[list[str]] = mapped_column(ARRAY(Text), nullable=False)
    options_ru: Mapped[list[str] | None] = mapped_column(ARRAY(Text))
    correct_answer: Mapped[int] = mapped_column(Integer, nullable=False)
    explanation: Mapped[str | None] = mapped_column(Text)
    explanation_ru: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now(), nullable=False
    )

    chapter: Mapped[BookChapter] = relationship(back_populates="tests")
    attempts: Mapped[list["TestAttempt"]] = relationship(
        back_populates="chapter", cascade="all, delete-orphan"
    )


class LessonTest(Base):
    __tablename__ = "lesson_tests"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    lesson_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("course_lessons.id", ondelete="CASCADE"), nullable=False
    )
    question: Mapped[str] = mapped_column(Text, nullable=False)
    question_ru: Mapped[str | None] = mapped_column(Text)
    options: Mapped[list[str]] = mapped_column(ARRAY(Text), nullable=False)
    options_ru: Mapped[list[str] | None] = mapped_column(ARRAY(Text))
    correct_answer: Mapped[int] = mapped_column(Integer, nullable=False)
    explanation: Mapped[str | None] = mapped_column(Text)
    explanation_ru: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now(), nullable=False
    )

    lesson: Mapped[CourseLesson] = relationship(back_populates="tests")
    attempts: Mapped[list["TestAttempt"]] = relationship(
        back_populates="lesson", cascade="all, delete-orphan"
    )


class TestAttempt(Base):
    __tablename__ = "test_attempts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(
        String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    test_type: Mapped[str] = mapped_column(String, nullable=False)
    test_id: Mapped[int] = mapped_column(Integer, nullable=False)
    chapter_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("book_chapters.id", ondelete="CASCADE")
    )
    lesson_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("course_lessons.id", ondelete="CASCADE")
    )
    selected_answer: Mapped[int] = mapped_column(Integer, nullable=False)
    is_correct: Mapped[bool] = mapped_column(Boolean, nullable=False)
    attempted_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False
    )

    user: Mapped[User] = relationship(overlaps="chapter,lesson")
    chapter: Mapped[BookChapter | None] = relationship(
        back_populates="attempts", overlaps="user,lesson"
    )
    lesson: Mapped[CourseLesson | None] = relationship(
        back_populates="attempts", overlaps="user,chapter"
    )


class UserDailyCounter(Base):
    __tablename__ = "user_daily_counters"
    __table_args__ = (
        Index("user_date_idx", "user_id", "date"),
        UniqueConstraint("user_id", "date", name="unique_user_date"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(
        String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    date: Mapped[str] = mapped_column(String, nullable=False)
    steps_mind: Mapped[int] = mapped_column(Integer, server_default=text("0"))
    books_mind: Mapped[int] = mapped_column(Integer, server_default=text("0"))
    courses_mind: Mapped[int] = mapped_column(Integer, server_default=text("0"))
    subs_mind: Mapped[int] = mapped_column(Integer, server_default=text("0"))
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now(), nullable=False
    )

    user: Mapped[User] = relationship()


class UserReward(Base):
    __tablename__ = "user_rewards"
    __table_args__ = (
        Index("user_rewards_user_idx", "user_id"),
        Index("user_rewards_timestamp_idx", "timestamp"),
        Index("user_rewards_action_idx", "action_id"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    tx_hash: Mapped[str | None] = mapped_column(String)
    user_id: Mapped[str] = mapped_column(
        String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    action_id: Mapped[str] = mapped_column(String, nullable=False)
    mind_amount: Mapped[int] = mapped_column(Integer, nullable=False)
    idempotency_key: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    metadata: Mapped[dict | None] = mapped_column(JSON)
    timestamp: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False
    )

    user: Mapped[User] = relationship()


class TextContent(Base):
    __tablename__ = "text_content"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    key: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    text_en: Mapped[str] = mapped_column(Text, nullable=False)
    text_ru: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str] = mapped_column(String(100), server_default=text("'general'"))
    description: Mapped[str | None] = mapped_column(Text)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now(), nullable=False
    )
