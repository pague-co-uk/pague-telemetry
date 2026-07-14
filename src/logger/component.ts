import { Logger } from 'pino';

import { getLogger } from './logger';

const componentLoggers = new Map<
  string,
  Logger
>();

export function getComponentLogger(
  component: string,
): Logger {
  let logger = componentLoggers.get(
    component,
  );

  if (!logger) {
    logger = getLogger().child({
      component,
    });

    componentLoggers.set(
      component,
      logger,
    );
  }

  return logger;
}

export function clearComponentLoggers(): void {
  componentLoggers.clear();
}