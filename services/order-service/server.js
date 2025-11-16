import express from 'express';
import cors from 'cors';
import { createLogger, initializeTracing, createHttpMetrics } from 'shared-libs/libs/observability';

const SERVICE_NAME = 'order-service';
const PORT = parseInt(process.env.PORT || '5004', 10);

const logger = createLogger(SERVICE_NAME);
initializeTracing(SERVICE_NAME, logger);
const { metricsMiddleware, metricsHandler } = createHttpMetrics(SERVICE_NAME);

const app = express();
app.disable('x-powered-by');
app.use(cors());
app.use(express.json());
app.use(metricsMiddleware);

const orders = [
  { id: '1001', userId: 'u1', total: 34.5, status: 'processing' },
  { id: '1002', userId: 'u2', total: 58.0, status: 'shipped' },
];

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: SERVICE_NAME });
});

app.get('/metrics', metricsHandler);

// Gateway strips /api/orders prefix, so handle root path
app.get('/', (_req, res) => {
  res.json({ status: 'success', data: orders });
});

app.get('/:id', (req, res) => {
  const order = orders.find((o) => o.id === req.params.id);
  if (!order) {
    logger.warn({ msg: 'Order not found', orderId: req.params.id });
    return res.status(404).json({ status: 'error', message: 'Order not found' });
  }
  res.json({ status: 'success', data: order });
});

app.use((err, _req, res, _next) => {
  logger.error({ msg: 'Unhandled error', error: err.message });
  res.status(500).json({ status: 'error', message: 'Internal server error' });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    logger.info({ msg: 'Service listening', port: PORT });
  });
}

export { app };
