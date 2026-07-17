import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';

import type { TelemetryConfig } from '../types.js';

import { getEnvironment } from '../common/env.js';
import { initLogger } from '../logger/index.js';
import { initMeter, setCommonMetricAttributes } from '../metrics/index.js';
import { initTracer } from '../tracing/index.js';

import { createInstrumentations } from './instrumentations.js';
import { telemetryManager } from './manager.js';
import { createResource } from './resources.js';
import { registerShutdownHooks } from './shutdown.js';
import { validateTelemetryConfig } from './validation.js';

export function initTelemetry(config: TelemetryConfig): void {
  validateTelemetryConfig(config);

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

    ...(config.logger?.level && {
      level: config.logger.level,
    }),

    ...(config.logger?.transport && {
      transport: config.logger.transport,
    }),
  });
  initTracer({
    serviceName: config.service.name,
    version: config.service.version,
  });

  initMeter({
    serviceName: config.service.name,
    version: config.service.version,
  });

  setCommonMetricAttributes({
    service: config.service.name,
    version: config.service.version,
    environment: getEnvironment(),
  });

  telemetryManager.initialize(sdk);

  registerShutdownHooks();
}

export async function shutdownTelemetry(): Promise<void> {
  await telemetryManager.shutdown();
}