"""Top-level API router."""

from fastapi import APIRouter

from app.api.v1 import (
    admin,
    books,
    content,
    courses,
    health,
    rewards,
    sponsors,
    telegram,
    tests,
    transactions,
    users,
)

api_router = APIRouter()
api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(telegram.router, prefix="/telegram", tags=["telegram"])
api_router.include_router(courses.router, prefix="/courses", tags=["courses"])
api_router.include_router(books.router, prefix="/books", tags=["books"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(transactions.router, prefix="/transactions", tags=["transactions"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
api_router.include_router(sponsors.router, prefix="/sponsors", tags=["sponsors"])
api_router.include_router(tests.router, prefix="", tags=["tests"])
api_router.include_router(content.router, prefix="/text-content", tags=["content"])
api_router.include_router(rewards.router, prefix="/rewards", tags=["rewards"])
