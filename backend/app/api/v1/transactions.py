"""Transaction and finance endpoints."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException
from sqlalchemy.exc import NoResultFound

from app.api.deps import StorageServiceDep
from app.schemas import TransactionCreate, TransactionRead

router = APIRouter()


@router.post("/", response_model=TransactionRead, status_code=201, summary="Create transaction")
async def create_transaction(storage: StorageServiceDep, payload: TransactionCreate) -> TransactionRead:
    transaction = await storage.create_transaction(payload.model_dump(by_alias=False))
    return TransactionRead.model_validate(transaction)
