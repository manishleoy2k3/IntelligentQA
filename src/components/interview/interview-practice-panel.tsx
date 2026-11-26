'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  RotateCcw,
  BookOpen,
  Award,
  Send,
  HelpCircle,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { InterviewQuestionItem } from '@/types/qa';
import { InterviewPracticeEvaluation } from '@/lib/rag/types';

interface InterviewPracticePanelProps {
  questions: InterviewQuestionItem[];
  onExitPractice?: () => void;
}

export default function InterviewPracticePanel({
  questions,
  onExitPractice,
}: InterviewPracticePanelProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evaluation, setEvaluation] = useState<InterviewPracticeEvaluation | null>(null);
  const [evalError, setEvalError] = useState<string | null>(null);

  const currentQ = questions[currentIndex] || questions[0];

  const handleSubmitAnswer = async () => {
    if (!userAnswer.trim() || isSubmitting || !currentQ) return;
    setIsSubmitting(true);
    setEvalError(null);

    try {
      const res = await fetch('/api/ai/rag/practice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: currentQ.id,
          userAnswer: userAnswer.trim(),
        }),
      });

      if (!res.ok) {
        throw new Error(`Evaluation failed with status ${res.status}`);
      }

      const data: InterviewPracticeEvaluation = await res.json();
      setEvaluation(data);
    } catch (err: any) {
      console.error('Practice evaluation error:', err);
      setEvalError(err?.message || 'Failed to evaluate answer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextQuestion = () => {
    setEvaluation(null);
    setUserAnswer('');
    setEvalError(null);
    setCurrentIndex((prev) => (prev + 1) % questions.length);
  };

  if (!currentQ) {
    return (
      <div className="p-8 text-center text-neutral-400">
        No questions available in selected filter.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Practice Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">Interview Practice Mode</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/30 text-purple-200">
                Question {currentIndex + 1} of {questions.length}
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              Type your answer to receive an AI assessment grounded in Academy standards.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onExitPractice && (
            <button
              onClick={onExitPractice}
              className="text-xs px-3 py-1.5 rounded-lg border border-neutral-700 hover:border-neutral-500 text-neutral-300 hover:text-white transition"
            >
              Back to Learn Mode
            </button>
          )}
          <button
            onClick={handleNextQuestion}
            className="text-xs px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white transition flex items-center gap-1"
          >
            <span>Skip / Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Active Question Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#141415] border border-[#262626] space-y-4">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="px-2.5 py-0.5 rounded-full font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            {currentQ.technology}
          </span>
          <span className="px-2.5 py-0.5 rounded-full font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {currentQ.difficulty}
          </span>
          <span className="text-neutral-400 font-mono">Topic: {currentQ.topic}</span>
        </div>

        <h2 className="text-lg sm:text-xl font-bold text-white leading-snug">
          {currentQ.question}
        </h2>

        {currentQ.expectedFocus && (
          <p className="text-xs text-neutral-400 italic">
            Interview Focus: {currentQ.expectedFocus}
          </p>
        )}

        {/* Answer Textarea */}
        <div className="space-y-2 pt-2">
          <label className="text-xs font-semibold text-neutral-300 block">
            Your Spoken or Written Technical Answer:
          </label>
          <textarea
            rows={5}
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            disabled={Boolean(evaluation)}
            placeholder="Explain the architectural root cause, concrete framework methods, dynamic locators, and best practices..."
            className="w-full p-4 rounded-xl bg-[#0D0D0E] border border-[#2E2E32] focus:border-purple-500/60 text-sm text-white placeholder-neutral-500 outline-none resize-y"
          />
        </div>

        {/* Action Button */}
        {!evaluation && (
          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-neutral-500">
              Evaluated against verified Academy curriculum criteria
            </span>
            <button
              onClick={handleSubmitAnswer}
              disabled={!userAnswer.trim() || isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white text-xs font-bold transition flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Evaluating Answer...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Answer for Evaluation</span>
                </>
              )}
            </button>
          </div>
        )}

        {evalError && (
          <div className="p-3 rounded-lg bg-red-950/30 border border-red-500/40 text-red-300 text-xs">
            {evalError}
          </div>
        )}
      </div>

      {/* Evaluation Results Card */}
      {evaluation && (
        <div className="p-6 rounded-2xl bg-[#141415] border border-purple-500/40 shadow-2xl space-y-6 animate-in fade-in duration-200">
          {/* Score Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#262626]">
            <div>
              <div className="text-xs uppercase tracking-wider text-purple-400 font-bold mb-1">
                Evaluation Score
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-white">{evaluation.score}</span>
                <span className="text-sm text-neutral-400">/ 100</span>
              </div>
            </div>

            <div className="max-w-md text-xs text-neutral-400 bg-[#1D1D20] p-3 rounded-xl border border-[#2B2B30]">
              <span className="font-semibold text-neutral-300 block mb-0.5">
                Assessment Notice:
              </span>
              AI Practice Assessment score reflects concept alignment with Academy criteria and is
              intended as constructive preparation feedback, not an objective formal certification.
            </div>
          </div>

          {/* Feedback Prose */}
          <div className="p-4 rounded-xl bg-purple-950/10 border border-purple-500/20 text-sm text-neutral-200 leading-relaxed">
            <span className="font-bold text-purple-300 block mb-1">Mentor Feedback:</span>
            {evaluation.constructiveFeedback}
          </div>

          {/* Concepts Breakdown Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Correct Concepts */}
            <div className="p-4 rounded-xl bg-emerald-950/15 border border-emerald-500/30 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>Correct Concepts Addressed</span>
              </div>
              <ul className="text-xs text-neutral-300 space-y-1.5 list-disc pl-4">
                {evaluation.correctConcepts.map((cc, i) => (
                  <li key={i}>{cc}</li>
                ))}
              </ul>
            </div>

            {/* Missing or Omitted Concepts */}
            <div className="p-4 rounded-xl bg-amber-950/15 border border-amber-500/30 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                <AlertTriangle className="w-4 h-4" />
                <span>Key Concepts to Include</span>
              </div>
              <ul className="text-xs text-neutral-300 space-y-1.5 list-disc pl-4">
                {evaluation.missingConcepts.map((mc, i) => (
                  <li key={i}>{mc}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Pitfalls / Incorrect Statements if any */}
          {evaluation.incorrectStatements && evaluation.incorrectStatements.length > 0 && (
            <div className="p-4 rounded-xl bg-red-950/15 border border-red-500/30 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-red-400">
                <XCircle className="w-4 h-4" />
                <span>Statements to Avoid in Enterprise Interviews</span>
              </div>
              <ul className="text-xs text-neutral-300 space-y-1.5 list-disc pl-4">
                {evaluation.incorrectStatements.map((ic, i) => (
                  <li key={i}>{ic}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Suggested Improved Answer */}
          <div className="p-4 rounded-xl bg-[#1C1C20] border border-[#2B2B30] space-y-2">
            <span className="text-xs font-bold text-neutral-300 block">
              Suggested High-Fidelity Answer:
            </span>
            <div className="prose prose-invert prose-xs max-w-none text-xs text-neutral-300 whitespace-pre-line">
              {evaluation.improvedAnswer}
            </div>
          </div>

          {/* Related Lesson Link if available */}
          {evaluation.relatedLessonUrl && (
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/30">
              <div className="flex items-center gap-2 text-xs text-purple-300">
                <BookOpen className="w-4 h-4" />
                <span>Deepen this topic in the Academy curriculum</span>
              </div>
              <Link
                href={evaluation.relatedLessonUrl}
                target="_blank"
                className="text-xs font-semibold text-white hover:text-purple-300 flex items-center gap-1"
              >
                <span>Open Lesson</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          {/* Bottom Navigation */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={() => {
                setEvaluation(null);
                setUserAnswer('');
              }}
              className="text-xs px-4 py-2 rounded-lg border border-neutral-700 hover:border-neutral-500 text-neutral-300 hover:text-white transition flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry Question</span>
            </button>
            <button
              onClick={handleNextQuestion}
              className="text-xs px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold transition flex items-center gap-1.5"
            >
              <span>Next Question</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
