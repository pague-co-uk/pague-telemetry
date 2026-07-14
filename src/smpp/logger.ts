import { Logger } from 'pino';

import { getComponentLogger } from '../logger';

import type {
  SmppContext,
} from './types';

let logger: Logger | undefined;

function smppLogger(): Logger {
  if (!logger) {
    logger = getComponentLogger('smpp');
  }

  return logger;
}

export function logBindStarted(
  context: SmppContext,
): void {
  smppLogger().info(
    {
      sessionId:
        context.session.sessionId,

      systemId:
        context.session.systemId,

      sequenceNumber:
        context.pdu.sequenceNumber,
    },
    'SMPP bind started',
  );
}

export function logBindCompleted(
  context: SmppContext,
): void {
  smppLogger().info(
    {
      sessionId:
        context.session.sessionId,

      systemId:
        context.session.systemId,

      sequenceNumber:
        context.pdu.sequenceNumber,
    },
    'SMPP bind completed',
  );
}

export function logBindFailed(
  context: SmppContext,
  error: unknown,
): void {
  smppLogger().error(
    {
      err: error,

      sessionId:
        context.session.sessionId,

      systemId:
        context.session.systemId,

      sequenceNumber:
        context.pdu.sequenceNumber,
    },
    'SMPP bind failed',
  );
}

export function logPduReceived(
  context: SmppContext,
): void {
  smppLogger().info(
    {
      command:
        context.pdu.command,

      sessionId:
        context.session.sessionId,

      sequenceNumber:
        context.pdu.sequenceNumber,

      messageId:
        context.pdu.messageId,
    },
    'SMPP PDU received',
  );
}

export function logPduProcessed(
  context: SmppContext,
  durationMs: number,
): void {
  smppLogger().info(
    {
      command:
        context.pdu.command,

      sessionId:
        context.session.sessionId,

      sequenceNumber:
        context.pdu.sequenceNumber,

      messageId:
        context.pdu.messageId,

      durationMs,
    },
    'SMPP PDU processed',
  );
}

export function logPduFailed(
  context: SmppContext,
  error: unknown,
): void {
  smppLogger().error(
    {
      err: error,

      command:
        context.pdu.command,

      sessionId:
        context.session.sessionId,

      sequenceNumber:
        context.pdu.sequenceNumber,

      messageId:
        context.pdu.messageId,
    },
    'SMPP PDU failed',
  );
}

export function logSessionConnected(
  sessionId: string,
  remoteAddress?: string,
): void {
  smppLogger().info(
    {
      sessionId,

      remoteAddress,
    },
    'SMPP session connected',
  );
}

export function logSessionDisconnected(
  sessionId: string,
): void {
  smppLogger().info(
    {
      sessionId,
    },
    'SMPP session disconnected',
  );
}