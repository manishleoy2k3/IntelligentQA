'use client';

import React, { useState } from 'react';
import {
  BookOpen,
  Target,
  FileText,
  Workflow,
  Cpu,
  Terminal,
  Briefcase,
  AlertTriangle,
  Award,
  Scale,
  HelpCircle,
  BookmarkCheck,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Copy,
  Check,
  Code2,
  ArrowRight,
  ShieldAlert,
  Zap,
} from 'lucide-react';
import { StandardLessonTemplateData, CodeExampleItem } from '@/types/standard-lesson';
import DiagramViewer from './diagram-viewer';
import CodeBlock from './code-block';

interface StandardLessonRendererProps {
  data: StandardLessonTemplateData;
  className?: string;
}

export default function StandardLessonRenderer({ data, className = '' }: StandardLessonRendererProps) {
  // Collapsible Interview Questions
  const [openQuestions, setOpenQuestions] = useState<Record<number, boolean>>({ 0: true });
  // Collapsible Troubleshooting Items
  const [openProblems, setOpenProblems] = useState<Record<number, boolean>>({ 0: true });
  // Active Code Example Tab
  const [activeCodeIdx, setActiveCodeIdx] = useState(0);

  const toggleQuestion = (idx: number) => {
    setOpenQuestions((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const toggleProblem = (idx: number) => {
    setOpenProblems((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className={`space-y-10 my-6 text-slate-800 dark:text-neutral-200 ${className}`}>
      {/* 1. LESSON OVERVIEW */}
      {data.overview && (
        <section id="section-overview" className="rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/90 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-neutral-800">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Lesson Overview
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-neutral-800/60 border border-slate-200/80 dark:border-neutral-700/80 space-y-1.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400">
                What is this concept?
              </h4>
              <p className="text-xs text-slate-700 dark:text-neutral-300 leading-relaxed">
                {data.overview.whatIsIt}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-neutral-800/60 border border-slate-200/80 dark:border-neutral-700/80 space-y-1.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400">
                Why is it important?
              </h4>
              <p className="text-xs text-slate-700 dark:text-neutral-300 leading-relaxed">
                {data.overview.whyImportant}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/20 space-y-1.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Where is it used in testing?
              </h4>
              <p className="text-xs text-slate-700 dark:text-neutral-300 leading-relaxed">
                {data.overview.whereUsed}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* 2. LEARNING OBJECTIVES */}
      {data.learningObjectives && data.learningObjectives.length > 0 && (
        <section id="section-objectives" className="rounded-2xl border border-indigo-200/60 dark:border-indigo-900/40 bg-gradient-to-br from-indigo-50/40 via-white to-indigo-50/20 dark:from-indigo-950/20 dark:via-neutral-900 dark:to-indigo-950/10 p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Learning Objectives
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
            {data.learningObjectives.map((obj, i) => (
              <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-white dark:bg-neutral-800/80 border border-indigo-100 dark:border-indigo-900/40 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-slate-700 dark:text-neutral-200 leading-relaxed font-medium">
                  {obj}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. CONCEPT EXPLANATION */}
      {data.conceptExplanation && (
        <section id="section-concept" className="rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-neutral-800">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Concept Explanation &amp; Core Mechanics
              </h3>
            </div>
          </div>

          <div className="space-y-3 text-sm text-slate-700 dark:text-neutral-300 leading-relaxed">
            {data.conceptExplanation.theory.map((para, i) => (
              <p key={i} dangerouslySetInnerHTML={{ __html: para }} />
            ))}
          </div>

          {/* Terminology Grid */}
          {data.conceptExplanation.terminology && data.conceptExplanation.terminology.length > 0 && (
            <div className="pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400 mb-2.5">
                Key Terminology &amp; Definitions:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {data.conceptExplanation.terminology.map((t, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-neutral-800/70 border border-slate-200 dark:border-neutral-700 text-xs">
                    <span className="font-bold text-slate-900 dark:text-white block mb-1">
                      {t.term}
                    </span>
                    <span className="text-slate-600 dark:text-neutral-400 leading-normal">
                      {t.definition}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.conceptExplanation.practicalUnderstanding && (
            <div className="p-4 rounded-xl bg-sky-500/10 border border-sky-500/20 text-xs text-slate-700 dark:text-neutral-300 leading-relaxed">
              <strong className="text-sky-600 dark:text-sky-400 font-bold block mb-1">
                Practical Understanding:
              </strong>
              {data.conceptExplanation.practicalUnderstanding}
            </div>
          )}
        </section>
      )}

      {/* 4. ARCHITECTURE / TECHNICAL DIAGRAM */}
      {data.architectureDiagram && (
        <section id="section-diagram">
          <div className="mb-2 flex items-center gap-2">
            </div>
          <DiagramViewer config={data.architectureDiagram} />
        </section>
      )}

      {/* 5. HOW IT WORKS */}
      {data.howItWorks && (
        <section id="section-how-it-works" className="rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-neutral-800">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                How It Works: Step-by-Step Mechanism
              </h3>
            </div>
          </div>

          {data.howItWorks.internalMechanism && (
            <p className="text-sm text-slate-700 dark:text-neutral-300 leading-relaxed">
              {data.howItWorks.internalMechanism}
            </p>
          )}

          {/* Sequential Step Timeline */}
          {data.howItWorks.steps && data.howItWorks.steps.length > 0 && (
            <div className="space-y-3 pt-2">
              {data.howItWorks.steps.map((st) => (
                <div key={st.stepNumber} className="flex items-start gap-3.5 p-4 rounded-xl bg-slate-50 dark:bg-neutral-800/60 border border-slate-200 dark:border-neutral-700">
                  <span className="w-7 h-7 rounded-xl bg-amber-500 text-slate-950 font-bold font-mono text-xs flex items-center justify-center shrink-0 shadow-2xs">
                    {st.stepNumber}
                  </span>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {st.title}
                      </h4>
                      {st.component && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-200 dark:bg-neutral-700 text-slate-700 dark:text-neutral-300">
                          {st.component}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-neutral-400 leading-relaxed">
                      {st.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* 6. PRACTICAL IMPLEMENTATION */}
      {data.practicalImplementation && (
        <section id="section-implementation" className="rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-neutral-800">
            <div className="p-2 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Practical Step-by-Step Implementation
              </h3>
            </div>
          </div>

          {(data.practicalImplementation.overview || (data.practicalImplementation as any).description) && (
            <p className="text-sm text-slate-700 dark:text-neutral-300 leading-relaxed">
              {data.practicalImplementation.overview || (data.practicalImplementation as any).description}
            </p>
          )}

          {/* Prerequisites if present */}
          {Array.isArray((data.practicalImplementation as any).prerequisites) && (data.practicalImplementation as any).prerequisites.length > 0 && (
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-neutral-800/60 border border-slate-200 dark:border-neutral-700">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-neutral-300 mb-2">Prerequisites:</h5>
              <ul className="list-disc list-inside space-y-1 text-xs text-slate-600 dark:text-neutral-400">
                {(data.practicalImplementation as any).prerequisites.map((req: string, rIdx: number) => (
                  <li key={rIdx}>{req}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Steps: gracefully handles both string[] and step objects */}
          {Array.isArray(data.practicalImplementation.steps) && data.practicalImplementation.steps.length > 0 && (
            <div className="space-y-3">
              {data.practicalImplementation.steps.map((step: any, sIdx: number) => {
                const isObj = typeof step === 'object' && step !== null;
                const stepNum = isObj && step.stepNumber ? step.stepNumber : sIdx + 1;
                const action = isObj ? (step.action || step.title || '') : String(step);
                const details = isObj ? step.details : null;
                const snippet = isObj ? step.snippet : null;

                return (
                  <div key={sIdx} className="p-4 rounded-xl bg-slate-50 dark:bg-neutral-800/50 border border-slate-200 dark:border-neutral-700 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-violet-600 dark:text-violet-400">
                        Step {stepNum}:
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {action}
                      </h4>
                    </div>
                    {details && (
                      <p className="text-xs text-slate-600 dark:text-neutral-400 leading-relaxed">
                        {details}
                      </p>
                    )}
                    {snippet && (
                      <pre className="p-3 rounded-lg bg-[#161616] text-[#81FF89] text-xs font-mono overflow-x-auto border border-[#2D2D2D]">
                        <code>{snippet}</code>
                      </pre>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* 7. CODE EXAMPLES */}
      {data.codeExamples && data.codeExamples.length > 0 && (
        <section id="section-code" className="space-y-3">
          <div className="flex items-center gap-2">
            </div>

          {/* Multiple Language Tab Switcher */}
          {data.codeExamples.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {data.codeExamples.map((ex, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveCodeIdx(idx)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer shrink-0 ${
                    activeCodeIdx === idx
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xs'
                      : 'bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-400 hover:text-slate-900'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>{ex.title || ex.language.toUpperCase()}</span>
                </button>
              ))}
            </div>
          )}

          {data.codeExamples[activeCodeIdx] && (
            <CodeBlock
              language={data.codeExamples[activeCodeIdx].language}
              title={data.codeExamples[activeCodeIdx].title}
              filename={data.codeExamples[activeCodeIdx].filename}
              code={data.codeExamples[activeCodeIdx].code}
              explanation={data.codeExamples[activeCodeIdx].explanation}
              showLineNumbers={data.codeExamples[activeCodeIdx].lineNumbers ?? true}
            />
          )}
        </section>
      )}

      {/* 8. REAL-WORLD QA USE CASES */}
      {data.qaUseCases && data.qaUseCases.length > 0 && (
        <section id="section-use-cases" className="rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-neutral-800">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Real-World QA &amp; SDET Use Cases
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.qaUseCases.map((uc, i) => (
              <div key={i} className="p-4 rounded-xl bg-slate-50 dark:bg-neutral-800/60 border border-slate-200 dark:border-neutral-700 space-y-2">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {uc.title}
                </h4>
                <div className="text-xs space-y-1.5">
                  <p className="text-slate-600 dark:text-neutral-400">
                    <strong className="text-slate-800 dark:text-neutral-200">Scenario:</strong> {uc.scenario}
                  </p>
                  <p className="text-emerald-600 dark:text-emerald-400">
                    <strong className="text-emerald-700 dark:text-emerald-300">Enterprise Scale:</strong> {uc.enterpriseApplication}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 9. COMMON PROBLEMS & FAILURES */}
      {data.commonProblems && data.commonProblems.length > 0 && (
        <section id="section-troubleshooting" className="rounded-2xl border border-red-200/60 dark:border-red-950/40 bg-white dark:bg-neutral-900 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-red-100 dark:border-red-950/60">
            <div className="p-2 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Common Failures, Root Causes &amp; Fixes
              </h3>
            </div>
          </div>

          <div className="space-y-3">
            {data.commonProblems.map((prob: any, i) => {
              const isOpen = openProblems[i];
              const steps: string[] = Array.isArray(prob.troubleshooting)
                ? prob.troubleshooting
                : Array.isArray(prob.troubleshootingSteps)
                ? prob.troubleshootingSteps
                : [];

              return (
                <div key={i} className="rounded-xl border border-red-200/80 dark:border-red-900/40 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleProblem(i)}
                    className="w-full flex items-center justify-between p-4 bg-red-50/40 dark:bg-red-950/20 text-left cursor-pointer hover:bg-red-50 dark:hover:bg-red-950/30 transition"
                  >
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-red-500 shrink-0" />
                      <span className="text-xs font-bold font-mono text-red-700 dark:text-red-400">
                        {prob.error}
                      </span>
                    </div>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-red-400" /> : <ChevronDown className="w-4 h-4 text-red-400" />}
                  </button>

                  {isOpen && (
                    <div className="p-4 bg-white dark:bg-neutral-900 space-y-3 text-xs border-t border-red-100 dark:border-red-950/40">
                      <div>
                        <strong className="text-slate-800 dark:text-neutral-200 block mb-0.5">Root Cause:</strong>
                        <p className="text-slate-600 dark:text-neutral-400">{prob.rootCause}</p>
                      </div>

                      {steps.length > 0 && (
                        <div>
                          <strong className="text-slate-800 dark:text-neutral-200 block mb-1">Troubleshooting Steps:</strong>
                          <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-neutral-400">
                            {steps.map((step, sIdx) => (
                              <li key={sIdx}>{step}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {prob.codeFix && (
                        <div>
                          <strong className="text-emerald-600 dark:text-emerald-400 block mb-1">Recommended Verified Fix:</strong>
                          <pre className="p-3 rounded-lg bg-[#161616] text-[#81FF89] font-mono text-xs overflow-x-auto border border-[#2D2D2D]">
                            <code>{prob.codeFix}</code>
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 10. BEST PRACTICES */}
      {data.bestPractices && data.bestPractices.length > 0 && (
        <section id="section-best-practices" className="rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-neutral-800">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Industry-Standard Best Practices
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {data.bestPractices.map((bp, i) => (
              <div key={i} className="p-4 rounded-xl bg-slate-50 dark:bg-neutral-800/60 border border-slate-200 dark:border-neutral-700 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    {bp.title}
                  </h4>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    {bp.category}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-neutral-400 leading-relaxed">
                  {bp.recommendation}
                </p>
                {bp.impact && (
                  <p className="text-[11px] text-slate-500 dark:text-neutral-500 italic pt-1">
                    Impact: {bp.impact}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 11. COMPARISON & ALTERNATIVES */}
      {data.comparison && (
        <section id="section-comparison" className="rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-neutral-800">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {data.comparison.title || 'Comparison & Tool Alternatives'}
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.isArray(data.comparison.advantages) && data.comparison.advantages.length > 0 && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
                <h4 className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                  Advantages &amp; Strengths
                </h4>
                <ul className="list-disc list-inside space-y-1 text-xs text-slate-700 dark:text-neutral-300">
                  {data.comparison.advantages.map((adv, i) => (
                    <li key={i}>{adv}</li>
                  ))}
                </ul>
              </div>
            )}

            {Array.isArray(data.comparison.limitations) && data.comparison.limitations.length > 0 && (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                <h4 className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                  Limitations &amp; Trade-offs
                </h4>
                <ul className="list-disc list-inside space-y-1 text-xs text-slate-700 dark:text-neutral-300">
                  {data.comparison.limitations.map((lim, i) => (
                    <li key={i}>{lim}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Optional Comparison Matrix Table */}
          {Array.isArray(data.comparison.headers) && Array.isArray(data.comparison.matrix) && (
            <div className="overflow-x-auto pt-2">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-neutral-800 border-b border-slate-200 dark:border-neutral-700">
                    {data.comparison.headers.map((h, i) => (
                      <th key={i} className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-neutral-800">
                  {data.comparison.matrix.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-slate-50 dark:hover:bg-neutral-800/40">
                      {Array.isArray(row) && row.map((cell, cIdx) => (
                        <td key={cIdx} className="py-2.5 px-3 text-slate-700 dark:text-neutral-300">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* 12. INTERVIEW QUESTIONS */}
      {data.interviewQuestions && data.interviewQuestions.length > 0 && (
        <section id="section-interview-questions" className="rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-neutral-800">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Interview Questions: Beginner to Architect
              </h3>
            </div>
          </div>

          <div className="space-y-3">
            {data.interviewQuestions.map((q, i) => {
              const isOpen = openQuestions[i];
              const getLevelBadgeClass = (level: string) => {
                switch (level) {
                  case 'Architect':
                    return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
                  case 'Advanced':
                    return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
                  case 'Intermediate':
                    return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
                  default:
                    return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
                }
              };

              return (
                <div key={i} className="rounded-xl border border-slate-200 dark:border-neutral-800 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleQuestion(i)}
                    className="w-full flex items-center justify-between p-4 bg-slate-50/70 dark:bg-neutral-800/50 text-left cursor-pointer hover:bg-slate-100 dark:hover:bg-neutral-800 transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getLevelBadgeClass(q.level)}`}>
                        {q.level}
                      </span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {q.question}
                      </span>
                    </div>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </button>

                  {isOpen && (
                    <div className="p-4 bg-white dark:bg-neutral-900 space-y-2 text-xs border-t border-slate-100 dark:border-neutral-800">
                      <p className="text-slate-700 dark:text-neutral-300 leading-relaxed font-sans">
                        {q.answer}
                      </p>
                      {q.sampleCodeOrScenario && (
                        <pre className="p-3 mt-2 rounded-lg bg-[#161616] text-[#81FF89] font-mono text-[11px] overflow-x-auto border border-[#2D2D2D]">
                          <code>{q.sampleCodeOrScenario}</code>
                        </pre>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 13. LESSON SUMMARY */}
      {data.summary && (
        <section id="section-summary" className="rounded-2xl border border-emerald-200/80 dark:border-emerald-950/60 bg-gradient-to-br from-emerald-50/30 via-white to-emerald-50/10 dark:from-emerald-950/20 dark:via-neutral-900 dark:to-emerald-950/10 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-emerald-100 dark:border-emerald-950/60">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <BookmarkCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Lesson Summary &amp; Key Takeaways
              </h3>
            </div>
          </div>

          {Array.isArray(data.summary.takeaways) && data.summary.takeaways.length > 0 && (
            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                Key Architectural Takeaways:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {data.summary.takeaways.map((t, idx) => (
                  <div key={idx} className="flex items-start gap-2 p-3 rounded-xl bg-white dark:bg-neutral-800/80 border border-emerald-100 dark:border-emerald-900/30">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-slate-700 dark:text-neutral-300">{t}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Key Terminology if present */}
          {Array.isArray((data.summary as any).keyTerminology) && (data.summary as any).keyTerminology.length > 0 && (
            <div className="pt-2 text-xs">
              <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] mb-2">
                Key Concepts Recap:
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {(data.summary as any).keyTerminology.map((term: string, idx: number) => (
                  <span key={idx} className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-mono text-[11px] border border-emerald-500/20 font-semibold">
                    {term}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Support both whatToLearnNext (object) and nextSteps (string) */}
          {(data.summary.whatToLearnNext || (data.summary as any).nextSteps) && (
            <div className="p-4 rounded-xl bg-white dark:bg-neutral-800 border border-emerald-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                  Up Next:
                </span>
                <h5 className="font-bold text-slate-900 dark:text-white text-sm">
                  {data.summary.whatToLearnNext?.title || 'Next Lesson in Track'}
                </h5>
                <p className="text-slate-500 dark:text-neutral-400 text-xs mt-0.5">
                  {data.summary.whatToLearnNext?.description || (data.summary as any).nextSteps}
                </p>
              </div>
              <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

export { generateStandardLessonHtml } from '@/lib/standard-lesson-compiler';

export { StandardLessonRenderer };
