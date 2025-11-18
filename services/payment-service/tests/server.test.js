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
    assert.equal(res.body.service, 'payment-service');
});

test('POST /checkout validates payload', async () => {
    const res = await request(app).post('/checkout').send({});
    assert.equal(res.status, 400);
    assert.equal(res.body.status, 'error');
    assert.match(res.body.message, /bookId/i);
});

test('POST /checkout processes payment', async () => {
    const payload = {
        bookId: 'atlas-01',
        title: 'The Atlas Paradox',
        amount: 19.5,
        currency: 'usd',
        notes: 'Deliver via email',
    };

    const res = await request(app).post('/checkout').send(payload);
    assert.equal(res.status, 201);
    assert.equal(res.body.status, 'success');
    assert.equal(res.body.data.bookId, payload.bookId);
    assert.equal(res.body.data.currency, 'USD');
    assert.equal(res.body.data.status, 'succeeded');
    assert.ok(res.body.data.paymentId);
});

test('GET / returns transactions list', async () => {
    await request(app).post('/checkout').send({ bookId: 'night-02', title: 'The Night Circus', amount: 16 });
    const res = await request(app).get('/');
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'success');
    assert.ok(Array.isArray(res.body.data));
});
