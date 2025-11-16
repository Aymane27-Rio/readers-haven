import { test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';

process.env.DISABLE_TRACING = 'true';

const { app } = await import('../server.js');

test('GET /health', async () => {
  const res = await request(app).get('/health');
  assert.equal(res.status, 200);
  assert.equal(res.body.status, 'ok');
  assert.equal(res.body.service, 'order-service');
});

test('GET / returns orders', async () => {
  const res = await request(app).get('/');
  assert.equal(res.status, 200);
  assert.equal(res.body.status, 'success');
  assert.ok(Array.isArray(res.body.data));
  assert.ok(res.body.data.length >= 1);
});

test('GET /:id returns order or 404', async () => {
  const okResponse = await request(app).get('/1001');
  assert.equal(okResponse.status, 200);
  assert.equal(okResponse.body.status, 'success');
  assert.equal(okResponse.body.data.id, '1001');

  const notFound = await request(app).get('/does-not-exist');
  assert.equal(notFound.status, 404);
  assert.equal(notFound.body.status, 'error');
});

test('GET /metrics', async () => {
  await request(app).get('/');
  const res = await request(app).get('/metrics');
  assert.equal(res.status, 200);
  assert.match(res.text, /http_requests_total/);
});
