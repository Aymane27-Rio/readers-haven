import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { createLogger, initializeTracing, createHttpMetrics } from '../shared/libs/observability.js';

const SERVICE_NAME = 'gateway';
const PORT = parseInt(process.env.PORT || '3000', 10);
const BACKEND_URL = process.env.BACKEND_URL || 'http://auth-service:5000';

const logger = createLogger(SERVICE_NAME);
initializeTracing(SERVICE_NAME, logger);
const { metricsMiddleware, metricsHandler } = createHttpMetrics(SERVICE_NAME);

const app = express();
app.disable('x-powered-by');
app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(',') || '*', credentials: true }));
app.use(helmet());
app.use(express.json());
app.use(morgan('combined'));
app.use(metricsMiddleware);

const proxy = createProxyMiddleware({
  target: BACKEND_URL,
  changeOrigin: true,
  logProvider: () => ({
    log: (...args) => logger.info({ msg: 'proxy', args }),
    debug: (...args) => logger.debug({ msg: 'proxy', args }),
    info: (...args) => logger.info({ msg: 'proxy', args }),
    warn: (...args) => logger.warn({ msg: 'proxy', args }),
    error: (...args) => logger.error({ msg: 'proxy', args }),
  }),
  pathRewrite: { '^/api': '' },
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: SERVICE_NAME, upstream: BACKEND_URL });
});

app.get('/metrics', metricsHandler);

app.use('/api', proxy);

app.get('/', (_req, res) => {
  res.json({ status: 'ok', service: SERVICE_NAME });
});

app.use((err, _req, res, _next) => {
  logger.error({ msg: 'Unhandled error', error: err.message });
  res.status(500).json({ status: 'error', message: 'Internal server error' });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    logger.info({ msg: 'Gateway listening', port: PORT, target: BACKEND_URL });
  });
}

export { app };
