export interface UserRegistrationPayload {
  id: string;
  email: string;
  firstName: string;
  lastName?: string;
  referredBy?: string;
}

export interface UserProfileResponse {
  user: {
    id: string;
    email: string | null;
    firstName: string | null;
    lastName: string | null;
    tokenBalance: string | null;
    dailySteps: number | null;
    referralCode: string | null;
  };
  stats: {
    actionsToday: number;
    rewardsToday: number;
  };
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Request failed');
  }
  return (await response.json()) as T;
}

export async function registerUser(payload: UserRegistrationPayload) {
  const response = await fetch('/api/users/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return handleResponse<{
    id: string;
    email: string | null;
    firstName: string | null;
    lastName: string | null;
    referralCode: string | null;
  }>(response);
}

export async function getUserProfile(userId: string): Promise<UserProfileResponse | null> {
  const response = await fetch(`/api/users/${encodeURIComponent(userId)}/profile`);
  if (response.status === 404) {
    return null;
  }
  return handleResponse<UserProfileResponse>(response);
}
