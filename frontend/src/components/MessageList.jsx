import { useCallback, useEffect, useRef, useState } from 'react';
import MessageBubble from '@/components/MessageBubble';
import EmptyState from '@/components/EmptyState';
import { ArrowDownIcon } from '@/components/icons';

const NEAR_BOTTOM_PX = 120;

export default function MessageList({ messages, streaming, onPickSuggestion, suggestionsDisabled }) {
  const containerRef = useRef(null);
  const [pinned, setPinned] = useState(true);

  const scrollToBottom = useCallback((behavior = 'smooth') => {
    const node = containerRef.current;
    if (node) node.scrollTo({ top: node.scrollHeight, behavior });
  }, []);

  const handleScroll = () => {
    const node = containerRef.current;
    if (!node) return;
    setPinned(node.scrollHeight - node.scrollTop - node.clientHeight < NEAR_BOTTOM_PX);
  };

  // Follow the conversation only while the user has not scrolled away from the bottom.
  useEffect(() => {
    if (pinned) scrollToBottom(streaming ? 'auto' : 'smooth');
  }, [messages, pinned, scrollToBottom, streaming]);

  return (
    <div className='relative min-h-0 flex-1'>
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className='scrollbar-thin h-full overflow-y-auto px-4 py-6'>
        {messages.length === 0 ? (
          <EmptyState
            onPick={onPickSuggestion}
            disabled={suggestionsDisabled}
          />
        ) : (
          <div className='mx-auto flex max-w-3xl flex-col gap-5'>
            {messages.map(message => (
              <MessageBubble
                key={message.id}
                message={message}
                isStreaming={streaming?.id === message.id}
                streamingText={streaming?.id === message.id ? streaming.text : ''}
              />
            ))}
          </div>
        )}
      </div>

      {!pinned && messages.length > 0 && (
        <button
          type='button'
          onClick={() => scrollToBottom()}
          className='absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 shadow-md transition hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'>
          <ArrowDownIcon className='size-4' />
          Jump to latest
        </button>
      )}
    </div>
  );
}
