import {
  type AttributeValue,
  type Attributes,
  type Span,
} from '@opentelemetry/api';

import { getActiveSpan } from './span.js';

export function setAttribute(
  key: string,
  value: AttributeValue,
  span?: Span,
): void {
  const activeSpan = span ?? getActiveSpan();

  if (!activeSpan) {
    return;
  }

  activeSpan.setAttribute(key, value);
}

export function setAttributes(
  attributes: Attributes,
  span?: Span,
): void {
  const activeSpan = span ?? getActiveSpan();

  if (!activeSpan) {
    return;
  }

  activeSpan.setAttributes(attributes);
}

export function addEvent(
  name: string,
  attributes?: Attributes,
  span?: Span,
): void {
  const activeSpan = span ?? getActiveSpan();

  if (!activeSpan) {
    return;
  }

  activeSpan.addEvent(name, attributes);
}

export function recordException(
  exception: unknown,
  span?: Span,
): void {
  const activeSpan = span ?? getActiveSpan();

  if (!activeSpan) {
    return;
  }

  if (exception instanceof Error) {
    activeSpan.recordException(exception);

    return;
  }

  activeSpan.addEvent('exception', {
    'exception.type': typeof exception,
    'exception.message': String(exception),
  });
}

export function setStatus(
  code: Parameters<Span['setStatus']>[0]['code'],
  message?: string,
  span?: Span,
): void {
  const activeSpan = span ?? getActiveSpan();

  if (!activeSpan) {
    return;
  }

  activeSpan.setStatus({
    code,
    ...(message && { message }),
  });
}