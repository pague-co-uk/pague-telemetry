import { metrics, Meter } from '@opentelemetry/api';

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
    throw new Error(
      'Meter has not been initialized. Call initTelemetry() before using metrics.',
    );
  }

  return meter;
}