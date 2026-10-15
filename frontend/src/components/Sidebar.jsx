import { ChatIcon, CloseIcon, PlusIcon, TrashIcon } from '@/components/icons';

const relativeTime = timestamp => {
  const minutes = Math.round((Date.now() - timestamp) / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
};

export default function Sidebar({ conversations, activeId, open, onClose, onSelect, onCreate, onDelete, onClearAll }) {
  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-20 bg-slate-900/50 transition-opacity md:hidden ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform md:static md:translate-x-0 dark:border-slate-800 dark:bg-slate-900 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className='flex items-center justify-between px-4 py-4'>
          <div className='flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-100'>
            <ChatIcon className='size-5 text-brand-600 dark:text-brand-300' />
            AI Chat
          </div>
          <button
            type='button'
            onClick={onClose}
            className='rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 md:hidden dark:hover:bg-slate-800'
            aria-label='Close sidebar'>
            <CloseIcon />
          </button>
        </div>

        <div className='px-3'>
          <button
            type='button'
            onClick={onCreate}
            className='flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-3 py-2.5 text-sm font-medium text-white transition hover:bg-brand-700'>
            <PlusIcon className='size-4' />
            New chat
          </button>
        </div>

        <nav className='scrollbar-thin mt-4 flex-1 space-y-1 overflow-y-auto px-3 pb-4'>
          {conversations.map(conversation => {
            const isActive = conversation.id === activeId;
            return (
              <div
                key={conversation.id}
                className={`group flex items-center gap-2 rounded-xl px-3 py-2 transition ${isActive ? 'bg-brand-50 text-brand-700 dark:bg-slate-800 dark:text-brand-100' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/60'}`}>
                <button
                  type='button'
                  onClick={() => onSelect(conversation.id)}
                  className='min-w-0 flex-1 text-left'>
                  <span className='block truncate text-sm font-medium'>{conversation.title}</span>
                  <span className='block text-[11px] text-slate-400'>
                    {conversation.messages.length} messages &middot; {relativeTime(conversation.updatedAt)}
                  </span>
                </button>
                <button
                  type='button'
                  onClick={() => onDelete(conversation.id)}
                  className='rounded-lg p-1.5 text-slate-400 opacity-0 transition group-hover:opacity-100 hover:bg-slate-200 hover:text-rose-500 focus:opacity-100 dark:hover:bg-slate-700'
                  aria-label={`Delete ${conversation.title}`}>
                  <TrashIcon className='size-4' />
                </button>
              </div>
            );
          })}
        </nav>

        <div className='border-t border-slate-200 px-3 py-3 dark:border-slate-800'>
          <button
            type='button'
            onClick={onClearAll}
            className='w-full rounded-lg px-3 py-2 text-left text-xs text-slate-500 transition hover:bg-slate-100 hover:text-rose-500 dark:hover:bg-slate-800'>
            Clear all conversations
          </button>
        </div>
      </aside>
    </>
  );
}
