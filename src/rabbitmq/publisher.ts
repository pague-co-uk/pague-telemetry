import { injectContext } from './context.js';
import {
  getRabbitMqLifecycle,
  type RabbitMqLifecycleContext,
} from './lifecycle.js';

import type {
  RabbitMqPublishContext,
  RabbitMqPublishOptions,
} from './types.js';

export interface PublishChannel {
  publish(
    exchange: string,
    routingKey: string,
    content: Buffer,
    options?: RabbitMqPublishOptions,
  ): boolean;
}

function createLifecycleContext(
  publishContext: RabbitMqPublishContext,
  properties: RabbitMqPublishOptions,
): RabbitMqLifecycleContext {
  const context: RabbitMqLifecycleContext = {
    exchange: publishContext.exchange,
    routingKey: publishContext.routingKey,
  };

  if (properties.messageId) {
    context.messageId = properties.messageId;
  }

  return context;
}

export async function publishMessage(
  channel: PublishChannel,
  publishContext: RabbitMqPublishContext,
): Promise<boolean> {
  const properties: RabbitMqPublishOptions = {
    ...(publishContext.options ?? {}),
  };

  injectContext(properties);

  return getRabbitMqLifecycle().publish(
    createLifecycleContext(
      publishContext,
      properties,
    ),
    async () =>
      channel.publish(
        publishContext.exchange,
        publishContext.routingKey,
        publishContext.content,
        properties,
      ),
  );
}