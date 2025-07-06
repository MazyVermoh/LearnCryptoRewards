# Telegram Bot Integration Setup

## Bot Information
- **Bot Name**: MIND Coin
- **Username**: @Mind_Coin_Bot
- **Bot ID**: 7585752798
- **Bot URL**: https://t.me/Mind_Coin_Bot

## Features
- Welcome message with 100 MIND token bonus
- Web App integration with educational platform
- Profile command showing user stats and tokens
- Help command with feature overview
- Automatic user registration in database
- Webhook integration for real-time updates

## Post-Deployment Setup

### 1. Set Webhook URL
After deploying to production, run this command to set the webhook:

```bash
curl -X POST "https://YOUR_DEPLOYED_URL/telegram/set-webhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://YOUR_DEPLOYED_URL/telegram/webhook"}'
```

Replace `YOUR_DEPLOYED_URL` with your actual Replit deployment URL.

### 2. Test Bot Commands

Users can interact with your bot using these commands:

- `/start` - Begin learning journey, get welcome bonus
- `/profile` - View profile, tokens, and referral code  
- `/help` - Show available commands and features

### 3. Web App Integration

When users click "Open Educational Platform" button:
- They're redirected to your web app with their user ID
- All progress is tracked and tokens are awarded
- Notifications are sent back to Telegram

## API Endpoints

### Bot Information
```
GET /telegram/info
```

### Set Webhook
```
POST /telegram/set-webhook
Content-Type: application/json
{
  "url": "https://your-domain.replit.app/telegram/webhook"
}
```

### Webhook Endpoint (for Telegram)
```
POST /telegram/webhook
```

## User Flow

1. User starts bot with `/start`
2. Bot creates user account in database
3. User gets 100 MIND token welcome bonus
4. User clicks "Open Educational Platform" button
5. Web app opens with user authentication
6. User completes courses/books and earns tokens
7. Bot sends congratulatory messages for achievements

## Token Rewards

- Welcome bonus: 100 MIND tokens
- Course completion: 50 MIND tokens  
- Book completion: 100 MIND tokens
- Referral bonus: 25 MIND tokens per friend
- Daily step tracking rewards

## Security

- User IDs are validated and sanitized
- All database operations use prepared statements
- Webhook endpoint validates Telegram updates
- Web app data is JSON parsed safely