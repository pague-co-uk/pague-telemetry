import {
  createCounterMetric,
  createHistogramMetric,
  createUpDownCounterMetric,
} from '../metrics';

import {
  SmppMetrics,
} from './constants';

const bindCounter =
  createCounterMetric({
    name: SmppMetrics.BIND_TOTAL,
    description:
      'Total SMPP bind requests',
  });

const failedBindCounter =
  createCounterMetric({
    name: SmppMetrics.BIND_FAILED,
    description:
      'Total failed SMPP bind requests',
  });

const submitCounter =
  createCounterMetric({
    name: SmppMetrics.SUBMIT_TOTAL,
    description:
      'Total submit_sm PDUs',
  });

const failedSubmitCounter =
  createCounterMetric({
    name: SmppMetrics.SUBMIT_FAILED,
    description:
      'Total failed submit_sm PDUs',
  });

const deliverCounter =
  createCounterMetric({
    name: SmppMetrics.DELIVER_TOTAL,
    description:
      'Total deliver_sm PDUs',
  });

const failedDeliverCounter =
  createCounterMetric({
    name: SmppMetrics.DELIVER_FAILED,
    description:
      'Total failed deliver_sm PDUs',
  });

const enquireLinkCounter =
  createCounterMetric({
    name:
      SmppMetrics.ENQUIRE_LINK_TOTAL,
    description:
      'Total enquire_link PDUs',
  });

const unbindCounter =
  createCounterMetric({
    name:
      SmppMetrics.UNBIND_TOTAL,
    description:
      'Total unbind PDUs',
  });

const activeSessionsCounter =
  createUpDownCounterMetric({
    name:
      SmppMetrics.ACTIVE_SESSIONS,
    description:
      'Number of active SMPP sessions',
  });

const pduDurationHistogram =
  createHistogramMetric({
    name:
      SmppMetrics.PDU_DURATION,
    description:
      'SMPP PDU processing duration',
    unit: 'ms',
  });

export function recordBind(): void {
  bindCounter.increment();
}

export function recordFailedBind(): void {
  failedBindCounter.increment();
}

export function recordSubmit(): void {
  submitCounter.increment();
}

export function recordFailedSubmit(): void {
  failedSubmitCounter.increment();
}

export function recordDeliver(): void {
  deliverCounter.increment();
}

export function recordFailedDeliver(): void {
  failedDeliverCounter.increment();
}

export function recordEnquireLink(): void {
  enquireLinkCounter.increment();
}

export function recordUnbind(): void {
  unbindCounter.increment();
}

export function incrementActiveSessions(): void {
  activeSessionsCounter.increment();
}

export function decrementActiveSessions(): void {
  activeSessionsCounter.decrement();
}

export function recordPduDuration(
  durationMs: number,
): void {
  pduDurationHistogram.record(
    durationMs,
  );
}