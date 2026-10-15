'use strict';

const config = require('../config');
const { resolveTarget } = require('../providers');
const { fromUpstream } = require('../lib/errors');

const buildMessages = ({ messages, systemPrompt }) => [{ role: 'system', content: systemPrompt || config.chat.systemPrompt }, ...messages.map(({ role, content }) => ({ role, content }))];

const buildPayload = (target, body, stream) => ({
  model: target.model,
  messages: buildMessages(body),
  temperature: body.temperature ?? 0.7,
  max_tokens: Math.min(body.maxTokens ?? config.chat.maxOutputTokens, config.chat.maxOutputTokens),
  stream,
});

const complete = async (body, { signal } = {}) => {
  const target = resolveTarget({ provider: body.provider, model: body.model });
  const payload = buildPayload(target, body, false);

  try {
    const completion = await target.provider.client.chat.completions.create(payload, { signal });
    const choice = completion.choices?.[0];

    return {
      provider: target.provider.id,
      model: target.model,
      content: choice?.message?.content || '',
      finishReason: choice?.finish_reason || null,
      usage: completion.usage || null,
    };
  } catch (error) {
    throw fromUpstream(error);
  }
};

// Yields plain text deltas; the transport layer decides how to frame them.
const streamCompletion = async function* (body, { signal } = {}) {
  const target = resolveTarget({ provider: body.provider, model: body.model });
  const payload = buildPayload(target, body, true);

  let stream;
  try {
    stream = await target.provider.client.chat.completions.create({ ...payload, stream_options: { include_usage: true } }, { signal });
  } catch (error) {
    throw fromUpstream(error);
  }

  try {
    for await (const chunk of stream) {
      const choice = chunk.choices?.[0];
      const text = choice?.delta?.content;
      if (text) yield { type: 'delta', text };
      if (choice?.finish_reason) yield { type: 'finish', finishReason: choice.finish_reason };
      if (chunk.usage) yield { type: 'usage', usage: chunk.usage };
    }
  } catch (error) {
    throw fromUpstream(error);
  }
};

module.exports = { complete, streamCompletion };
