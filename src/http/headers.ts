import { randomUUID } from 'node:crypto';

import {
  CORRELATION_ID_HEADER,
  REQUEST_ID_HEADER,
} from './constants.js';
import type { HttpRequest } from './types.js';

export function getHeader(
  request: HttpRequest,
  name: string,
): string | undefined {
  if (request.get) {
    return request.get(name);
  }

  if (request.header) {
    return request.header(name);
  }

  const header = request.headers[name.toLowerCase()];

  if (Array.isArray(header)) {
    return header[0];
  }

  return header;
}

export function getRequestId(
  request: HttpRequest,
  headerName = REQUEST_ID_HEADER,
): string {
  return (
    getHeader(request, headerName) ??
    randomUUID()
  );
}

export function getCorrelationId(
  request: HttpRequest,
  headerName = CORRELATION_ID_HEADER,
): string {
  return (
    getHeader(request, headerName) ??
    randomUUID()
  );
}

export function setHeader(
  response: {
    setHeader(
      name: string,
      value: string,
    ): void;
  },
  name: string,
  value: string,
): void {
  response.setHeader(name, value);
}

export function setRequestId(
  response: {
    setHeader(
      name: string,
      value: string,
    ): void;
  },
  requestId: string,
  headerName = REQUEST_ID_HEADER,
): void {
  setHeader(
    response,
    headerName,
    requestId,
  );
}

export function setCorrelationId(
  response: {
    setHeader(
      name: string,
      value: string,
    ): void;
  },
  correlationId: string,
  headerName = CORRELATION_ID_HEADER,
): void {
  setHeader(
    response,
    headerName,
    correlationId,
  );
}