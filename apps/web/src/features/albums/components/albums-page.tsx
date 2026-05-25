'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

import { AuthenticatedShell } from '@web/features/auth/components/authenticated-shell';
import { ProtectedRoute } from '@web/features/auth/components/protected-route';
import { useSession } from '@web/features/auth/hooks/session-context';
import type { AlbumSummary } from '@web/lib/api/api-types';
import { ApiError, listAlbums } from '@web/lib/api/http-client';

const ALBUM_PAGE_LIMIT = 50;

const getAlbumsErrorMessage = (error: unknown): string => {
  if (error instanceof ApiError) {
    return error.message;
  }

  return 'Unable to load albums. Please try again.';
};

export function AlbumsPage() {
  const { clearSession, session } = useSession();
  const accessToken = session?.accessToken;
  const [albums, setAlbums] = useState<readonly AlbumSummary[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>(
    'loading'
  );
  const [errorMessage, setErrorMessage] = useState('');

  const loadAlbums = useCallback(async () => {
    if (!accessToken) {
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      const albumPage = await listAlbums({
        token: accessToken,
        limit: ALBUM_PAGE_LIMIT,
        offset: 0
      });

      setAlbums(albumPage.items);
      setStatus('ready');
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        clearSession();
        return;
      }

      setErrorMessage(getAlbumsErrorMessage(error));
      setStatus('error');
    }
  }, [accessToken, clearSession]);

  useEffect(() => {
    void Promise.resolve().then(loadAlbums);
  }, [loadAlbums]);

  return (
    <ProtectedRoute>
      <AuthenticatedShell>
        <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ocean">
                Albums
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-normal">
                Registered albums
              </h1>
            </div>
            <button
              type="button"
              className="min-h-11 rounded-md border border-line bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-ocean focus:ring-offset-2"
              onClick={() => void loadAlbums()}
            >
              Refresh
            </button>
          </div>

          {status === 'loading' ? (
            <div
              className="rounded-md border border-line bg-white px-5 py-6 text-sm text-slate-700 shadow-sm"
              role="status"
            >
              Loading albums...
            </div>
          ) : null}

          {status === 'error' ? (
            <div
              className="rounded-md border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800"
              role="alert"
            >
              <p className="font-semibold">Albums could not be loaded</p>
              <p className="mt-1">{errorMessage}</p>
            </div>
          ) : null}

          {status === 'ready' && albums.length === 0 ? (
            <div className="rounded-md border border-dashed border-line bg-white px-5 py-8 shadow-sm">
              <h2 className="text-lg font-semibold">No albums yet</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Albums created through the API will appear here. Once an album
                exists, open it to inspect the registered sections.
              </p>
            </div>
          ) : null}

          {status === 'ready' && albums.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2">
              {albums.map((album) => (
                <Link
                  key={album.id}
                  className="group rounded-md border border-line bg-white p-5 shadow-sm transition hover:border-ocean focus:outline-none focus:ring-2 focus:ring-ocean focus:ring-offset-2"
                  href={`/albums/${album.id}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-semibold text-ink">
                        {album.name}
                      </h2>
                      <p className="mt-1 text-sm text-slate-600">
                        {album.edition ?? 'No edition informed'}
                      </p>
                    </div>
                    <span className="rounded border border-line px-2 py-1 text-xs font-semibold uppercase text-slate-600">
                      {album.status}
                    </span>
                  </div>
                  {album.description ? (
                    <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">
                      {album.description}
                    </p>
                  ) : null}
                  <p className="mt-5 text-sm font-semibold text-ocean group-hover:text-teal-800">
                    Open album
                  </p>
                </Link>
              ))}
            </div>
          ) : null}
        </section>
      </AuthenticatedShell>
    </ProtectedRoute>
  );
}
