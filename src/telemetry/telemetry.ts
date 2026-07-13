import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';

import type { TelemetryConfig } from '../types';
import { telemetryManager } from './manager';
import { createResource } from './resources';
import { createInstrumentations } from './instrumentations';
import { registerShutdownHooks } from './shutdown';
import { initLogger } from '../logger';

export function initTelemetry(config: TelemetryConfig): void {
  const sdk = new NodeSDK({
    resource: createResource(config),

    traceExporter: new OTLPTraceExporter({
      url: config.collector.tracesEndpoint,
    }),

    metricReader: new PeriodicExportingMetricReader({
      exporter: new OTLPMetricExporter({
        url: config.collector.metricsEndpoint,
      }),
      exportIntervalMillis: config.metrics.exportIntervalMillis,
    }),

    instrumentations: [createInstrumentations(config)],
  });

  sdk.start();

  initLogger({
    serviceName: config.service.name,
    serviceVersion: config.service.version,
  });

  telemetryManager.initialize(sdk);
  registerShutdownHooks();
}

export async function shutdownTelemetry(): Promise<void> {
  await telemetryManager.shutdown();
}