import { Observable } from 'rxjs';

import { Span } from '@opentelemetry/api';

import {
  failSpan,
  finishSpan,
  startSpan,
} from './span';

export function traceObservable<T>(
  name: string,
  source: Observable<T>,
  attributes?: Record<
    string,
    string | number | boolean
  >,
): Observable<T> {
  return new Observable<T>((subscriber) => {
    const span = startSpan(name);

    if (attributes) {
      span.setAttributes(attributes);
    }

    const subscription = source.subscribe({
      next(value) {
        subscriber.next(value);
      },

      error(error) {
        failSpan(span, error);

        subscriber.error(error);
      },

      complete() {
        finishSpan(span);

        subscriber.complete();
      },
    });

    return () => {
      if (!subscription.closed) {
        subscription.unsubscribe();
      }

      span.end();
    };
  });
}