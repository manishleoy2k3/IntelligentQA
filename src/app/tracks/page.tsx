'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  PlayCircle,
  Code,
  Server,
  Award,
  ArrowRight,
  CheckCircle2,
  Clock,
  BookOpen,
} from 'lucide-react';
import { QA_TRACKS } from '@/lib/qa-curriculum';
import { QADatabase, DEMO_USER } from '@/lib/qa-db';
import { UserProgress } from '@/types/qa';

export default function TracksDirectoryPage() {
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);

  useEffect(() => {
    const user = QADatabase.getCurrentUser() || DEMO_USER;
    QADatabase.getProgress(user.id).then(setUserProgress);
  }, []);

  const getProgressPercentage = (trackId: string, totalLessons: number) => {
    const completed = userProgress.filter(p => p.trackId === trackId && p.status === 'completed').length;
    if (totalLessons === 0) return 0;
    return Math.min(Math.round((completed / totalLessons) * 100), 100);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            5 Structured SDET Paths
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Learning Tracks &amp; Curriculum
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1 max-w-2xl">
            Choose your starting path from scratch. Seamlessly switch between tracks at any time with independent progress tracking.
          </p>
        </div>

        <Link
          href="/assessment"
          className="flex items-center gap-2 py-2.5 px-4 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-xl text-xs font-bold transition-all shadow-sm hover:opacity-95"
        >
          Take 5-Min Diagnostic
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Tracks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {QA_TRACKS.map(track => {
          const progressPercent = getProgressPercentage(track.id, track.totalLessons);
          const firstLesson = track.modules[0]?.lessons[0];
          const firstLessonHref = firstLesson ? `/tracks/${track.id}/${firstLesson.id}` : `/tracks/${track.id}`;

          return (
            <div
              key={track.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between space-y-6 hover:border-slate-300 dark:hover:border-slate-700 transition-all hover:shadow-md"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${track.badgeColor}`}>
                    {track.title.split(' ')[0]}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Clock className="w-3.5 h-3.5" />
                    {track.estimatedHours} hrs
                  </div>
                </div>

                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-tight">
                    {track.title}
                  </h3>
                  <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
                    {track.tagline}
                  </p>
                  <p className="text-base text-slate-600 dark:text-slate-300 mt-2.5 leading-relaxed">
                    {track.description}
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex items-center justify-between text-sm font-medium">
                    <span className="text-slate-500">Progress</span>
                    <span className="text-slate-900 dark:text-white font-bold">
                      {progressPercent === 0 ? 'Not Started' : `${progressPercent}%`}
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Modules Outline */}
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-sm">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Modules Covered:</span>
                  <ul className="space-y-1.5 text-slate-500 dark:text-slate-400">
                    {track.modules.map(m => (
                      <li key={m.id} className="truncate">• {m.title}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500">
                  {track.totalLessons} Lessons
                </span>
                <Link
                  href={firstLessonHref}
                  className="py-2.5 px-4.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition-colors flex items-center gap-2 shadow-sm"
                >
                  {progressPercent === 0 ? 'Start Track' : progressPercent >= 100 ? 'Review Track' : 'Resume Track'}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
