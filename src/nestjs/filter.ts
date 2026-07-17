import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

import {
  getComponentLogger,
} from '../logger/index.js';

import {
  getActiveSpan,
  recordException,
  setAttributes,
} from '../tracing/index.js';

@Catch()
export class TelemetryExceptionFilter
  implements ExceptionFilter
{
  private readonly logger =
    getComponentLogger('nestjs');

  catch(
    exception: unknown,
    host: ArgumentsHost,
  ): void {
    const context =
      host.switchToHttp();

    const request =
      context.getRequest();

    const response =
      context.getResponse();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const span = getActiveSpan();

    if (span) {
      recordException(exception);

      setAttributes({
        'http.status_code': status,
        'error': true,
      });
    }

    this.logger.error(
      {
        err: exception,

        method: request?.method,

        path:
          request?.route?.path ??
          request?.url,

        statusCode: status,
      },
      'Unhandled exception',
    );

    response.status(status).json({
      statusCode: status,

      timestamp:
        new Date().toISOString(),

      path:
        request?.url,
    });
  }
}