# HTTP Guide

This guide demonstrates how to instrument an HTTP application using the Pague Telemetry SDK.

By the end of this guide your application will automatically produce:

- Structured logs
- Distributed traces
- HTTP metrics
- Request context
- Correlation IDs

without writing observability code.

---

# Prerequisites

Before using the HTTP module:

- Initialize the Telemetry SDK
- Configure an OpenTelemetry Collector
- Ensure Grafana, Tempo and Prometheus are running

---

# Basic Usage

Register the middleware before your routes.

```ts
import express from 'express';

import {
    createHttpMiddleware,
} from '@pague-co-uk/sms-gateway-telemetry';

const app = express();

app.use(
    createHttpMiddleware(),
);
```

Every request is now automatically instrumented.

---

# Express Example

```ts
import express from 'express';

import {
    createHttpMiddleware,
    getLogger,
} from '@pague-co-uk/sms-gateway-telemetry';

const app = express();

app.use(
    createHttpMiddleware(),
);

app.get(
    '/',
    (_, res) => {

        const logger = getLogger();

        logger.info(
            'Processing request',
        );

        res.send(
            'Hello World',
        );

    },
);
```

---

# What Happens Automatically?

When a request reaches the middleware:

```
Incoming Request

↓

Request Context

↓

Request ID

↓

Correlation ID

↓

HTTP Span

↓

Metrics

↓

Request Log

↓

Application

↓

Completion Log

↓

Metrics

↓

Span End
```

No manual instrumentation is required.

---

# Request Context

The middleware automatically creates request context.

Available values include:

```
requestId

correlationId

operation
```

These values are available throughout the request.

---

# Logs

Request Started

```json
{
    "component":"http",
    "method":"GET",
    "path":"/"
}
```

Application Log

```json
{
    "traceId":"...",
    "requestId":"...",
    "msg":"Processing request"
}
```

Request Completed

```json
{
    "component":"http",
    "statusCode":200,
    "durationMs":21
}
```

---

# Metrics

The middleware automatically records:

```
http.requests.total

http.request.duration

http.requests.active

http.request.size

http.response.size
```

Query examples

```promql
http_requests_total
```

Average latency

```promql
rate(http_request_duration_sum[5m])
/
rate(http_request_duration_count[5m])
```

---

# Traces

Each request becomes a root span.

Example

```
GET /
```

Automatically recorded attributes include:

```
http.method

http.route

http.url

http.status_code

http.host

http.scheme

http.client_ip
```

View traces in Grafana Tempo.

---

# Response Headers

Every response includes:

```
X-Request-ID

X-Correlation-ID
```

These identifiers can be used by clients when reporting issues.

Example

```
curl -I http://localhost:3000
```

```
X-Request-ID:
7d36d...

X-Correlation-ID:
ec5d...
```

---

# Exceptions

Unhandled exceptions are automatically:

- Logged
- Recorded on the span
- Marked as failed
- Included in telemetry

Applications should continue using their preferred exception handling strategy.

---

# Configuration

Default

```ts
app.use(
    createHttpMiddleware(),
);
```

Custom

```ts
app.use(
    createHttpMiddleware({

        context: {

            requestIdHeader:
                'x-request-id',

            correlationIdHeader:
                'x-correlation-id',

        },

    }),
);
```

---

# Best Practices

Register the middleware early.

Good

```ts
app.use(
    createHttpMiddleware(),
);

app.use(routes);
```

Avoid

```ts
app.use(routes);

app.use(
    createHttpMiddleware(),
);
```

---

## Use Structured Logging

Good

```ts
logger.info({

    customerId,

    route,

});
```

Avoid

```ts
logger.info(
    `Customer ${customerId}`,
);
```

---

## Avoid Duplicate Request Logging

The middleware already records request lifecycle events.

Application logs should focus on business events rather than HTTP lifecycle events.

---

# Troubleshooting

## No Logs

Verify

```
LOG_LEVEL
```

is configured correctly.

---

## No Metrics

Verify

```
OTLP Metric Exporter

↓

Collector

↓

Prometheus
```

---

## No Traces

Verify

```
OTLP Trace Exporter

↓

Collector

↓

Tempo
```

---

## Missing Request IDs

Ensure the middleware is registered before application routes.

---

# Next Steps

The HTTP module serves as the foundation for future integrations.

Upcoming modules include:

- NestJS
- RabbitMQ
- SMPP
- WebSockets