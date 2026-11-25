import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface WarningCalloutProps {
  title?: string;
  message: string;
  tip?: string;
}

export default function WarningCallout({
  title = 'Warning / Critical Note',
  message,
  tip,
}: WarningCalloutProps) {
  return (
    <div className="my-6 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/80 dark:bg-amber-950/25 p-4 text-slate-800 dark:text-amber-100 shadow-xs">
      <div className="flex items-start gap-3">
        <div className="p-1 rounded-lg bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5">
          <AlertTriangle className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-300 mb-1">{title}</h4>
          <p className="text-sm leading-relaxed text-slate-800 dark:text-amber-200/90 font-normal">
            {message}
          </p>
          {tip && (
            <p className="mt-2 text-xs font-semibold text-amber-900 dark:text-amber-300/90">
              ⚠️ Recommendation: {tip}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
