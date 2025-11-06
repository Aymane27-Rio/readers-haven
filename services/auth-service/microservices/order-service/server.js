import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';

const app = express();
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json());

const PORT = parseInt(process.env.PORT || '7001', 10);

// In-memory orders for demo
let ORDERS = [];

app.get('/health', (_req, res) => res.json({ status: 'up', service: 'order-service' }));

app.get('/orders', (_req, res) => {
  res.json({ status: 'success', data: ORDERS });
});

app.post('/orders', (req, res) => {
  const { userId, items = [], total = 0 } = req.body || {};
  const order = { id: String(Date.now()), userId, items, total, createdAt: new Date().toISOString() };
  ORDERS.unshift(order);
  // Emit demo metric (could be pushed to a bus)
  console.log('[metric] order_created', { count: ORDERS.length });
  res.status(201).json({ status: 'success', data: order });
});

app.listen(PORT, () => console.log(`[order-service] listening on ${PORT}`));
