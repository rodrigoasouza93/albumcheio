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

  return ['Algo deu errado. Tente novamente.'];
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
    () => (isRegistering ? 'Crie sua conta' : 'Entre nos seus álbuns'),
    [isRegistering]
  );

  const validateForm = (): readonly string[] => [
    ...(isRegistering && name.trim().length === 0
      ? ['Nome é obrigatório.']
      : []),
    ...(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
      ? []
      : ['Informe um e-mail válido.']),
    ...(password.length >= (isRegistering ? MIN_PASSWORD_LENGTH : 1)
      ? []
      : [
          isRegistering
            ? `A senha deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`
            : 'Senha é obrigatória.'
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
    <section className="w-full max-w-md rounded-xl border border-line bg-white p-5 sm:p-6">
      <div className="mb-6 flex rounded-lg border border-line bg-paper p-1">
        <button
          type="button"
          className={`min-h-11 flex-1 rounded-lg px-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 ${
            mode === 'login'
              ? 'bg-dark text-white'
              : 'text-slate-700 hover:bg-white'
          }`}
          onClick={() => {
            setMode('login');
            setErrors([]);
          }}
        >
          Entrar
        </button>
        <button
          type="button"
          className={`min-h-11 flex-1 rounded-lg px-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 ${
            mode === 'register'
              ? 'bg-dark text-white'
              : 'text-slate-700 hover:bg-white'
          }`}
          onClick={() => {
            setMode('register');
            setErrors([]);
          }}
        >
          Criar conta
        </button>
      </div>

      <form
        className="flex flex-col gap-4"
        onSubmit={(event) => void handleSubmit(event)}
      >
        <div>
          <h1 className="text-2xl font-bold tracking-normal text-dark">
            {title}
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Gerencie seus álbuns de figurinhas e mantenha sua coleção privada.
          </p>
        </div>

        {isRegistering ? (
          <label className="flex flex-col gap-2 text-sm font-medium text-ink">
            Nome
            <input
              className="min-h-11 rounded-lg border border-line px-3 text-base font-normal text-ink outline-none transition focus:border-ocean focus:ring-2 focus:ring-ocean/20"
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </label>
        ) : null}

        <label className="flex flex-col gap-2 text-sm font-medium text-ink">
          Email
          <input
            className="min-h-11 rounded-lg border border-line px-3 text-base font-normal text-ink outline-none transition focus:border-ocean focus:ring-2 focus:ring-ocean/20"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-ink">
          Senha
          <input
            className="min-h-11 rounded-lg border border-line px-3 text-base font-normal text-ink outline-none transition focus:border-ocean focus:ring-2 focus:ring-ocean/20"
            type="password"
            autoComplete={isRegistering ? 'new-password' : 'current-password'}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>

        {errors.length > 0 ? (
          <div
            className="rounded-xl border border-danger bg-danger px-3 py-2 text-sm text-white"
            role="alert"
          >
            <p className="font-semibold">Revise o formulário</p>
            <ul className="mt-1 list-disc pl-5">
              {errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <button
          type="submit"
          className="min-h-11 rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-dark transition hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? 'Aguarde...'
            : isRegistering
              ? 'Criar conta'
              : 'Entrar'}
        </button>
      </form>
    </section>
  );
}
