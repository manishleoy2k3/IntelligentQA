'use client';

import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  Code2,
  Terminal,
  Bot,
  HelpCircle,
  Play,
  Layers,
  ShieldCheck,
  Check,
} from 'lucide-react';

interface ShowcaseSlide {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  avatars?: string[];
  mockup: {
    browserUrl: string;
    headline: string;
    subheadline: string;
    codePreview?: string;
    tags?: string[];
    statusBadge?: string;
  };
}

const SHOWCASE_SLIDES: ShowcaseSlide[] = [
  {
    id: 'manual-to-sdet',
    badge: '100% Free Forever',
    title: 'Built for Manual QA',
    subtitle: 'Transition seamlessly from manual test cases into robust, production-grade Playwright & Selenium code.',
    mockup: {
      browserUrl: 'intelligentqa.io/tracks/playwright-ts',
      headline: 'Step into automation with zero coding anxiety',
      subheadline: 'Turn your spreadsheet test cases into resilient auto-waiting locators and web-first assertions.',
      codePreview: `import { test, expect } from '@playwright/test';\n\ntest('checkout verification', async ({ page }) => {\n  await page.goto('/sandbox/web');\n  await page.getByRole('button', { name: 'Submit Order' }).click();\n  await expect(page.getByRole('alert')).toHaveText('Order Confirmed');\n});`,
      statusBadge: '✓ Automated Test Passed · 0 Flakiness',
      tags: ['Playwright', 'TypeScript', 'POM Architecture'],
    },
  },
  {
    id: 'in-browser-sandbox',
    badge: 'Code Compilers',
    title: 'Interactive Code Compilers',
    subtitle: 'Practice and evaluate core Java, TypeScript & Python programming logic, OOP structures, and syntax directly in your browser.',
    mockup: {
      browserUrl: 'intelligentqa.io/sandbox/code',
      headline: 'In-Browser Compilers for Core Programming Logic',
      subheadline: 'Practice algorithms, OOP design patterns, and test automation programming syntax with zero machine setup.',
      codePreview: `// Java Online Compiler (OOP & Test Logic)\npublic class Solution {\n    public static void main(String[] args) {\n        String expectedStatus = "CONFIRMED";\n        boolean isReady = validatePayload(expectedStatus);\n        System.out.println("Execution result: " + isReady);\n    }\n    static boolean validatePayload(String status) {\n        return "CONFIRMED".equalsIgnoreCase(status);\n    }\n}`,
      statusBadge: '⚡ Compiled & Evaluated Successfully (0ms)',
      tags: ['Java Compiler', 'TypeScript Compiler', 'Python Compiler'],
    },
  },
  {
    id: 'ai-agents',
    badge: 'Powered by Gemini AI',
    title: 'Autonomous QA Agents',
    subtitle: 'Generate comprehensive test matrices, Page Object classes, and self-healing locators in seconds.',
    mockup: {
      browserUrl: 'intelligentqa.io/agents/pom-generator',
      headline: '5 Dedicated SDET AI Assistants',
      subheadline: 'Requirements Analyzer, Matrix Generator, POM Builder, Flakiness Auditor, and Senior SDET Mentor.',
      codePreview: `// AI Autonomous POM Agent Output:\nexport class CartPage {\n  readonly page: Page;\n  readonly checkoutBtn = this.page.getByRole('button', { name: 'Checkout' });\n  readonly orderSummary = this.page.getByTestId('order-summary');\n\n  constructor(page: Page) { this.page = page; }\n  async completePurchase() { await this.checkoutBtn.click(); }\n}`,
      statusBadge: '🤖 Auto-generated Page Object Model (Clean Architecture)',
      tags: ['Requirements Analyzer', 'POM Builder', 'Audit Flakiness'],
    },
  },
  {
    id: 'interview-bank',
    badge: '800+ Real Scenarios',
    title: 'Curated Interview Bank',
    subtitle: 'Master high-frequency SDET and Test Architect interview scenarios with production answers and diagrams.',
    mockup: {
      browserUrl: 'intelligentqa.io/interview-questions',
      headline: 'Lead & Test Architect Scenarios',
      subheadline: 'Solve real-world challenges on test concurrency, CI/CD sharding, flaky locators, and memory leak prevention.',
      codePreview: `Q: How do you design an enterprise automation framework that scales to 1,000+ daily builds without flakiness?\n\nKey Pillars:\n1. Strict decoupling of Page Objects from test action logic\n2. Dynamic sharding across CI GitHub Actions workers\n3. Web-first auto-waiting assertions (Zero Thread.sleep())`,
      statusBadge: '🎯 Architect Verified · 800+ Scenarios',
      tags: ['Test Architecture', 'CI/CD Sharding', 'System Design'],
    },
  },
];

