"""Application configuration and settings management."""

from functools import lru_cache
from pathlib import Path
from typing import Literal

from pydantic import BaseSettings, Field, computed_field


class Settings(BaseSettings):
    app_name: str = Field(default="Learn Crypto Rewards API", alias="APP_NAME")
    app_env: Literal["development", "staging", "production"] = Field(
        default="development", alias="APP_ENV"
    )
    database_url: str = Field(..., alias="DATABASE_URL")
    host: str = Field(default="0.0.0.0", alias="HOST")
    port: int = Field(default=5000, alias="PORT")
    telegram_bot_token: str | None = Field(default=None, alias="TELEGRAM_BOT_TOKEN")
    telegram_web_app_url: str | None = Field(default=None, alias="TELEGRAM_WEB_APP_URL")
    telegram_webhook_url: str | None = Field(default=None, alias="TELEGRAM_WEBHOOK_URL")
    telegram_webhook_secret: str | None = Field(
        default=None, alias="TELEGRAM_WEBHOOK_SECRET"
    )
    web_app_base_url: str | None = Field(default=None, alias="WEB_APP_BASE_URL")
    admins_raw: str | None = Field(default=None, alias="ADMIN_IDS")
    daily_reward_limit: int = Field(default=1000, alias="DAILY_REWARD_LIMIT")
    action_cooldown: int = Field(default=30, alias="ACTION_COOLDOWN")
    replit_domains: str | None = Field(default=None, alias="REPLIT_DOMAINS")

    @computed_field
    @property
    def admin_ids(self) -> list[str]:
        if not self.admins_raw:
            return []
        return [value.strip() for value in self.admins_raw.split(",") if value.strip()]

    @computed_field
    @property
    def resolved_web_app_base_url(self) -> str | None:
        return self.web_app_base_url or self.telegram_web_app_url

    class Config:
        env_file = (Path(__file__).resolve().parent.parent.parent / ".env", ".env")
        env_file_encoding = "utf-8"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
