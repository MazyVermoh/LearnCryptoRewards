/**
 * Auto-rebalance Cloud Function for MIND Token reward system
 * Runs monthly to adjust reward coefficient based on emission rate
 */

import { readFileSync, writeFileSync } from 'fs';
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';
import { db } from './db';
import { userRewards } from '@shared/schema';
import { sql, between } from 'drizzle-orm';

interface RewardConfig {
  rebalance_coefficient: number;
  auto_rebalance: {
    enabled: boolean;
    remaining_pool_months: number;
  };
  [key: string]: any;
}

export class AutoRebalancer {
  private configPath = 'rewards.yml';
  
  async executeMonthlyRebalance(): Promise<void> {
    console.log('Starting monthly auto-rebalance...');
    
    try {
      // Load current config
      const config = this.loadConfig();
      
      if (!config.auto_rebalance.enabled) {
        console.log('Auto-rebalance is disabled, skipping...');
        return;
      }
      
      // Calculate actual monthly emission
      const actualEmission = await this.calculateActualMonthlyEmission();
      console.log(`Actual monthly emission: ${actualEmission} MIND`);
      
      // Get remaining pool and months
      const remainingPool = await this.getRemainingTokenPool();
      const monthsLeft = config.auto_rebalance.remaining_pool_months;
      console.log(`Remaining pool: ${remainingPool} MIND, Months left: ${monthsLeft}`);
      
      // Calculate target emission and new coefficient
      const targetMonthlyEmission = remainingPool / monthsLeft;
      console.log(`Target monthly emission: ${targetMonthlyEmission} MIND`);
      
      let newK: number;
      if (actualEmission > targetMonthlyEmission) {
        // Reduce rewards to stay on track
        newK = targetMonthlyEmission / actualEmission;
        console.log(`⚠️ Emission above target, reducing coefficient to ${newK.toFixed(4)}`);
      } else {
        // Maintain normal rewards
        newK = 1.0;
        console.log(`✅ Emission within target, maintaining coefficient at 1.0`);
      }
      
      // Update config
      config.rebalance_coefficient = Number(newK.toFixed(4));
      this.saveConfig(config);
      
      console.log(`✓ Auto-rebalance completed. New coefficient: ${newK.toFixed(4)}`);
      
      // Log rebalance event
      await this.logRebalanceEvent(actualEmission, targetMonthlyEmission, newK);
      
    } catch (error) {
      console.error('Auto-rebalance failed:', error);
      throw error;
    }
  }
  
  private loadConfig(): RewardConfig {
    try {
      const configFile = readFileSync(this.configPath, 'utf8');
      return parseYaml(configFile);
    } catch (error) {
      console.error('Failed to load rewards config:', error);
      throw new Error('Reward system configuration not found');
    }
  }
  
  private saveConfig(config: RewardConfig): void {
    try {
      const yamlContent = stringifyYaml(config);
      writeFileSync(this.configPath, yamlContent);
    } catch (error) {
      console.error('Failed to save rewards config:', error);
      throw new Error('Failed to update reward configuration');
    }
  }
  
  private async calculateActualMonthlyEmission(): Promise<number> {
    // Calculate emissions for the past 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const result = await db
      .select({
        totalEmission: sql<number>`SUM(${userRewards.mindAmount})`.as('total_emission')
      })
      .from(userRewards)
      .where(between(userRewards.timestamp, thirtyDaysAgo, new Date()));
    
    return result[0]?.totalEmission || 0;
  }
  
  private async getRemainingTokenPool(): Promise<number> {
    // This would typically come from the smart contract
    // For now, we'll use a conservative estimate
    // Total supply: 10B MIND
    // Assuming 20% (2B) allocated for rewards over 24 months
    const totalRewardPool = 2_000_000_000; // 2B MIND
    
    // Calculate total distributed so far
    const result = await db
      .select({
        totalDistributed: sql<number>`SUM(${userRewards.mindAmount})`.as('total_distributed')
      })
      .from(userRewards);
    
    const totalDistributed = result[0]?.totalDistributed || 0;
    
    return Math.max(0, totalRewardPool - totalDistributed);
  }
  
  private async logRebalanceEvent(
    actualEmission: number,
    targetEmission: number,
    newCoefficient: number
  ): Promise<void> {
    // Log to a rebalance history table or external monitoring service
    console.log(`REBALANCE LOG: ${new Date().toISOString()}`);
    console.log(`- Actual: ${actualEmission} MIND`);
    console.log(`- Target: ${targetEmission} MIND`);
    console.log(`- New K: ${newCoefficient}`);
    
    // Could also write to a dedicated rebalance_history table
    // or send to monitoring service like DataDog, CloudWatch, etc.
  }
}

// Export for cloud function usage
export const autoRebalancer = new AutoRebalancer();

// Cloud Function handler (for deployment)
export async function handleScheduledRebalance(): Promise<void> {
  try {
    await autoRebalancer.executeMonthlyRebalance();
  } catch (error) {
    console.error('Scheduled rebalance failed:', error);
    // Could send alert to monitoring system
    throw error;
  }
}

// CLI usage  
if (import.meta.url === `file://${process.argv[1]}`) {
  autoRebalancer.executeMonthlyRebalance()
    .then(() => {
      console.log('Manual rebalance completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Manual rebalance failed:', error);
      process.exit(1);
    });
}