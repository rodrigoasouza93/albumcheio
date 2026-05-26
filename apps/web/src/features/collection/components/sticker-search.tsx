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
    duplicate: 'border-amber-300 bg-amber-50 text-amber-950',
    missing: 'border-red-200 bg-red-50 text-red-900',
    not_found: 'border-slate-300 bg-slate-50 text-slate-800',
    owned: 'border-emerald-300 bg-emerald-50 text-emerald-950'
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
    <section className="rounded-md border border-line bg-white shadow-sm">
      <div className="border-b border-line px-5 py-4">
        <h2 className="text-lg font-semibold">Quick code lookup</h2>
        <p className="mt-1 text-sm text-slate-600">
          Check one sticker during buying or trading.
        </p>
      </div>

      <div className="px-5 py-5">
        <form
          className="flex flex-col gap-3 sm:flex-row"
          onSubmit={handleSubmit}
        >
          <label className="flex flex-1 flex-col gap-2 text-sm font-medium">
            Sticker code
            <input
              className="min-h-11 rounded-md border border-line bg-white px-3 py-2 font-mono text-base uppercase text-ink outline-none transition focus:border-ocean focus:ring-2 focus:ring-ocean/25"
              placeholder="BRA01"
              value={code}
              onChange={(event) => setCode(event.target.value.toUpperCase())}
            />
          </label>
          <button
            type="submit"
            className="min-h-11 rounded-md bg-ocean px-5 py-2 text-sm font-semibold text-white transition hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-ocean focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-400"
            disabled={isSearching || code.trim().length === 0}
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </form>

        {result ? (
          <div
            className={`mt-4 rounded-md border px-4 py-3 ${getResultClasses(
              result.status
            )}`}
            role={result.status === 'not_found' ? 'alert' : 'status'}
          >
            <p className="text-sm font-semibold">
              {getStatusLabel(result.status)} · {result.code}
            </p>
            {result.sticker ? (
              <p className="mt-1 text-sm">
                {result.sticker.title ?? 'Untitled sticker'} · quantity{' '}
                {result.quantityTotal} · repeated {result.duplicateCount}
              </p>
            ) : (
              <p className="mt-1 text-sm">
                This code does not exist in the album catalog.
              </p>
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
}
