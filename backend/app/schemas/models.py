"""Pydantic schemas for API responses and payloads."""

from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from typing import Any, List, Optional

from pydantic import Field

from app.db.models import (
    BookCategory,
    CourseCategory,
    TransactionType,
)
from app.schemas.base import ORMModel


class UserBase(ORMModel):
    id: str
    email: str | None = None
    first_name: str | None = Field(default=None, alias="firstName")
    last_name: str | None = Field(default=None, alias="lastName")
    profile_image_url: str | None = Field(default=None, alias="profileImageUrl")
    token_balance: Decimal = Field(default=Decimal("0"), alias="tokenBalance")
    daily_steps: int = Field(default=0, alias="dailySteps")
    level: int = 1
    referral_code: str | None = Field(default=None, alias="referralCode")
    referred_by: str | None = Field(default=None, alias="referredBy")
    language: str = "en"
    created_at: datetime = Field(alias="createdAt")
    updated_at: datetime = Field(alias="updatedAt")


class UserCreate(ORMModel):
    id: str
    email: str | None = None
    first_name: str | None = Field(default=None, alias="firstName")
    last_name: str | None = Field(default=None, alias="lastName")
    profile_image_url: str | None = Field(default=None, alias="profileImageUrl")
    language: str = "en"


class UserUpdate(ORMModel):
    first_name: str | None = Field(default=None, alias="firstName")
    last_name: str | None = Field(default=None, alias="lastName")
    profile_image_url: str | None = Field(default=None, alias="profileImageUrl")
    language: str | None = None
    daily_steps: int | None = Field(default=None, alias="dailySteps")
    level: int | None = None


class CourseBase(ORMModel):
    id: int
    title: str
    title_ru: str | None = Field(default=None, alias="titleRu")
    description: str | None
    description_ru: str | None = Field(default=None, alias="descriptionRu")
    content: str | None
    content_ru: str | None = Field(default=None, alias="contentRu")
    instructor: str
    instructor_ru: str | None = Field(default=None, alias="instructorRu")
    category: CourseCategory
    price: Decimal = Decimal("0")
    rating: Decimal = Decimal("0")
    review_count: int = Field(default=0, alias="reviewCount")
    image_url: str | None = Field(default=None, alias="imageUrl")
    duration: int | None
    is_active: bool = Field(default=True, alias="isActive")
    is_visible: bool = Field(default=True, alias="isVisible")
    created_at: datetime = Field(alias="createdAt")
    updated_at: datetime = Field(alias="updatedAt")


class CourseCreate(ORMModel):
    title: str
    title_ru: str | None = Field(default=None, alias="titleRu")
    description: str | None
    description_ru: str | None = Field(default=None, alias="descriptionRu")
    content: str | None
    content_ru: str | None = Field(default=None, alias="contentRu")
    instructor: str
    instructor_ru: str | None = Field(default=None, alias="instructorRu")
    category: CourseCategory
    price: Decimal = Decimal("0")
    image_url: str | None = Field(default=None, alias="imageUrl")
    duration: int | None = None


class CourseUpdate(ORMModel):
    title: str | None = None
    title_ru: str | None = Field(default=None, alias="titleRu")
    description: str | None = None
    description_ru: str | None = Field(default=None, alias="descriptionRu")
    content: str | None = None
    content_ru: str | None = Field(default=None, alias="contentRu")
    instructor: str | None = None
    instructor_ru: str | None = Field(default=None, alias="instructorRu")
    category: CourseCategory | None = None
    price: Decimal | None = None
    rating: Decimal | None = None
    review_count: int | None = Field(default=None, alias="reviewCount")
    image_url: str | None = Field(default=None, alias="imageUrl")
    duration: int | None = None
    is_active: bool | None = Field(default=None, alias="isActive")
    is_visible: bool | None = Field(default=None, alias="isVisible")


class BookBase(ORMModel):
    id: int
    title: str
    title_ru: str | None = Field(default=None, alias="titleRu")
    author: str
    author_ru: str | None = Field(default=None, alias="authorRu")
    description: str | None
    description_ru: str | None = Field(default=None, alias="descriptionRu")
    category: BookCategory
    price: Decimal = Decimal("0")
    cover_image_url: str | None = Field(default=None, alias="coverImageUrl")
    file_url: str | None = Field(default=None, alias="fileUrl")
    page_count: int | None = Field(default=None, alias="pageCount")
    is_active: bool = Field(default=True, alias="isActive")
    is_visible: bool = Field(default=True, alias="isVisible")
    created_at: datetime = Field(alias="createdAt")
    updated_at: datetime = Field(alias="updatedAt")


