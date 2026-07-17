import { performance } from 'node:perf_hooks';

import { getComponentLogger } from '../logger/index.js';
import {
  spanNaming,
  withPromiseSpan,
} from '../tracing/index.js';

import {
  RabbitMqComponent,
} from './constants.js';

import {
  recordConsume,
  recordConsumeDuration,
  recordFailure,
  recordPublish,
  recordPublishDuration,
} from './metrics.js';

export interface RabbitMqLifecycleContext {
  exchange: string;

  routingKey: string;

  queue?: string;

  messageId?: string;
}

export class RabbitMqLifecycle {
  private readonly logger =
    getComponentLogger(
      RabbitMqComponent,
    );

  /**
   * Executes a RabbitMQ publish operation with
   * tracing, logging and metrics.
   */
  async publish<T>(
    context: RabbitMqLifecycleContext,
    callback: () => Promise<T>,
  ): Promise<T> {
    const startedAt = performance.now();

    return withPromiseSpan(
      spanNaming.rabbitmq(
        context.exchange,
        context.routingKey,
      ),
      async (span) => {
        span.setAttributes({
          'messaging.system':
            'rabbitmq',

          'messaging.destination':
            context.exchange,

          'messaging.rabbitmq.routing_key':
            context.routingKey,
        });

        this.logger.info(
          {
            exchange:
              context.exchange,

            routingKey:
              context.routingKey,

            queue:
              context.queue,

            messageId:
              context.messageId,
          },
          'Publishing RabbitMQ message',
        );

        try {
          const result =
            await callback();

          recordPublish();

          recordPublishDuration(
            performance.now() -
              startedAt,
          );

          this.logger.info(
            {
              exchange:
                context.exchange,

              routingKey:
                context.routingKey,

                queue:
              context.queue,

              messageId:
                context.messageId,
            },
            'RabbitMQ message published',
          );

          return result;
        } catch (error) {
          recordFailure();

          this.logger.error(
            {
              err: error,

              exchange:
                context.exchange,

              routingKey:
                context.routingKey,

              queue:
                context.queue,

              messageId:
                context.messageId,
            },
            'RabbitMQ publish failed',
          );

          throw error;
        }
      },
    );
  }

  /**
   * Executes a RabbitMQ consumer operation with
   * tracing, logging and metrics.
   */
  async consume<T>(
    context: RabbitMqLifecycleContext,
    callback: () => Promise<T>,
  ): Promise<T> {
    const startedAt = performance.now();

    return withPromiseSpan(
      spanNaming.rabbitmq(
        context.exchange,
        context.routingKey,
      ),
      async (span) => {
        span.setAttributes({
          'messaging.system':
            'rabbitmq',

          'messaging.destination':
            context.exchange,

          'messaging.rabbitmq.routing_key':
            context.routingKey,

          ...(context.queue && {
            'messaging.rabbitmq.queue':
              context.queue,
          }),
        });

        this.logger.info(
          {
            exchange:
              context.exchange,

            routingKey:
              context.routingKey,

            queue:
              context.queue,

            messageId:
              context.messageId,
          },
          'Consuming RabbitMQ message',
        );

        try {
          const result =
            await callback();

          recordConsume();

          recordConsumeDuration(
            performance.now() -
              startedAt,
          );

          this.logger.info(
            {
              exchange:
                context.exchange,

              routingKey:
                context.routingKey,

              queue:
                context.queue,

              messageId:
                context.messageId,
            },
            'RabbitMQ message processed',
          );

          return result;
        } catch (error) {
          recordFailure();

          this.logger.error(
            {
              err: error,

              exchange:
                context.exchange,

              routingKey:
                context.routingKey,

              queue:
                context.queue,

              messageId:
                context.messageId,
            },
            'RabbitMQ message processing failed',
          );

          throw error;
        }
      },
    );
  }
}

let lifecycle: RabbitMqLifecycle | undefined;

export function getRabbitMqLifecycle(): RabbitMqLifecycle {
  if (!lifecycle) {
    lifecycle = new RabbitMqLifecycle();
  }

  return lifecycle;
}