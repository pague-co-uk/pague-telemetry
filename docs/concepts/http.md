# HTTP

The HTTP module provides automatic observability for HTTP-based applications.

It combines the SDK's logging, metrics, tracing, and context modules into a single middleware that instruments incoming HTTP requests with minimal application code.

---

# Why the HTTP Module?

Without the HTTP module, applications must manually:

- Create request context
- Generate request IDs
- Create spans
- Record metrics
- Log request lifecycle events
- Handle exceptions
- Propagate correlation IDs

The HTTP module performs these tasks automatically.

Instead of writing hundreds of lines of observability code, applications simply register a middleware.

```ts
app.use(
    createHttpMiddleware(),
);
```

---

# Architecture

```
Incoming Request

↓

HTTP Middleware

↓

HTTP Lifecycle

↓

Context

Logger

Metrics

Tracing

↓

Business Logic

↓

Response

↓

Telemetry Export
```

The HTTP Lifecycle orchestrates the individual SDK modules.

Each module remains responsible for a single concern.

---

# Components

The HTTP module consists of the following components.

```
http/

constants.ts

types.ts

headers.ts

context.ts

metrics.ts

logger.ts

tracing.ts

lifecycle.ts

middleware.ts

index.ts
```

---

# Middleware

The middleware is the application's entry point.

```ts
app.use(
    createHttpMiddleware(),
);
```

Its responsibilities are limited to:

- Creating the request lifecycle
- Registering response handlers
- Passing control to the application

Business logic is delegated to the lifecycle object.

---

# Request Lifecycle

The HTTP request lifecycle coordinates every observability concern for a single request.

```
Create Context

↓

Start Span

↓

Record Metrics

↓

Write Start Log

↓

Application

↓

Write Completion Log

↓

Record Metrics

↓

Finish Span
```

The lifecycle guarantees that completion logic executes only once.

---

# Context

The HTTP module establishes request context automatically.

Example

```
requestId

correlationId

operation
```

These values become available to:

- Logger
- Tracing
- Future framework integrations

Applications no longer need to call

```ts
updateContext(...)
```

for every request.

---

# Request IDs

The middleware extracts:

```
X-Request-ID
```

If the header is missing, a UUID is generated.

The value is returned in the response.

---

# Correlation IDs

The middleware extracts

```
X-Correlation-ID
```

or generates one when necessary.

Correlation IDs allow requests to be tracked across multiple services.

---

# Logging

The HTTP module automatically records request lifecycle events.

Request Started

```json
{
    "component":"http",
    "method":"GET",
    "path":"/users"
}
```

Request Completed

```json
{
    "component":"http",
    "statusCode":200,
    "durationMs":18
}
```

Request Failed

```json
{
    "component":"http",
    "statusCode":500,
    "err":{...}
}
```

Applications are free to add additional logging as required.

---

# Metrics

The HTTP module records standard HTTP metrics.

| Metric | Description |
|---------|-------------|
| http.requests.total | Total requests |
| http.request.duration | Request latency |
| http.requests.active | Active requests |
| http.request.size | Request size |
| http.response.size | Response size |

These metrics are exported through OpenTelemetry.

---

# Tracing

Every request creates a root span.

Example

```
GET /users
```

The span automatically records:

```
http.method

http.route

http.url

http.status_code

http.scheme

http.host

http.client_ip
```

The span is automatically completed when the request finishes.

Exceptions are recorded automatically.

---

# Response Headers

The middleware returns:

```
X-Request-ID

X-Correlation-ID
```

This allows clients to correlate requests with logs and traces.

Future versions will also include:

```
traceparent
```

for W3C Trace Context propagation.

---

# Error Handling

If an exception occurs:

- The exception is logged
- The span records the exception
- Metrics are updated
- The lifecycle completes safely

Applications remain responsible for generating the HTTP response.

---

# Request Flow

```
Client

↓

Middleware

↓

Create Context

↓

Create Span

↓

Metrics++

↓

Start Log

↓

Application

↓

Response

↓

Metrics

↓

Completion Log

↓

Span End

↓

Collector
```

---

# Design Principles

The HTTP module follows the same principles as the rest of the SDK.

- Framework agnostic
- Single responsibility
- Convention over configuration
- Automatic instrumentation
- Minimal application code

---

# Future Enhancements

Planned capabilities include:

- Express adapter
- Fastify adapter
- NestJS adapter
- Request body size measurement
- Response body size measurement
- Automatic route templates
- W3C Trace Context propagation
- Baggage propagation
- Configurable request logging
- Configurable metric collection

---

# Summary

The HTTP module provides:

- Automatic request context
- Request ID generation
- Correlation ID propagation
- HTTP metrics
- Request logging
- Root span creation
- Automatic span completion
- Response header propagation

It serves as the reference implementation for future transport modules such as RabbitMQ, SMPP, and WebSocket integrations.