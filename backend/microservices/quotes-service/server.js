import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import mongoose from 'mongoose';

const app = express();
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json());

const PORT = parseInt(process.env.PORT || '7004', 10);
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/readers_haven';

mongoose.connect(MONGO_URI).then(()=>{
  console.log('[quotes-service] connected to mongo');
}).catch(err=>{
  console.error('[quotes-service] mongo error', err);
});

const quoteSchema = new mongoose.Schema({
  text: { type: String, required: true },
  author: { type: String, default: '' },
  userId: { type: String, required: true },
}, { timestamps: true });

const Quote = mongoose.model('Quote', quoteSchema);

app.get('/health', (_req, res) => res.json({ status: 'up', service: 'quotes-service' }));
app.get('/metrics', (_req, res) => {
  res.setHeader('Content-Type', 'text/plain');
  res.send('# HELP quotes_requests_total Total HTTP requests\n# TYPE quotes_requests_total counter\nquotes_requests_total 1\n');
});

function getUserId(req){
  return req.headers['x-user-id'] || '';
}

app.get('/quotes', async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ status: 'error', message: 'Unauthorized' });
  const docs = await Quote.find({ userId }).sort({ createdAt: -1 });
  res.json(docs);
});

app.post('/quotes', async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ status: 'error', message: 'Unauthorized' });
  const { text, author = '' } = req.body || {};
  if (!text) return res.status(400).json({ status: 'error', message: 'Missing text' });
  const doc = await Quote.create({ text, author, userId });
  res.status(201).json(doc);
});

app.delete('/quotes/:id', async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ status: 'error', message: 'Unauthorized' });
  const { id } = req.params;
  const doc = await Quote.findOneAndDelete({ _id: id, userId });
  if (!doc) return res.status(404).json({ status: 'error', message: 'Not found' });
  res.json({ status: 'success' });
});

app.listen(PORT, () => console.log(`[quotes-service] listening on ${PORT}`));
