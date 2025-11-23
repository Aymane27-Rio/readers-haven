import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { createLogger, initializeTracing, createHttpMetrics } from '../shared/libs/observability.js';

const SERVICE_NAME = 'gateway';
const PORT = parseInt(process.env.PORT || '3000', 10);
const BACKEND_URL = process.env.BACKEND_URL || 'http://auth-service:5001';

const logger = createLogger(SERVICE_NAME);
initializeTracing(SERVICE_NAME, logger);
const { metricsMiddleware, metricsHandler } = createHttpMetrics(SERVICE_NAME);

const app = express();
app.disable('x-powered-by');

// CORS configuration: allow frontend origins and pass credentials
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:32173,http://localhost:5173').split(',').map(o => o.trim());
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'X-CSRF-Token', 'X-XSRF-Token', 'Authorization'],
}));
app.use(helmet());
app.use(morgan('combined'));
app.use(metricsMiddleware);

const createProxy = (target) => createProxyMiddleware({
  target,
  changeOrigin: true,
  logProvider: () => ({
    log: (...args) => logger.info({ msg: 'proxy', args }),
    debug: (...args) => logger.debug({ msg: 'proxy', args }),
    info: (...args) => logger.info({ msg: 'proxy', args }),
    warn: (...args) => logger.warn({ msg: 'proxy', args }),
    error: (...args) => logger.error({ msg: 'proxy', args }),
  }),
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: SERVICE_NAME });
});

app.get('/metrics', metricsHandler);

// Route to specific services
app.use('/api/books', createProxy('http://books-service.readers-haven.svc:5002'));
app.use('/api/inventory', createProxy('http://inventory-service.readers-haven.svc:5003'));
app.use('/api/orders', createProxy('http://order-service.readers-haven.svc:5004'));
app.use('/api/payments', createProxy('http://payment-service.readers-haven.svc:5005'));
app.use('/api/quotes', createProxy('http://quotes-service.readers-haven.svc:5006'));
app.use('/auth', createProxy(BACKEND_URL));
app.use('/api', createProxy(BACKEND_URL));

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
