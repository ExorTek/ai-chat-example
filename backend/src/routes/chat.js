'use strict';

const config = require('../config');
const { chatBodySchema } = require('../schemas/chat');
const { createSseStream } = require('../lib/sse');
const { ApiError } = require('../lib/errors');
const { resolveTarget } = require('../providers');
const chatService = require('../services/chatService');

// One controller per request so an aborted browser connection stops the upstream call too.
// Node emits 'close' on the request as soon as its body has been read, so the disconnect
// has to be watched on the response socket instead.
const createAbortBridge = reply => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.chat.requestTimeoutMs);
  const onClose = () => {
    if (!reply.raw.writableEnded) controller.abort();
  };

  reply.raw.on('close', onClose);

  return {
    signal: controller.signal,
    dispose: () => {
      clearTimeout(timeout);
      reply.raw.off('close', onClose);
    },
  };
};

const streamChat = async (request, reply, target) => {
  const { signal, dispose } = createAbortBridge(reply);
  const stream = createSseStream(reply);

  let finishReason = null;
  let usage = null;

  try {
    stream.send('open', { provider: target.provider.id, model: target.model });

    for await (const event of chatService.streamCompletion(request.body, { signal })) {
      if (signal.aborted) break;
      if (event.type === 'delta') stream.send('delta', { text: event.text });
      if (event.type === 'finish') finishReason = event.finishReason;
      if (event.type === 'usage') usage = event.usage;
    }

    // An aborted upstream iterator can finish quietly instead of throwing, so the
    // disconnect is checked here as well as in the catch below.
    if (signal.aborted) request.log.info('chat stream aborted by client');
    else stream.send('done', { finishReason, usage });
  } catch (error) {
    if (signal.aborted) {
      request.log.info('chat stream aborted by client');
    } else {
      request.log.error({ err: error }, 'chat stream failed');
      stream.send('error', { code: error.code || 'INTERNAL_ERROR', message: error instanceof ApiError ? error.message : 'Unexpected server error' });
    }
  } finally {
    dispose();
    stream.close();
  }
};

const completeChat = async (request, reply) => {
  const { signal, dispose } = createAbortBridge(reply);

  try {
    const result = await chatService.complete(request.body, { signal });
    return reply.send({ success: true, data: result });
  } finally {
    dispose();
  }
};

module.exports = async fastify => {
  fastify.post(
    '/api/chat',
    {
      schema: { body: chatBodySchema },
      config: { rateLimit: { max: config.chat.rateLimitMax, timeWindow: config.rateLimit.timeWindow } },
    },
    async (request, reply) => {
      // Resolved up front so an unknown provider/model is a clean 400 instead of an SSE error frame.
      const target = resolveTarget({ provider: request.body.provider, model: request.body.model });

      if (request.body.stream === false) return completeChat(request, reply);
      return streamChat(request, reply, target);
    },
  );
};
