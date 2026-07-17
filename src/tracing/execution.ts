import type {
  Context,
  Span,
  SpanOptions
} from '@opentelemetry/api';
import {
  context,
  trace,
} from '@opentelemetry/api';
import { Observable } from 'rxjs';

import {
  failSpan,
  finishSpan,
  startSpan,
} from './span.js';

function createSpanContext(
  name: string,
  options?: SpanOptions,
  parentContext?: Context,
): {
  span: Span;
  context: Context;
} {
  const span = startSpan(
    name,
    options,
    parentContext,
  );

  return {
    span,
    context: trace.setSpan(
      context.active(),
      span,
    ),
  };
}

export function withSyncSpan<T>(
  name: string,
  callback: (span: Span) => T,
  options?: SpanOptions,
  parentContext?: Context,
): T {
  const {
    span,
    context: spanContext,
  } = createSpanContext(
    name,
    options,
    parentContext,
  );

  return context.with(
    spanContext,
    () => {
      try {
        const result = callback(span);

        finishSpan(span);

        return result;
      } catch (error) {
        failSpan(span, error);

        throw error;
      }
    },
  );
}

export async function withPromiseSpan<T>(
  name: string,
  callback: (
    span: Span,
  ) => Promise<T>,
  options?: SpanOptions,
  parentContext?: Context,
): Promise<T> {
  const {
    span,
    context: spanContext,
  } = createSpanContext(
    name,
    options,
    parentContext,
  );

  return context.with(
    spanContext,
    async () => {
      try {
        const result =
          await callback(span);

        finishSpan(span);

        return result;
      } catch (error) {
        failSpan(span, error);

        throw error;
      }
    },
  );
}

export function withObservableSpan<T>(
  name: string,
  callback: (
    span: Span,
  ) => Observable<T>,
  options?: SpanOptions,
  parentContext?: Context,
): Observable<T> {
  return new Observable<T>(
    (subscriber) => {
      const {
        span,
        context: spanContext,
      } = createSpanContext(
        name,
        options,
        parentContext,
      );

      const source = context.with(
        spanContext,
        () => callback(span),
      );

      const subscription = context.with(
        spanContext,
        () =>
          source.subscribe({
            next(value) {
              subscriber.next(value);
            },

            error(error) {
              failSpan(
                span,
                error,
              );

              subscriber.error(
                error,
              );
            },

            complete() {
              finishSpan(span);

              subscriber.complete();
            },
          }),
      );

      return () => {
        if (!subscription.closed) {
          subscription.unsubscribe();
        }

        if (span.isRecording()) {
          finishSpan(span);
        }
      };
    },
  );
}