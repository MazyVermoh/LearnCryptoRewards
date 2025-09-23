import { and, eq, gte, sql } from 'drizzle-orm';

import { db } from '../db/client';
import { userRewards } from '@shared/schema';

function startOfUtcDay(date: Date) {
  const clone = new Date(date);
  clone.setUTCHours(0, 0, 0, 0);
  return clone;
}

export async function getTodayActionCount(userId: string) {
  const todayStart = startOfUtcDay(new Date());
  const [aggregate] = await db
    .select({ total: sql<number>`COUNT(*)` })
    .from(userRewards)
    .where(and(eq(userRewards.userId, userId), gte(userRewards.timestamp, todayStart)));

  return Number(aggregate?.total ?? 0);
}

export async function getTodayRewardSum(userId: string) {
  const todayStart = startOfUtcDay(new Date());
  const [aggregate] = await db
    .select({ total: sql<number>`COALESCE(SUM(${userRewards.mindAmount}), 0)` })
    .from(userRewards)
    .where(and(eq(userRewards.userId, userId), gte(userRewards.timestamp, todayStart)));

  return Number(aggregate?.total ?? 0);
}
