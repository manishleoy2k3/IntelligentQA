'use client';

import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface FormattedInterviewAnswerProps {
  text: string;
  className?: string;
  isDark?: boolean;
}

export default function FormattedInterviewAnswer({
  text,
  className = '',
  isDark = false,
}: FormattedInterviewAnswerProps) {
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  if (!text) return null;

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSnippet(code);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  // Helper to parse inline markdown (bold, code, links)
  const renderInlineFormatted = (line: string, keyPrefix: string) => {
    // Split by code blocks first `code`
    const parts = line.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);

    return parts.map((part, idx) => {
      if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
        return (
          <code
            key={`${keyPrefix}-code-${idx}`}
            className="px-1.5 py-0.5 mx-0.5 rounded text-xs font-mono bg-slate-800/80 text-amber-300 border border-slate-700/50"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
        return (
          <strong key={`${keyPrefix}-bold-${idx}`} className="font-bold text-white dark:text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return <React.Fragment key={`${keyPrefix}-txt-${idx}`}>{part}</React.Fragment>;
    });
  };

  // Split content by code fences ```
  const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
  const blocks: Array<{ type: 'text' | 'code'; content: string; language?: string }> = [];

  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      blocks.push({
        type: 'text',
        content: text.substring(lastIndex, match.index),
      });
    }
    blocks.push({
      type: 'code',
      language: match[1] || 'text',
      content: match[2].trim(),
    });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    blocks.push({
      type: 'text',
      content: text.substring(lastIndex),
    });
  }

  return (
    <div className={`space-y-3 leading-relaxed break-words text-sm sm:text-base ${className}`}>
      {blocks.map((block, bIdx) => {
        if (block.type === 'code') {
          return (
            <div
              key={`code-${bIdx}`}
              className="relative p-3.5 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs sm:text-sm overflow-x-auto text-emerald-300 shadow-inner my-2"
            >
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/80 text-xs text-slate-400">
                <span className="font-semibold uppercase tracking-wider">
                  {block.language || 'code'}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(block.content)}
                  className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title="Copy Code"
                >
                  {copiedSnippet === block.content ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="whitespace-pre-wrap font-mono leading-relaxed">{block.content}</pre>
            </div>
          );
        }

        // Render formatted text preserving paragraphs, bullets, and linebreaks
        const lines = block.content.split('\n');

        return (
          <div key={`txt-${bIdx}`} className="space-y-1.5 whitespace-pre-wrap">
            {lines.map((line, lIdx) => {
              const trimmed = line.trim();

              // Heading line: # , ## , ###
              const headingMatch = line.match(/^(\s*#{1,4})\s+(.*)$/);
              if (headingMatch) {
                return (
                  <h4
                    key={`line-${lIdx}`}
                    className="font-extrabold text-white text-sm sm:text-base pt-2.5 pb-1 border-b border-slate-800/60 flex items-center gap-2"
                  >
                    <span className="w-1.5 h-3.5 bg-purple-500 rounded-full inline-block shrink-0" />
                    <span>{renderInlineFormatted(headingMatch[2], `h-${lIdx}`)}</span>
                  </h4>
                );
              }

              // Quote line: >
              if (trimmed.startsWith('>')) {
                const quoteContent = line.replace(/^\s*>\s*/, '');
                return (
                  <div
                    key={`line-${lIdx}`}
                    className="pl-3 py-1 my-1 border-l-2 border-purple-500 bg-purple-950/20 text-purple-200 text-xs italic rounded-r"
                  >
                    {renderInlineFormatted(quoteContent, `q-${lIdx}`)}
                  </div>
                );
              }

              // Bullet line: • , - , *
              if (
                trimmed.startsWith('• ') ||
                trimmed.startsWith('- ') ||
                trimmed.startsWith('* ')
              ) {
                const bulletContent = line.replace(/^\s*[•\-\*]\s*/, '');
                return (
                  <div key={`line-${lIdx}`} className="flex items-start gap-2 pl-2">
                    <span className="text-emerald-500 font-bold shrink-0 mt-0.5">•</span>
                    <span className="flex-1">
                      {renderInlineFormatted(bulletContent, `b-${lIdx}`)}
                    </span>
                  </div>
                );
              }

              // Numbered list: 1. , 2. etc.
              const numMatch = line.match(/^(\s*\d+[\.\)])\s*(.*)$/);
              if (numMatch) {
                return (
                  <div key={`line-${lIdx}`} className="flex items-start gap-2 pl-2">
                    <span className="font-mono font-bold text-sky-400 shrink-0 text-xs mt-0.5">
                      {numMatch[1].trim()}
                    </span>
                    <span className="flex-1">
                      {renderInlineFormatted(numMatch[2], `n-${lIdx}`)}
                    </span>
                  </div>
                );
              }

              // Normal text line
              return (
                <div key={`line-${lIdx}`} className="min-h-[1.25rem]">
                  {renderInlineFormatted(line, `l-${lIdx}`)}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
