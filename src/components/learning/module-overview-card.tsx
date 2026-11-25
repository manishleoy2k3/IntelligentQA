import React from 'react';
import { Layers, CheckCircle2, BookOpen } from 'lucide-react';

interface ModuleOverviewCardProps {
  title: string;
  description?: string;
  totalLessons: number;
  completedLessons: number;
  percentCompleted: number;
  className?: string;
}

export default function ModuleOverviewCard({
  title,
  description,
  totalLessons,
  completedLessons,
  percentCompleted,
  className = '',
}: ModuleOverviewCardProps) {
  return (
    <div
      className={`p-4 rounded-xl border border-slate-200 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/40 mb-6 no-print ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
              Module Overview
            </span>
            <h3 className="text-sm font-bold text-slate-900 dark:text-neutral-100">{title}</h3>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-neutral-400 self-start sm:self-auto">
          <span className="flex items-center gap-1 font-medium">
            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
            <span>{totalLessons} Lessons</span>
          </span>
          <span className="flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{completedLessons} Completed</span>
          </span>
          <span className="font-mono font-bold text-slate-700 dark:text-neutral-300">
            {percentCompleted}%
          </span>
        </div>
      </div>

      {description && (
        <p className="text-xs text-slate-600 dark:text-neutral-400 leading-relaxed mb-3">
          {description}
        </p>
      )}

      {/* Progress Bar */}
      <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-neutral-800 overflow-hidden">
        <div
          className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
          style={{ width: `${Math.min(100, Math.max(0, percentCompleted))}%` }}
        />
      </div>
    </div>
  );
}
