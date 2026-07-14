import {
  createCounterMetric,
  createHistogramMetric,
} from '../metrics';

import {
  RabbitMqMetrics,
} from './constants';

const publishedCounter =
  createCounterMetric({
    name: RabbitMqMetrics.PUBLISHED,
    description:
      'Total published RabbitMQ messages',
  });

const consumedCounter =
  createCounterMetric({
    name: RabbitMqMetrics.CONSUMED,
    description:
      'Total consumed RabbitMQ messages',
  });

const failedCounter =
  createCounterMetric({
    name: RabbitMqMetrics.FAILED,
    description:
      'Total failed RabbitMQ operations',
  });

const publishDuration =
  createHistogramMetric({
    name: RabbitMqMetrics.PUBLISH_DURATION,
    description:
      'RabbitMQ publish duration',
    unit: 'ms',
  });

const consumeDuration =
  createHistogramMetric({
    name: RabbitMqMetrics.CONSUME_DURATION,
    description:
      'RabbitMQ consume duration',
    unit: 'ms',
  });

export function recordPublish(): void {
  publishedCounter.increment();
}

export function recordConsume(): void {
  consumedCounter.increment();
}

export function recordFailure(): void {
  failedCounter.increment();
}

export function recordPublishDuration(
  durationMs: number,
): void {
  publishDuration.record(durationMs);
}

export function recordConsumeDuration(
  durationMs: number,
): void {
  consumeDuration.record(durationMs);
}