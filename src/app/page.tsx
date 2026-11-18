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
      <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 space-y-5 font-sans text-center">
        <div className="animate-spin w-12 h-12 border-4 border-[#81FF89] border-t-transparent rounded-full" />
        <h2 className="text-2xl font-bold text-white">
          Loading your SDET Learning Dashboard...
        </h2>
        <p className="text-[#A1A1AA] text-base max-w-sm">
          Redirecting you directly to your personalized learning workspace.
        </p>
        <Link
          href="/dashboard"
          className="mt-2 py-3.5 px-7 bg-white hover:bg-neutral-200 text-black font-bold rounded-full text-base transition-all shadow-md inline-flex items-center gap-2 cursor-pointer"
        >
          Go to Demo Dashboard
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-28 py-10 md:py-20 overflow-hidden bg-[#111111] text-white">
      {/* 1. MINIMAL HERO SECTION */}
      <section className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-9">
        {/* Glow ambient background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[340px] bg-gradient-to-tr from-[#81FF89]/10 via-[#80FFF9]/10 to-transparent blur-3xl pointer-events-none -z-10" />

        {/* Audience Pill */}
        <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full text-sm font-semibold bg-[#161616] text-[#81FF89] border border-[#262626] shadow-sm">
          <GraduationCap className="w-4 h-4 text-[#81FF89] shrink-0" />
          <span>Tailored Specifically for Manual QA Engineers Transitioning to SDET</span>
        </div>

        {/* Clear Emergent Headline */}
        <div className="space-y-6 max-w-3xl mx-auto">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.08]">
            From Manual Tester to{' '}
            <span className="emergent-headline">
              Confident SDET.
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-[#A1A1AA] leading-relaxed max-w-2xl mx-auto font-normal">
            Master test automation without coding anxiety. Practice in zero-setup browser sandboxes, follow clear step-by-step curriculums, and choose whether to learn core automation or accelerate with free AI tools.
          </p>
        </div>

        {/* Logged In Dashboard CTA vs Guest Sign Up CTA */}
        {currentUser ? (
          <div className="max-w-md mx-auto text-center pt-2">
            <Link
              href="/dashboard"
              className="py-4 px-8 bg-white hover:bg-neutral-200 text-black font-bold rounded-full text-base transition-all shadow-lg inline-flex items-center gap-2 active:scale-95 cursor-pointer"
            >
              Go to Demo Dashboard
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        ) : (
          <div className="max-w-md mx-auto space-y-4">
            {/* Primary Google Sign In */}
            <div className="flex justify-center">
              <GoogleSignInButton
                buttonText="Continue with Google"
                className="py-4 text-base shadow-lg"
              />
            </div>

            {/* Email Alternative Links */}
            <div className="flex items-center justify-center gap-4 text-base text-[#A1A1AA] pt-1">
              <Link href="/signup" className="font-semibold text-white hover:text-[#81FF89] transition-colors underline decoration-dotted">
                Get Started with Email →
              </Link>
              <span>·</span>
              <Link href="/login" className="hover:text-white transition-colors">
                Already have an account? Log in
              </Link>
            </div>
          </div>
        )}

        {/* Reassurance Checklist */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-base text-[#D4D4D8] font-medium">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#81FF89] shrink-0" />
            <span>0 Coding Experience Required</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#81FF89] shrink-0" />
            <span>100% Free Forever (Zero Cost)</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#81FF89] shrink-0" />
            <span>Opt in or out of AI anytime</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#81FF89] shrink-0" />
            <span>Zero Machine Setup</span>
          </div>
        </div>

        {/* Executive Product Glimpse / High-Fidelity UI Preview Card */}
        <div className="pt-6 max-w-4xl mx-auto">
          <div className="rounded-[28px] border border-[#262626] bg-[#0E0E0E] p-3 sm:p-5 shadow-2xl overflow-hidden text-left">
            <div className="flex items-center justify-between px-3 py-2 border-b border-[#262626] text-sm">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-[#81FF89]/80" />
                <span className="text-[#A1A1AA] font-mono text-xs ml-2">
                  glimpse: playwright-ts-basics.spec.ts
                </span>
              </div>
              <span className="text-sm text-[#81FF89] font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Live In-Browser Grading
              </span>
            </div>

            <div className="p-5 sm:p-7 font-mono text-sm sm:text-base text-[#81FF89] space-y-2 overflow-x-auto leading-relaxed">
              <div className="text-[#71717A]">// Example: Translating manual verification to a resilient Playwright test</div>
              <div><span className="text-purple-400">import</span> &#123; test, expect &#125; <span className="text-purple-400">from</span> <span className="text-amber-300">&apos;@playwright/test&apos;</span>;</div>
              <br />
              <div><span className="text-[#80FFF9]">test</span>(<span className="text-amber-300">&apos;checkout flow with dynamic delays&apos;</span>, <span className="text-purple-400">async</span> (&#123; page &#125;) =&gt; &#123;</div>
              <div className="pl-4 text-[#D4D4D8]"><span className="text-[#71717A]">// 1. Navigate to live practice sandbox</span></div>
              <div className="pl-4"><span className="text-purple-400">await</span> page.<span className="text-[#80FFF9]">goto</span>(<span className="text-amber-300">&apos;/sandbox/web&apos;</span>);</div>
              <div className="pl-4 text-[#D4D4D8]"><span className="text-[#71717A]">// 2. Target resilient user-facing locator (no flaky XPaths)</span></div>
              <div className="pl-4"><span className="text-purple-400">await</span> page.<span className="text-[#80FFF9]">getByRole</span>(<span className="text-amber-300">&apos;button&apos;</span>, &#123; name: <span className="text-amber-300">&apos;Submit Order&apos;</span> &#125;).<span className="text-[#80FFF9]">click</span>();</div>
              <div className="pl-4 text-[#D4D4D8]"><span className="text-[#71717A]">// 3. Web-first auto-waiting assertion</span></div>
              <div className="pl-4"><span className="text-purple-400">await</span> <span className="text-[#80FFF9]">expect</span>(page.<span className="text-[#80FFF9]">getByRole</span>(<span className="text-amber-300">&apos;alert&apos;</span>)).<span className="text-[#80FFF9]">toContainText</span>(<span className="text-amber-300">&apos;Order Confirmed&apos;</span>);</div>
              <div>&#125;);</div>
            </div>

            <div className="p-4 bg-[#141414] border-t border-[#262626] flex items-center justify-between text-sm flex-wrap gap-2">
              <div className="flex items-center gap-2 text-[#81FF89] font-semibold text-sm">
                <Play className="w-4 h-4 fill-current" />
                <span>Test Execution: 1 passed (340ms) · 0 flakiness</span>
              </div>
              <span className="text-[#A1A1AA] text-sm flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400" />
                Full interactive editor &amp; 32 live sandbox labs unlock upon free sign-in
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. WHAT MANUAL TESTERS WILL GET HERE */}
      <section id="what-you-get" className="max-w-6xl mx-auto px-4 sm:px-6 space-y-14 scroll-mt-24">
        <div className="text-center space-y-3.5">
          <span className="text-sm font-bold uppercase tracking-wider text-[#81FF89]">
            Platform Overview
          </span>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            What You Will Get on IntelligentQA
          </h2>
          <p className="text-[#A1A1AA] text-lg max-w-xl mx-auto">
            Everything designed to remove friction, build genuine coding confidence, and prepare you for SDET roles.
          </p>
        </div>

        {/* 4 Clean Emergent Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Pillar 1 */}
          <div className="emergent-card p-8 md:p-10 space-y-5 rounded-[26px]">
            <div className="w-14 h-14 rounded-2xl bg-[#1F1F1F] border border-[#2B2B2B] text-[#81FF89] flex items-center justify-center">
              <Code2 className="w-7 h-7" />
            </div>
            <div className="space-y-3">
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                1. Scratch-to-SDET Learning Roadmaps
              </h3>
              <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                Step-by-step tracks covering <strong>Playwright (TypeScript)</strong>, <strong>Selenium (Java)</strong>, and <strong>REST API Automation</strong>. Concepts are taught by relating them directly to familiar manual testing workflows.
              </p>
            </div>
            <div className="text-sm text-[#81FF89] font-semibold flex items-center gap-1.5 pt-1">
              <span>Includes async/await, Page Object Models &amp; CI/CD</span>
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="emergent-card p-8 md:p-10 space-y-5 rounded-[26px]">
            <div className="w-14 h-14 rounded-2xl bg-[#1F1F1F] border border-[#2B2B2B] text-[#80FFF9] flex items-center justify-center">
              <Terminal className="w-7 h-7" />
            </div>
            <div className="space-y-3">
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                2. In-Browser Practice Sandboxes (Zero Setup)
              </h3>
              <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                Never get stuck configuring Node.js, JDKs, or local web servers. Write and execute test scripts right in your browser against real-world scenarios: <strong>Shadow DOM roots</strong>, <strong>dynamic AJAX delays</strong>, and <strong>mock REST APIs with JWT auth</strong>.
              </p>
            </div>
            <div className="text-sm text-[#80FFF9] font-semibold flex items-center gap-1.5 pt-1">
              <span>Instant feedback &amp; automatic code validation</span>
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="emergent-card p-8 md:p-10 space-y-5 rounded-[26px]">
            <div className="w-14 h-14 rounded-2xl bg-[#1F1F1F] border border-[#2B2B2B] text-purple-400 flex items-center justify-center">
              <Award className="w-7 h-7" />
            </div>
            <div className="space-y-3">
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                3. 500+ Curated SDET Interview Scenarios
              </h3>
              <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                Eliminate interview dread with practical, non-DSA interview questions. Learn to answer questions on test flakiness, memory leaks, parallel execution, and CI/CD test sharding with confidence.
              </p>
            </div>
            <div className="text-sm text-purple-300 font-semibold flex items-center gap-1.5 pt-1">
              <span>Full interview bank with crisp answers &amp; diagrams</span>
            </div>
          </div>

          {/* Pillar 4 */}
          <div className="emergent-card p-8 md:p-10 space-y-5 rounded-[26px]">
            <div className="w-14 h-14 rounded-2xl bg-[#1F1F1F] border border-[#2B2B2B] text-[#81FF89] flex items-center justify-center">
              <Sparkles className="w-7 h-7" />
            </div>
            <div className="space-y-3">
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                4. Optional AI Features (Your Choice to Opt In or Out)
              </h3>
              <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                Want to learn traditional automation first? You can opt out of AI and master pure coding. Whenever you want AI assistance, simply connect your free Google AI Studio key to unlock autonomous QA Agents and mock interview grilling.
              </p>
            </div>
            <div className="text-sm text-[#81FF89] font-semibold flex items-center gap-1.5 pt-1">
              <span>Runs on your free Google quota (1,500 req/day at $0)</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. INSIDE USER LOGIN PREVIEW */}
      <section id="curriculum-preview" className="max-w-5xl mx-auto px-4 sm:px-6 scroll-mt-24">
        <div className="emergent-card p-8 md:p-12 space-y-9 rounded-[28px]">
          <div className="text-center space-y-3.5 max-w-xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold bg-[#1F1F1F] text-[#81FF89] border border-[#262626]">
              <ShieldCheck className="w-4 h-4 text-[#81FF89]" />
              <span>Gated Inside User Login · 100% Free Forever</span>
            </div>
            <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              All Tutorials, Practice Labs &amp; QA Agents Await Inside
            </h3>
            <p className="text-base text-[#A1A1AA] leading-relaxed">
              We keep the home page uncluttered so you can focus. Once you log in with Google or Email, your complete SDET suite opens up:
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2 text-sm">
            <div className="p-5 rounded-2xl bg-[#141414] border border-[#262626] space-y-2 hover:border-[#81FF89]/40 transition-colors">
              <span className="font-bold text-[#81FF89] text-base block">🟢 Playwright TS Track</span>
              <span className="text-[#D4D4D8] text-sm">12 interactive lessons &amp; code editor</span>
            </div>
            <div className="p-5 rounded-2xl bg-[#141414] border border-[#262626] space-y-2 hover:border-amber-400/40 transition-colors">
              <span className="font-bold text-amber-400 text-base block">🟠 Selenium Java Track</span>
              <span className="text-[#D4D4D8] text-sm">OOPs, POM &amp; WebDriver synchronization</span>
            </div>
            <div className="p-5 rounded-2xl bg-[#141414] border border-[#262626] space-y-2 hover:border-purple-400/40 transition-colors">
              <span className="font-bold text-purple-400 text-base block">🟣 API Mock Lab</span>
              <span className="text-[#D4D4D8] text-sm">REST Assured, JWT &amp; latency testing</span>
            </div>
            <div className="p-5 rounded-2xl bg-[#141414] border border-[#262626] space-y-2 hover:border-[#80FFF9]/40 transition-colors">
              <span className="font-bold text-[#80FFF9] text-base block">🔵 Web Shadow DOM Lab</span>
              <span className="text-[#D4D4D8] text-sm">Real browser sandboxes for live testing</span>
            </div>
            <div className="p-5 rounded-2xl bg-[#141414] border border-[#262626] space-y-2 hover:border-[#81FF89]/40 transition-colors">
              <span className="font-bold text-[#81FF89] text-base block">⚡ Autonomous QA Agents</span>
              <span className="text-[#D4D4D8] text-sm">Requirements to POM test generation</span>
            </div>
            <div className="p-5 rounded-2xl bg-[#141414] border border-[#262626] space-y-2 hover:border-rose-400/40 transition-colors">
              <span className="font-bold text-rose-400 text-base block">🔴 Interview Griller</span>
              <span className="text-[#D4D4D8] text-sm">Simulated lead SDET technical rounds</span>
            </div>
          </div>

          <div className="pt-4 text-center">
            {currentUser ? (
              <Link
                href="/dashboard"
                className="py-4 px-9 bg-white hover:bg-neutral-200 text-black font-bold rounded-full text-base inline-flex items-center gap-2 transition-all shadow-lg cursor-pointer"
              >
                Go to Demo Dashboard
                <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <Link
                href="/signup"
                className="py-4 px-9 bg-white hover:bg-neutral-200 text-black font-bold rounded-full text-base inline-flex items-center gap-2 transition-all shadow-lg cursor-pointer active:scale-95"
              >
                Create Your Free Account to Access Everything
                <ArrowRight className="w-5 h-5" />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* 4. MANUAL TESTER FAQ */}
      <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 space-y-10 scroll-mt-24">
        <div className="text-center space-y-3.5">
          <h3 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            Frequently Asked Questions by Manual Testers
          </h3>
          <p className="text-base sm:text-lg text-[#A1A1AA]">
            Honest, straightforward answers before you begin.
          </p>
        </div>

        <div className="space-y-5">
          <div className="emergent-card p-7 sm:p-8 space-y-3">
            <h4 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              Can I become an SDET if I have zero coding experience?
            </h4>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-base">
              Yes, 100%. Every manual tester already knows test design, boundary value analysis, and user workflows. Programming syntax is simply translating your manual thoughts into instructions. Our curriculum starts from basic variables and async/await with hands-on practice.
            </p>
          </div>

          <div className="emergent-card p-7 sm:p-8 space-y-3">
            <h4 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              Can I opt out of AI and only learn traditional automation?
            </h4>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-base">
              Yes! You have full control. You can skip AI features entirely and learn traditional Playwright, Selenium, Java, TypeScript, and API testing. If you ever want to explore AI features later, you can activate them at any time by connecting your free Google AI Studio key.
            </p>
          </div>

          <div className="emergent-card p-7 sm:p-8 space-y-3">
            <h4 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              Is Google AI Studio really free?
            </h4>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-base">
              Yes. Google gives every Gmail / Google account 1,500 free requests per day (15 RPM) at zero cost. By using your personal key, you get fast, dedicated AI responses without running into shared limits or subscription fees.
            </p>
          </div>

          <div className="emergent-card p-7 sm:p-8 space-y-3">
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
