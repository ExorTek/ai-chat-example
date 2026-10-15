# AI Chat Example

A streaming chat application built on a Fastify backend and a React 19 + Vite frontend.
The backend speaks to any OpenAI-compatible provider (Groq, DeepSeek, OpenAI) and relays
tokens to the browser over server-sent events.

```
browser  --POST /api/chat-->  Fastify  --chat.completions.create(stream)-->  provider
   ^                             |
   +------ text/event-stream ----+
```

## Features

**Backend**

- `POST /api/chat` streams a completion over SSE, or returns JSON when `stream: false`
- Provider registry: a provider appears in the API only when its API key is set
- JSON schema validation on every request, one error envelope for every failure
- Client disconnects abort the upstream call, so a cancelled answer stops costing tokens
- Per-route rate limiting, CORS whitelist, helmet, graceful shutdown
- Tests with the built-in Node test runner, no extra dependency

**Frontend**

- Token-by-token streaming with a stop button and regenerate
- Multiple conversations, auto-generated titles, persisted in `localStorage`
- Markdown rendering (code blocks with copy, lists, quotes, links) written in-house
- Provider / model / temperature / system prompt picker fed by the backend
- Light and dark theme, responsive layout down to phone width

## Quick start

```bash
# 1. backend
cd backend
cp .env.example .env          # add at least one provider API key
yarn install
yarn dev                      # http://127.0.0.1:5001

# 2. frontend (second terminal)
cd frontend
cp .env.example .env          # optional, defaults to http://127.0.0.1:5001
yarn install
yarn dev                      # http://127.0.0.1:5173
```

Without an API key the UI still loads and tells you which variable is missing.

## HTTP API

| Method | Path             | Description                                          |
| ------ | ---------------- | ---------------------------------------------------- |
| GET    | `/health`        | Liveness probe plus the list of configured providers |
| GET    | `/api/providers` | Providers, their models and the server-side limits   |
| POST   | `/api/chat`      | Chat completion, streaming by default                |

### `POST /api/chat`

```jsonc
{
  "messages": [{ "role": "user", "content": "hello" }], // required, user/assistant only
  "provider": "groq",                                   // optional, defaults to the first configured one
  "model": "llama-3.3-70b-versatile",                   // optional, defaults to the provider's first model
  "systemPrompt": "You are terse.",                     // optional
  "temperature": 0.7,                                   // optional, 0..2
  "maxTokens": 1024,                                    // optional
  "stream": true                                        // optional, false returns a single JSON body
}
```

SSE frames, each `data:` payload is JSON:

```
event: open    data: {"provider":"groq","model":"llama-3.3-70b-versatile"}
event: delta   data: {"text":"Hel"}
event: done    data: {"finishReason":"stop","usage":{"total_tokens":137}}
event: error   data: {"code":"UPSTREAM_RATE_LIMITED","message":"..."}
```

Errors that happen before the stream opens (validation, unknown model, rate limit) come
back as a normal HTTP error instead:

```json
{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": "..." } }
```

## Layout

```
backend/
├── app.js                  Fastify instance, plugins, error handling
├── server.js               Bootstrap and graceful shutdown
├── src/
│   ├── config.js           Environment parsing with defaults
│   ├── providers.js        Provider registry, model resolution
│   ├── lib/                errors.js, sse.js
│   ├── plugins/security.js cors / helmet / rate-limit options
│   ├── routes/             chat.js, meta.js
│   ├── schemas/            Request validation
│   └── services/           Provider calls
└── test/                   node --test suite

frontend/src/
├── components/             Sidebar, TopBar, MessageList, Composer, Markdown, ...
├── hooks/                  useChat, useConversations, useSettings, useTheme
├── lib/                    api.js, sse.js, markdown.js, storage.js
└── App.jsx
```

## Adding a provider

Append a definition to `DEFINITIONS` in `backend/src/providers.js` and set its API key in
`.env`. Anything that speaks the OpenAI chat-completions dialect works as is; the frontend
picks the new entry up from `/api/providers` without a change.

## Notes

- `fastify-sse` is no longer used; SSE is written directly onto the raw response so the
  stream can carry plugin headers and be cancelled cleanly. Drop it with
  `yarn remove fastify-sse` in `backend/`.
- Conversations never leave the browser, there is no database.
