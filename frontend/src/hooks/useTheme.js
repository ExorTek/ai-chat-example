import { useCallback, useEffect, useState } from 'react';
import { readStorage, writeStorage } from '@/lib/storage';

const prefersDark = () => window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;

export const useTheme = () => {
  const [theme, setTheme] = useState(() => readStorage('theme', prefersDark() ? 'dark' : 'light'));

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.style.colorScheme = theme;
    writeStorage('theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => setTheme(current => (current === 'dark' ? 'light' : 'dark')), []);

  return { theme, toggleTheme };
};
