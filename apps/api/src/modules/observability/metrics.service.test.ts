import { describe, expect, it } from 'vitest';

import { MetricsService } from './metrics.service.js';

describe('MetricsService', () => {
  it('renders expected Prometheus metrics without request payloads', () => {
    const metrics = new MetricsService();

    metrics.recordHttpRequest({
      method: 'GET',
      route: '/api/v1/albums/:albumId/progress',
      statusCode: 200,
      durationSeconds: 0.042
    });
    metrics.recordAuthFailure('invalid_bearer_token');
    metrics.recordStickerSearch('missing');
    metrics.recordCollectionUpdate('success');
    metrics.recordCatalogAdminMutation({
      resource: 'album',
      action: 'status',
      outcome: 'success'
    });
    metrics.recordCatalogAuthorizationDenial({
      resource: 'catalog',
      action: 'admin_access',
      role: 'user'
    });
    metrics.recordCatalogAlbumRead({
      status: 'published',
      role: 'user',
      outcome: 'success'
    });
    metrics.observeProgressCalculation({
      outcome: 'success',
      durationSeconds: 0.015
    });

    const output = metrics.renderPrometheusMetrics();

    expect(output).toContain('# TYPE http_requests_total counter');
    expect(output).toContain(
      'http_requests_total{method="GET",route="/api/v1/albums/:albumId/progress",status_code="200"} 1'
    );
    expect(output).toContain(
      'auth_failures_total{reason="invalid_bearer_token"} 1'
    );
    expect(output).toContain('sticker_search_total{status="missing"} 1');
    expect(output).toContain('collection_updates_total{outcome="success"} 1');
    expect(output).toContain(
      'catalog_admin_mutations_total{resource="album",action="status",outcome="success"} 1'
    );
    expect(output).toContain(
      'catalog_authorization_denials_total{resource="catalog",action="admin_access",role="user"} 1'
    );
    expect(output).toContain(
      'catalog_album_reads_total{status="published",role="user",outcome="success"} 1'
    );
    expect(output).toContain(
      'progress_calculation_duration_seconds_count{outcome="success"} 1'
    );
    expect(output).not.toContain('password');
    expect(output).not.toContain('access-token');
  });
});
