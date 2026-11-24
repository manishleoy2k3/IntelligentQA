'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Workflow,
  Sparkles,
  Layers,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Download,
  RotateCcw,
  Check,
  Eye,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  Info,
} from 'lucide-react';
import {
  ArchitectureDiagramData,
  DiagramEngineMode,
  DiagramReviewResult,
} from '@/types/architecture-diagram';
import DiagramCanvas from './diagram-canvas';

interface DiagramStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertDiagram: (diagramHtml: string, metadata?: any) => void;
  lessonContext?: {
    courseTitle?: string;
    moduleTitle?: string;
    lessonTitle?: string;
    currentContent?: string;
    lessonId?: string;
    courseId?: string;
  };
  initialPrompt?: string;
}

export default function DiagramStudioModal({
  isOpen,
  onClose,
  onInsertDiagram,
  lessonContext,
  initialPrompt = '',
}: DiagramStudioModalProps) {
  // Auto-detect topic and mode from lesson context if not explicitly provided
  const contextDetectionText = `${initialPrompt} ${lessonContext?.lessonTitle || ''} ${lessonContext?.moduleTitle || ''} ${lessonContext?.courseTitle || ''}`.toLowerCase();
  const isInfographicDetected = /what is|how does|how it works|concept|infographic|tokenization|token|llm|transformer|self-attention|attention|pyramid|authentication|auth/i.test(contextDetectionText);

  const initialMode: DiagramEngineMode = isInfographicDetected ? 'MODE_B_INFOGRAPHIC' : 'MODE_A_ARCHITECTURE';
  const defaultPromptValue = initialPrompt || lessonContext?.lessonTitle || lessonContext?.moduleTitle || '';

  const [selectedMode, setSelectedMode] = useState<DiagramEngineMode>(initialMode);
  const [prompt, setPrompt] = useState<string>(defaultPromptValue);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync state when modal opens or context changes
  useEffect(() => {
    if (initialPrompt) {
      setPrompt(initialPrompt);
      if (initialPrompt.toLowerCase().includes('infographic')) {
        setSelectedMode('MODE_B_INFOGRAPHIC');
      }
    } else if (lessonContext?.lessonTitle) {
      setPrompt(lessonContext.lessonTitle);
      const isInfo = /what is|how does|how it works|concept|infographic|tokenization|token|llm|transformer|self-attention|attention|pyramid|authentication|auth/i.test(
        `${lessonContext.lessonTitle} ${lessonContext.moduleTitle || ''}`
      );
      setSelectedMode(isInfo ? 'MODE_B_INFOGRAPHIC' : 'MODE_A_ARCHITECTURE');
    }
  }, [initialPrompt, lessonContext?.lessonTitle, lessonContext?.moduleTitle]);

  // Mode A Results
  const [architectureData, setArchitectureData] = useState<ArchitectureDiagramData | null>(null);
  const [generatedSvg, setGeneratedSvg] = useState<string | null>(null);
  const [reviewResult, setReviewResult] = useState<DiagramReviewResult | null>(null);

  // Mode B Results
  const [infographicImageUrl, setInfographicImageUrl] = useState<string | null>(null);
  const [infographicMeta, setInfographicMeta] = useState<any>(null);

  // Step tracking: 1: Config & Prompt, 2: Preview & Editing, 3: Approved
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [isApproved, setIsApproved] = useState<boolean>(false);

  if (!isOpen) return null;

  // Quick prompt templates matching QA Academy scenarios
  const QUICK_TEMPLATES: Record<DiagramEngineMode, Array<{ label: string; prompt: string }>> = {
    MODE_A_ARCHITECTURE: [
      {
        label: 'Selenium WebDriver Architecture',
        prompt: 'Generate professional Selenium WebDriver Architecture diagram with Test Script, Client Library, W3C Protocol, Browser Driver, and Browser.',
      },
      {
        label: 'Playwright Architecture',
        prompt: 'Generate Playwright Architecture diagram showing Test Runner, Playwright API, WebSocket CDP, Browser, BrowserContext, and Page.',
      },
      {
        label: 'Appium Mobile Architecture',
        prompt: 'Generate Appium 2.x Mobile Automation Architecture showing Test Client, Appium Server, WebDriver Protocol, Platform Driver, and Mobile Device.',
      },
      {
        label: 'Model Context Protocol (MCP)',
        prompt: 'Generate Model Context Protocol (MCP) Architecture diagram with MCP Host, MCP Client, MCP Server, Tools, Resources, and Prompts.',
      },
      {
        label: 'RAG Pipeline Architecture',
        prompt: 'Generate Retrieval-Augmented Generation (RAG) Architecture with Vector Database, Embeddings, Context Retriever, and LLM Orchestrator.',
      },
    ],
    MODE_B_INFOGRAPHIC: [
      {
        label: 'What is an LLM?',
        prompt: 'Educational technical infographic explaining Large Language Models: Training data, Tokenization, Embeddings, Transformer, and Next-Token Prediction.',
      },
      {
        label: 'What is Tokenization?',
        prompt: 'Educational infographic explaining BPE and Subword Tokenization mechanics for QA engineers.',
      },
      {
        label: 'What is Self-Attention?',
        prompt: 'Technical infographic explaining Scaled Dot-Product Self-Attention (Query, Key, Value vectors).',
      },
      {
        label: 'Test Automation Pyramid',
        prompt: 'Educational infographic of the Enterprise Test Pyramid: Unit, Integration, Component, API, and E2E UI Tests.',
      },
    ],
  };

  const handleGenerate = async (overridePrompt?: string) => {
    const effectivePrompt = (
      overridePrompt ||
      prompt ||
      lessonContext?.lessonTitle ||
      lessonContext?.moduleTitle ||
      (selectedMode === 'MODE_A_ARCHITECTURE' ? 'System Architecture' : 'Educational Technical Concept')
    ).trim();

    if (!effectivePrompt || isGenerating) return;

    setIsGenerating(true);
    setErrorMessage(null);

    try {
      if (selectedMode === 'MODE_A_ARCHITECTURE') {
        const res = await fetch('/api/admin/diagram', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'generate_architecture',
            prompt: effectivePrompt,
            context: lessonContext,
          }),
        });

        const data = await res.json();
        if (data.success) {
          setArchitectureData(data.diagramData);
          setGeneratedSvg(data.svg);
          setReviewResult(data.review);
          setCurrentStep(2);
        } else {
          setErrorMessage(data.error || 'Failed to generate architecture diagram.');
        }
      } else if (selectedMode === 'MODE_B_INFOGRAPHIC') {
        const res = await fetch('/api/admin/diagram', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'generate_infographic',
            prompt: effectivePrompt,
            subject: effectivePrompt,
            targetLearner: 'QA Automation Engineers and SDETs',
            context: lessonContext,
          }),
        });

        const data = await res.json();
        if (data.success) {
          setInfographicImageUrl(data.imageUrl);
          setInfographicMeta(data);
          setCurrentStep(2);
        } else {
          setErrorMessage(data.error || 'Failed to generate educational infographic. Please try again later.');
        }
      }
    } catch (err: any) {
      setErrorMessage('Architecture / Infographic generation is temporarily unavailable. Please try again later.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Insert Approved Diagram into Lesson Content
  const handleApproveAndInsert = async () => {
    setIsApproved(true);

    try {
      if (selectedMode === 'MODE_A_ARCHITECTURE' && generatedSvg && architectureData) {
        // Save to persistent media storage via backend
        const saveRes = await fetch('/api/admin/diagram', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'save_diagram',
            title: architectureData.title,
            description: architectureData.description,
            mode: 'MODE_A_ARCHITECTURE',
            architectureData,
            svgContent: generatedSvg,
            lessonId: lessonContext?.lessonId,
            courseId: lessonContext?.courseId,
          }),
        });
        const saveData = await saveRes.json();
        const imageUrl = saveData.imageUrl || '';

        // Form production-ready responsive diagram HTML
        const diagramHtml = `
<div class="my-8 rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm p-4 overflow-hidden" data-diagram-type="architecture" data-diagram-title="${escapeAttr(architectureData.title)}">
  <div class="mb-3 flex items-center justify-between border-b border-slate-100 dark:border-neutral-800 pb-2">
    <div>
      <h4 class="text-sm font-bold text-slate-900 dark:text-white">${escapeAttr(architectureData.title)}</h4>
      <p class="text-xs text-slate-500 dark:text-neutral-400">${escapeAttr(architectureData.description || '')}</p>
    </div>
    <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
      Architecture Engine
    </span>
  </div>
  <div class="w-full overflow-x-auto flex justify-center py-2">
    ${imageUrl ? `<img src="${imageUrl}" alt="${escapeAttr(architectureData.title)}" class="w-full max-h-[580px] object-contain rounded-xl" />` : generatedSvg}
  </div>
</div>`;

        onInsertDiagram(diagramHtml, {
          title: architectureData.title,
          imageUrl,
          type: 'architecture',
        });
        onClose();
      } else if (selectedMode === 'MODE_B_INFOGRAPHIC' && infographicImageUrl) {
        const infographicHtml = `
<div class="my-8 rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm p-4 overflow-hidden" data-diagram-type="infographic">
  <div class="mb-3 border-b border-slate-100 dark:border-neutral-800 pb-2">
    <h4 class="text-sm font-bold text-slate-900 dark:text-white">Technical Infographic: ${escapeAttr(prompt)}</h4>
    <p class="text-xs text-slate-500 dark:text-neutral-400">High-Resolution Educational Illustration</p>
  </div>
  <div class="w-full flex justify-center py-2">
    <img src="${infographicImageUrl}" alt="${escapeAttr(prompt)}" class="w-full max-h-[640px] object-contain rounded-xl shadow-xs" />
  </div>
</div>`;

        onInsertDiagram(infographicHtml, {
          title: prompt,
          imageUrl: infographicImageUrl,
          type: 'infographic',
        });
        onClose();
      }
    } catch (err) {
      console.error('Failed to approve and insert diagram:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 md:p-6 overflow-y-auto">
      <div className="relative w-full max-w-5xl rounded-2xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-2xs">
              <Workflow className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Technical Diagram Studio
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                  Phase 11 Engine
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-neutral-400">
                Generate professional enterprise architecture diagrams, infographics, and flows
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="px-6 pt-3 pb-2 border-b border-slate-200 dark:border-neutral-800 bg-slate-50/20 dark:bg-neutral-900/20 flex flex-wrap gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              setSelectedMode('MODE_A_ARCHITECTURE');
              setCurrentStep(1);
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              selectedMode === 'MODE_A_ARCHITECTURE'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-slate-700 dark:text-neutral-300 hover:border-slate-300'
            }`}
          >
            <Workflow className="w-4 h-4" />
            Mode A: Architecture Diagram (SVG / React Flow)
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedMode('MODE_B_INFOGRAPHIC');
              setCurrentStep(1);
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              selectedMode === 'MODE_B_INFOGRAPHIC'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-slate-700 dark:text-neutral-300 hover:border-slate-300'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            Mode B: Educational Infographic (Image Gen)
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Active Lesson Context Banner */}
          {lessonContext?.lessonTitle && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-slate-100 dark:via-neutral-800 to-transparent border border-emerald-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                    Lesson Context Active
                  </span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {lessonContext.courseTitle ? `${lessonContext.courseTitle} › ` : ''}{lessonContext.lessonTitle}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-neutral-400">
                  AI will analyze this lesson&apos;s curriculum context and content to generate the {selectedMode === 'MODE_A_ARCHITECTURE' ? 'architecture diagram' : 'educational infographic'}.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleGenerate()}
                disabled={isGenerating}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer shrink-0"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate from Current Lesson</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* STEP 1: Prompt & Configuration */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 dark:text-neutral-200">
                {selectedMode === 'MODE_A_ARCHITECTURE'
                  ? 'Architecture Topic'
                  : 'Infographic Topic'}
              </label>
              <span className="text-[11px] text-slate-500 dark:text-neutral-400">
                Auto-populated from lesson context
              </span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={
                  selectedMode === 'MODE_A_ARCHITECTURE'
                    ? (lessonContext?.lessonTitle || 'e.g. Selenium Architecture')
                    : (lessonContext?.lessonTitle || 'e.g. What is an LLM?')
                }
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleGenerate();
                }}
              />
              <button
                type="button"
                onClick={() => handleGenerate()}
                disabled={(!prompt.trim() && !lessonContext?.lessonTitle) || isGenerating}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-bold transition flex items-center gap-2 shadow-xs cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate
                  </>
                )}
              </button>
            </div>

            {/* Quick Templates */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] font-medium text-slate-400 dark:text-neutral-500 mr-1">
                Quick Scenarios:
              </span>
              {QUICK_TEMPLATES[selectedMode].map((tpl) => (
                <button
                  key={tpl.label}
                  type="button"
                  onClick={() => {
                    setPrompt(tpl.prompt);
                  }}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-300 hover:bg-slate-200 dark:hover:bg-neutral-700 transition cursor-pointer"
                >
                  {tpl.label}
                </button>
              ))}
            </div>
          </div>

          {/* STEP 2: Preview & Editing Studio */}
          {currentStep === 2 && (
            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-neutral-800">
              {/* MODE A: Interactive React Flow & SVG Preview */}
              {selectedMode === 'MODE_A_ARCHITECTURE' && architectureData && (
                <div className="space-y-4">
                  {/* Advisory AI Review Banner */}
                  {reviewResult && (
                    <div
                      className={`p-3.5 rounded-xl border flex items-start justify-between gap-3 ${
                        reviewResult.passed
                          ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/50'
                          : 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/50'
                      }`}
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        {reviewResult.passed ? (
                          <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        ) : (
                          <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                              AI Technical Review — Quality Score: {reviewResult.score}/100
                            </h5>
                            <span className="text-[10px] px-1.5 py-0.2 rounded font-semibold bg-white dark:bg-neutral-800 text-slate-700 dark:text-neutral-300 border border-slate-200 dark:border-neutral-700">
                              Advisory
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-neutral-300 mt-0.5">
                            {reviewResult.summary}
                          </p>
                          {reviewResult.issues.length > 0 && (
                            <ul className="mt-2 space-y-1 text-[11px] text-slate-600 dark:text-neutral-300 list-disc list-inside">
                              {reviewResult.issues.map((iss, idx) => (
                                <li key={idx}>
                                  <strong>{iss.category}:</strong> {iss.message}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Canvas Container */}
                  <DiagramCanvas
                    initialData={architectureData}
                    onDataChange={(updated) => {
                      setArchitectureData(updated);
                    }}
                    onExportSvg={(svg) => {
                      setGeneratedSvg(svg);
                    }}
                  />
                </div>
              )}

              {/* MODE B: Educational Infographic Preview */}
              {selectedMode === 'MODE_B_INFOGRAPHIC' && infographicImageUrl && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Generated Educational Image (Persistent File)
                    </span>
                    {infographicMeta?.estimatedCost && (
                      <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                        {infographicMeta.estimatedCost}
                      </span>
                    )}
                  </div>
                  <div className="w-full flex justify-center p-4 rounded-2xl border border-slate-200 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-950">
                    <img
                      src={infographicImageUrl}
                      alt={prompt}
                      className="max-h-[500px] w-auto rounded-xl object-contain shadow-md"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/50 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 dark:text-neutral-500">
              {currentStep === 1
                ? 'Step 1: Choose mode & enter prompt'
                : 'Step 2: Inspect, adjust & approve diagram'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-neutral-700 text-xs font-semibold text-slate-600 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800 transition cursor-pointer"
            >
              Cancel
            </button>

            {currentStep === 2 && (
              <button
                type="button"
                onClick={handleApproveAndInsert}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <Check className="w-4 h-4" />
                Approve & Insert into Lesson
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function escapeAttr(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
