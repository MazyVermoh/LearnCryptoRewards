import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import * as schema from '@shared/schema';

import { appConfig } from '../config/env';
import { logger } from '../utils/logger';

neonConfig.webSocketConstructor = ws;

if (!appConfig.databaseUrl) {
  logger.error('DATABASE_URL must be provided; check your environment configuration');
  throw new Error('DATABASE_URL must be set before creating a database pool');
}

export const pool = new Pool({ connectionString: appConfig.databaseUrl });
export const db = drizzle({ client: pool, schema });
