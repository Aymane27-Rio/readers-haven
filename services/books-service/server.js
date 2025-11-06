import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'books-service' }));

// Placeholder endpoints; real routes will be extracted later
app.get('/api/books', (_req, res) => res.json({ status: 'success', data: [] }));

const PORT = parseInt(process.env.PORT || '5002', 10);
app.listen(PORT, () => console.log(`[books-service] listening on ${PORT}`));
