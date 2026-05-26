'use client';

import type { FormEvent } from 'react';
import { useState } from 'react';

import type { StickerCollectionStatus } from '@web/lib/api/api-types';

import { getStatusLabel } from '../lib/collection-status';

interface StickerSearchProps {
  readonly isSearching: boolean;
  readonly result: StickerCollectionStatus | null;
  readonly onSearch: (code: string) => Promise<void>;
}

const getResultClasses = (status: StickerCollectionStatus['status']) => {
  const classes: Record<StickerCollectionStatus['status'], string> = {
    duplicate: 'border-danger bg-danger text-white',
    missing: 'border-danger bg-danger text-white',
    not_found: 'border-slate-300 bg-slate-50 text-slate-800',
    owned: 'border-ocean bg-ocean text-white'
  };

  return classes[status];
};

export function StickerSearch({
  isSearching,
  result,
  onSearch
}: StickerSearchProps) {
  const [code, setCode] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void onSearch(code);
  };

  return (
    <section className="rounded-xl border border-line bg-white">
      <div className="border-b border-line px-5 py-4">
        <h2 className="text-lg font-semibold">Busca rápida por código</h2>
        <p className="mt-1 text-sm text-slate-600">
          Consulte uma figurinha durante compras ou trocas.
        </p>
      </div>

      <div className="px-5 py-5">
        <form
          className="flex flex-col gap-3 sm:flex-row"
          onSubmit={handleSubmit}
        >
          <label className="flex flex-1 flex-col gap-2 text-sm font-medium">
            Código da figurinha
            <input
              className="min-h-11 rounded-lg border border-line bg-white px-3 py-2 text-base font-semibold uppercase text-ink outline-none transition focus:border-ocean focus:ring-2 focus:ring-ocean/25"
              placeholder="BRA01"
              value={code}
              onChange={(event) => setCode(event.target.value.toUpperCase())}
            />
          </label>
          <button
            type="submit"
            className="min-h-11 rounded-lg bg-gold px-5 py-2 text-sm font-semibold text-dark transition hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-700"
            disabled={isSearching || code.trim().length === 0}
          >
            {isSearching ? 'Buscando...' : 'Buscar'}
          </button>
        </form>

        {result ? (
          <div
            className={`mt-4 rounded-xl border px-4 py-3 ${getResultClasses(
              result.status
            )}`}
            role={result.status === 'not_found' ? 'alert' : 'status'}
          >
            <p className="text-sm font-semibold">
              {getStatusLabel(result.status)} · {result.code}
            </p>
            {result.sticker ? (
              <p className="mt-1 text-sm">
                {result.sticker.title ?? 'Figurinha sem título'} · quantidade{' '}
                {result.quantityTotal} · repetidas {result.duplicateCount}
              </p>
            ) : (
              <p className="mt-1 text-sm">
                Este código não existe no catálogo do álbum.
              </p>
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
}
