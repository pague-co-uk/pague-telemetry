import {type Span } from '@opentelemetry/api';

import {
  failSpan,
  finishSpan,
  startSpan,
} from '../tracing/index.js';

import {type HttpRequest } from './types.js';

export function startHttpSpan(
  request: HttpRequest,
): Span {
  const span = startSpan(
    `${request.method} ${request.path ?? request.url}`,
  );

  span.setAttributes({
    'http.method': request.method,
    'http.route': request.path ?? request.url,
    'http.url': request.url,

    ...(request.ip && {
      'http.client_ip': request.ip,
    }),

    ...(request.protocol && {
      'http.scheme': request.protocol,
    }),

    ...(request.hostname && {
      'http.host': request.hostname,
    }),
  });

  return span;
}

export function finishHttpSpan(
  span: Span,
  statusCode: number,
): void {
  finishSpan(span, {
    'http.status_code': statusCode,
  });
}

export function failHttpSpan(
  span: Span,
  error: unknown,
  statusCode = 500,
): void {
  failSpan(span, error, {
    'http.status_code': statusCode,
  });
}