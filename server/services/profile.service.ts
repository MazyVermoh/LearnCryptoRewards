import { ensureReferralCode, findUserById } from './user.service';
import { getTodayActionCount, getTodayRewardSum } from './activity.service';

export async function getUserProfile(userId: string) {
  const user = await findUserById(userId);
  if (!user) {
    return null;
  }

  const [actionsToday, rewardsToday, referralCode] = await Promise.all([
    getTodayActionCount(userId),
    getTodayRewardSum(userId),
    ensureReferralCode(userId),
  ]);

  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      tokenBalance: user.tokenBalance,
      dailySteps: user.dailySteps,
      referralCode,
    },
    stats: {
      actionsToday,
      rewardsToday,
    },
  };
}
