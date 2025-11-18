import express from 'express';
import cors from 'cors';
import { randomUUID } from 'crypto';
import { createLogger, initializeTracing, createHttpMetrics } from 'shared-libs/libs/observability';

const SERVICE_NAME = 'payment-service';
const PORT = parseInt(process.env.PORT || '5010', 10);
const PROCESSING_DELAY_MS = parseInt(process.env.PAYMENT_PROCESSING_DELAY_MS || '0', 10);

const logger = createLogger(SERVICE_NAME);
initializeTracing(SERVICE_NAME, logger);
const { metricsMiddleware, metricsHandler } = createHttpMetrics(SERVICE_NAME);

const app = express();
app.disable('x-powered-by');
app.use(cors());
app.use(express.json({ limit: '256kb' }));
app.use(metricsMiddleware);

const transactions = new Map();

const sanitizeCurrency = (currency = 'USD') => String(currency).trim().toUpperCase();

const validatePayload = (body) => {
    if (!body || typeof body !== 'object') {
        return 'Invalid JSON body';
    }
    const { bookId, title, amount, currency } = body;
    if (!bookId || typeof bookId !== 'string') {
        return 'bookId is required';
    }
    if (!title || typeof title !== 'string') {
        return 'title is required';
    }
    if (amount == null || Number.isNaN(Number(amount))) {
        return 'amount must be a number';
    }
    if (Number(amount) <= 0) {
        return 'amount must be greater than zero';
    }
    if (currency && typeof currency !== 'string') {
        return 'currency must be a string';
    }
    return null;
};

app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: SERVICE_NAME });
});

app.get('/metrics', metricsHandler);

// List recent transactions (debug helper)
app.get('/', (_req, res) => {
    const recent = Array.from(transactions.values()).slice(-25).reverse();
    res.json({ status: 'success', data: recent });
});

app.post('/checkout', async (req, res) => {
    const error = validatePayload(req.body);
    if (error) {
        logger.warn({ msg: 'Invalid checkout payload', error });
        return res.status(400).json({ status: 'error', message: error });
    }

    const {
        bookId,
        title,
        amount,
        currency = 'USD',
        notes = '',
        description = '',
        userId,
    } = req.body;

    const paymentId = randomUUID();
    const sanitizedCurrency = sanitizeCurrency(currency);
    const createdAt = new Date().toISOString();

    logger.info({
        msg: 'Processing payment request',
        paymentId,
        bookId,
        amount: Number(amount),
        currency: sanitizedCurrency,
        userId: userId || 'anonymous',
    });

    if (PROCESSING_DELAY_MS > 0) {
        await new Promise((resolve) => setTimeout(resolve, PROCESSING_DELAY_MS));
    }

    const paymentRecord = {
        paymentId,
        bookId,
        title,
        amount: Number(amount),
        currency: sanitizedCurrency,
        status: 'succeeded',
        notes,
        description,
        userId: userId || null,
        createdAt,
        updatedAt: createdAt,
        reference: `PAY-${paymentId.slice(0, 8).toUpperCase()}`,
    };

    transactions.set(paymentId, paymentRecord);

    res.status(201).json({
        status: 'success',
        message: 'Payment processed successfully',
        data: paymentRecord,
    });
});

app.use((err, _req, res, _next) => {
    logger.error({ msg: 'Unhandled error', error: err?.message });
    res.status(500).json({ status: 'error', message: 'Internal server error' });
});

if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        logger.info({ msg: 'Service listening', port: PORT });
    });
}

export { app };
