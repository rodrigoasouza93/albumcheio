import type { AuthSession } from '@web/lib/api/api-types';

import type { StoredSession } from './types/auth-session';

const SESSION_STORAGE_KEY = 'albumcheio.session';

export const mapAuthSession = (session: AuthSession): StoredSession => ({
  accessToken: session.session.accessToken,
  refreshToken: session.session.refreshToken,
  expiresIn: session.session.expiresIn,
  tokenType: session.session.tokenType,
  user: session.user
});

export const readStoredSession = (): StoredSession | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  const rawSession = window.localStorage.getItem(SESSION_STORAGE_KEY);

  if (!rawSession) {
    return null;
  }

  try {
    return JSON.parse(rawSession) as StoredSession;
  } catch {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    return null;
  }
};

export const saveStoredSession = (session: StoredSession): void => {
  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
};

export const clearStoredSession = (): void => {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
  }
};
