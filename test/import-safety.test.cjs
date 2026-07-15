const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const path = require('node:path');
const test = require('node:test');

const packageRoot = path.resolve(__dirname, '..');

function telemetryConfig() {
  return {
    service: {
      name: 'telemetry-regression-test',
      version: '1.0.0',
    },
    collector: {
      tracesEndpoint: 'http://127.0.0.1:4318/v1/traces',
      metricsEndpoint: 'http://127.0.0.1:4318/v1/metrics',
    },
    metrics: {
      exportIntervalMillis: 60_000,
    },
  };
}

test('the root package imports before telemetry initialization', () => {
  const result = spawnSync(
    process.execPath,
    ['-e', "require('./dist')"],
    {
      cwd: packageRoot,
      encoding: 'utf8',
    },
  );

  assert.equal(result.status, 0, result.stderr);
});

test('integration metrics are lazy and created once', async (t) => {
  const nodeSdk = require('@opentelemetry/sdk-node');
  const nodeSdkDescriptor = Object.getOwnPropertyDescriptor(
    nodeSdk,
    'NodeSDK',
  );

  Object.defineProperty(nodeSdk, 'NodeSDK', {
    configurable: true,
    enumerable: true,
    writable: true,
    value: class {
      start() {}

      async shutdown() {}
    },
  });

  const telemetry = require('../dist');

  telemetry.initTelemetry(telemetryConfig());
  t.after(async () => {
    await telemetry.shutdownTelemetry();
    Object.defineProperty(nodeSdk, 'NodeSDK', nodeSdkDescriptor);
  });

  const meter = telemetry.getMeter();
  const creations = {
    counter: 0,
    histogram: 0,
    gauge: 0,
    upDownCounter: 0,
  };

  for (const [method, count] of Object.entries({
    createCounter: 'counter',
    createHistogram: 'histogram',
    createObservableGauge: 'gauge',
    createUpDownCounter: 'upDownCounter',
  })) {
    const original = meter[method].bind(meter);
    meter[method] = (...args) => {
      creations[count]++;
      return original(...args);
    };
  }

  telemetry.recordPublish();
  telemetry.recordConsume();
  telemetry.recordFailure();
  telemetry.recordPublishDuration(4);
  telemetry.recordConsumeDuration(5);

  telemetry.recordQuery();
  telemetry.recordFailedQuery();
  telemetry.recordConnectionError();
  telemetry.recordQueryDuration(6);

  telemetry.recordBind();
  telemetry.recordFailedBind();
  telemetry.recordSubmit();
  telemetry.recordFailedSubmit();
  telemetry.recordDeliver();
  telemetry.recordFailedDeliver();
  telemetry.recordEnquireLink();
  telemetry.recordUnbind();
  telemetry.incrementActiveSessions();
  telemetry.decrementActiveSessions();
  telemetry.recordPduDuration(7);

  const httpMetrics = telemetry.getHttpMetrics();
  httpMetrics.requestStarted({ method: 'GET', route: '/health' });
  httpMetrics.requestCompleted(8, {
    method: 'GET',
    route: '/health',
    status: 200,
  });
  httpMetrics.recordRequestSize(9);
  httpMetrics.recordResponseSize(10);

  assert.deepEqual(creations, {
    counter: 15,
    histogram: 7,
    gauge: 1,
    upDownCounter: 1,
  });

  telemetry.recordPublish();
  telemetry.recordQuery();
  telemetry.recordBind();
  telemetry.getHttpMetrics().requestStarted({
    method: 'GET',
    route: '/health',
  });

  assert.deepEqual(creations, {
    counter: 15,
    histogram: 7,
    gauge: 1,
    upDownCounter: 1,
  });
});
