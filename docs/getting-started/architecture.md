# Architecture

This document describes the internal architecture of the Pague Telemetry SDK.

Understanding this architecture will help you extend the SDK and understand how telemetry flows through an application.

---

# High-Level Architecture

```
                           Application
                                │
                                ▼
┌─────────────────────────────────────────────────────┐
│             Pague Telemetry SDK                     │
│                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐           │
│  │ Logger   │  │ Metrics  │  │ Tracing  │           │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘           │
│       │             │             │                 │
│       └─────────────┼─────────────┘                 │
│                     │                               │
│               Context Module                        │
│          (AsyncLocalStorage)                        │
│                     │                               │
│              Telemetry Bootstrap                    │
└─────────────────────┼───────────────────────────────┘
                      │
                      ▼
              OpenTelemetry SDK
                      │
                      ▼
           OpenTelemetry Collector
          ┌─────────┼─────────┐
          ▼         ▼         ▼
      Prometheus   Tempo     Loki
```

---

# Design Philosophy

The SDK is intentionally layered.

Applications never communicate directly with OpenTelemetry.

Instead they interact with a simplified API.

```
Application

↓

Telemetry SDK

↓

OpenTelemetry

↓

Collector

↓

Observability Stack
```

This allows the SDK to evolve independently from OpenTelemetry while maintaining a stable public API.

---

# Core Modules

## Telemetry

Responsible for:

- SDK initialization
- Resource creation
- Exporters
- Instrumentations
- Lifecycle management
- Graceful shutdown

Everything begins with

```ts
initTelemetry(...)
```

Only one telemetry instance exists within a process.

---

## Logger

Responsible for:

- Structured JSON logs
- Trace correlation
- Context correlation
- Child loggers
- Multiple transports
- Redaction
- Error serialization

The logger is implemented as a singleton.

```
Application

↓

getLogger()

↓

Logger Singleton

↓

stdout
file
future transports
```

---

## Metrics

Responsible for:

- Counters
- Histograms
- Observable Gauges
- Metric registry
- Common attributes

Applications never interact directly with the OpenTelemetry meter.

Instead they create SDK metrics.

```
createCounterMetric()

↓

CounterMetric

↓

OpenTelemetry Counter

↓

OTLP Exporter
```

---

## Tracing

Responsible for:

- Tracer management
- Span creation
- Span helpers
- Active spans
- Exception recording
- Attribute helpers

Applications use helper functions instead of the OpenTelemetry API directly.

Example

```
withSpan()

↓

startActiveSpan()

↓

OpenTelemetry Tracer

↓

Tempo
```

---

## Context

The Context module is the glue that connects every other module.

It provides request-scoped context using Node.js AsyncLocalStorage.

```
Incoming Request

↓

Context Created

↓

Logger

↓

Metrics

↓

Tracing
```

Once context is established, it becomes automatically available to every module without being passed explicitly through function calls.

---

# Request Lifecycle

The following diagram shows how telemetry flows during a request.

```
Incoming Request

↓

Context Created

↓

Span Started

↓

Business Logic

↓

Logger

↓

Metrics

↓

Span Ends

↓

Telemetry Exported
```

Every log entry and span automatically contains the current request context.

---

# Context Propagation

Request context is propagated using AsyncLocalStorage.

```
HTTP Request

↓

AsyncLocalStorage

↓

Logger

↓

Tracing

↓

Metrics
```

Developers only establish the context once.

```ts
updateContext({
    requestId,
    tenantId,
});
```

Everything else happens automatically.

---

# Logging Flow

```
Application

↓

Logger

↓

Current Context

↓

Current Span

↓

JSON Log

↓

stdout/file

↓

Future:
Loki
OTLP Logs
Cloud Logging
```

Every log entry contains:

- service
- version
- traceId
- spanId
- requestId
- correlationId
- tenantId
- clientId

when available.

---

# Metrics Flow

```
Application

↓

CounterMetric

↓

Metric Registry

↓

OpenTelemetry Meter

↓

OTLP Metric Exporter

↓

Collector

↓

Prometheus
```

Metrics automatically include common attributes such as:

- service
- version
- environment

---

# Tracing Flow

```
Application

↓

withSpan()

↓

Tracer

↓

Span

↓

Collector

↓

Tempo
```

Context updates automatically become span attributes.

---

# Why Wrap OpenTelemetry?

The SDK intentionally hides most OpenTelemetry APIs.

Instead of

```ts
counter.add(1);
```

applications use

```ts
requests.increment();
```

Instead of

```ts
trace.getTracer(...);
```

applications use

```ts
withSpan(...);
```

Benefits:

- Stable public API
- Easier upgrades
- Consistent developer experience
- Opinionated defaults
- Future extensibility

---

# Package Structure

```
src/

├── common/
├── context/
├── logger/
├── metrics/
├── telemetry/
├── tracing/
└── index.ts
```

Each module has a single responsibility and exposes only its public API.

---

# Extensibility

The architecture is designed to support future modules without changing the core SDK.

Planned modules include:

- HTTP
- NestJS
- RabbitMQ
- SMPP
- SMS Gateway
- Health
- Diagnostics

These modules will consume the existing logger, metrics, tracing, and context APIs rather than introducing new telemetry mechanisms.

---

# Summary

The SDK is built around four foundational capabilities:

- Logging
- Metrics
- Tracing
- Context

The Telemetry module initializes these capabilities, while the Context module ties them together.

Applications interact with a small, consistent API, while the SDK manages the underlying OpenTelemetry implementation and telemetry lifecycle.