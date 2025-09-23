import { ensureReferralCode, findUserById } from '../../../services/user.service';
import { quadrantMessages } from '../messages';
import type { QuadrantMiddleware } from '../types';
import { appConfig } from '../../../config/env';

export const handleReferralCommand: QuadrantMiddleware = async (ctx) => {
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

  const referralCode = await ensureReferralCode(userId);
  const base = appConfig.webApp.baseUrl || appConfig.telegram.webAppUrl;
  const referralLink = base ? `${base}?ref=${encodeURIComponent(referralCode)}` : undefined;

  await ctx.reply(quadrantMessages.referral(referralCode, referralLink), { parse_mode: 'HTML' });
};
