import { useState } from 'react';
import { parseBlocks, parseInline } from '@/lib/markdown';
import { CheckIcon, CopyIcon } from '@/components/icons';

const linkIsSafe = href => /^(https?:|mailto:)/i.test(href);

function Inline({ text }) {
  return parseInline(text).map((token, index) => {
    if (token.type === 'code')
      return (
        <code
          key={index}
          className='rounded bg-slate-200/80 px-1.5 py-0.5 font-mono text-[0.85em] text-slate-800 dark:bg-slate-700/60 dark:text-slate-100'>
          {token.value}
        </code>
      );
    if (token.type === 'strong')
      return (
        <strong
          key={index}
          className='font-semibold'>
          {token.value}
        </strong>
      );
    if (token.type === 'em') return <em key={index}>{token.value}</em>;
    if (token.type === 'strike')
      return (
        <s
          key={index}
          className='opacity-70'>
          {token.value}
        </s>
      );
    if (token.type === 'link')
      return linkIsSafe(token.href) ? (
        <a
          key={index}
          href={token.href}
          target='_blank'
          rel='noreferrer noopener'
          className='font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700 dark:text-brand-300'>
          {token.value}
        </a>
      ) : (
        <span key={index}>{token.value}</span>
      );
    return <span key={index}>{token.value}</span>;
  });
}

function CodeBlock({ language, code }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className='group relative my-3 overflow-hidden rounded-xl border border-slate-300 bg-slate-900 dark:border-slate-700'>
      <div className='flex items-center justify-between border-b border-slate-700/60 bg-slate-800/80 px-3 py-1.5'>
        <span className='font-mono text-[11px] uppercase tracking-wide text-slate-400'>{language || 'code'}</span>
        <button
          type='button'
          onClick={copy}
          className='flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] text-slate-300 transition hover:bg-slate-700 hover:text-white'
          aria-label='Copy code'>
          {copied ? <CheckIcon className='size-3.5' /> : <CopyIcon className='size-3.5' />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className='scrollbar-thin overflow-x-auto p-3 text-[13px] leading-relaxed'>
        <code className='font-mono text-slate-100'>{code}</code>
      </pre>
    </div>
  );
}

function Block({ block }) {
  if (block.type === 'code')
    return (
      <CodeBlock
        language={block.language}
        code={block.code}
      />
    );

  if (block.type === 'heading') {
    const sizes = { 1: 'text-xl', 2: 'text-lg', 3: 'text-base', 4: 'text-base', 5: 'text-sm', 6: 'text-sm' };
    const Tag = `h${block.level}`;
    return (
      <Tag className={`mt-4 mb-2 font-semibold first:mt-0 ${sizes[block.level]}`}>
        <Inline text={block.text} />
      </Tag>
    );
  }

  if (block.type === 'list') {
    const ListTag = block.ordered ? 'ol' : 'ul';
    return (
      <ListTag className={`my-2 space-y-1 pl-5 ${block.ordered ? 'list-decimal' : 'list-disc'}`}>
        {block.items.map((item, index) => (
          <li key={index}>
            <Inline text={item} />
          </li>
        ))}
      </ListTag>
    );
  }

  if (block.type === 'quote')
    return (
      <blockquote className='my-2 border-l-4 border-brand-300 pl-3 text-slate-600 italic dark:border-slate-600 dark:text-slate-300'>
        <Inline text={block.text} />
      </blockquote>
    );

  if (block.type === 'rule') return <hr className='my-4 border-slate-300 dark:border-slate-700' />;

  return (
    <p className='my-2 whitespace-pre-wrap first:mt-0 last:mb-0'>
      <Inline text={block.text} />
    </p>
  );
}

export default function Markdown({ content }) {
  const blocks = parseBlocks(content);

  return (
    <div className='text-[15px] leading-relaxed break-words'>
      {blocks.map((block, index) => (
        <Block
          key={index}
          block={block}
        />
      ))}
    </div>
  );
}
