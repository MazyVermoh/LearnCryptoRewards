import { initializeQuadrantBot, getQuadrantBot } from './bot';
import { appConfig } from '../../config/env';
import { logger } from '../../utils/logger';

export async function setupQuadrantWebhook() {
  const bot = initializeQuadrantBot();
  if (!bot) {
    logger.warn('Quadrant bot disabled; skipping webhook setup');
    return;
  }

  const webhookUrl = appConfig.telegram.webhookUrl;
  if (!webhookUrl) {
    logger.warn('TELEGRAM_WEBHOOK_URL is not configured; cannot set webhook');
    return;
  }

  try {
    const me = await bot.telegram.getMe();
    logger.info(`Configuring webhook for @${me.username}`);

    await bot.telegram.setWebhook(webhookUrl, {
      secret_token: appConfig.telegram.webhookSecret,
      allowed_updates: ['message', 'callback_query'],
    });

    logger.info('Quadrant webhook configured successfully');
  } catch (error) {
    logger.error({ message: 'Failed to configure Quadrant webhook', error });
    throw error;
  }
}

if (import.meta.url === new URL(process.argv[1], 'file://').href) {
  setupQuadrantWebhook().catch(() => {
    process.exit(1);
  });
}

export { getQuadrantBot };
