import type {
  AlbumSectionSummary,
  DuplicateStickerSummary,
  LoadCompleteShareListInput,
  MissingStickerSummary,
  ShareListExport,
  ShareListItem,
  ShareListKind
} from '@web/lib/api/api-types';
import {
  listDuplicateStickers,
  listMissingStickers
} from '@web/lib/api/http-client';

const SHARE_LIST_PAGE_LIMIT = 100;
const UNTITLED_STICKER = 'Figurinha sem título';
const UNASSIGNED_SECTION = 'Seção não atribuída';
const ALL_SECTIONS = 'Todas as seções';

type ShareListSticker = MissingStickerSummary | DuplicateStickerSummary;

const getKindLabel = (kind: ShareListKind): string =>
  kind === 'missing' ? 'Faltantes' : 'Repetidas';

const getSectionIdQuery = (sectionId: string): string | undefined =>
  sectionId === 'all' ? undefined : sectionId;

const getSectionName = (
  sectionId: string,
  sections: readonly AlbumSectionSummary[]
): string => {
  if (sectionId === 'all') {
    return ALL_SECTIONS;
  }

  return (
    sections.find((section) => section.id === sectionId)?.name ??
    UNASSIGNED_SECTION
  );
};

const createSectionNameMap = (
  sections: readonly AlbumSectionSummary[]
): ReadonlyMap<string, string> =>
  new Map(sections.map((section) => [section.id, section.name] as const));

const toShareListItem =
  (sectionNames: ReadonlyMap<string, string>) =>
  (sticker: ShareListSticker): ShareListItem => ({
    code: sticker.code,
    title: sticker.title ?? UNTITLED_STICKER,
    sectionName: sectionNames.get(sticker.sectionId) ?? UNASSIGNED_SECTION
  });

const loadMissingPage = async (input: {
  readonly token: string;
  readonly albumId: string;
  readonly sectionId?: string;
  readonly offset: number;
}): Promise<readonly MissingStickerSummary[]> => {
  const page = await listMissingStickers({
    token: input.token,
    albumId: input.albumId,
    sectionId: input.sectionId,
    limit: SHARE_LIST_PAGE_LIMIT,
    offset: input.offset
  });

  return page.items;
};

const loadDuplicatePage = async (input: {
  readonly token: string;
  readonly albumId: string;
  readonly sectionId?: string;
  readonly offset: number;
}): Promise<readonly DuplicateStickerSummary[]> => {
  const page = await listDuplicateStickers({
    token: input.token,
    albumId: input.albumId,
    sectionId: input.sectionId,
    limit: SHARE_LIST_PAGE_LIMIT,
    offset: input.offset
  });

  return page.items;
};

const loadShareListPage = (input: {
  readonly token: string;
  readonly albumId: string;
  readonly sectionId?: string;
  readonly kind: ShareListKind;
  readonly offset: number;
}): Promise<readonly ShareListSticker[]> => {
  if (input.kind === 'missing') {
    return loadMissingPage(input);
  }

  return loadDuplicatePage(input);
};

const loadAllShareListStickers = async (input: {
  readonly token: string;
  readonly albumId: string;
  readonly sectionId?: string;
  readonly kind: ShareListKind;
}): Promise<readonly ShareListSticker[]> => {
  const pages: ShareListSticker[][] = [];
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const items = await loadShareListPage({
      ...input,
      offset
    });

    pages.push([...items]);
    offset += SHARE_LIST_PAGE_LIMIT;
    hasMore = items.length === SHARE_LIST_PAGE_LIMIT;
  }

  return pages.flat();
};

export const loadCompleteShareList = async (
  input: LoadCompleteShareListInput
): Promise<ShareListExport> => {
  const stickers = await loadAllShareListStickers({
    token: input.token,
    albumId: input.albumId,
    sectionId: getSectionIdQuery(input.sectionId),
    kind: input.kind
  });
  const sectionNames = createSectionNameMap(input.sections);

  return {
    kind: input.kind,
    sectionName: getSectionName(input.sectionId, input.sections),
    items: stickers.map(toShareListItem(sectionNames)),
    generatedAt: new Date().toISOString()
  };
};

export const formatShareListText = (shareList: ShareListExport): string => {
  const header = [
    `Lista de figurinhas ${getKindLabel(shareList.kind).toLowerCase()}`,
    `Seção: ${shareList.sectionName}`,
    `Total: ${shareList.items.length}`
  ];
  const itemLines = shareList.items.map(
    (item) => `${item.code} - ${item.title} - ${item.sectionName}`
  );

  return [...header, '', ...itemLines].join('\n').trim();
};

const escapeHtml = (value: string): string =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

export const buildPrintableShareListHtml = (
  shareList: ShareListExport
): string => {
  const rows = shareList.items
    .map(
      (item) => `<tr>
        <td>${escapeHtml(item.code)}</td>
        <td>${escapeHtml(item.title)}</td>
        <td>${escapeHtml(item.sectionName)}</td>
      </tr>`
    )
    .join('');

  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Lista de figurinhas ${escapeHtml(getKindLabel(shareList.kind).toLowerCase())}</title>
    <style>
      body { color: #111827; font-family: Arial, sans-serif; margin: 32px; }
      h1 { font-size: 24px; margin: 0 0 8px; }
      p { margin: 0 0 20px; }
      table { border-collapse: collapse; width: 100%; }
      th, td { border-bottom: 1px solid #d1d5db; padding: 8px; text-align: left; }
      th { font-size: 12px; text-transform: uppercase; }
      @media print { body { margin: 18mm; } button { display: none; } }
    </style>
  </head>
  <body>
    <h1>Lista de figurinhas ${escapeHtml(getKindLabel(shareList.kind).toLowerCase())}</h1>
    <p>Seção: ${escapeHtml(shareList.sectionName)} · Total: ${shareList.items.length}</p>
    <table>
      <thead>
        <tr>
          <th>Código</th>
          <th>Nome</th>
          <th>Seção</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  </body>
</html>`;
};
