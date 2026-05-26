import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { SessionProvider } from '../hooks/session-context';
import { AuthForm } from './auth-form';

const replaceMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: replaceMock
  })
}));

const authResponse = {
  user: {
    id: 'user-id',
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },
  session: {
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
    expiresIn: 3600,
    tokenType: 'bearer'
  }
};

describe('AuthForm', () => {
  afterEach(() => {
    localStorage.clear();
    window.history.replaceState(null, '', '/');
    replaceMock.mockClear();
    vi.restoreAllMocks();
  });

  it('shows validation messages before submitting login', async () => {
    render(
      <SessionProvider>
        <AuthForm />
      </SessionProvider>
    );

    fireEvent.click(screen.getAllByRole('button', { name: 'Sign in' })[1]);

    expect(
      await screen.findByText('Enter a valid email address.')
    ).toBeVisible();
    expect(screen.getByText('Password is required.')).toBeVisible();
  });

  it('creates an account and redirects to albums', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify(authResponse), {
          status: 200,
          headers: {
            'content-type': 'application/json'
          }
        })
      )
    );

    render(
      <SessionProvider>
        <AuthForm />
      </SessionProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));
    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'Ada Lovelace' }
    });
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'ada@example.com' }
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'strong-password' }
    });
    fireEvent.click(
      screen.getAllByRole('button', { name: 'Create account' })[1]
    );

    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith('/albums'));
    expect(localStorage.getItem('albumcheio.session')).toContain(
      'access-token'
    );
  });

  it('stores the Supabase redirect session after email confirmation', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            id: 'user-id',
            name: 'Ada Lovelace',
            email: 'ada@example.com',
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-01T00:00:00.000Z'
          }),
          {
            status: 200,
            headers: {
              'content-type': 'application/json'
            }
          }
        )
      )
    );
    window.history.pushState(
      null,
      '',
      '/#access_token=redirect-access&refresh_token=redirect-refresh&expires_in=3600&token_type=bearer&type=signup'
    );

    render(
      <SessionProvider>
        <AuthForm />
      </SessionProvider>
    );

    await waitFor(() =>
      expect(localStorage.getItem('albumcheio.session')).toContain(
        'redirect-access'
      )
    );
    expect(window.location.hash).toBe('');
  });
});
