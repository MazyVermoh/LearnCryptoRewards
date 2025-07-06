/**
 * Telegram Bot Setup Script
 * Run this after deployment to configure the webhook
 */

import { telegramBot } from './telegram-bot.js';

async function setupTelegramBot() {
  try {
    console.log('Setting up Telegram bot...');
    
    // Get bot info
    const botInfo = await telegramBot.getMe();
    console.log('Bot info:', JSON.stringify(botInfo, null, 2));
    
    // Set webhook URL (will be replaced with actual domain after deployment)
    const webhookUrl = process.env.REPLIT_DOMAIN 
      ? `https://${process.env.REPLIT_DOMAIN}/telegram/webhook`
      : 'DEPLOYMENT_URL_PLACEHOLDER/telegram/webhook';
    
    console.log('Setting webhook URL:', webhookUrl);
    
    if (webhookUrl.includes('PLACEHOLDER')) {
      console.log('⚠️  Please set the webhook manually after deployment using:');
      console.log(`curl -X POST "https://YOUR_DEPLOYED_URL/telegram/set-webhook" \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://YOUR_DEPLOYED_URL/telegram/webhook"}'`);
    } else {
      const result = await telegramBot.setWebhook(webhookUrl);
      console.log('Webhook set successfully:', JSON.stringify(result, null, 2));
    }
    
    console.log('✅ Telegram bot setup complete!');
    console.log('🤖 Bot username:', botInfo.result?.username);
    console.log('📱 Users can find your bot at: https://t.me/' + botInfo.result?.username);
    
  } catch (error) {
    console.error('❌ Error setting up Telegram bot:', error);
    process.exit(1);
  }
}

if (import.meta.url === new URL(process.argv[1], 'file://').href) {
  setupTelegramBot();
}

export { setupTelegramBot };