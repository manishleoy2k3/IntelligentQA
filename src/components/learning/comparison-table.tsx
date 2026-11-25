import React from 'react';

interface ComparisonTableProps {
  title?: string;
  headers: string[];
  rows: string[][];
}

export default function ComparisonTable({ title, headers, rows }: ComparisonTableProps) {
  return (
    <div className="my-6 overflow-hidden rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/40 shadow-xs">
      {title && (
        <div className="px-4 py-3 bg-slate-50 dark:bg-neutral-900 border-b border-slate-200 dark:border-neutral-800">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</h4>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-slate-100/80 dark:bg-neutral-800/60 border-b border-slate-200 dark:border-neutral-800">
              {headers.map((h, i) => (
                <th
                  key={i}
                  className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200 text-xs tracking-wider uppercase"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-neutral-800/60">
            {rows.map((row, rIdx) => (
              <tr
                key={rIdx}
                className="hover:bg-slate-50/80 dark:hover:bg-neutral-800/40 transition-colors"
              >
                {row.map((cell, cIdx) => (
                  <td
                    key={cIdx}
                    className={`px-4 py-3 text-sm leading-relaxed ${
                      cIdx === 0
                        ? 'font-medium text-slate-900 dark:text-slate-100'
                        : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
