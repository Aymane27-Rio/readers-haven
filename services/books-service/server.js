import express from 'express';
import cors from 'cors';
import { createLogger, initializeTracing, createHttpMetrics } from 'shared-libs/libs/observability';

const SERVICE_NAME = 'books-service';
const PORT = parseInt(process.env.PORT || '5002', 10);

const logger = createLogger(SERVICE_NAME);
initializeTracing(SERVICE_NAME, logger);
const {
  metricsMiddleware,
  metricsHandler,
} = createHttpMetrics(SERVICE_NAME);

const app = express();
app.disable('x-powered-by');
app.use(cors());
app.use(express.json());

// Observability middlewares
app.use((req, _res, next) => {
  req.startTime = process.hrtime.bigint();
  next();
});
app.use(metricsMiddleware);

const books = [
  { id: '1', title: 'The Pragmatic Programmer', author: 'Andrew Hunt & David Thomas' },
  { id: '2', title: 'Clean Architecture', author: 'Robert C. Martin' },
];

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: SERVICE_NAME });
});

app.get('/metrics', metricsHandler);

// Gateway strips /api/books prefix, so handle root path
app.get('/', (_req, res) => {
  res.json({ status: 'success', data: books });
});

app.get('/:id', (req, res) => {
  const book = books.find((b) => b.id === req.params.id);
  if (!book) {
    logger.warn({ msg: 'Book not found', bookId: req.params.id });
    return res.status(404).json({ status: 'error', message: 'Book not found' });
  }
  res.json({ status: 'success', data: book });
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
