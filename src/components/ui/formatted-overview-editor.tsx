'use client';

import React, { useState, useRef } from 'react';
import {
  Bold,
  Italic,
  Heading,
  List,
  ListOrdered,
  Code,
  Quote,
  Eye,
  Edit3,
  Sparkles,
} from 'lucide-react';
import FormattedInterviewAnswer from './formatted-interview-answer';

interface FormattedOverviewEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minRows?: number;
  className?: string;
  id?: string;
}

/**
 * Converts rich pasted HTML (e.g. copied from web pages, documentation, or Word)
 * into clean markdown format retaining bold text, bullet points, headers, and code.
 */
export function htmlToMarkdown(html: string): string {
  if (typeof window === 'undefined') return html;
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const walk = (node: Node): string => {
      if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent || '';
      }
      if (node.nodeType !== Node.ELEMENT_NODE) {
        return '';
      }
      const el = node as HTMLElement;
      const tag = el.tagName.toLowerCase();
      const childText = Array.from(el.childNodes).map(walk).join('');

      switch (tag) {
        case 'strong':
        case 'b':
          return childText.trim() ? `**${childText.trim()}**` : '';
        case 'em':
        case 'i':
          return childText.trim() ? `*${childText.trim()}*` : '';
        case 'h1':
        case 'h2':
          return `\n\n## ${childText.trim()}\n\n`;
        case 'h3':
        case 'h4':
        case 'h5':
        case 'h6':
          return `\n\n### ${childText.trim()}\n\n`;
        case 'li': {
          const parentTag = el.parentElement?.tagName.toLowerCase();
          if (parentTag === 'ol') {
            return `\n1. ${childText.trim()}`;
          }
          return `\n• ${childText.trim()}`;
        }
        case 'ul':
        case 'ol':
          return `\n${childText}\n`;
        case 'p':
        case 'div':
          return `\n${childText.trim()}\n`;
        case 'br':
          return '\n';
        case 'code': {
          if (el.parentElement?.tagName.toLowerCase() === 'pre') {
            return childText;
          }
          return `\`${childText.trim()}\``;
        }
        case 'pre':
          return `\n\`\`\`\n${childText.trim()}\n\`\`\`\n`;
        case 'blockquote':
          return `\n> ${childText.trim()}\n`;
        case 'a': {
          const href = el.getAttribute('href');
          return href ? `[${childText.trim()}](${href})` : childText;
        }
        default:
          return childText;
      }
    };

    const result = walk(doc.body);
    return result.replace(/\n{3,}/g, '\n\n').trim();
  } catch {
    return html;
  }
}

