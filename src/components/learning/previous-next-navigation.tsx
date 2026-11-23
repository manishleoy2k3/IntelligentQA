import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, LayoutGrid } from 'lucide-react';

interface AdjacentLesson {
  slug: string;
  title: string;
  moduleTitle: string;
}

interface BackToCourse {
  title?: string;
  href?: string;
  slug?: string;
}

interface PreviousNextNavigationProps {
  previousLesson?: AdjacentLesson;
  nextLesson?: AdjacentLesson;
  backToCourse?: BackToCourse;
  onBackToCourse?: () => void;
}

export default function PreviousNextNavigation({
  previousLesson,
  nextLesson,
  backToCourse,
  onBackToCourse,
}: PreviousNextNavigationProps) {
  if (!previousLesson && !nextLesson && !backToCourse) return null;

  return (
    <nav
      aria-label="Previous and Next Lesson Navigation"
      className="mt-12 pt-8 border-t border-slate-200 dark:border-neutral-800 flex flex-col gap-4 no-print"
    >
      {/* Back to Course Action Bar */}
      <div className="flex items-center justify-between pb-2">
        {backToCourse?.href ? (
          <Link
            href={backToCourse.href}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-600 dark:text-neutral-400 dark:hover:text-emerald-400 transition-colors"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Back to {backToCourse.title || 'Course Overview'}</span>
          </Link>
        ) : onBackToCourse ? (
          <button
            onClick={onBackToCourse}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-600 dark:text-neutral-400 dark:hover:text-emerald-400 transition-colors cursor-pointer"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Back to {backToCourse?.title || 'Course Overview'}</span>
          </button>
        ) : (
          <Link
            href="/learning"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-600 dark:text-neutral-400 dark:hover:text-emerald-400 transition-colors"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Back to Course</span>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Previous Lesson Card */}
        {previousLesson ? (
          <Link
            href={`/learning/${previousLesson.slug}`}
            className="group flex flex-col p-4 rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 hover:border-emerald-500/60 dark:hover:border-emerald-500/60 hover:shadow-sm transition-all"
          >
            <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors mb-1">
              <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
              <span>Previous Lesson</span>
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">
              {previousLesson.moduleTitle}
            </span>
            <span className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
              {previousLesson.title}
            </span>
          </Link>
        ) : (
          <div className="hidden sm:block" />
        )}

        {/* Next Lesson Card */}
        {nextLesson && (
          <Link
            href={`/learning/${nextLesson.slug}`}
            className="group flex flex-col p-4 rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 hover:border-emerald-500/60 dark:hover:border-emerald-500/60 hover:shadow-sm transition-all text-right items-end sm:col-start-2"
          >
            <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors mb-1">
              <span>Next Lesson</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">
              {nextLesson.moduleTitle}
            </span>
            <span className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
              {nextLesson.title}
            </span>
          </Link>
        )}
      </div>
    </nav>
  );
}
