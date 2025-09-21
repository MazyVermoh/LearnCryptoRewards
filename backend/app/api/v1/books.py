"""Book-related endpoints."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException, Path
from sqlalchemy.exc import NoResultFound

from app.api.deps import StorageServiceDep
from app.schemas import (
    BookBase,
    BookChapterCreate,
    BookChapterRead,
    BookChapterUpdate,
    BookCreate,
    BookUpdate,
)

router = APIRouter()


@router.get("/", response_model=list[BookBase], summary="List books")
async def list_books(
    storage: StorageServiceDep,
    category: str | None = None,
    search: str | None = None,
) -> list[BookBase]:
    books = await storage.get_books(category=category, search=search)
    return [BookBase.model_validate(book) for book in books]


@router.post("/", response_model=BookBase, status_code=201, summary="Create book")
async def create_book(storage: StorageServiceDep, payload: BookCreate) -> BookBase:
    book = await storage.create_book(payload.model_dump(by_alias=False))
    return BookBase.model_validate(book)


@router.get("/{book_id}", response_model=BookBase, summary="Get book")
async def get_book(storage: StorageServiceDep, book_id: int = Path(...)) -> BookBase:
    book = await storage.get_book(book_id)
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    return BookBase.model_validate(book)


@router.put("/{book_id}", response_model=BookBase, summary="Update book")
async def update_book(storage: StorageServiceDep, book_id: int, payload: BookUpdate) -> BookBase:
    try:
        book = await storage.update_book(book_id, payload.model_dump(exclude_unset=True, by_alias=False))
    except NoResultFound as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    return BookBase.model_validate(book)


@router.delete("/{book_id}", status_code=204, summary="Soft delete book")
async def delete_book(storage: StorageServiceDep, book_id: int) -> None:
    await storage.delete_book(book_id, permanent=False)


@router.delete("/{book_id}/permanent", status_code=204, summary="Hard delete book")
async def delete_book_permanent(storage: StorageServiceDep, book_id: int) -> None:
    await storage.delete_book(book_id, permanent=True)


@router.get("/{book_id}/chapters", response_model=list[BookChapterRead], summary="List chapters")
async def get_book_chapters(storage: StorageServiceDep, book_id: int) -> list[BookChapterRead]:
    chapters = await storage.get_book_chapters(book_id)
    return [BookChapterRead.model_validate(chapter) for chapter in chapters]


@router.post(
    "/{book_id}/chapters",
    response_model=BookChapterRead,
    status_code=201,
    summary="Create chapter",
)
async def create_book_chapter(
    storage: StorageServiceDep,
    book_id: int,
    payload: BookChapterCreate,
) -> BookChapterRead:
    data = payload.model_dump(by_alias=False)
    data["book_id"] = book_id
    chapter = await storage.create_book_chapter(data)
    return BookChapterRead.model_validate(chapter)


@router.put("/chapters/{chapter_id}", response_model=BookChapterRead, summary="Update chapter")
async def update_book_chapter(
    storage: StorageServiceDep,
    chapter_id: int,
    payload: BookChapterUpdate,
) -> BookChapterRead:
    chapter = await storage.update_book_chapter(chapter_id, payload.model_dump(exclude_unset=True, by_alias=False))
    return BookChapterRead.model_validate(chapter)


@router.delete("/chapters/{chapter_id}", status_code=204, summary="Delete chapter")
async def delete_book_chapter(storage: StorageServiceDep, chapter_id: int) -> None:
    await storage.delete_book_chapter(chapter_id)


@router.post(
    "/{book_id}/generate-chapters",
    response_model=list[BookChapterRead],
    summary="Generate placeholder chapters",
)
async def generate_book_chapters(storage: StorageServiceDep, book_id: int, number_of_chapters: int) -> list[BookChapterRead]:
    if not (1 <= number_of_chapters <= 50):
        raise HTTPException(status_code=400, detail="Number of chapters must be between 1 and 50")
    chapters = await storage.generate_book_chapters(book_id, number_of_chapters)
    return [BookChapterRead.model_validate(chapter) for chapter in chapters]
