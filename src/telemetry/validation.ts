import type { TelemetryConfig } from '../types';

import { DEFAULT_EXPORT_INTERVAL_MILLIS } from '../common/constants';
import { InvalidConfigurationError } from '../common/errors';

const VALID_LOG_LEVELS = [
  'trace',
  'debug',
  'info',
  'warn',
  'error',
  'fatal',
] as const;

export function validateTelemetryConfig(
  config: TelemetryConfig,
): void {
  validateService(config);

  validateCollector(config);

  validateMetrics(config);

  validateLogger(config);
}

function validateService(
  config: TelemetryConfig,
): void {
  if (!config.service.name.trim()) {
    throw new InvalidConfigurationError(
      'service.name is required.',
    );
  }
}

function validateCollector(
  config: TelemetryConfig,
): void {
  validateUrl(
    config.collector.tracesEndpoint,
    'collector.tracesEndpoint',
  );

  validateUrl(
    config.collector.metricsEndpoint,
    'collector.metricsEndpoint',
  );
}

function validateMetrics(
  config: TelemetryConfig,
): void {
  if (
    config.metrics.exportIntervalMillis <= 0
  ) {
    throw new InvalidConfigurationError(
      `metrics.exportIntervalMillis must be greater than zero. Default: ${DEFAULT_EXPORT_INTERVAL_MILLIS}ms.`,
    );
  }
}

function validateLogger(
  config: TelemetryConfig,
): void {
  if (!config.logger) {
    return;
  }

  if (
    config.logger.level &&
    !VALID_LOG_LEVELS.includes(
      config.logger.level as (typeof VALID_LOG_LEVELS)[number],
    )
  ) {
    throw new InvalidConfigurationError(
      `logger.level must be one of: ${VALID_LOG_LEVELS.join(', ')}`,
    );
  }

  if (
    config.logger.transport?.file?.enabled &&
    !config.logger.transport.file.path.trim()
  ) {
    throw new InvalidConfigurationError(
      'logger.transport.file.path is required when file logging is enabled.',
    );
  }
}

function validateUrl(
  value: string,
  property: string,
): void {
  try {
    new URL(value);
  } catch {
    throw new InvalidConfigurationError(
      `${property} must be a valid URL.`,
    );
  }
}