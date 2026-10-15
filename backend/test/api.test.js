'use strict';

process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'silent';
process.env.GROQ_API_KEY = 'test-key';
process.env.GROQ_MODELS = 'llama-3.3-70b-versatile,llama-3.1-8b-instant';

const test = require('node:test');
const assert = require('node:assert/strict');

const buildApp = require('../app');

const app = buildApp();

test.before(() => app.ready());
test.after(() => app.close());

test('GET /health reports configured providers', async () => {
  const response = await app.inject({ method: 'GET', url: '/health' });

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.json().providers, ['groq']);
});

test('GET /api/providers exposes models without leaking keys', async () => {
  const response = await app.inject({ method: 'GET', url: '/api/providers' });
  const { data } = response.json();

  assert.equal(response.statusCode, 200);
  assert.equal(data.defaultProvider, 'groq');
  assert.equal(data.providers[0].defaultModel, 'llama-3.3-70b-versatile');
  assert.equal(JSON.stringify(data).includes('test-key'), false);
});

test('POST /api/chat rejects an empty history', async () => {
  const response = await app.inject({ method: 'POST', url: '/api/chat', payload: { messages: [] } });

  assert.equal(response.statusCode, 400);
  assert.equal(response.json().error.code, 'VALIDATION_ERROR');
});

test('POST /api/chat rejects an unknown role', async () => {
  const response = await app.inject({ method: 'POST', url: '/api/chat', payload: { messages: [{ role: 'system', content: 'hi' }] } });

  assert.equal(response.statusCode, 400);
  assert.equal(response.json().error.code, 'VALIDATION_ERROR');
});

test('POST /api/chat rejects an unknown model before streaming starts', async () => {
  const response = await app.inject({ method: 'POST', url: '/api/chat', payload: { provider: 'groq', model: 'nope', messages: [{ role: 'user', content: 'hi' }] } });

  assert.equal(response.statusCode, 400);
  assert.equal(response.json().error.code, 'BAD_REQUEST');
});

test('unknown routes answer with the shared error envelope', async () => {
  const response = await app.inject({ method: 'GET', url: '/nope' });

  assert.equal(response.statusCode, 404);
  assert.equal(response.json().error.code, 'NOT_FOUND');
});
