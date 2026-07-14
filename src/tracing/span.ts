import {
  Context,
  Span,
  SpanOptions,
  SpanStatusCode,
  context,
  trace,
} from '@opentelemetry/api';

import { getTracer } from './tracer';

export function startSpan(
  name: string,
  options?: SpanOptions,
  parentContext?: Context,
): Span {
  return getTracer().startSpan(
    name,
    options,
    parentContext,
  );
}

export function startActiveSpan<T>(
  name: string,
  fn: (span: Span) => T,
): T;

export function startActiveSpan<T>(
  name: string,
  options: SpanOptions,
  fn: (span: Span) => T,
): T;

export function startActiveSpan<T>(
  name: string,
  optionsOrFn: SpanOptions | ((span: Span) => T),
  maybeFn?: (span: Span) => T,
): T {
  if (typeof optionsOrFn === 'function') {
    return getTracer().startActiveSpan(
      name,
      optionsOrFn,
    );
  }

  return getTracer().startActiveSpan(
    name,
    optionsOrFn,
    maybeFn!,
  );
}

export function getActiveSpan(): Span | undefined {
  return trace.getSpan(context.active());
}

export function finishSpan(
  span: Span,
  attributes?: Record<
    string,
    string | number | boolean
  >,
): void {
  if (attributes) {
    span.setAttributes(attributes);
  }

  span.setStatus({
    code: SpanStatusCode.OK,
  });

  span.end();
}

export function failSpan(
  span: Span,
  error: unknown,
  attributes?: Record<
    string,
    string | number | boolean
  >,
): void {
  if (attributes) {
    span.setAttributes(attributes);
  }

  if (error instanceof Error) {
    span.recordException(error);

    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: error.message,
    });
  } else {
    span.setStatus({
      code: SpanStatusCode.ERROR,
    });
  }

  span.end();
}

export function endSpan(
  span: Span,
): void {
  span.end();
}