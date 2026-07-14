import { MetricRegistry } from './MetricRegistry';
import { CounterMetric } from '../wrappers/CounterMetric';

export const counterRegistry =
  new MetricRegistry<CounterMetric>();