'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

import { AuthenticatedShell } from '@web/features/auth/components/authenticated-shell';
import { ProtectedRoute } from '@web/features/auth/components/protected-route';
import { useSession } from '@web/features/auth/hooks/session-context';
import type { AlbumDetail } from '@web/lib/api/api-types';
import { ApiError, getAlbumDetail } from '@web/lib/api/http-client';

interface AlbumDetailPageProps {
  readonly albumId: string;
}

const getAlbumErrorMessage = (error: unknown): string => {
  if (error instanceof ApiError) {
    return error.message;
  }

  return 'Unable to load the album. Please try again.';
};

export function AlbumDetailPage({ albumId }: AlbumDetailPageProps) {
  const { clearSession, session } = useSession();
  const accessToken = session?.accessToken;
  const [album, setAlbum] = useState<AlbumDetail | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>(
    'loading'
  );
  const [errorMessage, setErrorMessage] = useState('');

  const loadAlbum = useCallback(async () => {
    if (!accessToken) {
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      const albumDetail = await getAlbumDetail({
        token: accessToken,
        albumId
      });

      setAlbum(albumDetail);
      setStatus('ready');
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        clearSession();
        return;
      }

      setErrorMessage(getAlbumErrorMessage(error));
      setStatus('error');
    }
  }, [accessToken, albumId, clearSession]);

  useEffect(() => {
    void Promise.resolve().then(loadAlbum);
  }, [loadAlbum]);

  return (
    <ProtectedRoute>
      <AuthenticatedShell>
        <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4">
            <Link
              className="w-fit text-sm font-semibold text-ocean focus:outline-none focus:ring-2 focus:ring-ocean focus:ring-offset-2"
              href="/albums"
            >
              Back to albums
            </Link>

            {status === 'ready' && album ? (
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ocean">
                  Album detail
                </p>
                <h1 className="mt-2 text-3xl font-semibold tracking-normal">
                  {album.name}
                </h1>
                <p className="mt-2 text-sm text-slate-600">
                  {album.edition ?? 'No edition informed'}
                </p>
                {album.description ? (
                  <p className="mt-4 max-w-3xl text-base leading-7 text-slate-700">
                    {album.description}
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>

          {status === 'loading' ? (
            <div
              className="rounded-md border border-line bg-white px-5 py-6 text-sm text-slate-700 shadow-sm"
              role="status"
            >
              Loading album details...
            </div>
          ) : null}

          {status === 'error' ? (
            <div
              className="rounded-md border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800"
              role="alert"
            >
              <p className="font-semibold">Album could not be loaded</p>
              <p className="mt-1">{errorMessage}</p>
              <button
                type="button"
                className="mt-4 min-h-11 rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-800 transition hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-700 focus:ring-offset-2"
                onClick={() => void loadAlbum()}
              >
                Try again
              </button>
            </div>
          ) : null}

          {status === 'ready' && album ? (
            <div className="rounded-md border border-line bg-white shadow-sm">
              <div className="border-b border-line px-5 py-4">
                <h2 className="text-lg font-semibold">Sections</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Registered groups available for this album.
                </p>
              </div>

              {album.sections.length === 0 ? (
                <div className="px-5 py-8">
                  <h3 className="text-base font-semibold">
                    No sections registered
                  </h3>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                    Add sections through the API before stickers can be grouped
                    in this album.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-line">
                  {album.sections.map((section) => (
                    <div
                      key={section.id}
                      className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <h3 className="font-semibold">{section.name}</h3>
                        <p className="mt-1 text-sm text-slate-600">
                          Code {section.code} · {section.kind}
                        </p>
                      </div>
                      <span className="text-sm font-medium text-slate-600">
                        Order {section.sortOrder}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </section>
      </AuthenticatedShell>
    </ProtectedRoute>
  );
}
