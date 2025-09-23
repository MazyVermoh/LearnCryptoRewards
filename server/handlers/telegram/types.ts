import type { Context, MiddlewareFn } from 'telegraf';

export interface QuadrantSessionState {
  registration?: {
    step: 'idle' | 'email' | 'firstName' | 'lastName';
    payload: {
      email?: string;
      firstName?: string;
      lastName?: string;
      referredBy?: string;
    };
  };
}

export type QuadrantContext = Context & {
  session: QuadrantSessionState;
  state: Context['state'] & {
    userId?: string;
    isAdmin?: boolean;
    referralPayload?: string;
  };
};

export type QuadrantMiddleware = MiddlewareFn<QuadrantContext>;
