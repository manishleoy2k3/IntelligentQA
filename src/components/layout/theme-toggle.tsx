'use client';

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useAppTheme } from '@/lib/theme';

interface ThemeToggleProps {
  showLabel?: boolean;
  className?: string;
}

export default function ThemeToggle({ showLabel = false, className = '' }: ThemeToggleProps) {
  const { theme, isDark, toggleTheme } = useAppTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`p-2 rounded-xl border transition-all flex items-center gap-2 cursor-pointer shadow-2xs ${
        isDark
          ? 'bg-zinc-800/80 hover:bg-zinc-700 border-zinc-700 text-amber-400 hover:text-amber-300'
          : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900 shadow-xs'
      } ${className}`}
      title={isDark ? 'Switch to Normal (Light) Theme' : 'Switch to Dark Theme'}
      aria-label="Toggle visual theme"
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-400 transition-transform hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 text-slate-600 transition-transform hover:-rotate-12" />
      )}
      {showLabel && (
        <span className="text-xs font-semibold">{isDark ? 'Dark Theme' : 'Normal Theme'}</span>
      )}
    </button>
  );
}
