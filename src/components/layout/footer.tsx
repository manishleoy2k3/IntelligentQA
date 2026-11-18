import React from 'react';
import Link from 'next/link';
import QABrandLogo from '@/components/ui/qa-brand-logo';

export default function Footer() {
  return (
    <footer className="w-full border-t border-[#262626] bg-[#0E0E0E] text-[#A1A1AA] text-sm py-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Brand Col */}
        <div className="space-y-4 md:col-span-1">
          <QABrandLogo size="sm" showText={true} />
          <p className="text-[#A1A1AA] text-sm leading-relaxed">
            Zero-Cost QA Automation &amp; AI Transformation Platform empowering Manual QA engineers to master modern SDET engineering.
          </p>
          <div className="text-xs text-[#71717A]">
            © 2026 IntelligentQA. 100% Free &amp; Open Learning.
          </div>
        </div>

        {/* Tracks Col */}
        <div className="space-y-3">
          <h4 className="font-bold text-white uppercase tracking-wider text-xs">
            Learning Tracks
          </h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link href="/tracks/playwright-ts" className="hover:text-[#81FF89] transition-colors">Playwright + TypeScript</Link></li>
            <li><Link href="/tracks/selenium-java" className="hover:text-amber-400 transition-colors">Selenium WebDriver + Java</Link></li>
            <li><Link href="/tracks/api-testing" className="hover:text-[#80FFF9] transition-colors">API Testing &amp; REST Assured</Link></li>
            <li><Link href="/tracks/ai-qa" className="hover:text-cyan-400 transition-colors">Step-by-Step AI for QA</Link></li>
            <li><Link href="/interview-questions" className="hover:text-indigo-400 transition-colors">Interview Mastery</Link></li>
          </ul>
        </div>

        {/* Interactive Practice Labs */}
        <div className="space-y-3">
          <h4 className="font-bold text-white uppercase tracking-wider text-xs">
            Practice Labs
          </h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link href="/sandbox/web" className="hover:text-[#81FF89] transition-colors">Web Automation Lab (Shadow DOM &amp; Delays)</Link></li>
            <li><Link href="/sandbox/api" className="hover:text-[#80FFF9] transition-colors">Mock REST API Server (/api/sandbox/v1)</Link></li>
            <li><Link href="/qa-agents" className="hover:text-indigo-400 transition-colors">In-App QA Agents Suite</Link></li>
            <li><Link href="/interview-griller" className="hover:text-rose-400 transition-colors">AI Technical Interview Griller</Link></li>
            <li><Link href="/interview-questions" className="hover:text-sky-400 transition-colors">Top 500+ QA Question Bank</Link></li>
          </ul>
        </div>

        {/* Architecture & Zero-Cost */}
        <div className="space-y-3">
          <h4 className="font-bold text-white uppercase tracking-wider text-xs">
            Architecture &amp; Ethics
          </h4>
          <p className="text-sm text-[#A1A1AA] leading-relaxed">
            Operates strictly within free tiers: Google AI Studio Gemini Flash Lite (15 RPM / 1,500 RPD), InsForge PostgreSQL with RLS, and Meta WhatsApp Cloud API.
          </p>
          <div className="pt-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#1A1A1A] text-[#81FF89] border border-[#262626]">
              ✔ 100% Free Forever
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
