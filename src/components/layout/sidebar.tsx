'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { QABrandLogo } from '@/components/ui/qa-brand-logo';
import { QADatabase } from '@/lib/qa-db';
import { QA_TRACKS, getLessonHours } from '@/lib/qa-curriculum';
import { ACADEMY_MODULES } from '@/data/learning/academy-curriculum';
import { Track, Module, Lesson } from '@/types/qa';
import WhatsAppDailyModal from '@/components/whatsapp/whatsapp-daily-modal';
import GeminiKeyModal from '@/components/auth/gemini-key-modal';
import {
  LayoutDashboard,
  BookOpen,
  Search,
  ChevronDown,
  ChevronRight,
  Code2,
  Terminal,
  Server,
  Sparkles,
  Laptop,
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
  Compass,
  FolderKanban,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Trash2,
  Smartphone,
  GitBranch,
  GitMerge,
  Workflow,
  Cpu,
  Layers,
} from 'lucide-react';
import { INITIAL_PUBLISHED_COURSES, AcademyClientCourse } from '@/data/learning/initial-courses';

function getCourseMeta(course: any) {
  const slug = (course.slug || '').toLowerCase();
  const id = (course.id || '').toLowerCase();
  const title = (course.title || '').toLowerCase();

  if (slug.includes('ai') || title.includes('ai academy')) {
    return {
      displayTitle: 'AI Academy',
      tag: 'AI',
      icon: Sparkles,
      iconColor: 'text-cyan-500',
      badgeClass: 'text-cyan-600 dark:text-cyan-400 bg-cyan-500/10',
      hours: `${course.estimatedHours || 20}h`,
    };
  }
  if (slug.includes('selenium') || title.includes('selenium')) {
    return {
      displayTitle: 'Selenium (Java)',
      tag: 'Java',
      icon: Terminal,
      iconColor: 'text-amber-500',
      badgeClass: 'text-amber-600 dark:text-amber-400 bg-amber-500/10',
      hours: `${course.estimatedHours || 26}h`,
    };
  }
  if (slug.includes('playwright') || title.includes('playwright')) {
    return {
      displayTitle: 'Playwright (TS)',
      tag: 'TS',
      icon: Code2,
      iconColor: 'text-emerald-500',
      badgeClass: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10',
      hours: `${course.estimatedHours || 24}h`,
    };
  }
  if (slug.includes('rest-assured') || title.includes('rest assured')) {
    return {
      displayTitle: 'Rest Assured (API)',
      tag: 'API',
      icon: Server,
      iconColor: 'text-purple-500',
      badgeClass: 'text-purple-600 dark:text-purple-400 bg-purple-500/10',
      hours: `${course.estimatedHours || 22}h`,
    };
  }
  if (slug.includes('contract') || slug.includes('fullstack') || title.includes('full-stack api')) {
    return {
      displayTitle: 'Full-Stack API & Contracts',
      tag: 'Pact',
      icon: Layers,
      iconColor: 'text-blue-500',
      badgeClass: 'text-blue-600 dark:text-blue-400 bg-blue-500/10',
      hours: `${course.estimatedHours || 16}h`,
    };
  }
  if (slug.includes('appium') || title.includes('appium') || slug.includes('mobile') || title.includes('mobile')) {
    return {
      displayTitle: 'Mobile Testing & Automation',
      tag: 'Mobile',
      icon: Smartphone,
      iconColor: 'text-pink-500',
      badgeClass: 'text-pink-600 dark:text-pink-400 bg-pink-500/10',
      hours: `${course.estimatedHours || 26}h`,
    };
  }
  if (slug.includes('github') || title.includes('github')) {
    return {
      displayTitle: 'GitHub Actions CI/CD',
      tag: 'CI/CD',
      icon: GitBranch,
      iconColor: 'text-orange-500',
      badgeClass: 'text-orange-600 dark:text-orange-400 bg-orange-500/10',
      hours: `${course.estimatedHours || 14}h`,
    };
  }
  if (slug.includes('azure') || title.includes('azure')) {
    return {
      displayTitle: 'Azure DevOps CI/CD',
      tag: 'Cloud',
      icon: Workflow,
      iconColor: 'text-sky-500',
      badgeClass: 'text-sky-600 dark:text-sky-400 bg-sky-500/10',
      hours: `${course.estimatedHours || 16}h`,
    };
  }
  if (slug.includes('jenkins') || title.includes('jenkins')) {
    return {
      displayTitle: 'Jenkins Pipelines',
      tag: 'CI/CD',
      icon: Cpu,
      iconColor: 'text-red-500',
      badgeClass: 'text-red-600 dark:text-red-400 bg-red-500/10',
      hours: `${course.estimatedHours || 16}h`,
    };
  }

  return {
    displayTitle: course.title,
    tag: 'Course',
    icon: BookOpen,
    iconColor: 'text-emerald-500',
    badgeClass: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10',
    hours: `${course.estimatedHours || 10}h`,
  };
}

function getSidebarModuleIcon(modTitle: string, trackId: string) {
  const t = (modTitle || '').toLowerCase();
  if (t === 'git' || (t.includes('git') && !t.includes('github') && !t.includes('ci/cd'))) return GitBranch;
  if (t.includes('github')) return GitMerge;
  if (t.includes('azure')) return Workflow;
  if (t.includes('jenkins')) return Cpu;
  if (t.includes('rest assured') || t.includes('rest-assured')) return Server;
  if (t.includes('contract') || t.includes('fullstack') || t.includes('full-stack')) return Layers;
  if (trackId.includes('ai')) return Sparkles;
  return FolderKanban;
}

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}


