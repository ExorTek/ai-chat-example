# Backend

Fastify server that proxies chat completions to any OpenAI-compatible provider and streams
the answer to the browser over server-sent events.

```bash
cp .env.example .env    # at least one provider key
yarn install
yarn dev                # nodemon
yarn start              # plain node
yarn test               # node --test
```

## Routes

| Method | Path             | Notes                                                |
| ------ | ---------------- | ---------------------------------------------------- |
| GET    | `/health`        | Uptime, environment, configured provider ids         |
| GET    | `/api/providers` | Models per provider plus request limits              |
| POST   | `/api/chat`      | SSE stream by default, JSON when `stream` is `false` |

The request body is validated by `src/schemas/chat.js`; see the root README for the shape
and for the SSE frame format.

## Structure

| File                          | Responsibility                                              |
| ----------------------------- | ----------------------------------------------------------- |
| `app.js`                      | Plugin registration, 404 and error handlers                 |
| `server.js`                   | Listen plus SIGINT/SIGTERM shutdown                         |
| `src/config.js`               | Environment variables with defaults, parsed once            |
| `src/providers.js`            | Builds a client per configured key, resolves provider/model |
| `src/lib/errors.js`           | `ApiError` and the upstream error translation               |
| `src/lib/sse.js`              | Raw SSE writer with heartbeats                              |
| `src/routes/chat.js`          | Streaming and non-streaming chat, client-abort bridging     |
| `src/services/chatService.js` | Payload building and provider calls                         |

## Behaviour worth knowing

- A provider is only exposed when its API key is present in the environment.
- `POST /api/chat` has its own rate limit (`CHAT_RATE_LIMIT_MAX`), tighter than the global one.
- Closing the browser connection aborts the upstream request; Node fires `close` on the
  response, not the request, which is what `createAbortBridge` listens to.
- The SSE response is hijacked from Fastify, so plugin headers (CORS, helmet) are copied
  onto the raw response manually in `src/lib/sse.js`.
