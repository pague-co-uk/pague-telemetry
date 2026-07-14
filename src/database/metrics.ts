import {
  createCounterMetric,
  createHistogramMetric,
} from '../metrics';

import {
  DatabaseMetrics,
} from './constants';

const queryCounter =
  createCounterMetric({
    name: DatabaseMetrics.QUERY_COUNT,
    description:
      'Total number of executed database queries',
  });

const failedQueryCounter =
  createCounterMetric({
    name: DatabaseMetrics.QUERY_FAILED,
    description:
      'Total number of failed database queries',
  });

const connectionErrorCounter =
  createCounterMetric({
    name:
      DatabaseMetrics.CONNECTION_ERRORS,
    description:
      'Total number of database connection errors',
  });

const queryDurationHistogram =
  createHistogramMetric({
    name:
      DatabaseMetrics.QUERY_DURATION,
    description:
      'Database query duration',
    unit: 'ms',
  });

export function recordQuery(): void {
  queryCounter.increment();
}

export function recordFailedQuery(): void {
  failedQueryCounter.increment();
}

export function recordConnectionError(): void {
  connectionErrorCounter.increment();
}

export function recordQueryDuration(
  durationMs: number,
): void {
  queryDurationHistogram.record(
    durationMs,
  );
}