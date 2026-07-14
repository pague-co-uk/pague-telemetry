import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';

import {
  Observable,
  throwError,
} from 'rxjs';

import {
  catchError,
} from 'rxjs/operators';

import {
  recordException,
  setAttributes,
  spanNaming,
  withObservableSpan,
} from '../tracing';

import {
  getComponentLogger,
} from '../logger';

@Injectable()
export class TelemetryInterceptor
  implements NestInterceptor
{
  private readonly logger =
    getComponentLogger('nestjs');

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    const controller =
      context.getClass().name;

    const handler =
      context.getHandler().name;

    return withObservableSpan(
      spanNaming.nest(
        controller,
        handler,
      ),
      (span) => {
        span.setAttributes({
          'nestjs.controller': controller,
          'nestjs.handler': handler,
        });

        return next.handle().pipe(
          catchError((error) => {
            recordException(error, span);

            setAttributes(
              {
                error: true,
              },
              span,
            );

            this.logger.error(
              {
                err: error,
                controller,
                handler,
              },
              'Unhandled exception',
            );

            return throwError(
              () => error,
            );
          }),
        );
      },
    );
  }
}