import { Injectable } from '@nestjs/common';

type MetricLabels = Readonly<Record<string, string>>;

interface CounterDefinition {
  readonly name: string;
  readonly help: string;
  readonly labelNames: readonly string[];
}

interface HistogramDefinition extends CounterDefinition {
  readonly buckets: readonly number[];
}

interface HistogramBucketValue {
  readonly labels: MetricLabels;
  readonly counts: Map<number, number>;
  readonly sum: number;
  readonly count: number;
}

const DEFAULT_BUCKETS = [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5];

class CounterMetric {
  private readonly values = new Map<string, number>();

  public constructor(private readonly definition: CounterDefinition) {}

  public increment(labels: MetricLabels, amount = 1): void {
    const key = this.createKey(labels);
    const currentValue = this.values.get(key) ?? 0;

    this.values.set(key, currentValue + amount);
  }

  public render(): string {
    const lines = [
      `# HELP ${this.definition.name} ${this.definition.help}`,
      `# TYPE ${this.definition.name} counter`
    ];

    this.values.forEach((value, key) => {
      lines.push(`${this.definition.name}${key} ${value}`);
    });

    return lines.join('\n');
  }

  private createKey(labels: MetricLabels): string {
    return formatLabels(this.definition.labelNames, labels);
  }
}

class HistogramMetric {
  private readonly values = new Map<string, HistogramBucketValue>();

  public constructor(private readonly definition: HistogramDefinition) {}

  public observe(labels: MetricLabels, value: number): void {
    const key = this.createKey(labels);
    const currentValue =
      this.values.get(key) ?? this.createInitialValue(labels);
    const counts = new Map(currentValue.counts);

    this.definition.buckets.forEach((bucket) => {
      counts.set(bucket, (counts.get(bucket) ?? 0) + (value <= bucket ? 1 : 0));
    });

    this.values.set(key, {
      labels,
      counts,
      sum: currentValue.sum + value,
      count: currentValue.count + 1
    });
  }

  public render(): string {
    const lines = [
      `# HELP ${this.definition.name} ${this.definition.help}`,
      `# TYPE ${this.definition.name} histogram`
    ];

    this.values.forEach((value) => {
      this.definition.buckets.forEach((bucket) => {
        lines.push(
          `${this.definition.name}_bucket${formatLabels(
            [...this.definition.labelNames, 'le'],
            {
              ...value.labels,
              le: String(bucket)
            }
          )} ${value.counts.get(bucket) ?? 0}`
        );
      });
      lines.push(
        `${this.definition.name}_bucket${formatLabels(
          [...this.definition.labelNames, 'le'],
          {
            ...value.labels,
            le: '+Inf'
          }
        )} ${value.count}`
      );
      lines.push(
        `${this.definition.name}_sum${formatLabels(
          this.definition.labelNames,
          value.labels
        )} ${value.sum}`
      );
      lines.push(
        `${this.definition.name}_count${formatLabels(
          this.definition.labelNames,
          value.labels
        )} ${value.count}`
      );
    });

    return lines.join('\n');
  }

  private createKey(labels: MetricLabels): string {
    return formatLabels(this.definition.labelNames, labels);
  }

  private createInitialValue(labels: MetricLabels): HistogramBucketValue {
    return {
      labels,
      counts: new Map(this.definition.buckets.map((bucket) => [bucket, 0])),
      sum: 0,
      count: 0
    };
  }
}

const formatLabels = (
  labelNames: readonly string[],
  labels: MetricLabels
): string => {
  if (labelNames.length === 0) {
    return '';
  }

  const formattedLabels = labelNames
    .map((labelName) => `${labelName}="${escapeLabel(labels[labelName] ?? '')}"`)
    .join(',');

  return `{${formattedLabels}}`;
};

const escapeLabel = (value: string): string =>
  value.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/"/g, '\\"');

@Injectable()
export class MetricsService {
  private readonly httpRequestsTotal = new CounterMetric({
    name: 'http_requests_total',
    help: 'Total HTTP requests handled by the API.',
    labelNames: ['method', 'route', 'status_code']
  });

  private readonly httpRequestDurationSeconds = new HistogramMetric({
    name: 'http_request_duration_seconds',
    help: 'HTTP request duration in seconds.',
    labelNames: ['method', 'route', 'status_code'],
    buckets: DEFAULT_BUCKETS
  });

  private readonly authFailuresTotal = new CounterMetric({
    name: 'auth_failures_total',
    help: 'Authentication failures grouped by reason.',
    labelNames: ['reason']
  });

  private readonly collectionUpdatesTotal = new CounterMetric({
    name: 'collection_updates_total',
    help: 'Collection quantity update attempts grouped by outcome.',
    labelNames: ['outcome']
  });

  private readonly stickerSearchTotal = new CounterMetric({
    name: 'sticker_search_total',
    help: 'Sticker search attempts grouped by result status.',
    labelNames: ['status']
  });

  private readonly progressCalculationDurationSeconds = new HistogramMetric({
    name: 'progress_calculation_duration_seconds',
    help: 'Album progress calculation duration in seconds.',
    labelNames: ['outcome'],
    buckets: DEFAULT_BUCKETS
  });

  public recordHttpRequest(input: {
    readonly method: string;
    readonly route: string;
    readonly statusCode: number;
    readonly durationSeconds: number;
  }): void {
    const labels = {
      method: input.method,
      route: input.route,
      status_code: String(input.statusCode)
    };

    this.httpRequestsTotal.increment(labels);
    this.httpRequestDurationSeconds.observe(labels, input.durationSeconds);
  }

  public recordAuthFailure(reason: string): void {
    this.authFailuresTotal.increment({ reason });
  }

  public recordCollectionUpdate(outcome: string): void {
    this.collectionUpdatesTotal.increment({ outcome });
  }

  public recordStickerSearch(status: string): void {
    this.stickerSearchTotal.increment({ status });
  }

  public observeProgressCalculation(input: {
    readonly outcome: string;
    readonly durationSeconds: number;
  }): void {
    this.progressCalculationDurationSeconds.observe(
      { outcome: input.outcome },
      input.durationSeconds
    );
  }

  public renderPrometheusMetrics(): string {
    return [
      this.httpRequestsTotal.render(),
      this.httpRequestDurationSeconds.render(),
      this.authFailuresTotal.render(),
      this.collectionUpdatesTotal.render(),
      this.stickerSearchTotal.render(),
      this.progressCalculationDurationSeconds.render()
    ].join('\n');
  }
}
