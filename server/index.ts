import express, { type Request, type Response, type NextFunction } from 'express';

import { appConfig } from './config/env';
import { rateLimiter } from './middleware/rate-limit';
import { telegramWebhookRateLimiter } from './middleware/telegram-rate-limit';
import { verifyTelegramWebhook } from './middleware/telegram-webhook';
import { registerRoutes } from './routes';
import { initializeQuadrantBot, getQuadrantBot } from './handlers/telegram/bot';
import { setupVite, serveStatic } from './vite';
import { logger } from './utils/logger';

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);

app.use(rateLimiter);
app.use(express.json({ limit: appConfig.http.bodyLimit }));
app.use(express.urlencoded({ extended: false, limit: appConfig.http.bodyLimit }));

const version = '1.0.0';

const buildHealthPayload = () => ({
  status: 'ok',
  message: 'Quadrant Rewards Platform is running',
  timestamp: new Date().toISOString(),
  uptime: process.uptime(),
  environment: appConfig.nodeEnv,
  version,
});

app.get('/', (req: Request, res: Response, next) => {
  const userAgent = req.headers['user-agent']?.toLowerCase() ?? '';
  const isHealthCheck =
    userAgent.includes('health') ||
    userAgent.includes('uptime') ||
    userAgent.includes('monitor') ||
    req.query.health !== undefined ||
    req.headers['x-health-check'] !== undefined;

  if (isHealthCheck || appConfig.nodeEnv === 'production') {
    return res.status(200).json(buildHealthPayload());
  }

  return next();
});

app.get('/api', (_req: Request, res: Response) => {
  res.status(200).json(buildHealthPayload());
});

app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: appConfig.nodeEnv,
  });
});

app.get('/api/status', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    message: 'Quadrant Rewards Platform API is running',
    timestamp: new Date().toISOString(),
    version,
  });
});

const telegramBot = initializeQuadrantBot();

app.post(
  '/telegram/webhook',
  telegramWebhookRateLimiter,
  verifyTelegramWebhook,
  async (req: Request, res: Response) => {
    const bot = getQuadrantBot();
    if (!bot) {
      logger.warn('Received Telegram webhook update while bot is disabled');
      return res.status(503).json({ error: 'Telegram bot not configured' });
    }

    try {
      await bot.handleUpdate(req.body);
      res.status(200).json({ ok: true });
    } catch (error) {
      logger.error({ message: 'Telegram webhook processing error', error });
      res.status(500).json({ error: 'Internal server error' });
    }
  },
);

app.get('/telegram/info', async (_req: Request, res: Response) => {
  const bot = getQuadrantBot();
  if (!bot) {
    return res.status(503).json({ error: 'Telegram bot not configured' });
  }

  try {
    const info = await bot.telegram.getMe();
    res.json(info);
  } catch (error) {
    logger.error({ message: 'Failed to fetch Telegram bot info', error });
    res.status(500).json({ error: 'Failed to get bot info' });
  }
});

app.post('/telegram/set-webhook', async (req: Request, res: Response) => {
  const bot = getQuadrantBot();
  if (!bot) {
    return res.status(503).json({ error: 'Telegram bot not configured' });
  }

  const { url } = req.body ?? {};
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Webhook URL is required' });
  }

  try {
    await bot.telegram.setWebhook(url, {
      secret_token: appConfig.telegram.webhookSecret,
      allowed_updates: ['message', 'callback_query'],
    });
    res.json({ ok: true });
  } catch (error) {
    logger.error({ message: 'Failed to set Telegram webhook', error });
    res.status(500).json({ error: 'Failed to set webhook' });
  }
});

(async () => {
  try {
    const server = await registerRoutes(app);

    if (app.get('env') === 'development') {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
      logger.error({ message: 'Unhandled server error', error: err });
      const status =
        typeof err === 'object' && err && 'status' in err
          ? (err as { status?: number }).status
          : 500;
      const message = err instanceof Error ? err.message : 'Internal Server Error';
      res.status(status ?? 500).json({ message });
    });

    const host = appConfig.host;
    const port = appConfig.port;

    server.listen(port, host, () => {
      logger.info(`Server listening on http://${host}:${port}`);
      logger.info(`Health check available at http://${host}:${port}/api/health`);
      if (telegramBot) {
        logger.info('Quadrant bot initialised and ready to receive updates');
      }
    });

    server.on('error', (err: NodeJS.ErrnoException) => {
      logger.error({ message: 'Server startup error', error: err });
      if (err.code === 'EADDRINUSE') {
        logger.error(`Port ${port} is already in use`);
      }
    });

    process.on('SIGTERM', () => {
      logger.info('SIGTERM received, shutting down gracefully');
      server.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      logger.info('SIGINT received, shutting down gracefully');
      server.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });
    });
  } catch (error) {
    logger.error({ message: 'Failed to start server', error });
  }
})();
