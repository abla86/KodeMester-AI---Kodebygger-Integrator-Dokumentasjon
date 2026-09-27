import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { highlightCode } from '../utils/prismHelper';

interface MarkdownViewProps {
  content: string;
}

export const MarkdownView: React.FC<MarkdownViewProps> = ({ content }) => {
  if (!content) {
    return <p className="text-zinc-500 italic">Ingen tekst tilgjengelig.</p>;
  }

  // Split content into blocks (code blocks vs text blocks)
  const blocks: Array<{ type: 'code' | 'text'; content: string; lang?: string }> = [];
  const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      blocks.push({
        type: 'text',
        content: content.substring(lastIndex, match.index),
      });
    }
    blocks.push({
      type: 'code',
      lang: match[1] || 'bash',
      content: match[2].trim(),
    });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    blocks.push({
      type: 'text',
      content: content.substring(lastIndex),
    });
  }

  return (
    <div className="space-y-4 text-zinc-200 text-sm leading-relaxed">
      {blocks.map((block, idx) => {
        if (block.type === 'code') {
          return <CodeBlockItem key={idx} code={block.content} lang={block.lang || 'bash'} />;
        }
        return <TextBlockItem key={idx} text={block.content} />;
      })}
    </div>
  );
};

const CodeBlockItem: React.FC<{ code: string; lang: string }> = ({ code, lang }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const highlighted = highlightCode(code, lang);

  return (
    <div className="relative my-3 rounded-lg overflow-hidden border border-zinc-800 bg-zinc-950 font-mono text-xs shadow-md">
      <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-900 border-b border-zinc-800/80 text-zinc-400">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-400">{lang}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
          title="Kopier kode"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          <span>{copied ? 'Kopiert!' : 'Kopier'}</span>
        </button>
      </div>
      <div className="p-3 overflow-x-auto">
        <pre className="text-zinc-200">
          <code dangerouslySetInnerHTML={{ __html: highlighted }} />
        </pre>
      </div>
    </div>
  );
};

const TextBlockItem: React.FC<{ text: string }> = ({ text }) => {
  const lines = text.split('\n');

  return (
    <div className="space-y-2">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} className="h-1" />;

        // Header 1
        if (trimmed.startsWith('# ')) {
          return (
            <h1 key={i} className="text-xl font-bold text-white mt-4 mb-2 pb-1 border-b border-zinc-800 flex items-center gap-2">
              {formatInline(trimmed.replace(/^#\s+/, ''))}
            </h1>
          );
        }
        // Header 2
        if (trimmed.startsWith('## ')) {
          return (
            <h2 key={i} className="text-lg font-semibold text-zinc-100 mt-3 mb-1.5 flex items-center gap-2 text-indigo-300">
              {formatInline(trimmed.replace(/^##\s+/, ''))}
            </h2>
          );
        }
        // Header 3
        if (trimmed.startsWith('### ')) {
          return (
            <h3 key={i} className="text-base font-medium text-zinc-200 mt-2.5 mb-1">
              {formatInline(trimmed.replace(/^###\s+/, ''))}
            </h3>
          );
        }
        // Bullet point
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          return (
            <div key={i} className="flex items-start gap-2 pl-2">
              <span className="text-indigo-400 font-bold leading-5">•</span>
              <span className="text-zinc-300">{formatInline(trimmed.replace(/^[-*]\s+/, ''))}</span>
            </div>
          );
        }
        // Numbered list
        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (numMatch) {
          return (
            <div key={i} className="flex items-start gap-2 pl-2">
              <span className="text-indigo-400 font-semibold text-xs leading-5 min-w-[16px]">{numMatch[1]}.</span>
              <span className="text-zinc-300">{formatInline(numMatch[2])}</span>
            </div>
          );
        }
        // Blockquote
        if (trimmed.startsWith('> ')) {
          return (
            <blockquote key={i} className="border-l-4 border-indigo-500/60 bg-indigo-950/20 pl-3 py-1 text-zinc-300 italic rounded-r">
              {formatInline(trimmed.replace(/^>\s+/, ''))}
            </blockquote>
          );
        }

        // Paragraph
        return (
          <p key={i} className="text-zinc-300">
            {formatInline(line)}
          </p>
        );
      })}
    </div>
  );
};

function formatInline(str: string): React.ReactNode {
  // Format bold **text**, inline code `code`, and links
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*.*?\*\*|`.*?`)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(str)) !== null) {
    if (match.index > lastIndex) {
      parts.push(str.substring(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(
        <strong key={match.index} className="font-semibold text-white">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(
        <code
          key={match.index}
          className="px-1.5 py-0.5 rounded bg-zinc-800 text-indigo-300 font-mono text-[12px] border border-zinc-700/60"
        >
          {token.slice(1, -1)}
        </code>
      );
    }
    lastIndex = match.index + token.length;
  }

  if (lastIndex < str.length) {
    parts.push(str.substring(lastIndex));
  }

  return parts.length ? parts : str;
}
