# Context

The Context module provides request-scoped context propagation across the entire application.

It allows information about the current request to be established once and automatically made available to every component involved in processing that request.

The SDK uses Node.js **AsyncLocalStorage** to safely propagate context across asynchronous operations.

---

# Why Context?

In distributed systems, many components need access to the same request information.

Examples include:

- Request ID
- Correlation ID
- Tenant ID
- Client ID
- User ID
- Session ID

Without a context mechanism, this information must be passed through every method call.

Example

```ts
processRequest(
    requestId,
    tenantId,
    clientId,
    userId,
);
```

Every downstream method must continue passing the same values.

```ts
validateRequest(
    requestId,
    tenantId,
);

saveDatabase(
    requestId,
    tenantId,
);

publishRabbitMQ(
    requestId,
    tenantId,
);
```

As applications grow, this becomes difficult to maintain.

The Context module eliminates this problem.

---

# How It Works

The application establishes the context once.

```ts
updateContext({

    requestId: 'req-123',

    correlationId: 'corr-123',

    tenantId: 'tenant-a',

    clientId: 'client-a',

});
```

The SDK stores the context using AsyncLocalStorage.

Every subsequent operation can retrieve the current context automatically.

```
Incoming Request

↓

Context Created

↓

Business Logic

↓

Logger

↓

Metrics

↓

Tracing

↓

Outgoing Request
```

No additional parameters need to be passed between functions.

---

# Request Context

The SDK currently supports the following context properties.

| Property | Description |
|----------|-------------|
| requestId | Unique request identifier |
| correlationId | Cross-service request identifier |
| tenantId | Tenant identifier |
| clientId | Client identifier |
| userId | User identifier |
| sessionId | Session identifier |
| operation | Logical operation name |

The context can also contain custom properties.

---

# Creating Context

The simplest approach is:

```ts
updateContext({

    requestId: 'req-123',

    tenantId: 'tenant-a',

});
```

Subsequent SDK operations automatically use the updated context.

---

# Scoped Context

For request-scoped operations, use `withContext()`.

```ts
withContext(

    {

        requestId: 'req-123',

        tenantId: 'tenant-a',

    },

    () => {

        // Business logic

    },

);
```

The supplied context is available only while the callback executes.

---

# Asynchronous Context

The SDK also supports asynchronous operations.

```ts
await withContextAsync(

    {

        requestId: 'req-123',

    },

    async () => {

        await processRequest();

    },

);
```

The context remains available throughout the asynchronous execution chain.

---

# Reading Context

Retrieve the current context.

```ts
const context = currentContext();
```

Example

```ts
logger.info({

    tenantId: context.tenantId,

});
```

Most applications do not need to read the context directly because the SDK uses it automatically.

---

# Updating Context

Additional information can be added as it becomes available.

```ts
updateContext({

    clientId,

});
```

The existing context is preserved.

---

# Individual Values

Retrieve a single value.

```ts
const tenantId = getContextValue(
    'tenantId',
);
```

Update a single value.

```ts
setContextValue(
    'operation',
    'Submit SMS',
);
```

---

# Clearing Context

Context can be cleared when processing is complete.

```ts
clearCurrentContext();
```

This is generally handled automatically by framework integrations.

---

# Automatic Log Enrichment

Every log entry automatically includes the current context.

Example

```ts
updateContext({

    tenantId: 'tenant-a',

    requestId: '123',

});

logger.info(
    'Processing request',
);
```

Produces

```json
{
    "tenantId":"tenant-a",
    "requestId":"123",
    "msg":"Processing request"
}
```

No additional logging configuration is required.

---

# Automatic Trace Enrichment

The Context module automatically enriches the active span.

```ts
updateContext({

    tenantId: 'tenant-a',

    clientId: 'client-a',

});
```

The active span automatically receives:

```
tenantId

clientId
```

These attributes become searchable in Grafana Tempo.

---

# Context Lifecycle

```
Incoming Request

↓

Create Context

↓

Business Logic

↓

Logger

↓

Metrics

↓

Tracing

↓

Request Complete

↓

Context Cleared
```

Every request has its own isolated context.

---

# Thread Safety

The SDK uses AsyncLocalStorage to ensure request isolation.

Even when multiple requests execute simultaneously, each request maintains its own independent context.

```
Request A

↓

Context A

──────────────

Request B

↓

Context B
```

Context from one request is never visible to another.

---

# Best Practices

## Create Context Early

Create the request context as soon as possible.

For HTTP applications, this is typically middleware.

---

## Keep Context Small

Good

```
requestId

tenantId

clientId
```

Avoid

```
Large payloads

Entire request objects

Database records
```

Context should contain identifiers, not business data.

---

## Prefer Context Over Parameters

Good

```ts
updateContext({

    tenantId,

});
```

Avoid repeatedly passing identifiers through multiple layers solely for logging or tracing purposes.

---

## Use Stable Identifiers

Context values should remain constant throughout the lifetime of the request.

---

# Framework Integrations

Future SDK integrations will establish context automatically.

Examples include:

- HTTP Middleware
- NestJS Middleware
- RabbitMQ Consumers
- SMPP Sessions
- Scheduled Jobs

Applications will not need to call `updateContext()` manually.

---

# Future Enhancements

Planned additions include:

- Automatic HTTP request context
- RabbitMQ context propagation
- SMPP session context
- W3C Trace Context propagation
- Baggage propagation
- Context snapshots
- Context listeners

---

# Summary

The Context module provides:

- Request-scoped context
- AsyncLocalStorage propagation
- Automatic log enrichment
- Automatic trace enrichment
- Type-safe context access
- Request isolation
- Framework-independent context management

It serves as the foundation that connects logging, metrics, and tracing into a unified observability experience.