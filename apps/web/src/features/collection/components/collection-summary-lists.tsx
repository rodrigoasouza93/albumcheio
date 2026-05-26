'use client';

import type {
  AlbumSectionSummary,
  DuplicateStickerSummary,
  MissingStickerSummary
} from '@web/lib/api/api-types';

interface CollectionSummaryListsProps {
  readonly duplicates: readonly DuplicateStickerSummary[];
  readonly missing: readonly MissingStickerSummary[];
  readonly sections: readonly AlbumSectionSummary[];
  readonly selectedSectionId: string;
  readonly onChangeSection: (sectionId: string) => void;
}

const getStickerLine = (
  sticker: MissingStickerSummary | DuplicateStickerSummary
) => `${sticker.code} · ${sticker.title ?? 'Untitled sticker'}`;

export function CollectionSummaryLists({
  duplicates,
  missing,
  sections,
  selectedSectionId,
  onChangeSection
}: CollectionSummaryListsProps) {
  return (
    <section className="rounded-md border border-line bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-line px-5 py-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Missing and repeated</h2>
          <p className="mt-1 text-sm text-slate-600">
            Short lists for shopping and face-to-face trading.
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

      <div className="grid gap-0 md:grid-cols-2 md:divide-x md:divide-line">
        <div className="px-5 py-4">
          <h3 className="text-base font-semibold">Missing</h3>
          {missing.length === 0 ? (
            <p className="mt-3 text-sm text-slate-600">
              No missing stickers in this filter.
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {missing.map((sticker) => (
                <li
                  key={sticker.id}
                  className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900"
                >
                  <span className="font-mono font-semibold">
                    {getStickerLine(sticker)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-line px-5 py-4 md:border-t-0">
          <h3 className="text-base font-semibold">Repeated</h3>
          {duplicates.length === 0 ? (
            <p className="mt-3 text-sm text-slate-600">
              No repeated stickers in this filter.
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {duplicates.map((sticker) => (
                <li
                  key={sticker.id}
                  className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-950"
                >
                  <span className="font-mono font-semibold">
                    {getStickerLine(sticker)}
                  </span>
                  <span className="ml-2 font-sans">
                    {sticker.duplicateCount} available
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