export default function HeroShowcaseCarousel() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-advance every 6 seconds if not hovered
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIdx(prev => (prev + 1) % SHOWCASE_SLIDES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const activeSlide = SHOWCASE_SLIDES[currentIdx];

  const handlePrev = () => {
    setCurrentIdx(prev => (prev - 1 + SHOWCASE_SLIDES.length) % SHOWCASE_SLIDES.length);
  };

  const handleNext = () => {
    setCurrentIdx(prev => (prev + 1) % SHOWCASE_SLIDES.length);
  };

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative w-full h-full min-h-[580px] lg:min-h-[660px] rounded-[36px] overflow-hidden p-6 sm:p-8 lg:p-10 flex flex-col justify-between border border-white/10 shadow-2xl bg-gradient-to-br from-[#121c2e] via-[#0d1624] to-[#0a111a] text-white select-none transition-all duration-500"
    >
      {/* Radiant Glow Atmosphere */}
      <div className="absolute top-0 right-0 w-[420px] h-[420px] bg-gradient-to-br from-[#38bdf8]/20 via-[#81FF89]/15 to-transparent rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="absolute bottom-0 left-0 w-[380px] h-[380px] bg-gradient-to-tr from-[#6366f1]/20 via-[#38bdf8]/15 to-transparent rounded-full blur-3xl pointer-events-none -z-0" />

      {/* Top Header Row with Badge */}
      <div className="relative z-10 flex items-center justify-between pb-4">
        {/* Subtle Indicator */}
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#81FF89] animate-pulse" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
            Platform Interactive Showcase
          </span>
        </div>

        {/* Top Right Orange / Emerald Accent Pill matching screenshot */}
        <div className="px-3 py-1 rounded-full text-xs font-bold bg-[#81FF89]/15 text-[#81FF89] border border-[#81FF89]/30 flex items-center gap-1.5 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-[#81FF89]" />
          <span>{activeSlide.badge}</span>
        </div>
      </div>

      {/* Center Content Slide */}
      <div className="relative z-10 space-y-6 my-auto py-2 transition-opacity duration-300">
        {/* Title & Avatars Row */}
        <div className="space-y-2 text-center max-w-xl mx-auto">
          <div className="flex items-center justify-center gap-3">
            {/* Clean non-overlapping QA & SDET Badges */}
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-[#81FF89] border border-emerald-500/40 font-bold text-xs tracking-wider shadow-sm">
                QA
              </span>
              <span className="text-zinc-500 font-bold text-xs">→</span>
              <span className="px-2.5 py-1 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/40 font-bold text-xs tracking-wider shadow-sm">
                SDET
              </span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {activeSlide.title}
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-lg mx-auto font-medium">
            {activeSlide.subtitle}
          </p>
        </div>

        {/* macOS Window Mockup Frame */}
        <div className="w-full max-w-2xl mx-auto rounded-2xl bg-[#090D14]/95 border border-white/10 shadow-2xl overflow-hidden text-left transition-all">
          {/* macOS Titlebar */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-[#0F172A] border-b border-white/5 text-xs text-zinc-400">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            </div>

            {/* Address Bar */}
            <div className="px-4 py-1 rounded-full bg-[#090D14] text-[11px] font-mono text-zinc-400 border border-white/5 truncate max-w-[260px]">
              https://{activeSlide.mockup.browserUrl}
            </div>

            <div className="w-12 text-right text-[10px] text-zinc-500 font-mono">
              Live Preview
            </div>
          </div>

          {/* Window Body */}
          <div className="p-4 sm:p-5 space-y-3 font-sans">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-bold text-white tracking-tight">
                {activeSlide.mockup.headline}
              </span>
              {activeSlide.mockup.statusBadge && (
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-[#81FF89] border border-emerald-500/30">
                  {activeSlide.mockup.statusBadge}
                </span>
              )}
            </div>

            {/* Code / Editor Preview Container */}
            {activeSlide.mockup.codePreview && (
              <div className="p-3.5 bg-[#05080E] rounded-xl border border-white/5 font-mono text-[11px] sm:text-xs text-emerald-300 overflow-x-auto leading-relaxed shadow-inner">
                <pre className="whitespace-pre-wrap">{activeSlide.mockup.codePreview}</pre>
              </div>
            )}

            {/* Feature Tags Pill Row */}
            {activeSlide.mockup.tags && (
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                {activeSlide.mockup.tags.map((tag, tIdx) => (
                  <span
                    key={tIdx}
                    className="text-[10px] font-medium px-2 py-0.5 rounded bg-white/5 text-zinc-300 border border-white/5"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Carousel Navigation Controls matching screenshot */}
      <div className="relative z-10 flex items-center justify-center gap-4 pt-4">
        {/* Left Arrow Button */}
        <button
          type="button"
          onClick={handlePrev}
          className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-sm"
          aria-label="Previous Slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Pagination Indicator (Pill + Dots) */}
        <div className="flex items-center gap-2">
          {SHOWCASE_SLIDES.map((slide, idx) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => setCurrentIdx(idx)}
              className={`transition-all duration-300 rounded-full cursor-pointer ${
                idx === currentIdx
                  ? 'w-7 h-2.5 bg-white shadow-md'
                  : 'w-2.5 h-2.5 bg-white/30 hover:bg-white/50'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Right Arrow Button */}
        <button
          type="button"
          onClick={handleNext}
          className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-sm"
          aria-label="Next Slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
