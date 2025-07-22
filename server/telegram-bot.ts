/**
 * Telegram Bot Integration for Educational Platform
 * Connects the web application with Telegram bot
 */

import { db } from './db.js';
import { users } from '../shared/schema.js';
import { eq } from 'drizzle-orm';

interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from: {
      id: number;
      is_bot: boolean;
      first_name: string;
      last_name?: string;
      username?: string;
      language_code?: string;
    };
    chat: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
      type: string;
    };
    date: number;
    text?: string;
    web_app_data?: {
      data: string;
      button_text: string;
    };
  };
}

interface WebAppData {
  user_id: string;
  action: string;
  data?: any;
}

class TelegramBot {
  private token: string;
  private baseUrl: string;

  constructor() {
    this.token = process.env.TELEGRAM_BOT_TOKEN!;
    this.baseUrl = `https://api.telegram.org/bot${this.token}`;
    
    console.log('Bot token (first 20 chars):', this.token?.substring(0, 20));
    console.log('Bot URL:', this.baseUrl.substring(0, 50) + '...');
    
    if (!this.token) {
      throw new Error('TELEGRAM_BOT_TOKEN is required');
    }
  }

  async sendMessage(chatId: number, text: string, options?: any) {
    try {
      const payload = {
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        ...options,
      };

      console.log('Sending message payload:', JSON.stringify(payload, null, 2));
      
      const response = await fetch(`${this.baseUrl}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        console.error('Telegram API error response:', responseData);
        throw new Error(`Telegram API error: ${response.status} - ${JSON.stringify(responseData)}`);
      }

      return responseData;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  async sendWebApp(chatId: number, text: string, webAppUrl: string) {
    return this.sendMessage(chatId, text, {
      reply_markup: {
        inline_keyboard: [[
          {
            text: "🎓 Open Educational Platform",
            web_app: { url: webAppUrl }
          }
        ]]
      }
    });
  }

  async processUpdate(update: TelegramUpdate) {
    const message = update.message;
    if (!message) return;

    const chatId = message.chat.id;
    const userId = message.from.id.toString();
    const text = message.text || '';

    try {
      // Handle web app data
      if (message.web_app_data) {
        await this.handleWebAppData(chatId, userId, message.web_app_data);
        return;
      }

      // Handle commands and messages
      if (text.startsWith('/start')) {
        await this.handleStartCommand(chatId, userId, message.from);
      } else if (text.startsWith('/profile')) {
        await this.handleProfileCommand(chatId, userId);
      } else if (text.startsWith('/help')) {
        await this.handleHelpCommand(chatId);
      } else {
        await this.handleUnknownCommand(chatId);
      }
    } catch (error) {
      console.error('Error processing update:', error);
      await this.sendMessage(chatId, '❌ Something went wrong. Please try again.');
    }
  }

  private async handleStartCommand(chatId: number, userId: string, userInfo: any) {
    // Create or update user in database
    const existingUser = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    
    if (existingUser.length === 0) {
      await db.insert(users).values({
        id: userId,
        email: `telegram_${userId}@educrypto.platform`,
        name: `${userInfo.first_name} ${userInfo.last_name || ''}`.trim(),
        username: userInfo.username,
        mindTokens: 100, // Welcome bonus
        totalSteps: 0,
        referralCode: `REF_${userId}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    const webAppUrl = process.env.REPLIT_DOMAINS 
      ? `https://${process.env.REPLIT_DOMAINS}?user_id=${userId}`
      : `https://f91aea43-f87f-4235-b012-074cc27759ce-00-1h36tiyvg9vp2.picard.replit.dev?user_id=${userId}`;

    const welcomeMessage = `
🎓 <b>Welcome to MIND Token Educational Platform!</b>

Get ready to earn MIND tokens while learning:
📚 26 premium courses across 5 categories
📖 45 curated books in 9 subjects
🧠 Interactive tests and progress tracking
💰 Token rewards for completed content

<b>Your Welcome Bonus:</b> 100 MIND Tokens

Click the button below to start your learning journey!
    `;

    await this.sendWebApp(chatId, welcomeMessage, webAppUrl);
  }

  private async handleProfileCommand(chatId: number, userId: string) {
    try {
      const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      
      if (user.length === 0) {
        await this.sendMessage(chatId, '❌ Please start with /start command first.');
        return;
      }

      const userData = user[0];
      const profileMessage = `
👤 <b>Your Profile</b>

💰 <b>MIND Tokens:</b> ${userData.mindTokens}
👥 <b>Referrals:</b> ${userData.referrals || 0}
🚶 <b>Total Steps:</b> ${userData.totalSteps}
📅 <b>Member since:</b> ${userData.createdAt.toLocaleDateString()}

🎯 <b>Referral Code:</b> <code>${userData.referralCode}</code>
Share your code to earn bonus tokens!
      `;

      const webAppUrl = process.env.REPLIT_DOMAINS 
        ? `https://${process.env.REPLIT_DOMAINS}?user_id=${userId}`
        : `https://f91aea43-f87f-4235-b012-074cc27759ce-00-1h36tiyvg9vp2.picard.replit.dev?user_id=${userId}`;

      await this.sendWebApp(chatId, profileMessage, webAppUrl);
    } catch (error) {
      console.error('Error fetching profile:', error);
      await this.sendMessage(chatId, '❌ Error loading profile. Please try again.');
    }
  }

  private async handleHelpCommand(chatId: number) {
    const helpMessage = `
🤖 <b>MIND Token Bot Commands</b>

/start - Begin your learning journey
/profile - View your profile and stats
/help - Show this help message

<b>How to earn MIND tokens:</b>
📚 Complete courses (+50 tokens)
📖 Finish books (+100 tokens)
🧠 Pass chapter tests
🚶 Daily step tracking
👥 Refer friends (+25 tokens each)

<b>Features:</b>
✅ Bilingual support (English/Russian)
✅ Progress tracking
✅ Interactive tests
✅ Admin management
✅ Token rewards system
    `;

    await this.sendMessage(chatId, helpMessage);
  }

  private async handleUnknownCommand(chatId: number) {
    await this.sendMessage(chatId, 
      "🤔 I don't understand that command. Use /help to see available commands."
    );
  }

  private async handleWebAppData(chatId: number, userId: string, webAppData: any) {
    try {
      const data: WebAppData = JSON.parse(webAppData.data);
      
      // Process different actions from the web app
      switch (data.action) {
        case 'course_completed':
          await this.sendMessage(chatId, 
            `🎉 Congratulations! You completed the course and earned 50 MIND tokens!`
          );
          break;
        case 'book_completed':
          await this.sendMessage(chatId, 
            `📚 Amazing! You finished reading the book and earned 100 MIND tokens!`
          );
          break;
        case 'test_passed':
          await this.sendMessage(chatId, 
            `✅ Great job passing the test! Keep up the learning!`
          );
          break;
        case 'test_failed':
          await this.sendMessage(chatId, 
            `📖 Don't worry! Re-read the material and try the test again.`
          );
          break;
        default:
          console.log('Unknown web app action:', data.action);
      }
    } catch (error) {
      console.error('Error processing web app data:', error);
    }
  }

  async setWebhook(webhookUrl: string) {
    try {
      const response = await fetch(`${this.baseUrl}/setWebhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: webhookUrl,
          allowed_updates: ['message', 'callback_query'],
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to set webhook: ${response.status}`);
      }

      const result = await response.json();
      console.log('Webhook set successfully:', result);
      return result;
    } catch (error) {
      console.error('Error setting webhook:', error);
      throw error;
    }
  }

  async getMe() {
    try {
      const response = await fetch(`${this.baseUrl}/getMe`);
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error getting bot info:', error);
      throw error;
    }
  }
}

export const telegramBot = new TelegramBot();