import { MetricRegistry } from './MetricRegistry';
import { GaugeMetric } from '../wrappers/GaugeMetric';

export const gaugeRegistry =
  new MetricRegistry<GaugeMetric>();