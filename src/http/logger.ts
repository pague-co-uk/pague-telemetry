import {
  getComponentLogger,
} from '../logger';

import { HttpRequest } from './types';

function logger() {
  return getComponentLogger('http');
}

export function logRequestStarted(
  request: HttpRequest,
): void {
  logger().info(
    {
      method: request.method,
      path: request.path ?? request.url,
      ip: request.ip,
      protocol: request.protocol,
    },
    'HTTP request started',
  );
}

export function logRequestCompleted(
  request: HttpRequest,
  statusCode: number,
  durationMs: number,
): void {
  logger().info(
    {
      method: request.method,
      path: request.path ?? request.url,
      statusCode,
      durationMs,
    },
    'HTTP request completed',
  );
}

export function logRequestFailed(
  request: HttpRequest,
  error: unknown,
  statusCode = 500,
  durationMs?: number,
): void {
  logger().error(
    {
      err: error,
      method: request.method,
      path: request.path ?? request.url,
      statusCode,
      ...(durationMs !== undefined && {
        durationMs,
      }),
    },
    'HTTP request failed',
  );
}