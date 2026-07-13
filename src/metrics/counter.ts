import { Counter, MetricOptions } from '@opentelemetry/api';

import { getMeter } from './meter';

export function createCounter(
  name: string,
  options?: MetricOptions,
): Counter {
  return getMeter().createCounter(name, options);
}