import { and, desc, eq, gte, sql } from 'drizzle-orm';

import { db } from '../db/client';
import { appConfig } from '../config/env';
import { logger } from '../utils/logger';
import { userRewards, users } from '@shared/schema';

function startOfUtcDay(date: Date) {
  const copy = new Date(date);
  copy.setUTCHours(0, 0, 0, 0);
  return copy;
}

export async function assertDailyLimit(userId: string, proposedReward: number) {
  const todayStart = startOfUtcDay(new Date());

  const [aggregate] = await db
    .select({
      total: sql<number>`COALESCE(SUM(${userRewards.mindAmount}), 0)`,
    })
    .from(userRewards)
    .where(and(gte(userRewards.timestamp, todayStart), eq(userRewards.userId, userId)));

  const totalToday = Number(aggregate?.total ?? 0);
  const newTotal = totalToday + proposedReward;

  if (newTotal > appConfig.antiFraud.dailyRewardLimit) {
    logger.warn({
      message: 'Daily reward limit exceeded',
      userId,
      totalToday,
      proposedReward,
      limit: appConfig.antiFraud.dailyRewardLimit,
    });
    throw new Error('Daily reward limit reached');
  }
}

export async function assertActionCooldown(userId: string, actionId: string, timestamp: Date) {
  const cooldownSeconds = appConfig.antiFraud.actionCooldownSeconds;
  if (cooldownSeconds === 0) {
    return;
  }

  const [recent] = await db
    .select({
      timestamp: userRewards.timestamp,
    })
    .from(userRewards)
    .where(and(eq(userRewards.userId, userId), eq(userRewards.actionId, actionId)))
    .orderBy(desc(userRewards.timestamp))
    .limit(1);

  if (!recent?.timestamp) {
    return;
  }

  const diffSeconds = (timestamp.getTime() - new Date(recent.timestamp).getTime()) / 1000;
  if (diffSeconds < cooldownSeconds) {
    throw new Error('Action cooldown in effect');
  }
}

export async function logSuspiciousIfNeeded(userId: string) {
  const [user] = await db
    .select({ createdAt: users.createdAt })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user?.createdAt) {
    return;
  }

  const accountAgeMinutes = (Date.now() - new Date(user.createdAt).getTime()) / 60000;

  if (accountAgeMinutes > 60) {
    return;
  }

  const todayStart = startOfUtcDay(new Date());
  const [aggregate] = await db
    .select({
      count: sql<number>`COUNT(*)`,
    })
    .from(userRewards)
    .where(and(gte(userRewards.timestamp, todayStart), eq(userRewards.userId, userId)));

  const actionsToday = Number(aggregate?.count ?? 0);
  if (actionsToday >= 100) {
    logger.warn({
      message: 'Suspicious high activity on fresh account',
      userId,
      accountAgeMinutes,
      actionsToday,
    });
  }
}
