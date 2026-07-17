import { MetricRegistry } from './MetricRegistry.js';

import { UpDownCounterMetric } from '../up-down-counter/metric.js';

export const upDownCounterRegistry =
  new MetricRegistry<UpDownCounterMetric>();