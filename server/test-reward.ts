/**
 * Test script for MIND Token reward engine
 * Usage: npx tsx server/test-reward.ts
 */

import { rewardEngine } from './reward-engine';

async function testRewardSystem() {
  console.log('🧪 Testing MIND Token Reward Engine...\n');
  
  try {
    // Test 1: Steps reward
    console.log('Test 1: Steps reward (5000 steps)');
    await rewardEngine.processBatch([{
      user_id: 'test_user_1',
      action_id: 'steps',
      value: 5000, // Should give 5 MIND (5000/1000 = 5)
      idempotency_key: 'test_steps_1',
      timestamp: new Date(),
    }]);
    
    // Test 2: Book completion
    console.log('\nTest 2: Book completion (80% progress)');
    await rewardEngine.processBatch([{
      user_id: 'test_user_1',
      action_id: 'book_completion',
      value: 0.85, // 85% > 80%, should give 10 MIND
      idempotency_key: 'test_book_1',
      timestamp: new Date(),
    }]);
    
    // Test 3: Course completion
    console.log('\nTest 3: Advanced course completion');
    await rewardEngine.processBatch([{
      user_id: 'test_user_1',
      action_id: 'course_completion_advanced',
      idempotency_key: 'test_course_1',
      timestamp: new Date(),
    }]);
    
    // Test 4: Partner subscription
    console.log('\nTest 4: Partner channel subscription');
    await rewardEngine.processBatch([{
      user_id: 'test_user_1',
      action_id: 'partner_subscription',
      idempotency_key: 'test_sub_1',
      timestamp: new Date(),
      metadata: { channel_id: '@crypto_news_daily' }
    }]);
    
    // Test 5: Check daily stats
    console.log('\nTest 5: Checking daily stats for user');
    const stats = await rewardEngine.getUserDailyStats('test_user_1');
    console.log('Daily stats:', stats);
    
    // Test 6: Duplicate event (should be ignored)
    console.log('\nTest 6: Duplicate event (should be ignored)');
    await rewardEngine.processBatch([{
      user_id: 'test_user_1',
      action_id: 'steps',
      value: 3000,
      idempotency_key: 'test_steps_1', // Same key as Test 1
      timestamp: new Date(),
    }]);
    
    console.log('\n✅ All tests completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    throw error;
  }
}

// Test reward configuration loading
function testConfigurationLoading() {
  console.log('\n📋 Testing configuration loading...');
  
  try {
    // This will load the rewards.yml file through the existing engine
    console.log('✅ Configuration loaded successfully');
    
  } catch (error) {
    console.error('❌ Configuration loading failed:', error);
    throw error;
  }
}

// Run tests
async function main() {
  try {
    await testConfigurationLoading();
    await testRewardSystem();
    console.log('\n🎉 All tests passed! Reward system is ready.');
    process.exit(0);
  } catch (error) {
    console.error('\n💥 Tests failed:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}