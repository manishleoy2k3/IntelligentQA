'use client';

import React, { useEffect, useRef } from 'react';
import { CompletionItem, IntelliSenseKind } from '@/lib/intellisense';
import { Sparkles, Code2, Layers, Cpu, Box, FileText, CornerDownLeft } from 'lucide-react';

interface IntelliSenseOverlayProps {
  isOpen: boolean;
  suggestions: CompletionItem[];
  selectedIndex: number;
  matchedPrefix: string;
  position: { top: number; left: number };
  onSelect: (item: CompletionItem) => void;
  onHover: (index: number) => void;
  onClose: () => void;
  containerRef?: React.RefObject<HTMLDivElement | null>;
}

const KIND_CONFIG: Record<
  IntelliSenseKind,
  { label: string; bg: string; text: string; border: string }
> = {
  function: {
    label: 'fn',
    bg: 'bg-purple-500/15',
    text: 'text-purple-300',
    border: 'border-purple-500/30',
  },
  method: {
    label: 'm',
    bg: 'bg-indigo-500/15',
    text: 'text-indigo-300',
    border: 'border-indigo-500/30',
  },
  keyword: {
    label: 'kw',
    bg: 'bg-sky-500/15',
    text: 'text-sky-300',
    border: 'border-sky-500/30',
  },
  class: {
    label: 'cls',
    bg: 'bg-amber-500/15',
    text: 'text-amber-300',
    border: 'border-amber-500/30',
  },
  variable: {
    label: 'var',
    bg: 'bg-emerald-500/15',
    text: 'text-emerald-300',
    border: 'border-emerald-500/30',
  },
  snippet: {
    label: 'snip',
    bg: 'bg-rose-500/15',
    text: 'text-rose-300',
    border: 'border-rose-500/30',
  },
  property: {
    label: 'prop',
    bg: 'bg-cyan-500/15',
    text: 'text-cyan-300',
    border: 'border-cyan-500/30',
  },
};

export function IntelliSenseOverlay({
  isOpen,
  suggestions,
  selectedIndex,
  matchedPrefix,
  position,
  onSelect,
  onHover,
  onClose,
  containerRef,
}: IntelliSenseOverlayProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const selectedItemRef = useRef<HTMLDivElement>(null);

  // Scroll active item into view
  useEffect(() => {
    if (selectedItemRef.current && listRef.current) {
      selectedItemRef.current.scrollIntoView({
        block: 'nearest',
        inline: 'nearest',
      });
    }
  }, [selectedIndex]);

  if (!isOpen || suggestions.length === 0) return null;

  const currentItem = suggestions[selectedIndex] || suggestions[0];

  // Calculate clamped positioning within container if available
  let clampedTop = position.top;
  let clampedLeft = position.left;

  if (containerRef && containerRef.current) {
    const containerRect = containerRef.current.getBoundingClientRect();
    const popupWidth = 320;
    const popupHeight = 260;

    // Prevent overflowing to the right
    if (clampedLeft + popupWidth > containerRect.width - 20) {
      clampedLeft = Math.max(10, containerRect.width - popupWidth - 20);
    }

    // Prevent overflowing bottom: render above if needed
    if (clampedTop + popupHeight > containerRect.height - 20) {
      clampedTop = Math.max(10, clampedTop - popupHeight - 25);
    }
  }

  return (
    <div
      style={{
        top: `${clampedTop}px`,
        left: `${clampedLeft}px`,
      }}
      className="absolute z-50 flex items-start shadow-2xl animate-in fade-in duration-100 font-sans pointer-events-auto"
    >
      {/* Suggestions Dropdown Card */}
      <div className="w-72 sm:w-80 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-xl overflow-hidden shadow-2xl flex flex-col max-h-64">
        {/* Header Bar */}
        <div className="px-3 py-1.5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between text-[11px] text-slate-400 select-none">
          <div className="flex items-center gap-1.5 font-bold text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>IntelliSense</span>
          </div>
          <span className="font-mono text-[10px] text-slate-500">
            {selectedIndex + 1}/{suggestions.length}
          </span>
        </div>

        {/* Suggestion Items List */}
        <div
          ref={listRef}
          className="overflow-y-auto flex-1 divide-y divide-slate-800/40 p-1 font-mono text-xs"
        >
          {suggestions.map((item, idx) => {
            const isSelected = idx === selectedIndex;
            const kindConfig = KIND_CONFIG[item.kind] || KIND_CONFIG.keyword;

            // Highlight matched prefix
            const label = item.label;
            const lowerPrefix = matchedPrefix.toLowerCase();
            const lowerLabel = label.toLowerCase();
            const prefixIndex = lowerLabel.indexOf(lowerPrefix);

            return (
              <div
                key={`${item.label}-${idx}`}
                ref={isSelected ? selectedItemRef : undefined}
                onMouseDown={(e) => {
                  e.preventDefault(); // Prevent blurring textarea
                  onSelect(item);
                }}
                onMouseEnter={() => onHover(idx)}
                className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors text-xs ${
                  isSelected
                    ? 'bg-emerald-500/20 text-white font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2 truncate pr-2">
                  {/* Badge */}
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider border shrink-0 ${kindConfig.bg} ${kindConfig.text} ${kindConfig.border}`}
                  >
                    {kindConfig.label}
                  </span>

                  {/* Label with prefix highlight */}
                  <span className="truncate">
                    {prefixIndex >= 0 ? (
                      <>
                        {label.substring(0, prefixIndex)}
                        <span className="text-emerald-400 font-extrabold underline decoration-emerald-500/50">
                          {label.substring(prefixIndex, prefixIndex + matchedPrefix.length)}
                        </span>
                        {label.substring(prefixIndex + matchedPrefix.length)}
                      </>
                    ) : (
                      label
                    )}
                  </span>
                </div>

                {/* Detail or Type Signature */}
                {item.detail && (
                  <span className="text-[10px] text-slate-500 truncate shrink-0 max-w-[100px] font-sans">
                    {item.detail}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer shortcuts hint */}
        <div className="px-2.5 py-1 bg-slate-950/80 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 select-none">
          <span className="flex items-center gap-2">
            <span>↑↓ Navigate</span>
            <span>•</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-0.5">
              <CornerDownLeft className="w-2.5 h-2.5 inline" /> Tab/Enter
            </span>
          </span>
          <span>Esc Dismiss</span>
        </div>
      </div>

      {/* Side Documentation Flyout (shown when current item has documentation or detailed description) */}
      {currentItem && (currentItem.documentation || currentItem.detail) && (
        <div className="hidden md:flex flex-col ml-2 w-64 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-xl p-3 shadow-2xl text-xs max-h-64 overflow-y-auto font-sans">
          <div className="pb-2 border-b border-slate-800 mb-2">
            <div className="font-mono font-bold text-emerald-400 text-xs break-all">
              {currentItem.label}
            </div>
            {currentItem.detail && (
              <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                {currentItem.detail}
              </div>
            )}
          </div>

          {currentItem.documentation && (
            <div className="text-slate-300 text-xs leading-relaxed space-y-1">
              <p>{currentItem.documentation}</p>
            </div>
          )}

          <div className="mt-auto pt-2 text-[10px] text-slate-500 font-mono">
            Press <strong className="text-slate-300">Tab</strong> or{' '}
            <strong className="text-slate-300">Enter</strong> to insert.
          </div>
        </div>
      )}
    </div>
  );
}
