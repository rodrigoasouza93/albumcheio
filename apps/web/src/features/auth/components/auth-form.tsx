'use client';

import { useRouter } from 'next/navigation';
import { type FormEvent, useMemo, useState } from 'react';

import { ApiError } from '@web/lib/api/http-client';

import { useSession } from '../hooks/session-context';

type AuthMode = 'login' | 'register';

const MIN_PASSWORD_LENGTH = 8;

const getErrorMessages = (error: unknown): readonly string[] => {
  if (error instanceof ApiError) {
    return error.details.length > 0 ? error.details : [error.message];
  }

  return ['Something went wrong. Please try again.'];
};

export function AuthForm() {
  const router = useRouter();
  const { login, register } = useSession();
  const [mode, setMode] = useState<AuthMode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<readonly string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isRegistering = mode === 'register';

  const title = useMemo(
    () => (isRegistering ? 'Create your account' : 'Sign in to your albums'),
    [isRegistering]
  );

  const validateForm = (): readonly string[] => [
    ...(isRegistering && name.trim().length === 0 ? ['Name is required.'] : []),
    ...(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
      ? []
      : ['Enter a valid email address.']),
    ...(password.length >= (isRegistering ? MIN_PASSWORD_LENGTH : 1)
      ? []
      : [
          isRegistering
            ? `Password must have at least ${MIN_PASSWORD_LENGTH} characters.`
            : 'Password is required.'
        ])
  ];

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationErrors = validateForm();

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors([]);

    try {
      if (isRegistering) {
        await register({
          name: name.trim(),
          email: email.trim(),
          password
        });
      } else {
        await login({
          email: email.trim(),
          password
        });
      }

      router.replace('/albums');
    } catch (error) {
      setErrors(getErrorMessages(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="w-full max-w-md rounded-md border border-line bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-6 flex rounded-md border border-line bg-paper p-1">
        <button
          type="button"
          className={`min-h-11 flex-1 rounded px-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-ocean focus:ring-offset-2 ${
            mode === 'login'
              ? 'bg-ink text-white'
              : 'text-slate-700 hover:bg-white'
          }`}
          onClick={() => {
            setMode('login');
            setErrors([]);
          }}
        >
          Sign in
        </button>
        <button
          type="button"
          className={`min-h-11 flex-1 rounded px-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-ocean focus:ring-offset-2 ${
            mode === 'register'
              ? 'bg-ink text-white'
              : 'text-slate-700 hover:bg-white'
          }`}
          onClick={() => {
            setMode('register');
            setErrors([]);
          }}
        >
          Create account
        </button>
      </div>

      <form
        className="flex flex-col gap-4"
        onSubmit={(event) => void handleSubmit(event)}
      >
        <div>
          <h1 className="text-2xl font-semibold tracking-normal text-ink">
            {title}
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Manage your sticker albums and keep your collection private.
          </p>
        </div>

        {isRegistering ? (
          <label className="flex flex-col gap-2 text-sm font-medium text-ink">
            Name
            <input
              className="min-h-11 rounded-md border border-line px-3 text-base font-normal text-ink outline-none transition focus:border-ocean focus:ring-2 focus:ring-ocean/20"
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </label>
        ) : null}

        <label className="flex flex-col gap-2 text-sm font-medium text-ink">
          Email
          <input
            className="min-h-11 rounded-md border border-line px-3 text-base font-normal text-ink outline-none transition focus:border-ocean focus:ring-2 focus:ring-ocean/20"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-ink">
          Password
          <input
            className="min-h-11 rounded-md border border-line px-3 text-base font-normal text-ink outline-none transition focus:border-ocean focus:ring-2 focus:ring-ocean/20"
            type="password"
            autoComplete={isRegistering ? 'new-password' : 'current-password'}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>

        {errors.length > 0 ? (
          <div
            className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
            role="alert"
          >
            <p className="font-semibold">Check the form</p>
            <ul className="mt-1 list-disc pl-5">
              {errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <button
          type="submit"
          className="min-h-11 rounded-md bg-ocean px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-ocean focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? 'Please wait...'
            : isRegistering
              ? 'Create account'
              : 'Sign in'}
        </button>
      </form>
    </section>
  );
}
