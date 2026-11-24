'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  FileQuestion,
  RefreshCw,
  Eye,
  EyeOff,
  Bookmark,
  Printer,
  ArrowRight,
  Lock,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import AcademyHeader from './academy-header';
import CourseSidebar from './course-sidebar';
import CourseSearch from './course-search';
import LessonHeader from './lesson-header';
import LessonSection from './lesson-section';
import PreviousNextNavigation from './previous-next-navigation';
import RelatedLessons from './related-lessons';
import ModuleOverviewCard from './module-overview-card';
import CourseOverviewCard from './course-overview-card';
import LlmArchitectureInfographic from './llm-architecture-infographic';
import { generateStandardLessonHtml } from '@/lib/standard-lesson-compiler';
import { renderTiptapJsonToHtml } from '@/components/editor/tiptap-renderer';
import {
  getLessonBySlug,
  getAdjacentLessons,
  AcademyLessonData,
  getAllLessons,
} from '@/data/learning/academy-curriculum';
import { INITIAL_PUBLISHED_COURSES } from '@/data/learning/initial-courses';
import { QADatabase } from '@/lib/qa-db';

interface AcademyShellProps {
  initialLessonSlug?: string;
  initialCourseId?: string;
  isOverview?: boolean;
  showSidebar?: boolean;
  showHeader?: boolean;
}

// Client-side in-memory cache for ultra-fast instant navigation
const lessonClientCache = new Map<string, any>();

