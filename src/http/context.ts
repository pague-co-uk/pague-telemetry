import {
  updateContext,
} from '../context/index.js';

import {
  getCorrelationId,
  getRequestId,
  setCorrelationId,
  setRequestId,
} from './headers.js';
import type {
  HttpRequest,
  HttpResponse,
  HttpContextOptions,
} from './types.js';

export function establishRequestContext(
  request: HttpRequest,
  response: HttpResponse,
  options: HttpContextOptions = {},
): void {
  const requestId = getRequestId(
    request,
    options.requestIdHeader,
  );

  const correlationId = getCorrelationId(
    request,
    options.correlationIdHeader,
  );

  updateContext({
    requestId,
    correlationId,

    operation: `${request.method} ${request.path ?? request.url}`,
  });

  setRequestId(
    response,
    requestId,
    options.requestIdHeader,
  );

  setCorrelationId(
    response,
    correlationId,
    options.correlationIdHeader,
  );
}