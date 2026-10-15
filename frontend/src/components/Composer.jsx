import { useEffect, useRef, useState } from 'react';
import { RefreshIcon, SendIcon, StopIcon } from '@/components/icons';

const MAX_HEIGHT = 200;

export default function Composer({ onSend, onStop, onRegenerate, isStreaming, canRegenerate, disabled, hint }) {
  const [value, setValue] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    const node = textareaRef.current;
    if (!node) return;
    node.style.height = 'auto';
    node.style.height = `${Math.min(node.scrollHeight, MAX_HEIGHT)}px`;
  }, [value]);

  const submit = event => {
    event?.preventDefault();
    if (!value.trim() || isStreaming || disabled) return;
    onSend(value);
    setValue('');
  };

  const handleKeyDown = event => {
    if (event.key === 'Enter' && !event.shiftKey) submit(event);
  };

  return (
    <div className='border-t border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900'>
      <form
        onSubmit={submit}
        className='mx-auto max-w-3xl'>
        <div className='flex items-end gap-2 rounded-2xl border border-slate-300 bg-slate-50 p-2 transition focus-within:border-brand-500 dark:border-slate-700 dark:bg-slate-800'>
          <textarea
            ref={textareaRef}
            rows={1}
            value={value}
            disabled={disabled}
            onChange={event => setValue(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={disabled ? 'Backend unavailable' : 'Send a message...'}
            className='scrollbar-thin max-h-[200px] flex-1 resize-none bg-transparent px-2 py-1.5 text-[15px] text-slate-800 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed dark:text-slate-100'
          />

          {canRegenerate && !isStreaming && (
            <button
              type='button'
              onClick={onRegenerate}
              className='rounded-xl p-2.5 text-slate-500 transition hover:bg-slate-200 hover:text-slate-800 dark:hover:bg-slate-700 dark:hover:text-white'
              aria-label='Regenerate last answer'>
              <RefreshIcon className='size-5' />
            </button>
          )}

          {isStreaming ? (
            <button
              type='button'
              onClick={onStop}
              className='rounded-xl bg-rose-500 p-2.5 text-white transition hover:bg-rose-600'
              aria-label='Stop generating'>
              <StopIcon className='size-5' />
            </button>
          ) : (
            <button
              type='submit'
              disabled={!value.trim() || disabled}
              className='rounded-xl bg-brand-600 p-2.5 text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-300 dark:disabled:bg-slate-700'
              aria-label='Send message'>
              <SendIcon className='size-5' />
            </button>
          )}
        </div>

        <p className='mt-1.5 px-1 text-[11px] text-slate-400'>{hint}</p>
      </form>
    </div>
  );
}
