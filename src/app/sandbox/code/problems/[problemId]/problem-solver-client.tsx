'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Play,
  RotateCcw,
  Copy,
  Check,
  Terminal,
  FileCode,
  Laptop,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  ArrowLeft,
  Code2,
  Tag,
  Sparkles,
} from 'lucide-react';
import {
  CodingProblem,
  DEFAULT_CODING_PROBLEMS,
  getAllProblems,
} from '@/lib/coding-problems';
import { QADatabase } from '@/lib/qa-db';
import {
  getCompletions,
  getCaretCoordinates,
  handleSmartEditorKeys,
  CompletionItem,
} from '@/lib/intellisense';
import { IntelliSenseOverlay } from '@/components/sandbox/code-intellisense-overlay';

// Extract error line number from compiler diagnostic or exception traceback
function extractErrorLineNumber(errorText: string): number | null {
  if (!errorText) return null;
  const pyMatch = errorText.match(/line\s+(\d+)/i);
  if (pyMatch) return parseInt(pyMatch[1], 10);
  const javaMatch = errorText.match(/:(\d+):\s*error/i);
  if (javaMatch) return parseInt(javaMatch[1], 10);
  const javaRuntimeMatch = errorText.match(/\.java:(\d+)\)/i);
  if (javaRuntimeMatch) return parseInt(javaRuntimeMatch[1], 10);
  const csMatch = errorText.match(/\((\d+),\d+\):\s*error/i);
  if (csMatch) return parseInt(csMatch[1], 10);
  const jsMatch = errorText.match(/:(\d+):\d+/);
  if (jsMatch) return parseInt(jsMatch[1], 10);
  return null;
}

export type SupportedLang = 'java' | 'python' | 'typescript' | 'javascript' | 'csharp';

const FILE_NAMES: Record<SupportedLang, string> = {
  java: 'Main.java',
  python: 'main.py',
  typescript: 'index.ts',
  javascript: 'index.js',
  csharp: 'Program.cs',
};

const LANG_LABELS: Record<SupportedLang, string> = {
  java: 'Java (OpenJDK)',
  python: 'Python 3',
  typescript: 'TypeScript',
  javascript: 'JavaScript',
  csharp: 'C# (.NET)',
};

// Normal compiler starter templates (clean blank compiler state)
export const DEFAULT_COMPILER_CODE: Record<SupportedLang, string> = {
  java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, SDET World!");
    }
}
`,
  python: `# Python 3
print("Hello, SDET World!")
`,
  typescript: `// TypeScript
const greeting: string = "Hello, SDET World!";
console.log(greeting);
`,
  javascript: `// JavaScript
console.log("Hello, SDET World!");
`,
  csharp: `using System;

