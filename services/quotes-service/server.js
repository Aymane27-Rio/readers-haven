import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'quotes-service' }));

// Placeholder - Gateway strips /api/quotes prefix, so handle root path
app.get('/', (_req, res) => res.json({ status: 'success', data: [], message: 'quotes-service placeholder' }));

const PORT = parseInt(process.env.PORT || '5003', 10);
app.listen(PORT, () => console.log(`[quotes-service] listening on ${PORT}`));
