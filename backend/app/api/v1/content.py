"""Content management endpoints."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app.api.deps import StorageServiceDep
from app.schemas import TextContentRead

router = APIRouter()


@router.get("/", response_model=list[TextContentRead], summary="List text content")
async def list_text_content(storage: StorageServiceDep, category: str | None = None) -> list[TextContentRead]:
    if category:
        content = await storage.get_text_content_by_category(category)
    else:
        content = await storage.get_all_text_content()
    return [TextContentRead.model_validate(item) for item in content]


@router.get("/{key}", response_model=TextContentRead, summary="Get text content by key")
async def get_text_content(storage: StorageServiceDep, key: str) -> TextContentRead:
    content = await storage.get_text_content_by_key(key)
    if not content:
        raise HTTPException(status_code=404, detail="Text content not found")
    return TextContentRead.model_validate(content)
