import type { AuthSession } from '@web/lib/api/api-types';

import type { StoredSession } from './types/auth-session';

const SESSION_STORAGE_KEY = 'albumcheio.session';

export interface AuthRedirectSession {
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly expiresIn: number;
  readonly tokenType: string;
}

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

export const readAuthRedirectSession = (): AuthRedirectSession | null => {
  if (typeof window === 'undefined' || !window.location.hash) {
    return null;
  }

  const params = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  const accessToken = params.get('access_token');
  const refreshToken = params.get('refresh_token');
  const expiresIn = Number(params.get('expires_in'));
  const tokenType = params.get('token_type');

  if (!accessToken || !refreshToken || !expiresIn || !tokenType) {
    return null;
  }

  return {
    accessToken,
    refreshToken,
    expiresIn,
    tokenType
  };
};

export const clearAuthRedirectHash = (): void => {
  if (typeof window === 'undefined' || !window.location.hash) {
    return;
  }

  window.history.replaceState(
    null,
    document.title,
    `${window.location.pathname}${window.location.search}`
  );
};

export const saveStoredSession = (session: StoredSession): void => {
  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
};

export const clearStoredSession = (): void => {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
  }
};
