'use client';

import type {
  AlbumSectionSummary,
  CollectionSearchStatus
} from '@web/lib/api/api-types';

import type { StickerCollectionView } from '../lib/collection-status';
import { getStatusLabel } from '../lib/collection-status';

interface StickerQuantityListProps {
  readonly sections: readonly AlbumSectionSummary[];
  readonly stickers: readonly StickerCollectionView[];
  readonly selectedSectionId: string;
  readonly status: 'idle' | 'loading' | 'ready';
  readonly updatingStickerId: string | null;
  readonly onChangeSection: (sectionId: string) => void;
  readonly onSetQuantity: (stickerId: string, quantityTotal: number) => void;
}

const statusClasses: Record<CollectionSearchStatus, string> = {
  duplicate: 'border-danger bg-danger text-white',
  missing: 'border-danger bg-danger text-white',
  not_found: 'border-slate-300 bg-slate-50 text-slate-800',
  owned: 'border-ocean bg-ocean text-white'
};

const getFilteredStickers = (
  stickers: readonly StickerCollectionView[],
  selectedSectionId: string
): readonly StickerCollectionView[] => {
  if (!selectedSectionId) {
    return [];
  }

  return selectedSectionId === 'all'
    ? stickers
    : stickers.filter((sticker) => sticker.sectionId === selectedSectionId);
};

const getSortedSections = (
  sections: readonly AlbumSectionSummary[]
): readonly AlbumSectionSummary[] =>
  [...sections].sort(
    (left, right) =>
      left.sortOrder - right.sortOrder || left.name.localeCompare(right.name)
  );

export function StickerQuantityList({
  sections,
  stickers,
  selectedSectionId,
  status,
  updatingStickerId,
  onChangeSection,
  onSetQuantity
}: StickerQuantityListProps) {
  const filteredStickers = getFilteredStickers(stickers, selectedSectionId);
  const sortedSections = getSortedSections(sections);
  const isSelectionPending = !selectedSectionId;
  const isLoading = status === 'loading';

  return (
    <section className="rounded-xl border border-line bg-white">
      <div className="flex flex-col gap-3 border-b border-line px-5 py-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Quantidades de figurinhas</h2>
          <p className="mt-1 text-sm text-slate-600">
            Defina o total de cópias que você possui de cada figurinha.
          </p>
        </div>
        <label className="flex min-w-48 flex-col gap-2 text-sm font-medium">
          Seção
          <select
            className="min-h-11 rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none transition focus:border-ocean focus:ring-2 focus:ring-ocean/25"
            value={selectedSectionId}
            onChange={(event) => onChangeSection(event.target.value)}
          >
            <option value="">Selecione uma seção</option>
            {sortedSections.map((section) => (
              <option key={section.id} value={section.id}>
                {section.name}
              </option>
            ))}
            <option value="all">Todas as seções</option>
          </select>
        </label>
      </div>

      <div className="divide-y divide-line">
        {isLoading ? (
          <p className="px-5 py-6 text-sm text-slate-600" role="status">
            Carregando figurinhas da seção...
          </p>
        ) : isSelectionPending ? (
          <p className="px-5 py-6 text-sm text-slate-600">
            Selecione uma seção para carregar as figurinhas.
          </p>
        ) : filteredStickers.length === 0 ? (
          <p className="px-5 py-6 text-sm text-slate-600">
            Nenhuma figurinha encontrada neste filtro.
          </p>
        ) : (
          filteredStickers.map((sticker) => (
            <article
              key={sticker.id}
              className="grid gap-3 px-5 py-4 sm:grid-cols-[1fr_auto] sm:items-center"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-semibold">
                    {sticker.code}
                  </h3>
                  <span
                    className={`rounded-lg border px-2 py-1 text-xs font-semibold ${statusClasses[sticker.status]}`}
                  >
                    {getStatusLabel(sticker.status)}
                  </span>
                  {updatingStickerId === sticker.id ? (
                    <span className="text-xs font-medium text-slate-600">
                      Atualizando...
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-sm text-slate-600">
                  {sticker.title ?? 'Figurinha sem título'} ·{' '}
                  {sticker.sectionName}
                  {sticker.duplicateCount > 0
                    ? ` · ${sticker.duplicateCount} disponíveis para troca`
                    : ''}
                </p>
              </div>

              <label className="flex items-center gap-2 text-sm font-medium sm:justify-end">
                Quantidade
                <input
                  className="h-11 w-24 rounded-lg border border-line bg-white px-3 py-2 text-center text-base font-semibold outline-none transition focus:border-ocean focus:ring-2 focus:ring-ocean/25"
                  min={0}
                  type="number"
                  value={sticker.quantityTotal}
                  disabled={updatingStickerId === sticker.id}
                  onChange={(event) =>
                    onSetQuantity(sticker.id, Number(event.target.value))
                  }
                />
              </label>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
