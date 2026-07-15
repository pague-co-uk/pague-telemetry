# API Reference

This reference documents the current root entry point of `@pague-co-uk/sms-gateway-telemetry` (package version `1.0.8`). The package publishes one import path, `@pague-co-uk/sms-gateway-telemetry`, and that root barrel exports telemetry, logger, metrics, tracing, context, HTTP, RabbitMQ, database, SMPP, types, errors, and integration constants. Importing the package is side-effect free; `initTelemetry()` is the single telemetry initialization entry point.

## Current Public Export Inventory

The detailed core entries below remain valid. The following inventory supersedes the stale “not exported” statements in previous versions of this document and is generated from the current `src/index.ts` declaration surface.

| Area | Public exports |
| --- | --- |
| Context | `withContext`, `withContextAsync`, `currentContext`, `updateContext`, `clearCurrentContext`, `getContextValue`, `setContextValue` |
| Tracing | `initTracer`, `getTracer`, `startSpan`, `startActiveSpan`, `getActiveSpan`, `finishSpan`, `failSpan`, `endSpan`, `withSpan`, `withSpanSync`, `withSyncSpan`, `withPromiseSpan`, `withObservableSpan`, `traceObservable`, `setAttribute`, `setAttributes`, `setStatus`, `recordException`, `addEvent`, `spanNaming`, `TracerConfig` |
| HTTP | `REQUEST_ID_HEADER`, `CORRELATION_ID_HEADER`, `TRACE_PARENT_HEADER`, `DEFAULT_REQUEST_COUNTER`, `DEFAULT_REQUEST_DURATION`, `DEFAULT_ACTIVE_REQUESTS`, `DEFAULT_REQUEST_SIZE`, `DEFAULT_RESPONSE_SIZE`, `DEFAULT_HTTP_SPAN_NAME`, `establishRequestContext`, `getHeader`, `setHeader`, `getRequestId`, `setRequestId`, `getCorrelationId`, `setCorrelationId`, `createHttpRequestLifecycle`, `HttpRequestLifecycle`, `getHttpMetrics`, `createHttpMiddleware`, `startHttpSpan`, `finishHttpSpan`, `failHttpSpan`, `logRequestStarted`, `logRequestCompleted`, `logRequestFailed`, `HttpRequest`, `HttpResponse`, `NextFunction`, `HttpMiddleware`, `HttpContextOptions`, `HttpMetricsOptions`, `HttpLoggingOptions`, `HttpTracingOptions`, `HttpOptions` |
| RabbitMQ | `RabbitMqHeaders`, `RabbitMqMetrics`, `RabbitMqComponent`, `consumeMessages`, `publishMessage`, `injectContext`, `extractContext`, `RabbitMqLifecycle`, `getRabbitMqLifecycle`, `RabbitMqLifecycleContext`, `recordPublish`, `recordConsume`, `recordFailure`, `recordPublishDuration`, `recordConsumeDuration`, `logPublishStarted`, `logPublishCompleted`, `logPublishFailed`, `logConsumeStarted`, `logConsumeCompleted`, `logConsumeFailed`, `ConsumeChannel`, `PublishChannel` |
| Database | `DatabaseComponent`, `DatabaseMetrics`, `DatabaseAttributes`, `DatabaseLifecycle`, `getDatabaseLifecycle`, `recordQuery`, `recordFailedQuery`, `recordConnectionError`, `recordQueryDuration`, `logQueryStarted`, `logQueryCompleted`, `logQueryFailed`, `logSlowQuery` |
| SMPP | `SmppComponent`, `SmppMetrics`, `SmppCommands`, `SmppAttributes`, `SmppLifecycle`, `getSmppLifecycle`, `recordBind`, `recordFailedBind`, `recordSubmit`, `recordFailedSubmit`, `recordDeliver`, `recordFailedDeliver`, `recordEnquireLink`, `recordUnbind`, `incrementActiveSessions`, `decrementActiveSessions`, `recordPduDuration`, `logBindStarted`, `logBindCompleted`, `logBindFailed`, `logPduReceived`, `logPduProcessed`, `logPduFailed`, `logSessionConnected`, `logSessionDisconnected` |

# Telemetry

## initTelemetry

### Purpose

Initializes the OpenTelemetry Node SDK, OTLP trace and metric exporters, automatic instrumentations, the SDK logger, and the SDK meter. Call it once during process startup before using logging or metrics helpers.

### Signature

```ts
function initTelemetry(config: TelemetryConfig): void;
```

### Parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `config` | `TelemetryConfig` | Yes | Service identity, collector endpoints, metric export interval, and optional logger/instrumentation configuration. |

### Returns

`void`. Initialization starts the OpenTelemetry SDK synchronously.

### Throws

Throws an internal configuration error when the service name is blank, an endpoint is not a valid URL, the metric interval is not positive, the logger level is invalid, or file logging is enabled without a path. A second successful initialization can throw `TelemetryAlreadyInitializedError`.

### Example

```ts
import { initTelemetry } from '@pague-co-uk/sms-gateway-telemetry';

initTelemetry({
  service: { name: 'billing-api', version: '1.0.0' },
  collector: {
    tracesEndpoint: 'http://otel-collector:4318/v1/traces',
    metricsEndpoint: 'http://otel-collector:4318/v1/metrics',
  },
  metrics: { exportIntervalMillis: 10_000 },
  logger: { level: 'info', transport: { stdout: true } },
  instrumentations: { disableFs: true },
});
```

### Best Practices

Initialize once in the executable entry point, before creating metrics or retrieving the logger. Do not call it per request, worker job, or test case without first shutting down the existing SDK.

### Related APIs

`shutdownTelemetry`, `TelemetryConfig`, `getLogger`, and `getMeter`.

## shutdownTelemetry

### Purpose

Shuts down the initialized OpenTelemetry SDK and clears its singleton registration, allowing buffered telemetry to flush through the SDK shutdown path.

### Signature

```ts
function shutdownTelemetry(): Promise<void>;
```

### Parameters

None.

### Returns

A promise that resolves after SDK shutdown completes. It resolves immediately when the telemetry manager has no SDK.

### Throws

May reject with an error returned by the underlying OpenTelemetry SDK shutdown operation.

### Example

```ts
import {
  initTelemetry,
  shutdownTelemetry,
} from '@pague-co-uk/sms-gateway-telemetry';

initTelemetry({
  service: { name: 'billing-worker', version: '1.0.0' },
  collector: {
    tracesEndpoint: 'http://otel-collector:4318/v1/traces',
    metricsEndpoint: 'http://otel-collector:4318/v1/metrics',
  },
  metrics: { exportIntervalMillis: 10_000 },
});

process.once('SIGTERM', () => {
  void shutdownTelemetry();
});
```

### Best Practices

Await this in controlled application or test teardown. Do not depend on it to run after an ungraceful process termination.

### Related APIs

`initTelemetry`.

# Logger

## InternalLoggerConfig

### Purpose

Describes the configuration accepted by `initLogger`. Despite its name, it is exported and can be used directly when an application intentionally initializes logging without the full telemetry bootstrap.

