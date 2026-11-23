'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, AlertCircle, CheckCircle2, FileQuestion, RefreshCw } from 'lucide-react';
import AcademyHeader from './academy-header';
import CourseSidebar from './course-sidebar';
import CourseSearch from './course-search';
import LessonBreadcrumb from './lesson-breadcrumb';
import LessonHeader from './lesson-header';
import LessonSection from './lesson-section';
import PreviousNextNavigation from './previous-next-navigation';
import {
  getLessonBySlug,
  getAdjacentLessons,
  AcademyLessonData,
  getAllLessons,
} from '@/data/learning/academy-curriculum';
import { QADatabase } from '@/lib/qa-db';

interface AcademyShellProps {
  initialLessonSlug?: string;
  showSidebar?: boolean;
  showHeader?: boolean;
}

export default function AcademyShell({
  initialLessonSlug,
  showSidebar = false,
  showHeader = false,
}: AcademyShellProps) {
  const router = useRouter();

  // White / Light theme by default, with dark mode toggle support
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Active lesson slug
  const defaultSlug = initialLessonSlug || 'what-is-artificial-intelligence';
  const [activeSlug, setActiveSlug] = useState<string>(defaultSlug);

  // API Integration States: Loading, Error, Not-Found, Progress
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isNotFound, setIsNotFound] = useState(false);
  const [apiLessonData, setApiLessonData] = useState<any | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSavingProgress, setIsSavingProgress] = useState(false);

  // Sync with prop when URL changes
  useEffect(() => {
    if (initialLessonSlug) {
      setActiveSlug(initialLessonSlug);
    }
  }, [initialLessonSlug]);

  // Load saved theme preference on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('intelligentqa_academy_theme');
      if (savedTheme === 'dark' || savedTheme === 'light') {
        setTheme(savedTheme);
      } else {
        setTheme('light');
      }
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('intelligentqa_academy_theme', nextTheme);
    }
  };

  // Keyboard shortcut Cmd+K / Ctrl+K for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch real lesson data from backend API
  const fetchLessonData = useCallback(async (slug: string) => {
    setIsLoading(true);
    setApiError(null);
    setIsNotFound(false);

    try {
      const res = await fetch(`/api/learning/lessons/${encodeURIComponent(slug)}`);
      if (res.status === 404) {
        // If not found on API, check fallback
        const fallback = getLessonBySlug(slug);
        if (!fallback) {
          setIsNotFound(true);
          setIsLoading(false);
          return;
        }
      }

      if (!res.ok) {
        throw new Error(`Failed to load lesson (${res.status} ${res.statusText})`);
      }

      const json = await res.json();
      if (json.success && json.data) {
        setApiLessonData(json.data);

        // Fetch User Progress if user logged in
        const user = QADatabase.getCurrentUser();
        if (user?.id && json.data.lesson?.id) {
          try {
            const progRes = await fetch(`/api/learning/progress?userId=${encodeURIComponent(user.id)}&lessonId=${encodeURIComponent(json.data.lesson.id)}`);
            if (progRes.ok) {
              const progJson = await progRes.json();
              if (progJson.success && Array.isArray(progJson.data) && progJson.data.length > 0) {
                setIsCompleted(progJson.data[0].completionStatus === 'completed');
              }
            }
          } catch {
            // Non-blocking progress sync
          }
        }
      }
    } catch (err: any) {
      // Fallback to static catalog if API is unavailable
      const fallback = getLessonBySlug(slug);
      if (!fallback) {
        setApiError(err.message || 'Error connecting to Learning Academy API');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeSlug) {
      fetchLessonData(activeSlug);
    }
  }, [activeSlug, fetchLessonData]);

  // Handle Mark Completed / In Progress
  const handleToggleComplete = async () => {
    const user = QADatabase.getCurrentUser();
    const nextStatus = !isCompleted;
    setIsCompleted(nextStatus);

    if (user?.id && apiLessonData?.lesson?.id) {
      setIsSavingProgress(true);
      try {
        await fetch('/api/learning/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            lessonId: apiLessonData.lesson.id,
            completionStatus: nextStatus ? 'completed' : 'in_progress',
          }),
        });
      } catch (err) {
        console.error('Failed to sync progress to API:', err);
      } finally {
        setIsSavingProgress(false);
      }
    }
  };

  // Resolve current active lesson (with seamless API-to-Curriculum mapping)
  const staticLesson = getLessonBySlug(activeSlug);
  const fallbackLesson: AcademyLessonData | undefined =
    staticLesson ||
    (activeSlug === 'what-is-artificial-intelligence' || activeSlug === 'what-is-an-llm'
      ? getLessonBySlug('what-is-artificial-intelligence') || getAllLessons()[0]
      : undefined);

  const currentLesson: AcademyLessonData = apiLessonData?.lesson
    ? {
        id: apiLessonData.lesson.id,
        slug: apiLessonData.lesson.slug,
        title: apiLessonData.lesson.title,
        moduleSlug: apiLessonData.module?.slug || 'learning-module',
        moduleTitle: apiLessonData.module?.title || apiLessonData.course?.title || 'Learning Module',
        estimatedTime: `${apiLessonData.lesson.estimatedReadingTime || apiLessonData.lesson.estimatedReadTime || 5} min read`,
        difficulty: (apiLessonData.course?.level || 'All Levels') as any,
        tags: [apiLessonData.course?.title || 'QA', 'Documentation'],
        summary: apiLessonData.lesson.shortDescription || apiLessonData.lesson.summary || '',
        sections: staticLesson ? staticLesson.sections : [],
      }
    : fallbackLesson || {
        id: activeSlug,
        slug: activeSlug,
        title: activeSlug,
        moduleSlug: 'learning-module',
        moduleTitle: 'Academy Module',
        estimatedTime: '5 min read',
        difficulty: 'All Levels',
        tags: ['QA', 'Course'],
        summary: '',
        sections: [],
      };

  // Resolve adjacent lessons for navigation footer
  const { previousLesson, nextLesson } = apiLessonData?.previousLesson || apiLessonData?.nextLesson
    ? {
        previousLesson: apiLessonData.previousLesson
          ? {
              slug: apiLessonData.previousLesson.slug,
              title: apiLessonData.previousLesson.title,
              moduleTitle: apiLessonData.previousLesson.moduleTitle,
            }
          : undefined,
        nextLesson: apiLessonData.nextLesson
          ? {
              slug: apiLessonData.nextLesson.slug,
              title: apiLessonData.nextLesson.title,
              moduleTitle: apiLessonData.nextLesson.moduleTitle,
            }
          : undefined,
      }
    : getAdjacentLessons(currentLesson.slug);

  const handleSelectLesson = (slug: string) => {
    setActiveSlug(slug);
    setMobileSidebarOpen(false);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0f1117] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
        {/* Optional Standalone Header (only when not embedded in primary site layout) */}
        {showHeader && (
          <AcademyHeader
            theme={theme}
            onToggleTheme={toggleTheme}
            onOpenSearch={() => setIsSearchOpen(true)}
            mobileSidebarOpen={mobileSidebarOpen}
            onToggleMobileSidebar={() => setMobileSidebarOpen((prev) => !prev)}
          />
        )}

        {/* Body Container: Right Content Panel (Single sidebar provided by primary layout) */}
        <div className="flex-1 flex w-full">
          {/* Optional Secondary Sidebar (disabled by default to enforce single left navigation) */}
          {showSidebar && (
            <div className="hidden md:block">
              <CourseSidebar
                activeLessonSlug={currentLesson.slug}
                onSelectLesson={handleSelectLesson}
                modules={apiLessonData?.course?.modules}
                courseTitle={apiLessonData?.course?.title}
              />
            </div>
          )}

          {/* Optional Mobile Drawer */}
          {showSidebar && mobileSidebarOpen && (
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Mobile Navigation"
              className="md:hidden fixed inset-0 z-50 flex"
            >
              {/* Backdrop */}
              <div
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
                onClick={() => setMobileSidebarOpen(false)}
              />

              {/* Drawer Container */}
              <div className="relative w-80 max-w-[85vw] h-full bg-white dark:bg-neutral-900 z-10 shadow-2xl flex flex-col">
                <CourseSidebar
                  activeLessonSlug={currentLesson.slug}
                  onSelectLesson={handleSelectLesson}
                  modules={apiLessonData?.course?.modules}
                  courseTitle={apiLessonData?.course?.title}
                  className="w-full h-full border-r-0"
                />
              </div>
            </div>
          )}

          {/* C. Right Content Panel */}
          <main className="flex-1 min-w-0 px-4 sm:px-8 lg:px-12 py-8 bg-white dark:bg-[#0f1117]">
            <div className="max-w-4xl mx-auto">
              {/* 1. LOADING SKELETON STATE */}
              {isLoading && (
                <div className="space-y-6 animate-pulse py-4">
                  <div className="h-4 w-48 bg-slate-200 dark:bg-neutral-800 rounded" />
                  <div className="h-8 w-3/4 bg-slate-200 dark:bg-neutral-800 rounded" />
                  <div className="h-4 w-full bg-slate-100 dark:bg-neutral-800/60 rounded" />
                  <div className="h-4 w-5/6 bg-slate-100 dark:bg-neutral-800/60 rounded" />
                  <div className="h-48 w-full bg-slate-100 dark:bg-neutral-800/40 rounded-xl flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
                  </div>
                </div>
              )}

              {/* 2. NOT FOUND STATE */}
              {!isLoading && isNotFound && (
                <div className="text-center py-16 px-4 bg-slate-50 dark:bg-neutral-900/40 rounded-2xl border border-slate-200 dark:border-neutral-800">
                  <FileQuestion className="w-12 h-12 text-amber-500 mx-auto mb-3" />
                  <h2 className="text-xl font-bold mb-2 text-slate-800 dark:text-neutral-100">
                    Lesson Not Found or Unpublished
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-neutral-400 max-w-md mx-auto mb-6">
                    The requested lesson slug does not exist or has not been published yet. Check your URL or return to the curriculum.
                  </p>
                  <button
                    onClick={() => handleSelectLesson('what-is-artificial-intelligence')}
                    className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-xs transition-colors"
                  >
                    Go to First Lesson
                  </button>
                </div>
              )}

              {/* 3. API ERROR STATE */}
              {!isLoading && !isNotFound && apiError && (
                <div className="p-4 mb-6 rounded-xl border border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <div>
                      <h4 className="font-semibold text-sm">Failed to connect to Learning API</h4>
                      <p className="text-xs text-red-500/80">{apiError}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => fetchLessonData(activeSlug)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-xs font-medium transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Retry
                  </button>
                </div>
              )}

              {/* 4. ACTIVE CONTENT STATE */}
              {!isLoading && !isNotFound && (
                <>
                  {/* Top Bar with Completion Toggle */}
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-neutral-800/80">
                    <LessonBreadcrumb
                      items={
                        apiLessonData?.breadcrumbs && apiLessonData.breadcrumbs.length > 0
                          ? apiLessonData.breadcrumbs
                          : [
                              { label: currentLesson.moduleTitle },
                              { label: currentLesson.title, active: true },
                            ]
                      }
                    />

                    <button
                      onClick={handleToggleComplete}
                      disabled={isSavingProgress}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        isCompleted
                          ? 'bg-emerald-500 text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300 hover:bg-slate-200 dark:hover:bg-neutral-700'
                      }`}
                    >
                      <CheckCircle2 className={`w-3.5 h-3.5 ${isCompleted ? 'text-white' : 'text-slate-400'}`} />
                      <span>{isCompleted ? 'Completed' : 'Mark Complete'}</span>
                    </button>
                  </div>

                  {/* Lesson Header */}
                  <LessonHeader
                    title={currentLesson.title}
                    moduleTitle={currentLesson.moduleTitle}
                    estimatedTime={currentLesson.estimatedTime}
                    difficulty={currentLesson.difficulty}
                    tags={currentLesson.tags}
                    summary={currentLesson.summary}
                  />

                  {/* Supplementary Document HTML if provided from uploaded document */}
                  {apiLessonData?.lesson?.contentHtml && (
                    <div
                      className="prose dark:prose-invert max-w-none my-6 text-slate-800 dark:text-neutral-200 docx-rendered-content"
                      dangerouslySetInnerHTML={{ __html: apiLessonData.lesson.contentHtml }}
                    />
                  )}

                  {/* Interactive Curriculum Sections (Pipeline Diagrams, Code Blocks, Callouts, Tables) */}
                  {currentLesson.sections && currentLesson.sections.length > 0 ? (
                    <div className="space-y-4 my-2">
                      {currentLesson.sections.map((section) => (
                        <LessonSection key={section.id} section={section} />
                      ))}
                    </div>
                  ) : !apiLessonData?.lesson?.contentHtml ? (
                    <div className="py-8 text-center text-sm text-neutral-400">
                      Content is being generated for this lesson.
                    </div>
                  ) : null}

                  {/* Previous / Next Lesson Navigation Cards */}
                  <PreviousNextNavigation
                    previousLesson={previousLesson}
                    nextLesson={nextLesson}
                  />
                </>
              )}
            </div>
          </main>
        </div>

        {/* Global Search Dialog Modal */}
        <CourseSearch
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
        />
      </div>
    </div>
  );
}
