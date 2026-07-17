import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';

import type { TelemetryConfig } from '../types.js';

export function createInstrumentations(config: TelemetryConfig) {
  return getNodeAutoInstrumentations({
    '@opentelemetry/instrumentation-fs': {
      enabled: !config.instrumentations?.disableFs,
    },
  });
}