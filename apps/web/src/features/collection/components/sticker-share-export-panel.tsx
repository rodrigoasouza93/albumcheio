'use client';

import { useState } from 'react';

import type {
  AlbumSectionSummary,
  ShareListExport,
  ShareListKind
} from '@web/lib/api/api-types';
import { ApiError } from '@web/lib/api/http-client';

import {
  buildPrintableShareListHtml,
  formatShareListText,
  loadCompleteShareList
} from '../lib/collection-share-export';

interface StickerShareExportPanelProps {
  readonly albumId: string;
  readonly token: string;
  readonly sections: readonly AlbumSectionSummary[];
  readonly selectedSectionId: string;
  readonly onUnauthorized: () => void;
}

const getExportErrorMessage = (error: unknown): string => {
  if (error instanceof ApiError) {
    return error.message;
  }

  return 'Não foi possível gerar a lista. Tente novamente.';
};

const printShareList = (shareList: ShareListExport): boolean => {
  const printWindow = window.open('', '_blank');

  if (!printWindow) {
    return false;
  }

  printWindow.document.open();
  printWindow.document.write(buildPrintableShareListHtml(shareList));
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();

  return true;
};

export function StickerShareExportPanel({
  albumId,
  token,
  sections,
  selectedSectionId,
  onUnauthorized
}: StickerShareExportPanelProps) {
  const [kind, setKind] = useState<ShareListKind>('missing');
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>(
    'idle'
  );
  const [copyStatus, setCopyStatus] = useState<
    'idle' | 'copied' | 'manual'
  >('idle');
  const [message, setMessage] = useState('');
  const [manualText, setManualText] = useState('');
  const isSectionSelected = Boolean(selectedSectionId);
  const isLoading = status === 'loading';
  const canExport = isSectionSelected && !isLoading;

  const loadShareList = async (): Promise<ShareListExport | null> => {
    if (!isSectionSelected) {
      setMessage('Selecione uma seção para exportar.');
      setStatus('error');
      return null;
    }

    setStatus('loading');
    setCopyStatus('idle');
    setMessage('');
    setManualText('');

    try {
      const shareList = await loadCompleteShareList({
        token,
        albumId,
        sectionId: selectedSectionId,
        kind,
        sections
      });

      setStatus('ready');
      return shareList;
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        onUnauthorized();
        return null;
      }

      setMessage(getExportErrorMessage(error));
      setStatus('error');
      return null;
    }
  };

  const handleCopy = async () => {
    const shareList = await loadShareList();

    if (!shareList) {
      return;
    }

    const text = formatShareListText(shareList);

    if (shareList.items.length === 0) {
      setMessage('Nenhuma figurinha encontrada para este filtro.');
      setManualText(text);
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus('copied');
      setMessage('Lista copiada para a área de transferência.');
    } catch {
      setCopyStatus('manual');
      setManualText(text);
      setMessage('Copie o texto manualmente pelo campo abaixo.');
    }
  };

  const handlePrint = async () => {
    const shareList = await loadShareList();

    if (!shareList) {
      return;
    }

    if (shareList.items.length === 0) {
      setMessage('Nenhuma figurinha encontrada para este filtro.');
      setManualText(formatShareListText(shareList));
      return;
    }

    if (!printShareList(shareList)) {
      setMessage('Não foi possível abrir a visualização de impressão.');
      setManualText(formatShareListText(shareList));
      setCopyStatus('manual');
      return;
    }

    setMessage('Visualização de impressão aberta.');
  };

  return (
    <div className="border-b border-line px-5 py-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-semibold">Exportar lista</legend>
          <div className="grid grid-cols-2 gap-1 rounded-lg border border-line bg-paper p-1 text-sm font-semibold">
            <label className="min-h-11 cursor-pointer">
              <input
                className="peer sr-only"
                type="radio"
                name="share-list-kind"
                value="missing"
                checked={kind === 'missing'}
                onChange={() => setKind('missing')}
              />
              <span className="flex h-full items-center justify-center rounded-md border border-transparent px-3 py-2 text-slate-600 transition peer-checked:border-dark peer-checked:bg-dark peer-checked:text-white peer-checked:shadow-sm peer-hover:bg-white peer-focus-visible:ring-2 peer-focus-visible:ring-ocean/30">
                Faltantes
              </span>
            </label>
            <label className="min-h-11 cursor-pointer">
              <input
                className="peer sr-only"
                type="radio"
                name="share-list-kind"
                value="duplicates"
                checked={kind === 'duplicates'}
                onChange={() => setKind('duplicates')}
              />
              <span className="flex h-full items-center justify-center rounded-md border border-transparent px-3 py-2 text-slate-600 transition peer-checked:border-dark peer-checked:bg-dark peer-checked:text-white peer-checked:shadow-sm peer-hover:bg-white peer-focus-visible:ring-2 peer-focus-visible:ring-ocean/30">
                Repetidas
              </span>
            </label>
          </div>
        </fieldset>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            className="min-h-11 rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-dark transition hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-700"
            disabled={!canExport}
            onClick={() => void handleCopy()}
          >
            {isLoading ? 'Gerando...' : 'Copiar lista'}
          </button>
          <button
            type="button"
            className="min-h-11 rounded-lg border border-line bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-paper focus:outline-none focus:ring-2 focus:ring-ocean/25 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
            disabled={!canExport}
            onClick={() => void handlePrint()}
          >
            Imprimir PDF
          </button>
        </div>
      </div>

      {!isSectionSelected ? (
        <p className="mt-3 text-sm text-slate-600">
          Selecione uma seção ou Todas as seções para exportar.
        </p>
      ) : null}

      {message ? (
        <p
          className="mt-3 text-sm text-slate-700"
          role={status === 'error' ? 'alert' : 'status'}
        >
          {message}
        </p>
      ) : null}

      {copyStatus === 'manual' || manualText ? (
        <label className="mt-3 flex flex-col gap-2 text-sm font-medium">
          Texto para cópia manual
          <textarea
            className="min-h-40 rounded-lg border border-line bg-white p-3 font-mono text-xs font-normal text-ink outline-none transition focus:border-ocean focus:ring-2 focus:ring-ocean/25"
            readOnly
            value={manualText}
            onFocus={(event) => event.target.select()}
          />
        </label>
      ) : null}
    </div>
  );
}
