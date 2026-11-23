import React from 'react';
import { Clock, Calendar, Tag, Bookmark, Printer } from 'lucide-react';

interface LessonHeaderProps {
  title: string;
  moduleTitle: string;
  courseTitle?: string;
  estimatedTime?: string;
  lastUpdated?: string;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
  tags?: string[];
  summary: string;
  isBookmarked?: boolean;
  onToggleBookmark?: () => void;
  onPrintLesson?: () => void;
}

export default function LessonHeader({
  title,
  moduleTitle,
  courseTitle,
  estimatedTime = '10 min read',
  lastUpdated,
  difficulty = 'Beginner',
  tags = [],
  summary,
  isBookmarked = false,
  onToggleBookmark,
  onPrintLesson,
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

  const formattedDate = lastUpdated
    ? new Date(lastUpdated).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'Nov 23, 2026';

  return (
    <header className="mb-8 pb-6 border-b border-slate-200 dark:border-neutral-800 lesson-header-container">
      {/* Top Badges & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex flex-wrap items-center gap-2">
          {courseTitle && (
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/80">
              {courseTitle}
            </span>
          )}
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
        </div>

        {/* Action Controls: Reading Time, Last Updated, Bookmark, Print */}
        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 no-print">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{estimatedTime}</span>
          </span>

          <span className="hidden sm:flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Updated {formattedDate}</span>
          </span>

          {onToggleBookmark && (
            <button
              onClick={onToggleBookmark}
              aria-label={isBookmarked ? 'Remove Bookmark' : 'Bookmark Lesson'}
              title={isBookmarked ? 'Remove from My Bookmarks' : 'Bookmark this lesson'}
              className={`p-1.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
                isBookmarked
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-500 hover:bg-amber-500/20'
                  : 'bg-slate-100 dark:bg-neutral-800 border-slate-200 dark:border-neutral-700 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-500' : ''}`} />
              <span className="text-[11px] font-medium hidden md:inline">
                {isBookmarked ? 'Bookmarked' : 'Bookmark'}
              </span>
            </button>
          )}

          {onPrintLesson && (
            <button
              onClick={onPrintLesson}
              aria-label="Print Lesson"
              title="Print or Save as PDF"
              className="p-1.5 rounded-lg border border-slate-200 dark:border-neutral-700 bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer flex items-center gap-1"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="text-[11px] font-medium hidden md:inline">Print</span>
            </button>
          )}
        </div>
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
