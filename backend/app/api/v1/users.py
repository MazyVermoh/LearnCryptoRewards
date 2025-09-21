"""User-centric endpoints."""

from __future__ import annotations

from datetime import datetime

from fastapi import APIRouter, HTTPException, Path
from pydantic import BaseModel, Field
from sqlalchemy.exc import NoResultFound

from app.api.deps import StorageServiceDep
from app.schemas import (
    BookPurchaseCreate,
    BookPurchaseRead,
    BookReadingProgressRead,
    BookReadingProgressUpdate,
    CourseReadingProgressRead,
    CourseReadingProgressUpdate,
    DailyChallengeCreate,
    DailyChallengeRead,
    DailyChallengeUpdate,
    EnrollmentCreate,
    EnrollmentRead,
    TransactionRead,
    UserBase,
)

router = APIRouter()


class StepsUpdateRequest(BaseModel):
    steps: int = Field(ge=0)


class EnrollmentProgressUpdate(BaseModel):
    progress: int = Field(ge=0, le=100)


@router.get("/{user_id}", response_model=UserBase, summary="Get user")
async def get_user(storage: StorageServiceDep, user_id: str = Path(...)) -> UserBase:
    user = await storage.get_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserBase.model_validate(user)


@router.put("/{user_id}/steps", status_code=204, summary="Update daily steps")
async def update_steps(
    storage: StorageServiceDep,
    user_id: str,
    payload: StepsUpdateRequest,
) -> None:
    await storage.update_user_steps(user_id, payload.steps)


@router.post("/{user_id}/referral-code", summary="Generate referral code")
async def generate_referral_code(storage: StorageServiceDep, user_id: str) -> dict[str, str]:
    code = await storage.generate_referral_code(user_id)
    return {"code": code}


@router.post("/enrollments", response_model=EnrollmentRead, status_code=201, summary="Enroll user")
async def enroll_user(storage: StorageServiceDep, payload: EnrollmentCreate) -> EnrollmentRead:
    try:
        enrollment = await storage.enroll_user(payload.model_dump(by_alias=False))
    except ValueError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    return EnrollmentRead.model_validate(enrollment)


@router.get("/{user_id}/enrollments", response_model=list[EnrollmentRead], summary="List user enrollments")
async def list_user_enrollments(storage: StorageServiceDep, user_id: str) -> list[EnrollmentRead]:
    enrollments = await storage.get_user_enrollments(user_id)
    return [EnrollmentRead.model_validate(item) for item in enrollments]


@router.put("/enrollments/{enrollment_id}/progress", status_code=204, summary="Update enrollment progress")
async def update_enrollment_progress(
    storage: StorageServiceDep,
    enrollment_id: int,
    payload: EnrollmentProgressUpdate,
) -> None:
    await storage.update_enrollment_progress(enrollment_id, payload.progress)


@router.post("/book-purchases", response_model=BookPurchaseRead, status_code=201, summary="Purchase book")
async def create_book_purchase(storage: StorageServiceDep, payload: BookPurchaseCreate) -> BookPurchaseRead:
    try:
        purchase = await storage.purchase_book(payload.model_dump(by_alias=False))
    except ValueError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    return BookPurchaseRead.model_validate(purchase)


@router.get("/{user_id}/books", response_model=list[BookPurchaseRead], summary="List user books")
async def list_user_books(storage: StorageServiceDep, user_id: str) -> list[BookPurchaseRead]:
    purchases = await storage.get_user_books(user_id)
    return [BookPurchaseRead.model_validate(item) for item in purchases]


@router.get(
    "/{user_id}/books/{book_id}/progress",
    response_model=BookReadingProgressRead | None,
    summary="Get book progress",
)
async def get_book_progress(storage: StorageServiceDep, user_id: str, book_id: int) -> BookReadingProgressRead | None:
    progress = await storage.get_book_reading_progress(user_id, book_id)
    if not progress:
        return None
    return BookReadingProgressRead.model_validate(progress)


@router.put(
    "/{user_id}/books/{book_id}/progress",
    response_model=BookReadingProgressRead,
    summary="Update book progress",
)
async def update_book_progress(
    storage: StorageServiceDep,
    user_id: str,
    book_id: int,
    payload: BookReadingProgressUpdate,
) -> BookReadingProgressRead:
    progress = await storage.upsert_book_progress(user_id, book_id, payload.current_chapter)
    return BookReadingProgressRead.model_validate(progress)


@router.post(
    "/{user_id}/books/{book_id}/complete",
    status_code=200,
    summary="Mark book as completed",
)
async def complete_book(storage: StorageServiceDep, user_id: str, book_id: int) -> dict[str, bool]:
    await storage.complete_book_reading(user_id, book_id)
    return {"success": True}


@router.get(
    "/{user_id}/courses/{course_id}/progress",
    response_model=CourseReadingProgressRead | None,
    summary="Get course progress",
)
async def get_course_progress(storage: StorageServiceDep, user_id: str, course_id: int) -> CourseReadingProgressRead | None:
    progress = await storage.get_course_reading_progress(user_id, course_id)
    if not progress:
        return None
    return CourseReadingProgressRead.model_validate(progress)


@router.put(
    "/{user_id}/courses/{course_id}/progress",
    response_model=CourseReadingProgressRead,
    summary="Update course progress",
)
async def update_course_progress(
    storage: StorageServiceDep,
    user_id: str,
    course_id: int,
    payload: CourseReadingProgressUpdate,
) -> CourseReadingProgressRead:
    progress = await storage.upsert_course_progress(user_id, course_id, payload.current_lesson)
    return CourseReadingProgressRead.model_validate(progress)


@router.post(
    "/{user_id}/courses/{course_id}/complete",
    status_code=200,
    summary="Mark course as completed",
)
async def complete_course(storage: StorageServiceDep, user_id: str, course_id: int) -> dict[str, bool]:
    await storage.complete_course_reading(user_id, course_id)
    return {"success": True}


@router.get(
    "/{user_id}/book-progress",
    response_model=list[BookReadingProgressRead],
    summary="List all book progress",
)
async def list_book_progress(storage: StorageServiceDep, user_id: str) -> list[BookReadingProgressRead]:
    progress = await storage.get_all_book_progress(user_id)
    return [BookReadingProgressRead.model_validate(item) for item in progress]


@router.get(
    "/{user_id}/transactions",
    response_model=list[TransactionRead],
    summary="List user transactions",
)
async def list_user_transactions(
    storage: StorageServiceDep,
    user_id: str,
    limit: int | None = None,
) -> list[TransactionRead]:
    transactions = await storage.get_user_transactions(user_id, limit)
    return [TransactionRead.model_validate(tx) for tx in transactions]


@router.get(
    "/{user_id}/daily-challenge",
    response_model=DailyChallengeRead,
    summary="Get or create daily challenge",
)
async def get_daily_challenge(storage: StorageServiceDep, user_id: str) -> DailyChallengeRead:
    challenge = await storage.get_today_challenge(user_id)
    if challenge is None:
        today = datetime.utcnow().date().isoformat()
        challenge = await storage.create_daily_challenge(
            DailyChallengeCreate(userId=user_id, date=today).model_dump(by_alias=False)
        )
    return DailyChallengeRead.model_validate(challenge)


@router.put(
    "/daily-challenges/{challenge_id}",
    status_code=204,
    summary="Update daily challenge",
)
async def update_daily_challenge(
    storage: StorageServiceDep,
    challenge_id: int,
    payload: DailyChallengeUpdate,
) -> None:
    await storage.update_daily_challenge(challenge_id, payload.model_dump(exclude_unset=True, by_alias=False))
