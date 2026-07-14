/**
 * RabbitMQ message headers used by the SDK.
 */
export const RabbitMqHeaders = {
  TRACE_PARENT: 'traceparent',

  TRACE_STATE: 'tracestate',

  REQUEST_ID: 'x-request-id',

  CORRELATION_ID: 'x-correlation-id',

  TENANT_ID: 'x-tenant-id',

  CLIENT_ID: 'x-client-id',

  MESSAGE_ID: 'message-id',
} as const;

/**
 * Standard metric names emitted by the RabbitMQ module.
 */
export const RabbitMqMetrics = {
  PUBLISHED:
    'rabbitmq.messages.published',

  CONSUMED:
    'rabbitmq.messages.consumed',

  FAILED:
    'rabbitmq.messages.failed',

  PUBLISH_DURATION:
    'rabbitmq.publish.duration',

  CONSUME_DURATION:
    'rabbitmq.consume.duration',

  ACTIVE_CONSUMERS:
    'rabbitmq.active.consumers',
} as const;

/**
 * Default logger component.
 */
export const RabbitMqComponent = 'rabbitmq';