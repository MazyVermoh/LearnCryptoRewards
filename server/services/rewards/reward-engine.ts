/**
 * Quadrant Reward Engine
 * Handles processing of user actions and Quadrant token distribution
 */

import { readFileSync, writeFileSync } from 'fs';
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';
import { eq, and, sql } from 'drizzle-orm';

import { userDailyCounters, userRewards } from '@shared/schema';

import { db } from '../../db/client';
import { logger } from '../../utils/logger';
import { transferTokens } from './token-transfer';
import {
  assertActionCooldown,
  assertDailyLimit,
  logSuspiciousIfNeeded,
} from '../anti-fraud.service';

interface RewardConfig {
  rebalance_coefficient: number;
  rewards: {
    [key: string]: {
      action_id: string;
      base_reward: number;
      daily_cap: number | null;
      notes: string;
    };
  };
  auto_rebalance: {
    enabled: boolean;
    schedule: string;
    remaining_pool_months: number;
  };
  security: {
    idempotency_enabled: boolean;
    server_side_verification: boolean;
    duplicate_prevention: boolean;
  };
}

interface UserActionEvent {
  user_id: string;
  action_id: string;
  value?: number; // for steps count, book progress, etc.
  idempotency_key: string;
  timestamp: Date;
  metadata?: any;
}

interface DailyCounter {
  userId: string;
  date: string;
  stepsMind: number;
  booksMind: number;
  coursesMind: number;
  subsMind: number;
}

export class RewardEngine {
  private config!: RewardConfig;

  constructor() {
    this.loadConfig();
  }

  private loadConfig(): void {
    try {
      const configFile = readFileSync('rewards.yml', 'utf8');
      this.config = parseYaml(configFile);
    } catch (error) {
      logger.error({ message: 'Failed to load rewards config', error });
      throw new Error('Reward system configuration not found');
    }
  }

  private saveConfig(): void {
    try {
      const yamlContent = stringifyYaml(this.config);
      writeFileSync('rewards.yml', yamlContent);
    } catch (error) {
      logger.error({ message: 'Failed to save rewards config', error });
      throw new Error('Failed to update reward configuration');
    }
  }

  /**
   * Process a batch of user action events and calculate rewards
   */
  async processBatch(events: UserActionEvent[]): Promise<void> {
    logger.debug(`Processing batch of ${events.length} reward events`);

    for (const event of events) {
      try {
        await this.processEvent(event);
      } catch (error) {
        logger.error({ message: `Failed to process event ${event.idempotency_key}`, error });
        // Continue processing other events
      }
    }
  }

  /**
   * Process a single user action event
   */
  private async processEvent(event: UserActionEvent): Promise<void> {
    // Check idempotency
    if (this.config.security.idempotency_enabled) {
      const exists = await this.checkIdempotency(event.idempotency_key);
      if (exists) {
        logger.debug(`Event ${event.idempotency_key} already processed, skipping`);
        return;
      }
    }

    // Get reward configuration for this action
    const rewardConfig = this.getRewardConfig(event.action_id);
    if (!rewardConfig) {
      logger.warn(`No reward config found for action: ${event.action_id}`);
      return;
    }

    // Calculate base reward
    let rewardAmount = this.calculateBaseReward(event, rewardConfig);

    // Apply rebalance coefficient
    rewardAmount = Math.floor(rewardAmount * this.config.rebalance_coefficient);

    // Apply daily caps
    rewardAmount = await this.applyDailyCaps(event, rewardConfig, rewardAmount);

    if (rewardAmount <= 0) {
      logger.debug(`Daily cap reached for ${event.user_id} on ${event.action_id}`);
      return;
    }

    try {
      await assertActionCooldown(event.user_id, event.action_id, event.timestamp);
      await assertDailyLimit(event.user_id, rewardAmount);
    } catch (error) {
      logger.warn({
        message: 'Anti-fraud check blocked reward',
        userId: event.user_id,
        actionId: event.action_id,
        reason: error instanceof Error ? error.message : 'Unknown reason',
      });
      return;
    }

    // Update daily counters
    await this.updateDailyCounters(event, rewardAmount);

    // Record the reward
    await this.recordReward(event, rewardAmount);

    // Transfer tokens (placeholder - would integrate with TON blockchain)
    await transferTokens(event.user_id, rewardAmount);

    logger.info(`Rewarded ${rewardAmount} MIND to ${event.user_id} for ${event.action_id}`);

    await logSuspiciousIfNeeded(event.user_id);
  }

  private getRewardConfig(actionId: string) {
    return this.config.rewards[actionId];
  }

  private calculateBaseReward(event: UserActionEvent, config: any): number {
    switch (event.action_id) {
      case 'steps':
        // 1 MIND per 1000 steps
        return Math.floor((event.value || 0) / 1000) * config.base_reward;

      case 'book_completion':
        // Check if progress >= 80%
        if ((event.value || 0) >= 0.8) {
          return config.base_reward;
        }
        return 0;

      case 'course_completion_basic':
      case 'course_completion_intermediate':
      case 'course_completion_advanced':
      case 'partner_subscription':
      case 'referral_bonus':
        return config.base_reward;

      default:
        return 0;
    }
  }

