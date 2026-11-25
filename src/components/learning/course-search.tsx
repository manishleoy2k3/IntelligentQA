'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, BookOpen, ChevronRight, FileText, Layers, Folder } from 'lucide-react';
import { getAllLessons, AcademyLessonData } from '@/data/learning/academy-curriculum';

interface CourseSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchItem {
  id: string;
  type: string;
  title: string;
  snippet?: string;
  lessonSlug: string;
  courseTitle: string;
  moduleTitle: string;
  matchedField?: 'title' | 'summary' | 'content' | 'module' | 'course';
}

export default function CourseSearch({ isOpen, onClose }: CourseSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(
          `/api/learning/search?q=${encodeURIComponent(query.trim())}&limit=12`
        );
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
            setResults(json.data);
            setIsSearching(false);
            return;
          }
        }
      } catch {
        // Fallback to client-side catalog search
      }

      // Client-side fallback search across static catalog
      const q = query.toLowerCase();
      const matched = getAllLessons()
        .filter((lesson) => {
          return (
            lesson.title.toLowerCase().includes(q) ||
            lesson.moduleTitle.toLowerCase().includes(q) ||
            lesson.summary.toLowerCase().includes(q) ||
            lesson.tags.some((t) => t.toLowerCase().includes(q))
          );
        })
        .map((l) => ({
          id: l.id,
          type: 'lesson',
          title: l.title,
          snippet: l.summary,
          lessonSlug: l.slug,
          courseTitle: 'AI Academy',
          moduleTitle: l.moduleTitle,
          matchedField: l.title.toLowerCase().includes(q)
            ? ('title' as const)
            : ('summary' as const),
        }));

      setResults(matched.slice(0, 10));
      setIsSearching(false);
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getBadgeStyle = (field?: string) => {
    switch (field) {
      case 'content':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300';
      case 'module':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300';
      case 'course':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300';
      default:
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300';
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search Lessons"
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-slate-200 dark:border-neutral-800 gap-3">
          <Search className="w-5 h-5 text-slate-400 dark:text-neutral-500 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search course titles, modules, lessons, or content..."
            className="flex-1 bg-transparent text-sm sm:text-base text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500 focus:outline-hidden"
          />
          {query ? (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <span className="text-[11px] font-mono px-1.5 py-0.5 rounded border border-slate-200 dark:border-neutral-700 text-slate-400">
              ESC
            </span>
          )}
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2">
          {isSearching ? (
            <div className="py-8 text-center text-sm text-slate-400">
              Searching courses, modules, and published content...
            </div>
          ) : query && results.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-500 dark:text-neutral-400">
              No matching lessons found for &ldquo;{query}&rdquo;
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-1">
              {results.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onClose();
                    router.push(`/learning/${item.lessonSlug}`);
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-neutral-800/80 transition-colors group cursor-pointer"
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                        <span className="truncate">{item.courseTitle}</span>
                        <span>•</span>
                        <span className="truncate">{item.moduleTitle}</span>
                        {item.matchedField && (
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded font-semibold uppercase ${getBadgeStyle(item.matchedField)}`}
                          >
                            {item.matchedField}
                          </span>
                        )}
                      </div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
                        {item.title}
                      </div>
                      {item.snippet && (
                        <p className="text-xs text-slate-500 dark:text-neutral-400 line-clamp-1 mt-0.5">
                          {item.snippet}
                        </p>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 dark:text-neutral-600 group-hover:translate-x-1 transition-transform shrink-0 ml-2" />
                </button>
              ))}
            </div>
          ) : (
            <div className="py-8 px-4 text-xs text-slate-500 dark:text-neutral-400">
              <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-2">
                Popular Academy Topics:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'What is an LLM?',
                  'What is MCP?',
                  'Prompt Engineering',
                  'Context Engineering',
                  'AI Agents',
                  'Selenium',
                  'Playwright',
                  'REST Assured',
                ].map((topic, idx) => (
                  <button
                    key={idx}
                    onClick={() => setQuery(topic)}
                    className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:text-emerald-600 dark:hover:text-emerald-400 text-xs transition-colors cursor-pointer"
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
