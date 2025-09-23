import { config as loadEnv } from 'dotenv';
import { z } from 'zod';

loadEnv();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  HOST: z.string().default('0.0.0.0'),
  PORT: z.coerce.number().min(0).max(65535).default(5000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  TELEGRAM_BOT_TOKEN: z.string().min(1).optional(),
  TELEGRAM_WEB_APP_URL: z.string().url().optional(),
  TELEGRAM_WEBHOOK_SECRET: z.string().min(16).optional(),
  TELEGRAM_WEBHOOK_URL: z.string().url().optional(),
  WEB_APP_BASE_URL: z.string().url().optional(),
  ADMIN_IDS: z.string().optional(),
  DAILY_REWARD_LIMIT: z.coerce.number().int().nonnegative().default(1000),
  ACTION_COOLDOWN: z.coerce.number().int().nonnegative().default(30),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60_000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),
  HTTP_BODY_LIMIT: z.string().default('1mb'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables', parsed.error.format());
  throw new Error('Invalid environment configuration');
}

const env = parsed.data;

export const appConfig = {
  nodeEnv: env.NODE_ENV,
  host: env.HOST,
  port: env.PORT,
  databaseUrl: env.DATABASE_URL,
  logging: {
    level: env.LOG_LEVEL,
  },
  http: {
    bodyLimit: env.HTTP_BODY_LIMIT,
    rateLimit: {
      windowMs: env.RATE_LIMIT_WINDOW_MS,
      max: env.RATE_LIMIT_MAX,
    },
  },
  telegram: {
    botToken: env.TELEGRAM_BOT_TOKEN,
    webAppUrl: env.TELEGRAM_WEB_APP_URL,
    webhookSecret: env.TELEGRAM_WEBHOOK_SECRET,
    webhookUrl: env.TELEGRAM_WEBHOOK_URL,
  },
  webApp: {
    baseUrl: env.WEB_APP_BASE_URL,
  },
  admins: env.ADMIN_IDS
    ? env.ADMIN_IDS.split(',')
        .map((id) => id.trim())
        .filter(Boolean)
    : [],
  antiFraud: {
    dailyRewardLimit: env.DAILY_REWARD_LIMIT,
    actionCooldownSeconds: env.ACTION_COOLDOWN,
  },
};

export type AppConfig = typeof appConfig;
