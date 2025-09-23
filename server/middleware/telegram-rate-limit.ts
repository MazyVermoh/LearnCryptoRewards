import rateLimit from 'express-rate-limit';

export const telegramWebhookRateLimiter = rateLimit({
  windowMs: 15 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
});
