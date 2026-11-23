'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, AlertCircle, CheckCircle2, FileQuestion, RefreshCw, LayoutGrid, Eye, EyeOff } from 'lucide-react';
import AcademyHeader from './academy-header';
import CourseSidebar from './course-sidebar';
import CourseSearch from './course-search';
import LessonBreadcrumb from './lesson-breadcrumb';
import LessonHeader from './lesson-header';
import LessonSection from './lesson-section';
import PreviousNextNavigation from './previous-next-navigation';
import RelatedLessons from './related-lessons';
import ModuleOverviewCard from './module-overview-card';
import CourseOverviewCard from './course-overview-card';
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

// Client-side in-memory cache for ultra-fast instant navigation
const lessonClientCache = new Map<string, any>();

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
  const [showCourseOverview, setShowCourseOverview] = useState(false);

  // Active lesson slug
  const defaultSlug = initialLessonSlug || 'what-is-artificial-intelligence';
  const [activeSlug, setActiveSlug] = useState<string>(defaultSlug);

  // API Integration States: Loading, Error, Not-Found, Progress, Bookmarks
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isNotFound, setIsNotFound] = useState(false);
  const [apiLessonData, setApiLessonData] = useState<any | null>(() => lessonClientCache.get(defaultSlug) || null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isSavingProgress, setIsSavingProgress] = useState(false);
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(new Set());
  const [courseProgressStats, setCourseProgressStats] = useState<any | null>(null);

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

  // Fetch user overall progress to populate completed lessons and stats
  const fetchUserProgressStats = useCallback(async () => {
    const user = QADatabase.getCurrentUser();
    if (!user?.id) return;

    try {
      const res = await fetch(`/api/learning/progress?userId=${encodeURIComponent(user.id)}&summary=true`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.summary) {
          setCourseProgressStats(json.summary);
          const doneIds = new Set<string>();
          (json.summary.completedLessons || []).forEach((c: any) => {
            doneIds.add(c.lessonId);
            doneIds.add(c.lessonSlug);
          });
          setCompletedLessonIds(doneIds);
        }
      }
    } catch {
      // Non-blocking
    }
  }, []);

  useEffect(() => {
    fetchUserProgressStats();
  }, [fetchUserProgressStats]);

  // Fetch real lesson data from backend API with instant client caching
  const fetchLessonData = useCallback(async (slug: string) => {
    // 1. Instant Cache Hit Check
    if (lessonClientCache.has(slug)) {
      const cached = lessonClientCache.get(slug);
      setApiLessonData(cached);
      setIsLoading(false);
      setIsNotFound(false);
      setApiError(null);
    } else {
      setIsLoading(true);
      setApiError(null);
      setIsNotFound(false);
    }

    try {
      const res = await fetch(`/api/learning/lessons/${encodeURIComponent(slug)}`, {
        headers: { 'Cache-Control': 'max-age=300' },
      });

      if (res.status === 404) {
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
        lessonClientCache.set(slug, json.data);
        setApiLessonData(json.data);

        const user = QADatabase.getCurrentUser();
        const lessonId = json.data.lesson?.id;

        if (user?.id && lessonId) {
          // Record visited progress (in_progress) in background without overriding completed
          fetch('/api/learning/progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user.id,
              lessonId,
              completionStatus: 'in_progress',
            }),
          }).catch(() => {});

          // Fetch individual progress
          try {
            const progRes = await fetch(
              `/api/learning/progress?userId=${encodeURIComponent(user.id)}&lessonId=${encodeURIComponent(lessonId)}`
            );
            if (progRes.ok) {
              const progJson = await progRes.json();
              if (progJson.success && Array.isArray(progJson.data) && progJson.data.length > 0) {
                setIsCompleted(progJson.data[0].completionStatus === 'completed');
              } else {
                setIsCompleted(false);
              }
            }
          } catch {
            // Non-blocking
          }

          // Fetch Bookmark Status
          try {
            const bmRes = await fetch(
              `/api/learning/bookmarks?userId=${encodeURIComponent(user.id)}&lessonId=${encodeURIComponent(lessonId)}`
            );
            if (bmRes.ok) {
              const bmJson = await bmRes.json();
              if (bmJson.success) {
                setIsBookmarked(!!bmJson.bookmarked);
              }
            }
          } catch {
            // Non-blocking
          }
        }
      }
    } catch (err: any) {
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

    if (apiLessonData?.lesson?.id) {
      const lessonId = apiLessonData.lesson.id;
      setCompletedLessonIds((prev) => {
        const next = new Set(prev);
        if (nextStatus) {
          next.add(lessonId);
          if (apiLessonData.lesson.slug) next.add(apiLessonData.lesson.slug);
        } else {
          next.delete(lessonId);
          if (apiLessonData.lesson.slug) next.delete(apiLessonData.lesson.slug);
        }
        return next;
      });
    }

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
        fetchUserProgressStats();
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('intelligentqa_progress_updated'));
        }
      } catch (err) {
        console.error('Failed to sync progress to API:', err);
      } finally {
        setIsSavingProgress(false);
      }
    }
  };

  // Handle Bookmark Toggle
  const handleToggleBookmark = async () => {
    const user = QADatabase.getCurrentUser();
    if (!user?.id) {
      alert('Please log in or sign up (free) to bookmark lessons.');
      return;
    }

    const lessonId = apiLessonData?.lesson?.id || activeSlug;
    const nextBookmarked = !isBookmarked;
    setIsBookmarked(nextBookmarked);

    try {
      await fetch('/api/learning/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          lessonId,
        }),
      });
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('intelligentqa_bookmarks_updated'));
      }
    } catch (err) {
      console.error('Failed to toggle bookmark:', err);
    }
  };

  // Handle Print Friendly Lesson View
  const handlePrintLesson = () => {
    if (typeof window !== 'undefined') {
      window.print();
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

  // Calculate current module completion stats
  const moduleLessons = apiLessonData?.module?.lessons || [];
  const moduleTotalLessons = moduleLessons.length || 7;
  const moduleCompletedCount = moduleLessons.filter((l: any) => completedLessonIds.has(l.id) || completedLessonIds.has(l.slug)).length;
  const modulePercent = moduleTotalLessons > 0 ? Math.round((moduleCompletedCount / moduleTotalLessons) * 100) : 0;

  // Process HTML for performance: inject lazy loading on images
  const optimizedHtml = useMemo(() => {
    if (!apiLessonData?.lesson?.contentHtml) return '';
    return apiLessonData.lesson.contentHtml.replace(
      /<img\s+(?![^>]*\bloading=)/gi,
      '<img loading="lazy" decoding="async" '
    );
  }, [apiLessonData?.lesson?.contentHtml]);

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
                completedLessonIds={completedLessonIds}
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
                  completedLessonIds={completedLessonIds}
                  className="w-full h-full border-r-0"
                />
              </div>
            </div>
          )}

          {/* C. Right Content Panel */}
          <main className="flex-1 min-w-0 px-4 sm:px-8 lg:px-12 py-8 bg-white dark:bg-[#0f1117]">
            <div className="max-w-4xl mx-auto">
              {/* 1. LOADING SKELETON STATE */}
              {isLoading && !apiLessonData && (
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
                    className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-xs transition-colors cursor-pointer"
                  >
                    Go to First Lesson
                  </button>
                </div>
              )}

              {/* 3. API ERROR STATE */}
              {!isLoading && !isNotFound && apiError && !apiLessonData && (
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
              {(!isLoading || apiLessonData) && !isNotFound && (
                <>
                  {/* Top Bar with Completion & Course Overview Toggles */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-4 border-b border-slate-100 dark:border-neutral-800/80 no-print">
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

                    <div className="flex items-center gap-2">
                      {apiLessonData?.course && (
                        <button
                          onClick={() => setShowCourseOverview((prev) => !prev)}
                          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                            showCourseOverview
                              ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-600 dark:text-emerald-400'
                              : 'bg-slate-100 dark:bg-neutral-800 border-slate-200 dark:border-neutral-700 text-slate-700 dark:text-neutral-300 hover:bg-slate-200 dark:hover:bg-neutral-700'
                          }`}
                        >
                          <LayoutGrid className="w-3.5 h-3.5" />
                          <span>{showCourseOverview ? 'Hide Overview' : 'Course Overview'}</span>
                        </button>
                      )}

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
                        <span>{isCompleted ? 'Completed ✓' : 'Mark Complete'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Optional Course Overview Banner */}
                  {showCourseOverview && apiLessonData?.course && (
                    <CourseOverviewCard
                      courseTitle={apiLessonData.course.title}
                      subtitle={apiLessonData.course.subtitle}
                      description={apiLessonData.course.description}
                      level={apiLessonData.course.level}
                      estimatedHours={apiLessonData.course.estimatedHours}
                      totalModules={apiLessonData.course.modules?.length || 6}
                      totalLessons={apiLessonData.courseOverview?.totalLessons || 46}
                      completedLessons={completedLessonIds.size}
                      percentCompleted={
                        apiLessonData.courseOverview?.totalLessons
                          ? Math.round((completedLessonIds.size / apiLessonData.courseOverview.totalLessons) * 100)
                          : 0
                      }
                    />
                  )}

                  {/* Module Overview Card */}
                  {apiLessonData?.module && (
                    <ModuleOverviewCard
                      title={apiLessonData.module.title}
                      description={apiLessonData.module.description}
                      totalLessons={moduleTotalLessons}
                      completedLessons={moduleCompletedCount}
                      percentCompleted={modulePercent}
                    />
                  )}

                  {/* Lesson Header with Reading Time, Updated Date, Bookmark, Print */}
                  <LessonHeader
                    title={currentLesson.title}
                    moduleTitle={currentLesson.moduleTitle}
                    courseTitle={apiLessonData?.course?.title}
                    estimatedTime={currentLesson.estimatedTime}
                    lastUpdated={apiLessonData?.lesson?.updatedAt || apiLessonData?.lesson?.createdAt}
                    difficulty={currentLesson.difficulty}
                    tags={currentLesson.tags}
                    summary={currentLesson.summary}
                    isBookmarked={isBookmarked}
                    onToggleBookmark={handleToggleBookmark}
                    onPrintLesson={handlePrintLesson}
                  />

                  {/* Supplementary Document HTML if provided from uploaded document */}
                  {optimizedHtml && (
                    <div
                      className="prose dark:prose-invert max-w-none my-6 text-slate-800 dark:text-neutral-200 docx-rendered-content leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: optimizedHtml }}
                    />
                  )}

                  {/* Interactive Curriculum Sections (Pipeline Diagrams, Code Blocks, Callouts, Tables) */}
                  {currentLesson.sections && currentLesson.sections.length > 0 ? (
                    <div className="space-y-4 my-2">
                      {currentLesson.sections.map((section) => (
                        <LessonSection key={section.id} section={section} />
                      ))}
                    </div>
                  ) : !optimizedHtml ? (
                    <div className="py-8 text-center text-sm text-neutral-400">
                      Content is being generated for this lesson.
                    </div>
                  ) : null}

                  {/* Recommended Related Lessons */}
                  {apiLessonData?.relatedLessons && apiLessonData.relatedLessons.length > 0 && (
                    <RelatedLessons
                      lessons={apiLessonData.relatedLessons}
                      onSelectLesson={handleSelectLesson}
                    />
                  )}

                  {/* Previous / Next Lesson Navigation Cards with Back to Course */}
                  <PreviousNextNavigation
                    previousLesson={previousLesson}
                    nextLesson={nextLesson}
                    backToCourse={
                      apiLessonData?.backToCourse
                        ? {
                            title: apiLessonData.backToCourse.courseTitle,
                            href: `/learning`,
                          }
                        : undefined
                    }
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
