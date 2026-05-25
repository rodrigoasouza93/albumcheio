'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { useSession } from '../hooks/session-context';

interface ProtectedRouteProps {
  readonly children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/');
    }
  }, [router, status]);

  if (status === 'loading') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-paper px-4 text-ink">
        <div className="rounded-md border border-line bg-white px-5 py-4 text-sm font-medium shadow-sm">
          Loading your session...
        </div>
      </main>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-paper px-4 text-ink">
        <div className="rounded-md border border-line bg-white px-5 py-4 text-sm font-medium shadow-sm">
          Redirecting to sign in...
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
