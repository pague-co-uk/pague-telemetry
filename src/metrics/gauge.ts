import type {
  ObservableGauge,
  MetricOptions,
  ObservableCallback,
} from '@opentelemetry/api';

import { getMeter } from './meter.js';

export function createGauge(
  name: string,
  callback: ObservableCallback,
  options?: MetricOptions,
): ObservableGauge {
  const gauge = getMeter().createObservableGauge(name, options);

  gauge.addCallback(callback);

  return gauge;
}