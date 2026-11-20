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
          className="flex items-center gap-2 py-3 px-5 bg-white text-black rounded-full text-xs font-bold transition-all shadow-md hover:bg-neutral-200 cursor-pointer"
        >
          Take 5-Min Diagnostic
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Manual Tester Transition Roadmap Guide (Emergent Card) */}
      <div id="manual-qa-roadmap" className="p-6 rounded-[24px] bg-[#161616] border border-[#262626] text-white shadow-xl space-y-4 scroll-mt-24">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide bg-[#81FF89] text-black">
              Recommended Sequence
            </span>
            <h2 className="text-base sm:text-lg font-bold text-white">Manual QA to Full-Stack SDET Progression Roadmap</h2>
          </div>
          <span className="text-xs text-[#A1A1AA] font-mono">Total SDET Curriculum: 88 Hours · 38 Lessons</span>
        </div>
        <p className="text-xs sm:text-sm text-[#D4D4D8] leading-relaxed">
          If you are transitioning from a manual testing background, sequence is everything. Start with Core Java &amp; Selenium to master DOM locators and OOPs architecture, level up to Playwright for modern auto-waiting, transition Postman tests to REST Assured code, and master AI agent workflows.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 text-xs">
          <div className="p-3 rounded-xl bg-[#141414] border border-amber-500/30">
            <div className="text-amber-400 font-bold">Stage 1 · 26h</div>
            <div className="font-semibold text-white">Selenium (Java)</div>
            <div className="text-[11px] text-[#A1A1AA] mt-0.5">OOPs &amp; DOM Foundation</div>
          </div>
          <div className="p-3 rounded-xl bg-[#141414] border border-[#81FF89]/30">
            <div className="text-[#81FF89] font-bold">Stage 2 · 24h</div>
            <div className="font-semibold text-white">Playwright (TS)</div>
            <div className="text-[11px] text-[#A1A1AA] mt-0.5">Auto-Waiting &amp; Async Web</div>
          </div>
          <div className="p-3 rounded-xl bg-[#141414] border border-[#80FFF9]/30">
            <div className="text-[#80FFF9] font-bold">Stage 3 · 18h</div>
            <div className="font-semibold text-white">Rest Assured (API)</div>
            <div className="text-[11px] text-[#A1A1AA] mt-0.5">Postman to Code-Based API</div>
          </div>
          <div className="p-3 rounded-xl bg-[#141414] border border-cyan-500/30">
            <div className="text-cyan-400 font-bold">Stage 4 · 20h</div>
            <div className="font-semibold text-white">AI for QA</div>
            <div className="text-[11px] text-[#A1A1AA] mt-0.5">Prompts &amp; Autonomous Agents</div>
          </div>
        </div>
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
              className="emergent-card rounded-[24px] border border-[#262626] bg-[#161616] p-6 shadow-sm flex flex-col justify-between space-y-6 hover:border-[#81FF89]/40 transition-all hover:shadow-md"
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
                  <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
                    {track.id === 'selenium-java'
                      ? 'Stage 1 · Core Foundation'
                      : track.id === 'playwright-ts'
                      ? 'Stage 2 · Modern Web Testing'
                      : track.id === 'api-testing'
                      ? 'Stage 3 · API Automation'
                      : track.id === 'ai-qa'
                      ? 'Stage 4 · AI Augmentation'
                      : 'Capstone · SDET Interview Simulation'}
                  </div>
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
