# Installation

This guide explains how to install and configure the Pague Telemetry SDK.

---

# Prerequisites

Before installing the SDK, ensure you have:

- Node.js 20+
- npm
- Access to GitHub Packages
- An OpenTelemetry Collector
- Grafana
- Prometheus
- Tempo

---

# GitHub Packages

The SDK is published to GitHub Packages.

Configure npm to use the GitHub registry.

```
@pague-co-uk:registry=https://npm.pkg.github.com
```

Authenticate with GitHub.

```
npm login --scope=@pague-co-uk --auth-type=legacy --registry=https://npm.pkg.github.com
```

---

# Installing

```
npm install @pague-co-uk/sms-gateway-telemetry
```

---

# Updating

To install the latest version:

```
npm install @pague-co-uk/sms-gateway-telemetry@latest
```

To install a specific version:

```
npm install @pague-co-uk/sms-gateway-telemetry@1.2.0
```

---

# Verify Installation

Import the SDK.

```ts
import {
  initTelemetry,
} from '@pague-co-uk/sms-gateway-telemetry';
```

If TypeScript recognizes the import, the package has been installed successfully.

---

# Configure Telemetry

Initialize telemetry before creating your application.

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

Telemetry should always be initialized before your application starts accepting requests.

---

# Verify Logging

```ts
import { getLogger } from '@pague-co-uk/sms-gateway-telemetry';

const logger = getLogger();

logger.info('Telemetry initialized');
```

Expected output:

```json
{
  "service":"control-plane-api",
  "version":"1.0.0",
  "traceId":"...",
  "spanId":"...",
  "msg":"Telemetry initialized"
}
```

---

# Verify Metrics

```ts
import {
  createCounterMetric,
} from '@pague-co-uk/sms-gateway-telemetry';

const requests = createCounterMetric({
  name: 'app.requests.total',
});

requests.increment();
```

Verify that the metric appears in Prometheus.

```
app_requests_total
```

---

# Verify Tracing

```ts
import {
  withSpan,
} from '@pague-co-uk/sms-gateway-telemetry';

await withSpan(
  'Example Operation',
  async () => {

  },
);
```

Verify that the span appears in Grafana Tempo.

---

# Verify Context Propagation

```ts
import {
  updateContext,
  getLogger,
} from '@pague-co-uk/sms-gateway-telemetry';

updateContext({
  requestId: '123',
  tenantId: 'tenant-a',
});

const logger = getLogger();

logger.info('Hello');
```

Expected log:

```json
{
  "requestId":"123",
  "tenantId":"tenant-a",
  "msg":"Hello"
}
```

---

# Next Steps

Continue with:

- Quick Start
- Configuration
- Architecture Overview