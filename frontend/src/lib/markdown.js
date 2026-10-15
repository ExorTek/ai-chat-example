// A deliberately small markdown subset: enough for chat answers (code, lists, emphasis,
// links, quotes, headings) without pulling a parser into the bundle.

const HEADING = /^(#{1,6})\s+(.*)$/;
const UNORDERED_ITEM = /^\s*[-*+]\s+(.*)$/;
const ORDERED_ITEM = /^\s*(\d+)[.)]\s+(.*)$/;
const QUOTE = /^>\s?(.*)$/;
const FENCE = /^```\s*([\w+-]*)\s*$/;
const RULE = /^(-{3,}|\*{3,}|_{3,})$/;

export const parseBlocks = source => {
  const lines = String(source || '').split('\n');
  const blocks = [];
  let index = 0;

  const peek = () => lines[index];

  while (index < lines.length) {
    const line = peek();

    if (!line.trim()) {
      index += 1;
      continue;
    }

    const fence = line.match(FENCE);
    if (fence) {
      index += 1;
      const code = [];
      // An unterminated fence is normal while a response is still streaming in.
      while (index < lines.length && !FENCE.test(lines[index])) {
        code.push(lines[index]);
        index += 1;
      }
      const closed = index < lines.length;
      if (closed) index += 1;
      blocks.push({ type: 'code', language: fence[1] || '', code: code.join('\n'), closed });
      continue;
    }

    if (RULE.test(line.trim())) {
      blocks.push({ type: 'rule' });
      index += 1;
      continue;
    }

    const heading = line.match(HEADING);
    if (heading) {
      blocks.push({ type: 'heading', level: heading[1].length, text: heading[2] });
      index += 1;
      continue;
    }

    if (QUOTE.test(line)) {
      const quoted = [];
      while (index < lines.length && QUOTE.test(lines[index])) {
        quoted.push(lines[index].match(QUOTE)[1]);
        index += 1;
      }
      blocks.push({ type: 'quote', text: quoted.join('\n') });
      continue;
    }

    if (UNORDERED_ITEM.test(line) || ORDERED_ITEM.test(line)) {
      const ordered = ORDERED_ITEM.test(line);
      const items = [];
      while (index < lines.length) {
        const match = ordered ? lines[index].match(ORDERED_ITEM) : lines[index].match(UNORDERED_ITEM);
        if (!match) break;
        items.push(ordered ? match[2] : match[1]);
        index += 1;
      }
      blocks.push({ type: 'list', ordered, items });
      continue;
    }

    const paragraph = [];
    while (
      index < lines.length &&
      lines[index].trim() &&
      !FENCE.test(lines[index]) &&
      !HEADING.test(lines[index]) &&
      !QUOTE.test(lines[index]) &&
      !UNORDERED_ITEM.test(lines[index]) &&
      !ORDERED_ITEM.test(lines[index])
    ) {
      paragraph.push(lines[index]);
      index += 1;
    }
    if (paragraph.length) blocks.push({ type: 'paragraph', text: paragraph.join('\n') });
  }

  return blocks;
};

const INLINE = /(`[^`\n]+`)|(\*\*[^*\n]+\*\*)|(\*[^*\n]+\*)|(__[^_\n]+__)|(_[^_\n]+_)|(~~[^~\n]+~~)|(\[[^\]\n]+\]\([^)\s]+\))/;

// Splits a line into inline tokens; the renderer turns them into elements.
export const parseInline = text => {
  const tokens = [];
  let rest = String(text || '');

  while (rest) {
    const match = rest.match(INLINE);
    if (!match) {
      tokens.push({ type: 'text', value: rest });
      break;
    }

    if (match.index > 0) tokens.push({ type: 'text', value: rest.slice(0, match.index) });

    const raw = match[0];
    if (raw.startsWith('`')) tokens.push({ type: 'code', value: raw.slice(1, -1) });
    else if (raw.startsWith('**') || raw.startsWith('__')) tokens.push({ type: 'strong', value: raw.slice(2, -2) });
    else if (raw.startsWith('~~')) tokens.push({ type: 'strike', value: raw.slice(2, -2) });
    else if (raw.startsWith('[')) {
      const separator = raw.indexOf('](');
      tokens.push({ type: 'link', value: raw.slice(1, separator), href: raw.slice(separator + 2, -1) });
    } else tokens.push({ type: 'em', value: raw.slice(1, -1) });

    rest = rest.slice(match.index + raw.length);
  }

  return tokens;
};
