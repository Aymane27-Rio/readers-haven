import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { randomUUID } from 'crypto';
import logger from '../shared/libs/logger.js';

dotenv.config();

const app = express();

// Config from env with container-name defaults
const PORT = parseInt(process.env.GATEWAY_PORT || process.env.PORT || '8080', 10);
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://auth-service:5001';
const BOOKS_SERVICE_URL = process.env.BOOKS_SERVICE_URL || AUTH_SERVICE_URL; // keep routed to auth-service for now
const QUOTES_SERVICE_URL = process.env.QUOTES_SERVICE_URL || AUTH_SERVICE_URL; // keep routed to auth-service for now
const ORDERS_SERVICE_URL = process.env.ORDERS_SERVICE_URL || 'http://order-service:5004';
const FRONTEND_ORIGIN = process.env.FRONTEND_URL || 'http://localhost:5173';

// Basic hardening and transport
app.use((req, res, next) => { req.id = req.headers['x-request-id'] || randomUUID(); res.setHeader('x-request-id', req.id); next(); });
app.use(helmet());
app.use(cors({ origin: FRONTEND_ORIGIN, credentials: true }));
app.use(express.json());

// Request log
app.use((req, _res, next) => { logger.info({ id: req.id, method: req.method, url: req.url }); next(); });

// Helper: build proxy with header propagation
function proxyTo(target) {
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    onProxyReq(proxyReq, req) {
      if (req.id) proxyReq.setHeader('x-request-id', req.id);
      // Forward JWT if present
      const auth = req.headers['authorization'];
      if (auth) proxyReq.setHeader('authorization', auth);
    },
  });
}

// Health
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'gateway' }));

// API routes
app.use('/api/auth', proxyTo(AUTH_SERVICE_URL));
app.use('/api/profile', proxyTo(AUTH_SERVICE_URL));
app.use('/api/books', proxyTo(BOOKS_SERVICE_URL));
app.use('/api/quotes', proxyTo(QUOTES_SERVICE_URL));
app.use('/api/orders', proxyTo(ORDERS_SERVICE_URL));

// OAuth passthroughs (preserve full path to auth-service)
app.use(createProxyMiddleware({
  target: AUTH_SERVICE_URL,
  changeOrigin: true,
  filter: (pathname) => pathname.startsWith('/auth/google'),
  onProxyReq(proxyReq, req) {
    if (req.id) proxyReq.setHeader('x-request-id', req.id);
  },
}));

// Static uploads passthrough
app.use('/uploads', proxyTo(AUTH_SERVICE_URL));

// Root
app.get('/', (_req, res) => res.json({ status: 'ok', service: 'gateway' }));

app.listen(PORT, '0.0.0.0', () => logger.info({ msg: 'Gateway listening', port: PORT, auth: AUTH_SERVICE_URL }));
