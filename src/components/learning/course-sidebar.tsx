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
  modules?: any[];
  courseTitle?: string;
  completedLessonIds?: Set<string>;
}

export default function CourseSidebar({
  activeLessonSlug,
  onSelectLesson,
  className = '',
  modules,
  courseTitle,
  completedLessonIds = new Set(),
}: CourseSidebarProps) {
  const [filterQuery, setFilterQuery] = useState('');

  // Expand modules. By default, keep all modules expanded
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    const sourceModules = modules && modules.length > 0 ? modules : ACADEMY_MODULES;
    sourceModules.forEach((mod: any) => {
      initial[mod.id || mod.slug] = true;
    });
    return initial;
  });

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };

  const expandAll = () => {
    const all: Record<string, boolean> = {};
    filteredModules.forEach((m: any) => {
      all[m.id] = true;
    });
    setExpandedModules(all);
  };

  const collapseAll = () => {
    const none: Record<string, boolean> = {};
    filteredModules.forEach((m: any) => {
      none[m.id] = false;
    });
    setExpandedModules(none);
  };

  // Filter modules/lessons based on search query inside sidebar
  const filteredModules = useMemo(() => {
    const sourceModules = modules && modules.length > 0 ? modules : ACADEMY_MODULES;
    const normalized = sourceModules.map((mod: any) => ({
      id: mod.id || mod.slug,
      title: mod.title,
      description: mod.description || '',
      lessons: (mod.lessons || [])
        .filter((l: any) => (l.status ? l.status === 'published' : !l.disabled))
        .map((l: any) => ({
          id: l.id || l.slug,
          slug: l.slug || l.id,
          title: l.title,
          tags: l.tags || [],
        })),
    }));

    if (!filterQuery.trim()) return normalized;

    const q = filterQuery.toLowerCase();
    return normalized
      .map((mod: any) => {
        const matchingLessons = mod.lessons.filter(
          (l: any) =>
            l.title.toLowerCase().includes(q) ||
            (l.tags && l.tags.some((t: string) => t.toLowerCase().includes(q)))
        );
        const modMatches = mod.title.toLowerCase().includes(q);
        return {
          ...mod,
          lessons: modMatches ? mod.lessons : matchingLessons,
        };
      })
      .filter((mod: any) => mod.lessons.length > 0);
  }, [filterQuery, modules]);

  return (
    <aside
      className={`w-72 lg:w-80 shrink-0 border-r border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/90 flex flex-col h-[calc(100vh-64px)] sticky top-16 ${className}`}
    >
      {/* Optional Course Title */}
      {courseTitle && (
        <div className="px-4 py-3 border-b border-slate-200 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/50">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-neutral-200 truncate">
            <BookOpen className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className="truncate">{courseTitle}</span>
          </div>
        </div>
      )}

      {/* Sidebar Filter Input & Accordion Controls */}
      <div className="p-3 border-b border-slate-200 dark:border-neutral-800 space-y-2">
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
        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-neutral-400 px-1">
          <span>Module Navigation</span>
          <div className="flex items-center gap-2">
            <button
              onClick={expandAll}
              className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
            >
              Expand All
            </button>
            <span>•</span>
            <button
              onClick={collapseAll}
              className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
            >
              Collapse All
            </button>
          </div>
        </div>
      </div>

      {/* Module & Lesson Accordion Tree */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {filteredModules.map((mod: any) => {
          const isExpanded = expandedModules[mod.id] ?? true;
          const containsActiveLesson = mod.lessons.some((l: any) => l.slug === activeLessonSlug);
          const totalInMod = mod.lessons.length;
          const completedInMod = mod.lessons.filter(
            (l: any) => completedLessonIds.has(l.id) || completedLessonIds.has(l.slug)
          ).length;
          const modPercent = totalInMod > 0 ? Math.round((completedInMod / totalInMod) * 100) : 0;

          return (
            <div key={mod.id} className="space-y-1">
              {/* Module Header / Accordion Button */}
              <button
                onClick={() => toggleModule(mod.id)}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left text-xs font-bold tracking-wide uppercase transition-colors cursor-pointer ${
                  containsActiveLesson
                    ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50/60 dark:bg-emerald-950/20'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-neutral-800'
                }`}
              >
                <div className="flex items-center gap-2 truncate flex-1 min-w-0">
                  <FolderOpen className="w-3.5 h-3.5 shrink-0 text-slate-400 dark:text-neutral-500" />
                  <span className="truncate">{mod.title}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400 dark:text-neutral-500 shrink-0 ml-2">
                  {completedInMod > 0 && (
                    <span className="text-[10px] font-mono px-1 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 lowercase">
                      {modPercent}%
                    </span>
                  )}
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
                  {mod.lessons.map((lesson: any) => {
                    const isActive = lesson.slug === activeLessonSlug;
                    const isLessonDone =
                      completedLessonIds.has(lesson.id) || completedLessonIds.has(lesson.slug);

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
                        {isLessonDone ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        ) : isActive ? (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                        ) : null}
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