export default function AcademyShell({
  initialLessonSlug,
  initialCourseId,
  isOverview = false,
  showSidebar = false,
  showHeader = false,
}: AcademyShellProps) {
  const router = useRouter();

  // White / Light theme by default, with dark mode toggle support
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Overview mode vs. Lesson mode
  const [isOverviewMode, setIsOverviewMode] = useState<boolean>(
    isOverview || !initialLessonSlug || initialLessonSlug === 'overview'
  );
  const [selectedCourseId, setSelectedCourseId] = useState<string | undefined>(initialCourseId);

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

  // User Authentication state for guest gating & teaser preview
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUser(QADatabase.getCurrentUser());
      const handleAuth = () => {
        setCurrentUser(QADatabase.getCurrentUser());
      };
      window.addEventListener('intelligentqa_auth_changed', handleAuth);
      return () => window.removeEventListener('intelligentqa_auth_changed', handleAuth);
    }
  }, []);

  // Sync with props when URL or course selection changes
  useEffect(() => {
    if (isOverview !== undefined) {
      setIsOverviewMode(isOverview);
    }
    if (initialCourseId) {
      setSelectedCourseId(initialCourseId);
    }
    if (initialLessonSlug) {
      setActiveSlug(initialLessonSlug);
      setIsOverviewMode(false);
    }
  }, [initialLessonSlug, isOverview, initialCourseId]);

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
    if (!isOverviewMode && activeSlug && activeSlug !== 'overview') {
      fetchLessonData(activeSlug);
    }
  }, [activeSlug, isOverviewMode, fetchLessonData]);

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
    setIsOverviewMode(false);
    setMobileSidebarOpen(false);
    router.push(`/learning/${slug}`);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Resolve active course for Course Overview mode
  const activeCourse = useMemo(() => {
    if (selectedCourseId) {
      const match = INITIAL_PUBLISHED_COURSES.find(
        (c) =>
          c.id === selectedCourseId ||
          c.slug === selectedCourseId ||
          c.title.toLowerCase().includes(selectedCourseId.toLowerCase())
      );
      if (match) return match;
    }
    if (apiLessonData?.course) {
      return apiLessonData.course;
    }
    return INITIAL_PUBLISHED_COURSES[0]; // AI Academy default
  }, [selectedCourseId, apiLessonData?.course]);

  const totalCourseLessons = useMemo(() => {
    return (activeCourse?.modules || []).reduce((acc: number, m: any) => acc + (m.lessons?.length || 0), 0) || 46;
  }, [activeCourse]);

  const completedInCourseCount = useMemo(() => {
    const allLessons = (activeCourse?.modules || []).flatMap((m: any) => m.lessons || []);
    return allLessons.filter((l: any) => completedLessonIds.has(l.id) || completedLessonIds.has(l.slug)).length;
  }, [activeCourse, completedLessonIds]);

  const coursePercent = totalCourseLessons > 0 ? Math.round((completedInCourseCount / totalCourseLessons) * 100) : 0;

  // Calculate current module completion stats
  const moduleLessons = apiLessonData?.module?.lessons || [];
  const moduleTotalLessons = moduleLessons.length || 7;
  const moduleCompletedCount = moduleLessons.filter((l: any) => completedLessonIds.has(l.id) || completedLessonIds.has(l.slug)).length;
  const modulePercent = moduleTotalLessons > 0 ? Math.round((moduleCompletedCount / moduleTotalLessons) * 100) : 0;

  // Process HTML for performance: prioritize canonical tiptapJson, then standardData, then contentHtml
  const optimizedHtml = useMemo(() => {
    let html = '';
    const blockData = apiLessonData?.lesson?.blockData;

    // 1. If canonical Tiptap JSON is present, render directly from the unified editor schema
    if (blockData?.tiptapJson) {
      html = renderTiptapJsonToHtml(blockData.tiptapJson);
    }
    // 2. Fallback to standardData if present
    else if (blockData?.standardData) {
      html = generateStandardLessonHtml(blockData.standardData);
    }
    // 3. Fallback to raw contentHtml
    else if (apiLessonData?.lesson?.contentHtml) {
      html = apiLessonData.lesson.contentHtml;
    }

    if (!html) return '';

    // 1. Remove leading <h1>...</h1> tag (which duplicates LessonHeader's H1 title)
    html = html.replace(/^\s*<h1\b[^>]*>[\s\S]*?<\/h1>\s*/i, '');

    // 2. Remove immediately following subtitle/summary paragraph (which duplicates LessonHeader's summary)
    html = html.replace(/^\s*<p\b[^>]*>\s*(?:<span\b[^>]*>)?\s*<em\b[^>]*>[\s\S]*?<\/em>\s*(?:<\/span>)?\s*<\/p>\s*/i, '');

    // 3. Remove any legacy section headers/labels like "SECTION 2 · OBJECTIVES" or "Section 1 · Overview"
    html = html.replace(/<span[^>]*>\s*(?:section|SECTION)\s*\d+[^<]*<\/span>/gi, '');
    html = html.replace(/\b(?:SECTION|Section)\s*\d+\s*[·•-]\s*[^<\n]+/g, '');

    // 4. Inject lazy loading and decoding async on images
    return html.replace(
      /<img\s+(?![^>]*\bloading=)/gi,
      '<img loading="lazy" decoding="async" '
    );
  }, [apiLessonData?.lesson?.contentHtml, apiLessonData?.lesson?.blockData]);

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
              {/* 1. LOADING SKELETON STATE (Only when loading a specific lesson) */}
              {!isOverviewMode && isLoading && !apiLessonData && (
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

              {/* 2. NOT FOUND STATE (Only when a specific lesson is not found) */}
              {!isOverviewMode && !isLoading && isNotFound && (
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

              {/* 3. API ERROR STATE (Only when a specific lesson fails to load) */}
              {!isOverviewMode && !isLoading && !isNotFound && apiError && !apiLessonData && (
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
              {isOverviewMode ? (
                /* ================= COURSE OVERVIEW (MAIN PAGE) ================= */
                <div className="space-y-8 py-2">
                  {/* Course Overview Card */}
                  <CourseOverviewCard
                    courseTitle={activeCourse.title}
                    subtitle={activeCourse.subtitle}
                    description={activeCourse.description}
                    level={activeCourse.level}
                    estimatedHours={activeCourse.estimatedHours}
                    totalModules={activeCourse.modules.length}
                    totalLessons={totalCourseLessons}
                    completedLessons={completedInCourseCount}
                    percentCompleted={coursePercent}
                  />

                  {/* Ready to begin? Primary Action Callout or Guest Sign-up Teaser */}
                  {!currentUser ? (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-indigo-500/10 border border-emerald-500/30 text-emerald-950 dark:text-emerald-200 shadow-xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
                            Free Guest Preview
                          </span>
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            Explore Curriculum &amp; Syllabus Overview
                          </h3>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-neutral-300">
                          Review all modules below. Create your free account in seconds to unlock full lessons, visual architecture diagrams, production code, and interactive practice labs.
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Link
                          href="/signup"
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition-all hover:scale-[1.02] cursor-pointer"
                        >
                          Sign Up Free
                        </Link>
                        <Link
                          href="/login"
                          className="px-3.5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-slate-800 dark:text-white font-semibold text-xs transition-colors cursor-pointer"
                        >
                          Log In
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300">
                      <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-0.5">
                          {completedInCourseCount > 0 ? 'Pick up where you left off' : 'Ready to start learning?'}
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-neutral-400">
                          Follow the structured curriculum below or jump straight into the first lesson.
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          const firstLesson = activeCourse.modules[0]?.lessons[0]?.slug || 'what-is-artificial-intelligence';
                          handleSelectLesson(firstLesson);
                        }}
                        className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs shrink-0"
                      >
                        <span>{completedInCourseCount > 0 ? 'Continue Learning' : 'Start Course'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Course Syllabus & Modules Breakdown */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-neutral-800">
                      <div>
                        <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                          Curriculum Map
                        </span>
                        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                          Course Syllabus &amp; Modules
                        </h2>
                      </div>
                      <span className="text-xs text-slate-500 dark:text-neutral-400 font-medium">
                        {activeCourse.modules.length} Modules • {totalCourseLessons} Lessons
                      </span>
                    </div>

                    <div className="space-y-4">
                      {activeCourse.modules.map((mod: any, mIdx: number) => {
                        const modLessons = mod.lessons || [];
                        const modCompleted = modLessons.filter((l: any) => completedLessonIds.has(l.id) || completedLessonIds.has(l.slug)).length;
                        const modPercent = modLessons.length > 0 ? Math.round((modCompleted / modLessons.length) * 100) : 0;

                        return (
                          <div
                            key={mod.id || mIdx}
                            className="rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 overflow-hidden shadow-xs"
                          >
                            <div className="p-5 border-b border-slate-100 dark:border-neutral-800 bg-slate-50/60 dark:bg-neutral-900/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                    Module {mIdx + 1}
                                  </span>
                                  <span className="text-xs text-slate-500 dark:text-neutral-400">
                                    {modLessons.length} Lessons
                                  </span>
                                </div>
                                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                  {mod.title}
                                </h3>
                                {mod.description && (
                                  <p className="text-xs text-slate-600 dark:text-neutral-400 mt-0.5">
                                    {mod.description}
                                  </p>
                                )}
                              </div>
                              {modCompleted > 0 && (
                                <span className="text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full shrink-0">
                                  {modCompleted}/{modLessons.length} Done ({modPercent}%)
                                </span>
                              )}
                            </div>

                            {/* Lesson List */}
                            <div className="divide-y divide-slate-100 dark:divide-neutral-800/60">
                              {modLessons.map((les: any, lIdx: number) => {
                                const isDone = completedLessonIds.has(les.id) || completedLessonIds.has(les.slug);
                                return (
                                  <button
                                    key={les.id || lIdx}
                                    onClick={() => handleSelectLesson(les.slug || les.id)}
                                    className="w-full text-left p-3.5 sm:px-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-neutral-800/40 transition-colors group cursor-pointer"
                                  >
                                    <div className="flex items-center gap-3 min-w-0 pr-3">
                                      <span
                                        className={`w-6 h-6 rounded-full text-xs font-mono font-bold flex items-center justify-center shrink-0 border transition-colors ${
                                          isDone
                                            ? 'bg-emerald-500 text-white border-emerald-500'
                                            : 'bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-400 border-slate-200 dark:border-neutral-700 group-hover:border-emerald-500 group-hover:text-emerald-500'
                                        }`}
                                      >
                                        {isDone ? '✓' : lIdx + 1}
                                      </span>
                                      <div className="min-w-0">
                                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
                                          {les.title}
                                        </h4>
                                        {les.summary && (
                                          <p className="text-xs text-slate-500 dark:text-neutral-400 line-clamp-1">
                                            {les.summary}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0 text-xs text-slate-400">
                                      <span className="hidden sm:inline font-mono text-[11px]">
                                        {les.estimatedReadingTime || 5} min read
                                      </span>
                                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all" />
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (!isLoading || apiLessonData) && !isNotFound ? (
                /* ================= LESSON READING PAGE ================= */
                <>
                  {/* Clean Utility Action Toolbar (Visible ONLY to authenticated members) */}
                  {currentUser && (
                    <div className="flex items-center justify-end gap-2 pb-3 mb-6 border-b border-slate-100 dark:border-neutral-800/80 no-print">
                      {/* Bookmark Button */}
                      <button
                        onClick={handleToggleBookmark}
                        aria-label={isBookmarked ? 'Remove Bookmark' : 'Bookmark Lesson'}
                        title={isBookmarked ? 'Remove from My Bookmarks' : 'Bookmark this lesson'}
                        className={`p-1.5 px-2.5 rounded-lg border text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                          isBookmarked
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-500 hover:bg-amber-500/20'
                            : 'bg-slate-100 dark:bg-neutral-800 border-slate-200 dark:border-neutral-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-500' : ''}`} />
                        <span className="hidden md:inline">{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
                      </button>

                      {/* Print Button */}
                      <button
                        onClick={handlePrintLesson}
                        aria-label="Print Lesson"
                        title="Print or Save as PDF"
                        className="p-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-neutral-700 bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span className="hidden md:inline">Print</span>
                      </button>

                      {/* Mark Complete Button */}
                      <button
                        onClick={handleToggleComplete}
                        disabled={isSavingProgress}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          isCompleted
                            ? 'bg-emerald-500 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300 hover:bg-slate-200 dark:hover:bg-neutral-700 border border-slate-200 dark:border-neutral-700'
                        }`}
                      >
                        <CheckCircle2 className={`w-3.5 h-3.5 ${isCompleted ? 'text-white' : 'text-slate-400'}`} />
                        <span>{isCompleted ? 'Completed ✓' : 'Mark Complete'}</span>
                      </button>
                    </div>
                  )}

                  {/* Clean Lesson Header with Reading Time, Difficulty, Updated Date, Summary */}
                  <LessonHeader
                    title={currentLesson.title}
                    moduleTitle={currentLesson.moduleTitle}
                    courseTitle={apiLessonData?.course?.title}
                    estimatedTime={currentLesson.estimatedTime}
                    lastUpdated={apiLessonData?.lesson?.updatedAt || apiLessonData?.lesson?.createdAt}
                    difficulty={currentLesson.difficulty}
                    summary={currentLesson.summary}
                  />

                  {/* GUEST ACCESS GATE: Reveal Teaser Snippet & Sign-up Gate Card */}
                  {!currentUser ? (
                    <div className="space-y-6">
                      {/* Introductory Teaser Snippet with Fading Gradient */}
                      {optimizedHtml && (
                        <div className="relative my-6">
                          <div
                            className="prose dark:prose-invert max-w-none text-slate-800 dark:text-neutral-200 docx-rendered-content leading-relaxed max-h-56 overflow-hidden select-none filter blur-[0.2px]"
                            dangerouslySetInnerHTML={{
                              __html: (optimizedHtml.slice(0, 900).replace(/<img[^>]*>/gi, '').replace(/<figure[\s\S]*?<\/figure>/gi, '') + '</p>'),
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/80 to-white dark:via-[#0f1117]/85 dark:to-[#0f1117] pointer-events-none" />
                        </div>
                      )}

                      {/* High-Converting Member Access Gating Card */}
                      <div className="my-8 p-6 sm:p-10 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-slate-50 to-indigo-500/10 dark:from-emerald-950/20 dark:via-neutral-900 dark:to-indigo-950/20 border-2 border-emerald-500/30 text-center space-y-6 shadow-xl">
                        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg">
                          <Lock className="w-8 h-8" />
                        </div>
                        <div className="max-w-xl mx-auto space-y-2">
                          <span className="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                            Academy Member Preview
                          </span>
                          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                            Unlock Full Lesson &amp; Interactive QA Labs
                          </h3>
                          <p className="text-sm text-slate-600 dark:text-neutral-300 leading-relaxed">
                            You are previewing an introduction to <strong>{currentLesson.title}</strong>. Create your free account in seconds to unlock the full technical architecture diagrams, production code implementations, AI Coding Coach guidance, and compiler sandboxes.
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto text-left text-xs font-semibold text-slate-700 dark:text-neutral-200 py-2">
                          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/90 dark:bg-neutral-800/90 border border-slate-200 dark:border-neutral-700 shadow-2xs">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                            <span>Full Technical Architecture &amp; Infographics</span>
                          </div>
                          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/90 dark:bg-neutral-800/90 border border-slate-200 dark:border-neutral-700 shadow-2xs">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                            <span>Interactive AI Coding Coach &amp; Assistance</span>
                          </div>
                          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/90 dark:bg-neutral-800/90 border border-slate-200 dark:border-neutral-700 shadow-2xs">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                            <span>Hands-on Code Runners &amp; Practice Labs</span>
                          </div>
                          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/90 dark:bg-neutral-800/90 border border-slate-200 dark:border-neutral-700 shadow-2xs">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                            <span>100% Free Forever — Zero Credit Card</span>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                          <Link
                            href="/signup"
                            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm shadow-md transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
                          >
                            Sign Up for Free Access
                          </Link>
                          <Link
                            href="/login"
                            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-slate-800 dark:text-white font-bold text-sm transition-all cursor-pointer"
                          >
                            Already a member? Log In
                          </Link>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* MEMBER FULL ACCESS: Full prose, architecture diagrams & interactive sections */
                    <>
                      {/* Comprehensive Visual Infographic for What is an LLM? (Phase 8 Requirement) */}
                      {(activeSlug === 'what-is-an-llm' || currentLesson.slug === 'what-is-an-llm') && (
                        <LlmArchitectureInfographic />
                      )}

                      {/* Uniform Technical Documentation Content (Prose format across all courses) */}
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
                        <div className="my-8 p-8 rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-sm text-center space-y-4">
                          <div className="w-12 h-12 mx-auto rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                            <FileQuestion className="w-6 h-6" />
                          </div>
                          <div className="max-w-md mx-auto space-y-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              Curriculum Content Under Construction
                            </span>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                              Building Fresh in Uniform Format
                            </h3>
                            <p className="text-xs text-slate-600 dark:text-neutral-400 leading-relaxed">
                              This lesson is being crafted fresh in our standardized interactive format with architectural diagrams, production implementation code, and enterprise best practices.
                            </p>
                          </div>
                        </div>
                      ) : null}
                    </>
                  )}

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
              ) : null}
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
