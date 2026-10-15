import '@globalStyles';
import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import SettingsPanel from '@/components/SettingsPanel';
import MessageList from '@/components/MessageList';
import Composer from '@/components/Composer';
import { WarningIcon } from '@/components/icons';
import { useConversations } from '@/hooks/useConversations';
import { useSettings } from '@/hooks/useSettings';
import { useChat } from '@/hooks/useChat';
import { useTheme } from '@/hooks/useTheme';

const STATUS_HINTS = {
  loading: 'Connecting to the backend...',
  empty: 'No provider configured. Add an API key to backend/.env and restart the server.',
  error: 'Backend unreachable. Is it running on the URL in VITE_API_URL?',
};

function App() {
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const { conversations, active, activeId, selectConversation, createConversation, deleteConversation, clearConversations, appendMessage, updateMessage, dropMessagesFrom } = useConversations();
  const { settings, update, selectProvider, catalog, activeProvider, status, error, reload } = useSettings();

  const { streaming, isStreaming, send, stop, regenerate } = useChat({
    conversation: active,
    settings,
    appendMessage,
    updateMessage,
    dropMessagesFrom,
  });

  const disabled = status !== 'ready';
  const canRegenerate = active.messages.some(message => message.role === 'assistant');

  const handleSelect = id => {
    selectConversation(id);
    setSidebarOpen(false);
  };

  return (
    <div className='flex h-full bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100'>
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onSelect={handleSelect}
        onCreate={() => {
          createConversation();
          setSidebarOpen(false);
        }}
        onDelete={deleteConversation}
        onClearAll={clearConversations}
      />

      <main className='flex min-w-0 flex-1 flex-col'>
        <TopBar
          title={active.title}
          subtitle={disabled ? STATUS_HINTS[status] : `${activeProvider?.label || 'Provider'} / ${settings.model}`}
          theme={theme}
          onToggleTheme={toggleTheme}
          settingsOpen={settingsOpen}
          onToggleSettings={() => setSettingsOpen(open => !open)}
          onOpenSidebar={() => setSidebarOpen(true)}
        />

        {settingsOpen && !disabled && (
          <SettingsPanel
            settings={settings}
            catalog={catalog}
            activeProvider={activeProvider}
            onSelectProvider={selectProvider}
            onUpdate={update}
          />
        )}

        {status === 'error' && (
          <div className='flex items-center justify-between gap-3 border-b border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200'>
            <span className='flex items-center gap-2'>
              <WarningIcon className='size-4 shrink-0' />
              {error}
            </span>
            <button
              type='button'
              onClick={reload}
              className='rounded-lg border border-rose-300 px-2 py-1 text-xs transition hover:bg-rose-100 dark:border-rose-800 dark:hover:bg-rose-900/40'>
              Retry
            </button>
          </div>
        )}

        <MessageList
          messages={active.messages}
          streaming={streaming}
          onPickSuggestion={send}
          suggestionsDisabled={disabled || isStreaming}
        />

        <Composer
          onSend={send}
          onStop={stop}
          onRegenerate={regenerate}
          isStreaming={isStreaming}
          canRegenerate={canRegenerate}
          disabled={disabled}
          hint={disabled ? STATUS_HINTS[status] : 'Enter to send, Shift+Enter for a new line. History stays in your browser.'}
        />
      </main>
    </div>
  );
}

export default App;
