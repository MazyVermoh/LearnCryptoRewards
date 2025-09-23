const getEnv = (key: string, fallback?: string) => {
  const value = (import.meta.env as Record<string, string | undefined>)[key];
  if (typeof value === 'string' && value.length > 0) {
    return value;
  }
  return fallback;
};

export const webAppBaseUrl = getEnv('VITE_WEB_APP_BASE_URL', window.location.origin);
export const referralBaseUrl = getEnv('VITE_REFERRAL_BASE_URL', webAppBaseUrl);