export default function Sidebar({ mobileOpen = false, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(new Set());
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

  // Search query on top of Left Navigation Panel
  const [searchQuery, setSearchQuery] = useState('');

  // Collapsible state for course modules / groups (open by default)
  const [openModules, setOpenModules] = useState<Record<string, boolean>>({});

  const isModuleOpen = (moduleId: string) => {
    if (searchQuery.trim()) return true;
    return openModules[moduleId] !== false; // defaults to true
  };

  const toggleModule = (moduleId: string) => {
    setOpenModules(prev => ({
      ...prev,
      [moduleId]: prev[moduleId] !== undefined ? !prev[moduleId] : false,
    }));
  };

  // Individual Track collapsible states (collapsed by default to prevent heavy scrolling)
  const [openTracks, setOpenTracks] = useState<Record<string, boolean>>({
    'selenium-java': false,
    'playwright-ts': false,
    'api-testing': false,
    'ai-qa': false,
  });

  // Published Academy Courses state loaded from /api/learning/courses
  const [academyCourses, setAcademyCourses] = useState<AcademyClientCourse[]>(INITIAL_PUBLISHED_COURSES);

  useEffect(() => {
    const fetchPublishedCourses = async () => {
      try {
        const res = await fetch('/api/learning/courses');
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            setAcademyCourses(json.data);
          }
        }
      } catch {
        // preserve pre-seeded fallback
      }
    };

    fetchPublishedCourses();

    if (typeof window !== 'undefined') {
      window.addEventListener('intelligentqa_curriculum_updated', fetchPublishedCourses);
      return () => {
        window.removeEventListener('intelligentqa_curriculum_updated', fetchPublishedCourses);
      };
    }
  }, []);

  // QA AI Agents Sub-Menu collapsible state (open by default for easy access)
  const [qaAgentsOpen, setQaAgentsOpen] = useState(true);
  const [activeAgentTab, setActiveAgentTab] = useState<string>('requirements');

  // Modals
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);

  // Active Portal Mode: 'sdet' | 'kids' (Strict separation between Kids Free Coding & SDET Pro)
  
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [curriculumTracks, setCurriculumTracks] = useState<Track[]>(() => {
    if (typeof window !== 'undefined') {
      return QADatabase.getTracks();
    }
    return QA_TRACKS;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const syncAdminRole = () => {
        const u = QADatabase.getCurrentUser();
        setCurrentUser(u);
        setIsAdmin(QADatabase.isAdmin(u));
        setCurriculumTracks(QADatabase.getTracks());
      };
      syncAdminRole();
      window.addEventListener('intelligentqa_role_changed', syncAdminRole);
      window.addEventListener('intelligentqa_auth_changed', syncAdminRole);
      window.addEventListener('intelligentqa_curriculum_updated', syncAdminRole);

      return () => {
        window.removeEventListener('intelligentqa_role_changed', syncAdminRole);
        window.removeEventListener('intelligentqa_auth_changed', syncAdminRole);
        window.removeEventListener('intelligentqa_curriculum_updated', syncAdminRole);
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

      const syncProgress = async () => {
        const u = QADatabase.getCurrentUser();
        if (u) {
          const prog = await QADatabase.getProgress(u.id);
          const completed = new Set(prog.filter(p => p.status === 'completed').map(p => p.lessonId));
          try {
            const academyRes = await fetch(`/api/learning/progress?userId=${encodeURIComponent(u.id)}`);
            if (academyRes.ok) {
              const academyJson = await academyRes.json();
              if (academyJson.success && Array.isArray(academyJson.data)) {
                academyJson.data
                  .filter((p: any) => p.completionStatus === 'completed')
                  .forEach((p: any) => {
                    completed.add(p.lessonId);
                  });
              }
            }
          } catch {
            // non-blocking
          }
          setCompletedLessonIds(completed);
        }
      };
      syncProgress();

      const handleAuth = () => {
        const u = QADatabase.getCurrentUser();
        setCurrentUser(u);
        setGeminiKey(QADatabase.getUserGeminiKey(u?.id));
        setAiPref(QADatabase.getAiPreference(u?.id));
        syncProgress();
      };

      window.addEventListener('intelligentqa_auth_changed', handleAuth);
      window.addEventListener('intelligentqa_key_changed', handleAuth);
      window.addEventListener('intelligentqa_ai_pref_changed', handleAuth);
      window.addEventListener('intelligentqa_progress_updated', syncProgress);

      return () => {
        window.removeEventListener('intelligentqa_auth_changed', handleAuth);
        window.removeEventListener('intelligentqa_key_changed', handleAuth);
        window.removeEventListener('intelligentqa_ai_pref_changed', handleAuth);
        window.removeEventListener('intelligentqa_progress_updated', syncProgress);
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
    pathname?.startsWith('/learning') ||
    pathname?.startsWith('/tracks') ||
    pathname?.startsWith('/guides');

  const isPracticeActive = pathname?.startsWith('/sandbox') || pathname === '/prompt-lab';
  const isAiToolsActive = pathname?.includes('/qa-agents') || pathname?.includes('/interview-griller');
  const isInterviewActive = pathname?.includes('/interview-questions');

  // Progression sequence for Manual QA Transition:
  // Stage 1: 'selenium-java' -> Stage 2: 'playwright-ts' -> Stage 3: 'api-testing' -> Stage 4: 'ai-qa'
  // Legacy track compatibility routes: /tracks/selenium-java | /tracks/playwright-ts | /tracks/api-testing | /tracks/ai-qa
  // Static track placeholder: { id: 'ai-qa', displayTitle: 'AI Academy', lessons: [] }

  // Map courses to sidebar courseTracks
  const courseTracks = useMemo(() => {
    // 1. Filter out test fidelity and unwanted test courses
    const validCourses = academyCourses.filter((c) => {
      const title = (c.title || '').toLowerCase();
      const id = (c.id || '').toLowerCase();
      const slug = (c.slug || '').toLowerCase();
      if (title.includes('test automated backend') || id.includes('test-backend-course') || slug.includes('test-backend-course')) return false;
      if (title.includes('fidelity assessment') || id.includes('fidelity-course') || slug.includes('fidelity-course')) return false;
      return true;
    });

    const extractLessons = (course: any) => {
      const modules = (course?.modules || []).map((m: any) => ({
        id: m.id || m.slug,
        slug: m.slug || m.id,
        title: m.title,
        description: m.description,
        lessons: (m.lessons || []).map((l: any) => ({
          id: l.id || l.slug,
          slug: l.slug || l.id,
          title: l.title,
          summary: l.summary || l.shortDescription || '',
          estimatedReadingTime: l.estimatedReadingTime || 5,
          durationMinutes: (l.estimatedReadingTime || 5) * 2,
        })),
      }));
      return modules.flatMap((m: any) => m.lessons);
    };

    // 2. Identify grouped courses
    // API Testing & Automation: FullStack API & Contracts + Rest Assured
    const fullStackCourse = validCourses.find(c =>
      (c.id || '').includes('api-testing') || (c.slug || '').includes('api-testing') || (c.title || '').toLowerCase().includes('full-stack api')
    );
    const restAssuredCourse = validCourses.find(c =>
      (c.id || '').includes('rest-assured') || (c.slug || '').includes('rest-assured') || (c.title || '').toLowerCase().includes('rest assured')
    );

    // Mobile Testing & Automation: Mobile Testing + Appium
    const mobileTestingCourse = validCourses.find(c =>
      (c.id || '') === 'course-mobile-testing' ||
      (c.slug || '').includes('mobile-testing') ||
      ((c.title || '').toLowerCase().includes('mobile testing') && !(c.title || '').toLowerCase().includes('appium'))
    );
    const appiumCourse = validCourses.find(c =>
      (c.id || '') === 'course-appium' ||
      (c.slug || '').includes('appium') ||
      (c.title || '').toLowerCase().includes('appium')
    );

    // CI/CD Concepts: Git + GitHub Actions + Azure DevOps + Jenkins
    const gitCourse = validCourses.find(c =>
      (c.id || '') === 'course-git' || (c.slug || '').includes('git-for-qa') || ((c.title || '').toLowerCase().includes('git') && !(c.title || '').toLowerCase().includes('github'))
    );
    const githubCourse = validCourses.find(c =>
      (c.id || '').includes('github-actions') || (c.slug || '').includes('github-actions') || (c.title || '').toLowerCase().includes('github actions')
    );
    const azureCourse = validCourses.find(c =>
      (c.id || '').includes('azure-devops') || (c.slug || '').includes('azure-devops') || (c.title || '').toLowerCase().includes('azure devops')
    );
    const jenkinsCourse = validCourses.find(c =>
      (c.id || '').includes('jenkins') || (c.slug || '').includes('jenkins') || (c.title || '').toLowerCase().includes('jenkins')
    );

    const groupedIds = new Set<string>();
    if (fullStackCourse) groupedIds.add(fullStackCourse.id);
    if (restAssuredCourse) groupedIds.add(restAssuredCourse.id);
    if (mobileTestingCourse) groupedIds.add(mobileTestingCourse.id);
    if (appiumCourse) groupedIds.add(appiumCourse.id);
    if (gitCourse) groupedIds.add(gitCourse.id);
    if (githubCourse) groupedIds.add(githubCourse.id);
    if (azureCourse) groupedIds.add(azureCourse.id);
    if (jenkinsCourse) groupedIds.add(jenkinsCourse.id);

    // Build the standalone courses list
    const tracks: any[] = [];

    // Helper to build a regular track
    const buildTrack = (c: any) => {
      const meta = getCourseMeta(c);
      const modules = (c.modules || []).map((m: any) => ({
        id: m.id || m.slug,
        slug: m.slug || m.id,
        title: m.title,
        description: m.description,
        lessons: (m.lessons || []).map((l: any) => ({
          id: l.id || l.slug,
          slug: l.slug || l.id,
          title: l.title,
          summary: l.summary || l.shortDescription || '',
          estimatedReadingTime: l.estimatedReadingTime || 5,
          durationMinutes: (l.estimatedReadingTime || 5) * 2,
        })),
      }));

      const allLessons = modules.flatMap((m: any) => m.lessons);

      return {
        id: c.slug || c.id,
        rawId: c.id,
        slug: c.slug,
        displayTitle: meta.displayTitle,
        fullTitle: c.title,
        tag: meta.tag,
        stage: meta.tag,
        totalHours: meta.hours,
        icon: meta.icon,
        iconColor: meta.iconColor,
        badgeClass: meta.badgeClass,
        modules,
        lessons: allLessons,
      };
    };

    // AI, Selenium, Playwright come first if present
    const aiCourse = validCourses.find(c => (c.slug || '').includes('ai') || (c.title || '').toLowerCase().includes('ai academy'));
    if (aiCourse) tracks.push(buildTrack(aiCourse));

    const seleniumCourse = validCourses.find(c => (c.slug || '').includes('selenium') || (c.title || '').toLowerCase().includes('selenium'));
    if (seleniumCourse) tracks.push(buildTrack(seleniumCourse));

    const playwrightCourse = validCourses.find(c => (c.slug || '').includes('playwright') || (c.title || '').toLowerCase().includes('playwright'));
    if (playwrightCourse) tracks.push(buildTrack(playwrightCourse));

    // 3. API Testing & Automation (Child items: FullStack API & Contracts, Rest Assured)
    const apiModules: any[] = [];
    let apiLessons: any[] = [];

    if (fullStackCourse) {
      const fullStackLessons = extractLessons(fullStackCourse);
      apiLessons = apiLessons.concat(fullStackLessons);
      apiModules.push({
        id: 'fullstack-api-contracts',
        slug: fullStackCourse.slug || 'api-testing-and-contracts',
        title: 'FullStack API & Contracts',
        description: fullStackCourse.description || 'Full-Stack API Testing & Consumer-Driven Contracts',
        lessons: fullStackLessons,
      });
    }

    if (restAssuredCourse) {
      const restAssuredLessons = extractLessons(restAssuredCourse);
      apiLessons = apiLessons.concat(restAssuredLessons);
      apiModules.push({
        id: 'rest-assured',
        slug: restAssuredCourse.slug || 'rest-assured-api-automation',
        title: 'Rest Assured',
        description: restAssuredCourse.description || 'REST Assured: Enterprise API Automation with Java',
        lessons: restAssuredLessons,
      });
    }

    if (apiModules.length > 0) {
      tracks.push({
        id: 'api-testing-automation',
        rawId: 'course-api-testing-automation',
        slug: fullStackCourse?.slug || 'api-testing-and-contracts',
        displayTitle: 'API Testing & Automation',
        fullTitle: 'API Testing & Automation',
        tag: 'API',
        stage: 'API',
        totalHours: '38h',
        icon: Server,
        iconColor: 'text-purple-500',
        badgeClass: 'text-purple-600 dark:text-purple-400 bg-purple-500/10',
        modules: apiModules,
        lessons: apiLessons,
      });
    }

    // 4. Mobile Testing & Automation (Child items: Mobile Testing, Appium)
    const mobileModules: any[] = [];
    let mobileLessons: any[] = [];

    // Child item 1: Mobile Testing
    const mobileTestingLessonsList = mobileTestingCourse ? extractLessons(mobileTestingCourse) : [
      {
        id: 'les-mobile-testing-foundations',
        slug: 'mobile-testing-fundamentals',
        title: '1.1 Mobile Testing Fundamentals: Native, Hybrid & Mobile Web Apps',
        summary: 'Architectural differences between Native (Kotlin/Swift), Hybrid (Flutter/React Native), and Web apps.',
        estimatedReadingTime: 5,
        durationMinutes: 10,
      },
      {
        id: 'les-mobile-device-matrix',
        slug: 'device-matrix-emulators-simulators',
        title: '1.2 Device Matrix, Emulators, Simulators & Cloud Device Farms',
        summary: 'Real devices vs Android Emulators vs iOS Simulators, screen fragmentation, and cloud execution farms.',
        estimatedReadingTime: 6,
        durationMinutes: 12,
      },
      {
        id: 'les-mobile-gestures-ux',
        slug: 'mobile-touch-actions-gestures-testing',
        title: '1.3 Mobile Touch Actions, Gestures & Interruption Testing',
        summary: 'Verifying taps, multi-touch pinch/zoom, swipes, incoming calls, network switches, and battery throttling.',
        estimatedReadingTime: 5,
        durationMinutes: 10,
      },
      {
        id: 'les-mobile-debugging-logs',
        slug: 'mobile-logs-adb-instruments-debugging',
        title: '1.4 Mobile Performance, Memory Leaks, ADB & Xcode Instruments',
        summary: 'Extracting ADB logcat, iOS crash logs, memory footprints, network profiling, and battery consumption.',
        estimatedReadingTime: 6,
        durationMinutes: 12,
      },
    ];
    mobileLessons = mobileLessons.concat(mobileTestingLessonsList);
    mobileModules.push({
      id: 'mobile-testing',
      slug: mobileTestingCourse?.slug || 'mobile-testing-fundamentals',
      title: 'Mobile Testing',
      description: mobileTestingCourse?.description || 'Mobile Testing Fundamentals, Native/Hybrid/Web, ADB & Device Matrices',
      lessons: mobileTestingLessonsList,
    });

    // Child item 2: Appium
    const appiumLessonsList = appiumCourse ? extractLessons(appiumCourse) : [
      {
        id: 'les-appium-2-modular-ecosystem',
        slug: 'appium-2-modular-ecosystem',
        title: '1.1 Appium 2.0 Modular Drivers & Plugins',
        summary: 'Understand independent driver lifecycle, CLI management, and plugin architecture.',
        estimatedReadingTime: 5,
        durationMinutes: 10,
      },
      {
        id: 'les-android-ios-driver-capabilities',
        slug: 'android-ios-driver-capabilities',
        title: '1.2 UiAutomator2 & XCUITest Capabilities Matrix',
        summary: 'Configure W3C capabilities, automationName, bundleId, and appPackage across platforms.',
        estimatedReadingTime: 6,
        durationMinutes: 12,
      },
      {
        id: 'les-w3c-mobile-actions-gestures',
        slug: 'w3c-mobile-actions-gestures',
        title: '2.1 W3C Pointer Actions & Smooth Scrolling',
        summary: 'Implement fluent W3C Actions API for scrolls, drags, and multi-finger gestures.',
        estimatedReadingTime: 5,
        durationMinutes: 10,
      },
      {
        id: 'les-mobile-page-object-model',
        slug: 'mobile-page-object-model',
        title: '2.2 Mobile Page Object Model & Cloud Execution',
        summary: 'Scalable Page Object Model architecture with AppiumFieldDecorator and cloud test grids.',
        estimatedReadingTime: 6,
        durationMinutes: 12,
      },
    ];
    mobileLessons = mobileLessons.concat(appiumLessonsList);
    mobileModules.push({
      id: 'appium',
      slug: appiumCourse?.slug || 'appium-mobile-automation',
      title: 'Appium',
      description: appiumCourse?.description || 'Appium 2.0 Mobile Automation Masterclass',
      lessons: appiumLessonsList,
    });

    if (mobileModules.length > 0) {
      tracks.push({
        id: 'mobile-testing-automation',
        rawId: 'course-mobile-testing-automation',
        slug: mobileTestingCourse?.slug || appiumCourse?.slug || 'mobile-testing-and-automation',
        displayTitle: 'Mobile Testing & Automation',
        fullTitle: 'Mobile Testing & Automation',
        tag: 'Mobile',
        stage: 'Mobile',
        totalHours: '26h',
        icon: Smartphone,
        iconColor: 'text-pink-500',
        badgeClass: 'text-pink-600 dark:text-pink-400 bg-pink-500/10',
        modules: mobileModules,
        lessons: mobileLessons,
      });
    }

    // 5. CI/CD Concepts (Child items: Git, Github Actions, Azure DevOps, Jenkins)
    const cicdModules: any[] = [];
    let cicdLessons: any[] = [];

    // Git
    const gitLessonsList = gitCourse ? extractLessons(gitCourse) : [
      {
        id: 'les-git-foundations',
        slug: 'git-foundations-for-qa',
        title: '1.1 Git Essentials: Commits, Remotes & .gitignore for Test Frameworks',
        summary: 'Initialize local repositories, stage test scripts, configure .gitignore, and sync with remote origins.',
        estimatedReadingTime: 4,
        durationMinutes: 8,
      },
      {
        id: 'les-git-branching-pr',
        slug: 'git-branching-and-pr-gates',
        title: '1.2 Branching Strategies, Rebase & Pull Request Reviews',
        summary: 'Feature branches, interactive rebasing, squash merging, and PR quality check criteria.',
        estimatedReadingTime: 5,
        durationMinutes: 10,
      },
    ];
    cicdLessons = cicdLessons.concat(gitLessonsList);
    cicdModules.push({
      id: 'git',
      slug: 'git-for-qa-engineers',
      title: 'Git',
      description: 'Git Version Control, Commits, Branching & PR Gates',
      lessons: gitLessonsList,
    });

    // GitHub Actions
    if (githubCourse) {
      const ghaLessons = extractLessons(githubCourse);
      cicdLessons = cicdLessons.concat(ghaLessons);
      cicdModules.push({
        id: 'github-actions',
        slug: githubCourse.slug || 'github-actions-for-qa',
        title: 'Github Actions',
        description: githubCourse.description || 'GitHub Actions CI/CD Pipelines for QA Automation',
        lessons: ghaLessons,
      });
    }

    // Azure DevOps
    if (azureCourse) {
      const adoLessons = extractLessons(azureCourse);
      cicdLessons = cicdLessons.concat(adoLessons);
      cicdModules.push({
        id: 'azure-devops',
        slug: azureCourse.slug || 'azure-devops-test-pipelines',
        title: 'Azure DevOps',
        description: azureCourse.description || 'Azure DevOps Pipelines for SDETs',
        lessons: adoLessons,
      });
    }

    // Jenkins
    if (jenkinsCourse) {
      const jenLessons = extractLessons(jenkinsCourse);
      cicdLessons = cicdLessons.concat(jenLessons);
      cicdModules.push({
        id: 'jenkins',
        slug: jenkinsCourse.slug || 'declarative-jenkins-pipelines',
        title: 'Jenkins',
        description: jenkinsCourse.description || 'Declarative Jenkins Pipelines for QA Automation',
        lessons: jenLessons,
      });
    }

    if (cicdModules.length > 0) {
      tracks.push({
        id: 'cicd-concepts',
        rawId: 'course-cicd-concepts',
        slug: githubCourse?.slug || 'github-actions-for-qa',
        displayTitle: 'CI/CD Concepts',
        fullTitle: 'CI/CD Concepts',
        tag: 'CI/CD',
        stage: 'CI/CD',
        totalHours: '46h',
        icon: GitBranch,
        iconColor: 'text-orange-500',
        badgeClass: 'text-orange-600 dark:text-orange-400 bg-orange-500/10',
        modules: cicdModules,
        lessons: cicdLessons,
      });
    }

    // Remaining non-grouped courses
    const alreadyHandled = new Set([
      aiCourse?.id,
      seleniumCourse?.id,
      playwrightCourse?.id,
      mobileTestingCourse?.id,
      appiumCourse?.id,
      ...groupedIds,
    ]);

    validCourses.forEach((c) => {
      if (!alreadyHandled.has(c.id)) {
        tracks.push(buildTrack(c));
      }
    });

    return tracks;
  }, [academyCourses]);

  const toggleTrack = (trackId: string) => {
    const isNowOpen = !openTracks[trackId];
    setOpenTracks(prev => ({
      ...prev,
      [trackId]: isNowOpen,
    }));

    // When opening a course section, focus the first child lesson & navigate to it
    if (isNowOpen) {
      const track = courseTracks.find(t => t.id === trackId || t.slug === trackId || t.rawId === trackId);
      const firstMod = track?.modules?.[0];
      const firstLesson = firstMod?.lessons?.[0];
      if (firstMod) {
        const modId = `${trackId}-${firstMod.id || firstMod.slug || 0}`;
        setOpenModules(p => ({ ...p, [modId]: true }));
      }
      if (firstLesson) {
        const targetSlug = firstLesson.slug || firstLesson.id;
        router.push(`/learning/${targetSlug}`);
      }
    }
  };

  // Keep active track expanded once when navigating into it, without re-opening on manual collapse
  useEffect(() => {
    if (!pathname) return;
    const currentSlug = pathname.startsWith('/learning/') ? pathname.replace('/learning/', '').split('/')[0] : '';
    const matched = courseTracks.find(t =>
      t.id === currentSlug ||
      t.slug === currentSlug ||
      t.lessons.some((l: any) => (l.slug || l.id) === currentSlug)
    );
    if (matched && lastAutoOpenedTrackRef.current !== matched.id) {
      lastAutoOpenedTrackRef.current = matched.id;
      setOpenTracks(p => ({ ...p, [matched.id]: true }));
      setCoursesOpen(true);
    }
  }, [pathname, courseTracks]);

  // Automatically expand all courses when user types in the search box
  useEffect(() => {
    if (searchQuery.trim()) {
      setCoursesOpen(true);
      const allOpen: Record<string, boolean> = {};
      courseTracks.forEach(t => {
        allOpen[t.id] = true;
      });
      setOpenTracks(allOpen);
    }
  }, [searchQuery, courseTracks]);

  // Auto-expand module if active lesson is inside it
  useEffect(() => {
    if (!pathname) return;
    for (const track of courseTracks) {
      for (const mod of track.modules) {
        const hasLesson = (mod.lessons || []).some((l: any) =>
          pathname === `/learning/${l.slug || l.id}` ||
          (pathname === '/learning' && (l.slug === 'what-is-artificial-intelligence' || l.id === 'what-is-artificial-intelligence'))
        );
        if (hasLesson) {
          const modId = `${track.id}-${mod.id}`;
          setOpenModules((prev) => ({ ...prev, [modId]: true }));
        }
      }
    }
  }, [pathname, courseTracks]);

  // Real-time filter across all courses and lessons from the top search box
  const filteredCourseTracks = courseTracks
    .map((track) => {
      if (!searchQuery.trim()) {
        return {
          ...track,
          hasMatch: true,
          modules: track.modules.map((m: any) => ({
            ...m,
            lessons: m.lessons || [],
          })),
        };
      }
      const q = searchQuery.toLowerCase();
      const trackMatches = track.displayTitle.toLowerCase().includes(q);
      const matchingModules = track.modules
        .map((mod: any) => {
          const modMatches = mod.title.toLowerCase().includes(q);
          const matchingLessons = (mod.lessons || []).filter((l: Lesson) => l.title.toLowerCase().includes(q));
          return {
            ...mod,
            lessons: modMatches ? mod.lessons : matchingLessons,
            hasMatch: modMatches || matchingLessons.length > 0,
          };
        })
        .filter((mod: any) => trackMatches || mod.hasMatch);

      const allMatchingLessons = matchingModules.flatMap((m: any) => m.lessons);

      return {
        ...track,
        modules: trackMatches ? track.modules : matchingModules,
        lessons: trackMatches ? track.lessons : allMatchingLessons,
        hasMatch: trackMatches || matchingModules.length > 0,
      };
    })
    .filter((track) => track.hasMatch);

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

      {/* SEARCH BOX ON TOP OF LEFT NAVIGATION PANEL */}
      <div className="px-3 py-2.5 border-b border-[#262626] shrink-0 bg-[#141414]">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#A1A1AA] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search courses & lessons..."
            className="w-full pl-8 pr-7 py-1.5 text-xs rounded-lg bg-[#1E1E1E] border border-[#262626] text-white placeholder:text-[#71717A] focus:outline-none focus:border-emerald-500 transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-[#71717A] hover:text-white"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
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
            </div>

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
                  {filteredCourseTracks.length} Courses
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
                {filteredCourseTracks.length === 0 && searchQuery && (
                  <div className="px-2 py-3 text-xs text-neutral-400 text-center">
                    No matching courses or lessons
                  </div>
                )}
                {filteredCourseTracks.map((track, trackIdx) => {
                  const isExpanded = openTracks[track.id];
                  const guideSlug = track.id === 'selenium-webdriver-enterprise' || track.slug.includes('selenium') ? 'selenium' : track.slug.includes('playwright') ? 'playwright' : track.slug;
                  const isTrackActive =
                    pathname?.includes(track.slug) ||
                    track.lessons.some((l: any) => pathname === `/learning/${l.slug || l.id}`);
                  const Icon = track.icon;

                  return (
                    <div key={track.id} className="space-y-0.5">
                      {/* Track Parent Row (Focuses first child lesson and shows content on right panel) */}
                      <div
                        onClick={() => toggleTrack(track.id)}
                        className={`flex items-center justify-between px-2 py-1.5 rounded-lg text-xs font-medium transition-all group cursor-pointer ${
                          isTrackActive
                            ? 'bg-slate-100/90 dark:bg-neutral-800/80 font-semibold text-emerald-600 dark:text-emerald-400'
                            : 'hover:bg-slate-100/60 dark:hover:bg-neutral-800/40 text-slate-800 dark:text-neutral-200'
                        }`}
                        title={`${track.displayTitle}: Open first child lesson`}
                      >
                        <Link
                          href={`/guides/${guideSlug}`}
                          data-learning-href={`/learning/${track.lessons[0]?.slug || track.slug}`}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleTrack(track.id);
                            onCloseMobile?.();
                          }}
                          className="flex items-center gap-2 truncate flex-1 min-w-0"
                          title={`${track.displayTitle}${track.lessons.length > 0 ? ` (${track.lessons.length} Lessons)` : ''}`}
                        >
                          <Icon className={`w-3.5 h-3.5 ${track.iconColor} shrink-0`} />
                          <span className="truncate font-semibold">
                            {track.displayTitle}
                          </span>
                        </Link>

                        {track.lessons.length > 0 && (
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleTrack(track.id);
                            }}
                            className="flex items-center gap-1 text-[9px] font-mono font-bold text-slate-500 dark:text-neutral-400 group-hover:text-slate-900 dark:hover:text-white px-1.5 py-0.5 rounded bg-slate-100 dark:bg-neutral-800/80 transition-colors ml-1 shrink-0 cursor-pointer"
                            title={isExpanded ? `Collapse ${track.displayTitle} lessons` : `Expand ${track.displayTitle} lessons`}
                          >
                            <span>{track.lessons.length} Lessons</span>
                            <ChevronDown
                              className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${
                                isExpanded ? 'rotate-180' : ''
                              }`}
                            />
                          </div>
                        )}
                      </div>

                      {/* All Individual Lessons with total hours of each individual lesson */}
                      {isExpanded && track.lessons.length > 0 && (
                        <div className="pl-2 pr-0.5 py-0.5 space-y-1 border-l border-slate-200/80 dark:border-neutral-800/80 ml-3.5 my-0.5">
                          {(() => {
                            const trackModules =
                              track.modules && track.modules.length > 0
                                ? track.modules
                                : [{ id: 'core', title: 'Lessons', lessons: track.lessons }];

                            return trackModules.map((mod: any, modIdx: number) => {
                              const modId = `${track.id}-${mod.id || modIdx}`;
                              const isModOpen = isModuleOpen(modId);
                              const displayedLessons = isAdmin
                                ? mod.lessons || []
                                : (mod.lessons || []).filter((l: any) => !l.disabled);

                              if (displayedLessons.length === 0) return null;

                              return (
                                <div key={mod.id || modIdx} className="space-y-0.5">
                                  {/* Collapsible Module / Group Header */}
                                  <button
                                    type="button"
                                    onClick={() => toggleModule(modId)}
                                    className="w-full flex items-center justify-between px-2 py-1.5 rounded-md text-[10px] font-semibold text-slate-400 hover:text-white hover:bg-neutral-800/60 transition-colors group cursor-pointer text-left"
                                    title={isModOpen ? `Collapse ${mod.title}` : `Expand ${mod.title}`}
                                  >
                                    <div className="flex items-center gap-1.5 truncate flex-1 min-w-0 pr-1">
                                      {(() => {
                                        const ModIcon = getSidebarModuleIcon(mod.title, track.id);
                                        return <ModIcon className="w-3 h-3 text-slate-400 group-hover:text-slate-200 shrink-0" />;
                                      })()}
                                      <span className="truncate uppercase tracking-wider font-mono text-[9px] text-slate-300 group-hover:text-white">
                                        {mod.title}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0 text-slate-400">
                                      <span className="text-[9px] font-mono text-neutral-500">
                                        {displayedLessons.length}
                                      </span>
                                      <ChevronDown
                                        className={`w-3 h-3 text-neutral-400 transition-transform duration-200 ${
                                          isModOpen ? 'rotate-180' : ''
                                        }`}
                                      />
                                    </div>
                                  </button>

                                  {/* Collapsible Module Lessons */}
                                  {isModOpen && (
                                    <div className="pl-2 space-y-0.5 border-l border-slate-700/40 ml-2.5 my-0.5">
                                      {displayedLessons.map((lesson: any, lessonIdx: number) => {
                                        const lessonSlug = lesson.slug || lesson.id;
                                        const isLessonActive =
                                          pathname === `/learning/${lessonSlug}` ||
                                          (pathname === '/learning' && (lessonSlug === 'what-is-artificial-intelligence' || lessonSlug === 'what-is-an-llm'));

                                        const lessonHref = `/learning/${lessonSlug}`;

                                        const hours = getLessonHours(lesson.durationMinutes);
                                        const isFirst = lessonIdx === 0;
                                        const isLast = lessonIdx === displayedLessons.length - 1;

                                        return (
                                          <div
                                            key={lesson.id}
                                            className={`group flex items-center justify-between px-2 py-1 rounded-md text-[11px] font-medium transition-all ${
                                              lesson.disabled ? 'opacity-65 bg-amber-500/5' : ''
                                            } ${
                                              isLessonActive
                                                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-semibold shadow-xs'
                                                : 'text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-neutral-800/30'
                                            }`}
                                          >
                                            <Link
                                              href={lessonHref}
                                              onClick={onCloseMobile}
                                              className="flex items-center gap-1.5 truncate flex-1 min-w-0 pr-1"
                                              title={lesson.title}
                                            >
                                              {completedLessonIds.has(lesson.id) && (
                                                <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                                              )}
                                              <span className="truncate">{lesson.title}</span>
                                              {lesson.disabled && (
                                                <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0 font-bold">
                                                  Disabled
                                                </span>
                                              )}
                                            </Link>

                                            {/* Admin Controls: Reorder (Up/Down), Disable/Enable, Delete */}
                                            {isAdmin && curriculumTracks.some(t => t.id === track.id) && (
                                              <div className="opacity-0 group-hover:opacity-100 focus-within:opacity-100 flex items-center gap-0.5 shrink-0 transition-opacity bg-neutral-900/95 dark:bg-black/95 p-0.5 rounded border border-neutral-700/60 shadow-xs">
                                                <button
                                                  type="button"
                                                  disabled={isFirst}
                                                  onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    QADatabase.moveLesson(track.id, lesson.id, 'up');
                                                  }}
                                                  className="p-0.5 rounded hover:bg-neutral-700 text-neutral-300 hover:text-white disabled:opacity-20 cursor-pointer"
                                                  title="Move Up in sequence"
                                                >
                                                  <ArrowUp className="w-2.5 h-2.5" />
                                                </button>
                                                <button
                                                  type="button"
                                                  disabled={isLast}
                                                  onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    QADatabase.moveLesson(track.id, lesson.id, 'down');
                                                  }}
                                                  className="p-0.5 rounded hover:bg-neutral-700 text-neutral-300 hover:text-white disabled:opacity-20 cursor-pointer"
                                                  title="Move Down in sequence"
                                                >
                                                  <ArrowDown className="w-2.5 h-2.5" />
                                                </button>
                                                <button
                                                  type="button"
                                                  onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    QADatabase.toggleLessonDisabled(track.id, lesson.id);
                                                  }}
                                                  className={`p-0.5 rounded hover:bg-neutral-700 transition cursor-pointer ${
                                                    lesson.disabled ? 'text-amber-400' : 'text-neutral-400 hover:text-emerald-400'
                                                  }`}
                                                  title={
                                                    lesson.disabled
                                                      ? "Enable lesson (visible to learners)"
                                                      : "Disable lesson (hide while updating content)"
                                                  }
                                                >
                                                  {lesson.disabled ? (
                                                    <EyeOff className="w-2.5 h-2.5" />
                                                  ) : (
                                                    <Eye className="w-2.5 h-2.5" />
                                                  )}
                                                </button>
                                                <button
                                                  type="button"
                                                  onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    if (
                                                      window.confirm(
                                                        `Are you sure you want to permanently delete "${lesson.title}"?`
                                                      )
                                                    ) {
                                                      QADatabase.deleteLesson(track.id, lesson.id);
                                                    }
                                                  }}
                                                  className="p-0.5 rounded hover:bg-rose-950/80 text-neutral-400 hover:text-rose-400 transition cursor-pointer"
                                                  title="Delete lesson permanently"
                                                >
                                                  <Trash2 className="w-2.5 h-2.5" />
                                                </button>
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              );
                            });
                          })()}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
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
                4 Labs
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

              {/* API Testing Lab */}
              <Link
                href="/sandbox/api"
                onClick={onCloseMobile}
                className={childItemClass(pathname === '/sandbox/api')}
                title="API Testing Lab: Mock REST API Server & Requests"
              >
                <div className="flex items-center gap-2 truncate">
                  <Server className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                  <div className="flex flex-col truncate">
                    <span className="truncate font-semibold text-slate-800 dark:text-neutral-200">API Testing Lab</span>
                    <span className="text-[10px] text-slate-500 dark:text-neutral-400">REST Mock Server &amp; Auth</span>
                  </div>
                </div>
              </Link>

              {/* AI Prompt Lab for QA */}
              <Link
                href="/prompt-lab"
                onClick={onCloseMobile}
                className={childItemClass(pathname === '/prompt-lab')}
                title="AI Prompt Lab for QA: Curated Testing & SDET Prompts"
              >
                <div className="flex items-center gap-2 truncate">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                  <div className="flex flex-col truncate">
                    <span className="truncate font-semibold text-slate-800 dark:text-neutral-200">AI Prompt Lab for QA</span>
                    <span className="text-[10px] text-slate-500 dark:text-neutral-400">Curated QA Prompts</span>
                  </div>
                </div>
              </Link>
            </div>
          )}
        </div>

        {/* SECTION: INTERVIEW QUESTIONS BANK (Direct Single Click to View All Questions on Right) */}
        <div className="space-y-1 pt-1">
          <Link
            href="/interview-questions"
            onClick={onCloseMobile}
            className={`w-full ${navItemClass(pathname === '/interview-questions')} justify-between`}
            title="800+ Curated SDET & Automation Interview Question Bank"
          >
            <div className="flex items-center gap-3">
              <HelpCircle className="w-4 h-4 shrink-0 text-sky-500" />
              <span>Interview Questions Bank</span>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400 font-bold">
              800+ Qs
            </span>
          </Link>
        </div>

        {/* SECTION: AI QA AGENTS (Consolidated Suite including AI Mock Interviewer) */}
        <div className="space-y-1 pt-1">
          <button
            type="button"
            onClick={() => setAiToolsSectionOpen(!aiToolsSectionOpen)}
            className={`w-full ${navItemClass(isAiToolsActive)} justify-between`}
          >
            <div className="flex items-center gap-3">
              <Bot className="w-4 h-4 shrink-0 text-indigo-500" />
              <span>AI QA Agents</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-500 font-bold">
                6 Agents
              </span>
              {aiToolsSectionOpen ? (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 transition-transform" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 transition-transform" />
              )}
            </div>
          </button>

          {aiToolsSectionOpen && (
            <div className="pl-2 pr-1 py-1 space-y-1 border-l-2 border-slate-200 dark:border-neutral-800 ml-4 my-1">
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
                  <span className="truncate">Automation Code Generator</span>
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
                  <span className="truncate">Code Reviewer</span>
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

              {/* 6. AI Mock Interviewer */}
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
                title="AI Mock Interviewer: Live Technical Mock Interviews"
              >
                <div className="flex items-center gap-2 truncate">
                  <Award className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span className="truncate">AI Mock Interviewer</span>
                </div>
                <span className="text-[9px] font-mono font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded shrink-0">
                  MOCK
                </span>
              </Link>

              {/* 7. Project Files/Folder */}
              <Link
                href="/project-files"
                onClick={onCloseMobile}
                className={childItemClass(pathname === '/project-files')}
                title="Project Files & Folders: Keep and manage project documents (PDF, MD, Excel, PPT) for AI QA Agents context"
              >
                <div className="flex items-center gap-2 truncate">
                  <FolderKanban className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span className="truncate">Project Files</span>
                </div>
                <span className="text-[9px] font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded shrink-0">
                  DOCS
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
