"""Admin endpoints."""

from __future__ import annotations

from fastapi import APIRouter
from pydantic import BaseModel

from app.api.deps import StorageServiceDep
from app.schemas import BookBase, CourseBase, UserBase

router = APIRouter()


class VisibilityUpdate(BaseModel):
    is_visible: bool = True


@router.get("/stats", summary="Get admin statistics")
async def get_stats(storage: StorageServiceDep) -> dict:
    return await storage.get_admin_stats()


@router.get("/courses", response_model=list[CourseBase], summary="List all courses")
async def admin_courses(storage: StorageServiceDep) -> list[CourseBase]:
    courses = await storage.get_all_courses_admin()
    return [CourseBase.model_validate(course) for course in courses]


@router.patch("/courses/{course_id}/visibility", status_code=204, summary="Update course visibility")
async def set_course_visibility(storage: StorageServiceDep, course_id: int, payload: VisibilityUpdate) -> None:
    await storage.update_course_visibility(course_id, payload.is_visible)


@router.get("/books", response_model=list[BookBase], summary="List all books")
async def admin_books(storage: StorageServiceDep) -> list[BookBase]:
    books = await storage.get_all_books_admin()
    return [BookBase.model_validate(book) for book in books]


@router.patch("/books/{book_id}/visibility", status_code=204, summary="Update book visibility")
async def set_book_visibility(storage: StorageServiceDep, book_id: int, payload: VisibilityUpdate) -> None:
    await storage.update_book_visibility(book_id, payload.is_visible)


@router.get("/users", response_model=list[UserBase], summary="List all users")
async def admin_users(storage: StorageServiceDep) -> list[UserBase]:
    users = await storage.get_all_users()
    return [UserBase.model_validate(user) for user in users]
