import type {
  UpDownCounter,
} from '@opentelemetry/api';

import { mergeMetricAttributes } from '../context.js';
import { createUpDownCounter } from '../up-down-counter.js';
import { upDownCounterRegistry } from '../registry/up-down-counter.js';

import type {
  MetricAttributes,
  UpDownCounterMetricOptions,
} from '../types.js';

export class UpDownCounterMetric {
  private readonly counter: UpDownCounter;

  constructor(
    options: UpDownCounterMetricOptions,
    private readonly attributes?: MetricAttributes,
  ) {
    this.counter = createUpDownCounter(
      options.name,
      {
        ...(options.description && {
          description: options.description,
        }),

        ...(options.unit && {
          unit: options.unit,
        }),
      },
    );
  }

  increment(
    attributes?: MetricAttributes,
  ): void {
    this.add(
      1,
      attributes,
    );
  }

  decrement(
    attributes?: MetricAttributes,
  ): void {
    this.add(
      -1,
      attributes,
    );
  }

add(
  value: number,
  attributes?: MetricAttributes,
): void {
  const mergedAttributes = {
    ...(this.attributes ?? {}),
    ...(attributes ?? {}),
  };

  this.counter.add(
    value,
    mergeMetricAttributes(
      mergedAttributes,
    ),
  );
}

  getInstrument(): UpDownCounter {
    return this.counter;
  }
}

export function createUpDownCounterMetric(
  options: UpDownCounterMetricOptions,
  attributes?: MetricAttributes,
): UpDownCounterMetric {
  const existing =
    upDownCounterRegistry.get(
      options.name,
    );

  if (existing) {
    return existing;
  }

  const metric =
    new UpDownCounterMetric(
      options,
      attributes,
    );

  return upDownCounterRegistry.register(
    options.name,
    metric,
  );
}