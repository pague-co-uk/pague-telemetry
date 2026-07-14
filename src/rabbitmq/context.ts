import {
  Context,
  TextMapGetter,
  TextMapSetter,
  context,
  propagation,
} from '@opentelemetry/api';

import type {
  RequestContext,
} from '../context/types';

import {
  currentContext,
  updateContext,
} from '../context/context';

import {
  RabbitMqHeaders as HeaderNames,
} from './constants';

import type {
  RabbitMqMessageProperties,
  RabbitMqHeaders,
  TelemetryHeaders,
} from './types';

const setter: TextMapSetter<TelemetryHeaders> = {
  set(carrier, key, value) {
    carrier[key] = value;
  },
};

const getter: TextMapGetter<TelemetryHeaders> = {
  keys(carrier) {
    return Object.keys(carrier);
  },

  get(carrier, key) {
    return carrier[key];
  },
};

export function injectContext(
  properties: RabbitMqMessageProperties,
): RabbitMqMessageProperties {
  properties.headers ??= {};

  const telemetryHeaders: TelemetryHeaders = {};

  propagation.inject(
    context.active(),
    telemetryHeaders,
    setter,
  );

  Object.assign(
    properties.headers,
    telemetryHeaders,
  );

  const sdkContext = currentContext();

  if (sdkContext.requestId) {
    properties.headers[
      HeaderNames.REQUEST_ID
    ] = sdkContext.requestId;
  }

  if (sdkContext.correlationId) {
    properties.headers[
      HeaderNames.CORRELATION_ID
    ] = sdkContext.correlationId;
  }

  if (sdkContext.tenantId) {
    properties.headers[
      HeaderNames.TENANT_ID
    ] = sdkContext.tenantId;
  }

  if (sdkContext.clientId) {
    properties.headers[
      HeaderNames.CLIENT_ID
    ] = sdkContext.clientId;
  }

  return properties;
}

export function extractContext(
  properties: RabbitMqMessageProperties,
): Context {
  const headers: RabbitMqHeaders =
    properties.headers ?? {};

  const telemetryHeaders: TelemetryHeaders =
    {};

  for (const [key, value] of Object.entries(
    headers,
  )) {
    if (typeof value === 'string') {
      telemetryHeaders[key] = value;
    }
  }

  const update: Partial<RequestContext> =
    {};

  const requestId =
    headers[
      HeaderNames.REQUEST_ID
    ];

  if (typeof requestId === 'string') {
    update.requestId = requestId;
  }

  const correlationId =
    headers[
      HeaderNames.CORRELATION_ID
    ];

  if (
    typeof correlationId ===
    'string'
  ) {
    update.correlationId =
      correlationId;
  }

  const tenantId =
    headers[
      HeaderNames.TENANT_ID
    ];

  if (typeof tenantId === 'string') {
    update.tenantId = tenantId;
  }

  const clientId =
    headers[
      HeaderNames.CLIENT_ID
    ];

  if (typeof clientId === 'string') {
    update.clientId = clientId;
  }

  updateContext(update);

  return propagation.extract(
    context.active(),
    telemetryHeaders,
    getter,
  );
}