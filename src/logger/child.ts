import type { Bindings, ChildLoggerOptions, Logger } from 'pino';

import { getLogger } from './logger.js';

export function createChildLogger(
  bindings: Bindings,
  options?: ChildLoggerOptions,
): Logger {
  return getLogger().child(bindings, options);
}