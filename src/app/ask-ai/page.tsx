'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Bot,
  Send,
  BookOpen,
  RotateCcw,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Layers,
  ArrowRight,
  GraduationCap,
  RefreshCw,
  Search,
} from 'lucide-react';
import { Citation, RAGAnswerResult } from '@/lib/rag/types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
  modelUsed?: string;
  latencyMs?: number;
  courseContext?: string | null;
  insufficientKnowledge?: boolean;
}

const SUGGESTED_QUESTIONS = [
  'Explain Git and GitHub.',
  'What is API testing?',
  'Explain Playwright fixtures with an example.',
  'Give me interview questions on Selenium.',
  'Explain CI/CD with a practical example.',
  'Help me prepare for a Test Architect interview.',
];

const AVAILABLE_COURSES = [
  { id: '', title: 'All Academy Courses (Global Search)' },
  { id: 'course-ai-qa-mastery', title: 'AI Academy: Modern Quality Engineering' },
  { id: 'course-playwright-mastery', title: 'Playwright Automation with TypeScript' },
  { id: 'course-selenium-mastery', title: 'Selenium WebDriver 4 Enterprise' },
  { id: 'course-rest-assured', title: 'REST Assured API Automation' },
  { id: 'course-api-testing', title: 'Comprehensive API Testing & Postman' },
  { id: 'course-cicd-devops', title: 'DevOps & CI/CD Pipelines for QA' },
  { id: 'course-test-architecture', title: 'Enterprise Test Architecture & Strategy' },
  { id: 'course-manual-qa-bootcamp', title: 'Manual Testing & Agile QA Mastery' },
];

