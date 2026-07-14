import { MetricRegistry } from './MetricRegistry';

import { UpDownCounterMetric } from '../up-down-counter/metric';

export const upDownCounterRegistry =
  new MetricRegistry<UpDownCounterMetric>();