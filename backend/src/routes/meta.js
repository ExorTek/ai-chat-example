'use strict';

const config = require('../config');
const { listProviders, defaultProviderId } = require('../providers');

module.exports = async fastify => {
  fastify.get('/health', async () => ({
    status: 'ok',
    env: config.env,
    uptime: Math.round(process.uptime()),
    providers: listProviders().map(provider => provider.id),
  }));

  fastify.get('/api/providers', async () => ({
    success: true,
    data: {
      providers: listProviders(),
      defaultProvider: defaultProviderId(),
      limits: {
        maxHistoryMessages: config.chat.maxHistoryMessages,
        maxMessageLength: config.chat.maxMessageLength,
        maxOutputTokens: config.chat.maxOutputTokens,
      },
    },
  }));
};
