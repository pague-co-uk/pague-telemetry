# Configuration

This guide describes every configuration option supported by the Pague Telemetry SDK.

---

# Overview

The SDK is configured through a single call to `initTelemetry()`.

```ts
initTelemetry({
  service: {},
  collector: {},
  metrics: {},
  logger: {},
  instrumentations: {},
});
```

Each section controls a specific area of the SDK.

---

# Service Configuration

The service section identifies the running application.

```ts
service: {
    name: 'control-plane-api',
    version: '1.2.0',
}
```

| Property | Required | Description |
|----------|----------|-------------|
| name | ✅ | Logical service name |
| version | ✅ | Running application version |

Example

```ts
service: {
    name: 'smpp-server',
    version: packageJson.version,
}
```

Recommended naming:

```
control-plane-api

ingestion-api

sms-worker

smpp-server

rabbitmq-consumer
```

---

# Collector Configuration

Defines where telemetry is exported.

```ts
collector: {
    tracesEndpoint: 'http://localhost:4318/v1/traces',
    metricsEndpoint: 'http://localhost:4318/v1/metrics',
}
```

| Property | Required | Description |
|----------|----------|-------------|
| tracesEndpoint | ✅ | OTLP Trace endpoint |
| metricsEndpoint | ✅ | OTLP Metrics endpoint |

Example

```ts
collector: {
    tracesEndpoint:
        'http://otel-collector:4318/v1/traces',

    metricsEndpoint:
        'http://otel-collector:4318/v1/metrics',
}
```

---

# Metrics Configuration

Controls metric exporting.

```ts
metrics: {
    exportIntervalMillis: 10000,
}
```

| Property | Default |
|----------|---------|
| exportIntervalMillis | 10000 |

Recommendations

Development

```
10000
```

Production

```
5000
```

High-throughput services

```
2000
```

---

# Logger Configuration

Controls structured logging.

```ts
logger: {
    level: 'info',

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

## Log Levels

Supported values

```
trace

debug

info

warn

error

fatal
```

---

## Transport Configuration

### Console

```ts
transport: {

    stdout: true,

}
```

---

### File

```ts
transport: {

    file: {

        enabled: true,

        path: './logs/application.log',

    },

}
```

---

### Console + File

```ts
transport: {

    stdout: true,

    file: {

        enabled: true,

        path: './logs/application.log',

    },

}
```

---

# Instrumentations

Control automatic instrumentation.

```ts
instrumentations: {

    disableFs: true,

}
```

| Property | Default |
|----------|---------|
| disableFs | false |

Filesystem instrumentation is usually disabled in production because it generates many low-value spans.

---

# Environment Variables

The SDK also supports environment-based configuration.

| Variable | Description |
|----------|-------------|
| LOG_LEVEL | Log level |
| LOG_STDOUT | Enable stdout logging |
| LOG_FILE_ENABLED | Enable file logging |
| LOG_FILE_PATH | Log file location |
| NODE_ENV | Runtime environment |

---

# Complete Configuration

```ts
initTelemetry({

    service: {

        name: 'control-plane-api',

        version: packageJson.version,

    },

    collector: {

        tracesEndpoint:
            'http://localhost:4318/v1/traces',

        metricsEndpoint:
            'http://localhost:4318/v1/metrics',

    },

    metrics: {

        exportIntervalMillis: 10000,

    },

    logger: {

        level: 'info',

        transport: {

            stdout: true,

            file: {

                enabled: true,

                path: './logs/application.log',

            },

        },

    },

    instrumentations: {

        disableFs: true,

    },

});
```

---

# Validation

The SDK validates configuration during startup.

Examples of invalid configuration include:

- Empty service name
- Invalid collector URLs
- Negative export interval
- Invalid log level
- File logging enabled without a file path

The application will fail fast with a descriptive error if configuration is invalid.

---

# Best Practices

## Service Names

Use stable logical names.

Good

```
control-plane-api

smpp-server

sms-worker
```

Avoid

```
api

backend

service1
```

---

## Versions

Always use the application version from `package.json`.

```ts
version: packageJson.version
```

---

## Logging

Development

```
debug
```

Production

```
info
```

---

## Metrics

Avoid high-cardinality labels.

Good

```
endpoint

method

status
```

Avoid

```
phoneNumber

messageId

timestamp
```

---

# Next Steps

Continue with:

- Architecture
- Logging
- Metrics
- Tracing
- Context Propagation