export default function FormattedOverviewEditor({
  value,
  onChange,
  placeholder = 'Write or paste in-depth explanation, tradeoffs, bullet points, and architectural concepts...',
  minRows = 5,
  className = '',
  id = 'overview-editor',
}: FormattedOverviewEditorProps) {
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Apply Markdown formatting to selection or cursor
  const applyFormat = (
    type: 'bold' | 'italic' | 'heading' | 'bullet' | 'number' | 'code' | 'quote'
  ) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);

    let replacement = '';
    let cursorOffset = 0;

    switch (type) {
      case 'bold':
        if (selectedText) {
          replacement = `**${selectedText}**`;
          cursorOffset = replacement.length;
        } else {
          replacement = `**bold text**`;
          cursorOffset = replacement.length - 2;
        }
        break;
      case 'italic':
        if (selectedText) {
          replacement = `*${selectedText}*`;
          cursorOffset = replacement.length;
        } else {
          replacement = `*italic text*`;
          cursorOffset = replacement.length - 1;
        }
        break;
      case 'heading': {
        const lineStart = value.lastIndexOf('\n', start - 1) + 1;
        const lineContent = value.substring(lineStart, end);
        replacement = `### ${lineContent.replace(/^#{1,4}\s*/, '')}`;
        const updated = value.substring(0, lineStart) + replacement + value.substring(end);
        onChange(updated);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = lineStart + replacement.length;
          textarea.focus();
        }, 0);
        return;
      }
      case 'bullet':
        if (selectedText) {
          replacement = selectedText
            .split('\n')
            .map((line) =>
              line.trim().startsWith('•') || line.trim().startsWith('-') ? line : `• ${line}`
            )
            .join('\n');
        } else {
          replacement = `\n• `;
        }
        cursorOffset = replacement.length;
        break;
      case 'number':
        if (selectedText) {
          replacement = selectedText
            .split('\n')
            .map((line, idx) => `\n${idx + 1}. ${line.replace(/^\d+[\.\)]\s*/, '')}`)
            .join('');
        } else {
          replacement = `\n1. `;
        }
        cursorOffset = replacement.length;
        break;
      case 'code':
        if (selectedText.includes('\n')) {
          replacement = `\n\`\`\`java\n${selectedText}\n\`\`\`\n`;
        } else if (selectedText) {
          replacement = `\`${selectedText}\``;
        } else {
          replacement = `\`code\``;
        }
        cursorOffset = replacement.length;
        break;
      case 'quote':
        replacement = `\n> ${selectedText || 'Important Note / Tradeoff'}\n`;
        cursorOffset = replacement.length;
        break;
    }

    const updated = value.substring(0, start) + replacement + value.substring(end);
    onChange(updated);

    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + cursorOffset;
      textarea.focus();
    }, 0);
  };

  // Keyboard shortcut handler
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
      e.preventDefault();
      applyFormat('bold');
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'i') {
      e.preventDefault();
      applyFormat('italic');
    }
  };

  // HTML Paste Interception to preserve formatting
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const html = e.clipboardData.getData('text/html');
    if (
      html &&
      (html.includes('<b>') ||
        html.includes('<strong>') ||
        html.includes('<li>') ||
        html.includes('<h') ||
        html.includes('<p>') ||
        html.includes('<code>'))
    ) {
      e.preventDefault();
      const markdown = htmlToMarkdown(html);
      const textarea = textareaRef.current;
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const updated = value.substring(0, start) + markdown + value.substring(end);
        onChange(updated);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + markdown.length;
          textarea.focus();
        }, 0);
      } else {
        onChange((value ? value + '\n\n' : '') + markdown);
      }
    }
  };

  return (
    <div
      className={`rounded-xl border border-[#2B2B2B] bg-[#0A0A0A] overflow-hidden focus-within:border-purple-400 transition shadow-inner ${className}`}
    >
      {/* TOOLBAR */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#222] bg-[#121212] flex-wrap gap-2">
        <div className="flex items-center gap-1 flex-wrap">
          <button
            type="button"
            onClick={() => applyFormat('bold')}
            className="p-1.5 rounded-md hover:bg-[#252525] text-zinc-300 hover:text-white transition cursor-pointer"
            title="Bold (**text**) - Ctrl+B"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => applyFormat('italic')}
            className="p-1.5 rounded-md hover:bg-[#252525] text-zinc-300 hover:text-white transition cursor-pointer"
            title="Italic (*text*) - Ctrl+I"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => applyFormat('heading')}
            className="p-1.5 rounded-md hover:bg-[#252525] text-zinc-300 hover:text-white transition cursor-pointer"
            title="Section Heading (### Heading)"
          >
            <Heading className="w-3.5 h-3.5" />
          </button>

          <div className="w-[1px] h-4 bg-zinc-700/60 mx-1" />

          <button
            type="button"
            onClick={() => applyFormat('bullet')}
            className="p-1.5 rounded-md hover:bg-[#252525] text-zinc-300 hover:text-white transition cursor-pointer flex items-center gap-1"
            title="Bullet Point List (• Point)"
          >
            <List className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[10px] text-zinc-400 hidden sm:inline">Bullet</span>
          </button>

          <button
            type="button"
            onClick={() => applyFormat('number')}
            className="p-1.5 rounded-md hover:bg-[#252525] text-zinc-300 hover:text-white transition cursor-pointer flex items-center gap-1"
            title="Numbered List (1. Point)"
          >
            <ListOrdered className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-[10px] text-zinc-400 hidden sm:inline">1. 2. 3.</span>
          </button>

          <button
            type="button"
            onClick={() => applyFormat('code')}
            className="p-1.5 rounded-md hover:bg-[#252525] text-zinc-300 hover:text-white transition cursor-pointer"
            title="Code Snippet / Backticks"
          >
            <Code className="w-3.5 h-3.5 text-amber-400" />
          </button>

          <button
            type="button"
            onClick={() => applyFormat('quote')}
            className="p-1.5 rounded-md hover:bg-[#252525] text-zinc-300 hover:text-white transition cursor-pointer"
            title="Quote / Architecture Note (> text)"
          >
            <Quote className="w-3.5 h-3.5 text-purple-400" />
          </button>
        </div>

        {/* WRITE vs PREVIEW TAB SWITCHER */}
        <div className="flex items-center gap-1 bg-[#1A1A1A] p-0.5 rounded-lg border border-[#333]">
          <button
            type="button"
            onClick={() => setActiveTab('write')}
            className={`px-2.5 py-1 text-[11px] font-semibold rounded-md flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'write'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Edit3 className="w-3 h-3" />
            <span>Write</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`px-2.5 py-1 text-[11px] font-semibold rounded-md flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'preview'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Eye className="w-3 h-3" />
            <span>Preview</span>
          </button>
        </div>
      </div>

      {/* EDITOR CONTENT AREA */}
      {activeTab === 'write' ? (
        <textarea
          ref={textareaRef}
          id={id}
          rows={minRows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder={placeholder}
          className="w-full px-3.5 py-3 bg-[#0F0F0F] text-xs text-white placeholder-zinc-500 focus:outline-none resize-y leading-relaxed font-sans"
        />
      ) : (
        <div className="p-4 bg-[#0D0D0D] min-h-[140px] max-h-[320px] overflow-y-auto text-xs text-zinc-200 border-t border-[#1C1C1C]">
          {value.trim() ? (
            <FormattedInterviewAnswer text={value} isDark />
          ) : (
            <div className="text-zinc-500 italic py-6 text-center">
              No overview content yet. Switch to Write to type or paste formatted text.
            </div>
          )}
        </div>
      )}

      {/* FOOTER HINT */}
      <div className="px-3 py-1.5 bg-[#0C0C0C] border-t border-[#1C1C1C] flex items-center justify-between text-[10px] text-zinc-500">
        <span className="flex items-center gap-2">
          <span>
            Paste retains <strong className="text-zinc-400 font-semibold">• Bullets</strong>,{' '}
            <strong className="text-zinc-400 font-semibold">**Bold**</strong>, and headings
          </span>
        </span>
        <span className="font-mono text-zinc-400">
          {value.length} chars · {value.split('\n').filter(Boolean).length} lines
        </span>
      </div>
    </div>
  );
}
