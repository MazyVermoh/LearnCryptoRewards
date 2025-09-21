"""Course-related endpoints."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException, Path
from sqlalchemy.exc import NoResultFound
from pydantic import BaseModel, Field

from app.api.deps import StorageServiceDep
from app.schemas import (
    CourseBase,
    CourseCreate,
    CourseLessonCreate,
    CourseLessonRead,
    CourseLessonUpdate,
    CourseUpdate,
)

router = APIRouter()


class GenerateLessonsRequest(BaseModel):
    number_of_lessons: int = Field(gt=0, le=50, alias="numberOfLessons")


@router.get("/", response_model=list[CourseBase], summary="List courses")
async def list_courses(
    storage: StorageServiceDep,
    category: str | None = None,
) -> list[CourseBase]:
    courses = await storage.get_courses(category=category)
    return [CourseBase.model_validate(course) for course in courses]


@router.post("/", response_model=CourseBase, status_code=201, summary="Create course")
async def create_course(
    storage: StorageServiceDep,
    payload: CourseCreate,
) -> CourseBase:
    course = await storage.create_course(payload.model_dump(by_alias=False))
    return CourseBase.model_validate(course)


@router.get("/{course_id}", response_model=CourseBase, summary="Get course by id")
async def get_course(storage: StorageServiceDep, course_id: int = Path(...)) -> CourseBase:
    course = await storage.get_course(course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return CourseBase.model_validate(course)


@router.put("/{course_id}", response_model=CourseBase, summary="Update course")
async def update_course(
    storage: StorageServiceDep,
    payload: CourseUpdate,
    course_id: int = Path(...),
) -> CourseBase:
    try:
        course = await storage.update_course(course_id, payload.model_dump(exclude_unset=True, by_alias=False))
    except NoResultFound as exc:  # type: ignore[name-defined]
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return CourseBase.model_validate(course)


@router.delete("/{course_id}", status_code=204, summary="Soft delete course")
async def delete_course(storage: StorageServiceDep, course_id: int = Path(...)) -> None:
    await storage.delete_course(course_id, permanent=False)


@router.delete("/{course_id}/permanent", status_code=204, summary="Hard delete course")
async def delete_course_permanent(storage: StorageServiceDep, course_id: int = Path(...)) -> None:
    await storage.delete_course(course_id, permanent=True)


@router.get("/{course_id}/lessons", response_model=list[CourseLessonRead], summary="Get lessons")
async def get_course_lessons(storage: StorageServiceDep, course_id: int = Path(...)) -> list[CourseLessonRead]:
    lessons = await storage.get_course_lessons(course_id)
    return [CourseLessonRead.model_validate(lesson) for lesson in lessons]


@router.post(
    "/{course_id}/lessons",
    response_model=CourseLessonRead,
    summary="Create lesson",
)
async def create_course_lesson(
    storage: StorageServiceDep,
    course_id: int,
    payload: CourseLessonCreate,
) -> CourseLessonRead:
    data = payload.model_dump(by_alias=False)
    data["course_id"] = course_id
    lesson = await storage.create_course_lesson(data)
    return CourseLessonRead.model_validate(lesson)


@router.put("/lessons/{lesson_id}", response_model=CourseLessonRead, summary="Update lesson")
async def update_course_lesson(
    storage: StorageServiceDep,
    lesson_id: int,
    payload: CourseLessonUpdate,
) -> CourseLessonRead:
    lesson = await storage.update_course_lesson(lesson_id, payload.model_dump(exclude_unset=True, by_alias=False))
    return CourseLessonRead.model_validate(lesson)


@router.delete("/lessons/{lesson_id}", status_code=204, summary="Delete lesson")
async def delete_course_lesson(storage: StorageServiceDep, lesson_id: int) -> None:
    await storage.delete_course_lesson(lesson_id)


@router.post(
    "/{course_id}/generate-lessons",
    response_model=list[CourseLessonRead],
    summary="Generate placeholder lessons",
)
async def generate_course_lessons(
    storage: StorageServiceDep,
    course_id: int,
    request: GenerateLessonsRequest,
) -> list[CourseLessonRead]:
    lessons = await storage.generate_course_lessons(course_id, request.number_of_lessons)
    return [CourseLessonRead.model_validate(lesson) for lesson in lessons]