### Signature

```ts
interface InternalLoggerConfig {
  serviceName: string;
  serviceVersion?: string;
  level?: string;
  transport?: TransportConfig;
}
```

### Parameters

Not applicable.

### Returns

Not applicable; this is an interface.

### Throws

No exceptions are thrown directly.

### Properties

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `serviceName` | `string` | Yes | Service value added to the base log bindings. |
| `serviceVersion` | `string` | No | Optional version value added to the base bindings. |
| `level` | `string` | No | Pino log level. If omitted, the SDK resolves a configured environment level or its default. |
| `transport` | `TransportConfig` | No | Standard-output and file transport options. |

### Example

```ts
import { initLogger } from '@pague-co-uk/sms-gateway-telemetry';

initLogger({
  serviceName: 'reconciliation-worker',
  serviceVersion: '1.0.0',
  level: 'info',
  transport: { stdout: true },
});
```

### Best Practices

Prefer `initTelemetry` in a production service so logging, metrics, and tracing share the same service identity. Use this type only for intentional logging-only initialization.

### Related APIs

`initLogger`, `TelemetryConfig`, `TransportConfig`.

## initLogger

### Purpose

Creates and stores the process-wide Pino logger. Its log records include service bindings, SDK serializers and redaction, ISO timestamps, and active trace/request context.

### Signature

```ts
function initLogger(config: InternalLoggerConfig): import('pino').Logger;
```

### Parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `config` | `InternalLoggerConfig` | Yes | Logger identity, level, and transport configuration. |

### Returns

The shared Pino `Logger`. If it has already been initialized, returns the existing logger and does not apply the new configuration.

### Throws

May throw file-system or stream errors while creating configured transports.

### Example

```ts
import { initLogger } from '@pague-co-uk/sms-gateway-telemetry';

const logger = initLogger({
  serviceName: 'notification-api',
  level: 'info',
  transport: { stdout: true },
});

logger.info({ port: 3000 }, 'HTTP server listening');
```

### Best Practices

Initialize once at process startup. Prefer `getLogger` elsewhere so all code uses the same logger. Do not expect later calls to reconfigure an initialized logger.

### Related APIs

`getLogger`, `createChildLogger`, `getComponentLogger`, `createTransports` is not publicly exported.

## getLogger

### Purpose

Returns the process-wide Pino logger created by `initLogger` or `initTelemetry`.

### Signature

```ts
function getLogger(): import('pino').Logger;
```

### Parameters

None.

### Returns

The initialized Pino `Logger`.

### Throws

Throws the SDK's non-exported initialization error if logging has not been initialized.

### Example

```ts
import { getLogger } from '@pague-co-uk/sms-gateway-telemetry';

getLogger().info({ orderId: 'ord_123' }, 'Order accepted');
```

### Best Practices

Call only after `initTelemetry` or `initLogger`. Do not create ad-hoc Pino instances when you need SDK redaction and context correlation.

### Related APIs

`initTelemetry`, `initLogger`, `createChildLogger`.

## LoggerContext

### Purpose

Represents context injected into SDK log records: active OpenTelemetry trace identifiers plus optional request-scoped identifiers.

### Signature

```ts
interface LoggerContext {
  traceId?: string;
  spanId?: string;
  requestId?: string;
  correlationId?: string;
  tenantId?: string;
  clientId?: string;
  userId?: string;
  sessionId?: string;
  operation?: string;
}
```

### Parameters

Not applicable.

### Returns

Not applicable; this is an interface.

### Throws

No exceptions are thrown directly.

### Properties

All properties are optional strings. `traceId` and `spanId` come from the active OpenTelemetry span; the remaining fields come from the SDK's current request context.

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `traceId` | `string` | No | Active distributed trace identifier. |
| `spanId` | `string` | No | Active span identifier. |
| `requestId` | `string` | No | Request identifier. |
| `correlationId` | `string` | No | Cross-system correlation identifier. |
| `tenantId` | `string` | No | Tenant identifier. |
| `clientId` | `string` | No | Client identifier. |
| `userId` | `string` | No | User identifier. |
| `sessionId` | `string` | No | Session identifier. |
| `operation` | `string` | No | Logical operation name. |

### Example

```ts
import { getTraceContext } from '@pague-co-uk/sms-gateway-telemetry';

const context = getTraceContext();
if (context.traceId) {
  console.log(`Handling trace ${context.traceId}`);
}
```

### Best Practices

Treat it as an observation of current context, not mutable application state. Prefer the logger's automatic context injection for log records.

### Related APIs

`getTraceContext`, `getLogger`.

## getTraceContext

### Purpose

Builds the current `LoggerContext` from the active OpenTelemetry span and the SDK request context.

### Signature

```ts
function getTraceContext(): LoggerContext;
```

### Parameters

None.

### Returns

A context object. It can be empty when no span or request context is active.

### Throws

No exceptions are thrown directly.

### Example

```ts
import { getLogger, getTraceContext } from '@pague-co-uk/sms-gateway-telemetry';

const context = getTraceContext();
getLogger().debug(context, 'Current telemetry context');
```

### Best Practices

Use it when forwarding correlation fields to a non-Pino integration. Do not manually add it to normal SDK logger calls; the logger mixin already does that.

### Related APIs

`LoggerContext`, `getLogger`.

## createChildLogger

### Purpose

Creates a Pino child of the shared SDK logger with persistent bindings and optional child logger options.

### Signature

```ts
function createChildLogger(
  bindings: import('pino').Bindings,
  options?: import('pino').ChildLoggerOptions,
): import('pino').Logger;
```

### Parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `bindings` | `pino.Bindings` | Yes | Fields included in every record emitted by the child. |
| `options` | `pino.ChildLoggerOptions` | No | Pino options for creating the child. |

### Returns

A Pino child logger.

### Throws

Throws the SDK's non-exported initialization error if logging is not initialized.

### Example

```ts
import { createChildLogger } from '@pague-co-uk/sms-gateway-telemetry';

const logger = createChildLogger({ component: 'payments', provider: 'acme' });
logger.info({ paymentId: 'pay_123' }, 'Charge submitted');
```

### Best Practices

Use stable, low-cardinality bindings such as component or provider names. Do not bind request IDs or user IDs for long-lived shared children; pass those per log call instead.

### Related APIs

`getLogger`, `getComponentLogger`.

## TransportConfig

### Purpose

Configures the destinations created for the SDK logger.

### Signature

```ts
interface TransportConfig {
  stdout?: boolean;
  file?: FileTransportConfig;
}
```

### Parameters

Not applicable.

### Returns

Not applicable; this is an interface.

### Throws

No exceptions are thrown directly.

### Properties

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `stdout` | `boolean` | No | Enables or disables standard-output logging. If omitted, the SDK resolves its environment/default value. |
| `file` | `FileTransportConfig` | No | Optional file transport settings. |

### Example

```ts
import { initLogger, type TransportConfig } from '@pague-co-uk/sms-gateway-telemetry';

const transport: TransportConfig = {
  stdout: true,
  file: { enabled: true, path: '/var/log/billing/application.log' },
};

initLogger({ serviceName: 'billing-api', transport });
```

