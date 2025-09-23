import { findUserById, ensureReferralCode } from '../../../services/user.service';
import { getTodayActionCount } from '../../../services/activity.service';
import { quadrantMessages } from '../messages';
import { buildQuadrantKeyboard } from '../keyboards';
import type { QuadrantMiddleware } from '../types';
import { appConfig } from '../../../config/env';

export const handleProfileCommand: QuadrantMiddleware = async (ctx) => {
  const userId = ctx.state.userId;
  if (!userId) {
    await ctx.reply('⚠️ Unable to identify your account. Please try again later.');
    return;
  }

  const user = await findUserById(userId);
  if (!user?.email) {
    await ctx.reply('ℹ️ You need to register first. Use /register to get started.');
    return;
  }

  const [actionsToday, referralCode] = await Promise.all([
    getTodayActionCount(userId),
    ensureReferralCode(userId),
  ]);

  const message = quadrantMessages.profile({
    user: {
      firstName: user.firstName,
      lastName: user.lastName,
      tokenBalance: user.tokenBalance,
      dailySteps: user.dailySteps,
      referralCode,
    },
    totalActions: actionsToday,
  });

  const keyboard = buildQuadrantKeyboard(appConfig.telegram.webAppUrl || appConfig.webApp.baseUrl);
  await ctx.reply(message, {
    parse_mode: 'HTML',
    reply_markup: keyboard?.reply_markup,
  });
};
