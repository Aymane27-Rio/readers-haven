import { test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';

process.env.NODE_ENV = 'test';
process.env.DISABLE_TRACING = 'true';

const { app } = await import('../server.js');

test('GET /health', async () => {
  const res = await request(app).get('/health');
  assert.equal(res.status, 200);
  assert.equal(res.body.status, 'ok');
  assert.equal(res.body.service, 'inventory-service');
});

test('GET / returns inventory', async () => {
  const res = await request(app).get('/');
  assert.equal(res.status, 200);
  assert.equal(res.body.status, 'success');
  assert.ok(Array.isArray(res.body.data));
  assert.ok(res.body.data.length >= 1);
});

test('GET /:sku returns item or 404', async () => {
  const okResponse = await request(app).get('/BK-001');
  assert.equal(okResponse.status, 200);
  assert.equal(okResponse.body.status, 'success');
  assert.equal(okResponse.body.data.sku, 'BK-001');

  const notFound = await request(app).get('/UNKNOWN');
  assert.equal(notFound.status, 404);
  assert.equal(notFound.body.status, 'error');
});

test('GET /metrics', async () => {
  await request(app).get('/');
  const res = await request(app).get('/metrics');
  assert.equal(res.status, 200);
  assert.match(res.text, /http_requests_total/);
});
