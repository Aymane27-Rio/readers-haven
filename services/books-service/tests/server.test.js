import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';

process.env.NODE_ENV = 'test';
process.env.DISABLE_TRACING = 'true';

const { app } = await import('../server.js');

const resetState = async () => {
  const res = await request(app).get('/');
  for (const book of res.body.data) {
    if (!['1', '2'].includes(book._id)) {
      // eslint-disable-next-line no-await-in-loop
      await request(app).delete(`/${book._id}`);
    }
  }
};

beforeEach(resetState);

test('GET /health', async () => {
  const res = await request(app).get('/health');
  assert.equal(res.status, 200);
  assert.equal(res.body.status, 'ok');
  assert.equal(res.body.service, 'books-service');
});

test('POST / creates new book and returns it', async () => {
  const payload = { title: 'Deep Work', author: 'Cal Newport', description: 'Focus strategies' };
  const res = await request(app).post('/').send(payload);
  assert.equal(res.status, 201);
  assert.equal(res.body.status, 'success');
  assert.equal(res.body.data.title, payload.title);
  assert.equal(res.body.data.status, 'to-read');
  assert.ok(res.body.data._id);
});

test('POST / validates required fields', async () => {
  const res = await request(app).post('/').send({ author: 'Missing Title' });
  assert.equal(res.status, 400);
  assert.equal(res.body.status, 'error');
  assert.match(res.body.message, /title is required/i);
});

test('PUT /:id updates existing book', async () => {
  const create = await request(app).post('/').send({ title: 'Atomic Habits', author: 'James Clear' });
  const id = create.body.data._id;
  const res = await request(app).put(`/${id}`).send({ status: 'read' });
  assert.equal(res.status, 200);
  assert.equal(res.body.status, 'success');
  assert.equal(res.body.data.status, 'read');
});

test('DELETE /:id removes book', async () => {
  const create = await request(app).post('/').send({ title: 'Delete Me', author: 'Author' });
  const id = create.body.data._id;
  const res = await request(app).delete(`/${id}`);
  assert.equal(res.status, 200);
  assert.equal(res.body.status, 'success');
  const list = await request(app).get('/');
  assert.ok(!list.body.data.some((b) => b._id === id));
});

test('GET /metrics exposes Prometheus data', async () => {
  // generate a couple of requests so counters increment
  await request(app).get('/');
  const res = await request(app).get('/metrics');
  assert.equal(res.status, 200);
  assert.match(res.text, /http_requests_total/);
  assert.match(res.text, /http_request_duration_seconds_bucket/);
});
