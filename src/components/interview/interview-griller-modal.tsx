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
  XCircle,
  Copy,
} from 'lucide-react';
import { QADatabase, DEMO_USER } from '@/lib/qa-db';
import { getQuestionsByLevelAndDifficulty } from '@/lib/interview-questions-bank';
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

  // Answer Evaluation & Review states
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
            apiKey: geminiKey,
          }),
        });
        if (res.ok) {
          data = await res.json();
        }
      } catch (fetchErr) {
        console.warn('Network call to interview-grill failed, using local question bank:', fetchErr);
      }

      // Check if API returned a valid question
      if (data && data.question && Array.isArray(data.questionList) && data.questionList.length > 0) {
        setCurrentQuestion(data.question);
        setCurrentCategory(data.category || 'QA Engineering');
        setQuestionNumber(data.questionNumber || 1);
        setTotalQuestions(data.totalQuestions || 3);
        setExpectedFocus(data.expectedFocus || '');
        setCodeContext(data.codeContext || '');
        setQuestionList(data.questionList);
      } else {
        // High-resilience local sampling fallback: guarantees questions are NEVER blank
        const localQuestions = getQuestionsByLevelAndDifficulty({
          difficulty,
          experienceYears,
          experienceTier,
          count: 3,
        });

        const q1 = localQuestions[0] || {
          question: 'How do you design a resilient test automation architecture?',
          category: 'QA Engineering',
          expectedFocus: 'Page Object Models, synchronization, and CI/CD pipelines',
          codeSnippet: '',
        };

        setCurrentQuestion(q1.question);
        setCurrentCategory(q1.category || 'QA Engineering');
        setQuestionNumber(1);
        setTotalQuestions(Math.max(1, localQuestions.length));
        setExpectedFocus(q1.expectedFocus || (q1 as any).answerSummary || '');
        setCodeContext(q1.codeSnippet || '');
        setQuestionList(localQuestions.map((q, idx) => ({
          id: q.id || `q-${idx}`,
          category: q.category || 'QA Engineering',
          topic: q.topic || 'Technical Assessment',
          question: q.question,
          expectedFocus: q.expectedFocus || q.answerSummary || '',
          codeSnippet: q.codeSnippet || '',
          answerSummary: q.answerSummary || '',
          bestPractice: q.bestPractice || '',
          pitfallToAvoid: q.pitfallToAvoid || '',
        })));
      }

      setHasStarted(true);

      // Auto-speak in audio mode
      if (interviewMode === 'audio') {
        setTimeout(() => speakText(`Question 1: ${data?.question || 'Technical interview question'}`), 400);
      }
    } catch (err) {
      console.error('Failed to start interview:', err);
      // Emergency local question display even if catastrophic error occurs
      const emergencyQ = getQuestionsByLevelAndDifficulty({ difficulty, experienceTier, count: 3 });
      if (emergencyQ.length > 0) {
        setCurrentQuestion(emergencyQ[0].question);
        setCurrentCategory(emergencyQ[0].category || 'QA Engineering');
        setQuestionNumber(1);
        setTotalQuestions(3);
        setExpectedFocus(emergencyQ[0].expectedFocus || emergencyQ[0].answerSummary);
        setQuestionList(emergencyQ);
        setHasStarted(true);
      }
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
            currentAnswer: userAnswer,
            currentCode: userCode,
            questionList,
            apiKey: geminiKey,
          }),
        });
        if (res.ok) {
          data = await res.json();
        }
      } catch (fetchErr) {
        console.warn('Network call to interview-grill failed, using local evaluator:', fetchErr);
      }

      const currentQMeta = questionList[turns.length] || {
        question: currentQuestion,
        category: currentCategory,
        expectedFocus,
        answerSummary: expectedFocus || 'Core architectural and testing principles',
        codeSnippet: codeContext,
        bestPractice: 'Use event-driven assertions, explicit synchronization, and resilient locators',
        pitfallToAvoid: 'Hardcoded sleeps, brittle locators, and lack of thread safety',
      };

      const rawEval = data?.evaluation;
      const combined = (userAnswer + ' ' + userCode).toLowerCase();
      const normalized = combined.replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
      const totalWords = normalized.split(/\s+/).filter(Boolean).length;
      const hasSleep = /sleep|waitfortimeout/i.test(combined);

      const ignorancePhrases = [
        'i do not know', 'i dont know', 'i don t know', 'do not know', 'dont know',
        'idk', 'no idea', 'have no idea', 'no clue', 'not sure', 'i am not sure',
        'skip', 'pass', 'next', 'no answer', 'none', 'nothing', 'na', 'n a',
      ];
      const isIgnorance = totalWords <= 10 && ignorancePhrases.some(p =>
        normalized === p || normalized.startsWith(p + ' ') || normalized.endsWith(' ' + p) || normalized.includes(' ' + p + ' ')
      );

      const fallbackVerdict: 'Correct' | 'Partially Correct' | 'Incorrect' =
        isIgnorance || !userAnswer.trim()
          ? 'Incorrect'
          : hasSleep
          ? 'Incorrect'
          : totalWords < 15
          ? 'Incorrect'
          : totalWords > 40
          ? 'Correct'
          : 'Partially Correct';

      const fallbackScore = isIgnorance || !userAnswer.trim()
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
        feedback: rawEval?.feedback || (
          isIgnorance
            ? 'Candidate stated they do not know the answer / provided zero technical solution for this question. In an SDET or Test Architect interview, this receives a score of 0. Review the suggested model answer below to prepare.'
            : data?.feedbackOnPrevious || 'Technical assessment evaluated.'
        ),
        mistakesAndGaps: Array.isArray(rawEval?.mistakesAndGaps) && rawEval.mistakesAndGaps.length > 0
          ? rawEval.mistakesAndGaps
          : isIgnorance
          ? [
              'Candidate stated they do not know the answer / no technical solution was submitted',
              `Zero coverage of required architecture: ${currentQMeta.expectedFocus || currentQuestion}`,
            ]
          : hasSleep
          ? ['Hardcoded sleep delays introduce non-deterministic execution in CI pipelines']
          : ['Ensure full coverage of edge cases, failure recovery, and parallel execution race conditions'],
        whatUserMissed: rawEval?.whatUserMissed || (currentQMeta.answerSummary || currentQMeta.expectedFocus || 'Core architectural concepts and implementation.'),
        probingQuestion: rawEval?.probingQuestion || data?.probingQuestion || '',
        idealAnswer: rawEval?.idealAnswer || currentQMeta.answerSummary || expectedFocus || 'Standard test engineering best practices.',
        referenceCode: rawEval?.referenceCode || currentQMeta.codeSnippet || codeContext || '',
        bestPractice: rawEval?.bestPractice || currentQMeta.bestPractice || 'Use event-driven assertions and resilient user-facing locators.',
        pitfallToAvoid: rawEval?.pitfallToAvoid || currentQMeta.pitfallToAvoid || 'Hardcoded sleep delays and brittle absolute locators.',
        candidateAnswer: userAnswer,
        candidateCode: userCode,
        question: currentQuestion,
        category: currentCategory,
      };

      setCurrentEvaluation(evalData);
      setPendingNextQuestion(data?.nextQuestion || null);
      setPendingScorecard(data?.scorecard || null);

      if (interviewMode === 'audio') {
        const speechMsg = `Evaluation result: ${evalData.verdict}. Score: ${evalData.turnScore} out of 100. ${evalData.feedback}. ${evalData.mistakesAndGaps.length ? 'Identified gaps: ' + evalData.mistakesAndGaps.join('. ') : ''}`;
        setTimeout(() => speakText(speechMsg), 400);
      }
    } catch (err) {
      console.error('Failed to submit answer:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProceedToNextQuestion = async () => {
    stopSpeaking();
    if (!currentEvaluation) return;

    // Check guest policy before proceeding beyond Question 1
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

    const isFinalRound = (questionNumber || 1) >= (totalQuestions || 3) || !!pendingScorecard;

    if (isFinalRound) {
      const turnScores: number[] = updatedTurns.map((t: any) => {
        const match = t.feedback?.match(/\((\d+)%\)/);
        return match ? parseInt(match[1], 10) : (currentEvaluation.turnScore ?? 0);
      });
      const avgScore = Math.round(turnScores.reduce((acc, s) => acc + s, 0) / turnScores.length);
      const technicalScore = currentEvaluation.turnScore ?? 0;

      const finalScorecard = pendingScorecard || {
        overallScore: avgScore,
        technicalScore: technicalScore,
        architectureScore: Math.max(0, technicalScore - 5),
        communicationScore: technicalScore === 0 ? 15 : Math.min(98, technicalScore + 2),
        summary: `Candidate completed the ${difficulty.toUpperCase()} Technical Mock Interview (${experienceTier}). Overall performance demonstrated ${avgScore >= 80 ? 'strong' : avgScore >= 50 ? 'solid' : 'insufficient'} technical knowledge.`,
        strengths: [
          'Articulated root causes of test flakiness and avoided arbitrary sleep timers',
          'Demonstrated clear understanding of modular automation patterns and separation of concerns',
        ],
        areasForImprovement: [
          'Further optimize parallel CI sharding and ephemeral cloud browser container scaling',
        ],
      };

      setScorecard(finalScorecard);
      setCurrentEvaluation(null);

      // Persist completed interview session to database
      const userId = currentUser?.id || DEMO_USER.id;
      await QADatabase.saveInterviewSession(userId, {
        trackId: 'interview-griller',
        title: `Technical Mock Interview: ${experienceTier} (${difficulty})`,
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
        speakText(`Interview assessment complete! Your overall technical rating is ${finalScorecard.overallScore} percent.`);
      }
      return;
    }

    // Advance to next question
    if (pendingNextQuestion && pendingNextQuestion.question) {
      setCurrentQuestion(pendingNextQuestion.question);
      setCurrentCategory(pendingNextQuestion.category || 'QA Engineering');
      setQuestionNumber(pendingNextQuestion.questionNumber || (updatedTurns.length + 1));
      setExpectedFocus(pendingNextQuestion.expectedFocus || '');
      setCodeContext(pendingNextQuestion.codeContext || '');
      setProbingQuestion(currentEvaluation.probingQuestion || '');
    } else {
      // Local question fallback
      const nextIdx = updatedTurns.length;
      if (nextIdx < questionList.length) {
        const nextQ = questionList[nextIdx];
        setCurrentQuestion(nextQ.question);
        setCurrentCategory(nextQ.category || 'QA Engineering');
        setQuestionNumber(nextIdx + 1);
        setExpectedFocus(nextQ.expectedFocus || nextQ.answerSummary || '');
        setCodeContext(nextQ.codeSnippet || '');
        setProbingQuestion(currentEvaluation.probingQuestion || '');
      }
    }

    setUserAnswer('');
    setUserCode('');
    setCurrentEvaluation(null);
    setPendingNextQuestion(null);

    if (interviewMode === 'audio') {
      const nextQText = pendingNextQuestion?.question || questionList[updatedTurns.length]?.question;
      if (nextQText) {
        setTimeout(() => speakText(`Question ${(updatedTurns.length + 1)}: ${nextQText}`), 400);
      }
    }
  };

  const restartInterview = () => {
    stopSpeaking();
    if (isListening) toggleListening();
    setHasStarted(false);
    setScorecard(null);
    setCurrentEvaluation(null);
    setPendingNextQuestion(null);
    setPendingScorecard(null);
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
                  Question {questionNumber || 1} of {totalQuestions || 3}
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
              {currentQuestion || (questionList[0] ? questionList[0].question : 'How do you design a resilient test automation architecture?')}
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

          {/* Answer Evaluation & Comparison Card (Judge before advancing) */}
          {currentEvaluation ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm space-y-6">
              {/* Verdict & Score Banner */}
              <div
                className={`p-4 md:p-5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  currentEvaluation.verdict === 'Correct'
                    ? 'bg-emerald-50/70 border-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-800'
                    : currentEvaluation.verdict === 'Partially Correct'
                    ? 'bg-amber-50/70 border-amber-300 dark:bg-amber-950/40 dark:border-amber-800'
                    : 'bg-rose-50/70 border-rose-300 dark:bg-rose-950/40 dark:border-rose-800'
                }`}
              >
                <div className="flex items-start md:items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      currentEvaluation.verdict === 'Correct'
                        ? 'bg-emerald-600 text-white'
                        : currentEvaluation.verdict === 'Partially Correct'
                        ? 'bg-amber-600 text-white'
                        : 'bg-rose-600 text-white'
                    }`}
                  >
                    {currentEvaluation.verdict === 'Correct' ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : currentEvaluation.verdict === 'Partially Correct' ? (
                      <AlertCircle className="w-6 h-6" />
                    ) : (
                      <XCircle className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Interviewer Judgment
                    </div>
                    <div
                      className={`text-lg md:text-xl font-extrabold ${
                        currentEvaluation.verdict === 'Correct'
                          ? 'text-emerald-900 dark:text-emerald-200'
                          : currentEvaluation.verdict === 'Partially Correct'
                          ? 'text-amber-900 dark:text-amber-200'
                          : 'text-rose-900 dark:text-rose-200'
                      }`}
                    >
                      {currentEvaluation.verdict === 'Correct'
                        ? 'Verdict: Correct (Meets Senior SDET Standard)'
                        : currentEvaluation.verdict === 'Partially Correct'
                        ? 'Verdict: Partially Correct (Has Gaps)'
                        : 'Verdict: Incorrect / Critical Gaps Identified'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end md:self-auto">
                  <div className="text-right">
                    <div className="text-xs font-semibold text-slate-500">Turn Score</div>
                    <div
                      className={`text-2xl font-black ${
                        currentEvaluation.turnScore >= 80
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : currentEvaluation.turnScore >= 60
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {currentEvaluation.turnScore}
                      <span className="text-sm font-bold text-slate-400"> / 100</span>
                    </div>
                  </div>

                  {interviewMode === 'audio' && (
                    <button
                      type="button"
                      onClick={() =>
                        isSpeaking
                          ? stopSpeaking()
                          : speakText(
                              `Evaluation: ${currentEvaluation.verdict}. Score: ${currentEvaluation.turnScore} out of 100. ${currentEvaluation.feedback}. What you missed: ${currentEvaluation.mistakesAndGaps.join('. ')}`
                            )
                      }
                      className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      {isSpeaking ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4" />}
                      <span>{isSpeaking ? 'Stop' : 'Listen'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Technical Critique & Follow-up Probe */}
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                    Interviewer Critique
                  </div>
                  <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                    {currentEvaluation.feedback}
                  </p>
                </div>

                {currentEvaluation.probingQuestion && (
                  <div className="p-4 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 space-y-1 text-xs text-indigo-900 dark:text-indigo-200">
                    <div className="font-bold flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4 text-indigo-600" />
                      Interviewer Probing Question (Deep Dive):
                    </div>
                    <p className="leading-relaxed text-indigo-950 dark:text-indigo-100">
                      {currentEvaluation.probingQuestion}
                    </p>
                  </div>
                )}
              </div>

              {/* Mistakes & Gaps Identified */}
              {currentEvaluation.mistakesAndGaps && currentEvaluation.mistakesAndGaps.length > 0 && (
                <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    What You Missed / Mistakes &amp; Anti-Patterns Identified
                  </div>
                  <ul className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 space-y-1.5 list-disc list-inside">
                    {currentEvaluation.mistakesAndGaps.map((mistake, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {mistake}
                      </li>
                    ))}
                  </ul>
                  {currentEvaluation.whatUserMissed && (
                    <div className="text-xs text-amber-900 dark:text-amber-200 pt-1 font-medium">
                      <strong>Key missing element:</strong> {currentEvaluation.whatUserMissed}
                    </div>
                  )}
                </div>
              )}

              {/* Side-by-Side Comparison: Candidate Submission vs Suggested Correct Answer */}
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Side-by-Side Comparison
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Left Column: What User Answered */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5 pb-2 border-b border-slate-200 dark:border-slate-800">
                        <Terminal className="w-3.5 h-3.5 text-slate-500" />
                        Your Submitted Answer &amp; Code
                      </div>
                      <div className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                        {currentEvaluation.candidateAnswer || '(No text answer submitted)'}
                      </div>
                    </div>
                    {currentEvaluation.candidateCode && (
                      <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                        <div className="text-[11px] font-bold uppercase text-slate-500 mb-1">Your Code Snippet</div>
                        <pre className="p-3 bg-slate-900 text-emerald-300 rounded-lg text-xs font-mono overflow-x-auto max-h-48">
                          {currentEvaluation.candidateCode}
                        </pre>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Suggested Correct Answer & Reference Code */}
                  <div className="p-4 rounded-xl bg-indigo-50/40 dark:bg-slate-950 border border-indigo-200 dark:border-indigo-900/50 space-y-3 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 flex items-center justify-between pb-2 border-b border-indigo-200 dark:border-indigo-900/50">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                          Suggested Correct Answer &amp; Reference Code
                        </span>
                        {currentEvaluation.referenceCode && (
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(currentEvaluation.referenceCode || '');
                              setCopiedCode(true);
                              setTimeout(() => setCopiedCode(false), 2000);
                            }}
                            className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            {copiedCode ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                            {copiedCode ? 'Copied' : 'Copy Code'}
                          </button>
                        )}
                      </div>

                      <div className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed max-h-60 overflow-y-auto">
                        {currentEvaluation.idealAnswer}
                      </div>

                      {/* Best Practice & Pitfall to Avoid pills */}
                      <div className="space-y-1.5 pt-2">
                        {currentEvaluation.bestPractice && (
                          <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-[11px] text-emerald-900 dark:text-emerald-300">
                            <strong>Recommended Best Practice:</strong> {currentEvaluation.bestPractice}
                          </div>
                        )}
                        {currentEvaluation.pitfallToAvoid && (
                          <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/40 text-[11px] text-rose-900 dark:text-rose-300">
                            <strong>Pitfall to Avoid:</strong> {currentEvaluation.pitfallToAvoid}
                          </div>
                        )}
                      </div>
                    </div>

                    {currentEvaluation.referenceCode && (
                      <div className="mt-3 pt-2 border-t border-indigo-200 dark:border-indigo-900/50">
                        <div className="text-[11px] font-bold uppercase text-indigo-600 dark:text-indigo-400 mb-1">
                          Reference Implementation
                        </div>
                        <pre className="p-3 bg-slate-900 text-emerald-300 rounded-lg text-xs font-mono overflow-x-auto max-h-48">
                          {currentEvaluation.referenceCode}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Proceed to Next Question Button */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-slate-500">
                  Review your mistakes and the suggested model answer above, then proceed when ready.
                </div>
                <button
                  type="button"
                  onClick={handleProceedToNextQuestion}
                  className="w-full sm:w-auto py-3 px-8 bg-gradient-to-r from-rose-600 via-indigo-600 to-purple-600 hover:opacity-95 text-white font-bold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ml-auto"
                >
                  {(questionNumber || 1) >= (totalQuestions || 3) || !!pendingScorecard ? (
                    <>
                      <Award className="w-4 h-4" />
                      <span>Proceed to Final Scorecard</span>
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </>
                  ) : (
                    <>
                      <span>Proceed to Next Question (Question {(questionNumber || 1) + 1} of {totalQuestions || 3})</span>
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* Candidate Response Card */
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
                      <span>Submit Answer for Evaluation</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
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
