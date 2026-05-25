import { SupabaseApiError } from './supabase-api.error.js';
import type {
  SupabaseAuthPayload,
  SupabaseAuthUserPayload,
  SupabaseProfileRow
} from './supabase.types.js';

type HttpMethod = 'GET' | 'POST';

interface SupabaseRequestOptions {
  readonly method: HttpMethod;
  readonly path: string;
  readonly body?: unknown;
  readonly accept?: string;
  readonly prefer?: string;
}

interface SupabaseClientOptions {
  readonly baseUrl: string;
  readonly apiKey: string;
  readonly authorizationToken: string;
}

const JSON_CONTENT_TYPE = 'application/json';

export class SupabaseClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly authorizationToken: string;

  public constructor(options: SupabaseClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, '');
    this.apiKey = options.apiKey;
    this.authorizationToken = options.authorizationToken;
  }

  public async signUp(input: {
    readonly email: string;
    readonly password: string;
    readonly name: string;
  }): Promise<SupabaseAuthPayload> {
    return this.request<SupabaseAuthPayload>({
      method: 'POST',
      path: '/auth/v1/signup',
      body: {
        email: input.email,
        password: input.password,
        data: {
          name: input.name
        }
      }
    });
  }

  public async signInWithPassword(input: {
    readonly email: string;
    readonly password: string;
  }): Promise<SupabaseAuthPayload> {
    return this.request<SupabaseAuthPayload>({
      method: 'POST',
      path: '/auth/v1/token?grant_type=password',
      body: {
        email: input.email,
        password: input.password
      }
    });
  }

  public async signOut(): Promise<void> {
    await this.request<void>({
      method: 'POST',
      path: '/auth/v1/logout'
    });
  }

  public async getAuthenticatedUser(): Promise<SupabaseAuthUserPayload> {
    return this.request<SupabaseAuthUserPayload>({
      method: 'GET',
      path: '/auth/v1/user'
    });
  }

  public async insertProfile(input: {
    readonly id: string;
    readonly name: string;
  }): Promise<SupabaseProfileRow> {
    const profiles = await this.request<readonly SupabaseProfileRow[]>({
      method: 'POST',
      path: '/rest/v1/profiles',
      body: {
        id: input.id,
        name: input.name
      },
      prefer: 'return=representation'
    });

    return this.requireSingleProfile(profiles);
  }

  public async getProfile(userId: string): Promise<SupabaseProfileRow> {
    const query = new URLSearchParams({
      id: `eq.${userId}`,
      select: 'id,name,created_at,updated_at'
    });
    const profiles = await this.request<readonly SupabaseProfileRow[]>({
      method: 'GET',
      path: `/rest/v1/profiles?${query.toString()}`
    });

    return this.requireSingleProfile(profiles);
  }

  private requireSingleProfile(
    profiles: readonly SupabaseProfileRow[]
  ): SupabaseProfileRow {
    const profile = profiles.at(0);

    if (!profile) {
      throw new SupabaseApiError(404, 'Profile not found');
    }

    return profile;
  }

  private async request<T>(options: SupabaseRequestOptions): Promise<T> {
    const response = await fetch(`${this.baseUrl}${options.path}`, {
      method: options.method,
      headers: this.createHeaders(options),
      body:
        options.body === undefined ? undefined : JSON.stringify(options.body)
    });

    if (!response.ok) {
      throw await this.createError(response);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  }

  private createHeaders(
    options: SupabaseRequestOptions
  ): Record<string, string> {
    return {
      apikey: this.apiKey,
      Authorization: `Bearer ${this.authorizationToken}`,
      Accept: options.accept ?? JSON_CONTENT_TYPE,
      'Content-Type': JSON_CONTENT_TYPE,
      ...(options.prefer ? { Prefer: options.prefer } : {})
    };
  }

  private async createError(response: Response): Promise<SupabaseApiError> {
    const payload = await this.readErrorPayload(response);
    const message = this.getErrorMessage(payload) ?? response.statusText;
    const code = this.getErrorCode(payload);

    return new SupabaseApiError(response.status, message, code);
  }

  private async readErrorPayload(response: Response): Promise<unknown> {
    const contentType = response.headers.get('content-type') ?? '';

    if (contentType.includes(JSON_CONTENT_TYPE)) {
      return response.json();
    }

    return response.text();
  }

  private getErrorMessage(payload: unknown): string | undefined {
    if (typeof payload === 'string') {
      return payload;
    }

    if (!payload || typeof payload !== 'object') {
      return undefined;
    }

    const record = payload as Record<string, unknown>;
    const message = record.message ?? record.error_description ?? record.msg;

    return typeof message === 'string' ? message : undefined;
  }

  private getErrorCode(payload: unknown): string | undefined {
    if (!payload || typeof payload !== 'object') {
      return undefined;
    }

    const code = (payload as Record<string, unknown>).code;

    return typeof code === 'string' ? code : undefined;
  }
}
