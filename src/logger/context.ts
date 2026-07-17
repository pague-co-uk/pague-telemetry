import { context, trace } from '@opentelemetry/api';

import { currentContext } from '../context/index.js';

export interface LoggerContext {
  traceId?: string;
  spanId?: string;
  requestId?: string;
  correlationId?: string;
  tenantId?: string;
  clientId?: string;
  userId?: string;
  sessionId?: string;
  operation?: string;
}

export function getTraceContext(): LoggerContext {
  const requestContext = currentContext();

  const span = trace.getSpan(context.active());

  if (!span) {
    return {
      ...requestContext,
    };
  }

  const spanContext = span.spanContext();

  return {
    traceId: spanContext.traceId,
    spanId: spanContext.spanId,

    ...requestContext,
  };
}