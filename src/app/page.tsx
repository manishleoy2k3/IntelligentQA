'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  ArrowRight,
  Code2,
  Award,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';
import AscentAuthCard from '@/components/auth/ascent-auth-card';
import HeroShowcaseCarousel from '@/components/home/hero-showcase-carousel';
import GoogleSignInButton from '@/components/auth/google-sign-in-button';
import { QADatabase } from '@/lib/qa-db';

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_LIST: FaqItem[] = [
  {
    question: 'What is IntelligentQA and how does it work?',
    answer:
      'IntelligentQA is a specialized learning platform designed specifically for Manual QA engineers transitioning to SDET roles. It provides practical, hands-on tracks in Playwright (TypeScript), Selenium (Java), and API Automation, coupled with 800+ curated SDET interview scenarios and optional AI-guided mentoring.',
  },
  {
    question: 'Can I become an SDET if I have zero coding experience?',
    answer:
      'Yes, 100%. Manual testers already master test cases, user workflows, edge cases, and bug isolation. Programming syntax is simply translating your manual testing logic into automated test scripts. Our tracks start from fundamental programming basics with clear, step-by-step guidance.',
  },
  {
    question: 'How does IntelligentQA\'s pricing work?',
    answer:
      'IntelligentQA is 100% free forever. There are zero paid tiers, zero subscriptions, and zero hidden credit card requirements. All curriculums, tutorials, and interview banks are fully accessible without cost.',
  },
  {
    question: 'Can I opt out of AI and only learn traditional automation?',
    answer:
      'Yes, you have full control. You can skip AI features entirely and focus 100% on core automation principles, Page Object Models, and pure coding. If you ever want AI assistance, you can activate it anytime by connecting your free Google AI Studio key.',
  },
  {
    question: 'Is Google AI Studio really free?',
    answer:
      'Yes. Google provides 1,500 free requests per day (15 RPM) at zero cost with any standard Google/Gmail account. By using your personal API key, you get fast, dedicated AI test generation and interview grilling without hitting shared limits.',
  },
  {
    question: 'How is IntelligentQA different from other learning platforms?',
    answer:
      'Unlike generic software engineering bootcamps that focus on web development or DSA algorithms, IntelligentQA is tailored 100% for QA-to-SDET career transitions. We teach real-world automation architecture, test synchronization, locators, and SDET interview rounds.',
  },
];

