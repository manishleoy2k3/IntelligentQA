import React from "react";
import Link from "next/link";
import QABrandLogo from "@/components/ui/qa-brand-logo";

export default function Footer() {
  return (
    <footer className="w-full bg-white text-neutral-600 text-sm py-12 sm:py-16 transition-colors border-t border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Grid: Brand Left + 4 Categorized Columns Right */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-14">
          {/* Brand & Mission Column (Span 4) */}
          <div className="md:col-span-4 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <QABrandLogo size="sm" showText={false} />
              <span className="text-2xl font-black text-neutral-900 tracking-tight lowercase">
                intelligent<span className="text-emerald-600">qa</span>
              </span>
            </Link>
            <p className="text-neutral-500 text-sm leading-relaxed max-w-sm">
              Transform from Manual QA to high-demand SDET &amp; AI Test
              Automation Architect. Master modern Playwright, Selenium, API
              frameworks, and AI-powered test agents.
            </p>
            <div className="pt-1 text-xs text-neutral-400 font-mono">
              Empowering QA Engineers
            </div>
          </div>

          {/* Right Columns: Product, Solutions, Resources, Company (Span 8) */}
          <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8">
            {/* Column 1: Product */}
            <div className="space-y-3.5">
              <h4 className="font-bold text-neutral-900 text-sm tracking-tight">
                Product
              </h4>
              <ul className="space-y-2.5 text-sm text-neutral-500">
                <li>
                  <Link
                    href="/tracks"
                    className="hover:text-neutral-900 transition-colors"
                  >
                    Courses &amp; Tracks
                  </Link>
                </li>
                <li>
                  <Link
                    href="/sandbox/code/problems"
                    className="hover:text-neutral-900 transition-colors"
                  >
                    Coding Library (DSA)
                  </Link>
                </li>
                <li>
                  <Link
                    href="/prompt-lab"
                    className="hover:text-neutral-900 transition-colors"
                  >
                    AI Prompt Lab
                  </Link>
                </li>
                <li>
                  <Link
                    href="/sandbox/code"
                    className="hover:text-neutral-900 transition-colors"
                  >
                    Online Code Compilers
                  </Link>
                </li>
                <li>
                  <Link
                    href="/interview-questions"
                    className="hover:text-neutral-900 transition-colors"
                  >
                    Interview Question Bank (800+)
                  </Link>
                </li>
                <li>
                  <Link
                    href="/interview-griller"
                    className="hover:text-neutral-900 transition-colors"
                  >
                    Live Interview Griller
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 2: Solutions */}
            <div className="space-y-3.5">
              <h4 className="font-bold text-neutral-900 text-sm tracking-tight">
                Solutions
              </h4>
              <ul className="space-y-2.5 text-sm text-neutral-500">
                <li>
                  <Link
                    href="/tracks"
                    className="hover:text-neutral-900 transition-colors"
                  >
                    Manual QA to SDET Roadmap
                  </Link>
                </li>
                <li>
                  <Link
                    href="/tracks/playwright-ts"
                    className="hover:text-neutral-900 transition-colors"
                  >
                    Playwright &amp; TypeScript Automation
                  </Link>
                </li>
                <li>
                  <Link
                    href="/tracks/selenium-java"
                    className="hover:text-neutral-900 transition-colors"
                  >
                    Selenium WebDriver &amp; Java POM
                  </Link>
                </li>
                <li>
                  <Link
                    href="/tracks/api-testing"
                    className="hover:text-neutral-900 transition-colors"
                  >
                    API Testing &amp; REST Assured
                  </Link>
                </li>
                <li>
                  <Link
                    href="/qa-agents"
                    className="hover:text-neutral-900 transition-colors"
                  >
                    Autonomous QA AI Agents
                  </Link>
                </li>
                <li>
                  <Link
                    href="/assessment"
                    className="hover:text-neutral-900 transition-colors"
                  >
                    1-Click SDET Skill Assessment
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Resources */}
            <div className="space-y-3.5">
              <h4 className="font-bold text-neutral-900 text-sm tracking-tight">
                Resources
              </h4>
              <ul className="space-y-2.5 text-sm text-neutral-500">
                <li>
                  <Link
                    href="/guides"
                    className="hover:text-neutral-900 transition-colors"
                  >
                    Documentation &amp; Concept Guides
                  </Link>
                </li>
                <li>
                  <Link
                    href="/prompt-lab"
                    className="hover:text-neutral-900 transition-colors"
                  >
                    QA Prompt Engineering Library
                  </Link>
                </li>
                <li>
                  <Link
                    href="/interview-questions"
                    className="hover:text-neutral-900 transition-colors"
                  >
                    800+ SDET Interview Bank
                  </Link>
                </li>
                <li>
                  <Link
                    href="/interview-griller"
                    className="hover:text-neutral-900 transition-colors"
                  >
                    AI Mock Interview Simulator
                  </Link>
                </li>
                <li>
                  <a
                    href="#faq"
                    className="hover:text-neutral-900 transition-colors"
                  >
                    Frequently Asked Questions (FAQs)
                  </a>
                </li>
                <li>
                  <Link
                    href="/sandbox/api"
                    className="hover:text-neutral-900 transition-colors"
                  >
                    Interactive API Mock Sandbox
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Company */}
            <div className="space-y-3.5">
              <h4 className="font-bold text-neutral-900 text-sm tracking-tight">
                Company
              </h4>
              <ul className="space-y-2.5 text-sm text-neutral-500">
                <li>
                  <a
                    href="#what-you-get"
                    className="hover:text-neutral-900 transition-colors"
                  >
                    About IntelligentQA
                  </a>
                </li>
                <li>
                  <Link
                    href="/tracks"
                    className="hover:text-neutral-900 transition-colors"
                  >
                    Curriculum &amp; Syllabus
                  </Link>
                </li>
                <li>
                  <Link
                    href="/assessment"
                    className="hover:text-neutral-900 transition-colors"
                  >
                    Skills Benchmark
                  </Link>
                </li>
                <li>
                  <a
                    href="#faq"
                    className="hover:text-neutral-900 transition-colors"
                  >
                    Free AI Studio Access
                  </a>
                </li>
                <li>
                  <Link
                    href="/signup"
                    className="hover:text-neutral-900 transition-colors font-medium text-emerald-600"
                  >
                    Get Free Lifetime Access →
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Divider matching Emergent style */}
        <div className="border-t border-neutral-200 mt-12 sm:mt-16 pt-8 flex flex-col md:flex-row items-center justify-between gap-5 text-[11px] font-mono tracking-wider text-neutral-500 uppercase">
          {/* Copyright Left */}
          <div>COPYRIGHT © INTELLIGENTQA 2026</div>

          {/* Designed and Built Center */}
          <div className="flex items-center gap-1.5 font-medium">
            DESIGNED AND BUILT FOR THE AWESOME QA COMMUNITY{" "}
            <span className="text-sky-500">💙</span>
          </div>

          {/* Social Icons Right */}
          <div className="flex items-center gap-4 text-neutral-500">
            {/* LinkedIn */}
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="hover:text-neutral-900 transition-colors"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
              </svg>
            </a>

            {/* X / Twitter */}
            <a
              href="https://x.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X"
              className="hover:text-neutral-900 transition-colors"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>

            {/* YouTube */}
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              className="hover:text-neutral-900 transition-colors"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>

            {/* Instagram */}
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="hover:text-neutral-900 transition-colors"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>

            {/* GitHub */}
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="hover:text-neutral-900 transition-colors"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
