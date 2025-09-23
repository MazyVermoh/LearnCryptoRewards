import rateLimit from 'express-rate-limit';

import { appConfig } from '../config/env';

export const rateLimiter = rateLimit({
  windowMs: appConfig.http.rateLimit.windowMs,
  max: appConfig.http.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests. Please slow down.',
  },
});
