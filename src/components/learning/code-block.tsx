'use client';

import React, { useState } from 'react';
import { Check, Copy, Terminal } from 'lucide-react';

interface CodeBlockProps {
  language?: string;
  title?: string;
  code: string;
  filename?: string;
  explanation?: string;
  showLineNumbers?: boolean;
}

export default function CodeBlock({
  language = 'typescript',
  title,
  code,
  filename,
  explanation,
  showLineNumbers = true,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy code', e);
    }
  };

  const lines = (code || '').trim().split('\n');

  return (
    <div className="my-6 rounded-xl border border-slate-200 dark:border-neutral-800 bg-slate-900 text-slate-100 shadow-sm overflow-hidden font-mono text-[14px]">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950/80 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <Terminal className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-semibold text-slate-200">
            {filename || title || language.toUpperCase()}
          </span>
          {language && (
            <span className="px-1.5 py-0.5 rounded text-[11px] bg-slate-800 text-emerald-400 border border-slate-700">
              {language}
            </span>
          )}
        </div>

        <button
          onClick={handleCopy}
          aria-label="Copy code to clipboard"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Content */}
      <div className="overflow-x-auto p-4 text-[13.5px] leading-relaxed">
        <table className="w-full border-collapse">
          <tbody>
            {lines.map((line, idx) => (
              <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                {showLineNumbers && (
                  <td className="pr-4 select-none text-right text-slate-600 dark:text-neutral-600 w-8 text-xs align-top">
                    {idx + 1}
                  </td>
                )}
                <td className="whitespace-pre font-mono text-slate-100 pl-2">{line || ' '}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Optional Explanation Footer */}
      {explanation && (
        <div className="px-4 py-2 bg-slate-950 border-t border-slate-800/80 text-xs text-slate-400 font-sans">
          <strong className="text-emerald-400 font-medium">Note:</strong> {explanation}
        </div>
      )}
    </div>
  );
}
