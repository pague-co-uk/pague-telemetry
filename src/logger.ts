import pino, { Logger, LoggerOptions } from 'pino';
import { context, trace } from '@opentelemetry/api';

export interface LoggerConfig {
  serviceName?: string;
  serviceVersion?: string;
  level?: string;
}

function getTraceContext(): Record<string, string> {
  const span = trace.getSpan(context.active());

  if (!span) {
    return {};
  }

  const { traceId, spanId } = span.spanContext();

  return {
    traceId,
    spanId,
  };
}

export function createLogger(config: LoggerConfig = {}): Logger {
  const base: Record<string, unknown> = {
    serviceName:
      config.serviceName ??
      process.env.OTEL_SERVICE_NAME ??
      'unknown-service',
  };

  if (config.serviceVersion) {
    base.serviceVersion = config.serviceVersion;
  }

  const options: LoggerOptions = {
    level: config.level ?? process.env.LOG_LEVEL ?? 'info',

    base,

    timestamp: pino.stdTimeFunctions.isoTime,

    mixin() {
      return getTraceContext();
    },
  };

  return pino(options);
}