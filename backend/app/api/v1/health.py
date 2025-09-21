"""Health and status endpoints."""

from datetime import datetime

from fastapi import APIRouter

from app.core.config import settings

router = APIRouter()


@router.get("/", summary="Health check")
async def health_check() -> dict[str, str | float]:
    """Return service health metadata."""
    return {
        "status": "ok",
        "timestamp": datetime.utcnow().isoformat(),
        "environment": settings.app_env,
        "service": settings.app_name,
    }
