const PREFIX = 'ai-chat-example';

export const readStorage = (key, fallback) => {
  try {
    const raw = window.localStorage.getItem(`${PREFIX}:${key}`);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

export const writeStorage = (key, value) => {
  try {
    window.localStorage.setItem(`${PREFIX}:${key}`, JSON.stringify(value));
  } catch {
    // Private mode or a full quota: persistence is a nicety, never a hard requirement.
  }
};

export const createId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