### Best Practices

Use stdout for containerized deployments. Enable file output only where local durable files are operationally required.

### Related APIs

`FileTransportConfig`, `LoggerConfig`, `initLogger`.

## FileTransportConfig

### Purpose

Configures the SDK logger's optional append-only file destination.

### Signature

```ts
interface FileTransportConfig {
  enabled: boolean;
  path: string;
}
```

### Parameters

Not applicable.

### Returns

Not applicable; this is an interface.

### Throws

No exceptions are thrown directly.

### Properties

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `enabled` | `boolean` | Yes | Whether the file destination is active. |
| `path` | `string` | Yes | Destination file path. Parent directories are created by the implementation when file output is created. |

### Example

```ts
import { initLogger } from '@pague-co-uk/sms-gateway-telemetry';

initLogger({
  serviceName: 'billing-api',
  transport: { file: { enabled: true, path: '/var/log/billing/application.log' } },
});
```

### Best Practices

Supply a writable absolute path in production. Do not enable this transport with an empty path; full telemetry initialization rejects that configuration.

### Related APIs

`TransportConfig`, `LoggerConfig`.

## getComponentLogger

### Purpose

Returns a cached child logger bound to a named component.

### Signature

```ts
function getComponentLogger(component: string): import('pino').Logger;
```

### Parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `component` | `string` | Yes | Component binding applied to this cached child logger. |

### Returns

A Pino logger bound as `{ component }`. Repeated calls with the same component return the cached child.

### Throws

Throws the SDK's non-exported initialization error if logging is not initialized when the component is first requested.

### Example

```ts
import { getComponentLogger } from '@pague-co-uk/sms-gateway-telemetry';

const logger = getComponentLogger('rabbitmq-consumer');
logger.info({ queue: 'payments' }, 'Message received');
```

### Best Practices

Use for stable application subsystem names. Do not use unbounded values such as user IDs or request paths as components because they are cached indefinitely.

### Related APIs

`clearComponentLoggers`, `createChildLogger`, `getLogger`.

## clearComponentLoggers

### Purpose

Clears the in-memory cache used by `getComponentLogger`.

### Signature

```ts
function clearComponentLoggers(): void;
```

### Parameters

None.

### Returns

`void`.

### Throws

No exceptions are thrown directly.

### Example

```ts
import { clearComponentLoggers } from '@pague-co-uk/sms-gateway-telemetry';

clearComponentLoggers();
```

### Best Practices

Use sparingly, primarily in controlled test cleanup or lifecycle reset code. Normal services should retain their stable component loggers.

### Related APIs

`getComponentLogger`.

# Context

