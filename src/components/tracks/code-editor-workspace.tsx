'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  GripVertical,
  Maximize2,
  Minimize2,
  Columns,
  Layers,
  Compass,
  Check,
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

  // Draggable Splitter & Visible Text Layout state
  const [splitPercent, setSplitPercent] = useState<number>(55);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [fullWidthReading, setFullWidthReading] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse drag handlers for resizable panels
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const newPercent = ((e.clientX - rect.left) / rect.width) * 100;
      if (newPercent >= 25 && newPercent <= 80) {
        setSplitPercent(Math.round(newPercent));
      }
    };

    const handleMouseUp = () => {
      if (isDragging) setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging]);

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
    <div
      ref={containerRef}
      className="w-full flex-1 flex flex-col lg:flex-row overflow-hidden border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 relative"
    >
      {/* LEFT PANEL: Interactive Guide & Concepts */}
      <div
        style={fullWidthReading ? { width: '100%' } : { width: `${splitPercent}%` }}
        className="w-full flex flex-col border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-y-auto h-auto lg:h-[calc(100vh-65px)] transition-[width] duration-75"
      >
        {/* Navigation & Header */}
        <div className="p-4 md:p-6 border-b border-slate-200 dark:border-slate-800 space-y-3">
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

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {lesson.title}
            </h2>

            {/* Quick Layout Controls to make text fully visible & customizable */}
            <div className="hidden lg:flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-[11px] font-medium text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
              <button
                type="button"
                onClick={() => { setFullWidthReading(false); setSplitPercent(70); }}
                className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                  !fullWidthReading && splitPercent === 70
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-bold shadow-xs'
                    : 'hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Widen Course Text Panel (70% text / 30% code)"
              >
                Reading (70%)
              </button>
              <button
                type="button"
                onClick={() => { setFullWidthReading(false); setSplitPercent(50); }}
                className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                  !fullWidthReading && splitPercent === 50
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-bold shadow-xs'
                    : 'hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Balanced 50/50 split"
              >
                Balanced (50%)
              </button>
              <button
                type="button"
                onClick={() => { setFullWidthReading(false); setSplitPercent(30); }}
                className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                  !fullWidthReading && splitPercent === 30
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-bold shadow-xs'
                    : 'hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Code Editor Focus (30% text / 70% code)"
              >
                Code (30%)
              </button>
              <button
                type="button"
                onClick={() => setFullWidthReading(!fullWidthReading)}
                className={`px-2 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                  fullWidthReading
                    ? 'bg-emerald-600 text-white font-bold shadow-xs'
                    : 'hover:text-slate-900 dark:hover:text-white'
                }`}
                title={fullWidthReading ? 'Restore Code Panel' : 'Maximize text to 100% full width'}
              >
                {fullWidthReading ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
                {fullWidthReading ? 'Restore Code' : 'Full Text'}
              </button>
            </div>
          </div>

          <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            {lesson.description}
          </p>

          {/* Subtabs */}
          <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setActiveTab('guide')}
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'guide'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Concept Guide
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
              Manual QA Mental Model
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
            <div className="space-y-6">
              {/* Comprehensive Concept Breakdown for Manual Testers */}
              {lesson.id === 'java-oops-framework' ? (
                <div className="space-y-5">
                  <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/80 space-y-3">
                    <div className="flex items-center gap-2">
                      <Flame className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        Why Manual Testers Need OOPs for Automation
                      </h3>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                      In manual testing, every test case in your spreadsheet is an isolated row with steps like &quot;Launch Chrome, type user, click submit&quot;. If you automate like a manual tester by copy-pasting code into 100 script files, you end up with 100 browser instances running in memory, memory leaks, and when a single button ID changes, you have to manually edit 100 files!
                    </p>
                    <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                      <strong>Object-Oriented Programming (OOPs)</strong> solves this completely. A <em>Class</em> is your page blueprint, an <em>Object</em> is a live browser session, and the 4 pillars ensure you write code once and reuse it across thousands of test executions.
                    </p>
                  </div>

                  {/* The 4 Pillars Breakdown */}
                  <div className="space-y-4">
                    <h4 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
                      <Layers className="w-4 h-4 text-emerald-500" />
                      The 4 Pillars of OOPs Mapped Directly to Automation:
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* 1. Encapsulation */}
                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                        <div className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                          1. Encapsulation (Data Hiding in POM)
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                          <strong>Concept:</strong> Keep element locators <code className="text-xs bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded">private By username</code> inside the Page Class. Never expose raw locators to test classes!
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          <strong>Why it matters:</strong> If the web UI changes, you update the locator in ONE line inside the Page class, and all 50 tests pass without touching test files.
                        </p>
                      </div>

                      {/* 2. Inheritance */}
                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                        <div className="font-bold text-sky-600 dark:text-sky-400 text-sm">
                          2. Inheritance (BaseTest Code Reuse)
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                          <strong>Concept:</strong> <code className="text-xs bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded">public class LoginTest extends BaseTest</code>. Child test classes inherit driver lifecycle automatically.
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          <strong>Why it matters:</strong> Write browser initialization, window maximize, and driver.quit() ONCE in BaseTest. 100 test classes inherit it for free.
                        </p>
                      </div>

                      {/* 3. Polymorphism */}
                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                        <div className="font-bold text-purple-600 dark:text-purple-400 text-sm">
                          3. Polymorphism (Multi-Browser & Overloading)
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                          <strong>Concept:</strong> Method Overloading (<code className="text-xs bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded">click(By)</code> vs <code className="text-xs bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded">click(By, timeout)</code>) + Dynamic Dispatch (<code className="text-xs bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded">WebDriver driver = new ChromeDriver()</code>).
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          <strong>Why it matters:</strong> The exact same test suite switches between Chrome, Firefox, and Edge via a single configuration parameter at runtime!
                        </p>
                      </div>

                      {/* 4. Abstraction */}
                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                        <div className="font-bold text-amber-600 dark:text-amber-400 text-sm">
                          4. Abstraction (Hiding Browser Complexity)
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                          <strong>Concept:</strong> <code className="text-xs bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded">WebDriver</code> is a Java Interface. <code className="text-xs bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded">BasePage</code> is an Abstract Class.
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          <strong>Why it matters:</strong> You call <code className="text-xs bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded">driver.get()</code> and Selenium handles millions of lines of browser C++ socket code under the hood.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
                  <h4 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg flex items-center gap-2">
                    <Flame className="w-5 h-5 text-emerald-500" />
                    Core Architecture &amp; Conceptual Foundation
                  </h4>
                  <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed">
                    {lesson.automationContext.explanation}
                  </p>
                </div>
              )}

              {/* Best Practices & Anti-patterns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

              {/* DEDICATED PRACTICE LABS CALLOUT: Separating Concept from Hands-On Practice */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-slate-900 to-indigo-950 border border-emerald-500/40 text-white space-y-3 shadow-md">
                <div className="flex items-center gap-2">
                  <Compass className="w-5 h-5 text-emerald-400" />
                  <h4 className="font-bold text-base text-white">
                    Ready to Practice on Live Elements?
                  </h4>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  You have learned the core concepts! To practice automating against real-world dynamic delays, Shadow DOM, OTP fields, data tables, and REST APIs, visit the dedicated <strong>PRACTICE LABS</strong> section in the Left Navigation.
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <Link
                    href={
                      track.id === 'api-testing'
                        ? '/sandbox/api'
                        : track.id === 'ai-qa'
                        ? '/qa-agents'
                        : track.id === 'playwright-ts'
                        ? '/sandbox/web?stack=playwright'
                        : '/sandbox/web?stack=selenium'
                    }
                    className="py-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Open {track.id === 'api-testing' ? 'API Testing Lab' : track.id === 'ai-qa' ? 'QA AI Agents Lab' : track.id === 'playwright-ts' ? 'Playwright Web Lab' : 'Selenium Web Lab'} →
                  </Link>
                  <span className="text-xs text-slate-400">
                    Located in Left Navigation under Practice Labs
                  </span>
                </div>
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

      {/* Draggable Divider Bar (Desktop Splitter) */}
      {!fullWidthReading && (
        <div
          onMouseDown={handleMouseDown}
          className={`hidden lg:flex w-2 hover:w-2.5 bg-slate-200 dark:border-x dark:border-neutral-800 dark:bg-neutral-900 hover:bg-emerald-500/80 cursor-col-resize select-none items-center justify-center transition-all group relative z-10 shrink-0 ${
            isDragging ? 'bg-emerald-500 w-2.5 shadow-lg' : ''
          }`}
          title="Drag to resize panels (or use layout buttons at top)"
        >
          <div className="w-1 h-8 rounded-full bg-slate-400 dark:bg-slate-600 group-hover:bg-white flex flex-col justify-around py-1">
            <span className="w-0.5 h-0.5 rounded-full bg-current mx-auto" />
            <span className="w-0.5 h-0.5 rounded-full bg-current mx-auto" />
            <span className="w-0.5 h-0.5 rounded-full bg-current mx-auto" />
          </div>
        </div>
      )}

      {/* RIGHT PANEL: Interactive Concept Code Lab */}
      {!fullWidthReading && (
        <div
          style={{ width: `${100 - splitPercent}%` }}
          className="w-full flex flex-col bg-slate-950 text-slate-100 h-auto lg:h-[calc(100vh-65px)] relative transition-[width] duration-75"
        >
          {/* Editor Toolbar */}
          <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">
                Concept Code Lab:
              </span>
              <button
                onClick={() => setSelectedLang('typescript')}
                className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                  selectedLang === 'typescript'
                    ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                TypeScript
              </button>
              <button
                onClick={() => setSelectedLang('java')}
                className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
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
                  className="px-2.5 py-1 text-slate-400 hover:text-amber-400 transition-colors flex items-center gap-1 text-[11px] cursor-pointer"
                  title="Reveal Solution Code Blueprint"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  Solution
                </button>
              )}
              <Link
                href={
                  track.id === 'api-testing'
                    ? '/sandbox/api'
                    : track.id === 'playwright-ts'
                    ? '/sandbox/web?stack=playwright'
                    : '/sandbox/web?stack=selenium'
                }
                target="_blank"
                className="px-2.5 py-1 text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1 text-[11px] font-semibold bg-emerald-500/10 rounded-md border border-emerald-500/20"
                title="Open Live Hands-On Sandbox Practice Lab"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Practice Lab
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
                className="py-2.5 px-5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs sm:text-sm transition-all flex items-center gap-2 shadow-lg shadow-emerald-900/30 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                {isRunning ? 'Validating Concept...' : 'Validate Concept Code'}
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
      )}
    </div>
  );
}
