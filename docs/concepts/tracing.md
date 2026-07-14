# Tracing

The Pague Telemetry SDK provides a simplified API for distributed tracing built on top of OpenTelemetry.

Applications do not interact directly with the OpenTelemetry tracing API. Instead, the SDK provides helper functions that automatically create spans, propagate context, record exceptions, and enrich traces.

---

# What is Distributed Tracing?

A distributed trace represents the complete lifecycle of a request as it flows through one or more services.

For example:

```
Client

↓

Control Plane API

↓

RabbitMQ

↓

SMS Worker

↓

SMPP Server

↓

SMSC
```

Each step produces one or more spans.

Together, those spans form a trace.

---

# What is a Span?

A span represents a single unit of work.

Examples include:

- Processing an HTTP request
- Publishing a RabbitMQ message
- Processing a queue message
- Calling an external API
- Sending an SMPP Submit_SM
- Executing a database query

Every span contains:

- Name
- Start time
- End time
- Duration
- Attributes
- Events
- Status
- Parent span (optional)

---

# Trace Hierarchy

```
Trace

├── HTTP Request

│   ├── Validate Request

│   ├── Save Database

│   └── Publish RabbitMQ

└── SMS Worker

    ├── Process Message

    └── Send SMPP
```

This hierarchy allows the complete request lifecycle to be visualized in Grafana Tempo.

---

# Creating a Span

The recommended way to create spans is using `withSpan()`.

```ts
import {
    withSpan,
} from '@pague-co-uk/sms-gateway-telemetry';

await withSpan(
    'Process SMS',
    async () => {

        // business logic

    },
);
```

The SDK automatically:

- Starts the span
- Makes it active
- Records exceptions
- Ends the span

---

# Nested Spans

Nested operations naturally become child spans.

```ts
await withSpan(
    'Process Request',
    async () => {

        await withSpan(
            'Validate Input',
            async () => {

            },
        );

        await withSpan(
            'Store Database',
            async () => {

            },
        );

    },
);
```

Result:

```
Process Request

├── Validate Input

└── Store Database
```

---

# Span Attributes

Attributes describe a span.

Example

```ts
await withSpan(
    'Send SMS',
    async () => {

        setAttribute(
            'client.id',
            clientId,
        );

        setAttribute(
            'route',
            route,
        );

    },
);
```

Attributes make traces searchable.

---

# Multiple Attributes

```ts
setAttributes({

    clientId,

    tenantId,

    route,

});
```

---

# Events

Events capture important moments during span execution.

```ts
addEvent(
    'Message queued',
);
```

Events appear on the span timeline in Grafana Tempo.

Useful examples:

- Authentication succeeded
- Validation completed
- Retry initiated
- Queue message received
- SMPP Bind completed

---

# Recording Exceptions

Exceptions are automatically recorded when using `withSpan()`.

Manual recording is also supported.

```ts
try {

}
catch (error) {

    recordException(error);

}
```

Recorded exceptions become part of the trace.

---

# Active Span

Retrieve the current span.

```ts
import {
    getActiveSpan,
} from '@pague-co-uk/sms-gateway-telemetry';

const span = getActiveSpan();
```

This is useful when extending an existing trace.

---

# Starting Spans Manually

The SDK also exposes lower-level helpers.

```ts
const span = startSpan(
    'Generate Report',
);

try {

}
finally {

    endSpan(span);

}
```

In most cases, `withSpan()` is preferred.

---

# Automatic Context Enrichment

The Context module automatically enriches the active span.

```ts
updateContext({

    requestId: '123',

    tenantId: 'tenant-a',

    clientId: 'client-a',

});
```

The active span automatically receives:

```
requestId

tenantId

clientId
```

Applications do not need to manually add these attributes.

---

# Trace Correlation

Every log generated within an active span automatically includes:

```
traceId

spanId
```

This allows logs and traces to be correlated in Grafana.

---

# Viewing Traces

Traces are exported through the OpenTelemetry Collector to Grafana Tempo.

A typical trace includes:

- Root span
- Child spans
- Duration
- Attributes
- Events
- Exceptions

This provides a complete picture of request execution.

---

# Best Practices

## Use Meaningful Span Names

Good

```
Process SMS

Publish RabbitMQ Message

Send Submit_SM

Validate Request
```

Avoid

```
function1

handler

task

operation
```

---

## Record Important Attributes

Good

```
tenantId

clientId

route

queue

status
```

Avoid

```
password

accessToken

phoneNumber

large payloads
```

---

## Keep Spans Focused

Each span should represent a single logical operation.

Avoid creating extremely large spans that encompass unrelated work.

---

## Prefer `withSpan()`

Use `withSpan()` whenever possible.

It ensures:

- Proper context propagation
- Exception recording
- Automatic span completion

Manual span management should be reserved for advanced scenarios.

---

# Future Enhancements

The tracing module will be extended with:

- HTTP request spans
- RabbitMQ publish/consume spans
- SMPP session spans
- Database tracing helpers
- Decorators (`@Trace`)
- Automatic retry spans
- Span naming conventions
- Cross-service trace propagation

---

# Summary

The tracing module provides:

- Simplified span creation
- Automatic context propagation
- Exception recording
- Span attributes
- Span events
- Trace correlation
- OpenTelemetry compatibility

Applications interact with a small, consistent API while the SDK manages the underlying tracing implementation.