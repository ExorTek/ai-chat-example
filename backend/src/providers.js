'use strict';

const OpenAI = require('openai');
const { badRequest } = require('./lib/errors');

// Every provider below speaks the OpenAI chat-completions dialect, which is why a single
// client implementation is enough. Adding a new one means adding a definition here.
const DEFINITIONS = [
  {
    id: 'groq',
    label: 'Groq',
    apiKeyEnv: 'GROQ_API_KEY',
    baseUrlEnv: 'GROQ_BASE_URL',
    modelsEnv: 'GROQ_MODELS',
    defaultBaseUrl: 'https://api.groq.com/openai/v1',
    models: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'],
  },
  {
    id: 'deepseek',
    label: 'DeepSeek',
    apiKeyEnv: 'DEEP_SEEK_API_KEY',
    baseUrlEnv: 'DEEP_SEEK_BASE_URL',
    modelsEnv: 'DEEP_SEEK_MODELS',
    defaultBaseUrl: 'https://api.deepseek.com',
    models: ['deepseek-chat', 'deepseek-reasoner'],
  },
  {
    id: 'openai',
    label: 'OpenAI',
    apiKeyEnv: 'OPENAI_API_KEY',
    baseUrlEnv: 'OPENAI_BASE_URL',
    modelsEnv: 'OPENAI_MODELS',
    defaultBaseUrl: 'https://api.openai.com/v1',
    models: ['gpt-4o-mini', 'gpt-4o'],
  },
];

const toModels = value =>
  String(value || '')
    .split(',')
    .map(model => model.trim())
    .filter(Boolean);

const registry = new Map();

for (const definition of DEFINITIONS) {
  const apiKey = process.env[definition.apiKeyEnv];
  if (!apiKey) continue;

  const models = toModels(process.env[definition.modelsEnv]);
  const baseURL = process.env[definition.baseUrlEnv] || definition.defaultBaseUrl;

  registry.set(definition.id, {
    id: definition.id,
    label: definition.label,
    baseURL,
    models: models.length ? models : definition.models,
    client: new OpenAI({ apiKey, baseURL }),
  });
}

const listProviders = () =>
  [...registry.values()].map(provider => ({
    id: provider.id,
    label: provider.label,
    models: provider.models,
    defaultModel: provider.models[0],
  }));

const defaultProviderId = () => registry.keys().next().value || null;

const hasProviders = () => registry.size > 0;

// Resolves the requested provider/model pair, falling back to the first configured provider.
const resolveTarget = ({ provider, model } = {}) => {
  const id = provider || defaultProviderId();
  if (!id) throw badRequest('No AI provider is configured on the server');

  const entry = registry.get(id);
  if (!entry) throw badRequest(`Unknown provider "${id}"`, { available: [...registry.keys()] });

  const selectedModel = model || entry.models[0];
  if (!entry.models.includes(selectedModel)) throw badRequest(`Unknown model "${selectedModel}" for provider "${id}"`, { available: entry.models });

  return { provider: entry, model: selectedModel };
};

module.exports = { listProviders, defaultProviderId, hasProviders, resolveTarget };
