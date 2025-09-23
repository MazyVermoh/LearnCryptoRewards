import type { User } from '@shared/schema';

const formatName = (user?: Pick<User, 'firstName' | 'lastName'>) => {
  if (!user) {
    return 'there';
  }
  const parts = [user.firstName, user.lastName].filter(Boolean);
  return parts.length ? parts.join(' ') : 'there';
};

export const quadrantMessages = {
  welcomeExisting: (user?: Pick<User, 'firstName' | 'lastName'>) =>
    `👋 Welcome back, ${formatName(user)}!\nUse /profile to view your Quadrant stats or /help to see available commands.`,

  welcomeNew: () =>
    "👋 Welcome to Quadrant!\nLet's set up your account — tap /register to get started.",

  registration: {
    askEmail: '📧 Please enter your email address to register.',
    askFirstName: '📝 Great! Now share your first name.',
    askLastName: '👤 Almost done. What is your last name? (Send "-" to skip)',
    invalidEmail: "⚠️ That doesn't look like a valid email. Please try again.",
    completed: (referralCode: string) =>
      `✅ Registration complete!\nYour referral code: <code>${referralCode}</code>\nUse /profile to see your stats.`,
    alreadyRegistered: 'ℹ️ You are already registered. Use /profile to view your account.',
  },

  profile: (payload: {
    user: Pick<User, 'firstName' | 'lastName' | 'tokenBalance' | 'dailySteps' | 'referralCode'>;
    totalActions: number;
  }) => {
    const { user, totalActions } = payload;
    return (
      '🧭 <b>Quadrant Profile</b>\n\n' +
      `👤 Name: ${formatName(user)}\n` +
      `💰 Balance: ${user.tokenBalance ?? 0} QDR\n` +
      `🚶 Steps Today: ${user.dailySteps ?? 0}\n` +
      `⚡ Actions Today: ${totalActions}\n\n` +
      `🔗 Referral code: <code>${user.referralCode ?? 'N/A'}</code>`
    );
  },

  referral: (referralCode: string, referralLink?: string) =>
    [
      '👥 <b>Invite friends to Quadrant</b>',
      `Referral code: <code>${referralCode}</code>`,
      referralLink ? `Referral link: ${referralLink}` : null,
      'Share it and earn rewards together!',
    ]
      .filter(Boolean)
      .join('\n'),

  help: () =>
    'ℹ️ <b>Quadrant Bot Commands</b>\n\n' +
    '/register – create or update your account\n' +
    '/profile – view your stats and balance\n' +
    '/referral – get your referral code & link\n' +
    '/help – show this message',

  cooldown: '⏳ Please wait a little before repeating that action.',
  dailyLimit: '📉 Daily reward limit reached. Try again tomorrow.',
  invalidCommand: '🤖 I did not recognise that command. Use /help for available options.',
};
