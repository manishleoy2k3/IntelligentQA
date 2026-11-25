'use client';

import React from 'react';
import Link from 'next/link';
import { Search, Sun, Moon, Menu, X, Sparkles, User, GraduationCap } from 'lucide-react';
import { QADatabase } from '@/lib/qa-db';

interface AcademyHeaderProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onOpenSearch: () => void;
  mobileSidebarOpen: boolean;
  onToggleMobileSidebar: () => void;
}

export default function AcademyHeader({
  theme,
  onToggleTheme,
  onOpenSearch,
  mobileSidebarOpen,
  onToggleMobileSidebar,
}: AcademyHeaderProps) {
  const currentUser = typeof window !== 'undefined' ? QADatabase.getCurrentUser() : null;

  return (
    <header className="sticky top-0 z-40 w-full h-16 border-b border-slate-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md transition-colors">
      <div className="flex items-center justify-between h-full px-4 sm:px-6">
        {/* Left Section: Mobile Menu + Website Logo & Title */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={onToggleMobileSidebar}
            aria-label="Toggle mobile menu"
            className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
          >
            {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Website Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-sm shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-slate-900 dark:text-white text-base tracking-tight leading-none">
                Intelligent<span className="text-emerald-600 dark:text-emerald-400">QA</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400 mt-0.5">
                Community Platform
              </span>
            </div>
          </Link>

          {/* Academy Divider & Title */}
          <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-200 dark:border-neutral-700">
            <GraduationCap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Learning Academy
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              Technical Docs
            </span>
          </div>
        </div>

        {/* Center: Search Trigger Button */}
        <div className="flex-1 max-w-md mx-4 hidden md:block">
          <button
            onClick={onOpenSearch}
            className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800/80 hover:bg-slate-100 dark:hover:bg-neutral-800 text-slate-500 dark:text-slate-400 text-xs transition-colors shadow-2xs"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-slate-400 dark:text-neutral-500" />
              <span>Search lessons, topics, concepts...</span>
            </div>
            <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 text-slate-400">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right Section: Mobile Search + Theme Toggle + User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile Search Icon Button */}
          <button
            onClick={onOpenSearch}
            aria-label="Open search dialog"
            className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Theme Toggle (White / Light theme default, dark mode toggle) */}
          <button
            onClick={onToggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            className="p-2 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-700 transition-all shadow-2xs"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {/* User Profile */}
          {currentUser ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-neutral-700">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                {(currentUser.displayName || currentUser.email || 'QA').slice(0, 2).toUpperCase()}
              </div>
              <span className="hidden xl:block text-xs font-semibold text-slate-800 dark:text-slate-200 max-w-[120px] truncate">
                {currentUser.displayName || currentUser.email || 'Learner'}
              </span>
            </div>
          ) : (
            <Link
              href="/login"
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 font-semibold text-xs transition-colors shadow-xs"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
