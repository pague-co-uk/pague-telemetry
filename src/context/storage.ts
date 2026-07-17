import { AsyncLocalStorage } from 'node:async_hooks';

import type { RequestContext } from './types.js';

const storage = new AsyncLocalStorage<RequestContext>();

export function runWithContext<T>(
  context: RequestContext,
  callback: () => T,
): T {
  return storage.run(context, callback);
}

export function getContext(): RequestContext {
  return storage.getStore() ?? {};
}

export function setContext(
  context: Partial<RequestContext>,
): void {
  const current = getContext();

  storage.enterWith({
    ...current,
    ...context,
  });
}

export function clearContext(): void {
  storage.enterWith({});
}