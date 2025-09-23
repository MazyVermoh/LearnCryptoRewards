import { findUserById } from '../../../services/user.service';
import { quadrantMessages } from '../messages';
import { startRegistration } from '../registration';
import type { QuadrantMiddleware } from '../types';

export const handleRegisterCommand: QuadrantMiddleware = async (ctx) => {
  const userId = ctx.state.userId;
  if (!userId) {
    await ctx.reply('⚠️ Unable to identify your Telegram account. Please try again later.');
    return;
  }

  const existing = await findUserById(userId);
  if (existing?.email) {
    await ctx.reply(quadrantMessages.registration.alreadyRegistered);
    return;
  }

  await startRegistration(ctx);
};