class BookCreate(ORMModel):
    title: str
    title_ru: str | None = Field(default=None, alias="titleRu")
    author: str
    author_ru: str | None = Field(default=None, alias="authorRu")
    description: str | None = None
    description_ru: str | None = Field(default=None, alias="descriptionRu")
    category: BookCategory
    price: Decimal = Decimal("0")
    cover_image_url: str | None = Field(default=None, alias="coverImageUrl")
    file_url: str | None = Field(default=None, alias="fileUrl")
    page_count: int | None = Field(default=None, alias="pageCount")


class BookUpdate(ORMModel):
    title: str | None = None
    title_ru: str | None = Field(default=None, alias="titleRu")
    author: str | None = None
    author_ru: str | None = Field(default=None, alias="authorRu")
    description: str | None = None
    description_ru: str | None = Field(default=None, alias="descriptionRu")
    category: BookCategory | None = None
    price: Decimal | None = None
    cover_image_url: str | None = Field(default=None, alias="coverImageUrl")
    file_url: str | None = Field(default=None, alias="fileUrl")
    page_count: int | None = Field(default=None, alias="pageCount")
    is_active: bool | None = Field(default=None, alias="isActive")
    is_visible: bool | None = Field(default=None, alias="isVisible")


class EnrollmentRead(ORMModel):
    id: int
    user_id: str = Field(alias="userId")
    course_id: int = Field(alias="courseId")
    progress: int
    completed_at: datetime | None = Field(default=None, alias="completedAt")
    enrolled_at: datetime = Field(alias="enrolledAt")


class EnrollmentCreate(ORMModel):
    user_id: str = Field(alias="userId")
    course_id: int = Field(alias="courseId")


class BookPurchaseRead(ORMModel):
    id: int
    user_id: str = Field(alias="userId")
    book_id: int = Field(alias="bookId")
    purchased_at: datetime = Field(alias="purchasedAt")


class BookPurchaseCreate(ORMModel):
    user_id: str = Field(alias="userId")
    book_id: int = Field(alias="bookId")


class TransactionRead(ORMModel):
    id: int
    user_id: str = Field(alias="userId")
    type: TransactionType
    amount: Decimal
    description: str
    metadata: dict[str, Any] | None = None
    created_at: datetime = Field(alias="createdAt")


class TransactionCreate(ORMModel):
    user_id: str = Field(alias="userId")
    type: TransactionType
    amount: Decimal
    description: str
    metadata: dict[str, Any] | None = None


class SponsorChannelRead(ORMModel):
    id: int
    name: str
    channel_url: str = Field(alias="channelUrl")
    reward: Decimal
    is_active: bool = Field(default=True, alias="isActive")
    created_at: datetime = Field(alias="createdAt")


class SponsorChannelCreate(ORMModel):
    name: str
    channel_url: str = Field(alias="channelUrl")
    reward: Decimal


class ChannelSubscriptionRead(ORMModel):
    id: int
    user_id: str = Field(alias="userId")
    channel_id: int = Field(alias="channelId")
    verified: bool
    subscribed_at: datetime = Field(alias="subscribedAt")


class ChannelSubscriptionCreate(ORMModel):
    user_id: str = Field(alias="userId")
    channel_id: int = Field(alias="channelId")


class DailyChallengeRead(ORMModel):
    id: int
    user_id: str = Field(alias="userId")
    date: str
    target_steps: int = Field(alias="targetSteps")
    actual_steps: int = Field(alias="actualSteps")
    completed: bool
    reward_claimed: bool = Field(alias="rewardClaimed")
    created_at: datetime = Field(alias="createdAt")


class DailyChallengeCreate(ORMModel):
    user_id: str = Field(alias="userId")
    date: str
    target_steps: int = Field(default=10000, alias="targetSteps")
    actual_steps: int = Field(default=0, alias="actualSteps")
    completed: bool = False
    reward_claimed: bool = Field(default=False, alias="rewardClaimed")


class DailyChallengeUpdate(ORMModel):
    target_steps: int | None = Field(default=None, alias="targetSteps")
    actual_steps: int | None = Field(default=None, alias="actualSteps")
    completed: bool | None = None
    reward_claimed: bool | None = Field(default=None, alias="rewardClaimed")


