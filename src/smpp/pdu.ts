import type {
  SmppContext,
} from './types';

import {
  getSmppLifecycle,
} from './lifecycle';

export async function instrumentPdu<T>(
  context: SmppContext,
  handler: () => Promise<T>,
): Promise<T> {
  return getSmppLifecycle().execute(
    context,
    handler,
  );
}