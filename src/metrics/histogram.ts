import { Histogram, MetricOptions } from '@opentelemetry/api';

import { getMeter } from './meter';

export function createHistogram(
  name: string,
  options?: MetricOptions,
): Histogram {
  return getMeter().createHistogram(name, options);
}