export default function AskAIPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-001',
      role: 'assistant',
      content:
        'Welcome to QA Learning Academy AI Assistant. Ask me about software testing, automation, API testing, Playwright, Selenium, CI/CD, interview preparation or any topic available in our courses.',
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputQuery).trim();
    if (!query || isLoading) return;

    setErrorMessage(null);
    setInputQuery('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    const userMsgId = `user-${Date.now()}`;
    const newMessages: Message[] = [
      ...messages,
      {
        id: userMsgId,
        role: 'user',
        content: query,
        courseContext: selectedCourseId || null,
      },
    ];

    setMessages(newMessages);
    setIsLoading(true);

    try {
      // Build history for follow-up turns
      const historyPayload = newMessages.slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/ai/rag/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: query,
          courseId: selectedCourseId || null,
          history: historyPayload,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || `Server returned status ${res.status}`);
      }

      const data: RAGAnswerResult = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          id: `asst-${Date.now()}`,
          role: 'assistant',
          content: data.answer,
          citations: data.citations,
          modelUsed: data.modelUsed,
          latencyMs: data.latencyMs,
          courseContext: selectedCourseId || null,
          insufficientKnowledge: data.insufficientKnowledge,
        },
      ]);
    } catch (err: any) {
      console.error('AskAI error:', err);
      setErrorMessage(err.message || 'Failed to reach AI assistant. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome-001',
        role: 'assistant',
        content:
          'Welcome to QA Learning Academy AI Assistant. Ask me about software testing, automation, API testing, Playwright, Selenium, CI/CD, interview preparation or any topic available in our courses.',
      },
    ]);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-[#0D0D0E] text-white flex flex-col font-sans">
      {/* Top Header Bar */}
      <header className="border-b border-[#262626] bg-[#141415]/80 backdrop-blur sticky top-0 z-20 px-4 py-3 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Ask AI — QA Learning Assistant
                </h1>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold">
                  RAG Grounded
                </span>
              </div>
              <p className="text-xs text-[#A1A1AA]">
                Official curriculum knowledge engine with source citations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Course Context Picker */}
            <div className="flex items-center gap-2 bg-[#1A1A1C] border border-[#2E2E32] rounded-lg px-2.5 py-1.5">
              <GraduationCap className="w-4 h-4 text-purple-400 hidden sm:inline" />
              <select
                aria-label="Course Focus Scope"
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="bg-transparent text-xs text-white outline-none cursor-pointer pr-2 max-w-[200px] sm:max-w-[260px] truncate"
              >
                {AVAILABLE_COURSES.map((c) => (
                  <option key={c.id} value={c.id} className="bg-[#1A1A1C] text-white">
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleClearChat}
              className="flex items-center gap-1.5 text-xs text-[#A1A1AA] hover:text-white px-2.5 py-1.5 rounded-lg border border-[#2E2E32] hover:border-neutral-600 transition"
              title="Reset conversation"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Chat</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Chat Workspace */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 flex flex-col justify-between">
        {/* Messages Stream */}
        <div className="space-y-6 mb-6">
          {messages.map((m) => {
            const isUser = m.role === 'user';
            return (
              <div
                key={m.id}
                className={`flex gap-3 sm:gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0 mt-1">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[88%] sm:max-w-[80%] rounded-2xl p-4 sm:p-5 shadow-sm text-sm sm:text-base leading-relaxed ${
                    isUser
                      ? 'bg-purple-600 text-white rounded-tr-none'
                      : 'bg-[#18181A] border border-[#27272A] text-neutral-200 rounded-tl-none'
                  }`}
                >
                  {/* Context Badge if course locked */}
                  {m.courseContext && !isUser && (
                    <div className="mb-2.5 inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 text-[11px] font-mono font-medium">
                      <BookOpen className="w-3 h-3" />
                      Scope:{' '}
                      {AVAILABLE_COURSES.find((c) => c.id === m.courseContext)?.title || 'Course'}
                    </div>
                  )}

                  {/* Message Content */}
                  <div className="prose prose-invert prose-sm sm:prose-base max-w-none whitespace-pre-line">
                    {m.content}
                  </div>

                  {/* Source Citations with Clickable Links */}
                  {m.citations && m.citations.length > 0 && (
                    <div className="mt-4 pt-3.5 border-t border-[#2E2E32]">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-400 mb-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Curriculum Sources &amp; Citations:</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                        {m.citations.map((c, idx) => (
                          <Link
                            key={`${c.sourceId}-${idx}`}
                            href={c.url}
                            target="_blank"
                            className="group p-2.5 rounded-lg bg-[#222226] hover:bg-[#2A2A30] border border-[#2E2E32] hover:border-purple-500/40 transition flex items-start justify-between gap-2 text-left"
                          >
                            <div className="overflow-hidden">
                              <div className="text-xs font-medium text-white group-hover:text-purple-300 truncate">
                                {c.sourceTitle}
                              </div>
                              <div className="text-[11px] text-neutral-400 capitalize flex items-center gap-2 mt-0.5">
                                <span>{c.sourceType.replace('_', ' ')}</span>
                                <span>•</span>
                                <span className="text-emerald-400 font-mono">
                                  {Math.round(c.similarity * 100)}% match
                                </span>
                              </div>
                            </div>
                            <ExternalLink className="w-3.5 h-3.5 text-neutral-500 group-hover:text-purple-400 shrink-0 mt-0.5" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Engine metadata footer */}
                  {m.modelUsed && (
                    <div className="mt-2 text-[10px] text-neutral-500 font-mono flex items-center justify-end gap-2">
                      <span>{m.modelUsed}</span>
                      {m.latencyMs !== undefined && <span>• {m.latencyMs}ms</span>}
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center text-neutral-300 shrink-0 mt-1 font-semibold text-xs">
                    YOU
                  </div>
                )}
              </div>
            );
          })}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex gap-3 items-center text-neutral-400 text-xs sm:text-sm pl-2">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 animate-pulse">
                <RefreshCw className="w-4 h-4 animate-spin text-purple-400" />
              </div>
              <div className="flex items-center gap-1.5 font-medium">
                <span>
                  Retrieving verified curriculum sources &amp; generating grounded answer...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts (when only welcome message) */}
        {messages.length === 1 && (
          <div className="my-6">
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
              Suggested Questions for QA Learners:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SUGGESTED_QUESTIONS.map((sq, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(sq)}
                  className="text-left p-3 rounded-xl bg-[#18181A] hover:bg-[#202024] border border-[#27272A] hover:border-purple-500/40 text-xs sm:text-sm text-neutral-300 hover:text-white transition flex items-center justify-between group"
                >
                  <span>{sq}</span>
                  <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:text-purple-400 shrink-0 ml-2" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Error Notification */}
        {errorMessage && (
          <div className="mb-4 p-3.5 rounded-xl bg-red-950/30 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Bottom Input Field */}
        <div className="sticky bottom-4 bg-[#141415] border border-[#27272A] focus-within:border-purple-500/60 rounded-2xl p-2 shadow-2xl transition">
          <div className="flex items-end gap-2">
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputQuery}
              onChange={(e) => {
                setInputQuery(e.target.value);
                if (textareaRef.current) {
                  textareaRef.current.style.height = 'auto';
                  textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={
                selectedCourseId
                  ? `Ask about ${AVAILABLE_COURSES.find((c) => c.id === selectedCourseId)?.title}...`
                  : 'Ask about testing, Playwright, Selenium, API testing, CI/CD, or interview preparation...'
              }
              className="flex-1 bg-transparent border-0 text-sm sm:text-base text-white placeholder-neutral-500 outline-none resize-none px-3 py-2 max-h-32"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputQuery.trim() || isLoading}
              className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:hover:bg-purple-600 text-white transition flex items-center justify-center shrink-0"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <div className="px-3 pt-1 text-[11px] text-neutral-500 flex items-center justify-between">
            <span>Powered by Supabase pgvector + IntelligentQA Curriculum Engine</span>
            <span>Shift + Enter for new line</span>
          </div>
        </div>
      </main>
    </div>
  );
}
