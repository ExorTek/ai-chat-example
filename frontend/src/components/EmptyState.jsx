import { ChatIcon } from '@/components/icons';

const SUGGESTIONS = ['Explain server-sent events like I am five', 'Write a Fastify route with schema validation', 'Refactor this React hook for readability', 'Give me 5 ideas for a side project'];

export default function EmptyState({ onPick, disabled }) {
  return (
    <div className='flex h-full flex-col items-center justify-center gap-6 px-4 text-center'>
      <div className='flex size-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-slate-800 dark:text-brand-300'>
        <ChatIcon className='size-7' />
      </div>

      <div>
        <h2 className='text-xl font-semibold text-slate-800 dark:text-slate-100'>How can I help?</h2>
        <p className='mt-1 text-sm text-slate-500 dark:text-slate-400'>Streaming answers from your configured provider.</p>
      </div>

      <div className='grid w-full max-w-xl gap-2 sm:grid-cols-2'>
        {SUGGESTIONS.map(suggestion => (
          <button
            key={suggestion}
            type='button'
            disabled={disabled}
            onClick={() => onPick(suggestion)}
            className='rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm text-slate-600 transition hover:border-brand-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-brand-500 dark:hover:text-white'>
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}
