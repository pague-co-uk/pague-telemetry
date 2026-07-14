# Quick Start

This guide demonstrates how to instrument a service using the Pague Telemetry SDK.

By the end of this guide you will have:

- Structured logging
- Distributed tracing
- Metrics
- Context propagation

running in your application.

---

# Step 1 — Initialize Telemetry

Telemetry should be initialized before the application starts.

```ts
import { initTelemetry } from '@pague-co-uk/sms-gateway-telemetry';

import packageJson from '../package.json';

initTelemetry({
  service: {
    name: 'control-plane-api',
    version: packageJson.version,
  },

  collector: {
    tracesEndpoint: 'http://localhost:4318/v1/traces',
    metricsEndpoint: 'http://localhost:4318/v1/metrics',
  },

  metrics: {
    exportIntervalMillis: 10000,
  },

  logger: {
    level: 'info',
  },
});
```

---

# Step 2 — Create a Logger

```ts
import { getLogger } from '@pague-co-uk/sms-gateway-telemetry';

const logger = getLogger();
```

Log a message.

```ts
logger.info('Application started');
```

Output

```json
{
  "service":"control-plane-api",
  "version":"1.0.0",
  "traceId":"...",
  "spanId":"...",
  "msg":"Application started"
}
```

---

# Step 3 — Create Metrics

Create a request counter.

```ts
import {
  createCounterMetric,
} from '@pague-co-uk/sms-gateway-telemetry';

const requests = createCounterMetric({
  name: 'app.requests.total',
  description: 'Application requests',
});
```

Increment it.

```ts
requests.increment({
  endpoint: '/',
  method: 'GET',
});
```

Create a request duration histogram.

```ts
import {
  createHistogramMetric,
} from '@pague-co-uk/sms-gateway-telemetry';

const duration = createHistogramMetric({
  name: 'app.request.duration',
  unit: 'ms',
});
```

Record a duration.

```ts
duration.record(25, {
  endpoint: '/',
});
```

---

# Step 4 — Create a Span

```ts
import {
  withSpan,
} from '@pague-co-uk/sms-gateway-telemetry';

await withSpan(
  'Process Request',
  async (span) => {

    span.setAttribute(
      'endpoint',
      '/',
    );

    // business logic

  },
);
```

The span will automatically:

- Start
- Become active
- Record exceptions
- End

---

# Step 5 — Add Context

```ts
import {
  updateContext,
} from '@pague-co-uk/sms-gateway-telemetry';

updateContext({
  requestId: 'request-123',

  correlationId: 'correlation-123',

  tenantId: 'tenant-a',

  clientId: 'client-a',
});
```

Every subsequent log entry is automatically enriched.

```json
{
  "requestId":"request-123",
  "correlationId":"correlation-123",
  "tenantId":"tenant-a",
  "clientId":"client-a",
  "msg":"Processing request"
}
```

The active span is enriched with the same attributes.

---

# Complete Example

```ts
const logger = getLogger();

const requests = createCounterMetric({
  name: 'app.requests.total',
});

updateContext({
  requestId: '123',
});

await withSpan(
  'Handle Request',
  async () => {

    requests.increment();

    logger.info('Request received');

  },
);
```

This single block demonstrates logging, metrics, tracing, and context propagation working together.

---

# Verify in Grafana

## Logs

Search for:

```
service="control-plane-api"
```

Expected:

- Structured JSON logs
- Trace correlation
- Request context

---

## Metrics

Query:

```promql
app_requests_total
```

Expected:

```
app_requests_total{endpoint="/",method="GET"}
```

---

## Traces

Open Tempo.

You should see:

```
Process Request
```

with:

- Trace ID
- Span ID
- Request context
- Span attributes

---

# What's Next?

Continue to:

- Configuration
- Logging
- Metrics
- Tracing
- Context Propagation
- Architecture