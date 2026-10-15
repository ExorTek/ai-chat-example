'use strict';

const fastify = require('fastify');
const fastifyCors = require('@fastify/cors');
const fastifyHelmet = require('@fastify/helmet');
const fastifyRateLimit = require('@fastify/rate-limit');

const config = require('./src/config');
const { ApiError } = require('./src/lib/errors');
const { hasProviders, listProviders } = require('./src/providers');
const { helmetOptions, rateLimitOptions, corsOptionDelegate } = require('./src/plugins/security');

const buildApp = (options = {}) => {
  const app = fastify({ logger: { level: config.logLevel }, bodyLimit: 1024 * 1024, ...options });

  app.register(fastifyCors, { origin: corsOptionDelegate });
  app.register(fastifyHelmet, helmetOptions);
  app.register(fastifyRateLimit, rateLimitOptions);

  app.register(require('./src/routes/meta'));
  app.register(require('./src/routes/chat'));

  app.setNotFoundHandler((request, reply) => {
    reply.code(404).send({ success: false, error: { code: 'NOT_FOUND', message: `Route ${request.method} ${request.url} not found` } });
  });

  app.setErrorHandler((error, request, reply) => {
    // Validation failures come from the JSON schemas attached to each route.
    if (error.validation) {
      return reply.code(400).send({ success: false, error: { code: 'VALIDATION_ERROR', message: error.message, details: error.validation } });
    }

    if (error instanceof ApiError) {
      if (error.statusCode >= 500) request.log.error({ err: error }, 'api error');
      return reply.code(error.statusCode).send({ success: false, error: { code: error.code, message: error.message, details: error.details } });
    }

    if (error.statusCode === 429) {
      return reply.code(429).send({ success: false, error: { code: 'RATE_LIMITED', message: 'Too many requests, slow down' } });
    }

    request.log.error({ err: error }, 'unhandled error');
    const statusCode = error.statusCode && error.statusCode >= 400 ? error.statusCode : 500;
    return reply.code(statusCode).send({ success: false, error: { code: 'INTERNAL_ERROR', message: statusCode === 500 ? 'Unexpected server error' : error.message } });
  });

  app.ready(() => {
    if (!hasProviders()) {
      app.log.warn('No AI provider configured. Set GROQ_API_KEY, DEEP_SEEK_API_KEY or OPENAI_API_KEY in backend/.env');
      return;
    }
    app.log.info({ providers: listProviders().map(provider => provider.id) }, 'AI providers ready');
  });

  return app;
};

module.exports = buildApp;
