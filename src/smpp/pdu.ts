import type {
  SmppContext,
} from './types.js';

import {
  getSmppLifecycle,
} from './lifecycle.js';

export async function instrumentPdu<T>(
  context: SmppContext,
  handler: () => Promise<T>,
): Promise<T> {
  return getSmppLifecycle().execute(
    context,
    handler,
  );
}