import express from 'express';
import cors from 'cors';
import { createLogger, initializeTracing, createHttpMetrics } from '../../shared/libs/observability.js';

const SERVICE_NAME = 'inventory-service';
const PORT = parseInt(process.env.PORT || '5005', 10);

const logger = createLogger(SERVICE_NAME);
initializeTracing(SERVICE_NAME, logger);
const { metricsMiddleware, metricsHandler } = createHttpMetrics(SERVICE_NAME);

const app = express();
app.disable('x-powered-by');
app.use(cors());
app.use(express.json());
app.use(metricsMiddleware);

const inventory = [
  { sku: 'BK-001', quantity: 12 },
  { sku: 'BK-002', quantity: 4 },
  { sku: 'BK-003', quantity: 20 },
];

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: SERVICE_NAME });
});

app.get('/metrics', metricsHandler);

app.get('/', (_req, res) => {
  res.json({ status: 'success', data: inventory });
});

app.get('/:sku', (req, res) => {
  const item = inventory.find((entry) => entry.sku === req.params.sku);
  if (!item) {
    logger.warn({ msg: 'Inventory item not found', sku: req.params.sku });
    return res.status(404).json({ status: 'error', message: 'Inventory item not found' });
  }
  res.json({ status: 'success', data: item });
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
