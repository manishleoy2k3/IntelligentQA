import React from 'react';
import { Clock, GraduationCap, Tag } from 'lucide-react';

interface LessonHeaderProps {
  title: string;
  moduleTitle: string;
  estimatedTime?: string;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  tags?: string[];
  summary: string;
}

export default function LessonHeader({
  title,
  moduleTitle,
  estimatedTime = '10 min read',
  difficulty = 'Beginner',
  tags = [],
  summary,
}: LessonHeaderProps) {
  const getDifficultyBadge = (diff: string) => {
    switch (diff) {
      case 'Advanced':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'Intermediate':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      default:
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
    }
  };

  return (
    <header className="mb-8 pb-6 border-b border-slate-200 dark:border-neutral-800">
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 dark:bg-neutral-800 dark:text-slate-300 border border-slate-200 dark:border-neutral-700">
          {moduleTitle}
        </span>
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${getDifficultyBadge(
            difficulty
          )}`}
        >
          {difficulty}
        </span>
        <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 ml-auto">
          <Clock className="w-3.5 h-3.5" />
          {estimatedTime}
        </span>
      </div>

      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
        {title}
      </h1>

      <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal mb-4">
        {summary}
      </p>

      {tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <Tag className="w-3.5 h-3.5 text-slate-400 dark:text-neutral-500 mr-1" />
          {tags.map((tag, idx) => (
            <span
              key={idx}
              className="text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-neutral-800/80 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-neutral-700"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </header>
  );
}
