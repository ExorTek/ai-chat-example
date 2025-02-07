const fastify = require('fastify')({ logger: true });
const fastifyCors = require('@fastify/cors');
const fastifyHelmet = require('@fastify/helmet');
const fastifyRateLimit = require('@fastify/rate-limit');
const OpenAI = require('openai');
const { helmetOptions, rateLimitOptions, corsOptionDelegate } = require('./helpers');

const { DEEP_SEEK_BASE_URL, DEEP_SEEK_API_KEY, GROQ_API_KEY, GROQ_BASE_URL } = process.env;

const deepSeek = new OpenAI({
  baseURL: DEEP_SEEK_BASE_URL,
  apiKey: DEEP_SEEK_API_KEY,
});

const groq = new OpenAI({
  baseURL: GROQ_BASE_URL,
  apiKey: GROQ_API_KEY,
});

fastify.register(require('fastify-sse'));
fastify.register(fastifyCors, { origin: corsOptionDelegate });
fastify.register(fastifyHelmet, helmetOptions);
fastify.register(fastifyRateLimit, rateLimitOptions);

fastify.post('/deepseek', async (request, reply) => {
  const message = request.body.message;

  const completion = await deepSeek.chat.completions
    .create({
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: message },
      ],
      model: 'deepseek-chat',
    })
    .then(response => response)
    .catch(error => {
      console.log(error);
    });

  return {
    success: true,
    data: completion,
  };
});

fastify.get('/groq', async (request, reply) => {
  const message = request.query.message;

  const stream = await groq.chat.completions.create({
    messages: [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: message },
    ],
    model: 'llama-3.3-70b-versatile',
    stream: true,
  });

  reply.sse({ data: 'Connected to the chat server' });

  for await (const chunk of stream) {
    const content = chunk.choices?.[0]?.delta?.content;
    if (content) {
      reply.sse({ event: 'message', data: content });
    }
  }

  reply.sse({ event: 'end', data: null });
});

module.exports = fastify;
