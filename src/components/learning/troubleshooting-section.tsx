import React from 'react';
import { AlertCircle, CheckCircle2, Wrench } from 'lucide-react';
import { TroubleshootingItem } from '@/data/learning/academy-curriculum';

interface TroubleshootingSectionProps {
  items: TroubleshootingItem[];
}

export default function TroubleshootingSection({ items }: TroubleshootingSectionProps) {
  if (!items || items.length === 0) return null;

  return (
    <div className="my-8 rounded-xl border border-red-200 dark:border-red-950/60 bg-red-50/40 dark:bg-red-950/15 p-5 shadow-xs">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-red-200/80 dark:border-red-900/40">
        <div className="p-1.5 rounded-lg bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400">
          <Wrench className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-red-900 dark:text-red-300">
            Common Errors & Troubleshooting
          </h4>
          <p className="text-xs text-red-700/80 dark:text-red-300/70">
            Known production pitfalls, failure signatures, and verified resolutions.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="rounded-lg border border-red-200 dark:border-red-900/50 bg-white dark:bg-neutral-900 p-4 shadow-2xs"
          >
            {/* Error Signature */}
            <div className="flex items-start gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <span className="text-sm font-semibold text-red-900 dark:text-red-300 font-mono">
                {item.error}
              </span>
            </div>

            {/* Root Cause */}
            <div className="text-xs text-slate-600 dark:text-slate-400 pl-6 mb-2">
              <span className="font-semibold text-slate-800 dark:text-slate-200">Root Cause:</span>{' '}
              {item.cause}
            </div>

            {/* Resolution */}
            <div className="flex items-start gap-2 pl-6 text-xs text-emerald-800 dark:text-emerald-300 mt-2 bg-emerald-50/70 dark:bg-emerald-950/30 p-2.5 rounded-md border border-emerald-200/70 dark:border-emerald-900/40">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-emerald-900 dark:text-emerald-200">
                  Recommended Solution:
                </span>{' '}
                {item.solution}
                {item.codeFix && (
                  <pre className="mt-2 p-2 rounded bg-slate-900 text-slate-100 font-mono text-[11px] overflow-x-auto border border-slate-800">
                    <code>{item.codeFix}</code>
                  </pre>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
