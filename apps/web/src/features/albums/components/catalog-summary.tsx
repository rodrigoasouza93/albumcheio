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

const getSectionKindLabel = (kind: AlbumSectionSummary['kind']): string => {
  const labels: Record<AlbumSectionSummary['kind'], string> = {
    custom: 'Personalizada',
    team: 'Time',
    tournament: 'Torneio'
  };

  return labels[kind];
};

export function CatalogSummary({ sections, stickers }: CatalogSummaryProps) {
  return (
    <div className="rounded-xl border border-line bg-white">
      <div className="border-b border-line px-5 py-4">
        <h2 className="text-lg font-semibold">Resumo do catálogo</h2>
        <p className="mt-1 text-sm text-slate-600">
          Revise os códigos das seções e figurinhas antes de continuar o
          cadastro.
        </p>
      </div>

      {sections.length === 0 ? (
        <div className="px-5 py-8">
          <h3 className="text-base font-semibold">Nenhuma seção cadastrada</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Crie uma seção para começar a agrupar figurinhas neste álbum.
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
                      Código{' '}
                      <span className="font-semibold text-ink">
                        {section.code}
                      </span>{' '}
                      · {getSectionKindLabel(section.kind)}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-slate-600">
                    Ordem {section.sortOrder}
                  </span>
                </div>

                {sectionStickers.length === 0 ? (
                  <p className="mt-4 text-sm text-slate-600">
                    Nenhuma figurinha nesta seção ainda.
                  </p>
                ) : (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {sectionStickers.map((sticker) => (
                      <span
                        key={sticker.id}
                        className="rounded-lg border border-line bg-paper px-2 py-1 text-sm font-semibold text-ink"
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
