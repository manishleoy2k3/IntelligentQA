'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  Award,
  Sparkles,
  Send,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  Lock,
  ShieldCheck,
  ArrowRight,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  MessageSquare,
  Radio,
  Sliders,
  Code2,
  Check,
  FileCheck,
  XCircle,
  Copy,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Edit3,
  Compass,
  ArrowUpRight,
  Maximize2,
  X,
  Target,
  ArrowLeft,
  Settings,
} from 'lucide-react';
import { QADatabase, DEMO_USER } from '@/lib/qa-db';
import { fetchQuestionsByLevelAndDifficulty } from '@/lib/supabase/interview-questions';
import GeminiKeyModal from '@/components/auth/gemini-key-modal';

export interface SkillOption {
  id: string;
  name: string;
  category:
    'Automation Frameworks' | 'Programming Languages' | 'API & Backend' | 'QA Strategy & Ops';
  desc: string;
}

export const AVAILABLE_SKILLS: SkillOption[] = [
  // Automation Frameworks
  {
    id: 'Playwright',
    name: 'Playwright',
    category: 'Automation Frameworks',
    desc: 'Auto-waiting, network mocking via page.route(), storageState auth, web-first assertions',
  },
  {
    id: 'Selenium',
    name: 'Selenium WebDriver',
    category: 'Automation Frameworks',
    desc: 'Selenium 4 Grid, WebDriver waits, Page Object Models, BiDi CDP network logging',
  },
  {
    id: 'REST Assured',
    name: 'REST Assured',
    category: 'API & Backend',
    desc: 'Java BDD Given-When-Then, RequestSpecBuilder, JSON schema validation, POJO mapping',
  },
  {
    id: 'Appium',
    name: 'Appium (Mobile)',
    category: 'Automation Frameworks',
    desc: 'iOS & Android native and hybrid automation, WEBVIEW context, W3C touch actions',
  },
  {
    id: 'Cypress',
    name: 'Cypress',
    category: 'Automation Frameworks',
    desc: 'Fast front-end runner, cy.intercept route stubbing, asynchronous command queue',
  },

  // Programming Languages
  {
    id: 'Java',
    name: 'Java',
    category: 'Programming Languages',
    desc: 'Project Loom virtual threads, ThreadLocal, TestNG/JUnit, Streams, concurrency',
  },
  {
    id: 'TypeScript',
    name: 'TypeScript',
    category: 'Programming Languages',
    desc: 'Strict typing, modern async/await, interfaces, Playwright/Node runtime',
  },
  {
    id: 'Python',
    name: 'Python (Pytest)',
    category: 'Programming Languages',
    desc: 'Pytest fixtures, yield teardowns, pytest-xdist parallelization',
  },
  {
    id: 'JavaScript',
    name: 'JavaScript (Node.js)',
    category: 'Programming Languages',
    desc: 'ES Modules, Promise concurrency, event loop, dynamic typing',
  },

  // API & Backend
  {
    id: 'API Testing',
    name: 'API Testing (General)',
    category: 'API & Backend',
    desc: 'REST, GraphQL, gRPC, OAuth2/JWT auth, payload contracts, mock services',
  },
  {
    id: 'Postman',
    name: 'Postman & Newman',
    category: 'API & Backend',
    desc: 'Collections, environment variables, pre-request scripts, CLI test runners',
  },
  {
    id: 'Pact',
    name: 'Pact Contract Testing',
    category: 'API & Backend',
    desc: 'Consumer-driven contracts, provider verification, Pact broker matrix',
  },

  // QA Strategy & Ops
  {
    id: 'Manual Testing',
    name: 'Manual Testing & Strategy',
    category: 'QA Strategy & Ops',
    desc: 'Boundary Value Analysis, Equivalence Partitioning, Bug Triage, Test Charters',
  },
  {
    id: 'Manual QA',
    name: 'Manual QA Processes',
    category: 'QA Strategy & Ops',
    desc: 'Exploratory testing, test plan creation, defect severity/priority, regression cycles',
  },
  {
    id: 'CI/CD',
    name: 'CI/CD Pipelines',
    category: 'QA Strategy & Ops',
    desc: 'Automated test execution in CI, matrix sharding, dockerized test runners',
  },
  {
    id: 'Git',
    name: 'Git & Version Control',
    category: 'QA Strategy & Ops',
    desc: 'Git branch strategies, merge conflict resolution, pre-commit quality hooks',
  },
  {
    id: 'GitHub Actions',
    name: 'GitHub Actions CI',
    category: 'QA Strategy & Ops',
    desc: 'Workflow YAMLs, matrix strategy, artifact uploads, secrets management',
  },
  {
    id: 'Performance Testing',
    name: 'Performance Testing',
    category: 'QA Strategy & Ops',
    desc: 'k6, JMeter, distributed load, spike testing, SLA latency thresholds',
  },
  {
    id: 'JMeter',
    name: 'Apache JMeter',
    category: 'QA Strategy & Ops',
    desc: 'Thread groups, HTTP request samplers, CSV data config, non-GUI CLI runs',
  },
  {
    id: 'APM',
    name: 'APM & Observability',
    category: 'QA Strategy & Ops',
    desc: 'Application Performance Monitoring, Datadog/Grafana metrics, latency bottlenecks',
  },

  // AI & Advanced
  {
    id: 'AI for QA',
    name: 'AI for QA Engineering',
    category: 'QA Strategy & Ops',
    desc: 'Autonomous test agents, self-healing locators, synthetic data generation',
  },
  {
    id: 'LLM',
    name: 'LLM Evaluation & QA',
    category: 'QA Strategy & Ops',
    desc: 'Benchmarking LLMs, prompt regression testing, hallucination detection',
  },
  {
    id: 'MCP',
    name: 'Model Context Protocol (MCP)',
    category: 'QA Strategy & Ops',
    desc: 'Exposing QA tools to AI agents via MCP server specifications',
  },
  {
    id: 'RAG',
    name: 'RAG Testing & Verification',
    category: 'QA Strategy & Ops',
    desc: 'Retrieval Augmented Generation validation, chunking fidelity, citation checks',
  },
  {
    id: 'Test Architecture',
    name: 'Test Architecture (Staff/Lead)',
    category: 'QA Strategy & Ops',
    desc: '50-squad monorepo design, flaky test quarantine, reporting platform, ROI metrics',
  },
  {
    id: 'QA Leadership',
    name: 'QA Leadership & Governance',
    category: 'QA Strategy & Ops',
    desc: 'Quality gates, defect leakage burndown, team topologies, CoE roadmaps',
  },
];

export const SKILL_PRESETS = [
  {
    name: 'Complete QA Interview',
    desc: 'Holistic round spanning UI, API, Manual Testing, CI/CD, and Coding',
    skills: ['Playwright', 'Selenium', 'Manual Testing', 'API Testing', 'CI/CD'],
  },
  {
    name: 'Playwright + TypeScript SDET',
    desc: 'Modern web automation, TypeScript, REST Assured, and CI/CD pipelines',
    skills: ['Playwright', 'TypeScript', 'REST Assured', 'GitHub Actions'],
  },
  {
    name: 'Enterprise Selenium + Java SDET',
    desc: 'Selenium 4, Java, REST Assured, and CI/CD pipelines',
    skills: ['Selenium', 'Java', 'REST Assured', 'CI/CD'],
  },
  {
    name: 'Test Architect / Staff QE',
    desc: 'Enterprise architecture, flaky test quarantine, CI/CD gates, and AI for QA',
    skills: ['Test Architecture', 'CI/CD', 'QA Leadership', 'AI for QA'],
  },
  {
    name: 'Python SDET Specialist',
    desc: 'Pytest fixtures, Python, and Playwright / API test suites',
    skills: ['Playwright', 'Python', 'CI/CD'],
  },
  {
    name: 'Mobile QE Specialist (Appium)',
    desc: 'Appium, Mobile QA, Java/TypeScript, and cross-platform automation',
    skills: ['Appium', 'Java', 'Manual QA'],
  },
  {
    name: 'Manual QA & Test Lead',
    desc: 'Test design (BVA/EP), bug triage, Postman API, and release gates',
    skills: ['Manual Testing', 'Postman', 'CI/CD'],
  },
];

interface Scorecard {
  overallScore: number;
  technicalScore: number;
  architectureScore: number;
  communicationScore: number;
  summary: string;
  strengths: string[];
  areasForImprovement: string[];
  hiringRecommendation?: 'Strong Hire' | 'Hire' | 'Leaning Hire' | 'Needs Practice' | string;
  seniorityCalibration?: string;
  actionableDrills?: string[];
  learningRoadmap?: string[];
  questionBreakdown?: {
    questionNumber: number;
    question: string;
    category?: string;
    verdict: 'Correct' | 'Partially Correct' | 'Incorrect';
    score: number;
    keyGap?: string;
  }[];
}

export interface EvaluationResultState {
  verdict: 'Correct' | 'Partially Correct' | 'Incorrect';
  turnScore: number;
  feedback: string;
  mistakesAndGaps: string[];
  whatUserMissed: string;
  probingQuestion?: string;
  idealAnswer: string;
  referenceCode?: string;
  bestPractice?: string;
  pitfallToAvoid?: string;
  candidateAnswer: string;
  candidateCode: string;
  question: string;
  category: string;
}

interface ChatMessage {
  id: string;
  sender: 'interviewer' | 'candidate';
  senderName: string;
  avatarText?: string;
  content: string;
  codeSnippet?: string;
  timestamp: string;
  questionNumber?: number;
  totalQuestions?: number;
  isFollowUp?: boolean;
  followUpNote?: string;
  timeSpent?: string;
}

