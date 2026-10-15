import { MenuIcon, MoonIcon, SettingsIcon, SunIcon } from '@/components/icons';

export default function TopBar({ title, subtitle, theme, onToggleTheme, onToggleSettings, onOpenSidebar, settingsOpen }) {
  return (
    <header className='flex items-center gap-2 border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900'>
      <button
        type='button'
        onClick={onOpenSidebar}
        className='rounded-lg p-2 text-slate-500 hover:bg-slate-100 md:hidden dark:hover:bg-slate-800'
        aria-label='Open sidebar'>
        <MenuIcon />
      </button>

      <div className='min-w-0 flex-1'>
        <h1 className='truncate text-sm font-semibold text-slate-800 dark:text-slate-100'>{title}</h1>
        <p className='truncate text-[11px] text-slate-400'>{subtitle}</p>
      </div>

      <button
        type='button'
        onClick={onToggleSettings}
        className={`rounded-lg p-2 transition hover:bg-slate-100 dark:hover:bg-slate-800 ${settingsOpen ? 'text-brand-600 dark:text-brand-300' : 'text-slate-500'}`}
        aria-label='Toggle settings'
        aria-pressed={settingsOpen}>
        <SettingsIcon />
      </button>

      <button
        type='button'
        onClick={onToggleTheme}
        className='rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-800'
        aria-label='Toggle theme'>
        {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
      </button>
    </header>
  );
}
