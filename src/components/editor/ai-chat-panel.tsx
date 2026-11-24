'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  X,
  Copy,
  Check,
  RotateCcw,
  Plus,
  BookOpen,
  ArrowRight,
  AlertCircle,
  HelpCircle,
  Code,
  FileText,
  Workflow,
  Search,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  Layers,
  Wand2,
  Trash2,
  Key,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';
import {
  AIEnhancementResponse,
  AIStructuredResponse,
  LessonContextPackage,
  AIChatMessage,
} from '@/lib/ai/types';
import { markdownToTiptapHtml } from '@/lib/ai/markdown-converter';
import { QADatabase } from '@/lib/qa-db';
import GeminiKeyModal from '@/components/auth/gemini-key-modal';

interface AiChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  context: LessonContextPackage;
  onInsertContent: (html: string) => void;
  onReplaceContent: (html: string) => void;
  onReplaceSelected: (html: string) => void;
  onOpenCompare: (enhancedHtml: string) => void;
  onOpenDiagramStudio?: (initialPrompt?: string) => void;
  selectedEditorText?: string;
}

interface ChatTurn {
  id: string;
  role: 'user' | 'assistant';
  prompt?: string;
  response?: AIStructuredResponse;
  rawText?: string;
  modelUsed?: string;
  timestamp: string;
}

