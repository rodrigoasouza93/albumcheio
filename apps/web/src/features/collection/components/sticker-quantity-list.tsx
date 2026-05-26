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
  readonly updatingStickerId: string | null;
  readonly onChangeSection: (sectionId: string) => void;
  readonly onSetQuantity: (stickerId: string, quantityTotal: number) => void;
}

const statusClasses: Record<CollectionSearchStatus, string> = {
  duplicate: 'border-amber-300 bg-amber-50 text-amber-950',
  missing: 'border-red-200 bg-red-50 text-red-900',
  not_found: 'border-slate-300 bg-slate-50 text-slate-800',
  owned: 'border-emerald-300 bg-emerald-50 text-emerald-950'
};

export function StickerQuantityList({
  sections,
  stickers,
  selectedSectionId,
  updatingStickerId,
  onChangeSection,
  onSetQuantity
}: StickerQuantityListProps) {
  const filteredStickers =
    selectedSectionId === 'all'
      ? stickers
      : stickers.filter((sticker) => sticker.sectionId === selectedSectionId);

  return (
    <section className="rounded-md border border-line bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-line px-5 py-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Sticker quantities</h2>
          <p className="mt-1 text-sm text-slate-600">
            Set total owned copies for each sticker.
          </p>
        </div>
        <label className="flex min-w-48 flex-col gap-2 text-sm font-medium">
          Section
          <select
            className="min-h-11 rounded-md border border-line bg-white px-3 py-2 text-sm outline-none transition focus:border-ocean focus:ring-2 focus:ring-ocean/25"
            value={selectedSectionId}
            onChange={(event) => onChangeSection(event.target.value)}
          >
            <option value="all">All sections</option>
            {sections.map((section) => (
              <option key={section.id} value={section.id}>
                {section.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="divide-y divide-line">
        {filteredStickers.length === 0 ? (
          <p className="px-5 py-6 text-sm text-slate-600">
            No stickers in this section.
          </p>
        ) : (
          filteredStickers.map((sticker) => (
            <article
              key={sticker.id}
              className="grid gap-3 px-5 py-4 sm:grid-cols-[1fr_auto] sm:items-center"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-mono text-base font-semibold">
                    {sticker.code}
                  </h3>
                  <span
                    className={`rounded border px-2 py-1 text-xs font-semibold ${statusClasses[sticker.status]}`}
                  >
                    {getStatusLabel(sticker.status)}
                  </span>
                  {updatingStickerId === sticker.id ? (
                    <span className="text-xs font-medium text-slate-600">
                      Updating...
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-sm text-slate-600">
                  {sticker.title ?? 'Untitled sticker'} · {sticker.sectionName}
                  {sticker.duplicateCount > 0
                    ? ` · ${sticker.duplicateCount} available to trade`
                    : ''}
                </p>
              </div>

              <label className="flex items-center gap-2 text-sm font-medium sm:justify-end">
                Quantity
                <input
                  className="h-11 w-24 rounded-md border border-line bg-white px-3 py-2 text-center text-base font-semibold outline-none transition focus:border-ocean focus:ring-2 focus:ring-ocean/25"
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
