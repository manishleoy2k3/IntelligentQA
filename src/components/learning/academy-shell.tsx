'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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

interface AcademyShellProps {
  initialLessonSlug?: string;
}

export default function AcademyShell({ initialLessonSlug }: AcademyShellProps) {
  const router = useRouter();

  // White / Light theme by default, with dark mode toggle support
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Active lesson slug: defaults to initialLessonSlug or 'what-is-an-llm' (first rich demo lesson)
  const defaultSlug = initialLessonSlug || 'what-is-an-llm';
  const [activeSlug, setActiveSlug] = useState<string>(defaultSlug);

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
        // Explicit requirement: "White/light theme by default"
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

  // Resolve current active lesson
  const currentLesson: AcademyLessonData =
    getLessonBySlug(activeSlug) ||
    getLessonBySlug('what-is-an-llm') ||
    getAllLessons()[0];

  // Resolve adjacent lessons for navigation footer
  const { previousLesson, nextLesson } = getAdjacentLessons(currentLesson.slug);

  const handleSelectLesson = (slug: string) => {
    setActiveSlug(slug);
    setMobileSidebarOpen(false);
    // Smooth scroll content to top
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0f1117] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
        {/* A. Top Navigation Header */}
        <AcademyHeader
          theme={theme}
          onToggleTheme={toggleTheme}
          onOpenSearch={() => setIsSearchOpen(true)}
          mobileSidebarOpen={mobileSidebarOpen}
          onToggleMobileSidebar={() => setMobileSidebarOpen((prev) => !prev)}
        />

        {/* B & C. Body Container: Left Sidebar + Right Content Panel */}
        <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
          {/* Desktop Left Sidebar */}
          <div className="hidden md:block">
            <CourseSidebar
              activeLessonSlug={currentLesson.slug}
              onSelectLesson={handleSelectLesson}
            />
          </div>

          {/* Mobile Sidebar Slide-Over Drawer */}
          {mobileSidebarOpen && (
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
                  className="w-full h-full border-r-0"
                />
              </div>
            </div>
          )}

          {/* C. Right Content Panel */}
          <main className="flex-1 min-w-0 px-4 sm:px-8 lg:px-12 py-8 bg-white dark:bg-[#0f1117]">
            <div className="max-w-4xl mx-auto">
              {/* Breadcrumbs */}
              <LessonBreadcrumb
                items={[
                  { label: currentLesson.moduleTitle },
                  { label: currentLesson.title, active: true },
                ]}
              />

              {/* Lesson Header */}
              <LessonHeader
                title={currentLesson.title}
                moduleTitle={currentLesson.moduleTitle}
                estimatedTime={currentLesson.estimatedTime}
                difficulty={currentLesson.difficulty}
                tags={currentLesson.tags}
                summary={currentLesson.summary}
              />

              {/* Lesson Sections (Diagrams, Code, Callouts, Tables, Troubleshooting) */}
              <div className="space-y-2">
                {currentLesson.sections.map((section) => (
                  <LessonSection key={section.id} section={section} />
                ))}
              </div>

              {/* Previous / Next Lesson Navigation Cards */}
              <PreviousNextNavigation
                previousLesson={previousLesson}
                nextLesson={nextLesson}
              />
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
