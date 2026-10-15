// Parses a text/event-stream body coming from fetch(). EventSource cannot be used because
// the chat endpoint is a POST that carries the whole conversation in its body.
export const readEventStream = async (response, onEvent) => {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  const flush = chunk => {
    const lines = chunk.split('\n');
    let event = 'message';
    const dataLines = [];

    for (const line of lines) {
      if (line.startsWith(':')) continue;
      if (line.startsWith('event:')) event = line.slice(6).trim();
      else if (line.startsWith('data:')) dataLines.push(line.slice(5).trim());
    }

    if (!dataLines.length) return;

    const raw = dataLines.join('\n');
    try {
      onEvent(event, JSON.parse(raw));
    } catch {
      onEvent(event, raw);
    }
  };

  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    let separator = buffer.indexOf('\n\n');
    while (separator !== -1) {
      flush(buffer.slice(0, separator));
      buffer = buffer.slice(separator + 2);
      separator = buffer.indexOf('\n\n');
    }
  }

  if (buffer.trim()) flush(buffer);
};
