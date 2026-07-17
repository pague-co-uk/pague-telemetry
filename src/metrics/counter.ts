import type { Counter, MetricOptions } from '@opentelemetry/api';

import { getMeter } from './meter.js';

export function createCounter(
  name: string,
  options?: MetricOptions,
): Counter {
  return getMeter().createCounter(name, options);
}