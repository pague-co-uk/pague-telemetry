import {
  updateContext,
} from '../context/context';

import {
  getCorrelationId,
  getRequestId,
  setCorrelationId,
  setRequestId,
} from './headers';
import {
  HttpRequest,
  HttpResponse,
  HttpContextOptions,
} from './types';

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