import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
}

interface LessonBreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function LessonBreadcrumb({ items, className = '' }: LessonBreadcrumbProps) {
  // Filter out any duplicate "Academy" at the start since we already render Home > Academy
  const displayItems = items.filter((item, idx) => {
    if (idx === 0 && (item.label?.toLowerCase() === 'academy' || item.href === '/learning')) {
      return false;
    }
    return true;
  });

  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center text-xs text-slate-500 dark:text-slate-400 overflow-x-auto py-1 scrollbar-none ${className}`}
    >
      <Link
        href="/learning"
        className="flex items-center gap-1 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors shrink-0 font-medium"
      >
        <Home className="w-3.5 h-3.5" />
        <span>Academy</span>
      </Link>

      {displayItems.map((item, idx) => (
        <React.Fragment key={idx}>
          <ChevronRight className="w-3.5 h-3.5 mx-1.5 text-slate-400 dark:text-neutral-600 shrink-0" />
          {item.active ? (
            <span className="font-semibold text-slate-900 dark:text-slate-200 truncate shrink-0 max-w-[200px] sm:max-w-[280px]">
              {item.label}
            </span>
          ) : item.href ? (
            <Link
              href={item.href}
              className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors truncate shrink-0 max-w-[150px] sm:max-w-[220px]"
            >
              {item.label}
            </Link>
          ) : (
            <span className="truncate shrink-0 max-w-[150px] sm:max-w-[220px]">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
