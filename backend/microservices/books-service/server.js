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

const PORT = parseInt(process.env.PORT || '7003', 10);
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/readers_haven';

mongoose.connect(MONGO_URI).then(()=>{
  console.log('[books-service] connected to mongo');
}).catch(err=>{
  console.error('[books-service] mongo error', err);
});

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  description: String,
  publishedYear: Number,
  status: { type: String, enum: ['to-read','currently-reading','read'], default: 'to-read' },
  userId: { type: String, required: true },
}, { timestamps: true });

const Book = mongoose.model('Book', bookSchema);

app.get('/health', (_req, res) => res.json({ status: 'up', service: 'books-service' }));
app.get('/metrics', (_req, res) => {
  res.setHeader('Content-Type', 'text/plain');
  res.send('# HELP books_requests_total Total HTTP requests\n# TYPE books_requests_total counter\nbooks_requests_total 1\n');
});

function getUserId(req){
  return req.headers['x-user-id'] || '';
}

app.get('/books', async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ status: 'error', message: 'Unauthorized' });
  const docs = await Book.find({ userId }).sort({ createdAt: -1 });
  res.json(docs);
});

app.post('/books', async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ status: 'error', message: 'Unauthorized' });
  const { title, author, description = '', publishedYear = null, status = 'to-read' } = req.body || {};
  if (!title || !author) return res.status(400).json({ status: 'error', message: 'Missing title/author' });
  const doc = await Book.create({ title, author, description, publishedYear, status, userId });
  res.status(201).json(doc);
});

app.delete('/books/:id', async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ status: 'error', message: 'Unauthorized' });
  const { id } = req.params;
  const doc = await Book.findOneAndDelete({ _id: id, userId });
  if (!doc) return res.status(404).json({ status: 'error', message: 'Not found' });
  res.json({ status: 'success' });
});

app.listen(PORT, () => console.log(`[books-service] listening on ${PORT}`));
