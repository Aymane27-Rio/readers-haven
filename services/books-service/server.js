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

let books = [
  {
    _id: '1',
    title: 'The Pragmatic Programmer',
    author: 'Andrew Hunt & David Thomas',
    description: 'Journey to mastery with pragmatic tips for developers.',
    status: 'read',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '2',
    title: 'Clean Architecture',
    author: 'Robert C. Martin',
    description: 'Timeless principles for building maintainable systems.',
    status: 'to-read',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

let nextId = books.length + 1;

const sanitize = (value) => (typeof value === 'string' ? value.trim() : value);

const validatePayload = (body, { partial = false } = {}) => {
  if (!body || typeof body !== 'object') {
    return 'Invalid JSON body';
  }

  const requiredFields = ['title', 'author'];
  if (!partial) {
    for (const field of requiredFields) {
      if (!sanitize(body[field])) {
        return `${field} is required`;
      }
    }
  }

  if (body.status && !['to-read', 'currently-reading', 'read'].includes(body.status)) {
    return 'Invalid status value';
  }

  return null;
};

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: SERVICE_NAME });
});

app.get('/metrics', metricsHandler);

// Gateway strips /api/books prefix, so handle root path
app.get('/', (_req, res) => {
  res.json({ status: 'success', data: books });
});

app.get('/:id', (req, res) => {
  const book = books.find((b) => b._id === req.params.id);
  if (!book) {
    logger.warn({ msg: 'Book not found', bookId: req.params.id });
    return res.status(404).json({ status: 'error', message: 'Book not found' });
  }
  res.json({ status: 'success', data: book });
});

app.post('/', (req, res) => {
  const error = validatePayload(req.body);
  if (error) {
    logger.warn({ msg: 'Invalid create payload', error });
    return res.status(400).json({ status: 'error', message: error });
  }

  const now = new Date().toISOString();
  const book = {
    _id: String(nextId++),
    title: sanitize(req.body.title),
    author: sanitize(req.body.author),
    description: sanitize(req.body.description) || '',
    status: req.body.status && ['to-read', 'currently-reading', 'read'].includes(req.body.status)
      ? req.body.status
      : 'to-read',
    createdAt: now,
    updatedAt: now,
  };

  books = [...books, book];
  res.status(201).json({ status: 'success', data: book });
});

app.put('/:id', (req, res) => {
  const error = validatePayload(req.body, { partial: true });
  if (error) {
    logger.warn({ msg: 'Invalid update payload', error, bookId: req.params.id });
    return res.status(400).json({ status: 'error', message: error });
  }

  const index = books.findIndex((b) => b._id === req.params.id);
  if (index === -1) {
    logger.warn({ msg: 'Book not found for update', bookId: req.params.id });
    return res.status(404).json({ status: 'error', message: 'Book not found' });
  }

  const existing = books[index];
  const updated = {
    ...existing,
    title: sanitize(req.body.title) || existing.title,
    author: sanitize(req.body.author) || existing.author,
    description: sanitize(req.body.description) ?? existing.description,
    status: req.body.status && ['to-read', 'currently-reading', 'read'].includes(req.body.status)
      ? req.body.status
      : existing.status,
    updatedAt: new Date().toISOString(),
  };

  books = [...books.slice(0, index), updated, ...books.slice(index + 1)];
  res.json({ status: 'success', data: updated });
});

app.delete('/:id', (req, res) => {
  const index = books.findIndex((b) => b._id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ status: 'error', message: 'Book not found' });
  }

  const [removed] = books.splice(index, 1);
  logger.info({ msg: 'Deleted book', bookId: removed._id });
  res.json({ status: 'success', data: { _id: removed._id } });
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
