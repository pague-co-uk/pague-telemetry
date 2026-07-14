import type { Histogram } from '@opentelemetry/api';

import { mergeMetricAttributes } from '../context';
import { createHistogram } from '../histogram';
import { histogramRegistry } from '../registry/histogram';
import {
  HistogramMetricOptions,
  MetricAttributes,
} from '../types';

export class HistogramMetric {
  private readonly histogram: Histogram;

  constructor(options: HistogramMetricOptions) {
    this.histogram = createHistogram(options.name, {
      ...(options.description && {
        description: options.description,
      }),
      ...(options.unit && {
        unit: options.unit,
      }),
    });
  }

  record(
    value: number,
    attributes?: MetricAttributes,
  ): void {
    this.histogram.record(
      value,
      mergeMetricAttributes(attributes),
    );
  }
}

export function createHistogramMetric(
  options: HistogramMetricOptions,
): HistogramMetric {
  const existing = histogramRegistry.get(options.name);

  if (existing) {
    return existing;
  }

  const histogram = new HistogramMetric(options);

  return histogramRegistry.register(
    options.name,
    histogram,
  );
}