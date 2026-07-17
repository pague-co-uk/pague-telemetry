import { performance } from 'node:perf_hooks';

import {
  spanNaming,
  withPromiseSpan,
} from '../tracing/index.js';

import {
  DatabaseAttributes,
} from './constants.js';

import type {
  DatabaseContext,
  DatabaseExecutionResult,
  DatabaseOptions,
} from './types.js';

import {
  logQueryCompleted,
  logQueryFailed,
  logQueryStarted,
  logSlowQuery,
} from './logger.js';

import {
  recordFailedQuery,
  recordQuery,
  recordQueryDuration,
} from './metrics.js';

const DEFAULT_SLOW_QUERY_THRESHOLD_MS =
  1000;

export class DatabaseLifecycle {
  async execute<T>(
    context: DatabaseContext,
    callback: () => Promise<
      DatabaseExecutionResult<T>
    >,
    options: DatabaseOptions = {},
  ): Promise<T> {
    const startedAt =
      performance.now();

    return withPromiseSpan(
      spanNaming.database(
        context.operation,
        context.table,
      ),
      async (span) => {
        span.setAttributes({
          [DatabaseAttributes.SYSTEM]:
            context.system,

          ...(context.database && {
            [DatabaseAttributes.NAME]:
              context.database,
          }),

          [DatabaseAttributes.OPERATION]:
            context.operation,

          ...(context.table && {
            [DatabaseAttributes.TABLE]:
              context.table,
          }),
        });

        logQueryStarted(context);

        try {
          const result =
            await callback();

          const durationMs =
            performance.now() -
            startedAt;

          recordQuery();

          recordQueryDuration(
            durationMs,
          );

          span.setAttribute(
            DatabaseAttributes.SUCCESS,
            true,
          );

          if (
            result.rowsAffected !==
            undefined
          ) {
            span.setAttribute(
              DatabaseAttributes.ROW_COUNT,
              result.rowsAffected,
            );
          }

          logQueryCompleted(
            context,
            durationMs,
            result.rowsAffected,
          );

          const threshold =
            options.slowQueryThresholdMs ??
            DEFAULT_SLOW_QUERY_THRESHOLD_MS;

          if (
            durationMs >= threshold
          ) {
            logSlowQuery(
              context,
              durationMs,
            );
          }

          return result.result;
        } catch (error) {
          const durationMs =
            performance.now() -
            startedAt;

          recordFailedQuery();

          recordQueryDuration(
            durationMs,
          );

          span.setAttribute(
            DatabaseAttributes.SUCCESS,
            false,
          );

          logQueryFailed(
            context,
            error,
            durationMs,
          );

          throw error;
        }
      },
    );
  }
}

let lifecycle:
  | DatabaseLifecycle
  | undefined;

export function getDatabaseLifecycle(): DatabaseLifecycle {
  if (!lifecycle) {
    lifecycle =
      new DatabaseLifecycle();
  }

  return lifecycle;
}