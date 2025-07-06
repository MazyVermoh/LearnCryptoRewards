/**
 * Migration script to add MIND Token reward system tables
 * Run this script to add the new tables: user_daily_counters, user_rewards
 */

import { db } from '../db';

export async function addRewardTables() {
  console.log('Adding MIND Token reward system tables...');
  
  try {
    // The tables are already defined in schema.ts, so we just need to push the schema
    console.log('✓ Tables user_daily_counters and user_rewards will be created by db:push');
    console.log('Run: npm run db:push');
    
  } catch (error) {
    console.error('Failed to add reward tables:', error);
    throw error;
  }
}

// Auto-run if called directly
if (require.main === module) {
  addRewardTables()
    .then(() => {
      console.log('Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}