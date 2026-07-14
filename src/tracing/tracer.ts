import { trace, Tracer } from '@opentelemetry/api';

import { NotInitializedError } from '../common/errors';

let tracer: Tracer | undefined;

export interface TracerConfig {
  serviceName: string;
  version?: string;
}

export function initTracer(config: TracerConfig): Tracer {
  if (tracer) {
    return tracer;
  }

  tracer = trace.getTracer(
    config.serviceName,
    config.version,
  );

  return tracer;
}

export function getTracer(): Tracer {
  if (!tracer) {
    throw new NotInitializedError('Tracer');
  }

  return tracer;
}