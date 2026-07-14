import { Logger } from 'pino';

import {
  getComponentLogger,
} from '../logger';

import type {
  RabbitMqLifecycleContext,
} from './lifecycle';

let logger: Logger | undefined;

function rabbitMqLogger(): Logger {
  if (!logger) {
    logger =
      getComponentLogger(
        'rabbitmq',
      );
  }

  return logger;
}

export function logPublishStarted(
  context: RabbitMqLifecycleContext,
): void {
  rabbitMqLogger().info(
    {
      exchange: context.exchange,

      routingKey:
        context.routingKey,

      queue: context.queue,

      messageId:
        context.messageId,
    },
    'Publishing RabbitMQ message',
  );
}

export function logPublishCompleted(
  context: RabbitMqLifecycleContext,
): void {
  rabbitMqLogger().info(
    {
      exchange: context.exchange,

      routingKey:
        context.routingKey,

      queue: context.queue,

      messageId:
        context.messageId,
    },
    'RabbitMQ message published',
  );
}

export function logPublishFailed(
  context: RabbitMqLifecycleContext,
  error: unknown,
): void {
  rabbitMqLogger().error(
    {
      err: error,

      exchange: context.exchange,

      routingKey:
        context.routingKey,

      queue: context.queue,

      messageId:
        context.messageId,
    },
    'RabbitMQ publish failed',
  );
}

export function logConsumeStarted(
  context: RabbitMqLifecycleContext,
): void {
  rabbitMqLogger().info(
    {
      exchange: context.exchange,

      routingKey:
        context.routingKey,

      queue: context.queue,

      messageId:
        context.messageId,
    },
    'Consuming RabbitMQ message',
  );
}

export function logConsumeCompleted(
  context: RabbitMqLifecycleContext,
): void {
  rabbitMqLogger().info(
    {
      exchange: context.exchange,

      routingKey:
        context.routingKey,

      queue: context.queue,

      messageId:
        context.messageId,
    },
    'RabbitMQ message processed',
  );
}

export function logConsumeFailed(
  context: RabbitMqLifecycleContext,
  error: unknown,
): void {
  rabbitMqLogger().error(
    {
      err: error,

      exchange: context.exchange,

      routingKey:
        context.routingKey,

      queue: context.queue,

      messageId:
        context.messageId,
    },
    'RabbitMQ message processing failed',
  );
}