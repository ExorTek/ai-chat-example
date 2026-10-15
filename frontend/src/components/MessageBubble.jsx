import { useState } from 'react';
import Markdown from '@/components/Markdown';
import { CheckIcon, CopyIcon, WarningIcon } from '@/components/icons';

const formatTime = timestamp =>
  new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

export default function MessageBubble({ message, streamingText, isStreaming }) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';
  const content = isStreaming ? streamingText : message.content;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className={`animate-message-in flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div
        className={`mt-1 flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${isUser ? 'bg-brand-600 text-white' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-200'}`}>
        {isUser ? 'You' : 'AI'}
      </div>

      <div className={`group min-w-0 max-w-[min(42rem,88%)] ${isUser ? 'items-end text-right' : ''}`}>
        <div
          className={`rounded-2xl px-4 py-3 text-left ${isUser ? 'bg-brand-600 text-white' : 'border border-slate-200 bg-white text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100'}`}>
          {isUser ? <p className='text-[15px] leading-relaxed whitespace-pre-wrap break-words'>{content}</p> : <Markdown content={content} />}

          {isStreaming && <span className='animate-caret ml-0.5 inline-block h-4 w-2 bg-slate-400 align-middle' />}

          {message.error && (
            <p className='mt-2 flex items-center gap-1.5 rounded-lg bg-rose-50 px-2 py-1.5 text-xs text-rose-600 dark:bg-rose-950/40 dark:text-rose-300'>
              <WarningIcon className='size-4 shrink-0' />
              {message.error}
            </p>
          )}
        </div>

        <div className={`mt-1 flex items-center gap-2 px-1 text-[11px] text-slate-400 ${isUser ? 'justify-end' : ''}`}>
          <span>{formatTime(message.createdAt)}</span>
          {message.model && !isUser && <span className='truncate font-mono'>{message.model}</span>}
          {message.stopped && <span className='text-amber-500'>stopped</span>}
          {message.usage?.total_tokens && <span>{message.usage.total_tokens} tokens</span>}
          {!isStreaming && content && (
            <button
              type='button'
              onClick={copy}
              className='flex items-center gap-1 rounded px-1 py-0.5 opacity-0 transition group-hover:opacity-100 hover:text-slate-600 focus:opacity-100 dark:hover:text-slate-200'
              aria-label='Copy message'>
              {copied ? <CheckIcon className='size-3.5' /> : <CopyIcon className='size-3.5' />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
