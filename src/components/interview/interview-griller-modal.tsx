'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  const [topic, setTopic] = useState<string>('framework-design');
  const [difficulty, setDifficulty] = useState<'junior-sdet' | 'mid-sdet' | 'senior-sdet' | 'architect'>('mid-sdet');
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const [currentQuestion, setCurrentQuestion] = useState<string>('');
  const [questionNumber, setQuestionNumber] = useState<number>(1);
  const [totalQuestions, setTotalQuestions] = useState<number>(3);
  const [expectedFocus, setExpectedFocus] = useState<string>('');
  const [codeContext, setCodeContext] = useState<string>('');

  const [userAnswer, setUserAnswer] = useState<string>('');
  const [userCode, setUserCode] = useState<string>('');

  const [turns, setTurns] = useState<{ question: string; answer: string; feedback?: string }[]>([]);
  const [probingQuestion, setProbingQuestion] = useState<string>('');
  const [scorecard, setScorecard] = useState<Scorecard | null>(null);
  const [guestLockedRound, setGuestLockedRound] = useState<boolean>(false);

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
    return () => {
      window.removeEventListener('intelligentqa_auth_changed', handleAuth);
      window.removeEventListener('intelligentqa_key_changed', handleKey);
      window.removeEventListener('intelligentqa_ai_pref_changed', handleAiPref);
    };
  }, [syncState]);

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
          topic,
          difficulty,
          apiKey: geminiKey,
        }),
      });
      const data = await res.json();
      setCurrentQuestion(data.question);
      setQuestionNumber(data.questionNumber);
      setTotalQuestions(data.totalQuestions);
      setExpectedFocus(data.expectedFocus || '');
      setCodeContext(data.codeContext || '');
      setHasStarted(true);
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
      // If user answered question 1 and is a guest, lock and prompt signup
      setGuestLockedRound(true);
      return;
    }

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
          topic,
          difficulty,
          turns,
          currentAnswer: userAnswer,
          currentCode: userCode,
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
          title: `Technical Mock Interview: ${topic} (${difficulty})`,
          difficulty,
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
        setQuestionNumber(data.nextQuestion.questionNumber);
        setExpectedFocus(data.nextQuestion.expectedFocus || '');
        setUserAnswer('');
        setUserCode('');
      }
    } catch (err) {
      console.error('Failed to submit answer:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 mb-1.5">
            <Award className="w-3.5 h-3.5" />
            Simulated Technical Interview
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            AI SDET Interview Griller
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
            Simulate a high-stakes Lead SDET technical round with real-time follow-ups and comprehensive rubric scoring.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
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
              <strong>Core Automation Mode:</strong> You are currently learning core automation. When you&apos;re ready to get live AI interviewer probing on your answers and code, connect your free Google AI Studio key.
            </span>
          </div>
          <button
            onClick={() => setShowKeyModal(true)}
            className="py-1 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs transition-colors shrink-0"
          >
            Activate Free AI Features →
          </button>
        </div>
      ) : currentUser && !geminiKey ? (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-2xl flex items-center justify-between flex-wrap gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-amber-900 dark:text-amber-200">
            <Lock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>AI Interview Evaluation Disabled:</strong> Real-time SDET evaluation and probing are disabled until you configure your personal free Gemini key under <strong>AI Tools and Agents</strong> in the left navigation to prevent shared server quota burn.
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Select Target Interview Topic
            </label>
            <div className="space-y-2">
              {[
                { id: 'framework-design', label: 'Framework Architecture & Flakiness', icon: Layers },
                { id: 'playwright-advanced', label: 'Playwright Auto-Waiting & Tracing', icon: Sparkles },
                { id: 'java-oops', label: 'Java OOPs & Multithreaded WebDriver', icon: Shield },
                { id: 'api-automation', label: 'API Testing & POJO Validation', icon: Clock },
              ].map(t => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTopic(t.id)}
                    className={`w-full p-3 rounded-xl border text-left flex items-center justify-between text-xs sm:text-sm font-semibold transition-all ${
                      topic === t.id
                        ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 text-indigo-500" />
                      {t.label}
                    </div>
                    {topic === t.id && <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Target Seniority &amp; Difficulty
            </label>
            <div className="space-y-2">
              {[
                { id: 'junior-sdet', label: 'Junior SDET (0-2 Years)', desc: 'Core locators, basic assertions, simple scripts' },
                { id: 'mid-sdet', label: 'Mid-Level SDET (2-5 Years)', desc: 'Page Object Models, API mocking, synchronization' },
                { id: 'senior-sdet', label: 'Senior SDET (5-8 Years)', desc: 'CI/CD sharding, storageState, flakiness quarantine' },
                { id: 'architect', label: 'Test Architect (8+ Years)', desc: 'Enterprise distributed grids, testing GenAI/LLM apps' },
              ].map(d => (
                <button
                  key={d.id}
                  onClick={() => setDifficulty(d.id as any)}
                  className={`w-full p-3 rounded-xl border text-left text-xs sm:text-sm font-semibold transition-all ${
                    difficulty === d.id
                      ? 'border-rose-600 bg-rose-50/50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{d.label}</span>
                    {difficulty === d.id && <CheckCircle2 className="w-4 h-4 text-rose-600" />}
                  </div>
                  <div className="text-[11px] font-normal text-slate-500 mt-0.5">{d.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Middle Action Bar: Start Live Simulation directly below Topic and Difficulty selection */}
          <div className="md:col-span-2 pt-5 mt-2 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              <span>Ready to simulate: </span>
              <strong className="text-indigo-600 dark:text-indigo-400 capitalize">
                {topic.replace(/-/g, ' ')}
              </strong>
              <span> · </span>
              <strong className="text-rose-600 dark:text-rose-400 capitalize">
                {difficulty.replace(/-/g, ' ')}
              </strong>
            </div>

            <button
              onClick={startInterview}
              disabled={loading || (currentUser && !geminiKey)}
              className="w-full sm:w-auto py-3 px-8 bg-gradient-to-r from-rose-600 via-indigo-600 to-purple-600 hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm sm:text-base transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Launching Live Simulation...</span>
                </>
              ) : currentUser && !geminiKey ? (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Gemini Key Required (Disabled)</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Start Live Simulation</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Active Interview Room */}
      {hasStarted && !scorecard && !guestLockedRound && (
        <div className="space-y-6">
          {/* Question Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                Question {questionNumber} of {totalQuestions}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                {difficulty.toUpperCase()}
              </span>
            </div>

            <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white leading-snug">
              {currentQuestion}
            </h3>

            {probingQuestion && (
              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  Interviewer Follow-up Probe:
                </div>
                <p>{probingQuestion}</p>
              </div>
            )}

            {codeContext && (
              <div className="p-3 bg-slate-950 text-slate-200 rounded-xl font-mono text-xs overflow-x-auto">
                <pre>{codeContext}</pre>
              </div>
            )}
          </div>

          {/* Candidate Response Editor */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Your Answer &amp; Technical Explanation
              </label>
              <span className="text-xs text-slate-500">Explain your thought process clearly</span>
            </div>

            <textarea
              value={userAnswer}
              onChange={e => setUserAnswer(e.target.value)}
              rows={6}
              placeholder="Explain the architectural root cause and how you would solve it (e.g. why Thread.sleep causes CI flakiness and how to use FluentWait or auto-waiting)..."
              className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:outline-none leading-relaxed"
            />

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Code Snippet / Implementation (Optional)
              </label>
              <textarea
                value={userCode}
                onChange={e => setUserCode(e.target.value)}
                rows={5}
                placeholder="Write TypeScript or Java code demonstrating your solution..."
                className="w-full p-3 font-mono text-xs bg-slate-950 text-emerald-300 border border-slate-800 rounded-xl focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="text-xs text-slate-500">
                Expected focus: <span className="font-medium text-slate-700 dark:text-slate-300">{expectedFocus}</span>
              </div>
              <button
                disabled={loading || (!userAnswer.trim() && !userCode.trim()) || (currentUser && !geminiKey)}
                onClick={submitAnswer}
                className="py-2.5 px-6 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm transition-all flex items-center gap-2 shadow-md cursor-pointer"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : currentUser && !geminiKey ? (
                  <>
                    <Lock className="w-4 h-4" />
                    Gemini Key Required
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit &amp; Next
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
              Evaluation complete for {difficulty.toUpperCase()} candidate. Assessment saved to profile.
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
              <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-1">Architecture</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <div className="text-3xl font-extrabold text-purple-600 dark:text-purple-400">
                {scorecard.communicationScore}%
              </div>
              <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-1">Communication</div>
            </div>
          </div>

          {/* Detailed Rubric Analysis */}
          <div className="space-y-4 pt-2">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-1.5">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Lead Interviewer Evaluation Summary
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {scorecard.summary}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-2">
                <div className="font-bold text-xs uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Key Strengths Exhibited
                </div>
                <ul className="space-y-1 text-xs text-emerald-900 dark:text-emerald-200 list-disc pl-5">
                  {scorecard.strengths.map((str, i) => (
                    <li key={i}>{str}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-rose-50/60 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 space-y-2">
                <div className="font-bold text-xs uppercase tracking-wider text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4" />
                  Recommended Areas for Growth
                </div>
                <ul className="space-y-1 text-xs text-rose-900 dark:text-rose-200 list-disc pl-5">
                  {scorecard.areasForImprovement.map((area, i) => (
                    <li key={i}>{area}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between">
            <button
              onClick={() => {
                setHasStarted(false);
                setScorecard(null);
              }}
              className="py-2.5 px-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-xs hover:bg-slate-200 transition-colors"
            >
              Start New Simulation
            </button>
            <Link
              href="/dashboard"
              className="py-2.5 px-5 bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold rounded-xl text-xs hover:opacity-90 transition-opacity"
            >
              View in Dashboard →
            </Link>
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
        reason="Connect your personal free Google AI Studio key (15 RPM / 1,500 requests/day at zero cost) so the Interview Griller evaluates your answers using live Gemini AI without hitting shared limits."
      />
    </div>
  );
}
