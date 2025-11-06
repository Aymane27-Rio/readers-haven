import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'inventory-service' }));

// Placeholder
app.get('/api/inventory', (_req, res) => res.json({ status: 'success', data: [] }));

const PORT = parseInt(process.env.PORT || '5005', 10);
app.listen(PORT, () => console.log(`[inventory-service] listening on ${PORT}`));
