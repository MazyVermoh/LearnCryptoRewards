import { Markup } from 'telegraf';

export const buildQuadrantKeyboard = (webAppUrl?: string) => {
  if (!webAppUrl) {
    return undefined;
  }

  return Markup.inlineKeyboard([[Markup.button.webApp('🌐 Open Quadrant', webAppUrl)]]);
};
