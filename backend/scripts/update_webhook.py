"""Utility script to update the Telegram webhook using the Python stack."""

from __future__ import annotations

import argparse
import asyncio
import os
import httpx
from dotenv import load_dotenv


API_BASE = "https://api.telegram.org"


def build_webhook_url(deployment_url: str | None, explicit_url: str | None) -> str:
    if explicit_url:
        return explicit_url
    if not deployment_url:
        msg = "Either TELEGRAM_WEBHOOK_URL or DEPLOYMENT_URL must be provided"
        raise ValueError(msg)
    return f"{deployment_url.rstrip('/')}/telegram/webhook"


async def update_webhook(bot_token: str, webhook_url: str, secret: str | None) -> None:
    async with httpx.AsyncClient(timeout=10) as client:
        test_response = await client.get(f"{API_BASE}/bot{bot_token}/getMe")
        test_payload = test_response.json()
        if not test_payload.get("ok"):
            raise RuntimeError(f"Bot token validation failed: {test_payload}")

        print("✅ Bot token is valid: @" + test_payload["result"]["username"])

        payload: dict[str, object] = {
            "url": webhook_url,
            "allowed_updates": ["message", "callback_query"],
        }
        if secret:
            payload["secret_token"] = secret

        response = await client.post(
            f"{API_BASE}/bot{bot_token}/setWebhook",
            json=payload,
        )
        data = response.json()
        if data.get("ok"):
            print("✅ Webhook updated successfully!", data)
        else:
            raise RuntimeError(f"Failed to update webhook: {data}")


async def async_main(args: argparse.Namespace) -> None:
    load_dotenv()

    bot_token = args.bot_token or os.getenv("TELEGRAM_BOT_TOKEN")
    if not bot_token:
        raise ValueError("Telegram bot token is required")

    deployment_url = args.deployment_url or os.getenv("DEPLOYMENT_URL")
    webhook_url_env = args.webhook_url or os.getenv("TELEGRAM_WEBHOOK_URL")
    webhook_url = build_webhook_url(deployment_url, webhook_url_env)
    secret = args.secret or os.getenv("TELEGRAM_WEBHOOK_SECRET")

    print("Deployment URL:", deployment_url or "<not provided>")
    print("Webhook URL:", webhook_url)

    await update_webhook(bot_token, webhook_url, secret)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Update Telegram webhook")
    parser.add_argument("--bot-token", dest="bot_token", help="Telegram bot token")
    parser.add_argument(
        "--deployment-url",
        dest="deployment_url",
        help="Base deployment URL (e.g. https://example.com)",
    )
    parser.add_argument(
        "--webhook-url",
        dest="webhook_url",
        help="Full webhook URL. Overrides deployment URL if provided.",
    )
    parser.add_argument(
        "--secret",
        dest="secret",
        help="Optional webhook secret to register with Telegram.",
    )
    return parser.parse_args()


if __name__ == "__main__":
    arguments = parse_args()
    try:
        asyncio.run(async_main(arguments))
    except Exception as exc:  # pragma: no cover - utility script feedback
        print(f"❌ {exc}")
        raise
