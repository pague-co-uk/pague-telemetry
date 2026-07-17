import { MetricRegistry } from './MetricRegistry.js';
import { GaugeMetric } from '../wrappers/GaugeMetric.js';

export const gaugeRegistry =
  new MetricRegistry<GaugeMetric>();