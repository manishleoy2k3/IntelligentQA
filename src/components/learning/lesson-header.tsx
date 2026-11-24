import React from 'react';
import { Clock, Calendar, Tag } from 'lucide-react';

interface LessonHeaderProps {
  title: string;
  moduleTitle?: string;
  courseTitle?: string;
  estimatedTime?: string;
  lastUpdated?: string;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels' | string;
  tags?: string[];
  summary?: string;
  className?: string;
}

export default function LessonHeader({
  title,
  estimatedTime = '10 min read',
  lastUpdated,
  difficulty = 'Beginner',
  tags = [],
  summary,
  className = '',
}: LessonHeaderProps) {
  const getDifficultyBadge = (diff: string) => {
    switch (diff) {
      case 'Advanced':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'Intermediate':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'Comprehensive':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      default:
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
    }
  };

  const formattedDate = lastUpdated
    ? new Date(lastUpdated).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null;

  return (
    <header className={`mb-6 pb-6 border-b border-slate-200 dark:border-neutral-800 lesson-header-container ${className}`}>
      {/* Lesson Title */}
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
        {title}
      </h1>

      {/* Streamlined Metadata Row */}
      <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 text-xs text-slate-500 dark:text-slate-400 mb-4">
        <span className="flex items-center gap-1 font-medium text-slate-600 dark:text-slate-300">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{estimatedTime}</span>
        </span>

        <span className="text-slate-300 dark:text-neutral-700">•</span>

        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${getDifficultyBadge(difficulty)}`}>
          {difficulty}
        </span>

        {formattedDate && (
          <>
            <span className="text-slate-300 dark:text-neutral-700 hidden sm:inline">•</span>
            <span className="hidden sm:flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Updated {formattedDate}</span>
            </span>
          </>
        )}
      </div>

      {/* Summary / Lead Paragraph */}
      {summary && (
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
          {summary}
        </p>
      )}

      {/* Tags (if present) */}
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-3">
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
