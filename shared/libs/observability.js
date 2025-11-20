import path from 'path';
import { createRequire } from 'module';

const cwdPackageJson = path.join(process.cwd(), 'package.json');
let requireFromApp;
try {
  requireFromApp = createRequire(cwdPackageJson);
} catch {
  requireFromApp = createRequire(import.meta.url);
}

const pino = requireFromApp('pino');
const promClient = requireFromApp('prom-client');
const { NodeSDK } = requireFromApp('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = requireFromApp('@opentelemetry/auto-instrumentations-node');
const { Resource } = requireFromApp('@opentelemetry/resources');
const { SemanticResourceAttributes } = requireFromApp('@opentelemetry/semantic-conventions');
const { OTLPTraceExporter } = requireFromApp('@opentelemetry/exporter-trace-otlp-http');

const tracingState = {
  initialized: false,
  sdk: null,
};

export function createLogger(serviceName) {
  const level = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug');
  const transport = process.env.NODE_ENV === 'production'
    ? undefined
    : {
      target: 'pino-pretty',
      options: { translateTime: 'SYS:standard', colorize: true, singleLine: true },
    };

  return pino({
    name: serviceName,
    level,
    transport,
  });
}

export function initializeTracing(serviceName, logger) {
  if (tracingState.initialized || process.env.NODE_ENV === 'test' || process.env.DISABLE_TRACING === 'true') {
    return;
  }

  try {
    const baseUrl = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || process.env.OTEL_EXPORTER_OTLP_HTTP_ENDPOINT || 'http://localhost:4318';
    const url = `${baseUrl.replace(/\/$/, '')}/v1/traces`;

    const exporter = new OTLPTraceExporter({ url });
    const sdk = new NodeSDK({
      resource: new Resource({
        [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
      }),
      traceExporter: exporter,
      instrumentations: [getNodeAutoInstrumentations()],
    });

    const startResult = sdk.start();

    Promise.resolve(startResult)
      .then(() => {
        tracingState.initialized = true;
        tracingState.sdk = sdk;
        logger?.info?.({ msg: 'Tracing initialized', exporter: url });
      })
      .catch((err) => {
        logger?.warn?.({ msg: 'Tracing disabled - exporter unavailable', error: err.message });
      });

    const shutdown = () => {
      if (tracingState.sdk) {
        tracingState.sdk.shutdown().catch(() => { });
      }
    };

    process.once('SIGTERM', shutdown);
    process.once('SIGINT', shutdown);
  } catch (err) {
    logger?.warn?.({ msg: 'Tracing disabled - initialization error', error: err.message });
  }
}

export function createHttpMetrics(serviceName) {
  const registry = new promClient.Registry();
  registry.setDefaultLabels({ service: serviceName });
  promClient.collectDefaultMetrics({ register: registry });

  const requestCounter = new promClient.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status'],
    registers: [registry],
  });

  const inFlightGauge = new promClient.Gauge({
    name: 'http_requests_in_flight',
    help: 'Number of HTTP requests currently being processed',
    labelNames: ['method', 'route'],
    registers: [registry],
  });

  const durationHistogram = new promClient.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status'],
    buckets: [0.05, 0.1, 0.3, 0.5, 0.75, 1, 2, 5],
    registers: [registry],
  });

  const durationSummary = new promClient.Summary({
    name: 'http_request_duration_quantiles',
    help: 'Summary of HTTP request durations in seconds',
    labelNames: ['method', 'route', 'status'],
    percentiles: [0.5, 0.9, 0.99],
    registers: [registry],
  });

  const normalizeRoute = (req) => req.route?.path || req.originalUrl || req.path || 'unknown';

  const metricsMiddleware = (req, res, next) => {
    const method = req.method;
    const route = normalizeRoute(req);
    const stopHistogramTimer = durationHistogram.startTimer();
    const startHrTime = process.hrtime.bigint();

    inFlightGauge.labels(method, route).inc();

    res.on('finish', () => {
      const status = String(res.statusCode);
      const labels = { method, route, status };
      requestCounter.inc(labels);
      stopHistogramTimer(labels);
      const diff = Number(process.hrtime.bigint() - startHrTime) / 1e9;
      durationSummary.labels(method, route, status).observe(diff);
      inFlightGauge.labels(method, route).dec();
    });

    next();
  };

  const metricsHandler = async (_req, res) => {
    res.setHeader('Content-Type', registry.contentType);
    res.end(await registry.metrics());
  };

  return {
    registry,
    requestCounter,
    inFlightGauge,
    durationHistogram,
    durationSummary,
    metricsMiddleware,
    metricsHandler,
  };
}
