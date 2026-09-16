import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { BatchLogRecordProcessor } from '@opentelemetry/sdk-logs';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import type { NodeSDKConfiguration } from '@opentelemetry/sdk-node';
import { NodeSDK } from '@opentelemetry/sdk-node';

import type { TelemetryConfig } from '../types.js';

import { getEnvironment } from '../common/env.js';
import { initLogger, resetLogger } from '../logger/index.js';
import {
  initMeter,
  resetMeter,
  setCommonMetricAttributes,
} from '../metrics/index.js';
import { initTracer, resetTracer } from '../tracing/index.js';

import { createInstrumentations } from './instrumentations.js';
import { telemetryManager } from './manager.js';
import { createResource } from './resources.js';
import { registerShutdownHooks } from './shutdown.js';
import { validateTelemetryConfig } from './validation.js';

export function initTelemetry(
  config: TelemetryConfig,
): void {
  validateTelemetryConfig(config);

  if (config.enabled === false) {
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

    return;
  }

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

  const sdkConfig: Partial<NodeSDKConfiguration> = {
    resource: createResource(config),

    traceExporter: new OTLPTraceExporter({
      url: config.collector.tracesEndpoint,
    }),

    metricReaders: [
      new PeriodicExportingMetricReader({
        exporter: new OTLPMetricExporter({
          url: config.collector.metricsEndpoint,
        }),
        exportIntervalMillis:
          config.metrics.exportIntervalMillis,
      }),
    ],

    instrumentations: [
      createInstrumentations(config),
    ],
  };

  if (config.collector.logsEndpoint) {
    sdkConfig.logRecordProcessors = [
      new BatchLogRecordProcessor({
        exporter: new OTLPLogExporter({
          url: config.collector.logsEndpoint,
        }),
      }),
    ];
  }

  const sdk = new NodeSDK(sdkConfig);

  try {
    telemetryManager.initialize(sdk);
    telemetryManager.start();

    /*
     * Pino must be initialized after the OpenTelemetry SDK starts so that
     * the Pino instrumentation can attach to the logger and bridge Pino
     * records into the OpenTelemetry Logs API.
     */
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
  } catch (error) {
    resetMeter();
    resetTracer();
    resetLogger();

    if (!telemetryManager.isInitialized()) {
      void sdk.shutdown().catch(() => {
        // Preserve the original initialization/startup error.
      });
    }

    throw error;
  }

  if (config.registerShutdownHooks !== false) {
    registerShutdownHooks();
  }
}

export async function shutdownTelemetry(): Promise<void> {
  try {
    await telemetryManager.shutdown();
  } finally {
    resetMeter();
    resetTracer();
    resetLogger();
  }
}