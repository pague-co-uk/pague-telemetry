import pino, { Logger, LoggerOptions } from 'pino';
import { context, trace } from '@opentelemetry/api';

export interface LoggerConfig {
  serviceName: string;
  serviceVersion?: string;
  level?: string;
}

let logger: Logger | undefined;

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

export function initLogger(config: LoggerConfig): Logger {
  if (logger) {
    return logger;
  }

  const base: Record<string, unknown> = {
    serviceName: config.serviceName,
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

  logger = pino(options);

  return logger;
}

export function getLogger(): Logger {
  if (!logger) {
    throw new Error(
      'Logger has not been initialized. Call initTelemetry() before using getLogger().',
    );
  }

  return logger;
}