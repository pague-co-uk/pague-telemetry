import type {
  MetricOptions,
  UpDownCounter,
} from '@opentelemetry/api';

import { getMeter } from './meter';

export function createUpDownCounter(
  name: string,
  options?: MetricOptions,
): UpDownCounter {
  return getMeter().createUpDownCounter(
    name,
    options,
  );
}