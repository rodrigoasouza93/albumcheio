import { Injectable } from '@nestjs/common';

type LogLevel = 'info' | 'error';

type LogSink = (line: string) => void;

interface RequestLogInput {
  readonly requestId: string;
  readonly method: string;
  readonly route: string;
  readonly statusCode: number;
  readonly durationMs: number;
  readonly userId?: string;
}

interface CatalogEventInput {
  readonly userId: string;
  readonly role: string;
  readonly resource: string;
  readonly action: string;
  readonly outcome: string;
  readonly albumId?: string;
}

const SENSITIVE_KEY_PATTERN =
  /password|token|authorization|secret|apikey|api_key|service_role/i;

@Injectable()
export class StructuredLoggerService {
  private readonly sink: LogSink;

  public constructor() {
    this.sink = (line) => console.log(line);
  }

  public logRequest(input: RequestLogInput): void {
    this.write('info', {
      event: 'http_request',
      requestId: input.requestId,
      method: input.method,
      route: input.route,
      status: input.statusCode,
      durationMs: Math.round(input.durationMs),
      ...(input.userId ? { userId: input.userId } : {})
    });
  }

  public logCatalogAdminMutation(input: CatalogEventInput): void {
    this.write('info', {
      event: 'catalog_admin_mutation',
      userId: input.userId,
      role: input.role,
      resource: input.resource,
      action: input.action,
      outcome: input.outcome,
      ...(input.albumId ? { albumId: input.albumId } : {})
    });
  }

  public logCatalogAuthorizationDenial(input: CatalogEventInput): void {
    this.write('error', {
      event: 'catalog_authorization_denial',
      userId: input.userId,
      role: input.role,
      resource: input.resource,
      action: input.action,
      outcome: input.outcome,
      ...(input.albumId ? { albumId: input.albumId } : {})
    });
  }

  public logCatalogAlbumRead(input: CatalogEventInput): void {
    this.write('info', {
      event: 'catalog_album_read',
      userId: input.userId,
      role: input.role,
      resource: input.resource,
      action: input.action,
      outcome: input.outcome,
      ...(input.albumId ? { albumId: input.albumId } : {})
    });
  }

  public sanitize(value: unknown): unknown {
    if (Array.isArray(value)) {
      return value.map((item) => this.sanitize(item));
    }

    if (!value || typeof value !== 'object') {
      return value;
    }

    return Object.fromEntries(
      Object.entries(value).map(([key, entryValue]) => [
        key,
        SENSITIVE_KEY_PATTERN.test(key)
          ? '[REDACTED]'
          : this.sanitize(entryValue)
      ])
    );
  }

  private write(level: LogLevel, payload: Record<string, unknown>): void {
    const sanitizedPayload = this.sanitize(payload) as Record<string, unknown>;

    this.sink(
      JSON.stringify({
        level,
        timestamp: new Date().toISOString(),
        ...sanitizedPayload
      })
    );
  }
}
