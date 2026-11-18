'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Track } from '@/types/qa';
import { QADatabase } from '@/lib/qa-db';
import {
  Sparkles,
  Clock,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Lock,
  Download,
  Upload,
} from 'lucide-react';

interface TrackOverviewClientProps {
  initialTrack: Track;
  guideSlug: string;
}

export default function TrackOverviewClient({
  initialTrack,
  guideSlug,
}: TrackOverviewClientProps) {
  const [track, setTrack] = useState<Track>(() => {
    if (typeof window !== 'undefined') {
      const fromDb = QADatabase.getTrackById(initialTrack.id);
      if (fromDb) return fromDb;
    }
    return initialTrack;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const syncTrack = () => {
        const fromDb = QADatabase.getTrackById(initialTrack.id);
        if (fromDb) {
          setTrack(fromDb);
        }
      };
      syncTrack();
      window.addEventListener('intelligentqa_curriculum_updated', syncTrack);
      return () => {
        window.removeEventListener('intelligentqa_curriculum_updated', syncTrack);
      };
    }
  }, [initialTrack.id]);

  const allLessons = track.modules.flatMap((m) => m.lessons);
  const firstLesson = allLessons[0];

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-8 space-y-8">
      {/* Header */}
      <div className="space-y-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${track.badgeColor}`}>
            {track.title}
          </span>
          <span className="text-xs text-slate-500 font-medium">
            {track.totalLessons} Lessons · Self-Paced Learning
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {track.title}
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
          {track.description}
        </p>

        {/* Free Access Policy Pill */}
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-900 dark:text-emerald-200 text-xs flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>100% Free Learning Portal:</strong> Lesson 1 is open for guest preview. Create a free account to unlock all subsequent modules and in-browser code labs.
            </span>
          </div>
          <Link
            href="/signup"
            className="text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:underline shrink-0"
          >
            Create Free Account →
          </Link>
        </div>

        {firstLesson && (
          <div className="pt-2">
            <Link
              href={`/tracks/${track.id}/${firstLesson.id}`}
              className="py-3 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm inline-flex items-center gap-2 shadow-md transition-all"
            >
              Start Free Preview: {firstLesson.title}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Concept Guides & Import Hub */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {track.title} Concept Guides &amp; Architecture Library
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Explore in-depth architecture explanations, code snippets, interview tips, or import custom guides.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href={`/guides/${guideSlug}?action=template`}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 inline-flex items-center gap-1.5 transition-colors shadow-xs"
              title="Download or preview JSON/CSV guide import template"
            >
              <Download className="w-3.5 h-3.5 text-blue-500" />
              <span>Import Template</span>
            </Link>

            <Link
              href={`/guides/${guideSlug}?action=import`}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 inline-flex items-center gap-1.5 transition-colors shadow-xs"
              title="Import concept guides from JSON or CSV"
            >
              <Upload className="w-3.5 h-3.5 text-emerald-500" />
              <span>Import Guide</span>
            </Link>

            <Link
              href={`/guides/${guideSlug}`}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white inline-flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <span>Browse Guides</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Modules & Lessons List */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Curriculum Modules</h2>
        {track.modules.map((module, mIdx) => (
          <div
            key={module.id}
            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 space-y-4 shadow-sm"
          >
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {module.title}
              </h3>
              <p className="text-sm sm:text-base text-slate-500 mt-1">{module.description}</p>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 pt-1">
              {module.lessons.map((lesson, lIdx) => {
                const isPreview = mIdx === 0 && lIdx === 0;
                return (
                  <div
                    key={lesson.id}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 p-2.5 rounded-2xl transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                          {lesson.title}
                        </span>
                        <span className="px-2.5 py-0.5 text-xs rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                          {lesson.level}
                        </span>
                        {isPreview ? (
                          <span className="px-2.5 py-0.5 text-xs rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400 font-semibold">
                            Free Guest Preview
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 text-xs rounded-full bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 font-medium flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                            Free with Signup
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 leading-relaxed">{lesson.description}</p>
                    </div>

                    <Link
                      href={`/tracks/${track.id}/${lesson.id}`}
                      className={`py-2 px-4 rounded-xl text-sm font-semibold transition-colors shrink-0 flex items-center gap-1.5 self-start sm:self-auto ${
                        isPreview
                          ? 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {isPreview ? 'Preview Free' : 'Open Workspace'}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