export default function AiChatPanel({
  isOpen,
  onClose,
  context,
  onInsertContent,
  onReplaceContent,
  onReplaceSelected,
  onOpenCompare,
  onOpenDiagramStudio,
  selectedEditorText,
}: AiChatPanelProps) {
  const [messages, setMessages] = useState<ChatTurn[]>([]);
  const [inputPrompt, setInputPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // In-session temporary memory for Gemini API Key (NEVER written to DB or disk)
  const [sessionApiKey, setSessionApiKey] = useState<string>('');
  const [showKeyDrawer, setShowKeyDrawer] = useState<boolean>(false);
  const [keyInputVal, setKeyInputVal] = useState<string>('');
  const [keyTesting, setKeyTesting] = useState<boolean>(false);
  const [keyNotice, setKeyNotice] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Sync session or user key state (in-memory session prioritized, fallback to QADatabase memory)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('intelligentqa_ai_session_key') || QADatabase.getUserGeminiKey();
      if (stored) {
        setSessionApiKey(stored);
      }
    }
  }, []);

  const handleSaveSessionKey = async () => {
    const trimmed = keyInputVal.trim();
    if (!trimmed) {
      setKeyNotice('Please paste a valid Google AI Studio key.');
      return;
    }

    setKeyTesting(true);
    setKeyNotice(null);

    try {
      const res = await fetch('/api/ai/verify-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: trimmed }),
      });
      const data = await res.json();

      if (res.ok && data.valid) {
        // Store only in browser session memory (cleared on tab/browser close, ZERO database writes)
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('intelligentqa_ai_session_key', trimmed);
        }
        setSessionApiKey(trimmed);
        setShowKeyDrawer(false);
        setKeyInputVal('');
        setErrorMessage(null);
      } else {
        setKeyNotice(data.error || data.message || 'Key verification failed. Please check the key.');
      }
    } catch (err: any) {
      setKeyNotice(err.message || 'Network error while verifying key.');
    } finally {
      setKeyTesting(false);
    }
  };

  const handleClearSessionKey = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('intelligentqa_ai_session_key');
    }
    setSessionApiKey('');
    setKeyNotice('Session API key cleared.');
  };

  // Predefined shortcut actions
  const PREDEFINED_ACTIONS = [
    {
      id: 'generate_visual_diagram',
      alias: 'add_diagram',
      label: 'Generate Visual Diagram',
      icon: Workflow,
      desc: 'Professional Architecture Diagram (SVG) or Educational Infographic Studio',
      prompt: 'Generate Visual Diagram',
    },
    {
      id: 'improve_content',
      label: 'Improve Existing Content',
      icon: Sparkles,
      desc: 'Analyze gaps, improve clarity, preserve correct content',
      prompt: 'Analyze this lesson, identify technical gaps, and improve clarity and technical depth while preserving correct existing content.',
    },
    {
      id: 'expand_explanation',
      label: 'Expand Technical Explanation',
      icon: BookOpen,
      desc: 'Explain internal working mechanisms in greater detail',
      prompt: 'Expand the technical explanation of this lesson in greater detail. Include internal working mechanisms and advanced architectural concepts.',
    },
    {
      id: 'add_examples',
      label: 'Add Practical Examples',
      icon: Code,
      desc: 'Real-world QA scenarios & working code patterns',
      prompt: 'Add real-world QA automation scenarios, practical implementation examples, and production-ready code patterns.',
    },
    {
      id: 'add_failures',
      label: 'Add Common Failures',
      icon: AlertCircle,
      desc: 'Root causes, real exceptions & debugging approaches',
      prompt: 'Add common problems, real framework exceptions, possible root causes, debugging approaches, and prevention strategies.',
    },
    {
      id: 'add_interview_questions',
      label: 'Add Interview Questions',
      icon: HelpCircle,
      desc: 'Beginner, Intermediate, Advanced & Architect scenarios',
      prompt: 'Add realistic interview questions with detailed architectural answers categorized into Beginner, Intermediate, Advanced, and Architect-level scenarios.',
    },
    {
      id: 'technical_review',
      label: 'Technical Review',
      icon: Search,
      desc: 'Audit for inaccuracies, omissions & recommendations',
      prompt: 'Perform a comprehensive technical audit of this lesson. Identify inaccuracies, missing technical information, and duplicate explanations. Provide concrete recommendations without rewriting it entirely.',
    },
    {
      id: 'rewrite_selected',
      label: 'Rewrite Selected Content',
      icon: Wand2,
      desc: 'Improve highlighted editor text while preserving lesson',
      prompt: 'Rewrite and improve the selected text snippet with greater technical clarity, preserving the rest of the lesson structure.',
    },
    {
      id: 'create_lesson',
      label: 'Create New Lesson',
      icon: Layers,
      desc: 'Generate complete 13-section standardized lesson',
      prompt: 'Generate a complete, comprehensive lesson using the standardized 13-section structure for this topic.',
    },
    {
      id: 'simplify_explanation',
      label: 'Simplify Explanation',
      icon: FileText,
      desc: 'Explain in beginner-friendly language without losing rigor',
      prompt: 'Explain this difficult concept in clear, beginner-friendly language suitable for manual testers transitioning to SDET, while retaining all technically important details.',
    },
  ];

  // Auto scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Reset conversation when lesson context ID changes
  const prevLessonIdRef = useRef<string>(context.currentLesson.id);
  useEffect(() => {
    if (prevLessonIdRef.current !== context.currentLesson.id) {
      prevLessonIdRef.current = context.currentLesson.id;
      setMessages([]);
      setErrorMessage(null);
    }
  }, [context.currentLesson.id]);

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSend = async (customPrompt?: string, actionId?: string) => {
    const promptToSend = customPrompt || inputPrompt.trim();
    if (!promptToSend || isLoading) return;

    if (
      (actionId === 'generate_visual_diagram' ||
        actionId === 'add_diagram' ||
        promptToSend.toLowerCase() === 'generate visual diagram' ||
        promptToSend.toLowerCase().includes('architecture diagram')) &&
      onOpenDiagramStudio
    ) {
      onOpenDiagramStudio(promptToSend.toLowerCase() === 'generate visual diagram' ? '' : promptToSend);
      if (!customPrompt) setInputPrompt('');
      return;
    }

    setErrorMessage(null);
    const userTurn: ChatTurn = {
      id: `user-${Date.now()}`,
      role: 'user',
      prompt: promptToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userTurn]);
    if (!customPrompt) setInputPrompt('');
    setIsLoading(true);

    try {
      // Build history
      const history: AIChatMessage[] = messages.map((m) => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.prompt || m.response?.generated_content || m.rawText || '',
      }));

      // Enrich context with currently selected text
      const enrichedContext: LessonContextPackage = {
        ...context,
        selectedText: selectedEditorText,
      };

      // Retrieve configured Gemini API Key (session memory first, then database/storage fallback)
      const activeKey = sessionApiKey || (typeof window !== 'undefined' ? (sessionStorage.getItem('intelligentqa_ai_session_key') || QADatabase.getUserGeminiKey()) : '');

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (activeKey) {
        headers['x-gemini-api-key'] = activeKey;
      }

      const res = await fetch('/api/admin/learning/ai-enhance', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action: actionId || 'custom_chat',
          prompt: promptToSend,
          context: enrichedContext,
          history,
          apiKey: activeKey || undefined,
        }),
      });

      const data: AIEnhancementResponse = await res.json();

      if (!res.ok || !data.success) {
        const errorMsg = data.error?.message || 'Failed to generate enhancement response.';
        const details = data.error?.details ? ` (${data.error.details})` : '';
        setErrorMessage(`${errorMsg}${details}`);
        return;
      }

      const assistantTurn: ChatTurn = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        response: data.data,
        rawText: data.rawText,
        modelUsed: data.modelUsed,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantTurn]);
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error occurred while connecting to AI assistant.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <aside className="w-full md:w-[460px] lg:w-[500px] h-full bg-[#121215] border-l border-[#27272A] flex flex-col z-30 shadow-2xl overflow-hidden animate-in slide-in-from-right duration-200">
      {/* 1. HEADER */}
      <div className="px-5 py-4 bg-[#18181B] border-b border-[#27272A] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-wide">Enhance with AI</h3>
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                QA Architect
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 truncate max-w-[280px]">
              {context.course.name} • {context.currentLesson.title}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {messages.length > 0 && (
            <button
              type="button"
              onClick={() => setMessages([])}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Clear Conversation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Close Assistant"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. CHAT HISTORY & MESSAGES */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans text-xs">
        {messages.length === 0 && (
          <div className="py-6 px-2 space-y-4">
            <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/20 space-y-2">
              <div className="flex items-center gap-2 text-purple-400 font-bold text-xs">
                <Sparkles className="w-4 h-4" />
                <span>Specialized QA Technical Content Architect</span>
              </div>
              <p className="text-zinc-300 text-[11px] leading-relaxed">
                I understand the context of <strong>&quot;{context.course.name}&quot;</strong> and your current lesson <strong>&quot;{context.currentLesson.title}&quot;</strong>. Select a quick action below or ask any technical curriculum enhancement question.
              </p>
            </div>

            {/* Quick action buttons */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono uppercase text-zinc-500 font-bold tracking-wider">
                Predefined Actions
              </span>
              <div className="grid grid-cols-1 gap-1.5">
                {PREDEFINED_ACTIONS.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.id}
                      type="button"
                      onClick={() => handleSend(action.prompt, action.id)}
                      disabled={isLoading}
                      className="p-2.5 rounded-xl bg-[#18181B] hover:bg-[#202025] border border-[#27272A] hover:border-purple-500/40 text-left transition-all group cursor-pointer disabled:opacity-50"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-zinc-200 group-hover:text-purple-300 flex items-center gap-2">
                          <Icon className="w-3.5 h-3.5 text-purple-400" />
                          {action.label}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-purple-400 transition-transform group-hover:translate-x-0.5" />
                      </div>
                      <p className="text-[10px] text-zinc-500 mt-0.5">{action.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Message stream */}
        {messages.map((turn) => {
          if (turn.role === 'user') {
            return (
              <div key={turn.id} className="flex justify-end">
                <div className="max-w-[85%] rounded-2xl bg-purple-600/20 border border-purple-500/30 px-3.5 py-2.5 text-zinc-100 shadow-sm">
                  <p className="whitespace-pre-wrap leading-relaxed">{turn.prompt}</p>
                  <span className="text-[9px] text-purple-300/60 block text-right mt-1 font-mono">
                    {turn.timestamp}
                  </span>
                </div>
              </div>
            );
          }

          const resp = turn.response;
          // Clean display content to ensure raw JSON meta strings never leak into the chat view
          let cleanContent = resp?.generated_content || '';
          if (!cleanContent && turn.rawText) {
            cleanContent = turn.rawText
              .replace(/^\s*\{?\s*"response_type"[^,]+,\s*/i, '')
              .replace(/"summary"\s*:\s*"[^"]*",?\s*/i, '')
              .replace(/"generated_content"\s*:\s*"?/i, '')
              .replace(/"?\s*\}?\s*$/i, '');
          }

          const htmlContent = cleanContent ? markdownToTiptapHtml(cleanContent) : '';

          return (
            <div key={turn.id} className="flex flex-col space-y-2">
              <div className="rounded-2xl bg-[#18181B] border border-[#27272A] p-4 shadow-md space-y-3">
                {/* Response Header */}
                <div className="flex items-center justify-between border-b border-[#27272A] pb-2 text-[10px] text-zinc-400 font-mono">
                  <span className="font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3" />
                    {resp?.response_type?.replace(/_/g, ' ') || 'AI RESPONSE'}
                  </span>
                  <span>{turn.modelUsed || 'Gemini'} • {turn.timestamp}</span>
                </div>

                {/* Summary */}
                {resp?.summary && (
                  <div className="text-[11px] text-zinc-300 italic bg-purple-950/20 border border-purple-500/10 p-2.5 rounded-xl">
                    {resp.summary}
                  </div>
                )}

                {/* Structured Technical Review (Evaluation Rubric & Recommendations) */}
                {resp?.review && (
                  <div className="space-y-3 p-3.5 rounded-2xl bg-[#121216] border border-purple-500/30">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold uppercase text-purple-400 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        AI Technical Review Audit
                      </span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300">
                        Score: {resp.review.overallScore}/100
                      </span>
                    </div>

                    {/* Criteria Scorecards */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-[#181820] border border-[#272733] space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-zinc-300 font-medium">Technical completeness</span>
                          <span className="font-mono font-bold text-cyan-400">
                            {resp.review.metrics.completeness?.score ?? 0}/100
                          </span>
                        </div>
                        <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-cyan-400 transition-all"
                            style={{ width: `${resp.review.metrics.completeness?.score ?? 0}%` }}
                          />
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-[#181820] border border-[#272733] space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-zinc-300 font-medium">Practical depth</span>
                          <span className="font-mono font-bold text-purple-400">
                            {resp.review.metrics.practicalDepth?.score ?? 0}/100
                          </span>
                        </div>
                        <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-purple-400 transition-all"
                            style={{ width: `${resp.review.metrics.practicalDepth?.score ?? 0}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Specific Recommendations */}
                    {resp.review.recommendations && resp.review.recommendations.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold block">
                          Review Findings & Gaps:
                        </span>
                        <div className="space-y-1.5">
                          {resp.review.recommendations.map((rec, rIdx) => (
                            <div
                              key={rIdx}
                              className={`p-2 rounded-xl border text-[11px] flex items-start gap-2 ${
                                rec.type === 'Good'
                                  ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-200'
                                  : rec.type === 'Missing'
                                  ? 'bg-rose-950/20 border-rose-500/25 text-rose-200'
                                  : rec.type === 'Warning'
                                  ? 'bg-amber-950/20 border-amber-500/25 text-amber-200'
                                  : 'bg-sky-950/20 border-sky-500/20 text-sky-200'
                              }`}
                            >
                              <span
                                className={`text-[9px] font-bold font-mono px-1.5 py-0.5 rounded shrink-0 ${
                                  rec.type === 'Good'
                                    ? 'bg-emerald-500/20 text-emerald-400'
                                    : rec.type === 'Missing'
                                    ? 'bg-rose-500/20 text-rose-400'
                                    : rec.type === 'Warning'
                                    ? 'bg-amber-500/20 text-amber-400'
                                    : 'bg-sky-500/20 text-sky-400'
                                }`}
                              >
                                {rec.type}
                              </span>
                              <div className="min-w-0 flex-1 leading-snug">
                                <span className="font-bold text-white block">{rec.title}</span>
                                {rec.detail && rec.detail !== rec.title && (
                                  <span className="text-[10px] text-zinc-300 block">{rec.detail}</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Content Body */}
                <div className="prose prose-invert prose-xs max-w-none text-zinc-200 leading-relaxed font-sans space-y-2">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: htmlContent || `<p class="text-zinc-400 italic">No content generated.</p>`,
                    }}
                  />
                </div>

                {/* Warnings / Assumptions */}
                {resp?.technical_warnings && resp.technical_warnings.length > 0 && (
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px] space-y-1">
                    <span className="font-bold flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Technical Notice
                    </span>
                    <ul className="list-disc pl-4 space-y-0.5">
                      {resp.technical_warnings.map((w, idx) => (
                        <li key={idx}>{w}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Response Action Buttons (Copy, Insert, Replace, Compare) */}
                <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[#27272A]">
                  <button
                    type="button"
                    onClick={() => handleCopyText(resp?.generated_content || turn.rawText || '', turn.id)}
                    className="px-2.5 py-1.5 rounded-lg bg-[#202025] hover:bg-[#2A2A30] text-zinc-300 hover:text-white text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                    title="Copy full text"
                  >
                    {copiedId === turn.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedId === turn.id ? 'Copied' : 'Copy'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onInsertContent(htmlContent)}
                    className="px-2.5 py-1.5 rounded-lg bg-[#202025] hover:bg-[#2A2A30] text-cyan-400 hover:text-cyan-300 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                    title="Insert at cursor position"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Insert into Editor</span>
                  </button>

                  {selectedEditorText && (
                    <button
                      type="button"
                      onClick={() => onReplaceSelected(htmlContent)}
                      className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer border border-amber-500/20"
                      title="Replace selected highlight in editor"
                    >
                      <Wand2 className="w-3 h-3" />
                      <span>Replace Selection</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => onOpenCompare(htmlContent)}
                    className="px-2.5 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer border border-purple-500/20"
                    title="Compare side-by-side with original lesson"
                  >
                    <Layers className="w-3 h-3" />
                    <span>Compare with Lesson</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to replace the entire lesson content with this AI version? Existing content will be overwritten.')) {
                        onReplaceContent(htmlContent);
                      }
                    }}
                    className="px-2 py-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 text-[10px] font-medium transition-colors cursor-pointer ml-auto"
                    title="Replace full lesson after confirmation"
                  >
                    Replace All
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="p-4 rounded-2xl bg-[#18181B] border border-purple-500/30 flex items-center gap-3 text-purple-400 text-xs animate-pulse">
            <Sparkles className="w-4 h-4 animate-spin" />
            <span>Analyzing lesson context &amp; generating technical response...</span>
          </div>
        )}

        {/* Error Notification */}
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex flex-col gap-2">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold">Enhancement Failed</span>
                <p className="text-[11px] text-rose-200/80 leading-relaxed">{errorMessage}</p>
              </div>
            </div>
            {(errorMessage.includes('Gemini API Key') || errorMessage.includes('key is missing')) && (
              <div className="pt-2 border-t border-rose-500/20 flex items-center justify-between">
                <span className="text-[10px] text-zinc-400">Temporary In-Memory Key (0% DB storage):</span>
                <button
                  type="button"
                  onClick={() => setShowKeyDrawer(true)}
                  className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow transition-colors cursor-pointer"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>Set Session Key</span>
                </button>
              </div>
            )}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 3. INPUT AREA */}
      <div className="p-4 bg-[#18181B] border-t border-[#27272A] space-y-2">
        {/* Quick Session Key Drawer (In-Memory Only, Zero DB Writes) */}
        {showKeyDrawer && (
          <div className="p-3.5 rounded-2xl bg-[#09090B] border border-purple-500/30 space-y-2.5 animate-in fade-in duration-150">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-purple-300 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-purple-400" />
                Session Gemini Key (In-Memory Only)
              </span>
              <button
                type="button"
                onClick={() => setShowKeyDrawer(false)}
                className="text-zinc-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Never stored in any database. Held strictly in active browser memory for this session and discarded when tab closes.
            </p>
            <div className="flex items-center gap-1.5">
              <input
                type="password"
                value={keyInputVal}
                onChange={(e) => setKeyInputVal(e.target.value)}
                placeholder="AIzaSy..."
                className="flex-1 px-3 py-1.5 rounded-xl bg-[#141417] border border-[#27272A] text-zinc-100 text-xs font-mono focus:outline-none focus:border-purple-500"
              />
              <button
                type="button"
                onClick={handleSaveSessionKey}
                disabled={keyTesting || !keyInputVal.trim()}
                className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
              >
                {keyTesting ? 'Verifying...' : 'Set Key'}
              </button>
            </div>
            {keyNotice && (
              <p className="text-[10px] text-amber-400">{keyNotice}</p>
            )}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative flex items-center"
        >
          <textarea
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask AI QA Architect (e.g. 'Add Playwright fixture failure analysis')..."
            rows={2}
            className="w-full pl-3.5 pr-12 py-2.5 rounded-2xl bg-[#09090B] border border-[#27272A] text-zinc-100 placeholder-zinc-500 text-xs focus:outline-none focus:border-purple-500 resize-none leading-relaxed"
          />
          <button
            type="submit"
            disabled={!inputPrompt.trim() || isLoading}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-40 disabled:hover:bg-purple-600 transition-colors cursor-pointer shadow"
            title="Send request"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
        <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono">
          <span>Press Enter to send • Shift+Enter for newline</span>
          <div className="flex items-center gap-2">
            {sessionApiKey ? (
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Session Key Active</span>
                <button
                  type="button"
                  onClick={handleClearSessionKey}
                  className="text-zinc-500 hover:text-rose-400 ml-1 underline cursor-pointer"
                  title="Clear in-memory key"
                >
                  Clear
                </button>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setShowKeyDrawer(true)}
                className="text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Key className="w-3 h-3" />
                <span>Set In-Memory Key</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