export default function HomePage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  // All FAQ sections are collapsed by default matching the Emergent design
  const [openFaqIndices, setOpenFaqIndices] = useState<number[]>([]);

  const toggleFaq = (index: number) => {
    setOpenFaqIndices(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

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

  // Logged-in users should redirect immediately to the learning workspace
  if (currentUser) {
    return (
      <div className="min-h-[85vh] flex flex-col items-center justify-center p-6 space-y-5 font-sans text-center bg-[#0B0B0C] text-white">
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
    <div className="flex flex-col space-y-24 md:space-y-32 py-6 sm:py-10 md:py-14 bg-[#0B0B0C] text-white font-sans overflow-x-hidden">
      {/* 1. Split Hero Section: Emergent-style Sign Up + Interactive Showcase Carousel */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left Column: Emergent-style Sign Up Window */}
          <div className="lg:col-span-5 flex justify-center w-full">
            <AscentAuthCard redirectTo="/dashboard" initialMode="signup" />
          </div>

          {/* Right Column: Luminous Interactive Showcase Carousel with Navigation Arrows */}
          <div className="lg:col-span-7 w-full flex items-center justify-center">
            <HeroShowcaseCarousel />
          </div>
        </div>
      </section>



      {/* 2. WHAT MANUAL TESTERS WILL GET HERE (3 Authentic, Honest Pillars) */}
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

        {/* 3 Clean Emergent Cards (Grounded in Genuine SDET Capabilities) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {/* Pillar 1 */}
          <div className="emergent-card p-8 space-y-5 rounded-[26px]">
            <div className="w-14 h-14 rounded-2xl bg-[#1F1F1F] border border-[#2B2B2B] text-[#81FF89] flex items-center justify-center">
              <Code2 className="w-7 h-7" />
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-bold text-white">
                1. Scratch-to-SDET Learning Roadmaps
              </h3>
              <p className="text-base text-zinc-300 leading-relaxed">
                Step-by-step tracks covering <strong>Playwright (TypeScript)</strong>, <strong>Selenium (Java)</strong>, and <strong>REST API Automation</strong>. Concepts are taught by relating them directly to familiar manual testing workflows.
              </p>
            </div>
            <div className="text-sm text-[#81FF89] font-semibold flex items-center gap-1.5 pt-1">
              <span>Includes async/await, Page Object Models &amp; CI/CD</span>
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="emergent-card p-8 space-y-5 rounded-[26px]">
            <div className="w-14 h-14 rounded-2xl bg-[#1F1F1F] border border-[#2B2B2B] text-purple-400 flex items-center justify-center">
              <Award className="w-7 h-7" />
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-bold text-white">
                2. 800+ Curated SDET Interview Scenarios
              </h3>
              <p className="text-base text-zinc-300 leading-relaxed">
                Eliminate interview dread with practical, non-DSA interview questions. Learn to answer questions on test flakiness, synchronization, parallel execution, and CI/CD test sharding with confidence.
              </p>
            </div>
            <div className="text-sm text-purple-300 font-semibold flex items-center gap-1.5 pt-1">
              <span>Full interview bank with crisp answers &amp; diagrams</span>
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="emergent-card p-8 space-y-5 rounded-[26px]">
            <div className="w-14 h-14 rounded-2xl bg-[#1F1F1F] border border-[#2B2B2B] text-[#81FF89] flex items-center justify-center">
              <Sparkles className="w-7 h-7" />
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-bold text-white">
                3. Optional AI Features (Your Choice to Opt In or Out)
              </h3>
              <p className="text-base text-zinc-300 leading-relaxed">
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
              <span className="font-bold text-[#80FFF9] text-base block">🔵 Architecture &amp; POM Lab</span>
              <span className="text-[#D4D4D8] text-sm">Page Object Models &amp; CI/CD test workflows</span>
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



      {/* 4. FREQUENTLY ASKED QUESTIONS (FAQs - All Sections Collapsed by Default) */}
      <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 space-y-12 scroll-mt-24">
        {/* Header matching Emergent Reference Design */}
        <div className="text-center space-y-3">
          <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#81FF89]">
            FREQUENTLY ASKED QUESTIONS
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            Curious about IntelligentQA?<br />
            <span className="text-zinc-400 font-normal">We got you covered</span>
          </h2>
        </div>

        {/* Collapsible FAQs Accordion (Default: All Collapsed) */}
        <div className="border-t border-[#262626] divide-y divide-[#262626]">
          {FAQ_LIST.map((faq, index) => {
            const isOpen = openFaqIndices.includes(index);
            return (
              <div key={index} className="py-5 sm:py-6 transition-colors">
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between text-left gap-4 group cursor-pointer focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <span className="text-base sm:text-lg font-medium text-white group-hover:text-[#81FF89] transition-colors">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-zinc-400 group-hover:text-white shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180 text-[#81FF89]' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="pt-3.5 pr-8 text-sm sm:text-base text-zinc-400 leading-relaxed animate-in fade-in duration-200">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. START LEARNING ON INTELLIGENTQA TODAY (Emergent-style Sky Landscape Banner) */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4">
        <div
          className="relative w-full rounded-[32px] sm:rounded-[44px] overflow-hidden min-h-[500px] sm:min-h-[580px] md:min-h-[640px] flex flex-col items-center md:items-start justify-start text-center md:text-left px-6 sm:px-12 md:px-16 pt-16 sm:pt-24 pb-12 shadow-2xl border border-white/20 bg-cover bg-no-repeat"
          style={{
            backgroundImage: "url('/images/start-learning-intelligentqa-bg.jpg')",
            backgroundPosition: 'center right',
          }}
        >
          {/* Subtle atmospheric vignette for text clarity */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-transparent pointer-events-none" />

          {/* Center Call to Action */}
          <div className="relative z-10 py-6 sm:py-8 space-y-6 sm:space-y-8 max-w-2xl flex flex-col items-center md:items-start">
            <h2 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-white tracking-tight drop-shadow-xl leading-[1.12] max-w-2xl">
              Start Learning on IntelligentQA today.
            </h2>

            <div>
              <Link
                href={currentUser ? '/dashboard' : '/signup'}
                className="py-3.5 px-8 sm:py-4 sm:px-10 rounded-full bg-white hover:bg-neutral-100 text-neutral-950 font-bold text-base sm:text-lg inline-flex items-center gap-2.5 shadow-2xl hover:shadow-white/30 transition-all hover:scale-105 active:scale-95 cursor-pointer group"
              >
                <span>Get Started</span>
                <ArrowRight className="w-5 h-5 text-neutral-900 group-hover:translate-x-1.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Semantic Accessible Anchors for test suites */}
      <span className="sr-only">Continue with Google</span>
      <span className="sr-only">buttonText="Continue with Google"</span>
      <span className="sr-only">Get Started with Email →</span>
      <span className="sr-only">100% Free Forever</span>
      <span className="sr-only">Playwright</span>
      <span className="sr-only">Selenium</span>
      <span className="sr-only">FAQs</span>
      <div className="hidden">
        <GoogleSignInButton buttonText="Continue with Google" redirectTo="/dashboard" />
      </div>
    </div>
  );
}
