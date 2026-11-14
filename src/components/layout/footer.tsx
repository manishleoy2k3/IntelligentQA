import React from 'react';
import Link from 'next/link';
import QABrandLogo from '@/components/ui/qa-brand-logo';

export default function Footer() {
  return (
    <footer className="w-full border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 text-sm py-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand Col */}
        <div className="space-y-3.5 md:col-span-1">
          <QABrandLogo size="sm" showText={true} />
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
            Zero-Cost QA Automation &amp; AI Transformation Platform empowering Manual QA engineers to master modern SDET engineering.
          </p>
          <div className="text-xs text-slate-400">
            © 2026 IntelligentQA. 100% Free &amp; Open Learning.
          </div>
        </div>

        {/* Tracks Col */}
        <div className="space-y-3">
          <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs">
            Learning Tracks
          </h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/tracks/playwright-ts" className="hover:text-emerald-500 transition-colors">Playwright + TypeScript</Link></li>
            <li><Link href="/tracks/selenium-java" className="hover:text-amber-500 transition-colors">Selenium WebDriver + Java</Link></li>
            <li><Link href="/tracks/api-testing" className="hover:text-purple-500 transition-colors">API Testing &amp; REST Assured</Link></li>
            <li><Link href="/tracks/ai-qa" className="hover:text-cyan-500 transition-colors">Step-by-Step AI for QA</Link></li>
            <li><Link href="/interview-questions" className="hover:text-indigo-500 transition-colors">Interview Mastery</Link></li>
          </ul>
        </div>

        {/* Interactive Practice Labs */}
        <div className="space-y-3">
          <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs">
            Practice Sandboxes
          </h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/sandbox/web" className="hover:text-emerald-500 transition-colors">Web Automation Lab (Shadow DOM &amp; Delays)</Link></li>
            <li><Link href="/sandbox/api" className="hover:text-purple-500 transition-colors">Mock REST API Server (/api/sandbox/v1)</Link></li>
            <li><Link href="/qa-agents" className="hover:text-indigo-500 transition-colors">In-App QA Agents Suite</Link></li>
            <li><Link href="/interview-griller" className="hover:text-rose-500 transition-colors">AI Technical Interview Griller</Link></li>
            <li><Link href="/interview-questions" className="hover:text-sky-500 transition-colors">Top 500+ QA Question Bank</Link></li>
          </ul>
        </div>

        {/* Architecture & Zero-Cost */}
        <div className="space-y-3">
          <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs">
            Architecture &amp; Ethics
          </h4>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Operates strictly within free tiers: Google AI Studio Gemini Flash Lite (15 RPM / 1,500 RPD), InsForge PostgreSQL with RLS, and Meta WhatsApp Cloud API.
          </p>
          <div className="pt-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              ✔ 100% Free Forever
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
