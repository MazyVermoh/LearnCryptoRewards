import { findUserById } from '../../../services/user.service';
import { quadrantMessages } from '../messages';
import { buildQuadrantKeyboard } from '../keyboards';
import { startRegistration } from '../registration';
import type { QuadrantMiddleware } from '../types';
import { appConfig } from '../../../config/env';

export const handleStartCommand: QuadrantMiddleware = async (ctx) => {
  const userId = ctx.state.userId;
  if (!userId) {
    await ctx.reply('⚠️ Unable to identify your Telegram account. Please try again later.');
    return;
  }

  const existing = await findUserById(userId);
  if (existing?.email) {
    const keyboard = buildQuadrantKeyboard(
      appConfig.telegram.webAppUrl || appConfig.webApp.baseUrl,
    );
    await ctx.reply(
      quadrantMessages.welcomeExisting({
        firstName: existing.firstName ?? null,
        lastName: existing.lastName ?? null,
      }),
      {
        reply_markup: keyboard?.reply_markup,
      },
    );
    return;
  }

  await ctx.reply(quadrantMessages.welcomeNew());
  await startRegistration(ctx);
};
