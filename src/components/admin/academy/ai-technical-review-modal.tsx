'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  HelpCircle,
  RefreshCw,
  Edit2,
  Layers,
  ShieldCheck,
  Code2,
  Compass,
  Zap,
} from 'lucide-react';
import { TechnicalReviewData, TechnicalRecommendation, LessonContextPackage } from '@/lib/ai/types';
import { QADatabase } from '@/lib/qa-db';

export interface AiTechnicalReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessonId: string;
  lessonTitle: string;
  courseTitle: string;
  moduleTitle: string;
  contentHtml: string;
  contextPackage: LessonContextPackage;
  onOpenVisualEditor?: () => void;
  initialReviewData?: TechnicalReviewData | null;
}

export default function AiTechnicalReviewModal({
  isOpen,
  onClose,
  lessonId,
  lessonTitle,
  courseTitle,
  moduleTitle,
  contentHtml,
  contextPackage,
  onOpenVisualEditor,
  initialReviewData = null,
}: AiTechnicalReviewModalProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [reviewData, setReviewData] = useState<TechnicalReviewData | null>(initialReviewData);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<
    'all' | 'Good' | 'Missing' | 'Improve' | 'Warning'
  >('all');

  const runReview = async () => {
    setLoading(true);
    setError(null);
    try {
      const activeKey =
        typeof window !== 'undefined'
          ? sessionStorage.getItem('intelligentqa_ai_session_key') || QADatabase.getUserGeminiKey()
          : '';
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (activeKey) {
        headers['x-gemini-api-key'] = activeKey;
      }

      const res = await fetch('/api/admin/learning/ai-enhance', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action: 'technical_review',
          apiKey: activeKey || undefined,
          prompt: `Perform an authoritative technical review and rubric evaluation of this QA automation lesson.
Audit according to our 3-Layer Quality Evaluation framework:
1. Technical completeness (core mechanics, concepts, lifecycle, curriculum fit)
2. Practical depth (production SDET enterprise depth vs superficial textbook theory)
3. Code quality & examples (executable Java and TypeScript test scripts)
4. Architectural diagrams (Mermaid models)
5. Failure scenarios & troubleshooting (real framework exceptions, root cause fixes)

Provide exact scores (0-100) and classify specific recommendations as "Good", "Missing", "Improve", or "Warning".`,
          context: {
            ...contextPackage,
            currentLesson: {
              ...contextPackage.currentLesson,
              contentHtml: contentHtml || contextPackage.currentLesson.contentHtml || '',
            },
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to complete AI technical review.');
      }

      if (data.data?.review) {
        setReviewData(data.data.review);
      } else {
        throw new Error('AI response did not contain structured review data.');
      }
    } catch (err: any) {
      setError(err.message || 'Error occurred while contacting AI review engine.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (!reviewData) {
        runReview();
      }
    } else {
      setError(null);
    }
  }, [isOpen, lessonId]);

  if (!isOpen) return null;

  const recommendations = reviewData?.recommendations || [];
  const filteredRecs =
    activeFilter === 'all'
      ? recommendations
      : recommendations.filter((r) => r.type === activeFilter);

  const counts = {
    all: recommendations.length,
    Good: recommendations.filter((r) => r.type === 'Good').length,
    Missing: recommendations.filter((r) => r.type === 'Missing').length,
    Improve: recommendations.filter((r) => r.type === 'Improve').length,
    Warning: recommendations.filter((r) => r.type === 'Warning').length,
  };

  const completeness = reviewData?.metrics?.completeness?.score ?? 0;
  const practicalDepth = reviewData?.metrics?.practicalDepth?.score ?? 0;
  const overall = reviewData?.overallScore ?? 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[#121215] border border-[#27272A] rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* =================================================================== */}
        {/* MODAL HEADER                                                        */}
        {/* =================================================================== */}
        <div className="bg-[#18181B] border-b border-[#27272A] px-6 py-4 flex items-center justify-between gap-4 shrink-0">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-purple-400" />
                <span>AI Technical Review</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                3-Layer Quality Evaluation
              </span>
              <span className="text-xs text-zinc-400 font-medium truncate">
                {courseTitle} › {moduleTitle}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white truncate">{lessonTitle}</h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={runReview}
              disabled={loading}
              className="p-2 rounded-xl bg-[#202025] hover:bg-[#2A2A30] text-zinc-300 hover:text-white border border-[#2E2E35] transition-colors disabled:opacity-50 cursor-pointer"
              title="Re-run AI Technical Review"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-purple-400' : ''}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* =================================================================== */}
        {/* MODAL BODY (SCROLLABLE)                                             */}
        {/* =================================================================== */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {error && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold">Audit Evaluation Failed</p>
                <p className="text-rose-200/80">{error}</p>
                <button
                  type="button"
                  onClick={runReview}
                  className="mt-2 px-3 py-1 bg-rose-500/20 hover:bg-rose-500/30 rounded-lg text-rose-300 text-xs font-semibold cursor-pointer"
                >
                  Retry Review
                </button>
              </div>
            </div>
          )}

          {loading && (
            <div className="py-14 text-center space-y-4">
              <div className="inline-flex p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20">
                <Sparkles className="w-8 h-8 text-purple-400 animate-spin" />
              </div>
              <div className="space-y-1.5">
                <h4 className="text-sm font-bold text-white">
                  Analyzing Technical Depth & Completeness...
                </h4>
                <p className="text-xs text-zinc-400 max-w-md mx-auto">
                  Auditing curriculum standards, architectural diagrams, Java/TypeScript code
                  coverage, and real-world failure handling.
                </p>
              </div>
            </div>
          )}

          {!loading && reviewData && (
            <>
              {/* 1. SCORING DASHBOARD: Defined Criteria, not arbitrary numbers */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Overall Score Card */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-[#1A1A22] to-[#121218] border border-[#272733] flex flex-col justify-between space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                      Overall Quality
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                        overall >= 80
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : overall >= 60
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      }`}
                    >
                      {reviewData.status}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-extrabold text-white tracking-tight">
                        {overall}
                      </span>
                      <span className="text-sm text-zinc-500 font-mono">/100</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1">
                      Composite score calculated across 5 QA evaluation criteria.
                    </p>
                  </div>
                  <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        overall >= 80
                          ? 'bg-emerald-500'
                          : overall >= 60
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                      }`}
                      style={{ width: `${overall}%` }}
                    />
                  </div>
                </div>

                {/* Technical Completeness Score Card */}
                <div className="p-5 rounded-2xl bg-[#16161C] border border-[#272733] flex flex-col justify-between space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-300">Technical completeness</span>
                    <Layers className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-cyan-400 tracking-tight">
                        {completeness}
                      </span>
                      <span className="text-xs text-zinc-500 font-mono">/100</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1">
                      Concept explanation, core mechanics, lifecycle, and scope.
                    </p>
                  </div>
                  <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-cyan-400 transition-all duration-500"
                      style={{ width: `${completeness}%` }}
                    />
                  </div>
                </div>

                {/* Practical Depth Score Card */}
                <div className="p-5 rounded-2xl bg-[#16161C] border border-[#272733] flex flex-col justify-between space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-300">Practical depth</span>
                    <Compass className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-purple-400 tracking-tight">
                        {practicalDepth}
                      </span>
                      <span className="text-xs text-zinc-500 font-mono">/100</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1">
                      Real-world SDET enterprise scenarios, edge cases, and rigor.
                    </p>
                  </div>
                  <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-400 transition-all duration-500"
                      style={{ width: `${practicalDepth}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Secondary Metrics Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-[#16161A] border border-[#232328]">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400 flex items-center gap-1.5">
                      <Code2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Code Quality & Examples</span>
                    </span>
                    <span className="font-mono font-bold text-white">
                      {reviewData.metrics.codeExamples?.score ?? 0}/100
                    </span>
                  </div>
                  <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all"
                      style={{ width: `${reviewData.metrics.codeExamples?.score ?? 0}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      <span>Architecture Diagrams</span>
                    </span>
                    <span className="font-mono font-bold text-white">
                      {reviewData.metrics.diagrams?.score ?? 0}/100
                    </span>
                  </div>
                  <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 transition-all"
                      style={{ width: `${reviewData.metrics.diagrams?.score ?? 0}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
                      <span>Failures & Troubleshooting</span>
                    </span>
                    <span className="font-mono font-bold text-white">
                      {reviewData.metrics.failureHandling?.score ?? 0}/100
                    </span>
                  </div>
                  <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-500 transition-all"
                      style={{ width: `${reviewData.metrics.failureHandling?.score ?? 0}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* 2. SPECIFIC RECOMMENDATIONS & AUDIT FINDINGS */}
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                    Specific Recommendations & Content Gaps ({counts.all})
                  </h3>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-1.5 bg-[#18181D] p-1 rounded-xl border border-[#272730] text-xs">
                    <button
                      type="button"
                      onClick={() => setActiveFilter('all')}
                      className={`px-2.5 py-1 rounded-lg font-semibold cursor-pointer transition-colors ${
                        activeFilter === 'all'
                          ? 'bg-zinc-700 text-white'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      All ({counts.all})
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveFilter('Good')}
                      className={`px-2.5 py-1 rounded-lg font-semibold cursor-pointer transition-colors ${
                        activeFilter === 'Good'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'text-zinc-400 hover:text-emerald-400'
                      }`}
                    >
                      Good ({counts.Good})
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveFilter('Missing')}
                      className={`px-2.5 py-1 rounded-lg font-semibold cursor-pointer transition-colors ${
                        activeFilter === 'Missing'
                          ? 'bg-rose-500/20 text-rose-300'
                          : 'text-zinc-400 hover:text-rose-400'
                      }`}
                    >
                      Missing ({counts.Missing})
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveFilter('Improve')}
                      className={`px-2.5 py-1 rounded-lg font-semibold cursor-pointer transition-colors ${
                        activeFilter === 'Improve'
                          ? 'bg-sky-500/20 text-sky-300'
                          : 'text-zinc-400 hover:text-sky-400'
                      }`}
                    >
                      Improve ({counts.Improve})
                    </button>
                    {counts.Warning > 0 && (
                      <button
                        type="button"
                        onClick={() => setActiveFilter('Warning')}
                        className={`px-2.5 py-1 rounded-lg font-semibold cursor-pointer transition-colors ${
                          activeFilter === 'Warning'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'text-zinc-400 hover:text-amber-400'
                        }`}
                      >
                        Warnings ({counts.Warning})
                      </button>
                    )}
                  </div>
                </div>

                {/* Recommendation Item List */}
                <div className="space-y-2.5">
                  {filteredRecs.map((rec, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                        rec.type === 'Good'
                          ? 'bg-emerald-950/10 border-emerald-500/20'
                          : rec.type === 'Missing'
                            ? 'bg-rose-950/10 border-rose-500/25'
                            : rec.type === 'Warning'
                              ? 'bg-amber-950/10 border-amber-500/25'
                              : 'bg-sky-950/10 border-sky-500/20'
                      }`}
                    >
                      {/* Tag Icon & Badge */}
                      <div className="shrink-0 pt-0.5">
                        {rec.type === 'Good' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Good</span>
                          </span>
                        )}
                        {rec.type === 'Missing' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold font-mono bg-rose-500/20 text-rose-300 border border-rose-500/40">
                            <X className="w-3 h-3" />
                            <span>Missing</span>
                          </span>
                        )}
                        {rec.type === 'Improve' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold font-mono bg-sky-500/20 text-sky-300 border border-sky-500/40">
                            <ArrowUpRight className="w-3 h-3" />
                            <span>Improve</span>
                          </span>
                        )}
                        {rec.type === 'Warning' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Warning</span>
                          </span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-white">{rec.title}</h4>
                          <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800/80 px-2 py-0.5 rounded">
                            {rec.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-300 leading-relaxed">{rec.detail}</p>
                        {rec.actionableStep && (
                          <p className="text-[11px] font-medium text-purple-300 pt-0.5 flex items-center gap-1">
                            <span className="font-bold text-purple-400">Action:</span>{' '}
                            {rec.actionableStep}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3-Layer Quality Assurance Explanation Callout */}
              <div className="p-4 rounded-2xl bg-[#16161B] border border-[#26262F] space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>How AI Quality is Guaranteed (3-Layer Architecture)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px]">
                  <div className="p-2.5 rounded-xl bg-[#0F0F12] border border-[#202026]">
                    <span className="font-bold text-zinc-200 block mb-0.5">
                      1. System Instructions
                    </span>
                    <span className="text-zinc-400">
                      Enforces role as Principal SDET Architect and strict technical standards.
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#0F0F12] border border-[#202026]">
                    <span className="font-bold text-zinc-200 block mb-0.5">2. Lesson Context</span>
                    <span className="text-zinc-400">
                      Feeds live course objectives, module hierarchy, and complete draft content.
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#0F0F12] border border-[#202026]">
                    <span className="font-bold text-zinc-200 block mb-0.5">
                      3. Quality Evaluation
                    </span>
                    <span className="text-zinc-400">
                      Calculates accuracy, practical depth, code examples, and failure coverage.
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* =================================================================== */}
        {/* MODAL FOOTER                                                        */}
        {/* =================================================================== */}
        <div className="bg-[#18181B] border-t border-[#27272A] px-6 py-4 flex items-center justify-between gap-3 shrink-0">
          <p className="text-[11px] text-zinc-400">
            Review completed before editing to pinpoint weak sections.
          </p>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              Close
            </button>
            {onOpenVisualEditor && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenVisualEditor();
                }}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-purple-600/20 transition-all cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Open in Visual Editor to Fix</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
