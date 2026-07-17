import {
  createCounterMetric,
  createHistogramMetric,
  createUpDownCounterMetric,
} from '../metrics/index.js';
import { createLazyMetricBundle } from '../metrics/lazy.js';
import type {
  CounterMetric,
  HistogramMetric,
  UpDownCounterMetric,
} from '../metrics/index.js';

import {
  SmppMetrics,
} from './constants.js';

interface SmppMetricBundle {
  bindCounter: CounterMetric;
  failedBindCounter: CounterMetric;
  submitCounter: CounterMetric;
  failedSubmitCounter: CounterMetric;
  deliverCounter: CounterMetric;
  failedDeliverCounter: CounterMetric;
  enquireLinkCounter: CounterMetric;
  unbindCounter: CounterMetric;
  activeSessionsCounter: UpDownCounterMetric;
  pduDurationHistogram: HistogramMetric;
}

const getMetrics = createLazyMetricBundle<SmppMetricBundle>(
  () => ({
    bindCounter: createCounterMetric({
      name: SmppMetrics.BIND_TOTAL,
      description: 'Total SMPP bind requests',
    }),
    failedBindCounter: createCounterMetric({
      name: SmppMetrics.BIND_FAILED,
      description: 'Total failed SMPP bind requests',
    }),
    submitCounter: createCounterMetric({
      name: SmppMetrics.SUBMIT_TOTAL,
      description: 'Total submit_sm PDUs',
    }),
    failedSubmitCounter: createCounterMetric({
      name: SmppMetrics.SUBMIT_FAILED,
      description: 'Total failed submit_sm PDUs',
    }),
    deliverCounter: createCounterMetric({
      name: SmppMetrics.DELIVER_TOTAL,
      description: 'Total deliver_sm PDUs',
    }),
    failedDeliverCounter: createCounterMetric({
      name: SmppMetrics.DELIVER_FAILED,
      description: 'Total failed deliver_sm PDUs',
    }),
    enquireLinkCounter: createCounterMetric({
      name: SmppMetrics.ENQUIRE_LINK_TOTAL,
      description: 'Total enquire_link PDUs',
    }),
    unbindCounter: createCounterMetric({
      name: SmppMetrics.UNBIND_TOTAL,
      description: 'Total unbind PDUs',
    }),
    activeSessionsCounter: createUpDownCounterMetric({
      name: SmppMetrics.ACTIVE_SESSIONS,
      description: 'Number of active SMPP sessions',
    }),
    pduDurationHistogram: createHistogramMetric({
      name: SmppMetrics.PDU_DURATION,
      description: 'SMPP PDU processing duration',
      unit: 'ms',
    }),
  }),
);

export function recordBind(): void {
  getMetrics().bindCounter.increment();
}

export function recordFailedBind(): void {
  getMetrics().failedBindCounter.increment();
}

export function recordSubmit(): void {
  getMetrics().submitCounter.increment();
}

export function recordFailedSubmit(): void {
  getMetrics().failedSubmitCounter.increment();
}

export function recordDeliver(): void {
  getMetrics().deliverCounter.increment();
}

export function recordFailedDeliver(): void {
  getMetrics().failedDeliverCounter.increment();
}

export function recordEnquireLink(): void {
  getMetrics().enquireLinkCounter.increment();
}

export function recordUnbind(): void {
  getMetrics().unbindCounter.increment();
}

export function incrementActiveSessions(): void {
  getMetrics().activeSessionsCounter.increment();
}

export function decrementActiveSessions(): void {
  getMetrics().activeSessionsCounter.decrement();
}

export function recordPduDuration(
  durationMs: number,
): void {
  getMetrics().pduDurationHistogram.record(
    durationMs,
  );
}
