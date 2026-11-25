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
import ContentImageLightbox from './content-image-lightbox';
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
import { useAppTheme } from '@/lib/theme';

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

  // Lightbox modal state for crystal clear image and diagram enlargement
  const [lightboxState, setLightboxState] = useState<{
    isOpen: boolean;
    imageUrl: string;
    altText?: string;
    title?: string;
    caption?: string;
  }>({
    isOpen: false,
    imageUrl: '',
    altText: '',
    title: '',
    caption: '',
  });

  // Event delegation to capture clicks on any diagram or image across all course contents
  const handleContentClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const figure = target.closest('figure');
    const clickedImg = (target.tagName.toLowerCase() === 'img' ? target : null) as HTMLImageElement | null;
    const expandBtn = target.closest('.expand-diagram-btn');
    const diagramWrapper = target.closest('.diagram-img-wrapper') || target.closest('[data-curriculum-diagram="true"]');

    const img =
      clickedImg ||
      (figure ? (figure.querySelector('img') as HTMLImageElement | null) : null) ||
      (diagramWrapper ? (diagramWrapper.querySelector('img') as HTMLImageElement | null) : null);

    if (img && (clickedImg || expandBtn || figure || diagramWrapper)) {
      const src = img.getAttribute('src') || img.src;
      if (src) {
        e.preventDefault();
        e.stopPropagation();
        const figcaption = figure?.querySelector('figcaption')?.textContent?.trim() || '';
        const titleText = figure?.getAttribute('data-diagram-title') || img.alt || '';
        setLightboxState({
          isOpen: true,
          imageUrl: src,
          altText: img.alt || 'Course Diagram',
          title: titleText || img.alt || 'Architecture Diagram',
          caption: figcaption || img.alt || '',
        });
      }
    }
  }, []);

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

  // Published courses synchronized with backend for real-time overview updates
  const [livePublishedCourses, setLivePublishedCourses] = useState<any[]>(INITIAL_PUBLISHED_COURSES);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch('/api/learning/courses');
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            setLivePublishedCourses(json.data);
          }
        }
      } catch {}
    };

    fetchCourses();
    if (typeof window !== 'undefined') {
      window.addEventListener('intelligentqa_curriculum_updated', fetchCourses);
      return () => window.removeEventListener('intelligentqa_curriculum_updated', fetchCourses);
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
      const savedTheme = localStorage.getItem('intelligentqa_theme') || localStorage.getItem('intelligentqa_academy_theme');
      if (savedTheme === 'dark' || savedTheme === 'light') {
        setTheme(savedTheme as any);
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
      localStorage.setItem('intelligentqa_theme', nextTheme);
      const root = document.documentElement;
      if (nextTheme === 'dark') {
        root.classList.add('dark');
        root.setAttribute('data-theme', 'dark');
      } else {
        root.classList.remove('dark');
        root.setAttribute('data-theme', 'light');
      }
      window.dispatchEvent(new CustomEvent('intelligentqa_theme_changed', { detail: { theme: nextTheme } }));
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

  // Check if current lesson is locked for guests
  const isLessonLocked = useMemo(() => {
    if (currentUser) return false;
    const trackId = selectedCourseId || apiLessonData?.course?.id || 'course-ai-qa-mastery';
    const lessonId = currentLesson.id || currentLesson.slug;
    return QADatabase.isLessonLocked(trackId, lessonId, false);
  }, [currentUser, selectedCourseId, apiLessonData?.course?.id, currentLesson.id, currentLesson.slug]);

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
    const catalog = livePublishedCourses && livePublishedCourses.length > 0 ? livePublishedCourses : INITIAL_PUBLISHED_COURSES;
    if (selectedCourseId) {
      const query = selectedCourseId.toLowerCase().trim();

      // Priority match for CI/CD Concepts track
      if (
        query === 'cicd-concepts' ||
        query === 'course-cicd-concepts' ||
        query === 'ci-cd' ||
        query === 'ci-cd-concepts' ||
        query === 'cicd' ||
        query.includes('cicd') ||
        query.includes('ci-cd')
      ) {
        const cicdMatch = catalog.find(
          (c: any) => c.id === 'course-cicd-concepts' || c.slug === 'cicd-concepts'
        );
        if (cicdMatch) return cicdMatch;
      }

      const match = catalog.find(
        (c: any) =>
          c.id.toLowerCase() === query ||
          c.slug.toLowerCase() === query ||
          c.title.toLowerCase().includes(query) ||
          query.includes(c.id.toLowerCase()) ||
          query.includes(c.slug.toLowerCase()) ||
          (query.includes('apm') && c.id.includes('apm')) ||
          (query.includes('performance') && c.id.includes('performance'))
      );
      if (match) return match;
    }
    if (apiLessonData?.course) {
      return apiLessonData.course;
    }
    return catalog[0] || INITIAL_PUBLISHED_COURSES[0]; // AI Academy default
  }, [selectedCourseId, apiLessonData?.course, livePublishedCourses]);

  const totalCourseLessons = useMemo(() => {
    return (
      (activeCourse?.modules || []).reduce((acc: number, m: any) => {
        const pubLessons = (m.lessons || []).filter((l: any) =>
          l.status ? l.status === 'published' : !l.disabled
        );
        return acc + pubLessons.length;
      }, 0) || 0
    );
  }, [activeCourse]);

  const completedInCourseCount = useMemo(() => {
    const allLessons = (activeCourse?.modules || []).flatMap((m: any) =>
      (m.lessons || []).filter((l: any) => (l.status ? l.status === 'published' : !l.disabled))
    );
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

    // 4. Strip out hardcoded washed-out text color classes that break normal (light) mode contrast
    html = html.replace(/\btext-(?:white|slate-100|slate-200|slate-300|slate-400|neutral-100|neutral-200|neutral-300|neutral-400|zinc-100|zinc-200|zinc-300|zinc-400|gray-100|gray-200|gray-300|gray-400)\b/g, '');
    html = html.replace(/\bstyle="[^"]*color:\s*(?:#ffffff|#fff|#cbd5e1|#d4d4d8|#64748B|#94a3b8|#e2e8f0|rgb\(255,\s*255,\s*255\)|rgb\(203,\s*213,\s*225\))[^"]*"/gi, '');

    // 5. Enhance curriculum diagrams with expand button, crystal clear rendering & zoom affordances
    html = html.replace(
      /(<figure\b[^>]*data-curriculum-diagram="true"[^>]*>)([\s\S]*?)(<\/figure>)/gi,
      (match, openTag, content, closeTag) => {
        let enhancedContent = content;

        // Add diagram toolbar if not already present
        if (!enhancedContent.includes('diagram-toolbar')) {
          const toolbar = `
<div class="diagram-toolbar flex items-center justify-between pb-3 mb-3 border-b border-slate-200/80 dark:border-neutral-800 text-left">
  <div class="flex items-center gap-2">
    <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
      📐 Architecture Blueprint
    </span>
    <span class="text-[11px] text-slate-500 dark:text-neutral-400 hidden sm:inline font-medium">Click image to expand full-screen</span>
  </div>
  <button type="button" class="expand-diagram-btn inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-all hover:scale-105 cursor-pointer" title="Expand to crystal clear high-resolution view">
    <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
    <span>Expand View</span>
  </button>
</div>`;
          enhancedContent = toolbar + enhancedContent;
        }

        // Add hover overlay and cursor-zoom-in to the image container if not already present
        if (!enhancedContent.includes('diagram-img-wrapper')) {
          enhancedContent = enhancedContent.replace(
            /<div class="relative overflow-hidden rounded-xl border border-slate-200\/80 dark:border-neutral-700\/80 bg-white dark:bg-neutral-950 flex items-center justify-center p-2 sm:p-4">/gi,
            `<div class="diagram-img-wrapper group relative overflow-hidden rounded-xl border border-slate-200/80 dark:border-neutral-700/80 bg-white dark:bg-neutral-950 flex items-center justify-center p-2 sm:p-4 cursor-zoom-in">
    <div class="absolute inset-0 bg-neutral-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none rounded-xl z-10">
      <span class="px-3 py-1.5 rounded-full bg-neutral-900/90 text-white text-xs font-semibold shadow-lg backdrop-blur-xs flex items-center gap-1.5 border border-neutral-700">
        <svg class="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
        Click to enlarge full-screen
      </span>
    </div>`
          );
        }

        // Upgrade max-h-[520px] to max-h-[680px]
        enhancedContent = enhancedContent.replace(
          /max-h-\[520px\]/g,
          'max-h-[680px] cursor-zoom-in transition-transform duration-200 group-hover:scale-[1.01]'
        );

        const updatedOpenTag = openTag.includes('curriculum-diagram-card')
          ? openTag
          : openTag.replace(/class="([^"]*)"/i, 'class="$1 curriculum-diagram-card cursor-zoom-in group"');

        return `${updatedOpenTag}${enhancedContent}${closeTag}`;
      }
    );

    // 6. Inject lazy loading and decoding async on images
    return html.replace(
      /<img\s+(?![^>]*\bloading=)/gi,
      '<img loading="lazy" decoding="async" title="Click to enlarge in crystal clear high-resolution" '
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
                        const modLessons = (mod.lessons || []).filter((l: any) =>
                          l.status ? l.status === 'published' : !l.disabled
                        );
                        if (modLessons.length === 0) return null;
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

                  {/* ================= GUEST ACCESS GATEWAY / LOCKED LESSON ================= */}
                  {isLessonLocked ? (
                    <div className="my-8 p-6 sm:p-10 rounded-3xl bg-gradient-to-b from-slate-50 to-emerald-50/20 dark:from-neutral-900 dark:to-emerald-950/20 border-2 border-emerald-500/30 text-center shadow-lg space-y-6">
                      <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 shadow-xs">
                        <Lock className="w-8 h-8" />
                      </div>
                      
                      <div className="max-w-xl mx-auto space-y-2.5">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                          <Sparkles className="w-3.5 h-3.5" />
                          Free Account Required
                        </span>
                        <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                          Unlock Full Lesson &amp; Architectural Diagrams
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-neutral-300 leading-relaxed">
                          Lesson 1 is available as an instant guest preview. To access full production code, deep architectural infographics, interactive exercises, and progress tracking, create your free account in under 30 seconds.
                        </p>
                      </div>

                      <div className="p-4 max-w-md mx-auto rounded-2xl bg-white/80 dark:bg-neutral-800/80 border border-slate-200 dark:border-neutral-700 text-left text-xs space-y-2 text-slate-700 dark:text-neutral-300">
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          What You Get With Your Free Account:
                        </div>
                        <ul className="space-y-1 pl-6 list-disc text-slate-600 dark:text-neutral-400">
                          <li>Instant access to all 450+ enterprise lessons &amp; courses</li>
                          <li>Downloadable production frameworks &amp; architectural diagrams</li>
                          <li>Unlimited online code compilers &amp; API sandboxes</li>
                          <li>800+ curated SDET interview scenarios &amp; model answers</li>
                        </ul>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                        <Link
                          href="/signup"
                          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm shadow-md transition-all hover:scale-[1.02] cursor-pointer flex items-center justify-center gap-2"
                        >
                          <Sparkles className="w-4 h-4" />
                          <span>Sign Up Free in 30 Seconds</span>
                        </Link>
                        <Link
                          href="/login"
                          className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-slate-900 dark:text-white font-bold text-sm transition-colors cursor-pointer text-center"
                        >
                          Already have an account? Log In
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* ================= FULL LESSON CONTENT & DIAGRAMS (100% UNBLURRED) ================= */}
                      {/* Comprehensive Visual Infographic for What is an LLM? (Phase 8 Requirement) */}
                      {(activeSlug === 'what-is-an-llm' || currentLesson.slug === 'what-is-an-llm') && (
                        <LlmArchitectureInfographic />
                      )}

                      {/* Uniform Technical Documentation Content (Prose format across all courses with Embedded Diagrams) */}
                      {optimizedHtml && (
                        <div
                          className="w-full my-6 text-slate-900 dark:text-slate-100 docx-rendered-content leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: optimizedHtml }}
                          onClick={handleContentClick}
                        />
                      )}

                      {/* Interactive Curriculum Sections (Pipeline Diagrams, Code Blocks, Callouts, Tables) */}
                      {currentLesson.sections && currentLesson.sections.length > 0 ? (
                        <div className="space-y-4 my-2" onClick={handleContentClick}>
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

                  {/* Clean Non-Obtrusive Sign-Up Banner at End of Lesson for Guest Users */}
                  {!currentUser && (
                    <div className="my-10 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-slate-50 to-teal-500/10 dark:from-emerald-950/20 dark:via-neutral-900 dark:to-teal-950/20 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-5 shadow-sm">
                      <div className="space-y-1.5 text-center sm:text-left">
                        <div className="flex items-center justify-center sm:justify-start gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                            100% Free Forever
                          </span>
                          <h3 className="text-base font-bold text-slate-900 dark:text-white">
                            Ready to practice and track your progress?
                          </h3>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-neutral-300">
                          Create your free account to bookmark lessons, track your completed modules, and unlock interactive practice labs.
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <Link
                          href="/signup"
                          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition-all hover:scale-[1.02] cursor-pointer"
                        >
                          Sign Up Free
                        </Link>
                        <Link
                          href="/login"
                          className="px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-slate-800 dark:text-white font-semibold text-xs transition-colors cursor-pointer"
                        >
                          Log In
                        </Link>
                      </div>
                    </div>
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

        {/* Full-Screen Crystal Clear Image & Diagram Lightbox Modal */}
        <ContentImageLightbox
          isOpen={lightboxState.isOpen}
          onClose={() => setLightboxState((prev) => ({ ...prev, isOpen: false }))}
          imageUrl={lightboxState.imageUrl}
          altText={lightboxState.altText}
          title={lightboxState.title}
          caption={lightboxState.caption}
        />
      </div>
    </div>
  );
}
