import {
  createCounterMetric,
  createHistogramMetric,
} from '../metrics';
import { createLazyMetricBundle } from '../metrics/lazy';
import type {
  CounterMetric,
  HistogramMetric,
} from '../metrics';

import {
  RabbitMqMetrics,
} from './constants';

interface RabbitMqMetricBundle {
  publishedCounter: CounterMetric;
  consumedCounter: CounterMetric;
  failedCounter: CounterMetric;
  publishDuration: HistogramMetric;
  consumeDuration: HistogramMetric;
}

const getMetrics = createLazyMetricBundle<RabbitMqMetricBundle>(
  () => ({
    publishedCounter: createCounterMetric({
      name: RabbitMqMetrics.PUBLISHED,
      description: 'Total published RabbitMQ messages',
    }),
    consumedCounter: createCounterMetric({
      name: RabbitMqMetrics.CONSUMED,
      description: 'Total consumed RabbitMQ messages',
    }),
    failedCounter: createCounterMetric({
      name: RabbitMqMetrics.FAILED,
      description: 'Total failed RabbitMQ operations',
    }),
    publishDuration: createHistogramMetric({
      name: RabbitMqMetrics.PUBLISH_DURATION,
      description: 'RabbitMQ publish duration',
      unit: 'ms',
    }),
    consumeDuration: createHistogramMetric({
      name: RabbitMqMetrics.CONSUME_DURATION,
      description: 'RabbitMQ consume duration',
      unit: 'ms',
    }),
  }),
);

export function recordPublish(): void {
  getMetrics().publishedCounter.increment();
}

export function recordConsume(): void {
  getMetrics().consumedCounter.increment();
}

export function recordFailure(): void {
  getMetrics().failedCounter.increment();
}

export function recordPublishDuration(
  durationMs: number,
): void {
  getMetrics().publishDuration.record(durationMs);
}

export function recordConsumeDuration(
  durationMs: number,
): void {
  getMetrics().consumeDuration.record(durationMs);
}
