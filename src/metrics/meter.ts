import { type Meter, metrics } from '@opentelemetry/api';

import { NotInitializedError } from '../common/errors.js';

let meter: Meter | undefined;

export interface MeterConfig {
  serviceName: string;
  version?: string;
}

export function initMeter(config: MeterConfig): Meter {
  if (meter) {
    return meter;
  }

  meter = metrics.getMeter(
    config.serviceName,
    config.version,
  );

  return meter;
}

export function getMeter(): Meter {
  if (!meter) {
    throw new NotInitializedError('Meter');
  }

  return meter;
}

/**
 * Clears the cached meter handle.
 *
 * Intended for telemetry lifecycle shutdown.
 */
export function resetMeter(): void {
  meter = undefined;
}