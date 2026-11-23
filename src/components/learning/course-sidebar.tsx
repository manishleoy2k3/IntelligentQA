'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ChevronDown,
  ChevronRight,
  BookOpen,
  Search,
  FolderOpen,
  CheckCircle2,
} from 'lucide-react';
import { ACADEMY_MODULES, AcademyModuleData } from '@/data/learning/academy-curriculum';

interface CourseSidebarProps {
  activeLessonSlug: string;
  onSelectLesson?: (slug: string) => void;
  className?: string;
}

export default function CourseSidebar({
  activeLessonSlug,
  onSelectLesson,
  className = '',
}: CourseSidebarProps) {
  const [filterQuery, setFilterQuery] = useState('');

  // Expand modules. By default, keep the active lesson's parent module expanded, or all
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    ACADEMY_MODULES.forEach((mod) => {
      // expand all modules by default or expand the active one
      initial[mod.id] = true;
    });
    return initial;
  });

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };

  // Filter modules/lessons based on search query inside sidebar
  const filteredModules = useMemo(() => {
    if (!filterQuery.trim()) return ACADEMY_MODULES;

    const q = filterQuery.toLowerCase();
    return ACADEMY_MODULES.map((mod) => {
      const matchingLessons = mod.lessons.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.tags.some((t) => t.toLowerCase().includes(q))
      );
      const modMatches = mod.title.toLowerCase().includes(q);
      return {
        ...mod,
        lessons: modMatches ? mod.lessons : matchingLessons,
      };
    }).filter((mod) => mod.lessons.length > 0);
  }, [filterQuery]);

  return (
    <aside
      className={`w-72 lg:w-80 shrink-0 border-r border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/90 flex flex-col h-[calc(100vh-64px)] sticky top-16 ${className}`}
    >
      {/* Sidebar Filter Input */}
      <div className="p-3 border-b border-slate-200 dark:border-neutral-800">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Filter curriculum..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-neutral-500 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Module & Lesson Accordion Tree */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {filteredModules.map((mod: AcademyModuleData) => {
          const isExpanded = expandedModules[mod.id] ?? true;
          const containsActiveLesson = mod.lessons.some((l) => l.slug === activeLessonSlug);

          return (
            <div key={mod.id} className="space-y-1">
              {/* Module Header / Accordion Button */}
              <button
                onClick={() => toggleModule(mod.id)}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left text-xs font-bold tracking-wide uppercase transition-colors ${
                  containsActiveLesson
                    ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50/60 dark:bg-emerald-950/20'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-neutral-800'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <FolderOpen className="w-3.5 h-3.5 shrink-0 text-slate-400 dark:text-neutral-500" />
                  <span className="truncate">{mod.title}</span>
                </div>
                <div className="text-slate-400 dark:text-neutral-500 shrink-0">
                  {isExpanded ? (
                    <ChevronDown className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5" />
                  )}
                </div>
              </button>

              {/* Nested Lessons List */}
              {isExpanded && (
                <div className="pl-3.5 ml-2 border-l border-slate-200 dark:border-neutral-800 space-y-0.5 mt-1">
                  {mod.lessons.map((lesson) => {
                    const isActive = lesson.slug === activeLessonSlug;

                    return (
                      <Link
                        key={lesson.id}
                        href={`/learning/${lesson.slug}`}
                        onClick={() => onSelectLesson?.(lesson.slug)}
                        className={`group flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-normal transition-all ${
                          isActive
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold border-l-2 border-emerald-500 shadow-2xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-neutral-800/60'
                        }`}
                      >
                        <span className="truncate pr-2">{lesson.title}</span>
                        {isActive && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
