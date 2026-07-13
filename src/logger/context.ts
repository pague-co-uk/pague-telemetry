import { context, trace, SpanContext } from '@opentelemetry/api';

export interface TraceContext {
  traceId?: string;
  spanId?: string;
  traceFlags?: number;
}

export function getActiveSpanContext(): SpanContext | undefined {
  return trace.getSpan(context.active())?.spanContext();
}

export function getTraceContext(): TraceContext {
  const spanContext = getActiveSpanContext();

  if (!spanContext) {
    return {};
  }

  return {
    traceId: spanContext.traceId,
    spanId: spanContext.spanId,
  };
}

export function hasActiveTrace(): boolean {
  return getActiveSpanContext() !== undefined;
}