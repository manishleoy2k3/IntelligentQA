import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
}

interface LessonBreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function LessonBreadcrumb({ items }: LessonBreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center text-xs text-slate-500 dark:text-slate-400 mb-4 overflow-x-auto py-1">
      <Link
        href="/learning"
        className="flex items-center gap-1 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors shrink-0"
      >
        <Home className="w-3.5 h-3.5" />
        <span>Academy</span>
      </Link>

      {items.map((item, idx) => (
        <React.Fragment key={idx}>
          <ChevronRight className="w-3.5 h-3.5 mx-1.5 text-slate-400 dark:text-neutral-600 shrink-0" />
          {item.active ? (
            <span className="font-semibold text-slate-900 dark:text-slate-200 truncate shrink-0">
              {item.label}
            </span>
          ) : item.href ? (
            <Link
              href={item.href}
              className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors truncate shrink-0"
            >
              {item.label}
            </Link>
          ) : (
            <span className="truncate shrink-0">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
