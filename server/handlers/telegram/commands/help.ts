import { quadrantMessages } from '../messages';
import type { QuadrantMiddleware } from '../types';

export const handleHelpCommand: QuadrantMiddleware = async (ctx) => {
  await ctx.reply(quadrantMessages.help(), { parse_mode: 'HTML' });
};