class CourseLessonRead(ORMModel):
    id: int
    course_id: int = Field(alias="courseId")
    title: str
    title_ru: str | None = Field(default=None, alias="titleRu")
    description: str | None
    description_ru: str | None = Field(default=None, alias="descriptionRu")
    content: str
    content_ru: str | None = Field(default=None, alias="contentRu")
    video_url: str | None = Field(default=None, alias="videoUrl")
    duration: int | None
    order_index: int = Field(alias="orderIndex")
    created_at: datetime = Field(alias="createdAt")
    updated_at: datetime = Field(alias="updatedAt")


class CourseLessonCreate(ORMModel):
    title: str
    title_ru: str | None = Field(default=None, alias="titleRu")
    description: str | None = None
    description_ru: str | None = Field(default=None, alias="descriptionRu")
    content: str
    content_ru: str | None = Field(default=None, alias="contentRu")
    video_url: str | None = Field(default=None, alias="videoUrl")
    duration: int | None = None
    order_index: int = Field(alias="orderIndex")


class CourseLessonUpdate(ORMModel):
    title: str | None = None
    title_ru: str | None = Field(default=None, alias="titleRu")
    description: str | None = None
    description_ru: str | None = Field(default=None, alias="descriptionRu")
    content: str | None = None
    content_ru: str | None = Field(default=None, alias="contentRu")
    video_url: str | None = Field(default=None, alias="videoUrl")
    duration: int | None = None
    order_index: int | None = Field(default=None, alias="orderIndex")


class BookChapterRead(ORMModel):
    id: int
    book_id: int = Field(alias="bookId")
    title: str
    title_ru: str | None = Field(default=None, alias="titleRu")
    content: str
    content_ru: str | None = Field(default=None, alias="contentRu")
    order_index: int = Field(alias="orderIndex")
    created_at: datetime = Field(alias="createdAt")
    updated_at: datetime = Field(alias="updatedAt")


class BookChapterCreate(ORMModel):
    title: str
    title_ru: str | None = Field(default=None, alias="titleRu")
    content: str
    content_ru: str | None = Field(default=None, alias="contentRu")
    order_index: int = Field(alias="orderIndex")


class BookChapterUpdate(ORMModel):
    title: str | None = None
    title_ru: str | None = Field(default=None, alias="titleRu")
    content: str | None = None
    content_ru: str | None = Field(default=None, alias="contentRu")
    order_index: int | None = Field(default=None, alias="orderIndex")


class BookReadingProgressRead(ORMModel):
    id: int
    user_id: str = Field(alias="userId")
    book_id: int = Field(alias="bookId")
    current_chapter: int = Field(alias="currentChapter")
    total_chapters: int = Field(alias="totalChapters")
    is_completed: bool = Field(alias="isCompleted")
    completed_at: datetime | None = Field(default=None, alias="completedAt")
    reward_claimed: bool = Field(alias="rewardClaimed")
    created_at: datetime = Field(alias="createdAt")
    updated_at: datetime = Field(alias="updatedAt")


class BookReadingProgressUpdate(ORMModel):
    current_chapter: int = Field(alias="currentChapter")


class CourseReadingProgressRead(ORMModel):
    id: int
    user_id: str = Field(alias="userId")
    course_id: int = Field(alias="courseId")
    current_lesson: int = Field(alias="currentLesson")
    total_lessons: int = Field(alias="totalLessons")
    is_completed: bool = Field(alias="isCompleted")
    completed_at: datetime | None = Field(default=None, alias="completedAt")
    reward_claimed: bool = Field(alias="rewardClaimed")
    created_at: datetime = Field(alias="createdAt")
    updated_at: datetime = Field(alias="updatedAt")


class CourseReadingProgressUpdate(ORMModel):
    current_lesson: int = Field(alias="currentLesson")


class ChapterTestRead(ORMModel):
    id: int
    chapter_id: int = Field(alias="chapterId")
    question: str
    question_ru: str | None = Field(default=None, alias="questionRu")
    options: List[str]
    options_ru: List[str] | None = Field(default=None, alias="optionsRu")
    correct_answer: int = Field(alias="correctAnswer")
    explanation: str | None = None
    explanation_ru: str | None = Field(default=None, alias="explanationRu")
    created_at: datetime = Field(alias="createdAt")
    updated_at: datetime = Field(alias="updatedAt")


