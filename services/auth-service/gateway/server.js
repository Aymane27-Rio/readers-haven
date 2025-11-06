import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { randomUUID } from 'crypto';

const app = express();

// Config
const PORT = parseInt(process.env.GATEWAY_PORT || '8080', 10);
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';
const ORDER_URL = process.env.ORDER_URL || 'http://localhost:7001';
const INVENTORY_URL = process.env.INVENTORY_URL || 'http://localhost:7002';
const USER_SVC_URL = process.env.USER_SVC_URL || '';
const PAYMENT_URL = process.env.PAYMENT_URL || '';
const BOOKS_URL = process.env.BOOKS_URL || '';
const QUOTES_URL = process.env.QUOTES_URL || '';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const PROXY_TIMEOUT_MS = parseInt(process.env.PROXY_TIMEOUT_MS || '5000', 10);
const PROXY_RETRIES = parseInt(process.env.PROXY_RETRIES || '2', 10);

// Correlation ID
app.use((req, res, next) => {
  const id = req.headers['x-request-id'] || randomUUID();
  req.id = id;
  res.setHeader('x-request-id', id);
  next();
});

// Hardening
app.use(helmet());
app.use(compression());
app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(rateLimit({ windowMs: 60 * 1000, max: 300 }));

// JWT verification middleware (bearer)
function verifyJWT(req, res, next) {
  const auth = req.headers['authorization'] || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token) return res.status(401).json({ status: 'error', message: 'Unauthorized', error: { code: 'UNAUTHORIZED' }, requestId: req.id });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { id: payload.id };
    res.setHeader('x-user-id', payload.id);
    return next();
  } catch (e) {
    return res.status(401).json({ status: 'error', message: 'Invalid token', error: { code: 'UNAUTHORIZED' }, requestId: req.id });
  }
}

// Public OAuth passthrough (Google)
app.use('/auth/google', createProxyMiddleware({
  target: BACKEND_URL,
  changeOrigin: true,
  timeout: PROXY_TIMEOUT_MS,
  proxyTimeout: PROXY_TIMEOUT_MS,
  onProxyReq(proxyReq, req) {
    if (req.id) proxyReq.setHeader('x-request-id', req.id);
  }
}));
app.use('/auth/google/callback', createProxyMiddleware({
  target: BACKEND_URL,
  changeOrigin: true,
  timeout: PROXY_TIMEOUT_MS,
  proxyTimeout: PROXY_TIMEOUT_MS,
  onProxyReq(proxyReq, req) {
    if (req.id) proxyReq.setHeader('x-request-id', req.id);
  }
}));
// Friendly alias: /google -> /auth/google
app.get('/google', (req, res) => res.redirect(302, '/auth/google'));

// Public routes (REST auth API)
app.use('/auth', createProxyMiddleware({
  target: BACKEND_URL,
  changeOrigin: true,
  pathRewrite: { '^/auth': '/api/auth' },
  timeout: PROXY_TIMEOUT_MS,
  proxyTimeout: PROXY_TIMEOUT_MS,
  onProxyReq(proxyReq, req) {
    if (req.id) proxyReq.setHeader('x-request-id', req.id);
  }
}));

// Public static uploads passthrough
app.use('/uploads', createProxyMiddleware({
  target: BACKEND_URL,
  changeOrigin: true,
  timeout: PROXY_TIMEOUT_MS,
  proxyTimeout: PROXY_TIMEOUT_MS,
  onProxyReq(proxyReq, req) {
    if (req.id) proxyReq.setHeader('x-request-id', req.id);
  }
}));

// Helper to build a resilient proxy with retries, timeouts and header propagation
function buildProxy(opts) {
  const proxy = createProxyMiddleware({
    changeOrigin: true,
    timeout: PROXY_TIMEOUT_MS,
    proxyTimeout: PROXY_TIMEOUT_MS,
    ...opts,
    onProxyReq(proxyReq, req) {
      if (req.id) proxyReq.setHeader('x-request-id', req.id);
      if (req.user?.id) proxyReq.setHeader('x-user-id', req.user.id);
      if (typeof opts.onProxyReq === 'function') opts.onProxyReq(proxyReq, req);
    },
  });
  return (req, res, next) => {
    let attempts = 0;
    const tryOnce = () => {
      attempts += 1;
      proxy(req, res, (err) => {
        if (err && attempts <= PROXY_RETRIES) {
          setTimeout(tryOnce, 150);
        } else if (err) {
          res.status(504).json({ status: 'error', message: 'Upstream timeout', requestId: req.id });
        } else {
          next();
        }
      });
    };
    tryOnce();
  };
}

// Protected routes
app.use('/users', verifyJWT, buildProxy({ target: BACKEND_URL, pathRewrite: { '^/users': '/api/profile' } }));
app.use('/books', verifyJWT, buildProxy({ target: BOOKS_URL || BACKEND_URL, pathRewrite: BOOKS_URL ? undefined : { '^/books': '/api/books' } }));
app.use('/quotes', verifyJWT, buildProxy({ target: QUOTES_URL || BACKEND_URL, pathRewrite: QUOTES_URL ? undefined : { '^/quotes': '/api/quotes' } }));

// Microservices
app.use('/orders', verifyJWT, buildProxy({ target: ORDER_URL }));
app.use('/inventory', verifyJWT, buildProxy({ target: INVENTORY_URL }));
if (USER_SVC_URL) app.use('/users-svc', verifyJWT, buildProxy({ target: USER_SVC_URL }));
if (PAYMENT_URL) app.use('/payments', verifyJWT, buildProxy({ target: PAYMENT_URL }));

app.get('/', (req, res) => {
  res.json({ status: 'success', message: 'Readers Haven API Gateway', data: { gateway: 'up' }, requestId: req.id });
});

app.get('/health', (req, res) => {
  res.json({ status: 'up', service: 'api-gateway' });
});

app.get('/metrics', (req, res) => {
  res.setHeader('Content-Type', 'text/plain');
  res.send(`# HELP gateway_requests_total Total number of HTTP requests\n# TYPE gateway_requests_total counter\ngateway_requests_total{service="api-gateway"} 1\n`);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[gateway] listening on ${PORT}, proxy -> ${BACKEND_URL}`);
});
