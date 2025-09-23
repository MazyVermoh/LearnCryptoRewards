import type { Request, Response, NextFunction } from 'express';

import { appConfig } from '../config/env';
import { logger } from '../utils/logger';

const SECRET_HEADER = 'x-telegram-bot-api-secret-token';

export function verifyTelegramWebhook(req: Request, res: Response, next: NextFunction) {
  const expectedSecret = appConfig.telegram.webhookSecret;

  if (!expectedSecret) {
    logger.warn('TELEGRAM_WEBHOOK_SECRET is not configured; webhook verification is skipped');
    return next();
  }

  const providedSecret =
    req.get(SECRET_HEADER) ?? (typeof req.query.secret === 'string' ? req.query.secret : undefined);

  if (!providedSecret || providedSecret !== expectedSecret) {
    logger.warn('Rejected Telegram webhook request due to invalid or missing secret');
    return res.status(403).json({ error: 'Invalid webhook secret' });
  }

  next();
}
