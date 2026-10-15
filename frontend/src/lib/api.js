import axios from 'axios';
import { readEventStream } from '@/lib/sse';

export const API_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:5001').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(message, code) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
  }
}

const toApiError = error => {
  const payload = error?.response?.data?.error;
  if (payload) return new ApiError(payload.message, payload.code);
  if (error?.name === 'AbortError' || error?.code === 'ERR_CANCELED') return error;
  return new ApiError(error?.message || 'Network request failed', 'NETWORK_ERROR');
};

export const fetchProviders = async () => {
  try {
    const { data } = await axios.get(`${API_URL}/api/providers`, { timeout: 10000 });
    return data.data;
  } catch (error) {
    throw toApiError(error);
  }
};

// Streams a chat completion. Resolves once the stream is finished or aborted.
export const streamChat = async ({ body, signal, onOpen, onDelta, onDone }) => {
  const response = await fetch(`${API_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new ApiError(payload?.error?.message || `Request failed with status ${response.status}`, payload?.error?.code || 'HTTP_ERROR');
  }

  let failure = null;

  await readEventStream(response, (event, data) => {
    if (event === 'open') onOpen?.(data);
    if (event === 'delta') onDelta?.(data.text);
    if (event === 'done') onDone?.(data);
    if (event === 'error') failure = new ApiError(data.message, data.code);
  });

  if (failure) throw failure;
};
