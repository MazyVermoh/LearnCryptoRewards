// Script to update Telegram webhook for deployed application
const DEPLOYMENT_URL = "https://f91aea43-f87f-4235-b012-074cc27759ce-00-1h36tiyvg9vp2.picard.replit.dev";
const WEBHOOK_URL = `${DEPLOYMENT_URL}/telegram/webhook`;

console.log('Updating Telegram webhook...');
console.log('Deployment URL:', DEPLOYMENT_URL);
console.log('Webhook URL:', WEBHOOK_URL);

fetch('http://localhost:5000/telegram/set-webhook', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    url: WEBHOOK_URL
  })
})
.then(response => response.json())
.then(data => {
  console.log('Webhook update result:', data);
  if (data.ok) {
    console.log('✅ Webhook updated successfully!');
    console.log('Your bot is now connected to the deployed application.');
    console.log('Try sending /start to @Mind_Coin_Bot');
  } else {
    console.log('❌ Failed to update webhook:', data);
  }
})
.catch(error => {
  console.error('Error updating webhook:', error);
});