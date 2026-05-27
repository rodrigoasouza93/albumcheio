'use client';

import { useCallback, useMemo, useState } from 'react';

import type {
  AlbumProgress,
  AlbumSectionSummary,
  CollectionStickerSummary,
  DuplicateStickerSummary,
  MissingStickerSummary,
  StickerCollectionStatus
} from '@web/lib/api/api-types';
import {
  ApiError,
  getAlbumProgress,
  listCollectionStickers,
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
  getDuplicateCount,
  getStickerStatus
} from '../lib/collection-status';

interface CollectionDashboardProps {
  readonly albumId: string;
  readonly initialProgress: AlbumProgress;
  readonly sections: readonly AlbumSectionSummary[];
  readonly token: string;
  readonly onUnauthorized: () => void;
}

const SUMMARY_PAGE_LIMIT = 100;
const COLLECTION_STICKER_PAGE_LIMIT = 100;

const getCollectionErrorMessage = (error: unknown): string => {
  if (error instanceof ApiError) {
    return error.message;
  }

  return 'Não foi possível carregar os dados da coleção. Tente novamente.';
};

const getSectionIdQuery = (sectionId: string): string | undefined =>
  sectionId === 'all' ? undefined : sectionId;

const listMissingStickerPage = async (input: {
  readonly albumId: string;
  readonly sectionId?: string;
  readonly token: string;
}): Promise<readonly MissingStickerSummary[]> => {
  const missingPage = await listMissingStickers({
    token: input.token,
    albumId: input.albumId,
    sectionId: input.sectionId,
    limit: SUMMARY_PAGE_LIMIT,
    offset: 0
  });

  return missingPage.items;
};

const listDuplicateStickerPage = async (input: {
  readonly albumId: string;
  readonly sectionId?: string;
  readonly token: string;
}): Promise<readonly DuplicateStickerSummary[]> => {
  const duplicatePage = await listDuplicateStickers({
    token: input.token,
    albumId: input.albumId,
    sectionId: input.sectionId,
    limit: SUMMARY_PAGE_LIMIT,
    offset: 0
  });

  return duplicatePage.items;
};

export function CollectionDashboard({
  albumId,
  initialProgress,
  sections,
  token,
  onUnauthorized
}: CollectionDashboardProps) {
  const [progressOverride, setProgressOverride] = useState<AlbumProgress | null>(
    null
  );
  const [missing, setMissing] = useState<readonly MissingStickerSummary[]>([]);
  const [duplicates, setDuplicates] = useState<
    readonly DuplicateStickerSummary[]
  >([]);
  const [collectionStickers, setCollectionStickers] = useState<
    readonly CollectionStickerSummary[]
  >([]);
  const [status, setStatus] = useState<'ready' | 'error'>('ready');
  const [quantityStatus, setQuantityStatus] = useState<
    'idle' | 'loading' | 'ready'
  >('idle');
  const [summaryStatus, setSummaryStatus] = useState<
    'idle' | 'loading' | 'ready'
  >('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [searchStatus, setSearchStatus] = useState<'idle' | 'searching'>(
    'idle'
  );
  const [searchResult, setSearchResult] =
    useState<StickerCollectionStatus | null>(null);
  const [quantitySectionId, setQuantitySectionId] = useState('');
  const [summarySectionId, setSummarySectionId] = useState('');
  const [updatingStickerId, setUpdatingStickerId] = useState<string | null>(
    null
  );

  const refreshSummary = useCallback(
    async (sectionId: string) => {
      setSummaryStatus('loading');
      const [albumProgress, missingPage, duplicatePage] = await Promise.all([
        getAlbumProgress({ token, albumId }),
        listMissingStickerPage({
          token,
          albumId,
          sectionId: getSectionIdQuery(sectionId)
        }),
        listDuplicateStickerPage({
          token,
          albumId,
          sectionId: getSectionIdQuery(sectionId)
        })
      ]);

      setProgressOverride(albumProgress);
      setMissing(missingPage);
      setDuplicates(duplicatePage);
      setSummaryStatus('ready');
    },
    [albumId, token]
  );

  const progress = progressOverride ?? initialProgress;

  const stickerViews = useMemo(
    () => {
      const sectionNames = new Map(
        sections.map((section) => [section.id, section.name] as const)
      );

      return collectionStickers.map((sticker) => ({
        ...sticker,
        sectionName:
          sectionNames.get(sticker.sectionId) ?? 'Seção não atribuída'
      }));
    },
    [collectionStickers, sections]
  );

  const loadQuantitySection = async (sectionId: string) => {
    setQuantitySectionId(sectionId);
    setQuantityStatus('loading');
    setCollectionStickers([]);
    setErrorMessage('');

    try {
      const stickerPage = await listCollectionStickers({
        token,
        albumId,
        sectionId: getSectionIdQuery(sectionId),
        limit: COLLECTION_STICKER_PAGE_LIMIT,
        offset: 0
      });

      setCollectionStickers(stickerPage.items);
      setQuantityStatus('ready');
      setStatus('ready');
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        onUnauthorized();
        return;
      }

      setErrorMessage(getCollectionErrorMessage(error));
      setStatus('error');
      setQuantityStatus('idle');
    }
  };

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
    setMissing([]);
    setDuplicates([]);
    void refreshSummary(sectionId).catch((error: unknown) => {
      if (error instanceof ApiError && error.status === 401) {
        onUnauthorized();
        return;
      }

      setErrorMessage(getCollectionErrorMessage(error));
      setStatus('error');
      setSummaryStatus('idle');
    });
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
      setCollectionStickers((currentStickers) =>
        currentStickers.map((sticker) =>
          sticker.id === stickerId
            ? {
                ...sticker,
                quantityTotal: item.quantityTotal,
                owned: item.owned,
                duplicateCount: item.duplicateCount,
                status: getStickerStatus(item.quantityTotal)
              }
            : sticker
        )
      );
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
      if (summarySectionId) {
        await refreshSummary(summarySectionId);
      } else {
        setProgressOverride(
          await getAlbumProgress({
            token,
            albumId
          })
        );
      }
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

  return (
    <div className="flex flex-col gap-6">
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
            onClick={() => setStatus('ready')}
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
            status={quantityStatus}
            stickers={stickerViews}
            updatingStickerId={updatingStickerId}
            onChangeSection={(sectionId) => void loadQuantitySection(sectionId)}
            onSetQuantity={(stickerId, quantityTotal) =>
              void handleSetQuantity(stickerId, quantityTotal)
            }
          />
          <CollectionSummaryLists
            duplicates={duplicates}
            missing={missing}
            sections={sections}
            selectedSectionId={summarySectionId}
            status={summaryStatus}
            onChangeSection={handleChangeSummarySection}
          />
        </>
      ) : null}
    </div>
  );
}