public class Program {
    public static void Main() {
        Console.WriteLine("Hello, SDET World!");
    }
}
`,
};

export default function ProblemSolverClient({ problemId }: { problemId: string }) {
  const router = useRouter();
  const [allProblems, setAllProblems] = useState<CodingProblem[]>(DEFAULT_CODING_PROBLEMS);
  const [language, setLanguage] = useState<SupportedLang>('java');
  const [code, setCode] = useState<string>(DEFAULT_COMPILER_CODE['java']);
  const [stdinInput, setStdinInput] = useState<string>('');
  const [showStdin, setShowStdin] = useState<boolean>(false);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [terminalOutput, setTerminalOutput] = useState<string>('');
  const [terminalError, setTerminalError] = useState<string>('');
  const [executionStats, setExecutionStats] = useState<{
    durationMs?: number;
    status?: string;
    exitCode?: number;
  } | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Resizing state
  const [descriptionWidthPct, setDescriptionWidthPct] = useState<number>(40);
  const [compilerHeightPct, setCompilerHeightPct] = useState<number>(62);
  const [isHResizing, setIsHResizing] = useState<boolean>(false);
  const [isVResizing, setIsVResizing] = useState<boolean>(false);
  const [isDesktop, setIsDesktop] = useState<boolean>(true);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const mainContainerRef = useRef<HTMLDivElement>(null);
  const rightColumnRef = useRef<HTMLDivElement>(null);
  const editorAreaRef = useRef<HTMLDivElement>(null);

  // IntelliSense state
  const [intellisenseEnabled, setIntellisenseEnabled] = useState<boolean>(true);
  const [autoCloseBrackets, setAutoCloseBrackets] = useState<boolean>(true);
  const [suggestions, setSuggestions] = useState<CompletionItem[]>([]);
  const [selectedSuggestionIdx, setSelectedSuggestionIdx] = useState<number>(0);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState<boolean>(false);
  const [suggestionPosition, setSuggestionPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [matchedPrefix, setMatchedPrefix] = useState<string>('');
  const [replaceRange, setReplaceRange] = useState<{ start: number; end: number }>({ start: 0, end: 0 });

  const updateIntelliSense = (newCode: string, cursorPos: number) => {
    if (!intellisenseEnabled || !textareaRef.current) {
      setIsSuggestionsOpen(false);
      return;
    }

    const result = getCompletions({
      code: newCode,
      cursorPos,
      lang: language,
    });

    if (result && result.suggestions.length > 0) {
      setSuggestions(result.suggestions);
      setSelectedSuggestionIdx(0);
      setMatchedPrefix(result.matchedPrefix);
      setReplaceRange(result.replaceRange);

      const coords = getCaretCoordinates(textareaRef.current, cursorPos);
      const gutterWidth = lineNumbersRef.current ? lineNumbersRef.current.offsetWidth : 48;
      const top = coords.top - textareaRef.current.scrollTop + coords.height + 4;
      const left = coords.left - textareaRef.current.scrollLeft + gutterWidth;

      setSuggestionPosition({ top, left });
      setIsSuggestionsOpen(true);
    } else {
      setIsSuggestionsOpen(false);
    }
  };

  const applyCompletion = (item: CompletionItem) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = replaceRange.start;
    const end = replaceRange.end;
    const insert = item.insertText;

    const before = code.substring(0, start);
    const after = code.substring(end);
    const updatedCode = before + insert + after;

    setCode(updatedCode);
    setIsSuggestionsOpen(false);

    let nextPos = start + insert.length;
    if (typeof item.cursorOffset === 'number') {
      nextPos = start + item.cursorOffset;
    }

    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = nextPos;
    }, 0);
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    const pos = e.target.selectionStart;
    setCode(val);
    updateIntelliSense(val, pos);
  };

  const handleEditorScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = e.currentTarget.scrollTop;
    }
    if (isSuggestionsOpen && textareaRef.current) {
      const coords = getCaretCoordinates(textareaRef.current, textareaRef.current.selectionStart);
      const gutterWidth = lineNumbersRef.current ? lineNumbersRef.current.offsetWidth : 48;
      const top = coords.top - textareaRef.current.scrollTop + coords.height + 4;
      const left = coords.left - textareaRef.current.scrollLeft + gutterWidth;
      setSuggestionPosition({ top, left });
    }
  };

  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 1024);
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  // Horizontal resizer (Description vs Compiler+Output)
  const startHResizing = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsHResizing(true);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!mainContainerRef.current) return;
      const rect = mainContainerRef.current.getBoundingClientRect();
      const currentX = moveEvent.clientX - rect.left;
      const pct = (currentX / rect.width) * 100;
      const clamped = Math.min(Math.max(pct, 20), 70);
      setDescriptionWidthPct(clamped);
    };

    const handleMouseUp = () => {
      setIsHResizing(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Vertical resizer (Compiler vs Output in right column)
  const startVResizing = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsVResizing(true);
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!rightColumnRef.current) return;
      const rect = rightColumnRef.current.getBoundingClientRect();
      const currentY = moveEvent.clientY - rect.top;
      const pct = (currentY / rect.height) * 100;
      const clamped = Math.min(Math.max(pct, 25), 80);
      setCompilerHeightPct(clamped);
    };

    const handleMouseUp = () => {
      setIsVResizing(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Load problems and initialize with normal compiler starter code
  useEffect(() => {
    const list = getAllProblems();
    setAllProblems(list);
    // User requirement: Keep it blank / same as normal compiler
    setCode(DEFAULT_COMPILER_CODE[language]);
  }, [problemId, language]);

  const currentProblem = allProblems.find(p => p.id === problemId) || DEFAULT_CODING_PROBLEMS.find(p => p.id === problemId) || DEFAULT_CODING_PROBLEMS[0];
  const currentIndex = allProblems.findIndex(p => p.id === problemId);

  // Language change: switch to normal compiler starter template for that language
  const handleLanguageChange = (newLang: SupportedLang) => {
    setLanguage(newLang);
    setCode(DEFAULT_COMPILER_CODE[newLang]);
    setTerminalOutput('');
    setTerminalError('');
    setExecutionStats(null);
    setIsSuggestionsOpen(false);
  };

  // User requirement 2: When user clicks on Solutions, paste solution code in the compiler section
  const handleLoadSolution = () => {
    if (currentProblem && currentProblem.starterTemplates) {
      const solutionCode = currentProblem.starterTemplates[language] || '';
      setCode(solutionCode);
      setIsSuggestionsOpen(false);
      setFeedback(`✨ Solution code pasted into compiler (${LANG_LABELS[language]})! Click 'Run' to test.`);
      setTimeout(() => setFeedback(null), 3500);

      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  };

  // User requirement 4: Reset should reset the solution code pasted back to normal Compiler
  const handleReset = () => {
    setCode(DEFAULT_COMPILER_CODE[language]);
    setIsSuggestionsOpen(false);
    setFeedback('Code reset back to normal compiler starter template.');
    setTimeout(() => setFeedback(null), 2500);
    setTerminalOutput('');
    setTerminalError('');
    setExecutionStats(null);
    setStdinInput('');

    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClearTerminal = () => {
    setTerminalOutput('');
    setTerminalError('');
    setExecutionStats(null);
  };

  // Navigate problems
  const handlePrev = () => {
    if (currentIndex > 0) {
      router.push(`/sandbox/code/problems/${allProblems[currentIndex - 1].id}`);
    }
  };

  const handleNext = () => {
    if (currentIndex < allProblems.length - 1) {
      router.push(`/sandbox/code/problems/${allProblems[currentIndex + 1].id}`);
    }
  };

  // Indentation support, IntelliSense autocomplete, bracket auto-closing & Ctrl/Cmd+Enter to run
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // If suggestions are open, handle navigation & selection
    if (isSuggestionsOpen && suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedSuggestionIdx((prev) => (prev + 1) % suggestions.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedSuggestionIdx((prev) => (prev - 1 + suggestions.length) % suggestions.length);
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        applyCompletion(suggestions[selectedSuggestionIdx]);
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setIsSuggestionsOpen(false);
        return;
      }
    }

    // Manual trigger with Ctrl+Space or Alt+/
    if (
      ((e.ctrlKey || e.metaKey) && (e.key === ' ' || e.key === 'Spacebar')) ||
      (e.altKey && e.key === '/')
    ) {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (textarea) {
        updateIntelliSense(code, textarea.selectionStart);
      }
      return;
    }

    // Smart editor keys: auto-closing pairs, skip-over, auto-indent on Enter
    const smartResult = handleSmartEditorKeys(e, code, autoCloseBrackets);
    if (smartResult.handled) {
      if (smartResult.newCode !== undefined) {
        setCode(smartResult.newCode);
      }
      if (smartResult.newCursorPos !== undefined) {
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.selectionStart = textareaRef.current.selectionEnd = smartResult.newCursorPos!;
          }
        }, 0);
      }
      return;
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const spaces = '    ';

      setCode(code.substring(0, start) + spaces + code.substring(end));
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 4;
      }, 0);
      return;
    }

    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleRunCode();
    }
  };

  // Execute compiler API call
  const handleRunCode = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setTerminalOutput('Compiling and executing...');
    setTerminalError('');

    try {
      const geminiKey = QADatabase.getUserGeminiKey() || '';
      const res = await fetch('/api/sandbox/compiler', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(geminiKey ? { 'x-gemini-api-key': geminiKey } : {}),
        },
        body: JSON.stringify({
          language,
          code,
          stdin: stdinInput,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setTerminalOutput(
          data.stdout || (data.success ? 'Program executed successfully with no output.' : '')
        );
        setTerminalError(data.stderr || '');
        setExecutionStats({
          durationMs: data.executionTimeMs,
          status: data.status,
          exitCode: data.exitCode,
        });
      } else {
        setTerminalOutput('');
        setTerminalError(data.error || 'Failed to compile and execute code.');
        setExecutionStats({
          status: 'error',
          exitCode: 1,
        });
      }
    } catch (err: any) {
      setTerminalOutput('');
      setTerminalError(err.message || 'Execution error: Could not reach compiler service.');
      setExecutionStats({
        status: 'network_error',
        exitCode: 1,
      });
    } finally {
      setIsRunning(false);
    }
  };

  const lineCount = code.split('\n').length;
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);
  const detectedErrorLine = extractErrorLineNumber(terminalError);

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Top Breadcrumb Navigation */}
      <div className="border-b border-slate-800 bg-slate-900/90 px-4 py-2.5 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <Link
              href="/sandbox/code/problems"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
              title="Back to Coding Problems Library"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                <Link href="/sandbox/code" className="hover:text-white transition">Hands-On Coding Lab</Link>
                <span>/</span>
                <Link href="/sandbox/code/problems" className="hover:text-white transition">Coding Library</Link>
                <span>/</span>
                <span className="text-emerald-400 font-semibold truncate max-w-[200px]">{currentProblem.title}</span>
              </div>
              <h1 className="text-sm md:text-base font-bold text-white flex items-center gap-2">
                {currentProblem.title}
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    currentProblem.difficulty === 'Easy'
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      : currentProblem.difficulty === 'Medium'
                      ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                      : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                  }`}
                >
                  {currentProblem.difficulty}
                </span>
              </h1>
            </div>
          </div>

          {/* Quick Problem Navigation */}
          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentIndex <= 0}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 hover:text-white transition flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed"
              title="Previous Problem"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Prev</span>
            </button>
            <span className="text-[11px] text-slate-400 font-mono">
              {currentIndex + 1} of {allProblems.length}
            </span>
            <button
              type="button"
              onClick={handleNext}
              disabled={currentIndex >= allProblems.length - 1}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 hover:text-white transition flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed"
              title="Next Problem"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main 2-Column Split View: Description on Left, Compiler & Output on Right (Resizable) */}
      <div
        ref={mainContainerRef}
        className="flex-1 flex flex-col lg:flex-row overflow-hidden max-w-7xl w-full mx-auto p-3 md:p-4 gap-2 h-[calc(100vh-125px)] min-h-[600px]"
      >
        {/* LEFT COLUMN: Description & Examples */}
        <div
          style={isDesktop ? { width: `${descriptionWidthPct}%` } : undefined}
          className="w-full lg:w-auto flex flex-col bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl shrink-0 h-full min-w-[280px]"
        >
          {/* Header */}
          <div className="p-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 text-white font-bold text-xs border border-slate-700">
                <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                <span>Description</span>
              </div>

              {/* Requirement 1 & 2: Solutions button beside Description */}
              <button
                type="button"
                onClick={handleLoadSolution}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 hover:border-emerald-500/50 text-xs font-bold transition shadow-xs cursor-pointer group"
                title={`Paste verified ${LANG_LABELS[language]} solution code into the compiler editor`}
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span>Solutions</span>
              </button>
            </div>

            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {currentProblem.category}
            </span>
          </div>

          {/* Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs leading-relaxed">
            <div>
              <h2 className="text-base font-bold text-white mb-2 leading-snug">
                {currentProblem.title}
              </h2>
              <div className="flex items-center gap-2 flex-wrap mb-3">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    currentProblem.difficulty === 'Easy'
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      : currentProblem.difficulty === 'Medium'
                      ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                      : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                  }`}
                >
                  {currentProblem.difficulty}
                </span>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {currentProblem.category}
                </span>
                {currentProblem.isCustom && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    Custom Question
                  </span>
                )}
              </div>
            </div>

            {/* Description Text */}
            <div className="text-slate-300 leading-relaxed whitespace-pre-line bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
              {currentProblem.description}
            </div>

            {/* Test Case Examples */}
            {currentProblem.examples.length > 0 && (
              <div className="space-y-2.5">
                <h3 className="font-bold text-slate-200 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-blue-400" />
                  Examples
                </h3>
                {currentProblem.examples.map((ex, i) => (
                  <div
                    key={i}
                    className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-1 font-mono text-[11px]"
                  >
                    <div className="text-slate-400">
                      <strong className="text-slate-300">Input:</strong> {ex.input}
                    </div>
                    <div className="text-emerald-400">
                      <strong className="text-slate-300">Output:</strong> {ex.output}
                    </div>
                    {ex.explanation && (
                      <div className="text-slate-400 font-sans text-[11px] pt-1 border-t border-slate-800/60">
                        <strong className="text-slate-300">Explanation:</strong> {ex.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Constraints */}
            {currentProblem.constraints && currentProblem.constraints.length > 0 && (
              <div className="space-y-1.5">
                <h3 className="font-bold text-slate-200 text-[11px] uppercase tracking-wider">
                  Constraints
                </h3>
                <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px]">
                  {currentProblem.constraints.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Resizer Handle between Description and Right Column */}
        <div
          onMouseDown={startHResizing}
          className="hidden lg:flex w-2.5 items-center justify-center cursor-col-resize group shrink-0 select-none py-4"
          title="Drag left/right to resize Description and Compiler"
        >
          <div className={`w-1 h-20 rounded-full transition-colors ${isHResizing ? 'bg-emerald-500' : 'bg-slate-700 group-hover:bg-emerald-400'}`} />
        </div>

        {/* RIGHT COLUMN: Compiler Section (Top) + Output / Result Section (Directly Below Compiler) */}
        <div
          ref={rightColumnRef}
          style={isDesktop ? { width: `calc(${100 - descriptionWidthPct}% - 0.625rem)` } : undefined}
          className="flex-1 flex flex-col gap-2 min-w-0 h-full overflow-hidden"
        >
          {/* COMPILER SECTION */}
          <div
            style={isDesktop ? { height: `${compilerHeightPct}%` } : undefined}
            className="flex flex-col min-w-0 bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden shadow-xl min-h-[220px] shrink-0"
          >
            {/* Action Bar: Language Selector + Run / Reset Buttons */}
            <div className="p-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <label htmlFor="lang-select" className="text-xs font-semibold text-slate-300">
                  Language:
                </label>
                <div className="relative">
                  <select
                    id="lang-select"
                    value={language}
                    onChange={(e) => handleLanguageChange(e.target.value as SupportedLang)}
                    className="bg-slate-950 border border-slate-700 hover:border-slate-600 rounded-xl px-3 py-1 text-xs font-bold text-white focus:outline-none focus:border-emerald-500 cursor-pointer shadow-xs pr-7 transition-colors appearance-none"
                  >
                    <option value="java">Java (OpenJDK)</option>
                    <option value="python">Python 3</option>
                    <option value="typescript">TypeScript</option>
                    <option value="javascript">JavaScript</option>
                    <option value="csharp">C# (.NET)</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {/* Run Button */}
                <button
                  type="button"
                  onClick={handleRunCode}
                  disabled={isRunning}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md transition cursor-pointer ${
                    isRunning
                      ? 'bg-emerald-700/50 text-emerald-200 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20 hover:shadow-lg'
                  }`}
                  title="Run and compile code (Ctrl + Enter)"
                >
                  {isRunning ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Running...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Run</span>
                    </>
                  )}
                </button>

                {/* Reset Button */}
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1 border border-slate-700 transition cursor-pointer"
                  title="Reset code back to normal compiler starter template"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>

                {/* Copy Code */}
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1 border border-slate-700 transition cursor-pointer"
                  title="Copy code to clipboard"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>

                {/* Stdin Toggle */}
                <button
                  type="button"
                  onClick={() => setShowStdin(!showStdin)}
                  className={`px-2 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                    showStdin
                      ? 'bg-blue-600/20 border-blue-500/40 text-blue-300'
                      : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                  title="Toggle standard input"
                >
                  Stdin {showStdin ? '▲' : '▼'}
                </button>

                {/* IntelliSense Toggle Button */}
                <button
                  type="button"
                  onClick={() => setIntellisenseEnabled(!intellisenseEnabled)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer flex items-center gap-1.5 ${
                    intellisenseEnabled
                      ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25'
                      : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                  title={
                    intellisenseEnabled
                      ? 'IntelliSense Active (Ctrl+Space for suggestions). Click to disable.'
                      : 'IntelliSense Disabled. Click to enable.'
                  }
                >
                  <Sparkles className={`w-3.5 h-3.5 ${intellisenseEnabled ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span className="hidden sm:inline">IntelliSense</span>
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      intellisenseEnabled ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]' : 'bg-slate-500'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Optional Feedback Banner */}
            {feedback && (
              <div className="py-1 px-3 bg-emerald-950/80 border-b border-emerald-700/60 text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{feedback}</span>
              </div>
            )}

            {/* Stdin Panel */}
            {showStdin && (
              <div className="p-3 bg-slate-950/90 border-b border-slate-800">
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Standard Input (stdin):
                </label>
                <textarea
                  value={stdinInput}
                  onChange={(e) => setStdinInput(e.target.value)}
                  rows={2}
                  placeholder="Enter input values passed to program..."
                  className="w-full text-xs font-mono bg-slate-900 border border-slate-700/80 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>
            )}

            {/* Code Textarea Editor with Line Numbers */}
            <div
              ref={editorAreaRef}
              className="flex-1 flex overflow-hidden bg-slate-950 font-mono text-xs relative min-h-[240px]"
            >
              {/* Line Numbers */}
              <div
                ref={lineNumbersRef}
                className="w-12 py-4 px-2 bg-slate-900/60 text-slate-500 text-right select-none border-r border-slate-800/80 shrink-0 overflow-hidden font-mono text-xs leading-6"
              >
                {lineNumbers.map((num) => {
                  const isError = detectedErrorLine === num;
                  return (
                    <div
                      key={num}
                      className={`leading-6 pr-1 font-mono transition-colors ${
                        isError
                          ? 'text-rose-400 font-extrabold bg-rose-500/25 rounded-xs'
                          : 'text-slate-600 hover:text-slate-400'
                      }`}
                      title={isError ? `Error detected on line ${num}` : `Line ${num}`}
                    >
                      {num}
                    </div>
                  );
                })}
              </div>

              {/* Code Input */}
              <textarea
                ref={textareaRef}
                value={code}
                onChange={handleCodeChange}
                onKeyDown={handleKeyDown}
                onScroll={handleEditorScroll}
                spellCheck={false}
                className="flex-1 w-full p-4 bg-transparent text-slate-200 font-mono text-xs leading-6 resize-none focus:outline-none focus:ring-0 whitespace-pre overflow-auto"
                placeholder="Write your code solution here..."
              />

              {/* Floating Code IntelliSense Dropdown Overlay */}
              <IntelliSenseOverlay
                isOpen={isSuggestionsOpen}
                suggestions={suggestions}
                selectedIndex={selectedSuggestionIdx}
                matchedPrefix={matchedPrefix}
                position={suggestionPosition}
                onSelect={applyCompletion}
                onHover={setSelectedSuggestionIdx}
                onClose={() => setIsSuggestionsOpen(false)}
                containerRef={editorAreaRef}
              />
            </div>

            {/* Status Footer */}
            <div className="px-3 py-1.5 bg-slate-900 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Runtime: <strong className="text-slate-300">{LANG_LABELS[language]}</strong>
                </span>
                <span className="text-slate-600">|</span>
                <span className="flex items-center gap-1 text-slate-300">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  IntelliSense:{' '}
                  <span className={intellisenseEnabled ? 'text-emerald-400 font-semibold' : 'text-slate-500'}>
                    {intellisenseEnabled ? 'Active' : 'Off'}
                  </span>
                </span>
                <span className="text-slate-600">|</span>
                <span>{lineCount} lines</span>
                {detectedErrorLine && (
                  <span className="text-rose-400 font-semibold flex items-center gap-1">
                    ● Error on Line {detectedErrorLine}
                  </span>
                )}
              </span>
              <span>Shortcut: <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">Enter</kbd> to Run</span>
            </div>
          </div>

          {/* Resizer Handle between Compiler and Output */}
          <div
            onMouseDown={startVResizing}
            className="h-2.5 flex items-center justify-center cursor-row-resize group shrink-0 select-none px-4"
            title="Drag up/down to resize Compiler and Output"
          >
            <div className={`h-1 w-20 rounded-full transition-colors ${isVResizing ? 'bg-emerald-500' : 'bg-slate-700 group-hover:bg-emerald-400'}`} />
          </div>

          {/* OUTPUT / RESULT SECTION (POSITIONED DIRECTLY BELOW COMPILER) */}
          <div
            style={isDesktop ? { height: `calc(${100 - compilerHeightPct}% - 0.625rem)` } : undefined}
            className="flex flex-col bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden shadow-xl min-h-[140px] shrink-0"
          >
            {/* Header */}
            <div className="p-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-white tracking-wide">Output / Result</span>
              </div>

              <div className="flex items-center gap-2">
                {executionStats && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      executionStats.status === 'success'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    {executionStats.status === 'success' ? '✔ Finished' : '✖ Error'}
                    {executionStats.durationMs !== undefined && ` (${executionStats.durationMs}ms)`}
                  </span>
                )}
              </div>
            </div>

            {/* Terminal Output Body */}
            <div className="flex-1 bg-black/95 p-3.5 font-mono text-xs overflow-auto min-h-[120px] leading-relaxed">
              {isRunning && (
                <div className="flex items-center gap-2 text-emerald-400 py-2">
                  <div className="w-3.5 h-3.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                  <span>Compiling and executing {FILE_NAMES[language]}...</span>
                </div>
              )}

              {!isRunning && !terminalOutput && !terminalError && (
                <div className="text-slate-500 italic py-5 text-center flex flex-col items-center gap-1.5">
                  <Terminal className="w-6 h-6 opacity-40" />
                  <p>Click &quot;Run&quot; to execute your solution against sample test inputs.</p>
                </div>
              )}

              {/* Standard Output */}
              {terminalOutput && (
                <pre className="text-emerald-400 whitespace-pre-wrap font-mono select-text">
                  {terminalOutput}
                </pre>
              )}

              {/* Error Output */}
              {terminalError && (
                <div className="mt-2 p-3 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-300 whitespace-pre-wrap font-mono">
                  <div className="flex items-center gap-1.5 font-bold text-rose-400 mb-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>Compilation / Runtime Diagnostic:</span>
                  </div>
                  {terminalError}
                </div>
              )}
            </div>

            {/* Terminal Footer */}
            <div className="px-3 py-1.5 bg-slate-900 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span className="text-slate-500">Execution Engine:</span>
              <span className="text-slate-300 font-mono text-[11px]">
                {language === 'java' && 'OpenJDK 17 / JVM'}
                {language === 'python' && 'Python 3.13'}
                {language === 'typescript' && 'TypeScript 5.x / Node.js'}
                {language === 'javascript' && 'Node.js v20 (V8)'}
                {language === 'csharp' && '.NET 8 / C# Compiler'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
