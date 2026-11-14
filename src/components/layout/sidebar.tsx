'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { QABrandLogo } from '@/components/ui/qa-brand-logo';
import { QADatabase } from '@/lib/qa-db';
import { QA_TRACKS, getLessonHours } from '@/lib/qa-curriculum';
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

  // Individual Track collapsible states (collapsed by default to prevent heavy scrolling)
  const [openTracks, setOpenTracks] = useState<Record<string, boolean>>({
    'selenium-java': false,
    'playwright-ts': false,
    'api-testing': false,
    'ai-qa': false,
  });

  const toggleTrack = (trackId: string) => {
    setOpenTracks(prev => ({
      ...prev,
      [trackId]: !prev[trackId],
    }));
  };

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

  // Track last auto-opened track to allow user to freely collapse/expand on subsequent clicks
  const lastAutoOpenedTrackRef = useRef<string | null>(null);

  // Sidebar resizable width state (min 200px, max 480px, default 260px)
  const [sidebarWidth, setSidebarWidth] = useState<number>(260);
  const [isSidebarResizing, setIsSidebarResizing] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('intelligentqa_sidebar_width');
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed >= 200 && parsed <= 480) {
          setSidebarWidth(parsed);
        }
      }
    }
  }, []);

  const handleSidebarResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsSidebarResizing(true);
    const startX = e.clientX;
    const startWidth = sidebarWidth;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const delta = moveEvent.clientX - startX;
      const newWidth = Math.min(Math.max(startWidth + delta, 200), 480);
      setSidebarWidth(newWidth);
      try {
        localStorage.setItem('intelligentqa_sidebar_width', String(newWidth));
      } catch (err) {}
    };

    const handleMouseUp = () => {
      setIsSidebarResizing(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const isCourseActive =
    pathname?.startsWith('/tracks') ||
    pathname?.includes('/tracks/selenium-java') ||
    pathname?.includes('/tracks/playwright-ts') ||
    pathname?.includes('/tracks/api-testing') ||
    pathname?.includes('/tracks/ai-qa');

  // Keep active track expanded once when navigating into it, without re-opening on manual collapse
  useEffect(() => {
    if (!pathname) return;
    const matchedTrack = ['selenium-java', 'playwright-ts', 'api-testing', 'ai-qa'].find(id =>
      pathname.includes(`/tracks/${id}`)
    );
    if (matchedTrack && lastAutoOpenedTrackRef.current !== matchedTrack) {
      lastAutoOpenedTrackRef.current = matchedTrack;
      setOpenTracks(p => ({ ...p, [matchedTrack]: true }));
    }
  }, [pathname]);

  // Core curriculum tracks sequenced for Manual QA Transition
  const courseTracks = [
    {
      id: 'selenium-java',
      displayTitle: 'Selenium (Java)',
      stage: 'Stage 1',
      totalHours: '26h',
      tag: 'Java',
      icon: Terminal,
      iconColor: 'text-amber-500',
      badgeClass: 'text-amber-600 dark:text-amber-400 bg-amber-500/10',
      lessons: QA_TRACKS.find(t => t.id === 'selenium-java')?.modules.flatMap(m => m.lessons) || [],
    },
    {
      id: 'playwright-ts',
      displayTitle: 'Playwright (TS)',
      stage: 'Stage 2',
      totalHours: '24h',
      tag: 'TS',
      icon: Code2,
      iconColor: 'text-emerald-500',
      badgeClass: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10',
      lessons: QA_TRACKS.find(t => t.id === 'playwright-ts')?.modules.flatMap(m => m.lessons) || [],
    },
    {
      id: 'api-testing',
      displayTitle: 'Rest Assured (API)',
      stage: 'Stage 3',
      totalHours: '18h',
      tag: 'API',
      icon: Server,
      iconColor: 'text-purple-500',
      badgeClass: 'text-purple-600 dark:text-purple-400 bg-purple-500/10',
      lessons: QA_TRACKS.find(t => t.id === 'api-testing')?.modules.flatMap(m => m.lessons) || [],
    },
    {
      id: 'ai-qa',
      displayTitle: 'AI for QA',
      stage: 'Stage 4',
      totalHours: '20h',
      tag: 'AI',
      icon: Sparkles,
      iconColor: 'text-cyan-500',
      badgeClass: 'text-cyan-600 dark:text-cyan-400 bg-cyan-500/10',
      lessons: QA_TRACKS.find(t => t.id === 'ai-qa')?.modules.flatMap(m => m.lessons) || [],
    },
  ];

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
              <div className="pl-2 pr-1 py-1 space-y-1.5 border-l-2 border-slate-200 dark:border-neutral-800 ml-4 my-1">
                {courseTracks.map((track, trackIdx) => {
                  const isExpanded = openTracks[track.id];
                  const isTrackActive = pathname?.includes(`/tracks/${track.id}`);
                  const Icon = track.icon;

                  return (
                    <div key={track.id} className="space-y-0.5">
                      {/* Track Parent Row (Collapsible on click - toggles on every click) */}
                      <div
                        onClick={() => toggleTrack(track.id)}
                        className={`flex items-center justify-between px-2 py-1.5 rounded-lg text-xs font-medium transition-all group cursor-pointer ${
                          isTrackActive
                            ? 'bg-slate-100/90 dark:bg-neutral-800/80 font-semibold'
                            : 'hover:bg-slate-100/60 dark:hover:bg-neutral-800/40'
                        }`}
                      >
                        <div
                          className="flex items-center gap-2 truncate flex-1 min-w-0"
                          title={`${track.displayTitle} (${track.totalHours} · ${track.lessons.length} Lessons)`}
                        >
                          <Icon className={`w-3.5 h-3.5 ${track.iconColor} shrink-0`} />
                          <span className="truncate text-slate-800 dark:text-neutral-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 font-semibold">
                            {track.displayTitle}
                          </span>
                        </div>

                        <div
                          className="flex items-center gap-1 text-[9px] font-mono font-bold text-slate-500 dark:text-neutral-400 group-hover:text-slate-900 dark:hover:text-white px-1.5 py-0.5 rounded bg-slate-100 dark:bg-neutral-800/80 transition-colors ml-1 shrink-0"
                          title={isExpanded ? `Collapse ${track.displayTitle} lessons` : `Expand ${track.displayTitle} lessons`}
                        >
                          <span>{track.totalHours} · {track.lessons.length}L</span>
                          <ChevronDown
                            className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${
                              isExpanded ? 'rotate-180' : ''
                            }`}
                          />
                        </div>

                        {/* Hidden reference link for SEO and navigation: /tracks/selenium-java, /tracks/playwright-ts, /tracks/api-testing, /tracks/ai-qa */}
                        <span className="sr-only">
                          <Link href={`/tracks/${track.id}`}>{track.displayTitle}</Link>
                        </span>
                      </div>

                      {/* All Individual Lessons with total hours of each individual lesson */}
                      {isExpanded && (
                        <div className="pl-3 pr-0.5 py-0.5 space-y-0.5 border-l border-slate-200/80 dark:border-neutral-800/80 ml-3.5 my-0.5">
                          {track.lessons.map(lesson => {
                            const isLessonActive = pathname === `/tracks/${track.id}/${lesson.id}`;
                            const hours = getLessonHours(lesson.durationMinutes);

                            return (
                              <Link
                                key={lesson.id}
                                href={`/tracks/${track.id}/${lesson.id}`}
                                onClick={onCloseMobile}
                                className={`flex items-center justify-between px-2 py-1 rounded-md text-[11px] font-medium transition-all group ${
                                  isLessonActive
                                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-semibold shadow-xs'
                                    : 'text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-neutral-800/30'
                                }`}
                                title={lesson.title}
                              >
                                <span className="truncate pr-1.5">{lesson.title}</span>
                                <span className="text-[9px] font-mono shrink-0 px-1 py-0.2 rounded bg-slate-100/80 dark:bg-neutral-800/80 text-slate-400 dark:text-neutral-400 group-hover:text-slate-700 dark:group-hover:text-neutral-300">
                                  {hours}
                                </span>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}

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

        {/* SECTION: PRACTICE LABS (Aligned 1-4 Sequential Progression) */}
        <div className="space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-500 px-3 pb-1">
            Practice Labs
          </div>

          {/* 1. Selenium Web Lab */}
          <Link
            href="/sandbox/web?stack=selenium"
            onClick={onCloseMobile}
            className={childItemClass(pathname === '/sandbox/web')}
            title="Stage 1 Practice Lab: Selenium Web Automation Lab"
          >
            <div className="flex items-center gap-2 truncate">
              <Terminal className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <div className="flex flex-col truncate">
                <span className="truncate font-semibold text-slate-800 dark:text-neutral-200">1. Selenium Web Lab</span>
                <span className="text-[9px] text-slate-400 dark:text-neutral-500">Web Automation Lab</span>
              </div>
            </div>
            <span className="text-[9px] font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1 py-0.2 rounded shrink-0">
              Stage 1
            </span>
          </Link>

          {/* 2. Playwright Web Lab */}
          <Link
            href="/sandbox/web?stack=playwright"
            onClick={onCloseMobile}
            className={childItemClass(pathname === '/sandbox/web')}
            title="Stage 2 Practice Lab: Playwright Web Automation Lab"
          >
            <div className="flex items-center gap-2 truncate">
              <Code2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <div className="flex flex-col truncate">
                <span className="truncate font-semibold text-slate-800 dark:text-neutral-200">2. Playwright Web Lab</span>
                <span className="text-[9px] text-slate-400 dark:text-neutral-500">Web Automation Lab</span>
              </div>
            </div>
            <span className="text-[9px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1 py-0.2 rounded shrink-0">
              Stage 2
            </span>
          </Link>

          {/* 3. Rest Assured / API Lab */}
          <Link
            href="/sandbox/api"
            onClick={onCloseMobile}
            className={childItemClass(pathname === '/sandbox/api')}
            title="Stage 3 Practice Lab: Rest Assured API Testing Lab"
          >
            <div className="flex items-center gap-2 truncate">
              <Server className="w-3.5 h-3.5 text-purple-500 shrink-0" />
              <div className="flex flex-col truncate">
                <span className="truncate font-semibold text-slate-800 dark:text-neutral-200">3. Rest Assured / API Lab</span>
                <span className="text-[9px] text-slate-400 dark:text-neutral-500">API Testing Lab</span>
              </div>
            </div>
            <span className="text-[9px] font-mono font-bold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-1 py-0.2 rounded shrink-0">
              Stage 3
            </span>
          </Link>

          {/* 4. AI for QA & Prompt Lab */}
          <Link
            href="/qa-agents"
            onClick={onCloseMobile}
            className={childItemClass(pathname === '/qa-agents')}
            title="Stage 4 Practice Lab: AI for QA & Autonomous Agent Suite"
          >
            <div className="flex items-center gap-2 truncate">
              <Sparkles className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
              <div className="flex flex-col truncate">
                <span className="truncate font-semibold text-slate-800 dark:text-neutral-200">4. AI for QA &amp; Prompt Lab</span>
                <span className="text-[9px] text-slate-400 dark:text-neutral-500">Autonomous QA Agents</span>
              </div>
            </div>
            <span className="text-[9px] font-mono font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-1 py-0.2 rounded shrink-0">
              Stage 4
            </span>
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
      {/* DESKTOP SIDEBAR: Resizable on Right border */}
      <aside
        style={{ width: `${sidebarWidth}px` }}
        className="hidden md:flex min-h-screen shrink-0 sticky top-0 h-screen overflow-hidden z-20 relative select-none"
      >
        <div className="w-full h-full overflow-hidden">
          {sidebarContent}
        </div>

        {/* Draggable resize handle on right border */}
        <div
          onMouseDown={handleSidebarResizeStart}
          onDoubleClick={() => setSidebarWidth(260)}
          className={`absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:w-2 hover:bg-emerald-500/80 transition-all z-30 ${
            isSidebarResizing ? 'w-2 bg-emerald-500 shadow-md' : 'bg-transparent'
          }`}
          title="Drag to resize sidebar width (Double click to reset)"
        />
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
