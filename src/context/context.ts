import { getActiveSpan } from '../tracing/index.js';

import {
  clearContext,
  getContext,
  runWithContext,
  setContext,
} from './storage.js';
import type { RequestContext } from './types.js';

export function withContext<T>(
  context: RequestContext,
  callback: () => T,
): T {
  return runWithContext(context, () => {
    syncContextToSpan(context);

    return callback();
  });
}

export async function withContextAsync<T>(
  context: RequestContext,
  callback: () => Promise<T>,
): Promise<T> {
  return runWithContext(context, async () => {
    syncContextToSpan(context);

    return callback();
  });
}

export function currentContext(): Readonly<RequestContext> {
  return getContext();
}

export function updateContext(
  context: Partial<RequestContext>,
): void {
  setContext(context);

  syncContextToSpan(context);
}

export function clearCurrentContext(): void {
  clearContext();
}

export function getContextValue<
  K extends keyof RequestContext,
>(
  key: K,
): RequestContext[K] {
  return getContext()[key];
}

export function setContextValue<
  K extends keyof RequestContext,
>(
  key: K,
  value: RequestContext[K],
): void {
  const context: Partial<RequestContext> = {
    [key]: value,
  };

  setContext(context);

  syncContextToSpan(context);
}

function syncContextToSpan(
  context: Partial<RequestContext>,
): void {
  const span = getActiveSpan();

  if (!span) {
    return;
  }

  for (const [key, value] of Object.entries(context)) {
    if (value !== undefined) {
      span.setAttribute(key, value);
    }
  }
}