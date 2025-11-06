import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'quotes-service' }));

// Placeholder
app.get('/api/quotes', (_req, res) => res.json({ status: 'success', data: [] }));

const PORT = parseInt(process.env.PORT || '5003', 10);
app.listen(PORT, () => console.log(`[quotes-service] listening on ${PORT}`));
