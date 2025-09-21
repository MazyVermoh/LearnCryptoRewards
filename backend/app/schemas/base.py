"""Base Pydantic schemas."""

from datetime import datetime
from decimal import Decimal
from typing import Any

from pydantic import BaseModel, ConfigDict


class ORMModel(BaseModel):
    """Base model configured for ORM mode."""

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class TimestampMixin(BaseModel):
    created_at: datetime
    updated_at: datetime | None = None


class MonetaryAmount(BaseModel):
    value: Decimal

    @classmethod
    def from_numeric(cls, value: Decimal | float | int) -> "MonetaryAmount":
        return cls(value=Decimal(value))

    model_config = ConfigDict(from_attributes=True)


def optional_decimal(value: Any) -> Decimal | None:
    if value is None:
        return None
    return Decimal(value)
