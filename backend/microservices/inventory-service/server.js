import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';

const app = express();
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json());

const PORT = parseInt(process.env.PORT || '7002', 10);

// Demo inventory map
let INVENTORY = { 'book-1': 10, 'book-2': 5 };

app.get('/health', (_req, res) => res.json({ status: 'up', service: 'inventory-service' }));

app.get('/inventory', (_req, res) => {
  res.json({ status: 'success', data: INVENTORY });
});

app.post('/inventory/:sku/adjust', (req, res) => {
  const { amount = 0 } = req.body || {};
  const { sku } = req.params;
  const cur = INVENTORY[sku] || 0;
  INVENTORY[sku] = cur + Number(amount);
  console.log('[metric] inventory_adjust', { sku, value: INVENTORY[sku] });
  res.json({ status: 'success', data: { sku, quantity: INVENTORY[sku] } });
});

app.listen(PORT, () => console.log(`[inventory-service] listening on ${PORT}`));
