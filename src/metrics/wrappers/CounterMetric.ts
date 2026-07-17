import type { Counter } from '@opentelemetry/api';

import { mergeMetricAttributes } from '../context.js';
import { createCounter } from '../counter.js';
import { counterRegistry } from '../registry/counter.js';
import type {
  CounterMetricOptions,
  MetricAttributes,
} from '../types.js';

export class CounterMetric {
  private readonly counter: Counter;

  constructor(options: CounterMetricOptions) {
    this.counter = createCounter(options.name, {
      ...(options.description && {
        description: options.description,
      }),
      ...(options.unit && {
        unit: options.unit,
      }),
    });
  }

  increment(attributes?: MetricAttributes): void {
    this.counter.add(
      1,
      mergeMetricAttributes(attributes),
    );
  }

  add(
    value: number,
    attributes?: MetricAttributes,
  ): void {
    this.counter.add(
      value,
      mergeMetricAttributes(attributes),
    );
  }
}

export function createCounterMetric(
  options: CounterMetricOptions,
): CounterMetric {
  const existing = counterRegistry.get(options.name);

  if (existing) {
    return existing;
  }

  const counter = new CounterMetric(options);

  return counterRegistry.register(
    options.name,
    counter,
  );
}