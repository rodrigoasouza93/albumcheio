'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useSession } from '../hooks/session-context';

interface AuthenticatedShellProps {
  readonly children: React.ReactNode;
}

export function AuthenticatedShell({ children }: AuthenticatedShellProps) {
  const router = useRouter();
  const { logout, session } = useSession();

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  return (
    <main className="min-h-screen bg-paper text-ink">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <Link
            className="text-lg font-semibold tracking-normal text-ink focus:outline-none focus:ring-2 focus:ring-ocean focus:ring-offset-2"
            href="/albums"
          >
            AlbumCheio
          </Link>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <p className="text-sm text-slate-600">
              Signed in as{' '}
              <span className="font-semibold text-ink">
                {session?.user.name ?? 'Collector'}
              </span>
            </p>
            <button
              type="button"
              className="min-h-11 rounded-md border border-line px-4 py-2 text-sm font-semibold text-ink transition hover:bg-paper focus:outline-none focus:ring-2 focus:ring-ocean focus:ring-offset-2"
              onClick={() => void handleLogout()}
            >
              Sign out
            </button>
          </div>
        </div>
      </header>
      {children}
    </main>
  );
}
