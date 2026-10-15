'use strict';

const HEARTBEAT_MS = 15000;

// Minimal server-sent-events writer on top of the raw response. Fastify is told to stay out
// of the way with reply.hijack(), so the lifecycle of the socket is owned here.
const createSseStream = reply => {
  reply.hijack();

  const { raw } = reply;
  let closed = false;

  // Hijacking bypasses Fastify's onSend hooks, so headers added by plugins such as CORS
  // and helmet have to be copied onto the raw response by hand.
  raw.writeHead(200, {
    ...reply.getHeaders(),
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
  });
  raw.flushHeaders?.();

  const heartbeat = setInterval(() => {
    if (!closed) raw.write(': ping\n\n');
  }, HEARTBEAT_MS);
  heartbeat.unref?.();

  const send = (event, data) => {
    if (closed || raw.writableEnded) return;
    raw.write(`event: ${event}\ndata: ${JSON.stringify(data ?? null)}\n\n`);
  };

  const close = () => {
    if (closed) return;
    closed = true;
    clearInterval(heartbeat);
    raw.end();
  };

  return {
    send,
    close,
    get closed() {
      return closed;
    },
  };
};

module.exports = { createSseStream };
