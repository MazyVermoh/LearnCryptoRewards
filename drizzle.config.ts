import { config as loadEnv } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

loadEnv();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL must be provided before running Drizzle commands');
}

export default defineConfig({
  out: './server/migrations',
  schema: './shared/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: databaseUrl,
  },
});
