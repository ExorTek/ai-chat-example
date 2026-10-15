# Frontend

React 19 + Vite client for the chat backend. Tailwind CSS v4 via `@tailwindcss/vite`, no UI
or markdown libraries.

```bash
cp .env.example .env    # optional, VITE_API_URL
yarn install
yarn dev                # http://127.0.0.1:5173
yarn build
```

## Structure

| Path                            | Responsibility                                                |
| ------------------------------- | ------------------------------------------------------------- |
| `src/lib/api.js`                | `fetchProviders` (axios) and `streamChat` (fetch + SSE)       |
| `src/lib/sse.js`                | Parses `text/event-stream` chunks from a fetch body           |
| `src/lib/markdown.js`           | Small markdown subset: fences, lists, quotes, emphasis, links |
| `src/lib/storage.js`            | Namespaced, failure-tolerant `localStorage` helpers           |
| `src/hooks/useConversations.js` | Conversation list, active chat, message mutations             |
| `src/hooks/useChat.js`          | Send / stop / regenerate, streaming buffer                    |
| `src/hooks/useSettings.js`      | Provider catalog and persisted preferences                    |
| `src/hooks/useTheme.js`         | Light / dark class on `<html>`                                |
| `src/components/`               | Sidebar, TopBar, SettingsPanel, MessageList, Composer, ...    |

## Notes

- Streaming uses `fetch` rather than `EventSource` because the endpoint is a POST that
  carries the whole conversation in its body.
- While a response streams, the text lives in component state and is only committed to the
  conversation once the stream ends, so `localStorage` is not rewritten per token.
- Conversations, settings and theme are stored under the `ai-chat-example:` key prefix.
