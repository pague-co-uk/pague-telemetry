import type { MetricAttributes } from './types.js';

let commonAttributes: MetricAttributes = {};

export function setCommonMetricAttributes(
  attributes: MetricAttributes,
): void {
  commonAttributes = {
    ...attributes,
  };
}

export function getCommonMetricAttributes(): MetricAttributes {
  return {
    ...commonAttributes,
  };
}

export function mergeMetricAttributes(
  attributes?: MetricAttributes,
): MetricAttributes {
  return {
    ...commonAttributes,
    ...(attributes ?? {}),
  };
}