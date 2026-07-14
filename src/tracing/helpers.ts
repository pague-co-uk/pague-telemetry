import { Span } from '@opentelemetry/api';

import { startActiveSpan } from './span';

export async function withSpan<T>(
  name: string,
  operation: (span: Span) => Promise<T>,
): Promise<T> {
  return startActiveSpan(
    name,
    async (span) => {
      try {
        return await operation(span);
      } catch (error) {
        span.recordException(error as Error);
        throw error;
      } finally {
        span.end();
      }
    },
  );
}

export function withSpanSync<T>(
  name: string,
  operation: (span: Span) => T,
): T {
  return startActiveSpan(
    name,
    (span) => {
      try {
        return operation(span);
      } catch (error) {
        span.recordException(error as Error);
        throw error;
      } finally {
        span.end();
      }
    },
  );
}