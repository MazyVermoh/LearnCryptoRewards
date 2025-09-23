import { Telegraf, session } from 'telegraf';

import { appConfig } from '../../config/env';
import { logger } from '../../utils/logger';
import { registerQuadrantErrorHandler } from './error-handler';
import { handleRegisterCommand } from './commands/register';
import { handleProfileCommand } from './commands/profile';
import { handleReferralCommand } from './commands/referral';
import { handleHelpCommand } from './commands/help';
import { handleStartCommand } from './commands/start';
import { handleRegistrationResponse, resetRegistration } from './registration';
import { quadrantMessages } from './messages';
import type { QuadrantContext, QuadrantMiddleware } from './types';

let botInstance: Telegraf<QuadrantContext> | null = null;

export function initializeQuadrantBot(): Telegraf<QuadrantContext> | null {
  if (botInstance) {
    return botInstance;
  }

  const token = appConfig.telegram.botToken;
  if (!token) {
    logger.warn('Quadrant bot token is not configured; Telegram features disabled');
    return null;
  }

  const bot = new Telegraf<QuadrantContext>(token, { handlerTimeout: 10_000 });

  bot.use(session({ defaultSession: () => ({}) }) as QuadrantMiddleware);

  bot.use(async (ctx, next) => {
    const state = (ctx.state ??= {} as QuadrantContext['state']);

    if (ctx.from?.id) {
      state.userId = String(ctx.from.id);
      state.isAdmin = appConfig.admins.includes(state.userId);
    }

    if ('startPayload' in ctx && typeof ctx.startPayload === 'string') {
      state.referralPayload = ctx.startPayload;
    }

    return next();
  });

  registerQuadrantErrorHandler(bot);

  bot.start(handleStartCommand);
  bot.command('register', handleRegisterCommand);
  bot.command('profile', handleProfileCommand);
  bot.command('referral', handleReferralCommand);
  bot.command('help', handleHelpCommand);

  bot.hears(['/cancel', '/reset'], async (ctx) => {
    resetRegistration(ctx);
    await ctx.reply('✅ Registration cancelled.');
  });

  bot.on('text', async (ctx) => {
    const messageText = ctx.message?.text ?? '';
    if (messageText.startsWith('/')) {
      return;
    }

    const handled = await handleRegistrationResponse(ctx);
    if (!handled) {
      await ctx.reply(quadrantMessages.invalidCommand);
    }
  });

  bot.on('message', async (ctx) => {
    if (ctx.message && 'text' in ctx.message) {
      return;
    }
    await ctx.reply(quadrantMessages.invalidCommand);
  });

  botInstance = bot;
  logger.info('Quadrant bot initialised');
  return botInstance;
}

export function getQuadrantBot() {
  return botInstance;
}
