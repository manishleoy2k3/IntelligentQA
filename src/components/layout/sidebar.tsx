'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { QABrandLogo } from '@/components/ui/qa-brand-logo';
import { QADatabase } from '@/lib/qa-db';
import WhatsAppDailyModal from '@/components/whatsapp/whatsapp-daily-modal';
import GeminiKeyModal from '@/components/auth/gemini-key-modal';
import {
  LayoutDashboard,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Code2,
  Terminal,
  Server,
  Sparkles,
  Layers,
  PlayCircle,
  Bot,
  Award,
  HelpCircle,
  Key,
  MessageCircle,
  User,
  LogOut,
  X,
  Settings,
  ShieldCheck,
  CheckCircle2,
  FileText,
  ListChecks,
  MessageSquare,
} from 'lucide-react';

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export default function Sidebar({ mobileOpen = false, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [geminiKey, setGeminiKey] = useState<string>('');
  const [aiPref, setAiPref] = useState<'enabled' | 'opted_out' | 'unset'>('unset');

  // Courses Sub-Menu collapsible state (open by default so child items are immediately accessible)
  const [coursesOpen, setCoursesOpen] = useState(true);
  // QA AI Agents Sub-Menu collapsible state (open by default for easy access)
  const [qaAgentsOpen, setQaAgentsOpen] = useState(true);
  const [activeAgentTab, setActiveAgentTab] = useState<string>('requirements');

  // Modals
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab) setActiveAgentTab(tab);

      const onSwitch = (e: any) => {
        if (e.detail?.tab) setActiveAgentTab(e.detail.tab);
      };
      window.addEventListener('intelligentqa_switch_agent_tab', onSwitch);
      return () => window.removeEventListener('intelligentqa_switch_agent_tab', onSwitch);
    }
  }, [pathname]);

  const handleAgentClick = (e: React.MouseEvent, tab: string) => {
    const key = QADatabase.getUserGeminiKey(currentUser?.id);
    if (!key) {
      e.preventDefault();
      setShowKeyModal(true);
      return;
    }
    setActiveAgentTab(tab);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('intelligentqa_switch_agent_tab', { detail: { tab } }));
      if (pathname === '/qa-agents') {
        window.history.pushState(null, '', `/qa-agents?tab=${tab}`);
      }
    }
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const user = QADatabase.getCurrentUser();
      setCurrentUser(user);
      setGeminiKey(QADatabase.getUserGeminiKey(user?.id));
      setAiPref(QADatabase.getAiPreference(user?.id));

      const handleAuth = () => {
        const u = QADatabase.getCurrentUser();
        setCurrentUser(u);
        setGeminiKey(QADatabase.getUserGeminiKey(u?.id));
        setAiPref(QADatabase.getAiPreference(u?.id));
      };

      window.addEventListener('intelligentqa_auth_changed', handleAuth);
      window.addEventListener('intelligentqa_key_changed', handleAuth);
      window.addEventListener('intelligentqa_ai_pref_changed', handleAuth);

      return () => {
        window.removeEventListener('intelligentqa_auth_changed', handleAuth);
        window.removeEventListener('intelligentqa_key_changed', handleAuth);
        window.removeEventListener('intelligentqa_ai_pref_changed', handleAuth);
      };
    }
  }, []);

  const isCourseActive =
    pathname?.startsWith('/tracks') ||
    pathname?.includes('/tracks/selenium-java') ||
    pathname?.includes('/tracks/playwright-ts') ||
    pathname?.includes('/tracks/api-testing') ||
    pathname?.includes('/tracks/ai-qa');

  const navItemClass = (active: boolean) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group cursor-pointer ${
      active
        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold shadow-sm'
        : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-800/60'
    }`;

  const childItemClass = (active: boolean) =>
    `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group cursor-pointer ${
      active
        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-semibold'
        : 'text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-neutral-800/40'
    }`;

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between bg-white dark:bg-[#0C0E12] border-r border-slate-200 dark:border-neutral-800/80 font-sans select-none">
      {/* 1. TOP BRAND HEADER */}
      <div className="p-4 border-b border-slate-200/80 dark:border-neutral-800/80 flex items-center justify-between shrink-0">
        <Link
          href="/dashboard"
          onClick={onCloseMobile}
          className="flex items-center gap-2.5 focus:outline-none"
        >
          <QABrandLogo size={32} showText={true} showZeroCostBadge={false} />
        </Link>

        {/* Mobile close button */}
        {onCloseMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* 2. SCROLLABLE NAVIGATION MENUS */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {/* SECTION: WORKSPACE */}
        <div className="space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-500 px-3 pb-1">
            Workspace
          </div>

          {/* Dashboard */}
          <Link
            href="/dashboard"
            onClick={onCloseMobile}
            className={navItemClass(pathname === '/dashboard')}
          >
            <LayoutDashboard className="w-4 h-4 shrink-0 text-emerald-500" />
            <span>Dashboard</span>
          </Link>

          {/* COURSES (Parent Menu with Child / Sub-Menu items) */}
          <div className="space-y-1 pt-1">
            <button
              type="button"
              onClick={() => setCoursesOpen(!coursesOpen)}
              className={`w-full ${navItemClass(isCourseActive)} justify-between`}
            >
              <div className="flex items-center gap-3">
                <BookOpen className="w-4 h-4 shrink-0 text-amber-500" />
                <span>Courses</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-neutral-800 text-slate-500 dark:text-neutral-400">
                  4 Tracks
                </span>
                {coursesOpen ? (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 transition-transform" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 transition-transform" />
                )}
              </div>
            </button>

            {/* Courses Child / Sub-Menu Items */}
            {coursesOpen && (
              <div className="pl-4 pr-1 py-1 space-y-1 border-l-2 border-slate-200 dark:border-neutral-800 ml-4.5 my-1">
                {/* 1. Selenium (Java) */}
                <Link
                  href="/tracks/selenium-java"
                  onClick={onCloseMobile}
                  className={childItemClass(pathname?.includes('/tracks/selenium-java') || false)}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Terminal className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span className="truncate">Selenium (Java)</span>
                  </div>
                  <span className="text-[9px] font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1 py-0.2 rounded">
                    Java
                  </span>
                </Link>

                {/* 2. Playwright (TypeScript) */}
                <Link
                  href="/tracks/playwright-ts"
                  onClick={onCloseMobile}
                  className={childItemClass(pathname?.includes('/tracks/playwright-ts') || false)}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Code2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span className="truncate">Playwright (TS)</span>
                  </div>
                  <span className="text-[9px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1 py-0.2 rounded">
                    TS
                  </span>
                </Link>

                {/* 3. Rest Assured (API) */}
                <Link
                  href="/tracks/api-testing"
                  onClick={onCloseMobile}
                  className={childItemClass(pathname?.includes('/tracks/api-testing') || false)}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Server className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                    <span className="truncate">Rest Assured (API)</span>
                  </div>
                  <span className="text-[9px] font-mono font-bold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-1 py-0.2 rounded">
                    API
                  </span>
                </Link>

                {/* 4. AI for QA */}
                <Link
                  href="/tracks/ai-qa"
                  onClick={onCloseMobile}
                  className={childItemClass(pathname?.includes('/tracks/ai-qa') || false)}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                    <span className="truncate">AI for QA</span>
                  </div>
                  <span className="text-[9px] font-mono font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-1 py-0.2 rounded">
                    AI
                  </span>
                </Link>

                {/* Overview / All Tracks */}
                <Link
                  href="/tracks"
                  onClick={onCloseMobile}
                  className={childItemClass(pathname === '/tracks')}
                >
                  <div className="flex items-center gap-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
                    <Layers className="w-3.5 h-3.5 shrink-0" />
                    <span>All Courses &amp; Roadmaps</span>
                  </div>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* SECTION: PRACTICE LABS */}
        <div className="space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-500 px-3 pb-1">
            Practice Labs
          </div>

          <Link
            href="/sandbox/web"
            onClick={onCloseMobile}
            className={navItemClass(pathname === '/sandbox/web')}
          >
            <PlayCircle className="w-4 h-4 shrink-0 text-emerald-500" />
            <span>Web Automation Lab</span>
          </Link>

          <Link
            href="/sandbox/api"
            onClick={onCloseMobile}
            className={navItemClass(pathname === '/sandbox/api')}
          >
            <Server className="w-4 h-4 shrink-0 text-purple-500" />
            <span>API Testing Lab</span>
          </Link>
        </div>

        {/* SECTION: AI AGENTS & TOOLS */}
        <div className="space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-500 px-3 pb-1">
            AI Tools &amp; Agents
          </div>

          {/* QA AI AGENTS (Parent Menu with Child / Sub-Menu items for easy access) */}
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => setQaAgentsOpen(!qaAgentsOpen)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                pathname === '/qa-agents'
                  ? 'bg-slate-100 dark:bg-neutral-800/80 text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-700 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800/60'
              } group cursor-pointer`}
            >
              <div className="flex items-center gap-3">
                <Bot className="w-4 h-4 shrink-0 text-indigo-500" />
                <span>QA AI Agents</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-500">
                  5 Agents
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                    qaAgentsOpen ? 'rotate-180' : ''
                  }`}
                />
              </div>
            </button>

            {qaAgentsOpen && (
              <div className="pl-4 pr-1 py-1 space-y-0.5 border-l-2 border-indigo-200/60 dark:border-indigo-900/40 ml-4">
                {/* 1. Requirement Generator */}
                <Link
                  href="/qa-agents?tab=requirements"
                  onClick={e => handleAgentClick(e, 'requirements')}
                  className={childItemClass(pathname === '/qa-agents' && activeAgentTab === 'requirements')}
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                    <span className="truncate">Requirement Generator</span>
                  </div>
                  <span className="text-[9px] font-mono font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-1 py-0.2 rounded">
                    REQ
                  </span>
                </Link>

                {/* 2. Test Case Generator */}
                <Link
                  href="/qa-agents?tab=test_cases"
                  onClick={e => handleAgentClick(e, 'test_cases')}
                  className={childItemClass(pathname === '/qa-agents' && activeAgentTab === 'test_cases')}
                >
                  <div className="flex items-center gap-2 truncate">
                    <ListChecks className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span className="truncate">Test Case Generator</span>
                  </div>
                  <span className="text-[9px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1 py-0.2 rounded">
                    TC
                  </span>
                </Link>

                {/* 3. Automation Code Generator */}
                <Link
                  href="/qa-agents?tab=automation_code"
                  onClick={e => handleAgentClick(e, 'automation_code')}
                  className={childItemClass(pathname === '/qa-agents' && activeAgentTab === 'automation_code')}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Code2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span className="truncate">Automation Generator</span>
                  </div>
                  <span className="text-[9px] font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-1 py-0.2 rounded">
                    CODE
                  </span>
                </Link>

                {/* 4. Code Reviewer & Auditor */}
                <Link
                  href="/qa-agents?tab=code_review"
                  onClick={e => handleAgentClick(e, 'code_review')}
                  className={childItemClass(pathname === '/qa-agents' && activeAgentTab === 'code_review')}
                >
                  <div className="flex items-center gap-2 truncate">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span className="truncate">Code Auditor</span>
                  </div>
                  <span className="text-[9px] font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1 py-0.2 rounded">
                    AUDIT
                  </span>
                </Link>

                {/* 5. Senior SDET Mentor Chat */}
                <Link
                  href="/qa-agents?tab=chat"
                  onClick={e => handleAgentClick(e, 'chat')}
                  className={childItemClass(pathname === '/qa-agents' && activeAgentTab === 'chat')}
                >
                  <div className="flex items-center gap-2 truncate">
                    <MessageSquare className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                    <span className="truncate">Senior SDET Mentor</span>
                  </div>
                  <span className="text-[9px] font-mono font-bold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-1 py-0.2 rounded">
                    CHAT
                  </span>
                </Link>
              </div>
            )}
          </div>

          <Link
            href="/interview-griller"
            onClick={e => {
              const key = QADatabase.getUserGeminiKey(currentUser?.id);
              if (!key) {
                e.preventDefault();
                setShowKeyModal(true);
              } else if (onCloseMobile) {
                onCloseMobile();
              }
            }}
            className={navItemClass(pathname === '/interview-griller')}
          >
            <Award className="w-4 h-4 shrink-0 text-rose-500" />
            <span>AI Interview Griller</span>
          </Link>

          {/* Gemini API Key - Kept strictly under AI Tools and Agents group */}
          <button
            type="button"
            onClick={() => {
              if (onCloseMobile) onCloseMobile();
              setShowKeyModal(true);
            }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all group cursor-pointer ${
              geminiKey
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold'
                : 'text-slate-600 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <Key className="w-4 h-4 shrink-0 text-amber-500" />
              <div className="flex flex-col text-left">
                <span className="text-sm font-semibold leading-tight text-slate-900 dark:text-white">
                  Gemini API Key
                </span>
                <div className="mt-0.5">
                  <span
                    className={`inline-flex items-center gap-1 text-[9px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider ${
                      geminiKey
                        ? 'bg-emerald-600 text-white'
                        : 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {geminiKey ? 'ACTIVE' : 'CONFIGURE'}
                  </span>
                </div>
              </div>
            </div>
          </button>
        </div>

        {/* SECTION: INTERVIEW BANK */}
        <div className="space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-500 px-3 pb-1">
            Interview Bank
          </div>

          <Link
            href="/interview-questions"
            onClick={onCloseMobile}
            className={navItemClass(pathname === '/interview-questions')}
          >
            <HelpCircle className="w-4 h-4 shrink-0 text-sky-500" />
            <span>Interview Questions</span>
            <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-500">
              500+
            </span>
          </Link>
        </div>

        {/* SECTION: UTILITIES */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-neutral-800/80">
          {/* WhatsApp Daily SDET Quiz */}
          <div className="w-full">
            <WhatsAppDailyModal />
          </div>
        </div>
      </div>

      {/* Embedded Modals */}
      {showKeyModal && (
        <GeminiKeyModal
          isOpen={showKeyModal}
          onClose={() => setShowKeyModal(false)}
          onSaved={() => {
            setShowKeyModal(false);
            setGeminiKey(QADatabase.getUserGeminiKey());
          }}
          reason="Please connect your free Google AI Studio key to activate AI tools and Autonomous QA Agents."
        />
      )}
    </div>
  );

  return (
    <>
      {/* DESKTOP SIDEBAR: Fixed on Left */}
      <aside className="hidden md:flex w-64 min-h-screen shrink-0 sticky top-0 h-screen overflow-hidden z-20">
        {sidebarContent}
      </aside>

      {/* MOBILE DRAWER: Off-canvas overlay on mobile screens */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            onClick={onCloseMobile}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          />

          {/* Drawer container */}
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
