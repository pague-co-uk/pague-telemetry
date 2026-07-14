import { MetricRegistry } from './MetricRegistry';
import { HistogramMetric } from '../wrappers/HistogramMetric';

export const histogramRegistry =
  new MetricRegistry<HistogramMetric>();