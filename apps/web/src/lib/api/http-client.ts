import type {
  AlbumDetail,
  AlbumPage,
  AlbumProgress,
  AlbumSectionSummary,
  AlbumSummary,
  AuthSession,
  CollectionItemSummary,
  CreateAlbumInput,
  CreateAlbumSectionInput,
  CreateStickerInput,
  DuplicateStickerPage,
  MissingStickerPage,
  StickerPage,
  StickerCollectionStatus,
  StickerSummary,
  UserProfile
} from './api-types';

interface RequestOptions {
  readonly method?: 'GET' | 'POST' | 'PATCH';
  readonly token?: string;
  readonly body?: unknown;
  readonly query?: Readonly<Record<string, string | number | undefined>>;
}

interface ApiErrorBody {
  readonly message?: unknown;
  readonly errors?: unknown;
}

export class ApiError extends Error {
  public readonly status: number;

  public readonly details: readonly string[];

  public constructor(
    status: number,
    message: string,
    details: readonly string[]
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

const DEFAULT_API_BASE_URL = 'http://localhost:3001/api/v1';

const getApiBaseUrl = (): string =>
  process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL;

const buildUrl = (path: string, query?: RequestOptions['query']): string => {
  const url = new URL(`${getApiBaseUrl()}${path}`);

  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  });

  return url.toString();
};

const isApiErrorBody = (value: unknown): value is ApiErrorBody =>
  Boolean(value) && typeof value === 'object';

const getErrorDetails = (body: unknown): readonly string[] => {
  if (!isApiErrorBody(body)) {
    return [];
  }

  if (Array.isArray(body.errors)) {
    return body.errors.filter(
      (error): error is string => typeof error === 'string'
    );
  }

  return [];
};

const getErrorMessage = (body: unknown, status: number): string => {
  if (!isApiErrorBody(body)) {
    return `A requisição falhou com status ${status}`;
  }

  if (typeof body.message === 'string') {
    return body.message;
  }

  return `A requisição falhou com status ${status}`;
};

const parseResponseBody = async (response: Response): Promise<unknown> => {
  const text = await response.text();

  if (text.length === 0) {
    return undefined;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
};

export const requestApi = async <ResponseBody>(
  path: string,
  options: RequestOptions = {}
): Promise<ResponseBody> => {
  const headers = new Headers({
    accept: 'application/json'
  });

  if (options.body !== undefined) {
    headers.set('content-type', 'application/json');
  }

  if (options.token) {
    headers.set('authorization', `Bearer ${options.token}`);
  }

  const response = await fetch(buildUrl(path, options.query), {
    method: options.method ?? 'GET',
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body)
  });
  const body = await parseResponseBody(response);

  if (!response.ok) {
    throw new ApiError(
      response.status,
      getErrorMessage(body, response.status),
      getErrorDetails(body)
    );
  }

  return body as ResponseBody;
};

export const registerUser = (input: {
  readonly name: string;
  readonly email: string;
  readonly password: string;
}): Promise<AuthSession> =>
  requestApi<AuthSession>('/auth/register', {
    method: 'POST',
    body: input
  });

export const loginUser = (input: {
  readonly email: string;
  readonly password: string;
}): Promise<AuthSession> =>
  requestApi<AuthSession>('/auth/login', {
    method: 'POST',
    body: input
  });

export const logoutUser = (
  token: string
): Promise<{ readonly success: true }> =>
  requestApi<{ readonly success: true }>('/auth/logout', {
    method: 'POST',
    token
  });

export const getAuthenticatedProfile = (token: string): Promise<UserProfile> =>
  requestApi<UserProfile>('/me', {
    token
  });

export const listAlbums = (input: {
  readonly token: string;
  readonly limit: number;
  readonly offset: number;
}): Promise<AlbumPage> =>
  requestApi<AlbumPage>('/albums', {
    token: input.token,
    query: {
      limit: input.limit,
      offset: input.offset
    }
  });

export const getAlbumDetail = (input: {
  readonly token: string;
  readonly albumId: string;
}): Promise<AlbumDetail> =>
  requestApi<AlbumDetail>(`/albums/${input.albumId}`, {
    token: input.token
  });

export const createAlbum = (input: {
  readonly token: string;
  readonly album: CreateAlbumInput;
}): Promise<AlbumSummary> =>
  requestApi<AlbumSummary>('/albums', {
    method: 'POST',
    token: input.token,
    body: input.album
  });

export const createAlbumSection = (input: {
  readonly token: string;
  readonly albumId: string;
  readonly section: CreateAlbumSectionInput;
}): Promise<AlbumSectionSummary> =>
  requestApi<AlbumSectionSummary>(`/albums/${input.albumId}/sections`, {
    method: 'POST',
    token: input.token,
    body: input.section
  });

export const listStickers = (input: {
  readonly token: string;
  readonly albumId: string;
  readonly limit: number;
  readonly offset: number;
}): Promise<StickerPage> =>
  requestApi<StickerPage>(`/albums/${input.albumId}/stickers`, {
    token: input.token,
    query: {
      limit: input.limit,
      offset: input.offset
    }
  });

export const createSticker = (input: {
  readonly token: string;
  readonly albumId: string;
  readonly sticker: CreateStickerInput;
}): Promise<StickerSummary> =>
  requestApi<StickerSummary>(`/albums/${input.albumId}/stickers`, {
    method: 'POST',
    token: input.token,
    body: input.sticker
  });

export const searchCollectionSticker = (input: {
  readonly token: string;
  readonly albumId: string;
  readonly code: string;
}): Promise<StickerCollectionStatus> =>
  requestApi<StickerCollectionStatus>(
    `/albums/${input.albumId}/collection/search`,
    {
      token: input.token,
      query: {
        code: input.code
      }
    }
  );

export const getAlbumProgress = (input: {
  readonly token: string;
  readonly albumId: string;
}): Promise<AlbumProgress> =>
  requestApi<AlbumProgress>(`/albums/${input.albumId}/progress`, {
    token: input.token
  });

export const listMissingStickers = (input: {
  readonly token: string;
  readonly albumId: string;
  readonly sectionId?: string;
  readonly limit: number;
  readonly offset: number;
}): Promise<MissingStickerPage> =>
  requestApi<MissingStickerPage>(`/albums/${input.albumId}/missing`, {
    token: input.token,
    query: {
      sectionId: input.sectionId,
      limit: input.limit,
      offset: input.offset
    }
  });

export const listDuplicateStickers = (input: {
  readonly token: string;
  readonly albumId: string;
  readonly sectionId?: string;
  readonly limit: number;
  readonly offset: number;
}): Promise<DuplicateStickerPage> =>
  requestApi<DuplicateStickerPage>(`/albums/${input.albumId}/duplicates`, {
    token: input.token,
    query: {
      sectionId: input.sectionId,
      limit: input.limit,
      offset: input.offset
    }
  });

export const setStickerQuantity = (input: {
  readonly token: string;
  readonly stickerId: string;
  readonly quantityTotal: number;
}): Promise<CollectionItemSummary> =>
  requestApi<CollectionItemSummary>(`/collection-items/${input.stickerId}`, {
    method: 'PATCH',
    token: input.token,
    body: {
      quantityTotal: input.quantityTotal
    }
  });
