import {
  CounterMetric,
  createCounterMetric,
  createGaugeMetric,
  createHistogramMetric,
  GaugeMetric,
  HistogramMetric,
} from '../metrics';
import { createLazyMetricBundle } from '../metrics/lazy';

import {
  DEFAULT_ACTIVE_REQUESTS,
  DEFAULT_REQUEST_COUNTER,
  DEFAULT_REQUEST_DURATION,
  DEFAULT_REQUEST_SIZE,
  DEFAULT_RESPONSE_SIZE,
} from './constants';

class HttpMetrics {
  readonly requests: CounterMetric;

  readonly requestDuration: HistogramMetric;

  readonly requestSize: HistogramMetric;

  readonly responseSize: HistogramMetric;

  readonly activeRequests: GaugeMetric;

  private activeRequestCount = 0;

  constructor() {
    this.requests = createCounterMetric({
      name: DEFAULT_REQUEST_COUNTER,
      description: 'Total HTTP requests',
    });

    this.requestDuration =
      createHistogramMetric({
        name: DEFAULT_REQUEST_DURATION,
        description:
          'HTTP request duration',
        unit: 'ms',
      });

    this.requestSize =
      createHistogramMetric({
        name: DEFAULT_REQUEST_SIZE,
        description:
          'HTTP request size',
        unit: 'By',
      });

    this.responseSize =
      createHistogramMetric({
        name: DEFAULT_RESPONSE_SIZE,
        description:
          'HTTP response size',
        unit: 'By',
      });

    this.activeRequests =
      createGaugeMetric(
        {
          name: DEFAULT_ACTIVE_REQUESTS,
          description:
            'Active HTTP requests',
        },
        () => this.activeRequestCount,
      );
  }

  requestStarted(
    attributes?: Record<
      string,
      string | number | boolean
    >,
  ): void {
    this.activeRequestCount++;

    this.requests.increment(attributes);
  }

  requestCompleted(
    durationMs: number,
    attributes?: Record<
      string,
      string | number | boolean
    >,
  ): void {
    this.activeRequestCount = Math.max(
      0,
      this.activeRequestCount - 1,
    );

    this.requestDuration.record(
      durationMs,
      attributes,
    );
  }

  recordRequestSize(
    bytes: number,
    attributes?: Record<
      string,
      string | number | boolean
    >,
  ): void {
    this.requestSize.record(
      bytes,
      attributes,
    );
  }

  recordResponseSize(
    bytes: number,
    attributes?: Record<
      string,
      string | number | boolean
    >,
  ): void {
    this.responseSize.record(
      bytes,
      attributes,
    );
  }
}

const getHttpMetrics = createLazyMetricBundle(
  () => new HttpMetrics(),
);

export { getHttpMetrics };
