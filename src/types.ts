export interface ServiceConfig {
  /**
   * Logical service name.
   *
   * Examples:
   * - ingestion-api
   * - control-plane-api
   * - smpp-server
   */
  name: string;

  /**
   * Version of the running service.
   *
   * Usually read from package.json.
   */
  version: string;
}

export interface CollectorConfig {
  /**
   * Full OTLP HTTP endpoint for traces.
   *
   * Example:
   * http://otel-collector:4318/v1/traces
   */
  tracesEndpoint: string;

  /**
   * Full OTLP HTTP endpoint for metrics.
   *
   * Example:
   * http://otel-collector:4318/v1/metrics
   */
  metricsEndpoint: string;
}

export interface MetricsConfig {
  /**
   * Export interval in milliseconds.
   */
  exportIntervalMillis: number;
}

export interface InstrumentationConfig {
  /**
   * Disable filesystem instrumentation.
   *
   * Recommended for production services because it
   * generates a huge amount of low-value spans.
   */
  disableFs?: boolean;
}

export interface TelemetryConfig {
  service: ServiceConfig;

  collector: CollectorConfig;

  metrics: MetricsConfig;

  instrumentations?: InstrumentationConfig;
}