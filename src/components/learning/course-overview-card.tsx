import React from 'react';
import { Award, BookOpen, Clock, BarChart3, CheckCircle2, ChevronRight } from 'lucide-react';

interface CourseOverviewCardProps {
  courseTitle: string;
  subtitle?: string;
  description?: string;
  level?: string;
  estimatedHours?: number;
  totalModules: number;
  totalLessons: number;
  completedLessons?: number;
  percentCompleted?: number;
  className?: string;
}

export default function CourseOverviewCard({
  courseTitle,
  subtitle,
  description,
  level = 'All Levels',
  estimatedHours = 12,
  totalModules,
  totalLessons,
  completedLessons = 0,
  percentCompleted = 0,
  className = '',
}: CourseOverviewCardProps) {
  return (
    <div className={`p-5 rounded-2xl border border-slate-200 dark:border-neutral-800 bg-gradient-to-br from-slate-50 to-white dark:from-neutral-900/60 dark:to-neutral-900/20 shadow-xs mb-8 no-print ${className}`}>
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Course Overview
            </span>
            <span className="text-xs text-slate-500 dark:text-neutral-400 font-medium">
              • {level}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-neutral-100 tracking-tight">
            {courseTitle}
          </h2>

          {subtitle && (
            <p className="text-xs sm:text-sm font-medium text-emerald-600 dark:text-emerald-400 mt-1 mb-2">
              {subtitle}
            </p>
          )}

          {description && (
            <p className="text-xs sm:text-sm text-slate-600 dark:text-neutral-300 leading-relaxed max-w-2xl mt-2">
              {description}
            </p>
          )}
        </div>

        {/* Stats Column */}
        <div className="flex sm:grid sm:grid-cols-2 md:flex md:flex-col gap-2.5 sm:gap-4 shrink-0 bg-white dark:bg-neutral-900/80 p-3.5 rounded-xl border border-slate-200/80 dark:border-neutral-800 text-xs">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-500 shrink-0" />
            <div>
              <span className="font-bold text-slate-800 dark:text-neutral-200">{totalModules}</span>
              <span className="text-slate-500 dark:text-neutral-400 ml-1">Modules</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-500 shrink-0" />
            <div>
              <span className="font-bold text-slate-800 dark:text-neutral-200">{totalLessons}</span>
              <span className="text-slate-500 dark:text-neutral-400 ml-1">Lessons</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500 shrink-0" />
            <div>
              <span className="font-bold text-slate-800 dark:text-neutral-200">~{estimatedHours}h</span>
              <span className="text-slate-500 dark:text-neutral-400 ml-1">Total</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <div>
              <span className="font-bold text-slate-800 dark:text-neutral-200">{percentCompleted}%</span>
              <span className="text-slate-500 dark:text-neutral-400 ml-1">Done</span>
            </div>
          </div>
        </div>
      </div>

      {/* Course Overall Progress Bar */}
      <div className="mt-4 pt-3 border-t border-slate-200/70 dark:border-neutral-800/70">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-neutral-400 mb-1.5">
          <span>Overall Course Completion</span>
          <span className="font-mono font-bold text-slate-800 dark:text-neutral-200">
            {completedLessons} / {totalLessons} Lessons ({percentCompleted}%)
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-neutral-800 overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
            style={{ width: `${Math.min(100, Math.max(0, percentCompleted))}%` }}
          />
        </div>
      </div>
    </div>
  );
}
