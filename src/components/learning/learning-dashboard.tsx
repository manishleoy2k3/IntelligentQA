'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  BookOpen,
  CheckCircle2,
  Clock,
  Bookmark,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Layers,
  Trash2,
  Heart,
  ShieldCheck,
  Compass,
} from 'lucide-react';
import { QADatabase, DEMO_USER } from '@/lib/qa-db';

interface LearningDashboardProps {
  userId?: string;
  className?: string;
}

export default function LearningDashboard({ userId, className = '' }: LearningDashboardProps) {
  const [stats, setStats] = useState<any | null>(null);
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'progress' | 'recent' | 'completed' | 'bookmarks'>(
    'progress'
  );

  const resolvedUserId = userId || QADatabase.getCurrentUser()?.id || DEMO_USER.id;

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [progRes, bmRes] = await Promise.all([
        fetch(`/api/learning/progress?userId=${encodeURIComponent(resolvedUserId)}&summary=true`),
        fetch(`/api/learning/bookmarks?userId=${encodeURIComponent(resolvedUserId)}`),
      ]);

      if (progRes.ok) {
        const progJson = await progRes.json();
        if (progJson.success && progJson.summary) {
          setStats(progJson.summary);
        }
      }

      if (bmRes.ok) {
        const bmJson = await bmRes.json();
        if (bmJson.success && Array.isArray(bmJson.data)) {
          setBookmarks(bmJson.data);
        }
      }
    } catch (err) {
      console.error('Failed to load learning dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [resolvedUserId]);

  useEffect(() => {
    loadData();

    if (typeof window !== 'undefined') {
      window.addEventListener('intelligentqa_progress_updated', loadData);
      window.addEventListener('intelligentqa_bookmarks_updated', loadData);
      return () => {
        window.removeEventListener('intelligentqa_progress_updated', loadData);
        window.removeEventListener('intelligentqa_bookmarks_updated', loadData);
      };
    }
  }, [loadData]);

  const handleRemoveBookmark = async (lessonId: string) => {
    try {
      await fetch(
        `/api/learning/bookmarks?userId=${encodeURIComponent(resolvedUserId)}&lessonId=${encodeURIComponent(lessonId)}`,
        {
          method: 'DELETE',
        }
      );
      setBookmarks((prev) => prev.filter((b) => b.lessonId !== lessonId));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('intelligentqa_bookmarks_updated'));
      }
    } catch (err) {
      console.error('Failed to remove bookmark:', err);
    }
  };

  const handleEnrollCourse = async (courseId: string) => {
    try {
      await fetch('/api/learning/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: resolvedUserId, courseId }),
      });
      loadData();
    } catch (err) {
      console.error('Failed to enroll:', err);
    }
  };

  const courseList = stats?.courseProgress || [];
  const completedList = stats?.completedLessons || [];
  const recentList = stats?.recentlyViewedLessons || [];
  const totalCompleted = stats?.totalCompleted || 0;
  const totalVisited = stats?.totalVisited || 0;
  const overallPercent = stats?.overallPercentCompleted || 0;
  const lastAccessed = stats?.lastAccessedLesson;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 1. Header Banner & Free QA Community Guarantee */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-cyan-950 border border-emerald-500/30 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Learning Academy Dashboard</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1 leading-relaxed">
            Track your visited lessons, completed modules, and bookmarked documentation across AI
            Academy and test automation tracks with zero subscriptions or paywalls.
          </p>
        </div>

        {/* Quick Action: Continue Last Lesson */}
        {lastAccessed ? (
          <Link
            href={`/learning/${lastAccessed.lessonSlug}`}
            className="group flex flex-col p-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 transition-all shrink-0 max-w-xs self-start md:self-auto shadow-md"
          >
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 mb-1 flex items-center gap-1">
              <Clock className="w-3 h-3" /> Resume Learning
            </span>
            <span className="text-xs font-bold text-white truncate group-hover:text-emerald-300 transition-colors">
              {lastAccessed.lessonTitle}
            </span>
            <span className="text-[11px] text-slate-400 truncate mt-0.5">
              {lastAccessed.courseTitle} • {lastAccessed.moduleTitle}
            </span>
          </Link>
        ) : (
          <Link
            href="/learning"
            className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md shrink-0 self-start md:self-auto"
          >
            <BookOpen className="w-4 h-4" />
            <span>Explore Academy Lessons</span>
          </Link>
        )}
      </div>

      {/* 2. Key Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center gap-2 text-slate-500 dark:text-neutral-400 text-xs font-medium mb-1">
            <BookOpen className="w-3.5 h-3.5 text-blue-500" />
            <span>Visited Lessons</span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {totalVisited}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Across all courses</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center gap-2 text-slate-500 dark:text-neutral-400 text-xs font-medium mb-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Completed</span>
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {totalCompleted}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">{overallPercent}% completion rate</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center gap-2 text-slate-500 dark:text-neutral-400 text-xs font-medium mb-1">
            <Bookmark className="w-3.5 h-3.5 text-amber-500" />
            <span>My Bookmarks</span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {bookmarks.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Saved for revision</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center gap-2 text-slate-500 dark:text-neutral-400 text-xs font-medium mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-cyan-500" />
            <span>Courses Active</span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {courseList.filter((c: any) => c.visitedLessons > 0).length || 1}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Enrolled / in progress</div>
        </div>
      </div>

      {/* 3. Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('progress')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === 'progress'
              ? 'bg-emerald-500 text-white shadow-sm'
              : 'text-slate-600 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Enrolled Courses & Progress</span>
        </button>

        <button
          onClick={() => setActiveTab('recent')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === 'recent'
              ? 'bg-emerald-500 text-white shadow-sm'
              : 'text-slate-600 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-800'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Recently Viewed ({recentList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === 'completed'
              ? 'bg-emerald-500 text-white shadow-sm'
              : 'text-slate-600 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-800'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Completed Lessons ({completedList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('bookmarks')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTab === 'bookmarks'
              ? 'bg-emerald-500 text-white shadow-sm'
              : 'text-slate-600 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-800'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5" />
          <span>My Bookmarks ({bookmarks.length})</span>
        </button>
      </div>

      {/* 4. Tab 1: Enrolled Courses & Module Breakdown */}
      {activeTab === 'progress' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {courseList.map((course: any) => {
              const isEnrolled =
                course.visitedLessons > 0 ||
                (stats?.enrolledCourseIds || []).includes(course.courseId);

              return (
                <div
                  key={course.courseId}
                  className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        {course.level || 'All Levels'}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-800 dark:text-neutral-200">
                        {course.percentCompleted}% Completed
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        {course.courseTitle}
                      </h3>
                      <div className="text-xs text-slate-500 dark:text-neutral-400 mt-1 flex items-center gap-2">
                        <span>{course.totalLessons} Lessons</span>
                        <span>•</span>
                        <span>{course.modules?.length || 0} Modules</span>
                        <span>•</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                          {course.completedLessons} Done
                        </span>
                      </div>
                    </div>

                    {/* Course Progress Bar */}
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                        style={{ width: `${course.percentCompleted}%` }}
                      />
                    </div>

                    {/* Module Progress Breakdown */}
                    {course.modules && course.modules.length > 0 && (
                      <div className="pt-2 space-y-2">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                          Module Breakdown
                        </span>
                        <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                          {course.modules.map((m: any) => (
                            <div
                              key={m.moduleId}
                              className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs flex items-center justify-between gap-2"
                            >
                              <span className="truncate text-slate-700 dark:text-neutral-300 font-medium">
                                {m.moduleTitle}
                              </span>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-[11px] text-slate-400">
                                  {m.completedLessons}/{m.totalLessons}
                                </span>
                                <span className="font-mono text-[11px] font-bold text-emerald-600 dark:text-emerald-400 w-8 text-right">
                                  {m.percentCompleted}%
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      {isEnrolled ? 'Enrolled (Free Community)' : 'Open to All QA'}
                    </span>
                    <Link
                      href={`/learning`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                    >
                      <span>{course.completedLessons > 0 ? 'Resume Lessons' : 'Start Course'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. Tab 2: Recently Viewed Lessons */}
      {activeTab === 'recent' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Recently Viewed Lessons
          </h3>

          {recentList.length === 0 ? (
            <div className="text-center py-12 text-slate-500 dark:text-neutral-400 text-xs">
              No recently viewed lessons yet. Start reading any Academy lesson!
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {recentList.map((item: any) => (
                <div key={item.lessonId} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] font-semibold px-2 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-neutral-400">
                        {item.courseTitle}
                      </span>
                      <span className="text-[11px] text-slate-400 truncate">
                        {item.moduleTitle}
                      </span>
                      {item.completionStatus === 'completed' && (
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3" /> Done
                        </span>
                      )}
                    </div>
                    <Link
                      href={`/learning/${item.lessonSlug}`}
                      className="font-bold text-sm text-slate-900 dark:text-slate-100 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors truncate block"
                    >
                      {item.lessonTitle}
                    </Link>
                    <span className="text-[11px] text-slate-400">
                      Accessed {new Date(item.lastAccessedAt).toLocaleString()}
                    </span>
                  </div>

                  <Link
                    href={`/learning/${item.lessonSlug}`}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-semibold text-xs transition-colors shrink-0 flex items-center gap-1"
                  >
                    <span>Read</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 6. Tab 3: Completed Lessons */}
      {activeTab === 'completed' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Completed Lessons ({completedList.length})
            </h3>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
              {overallPercent}% Curriculum Complete
            </span>
          </div>

          {completedList.length === 0 ? (
            <div className="text-center py-12 text-slate-500 dark:text-neutral-400 text-xs">
              No completed lessons yet. Mark lessons complete as you finish them!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {completedList.map((item: any) => (
                <div
                  key={item.lessonId}
                  className="p-3.5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold truncate mb-0.5">
                      {item.courseTitle} • {item.moduleTitle}
                    </div>
                    <Link
                      href={`/learning/${item.lessonSlug}`}
                      className="font-bold text-slate-900 dark:text-slate-100 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors truncate block"
                    >
                      {item.lessonTitle}
                    </Link>
                    <span className="text-[10px] text-slate-400">
                      Completed {new Date(item.completedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="shrink-0 p-1.5 rounded-lg bg-emerald-500 text-white">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 7. Tab 4: My Bookmarks Section */}
      {activeTab === 'bookmarks' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              My Bookmarked Lessons ({bookmarks.length})
            </h3>
            <span className="text-xs text-slate-500 dark:text-neutral-400">
              Personal quick reference library
            </span>
          </div>

          {bookmarks.length === 0 ? (
            <div className="text-center py-12 text-slate-500 dark:text-neutral-400 text-xs">
              No bookmarked lessons yet. Click the bookmark icon on any lesson to save it here!
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {bookmarks.map((bm: any) => (
                <div key={bm.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] font-semibold px-2 py-0.2 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400">
                        {bm.courseTitle}
                      </span>
                      <span className="text-[11px] text-slate-400 truncate">{bm.moduleTitle}</span>
                    </div>
                    <Link
                      href={`/learning/${bm.lessonSlug}`}
                      className="font-bold text-sm text-slate-900 dark:text-slate-100 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors truncate block"
                    >
                      {bm.lessonTitle}
                    </Link>
                    <span className="text-[10px] text-slate-400">
                      Saved {new Date(bm.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/learning/${bm.lessonSlug}`}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-semibold text-xs transition-colors flex items-center gap-1"
                    >
                      <span>Open</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>

                    <button
                      onClick={() => handleRemoveBookmark(bm.lessonId)}
                      title="Remove Bookmark"
                      className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
