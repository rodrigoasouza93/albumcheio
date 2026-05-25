'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { AuthForm } from './auth-form';
import { useSession } from '../hooks/session-context';

export function AuthPage() {
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/albums');
    }
  }, [router, status]);

  return (
    <main className="min-h-screen bg-paper px-4 py-8 text-ink sm:px-6 lg:px-8">
      <section className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center gap-8 lg:grid-cols-[1fr_28rem]">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ocean">
            AlbumCheio
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-normal sm:text-5xl">
            Your sticker album, kept current.
          </h1>
          <p className="mt-5 text-base leading-7 text-slate-700">
            Sign in to browse registered albums, open album details, and keep
            collection data tied to your account.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {['Private records', 'Album catalog', 'Fast mobile access'].map(
              (item) => (
                <div
                  key={item}
                  className="rounded-md border border-line bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm"
                >
                  {item}
                </div>
              )
            )}
          </div>
        </div>

        {status === 'loading' ? (
          <div
            className="rounded-md border border-line bg-white p-6 text-sm text-slate-700 shadow-sm"
            role="status"
          >
            Checking your session...
          </div>
        ) : (
          <AuthForm />
        )}
      </section>
    </main>
  );
}
