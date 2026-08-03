import { performance } from 'node:perf_hooks';
import { context, trace } from '@opentelemetry/api';

import {
  establishRequestContext,
} from './context.js';
import {
  logRequestCompleted,
  logRequestFailed,
  logRequestStarted,
} from './logger.js';
import { getHttpMetrics } from './metrics.js';
import {
  finishHttpSpan,
  failHttpSpan,
  startHttpSpan,
} from './tracing.js';
import type {
  HttpContextOptions,
  HttpRequest,
  HttpResponse,
} from './types.js';

function routeFor(request: HttpRequest): string {
  if (request.route?.path) {
    return `${request.baseUrl ?? ''}${request.route.path}`;
  }

  return request.path ?? request.url.split('?')[0] ?? request.url;
}

export class HttpRequestLifecycle {
  private readonly startTime: number;

  private readonly span;

  private readonly metrics = getHttpMetrics();

  private completed = false;

  constructor(
    private readonly request: HttpRequest,
    private readonly response: HttpResponse,
    contextOptions?: HttpContextOptions,
  ) {
    establishRequestContext(
      request,
      response,
      contextOptions,
    );

    this.span = startHttpSpan(request);

    this.startTime = performance.now();
  }

  start(): void {
    this.metrics.requestStarted({
      method: this.request.method,
      route: routeFor(this.request),
    });

    logRequestStarted(this.request);
  }

  finish(): void {
    if (this.completed) {
      return;
    }

    this.completed = true;

    const duration =
      performance.now() - this.startTime;

    this.metrics.requestCompleted(
      duration,
      {
        method: this.request.method,
        route: routeFor(this.request),
        status: this.response.statusCode,
      },
    );

    logRequestCompleted(
      this.request,
      this.response.statusCode,
      duration,
    );

    finishHttpSpan(
      this.span,
      this.response.statusCode,
    );
  }

  fail(error: unknown): void {
    if (this.completed) {
      return;
    }

    this.completed = true;

    const duration =
      performance.now() - this.startTime;

    this.metrics.requestCompleted(
      duration,
      {
        method: this.request.method,
        route: routeFor(this.request),
        status: this.response.statusCode || 500,
      },
    );

    logRequestFailed(
      this.request,
      error,
      this.response.statusCode || 500,
      duration,
    );

    failHttpSpan(
      this.span,
      error,
      this.response.statusCode || 500,
    );
  }

  run<T>(callback: () => T): T {
    return context.with(
      trace.setSpan(context.active(), this.span),
      callback,
    );
  }
}

export function createHttpRequestLifecycle(
  request: HttpRequest,
  response: HttpResponse,
  contextOptions?: HttpContextOptions,
): HttpRequestLifecycle {
  return new HttpRequestLifecycle(
    request,
    response,
    contextOptions,
  );
}
