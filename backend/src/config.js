'use strict';

const toInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toList = (value, separator) =>
  String(value || '')
    .split(separator)
    .map(item => item.trim())
    .filter(Boolean);

const {
  NODE_ENV,
  LOG_LEVEL,
  PORT,
  HOST,
  CORS_WHITE_LIST,
  RATE_LIMIT_MAX,
  RATE_LIMIT_TIME_WINDOW,
  CHAT_RATE_LIMIT_MAX,
  MAX_HISTORY_MESSAGES,
  MAX_MESSAGE_LENGTH,
  MAX_OUTPUT_TOKENS,
  REQUEST_TIMEOUT_MS,
  SYSTEM_PROMPT,
} = process.env;

const env = NODE_ENV || 'development';

const config = {
  env,
  isDevelopment: env === 'development',
  isProduction: env === 'production',
  logLevel: LOG_LEVEL || 'info',
  port: toInt(PORT, 5001),
  host: HOST || '127.0.0.1',
  corsWhiteList: toList(CORS_WHITE_LIST, ';'),
  rateLimit: {
    max: toInt(RATE_LIMIT_MAX, 100),
    timeWindow: RATE_LIMIT_TIME_WINDOW || '1 minute',
  },
  chat: {
    // Chat calls cost money upstream, so they get a tighter budget than the global limit.
    rateLimitMax: toInt(CHAT_RATE_LIMIT_MAX, 20),
    maxHistoryMessages: toInt(MAX_HISTORY_MESSAGES, 40),
    maxMessageLength: toInt(MAX_MESSAGE_LENGTH, 8000),
    maxOutputTokens: toInt(MAX_OUTPUT_TOKENS, 4096),
    requestTimeoutMs: toInt(REQUEST_TIMEOUT_MS, 120000),
    systemPrompt: SYSTEM_PROMPT || 'You are a helpful assistant. Answer in the language the user writes in. Use markdown when it makes the answer easier to read.',
  },
};

module.exports = config;
