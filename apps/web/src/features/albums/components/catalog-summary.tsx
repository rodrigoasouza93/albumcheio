'use client';

import type {
  AlbumSectionSummary,
  StickerSummary
} from '@web/lib/api/api-types';

interface CatalogSummaryProps {
  readonly sections: readonly AlbumSectionSummary[];
  readonly stickers: readonly StickerSummary[];
}

const getSectionStickers = (
  stickers: readonly StickerSummary[],
  sectionId: string
): readonly StickerSummary[] =>
  [...stickers]
    .filter((sticker) => sticker.sectionId === sectionId)
    .sort((first, second) => first.sortOrder - second.sortOrder);

export function CatalogSummary({ sections, stickers }: CatalogSummaryProps) {
  return (
    <div className="rounded-md border border-line bg-white shadow-sm">
      <div className="border-b border-line px-5 py-4">
        <h2 className="text-lg font-semibold">Catalog summary</h2>
        <p className="mt-1 text-sm text-slate-600">
          Review section and sticker codes before continuing registration.
        </p>
      </div>

      {sections.length === 0 ? (
        <div className="px-5 py-8">
          <h3 className="text-base font-semibold">No sections registered</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Create a section to start grouping stickers in this album.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-line">
          {sections.map((section) => {
            const sectionStickers = getSectionStickers(stickers, section.id);

            return (
              <section key={section.id} className="px-5 py-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="font-semibold">{section.name}</h3>
                    <p className="mt-1 text-sm text-slate-600">
                      Code{' '}
                      <span className="font-mono font-semibold text-ink">
                        {section.code}
                      </span>{' '}
                      · {section.kind}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-slate-600">
                    Order {section.sortOrder}
                  </span>
                </div>

                {sectionStickers.length === 0 ? (
                  <p className="mt-4 text-sm text-slate-600">
                    No stickers in this section yet.
                  </p>
                ) : (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {sectionStickers.map((sticker) => (
                      <span
                        key={sticker.id}
                        className="rounded border border-line bg-paper px-2 py-1 font-mono text-sm font-semibold text-ink"
                      >
                        {sticker.code}
                      </span>
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
