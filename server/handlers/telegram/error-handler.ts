import { logger } from '../../utils/logger';
import type { QuadrantContext } from './types';
import type { Telegraf } from 'telegraf';

export function registerQuadrantErrorHandler(bot: Telegraf<QuadrantContext>) {
  bot.catch(async (error, ctx) => {
    logger.error({ message: 'Quadrant bot error', error });

    try {
      await ctx.reply('⚠️ Something went wrong. Please try again in a moment.');
    } catch (replyError) {
      logger.warn({ message: 'Failed to notify user about bot error', replyError });
    }
  });
}
