import {
  createCounterMetric,
  createHistogramMetric,
} from '../metrics/index.js';
import { createLazyMetricBundle } from '../metrics/lazy.js';
import type {
  CounterMetric,
  HistogramMetric,
} from '../metrics/index.js';

import {
  DatabaseMetrics,
} from './constants.js';

interface DatabaseMetricBundle {
  queryCounter: CounterMetric;
  failedQueryCounter: CounterMetric;
  connectionErrorCounter: CounterMetric;
  queryDurationHistogram: HistogramMetric;
}

const getMetrics = createLazyMetricBundle<DatabaseMetricBundle>(
  () => ({
    queryCounter: createCounterMetric({
      name: DatabaseMetrics.QUERY_COUNT,
      description: 'Total number of executed database queries',
    }),
    failedQueryCounter: createCounterMetric({
      name: DatabaseMetrics.QUERY_FAILED,
      description: 'Total number of failed database queries',
    }),
    connectionErrorCounter: createCounterMetric({
      name: DatabaseMetrics.CONNECTION_ERRORS,
      description: 'Total number of database connection errors',
    }),
    queryDurationHistogram: createHistogramMetric({
      name: DatabaseMetrics.QUERY_DURATION,
      description: 'Database query duration',
      unit: 'ms',
    }),
  }),
);

export function recordQuery(): void {
  getMetrics().queryCounter.increment();
}

export function recordFailedQuery(): void {
  getMetrics().failedQueryCounter.increment();
}

export function recordConnectionError(): void {
  getMetrics().connectionErrorCounter.increment();
}

export function recordQueryDuration(
  durationMs: number,
): void {
  getMetrics().queryDurationHistogram.record(
    durationMs,
  );
}
