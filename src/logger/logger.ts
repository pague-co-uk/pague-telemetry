import pino, { Logger, LoggerOptions, multistream } from 'pino';

import { DEFAULT_LOG_LEVEL, LOG_FIELDS } from '../common/constants';
import { getLogLevel } from '../common/env';
import { NotInitializedError } from '../common/errors';

import { getTraceContext } from './context';
import { redaction } from './redaction';
import { serializers } from './serializers';
import {
  createTransports,
  TransportConfig,
} from './transports';

export interface InternalLoggerConfig {
  serviceName: string;
  serviceVersion?: string;
  level?: string;
  transport?: TransportConfig;
}

let logger: Logger | undefined;

export function initLogger(
  config: InternalLoggerConfig,
): Logger {
  if (logger) {
    return logger;
  }

  const options: LoggerOptions = {
    level: config.level ?? getLogLevel() ?? DEFAULT_LOG_LEVEL,

    base: {
      [LOG_FIELDS.SERVICE]: config.serviceName,

      ...(config.serviceVersion && {
        [LOG_FIELDS.VERSION]:
          config.serviceVersion,
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
    multistream(
      createTransports(config.transport),
    ),
  );

  return logger;
}

export function getLogger(): Logger {
  if (!logger) {
    throw new NotInitializedError('Logger');
  }

  return logger;
}