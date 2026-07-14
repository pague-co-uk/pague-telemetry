# Logging

The Pague Telemetry SDK provides structured, trace-aware logging built on top of Pino.

The logger is automatically initialized during telemetry startup and is designed to provide consistent, structured logs across all Pague services.

---

# Why Structured Logging?

Traditional text logs are difficult to search, correlate, and analyze in distributed systems.

Instead of writing:

```
User logged in
```

the SDK produces structured JSON.

```json
{
  "service":"control-plane-api",
  "version":"1.0.0",
  "traceId":"f7f9...",
  "spanId":"a6d2...",
  "requestId":"req-123",
  "tenantId":"tenant-a",
  "msg":"User logged in"
}
```

Structured logs can be indexed, filtered, and correlated with traces.

---

# Logger Lifecycle

The logger is initialized automatically.

```ts
initTelemetry(...);
```

No additional setup is required.

Retrieve the logger anywhere in your application.

```ts
import {
    getLogger,
} from '@pague-co-uk/sms-gateway-telemetry';

const logger = getLogger();
```

---

# Logging Levels

Supported levels

```
trace

debug

info

warn

error

fatal
```

Example

```ts
logger.trace('Trace message');

logger.debug('Debug message');

logger.info('Information');

logger.warn('Warning');

logger.error('Error');

logger.fatal('Fatal error');
```

---

# Structured Logging

Prefer structured logs over string interpolation.

Good

```ts
logger.info(
    {
        clientId,
        route,
    },
    'SMS submitted',
);
```

Avoid

```ts
logger.info(
    `SMS submitted for ${clientId}`,
);
```

Structured fields can be queried directly in log aggregation systems.

---

# Automatic Trace Correlation

When a log is written within an active span, the SDK automatically includes:

- traceId
- spanId

Example

```json
{
    "traceId":"...",
    "spanId":"...",
    "msg":"Processing request"
}
```

No manual configuration is required.

---

# Automatic Context Correlation

The logger automatically enriches logs with the current request context.

Example

```ts
updateContext({

    tenantId: 'tenant-a',

    clientId: 'client-a',

    requestId: 'req-123',

});
```

Subsequent logs automatically include:

```json
{
    "tenantId":"tenant-a",

    "clientId":"client-a",

    "requestId":"req-123"
}
```

---

# Child Loggers

Child loggers allow additional context to be attached to all log entries from a specific component.

```ts
import {
    createChildLogger,
} from '@pague-co-uk/sms-gateway-telemetry';

const logger = createChildLogger({

    component: 'rabbitmq-consumer',

    queue: 'sms-submission',

});
```

Every log emitted by this logger automatically includes:

```json
{
    "component":"rabbitmq-consumer",

    "queue":"sms-submission"
}
```

---

# Error Logging

Always pass the error object.

Good

```ts
try {

}
catch (error) {

    logger.error(
        {
            err: error,
        },
        'SMS processing failed',
    );

}
```

The SDK serializes the error automatically.

```json
{
    "err": {

        "type":"Error",

        "message":"...",

        "stack":"..."

    }
}
```

---

# Redaction

Sensitive fields are automatically removed from log output.

Examples include:

- Passwords
- Access tokens
- Refresh tokens
- Authorization headers

Applications should avoid logging secrets even though the SDK provides redaction.

---

# Log Transports

The SDK supports multiple output destinations.

Console

```ts
logger: {

    transport: {

        stdout: true,

    },

}
```

File

```ts
logger: {

    transport: {

        file: {

            enabled: true,

            path: './logs/application.log',

        },

    },

}
```

Console and File

```ts
logger: {

    transport: {

        stdout: true,

        file: {

            enabled: true,

            path: './logs/application.log',

        },

    },

}
```

---

# Recommended Practices

Use structured fields.

Good

```ts
logger.info(
    {
        clientId,
        status,
    },
    'SMS delivered',
);
```

Avoid embedding important information inside the message.

Bad

```ts
logger.info(
    `SMS delivered for ${clientId}`,
);
```

---

# Performance

Pino is designed for high-throughput applications.

Recommendations:

- Avoid excessive debug logging in production.
- Log meaningful events rather than every function call.
- Prefer structured fields over long text messages.
- Do not log large payloads.

---

# Future Enhancements

Planned logging capabilities include:

- Log rotation
- Audit logs
- Error-only log files
- OTLP Log Export
- Loki integration
- Cloud logging providers

---

# Summary

The logging module provides:

- Structured JSON logs
- Automatic trace correlation
- Automatic request context enrichment
- Error serialization
- Child loggers
- Multiple transports
- Production-ready defaults

Applications simply retrieve the logger and write structured logs while the SDK handles the underlying observability concerns.