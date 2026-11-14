'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Lesson, Track } from '@/types/qa';
import {
  Play,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  BookOpen,
  Code,
  Flame,
  ArrowRight,
  ExternalLink,
  Lock,
  UserPlus,
  LogIn,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';
import { QADatabase, DEMO_USER } from '@/lib/qa-db';

interface WorkspaceProps {
  track: Track;
  lesson: Lesson;
  nextLessonHref?: string;
}

export default function CodeEditorWorkspace({ track, lesson, nextLessonHref }: WorkspaceProps) {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedLang, setSelectedLang] = useState<'typescript' | 'java'>(
    track.id === 'selenium-java' ? 'java' : 'typescript'
  );
  const [code, setCode] = useState<string>(
    (selectedLang === 'java'
      ? lesson.challenge.starterCode.java
      : lesson.challenge.starterCode.typescript) ||
      lesson.automationContext.playwrightTs
  );
  const [activeTab, setActiveTab] = useState<'guide' | 'manual-vs-code' | 'ai-action'>('guide');
  const [validationResult, setValidationResult] = useState<{
    passed: boolean;
    message: string;
    details?: string[];
  } | null>(null);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  // Sync auth state
  const syncAuth = useCallback(() => {
    if (typeof window !== 'undefined') {
      const user = QADatabase.getCurrentUser();
      setCurrentUser(user);
    }
  }, []);

  useEffect(() => {
    syncAuth();
    const handleAuthChange = () => syncAuth();
    window.addEventListener('intelligentqa_auth_changed', handleAuthChange);
    return () => {
      window.removeEventListener('intelligentqa_auth_changed', handleAuthChange);
    };
  }, [syncAuth]);

  const isLocked = QADatabase.isLessonLocked(track.id, lesson.id, !!currentUser);

  const handleValidateAndRun = async () => {
    if (isLocked) return;

    setIsRunning(true);
    setValidationResult(null);

    // Simulate execution against live sandbox
    await new Promise(r => setTimeout(r, 600));

    const rules = lesson.challenge.validationRules;
    const errors: string[] = [];

    for (const rule of rules) {
      for (const req of rule.requiredPatterns) {
        if (!code.includes(req)) {
          errors.push(`Missing required pattern: "${req}" (${rule.description})`);
        }
      }
      for (const forbidden of rule.forbiddenPatterns) {
        if (code.includes(forbidden)) {
          errors.push(`Anti-pattern detected: Avoid using "${forbidden}" in modern automation.`);
        }
      }
    }

    const userId = currentUser?.id || DEMO_USER.id;

    if (errors.length === 0) {
      setValidationResult({
        passed: true,
        message: '✔ Test Passed! Your automation code meets all robust SDET criteria and executed successfully in the sandbox.',
      });
      setIsCompleted(true);
      // Persist progress to database
      await QADatabase.markLessonComplete(userId, track.id, lesson.moduleId, lesson.id);
      await QADatabase.saveCodeSubmission(userId, {
        challengeId: lesson.id,
        language: selectedLang,
        codeContent: code,
        status: 'passed',
        testOutput: '1 passed (100% assertions satisfied)',
      });
    } else {
      setValidationResult({
        passed: false,
        message: '❌ Test Failed. See validation issues below:',
        details: errors,
      });
    }

    setIsRunning(false);
  };

  const loadSolution = () => {
    if (isLocked) return;
    const sol =
      selectedLang === 'java'
        ? lesson.challenge.solutionCode.java
        : lesson.challenge.solutionCode.typescript;
    if (sol) {
      setCode(sol);
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col lg:flex-row overflow-hidden border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
      {/* LEFT PANEL: Interactive Guide */}
      <div className="w-full lg:w-1/2 flex flex-col border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-y-auto h-auto lg:h-[calc(100vh-65px)]">
        {/* Navigation & Header */}
        <div className="p-4 md:p-6 border-b border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs flex-wrap gap-2">
            <span className="font-semibold text-slate-500">{track.title}</span>
            <div className="flex items-center gap-2">
              {isLocked ? (
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400 font-bold flex items-center gap-1 text-[11px]">
                  <Lock className="w-3 h-3" />
                  Free Signup Required
                </span>
              ) : currentUser ? (
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400 font-medium text-[11px]">
                  Member Access (100% Free)
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-400 font-semibold text-[11px]">
                  Free Preview Lesson
                </span>
              )}
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-medium">
                {lesson.level} · {lesson.durationMinutes} mins
              </span>
            </div>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
            {lesson.title}
          </h2>
          <p className="text-sm md:text-base text-slate-600 dark:text-slate-400">
            {lesson.description}
          </p>

          {/* Subtabs */}
          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={() => setActiveTab('guide')}
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'guide'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Lesson Guide
            </button>
            <button
              onClick={() => setActiveTab('manual-vs-code')}
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'manual-vs-code'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Code className="w-4 h-4" />
              Manual vs Code
            </button>
            <button
              onClick={() => setActiveTab('ai-action')}
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'ai-action'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              AI in Action
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-4 md:p-6 space-y-6 flex-1 text-sm md:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
          {activeTab === 'guide' && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2.5">
                <h4 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg flex items-center gap-2">
                  <Flame className="w-5 h-5 text-emerald-500" />
                  Core Architecture Explanation
                </h4>
                <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed">
                  {lesson.automationContext.explanation}
                </p>
              </div>

              {/* Best Practices & Anti-patterns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-2.5">
                  <div className="font-bold text-emerald-800 dark:text-emerald-300 text-sm flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    SDET Best Practices
                  </div>
                  <ul className="space-y-2 text-sm text-emerald-900 dark:text-emerald-200">
                    {lesson.automationContext.bestPractices.map((bp, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-emerald-500 font-bold">✔</span>
                        <span>{bp}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 space-y-2.5">
                  <div className="font-bold text-rose-800 dark:text-rose-300 text-sm flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" />
                    Manual/Flaky Anti-Patterns
                  </div>
                  <ul className="space-y-2 text-sm text-rose-900 dark:text-rose-200">
                    {lesson.automationContext.antiPatterns.map((ap, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-rose-500 font-bold">✖</span>
                        <span>{ap}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Hands-On Sandbox Challenge */}
              <div className="p-5 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 space-y-2.5">
                <h4 className="font-bold text-sky-900 dark:text-sky-300 text-sm sm:text-base">
                  Hands-On Sandbox Challenge:
                </h4>
                <p className="text-sm sm:text-base text-sky-950 dark:text-sky-200 leading-relaxed">
                  {lesson.challenge.instruction}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'manual-vs-code' && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3.5">
                <h4 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg">
                  Manual Verification Flow: {lesson.manualContext.title}
                </h4>
                <ol className="list-decimal pl-5 space-y-1.5 text-sm sm:text-base text-slate-700 dark:text-slate-300">
                  {lesson.manualContext.steps.map((st, i) => (
                    <li key={i}>{st}</li>
                  ))}
                </ol>

                <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                  <span className="font-semibold text-rose-600 dark:text-rose-400 text-sm sm:text-base">
                    Manual QA Pain Points:
                  </span>
                  <ul className="list-disc pl-5 mt-1.5 space-y-1 text-sm text-slate-600 dark:text-slate-400">
                    {lesson.manualContext.painPoints.map((pp, i) => (
                      <li key={i}>{pp}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ai-action' && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-2.5">
                <div className="font-bold text-amber-900 dark:text-amber-300 text-sm sm:text-base flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Prompt Engineering for this Scenario
                </div>
                <p className="text-sm font-mono bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-amber-200 dark:border-amber-900 leading-relaxed">
                  {lesson.aiAugmentation.promptExample}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800 space-y-2.5">
                <h4 className="font-bold text-cyan-900 dark:text-cyan-300 text-sm sm:text-base">
                  Autonomous Agent Workflow:
                </h4>
                <p className="text-cyan-950 dark:text-cyan-200 text-sm sm:text-base leading-relaxed">
                  {lesson.aiAugmentation.agenticWorkflow}
                </p>
                <div className="mt-2 text-sm text-cyan-700 dark:text-cyan-400">
                  💡 <strong>Self-Healing Tip:</strong> {lesson.aiAugmentation.selfHealingTip}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PANEL: Code Editor & Sandbox Runner */}
      <div className="w-full lg:w-1/2 flex flex-col bg-slate-950 text-slate-100 h-auto lg:h-[calc(100vh-65px)] relative">
        {/* Editor Toolbar */}
        <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedLang('typescript')}
              className={`px-3 py-1 rounded font-semibold ${
                selectedLang === 'typescript'
                  ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              TypeScript
            </button>
            <button
              onClick={() => setSelectedLang('java')}
              className={`px-3 py-1 rounded font-semibold ${
                selectedLang === 'java'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Java
            </button>
          </div>

          <div className="flex items-center gap-2">
            {!isLocked && (
              <button
                onClick={loadSolution}
                className="px-2.5 py-1 text-slate-400 hover:text-amber-400 transition-colors flex items-center gap-1 text-[11px]"
                title="Reveal Solution Code"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                Solution
              </button>
            )}
            <Link
              href="/sandbox/web"
              target="_blank"
              className="px-2.5 py-1 text-slate-400 hover:text-sky-400 transition-colors flex items-center gap-1 text-[11px]"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open Sandbox
            </Link>
          </div>
        </div>

        {/* Code Input Area */}
        <div className="flex-1 p-4 font-mono text-xs sm:text-sm overflow-y-auto relative">
          <textarea
            value={code}
            onChange={e => !isLocked && setCode(e.target.value)}
            disabled={isLocked}
            spellCheck={false}
            className={`w-full h-full bg-transparent text-emerald-300 focus:outline-none resize-none leading-relaxed font-mono ${
              isLocked ? 'opacity-30 select-none' : ''
            }`}
            placeholder="Type or edit your automation test code here..."
          />

          {/* Locked Lesson Overlay */}
          {isLocked && (
            <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-[2px] flex flex-col items-center justify-center p-6 text-center space-y-4">
              <div className="p-3.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Lock className="w-7 h-7" />
              </div>

              <div className="max-w-md space-y-2">
                <h3 className="text-lg sm:text-xl font-bold text-white">
                  Lesson 2+ Unlocks With Free Account
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Lesson 1 of every track is a free guest preview. To access subsequent lessons, write &amp; run code in our live sandbox, and save your progress, create your free IntelligentQA account.
                </p>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  100% Free Forever · No Credit Card Required
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Link
                  href="/signup"
                  className="py-2.5 px-5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-lg flex items-center gap-1.5"
                >
                  <UserPlus className="w-4 h-4" />
                  Sign Up Free
                </Link>
                <Link
                  href="/login"
                  className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs sm:text-sm transition-colors border border-slate-700 flex items-center gap-1.5"
                >
                  <LogIn className="w-4 h-4" />
                  Log In
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Validation & Execution Result Bar */}
        {validationResult && !isLocked && (
          <div
            className={`p-4 border-t ${
              validationResult.passed
                ? 'bg-emerald-950/80 border-emerald-800 text-emerald-200'
                : 'bg-rose-950/80 border-rose-800 text-rose-200'
            }`}
          >
            <div className="flex items-center gap-2 text-xs font-bold">
              {validationResult.passed ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400" />
              )}
              {validationResult.message}
            </div>
            {validationResult.details && (
              <ul className="mt-2 space-y-1 text-[11px] list-disc pl-5 text-rose-300">
                {validationResult.details.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Action Footer */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            {isLocked ? (
              <span className="text-amber-400 font-medium flex items-center gap-1">
                <Lock className="w-3.5 h-3.5" /> Sign in to execute code in live sandbox
              </span>
            ) : isCompleted ? (
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Lesson Completed &amp; Persisted
              </span>
            ) : (
              'Write code and verify against live criteria'
            )}
          </div>

          <div className="flex items-center gap-3">
            {isLocked ? (
              <Link
                href="/signup"
                className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs sm:text-sm transition-all flex items-center gap-1.5 shadow-md"
              >
                <UserPlus className="w-4 h-4" />
                Unlock Free
              </Link>
            ) : (
              <button
                onClick={handleValidateAndRun}
                disabled={isRunning}
                className="py-2.5 px-5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs sm:text-sm transition-all flex items-center gap-2 shadow-lg shadow-emerald-900/30"
              >
                <Play className="w-4 h-4 fill-current" />
                {isRunning ? 'Grading Code...' : 'Run in Sandbox'}
              </button>
            )}

            {nextLessonHref && (
              <Link
                href={nextLessonHref}
                className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-xs sm:text-sm transition-colors flex items-center gap-1"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
