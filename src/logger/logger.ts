import pino, { multistream } from 'pino';
import type {Logger, LoggerOptions} from 'pino';

import { DEFAULT_LOG_LEVEL, LOG_FIELDS } from '../common/constants.js';
import { getLogLevel } from '../common/env.js';
import { NotInitializedError } from '../common/errors.js';

import { getTraceContext } from './context.js';
import { redaction } from './redaction.js';
import { serializers } from './serializers.js';
import {
  createTransports,
} from './transports.js';
import type {TransportConfig} from './transports.js';

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

const transports = createTransports(
  config.transport,
);

console.dir(transports, {
  depth: null,
});

logger = pino(
  options,
  multistream(transports),
);

  return logger;
}

export function getLogger(): Logger {
  if (!logger) {
    throw new NotInitializedError('Logger');
  }

  return logger;
}