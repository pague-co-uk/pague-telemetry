import type { Histogram, MetricOptions } from '@opentelemetry/api';

import { getMeter } from './meter.js';

export function createHistogram(
  name: string,
  options?: MetricOptions,
): Histogram {
  return getMeter().createHistogram(name, options);
}