class ChapterTestCreate(ORMModel):
    question: str
    question_ru: str | None = Field(default=None, alias="questionRu")
    options: List[str]
    options_ru: List[str] | None = Field(default=None, alias="optionsRu")
    correct_answer: int = Field(alias="correctAnswer")
    explanation: str | None = None
    explanation_ru: str | None = Field(default=None, alias="explanationRu")


class ChapterTestUpdate(ORMModel):
    question: str | None = None
    question_ru: str | None = Field(default=None, alias="questionRu")
    options: List[str] | None = None
    options_ru: List[str] | None = Field(default=None, alias="optionsRu")
    correct_answer: int | None = Field(default=None, alias="correctAnswer")
    explanation: str | None = None
    explanation_ru: str | None = Field(default=None, alias="explanationRu")


class LessonTestRead(ORMModel):
    id: int
    lesson_id: int = Field(alias="lessonId")
    question: str
    question_ru: str | None = Field(default=None, alias="questionRu")
    options: List[str]
    options_ru: List[str] | None = Field(default=None, alias="optionsRu")
    correct_answer: int = Field(alias="correctAnswer")
    explanation: str | None = None
    explanation_ru: str | None = Field(default=None, alias="explanationRu")
    created_at: datetime = Field(alias="createdAt")
    updated_at: datetime = Field(alias="updatedAt")


class LessonTestCreate(ORMModel):
    question: str
    question_ru: str | None = Field(default=None, alias="questionRu")
    options: List[str]
    options_ru: List[str] | None = Field(default=None, alias="optionsRu")
    correct_answer: int = Field(alias="correctAnswer")
    explanation: str | None = None
    explanation_ru: str | None = Field(default=None, alias="explanationRu")


class LessonTestUpdate(ORMModel):
    question: str | None = None
    question_ru: str | None = Field(default=None, alias="questionRu")
    options: List[str] | None = None
    options_ru: List[str] | None = Field(default=None, alias="optionsRu")
    correct_answer: int | None = Field(default=None, alias="correctAnswer")
    explanation: str | None = None
    explanation_ru: str | None = Field(default=None, alias="explanationRu")


class TestAttemptRead(ORMModel):
    id: int
    user_id: str = Field(alias="userId")
    test_type: str = Field(alias="testType")
    test_id: int = Field(alias="testId")
    chapter_id: int | None = Field(default=None, alias="chapterId")
    lesson_id: int | None = Field(default=None, alias="lessonId")
    selected_answer: int = Field(alias="selectedAnswer")
    is_correct: bool = Field(alias="isCorrect")
    attempted_at: datetime = Field(alias="attemptedAt")


class TestAttemptCreate(ORMModel):
    user_id: str = Field(alias="userId")
    test_type: str = Field(alias="testType")
    test_id: int = Field(alias="testId")
    chapter_id: int | None = Field(default=None, alias="chapterId")
    lesson_id: int | None = Field(default=None, alias="lessonId")
    selected_answer: int = Field(alias="selectedAnswer")
    is_correct: bool = Field(alias="isCorrect")


class UserRewardRead(ORMModel):
    id: int
    tx_hash: str | None = Field(default=None, alias="txHash")
    user_id: str = Field(alias="userId")
    action_id: str = Field(alias="actionId")
    mind_amount: int = Field(alias="mindAmount")
    idempotency_key: str = Field(alias="idempotencyKey")
    metadata: dict[str, Any] | None = None
    timestamp: datetime
    created_at: datetime = Field(alias="createdAt")


class TextContentRead(ORMModel):
    id: int
    key: str
    text_en: str = Field(alias="textEn")
    text_ru: str = Field(alias="textRu")
    category: str
    description: str | None = None
    updated_at: datetime = Field(alias="updatedAt")


class RewardProcessEvent(ORMModel):
    user_id: str = Field(alias="user_id")
    action_id: str = Field(alias="action_id")
    value: float | None = None
    idempotency_key: str = Field(alias="idempotency_key")
    metadata: dict[str, Any] | None = None


class RewardBatchRequest(ORMModel):
    events: List[RewardProcessEvent]


__all__ = [name for name in globals().keys() if name.endswith("Read") or name.endswith("Create") or name.endswith("Update")]
