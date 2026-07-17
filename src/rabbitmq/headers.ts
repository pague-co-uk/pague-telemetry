import type {
  RabbitMqHeaderValue,
  RabbitMqHeaders,
  RabbitMqMessageProperties,
} from './types.js';

export function setHeader(
  properties: RabbitMqMessageProperties,
  key: string,
  value: RabbitMqHeaderValue,
): void {
  if (value === undefined || value === null) {
    return;
  }

  if (!properties.headers) {
    properties.headers = {} as RabbitMqHeaders;
  }

  properties.headers[key] = value;
}

export function getHeader<T extends RabbitMqHeaderValue>(
  properties: RabbitMqMessageProperties,
  key: string,
): T | undefined {
  return properties.headers?.[key] as T | undefined;
}

export function injectHeaders(
  properties: RabbitMqMessageProperties,
  headers: RabbitMqHeaders,
): void {
  if (!properties.headers) {
    properties.headers = {} as RabbitMqHeaders;
  }

  Object.assign(properties.headers, headers);
}

export function extractHeaders(
  properties: RabbitMqMessageProperties,
): RabbitMqHeaders {
  return properties.headers ?? {};
}