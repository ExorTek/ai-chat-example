import { useCallback, useEffect, useMemo, useState } from 'react';
import { createId, readStorage, writeStorage } from '@/lib/storage';

const TITLE_LENGTH = 42;

const newConversation = () => ({
  id: createId(),
  title: 'New chat',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  messages: [],
});

const titleFrom = content => {
  const flat = content.replace(/\s+/g, ' ').trim();
  return flat.length > TITLE_LENGTH ? `${flat.slice(0, TITLE_LENGTH)}...` : flat || 'New chat';
};

export const useConversations = () => {
  const [conversations, setConversations] = useState(() => {
    const stored = readStorage('conversations', []);
    return Array.isArray(stored) && stored.length ? stored : [newConversation()];
  });
  const [activeId, setActiveId] = useState(() => readStorage('activeId', null));

  const active = useMemo(() => conversations.find(item => item.id === activeId) || conversations[0], [conversations, activeId]);

  useEffect(() => {
    if (active && active.id !== activeId) setActiveId(active.id);
  }, [active, activeId]);

  useEffect(() => {
    writeStorage('conversations', conversations);
  }, [conversations]);

  useEffect(() => {
    if (activeId) writeStorage('activeId', activeId);
  }, [activeId]);

  const patchActive = useCallback(
    updater =>
      setConversations(current =>
        current.map(conversation => {
          if (conversation.id !== active?.id) return conversation;
          return { ...updater(conversation), updatedAt: Date.now() };
        }),
      ),
    [active?.id],
  );

  const createConversation = useCallback(() => {
    const conversation = newConversation();
    setConversations(current => [conversation, ...current]);
    setActiveId(conversation.id);
    return conversation;
  }, []);

  const deleteConversation = useCallback(id => {
    setConversations(current => {
      const remaining = current.filter(conversation => conversation.id !== id);
      return remaining.length ? remaining : [newConversation()];
    });
  }, []);

  const renameConversation = useCallback((id, title) => {
    setConversations(current => current.map(conversation => (conversation.id === id ? { ...conversation, title: title.trim() || conversation.title } : conversation)));
  }, []);

  const clearConversations = useCallback(() => {
    const conversation = newConversation();
    setConversations([conversation]);
    setActiveId(conversation.id);
  }, []);

  const appendMessage = useCallback(
    message => {
      const entry = { id: createId(), createdAt: Date.now(), ...message };
      patchActive(conversation => ({
        ...conversation,
        title: conversation.messages.length === 0 && entry.role === 'user' ? titleFrom(entry.content) : conversation.title,
        messages: [...conversation.messages, entry],
      }));
      return entry;
    },
    [patchActive],
  );

  const updateMessage = useCallback(
    (id, patch) => {
      patchActive(conversation => ({
        ...conversation,
        messages: conversation.messages.map(message => (message.id === id ? { ...message, ...(typeof patch === 'function' ? patch(message) : patch) } : message)),
      }));
    },
    [patchActive],
  );

  const dropMessagesFrom = useCallback(
    id => {
      patchActive(conversation => {
        const index = conversation.messages.findIndex(message => message.id === id);
        return { ...conversation, messages: index === -1 ? conversation.messages : conversation.messages.slice(0, index) };
      });
    },
    [patchActive],
  );

  return {
    conversations,
    active,
    activeId: active?.id,
    selectConversation: setActiveId,
    createConversation,
    deleteConversation,
    renameConversation,
    clearConversations,
    appendMessage,
    updateMessage,
    dropMessagesFrom,
  };
};
