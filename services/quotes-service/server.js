import express from 'express';
import cors from 'cors';
import { createLogger, initializeTracing, createHttpMetrics } from 'shared-libs/libs/observability';

const SERVICE_NAME = 'quotes-service';
const PORT = parseInt(process.env.PORT || '5003', 10);

const logger = createLogger(SERVICE_NAME);
initializeTracing(SERVICE_NAME, logger);
const { metricsMiddleware, metricsHandler } = createHttpMetrics(SERVICE_NAME);

const app = express();
app.disable('x-powered-by');
app.use(cors());
app.use(express.json());
app.use(metricsMiddleware);

const quotes = [
  { id: '1', text: 'A reader lives a thousand lives before he dies.', author: 'George R. R. Martin' },
  { id: '2', text: 'So many books, so little time.', author: 'Frank Zappa' },
];

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: SERVICE_NAME });
});

app.get('/metrics', metricsHandler);

// Gateway strips /api/quotes prefix, so handle root path
app.get('/', (_req, res) => {
  res.json({ status: 'success', data: quotes });
});

app.get('/:id', (req, res) => {
  const quote = quotes.find((q) => q.id === req.params.id);
  if (!quote) {
    logger.warn({ msg: 'Quote not found', quoteId: req.params.id });
    return res.status(404).json({ status: 'error', message: 'Quote not found' });
  }
  res.json({ status: 'success', data: quote });
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
