import {
  context,
} from '@opentelemetry/api';

import {
  extractContext,
} from './context';

import {
  getRabbitMqLifecycle,
  RabbitMqLifecycleContext,
} from './lifecycle';

import type {
  RabbitMqMessage,
} from './types';

export interface ConsumeChannel {
  consume(
    queue: string,
    handler: (
      message: RabbitMqMessage,
    ) => Promise<void>,
  ): Promise<void>;
}

function createLifecycleContext(
  queue: string,
  message: RabbitMqMessage,
): RabbitMqLifecycleContext {
  const lifecycle: RabbitMqLifecycleContext = {
    exchange: message.fields.exchange,
    routingKey:
      message.fields.routingKey,
    queue,
  };

  if (message.properties.messageId) {
    lifecycle.messageId =
      message.properties.messageId;
  }

  return lifecycle;
}

export async function consumeMessages(
  channel: ConsumeChannel,
  queue: string,
  handler: (
    message: RabbitMqMessage,
  ) => Promise<void>,
): Promise<void> {
  await channel.consume(
    queue,
    async (message) => {
      const otelContext =
        extractContext(
          message.properties,
        );

      await context.with(
        otelContext,
        async () => {
          await getRabbitMqLifecycle().consume(
            createLifecycleContext(
              queue,
              message,
            ),
            async () =>
              handler(message),
          );
        },
      );
    },
  );
}