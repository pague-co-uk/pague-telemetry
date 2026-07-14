import {
  DEFAULT_ENVIRONMENT,
  DEFAULT_LOG_LEVEL,
} from './constants';

export function getEnv(
  key: string,
  fallback?: string,
): string | undefined {
  const value = process.env[key];

  if (value === undefined || value.trim() === '') {
    return fallback;
  }

  return value;
}

export function getRequiredEnv(
  key: string,
): string {
  const value = getEnv(key);

  if (!value) {
    throw new Error(
      `Missing required environment variable: ${key}`,
    );
  }

  return value;
}

export function getBooleanEnv(
  key: string,
  fallback = false,
): boolean {
  const value = getEnv(key);

  if (!value) {
    return fallback;
  }

  return ['true', '1', 'yes', 'on'].includes(
    value.toLowerCase(),
  );
}

export function getNumberEnv(
  key: string,
  fallback: number,
): number {
  const value = getEnv(key);

  if (!value) {
    return fallback;
  }

  const parsed = Number(value);

  return Number.isNaN(parsed)
    ? fallback
    : parsed;
}

export function getLogLevel(): string {
  return getEnv(
    'LOG_LEVEL',
    DEFAULT_LOG_LEVEL,
  )!;
}

export function getEnvironment(): string {
  return getEnv(
    'NODE_ENV',
    DEFAULT_ENVIRONMENT,
  )!;
}