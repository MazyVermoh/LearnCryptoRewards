"""Telegram bot manager implemented with python-telegram-bot."""

from __future__ import annotations

from dataclasses import dataclass
from decimal import Decimal
from typing import Any

from html import escape

from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from telegram import InlineKeyboardButton, InlineKeyboardMarkup, Update, WebAppInfo
from telegram.constants import ParseMode
from telegram.ext import Application, ApplicationBuilder

from app.core.config import settings
from app.repositories.user import UserRepository


class TelegramBotNotConfigured(RuntimeError):
    """Raised when bot operations are requested without a token."""


@dataclass(slots=True)
class TelegramCommandContext:
    chat_id: int
    user_id: str
    first_name: str | None
    last_name: str | None
    username: str | None
    language_code: str | None


class WebAppPayload(BaseModel):
    user_id: str
    action: str
    data: dict[str, Any] | None = None


class TelegramBotManager:
    """Wrapper around python-telegram-bot to reproduce existing bot behaviour."""

    def __init__(
        self,
        token: str | None,
        web_app_base_url: str | None = None,
    ) -> None:
        if not token:
            raise TelegramBotNotConfigured("TELEGRAM_BOT_TOKEN must be provided")

        self.token = token
        self.web_app_base_url = web_app_base_url
        self._application: Application | None = None

    async def ensure_application(self) -> Application:
        if self._application is None:
            self._application = (
                ApplicationBuilder()
                .token(self.token)
                .build()
            )
        return self._application

    async def get_me(self) -> dict[str, Any]:
        app = await self.ensure_application()
        bot = app.bot
        me = await bot.get_me()
        return me.to_dict()

    async def set_webhook(self, url: str) -> dict[str, Any]:
        app = await self.ensure_application()
        bot = app.bot
        result = await bot.set_webhook(url, allowed_updates=["message", "callback_query"])
        return {"ok": result}

    async def process_update(self, session: AsyncSession, payload: dict[str, Any]) -> None:
        app = await self.ensure_application()
        bot = app.bot
        update = Update.de_json(payload, bot)

        if update.message is None:
            return

        message = update.message
        from_user = message.from_user
        if from_user is None:
            return

        context = TelegramCommandContext(
            chat_id=message.chat_id,
            user_id=str(from_user.id),
            first_name=from_user.first_name,
            last_name=from_user.last_name,
            username=from_user.username,
            language_code=from_user.language_code,
        )

        if message.web_app_data:
            await self._handle_web_app_data(context, message.web_app_data.data, bot)
            return

        if message.text:
            text = message.text.strip()
            if text.startswith("/start"):
                await self._handle_start(session, context, bot)
            elif text.startswith("/profile"):
                await self._handle_profile(session, context, bot)
            elif text.startswith("/help"):
                await self._handle_help(context, bot)
            else:
                await self._handle_unknown(context, bot)

    async def _handle_start(self, session: AsyncSession, ctx: TelegramCommandContext, bot) -> None:
        user_repo = UserRepository(session)
        existing_user = await user_repo.get(ctx.user_id)

        if existing_user is None:
            referral_code = f"REF_{ctx.user_id}"
            await user_repo.upsert(
                {
                    "id": ctx.user_id,
                    "email": f"telegram_{ctx.user_id}@educrypto.platform",
                    "first_name": ctx.first_name,
                    "last_name": ctx.last_name,
                    "language": ctx.language_code or "en",
                    "referral_code": referral_code,
                    "token_balance": Decimal("100"),  # welcome bonus
                }
            )
        else:
            # ensure basic fields are up to date
            await user_repo.upsert(
                {
                    "id": ctx.user_id,
                    "first_name": ctx.first_name,
                    "last_name": ctx.last_name,
                    "language": ctx.language_code or existing_user.language,
                }
            )

        web_app_url = self._build_web_app_url(ctx.user_id)
        welcome_message = (
            "\n".join(
                [
                    "🎓 <b>Welcome to MIND Token Educational Platform!</b>",
                    "",
                    "Get ready to earn MIND tokens while learning:",
                    "📚 26 premium courses across 5 categories",
                    "📖 45 curated books in 9 subjects",
                    "🧠 Interactive tests and progress tracking",
                    "💰 Token rewards for completed content",
                    "",
                    "<b>Your Welcome Bonus:</b> 100 MIND Tokens",
                    "",
                    "Click the button below to start your learning journey!",
                ]
            )
        )

        await bot.send_message(
            chat_id=ctx.chat_id,
            text=welcome_message,
            parse_mode=ParseMode.HTML,
            reply_markup=self._web_app_keyboard(web_app_url),
        )

    async def _handle_profile(self, session: AsyncSession, ctx: TelegramCommandContext, bot) -> None:
        user_repo = UserRepository(session)
        user = await user_repo.get(ctx.user_id)
        if user is None:
            await bot.send_message(
                chat_id=ctx.chat_id,
                text="❌ Please start with /start command first.",
            )
            return

        profile_message = (
            "\n".join(
                [
                    "👤 <b>Your Profile</b>",
                    "",
                    f"💰 <b>MIND Tokens:</b> {user.token_balance or 0}",
                    "👥 <b>Referrals:</b> data unavailable",
                    f"🚶 <b>Total Steps:</b> {user.daily_steps}",
                    f"📅 <b>Member since:</b> {user.created_at.date().isoformat()}",
                    "",
                    f"🎯 <b>Referral Code:</b> <code>{escape(user.referral_code or 'N/A')}</code>",
                    "Share your code to earn bonus tokens!",
                ]
            )
        )

        web_app_url = self._build_web_app_url(ctx.user_id)
        await bot.send_message(
            chat_id=ctx.chat_id,
            text=profile_message,
            parse_mode=ParseMode.HTML,
            reply_markup=self._web_app_keyboard(web_app_url),
        )

    async def _handle_help(self, ctx: TelegramCommandContext, bot) -> None:
        help_message = (
            "\n".join(
                [
                    "🤖 <b>MIND Token Bot Commands</b>",
                    "",
                    "/start - Begin your learning journey",
                    "/profile - View your profile and stats",
                    "/help - Show this help message",
                    "",
                    "<b>How to earn MIND tokens:</b>",
                    "📚 Complete courses (+50 tokens)",
                    "📖 Finish books (+100 tokens)",
                    "🧠 Pass chapter tests",
                    "🚶 Daily step tracking",
                    "👥 Refer friends (+25 tokens each)",
                    "",
                    "<b>Features:</b>",
                    "✅ Bilingual support (English/Russian)",
                    "✅ Progress tracking",
                    "✅ Interactive tests",
                    "✅ Admin management",
                    "✅ Token rewards system",
                ]
            )
        )

        await bot.send_message(
            chat_id=ctx.chat_id,
            text=help_message,
            parse_mode=ParseMode.HTML,
        )

    async def _handle_unknown(self, ctx: TelegramCommandContext, bot) -> None:
        await bot.send_message(
            chat_id=ctx.chat_id,
            text="🤔 I don't understand that command. Use /help to see available commands.",
        )

    async def _handle_web_app_data(self, ctx: TelegramCommandContext, data: str, bot) -> None:
        try:
            payload = WebAppPayload.model_validate_json(data)
        except ValueError:
            await bot.send_message(
                chat_id=ctx.chat_id,
                text="❌ Failed to parse data from the web app.",
            )
            return

        responses = {
            "course_completed": "🎉 Congratulations! You completed the course and earned 50 MIND tokens!",
            "book_completed": "📚 Amazing! You finished reading the book and earned 100 MIND tokens!",
            "test_passed": "✅ Great job passing the test! Keep up the learning!",
            "test_failed": "📖 Don't worry! Re-read the material and try the test again.",
        }

        message = responses.get(
            payload.action,
            "👍 Update received from the platform. Keep going!",
        )

        await bot.send_message(chat_id=ctx.chat_id, text=message)

    def _build_web_app_url(self, user_id: str) -> str:
        if self.web_app_base_url:
            base = self.web_app_base_url
        elif settings.resolved_web_app_base_url:
            base = settings.resolved_web_app_base_url
        elif settings.web_app_base_url:
            base = settings.web_app_base_url
        elif settings.replit_domains:
            base = f"https://{settings.replit_domains}"
        else:
            base = "https://example.com"
        separator = "&" if "?" in base else "?"
        return f"{base}{separator}user_id={user_id}"

    def _web_app_keyboard(self, url: str) -> InlineKeyboardMarkup:
        button = InlineKeyboardButton(
            text="🎓 Open Educational Platform",
            web_app=WebAppInfo(url=url),
        )
        return InlineKeyboardMarkup([[button]])


telegram_bot_manager: TelegramBotManager | None = None


def initialise_telegram_bot() -> TelegramBotManager | None:
    global telegram_bot_manager
    if telegram_bot_manager is not None:
        return telegram_bot_manager

    token = settings.telegram_bot_token
    if not token:
        return None

    manager = TelegramBotManager(
        token=token,
        web_app_base_url=settings.resolved_web_app_base_url,
    )
    telegram_bot_manager = manager
    return manager
