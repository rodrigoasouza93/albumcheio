'use client';

import type { AlbumProgress } from '@web/lib/api/api-types';

interface ProgressSummaryProps {
  readonly progress: AlbumProgress;
}

const formatPercentage = (percentage: number): string =>
  `${Math.round(percentage)}%`;

export function ProgressSummary({ progress }: ProgressSummaryProps) {
  return (
    <section className="rounded-xl border border-line bg-white">
      <div className="border-b border-line px-5 py-4">
        <h2 className="text-lg font-semibold">Progresso da coleção</h2>
        <p className="mt-1 text-sm text-slate-600">
          {progress.owned} tenho, {progress.missing} faltando de{' '}
          {progress.total} figurinhas.
        </p>
      </div>

      <div className="grid gap-4 px-5 py-5 lg:grid-cols-[220px_1fr]">
        <div>
          <p className="text-4xl font-bold text-dark">
            {formatPercentage(progress.percentage)}
          </p>
          <div
            className="mt-3 h-3 overflow-hidden rounded-full bg-slate-200"
            aria-label={`Progresso geral ${formatPercentage(
              progress.percentage
            )}`}
            role="img"
          >
            <div
              className="h-full rounded-full bg-ocean"
              style={{ width: `${Math.min(progress.percentage, 100)}%` }}
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {progress.sections.map((section) => (
            <article
              key={section.sectionId}
              className="rounded-xl border border-line bg-paper px-4 py-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold">
                    {section.sectionName}
                  </h3>
                  <p className="mt-1 text-xs font-semibold text-slate-600">
                    {section.sectionCode}
                  </p>
                </div>
                <p className="text-sm font-semibold">
                  {formatPercentage(section.percentage)}
                </p>
              </div>
              <p className="mt-3 text-xs text-slate-600">
                {section.owned}/{section.total} tenho · {section.missing}{' '}
                faltando
              </p>
              <div
                className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200"
                aria-label={`Progresso de ${section.sectionName} ${formatPercentage(
                  section.percentage
                )}`}
                role="img"
              >
                <div
                  className="h-full rounded-full bg-ocean"
                  style={{ width: `${Math.min(section.percentage, 100)}%` }}
                />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
