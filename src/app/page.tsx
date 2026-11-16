'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Code2,
  Server,
  Layers,
  Award,
  Bot,
  ShieldCheck,
  Zap,
  Terminal,
  BookOpen,
  Compass,
  User,
  GraduationCap,
  PlayCircle,
  HelpCircle,
  Lock,
  Play,
} from 'lucide-react';
import GoogleSignInButton from '@/components/auth/google-sign-in-button';
import { QADatabase } from '@/lib/qa-db';

export default function HomePage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const user = QADatabase.getCurrentUser();
      setCurrentUser(user);
      if (user) {
        router.replace('/dashboard');
      }

      const handleAuth = () => {
        const u = QADatabase.getCurrentUser();
        setCurrentUser(u);
        if (u) {
          router.replace('/dashboard');
        }
      };

      window.addEventListener('intelligentqa_auth_changed', handleAuth);
      return () => {
        window.removeEventListener('intelligentqa_auth_changed', handleAuth);
      };
    }
  }, [router]);

  // Logged-in users should NEVER see the marketing landing page details!
  if (currentUser) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 space-y-4 font-sans text-center">
        <div className="animate-spin w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Loading your SDET Learning Dashboard...
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm">
          Redirecting you directly to your personalized learning workspace.
        </p>
        <Link
          href="/dashboard"
          className="mt-2 py-3 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition-all shadow-md inline-flex items-center gap-2"
        >
          Go to Demo Dashboard
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-24 py-8 md:py-16 overflow-hidden">
      {/* 1. MINIMAL HERO SECTION */}
      <section className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-8">
        {/* Glow ambient background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[300px] bg-gradient-to-tr from-emerald-500/10 via-sky-500/10 to-indigo-500/10 blur-3xl pointer-events-none -z-10" />

        {/* Audience Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shadow-sm">
          <GraduationCap className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>Tailored Specifically for Manual QA Engineers Transitioning to SDET</span>
        </div>

        {/* Clear Headline */}
        <div className="space-y-5 max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.1]">
            From Manual Tester to{' '}
            <span className="bg-gradient-to-r from-emerald-500 via-sky-500 to-indigo-500 bg-clip-text text-transparent">
              Confident SDET.
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Master test automation without coding anxiety. Practice in zero-setup browser sandboxes, follow clear step-by-step curriculums, and choose whether to learn core automation or accelerate with free AI tools.
          </p>
        </div>

        {/* Logged In Dashboard CTA vs Guest Sign Up CTA */}
        {currentUser ? (
          <div className="max-w-md mx-auto text-center pt-2">
            <Link
              href="/dashboard"
              className="py-4 px-8 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl text-base transition-all shadow-md inline-flex items-center gap-2 active:scale-95"
            >
              Go to Demo Dashboard
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        ) : (
          <div className="max-w-md mx-auto space-y-3.5">
            {/* Primary Google Sign In */}
            <GoogleSignInButton
              buttonText="Continue with Google"
              className="py-4 text-base"
            />

            {/* Email Alternative Links */}
            <div className="flex items-center justify-center gap-4 text-sm text-slate-500 pt-1">
              <Link href="/signup" className="font-semibold text-slate-700 dark:text-slate-300 hover:underline">
                Or sign up with email →
              </Link>
              <span>·</span>
              <Link href="/login" className="hover:underline">
                Already have an account? Log in
              </Link>
            </div>
          </div>
        )}

        {/* Reassurance Checklist */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-6 text-sm sm:text-base text-slate-600 dark:text-slate-300 font-medium">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>0 Coding Experience Required</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>100% Free Forever (Zero Cost)</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Opt in or out of AI anytime</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Zero Machine Setup</span>
          </div>
        </div>

        {/* Executive Product Glimpse / High-Fidelity UI Preview Card */}
        <div className="pt-4 max-w-4xl mx-auto">
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-950 p-2 sm:p-4 shadow-2xl overflow-hidden text-left">
            <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="text-slate-400 font-mono text-xs ml-2">
                  glimpse: playwright-ts-basics.spec.ts
                </span>
              </div>
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Live In-Browser Grading
              </span>
            </div>

            <div className="p-4 sm:p-6 font-mono text-sm sm:text-base text-emerald-300 space-y-2 overflow-x-auto leading-relaxed">
              <div className="text-slate-500">// Example: Translating manual verification to a resilient Playwright test</div>
              <div><span className="text-purple-400">import</span> &#123; test, expect &#125; <span className="text-purple-400">from</span> <span className="text-amber-300">&apos;@playwright/test&apos;</span>;</div>
              <br />
              <div><span className="text-sky-400">test</span>(<span className="text-amber-300">&apos;checkout flow with dynamic delays&apos;</span>, <span className="text-purple-400">async</span> (&#123; page &#125;) =&gt; &#123;</div>
              <div className="pl-4 text-slate-300"><span className="text-slate-500">// 1. Navigate to live practice sandbox</span></div>
              <div className="pl-4"><span className="text-purple-400">await</span> page.<span className="text-sky-400">goto</span>(<span className="text-amber-300">&apos;/sandbox/web&apos;</span>);</div>
              <div className="pl-4 text-slate-300"><span className="text-slate-500">// 2. Target resilient user-facing locator (no flaky XPaths)</span></div>
              <div className="pl-4"><span className="text-purple-400">await</span> page.<span className="text-sky-400">getByRole</span>(<span className="text-amber-300">&apos;button&apos;</span>, &#123; name: <span className="text-amber-300">&apos;Submit Order&apos;</span> &#125;).<span className="text-sky-400">click</span>();</div>
              <div className="pl-4 text-slate-300"><span className="text-slate-500">// 3. Web-first auto-waiting assertion</span></div>
              <div className="pl-4"><span className="text-purple-400">await</span> <span className="text-sky-400">expect</span>(page.<span className="text-sky-400">getByRole</span>(<span className="text-amber-300">&apos;alert&apos;</span>)).<span className="text-sky-400">toContainText</span>(<span className="text-amber-300">&apos;Order Confirmed&apos;</span>);</div>
              <div>&#125;);</div>
            </div>

            <div className="p-3.5 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs sm:text-sm flex-wrap gap-2">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs sm:text-sm">
                <Play className="w-4 h-4 fill-current" />
                <span>Test Execution: 1 passed (340ms) · 0 flakiness</span>
              </div>
              <span className="text-slate-400 text-xs sm:text-sm flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                Full interactive editor &amp; 32 live sandbox labs unlock upon free sign-in
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. WHAT MANUAL TESTERS WILL GET HERE */}
      <section id="what-you-get" className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12 scroll-mt-20">
        <div className="text-center space-y-3">
          <span className="text-sm font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Platform Overview
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            What You Will Get on IntelligentQA
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg max-w-xl mx-auto">
            Everything designed to remove friction, build genuine coding confidence, and prepare you for SDET roles.
          </p>
        </div>

        {/* 4 Clean Minimal Value Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pillar 1 */}
          <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm hover:border-emerald-300 dark:hover:border-emerald-800 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Code2 className="w-6 h-6" />
            </div>
            <div className="space-y-2.5">
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                1. Scratch-to-SDET Learning Roadmaps
              </h3>
              <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                Step-by-step tracks covering <strong>Playwright (TypeScript)</strong>, <strong>Selenium (Java)</strong>, and <strong>REST API Automation</strong>. Concepts are taught by relating them directly to familiar manual testing workflows.
              </p>
            </div>
            <div className="text-sm text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
              <span>Includes async/await, Page Object Models &amp; CI/CD</span>
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm hover:border-sky-300 dark:hover:border-sky-800 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <Terminal className="w-6 h-6" />
            </div>
            <div className="space-y-2.5">
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                2. In-Browser Practice Sandboxes (Zero Setup)
              </h3>
              <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                Never get stuck configuring Node.js, JDKs, or local web servers. Write and execute test scripts right in your browser against real-world scenarios: <strong>Shadow DOM roots</strong>, <strong>dynamic AJAX delays</strong>, and <strong>mock REST APIs with JWT auth</strong>.
              </p>
            </div>
            <div className="text-sm text-sky-600 dark:text-sky-400 font-semibold flex items-center gap-1.5">
              <span>Instant feedback &amp; automatic code validation</span>
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm hover:border-purple-300 dark:hover:border-purple-800 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <div className="space-y-2.5">
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                3. 500+ Curated SDET Interview Scenarios
              </h3>
              <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                Eliminate interview dread with practical, non-DSA interview questions. Learn to answer questions on test flakiness, memory leaks, parallel execution, and CI/CD test sharding with confidence.
              </p>
            </div>
            <div className="text-sm text-purple-600 dark:text-purple-400 font-semibold flex items-center gap-1.5">
              <span>Full interview bank with crisp answers &amp; diagrams</span>
            </div>
          </div>

          {/* Pillar 4 */}
          <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm hover:border-indigo-300 dark:hover:border-indigo-800 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="space-y-2.5">
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                4. Optional AI Features (Your Choice to Opt In or Out)
              </h3>
              <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                Want to learn traditional automation first? You can opt out of AI and master pure coding. Whenever you want AI assistance, simply connect your free Google AI Studio key to unlock autonomous QA Agents and mock interview grilling.
              </p>
            </div>
            <div className="text-sm text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1.5">
              <span>Runs on your free Google quota (1,500 req/day at $0)</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. INSIDE USER LOGIN PREVIEW */}
      <section id="curriculum-preview" className="max-w-5xl mx-auto px-4 sm:px-6 scroll-mt-20">
        <div className="bg-slate-900 text-white rounded-3xl p-8 md:p-12 border border-slate-800 shadow-xl space-y-8">
          <div className="text-center space-y-3 max-w-xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <ShieldCheck className="w-4 h-4" />
              <span>Gated Inside User Login · 100% Free Forever</span>
            </div>
            <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              All Tutorials, Practice Labs &amp; QA Agents Await Inside
            </h3>
            <p className="text-base text-slate-300 leading-relaxed">
              We keep the home page uncluttered so you can focus. Once you log in with Google or Email, your complete SDET suite opens up:
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2 text-sm">
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-1.5">
              <span className="font-bold text-emerald-400 text-base block">🟢 Playwright TS Track</span>
              <span className="text-slate-300 text-sm">12 interactive lessons &amp; code editor</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-1.5">
              <span className="font-bold text-amber-400 text-base block">🟠 Selenium Java Track</span>
              <span className="text-slate-300 text-sm">OOPs, POM &amp; WebDriver synchronization</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-1.5">
              <span className="font-bold text-purple-400 text-base block">🟣 API Mock Lab</span>
              <span className="text-slate-300 text-sm">REST Assured, JWT &amp; latency testing</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-1.5">
              <span className="font-bold text-sky-400 text-base block">🔵 Web Shadow DOM Lab</span>
              <span className="text-slate-300 text-sm">Real browser sandboxes for live testing</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-1.5">
              <span className="font-bold text-indigo-400 text-base block">⚡ Autonomous QA Agents</span>
              <span className="text-slate-300 text-sm">Requirements to POM test generation</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-1.5">
              <span className="font-bold text-rose-400 text-base block">🔴 Interview Griller</span>
              <span className="text-slate-300 text-sm">Simulated lead SDET technical rounds</span>
            </div>
          </div>

          <div className="pt-4 text-center">
            {currentUser ? (
              <Link
                href="/dashboard"
                className="py-3.5 px-8 bg-emerald-600 hover:bg-emerald-500 font-bold rounded-2xl text-base inline-flex items-center gap-2 transition-colors shadow-lg shadow-emerald-950"
              >
                Go to Demo Dashboard
                <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <Link
                href="/signup"
                className="py-3.5 px-8 bg-emerald-600 hover:bg-emerald-500 font-bold rounded-2xl text-base inline-flex items-center gap-2 transition-colors shadow-lg shadow-emerald-950"
              >
                Create Your Free Account to Access Everything
                <ArrowRight className="w-5 h-5" />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* 4. MANUAL TESTER FAQ */}
      <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8 scroll-mt-20">
        <div className="text-center space-y-3">
          <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            Frequently Asked Questions by Manual Testers
          </h3>
          <p className="text-base text-slate-500">
            Honest, straightforward answers before you begin.
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2.5 shadow-sm">
            <h4 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              Can I become an SDET if I have zero coding experience?
            </h4>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-base">
              Yes, 100%. Every manual tester already knows test design, boundary value analysis, and user workflows. Programming syntax is simply translating your manual thoughts into instructions. Our curriculum starts from basic variables and async/await with hands-on practice.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2.5 shadow-sm">
            <h4 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              Can I opt out of AI and only learn traditional automation?
            </h4>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-base">
              Yes! You have full control. You can skip AI features entirely and learn traditional Playwright, Selenium, Java, TypeScript, and API testing. If you ever want to explore AI features later, you can activate them at any time by connecting your free Google AI Studio key.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2.5 shadow-sm">
            <h4 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              Is Google AI Studio really free?
            </h4>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-base">
              Yes. Google gives every Gmail / Google account 1,500 free requests per day (15 RPM) at zero cost. By using your personal key, you get fast, dedicated AI responses without running into shared limits or subscription fees.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2.5 shadow-sm">
            <h4 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              Is there any payment, credit card, or hidden fee later?
            </h4>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-base">
              No. IntelligentQA has zero paid subscription tiers, zero credit card requirements, and zero paywalls. Everything is 100% free forever.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
