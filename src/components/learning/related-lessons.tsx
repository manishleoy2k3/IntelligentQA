import React from 'react';
import Link from 'next/link';
import { BookOpen, Clock, ArrowRight, Sparkles } from 'lucide-react';

export interface RelatedLessonItem {
  id: string;
  slug: string;
  title: string;
  moduleTitle: string;
  estimatedReadTime?: number;
}

interface RelatedLessonsProps {
  lessons: RelatedLessonItem[];
  onSelectLesson?: (slug: string) => void;
}

export default function RelatedLessons({ lessons, onSelectLesson }: RelatedLessonsProps) {
  if (!lessons || lessons.length === 0) return null;

  return (
    <section
      aria-label="Related Lessons"
      className="my-8 pt-6 border-t border-slate-200 dark:border-neutral-800 no-print"
    >
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-4 h-4 text-emerald-500" />
        <h3 className="text-sm font-bold text-slate-900 dark:text-neutral-100 uppercase tracking-wider">
          Recommended Related Lessons
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {lessons.map((item) => (
          <Link
            key={item.id}
            href={`/learning/${item.slug}`}
            onClick={() => onSelectLesson?.(item.slug)}
            className="group flex flex-col justify-between p-3.5 rounded-xl border border-slate-200 dark:border-neutral-800 bg-slate-50/60 dark:bg-neutral-900/40 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 hover:bg-white dark:hover:bg-neutral-900 transition-all shadow-2xs"
          >
            <div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-neutral-400 font-medium mb-1">
                <BookOpen className="w-3 h-3 text-emerald-500 shrink-0" />
                <span className="truncate">{item.moduleTitle}</span>
              </div>
              <h4 className="text-xs font-semibold text-slate-800 dark:text-neutral-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
                {item.title}
              </h4>
            </div>

            <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-200/60 dark:border-neutral-800/60 text-[11px] text-slate-500 dark:text-neutral-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>{item.estimatedReadTime || 5} min read</span>
              </span>
              <span className="flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 font-medium group-hover:translate-x-0.5 transition-transform">
                Read <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
