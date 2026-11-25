'use client';

import React from 'react';
import { Check, X, ArrowLeft, ArrowRight, Sparkles, BookOpen } from 'lucide-react';

interface ContentComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalHtml: string;
  enhancedHtml: string;
  onAccept: (enhancedHtml: string) => void;
  onKeepOriginal: () => void;
  title?: string;
}

export default function ContentComparisonModal({
  isOpen,
  onClose,
  originalHtml,
  enhancedHtml,
  onAccept,
  onKeepOriginal,
  title = 'Compare Original vs AI Enhanced Content',
}: ContentComparisonModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md">
      <div className="bg-[#141417] border border-[#27272A] rounded-3xl w-full max-w-6xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#27272A] flex items-center justify-between bg-[#18181B]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <h2 className="text-base font-bold text-white">{title}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onKeepOriginal}
              className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Keep Original</span>
            </button>
            <button
              type="button"
              onClick={() => onAccept(enhancedHtml)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Accept AI Version</span>
            </button>
          </div>
        </div>

        {/* Side-by-Side Comparison Container */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#27272A] overflow-hidden">
          {/* Left Column: Original Content */}
          <div className="flex flex-col h-full overflow-hidden bg-[#09090B]">
            <div className="px-6 py-3 bg-[#121215] border-b border-[#27272A] flex items-center justify-between text-xs text-zinc-400 font-mono">
              <span className="font-bold text-amber-400 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                Original Content
              </span>
              <span className="text-[11px] text-zinc-500">Unchanged</span>
            </div>
            <div
              className="flex-1 p-6 overflow-y-auto prose prose-invert prose-sm max-w-none text-zinc-300 leading-relaxed font-sans"
              dangerouslySetInnerHTML={{
                __html:
                  originalHtml ||
                  '<p class="text-zinc-500 italic">No original content recorded.</p>',
              }}
            />
          </div>

          {/* Right Column: AI Enhanced Content */}
          <div className="flex flex-col h-full overflow-hidden bg-[#0F0F13]">
            <div className="px-6 py-3 bg-[#16161D] border-b border-[#27272A] flex items-center justify-between text-xs font-mono">
              <span className="font-bold text-purple-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                AI Enhanced Version
              </span>
              <span className="text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                New Additions &amp; Improvements
              </span>
            </div>
            <div
              className="flex-1 p-6 overflow-y-auto prose prose-invert prose-sm max-w-none text-zinc-200 leading-relaxed font-sans"
              dangerouslySetInnerHTML={{
                __html:
                  enhancedHtml || '<p class="text-zinc-500 italic">No AI content available.</p>',
              }}
            />
          </div>
        </div>

        {/* Footer Note */}
        <div className="px-6 py-3 bg-[#18181B] border-t border-[#27272A] flex items-center justify-between text-xs text-zinc-400">
          <span>
            Review improvements carefully. No changes will be applied unless you click &quot;Accept
            AI Version&quot;.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-white text-xs font-medium cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
