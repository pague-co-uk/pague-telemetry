import type { ObservableGauge } from '@opentelemetry/api';

import { mergeMetricAttributes } from '../context.js';
import { createGauge } from '../gauge.js';
import { gaugeRegistry } from '../registry/gauge.js';
import type {
  GaugeMetricOptions,
  MetricAttributes,
} from '../types.js';

export class GaugeMetric {
  private readonly gauge: ObservableGauge;

  constructor(
    options: GaugeMetricOptions,
    observe: () => number,
    attributes?: MetricAttributes,
  ) {
    this.gauge = createGauge(
      options.name,
      (observableResult) => {
        observableResult.observe(
          observe(),
          mergeMetricAttributes(attributes),
        );
      },
      {
        ...(options.description && {
          description: options.description,
        }),
        ...(options.unit && {
          unit: options.unit,
        }),
      },
    );
  }

  getInstrument(): ObservableGauge {
    return this.gauge;
  }
}

export function createGaugeMetric(
  options: GaugeMetricOptions,
  observe: () => number,
  attributes?: MetricAttributes,
): GaugeMetric {
  const existing = gaugeRegistry.get(options.name);

  if (existing) {
    return existing;
  }

  const gauge = new GaugeMetric(
    options,
    observe,
    attributes,
  );

  return gaugeRegistry.register(
    options.name,
    gauge,
  );
}