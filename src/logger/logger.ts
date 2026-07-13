import pino, { Logger, LoggerOptions, multistream } from 'pino';

import { getTraceContext } from './context';
import { redaction } from './redaction';
import { serializers } from './serializers';
import { createTransports, TransportConfig } from './transports';

export interface LoggerConfig {
  serviceName: string;
  serviceVersion?: string;
  level?: string;
  transport?: TransportConfig;
}

let logger: Logger | undefined;

export function initLogger(config: LoggerConfig): Logger {
  if (logger) {
    return logger;
  }

  const options: LoggerOptions = {
    level: config.level ?? process.env.LOG_LEVEL ?? 'info',

    base: {
      serviceName: config.serviceName,
      ...(config.serviceVersion && {
        serviceVersion: config.serviceVersion,
      }),
    },

    serializers,

    redact: redaction,

    timestamp: pino.stdTimeFunctions.isoTime,

    mixin() {
      return getTraceContext();
    },
  };

  logger = pino(
    options,
    multistream(createTransports(config.transport)),
  );

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