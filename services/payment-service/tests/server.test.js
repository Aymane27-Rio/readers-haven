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
    assert.match(res.body.message, /at least one item/i);
});

test('POST /checkout processes payment', async () => {
    const payload = {
        items: [
            { bookId: 'existentialism-humanism', title: 'Existentialism Is a Humanism', price: 149, quantity: 1 },
            { bookId: 'stoicism-vsi', title: 'Stoicism: A Very Short Introduction', price: 119, quantity: 2 },
        ],
        currency: 'dh',
        notes: 'Deliver via email',
    };

    const res = await request(app).post('/checkout').send(payload);
    assert.equal(res.status, 201);
    assert.equal(res.body.status, 'success');
    assert.equal(res.body.data.currency, 'DH');
    assert.equal(res.body.data.status, 'succeeded');
    assert.equal(res.body.data.items.length, 2);
    assert.ok(res.body.data.paymentId);
    const expectedSubtotal = 149 + 119 * 2;
    assert.equal(res.body.data.subtotal, Number(expectedSubtotal.toFixed(2)));
    assert.ok(res.body.data.totalAmount >= res.body.data.subtotal);
});

test('GET / returns transactions list', async () => {
    await request(app).post('/checkout').send({
        items: [{ bookId: 'aristotle-for-everybody', title: 'Aristotle for Everybody', price: 135, quantity: 1 }],
        currency: 'dh',
    });
    const res = await request(app).get('/');
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'success');
    assert.ok(Array.isArray(res.body.data));
});