  private async applyDailyCaps(
    event: UserActionEvent,
    config: any,
    proposedAmount: number,
  ): Promise<number> {
    if (!config.daily_cap) {
      return proposedAmount; // No cap
    }

    const today = new Date().toISOString().split('T')[0];
    const dailyCounter = await this.getDailyCounter(event.user_id, today);

    let currentAmount = 0;
    switch (event.action_id) {
      case 'steps':
        currentAmount = dailyCounter.stepsMind;
        break;
      case 'book_completion':
        currentAmount = dailyCounter.booksMind;
        break;
      case 'course_completion_basic':
      case 'course_completion_intermediate':
      case 'course_completion_advanced':
        currentAmount = dailyCounter.coursesMind;
        break;
      case 'partner_subscription':
        currentAmount = dailyCounter.subsMind;
        break;
    }

    const remainingCap = Math.max(0, config.daily_cap - currentAmount);
    return Math.min(proposedAmount, remainingCap);
  }

  private async getDailyCounter(userId: string, date: string): Promise<DailyCounter> {
    const [counter] = await db
      .select()
      .from(userDailyCounters)
      .where(and(eq(userDailyCounters.userId, userId), eq(userDailyCounters.date, date)));

    if (counter) {
      return {
        userId: counter.userId,
        date: counter.date,
        stepsMind: Number(counter.stepsMind ?? 0),
        booksMind: Number(counter.booksMind ?? 0),
        coursesMind: Number(counter.coursesMind ?? 0),
        subsMind: Number(counter.subsMind ?? 0),
      };
    }

    // Create new daily counter
    await db
      .insert(userDailyCounters)
      .values({
        userId,
        date,
        stepsMind: 0,
        booksMind: 0,
        coursesMind: 0,
        subsMind: 0,
      })
      .returning();

    return {
      userId,
      date,
      stepsMind: 0,
      booksMind: 0,
      coursesMind: 0,
      subsMind: 0,
    };
  }

  private async updateDailyCounters(event: UserActionEvent, rewardAmount: number): Promise<void> {
    const today = new Date().toISOString().split('T')[0];

    let updateField: string;
    switch (event.action_id) {
      case 'steps':
        updateField = 'stepsMind';
        break;
      case 'book_completion':
        updateField = 'booksMind';
        break;
      case 'course_completion_basic':
      case 'course_completion_intermediate':
      case 'course_completion_advanced':
        updateField = 'coursesMind';
        break;
      case 'partner_subscription':
        updateField = 'subsMind';
        break;
      default:
        return; // No counter for this action
    }

    await db
      .update(userDailyCounters)
      .set({
        [updateField]: sql`${userDailyCounters[updateField as keyof typeof userDailyCounters]} + ${rewardAmount}`,
        updatedAt: new Date(),
      })
      .where(and(eq(userDailyCounters.userId, event.user_id), eq(userDailyCounters.date, today)));
  }

  private async checkIdempotency(idempotencyKey: string): Promise<boolean> {
    const [existing] = await db
      .select()
      .from(userRewards)
      .where(eq(userRewards.idempotencyKey, idempotencyKey));

    return !!existing;
  }

  private async recordReward(event: UserActionEvent, amount: number): Promise<void> {
    await db.insert(userRewards).values({
      userId: event.user_id,
      actionId: event.action_id,
      mindAmount: amount,
      idempotencyKey: event.idempotency_key,
      metadata: event.metadata || null,
      timestamp: event.timestamp,
    });
  }

  /**
   * Reset daily counters at UTC 00:00 (called by cron job)
   */
  async resetDailyCounters(): Promise<void> {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Archive yesterday's data if needed
    logger.debug(`Resetting daily counters for ${yesterdayStr}`);

    // Daily counters are automatically created for new dates,
    // so no explicit reset is needed
  }

  /**
   * Auto-rebalance coefficient based on emission rate
   */
  async autoRebalance(actualEmission: number, targetEmission: number): Promise<void> {
    if (!this.config.auto_rebalance.enabled) {
      return;
    }

    let newCoefficient: number;

    if (actualEmission > targetEmission * 1.1) {
      // Reduce rewards if we're emitting 10% more than target
      newCoefficient = targetEmission / actualEmission;
    } else if (actualEmission < targetEmission * 0.9) {
      // Increase rewards if we're emitting 10% less than target
      newCoefficient = Math.min(1.0, targetEmission / actualEmission);
    } else {
      // Keep current rate if within 10% of target
      newCoefficient = this.config.rebalance_coefficient;
    }

    // Round to 4 decimal places
    this.config.rebalance_coefficient = Number(newCoefficient.toFixed(4));
    this.saveConfig();

    logger.info(`Auto-rebalance: new coefficient = ${this.config.rebalance_coefficient}`);
  }

  /**
   * Get user's current daily stats and remaining caps
   */
  async getUserDailyStats(userId: string): Promise<{
    date: string;
    steps_mind: number;
    books_mind: number;
    courses_mind: number;
    subs_mind: number;
    remaining_caps: {
      steps: number;
      subs: number;
    };
  }> {
    const today = new Date().toISOString().split('T')[0];
    const counter = await this.getDailyCounter(userId, today);

    // Calculate remaining caps
    const stepsConfig = this.config.rewards.steps;
    const subsConfig = this.config.rewards.partner_subscription;

    const remainingStepsCap = stepsConfig.daily_cap
      ? Math.max(0, stepsConfig.daily_cap - counter.stepsMind)
      : -1;

    const remainingSubsCap = subsConfig.daily_cap
      ? Math.max(0, subsConfig.daily_cap - counter.subsMind)
      : -1;

    return {
      date: today,
      steps_mind: counter.stepsMind,
      books_mind: counter.booksMind,
      courses_mind: counter.coursesMind,
      subs_mind: counter.subsMind,
      remaining_caps: {
        steps: remainingStepsCap,
        subs: remainingSubsCap,
      },
    };
  }
}

// Export singleton instance
export const rewardEngine = new RewardEngine();
