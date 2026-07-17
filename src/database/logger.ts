import type { Logger } from 'pino';

import { getComponentLogger } from '../logger/index.js';

import type {
  DatabaseContext,
} from './types.js';

let logger: Logger | undefined;

function databaseLogger(): Logger {
  if (!logger) {
    logger = getComponentLogger(
      'database',
    );
  }

  return logger;
}

export function logQueryStarted(
  context: DatabaseContext,
): void {
  databaseLogger().debug(
    {
      system: context.system,

      database: context.database,

      operation: context.operation,

      table: context.table,

      transactionId:
        context.transactionId,
    },
    'Database query started',
  );
}

export function logQueryCompleted(
  context: DatabaseContext,
  durationMs: number,
  rowsAffected?: number,
): void {
  databaseLogger().info(
    {
      system: context.system,

      database: context.database,

      operation: context.operation,

      table: context.table,

      durationMs,

      rowsAffected,

      transactionId:
        context.transactionId,
    },
    'Database query completed',
  );
}

export function logQueryFailed(
  context: DatabaseContext,
  error: unknown,
  durationMs?: number,
): void {
  databaseLogger().error(
    {
      err: error,

      system: context.system,

      database: context.database,

      operation: context.operation,

      table: context.table,

      durationMs,

      transactionId:
        context.transactionId,
    },
    'Database query failed',
  );
}

export function logSlowQuery(
  context: DatabaseContext,
  durationMs: number,
): void {
  databaseLogger().warn(
    {
      system: context.system,

      database: context.database,

      operation: context.operation,

      table: context.table,

      durationMs,

      transactionId:
        context.transactionId,
    },
    'Slow database query',
  );
}