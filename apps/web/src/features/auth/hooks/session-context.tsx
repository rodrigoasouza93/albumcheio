'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';

import {
  getAuthenticatedProfile,
  loginUser,
  logoutUser,
  registerUser
} from '@web/lib/api/http-client';

import {
  clearStoredSession,
  mapAuthSession,
  readStoredSession,
  saveStoredSession
} from '../session-storage';
import type { StoredSession } from '../types/auth-session';

type SessionStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface RegisterInput {
  readonly name: string;
  readonly email: string;
  readonly password: string;
}

interface LoginInput {
  readonly email: string;
  readonly password: string;
}

interface SessionContextValue {
  readonly status: SessionStatus;
  readonly session: StoredSession | null;
  readonly register: (input: RegisterInput) => Promise<void>;
  readonly login: (input: LoginInput) => Promise<void>;
  readonly logout: () => Promise<void>;
  readonly clearSession: () => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

interface SessionProviderProps {
  readonly children: React.ReactNode;
}

export function SessionProvider({ children }: SessionProviderProps) {
  const [session, setSession] = useState<StoredSession | null>(() =>
    readStoredSession()
  );
  const [status, setStatus] = useState<SessionStatus>(() =>
    readStoredSession() ? 'loading' : 'unauthenticated'
  );

  const clearSession = useCallback(() => {
    clearStoredSession();
    setSession(null);
    setStatus('unauthenticated');
  }, []);

  useEffect(() => {
    const storedSession = readStoredSession();

    if (!storedSession) {
      return;
    }

    getAuthenticatedProfile(storedSession.accessToken)
      .then((user) => {
        const refreshedSession = {
          ...storedSession,
          user
        };

        saveStoredSession(refreshedSession);
        setSession(refreshedSession);
        setStatus('authenticated');
      })
      .catch(() => {
        clearSession();
      });
  }, [clearSession]);

  const register = useCallback(async (input: RegisterInput) => {
    const createdSession = mapAuthSession(await registerUser(input));

    saveStoredSession(createdSession);
    setSession(createdSession);
    setStatus('authenticated');
  }, []);

  const login = useCallback(async (input: LoginInput) => {
    const createdSession = mapAuthSession(await loginUser(input));

    saveStoredSession(createdSession);
    setSession(createdSession);
    setStatus('authenticated');
  }, []);

  const logout = useCallback(async () => {
    const activeToken = session?.accessToken;

    if (activeToken) {
      await logoutUser(activeToken).catch(() => undefined);
    }

    clearSession();
  }, [clearSession, session?.accessToken]);

  const value = useMemo<SessionContextValue>(
    () => ({
      status,
      session,
      register,
      login,
      logout,
      clearSession
    }),
    [clearSession, login, logout, register, session, status]
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export const useSession = (): SessionContextValue => {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error('useSession must be used within SessionProvider');
  }

  return context;
};
