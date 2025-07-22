// Script to update Telegram webhook for deployed application
const DEPLOYMENT_URL = "https://f91aea43-f87f-4235-b012-074cc27759ce-00-1h36tiyvg9vp2.picard.replit.dev";
const WEBHOOK_URL = `${DEPLOYMENT_URL}/telegram/webhook`;

// Test the new bot token first
const BOT_TOKEN = "7585752798:AAHG7dJNuiyrlc19cNi0aO__DDup8VPlFJE";

async function testBotToken() {
  try {
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getMe`);
    const data = await response.json();
    console.log('Bot info test:', data);
    return data.ok;
  } catch (error) {
    console.error('Error testing bot token:', error);
    return false;
  }
}

async function updateWebhook() {
  console.log('Testing bot token first...');
  const tokenValid = await testBotToken();
  
  if (!tokenValid) {
    console.log('❌ Bot token is invalid, webhook update will fail');
    return;
  }
  
  console.log('✅ Bot token is valid, updating webhook...');
  console.log('Deployment URL:', DEPLOYMENT_URL);
  console.log('Webhook URL:', WEBHOOK_URL);

  // Update webhook directly with Telegram API
  try {
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: WEBHOOK_URL,
        allowed_updates: ['message', 'callback_query']
      })
    });
    
    const data = await response.json();
    console.log('Direct webhook update result:', data);
    
    if (data.ok) {
      console.log('✅ Webhook updated successfully!');
      console.log('Your bot is now connected to the deployed application.');
      console.log('Try sending /start to @Mind_Coin_Bot');
    } else {
      console.log('❌ Failed to update webhook:', data);
    }
  } catch (error) {
    console.error('Error updating webhook:', error);
  }
}

updateWebhook();