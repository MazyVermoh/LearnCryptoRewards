/**
 * API routes for Quadrant reward system
 * Used by Telegram bot and frontend to process rewards
 */

import type { Express } from 'express';
import { z } from 'zod';

import { rewardEngine } from '../services/rewards/reward-engine';
import { autoRebalancer } from '../services/rewards/auto-rebalance';
import { logger } from '../utils/logger';

// Validation schemas
const rewardEventSchema = z.object({
  user_id: z.string(),
  action_id: z.enum([
    'steps',
    'book_completion',
    'course_completion_basic',
    'course_completion_intermediate',
    'course_completion_advanced',
    'partner_subscription',
    'referral_bonus',
  ]),
  value: z.number().optional(),
  idempotency_key: z.string(),
  metadata: z.any().optional(),
});

const batchRewardSchema = z.object({
  events: z.array(rewardEventSchema).max(100), // Max 100 events per batch
});

export function registerRewardRoutes(app: Express) {
  // Process single reward event
  app.post('/api/rewards/process', async (req, res) => {
    try {
      const eventData = rewardEventSchema.parse(req.body);

      await rewardEngine.processBatch([
        {
          ...eventData,
          timestamp: new Date(),
        },
      ]);

      res.json({
        success: true,
        message: 'Reward processed successfully',
      });
    } catch (error) {
      logger.error('Reward processing error:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // Process batch of reward events
  app.post('/api/rewards/batch', async (req, res) => {
    try {
      const batchData = batchRewardSchema.parse(req.body);

      const events = batchData.events.map((event) => ({
        ...event,
        timestamp: new Date(),
      }));

      await rewardEngine.processBatch(events);

      res.json({
        success: true,
        message: `Processed ${events.length} reward events`,
        count: events.length,
      });
    } catch (error) {
      logger.error('Batch reward processing error:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // Get user daily stats and remaining caps
  app.get('/api/rewards/user/:userId/stats', async (req, res) => {
    try {
      const { userId } = req.params;
      const stats = await rewardEngine.getUserDailyStats(userId);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      logger.error('User stats error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get user stats',
      });
    }
  });

  // Bot command: /balance (placeholder - would integrate with TON wallet)
  app.get('/api/rewards/user/:userId/balance', async (req, res) => {
    try {
      const { userId } = req.params;

      // TODO: Integrate with actual TON wallet balance
      // For now, return placeholder data
      const balance = {
        mind_balance: 1250, // Would come from TON blockchain
        pending_rewards: 50,
        total_earned: 5420,
        wallet_address: 'UQD...placeholder',
        user_id: userId,
      };

      res.json({
        success: true,
        data: balance,
      });
    } catch (error) {
      logger.error('Balance check error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to check balance',
      });
    }
  });

  // Reset daily counters (called by cron job)
  app.post('/api/rewards/reset-daily', async (req, res) => {
    try {
      await rewardEngine.resetDailyCounters();

      res.json({
        success: true,
        message: 'Daily counters reset successfully',
      });
    } catch (error) {
      logger.error('Reset daily counters error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to reset daily counters',
      });
    }
  });

  // Manual auto-rebalance trigger (admin only)
  app.post('/api/rewards/rebalance', async (req, res) => {
    try {
      // In production, add authentication middleware here
      await autoRebalancer.executeMonthlyRebalance();

      res.json({
        success: true,
        message: 'Auto-rebalance executed successfully',
      });
    } catch (error) {
      logger.error('Auto-rebalance error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to execute rebalance',
      });
    }
  });

  // Health check for reward system
  app.get('/api/rewards/health', async (req, res) => {
    try {
      // Check if reward engine is properly configured
      const stats = await rewardEngine.getUserDailyStats('health_check_user');

      res.json({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        data: stats,
      });
    } catch (error) {
      logger.error('Health check error:', error);
      res.status(500).json({
        success: false,
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });
}
