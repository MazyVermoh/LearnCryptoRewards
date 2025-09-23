import { quadrantMessages } from './messages';
import { ensureReferralCode, registerUser } from '../../services/user.service';
import type { QuadrantContext } from './types';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

export function resetRegistration(ctx: QuadrantContext) {
  ctx.session.registration = undefined;
}

export function startRegistration(ctx: QuadrantContext) {
  ctx.session.registration = {
    step: 'email',
    payload: {
      referredBy: ctx.state.referralPayload,
    },
  };

  return ctx.reply(quadrantMessages.registration.askEmail);
}

export async function handleRegistrationResponse(ctx: QuadrantContext) {
  const registration = ctx.session.registration;
  if (!registration) {
    return false;
  }

  const message = ctx.message;
  if (!message || !('text' in message) || typeof message.text !== 'string') {
    return false;
  }
  const text = message.text.trim();

  switch (registration.step) {
    case 'email': {
      if (!emailPattern.test(text)) {
        await ctx.reply(quadrantMessages.registration.invalidEmail);
        return true;
      }

      registration.payload.email = text.toLowerCase();
      registration.step = 'firstName';
      await ctx.reply(quadrantMessages.registration.askFirstName);
      return true;
    }

    case 'firstName': {
      registration.payload.firstName = text;
      registration.step = 'lastName';
      await ctx.reply(quadrantMessages.registration.askLastName);
      return true;
    }

    case 'lastName': {
      registration.payload.lastName = text === '-' ? undefined : text;
      const { email, firstName, lastName, referredBy } = registration.payload;

      if (!email || !firstName) {
        await ctx.reply('⚠️ Missing required registration data. Please restart /register.');
        resetRegistration(ctx);
        return true;
      }

      const user = await registerUser({
        id: ctx.state.userId ?? String(ctx.from?.id ?? ''),
        email,
        firstName,
        lastName,
        referredBy: referredBy && referredBy !== ctx.state.userId ? referredBy : undefined,
      });

      const referralCode = await ensureReferralCode(user.id);
      await ctx.reply(quadrantMessages.registration.completed(referralCode), {
        parse_mode: 'HTML',
      });
      resetRegistration(ctx);
      return true;
    }

    default:
      resetRegistration(ctx);
      return false;
  }
}
