"""Application configuration and settings management."""

from functools import lru_cache
from pathlib import Path
from typing import Literal

from pydantic import BaseSettings, Field


class Settings(BaseSettings):
    app_name: str = Field(default="Learn Crypto Rewards API", alias="APP_NAME")
    app_env: Literal["development", "staging", "production"] = Field(
        default="development", alias="APP_ENV"
    )
    database_url: str = Field(..., alias="DATABASE_URL")
    telegram_bot_token: str | None = Field(default=None, alias="TELEGRAM_BOT_TOKEN")
    telegram_web_app_url: str | None = Field(default=None, alias="TELEGRAM_WEB_APP_URL")
    replit_domains: str | None = Field(default=None, alias="REPLIT_DOMAINS")

    class Config:
        env_file = (Path(__file__).resolve().parent.parent.parent / ".env", ".env")
        env_file_encoding = "utf-8"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
