"""Testing endpoints (chapters/lessons)."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query

from app.api.deps import StorageServiceDep
from app.schemas import (
    ChapterTestCreate,
    ChapterTestRead,
    ChapterTestUpdate,
    LessonTestCreate,
    LessonTestRead,
    LessonTestUpdate,
    TestAttemptCreate,
    TestAttemptRead,
)

router = APIRouter()


@router.get("/chapters/{chapter_id}/tests", response_model=list[ChapterTestRead], summary="List chapter tests")
async def list_chapter_tests(storage: StorageServiceDep, chapter_id: int) -> list[ChapterTestRead]:
    tests = await storage.get_chapter_tests(chapter_id)
    return [ChapterTestRead.model_validate(test) for test in tests]


@router.post(
    "/chapters/{chapter_id}/tests",
    response_model=ChapterTestRead,
    status_code=201,
    summary="Create chapter test",
)
async def create_chapter_test(
    storage: StorageServiceDep,
    chapter_id: int,
    payload: ChapterTestCreate,
) -> ChapterTestRead:
    data = payload.model_dump(by_alias=False)
    data["chapter_id"] = chapter_id
    test = await storage.create_chapter_test(data)
    return ChapterTestRead.model_validate(test)


@router.put("/chapter-tests/{test_id}", response_model=ChapterTestRead, summary="Update chapter test")
async def update_chapter_test(
    storage: StorageServiceDep,
    test_id: int,
    payload: ChapterTestUpdate,
) -> ChapterTestRead:
    test = await storage.update_chapter_test(test_id, payload.model_dump(exclude_unset=True, by_alias=False))
    return ChapterTestRead.model_validate(test)


@router.delete("/chapter-tests/{test_id}", status_code=204, summary="Delete chapter test")
async def delete_chapter_test(storage: StorageServiceDep, test_id: int) -> None:
    await storage.delete_chapter_test(test_id)


@router.get("/lessons/{lesson_id}/tests", response_model=list[LessonTestRead], summary="List lesson tests")
async def list_lesson_tests(storage: StorageServiceDep, lesson_id: int) -> list[LessonTestRead]:
    tests = await storage.get_lesson_tests(lesson_id)
    return [LessonTestRead.model_validate(test) for test in tests]


@router.post(
    "/lessons/{lesson_id}/tests",
    response_model=LessonTestRead,
    status_code=201,
    summary="Create lesson test",
)
async def create_lesson_test(
    storage: StorageServiceDep,
    lesson_id: int,
    payload: LessonTestCreate,
) -> LessonTestRead:
    data = payload.model_dump(by_alias=False)
    data["lesson_id"] = lesson_id
    test = await storage.create_lesson_test(data)
    return LessonTestRead.model_validate(test)


@router.put("/lesson-tests/{test_id}", response_model=LessonTestRead, summary="Update lesson test")
async def update_lesson_test(
    storage: StorageServiceDep,
    test_id: int,
    payload: LessonTestUpdate,
) -> LessonTestRead:
    test = await storage.update_lesson_test(test_id, payload.model_dump(exclude_unset=True, by_alias=False))
    return LessonTestRead.model_validate(test)


@router.delete("/lesson-tests/{test_id}", status_code=204, summary="Delete lesson test")
async def delete_lesson_test(storage: StorageServiceDep, test_id: int) -> None:
    await storage.delete_lesson_test(test_id)


@router.post("/test-attempts", response_model=TestAttemptRead, status_code=201, summary="Submit test attempt")
async def submit_test_attempt(storage: StorageServiceDep, payload: TestAttemptCreate) -> TestAttemptRead:
    attempt = await storage.submit_test_attempt(payload.model_dump(by_alias=False))
    return TestAttemptRead.model_validate(attempt)


@router.get(
    "/users/{user_id}/test-attempts",
    response_model=list[TestAttemptRead],
    summary="List user test attempts",
)
async def list_test_attempts(
    storage: StorageServiceDep,
    user_id: str,
    test_type: str = Query(...),
    test_id: int = Query(..., alias="testId"),
) -> list[TestAttemptRead]:
    if not test_type or test_id is None:
        raise HTTPException(status_code=400, detail="testType and testId are required")
    attempts = await storage.get_user_test_attempts(user_id, test_type, test_id)
    return [TestAttemptRead.model_validate(a) for a in attempts]


@router.get(
    "/users/{user_id}/test-status",
    summary="Check if user passed test",
)
async def user_test_status(
    storage: StorageServiceDep,
    user_id: str,
    test_type: str = Query(...),
    test_id: int = Query(..., alias="testId"),
) -> dict[str, bool]:
    if not test_type or test_id is None:
        raise HTTPException(status_code=400, detail="testType and testId are required")
    has_passed = await storage.has_user_passed_test(user_id, test_type, test_id)
    return {"hasPassed": has_passed}