The root package has no standalone context-propagation API. Its public context surface is `LoggerContext` and `getTraceContext`, documented in [Logger](#logger); metric attribute context helpers are documented in [Metrics](#metrics).

# Metrics

## MeterConfig

### Purpose

Describes the OpenTelemetry meter identity used by `initMeter`.

### Signature

```ts
interface MeterConfig {
  serviceName: string;
  version?: string;
}
```

### Parameters

Not applicable.

### Returns

Not applicable; this is an interface.

### Throws

No exceptions are thrown directly.

### Properties

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `serviceName` | `string` | Yes | Meter name, normally the service name. |
| `version` | `string` | No | Optional meter version. |

### Example

```ts
import { initMeter } from '@pague-co-uk/sms-gateway-telemetry';

initMeter({ serviceName: 'billing-api', version: '1.0.0' });
```

### Best Practices

Normally let `initTelemetry` initialize the meter. Use direct initialization only in intentionally partial SDK setups.

### Related APIs

`initMeter`, `getMeter`, `TelemetryConfig`.

## initMeter

### Purpose

Obtains and stores the process-wide OpenTelemetry meter for the supplied service identity.

### Signature

```ts
function initMeter(config: MeterConfig): import('@opentelemetry/api').Meter;
```

### Parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `config` | `MeterConfig` | Yes | Meter identity. |

### Returns

The shared OpenTelemetry `Meter`. If already initialized, returns the existing meter and ignores the new configuration.

### Throws

No exceptions are thrown directly.

### Example

```ts
import { initMeter } from '@pague-co-uk/sms-gateway-telemetry';

const meter = initMeter({ serviceName: 'billing-api', version: '1.0.0' });
meter.createCounter('billing_operations_total').add(1);
```

### Best Practices

Prefer `initTelemetry`. Do not expect subsequent calls to change the meter identity.

### Related APIs

`getMeter`, `createCounter`, `initTelemetry`.

## getMeter

### Purpose

Returns the initialized process-wide OpenTelemetry meter.

### Signature

```ts
function getMeter(): import('@opentelemetry/api').Meter;
```

### Parameters

None.

### Returns

The initialized OpenTelemetry `Meter`.

### Throws

Throws the SDK's non-exported initialization error if the meter has not been initialized.

### Example

```ts
import { getMeter } from '@pague-co-uk/sms-gateway-telemetry';

getMeter().createCounter('emails_sent_total').add(1, { provider: 'ses' });
```

### Best Practices

Use after `initTelemetry` or `initMeter`. Prefer the SDK metric factories for common metric types and common-attribute merging.

### Related APIs

`initMeter`, `createCounter`, `createHistogram`, `createGauge`.

## createCounter

### Purpose

Creates an OpenTelemetry synchronous counter from the shared meter.

### Signature

```ts
function createCounter(
  name: string,
  options?: import('@opentelemetry/api').MetricOptions,
): import('@opentelemetry/api').Counter;
```

### Parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `name` | `string` | Yes | OpenTelemetry metric name. |
| `options` | `MetricOptions` | No | OpenTelemetry metric description and unit options. |

### Returns

An OpenTelemetry `Counter`.

### Throws

Throws the SDK's non-exported initialization error if the meter is not initialized.

### Example

```ts
import { createCounter } from '@pague-co-uk/sms-gateway-telemetry';

const sent = createCounter('sms_messages_sent_total', {
  description: 'Number of SMS messages accepted by the provider',
});
sent.add(1, { provider: 'primary' });
```

### Best Practices

Use for values that only increase. Use `createCounterMetric` when you also want common attributes and name-based wrapper reuse.

### Related APIs

`createCounterMetric`, `createUpDownCounterMetric`, `getMeter`.

## createHistogram

### Purpose

Creates an OpenTelemetry synchronous histogram from the shared meter.

### Signature

```ts
function createHistogram(
  name: string,
  options?: import('@opentelemetry/api').MetricOptions,
): import('@opentelemetry/api').Histogram;
```

### Parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `name` | `string` | Yes | OpenTelemetry metric name. |
| `options` | `MetricOptions` | No | OpenTelemetry metric description and unit options. |

### Returns

An OpenTelemetry `Histogram`.

### Throws

Throws the SDK's non-exported initialization error if the meter is not initialized.

### Example

```ts
import { createHistogram } from '@pague-co-uk/sms-gateway-telemetry';

const duration = createHistogram('http_server_duration_ms', { unit: 'ms' });
duration.record(42, { route: '/v1/payments', method: 'POST' });
```

### Best Practices

Use for distributions such as latency and payload size. Use `createHistogramMetric` to automatically merge SDK common attributes.

### Related APIs

`createHistogramMetric`, `createCounter`.

## createGauge

### Purpose

Creates an OpenTelemetry observable gauge and registers its observation callback.

### Signature

```ts
function createGauge(
  name: string,
  callback: import('@opentelemetry/api').ObservableCallback,
  options?: import('@opentelemetry/api').MetricOptions,
): import('@opentelemetry/api').ObservableGauge;
```

### Parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `name` | `string` | Yes | OpenTelemetry metric name. |
| `callback` | `ObservableCallback` | Yes | Callback invoked by OpenTelemetry to report current observations. |
| `options` | `MetricOptions` | No | OpenTelemetry metric description and unit options. |

### Returns

An OpenTelemetry `ObservableGauge` with `callback` registered.

### Throws

Throws the SDK's non-exported initialization error if the meter is not initialized.

### Example

```ts
import { createGauge } from '@pague-co-uk/sms-gateway-telemetry';

let activeConnections = 0;
createGauge('database_connections_active', (result) => {
  result.observe(activeConnections, { pool: 'primary' });
});
```

### Best Practices

Use for values sampled at collection time. Keep callbacks fast and side-effect free; do not perform network I/O in them.

### Related APIs

`createGaugeMetric`, `getMeter`.

## MetricAttributes

### Purpose

Defines the attribute values accepted by SDK metric wrappers and common metric context helpers.

### Signature

```ts
interface MetricAttributes {
  [key: string]: string | number | boolean;
}
```

### Parameters

Not applicable.

### Returns

Not applicable; this is an interface.

### Throws

No exceptions are thrown directly.

### Properties

This is a string index signature: every attribute name maps to a `string`, `number`, or `boolean`.

### Example

```ts
import type { MetricAttributes } from '@pague-co-uk/sms-gateway-telemetry';

const attributes: MetricAttributes = { provider: 'primary', retry: false, attempt: 1 };
```

### Best Practices

Use bounded, low-cardinality values. Do not use user IDs, message bodies, timestamps, or random IDs as metric attributes.

### Related APIs

`setCommonMetricAttributes`, `CounterMetric`, `HistogramMetric`.

## setCommonMetricAttributes

### Purpose

Replaces the attribute set that SDK metric wrappers merge into every observation.

### Signature

```ts
function setCommonMetricAttributes(attributes: MetricAttributes): void;
```

### Parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `attributes` | `MetricAttributes` | Yes | New common attribute values. |

### Returns

`void`.

### Throws

No exceptions are thrown directly.

### Example

```ts
import { setCommonMetricAttributes } from '@pague-co-uk/sms-gateway-telemetry';

setCommonMetricAttributes({ service: 'billing-api', environment: 'production' });
```

### Best Practices

Set once during startup with stable service-level values. This replaces, rather than extends, the previous set; include all required common values in each call.

### Related APIs

`getCommonMetricAttributes`, `mergeMetricAttributes`, `initTelemetry`.

## getCommonMetricAttributes

### Purpose

Returns a copy of the currently configured common metric attributes.

### Signature

```ts
function getCommonMetricAttributes(): MetricAttributes;
```

### Parameters

None.

### Returns

A shallow copy of the common attributes. Mutating the returned object does not change SDK state.

### Throws

No exceptions are thrown directly.

### Example

```ts
import { getCommonMetricAttributes } from '@pague-co-uk/sms-gateway-telemetry';

const attributes = getCommonMetricAttributes();
console.log(attributes.environment);
```

### Best Practices

Use for inspection or composing a custom OpenTelemetry measurement. Do not depend on it as request-scoped storage.

### Related APIs

`setCommonMetricAttributes`, `mergeMetricAttributes`.

## mergeMetricAttributes

### Purpose

Combines the current common metric attributes with optional call-specific attributes.

### Signature

```ts
function mergeMetricAttributes(attributes?: MetricAttributes): MetricAttributes;
```

### Parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `attributes` | `MetricAttributes` | No | Per-measurement attributes. Values with the same key override common attributes. |

### Returns

A new merged attribute object.

### Throws

No exceptions are thrown directly.

### Example

```ts
import { mergeMetricAttributes } from '@pague-co-uk/sms-gateway-telemetry';

const attributes = mergeMetricAttributes({ route: '/v1/payments', environment: 'staging' });
```

### Best Practices

Use with raw OpenTelemetry instruments where you need the same common attributes as SDK wrappers. Do not use it to place high-cardinality request data into metrics.

### Related APIs

`setCommonMetricAttributes`, `getCommonMetricAttributes`, `createCounterMetric`.

## CounterMetricOptions

### Purpose

Describes a named `CounterMetric` wrapper.

### Signature

```ts
interface CounterMetricOptions {
  name: string;
  description?: string;
  unit?: string;
}
```

### Parameters

Not applicable.

### Returns

Not applicable; this is an interface.

### Throws

No exceptions are thrown directly.

### Properties

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `name` | `string` | Yes | Metric name and wrapper registry key. |
| `description` | `string` | No | Human-readable metric description. |
| `unit` | `string` | No | Unit passed to OpenTelemetry. |

### Example

```ts
import { createCounterMetric } from '@pague-co-uk/sms-gateway-telemetry';

const accepted = createCounterMetric({ name: 'orders_accepted_total', unit: '1' });
accepted.increment({ channel: 'web' });
```

### Best Practices

Use a stable, descriptive name; the first wrapper created for a name is reused. Do not expect later options for that name to change the existing instrument.

### Related APIs

`CounterMetric`, `createCounterMetric`.

## HistogramMetricOptions

### Purpose

Describes a named `HistogramMetric` wrapper.

### Signature

```ts
interface HistogramMetricOptions {
  name: string;
  description?: string;
  unit?: string;
}
```

### Parameters

Not applicable.

### Returns

Not applicable; this is an interface.

### Throws

No exceptions are thrown directly.

### Properties

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `name` | `string` | Yes | Metric name and wrapper registry key. |
| `description` | `string` | No | Human-readable metric description. |
| `unit` | `string` | No | Unit passed to OpenTelemetry. |

### Example

```ts
import { createHistogramMetric } from '@pague-co-uk/sms-gateway-telemetry';

const latency = createHistogramMetric({ name: 'payment_processing_duration', unit: 'ms' });
latency.record(87, { provider: 'primary' });
```

### Best Practices

Choose a unit that matches values supplied to `record`. Do not create a second wrapper with the same name to change its description or unit.

### Related APIs

`HistogramMetric`, `createHistogramMetric`.

## GaugeMetricOptions

### Purpose

Describes a named `GaugeMetric` wrapper.

### Signature

```ts
interface GaugeMetricOptions {
  name: string;
  description?: string;
  unit?: string;
}
```

### Parameters

Not applicable.

### Returns

Not applicable; this is an interface.

### Throws

No exceptions are thrown directly.

### Properties

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `name` | `string` | Yes | Metric name and wrapper registry key. |
| `description` | `string` | No | Human-readable metric description. |
| `unit` | `string` | No | Unit passed to OpenTelemetry. |

### Example

```ts
import { createGaugeMetric } from '@pague-co-uk/sms-gateway-telemetry';

let depth = 0;
createGaugeMetric({ name: 'queue_depth', unit: 'messages' }, () => depth);
```

### Best Practices

Use an observation callback that reads current local state. Do not expect a reused wrapper name to replace its callback.

### Related APIs

`GaugeMetric`, `createGaugeMetric`.

## UpDownCounterMetricOptions

### Purpose

Describes a named `UpDownCounterMetric` wrapper for values that can increase and decrease.

### Signature

```ts
interface UpDownCounterMetricOptions {
  name: string;
  description?: string;
  unit?: string;
}
```

### Parameters

Not applicable.

### Returns

Not applicable; this is an interface.

### Throws

No exceptions are thrown directly.

### Properties

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `name` | `string` | Yes | Metric name and wrapper registry key. |
| `description` | `string` | No | Human-readable metric description. |
| `unit` | `string` | No | Unit passed to OpenTelemetry. |

### Example

```ts
import { createUpDownCounterMetric } from '@pague-co-uk/sms-gateway-telemetry';

const inFlight = createUpDownCounterMetric({ name: 'jobs_in_flight', unit: 'jobs' });
inFlight.increment({ queue: 'billing' });
```

### Best Practices

Use for deltas that may be positive or negative, such as active work. Use a counter instead for totals that never decrease.

### Related APIs

`UpDownCounterMetric`, `createUpDownCounterMetric`, `CounterMetricOptions`.

## CounterMetric

### Purpose

Wraps an OpenTelemetry counter and automatically merges common metric attributes into each measurement.

### Signature

```ts
class CounterMetric {
  constructor(options: CounterMetricOptions);
  increment(attributes?: MetricAttributes): void;
  add(value: number, attributes?: MetricAttributes): void;
}
```

### Parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `options` | `CounterMetricOptions` | Yes | Constructor metric definition. |
| `value` | `number` | Yes, for `add` | Amount to add. |
| `attributes` | `MetricAttributes` | No | Per-measurement attributes merged over common attributes. |

### Returns

The constructor creates an instance. `increment` and `add` return `void`.

### Throws

Construction throws the SDK's non-exported initialization error if the meter is not initialized.

### Constructor

`new CounterMetric(options)` creates a new underlying counter immediately. It does not register the wrapper in the name-based cache.

### Properties

No public properties are exposed.

### Methods

- `increment(attributes?)` adds `1`.
- `add(value, attributes?)` adds `value`.

### Lifecycle

The instance remains usable for the lifetime of the initialized meter. It has no dispose method; shut down telemetry at application teardown.

### Thread safety

The wrapper contains no mutable public state. In a Node.js process, calls are safe across asynchronous tasks; worker threads have separate module state and must initialize independently.

### Example

```ts
import { CounterMetric } from '@pague-co-uk/sms-gateway-telemetry';

const failures = new CounterMetric({ name: 'delivery_failures_total' });
failures.increment({ provider: 'primary', reason: 'timeout' });
```

### Best Practices

Prefer `createCounterMetric` when the instrument is shared, because it reuses the wrapper by name. Use the constructor only when an unregistered instance is intended.

### Related APIs

`createCounterMetric`, `setCommonMetricAttributes`, `HistogramMetric`.

## createCounterMetric

### Purpose

Creates or returns a registry-cached `CounterMetric` for a metric name.

### Signature

```ts
function createCounterMetric(options: CounterMetricOptions): CounterMetric;
```

### Parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `options` | `CounterMetricOptions` | Yes | Metric definition; its `name` selects the cached instance. |

### Returns

The existing or newly created `CounterMetric` for `options.name`.

### Throws

Throws the SDK's non-exported initialization error when a new wrapper must be created before meter initialization.

### Example

```ts
import { createCounterMetric } from '@pague-co-uk/sms-gateway-telemetry';

const requests = createCounterMetric({
  name: 'http_requests_total',
  description: 'Completed HTTP requests',
});
requests.add(1, { method: 'POST', status: 201 });
```

### Best Practices

Use this factory for a service-wide named counter. Define a metric's options consistently at its first creation.

### Related APIs

`CounterMetric`, `createCounter`, `createUpDownCounterMetric`.

## HistogramMetric

### Purpose

Wraps an OpenTelemetry histogram and automatically merges common metric attributes into recorded values.

### Signature

```ts
class HistogramMetric {
  constructor(options: HistogramMetricOptions);
  record(value: number, attributes?: MetricAttributes): void;
}
```

### Parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `options` | `HistogramMetricOptions` | Yes | Constructor metric definition. |
| `value` | `number` | Yes, for `record` | Value to record. |
| `attributes` | `MetricAttributes` | No | Per-record attributes merged over common attributes. |

### Returns

The constructor creates an instance. `record` returns `void`.

### Throws

Construction throws the SDK's non-exported initialization error if the meter is not initialized.

### Constructor

`new HistogramMetric(options)` creates a new underlying histogram immediately. It does not register the wrapper in the name-based cache.

### Properties

No public properties are exposed.

### Methods

`record(value, attributes?)` records one value.

### Lifecycle

The instance remains usable for the lifetime of the initialized meter. It has no dispose method; shut down telemetry at application teardown.

### Thread safety

The wrapper contains no mutable public state. In a Node.js process, calls are safe across asynchronous tasks; worker threads have separate module state and must initialize independently.

### Example

```ts
import { HistogramMetric } from '@pague-co-uk/sms-gateway-telemetry';

const processingTime = new HistogramMetric({ name: 'invoice_processing_duration', unit: 'ms' });
processingTime.record(125, { outcome: 'success' });
```

### Best Practices

Prefer `createHistogramMetric` for a shared named instrument. Keep the recorded unit consistent with the configured unit.

### Related APIs

`createHistogramMetric`, `createHistogram`, `CounterMetric`.

## createHistogramMetric

### Purpose

Creates or returns a registry-cached `HistogramMetric` for a metric name.

### Signature

```ts
function createHistogramMetric(options: HistogramMetricOptions): HistogramMetric;
```

### Parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `options` | `HistogramMetricOptions` | Yes | Metric definition; its `name` selects the cached instance. |

### Returns

The existing or newly created `HistogramMetric` for `options.name`.

### Throws

Throws the SDK's non-exported initialization error when a new wrapper must be created before meter initialization.

### Example

```ts
import { createHistogramMetric } from '@pague-co-uk/sms-gateway-telemetry';

const duration = createHistogramMetric({ name: 'db_query_duration', unit: 'ms' });
duration.record(18, { operation: 'select' });
```

### Best Practices

Use one factory call per named distribution and reuse its result. Do not recreate the same name with a new unit or description.

### Related APIs

`HistogramMetric`, `createHistogram`, `setCommonMetricAttributes`.

## GaugeMetric

### Purpose

Wraps an observable gauge whose callback returns a current number, while merging common attributes with optional fixed attributes.

### Signature

```ts
class GaugeMetric {
  constructor(
    options: GaugeMetricOptions,
    observe: () => number,
    attributes?: MetricAttributes,
  );
  getInstrument(): import('@opentelemetry/api').ObservableGauge;
}
```

### Parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `options` | `GaugeMetricOptions` | Yes | Constructor metric definition. |
| `observe` | `() => number` | Yes | Function called during collection to obtain the current value. |
| `attributes` | `MetricAttributes` | No | Fixed attributes for every observation, merged over common attributes. |

### Returns

The constructor creates an instance. `getInstrument` returns its `ObservableGauge`.

### Throws

Construction throws the SDK's non-exported initialization error if the meter is not initialized.

### Constructor

`new GaugeMetric(options, observe, attributes?)` creates an observable gauge and registers its callback immediately. It does not register the wrapper in the name-based cache.

### Properties

No public properties are exposed.

### Methods

`getInstrument()` returns the underlying OpenTelemetry `ObservableGauge`.

### Lifecycle

The callback remains registered for the lifetime of the underlying meter. There is no public unregister or dispose operation; shut down telemetry at application teardown.

### Thread safety

The wrapper does not mutate public state. The supplied `observe` callback must safely read any application state it closes over; each Node.js worker has separate module state.

### Example

```ts
import { GaugeMetric } from '@pague-co-uk/sms-gateway-telemetry';

let openSockets = 0;
const gauge = new GaugeMetric({ name: 'open_sockets' }, () => openSockets);
gauge.getInstrument();
```

### Best Practices

Make `observe` fast, synchronous, and side-effect free. Prefer `createGaugeMetric` for shared named gauges.

### Related APIs

`createGaugeMetric`, `createGauge`, `setCommonMetricAttributes`.

## createGaugeMetric

### Purpose

Creates or returns a registry-cached `GaugeMetric` for a metric name.

### Signature

```ts
function createGaugeMetric(
  options: GaugeMetricOptions,
  observe: () => number,
  attributes?: MetricAttributes,
): GaugeMetric;
```

### Parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `options` | `GaugeMetricOptions` | Yes | Metric definition; its `name` selects the cached instance. |
| `observe` | `() => number` | Yes | Value supplier used only if a new wrapper is created. |
| `attributes` | `MetricAttributes` | No | Fixed observation attributes used only if a new wrapper is created. |

### Returns

The existing or newly created `GaugeMetric` for `options.name`.

### Throws

Throws the SDK's non-exported initialization error when a new wrapper must be created before meter initialization.

### Example

```ts
import { createGaugeMetric } from '@pague-co-uk/sms-gateway-telemetry';

let pendingJobs = 0;
createGaugeMetric(
  { name: 'jobs_pending', description: 'Jobs waiting for processing' },
  () => pendingJobs,
  { queue: 'billing' },
);
```

### Best Practices

Create once and keep the supplied state authoritative. Calls with an already registered name ignore their new callback and attributes.

### Related APIs

`GaugeMetric`, `createGauge`, `GaugeMetricOptions`.

## UpDownCounterMetric

### Purpose

Wraps an OpenTelemetry up-down counter, adding optional instance attributes and SDK common metric attributes to each delta.

### Signature

```ts
class UpDownCounterMetric {
  constructor(options: UpDownCounterMetricOptions, attributes?: MetricAttributes);
  increment(attributes?: MetricAttributes): void;
  decrement(attributes?: MetricAttributes): void;
  add(value: number, attributes?: MetricAttributes): void;
  getInstrument(): import('@opentelemetry/api').UpDownCounter;
}
```

### Parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `options` | `UpDownCounterMetricOptions` | Yes | Constructor metric definition. |
| `attributes` | `MetricAttributes` | No | Constructor fixed attributes, or method per-call attributes. Per-call values override fixed values. |
| `value` | `number` | Yes, for `add` | Positive or negative delta to add. |

### Returns

The constructor creates an instance. `increment`, `decrement`, and `add` return `void`; `getInstrument` returns its `UpDownCounter`.

### Throws

Construction throws the SDK's non-exported initialization error if the meter is not initialized.

### Constructor

`new UpDownCounterMetric(options, attributes?)` creates a new underlying up-down counter immediately. It does not register the wrapper in the name-based cache.

### Properties

No public properties are exposed.

### Methods

- `increment(attributes?)` adds `1`.
- `decrement(attributes?)` adds `-1`.
- `add(value, attributes?)` adds `value`.
- `getInstrument()` returns the underlying OpenTelemetry `UpDownCounter`.

### Lifecycle

The instance remains usable for the lifetime of the initialized meter. It has no dispose method; shut down telemetry at application teardown.

### Thread safety

The wrapper contains no mutable public state. In a Node.js process, calls are safe across asynchronous tasks; worker threads have separate module state and must initialize independently.

### Example

```ts
import { UpDownCounterMetric } from '@pague-co-uk/sms-gateway-telemetry';

const activeJobs = new UpDownCounterMetric({ name: 'active_jobs' }, { queue: 'billing' });
activeJobs.increment();
try {
  // Process a job.
} finally {
  activeJobs.decrement();
}
```

### Best Practices

Balance increments and decrements across all completion paths. Prefer `createUpDownCounterMetric` when a single shared instance per name is desired.

### Related APIs

`createUpDownCounterMetric`, `CounterMetric`, `setCommonMetricAttributes`.

## createUpDownCounterMetric

### Purpose

Creates or returns a registry-cached `UpDownCounterMetric` for a metric name.

### Signature

```ts
function createUpDownCounterMetric(
  options: UpDownCounterMetricOptions,
  attributes?: MetricAttributes,
): UpDownCounterMetric;
```

### Parameters

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `options` | `UpDownCounterMetricOptions` | Yes | Metric definition; its `name` selects the cached instance. |
| `attributes` | `MetricAttributes` | No | Fixed attributes used only if a new wrapper is created. |

### Returns

The existing or newly created `UpDownCounterMetric` for `options.name`.

### Throws

Throws the SDK's non-exported initialization error when a new wrapper must be created before meter initialization.

### Example

```ts
import { createUpDownCounterMetric } from '@pague-co-uk/sms-gateway-telemetry';

const leases = createUpDownCounterMetric({ name: 'database_leases_active' }, { pool: 'primary' });
leases.increment();
leases.decrement();
```

### Best Practices

Use one factory call per logical metric name. Later calls with the same name retain the original fixed attributes.

### Related APIs

`UpDownCounterMetric`, `createCounterMetric`, `UpDownCounterMetricOptions`.

# Tracing

Tracing APIs are exported by the root package. See the current public export inventory above; all span helpers require `initTelemetry()` or `initTracer()` before use.

# HTTP

HTTP lifecycle, middleware, context, logging, tracing, metrics, constants, and request/response types are exported by the root package. See the current public export inventory above. HTTP metrics are created lazily on first use after telemetry initialization.

# RabbitMQ

RabbitMQ lifecycle, publishing, consuming, context propagation, logging, metrics, constants, and channel types are exported by the root package. RabbitMQ metric instruments are created lazily on their first recording call after telemetry initialization.

# Database

Database lifecycle, logging, metrics, and constants are exported by the root package. Database metric instruments are created lazily on their first recording call after telemetry initialization.

# SMPP

SMPP lifecycle, logging, metrics, and constants are exported by the root package. SMPP metric instruments are created lazily on their first recording call after telemetry initialization.

# NestJS

No NestJS APIs are exported by the published root package.

# Common Types

## ServiceConfig

### Purpose

Defines the logical identity of the service initialized by telemetry.

### Signature

```ts
interface ServiceConfig {
  name: string;
  version: string;
}
```

### Parameters

Not applicable.

### Returns

Not applicable; this is an interface.

### Throws

No exceptions are thrown directly.

### Properties

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `name` | `string` | Yes | Logical service name, such as `ingestion-api`. It must not be blank during `initTelemetry`. |
| `version` | `string` | Yes | Version of the running service. |

### Example

```ts
import type { ServiceConfig } from '@pague-co-uk/sms-gateway-telemetry';

const service: ServiceConfig = { name: 'billing-api', version: '1.0.0' };
```

### Best Practices

Use a stable deployment/service name and the deployed build version. Do not use a host name or request-specific value as the name.

### Related APIs

`TelemetryConfig`, `initTelemetry`.

## CollectorConfig

### Purpose

Defines full OTLP/HTTP endpoints for trace and metric export.

### Signature

```ts
interface CollectorConfig {
  tracesEndpoint: string;
  metricsEndpoint: string;
}
```

### Parameters

Not applicable.

### Returns

Not applicable; this is an interface.

### Throws

No exceptions are thrown directly.

### Properties

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `tracesEndpoint` | `string` | Yes | Full OTLP HTTP traces endpoint, such as `http://otel-collector:4318/v1/traces`. |
| `metricsEndpoint` | `string` | Yes | Full OTLP HTTP metrics endpoint, such as `http://otel-collector:4318/v1/metrics`. |

### Example

```ts
import type { CollectorConfig } from '@pague-co-uk/sms-gateway-telemetry';

const collector: CollectorConfig = {
  tracesEndpoint: 'https://otel.example.com/v1/traces',
  metricsEndpoint: 'https://otel.example.com/v1/metrics',
};
```

### Best Practices

Provide complete URLs, including the protocol and OTLP path. Do not supply a base collector URL only; `initTelemetry` validates URLs but does not append paths.

### Related APIs

`TelemetryConfig`, `initTelemetry`.

## MetricsConfig

### Purpose

Defines the periodic metric export interval used by telemetry initialization.

### Signature

```ts
interface MetricsConfig {
  exportIntervalMillis: number;
}
```

### Parameters

Not applicable.

### Returns

Not applicable; this is an interface.

### Throws

No exceptions are thrown directly.

### Properties

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `exportIntervalMillis` | `number` | Yes | Interval, in milliseconds, between metric exports. It must be greater than zero during `initTelemetry`. |

### Example

```ts
import type { MetricsConfig } from '@pague-co-uk/sms-gateway-telemetry';

const metrics: MetricsConfig = { exportIntervalMillis: 10_000 };
```

### Best Practices

Choose an interval that balances freshness and export overhead. Do not use zero or a negative value.

### Related APIs

`TelemetryConfig`, `initTelemetry`.

## LoggerConfig

### Purpose

Configures the logger created as part of `initTelemetry`.

### Signature

```ts
interface LoggerConfig {
  level?: string;
  transport?: TransportConfig;
}
```

### Parameters

Not applicable.

### Returns

Not applicable; this is an interface.

### Throws

No exceptions are thrown directly.

### Properties

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `level` | `string` | No | Minimum log level. `initTelemetry` accepts `trace`, `debug`, `info`, `warn`, `error`, or `fatal`. |
| `transport` | `TransportConfig` | No | Logger destination configuration. |

### Example

```ts
import type { LoggerConfig } from '@pague-co-uk/sms-gateway-telemetry';

const logger: LoggerConfig = { level: 'warn', transport: { stdout: true } };
```

### Best Practices

Set the level explicitly for predictable deployments. Do not use arbitrary strings with `initTelemetry`; it validates this property.

### Related APIs

`TelemetryConfig`, `TransportConfig`, `initLogger`.

## InstrumentationConfig

### Purpose

Configures automatic OpenTelemetry instrumentations enabled by telemetry initialization.

### Signature

```ts
interface InstrumentationConfig {
  disableFs?: boolean;
}
```

### Parameters

Not applicable.

### Returns

Not applicable; this is an interface.

### Throws

No exceptions are thrown directly.

### Properties

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `disableFs` | `boolean` | No | Disables filesystem instrumentation. |

### Example

```ts
import type { InstrumentationConfig } from '@pague-co-uk/sms-gateway-telemetry';

const instrumentations: InstrumentationConfig = { disableFs: true };
```

### Best Practices

Disable filesystem instrumentation in production when its spans are low value or too numerous. Leave it enabled only when filesystem visibility is useful and its volume is acceptable.

### Related APIs

`TelemetryConfig`, `initTelemetry`.

## TelemetryConfig

### Purpose

Provides all configuration required to bootstrap the SDK through `initTelemetry`.

### Signature

```ts
interface TelemetryConfig {
  service: ServiceConfig;
  collector: CollectorConfig;
  metrics: MetricsConfig;
  logger?: LoggerConfig;
  instrumentations?: InstrumentationConfig;
}
```

### Parameters

Not applicable.

### Returns

Not applicable; this is an interface.

### Throws

No exceptions are thrown directly.

### Properties

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| `service` | `ServiceConfig` | Yes | Logical service identity. |
| `collector` | `CollectorConfig` | Yes | OTLP trace and metric endpoint configuration. |
| `metrics` | `MetricsConfig` | Yes | Metric export interval. |
| `logger` | `LoggerConfig` | No | Optional logging configuration. |
| `instrumentations` | `InstrumentationConfig` | No | Optional automatic instrumentation configuration. |

### Example

```ts
import { initTelemetry, type TelemetryConfig } from '@pague-co-uk/sms-gateway-telemetry';

const config: TelemetryConfig = {
  service: { name: 'billing-api', version: '1.0.0' },
  collector: {
    tracesEndpoint: 'http://otel-collector:4318/v1/traces',
    metricsEndpoint: 'http://otel-collector:4318/v1/metrics',
  },
  metrics: { exportIntervalMillis: 10_000 },
  instrumentations: { disableFs: true },
};

initTelemetry(config);
```

### Best Practices

Keep this configuration at the application composition root and obtain environment-specific values there. Do not mutate it after initialization; the SDK reads it only during bootstrap.

### Related APIs

`initTelemetry`, `ServiceConfig`, `CollectorConfig`, `MetricsConfig`, `LoggerConfig`, `InstrumentationConfig`.

# Errors

## TelemetryAlreadyInitializedError

### Purpose

Signals an attempt to register a second telemetry SDK instance in the SDK telemetry manager.

### Signature

```ts
class TelemetryAlreadyInitializedError extends Error {
  constructor();
}
```

### Parameters

None.

### Returns

Constructs an `Error` with the message `Telemetry has already been initialized.`

### Throws

No exceptions are thrown directly by the constructor.

### Properties

Inherits standard `Error` properties, including `name`, `message`, and optional `stack`.

### Constructor

`new TelemetryAlreadyInitializedError()` creates the error with its fixed message.

### Methods

No methods beyond those inherited from `Error` are exposed.

### Lifecycle

The error is an ordinary short-lived value; no lifecycle management is required.

### Thread safety

Error instances have no shared SDK state. Do not mutate one instance across asynchronous consumers.

### Example

```ts
import {
  TelemetryAlreadyInitializedError,
  initTelemetry,
} from '@pague-co-uk/sms-gateway-telemetry';

try {
  initTelemetry({
    service: { name: 'billing-api', version: '1.0.0' },
    collector: {
      tracesEndpoint: 'http://otel-collector:4318/v1/traces',
      metricsEndpoint: 'http://otel-collector:4318/v1/metrics',
    },
    metrics: { exportIntervalMillis: 10_000 },
  });
} catch (error) {
  if (error instanceof TelemetryAlreadyInitializedError) {
    // Keep exactly one SDK initialization per process.
  }
}
```

### Best Practices

Prevent this through application architecture: call `initTelemetry` once. Catch it only where a reusable bootstrap may be invoked more than once.

### Related APIs

`initTelemetry`, `shutdownTelemetry`, `TelemetryNotInitializedError`.

## TelemetryNotInitializedError

### Purpose

Signals access to the telemetry manager before an SDK instance has been registered.

### Signature

```ts
class TelemetryNotInitializedError extends Error {
  constructor();
}
```

### Parameters

None.

### Returns

Constructs an `Error` with the message `Telemetry has not been initialized. Call initTelemetry() first.`

### Throws

No exceptions are thrown directly by the constructor.

### Properties

Inherits standard `Error` properties, including `name`, `message`, and optional `stack`.

### Constructor

`new TelemetryNotInitializedError()` creates the error with its fixed message.

### Methods

No methods beyond those inherited from `Error` are exposed.

### Lifecycle

The error is an ordinary short-lived value; no lifecycle management is required.

### Thread safety

Error instances have no shared SDK state. Do not mutate one instance across asynchronous consumers.

### Example

```ts
import { TelemetryNotInitializedError } from '@pague-co-uk/sms-gateway-telemetry';

const error = new TelemetryNotInitializedError();
console.error(error.message);
```

### Best Practices

Initialize telemetry before accessing telemetry-dependent application code. This error class is exported, but the telemetry manager that directly throws it is not publicly exported.

### Related APIs

`initTelemetry`, `TelemetryAlreadyInitializedError`.

# Constants

The root package exports HTTP, RabbitMQ, database, and SMPP constants listed in the current public export inventory above.

# Documentation Review

- Undocumented public exports: none. The detailed core entries and the current root-barrel inventory together cover all 166 symbols emitted from `src/index.ts`.
- Inconsistent naming: `InternalLoggerConfig` is publicly exported even though its name labels it internal. The telemetry-related configuration types use `service.name`, while `InternalLoggerConfig` uses `serviceName`.
- Duplicate APIs: raw instrument factories (`createCounter`, `createHistogram`, `createGauge`) overlap with wrapper factories (`createCounterMetric`, `createHistogramMetric`, `createGaugeMetric`). They differ materially—wrappers merge common attributes and cache by name—but this distinction should be prominent in introductory documentation.
- APIs exposing internal implementation details: public signatures expose external Pino and OpenTelemetry types, which makes those dependency APIs part of the effective contract. Several public getters/factories throw `NotInitializedError`, but that error type is not exported. `TelemetryAlreadyInitializedError` and `TelemetryNotInitializedError` are public although the manager that directly uses them is not public.
- APIs that probably should not be public: `InternalLoggerConfig` and `clearComponentLoggers` look internal/test-oriented; `TelemetryNotInitializedError` has no direct public throw site. Consider keeping them only if a documented integration need exists.
- Missing JSDoc comments: exported interfaces in `src/metrics/types.ts`, `src/logger/context.ts`, `src/logger/transports.ts`, `src/logger/logger.ts`, and most exported functions/classes lack source JSDoc. The root `src/errors.ts` error classes also lack JSDoc. Existing comments in `src/types.ts` and `UpDownCounterMetricOptions` are partial rather than API-complete.
- Opportunities to simplify the public API: make `InternalLoggerConfig` private or rename it `LoggerInitConfig`; export the initialization error type used by `getLogger` and `getMeter`, or use the public telemetry error types consistently; consider choosing either raw factories or wrapper factories as the primary API; and split the large root barrel into explicit supported subpath exports if independent module imports are a supported contract.

# Public API Summary

```text
Telemetry
  initTelemetry()
  shutdownTelemetry()

Logger
  InternalLoggerConfig
  initLogger()
  getLogger()
  LoggerContext
  getTraceContext()
  createChildLogger()
  TransportConfig
  FileTransportConfig
  getComponentLogger()
  clearComponentLoggers()

Context
  LoggerContext
  getTraceContext()
  setCommonMetricAttributes()
  getCommonMetricAttributes()
  mergeMetricAttributes()

Metrics
  MeterConfig
  initMeter()
  getMeter()
  createCounter()
  createHistogram()
  createGauge()
  MetricAttributes
  CounterMetricOptions
  HistogramMetricOptions
  GaugeMetricOptions
  UpDownCounterMetricOptions
  CounterMetric
  createCounterMetric()
  HistogramMetric
  createHistogramMetric()
  GaugeMetric
  createGaugeMetric()
  UpDownCounterMetric
  createUpDownCounterMetric()

Tracing
  TracerConfig, initTracer(), getTracer(), startSpan(), startActiveSpan()
  getActiveSpan(), finishSpan(), failSpan(), endSpan()
  withSpan(), withSpanSync(), withSyncSpan(), withPromiseSpan(), withObservableSpan()
  traceObservable(), setAttribute(), setAttributes(), setStatus(), recordException(), addEvent(), spanNaming
HTTP
  Request context, headers, lifecycle, middleware, logging, metrics, tracing, constants, and HTTP types
RabbitMQ
  Consumer, publisher, context propagation, lifecycle, logging, metrics, constants, and channel types
Database
  Lifecycle, logging, metrics, and constants
SMPP
  Lifecycle, logging, metrics, and constants
NestJS
  (no root-package exports)

Common Types
  ServiceConfig
  CollectorConfig
  MetricsConfig
  LoggerConfig
  InstrumentationConfig
  TelemetryConfig

Errors
  TelemetryAlreadyInitializedError
  TelemetryNotInitializedError

Constants
  HTTP, RabbitMQ, database, and SMPP constants
```
