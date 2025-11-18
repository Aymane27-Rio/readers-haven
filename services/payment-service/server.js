import express from 'express';
import cors from 'cors';
import { randomUUID } from 'crypto';
import { createLogger, initializeTracing, createHttpMetrics } from 'shared-libs/libs/observability';

const SERVICE_NAME = 'payment-service';
const PORT = parseInt(process.env.PORT || '5010', 10);
const PROCESSING_DELAY_MS = parseInt(process.env.PAYMENT_PROCESSING_DELAY_MS || '0', 10);
const MIN_FEE_AMOUNT = 7.5;

const logger = createLogger(SERVICE_NAME);
initializeTracing(SERVICE_NAME, logger);
const { metricsMiddleware, metricsHandler } = createHttpMetrics(SERVICE_NAME);

const app = express();
app.disable('x-powered-by');
app.use(cors());
app.use(express.json({ limit: '256kb' }));
app.use(metricsMiddleware);

const transactions = new Map();

const sanitizeCurrency = (currency = 'USD') => String(currency || 'USD').trim().toUpperCase();

const validateItem = (item, index) => {
    if (!item || typeof item !== 'object') return `Item at index ${index} is invalid`;
    if (!item.bookId || typeof item.bookId !== 'string') return `Item ${index + 1}: bookId is required`;
    if (!item.title || typeof item.title !== 'string') return `Item ${index + 1}: title is required`;
    if (item.price == null || Number.isNaN(Number(item.price))) return `Item ${index + 1}: price must be a number`;
    if (Number(item.price) <= 0) return `Item ${index + 1}: price must be greater than zero`;
    if (item.quantity == null || Number.isNaN(Number(item.quantity))) return `Item ${index + 1}: quantity must be a number`;
    if (Number(item.quantity) <= 0) return `Item ${index + 1}: quantity must be greater than zero`;
    if (!Number.isInteger(Number(item.quantity))) return `Item ${index + 1}: quantity must be an integer`;
    return null;
};

const validatePayload = (body) => {
    if (!body || typeof body !== 'object') {
        return 'Invalid JSON body';
    }

    const { items, currency } = body;

    if (!Array.isArray(items) || items.length === 0) {
        return 'At least one item is required';
    }

    for (let i = 0; i < items.length; i += 1) {
        const err = validateItem(items[i], i);
        if (err) return err;
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
        items,
        subtotal,
        fees,
        totalAmount,
        currency = 'USD',
        notes = '',
        description = '',
        userId,
    } = req.body;

    const sanitizedCurrency = sanitizeCurrency(currency);
    const normalizedItems = items.map((item) => ({
        bookId: item.bookId,
        title: item.title,
        price: Number(item.price),
        quantity: Number(item.quantity),
    }));

    const computedSubtotal = normalizedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const computedFees = normalizedItems.length === 0 ? 0 : Math.max(computedSubtotal * 0.05, MIN_FEE_AMOUNT);
    const computedTotal = computedSubtotal + computedFees;

    const providedSubtotal = subtotal == null ? computedSubtotal : Number(subtotal);
    const providedFees = fees == null ? computedFees : Number(fees);
    const providedTotal = totalAmount == null ? computedTotal : Number(totalAmount);

    const amountsMatch = Math.abs(providedSubtotal - computedSubtotal) < 0.01
        && Math.abs(providedFees - computedFees) < 0.01
        && Math.abs(providedTotal - computedTotal) < 0.01;

    if (!amountsMatch) {
        logger.warn({
            msg: 'Amount mismatch on checkout payload',
            paymentCurrency: sanitizedCurrency,
            providedSubtotal,
            computedSubtotal,
            providedFees,
            computedFees,
            providedTotal,
            computedTotal,
        });
    }

    const paymentId = randomUUID();
    const createdAt = new Date().toISOString();

    logger.info({
        msg: 'Processing payment request',
        paymentId,
        items: normalizedItems.length,
        total: Number(computedTotal.toFixed(2)),
        currency: sanitizedCurrency,
        userId: userId || 'anonymous',
    });

    if (PROCESSING_DELAY_MS > 0) {
        await new Promise((resolve) => setTimeout(resolve, PROCESSING_DELAY_MS));
    }

    const paymentRecord = {
        paymentId,
        items: normalizedItems,
        subtotal: Number(computedSubtotal.toFixed(2)),
        fees: Number(computedFees.toFixed(2)),
        totalAmount: Number(computedTotal.toFixed(2)),
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