export default function InterviewGriller() {
  // Config states: Difficulty, Experience Level, Track, Mode
  const [difficulty, setDifficulty] = useState<
    | 'Easy'
    | 'Medium'
    | 'Hard'
    | 'Beginner'
    | 'Intermediate'
    | 'Advanced'
    | 'Expert'
    | 'Architect'
    | string
  >('Medium');
  const [experienceTier, setExperienceTier] = useState<string>('0-2 Years');
  const [experienceYears, setExperienceYears] = useState<number>(1);
  const [interviewMode, setInterviewMode] = useState<'chat' | 'audio'>('chat');
  const [selectedTrack, setSelectedTrack] = useState<string>('Test Automation');
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [sourcePreference, setSourcePreference] = useState<
    'internal_knowledge_base' | 'external_research'
  >('internal_knowledge_base');
  const [enableWebSearch, setEnableWebSearch] = useState<boolean>(false);

  // Candidate Tech Stack & Skills Multi-Select state
  const [selectedSkills, setSelectedSkills] = useState<string[]>([
    'Playwright',
    'TypeScript',
    'REST Assured',
  ]);
  const [showSkillsModal, setShowSkillsModal] = useState<boolean>(false);

  const toggleSkill = (skillId: string) => {
    setSelectedSkills((prev) => {
      let next: string[];
      if (prev.includes(skillId)) {
        if (prev.length === 1) return prev; // Keep at least one skill selected
        next = prev.filter((s) => s !== skillId);
      } else {
        next = [...prev, skillId];
      }
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('intelligentqa_selected_skills', JSON.stringify(next));
        } catch {}
      }
      return next;
    });
  };

  const applyPreset = (presetSkills: string[]) => {
    setSelectedSkills(presetSkills);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('intelligentqa_selected_skills', JSON.stringify(presetSkills));
      } catch {}
    }
  };

  // Modal / popover controls
  const [showTrackModal, setShowTrackModal] = useState<boolean>(false);
  const [showConfigModal, setShowConfigModal] = useState<boolean>(false);
  const [showHintModal, setShowHintModal] = useState<boolean>(false);
  const [showReviewDrawer, setShowReviewDrawer] = useState<boolean>(false);
  const [liveCoachCollapsed, setLiveCoachCollapsed] = useState<boolean>(false);

  // PREP Framework State in Live Coach
  const [activePrepTab, setActivePrepTab] = useState<
    'PREP' | 'Point' | 'Reason' | 'Example' | 'Impact'
  >('PREP');
  const [coachingAdvice, setCoachingAdvice] = useState<string>(
    'Lead with your main point, then back it up.'
  );
  const [coachingResult, setCoachingResult] = useState<{
    prepStage?: string;
    prepAdvice?: string;
    suggestions?: string[];
  } | null>(null);
  const [isCoachingLoading, setIsCoachingLoading] = useState<boolean>(false);

  // Core interview lifecycle
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [isInterviewerTyping, setIsInterviewerTyping] = useState<boolean>(false);

  // Chat message stream
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Current question metadata
  const [currentQuestion, setCurrentQuestion] = useState<string>('');
  const [currentCategory, setCurrentCategory] = useState<string>('Test Automation');
  const [questionNumber, setQuestionNumber] = useState<number>(1);
  const [totalQuestions, setTotalQuestions] = useState<number>(5);
  const [expectedFocus, setExpectedFocus] = useState<string>('');
  const [codeContext, setCodeContext] = useState<string>('');
  const [questionList, setQuestionList] = useState<any[]>([]);

  // User input states
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [userCode, setUserCode] = useState<string>('');
  const [showCodeEditor, setShowCodeEditor] = useState<boolean>(false);

  // Timers
  const [totalSeconds, setTotalSeconds] = useState<number>(0);
  const [answerSeconds, setAnswerSeconds] = useState<number>(0);

  // Follow-up & Evaluation states
  const [isAwaitingFollowUp, setIsAwaitingFollowUp] = useState<boolean>(false);
  const [currentEvaluation, setCurrentEvaluation] = useState<EvaluationResultState | null>(null);
  const [pendingNextQuestion, setPendingNextQuestion] = useState<any | null>(null);
  const [pendingScorecard, setPendingScorecard] = useState<Scorecard | null>(null);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const [turns, setTurns] = useState<{ question: string; answer: string; feedback?: string }[]>([]);
  const [probingQuestion, setProbingQuestion] = useState<string>('');
  const [scorecard, setScorecard] = useState<Scorecard | null>(null);
  const [guestLockedRound, setGuestLockedRound] = useState<boolean>(false);

  // Audio & Speech States
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [speechSupported, setSpeechSupported] = useState<boolean>(true);
  const recognitionRef = useRef<any>(null);
  const baseSpeechTextRef = useRef<string>('');

  // Auth and Gemini Key state
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [geminiKey, setGeminiKey] = useState<string>('');
  const [aiPref, setAiPref] = useState<'enabled' | 'opted_out' | 'unset'>('unset');
  const [showKeyModal, setShowKeyModal] = useState<boolean>(false);

  const syncState = useCallback(() => {
    if (typeof window !== 'undefined') {
      const user = QADatabase.getCurrentUser();
      setCurrentUser(user);
      const key = QADatabase.getUserGeminiKey(user?.id);
      setGeminiKey(key);
      const pref = QADatabase.getAiPreference(user?.id);
      setAiPref(pref);
      if (user?.experienceYears && typeof user.experienceYears === 'number') {
        setExperienceYears(user.experienceYears);
        if (user.experienceYears <= 2) setExperienceTier('0-2 Years');
        else if (user.experienceYears <= 5) setExperienceTier('3-5 Years');
        else if (user.experienceYears <= 9) setExperienceTier('6-9 Years');
        else setExperienceTier('10+ Years');
      }
      const savedSkills = localStorage.getItem('intelligentqa_selected_skills');
      if (savedSkills) {
        try {
          const parsed = JSON.parse(savedSkills);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setSelectedSkills(parsed);
          }
        } catch {}
      }
    }
  }, []);

  useEffect(() => {
    syncState();
    const handleAuth = () => syncState();
    const handleKey = () => syncState();
    const handleAiPref = () => syncState();
    window.addEventListener('intelligentqa_auth_changed', handleAuth);
    window.addEventListener('intelligentqa_key_changed', handleKey);
    window.addEventListener('intelligentqa_ai_pref_changed', handleAiPref);

    if (typeof window !== 'undefined') {
      const hasSpeech = 'speechSynthesis' in window;
      const hasRec = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
      setSpeechSupported(hasSpeech || hasRec);
    }

    return () => {
      window.removeEventListener('intelligentqa_auth_changed', handleAuth);
      window.removeEventListener('intelligentqa_key_changed', handleKey);
      window.removeEventListener('intelligentqa_ai_pref_changed', handleAiPref);
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
    };
  }, [syncState]);

  // Total Timer & Per-Answer Timer Ticker
  useEffect(() => {
    if (!hasStarted || !!scorecard) return;
    const interval = setInterval(() => {
      setTotalSeconds((prev) => prev + 1);
      setAnswerSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [hasStarted, scorecard]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isInterviewerTyping]);

  // Dynamic coaching advice updater based on typing & PREP tab
  useEffect(() => {
    const trimmed = userAnswer.trim();
    const wordCount = trimmed.split(/\s+/).filter(Boolean).length;

    if (activePrepTab === 'Point') {
      setCoachingAdvice("State your direct conclusion in sentence one. Don't bury the lead.");
      return;
    }
    if (activePrepTab === 'Reason') {
      setCoachingAdvice(
        'Explain the architectural WHY: why does Playwright or this framework behave this way?'
      );
      return;
    }
    if (activePrepTab === 'Example') {
      setCoachingAdvice(
        'Provide a concrete locator code line or real failure scenario (e.g. getByRole vs locator).'
      );
      return;
    }
    if (activePrepTab === 'Impact') {
      setCoachingAdvice(
        'Quantify impact: flakiness reduction, CI run time, or team maintenance cost.'
      );
      return;
    }

    // Default PREP adaptive guidance
    if (wordCount < 4) {
      setCoachingAdvice('Lead with your main point, then back it up.');
    } else if (
      !/(because|since|as\s+a\s+result|queries|mirror|tree|accessibility|dom)/i.test(trimmed)
    ) {
      setCoachingAdvice(
        'Good start. Now explain the architectural reason (e.g. Accessibility Tree vs HTML DOM).'
      );
    } else if (!/(page\.|locator|getbyrole|css|const|await|for\s+example)/i.test(trimmed)) {
      setCoachingAdvice('Strengthen your answer by giving a concrete code or locator example.');
    } else if (
      !/(ci|pipeline|flakiness|refactor|break|false.positive|speed|maintenance)/i.test(trimmed)
    ) {
      setCoachingAdvice(
        'Tie it home: explain how this locator choice prevents broken builds in CI.'
      );
    } else {
      setCoachingAdvice('Solid structure! You have covered Point, Reason, Example, and Impact.');
    }
  }, [userAnswer, activePrepTab]);

  // Audio Text-to-Speech Handler
  const speakText = (text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[`*#_]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Stop Speech Recognition cleanly and cancel any pending callbacks
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        if (typeof recognitionRef.current.abort === 'function') {
          recognitionRef.current.abort();
        } else if (typeof recognitionRef.current.stop === 'function') {
          recognitionRef.current.stop();
        }
      } catch {}
      recognitionRef.current = null;
    }
    setIsListening(false);
    baseSpeechTextRef.current = '';
  }, []);

  // Audio Speech-to-Text Handler with de-duplication of interim speech results
  const toggleListening = () => {
    if (typeof window === 'undefined') return;
    if (isListening) {
      stopListening();
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(
        'Speech recognition is not natively supported in your browser. You can type your answer in the box or switch to Chat & Code Mode.'
      );
      return;
    }

    try {
      // Snapshot any existing text in the answer box before speech starts
      baseSpeechTextRef.current = userAnswer.trim();

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = 0; i < event.results.length; i++) {
          const resultItem = event.results[i];
          if (resultItem.isFinal) {
            finalTranscript += resultItem[0].transcript + ' ';
          } else {
            interimTranscript += resultItem[0].transcript;
          }
        }

        const currentSpoken = (finalTranscript + interimTranscript).trim();
        if (currentSpoken) {
          const base = baseSpeechTextRef.current;
          const combined = base ? `${base} ${currentSpoken}` : currentSpoken;
          setUserAnswer(combined);
        }
      };

      recognition.onerror = () => {
        stopListening();
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (err) {
      console.error('Speech recognition error:', err);
      stopListening();
    }
  };

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
  };

  const handleTierSelect = (tier: '0-2 Years' | '3-5 Years' | '6-9 Years' | '10+ Years') => {
    setExperienceTier(tier);
    if (tier === '0-2 Years') setExperienceYears(1);
    else if (tier === '3-5 Years') setExperienceYears(4);
    else if (tier === '6-9 Years') setExperienceYears(7);
    else setExperienceYears(12);
  };

  // Start interview session
  const startInterview = async (overrideSkills?: string[]) => {
    if (currentUser && !geminiKey) {
      setShowKeyModal(true);
      return;
    }

    setLoading(true);
    setScorecard(null);
    setTurns([]);
    setGuestLockedRound(false);
    setTotalSeconds(0);
    setAnswerSeconds(0);
    setIsAwaitingFollowUp(false);
    setMessages([]);

    try {
      const activeSkills = overrideSkills || selectedSkills;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (geminiKey) {
        headers['x-gemini-api-key'] = geminiKey;
      }

      let data: any = null;
      try {
        const res = await fetch('/api/ai/interview-grill', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            action: 'start',
            difficulty,
            experienceYears,
            experienceLevel: experienceTier,
            interviewMode,
            track: selectedTrack,
            skills: activeSkills,
            count: 5,
            apiKey: geminiKey,
          }),
        });
        if (res.ok) {
          data = await res.json();
        }
      } catch (fetchErr) {
        console.warn(
          'Network call to interview-grill failed, using local question bank:',
          fetchErr
        );
      }

      let loadedQuestions: any[] = [];
      let q1Text = '';
      let q1Cat = selectedTrack;
      let q1Focus = '';
      let q1Code = '';

      if (
        data &&
        data.question &&
        Array.isArray(data.questionList) &&
        data.questionList.length > 0
      ) {
        loadedQuestions = data.questionList;
        q1Text = data.question;
        q1Cat = data.category || selectedTrack;
        q1Focus = data.expectedFocus || '';
        q1Code = data.codeContext || '';
        setQuestionNumber(data.questionNumber || 1);
        setTotalQuestions(data.totalQuestions || 5);
      } else {
        const localQuestions = await fetchQuestionsByLevelAndDifficulty({
          difficulty,
          experienceYears: typeof experienceYears === 'number' ? experienceYears : undefined,
          limit: 5,
        });

        loadedQuestions = localQuestions.map((q, idx) => ({
          id: q.id || `q-${idx}`,
          category: q.category || selectedTrack,
          topic: q.topic || 'Technical Assessment',
          question: q.question,
          expectedFocus: q.expectedFocus || q.answerSummary || '',
          codeSnippet: q.codeSnippet || '',
          answerSummary: q.answerSummary || '',
          bestPractice: q.bestPractice || '',
          pitfallToAvoid: q.pitfallToAvoid || '',
        }));

        const first = loadedQuestions[0];
        q1Text =
          first?.question ||
          'To start, what is the difference between using page.getByRole() and page.locator() with a CSS selector in Playwright, and when would you choose one over the other?';
        q1Cat = first?.category || selectedTrack;
        q1Focus = first?.expectedFocus || '';
        q1Code = first?.codeSnippet || '';
        setQuestionNumber(1);
        setTotalQuestions(Math.max(1, loadedQuestions.length));
      }

      setCurrentQuestion(q1Text);
      setCurrentCategory(q1Cat);
      setExpectedFocus(q1Focus);
      setCodeContext(q1Code);
      setQuestionList(loadedQuestions);

      const skillsSummary = activeSkills.length > 0 ? activeSkills.join(', ') : selectedTrack;

      // Build initial chat messages matching AssertHired
      const initialMessages: ChatMessage[] = [
        {
          id: 'greeting',
          sender: 'interviewer',
          senderName: 'Rahul',
          avatarText: 'R',
          content: `Hello, thanks for joining today for your Quality Engineering mock interview. We have calibrated your session for ${experienceTier} (${difficulty}) focusing on your declared tech stack: ${skillsSummary}.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
        {
          id: 'q-1',
          sender: 'interviewer',
          senderName: 'Rahul',
          avatarText: 'R',
          content: q1Text,
          codeSnippet: q1Code,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          questionNumber: 1,
          totalQuestions: loadedQuestions.length || 5,
        },
      ];

      setMessages(initialMessages);
      setHasStarted(true);

      if (interviewMode === 'audio') {
        setTimeout(
          () =>
            speakText(
              `Hello, thanks for joining today for your QA interview. Question 1: ${q1Text}`
            ),
          400
        );
      }
    } catch (err) {
      console.error('Failed to start interview:', err);
    } finally {
      setLoading(false);
    }
  };

  // Auto-start on mount if not started yet to provide instant AssertHired immersion
  useEffect(() => {
    if (!hasStarted && !loading) {
      startInterview();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Request Live Coaching on current draft
  const handleCoachAnswer = async () => {
    if (!userAnswer.trim()) return;
    setIsCoachingLoading(true);
    try {
      const res = await fetch('/api/ai/interview-grill', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(geminiKey ? { 'x-gemini-api-key': geminiKey } : {}),
        },
        body: JSON.stringify({
          action: 'coach',
          currentAnswer: userAnswer,
          question: currentQuestion,
          currentQuestion,
          expectedFocus,
          turns,
          questionList,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setCoachingResult(data);
      }
    } catch (e) {
      console.warn('Live coach request failed:', e);
    } finally {
      setIsCoachingLoading(false);
    }
  };

  // Submit Answer (Candidate Turn)
  const submitAnswer = async () => {
    if (!userAnswer.trim() && !userCode.trim()) return;

    if (currentUser && !geminiKey) {
      setShowKeyModal(true);
      return;
    }

    // Immediately stop audio recording & cancel pending audio buffer flushes
    stopListening();
    stopSpeaking();

    const answerSnapshot = userAnswer.trim();
    const codeSnapshot = userCode.trim();
    const timeSpentSnapshot = formatTimer(answerSeconds);

    // Append Candidate message to stream
    const candidateMsg: ChatMessage = {
      id: `ans-${Date.now()}`,
      sender: 'candidate',
      senderName: 'You',
      content: answerSnapshot,
      codeSnippet: codeSnapshot,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timeSpent: timeSpentSnapshot,
    };

    setMessages((prev) => [...prev, candidateMsg]);

    // Force clear input box and speech reference baseline so no delayed text reappears
    setUserAnswer('');
    setUserCode('');
    baseSpeechTextRef.current = '';
    setShowCodeEditor(false);
    setAnswerSeconds(0);
    setCoachingResult(null);
    setLoading(true);
    setIsInterviewerTyping(true);

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (geminiKey) headers['x-gemini-api-key'] = geminiKey;

      let data: any = null;
      try {
        const res = await fetch('/api/ai/interview-grill', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            action: 'submit_answer',
            difficulty,
            experienceYears,
            experienceLevel: experienceTier,
            turns,
            currentAnswer: answerSnapshot,
            currentCode: codeSnapshot,
            questionList,
            skills: selectedSkills,
            apiKey: geminiKey,
          }),
        });
        if (res.ok) data = await res.json();
      } catch (fetchErr) {
        console.warn('Network call to interview-grill failed, using local evaluator:', fetchErr);
      }

      const currentQMeta = questionList[turns.length] || {
        question: currentQuestion,
        category: currentCategory,
        expectedFocus,
        answerSummary: expectedFocus || 'Core architectural and testing principles',
        codeSnippet: codeContext,
        bestPractice:
          'Use event-driven assertions, explicit synchronization, and resilient locators',
        pitfallToAvoid: 'Hardcoded sleeps, brittle locators, and lack of thread safety',
      };

      const rawEval = data?.evaluation;
      const combined = (answerSnapshot + ' ' + codeSnapshot).toLowerCase();
      const normalized = combined
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      const totalWords = normalized.split(/\s+/).filter(Boolean).length;
      const hasSleep = /sleep|waitfortimeout/i.test(combined);

      const ignorancePhrases = [
        'i do not know',
        'i dont know',
        'i don t know',
        'do not know',
        'dont know',
        'idk',
        'no idea',
        'have no idea',
        'no clue',
        'not sure',
        'i am not sure',
        'skip',
        'pass',
        'next',
        'no answer',
        'none',
        'nothing',
        'na',
        'n a',
      ];
      const isIgnorance =
        totalWords <= 10 &&
        ignorancePhrases.some(
          (p) =>
            normalized === p ||
            normalized.startsWith(p + ' ') ||
            normalized.endsWith(' ' + p) ||
            normalized.includes(' ' + p + ' ')
        );

      const fallbackVerdict: 'Correct' | 'Partially Correct' | 'Incorrect' =
        isIgnorance || !answerSnapshot.trim()
          ? 'Incorrect'
          : hasSleep
            ? 'Incorrect'
            : totalWords < 15
              ? 'Incorrect'
              : totalWords > 40
                ? 'Correct'
                : 'Partially Correct';

      const fallbackScore =
        isIgnorance || !answerSnapshot.trim()
          ? 0
          : hasSleep
            ? 25
            : totalWords < 15
              ? 20
              : totalWords > 40
                ? 85
                : 65;

      const evalData: EvaluationResultState = {
        verdict: rawEval?.verdict || fallbackVerdict,
        turnScore: typeof rawEval?.turnScore === 'number' ? rawEval.turnScore : fallbackScore,
        feedback:
          rawEval?.feedback ||
          (isIgnorance
            ? 'Candidate stated they do not know the answer / provided zero technical solution for this question. In an SDET or Test Architect interview, this receives a score of 0. Review the suggested model answer below to prepare.'
            : data?.feedbackOnPrevious || 'Technical assessment evaluated.'),
        mistakesAndGaps:
          Array.isArray(rawEval?.mistakesAndGaps) && rawEval.mistakesAndGaps.length > 0
            ? rawEval.mistakesAndGaps
            : isIgnorance
              ? [
                  'Candidate stated they do not know the answer / no technical solution was submitted',
                  `Zero coverage of required architecture: ${currentQMeta.expectedFocus || currentQuestion}`,
                ]
              : hasSleep
                ? ['Hardcoded sleep delays introduce non-deterministic execution in CI pipelines']
                : [
                    'Ensure full coverage of edge cases, failure recovery, and parallel execution race conditions',
                  ],
        whatUserMissed:
          rawEval?.whatUserMissed ||
          currentQMeta.answerSummary ||
          currentQMeta.expectedFocus ||
          'Core architectural concepts and implementation.',
        probingQuestion:
          rawEval?.probingQuestion ||
          data?.probingQuestion ||
          (questionNumber === 1
            ? 'Good distinction. In practice, what happens to your tests when the UI is refactored, say a class name changes or a div gets restructured, and how would that influence which one you pick?'
            : 'How would you measure the return on investment (ROI) and maintainability of this approach in a high-velocity CI/CD pipeline?'),
        idealAnswer:
          rawEval?.idealAnswer ||
          currentQMeta.answerSummary ||
          expectedFocus ||
          'Standard test engineering best practices.',
        referenceCode: rawEval?.referenceCode || currentQMeta.codeSnippet || codeContext || '',
        bestPractice:
          rawEval?.bestPractice ||
          currentQMeta.bestPractice ||
          'Use event-driven assertions and resilient user-facing locators.',
        pitfallToAvoid:
          rawEval?.pitfallToAvoid ||
          currentQMeta.pitfallToAvoid ||
          'Hardcoded sleep delays and brittle absolute locators.',
        candidateAnswer: answerSnapshot,
        candidateCode: codeSnapshot,
        question: currentQuestion,
        category: currentCategory,
      };

      setCurrentEvaluation(evalData);
      setPendingNextQuestion(data?.nextQuestion || null);
      setPendingScorecard(data?.scorecard || null);

      // Brief conversational typing pause for realism
      setTimeout(() => {
        setIsInterviewerTyping(false);

        if (!isAwaitingFollowUp && evalData.probingQuestion) {
          // Send Follow-Up question from Rahul
          setIsAwaitingFollowUp(true);
          const followUpMsg: ChatMessage = {
            id: `followup-${Date.now()}`,
            sender: 'interviewer',
            senderName: 'Rahul',
            avatarText: 'R',
            content: evalData.probingQuestion,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isFollowUp: true,
            followUpNote: `Follow-up on question ${questionNumber}. Interviewers dig into one answer like this; it does not use up one of your ${totalQuestions} questions.`,
          };
          setMessages((prev) => [...prev, followUpMsg]);

          if (interviewMode === 'audio') {
            speakText(evalData.probingQuestion);
          }
        } else {
          // If already did follow-up or no probing question, advance question or show final
          handleProceedToNextQuestion();
        }
      }, 700);
    } catch (err) {
      console.error('Failed to submit answer:', err);
      setIsInterviewerTyping(false);
    } finally {
      setLoading(false);
    }
  };

  // Advance to next question or final scorecard
  const handleProceedToNextQuestion = async () => {
    stopSpeaking();
    if (!currentEvaluation) return;

    if (!currentUser && turns.length >= 0) {
      setGuestLockedRound(true);
      return;
    }

    const newTurn = {
      question: currentEvaluation.question,
      answer: currentEvaluation.candidateAnswer,
      feedback: `${currentEvaluation.verdict} (${currentEvaluation.turnScore}%): ${currentEvaluation.feedback}`,
    };
    const updatedTurns = [...turns, newTurn];
    setTurns(updatedTurns);

    const isFinalRound = (questionNumber || 1) >= (totalQuestions || 5) || !!pendingScorecard;

    if (isFinalRound) {
      const turnScores: number[] = updatedTurns.map((t: any) => {
        const match = t.feedback?.match(/\((\d+)%\)/);
        return match ? parseInt(match[1], 10) : (currentEvaluation.turnScore ?? 0);
      });
      const avgScore = Math.round(turnScores.reduce((acc, s) => acc + s, 0) / turnScores.length);
      const technicalScore = currentEvaluation.turnScore ?? 0;

      const hiringRec =
        avgScore >= 88
          ? 'Strong Hire'
          : avgScore >= 75
            ? 'Hire'
            : avgScore >= 55
              ? 'Leaning Hire'
              : 'Needs Practice';

      const finalScorecard: Scorecard = pendingScorecard || {
        overallScore: avgScore,
        technicalScore: technicalScore,
        architectureScore: Math.max(0, technicalScore - 5),
        communicationScore: technicalScore === 0 ? 15 : Math.min(98, technicalScore + 2),
        summary: `Candidate completed the ${difficulty.toUpperCase()} Technical Mock Interview (${experienceTier}). Overall performance demonstrated ${avgScore >= 80 ? 'strong' : avgScore >= 50 ? 'solid' : 'insufficient'} technical knowledge across test architecture, quality gates, and automation practices.`,
        strengths: [
          avgScore >= 75
            ? 'Articulated root causes of test flakiness and avoided arbitrary sleep timers'
            : 'Demonstrated fundamental understanding of quality assurance concepts',
          'Demonstrated clear understanding of modular automation patterns and separation of concerns',
        ],
        areasForImprovement:
          currentEvaluation.mistakesAndGaps && currentEvaluation.mistakesAndGaps.length > 0
            ? currentEvaluation.mistakesAndGaps
            : [
                'Further optimize parallel CI sharding and ephemeral cloud browser container scaling',
              ],
        hiringRecommendation: hiringRec,
        actionableDrills: [
          'Review the Gold Standard model answers in the side-by-side comparison modal',
          'Structure technical answers with PREP (Point, Reason, Example, Impact) and behavioral answers with STAR',
        ],
        questionBreakdown: updatedTurns.map((t, idx) => ({
          questionNumber: idx + 1,
          question: t.question || `Question ${idx + 1}`,
          category: selectedTrack,
          verdict:
            t.feedback?.includes('Correct') && !t.feedback.includes('Partially')
              ? 'Correct'
              : t.feedback?.includes('Partially')
                ? 'Partially Correct'
                : 'Incorrect',
          score: t.feedback?.match(/\((\d+)%\)/)
            ? parseInt(t.feedback.match(/\((\d+)%\)/)![1], 10)
            : 70,
          keyGap: t.feedback?.split('): ')[1] || 'Review model answer',
        })),
      };

      setScorecard(finalScorecard);
      setCurrentEvaluation(null);

      // Congratulatory message from Rahul
      const congratsMsg: ChatMessage = {
        id: `conclusion-${Date.now()}`,
        sender: 'interviewer',
        senderName: 'Rahul',
        avatarText: 'R',
        content: `Thanks for completing the mock interview today! I've assembled your detailed rubric evaluation, technical scores, and areas of improvement.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, congratsMsg]);

      // Persist to database
      const userId = currentUser?.id || DEMO_USER.id;
      await QADatabase.saveInterviewSession(userId, {
        trackId: 'interview-griller',
        title: `Technical Mock Interview: ${selectedTrack} - ${experienceTier} (${difficulty})`,
        difficulty,
        experienceLevel: experienceTier,
        interviewMode,
        overallScore: finalScorecard.overallScore,
        technicalScore: finalScorecard.technicalScore,
        communicationScore: finalScorecard.communicationScore,
        architectureScore: finalScorecard.architectureScore,
        summaryFeedback: finalScorecard.summary,
        strengths: finalScorecard.strengths,
        areasForImprovement: finalScorecard.areasForImprovement,
        completedAt: new Date().toISOString(),
        messages: [],
      });

      if (interviewMode === 'audio') {
        speakText(
          `Interview assessment complete! Your overall technical score is ${finalScorecard.overallScore} percent.`
        );
      }
      return;
    }

    // Advance to next question
    setIsAwaitingFollowUp(false);
    let nextQText = '';
    let nextQNum = questionNumber + 1;
    let nextQCat = currentCategory;
    let nextQFocus = '';
    let nextQCode = '';

    if (pendingNextQuestion && pendingNextQuestion.question) {
      nextQText = pendingNextQuestion.question;
      nextQCat = pendingNextQuestion.category || selectedTrack;
      nextQNum = pendingNextQuestion.questionNumber || updatedTurns.length + 1;
      nextQFocus = pendingNextQuestion.expectedFocus || '';
      nextQCode = pendingNextQuestion.codeContext || '';
    } else {
      const nextIdx = updatedTurns.length;
      if (nextIdx < questionList.length) {
        const nextQ = questionList[nextIdx];
        nextQText = nextQ.question;
        nextQCat = nextQ.category || selectedTrack;
        nextQNum = nextIdx + 1;
        nextQFocus = nextQ.expectedFocus || nextQ.answerSummary || '';
        nextQCode = nextQ.codeSnippet || '';
      }
    }

    setCurrentQuestion(nextQText);
    setCurrentCategory(nextQCat);
    setQuestionNumber(nextQNum);
    setExpectedFocus(nextQFocus);
    setCodeContext(nextQCode);

    // Interviewer transition message + next question
    const transitionPrefix =
      nextQNum === 2
        ? 'Thanks, that makes the tradeoff clear. Moving to a different area: '
        : "Understood. Let's look at the next core requirement: ";

    const nextMsg: ChatMessage = {
      id: `q-${nextQNum}`,
      sender: 'interviewer',
      senderName: 'Rahul',
      avatarText: 'R',
      content: `${transitionPrefix}${nextQText}`,
      codeSnippet: nextQCode,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      questionNumber: nextQNum,
      totalQuestions: totalQuestions || 5,
    };

    stopListening();
    setMessages((prev) => [...prev, nextMsg]);
    setUserAnswer('');
    setUserCode('');
    baseSpeechTextRef.current = '';
    setCurrentEvaluation(null);
    setPendingNextQuestion(null);

    if (interviewMode === 'audio' && nextQText) {
      speakText(`${transitionPrefix}${nextQText}`);
    }
  };

  const restartInterview = (overrideSkills?: string[]) => {
    stopSpeaking();
    stopListening();
    setHasStarted(false);
    setScorecard(null);
    setCurrentEvaluation(null);
    setPendingNextQuestion(null);
    setPendingScorecard(null);
    setTurns([]);
    setCurrentQuestion('');
    setUserAnswer('');
    setUserCode('');
    baseSpeechTextRef.current = '';
    setProbingQuestion('');
    startInterview(overrideSkills);
  };

  const pauseInterview = async () => {
    setIsPaused(true);
    try {
      await fetch('/api/ai/interview-grill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'pause', turns }),
      });
    } catch {}
  };

  const resumeInterview = async () => {
    setIsPaused(false);
    try {
      await fetch('/api/ai/interview-grill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'resume', turns, questionList }),
      });
    } catch {}
  };

  const repeatQuestion = async () => {
    try {
      const res = await fetch('/api/ai/interview-grill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'repeat', turns, questionList }),
      });
      const data = await res.json();
      if (data.clarification) {
        setMessages((prev) => [
          ...prev,
          {
            id: `repeat-${Date.now()}`,
            sender: 'interviewer',
            senderName: 'Interviewer (Agent 06)',
            avatarText: '06',
            content: data.clarification,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
        if (interviewMode === 'audio') {
          speakText(data.clarification);
        }
      }
    } catch {}
  };

  const skipQuestion = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/interview-grill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'skip',
          turns,
          questionList,
          difficulty,
          experienceTier,
          skills: selectedSkills,
        }),
      });
      const data = await res.json();
      if (data.isFinished) {
        setScorecard(data.scorecard);
      } else if (data.nextQuestion) {
        setCurrentQuestion(data.nextQuestion.question);
        setQuestionNumber(data.nextQuestion.questionNumber);
        setTurns((prev) => [
          ...prev,
          {
            question: currentQuestion,
            answer: '[Question Skipped]',
            feedback: 'Skipped (0%)',
            score: 0,
          },
        ]);
        setMessages((prev) => [
          ...prev,
          {
            id: `skip-${Date.now()}`,
            sender: 'interviewer',
            senderName: 'Interviewer (Agent 06)',
            avatarText: '06',
            content: `Question ${questionNumber} was skipped. Moving to Question ${data.nextQuestion.questionNumber}: ${data.nextQuestion.question}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            questionNumber: data.nextQuestion.questionNumber,
            totalQuestions,
          },
        ]);
        if (interviewMode === 'audio') {
          speakText(
            `Moving to Question ${data.nextQuestion.questionNumber}: ${data.nextQuestion.question}`
          );
        }
      }
    } catch (e) {
      console.error('Failed to skip question:', e);
    } finally {
      setLoading(false);
    }
  };

  const endInterview = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/interview-grill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'end',
          turns,
          questionList,
          difficulty,
          experienceTier,
          skills: selectedSkills,
        }),
      });
      const data = await res.json();
      if (data.scorecard) {
        setScorecard(data.scorecard);
      }
    } catch (e) {
      console.error('Failed to end interview:', e);
    } finally {
      setLoading(false);
    }
  };

  // Keyboard shortcut: Shift+Enter for new line, Enter to submit
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submitAnswer();
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col min-h-screen bg-[#080c10] text-[#e2e8f0]">
      {/* =========================================================================
          TOP INTERVIEW STATUS BAR (AssertHired Style)
         ========================================================================= */}
      <div className="w-full bg-[#080c10] border-b border-emerald-950/60 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          {/* Left: Back to Dashboard */}
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-400 hover:text-emerald-400 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </Link>
          </div>

          {/* Center: Track, Skills, Level & Question Progress Bar */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Topic / Track Badge */}
            <button
              onClick={() => setShowTrackModal(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#0e1c19] border border-emerald-900/60 text-emerald-300 hover:bg-[#132824] transition-all cursor-pointer"
              title="Click to change interview track"
            >
              <Edit3 className="w-3 h-3 text-emerald-400" />
              <span className="font-semibold">{selectedTrack}</span>
            </button>

            {/* Tech Stack & Skills Multi-Select Badge */}
            <button
              onClick={() => setShowSkillsModal(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#111f1c] border border-emerald-800/80 text-emerald-300 hover:bg-[#162a26] hover:border-emerald-600 transition-all cursor-pointer shadow-sm"
              title="Configure Tech Stack & Skills (Playwright, Selenium, REST Assured, etc.)"
            >
              <Sliders className="w-3 h-3 text-emerald-400" />
              <span className="font-semibold">
                {selectedSkills.length <= 2
                  ? selectedSkills.join(', ')
                  : `${selectedSkills.slice(0, 2).join(', ')} (+${selectedSkills.length - 2})`}
              </span>
            </button>

            {/* Seniority Level Badge */}
            <button
              onClick={() => setShowConfigModal(true)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[#111920] border border-neutral-800 text-neutral-300 hover:bg-neutral-800 transition-all cursor-pointer"
              title="Click to change experience level"
            >
              <span>
                {experienceTier === '0-2 Years'
                  ? 'Entry Level'
                  : experienceTier === '3-5 Years'
                    ? 'Mid Level'
                    : experienceTier === '6-9 Years'
                      ? 'Senior SDET'
                      : 'Lead Architect'}
              </span>
            </button>

            {/* Progress Segmented Dots (1/5) */}
            <div className="flex items-center gap-1.5 text-xs font-mono text-neutral-400 ml-1">
              <div className="flex items-center gap-1">
                {Array.from({ length: totalQuestions || 5 }).map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      idx < questionNumber
                        ? 'w-4 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                        : 'w-1.5 bg-neutral-800'
                    }`}
                  />
                ))}
              </div>
              <span className="ml-1 text-[11px] font-medium text-emerald-400/90">
                {questionNumber}/{totalQuestions || 5}
              </span>
            </div>
          </div>

          {/* Right: Hint Button, Speech Mode Toggle, and Total Running Timer */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Hint Button */}
            <button
              onClick={() => setShowHintModal(true)}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-amber-400 hover:bg-amber-950/20 transition-all cursor-pointer"
              title="Architecture Hint"
            >
              <Lightbulb className="w-4 h-4 text-amber-400" />
            </button>

            {/* Audio Toggle */}
            <button
              onClick={() => {
                const nextMode = interviewMode === 'chat' ? 'audio' : 'chat';
                setInterviewMode(nextMode);
                if (nextMode === 'audio' && currentQuestion) {
                  speakText(currentQuestion);
                } else {
                  stopSpeaking();
                }
              }}
              className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                interviewMode === 'audio'
                  ? 'text-emerald-400 bg-emerald-950/40 border border-emerald-800/40'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
              title={
                interviewMode === 'audio'
                  ? 'Audio Mode Active (Click to mute)'
                  : 'Switch to Audio Voice Mode'
              }
            >
              {interviewMode === 'audio' ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </button>

            {/* Repeat Question Button */}
            <button
              onClick={repeatQuestion}
              disabled={loading || isPaused}
              className="px-2 py-1 rounded-lg text-xs font-medium text-neutral-400 hover:text-emerald-300 hover:bg-neutral-800/60 border border-neutral-800 transition-all cursor-pointer disabled:opacity-40"
              title="Ask interviewer to repeat the question"
            >
              Repeat
            </button>

            {/* Skip Question Button */}
            <button
              onClick={skipQuestion}
              disabled={loading || isPaused}
              className="px-2 py-1 rounded-lg text-xs font-medium text-neutral-400 hover:text-amber-300 hover:bg-amber-950/30 border border-neutral-800 transition-all cursor-pointer disabled:opacity-40"
              title="Skip this question (Score 0)"
            >
              Skip
            </button>

            {/* Pause / Resume Button */}
            <button
              onClick={isPaused ? resumeInterview : pauseInterview}
              disabled={loading}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                isPaused
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 animate-pulse'
                  : 'bg-[#111920] border-neutral-800 text-neutral-300 hover:bg-neutral-800'
              }`}
              title={isPaused ? 'Resume Interview' : 'Pause Interview and freeze timer'}
            >
              {isPaused ? 'Resume' : 'Pause'}
            </button>

            {/* End Interview Button */}
            <button
              onClick={endInterview}
              disabled={loading}
              className="px-2 py-1 rounded-lg text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 border border-rose-950/50 transition-all cursor-pointer disabled:opacity-40"
              title="End interview and view final scorecard"
            >
              End
            </button>

            {/* Running Total Timer (e.g. TOTAL 04:33) */}
            <div className="flex items-center gap-1.5 text-xs font-mono font-medium tracking-wider text-emerald-400/90 bg-[#0c1615] px-2.5 py-1 rounded-lg border border-emerald-950">
              <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-sans font-bold">
                Total
              </span>
              <span>{formatTimer(totalSeconds)}</span>
            </div>
          </div>
        </div>

        {/* Emerald accent progress line */}
        <div className="w-full h-[2px] bg-neutral-900 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-600 via-emerald-400 to-teal-300 transition-all duration-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]"
            style={{ width: `${Math.min(100, (questionNumber / (totalQuestions || 5)) * 100)}%` }}
          />
        </div>
      </div>

      {/* =========================================================================
          MAIN INTERVIEW STAGE (2-Column Layout matching AssertHired)
         ========================================================================= */}
      <div className="flex-1 max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 min-h-0">
        {/* =====================================================================
            LEFT COLUMN: INTERVIEW CHAT ROOM & INPUT DOCK (~72% width)
           ===================================================================== */}
        <div className="lg:col-span-8 xl:col-span-9 flex flex-col border-r border-emerald-950/40 min-h-[calc(100vh-58px)] bg-[#080c10]">
          {/* Scrollable Message Thread */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-8 py-6 space-y-6">
            {messages.map((msg) => (
              <div key={msg.id} className="space-y-2">
                {msg.sender === 'interviewer' ? (
                  /* Interviewer Question / Response */
                  <div className="flex items-start gap-3.5 max-w-3xl">
                    {/* Persona Avatar (Rahul with initial 'R') */}
                    <div className="flex flex-col items-center shrink-0">
                      <div className="w-8 h-8 rounded-full bg-emerald-900/80 border border-emerald-600/70 text-emerald-200 flex items-center justify-center font-bold text-xs shadow-inner">
                        {msg.avatarText || 'R'}
                      </div>
                      <span className="text-[10px] text-emerald-500/80 font-mono mt-1 font-medium">
                        {msg.senderName}
                      </span>
                    </div>

                    {/* Interviewer Message Card */}
                    <div className="flex-1 bg-[#0c1514] border border-emerald-900/40 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3">
                      <p className="text-[15px] leading-relaxed text-neutral-100 font-normal">
                        {msg.content}
                      </p>

                      {/* Optional Code Snippet Context */}
                      {msg.codeSnippet && (
                        <div className="rounded-xl overflow-hidden border border-emerald-950 bg-[#060b09] p-3 text-xs font-mono text-emerald-300/90 overflow-x-auto">
                          <pre>{msg.codeSnippet}</pre>
                        </div>
                      )}

                      {/* Question Indicator Footer: e.g. QUESTION 1 OF 5 */}
                      {msg.questionNumber && (
                        <div className="pt-2 border-t border-emerald-950/60 flex items-center justify-between text-[11px] font-mono tracking-widest uppercase text-emerald-500 font-semibold">
                          <span>
                            Question {msg.questionNumber} of {msg.totalQuestions || 5}
                          </span>
                          <span className="text-neutral-500 font-normal lowercase tracking-normal text-[10px]">
                            {msg.timestamp}
                          </span>
                        </div>
                      )}

                      {/* Follow-up Note Callout */}
                      {msg.isFollowUp && (
                        <div className="mt-3 pt-3 border-t border-emerald-900/40 space-y-1">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                            <span>↳ FOLLOW-UP</span>
                          </div>
                          <p className="text-xs text-neutral-400 font-sans">
                            {msg.followUpNote ||
                              `Follow-up on question ${questionNumber}. Interviewers dig into one answer like this; it does not use up one of your five questions.`}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Candidate's Submitted Answer */
                  <div className="flex justify-end">
                    <div className="max-w-2xl bg-[#0f2420] border border-emerald-800/40 rounded-2xl p-4 sm:p-5 text-neutral-100 shadow-md space-y-2">
                      <p className="text-[14.5px] leading-relaxed text-neutral-100 font-normal whitespace-pre-wrap">
                        {msg.content}
                      </p>
                      {msg.codeSnippet && (
                        <div className="rounded-xl overflow-hidden border border-emerald-900/40 bg-[#071310] p-3 text-xs font-mono text-emerald-200 overflow-x-auto mt-2">
                          <pre>{msg.codeSnippet}</pre>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-[10px] font-mono text-emerald-400/60 pt-1">
                        <span>Answered in {msg.timeSpent || '01:12'}</span>
                        <span>{msg.timestamp}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Live Typing Indicator from Interviewer */}
            {isInterviewerTyping && (
              <div className="flex items-center gap-3 text-xs text-emerald-400/80 font-mono animate-pulse">
                <div className="w-7 h-7 rounded-full bg-emerald-900/60 border border-emerald-700/60 flex items-center justify-center font-bold text-xs">
                  R
                </div>
                <span>Rahul is formulating follow-up evaluation...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Optional Code Context Toggle */}
          {showCodeEditor && (
            <div className="px-4 sm:px-6 pt-2 pb-0">
              <div className="bg-[#0b1413] border border-emerald-900/50 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between text-xs text-emerald-300 font-mono">
                  <span className="flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5" />
                    Candidate Code Context (Optional TypeScript / Java snippet)
                  </span>
                  <button
                    onClick={() => setShowCodeEditor(false)}
                    className="text-neutral-400 hover:text-neutral-200 text-xs"
                  >
                    Close Code Context
                  </button>
                </div>
                <textarea
                  value={userCode}
                  onChange={(e) => setUserCode(e.target.value)}
                  placeholder="// Paste your Playwright / Selenium / REST Assured test code here..."
                  className="w-full bg-[#060b09] border border-emerald-950 rounded-lg p-2.5 text-xs font-mono text-emerald-200 focus:outline-none focus:border-emerald-700 min-h-[90px]"
                />
              </div>
            </div>
          )}

          {/* Sticky Bottom Input Dock matching AssertHired */}
          <div className="p-4 sm:p-5 border-t border-emerald-950/50 bg-[#080c10]/95 backdrop-blur">
            <div className="bg-[#0d1716] border border-emerald-900/50 hover:border-emerald-700/60 focus-within:border-emerald-500/80 rounded-2xl p-3.5 transition-all shadow-xl">
              <textarea
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your answer, or tap the mic to speak"
                rows={3}
                className="w-full bg-transparent resize-none border-0 focus:outline-none focus:ring-0 text-neutral-100 placeholder:text-neutral-500 text-sm md:text-base min-h-[60px] max-h-[200px]"
              />

              {/* Bottom controls inside dock */}
              <div className="flex items-center justify-between pt-2 border-t border-emerald-950/40 text-xs">
                {/* Left: Helper & per-answer running timer */}
                <div className="flex items-center gap-3 text-neutral-500 font-mono text-[11px]">
                  <span>shift+enter for new line</span>
                  <span className="text-emerald-400/90 font-medium">
                    this answer {formatTimer(answerSeconds)}
                  </span>
                </div>

                {/* Right: Hint, Mic, Code Toggle, and Send Button */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowHintModal(true)}
                    className="p-2 rounded-lg text-neutral-400 hover:text-amber-400 hover:bg-amber-950/30 transition-all cursor-pointer"
                    title="Get answer hint"
                  >
                    <Lightbulb className="w-4 h-4 text-amber-400" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowCodeEditor(!showCodeEditor)}
                    className={`p-2 rounded-lg transition-all cursor-pointer ${
                      showCodeEditor || userCode
                        ? 'text-emerald-400 bg-emerald-950/50 border border-emerald-800'
                        : 'text-neutral-400 hover:text-neutral-200'
                    }`}
                    title="Insert code snippet"
                  >
                    <Code2 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={toggleListening}
                    className={`p-2 rounded-lg transition-all relative cursor-pointer ${
                      isListening
                        ? 'text-rose-400 bg-rose-950/60 border border-rose-600 animate-pulse'
                        : 'text-neutral-400 hover:text-neutral-200'
                    }`}
                    title={isListening ? 'Stop recording voice' : 'Tap to speak via microphone'}
                  >
                    <Mic className="w-4 h-4" />
                    {isListening && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={submitAnswer}
                    disabled={(!userAnswer.trim() && !userCode.trim()) || loading}
                    className="w-8 h-8 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-neutral-800 disabled:opacity-40 text-black flex items-center justify-center font-bold transition-all shadow-md cursor-pointer disabled:cursor-not-allowed"
                    title="Send answer (Enter)"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================================
            RIGHT COLUMN: "LIVE COACH" SIDE PANEL (~28% width)
           ===================================================================== */}
        <div className="lg:col-span-4 xl:col-span-3 bg-[#091110] flex flex-col border-b lg:border-b-0 min-h-0">
          <div className="p-4 sm:p-5 space-y-4">
            {/* Live Coach Header with target icon and collapse */}
            <div className="flex items-center justify-between pb-3 border-b border-emerald-950/60">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-emerald-950 border border-emerald-500/60 flex items-center justify-center">
                  <Target className="w-3 h-3 text-emerald-400 animate-spin-slow" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                    LIVE COACH
                  </h3>
                  <p className="text-[11px] text-neutral-400 font-sans">type and I coach live</p>
                </div>
              </div>

              <button
                onClick={() => setLiveCoachCollapsed(!liveCoachCollapsed)}
                className="text-neutral-400 hover:text-neutral-200 p-1 rounded-md"
              >
                {liveCoachCollapsed ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronUp className="w-4 h-4" />
                )}
              </button>
            </div>

            {!liveCoachCollapsed && (
              <div className="space-y-4">
                {/* PREP Framework Pills matching AssertHired */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {(['PREP', 'Point', 'Reason', 'Example', 'Impact'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActivePrepTab(tab)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                        activePrepTab === tab
                          ? 'bg-emerald-500 text-black shadow-sm font-bold'
                          : 'bg-[#0f1d1a] text-neutral-400 border border-emerald-950 hover:text-emerald-300'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Live Coaching Tip Box */}
                <div className="bg-[#0b1816] border border-emerald-900/40 rounded-xl p-3.5 space-y-2 shadow-inner">
                  <div className="flex items-start gap-2">
                    <ArrowUpRight className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-emerald-100 font-medium leading-relaxed">
                      {coachingAdvice}
                    </p>
                  </div>
                </div>

                {/* "Coach my answer" Action Button */}
                <button
                  type="button"
                  onClick={handleCoachAnswer}
                  disabled={!userAnswer.trim() || isCoachingLoading}
                  className="w-full py-2.5 px-3 rounded-xl border border-emerald-800/60 bg-[#0e211e] hover:bg-[#122b27] disabled:opacity-40 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:cursor-not-allowed"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>
                    {isCoachingLoading ? 'Analyzing PREP structure...' : 'Coach my answer'}
                  </span>
                </button>

                {/* PREP Analysis Result Feedback */}
                {coachingResult && (
                  <div className="bg-[#0d1e1a] border border-emerald-800/40 rounded-xl p-3.5 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-emerald-300 font-bold">
                      <span>PREP Status: {coachingResult.prepStage}</span>
                    </div>
                    {coachingResult.suggestions && coachingResult.suggestions.length > 0 && (
                      <ul className="space-y-1 text-neutral-300 text-[11px] list-disc list-inside">
                        {coachingResult.suggestions.map((s, idx) => (
                          <li key={idx}>{s}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {/* Review & Model Answer Comparison Trigger */}
                <div className="pt-3 border-t border-emerald-950/60">
                  <button
                    type="button"
                    onClick={() => setShowReviewDrawer(true)}
                    className="w-full py-2 px-3 rounded-xl bg-[#0e1917] hover:bg-[#132421] border border-emerald-950 text-neutral-300 text-xs font-medium flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span>Interviewer Judgment &amp; Comparison</span>
                    <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* =========================================================================
          SCORECARD & EVALUATION OVERLAY (AssertHired Comprehensive Report)
         ========================================================================= */}
      {scorecard && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0b1413] border border-emerald-900/60 rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl text-neutral-100">
            <div className="flex items-center justify-between pb-4 border-b border-emerald-950">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-950 border border-emerald-600/80 flex items-center justify-center text-emerald-300">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-white">
                    Interview Scorecard &amp; Rubric
                  </h2>
                  <p className="text-xs text-emerald-400/80 font-mono">
                    {selectedTrack} • {experienceTier} ({difficulty})
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div className="text-3xl font-extrabold text-emerald-400 font-mono">
                  {scorecard.overallScore}%
                </div>
                <div className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold">
                  Overall Rating
                </div>
                {scorecard.hiringRecommendation && (
                  <span
                    className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      scorecard.hiringRecommendation === 'Strong Hire'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-600'
                        : scorecard.hiringRecommendation === 'Hire'
                          ? 'bg-teal-950 text-teal-300 border border-teal-700'
                          : scorecard.hiringRecommendation === 'Leaning Hire'
                            ? 'bg-amber-950 text-amber-300 border border-amber-700'
                            : 'bg-rose-950 text-rose-300 border border-rose-700'
                    }`}
                  >
                    {scorecard.hiringRecommendation}
                  </span>
                )}
              </div>
            </div>

            {/* Score Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-[#070e0d] border border-emerald-950 p-3.5 rounded-xl text-center">
                <div className="text-xl font-bold font-mono text-emerald-300">
                  {scorecard.technicalScore}%
                </div>
                <div className="text-[11px] text-neutral-400 font-medium">Technical Depth</div>
              </div>
              <div className="bg-[#070e0d] border border-emerald-950 p-3.5 rounded-xl text-center">
                <div className="text-xl font-bold font-mono text-emerald-300">
                  {scorecard.architectureScore}%
                </div>
                <div className="text-[11px] text-neutral-400 font-medium">
                  Architecture &amp; CI
                </div>
              </div>
              <div className="bg-[#070e0d] border border-emerald-950 p-3.5 rounded-xl text-center">
                <div className="text-xl font-bold font-mono text-emerald-300">
                  {scorecard.communicationScore}%
                </div>
                <div className="text-[11px] text-neutral-400 font-medium">Communication (PREP)</div>
              </div>
            </div>

            {/* Summary & Seniority Calibration */}
            <div className="bg-[#0e1c18] border border-emerald-900/40 p-4 rounded-2xl text-xs leading-relaxed text-neutral-200 space-y-2">
              <p>{scorecard.summary}</p>
              {scorecard.seniorityCalibration && (
                <div className="flex items-center gap-2 pt-2 border-t border-emerald-950/80 text-emerald-300 font-semibold text-[11px]">
                  <Compass className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Seniority Calibration: {scorecard.seniorityCalibration}</span>
                </div>
              )}
            </div>

            {/* Strengths & Improvements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-2">
                <h4 className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Key Strengths
                </h4>
                <ul className="space-y-1.5 list-disc list-inside text-neutral-300">
                  {scorecard.strengths.map((s, idx) => (
                    <li key={idx}>{s}</li>
                  ))}
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-amber-400 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" />
                  Areas for Improvement
                </h4>
                <ul className="space-y-1.5 list-disc list-inside text-neutral-300">
                  {scorecard.areasForImprovement.map((a, idx) => (
                    <li key={idx}>{a}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Targeted Action Items / Drills (Freemockinterview-inspired) */}
            {scorecard.actionableDrills && scorecard.actionableDrills.length > 0 && (
              <div className="bg-[#0b1816] border border-emerald-900/40 p-4 rounded-2xl text-xs space-y-2">
                <h4 className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <Target className="w-4 h-4" />
                  Actionable Drills (What to Tighten Before Real Interviews)
                </h4>
                <ul className="space-y-1.5 list-disc list-inside text-neutral-300">
                  {scorecard.actionableDrills.map((drill, idx) => (
                    <li key={idx}>{drill}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Next-Tier QA Learning Roadmap */}
            {scorecard.learningRoadmap && scorecard.learningRoadmap.length > 0 && (
              <div className="bg-[#081311] border border-emerald-950 p-4 rounded-2xl text-xs space-y-2">
                <h4 className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  Personalized QA Growth Roadmap
                </h4>
                <ul className="space-y-1 list-disc list-inside text-neutral-300 text-[11px]">
                  {scorecard.learningRoadmap.map((topic, idx) => (
                    <li key={idx}>{topic}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Question-by-Question Rubric Breakdown */}
            {scorecard.questionBreakdown && scorecard.questionBreakdown.length > 0 && (
              <div className="space-y-2 text-xs">
                <h4 className="font-bold text-neutral-300 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-emerald-400" />
                  Question-by-Question Rubric Breakdown
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {scorecard.questionBreakdown.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-[#070e0d] border border-emerald-950 p-2.5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div className="space-y-0.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-900/50 shrink-0">
                            Q{item.questionNumber}
                          </span>
                          <span className="text-neutral-200 font-semibold truncate text-[11px]">
                            {item.question}
                          </span>
                        </div>
                        {item.keyGap && (
                          <p className="text-[10px] text-neutral-400 truncate">
                            Gap: {item.keyGap}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.verdict === 'Correct'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : item.verdict === 'Partially Correct'
                                ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                : 'bg-rose-950 text-rose-300 border border-rose-800'
                          }`}
                        >
                          {item.verdict}
                        </span>
                        <span className="font-mono font-bold text-xs text-emerald-300">
                          {item.score}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-emerald-950">
              <Link
                href="/dashboard"
                className="px-4 py-2 rounded-xl border border-neutral-800 text-neutral-300 hover:bg-neutral-800 text-xs font-semibold"
              >
                Return to Dashboard
              </Link>
              <button
                onClick={() => restartInterview()}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-black text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Start Another Round
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          INTERVIEWER JUDGMENT & SIDE-BY-SIDE COMPARISON MODAL / DRAWER
          (Preserves all tests for currentEvaluation, Verdict, and Proceed buttons)
         ========================================================================= */}
      {showReviewDrawer && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0b1413] border border-emerald-900/60 rounded-3xl max-w-4xl w-full p-6 sm:p-8 space-y-6 shadow-2xl text-neutral-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-emerald-950">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">
                  Interviewer Judgment &amp; Side-by-Side Comparison
                </h3>
              </div>
              <button
                onClick={() => setShowReviewDrawer(false)}
                className="text-neutral-400 hover:text-neutral-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Interviewer Judgment */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Interviewer Judgment
                </span>
                {currentEvaluation && (
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      currentEvaluation.verdict === 'Correct'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                        : currentEvaluation.verdict === 'Partially Correct'
                          ? 'bg-amber-950 text-amber-300 border border-amber-700'
                          : 'bg-rose-950 text-rose-300 border border-rose-700'
                    }`}
                  >
                    {currentEvaluation.verdict === 'Correct' && 'Verdict: Correct'}
                    {currentEvaluation.verdict === 'Partially Correct' &&
                      'Verdict: Partially Correct'}
                    {currentEvaluation.verdict === 'Incorrect' && 'Verdict: Incorrect'}
                  </span>
                )}
              </div>

              {currentEvaluation ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-[#08110f] border border-emerald-950 text-xs leading-relaxed text-neutral-200">
                    <p className="font-semibold text-emerald-400 mb-1">Feedback from Rahul:</p>
                    <p>{currentEvaluation.feedback}</p>
                  </div>

                  {/* What You Missed / Mistakes */}
                  <div className="p-4 rounded-xl bg-[#140b0b] border border-rose-950 text-xs space-y-2">
                    <p className="font-bold text-rose-400">What You Missed / Mistakes</p>
                    <ul className="list-disc list-inside space-y-1 text-neutral-300">
                      {currentEvaluation.mistakesAndGaps.map((m, idx) => (
                        <li key={idx}>{m}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Side-by-Side Comparison */}
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                      Side-by-Side Comparison
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-3.5 bg-[#081210] border border-emerald-950 rounded-xl space-y-2 text-xs">
                        <span className="font-bold text-neutral-400">Your Answer:</span>
                        <p className="text-neutral-200 whitespace-pre-wrap">
                          {currentEvaluation.candidateAnswer || '(No answer provided)'}
                        </p>
                      </div>
                      <div className="p-3.5 bg-[#0e1d1a] border border-emerald-900/60 rounded-xl space-y-2 text-xs">
                        <span className="font-bold text-emerald-400">Suggested Correct Answer</span>
                        <p className="text-emerald-100">{currentEvaluation.idealAnswer}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-neutral-400 italic">
                  Submit an answer in the chat room to view live judgment, score, and model answer
                  comparison.
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-emerald-950">
              <button
                onClick={() => setShowReviewDrawer(false)}
                className="px-4 py-2 rounded-xl border border-neutral-800 text-neutral-300 text-xs font-semibold"
              >
                Close
              </button>
              {currentEvaluation && (
                <button
                  onClick={() => {
                    handleProceedToNextQuestion();
                    setShowReviewDrawer(false);
                  }}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-black text-xs font-bold cursor-pointer"
                >
                  Proceed to Next Question
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TOPIC / TRACK SELECTION MODAL
         ========================================================================= */}
      {showTrackModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b1413] border border-emerald-900/60 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl text-neutral-100">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-950">
              <h3 className="text-sm font-bold text-emerald-300">Select QA Interview Track</h3>
              <button
                onClick={() => setShowTrackModal(false)}
                className="text-neutral-400 hover:text-neutral-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2">
              {[
                {
                  track: 'Test Automation',
                  desc: 'Playwright & TypeScript, locator strategies, auto-waiting',
                },
                {
                  track: 'Selenium & Java',
                  desc: 'Selenium 4, Page Object Model, grid, explicit waits',
                },
                {
                  track: 'API Testing & RestAssured',
                  desc: 'REST endpoints, payload schema assertions, contract tests',
                },
                {
                  track: 'SDET Architecture & CI/CD',
                  desc: 'Matrix sharding, flakiness prevention, ephemeral containers',
                },
                {
                  track: 'Performance & Load Testing',
                  desc: 'k6, JMeter, distributed load, SLA latency gates',
                },
                {
                  track: 'Manual & Agile QA',
                  desc: 'Boundary value analysis, bug lifecycle, defect triage',
                },
              ].map((t) => (
                <button
                  key={t.track}
                  onClick={() => {
                    setSelectedTrack(t.track);
                    setShowTrackModal(false);
                    restartInterview();
                  }}
                  className={`w-full p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                    selectedTrack === t.track
                      ? 'border-emerald-500 bg-[#0e211e] text-emerald-200'
                      : 'border-emerald-950/60 bg-[#070e0d] hover:bg-[#0c1615] text-neutral-300'
                  }`}
                >
                  <div className="font-bold text-sm text-neutral-100">{t.track}</div>
                  <div className="text-[11px] text-neutral-400 mt-0.5">{t.desc}</div>
                </button>
              ))}
            </div>

            <div className="pt-2 border-t border-emerald-950">
              <button
                onClick={() => {
                  setShowTrackModal(false);
                  setShowSkillsModal(true);
                }}
                className="w-full p-2.5 rounded-xl border border-dashed border-emerald-800/80 bg-[#091513] hover:bg-[#0e211e] text-emerald-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                <span>
                  Or customize exact Tech Stack &amp; Skills ({selectedSkills.length} selected)
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SETTINGS & SENIORITY CONFIG MODAL
         ========================================================================= */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b1413] border border-emerald-900/60 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl text-neutral-100">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-950">
              <h3 className="text-sm font-bold text-emerald-300">Interview Settings</h3>
              <button
                onClick={() => setShowConfigModal(false)}
                className="text-neutral-400 hover:text-neutral-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Experience Level Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                Select Experience Level
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {(['0-2 Years', '3-5 Years', '6-9 Years', '10+ Years'] as const).map((tier) => (
                  <button
                    key={tier}
                    onClick={() => handleTierSelect(tier)}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                      experienceTier === tier
                        ? 'border-emerald-500 bg-[#0e211e] text-emerald-200 font-bold'
                        : 'border-emerald-950/60 bg-[#070e0d] text-neutral-300'
                    }`}
                  >
                    <div>
                      {tier === '0-2 Years'
                        ? 'Entry Level'
                        : tier === '3-5 Years'
                          ? 'Mid Level'
                          : tier === '6-9 Years'
                            ? 'Senior'
                            : 'Architect'}
                    </div>
                    <div className="text-[10px] text-neutral-400">{tier}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Tech Stack Skills Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                  Target Tech Stack ({selectedSkills.length} Skills)
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setShowConfigModal(false);
                    setShowSkillsModal(true);
                  }}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer"
                >
                  Edit Skills
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {selectedSkills.map((s) => (
                  <span
                    key={s}
                    className="px-2 py-0.5 rounded-md bg-[#0e211e] border border-emerald-900/80 text-emerald-300 text-[11px] font-mono"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Difficulty Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                Select Difficulty Level
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {(['Easy', 'Medium', 'Hard'] as const).map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setDifficulty(diff)}
                    className={`p-2.5 rounded-xl border text-center cursor-pointer transition-all ${
                      difficulty === diff
                        ? 'border-emerald-500 bg-[#0e211e] text-emerald-200 font-bold'
                        : 'border-emerald-950/60 bg-[#070e0d] text-neutral-300'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            {/* Format Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                Format
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => setInterviewMode('chat')}
                  className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                    interviewMode === 'chat'
                      ? 'border-emerald-500 bg-[#0e211e] text-emerald-200 font-bold'
                      : 'border-emerald-950/60 bg-[#070e0d] text-neutral-300'
                  }`}
                >
                  <div className="font-bold">Chat &amp; Code Mode</div>
                  <div className="text-[10px] text-neutral-400">Written answers</div>
                </button>
                <button
                  onClick={() => setInterviewMode('audio')}
                  className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                    interviewMode === 'audio'
                      ? 'border-emerald-500 bg-[#0e211e] text-emerald-200 font-bold'
                      : 'border-emerald-950/60 bg-[#070e0d] text-neutral-300'
                  }`}
                >
                  <div className="font-bold">Audio &amp; Voice Mock Mode</div>
                  <div className="text-[10px] text-neutral-400">Spoken audio answers</div>
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setShowConfigModal(false);
                  restartInterview();
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-black text-xs font-bold cursor-pointer"
              >
                Apply &amp; Restart Round
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TECH STACK & SKILLS MULTI-SELECT MODAL
         ========================================================================= */}
      {showSkillsModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b1413] border border-emerald-900/60 rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl text-neutral-100 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-950">
              <div>
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-base font-bold text-emerald-300">
                    Select Your Tech Stack &amp; Skills
                  </h3>
                </div>
                <p className="text-xs text-neutral-400 mt-1">
                  The AI Interviewer Agent dynamically calibrates questions strictly to the tools
                  and skills you select.
                </p>
              </div>
              <button
                onClick={() => setShowSkillsModal(false)}
                className="text-neutral-400 hover:text-neutral-200 p-1 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-5 pr-1">
              {/* Quick Presets */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                  Quick Role Presets
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SKILL_PRESETS.map((preset) => {
                    const isMatch =
                      preset.skills.length === selectedSkills.length &&
                      preset.skills.every((s) => selectedSkills.includes(s));
                    return (
                      <button
                        key={preset.name}
                        onClick={() => applyPreset(preset.skills)}
                        className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                          isMatch
                            ? 'border-emerald-500 bg-[#0e2420] text-emerald-200 ring-1 ring-emerald-500/50'
                            : 'border-emerald-950/60 bg-[#070e0d] hover:bg-[#0c1615] text-neutral-300'
                        }`}
                      >
                        <div className="font-bold text-xs text-neutral-200">{preset.name}</div>
                        <div className="text-[10px] text-neutral-400 mt-0.5 line-clamp-1">
                          {preset.desc}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Skills Multi-Select Grid Grouped by Category */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                    Choose Skills &amp; Frameworks ({selectedSkills.length} selected)
                  </label>
                  <span className="text-[11px] text-emerald-400/90 font-mono">
                    Toggle any skill
                  </span>
                </div>

                {(
                  [
                    'Automation Frameworks',
                    'API & Backend',
                    'Programming Languages',
                    'QA Strategy & Ops',
                  ] as const
                ).map((group) => {
                  const groupSkills = AVAILABLE_SKILLS.filter((s) => s.category === group);
                  return (
                    <div key={group} className="space-y-1.5">
                      <div className="text-[11px] font-semibold text-emerald-400/80 px-1">
                        {group}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {groupSkills.map((skill) => {
                          const isSelected = selectedSkills.includes(skill.id);
                          return (
                            <button
                              key={skill.id}
                              type="button"
                              onClick={() => toggleSkill(skill.id)}
                              className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer flex items-start gap-2.5 ${
                                isSelected
                                  ? 'border-emerald-500 bg-[#0e211e] text-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                                  : 'border-emerald-950/60 bg-[#070e0d] hover:bg-[#0c1615] text-neutral-400'
                              }`}
                            >
                              <div
                                className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center shrink-0 border ${
                                  isSelected
                                    ? 'bg-emerald-500 border-emerald-400 text-black'
                                    : 'border-neutral-700 bg-neutral-900/60'
                                }`}
                              >
                                {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div
                                  className={`font-semibold text-xs ${isSelected ? 'text-neutral-100' : 'text-neutral-300'}`}
                                >
                                  {skill.name}
                                </div>
                                <div className="text-[10px] text-neutral-400 mt-0.5 line-clamp-1">
                                  {skill.desc}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-emerald-950">
              <button
                onClick={() => applyPreset(['Playwright', 'TypeScript', 'REST Assured'])}
                className="text-xs text-neutral-400 hover:text-neutral-200 cursor-pointer"
              >
                Reset to Default
              </button>
              <button
                onClick={() => {
                  setShowSkillsModal(false);
                  restartInterview();
                }}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all shadow-lg hover:shadow-emerald-500/20 cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Apply &amp; Generate Questions ({selectedSkills.length} Skills)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          HINT POPUP MODAL
         ========================================================================= */}
      {showHintModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b1413] border border-emerald-900/60 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl text-neutral-100">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-950">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <Lightbulb className="w-4 h-4" />
                <span>Interviewer Hint</span>
              </div>
              <button
                onClick={() => setShowHintModal(false)}
                className="text-neutral-400 hover:text-neutral-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 rounded-xl bg-[#14120a] border border-amber-950 text-xs leading-relaxed text-amber-200">
              <p className="font-semibold mb-1">Key concepts Rahul is listening for:</p>
              <p>
                {expectedFocus ||
                  'Focus on user-facing accessible locators, Accessibility Tree vs HTML DOM, and resilience against UI refactoring.'}
              </p>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setShowHintModal(false)}
                className="px-4 py-1.5 rounded-xl bg-emerald-600 text-black text-xs font-bold"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gemini Key Modal */}
      <GeminiKeyModal
        isOpen={showKeyModal}
        onClose={() => setShowKeyModal(false)}
        onSaved={() => {
          syncState();
          setShowKeyModal(false);
        }}
      />
    </div>
  );
}
