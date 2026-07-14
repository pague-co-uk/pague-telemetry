import {
  createHttpRequestLifecycle,
} from './lifecycle';
import {
  HttpMiddleware,
  HttpOptions,
  HttpRequest,
  HttpResponse,
  NextFunction,
} from './types';

export function createHttpMiddleware(
  options: HttpOptions = {},
): HttpMiddleware {
  return (
    request: HttpRequest,
    response: HttpResponse,
    next: NextFunction,
  ): void => {
    const lifecycle =
      createHttpRequestLifecycle(
        request,
        response,
        options.context,
      );

    lifecycle.start();

    response.on?.(
      'finish',
      () => lifecycle.finish(),
    );

    response.on?.(
      'close',
      () => lifecycle.finish(),
    );

    try {
      next();
    } catch (error) {
      lifecycle.fail(error);

      throw error;
    }
  };
}