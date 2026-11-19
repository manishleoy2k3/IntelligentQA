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
  TrendingUp,
  Shield,
  Layers,
  Clock,
  Key,
  Lock,
  UserPlus,
  LogIn,
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
  Smartphone,
  GitBranch,
  Terminal,
  FileCheck,
} from 'lucide-react';
import { QADatabase, DEMO_USER } from '@/lib/qa-db';
import GeminiKeyModal from '@/components/auth/gemini-key-modal';

interface Scorecard {
  overallScore: number;
  technicalScore: number;
  architectureScore: number;
  communicationScore: number;
  summary: string;
  strengths: string[];
  areasForImprovement: string[];
}

export default function InterviewGriller() {
  // Config states: Difficulty & Experience Level (Topic selector REMOVED as requested)
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [experienceTier, setExperienceTier] = useState<'0-2 Years' | '3-5 Years' | '6-9 Years' | '10+ Years'>('3-5 Years');
  const [experienceYears, setExperienceYears] = useState<number>(4);
  const [interviewMode, setInterviewMode] = useState<'chat' | 'audio'>('chat');

  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const [currentQuestion, setCurrentQuestion] = useState<string>('');
  const [currentCategory, setCurrentCategory] = useState<string>('General');
  const [questionNumber, setQuestionNumber] = useState<number>(1);
  const [totalQuestions, setTotalQuestions] = useState<number>(3);
  const [expectedFocus, setExpectedFocus] = useState<string>('');
  const [codeContext, setCodeContext] = useState<string>('');
  const [questionList, setQuestionList] = useState<any[]>([]);

  const [userAnswer, setUserAnswer] = useState<string>('');
  const [userCode, setUserCode] = useState<string>('');

  const [turns, setTurns] = useState<{ question: string; answer: string; feedback?: string }[]>([]);
  const [probingQuestion, setProbingQuestion] = useState<string>('');
  const [scorecard, setScorecard] = useState<Scorecard | null>(null);
  const [guestLockedRound, setGuestLockedRound] = useState<boolean>(false);

  // Audio & Speech States
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [speechSupported, setSpeechSupported] = useState<boolean>(true);
  const recognitionRef = useRef<any>(null);

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

    // Check speech synthesis & recognition support
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

  // Audio Speech-to-Text Handler
  const toggleListening = () => {
    if (typeof window === 'undefined') return;
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not natively supported in your browser. You can type your answer in the box or switch to Chat Mode.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript.trim()) {
          setUserAnswer(prev => {
            const trimmed = prev.trim();
            return trimmed ? `${trimmed} ${transcript.trim()}` : transcript.trim();
          });
        }
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognition.start();
      recognitionRef.current = recognition;
    } catch (err) {
      console.error('Speech recognition error:', err);
      setIsListening(false);
    }
  };

  const handleTierSelect = (tier: '0-2 Years' | '3-5 Years' | '6-9 Years' | '10+ Years') => {
    setExperienceTier(tier);
    if (tier === '0-2 Years') setExperienceYears(1);
    else if (tier === '3-5 Years') setExperienceYears(4);
    else if (tier === '6-9 Years') setExperienceYears(7);
    else setExperienceYears(12);
  };

  const startInterview = async () => {
    if (currentUser && !geminiKey) {
      setShowKeyModal(true);
      return;
    }

    setLoading(true);
    setScorecard(null);
    setTurns([]);
    setGuestLockedRound(false);

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (geminiKey) {
        headers['x-gemini-api-key'] = geminiKey;
      }

      const res = await fetch('/api/ai/interview-grill', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action: 'start',
          difficulty,
          experienceYears,
          experienceLevel: experienceTier,
          interviewMode,
          apiKey: geminiKey,
        }),
      });
      const data = await res.json();
      setCurrentQuestion(data.question);
      setCurrentCategory(data.category || 'QA Engineering');
      setQuestionNumber(data.questionNumber);
      setTotalQuestions(data.totalQuestions);
      setExpectedFocus(data.expectedFocus || '');
      setCodeContext(data.codeContext || '');
      setQuestionList(data.questionList || []);
      setHasStarted(true);

      // Auto-speak in audio mode
      if (interviewMode === 'audio' && data.question) {
        setTimeout(() => speakText(`Question 1: ${data.question}`), 400);
      }
    } catch (err) {
      console.error('Failed to start interview:', err);
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!userAnswer.trim() && !userCode.trim()) return;

    if (currentUser && !geminiKey) {
      setShowKeyModal(true);
      return;
    }

    // Check guest access policy: Question 1 is free preview; subsequent questions require free signup
    if (!currentUser && turns.length >= 0) {
      setGuestLockedRound(true);
      return;
    }

    if (isListening) {
      toggleListening();
    }
    stopSpeaking();

    setLoading(true);

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (geminiKey) {
        headers['x-gemini-api-key'] = geminiKey;
      }

      const res = await fetch('/api/ai/interview-grill', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action: 'submit_answer',
          difficulty,
          experienceYears,
          experienceLevel: experienceTier,
          turns,
          currentAnswer: userAnswer,
          currentCode: userCode,
          questionList,
          apiKey: geminiKey,
        }),
      });

      const data = await res.json();

      if (data.isFinished && data.scorecard) {
        setScorecard(data.scorecard);
        // Persist completed interview session to database
        const userId = currentUser?.id || DEMO_USER.id;
        await QADatabase.saveInterviewSession(userId, {
          trackId: 'interview-griller',
          title: `Technical Mock Interview: ${experienceTier} (${difficulty})`,
          difficulty,
          experienceLevel: experienceTier,
          interviewMode,
          overallScore: data.scorecard.overallScore,
          technicalScore: data.scorecard.technicalScore,
          communicationScore: data.scorecard.communicationScore,
          architectureScore: data.scorecard.architectureScore,
          summaryFeedback: data.scorecard.summary,
          strengths: data.scorecard.strengths,
          areasForImprovement: data.scorecard.areasForImprovement,
          completedAt: new Date().toISOString(),
          messages: [],
        });

        if (interviewMode === 'audio') {
          speakText(`Interview assessment complete! Your overall technical rating is ${data.scorecard.overallScore} percent.`);
        }
      } else if (data.nextQuestion) {
        setTurns(prev => [
          ...prev,
          {
            question: currentQuestion,
            answer: userAnswer,
            feedback: data.feedbackOnPrevious,
          },
        ]);
        setProbingQuestion(data.probingQuestion || '');
        setCurrentQuestion(data.nextQuestion.question);
        setCurrentCategory(data.nextQuestion.category || 'QA Engineering');
        setQuestionNumber(data.nextQuestion.questionNumber);
        setExpectedFocus(data.nextQuestion.expectedFocus || '');
        setCodeContext(data.nextQuestion.codeContext || '');
        setUserAnswer('');
        setUserCode('');

        if (interviewMode === 'audio') {
          const speechMsg = data.probingQuestion
            ? `Follow up feedback: ${data.feedbackOnPrevious}. Follow up probe: ${data.probingQuestion}. Next Question: ${data.nextQuestion.question}`
            : `Next Question: ${data.nextQuestion.question}`;
          setTimeout(() => speakText(speechMsg), 400);
        }
      }
    } catch (err) {
      console.error('Failed to submit answer:', err);
    } finally {
      setLoading(false);
    }
  };

  const restartInterview = () => {
    stopSpeaking();
    if (isListening) toggleListening();
    setHasStarted(false);
    setScorecard(null);
    setTurns([]);
    setCurrentQuestion('');
    setUserAnswer('');
    setUserCode('');
    setProbingQuestion('');
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 mb-1.5">
            <Award className="w-3.5 h-3.5" />
            AI SDET &amp; Test Architect Mock Interviewer
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            QA Interview Griller
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-1">
            Simulate a high-stakes SDET &amp; Test Architect technical round in <strong>Audio &amp; Chat format</strong> with real-time probing across Manual QA, Framework Design, DSA, API, Mobile &amp; CI/CD.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {hasStarted && (
            <button
              onClick={restartInterview}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset Interview
            </button>
          )}
          {!hasStarted && (
            <span className="text-xs text-slate-500 font-medium px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800">
              Interactive 3-Round Assessment
            </span>
          )}
        </div>
      </div>

      {/* Guest Notice */}
      {!currentUser ? (
        <div className="p-3.5 bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 rounded-2xl flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2 text-sky-900 dark:text-sky-200">
            <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0" />
            <span>
              <strong>Free Interview Preview:</strong> Experience Question 1 for free. Sign up for a 100% free account to take all 3 technical questions and receive your scorecard.
            </span>
          </div>
          <Link
            href="/signup"
            className="py-1 px-3 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg text-xs transition-colors"
          >
            Sign Up Free
          </Link>
        </div>
      ) : !geminiKey && aiPref === 'opted_out' ? (
        <div className="p-3.5 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-2xl flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-200">
            <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>
              <strong>Core Automation Mode:</strong> You are currently practicing with our built-in knowledge base. When you&apos;re ready to get live AI interviewer probing, connect your free Google AI Studio key.
            </span>
          </div>
          <button
            onClick={() => setShowKeyModal(true)}
            className="py-1 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs transition-colors shrink-0 cursor-pointer"
          >
            Activate Free AI Features →
          </button>
        </div>
      ) : currentUser && !geminiKey ? (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-2xl flex items-center justify-between flex-wrap gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-amber-900 dark:text-amber-200">
            <Lock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>AI Interview Evaluation Disabled:</strong> Real-time SDET evaluation and probing are disabled until you configure your personal free Gemini key under <strong>AI Tools and Agents</strong> to prevent shared server quota burn.
            </span>
          </div>
          <button
            onClick={() => setShowKeyModal(true)}
            className="py-1.5 px-3.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs transition-colors shrink-0 cursor-pointer"
          >
            Configure Key →
          </button>
        </div>
      ) : null}

      {/* Pre-Interview Config */}
      {!hasStarted && (
        <div className="space-y-6">
          {/* Interview Format Selector (Audio vs Chat) */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-2">
              <Radio className="w-4 h-4 text-rose-500" />
              1. Select Interview Format
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setInterviewMode('chat')}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  interviewMode === 'chat'
                    ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 font-bold text-sm">
                    <MessageSquare className="w-4 h-4 text-indigo-600" />
                    Chat &amp; Code Mode
                  </div>
                  {interviewMode === 'chat' && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                </div>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  Interactive written interview. Type your answers and provide optional TypeScript / Java code snippets with syntax highlighting.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setInterviewMode('audio')}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  interviewMode === 'audio'
                    ? 'border-rose-600 bg-rose-50/60 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 font-bold text-sm">
                    <Mic className="w-4 h-4 text-rose-600" />
                    Audio &amp; Voice Mock Mode
                  </div>
                  {interviewMode === 'audio' && <CheckCircle2 className="w-4 h-4 text-rose-600" />}
                </div>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  Interactive spoken interview. The interviewer reads questions aloud, and you speak your answers via voice microphone input.
                </p>
              </button>
            </div>
          </div>

          {/* Difficulty & Experience Selectors (TOPIC REMOVED) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            {/* Difficulty Level: Easy, Medium, Hard */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-rose-500" />
                2. Select Difficulty Level
              </label>
              <div className="space-y-2">
                {[
                  {
                    id: 'Easy' as const,
                    label: 'Easy',
                    desc: 'Core fundamentals, standard assertions, locator strategies, basic defect lifecycle',
                    badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
                  },
                  {
                    id: 'Medium' as const,
                    label: 'Medium',
                    desc: 'Page Object Models, API mocking, synchronization, BDD, parallel test execution',
                    badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
                  },
                  {
                    id: 'Hard' as const,
                    label: 'Hard',
                    desc: 'CI/CD sharding, Docker grids, contract testing (Pact), mobile gestures, chaos engineering',
                    badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
                  },
                ].map(d => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setDifficulty(d.id)}
                    className={`w-full p-3 rounded-xl border text-left text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                      difficulty === d.id
                        ? 'border-rose-600 bg-rose-50/50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${d.badgeColor}`}>
                          {d.label}
                        </span>
                      </div>
                      {difficulty === d.id && <CheckCircle2 className="w-4 h-4 text-rose-600" />}
                    </div>
                    <div className="text-[11px] font-normal text-slate-500 mt-1">{d.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Experience Level in Years */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-500" />
                  3. Select Experience Level
                </span>
                <span className="text-xs text-indigo-600 dark:text-indigo-400 font-bold">
                  {experienceYears} {experienceYears === 1 ? 'Year' : 'Years'} Exp.
                </span>
              </label>

              <div className="space-y-2">
                {[
                  {
                    tier: '0-2 Years' as const,
                    role: 'Junior SDET / QA Engineer',
                    years: '0 - 2 Years',
                    desc: 'Focus on manual testing basics, test design techniques, simple script authoring, and locators',
                  },
                  {
                    tier: '3-5 Years' as const,
                    role: 'Mid-Level SDET',
                    years: '3 - 5 Years',
                    desc: 'Focus on POM frameworks, REST Assured, Postman scripts, and test data management',
                  },
                  {
                    tier: '6-9 Years' as const,
                    role: 'Senior SDET / QA Lead',
                    years: '6 - 9 Years',
                    desc: 'Focus on CI/CD pipelines, parallel test sharding, Appium mobile gestures, and flakiness reduction',
                  },
                  {
                    tier: '10+ Years' as const,
                    role: 'Principal SDET / Test Architect',
                    years: '10+ Years',
                    desc: 'Focus on enterprise quality engineering, contract testing, Kubernetes grids, and shift-right observability',
                  },
                ].map(item => (
                  <button
                    key={item.tier}
                    type="button"
                    onClick={() => handleTierSelect(item.tier)}
                    className={`w-full p-3 rounded-xl border text-left text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                      experienceTier === item.tier
                        ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{item.role}</span>
                        <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {item.years}
                        </span>
                      </div>
                      {experienceTier === item.tier && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                    </div>
                    <div className="text-[11px] font-normal text-slate-500 mt-0.5">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Knowledge Base Scope Callout */}
            <div className="md:col-span-2 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400">
              <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Comprehensive SDET &amp; Test Architect Knowledge Base
              </div>
              <p>
                The AI Agent dynamically samples questions based on your selected <strong>{difficulty}</strong> difficulty and <strong>{experienceTier}</strong> experience, touching across:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 font-medium text-[11px] text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-1">✓ Manual QA Processes</span>
                <span className="flex items-center gap-1">✓ Coding &amp; DSA</span>
                <span className="flex items-center gap-1">✓ Selenium &amp; Playwright</span>
                <span className="flex items-center gap-1">✓ Reporting (Allure/Extent)</span>
                <span className="flex items-center gap-1">✓ CI/CD (Jenkins/GHA/Azure)</span>
                <span className="flex items-center gap-1">✓ Postman &amp; REST Assured</span>
                <span className="flex items-center gap-1">✓ Mobile Manual (Android/iOS)</span>
                <span className="flex items-center gap-1">✓ Appium Mobile Automation</span>
              </div>
            </div>

            {/* Middle Action Bar: Start Live Simulation directly below Topic and Difficulty selection */}
            <div className="md:col-span-2 pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                <span>Configured: </span>
                <strong className="text-rose-600 dark:text-rose-400 uppercase">{difficulty}</strong>
                <span> · </span>
                <strong className="text-indigo-600 dark:text-indigo-400">{experienceTier}</strong>
                <span> · </span>
                <strong className="text-slate-700 dark:text-slate-300 capitalize">
                  {interviewMode === 'audio' ? '🎙️ Audio Mock' : '💬 Chat Mock'}
                </strong>
              </div>

              <button
                type="button"
                onClick={startInterview}
                disabled={loading || (currentUser && !geminiKey)}
                className="w-full sm:w-auto py-3 px-8 bg-gradient-to-r from-rose-600 via-indigo-600 to-purple-600 hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm sm:text-base transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Preparing Interview Questions...</span>
                  </>
                ) : currentUser && !geminiKey ? (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Gemini Key Required (Disabled)</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Start Live Simulation ({interviewMode === 'audio' ? 'Audio Mock' : 'Chat Mock'})</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Interview Room */}
      {hasStarted && !scorecard && !guestLockedRound && (
        <div className="space-y-6">
          {/* Question Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between text-xs flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                  Question {questionNumber} of {totalQuestions}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[11px] font-semibold">
                  {currentCategory}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                  {difficulty.toUpperCase()} · {experienceTier}
                </span>
                {interviewMode === 'audio' && (
                  <button
                    type="button"
                    onClick={() => (isSpeaking ? stopSpeaking() : speakText(currentQuestion))}
                    className="p-1.5 rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors flex items-center gap-1 text-xs font-semibold cursor-pointer"
                    title={isSpeaking ? 'Stop Audio' : 'Listen to Question'}
                  >
                    {isSpeaking ? <VolumeX className="w-4 h-4 text-rose-500 animate-pulse" /> : <Volume2 className="w-4 h-4" />}
                    <span>{isSpeaking ? 'Stop Voice' : 'Listen'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Speaking animation banner in Audio Mode */}
            {interviewMode === 'audio' && isSpeaking && (
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2.5 animate-pulse">
                <Volume2 className="w-4 h-4" />
                <span>Interviewer is speaking question aloud...</span>
              </div>
            )}

            <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white leading-snug">
              {currentQuestion}
            </h3>

            {probingQuestion && (
              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 space-y-1">
                <div className="font-bold flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    Interviewer Follow-up Probe:
                  </div>
                  {interviewMode === 'audio' && (
                    <button
                      type="button"
                      onClick={() => speakText(`Follow-up probe: ${probingQuestion}`)}
                      className="text-[11px] text-amber-700 dark:text-amber-300 underline font-semibold cursor-pointer"
                    >
                      Listen Probe
                    </button>
                  )}
                </div>
                <p className="leading-relaxed">{probingQuestion}</p>
              </div>
            )}

            {codeContext && (
              <div className="p-3 bg-slate-950 text-slate-200 rounded-xl font-mono text-xs overflow-x-auto">
                <pre>{codeContext}</pre>
              </div>
            )}
          </div>

          {/* Candidate Response Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Your Answer &amp; Technical Explanation
              </label>

              {/* Audio Microphone Input Button */}
              {interviewMode === 'audio' && (
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
                    isListening
                      ? 'bg-rose-600 text-white animate-pulse'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200'
                  }`}
                >
                  {isListening ? (
                    <>
                      <MicOff className="w-3.5 h-3.5" />
                      <span>Recording Voice (Click to Stop)</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-3.5 h-3.5 text-rose-500" />
                      <span>Click Mic to Speak Answer</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {isListening && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 flex items-center gap-3 text-xs text-rose-700 dark:text-rose-300">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping shrink-0" />
                <span>
                  <strong>Listening to your voice...</strong> Speak clearly. Words will appear in the answer box below in real time.
                </span>
              </div>
            )}

            <textarea
              value={userAnswer}
              onChange={e => setUserAnswer(e.target.value)}
              rows={6}
              placeholder={
                interviewMode === 'audio'
                  ? 'Click "Click Mic to Speak Answer" above to speak, or type your answer here...'
                  : 'Explain your thought process, architecture, and handling of edge cases...'
              }
              className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:outline-none leading-relaxed"
            />

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-emerald-500" />
                Code Snippet / Implementation (Optional)
              </label>
              <textarea
                value={userCode}
                onChange={e => setUserCode(e.target.value)}
                rows={5}
                placeholder="// Optional: Write TypeScript, Java, or YAML code demonstrating your solution..."
                className="w-full p-3 font-mono text-xs bg-slate-950 text-emerald-300 border border-slate-800 rounded-xl focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between pt-2 flex-wrap gap-2">
              <div className="text-xs text-slate-500 max-w-lg">
                Expected focus: <span className="font-medium text-slate-700 dark:text-slate-300">{expectedFocus}</span>
              </div>
              <button
                type="button"
                disabled={loading || (!userAnswer.trim() && !userCode.trim()) || (currentUser && !geminiKey)}
                onClick={submitAnswer}
                className="py-2.5 px-6 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm transition-all flex items-center gap-2 shadow-md cursor-pointer ml-auto"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Evaluating Answer...</span>
                  </>
                ) : currentUser && !geminiKey ? (
                  <>
                    <Lock className="w-4 h-4" />
                    Gemini Key Required
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>{questionNumber === totalQuestions ? 'Submit & Generate Scorecard' : 'Submit & Next Question'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Guest Signup Gate for Round 2 */}
      {guestLockedRound && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 text-center space-y-5 shadow-xl max-w-xl mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Free Mock Preview Complete!
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              You submitted Question 1. To continue through Questions 2 &amp; 3, receive probing follow-ups, and generate your <strong>Official Technical Interview Scorecard</strong>, create a free account.
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              100% Free Forever · Zero Subscriptions
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <Link
              href="/signup"
              className="py-3 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition-all shadow-md flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              Sign Up Free to Continue
            </Link>
            <Link
              href="/login"
              className="py-3 px-5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold rounded-xl text-sm hover:bg-slate-200"
            >
              Log In
            </Link>
          </div>
        </div>
      )}

      {/* Final Comprehensive Scorecard */}
      {scorecard && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm space-y-6">
          <div className="text-center space-y-2 pb-6 border-b border-slate-200 dark:border-slate-800">
            <div className="inline-flex p-3 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <Award className="w-8 h-8" />
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">
              Official Technical Interview Scorecard
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm max-w-lg mx-auto">
              Evaluation complete for <strong>{experienceTier}</strong> candidate (<strong>{difficulty}</strong> Difficulty). Assessment saved to profile.
            </p>
          </div>

          {/* Scores Overview Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {scorecard.overallScore}%
              </div>
              <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-1">Overall Grade</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <div className="text-3xl font-extrabold text-sky-600 dark:text-sky-400">
                {scorecard.technicalScore}%
              </div>
              <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-1">Technical Depth</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
                {scorecard.architectureScore}%
              </div>
              <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-1">Architecture &amp; Scaling</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <div className="text-3xl font-extrabold text-purple-600 dark:text-purple-400">
                {scorecard.communicationScore}%
              </div>
              <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-1">Communication</div>
            </div>
          </div>

          {/* Summary Feedback */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Executive Evaluation Summary
            </h4>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {scorecard.summary}
            </p>
          </div>

          {/* Strengths & Improvement Areas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Key Demonstrated Strengths
              </h4>
              <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1.5 list-disc list-inside">
                {scorecard.strengths?.map((s, idx) => (
                  <li key={idx}>{s}</li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                Areas for Technical Growth
              </h4>
              <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1.5 list-disc list-inside">
                {scorecard.areasForImprovement?.map((a, idx) => (
                  <li key={idx}>{a}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={restartInterview}
              className="py-3 px-8 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-sm transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              Start New Mock Interview
            </button>
            <Link
              href="/profile"
              className="py-3 px-6 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl text-sm transition-colors"
            >
              View Interview History in Profile
            </Link>
          </div>
        </div>
      )}

      {/* Gemini Key Modal for setting API key */}
      <GeminiKeyModal
        isOpen={showKeyModal}
        onClose={() => setShowKeyModal(false)}
        onSaved={syncState}
      />
    </div>
  );
}
