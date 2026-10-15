export default function SettingsPanel({ settings, catalog, activeProvider, onSelectProvider, onUpdate }) {
  return (
    <div className='border-b border-slate-200 bg-slate-50 px-4 py-4 dark:border-slate-800 dark:bg-slate-900/60'>
      <div className='mx-auto grid max-w-3xl gap-4 md:grid-cols-2'>
        <label className='text-xs font-medium text-slate-500 dark:text-slate-400'>
          Provider
          <select
            value={settings.provider || ''}
            onChange={event => onSelectProvider(event.target.value)}
            className='mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100'>
            {catalog.providers.map(provider => (
              <option
                key={provider.id}
                value={provider.id}>
                {provider.label}
              </option>
            ))}
          </select>
        </label>

        <label className='text-xs font-medium text-slate-500 dark:text-slate-400'>
          Model
          <select
            value={settings.model || ''}
            onChange={event => onUpdate({ model: event.target.value })}
            className='mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100'>
            {(activeProvider?.models || []).map(model => (
              <option
                key={model}
                value={model}>
                {model}
              </option>
            ))}
          </select>
        </label>

        <label className='text-xs font-medium text-slate-500 md:col-span-2 dark:text-slate-400'>
          Temperature: <span className='font-mono text-slate-700 dark:text-slate-200'>{settings.temperature.toFixed(2)}</span>
          <input
            type='range'
            min='0'
            max='2'
            step='0.05'
            value={settings.temperature}
            onChange={event => onUpdate({ temperature: Number(event.target.value) })}
            className='mt-2 w-full accent-brand-600'
          />
        </label>

        <label className='text-xs font-medium text-slate-500 md:col-span-2 dark:text-slate-400'>
          System prompt
          <textarea
            value={settings.systemPrompt}
            onChange={event => onUpdate({ systemPrompt: event.target.value })}
            rows={3}
            placeholder='Leave empty to use the server default.'
            className='scrollbar-thin mt-1 w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100'
          />
        </label>
      </div>
    </div>
  );
}
