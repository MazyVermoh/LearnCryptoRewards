/**
 * MIND Token Reward Engine
 * Handles processing of user actions and MIND token distribution
 */

import { readFileSync, writeFileSync } from 'fs';
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';
import { db } from './db';
import { userDailyCounters, userRewards } from '@shared/schema';
import { eq, and, sql } from 'drizzle-orm';

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
  user_id: string;
  date: string;
  steps_mind: number;
  books_mind: number;
  courses_mind: number;
  subs_mind: number;
}

export class RewardEngine {
  private config: RewardConfig;
  
  constructor() {
    this.loadConfig();
  }
  
  private loadConfig(): void {
    try {
      const configFile = readFileSync('rewards.yml', 'utf8');
      this.config = parseYaml(configFile);
    } catch (error) {
      console.error('Failed to load rewards config:', error);
      throw new Error('Reward system configuration not found');
    }
  }
  
  private saveConfig(): void {
    try {
      const yamlContent = stringifyYaml(this.config);
      writeFileSync('rewards.yml', yamlContent);
    } catch (error) {
      console.error('Failed to save rewards config:', error);
      throw new Error('Failed to update reward configuration');
    }
  }
  
  /**
   * Process a batch of user action events and calculate rewards
   */
  async processBatch(events: UserActionEvent[]): Promise<void> {
    console.log(`Processing batch of ${events.length} reward events...`);
    
    for (const event of events) {
      try {
        await this.processEvent(event);
      } catch (error) {
        console.error(`Failed to process event ${event.idempotency_key}:`, error);
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
        console.log(`Event ${event.idempotency_key} already processed, skipping...`);
        return;
      }
    }
    
    // Get reward configuration for this action
    const rewardConfig = this.getRewardConfig(event.action_id);
    if (!rewardConfig) {
      console.warn(`No reward config found for action: ${event.action_id}`);
      return;
    }
    
    // Calculate base reward
    let rewardAmount = this.calculateBaseReward(event, rewardConfig);
    
    // Apply rebalance coefficient
    rewardAmount = Math.floor(rewardAmount * this.config.rebalance_coefficient);
    
    // Apply daily caps
    rewardAmount = await this.applyDailyCaps(event, rewardConfig, rewardAmount);
    
    if (rewardAmount <= 0) {
      console.log(`Daily cap reached for ${event.user_id} on ${event.action_id}`);
      return;
    }
    
    // Update daily counters
    await this.updateDailyCounters(event, rewardAmount);
    
    // Record the reward
    await this.recordReward(event, rewardAmount);
    
    // Transfer tokens (placeholder - would integrate with TON blockchain)
    await this.transferTokens(event.user_id, rewardAmount);
    
    console.log(`✅ Rewarded ${rewardAmount} MIND to ${event.user_id} for ${event.action_id}`);
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
    proposedAmount: number
  ): Promise<number> {
    if (!config.daily_cap) {
      return proposedAmount; // No cap
    }
    
    const today = new Date().toISOString().split('T')[0];
    const dailyCounter = await this.getDailyCounter(event.user_id, today);
    
    let currentAmount = 0;
    switch (event.action_id) {
      case 'steps':
        currentAmount = dailyCounter.steps_mind;
        break;
      case 'book_completion':
        currentAmount = dailyCounter.books_mind;
        break;
      case 'course_completion_basic':
      case 'course_completion_intermediate':
      case 'course_completion_advanced':
        currentAmount = dailyCounter.courses_mind;
        break;
      case 'partner_subscription':
        currentAmount = dailyCounter.subs_mind;
        break;
    }
    
    const remainingCap = Math.max(0, config.daily_cap - currentAmount);
    return Math.min(proposedAmount, remainingCap);
  }
  
  private async getDailyCounter(userId: string, date: string): Promise<DailyCounter> {
    const [counter] = await db
      .select()
      .from(userDailyCounters)
      .where(and(
        eq(userDailyCounters.userId, userId),
        eq(userDailyCounters.date, date)
      ));
    
    if (counter) {
      return counter as DailyCounter;
    }
    
    // Create new daily counter
    const [newCounter] = await db
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
    
    return newCounter as DailyCounter;
  }
  
  private async updateDailyCounters(
    event: UserActionEvent,
    rewardAmount: number
  ): Promise<void> {
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
      .where(and(
        eq(userDailyCounters.userId, event.user_id),
        eq(userDailyCounters.date, today)
      ));
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
  
  private async transferTokens(userId: string, amount: number): Promise<void> {
    // TODO: Integrate with TON blockchain for actual token transfer
    // For now, this is a placeholder
    console.log(`[TON Transfer] ${amount} MIND Token to user ${userId}`);
    
    // In production, this would:
    // 1. Call TON smart contract
    // 2. Transfer tokens from reward pool to user wallet
    // 3. Update transaction hash in userRewards table
  }
  
  /**
   * Reset daily counters at UTC 00:00 (called by cron job)
   */
  async resetDailyCounters(): Promise<void> {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    // Archive yesterday's data if needed
    console.log(`Resetting daily counters for ${yesterdayStr}`);
    
    // Daily counters are automatically created for new dates,
    // so no explicit reset is needed
  }
  
  /**
   * Auto-rebalance coefficient based on emission rate
   */
  async autoRebalance(
    actualEmission: number,
    targetEmission: number
  ): Promise<void> {
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
    
    console.log(`Auto-rebalance: New coefficient = ${this.config.rebalance_coefficient}`);
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
    
    const remainingStepsCap = stepsConfig.daily_cap ? 
      Math.max(0, stepsConfig.daily_cap - counter.steps_mind) : -1;
    
    const remainingSubsCap = subsConfig.daily_cap ? 
      Math.max(0, subsConfig.daily_cap - counter.subs_mind) : -1;
    
    return {
      date: today,
      steps_mind: counter.steps_mind,
      books_mind: counter.books_mind,
      courses_mind: counter.courses_mind,
      subs_mind: counter.subs_mind,
      remaining_caps: {
        steps: remainingStepsCap,
        subs: remainingSubsCap,
      },
    };
  }
}

// Export singleton instance
export const rewardEngine = new RewardEngine();