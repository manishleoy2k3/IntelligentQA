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
  Laptop,
  Layers,
  PlayCircle,
  Bot,
  Award,
  HelpCircle,
  FlaskConical,
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
  Gamepad2,
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

  // Practice Labs collapsible state
  const [practiceLabsOpen, setPracticeLabsOpen] = useState(true);

  // AI Tools & Agents collapsible state
  const [aiToolsSectionOpen, setAiToolsSectionOpen] = useState(true);

  // Interview Bank collapsible state
  const [interviewBankOpen, setInterviewBankOpen] = useState(true);

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

  // Active Portal Mode: 'sdet' | 'kids' (Strict separation between Kids Free Coding & SDET Pro)
  
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const syncAdminRole = () => {
        const u = QADatabase.getCurrentUser();
        setCurrentUser(u);
        setIsAdmin(QADatabase.isAdmin(u));
      };
      syncAdminRole();
      window.addEventListener('intelligentqa_role_changed', syncAdminRole);
      window.addEventListener('intelligentqa_auth_changed', syncAdminRole);







      return () => {



        window.removeEventListener('intelligentqa_role_changed', syncAdminRole);
        window.removeEventListener('intelligentqa_auth_changed', syncAdminRole);
      };
    }
  }, [pathname]);

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

  const isPracticeActive = pathname?.startsWith('/sandbox');
  const isAiToolsActive = pathname?.includes('/qa-agents') || pathname?.includes('/interview-griller');
  const isInterviewActive = pathname?.includes('/interview-questions');

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
    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group cursor-pointer ${
      active
        ? 'bg-[#1E1E1E] text-[#81FF89] border border-[#262626] font-semibold shadow-sm'
        : 'text-[#A1A1AA] hover:text-white hover:bg-[#1A1A1A]'
    }`;

  const childItemClass = (active: boolean) =>
    `flex items-center justify-between px-3.5 py-2 rounded-lg text-xs font-medium transition-all group cursor-pointer ${
      active
        ? 'bg-[#1E1E1E] text-[#81FF89] font-semibold'
        : 'text-[#A1A1AA] hover:text-white hover:bg-[#1A1A1A]'
    }`;


  const sidebarContent = (
    <div className="flex flex-col h-full justify-between bg-[#141414] border-r border-[#262626] font-sans select-none text-white">
      {/* 1. TOP BRAND HEADER */}
      <div className="p-4 border-b border-[#262626] flex items-center justify-between shrink-0">
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
            className="md:hidden p-1.5 rounded-lg text-[#A1A1AA] hover:text-white hover:bg-[#1E1E1E] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* 2. SCROLLABLE NAVIGATION MENUS */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">

            {/* NAVIGATION */}
            <div className="space-y-1">
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
                  const guideSlug = track.id === 'selenium-java' ? 'selenium' : track.id === 'playwright-ts' ? 'playwright' : track.id;
                  const isTrackActive =
                    pathname?.includes(`/tracks/${track.id}`) ||
                    pathname === `/guides/${guideSlug}` ||
                    pathname?.startsWith(`/guides/${guideSlug}/`);
                  const Icon = track.icon;

                  return (
                    <div key={track.id} className="space-y-0.5">
                      {/* Track Parent Row (Navigates to Track's Guide & Import Hub on click, expands lessons) */}
                      <div
                        onClick={() => toggleTrack(track.id)}
                        className={`flex items-center justify-between px-2 py-1.5 rounded-lg text-xs font-medium transition-all group cursor-pointer ${
                          isTrackActive
                            ? 'bg-slate-100/90 dark:bg-neutral-800/80 font-semibold text-emerald-600 dark:text-emerald-400'
                            : 'hover:bg-slate-100/60 dark:hover:bg-neutral-800/40 text-slate-800 dark:text-neutral-200'
                        }`}
                        title={`${track.displayTitle}: Open Guide & Import Hub`}
                      >
                        <Link
                          href={`/guides/${guideSlug}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenTracks(p => ({ ...p, [track.id]: true }));
                            onCloseMobile?.();
                          }}
                          className="flex items-center gap-2 truncate flex-1 min-w-0"
                          title={`${track.displayTitle} (${track.lessons.length} Lessons)`}
                        >
                          <Icon className={`w-3.5 h-3.5 ${track.iconColor} shrink-0`} />
                          <span className="truncate font-semibold">
                            {track.displayTitle}
                          </span>
                        </Link>

                        <div
                          className="flex items-center gap-1 text-[9px] font-mono font-bold text-slate-500 dark:text-neutral-400 group-hover:text-slate-900 dark:hover:text-white px-1.5 py-0.5 rounded bg-slate-100 dark:bg-neutral-800/80 transition-colors ml-1 shrink-0"
                          title={isExpanded ? `Collapse ${track.displayTitle} lessons` : `Expand ${track.displayTitle} lessons`}
                        >
                          <span>{track.lessons.length} Lessons</span>
                          <ChevronDown
                            className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${
                              isExpanded ? 'rotate-180' : ''
                            }`}
                          />
                        </div>
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

        {/* SECTION: PRACTICE LABS (Collapsible Parent Menu matching Courses) */}
        <div className="space-y-1 pt-1">
          <button
            type="button"
            onClick={() => setPracticeLabsOpen(!practiceLabsOpen)}
            className={`w-full ${navItemClass(isPracticeActive)} justify-between`}
          >
            <div className="flex items-center gap-3">
              <FlaskConical className="w-4 h-4 shrink-0 text-cyan-500" />
              <span>Practice Labs</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-neutral-800 text-slate-500 dark:text-neutral-400">
                6 Labs
              </span>
              {practiceLabsOpen ? (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 transition-transform" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 transition-transform" />
              )}
            </div>
          </button>

          {/* Practice Labs Child Items */}
          {practiceLabsOpen && (
            <div className="pl-2 pr-1 py-1 space-y-1.5 border-l-2 border-slate-200 dark:border-neutral-800 ml-4 my-1">
              {/* Online Compilers */}
              <Link
                href="/sandbox/code"
                onClick={onCloseMobile}
                className={childItemClass(pathname === '/sandbox/code')}
                title="Online Compilers: Multi-Language Compiler & Runner (Java, Python, TypeScript, JS, C#)"
              >
                <div className="flex items-center gap-2 truncate">
                  <Laptop className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <div className="flex flex-col truncate">
                    <span className="truncate font-semibold text-slate-800 dark:text-neutral-200">Online Compilers</span>
                    <span className="text-[10px] text-slate-500 dark:text-neutral-400">Java, Python, TS, JS, C#</span>
                  </div>
                </div>
              </Link>

              {/* Coding Library */}
              <Link
                href="/sandbox/code/problems"
                onClick={onCloseMobile}
                className={childItemClass(pathname?.startsWith('/sandbox/code/problems'))}
                title="Coding Library: List of SDET Interview Problems by Group & Level"
              >
                <div className="flex items-center gap-2 truncate">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <div className="flex flex-col truncate">
                    <span className="truncate font-semibold text-slate-800 dark:text-neutral-200">Coding Library</span>
                    <span className="text-[10px] text-slate-500 dark:text-neutral-400">Problems by Topic &amp; Level</span>
                  </div>
                </div>
              </Link>

              {/* Selenium Web Lab */}
              <Link
                href="/sandbox/web?stack=selenium"
                onClick={onCloseMobile}
                className={childItemClass(pathname === '/sandbox/web' && (!pathname.includes('stack=playwright') && !pathname.includes('mode=playwright')))}
                title="Selenium Web Automation Lab"
              >
                <div className="flex items-center gap-2 truncate">
                  <Terminal className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <div className="flex flex-col truncate">
                    <span className="truncate font-semibold text-slate-800 dark:text-neutral-200">Selenium Web Lab</span>
                    <span className="text-[10px] text-slate-500 dark:text-neutral-400">Web Automation Lab</span>
                  </div>
                </div>
              </Link>

              {/* Playwright Web Lab */}
              <Link
                href="/sandbox/web?stack=playwright"
                onClick={onCloseMobile}
                className={childItemClass(pathname === '/sandbox/web' && (pathname.includes('stack=playwright') || pathname.includes('mode=playwright')))}
                title="Playwright Web Automation Lab"
              >
                <div className="flex items-center gap-2 truncate">
                  <Code2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <div className="flex flex-col truncate">
                    <span className="truncate font-semibold text-slate-800 dark:text-neutral-200">Playwright Web Lab</span>
                    <span className="text-[10px] text-slate-500 dark:text-neutral-400">Web Automation Lab</span>
                  </div>
                </div>
              </Link>

              {/* Rest Assured / API Lab */}
              <Link
                href="/sandbox/api"
                onClick={onCloseMobile}
                className={childItemClass(pathname === '/sandbox/api')}
                title="Rest Assured API Testing Lab"
              >
                <div className="flex items-center gap-2 truncate">
                  <Server className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                  <div className="flex flex-col truncate">
                    <span className="truncate font-semibold text-slate-800 dark:text-neutral-200">Rest Assured / API Lab</span>
                    <span className="text-[10px] text-slate-500 dark:text-neutral-400">API Testing Lab</span>
                  </div>
                </div>
              </Link>

              {/* AI for QA & Prompt Lab */}
              <Link
                href="/qa-agents"
                onClick={onCloseMobile}
                className={childItemClass(pathname === '/qa-agents')}
                title="AI for QA & Autonomous Agent Suite"
              >
                <div className="flex items-center gap-2 truncate">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                  <div className="flex flex-col truncate">
                    <span className="truncate font-semibold text-slate-800 dark:text-neutral-200">AI for QA &amp; Prompt Lab</span>
                    <span className="text-[10px] text-slate-500 dark:text-neutral-400">Autonomous QA Agents</span>
                  </div>
                </div>
              </Link>
            </div>
          )}
        </div>

        {/* SECTION: AI AGENTS & TOOLS (Collapsible Parent Menu matching Courses) */}
        <div className="space-y-1 pt-1">
          <button
            type="button"
            onClick={() => setAiToolsSectionOpen(!aiToolsSectionOpen)}
            className={`w-full ${navItemClass(isAiToolsActive)} justify-between`}
          >
            <div className="flex items-center gap-3">
              <Sparkles className="w-4 h-4 shrink-0 text-indigo-500" />
              <span>AI Tools &amp; Agents</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-neutral-800 text-slate-500 dark:text-neutral-400">
                AI Suite
              </span>
              {aiToolsSectionOpen ? (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 transition-transform" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 transition-transform" />
              )}
            </div>
          </button>

          {aiToolsSectionOpen && (
            <div className="pl-2 pr-1 py-1 space-y-1.5 border-l-2 border-slate-200 dark:border-neutral-800 ml-4 my-1">
              {/* QA AI AGENTS (Parent Menu with Child / Sub-Menu items for easy access) */}
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => setQaAgentsOpen(!qaAgentsOpen)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                    pathname === '/qa-agents'
                      ? 'bg-slate-100 dark:bg-neutral-800/80 text-indigo-600 dark:text-indigo-400'
                      : 'text-slate-700 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800/60'
                  } group cursor-pointer`}
                >
                  <div className="flex items-center gap-2">
                    <Bot className="w-3.5 h-3.5 shrink-0 text-indigo-500" />
                    <span>QA AI Agents</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-500">
                      5 Agents
                    </span>
                    <ChevronDown
                      className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${
                        qaAgentsOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </button>

                {qaAgentsOpen && (
                  <div className="pl-3 pr-1 py-0.5 space-y-0.5 border-l border-indigo-200/60 dark:border-indigo-900/40 ml-3">
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

              {/* AI Interview Griller */}
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
                className={childItemClass(pathname === '/interview-griller')}
                title="AI Interview Griller: Live Technical Mock Interviews"
              >
                <div className="flex items-center gap-2 truncate">
                  <Award className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <div className="flex flex-col truncate">
                    <span className="truncate font-semibold text-slate-800 dark:text-neutral-200">AI Interview Griller</span>
                    <span className="text-[10px] text-slate-500 dark:text-neutral-400">Live Mock Simulation</span>
                  </div>
                </div>
                <span className="text-[9px] font-mono font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded shrink-0">
                  MOCK
                </span>
              </Link>

              {/* Gemini API Key */}
              <button
                type="button"
                onClick={() => {
                  if (onCloseMobile) onCloseMobile();
                  setShowKeyModal(true);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-semibold transition-all group cursor-pointer ${
                  geminiKey
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'text-slate-600 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Key className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-semibold leading-tight text-slate-900 dark:text-white">
                      Gemini API Key
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      {geminiKey ? 'Active Key Connected' : 'Free AI Studio Key'}
                    </span>
                  </div>
                </div>
                <div>
                  <span
                    className={`inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                      geminiKey
                        ? 'bg-emerald-600 text-white'
                        : 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {geminiKey ? 'ACTIVE' : 'CONFIGURE'}
                  </span>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* SECTION: INTERVIEW BANK (Collapsible Parent Menu matching Courses) */}
        <div className="space-y-1 pt-1">
          <button
            type="button"
            onClick={() => setInterviewBankOpen(!interviewBankOpen)}
            className={`w-full ${navItemClass(isInterviewActive)} justify-between`}
          >
            <div className="flex items-center gap-3">
              <HelpCircle className="w-4 h-4 shrink-0 text-sky-500" />
              <span>Interview Bank</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-neutral-800 text-slate-500 dark:text-neutral-400">
                500+ Qs
              </span>
              {interviewBankOpen ? (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 transition-transform" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 transition-transform" />
              )}
            </div>
          </button>

          {interviewBankOpen && (
            <div className="pl-2 pr-1 py-1 space-y-1.5 border-l-2 border-slate-200 dark:border-neutral-800 ml-4 my-1">
              <Link
                href="/interview-questions"
                onClick={onCloseMobile}
                className={childItemClass(pathname === '/interview-questions')}
                title="500+ Curated SDET & Automation Interview Question Bank"
              >
                <div className="flex items-center gap-2 truncate">
                  <HelpCircle className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                  <div className="flex flex-col truncate">
                    <span className="truncate font-semibold text-slate-800 dark:text-neutral-200">Interview Questions</span>
                    <span className="text-[10px] text-slate-500 dark:text-neutral-400">500+ Question Bank</span>
                  </div>
                </div>
                <span className="text-[9px] font-mono font-bold text-sky-600 dark:text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded shrink-0">
                  500+
                </span>
              </Link>
            </div>
          )}
        </div>

        {/* ADMIN CMS (Strictly Role-Based: Admin Only) */}
        {isAdmin && (
          <div className="space-y-1 pt-2 border-t border-purple-500/20">
            <div className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 px-3 pb-1 flex items-center justify-between">
              <span>Administration</span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-600 dark:text-purple-300 font-bold">
                CMS
              </span>
            </div>
            <Link
              href="/admin"
              onClick={onCloseMobile}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                pathname === '/admin' || pathname === '/admin/cms'
                  ? 'bg-purple-500/20 text-purple-600 dark:text-purple-300 font-bold border-l-2 border-purple-500 pl-2.5'
                  : 'text-purple-700 dark:text-purple-400 hover:bg-purple-500/10'
              }`}
              title="Admin Dashboard (Admin Only)"
            >
              <ShieldCheck className="w-4 h-4 shrink-0 text-purple-500" />
              <div className="flex items-center justify-between flex-1 truncate">
                <span className="truncate">Admin Dashboard</span>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-600 dark:text-purple-300 border border-purple-500/30">
                  ADMIN
                </span>
              </div>
            </Link>
          </div>
        )}

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
            const u = QADatabase.getCurrentUser();
            setGeminiKey(QADatabase.getUserGeminiKey(u?.id));
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
