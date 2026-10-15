import { useCallback, useEffect, useState } from 'react';
import { fetchProviders } from '@/lib/api';
import { readStorage, writeStorage } from '@/lib/storage';

const DEFAULTS = { provider: null, model: null, temperature: 0.7, systemPrompt: '' };

export const useSettings = () => {
  const [settings, setSettings] = useState(() => ({ ...DEFAULTS, ...readStorage('settings', {}) }));
  const [catalog, setCatalog] = useState({ providers: [], defaultProvider: null, limits: null });
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const data = await fetchProviders();
      setCatalog(data);
      setError(null);
      setStatus(data.providers.length ? 'ready' : 'empty');

      // Keep the stored choice only while it still exists on the server.
      setSettings(current => {
        const provider = data.providers.find(item => item.id === current.provider) || data.providers.find(item => item.id === data.defaultProvider) || data.providers[0];
        if (!provider) return current;
        const model = provider.models.includes(current.model) ? current.model : provider.defaultModel;
        return { ...current, provider: provider.id, model };
      });
    } catch (requestError) {
      setError(requestError.message);
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    writeStorage('settings', settings);
  }, [settings]);

  const update = useCallback(patch => setSettings(current => ({ ...current, ...patch })), []);

  const selectProvider = useCallback(
    providerId => {
      const provider = catalog.providers.find(item => item.id === providerId);
      if (!provider) return;
      update({ provider: provider.id, model: provider.defaultModel });
    },
    [catalog.providers, update],
  );

  const activeProvider = catalog.providers.find(item => item.id === settings.provider) || null;

  return { settings, update, selectProvider, catalog, activeProvider, status, error, reload: load };
};
