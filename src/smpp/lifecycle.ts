import { performance } from 'node:perf_hooks';

import {
  spanNaming,
  withPromiseSpan,
} from '../tracing';

import {
  SmppAttributes,
  SmppCommands,
} from './constants';

import {
  logBindCompleted,
  logBindFailed,
  logBindStarted,
  logPduFailed,
  logPduProcessed,
  logPduReceived,
} from './logger';

import {
  recordBind,
  recordDeliver,
  recordEnquireLink,
  recordFailedBind,
  recordFailedDeliver,
  recordFailedSubmit,
  recordPduDuration,
  recordSubmit,
  recordUnbind,
} from './metrics';

import type {
  SmppContext,
  SmppExecutionResult,
  SmppOptions,
} from './types';

export class SmppLifecycle {
  async execute<T>(
    context: SmppContext,
    callback: () => Promise<
      T | SmppExecutionResult<T>
    >,
    options: SmppOptions = {},
  ): Promise<T> {
    const startedAt =
      performance.now();

    return withPromiseSpan(
      spanNaming.smpp(
        context.pdu.command,
      ),
      async (span) => {
        span.setAttributes({
          [SmppAttributes.SYSTEM]:
            'smpp',

          [SmppAttributes.COMMAND]:
            context.pdu.command,

          [SmppAttributes.SEQUENCE_NUMBER]:
            context.pdu.sequenceNumber,

          ...(context.session.systemId && {
            [SmppAttributes.SYSTEM_ID]:
              context.session.systemId,
          }),

          [SmppAttributes.SESSION_ID]:
            context.session.sessionId,

          ...(context.pdu.messageId && {
            [SmppAttributes.MESSAGE_ID]:
              context.pdu.messageId,
          }),
        });

        if (
          context.pdu.command ===
            SmppCommands.BIND_RECEIVER ||
          context.pdu.command ===
            SmppCommands.BIND_TRANSMITTER ||
          context.pdu.command ===
            SmppCommands.BIND_TRANSCEIVER
        ) {
          logBindStarted(
            context,
          );
        } else {
          logPduReceived(
            context,
          );
        }

        try {
          const response =
            await callback();

          const durationMs =
            performance.now() -
            startedAt;

          recordMetrics(
            context,
            false,
          );

          recordPduDuration(
            durationMs,
          );

          if (
            context.pdu.command ===
              SmppCommands.BIND_RECEIVER ||
            context.pdu.command ===
              SmppCommands.BIND_TRANSMITTER ||
            context.pdu.command ===
              SmppCommands.BIND_TRANSCEIVER
          ) {
            logBindCompleted(
              context,
            );
          } else {
            logPduProcessed(
              context,
              durationMs,
            );
          }

          if (
            isExecutionResult(
              response,
            )
          ) {
            return response.result;
          }

          return response;
        } catch (error) {
          const durationMs =
            performance.now() -
            startedAt;

          recordMetrics(
            context,
            true,
          );

          recordPduDuration(
            durationMs,
          );

          if (
            context.pdu.command ===
              SmppCommands.BIND_RECEIVER ||
            context.pdu.command ===
              SmppCommands.BIND_TRANSMITTER ||
            context.pdu.command ===
              SmppCommands.BIND_TRANSCEIVER
          ) {
            logBindFailed(
              context,
              error,
            );
          } else {
            logPduFailed(
              context,
              error,
            );
          }

          throw error;
        }
      },
    );
  }
}

function recordMetrics(
  context: SmppContext,
  failed: boolean,
): void {
  switch (
    context.pdu.command
  ) {
    case SmppCommands.BIND_RECEIVER:
    case SmppCommands.BIND_TRANSMITTER:
    case SmppCommands.BIND_TRANSCEIVER:
      failed
        ? recordFailedBind()
        : recordBind();
      break;

    case SmppCommands.SUBMIT_SM:
      failed
        ? recordFailedSubmit()
        : recordSubmit();
      break;

    case SmppCommands.DELIVER_SM:
      failed
        ? recordFailedDeliver()
        : recordDeliver();
      break;

    case SmppCommands.ENQUIRE_LINK:
      recordEnquireLink();
      break;

    case SmppCommands.UNBIND:
      recordUnbind();
      break;
  }
}

function isExecutionResult<T>(
  value: unknown,
): value is SmppExecutionResult<T> {
  return (
    typeof value ===
      'object' &&
    value !== null &&
    'result' in value
  );
}

let lifecycle:
  | SmppLifecycle
  | undefined;

export function getSmppLifecycle(): SmppLifecycle {
  if (!lifecycle) {
    lifecycle =
      new SmppLifecycle();
  }

  return lifecycle;
}