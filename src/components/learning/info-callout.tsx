import React from 'react';
import { Info } from 'lucide-react';

interface InfoCalloutProps {
  title?: string;
  message: string;
  tip?: string;
}

export default function InfoCallout({ title = 'Important Note', message, tip }: InfoCalloutProps) {
  return (
    <div className="my-6 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/70 dark:bg-blue-950/20 p-4 text-slate-800 dark:text-blue-100 shadow-xs">
      <div className="flex items-start gap-3">
        <div className="p-1 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5">
          <Info className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-1">{title}</h4>
          <p className="text-sm leading-relaxed text-slate-700 dark:text-blue-200/90 font-normal">
            {message}
          </p>
          {tip && (
            <p className="mt-2 text-xs font-medium text-blue-800 dark:text-blue-300/80">💡 {tip}</p>
          )}
        </div>
      </div>
    </div>
  );
}
