# Metrics

The Pague Telemetry SDK provides a simple, type-safe API for creating and recording metrics.

Internally, the SDK uses OpenTelemetry Metrics, but applications interact with a simplified API designed for consistency and ease of use.

---

# Why Metrics?

Logs answer:

> What happened?

Traces answer:

> Where did it happen?

Metrics answer:

> How often does it happen?

Metrics provide quantitative insight into the health and performance of an application.

Examples include:

- Requests per second
- SMS throughput
- Processing latency
- Queue depth
- Error rates
- Active sessions

---

# Metric Types

The SDK currently supports three metric types.

| Type | Purpose |
|------|---------|
| Counter | Monotonically increasing values |
| Histogram | Distribution of recorded values |
| Gauge | Current observed value |

---

# Counters

Counters are used for values that only increase.

Examples

- Requests processed
- SMS submitted
- Messages delivered
- Errors
- Retries

Create a counter.

```ts
import {
    createCounterMetric,
} from '@pague-co-uk/sms-gateway-telemetry';

const requests = createCounterMetric({

    name: 'app.requests.total',

    description: 'Total application requests',

});
```

Increment the counter.

```ts
requests.increment();
```

Increment by a specific value.

```ts
requests.add(5);
```

Record additional attributes.

```ts
requests.increment({

    endpoint: '/',

    method: 'GET',

});
```

---

# Histograms

Histograms measure distributions.

Examples

- Request duration
- SMS processing latency
- Database query time
- Queue processing time

Create a histogram.

```ts
import {
    createHistogramMetric,
} from '@pague-co-uk/sms-gateway-telemetry';

const duration = createHistogramMetric({

    name: 'request.duration',

    unit: 'ms',

});
```

Record values.

```ts
duration.record(25);
```

With attributes.

```ts
duration.record(25, {

    endpoint: '/',

});
```

---

# Gauges

Gauges represent a value at a point in time.

Examples

- Active sessions
- Queue depth
- Connected SMPP clients
- Worker count

Create a gauge.

```ts
import {
    createGaugeMetric,
} from '@pague-co-uk/sms-gateway-telemetry';

let activeConnections = 12;

createGaugeMetric(

    {

        name: 'connections.active',

    },

    () => activeConnections,

);
```

The SDK observes the current value during metric collection.

---

# Common Metric Attributes

The SDK automatically adds common attributes to every metric.

Examples include:

- service
- version
- environment

Applications do not need to set these manually.

---

# Recording Attributes

Additional attributes may be recorded with each metric.

Example

```ts
requests.increment({

    endpoint: '/',

    method: 'POST',

    status: '200',

});
```

These attributes allow metrics to be grouped and filtered.

---

# Metric Registry

The SDK maintains a registry of metrics.

Creating the same metric multiple times returns the existing instance.

```ts
const counter1 = createCounterMetric({

    name: 'requests',

});

const counter2 = createCounterMetric({

    name: 'requests',

});
```

Both variables reference the same underlying metric.

This prevents duplicate instrument registration.

---

# Naming Conventions

Metric names should be descriptive.

Good

```
app.requests.total

sms.submitted.total

sms.delivery.latency

rabbitmq.messages.received
```

Avoid

```
counter1

metric

requests

value
```

---

# Attributes

Use low-cardinality attributes.

Good

```
endpoint

method

status

queue

route
```

Avoid

```
phoneNumber

messageId

timestamp

userAgent
```

High-cardinality attributes increase storage requirements and reduce query performance.

---

# Examples

Count requests.

```ts
requests.increment({

    endpoint: '/',

});
```

Measure request duration.

```ts
duration.record(18);
```

Observe queue depth.

```ts
queueDepth = 42;
```

---

# Performance

Metrics are lightweight.

Recommendations:

- Reuse metric instances.
- Avoid creating metrics dynamically.
- Keep attribute cardinality low.
- Record meaningful values.
- Use histograms for latency measurements.

---

# Future Enhancements

Planned metric features include:

- HTTP metrics
- RabbitMQ metrics
- SMPP metrics
- SMS Gateway metrics
- Database metrics
- Cache metrics
- Domain-specific metrics
- Automatic runtime metrics

---

# Summary

The metrics module provides:

- Type-safe wrappers
- Counter metrics
- Histogram metrics
- Observable gauges
- Automatic common attributes
- Metric registry
- OpenTelemetry compatibility

Applications interact with a small, consistent API while the SDK manages instrument creation and metric export.