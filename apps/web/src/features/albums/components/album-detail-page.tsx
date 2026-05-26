'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

import { AuthenticatedShell } from '@web/features/auth/components/authenticated-shell';
import { ProtectedRoute } from '@web/features/auth/components/protected-route';
import { useSession } from '@web/features/auth/hooks/session-context';
import { CollectionDashboard } from '@web/features/collection/components/collection-dashboard';
import type {
  AlbumDetail,
  AlbumSectionSummary,
  CreateAlbumSectionInput,
  CreateStickerInput,
  StickerSummary
} from '@web/lib/api/api-types';
import {
  ApiError,
  createAlbumSection,
  createSticker,
  getAlbumDetail,
  listStickers
} from '@web/lib/api/http-client';

import { CatalogSummary } from './catalog-summary';
import { CreateSectionForm } from './create-section-form';
import { CreateStickerForm } from './create-sticker-form';

interface AlbumDetailPageProps {
  readonly albumId: string;
}

const getAlbumErrorMessage = (error: unknown): string => {
  if (error instanceof ApiError) {
    return error.message;
  }

  return 'Não foi possível carregar o álbum. Tente novamente.';
};

const STICKER_PAGE_LIMIT = 100;

const getNextSortOrder = (
  items: readonly { readonly sortOrder: number }[]
): number =>
  items.length === 0
    ? 10
    : Math.max(...items.map((item) => item.sortOrder)) + 10;

const listAllStickers = async (input: {
  readonly albumId: string;
  readonly offset?: number;
  readonly token: string;
}): Promise<readonly StickerSummary[]> => {
  const offset = input.offset ?? 0;
  const stickerPage = await listStickers({
    token: input.token,
    albumId: input.albumId,
    limit: STICKER_PAGE_LIMIT,
    offset
  });

  if (stickerPage.items.length < STICKER_PAGE_LIMIT) {
    return stickerPage.items;
  }

  return [
    ...stickerPage.items,
    ...(await listAllStickers({
      token: input.token,
      albumId: input.albumId,
      offset: offset + STICKER_PAGE_LIMIT
    }))
  ];
};

export function AlbumDetailPage({ albumId }: AlbumDetailPageProps) {
  const { clearSession, session } = useSession();
  const accessToken = session?.accessToken;
  const [album, setAlbum] = useState<AlbumDetail | null>(null);
  const [stickers, setStickers] = useState<readonly StickerSummary[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>(
    'loading'
  );
  const [sectionStatus, setSectionStatus] = useState<'idle' | 'submitting'>(
    'idle'
  );
  const [stickerStatus, setStickerStatus] = useState<'idle' | 'submitting'>(
    'idle'
  );
  const [errorMessage, setErrorMessage] = useState('');

  const loadAlbum = useCallback(async () => {
    if (!accessToken) {
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      const [albumDetail, loadedStickers] = await Promise.all([
        getAlbumDetail({
          token: accessToken,
          albumId
        }),
        listAllStickers({
          token: accessToken,
          albumId
        })
      ]);

      setAlbum(albumDetail);
      setStickers(loadedStickers);
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

  const handleCreateSection = async (
    input: CreateAlbumSectionInput
  ): Promise<AlbumSectionSummary> => {
    if (!accessToken) {
      throw new ApiError(401, 'Autenticação obrigatória.', []);
    }

    setSectionStatus('submitting');

    try {
      const section = await createAlbumSection({
        token: accessToken,
        albumId,
        section: input
      });

      setAlbum((currentAlbum) =>
        currentAlbum
          ? {
              ...currentAlbum,
              sections: [...currentAlbum.sections, section].sort(
                (first, second) => first.sortOrder - second.sortOrder
              )
            }
          : currentAlbum
      );

      return section;
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        clearSession();
      }

      throw error;
    } finally {
      setSectionStatus('idle');
    }
  };

  const handleCreateSticker = async (
    input: CreateStickerInput
  ): Promise<StickerSummary> => {
    if (!accessToken) {
      throw new ApiError(401, 'Autenticação obrigatória.', []);
    }

    setStickerStatus('submitting');

    try {
      const sticker = await createSticker({
        token: accessToken,
        albumId,
        sticker: input
      });

      setStickers((currentStickers) =>
        [...currentStickers, sticker].sort(
          (first, second) => first.sortOrder - second.sortOrder
        )
      );

      return sticker;
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        clearSession();
      }

      throw error;
    } finally {
      setStickerStatus('idle');
    }
  };

  return (
    <ProtectedRoute>
      <AuthenticatedShell>
        <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4">
            <Link
              className="w-fit text-sm font-semibold text-ocean focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2"
              href="/albums"
            >
              Voltar para álbuns
            </Link>

            {status === 'ready' && album ? (
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ocean">
                  Detalhes do álbum
                </p>
                <h1 className="mt-2 text-3xl font-bold tracking-normal text-dark">
                  {album.name}
                </h1>
                <p className="mt-2 text-sm text-slate-600">
                  {album.edition ?? 'Sem edição informada'}
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
              className="rounded-xl border border-line bg-white px-5 py-6 text-sm text-slate-700"
              role="status"
            >
              Carregando detalhes do álbum...
            </div>
          ) : null}

          {status === 'error' ? (
            <div
              className="rounded-xl border border-danger bg-danger px-5 py-4 text-sm text-white"
              role="alert"
            >
              <p className="font-semibold">Não foi possível carregar o álbum</p>
              <p className="mt-1">{errorMessage}</p>
              <button
                type="button"
                className="mt-4 min-h-11 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-danger transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-danger"
                onClick={() => void loadAlbum()}
              >
                Tentar novamente
              </button>
            </div>
          ) : null}

          {status === 'ready' && album ? (
            <>
              <div className="grid gap-6 lg:grid-cols-2">
                <CreateSectionForm
                  isDisabled={false}
                  isSubmitting={sectionStatus === 'submitting'}
                  nextSortOrder={getNextSortOrder(album.sections)}
                  onCreateSection={handleCreateSection}
                />
                <CreateStickerForm
                  isSubmitting={stickerStatus === 'submitting'}
                  nextSortOrder={getNextSortOrder(stickers)}
                  sections={album.sections}
                  onCreateSticker={handleCreateSticker}
                />
              </div>

              <CollectionDashboard
                albumId={albumId}
                sections={album.sections}
                stickers={stickers}
                token={accessToken ?? ''}
                onUnauthorized={clearSession}
              />

              <CatalogSummary sections={album.sections} stickers={stickers} />
            </>
          ) : null}
        </section>
      </AuthenticatedShell>
    </ProtectedRoute>
  );
}
