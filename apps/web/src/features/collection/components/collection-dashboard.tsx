'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import type {
  AlbumProgress,
  AlbumSectionSummary,
  DuplicateStickerSummary,
  MissingStickerSummary,
  StickerCollectionStatus,
  StickerSummary
} from '@web/lib/api/api-types';
import {
  ApiError,
  getAlbumProgress,
  listDuplicateStickers,
  listMissingStickers,
  searchCollectionSticker,
  setStickerQuantity
} from '@web/lib/api/http-client';

import { CollectionSummaryLists } from './collection-summary-lists';
import { ProgressSummary } from './progress-summary';
import { StickerQuantityList } from './sticker-quantity-list';
import { StickerSearch } from './sticker-search';
import {
  createQuantityMap,
  createStickerViews,
  getDuplicateCount,
  getFallbackProgress,
  getStickerStatus
} from '../lib/collection-status';

interface CollectionDashboardProps {
  readonly albumId: string;
  readonly sections: readonly AlbumSectionSummary[];
  readonly stickers: readonly StickerSummary[];
  readonly token: string;
  readonly onUnauthorized: () => void;
}

const SUMMARY_PAGE_LIMIT = 100;

const getCollectionErrorMessage = (error: unknown): string => {
  if (error instanceof ApiError) {
    return error.message;
  }

  return 'Não foi possível carregar os dados da coleção. Tente novamente.';
};

const getSectionIdQuery = (sectionId: string): string | undefined =>
  sectionId === 'all' ? undefined : sectionId;

const listAllMissingStickers = async (input: {
  readonly albumId: string;
  readonly offset?: number;
  readonly sectionId?: string;
  readonly token: string;
}): Promise<readonly MissingStickerSummary[]> => {
  const offset = input.offset ?? 0;
  const missingPage = await listMissingStickers({
    token: input.token,
    albumId: input.albumId,
    sectionId: input.sectionId,
    limit: SUMMARY_PAGE_LIMIT,
    offset
  });

  if (missingPage.items.length < SUMMARY_PAGE_LIMIT) {
    return missingPage.items;
  }

  return [
    ...missingPage.items,
    ...(await listAllMissingStickers({
      token: input.token,
      albumId: input.albumId,
      sectionId: input.sectionId,
      offset: offset + SUMMARY_PAGE_LIMIT
    }))
  ];
};

const listAllDuplicateStickers = async (input: {
  readonly albumId: string;
  readonly offset?: number;
  readonly sectionId?: string;
  readonly token: string;
}): Promise<readonly DuplicateStickerSummary[]> => {
  const offset = input.offset ?? 0;
  const duplicatePage = await listDuplicateStickers({
    token: input.token,
    albumId: input.albumId,
    sectionId: input.sectionId,
    limit: SUMMARY_PAGE_LIMIT,
    offset
  });

  if (duplicatePage.items.length < SUMMARY_PAGE_LIMIT) {
    return duplicatePage.items;
  }

  return [
    ...duplicatePage.items,
    ...(await listAllDuplicateStickers({
      token: input.token,
      albumId: input.albumId,
      sectionId: input.sectionId,
      offset: offset + SUMMARY_PAGE_LIMIT
    }))
  ];
};

