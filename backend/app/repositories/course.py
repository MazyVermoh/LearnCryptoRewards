"""Course repository."""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.exc import NoResultFound

from app.db.models import Course
from app.repositories.base import BaseRepository


class CourseRepository(BaseRepository):
    async def list(self, category: str | None = None, only_visible: bool = True) -> list[Course]:
        stmt = select(Course)
        if category and category != "all":
            stmt = stmt.where(Course.category == category)
        if only_visible:
            stmt = stmt.where(Course.is_visible.is_(True), Course.is_active.is_(True))
        result = await self.session.execute(stmt.order_by(Course.id))
        return list(result.scalars().all())

    async def get(self, course_id: int) -> Course | None:
        result = await self.session.execute(select(Course).where(Course.id == course_id))
        return result.scalar_one_or_none()

    async def create(self, data: dict) -> Course:
        course = Course(**data)
        self.session.add(course)
        await self.flush()
        await self.refresh(course)
        return course

    async def update(self, course_id: int, data: dict) -> Course:
        course = await self.get(course_id)
        if not course:
            raise NoResultFound(f"Course {course_id} not found")
        for key, value in data.items():
            if value is not None and hasattr(course, key):
                setattr(course, key, value)
        await self.flush()
        await self.refresh(course)
        return course

    async def soft_delete(self, course_id: int) -> None:
        course = await self.get(course_id)
        if not course:
            raise NoResultFound(f"Course {course_id} not found")
        course.is_active = False
        await self.flush()

    async def set_visibility(self, course_id: int, is_visible: bool) -> Course:
        course = await self.get(course_id)
        if not course:
            raise NoResultFound(f"Course {course_id} not found")
        course.is_visible = is_visible
        await self.flush()
        await self.refresh(course)
        return course
