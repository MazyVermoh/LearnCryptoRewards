import { randomBytes } from 'crypto';
import { eq } from 'drizzle-orm';

import { db } from '../db/client';
import { logger } from '../utils/logger';
import { users, type User } from '@shared/schema';

export interface RegistrationPayload {
  id: string;
  firstName: string;
  lastName?: string;
  email: string;
  referredBy?: string;
}

function generateReferralCode(): string {
  return `QDR-${randomBytes(4).toString('hex').toUpperCase()}`;
}

export async function findUserById(id: string): Promise<User | undefined> {
  const rows = await db.select().from(users).where(eq(users.id, id));
  return (rows as User[])[0];
}

export async function findUserByEmail(email: string): Promise<User | undefined> {
  const rows = await db.select().from(users).where(eq(users.email, email));
  return (rows as User[])[0];
}

export async function registerUser(payload: RegistrationPayload): Promise<User> {
  const existingById = await findUserById(payload.id);
  if (existingById) {
    return existingById;
  }

  const referralCode = generateReferralCode();

  try {
    const rows = await db
      .insert(users)
      .values({
        id: payload.id,
        firstName: payload.firstName,
        lastName: payload.lastName ?? null,
        email: payload.email,
        referralCode,
        referredBy: payload.referredBy ?? null,
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          firstName: payload.firstName,
          lastName: payload.lastName ?? null,
          email: payload.email,
          referredBy: payload.referredBy ?? null,
          updatedAt: new Date(),
        },
      })
      .returning();

    return (rows as User[])[0];
  } catch (error) {
    logger.error({ message: 'Failed to register user', error });
    throw error;
  }
}

export async function ensureReferralCode(userId: string) {
  const user = await findUserById(userId);
  if (user?.referralCode) {
    return user.referralCode;
  }

  const newCode = generateReferralCode();
  await db
    .update(users)
    .set({ referralCode: newCode, updatedAt: new Date() })
    .where(eq(users.id, userId));

  return newCode;
}

export function logSuspiciousAccount(details: Record<string, unknown>) {
  logger.warn({ message: 'Suspicious account behaviour detected', ...details });
}