export function CollectionDashboard({
  albumId,
  sections,
  stickers,
  token,
  onUnauthorized
}: CollectionDashboardProps) {
  const [progress, setProgress] = useState<AlbumProgress>(
    getFallbackProgress(albumId, sections)
  );
  const [missing, setMissing] = useState<readonly MissingStickerSummary[]>([]);
  const [duplicates, setDuplicates] = useState<
    readonly DuplicateStickerSummary[]
  >([]);
  const [quantities, setQuantities] = useState<ReadonlyMap<string, number>>(
    new Map()
  );
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>(
    'loading'
  );
  const [errorMessage, setErrorMessage] = useState('');
  const [searchStatus, setSearchStatus] = useState<'idle' | 'searching'>(
    'idle'
  );
  const [searchResult, setSearchResult] =
    useState<StickerCollectionStatus | null>(null);
  const [quantitySectionId, setQuantitySectionId] = useState('all');
  const [summarySectionId, setSummarySectionId] = useState('all');
  const [updatingStickerId, setUpdatingStickerId] = useState<string | null>(
    null
  );

  const refreshSummary = useCallback(
    async (sectionId: string) => {
      const [albumProgress, missingPage, duplicatePage] = await Promise.all([
        getAlbumProgress({ token, albumId }),
        listAllMissingStickers({
          token,
          albumId,
          sectionId: getSectionIdQuery(sectionId)
        }),
        listAllDuplicateStickers({
          token,
          albumId,
          sectionId: getSectionIdQuery(sectionId)
        })
      ]);

      setProgress(albumProgress);
      setMissing(missingPage);
      setDuplicates(duplicatePage);
    },
    [albumId, token]
  );

  const loadCollection = useCallback(async () => {
    if (stickers.length === 0) {
      setProgress(getFallbackProgress(albumId, sections));
      setMissing([]);
      setDuplicates([]);
      setQuantities(new Map());
      setStatus('ready');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      const statuses = await Promise.all(
        stickers.map((sticker) =>
          searchCollectionSticker({
            token,
            albumId,
            code: sticker.code
          })
        )
      );

      setQuantities(createQuantityMap(statuses));
      await refreshSummary(summarySectionId);
      setStatus('ready');
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        onUnauthorized();
        return;
      }

      setErrorMessage(getCollectionErrorMessage(error));
      setStatus('error');
    }
  }, [
    albumId,
    onUnauthorized,
    refreshSummary,
    sections,
    stickers,
    summarySectionId,
    token
  ]);

  useEffect(() => {
    void Promise.resolve().then(loadCollection);
  }, [loadCollection]);

  const stickerViews = useMemo(
    () => createStickerViews({ sections, stickers, quantities }),
    [quantities, sections, stickers]
  );

  const handleSearch = async (code: string) => {
    setSearchStatus('searching');

    try {
      const result = await searchCollectionSticker({
        token,
        albumId,
        code: code.trim()
      });
      setSearchResult(result);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        onUnauthorized();
        return;
      }

      setSearchResult({
        albumId,
        code: code.trim().toUpperCase(),
        status: 'not_found',
        sticker: null,
        quantityTotal: 0,
        owned: false,
        duplicateCount: 0
      });
    } finally {
      setSearchStatus('idle');
    }
  };

  const handleChangeSummarySection = (sectionId: string) => {
    setSummarySectionId(sectionId);
    void refreshSummary(sectionId);
  };

  const handleSetQuantity = async (
    stickerId: string,
    quantityTotal: number
  ) => {
    if (!Number.isFinite(quantityTotal)) {
      return;
    }

    const normalizedQuantity = Math.max(0, Math.floor(quantityTotal));
    setUpdatingStickerId(stickerId);

    try {
      const item = await setStickerQuantity({
        token,
        stickerId,
        quantityTotal: normalizedQuantity
      });
      setQuantities((currentQuantities) => {
        const nextQuantities = new Map(currentQuantities);
        nextQuantities.set(stickerId, item.quantityTotal);

        return nextQuantities;
      });
      setSearchResult((currentResult) => {
        if (currentResult?.sticker?.id !== stickerId) {
          return currentResult;
        }

        return {
          ...currentResult,
          status: getStickerStatus(item.quantityTotal),
          quantityTotal: item.quantityTotal,
          owned: item.quantityTotal > 0,
          duplicateCount: getDuplicateCount(item.quantityTotal)
        };
      });
      await refreshSummary(summarySectionId);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        onUnauthorized();
        return;
      }

      setErrorMessage(getCollectionErrorMessage(error));
      setStatus('error');
    } finally {
      setUpdatingStickerId(null);
    }
  };

  if (stickers.length === 0) {
    return (
      <section className="rounded-xl border border-line bg-white px-5 py-6">
        <h2 className="text-lg font-semibold">Coleção</h2>
        <p className="mt-2 text-sm text-slate-600">
          Crie figurinhas antes de registrar quantidades.
        </p>
      </section>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {status === 'loading' ? (
        <div
          className="rounded-xl border border-line bg-white px-5 py-6 text-sm text-slate-700"
          role="status"
        >
          Carregando dados da coleção...
        </div>
      ) : null}

      {status === 'error' ? (
        <div
          className="rounded-xl border border-danger bg-danger px-5 py-4 text-sm text-white"
          role="alert"
        >
          <p className="font-semibold">Não foi possível carregar a coleção</p>
          <p className="mt-1">{errorMessage}</p>
          <button
            type="button"
            className="mt-4 min-h-11 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-danger transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-danger"
            onClick={() => void loadCollection()}
          >
            Tentar novamente
          </button>
        </div>
      ) : null}

      {status === 'ready' ? (
        <>
          <ProgressSummary progress={progress} />
          <StickerSearch
            isSearching={searchStatus === 'searching'}
            result={searchResult}
            onSearch={handleSearch}
          />
          <StickerQuantityList
            sections={sections}
            selectedSectionId={quantitySectionId}
            stickers={stickerViews}
            updatingStickerId={updatingStickerId}
            onChangeSection={setQuantitySectionId}
            onSetQuantity={(stickerId, quantityTotal) =>
              void handleSetQuantity(stickerId, quantityTotal)
            }
          />
          <CollectionSummaryLists
            duplicates={duplicates}
            missing={missing}
            sections={sections}
            selectedSectionId={summarySectionId}
            onChangeSection={handleChangeSummarySection}
          />
        </>
      ) : null}
    </div>
  );
}
