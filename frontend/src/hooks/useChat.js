import { useCallback, useRef, useState } from 'react';
import { streamChat } from '@/lib/api';

const HISTORY_LIMIT = 40;

const toHistory = messages =>
  messages
    .filter(message => message.content.trim() && !message.error)
    .slice(-HISTORY_LIMIT)
    .map(({ role, content }) => ({ role, content }));

export const useChat = ({ conversation, settings, appendMessage, updateMessage, dropMessagesFrom }) => {
  const [streaming, setStreaming] = useState(null);
  const controllerRef = useRef(null);

  const isStreaming = streaming !== null;

  const run = useCallback(
    async history => {
      const placeholder = appendMessage({ role: 'assistant', content: '', provider: settings.provider, model: settings.model });
      const controller = new AbortController();
      controllerRef.current = controller;
      setStreaming({ id: placeholder.id, text: '' });

      let buffer = '';

      try {
        await streamChat({
          signal: controller.signal,
          body: {
            messages: history,
            provider: settings.provider || undefined,
            model: settings.model || undefined,
            temperature: settings.temperature,
            systemPrompt: settings.systemPrompt.trim() || undefined,
          },
          onDelta: text => {
            buffer += text;
            setStreaming(current => (current && current.id === placeholder.id ? { ...current, text: buffer } : current));
          },
          onDone: ({ usage, finishReason }) => {
            updateMessage(placeholder.id, { content: buffer, usage, finishReason });
          },
        });
      } catch (error) {
        if (error.name === 'AbortError') {
          updateMessage(placeholder.id, { content: buffer, stopped: true });
        } else {
          updateMessage(placeholder.id, { content: buffer, error: error.message || 'Something went wrong' });
        }
      } finally {
        controllerRef.current = null;
        setStreaming(null);
      }
    },
    [appendMessage, settings, updateMessage],
  );

  const send = useCallback(
    async text => {
      const content = text.trim();
      if (!content || isStreaming) return;

      appendMessage({ role: 'user', content });
      await run([...toHistory(conversation.messages), { role: 'user', content }]);
    },
    [appendMessage, conversation.messages, isStreaming, run],
  );

  const regenerate = useCallback(async () => {
    if (isStreaming) return;

    const messages = conversation.messages;
    const lastAssistant = [...messages].reverse().find(message => message.role === 'assistant');
    const history = toHistory(lastAssistant ? messages.slice(0, messages.indexOf(lastAssistant)) : messages);
    if (!history.length) return;

    if (lastAssistant) dropMessagesFrom(lastAssistant.id);
    await run(history);
  }, [conversation.messages, dropMessagesFrom, isStreaming, run]);

  const stop = useCallback(() => controllerRef.current?.abort(), []);

  return { streaming, isStreaming, send, stop, regenerate };
};
