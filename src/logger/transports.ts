import type { StreamEntry } from 'pino';
import pino from 'pino';

import { logs, SeverityNumber } from '@opentelemetry/api-logs';

import {
  DEFAULT_LOG_FILE_ENABLED,
  DEFAULT_LOG_FILE_PATH,
  DEFAULT_LOG_STDOUT_ENABLED,
} from '../common/constants.js';
import {
  getBooleanEnv,
  getEnv,
} from '../common/env.js';

export interface FileTransportConfig {
  enabled: boolean;
  path: string;
}

export interface TransportConfig {
  stdout?: boolean;
  file?: FileTransportConfig;
}

export type TransportStream = StreamEntry;

function createStdoutTransport(): TransportStream {
  return {
    level: 'trace',
    stream: pino.destination({
      dest: 1,
      sync: false,
    }),
  };
}

function createFileTransport(
  filePath: string,
): TransportStream {
  return {
    level: 'trace',
    stream: pino.destination({
      dest: filePath,
      mkdir: true,
      sync: false,
      append: true,
    }),
  };
}

function getSeverityNumber(
  level: number,
): SeverityNumber {
  switch (level) {
    case 10:
      return SeverityNumber.TRACE;

    case 20:
      return SeverityNumber.DEBUG;

    case 30:
      return SeverityNumber.INFO;

    case 40:
      return SeverityNumber.WARN;

    case 50:
      return SeverityNumber.ERROR;

    case 60:
      return SeverityNumber.FATAL;

    default:
      return SeverityNumber.UNSPECIFIED;
  }
}

function getSeverityText(level: number): string {
  switch (level) {
    case 10:
      return 'TRACE';

    case 20:
      return 'DEBUG';

    case 30:
      return 'INFO';

    case 40:
      return 'WARN';

    case 50:
      return 'ERROR';

    case 60:
      return 'FATAL';

    default:
      return 'UNKNOWN';
  }
}

function createOtelLogTransport(): TransportStream {
  return {
    level: 'trace',
    stream: {
      write(chunk: string): boolean {
        try {
          const record = JSON.parse(chunk) as Record<
            string,
            unknown
          >;

          const level =
            typeof record.level === 'number'
              ? record.level
              : 30;

          const message =
            typeof record.msg === 'string'
              ? record.msg
              : JSON.stringify(record.msg ?? '');

          const logger = logs.getLogger(
            typeof record.service === 'string'
              ? record.service
              : 'pague',
          );

          const attributes: Record<string, string | number | boolean> = {};

          for (const [key, value] of Object.entries(record)) {
            if (
              key === 'level' ||
              key === 'time' ||
              key === 'msg'
            ) {
              continue;
            }

            if (
              typeof value === 'string' ||
              typeof value === 'number' ||
              typeof value === 'boolean'
            ) {
              attributes[key] = value;
            }
          }

          logger.emit({
            severityNumber: getSeverityNumber(level),
            severityText: getSeverityText(level),
            body: message,
            attributes,
            timestamp:
              typeof record.time === 'number'
                ? record.time
                : Date.now(),
          });

          return true;
        } catch {
          return false;
        }
      },
    },
  };
}

export function createTransports(
  config: TransportConfig = {},
): TransportStream[] {
  const transports: TransportStream[] = [];

  const stdoutEnabled =
    config.stdout ??
    getBooleanEnv(
      'LOG_STDOUT',
      DEFAULT_LOG_STDOUT_ENABLED,
    );

  if (stdoutEnabled) {
    transports.push(createStdoutTransport());
  }

  const fileEnabled =
    config.file?.enabled ??
    getBooleanEnv(
      'LOG_FILE_ENABLED',
      DEFAULT_LOG_FILE_ENABLED,
    );

  if (fileEnabled) {
    const filePath =
      config.file?.path ??
      getEnv(
        'LOG_FILE_PATH',
        DEFAULT_LOG_FILE_PATH,
      )!;

    transports.push(
      createFileTransport(filePath),
    );
  }

  transports.push(createOtelLogTransport());

  return transports;
}