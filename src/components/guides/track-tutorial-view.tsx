'use client';

import React, { useState } from 'react';
import {
  TrackTutorial,
  TutorialStep,
  MockScreenshot,
} from '@/lib/track-tutorials';
import CourseVisualDiagram from '@/components/ui/course-visual-diagram';
import {
  BookOpen,
  Terminal,
  Code2,
  Copy,
  Check,
  ExternalLink,
  Layers,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  Laptop,
  Maximize2,
  Info,
  Compass,
} from 'lucide-react';

interface TrackTutorialViewProps {
  tutorial: TrackTutorial;
}

export default function TrackTutorialView({ tutorial }: TrackTutorialViewProps) {
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [copiedCodeIndex, setCopiedCodeIndex] = useState<number | null>(null);

  const activeStep = tutorial.steps[activeStepIndex] || tutorial.steps[0];

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeIndex(index);
    setTimeout(() => setCopiedCodeIndex(null), 2500);
  };

  return (
    <div className="space-y-8">
      {/* 1. Header Banner & Source Attribution */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Masterclass Tutorial &amp; Setup Guide</span>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight relative z-10">
          {tutorial.title}
        </h1>
        <p className="text-sm sm:text-base text-slate-300 max-w-4xl leading-relaxed relative z-10">
          {tutorial.overview}
        </p>

        {/* 4-Layer Architecture Pipeline Diagram */}
        <div className="pt-2 space-y-3 relative z-10">
          <div className="text-xs sm:text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>{tutorial.architectureDiagram.title}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {tutorial.architectureDiagram.layers.map((layer) => (
              <div
                key={layer.layer}
                className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-1.5 hover:border-emerald-500/40 transition-colors"
              >
                <span className="text-xs font-mono font-bold text-emerald-400 uppercase">
                  {layer.layer}
                </span>
                <div className="text-sm font-bold text-white">{layer.name}</div>
                <div className="text-xs sm:text-sm text-slate-300 leading-snug">{layer.description}</div>
              </div>
            ))}
          </div>
          <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 text-xs sm:text-sm font-mono text-slate-200">
            <span className="text-emerald-400 font-bold">Data Flow: </span>
            {tutorial.architectureDiagram.flowSummary}
          </div>
        </div>
      </div>

      {/* Official Architecture & Protocol Visual Infographic Diagram */}
      <CourseVisualDiagram trackId={tutorial.trackId} />

      {/* 2. Step Navigator & Content Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left / Top Step Navigation List (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-5 space-y-3 sticky top-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-400" />
              <span>Step-by-Step Curriculum</span>
            </h3>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
              {tutorial.steps.length} Steps
            </span>
          </div>

          <div className="space-y-1.5 max-h-[70vh] overflow-y-auto pr-1">
            {tutorial.steps.map((stg, idx) => {
              const isSelected = idx === activeStepIndex;
              return (
                <button
                  key={stg.stepNumber}
                  type="button"
                  onClick={() => setActiveStepIndex(idx)}
                  className={`w-full text-left p-3 rounded-2xl text-xs transition-all flex items-start gap-2.5 cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-500/15 text-white font-semibold border border-emerald-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent'
                  }`}
                >
                  <span
                    className={`shrink-0 w-6 h-6 rounded-lg font-mono text-[11px] font-bold flex items-center justify-center ${
                      isSelected
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {stg.stepNumber}
                  </span>
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <div className="truncate font-semibold">{stg.title}</div>
                    {stg.badge && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                        {stg.badge}
                      </span>
                    )}
                  </div>
                  <ChevronRight
                    className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                      isSelected ? 'text-emerald-400 translate-x-0.5' : 'text-slate-600'
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Right / Main Active Step Viewer (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
            {/* Step Header */}
            <div className="space-y-2 border-b border-slate-800 pb-5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Step {activeStep.stepNumber} of {tutorial.steps.length}
                </span>
                {activeStep.badge && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300">
                    {activeStep.badge}
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                {activeStep.title}
              </h2>
              <p className="text-sm text-emerald-400/90 font-medium">{activeStep.summary}</p>
            </div>

            {/* Step Description */}
            <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-line font-sans">
              {activeStep.description}
            </div>

            {/* Visual Mock Screenshot Component */}
            {activeStep.mockScreenshot && (
              <div className="space-y-2 pt-1">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Laptop className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Visual Setup &amp; Interface Preview</span>
                </div>

                <div className="rounded-2xl border border-slate-700/80 bg-slate-950 overflow-hidden shadow-xl">
                  {/* Window Titlebar */}
                  <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
                      <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                      <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                      <span className="ml-2 font-mono text-[11px] text-slate-400 font-semibold truncate">
                        {activeStep.mockScreenshot.windowTitle}
                      </span>
                    </div>
                    {activeStep.mockScreenshot.activeFile && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {activeStep.mockScreenshot.activeFile}
                      </span>
                    )}
                  </div>

                  {/* Window Body */}
                  <div className="p-4 font-mono text-xs text-slate-300 leading-relaxed overflow-x-auto whitespace-pre bg-slate-950">
                    {activeStep.mockScreenshot.codeOrOutput}
                  </div>

                  {/* Window Footer Caption */}
                  <div className="bg-slate-900/80 px-4 py-2 border-t border-slate-800/80 text-[11px] text-slate-400 italic">
                    {activeStep.mockScreenshot.caption}
                  </div>
                </div>
              </div>
            )}

            {/* Production Code Snippet */}
            {activeStep.codeSnippet && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300 uppercase tracking-wider">
                  <div className="flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{activeStep.codeSnippet.caption}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(activeStep.codeSnippet!.code, activeStep.stepNumber)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-mono transition-colors"
                  >
                    {copiedCodeIndex === activeStep.stepNumber ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-slate-200 overflow-x-auto leading-relaxed shadow-inner">
                  <pre>{activeStep.codeSnippet.code}</pre>
                </div>
              </div>
            )}

            {/* Key Takeaways */}
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 sm:p-5 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Architect Key Takeaways &amp; Best Practices</span>
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {activeStep.keyTakeaways.map((tip, tIdx) => (
                  <li key={tIdx} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Bottom Next / Previous Navigation */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800 flex-wrap gap-2">
              <button
                type="button"
                disabled={activeStepIndex === 0}
                onClick={() => setActiveStepIndex((prev) => Math.max(0, prev - 1))}
                className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-700 text-slate-300 hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                ← Previous Step
              </button>

              <span className="text-xs font-mono text-slate-500">
                {activeStepIndex + 1} of {tutorial.steps.length}
              </span>

              <button
                type="button"
                disabled={activeStepIndex === tutorial.steps.length - 1}
                onClick={() => setActiveStepIndex((prev) => Math.min(tutorial.steps.length - 1, prev + 1))}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-30 disabled:pointer-events-none transition-colors shadow-xs"
              >
                Next Step →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
