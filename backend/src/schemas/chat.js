'use strict';

const config = require('../config');

const messageSchema = {
  type: 'object',
  required: ['role', 'content'],
  additionalProperties: false,
  properties: {
    role: { type: 'string', enum: ['user', 'assistant'] },
    content: { type: 'string', minLength: 1, maxLength: config.chat.maxMessageLength },
  },
};

const chatBodySchema = {
  type: 'object',
  required: ['messages'],
  additionalProperties: false,
  properties: {
    provider: { type: 'string', minLength: 1, maxLength: 40 },
    model: { type: 'string', minLength: 1, maxLength: 120 },
    systemPrompt: { type: 'string', maxLength: 4000 },
    temperature: { type: 'number', minimum: 0, maximum: 2 },
    maxTokens: { type: 'integer', minimum: 16, maximum: config.chat.maxOutputTokens },
    stream: { type: 'boolean', default: true },
    messages: {
      type: 'array',
      minItems: 1,
      maxItems: config.chat.maxHistoryMessages,
      items: messageSchema,
    },
  },
};

module.exports = { chatBodySchema };
