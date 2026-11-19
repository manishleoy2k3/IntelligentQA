"use client";

import React, { useState, useRef, useEffect } from "react";
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
  Sparkles,
} from "lucide-react";
import { QADatabase } from "@/lib/qa-db";
import {
  getCompletions,
  getCaretCoordinates,
  handleSmartEditorKeys,
  CompletionItem,
} from "@/lib/intellisense";
import { IntelliSenseOverlay } from "@/components/sandbox/code-intellisense-overlay";

// Extract error line number from compiler diagnostic or exception traceback
function extractErrorLineNumber(errorText: string): number | null {
  if (!errorText) return null;
  const pyMatch = errorText.match(/line\s+(\d+)/i);
  if (pyMatch) return parseInt(pyMatch[1], 10);
  const javaMatch = errorText.match(/:(\d+):\s*error/i);
  if (javaMatch) return parseInt(javaMatch[1], 10);
  const jsMatch = errorText.match(/:(\d+):\d+/);
  if (jsMatch) return parseInt(jsMatch[1], 10);
  return null;
}

export type SupportedLang =
  | "java"
  | "python"
  | "typescript"
  | "javascript"
  | "csharp";

const STARTER_CODES: Record<SupportedLang, string> = {
  java: `/******************************************************************************

                            Online Java Compiler.
                Code, Compile, Run and Debug Java program online.
            Write your code in this editor and run it to execute it.

*******************************************************************************/

public class Main
{
    public static void main(String[] args) {
        System.out.println("Hello World");
    }
}
`,
  python: `'''

                            Online Python Compiler.
                Code, Compile, Run and Debug Python program online.
Write your code in this editor and run it to execute it.

'''

print("Hello World")
`,
  typescript: `/**
 * Online TypeScript Compiler & Runner.
 * Code, Compile, and Execute TypeScript online.
 */

const message: string = "Hello World";
console.log(message);
`,
  javascript: `/**
 * Online JavaScript Runner.
 * Code and Execute JavaScript online.
 */

const message = "Hello World";
console.log(message);
`,
  csharp: `/******************************************************************************

                            Online C# Compiler.
                Code, Compile, Run and Debug C# program online.
Write your code in this editor and run it to execute it.

*******************************************************************************/
using System;

class Program
{
    static void Main(string[] args)
    {
        Console.WriteLine("Hello World");
    }
}
`,
};

const FILE_NAMES: Record<SupportedLang, string> = {
  java: "Main.java",
  python: "main.py",
  typescript: "index.ts",
  javascript: "index.js",
  csharp: "Program.cs",
};

const LANG_LABELS: Record<SupportedLang, string> = {
  java: "Java (OpenJDK)",
  python: "Python 3",
  typescript: "TypeScript",
  javascript: "JavaScript",
  csharp: "C# (.NET)",
};

export default function OnlineCompilerPage() {
  const [language, setLanguage] = useState<SupportedLang>("java");
  const [code, setCode] = useState<string>(STARTER_CODES.java);
  const [stdinInput, setStdinInput] = useState<string>("");
  const [showStdin, setShowStdin] = useState<boolean>(false);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [terminalOutput, setTerminalOutput] = useState<string>("");
  const [terminalError, setTerminalError] = useState<string>("");
  const [executionStats, setExecutionStats] = useState<{
    durationMs?: number;
    status?: string;
    exitCode?: number;
  } | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [resetFeedback, setResetFeedback] = useState<boolean>(false);
  const [editorWidthPct, setEditorWidthPct] = useState<number>(55);
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const [isDesktop, setIsDesktop] = useState<boolean>(true);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
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
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 768);
    checkDesktop();
    window.addEventListener("resize", checkDesktop);
    return () => window.removeEventListener("resize", checkDesktop);
  }, []);

  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const currentX = moveEvent.clientX - rect.left;
      const pct = (currentX / rect.width) * 100;
      const clamped = Math.min(Math.max(pct, 25), 75);
      setEditorWidthPct(clamped);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  // Switch Language
  const handleLanguageChange = (newLang: SupportedLang) => {
    setLanguage(newLang);
    setCode(STARTER_CODES[newLang]);
    setTerminalOutput("");
    setTerminalError("");
    setExecutionStats(null);
    setIsSuggestionsOpen(false);
  };

  // Explicit Reset Handler: restores default starter code for current language
  const handleReset = () => {
    setCode(STARTER_CODES[language]);
    setTerminalOutput("");
    setTerminalError("");
    setExecutionStats(null);
    setStdinInput("");
    setIsSuggestionsOpen(false);
    setResetFeedback(true);
    setTimeout(() => setResetFeedback(false), 2000);

    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Copy code to clipboard
  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Clear Terminal Output
  const handleClearTerminal = () => {
    setTerminalOutput("");
    setTerminalError("");
    setExecutionStats(null);
  };

  // Indentation support, IntelliSense autocomplete, bracket auto-closing & Ctrl/Cmd+Enter to run
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // If suggestions are open, handle navigation & selection
    if (isSuggestionsOpen && suggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedSuggestionIdx((prev) => (prev + 1) % suggestions.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedSuggestionIdx((prev) => (prev - 1 + suggestions.length) % suggestions.length);
        return;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        applyCompletion(suggestions[selectedSuggestionIdx]);
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        setIsSuggestionsOpen(false);
        return;
      }
    }

    // Manual trigger with Ctrl+Space or Alt+/
    if (
      ((e.ctrlKey || e.metaKey) && (e.key === " " || e.key === "Spacebar")) ||
      (e.altKey && e.key === "/")
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

    // Indentation support: 4 spaces on Tab key
    if (e.key === "Tab") {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const spaces = "    ";

      setCode(code.substring(0, start) + spaces + code.substring(end));
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 4;
      }, 0);
      return;
    }

    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleRunCode();
    }
  };

  // Compile & Execute API Call
  const handleRunCode = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setTerminalOutput("Compiling and executing...");
    setTerminalError("");

    try {
      const geminiKey = QADatabase.getUserGeminiKey() || '';
      const res = await fetch('/api/sandbox/compiler', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(geminiKey ? { "x-gemini-api-key": geminiKey } : {}),
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
          data.stdout ||
            (data.success
              ? "Program executed successfully with no output."
              : ""),
        );
        setTerminalError(data.stderr || "");
        setExecutionStats({
          durationMs: data.executionTimeMs,
          status: data.status,
          exitCode: data.exitCode,
        });
      } else {
        setTerminalOutput("");
        setTerminalError(data.error || "Failed to compile and execute code.");
        setExecutionStats({
          status: "error",
          exitCode: 1,
        });
      }
    } catch (err: any) {
      setTerminalOutput("");
      setTerminalError(
        err.message || "Execution error: Could not reach compiler service.",
      );
      setExecutionStats({
        status: "network_error",
        exitCode: 1,
      });
    } finally {
      setIsRunning(false);
    }
  };

  const lineCount = code.split("\n").length;
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);
  const detectedErrorLine = extractErrorLineNumber(terminalError);

  return (
    <div className="flex flex-col h-full min-h-[calc(100vh-60px)] bg-slate-950 text-slate-100 font-sans">
      {/* Top Header / Breadcrumb Bar */}
      <div className="border-b border-slate-800 bg-slate-900/90 px-4 py-2.5 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base md:text-lg font-bold tracking-tight text-white flex items-center gap-2">
                Online Compilers
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {LANG_LABELS[language]}
                </span>
              </h1>
              <p className="text-[11px] text-slate-400">
                Write, compile, and execute Java, Python, TypeScript,
                JavaScript, and C# programs online.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Action Toolbar with Language Dropdown & Run Buttons */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Language Selector Dropdown */}
          <div className="flex items-center gap-2.5">
            <label
              htmlFor="language-select"
              className="text-xs font-semibold text-slate-300"
            >
              Language:
            </label>
            <div className="relative">
              <select
                id="language-select"
                value={language}
                onChange={(e) =>
                  handleLanguageChange(e.target.value as SupportedLang)
                }
                className="bg-slate-950 border border-slate-700 hover:border-slate-600 rounded-xl px-3 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-emerald-500 cursor-pointer shadow-xs pr-8 transition-colors appearance-none"
              >
                <option value="java">Java (OpenJDK)</option>
                <option value="python">Python 3</option>
                <option value="typescript">TypeScript</option>
                <option value="javascript">JavaScript</option>
                <option value="csharp">C# (.NET)</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Action Buttons: Run, Reset, Copy, Stdin (Clear button removed) */}
          <div className="flex items-center gap-2">
            {/* Run Button (Green prominent) */}
            <button
              type="button"
              onClick={handleRunCode}
              disabled={isRunning}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md transition cursor-pointer ${
                isRunning
                  ? "bg-emerald-700/50 text-emerald-200 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20 hover:shadow-lg"
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
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition cursor-pointer"
              title="Reset code to default starter program"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            {/* Copy Code */}
            <button
              type="button"
              onClick={handleCopyCode}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition cursor-pointer"
              title="Copy code to clipboard"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>

            {/* Stdin Toggle */}
            <button
              type="button"
              onClick={() => setShowStdin(!showStdin)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                showStdin
                  ? "bg-blue-600/20 border-blue-500/40 text-blue-300"
                  : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-400 hover:text-white"
              }`}
              title="Toggle standard input"
            >
              Stdin {showStdin ? "▲" : "▼"}
            </button>

            {/* IntelliSense Toggle Button */}
            <button
              type="button"
              onClick={() => setIntellisenseEnabled(!intellisenseEnabled)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer flex items-center gap-1.5 ${
                intellisenseEnabled
                  ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25"
                  : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-400 hover:text-slate-200"
              }`}
              title={
                intellisenseEnabled
                  ? "IntelliSense Active (Ctrl+Space for suggestions). Click to disable."
                  : "IntelliSense Disabled. Click to enable."
              }
            >
              <Sparkles className={`w-3.5 h-3.5 ${intellisenseEnabled ? "text-emerald-400" : "text-slate-400"}`} />
              <span>IntelliSense</span>
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  intellisenseEnabled ? "bg-emerald-400 shadow-[0_0_6px_#34d399]" : "bg-slate-500"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Reset Confirmation Banner */}
        {resetFeedback && (
          <div className="max-w-7xl mx-auto mt-2 py-1 px-3 bg-emerald-950/80 border border-emerald-700/60 rounded-lg text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in duration-150">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              Code reset to default {LANG_LABELS[language]} starter program.
            </span>
          </div>
        )}
      </div>

      {/* Main Workspace Layout: Side-by-Side Resizable (Compiler Left, Output Right) */}
      <div
        ref={containerRef}
        className="flex-1 flex flex-col md:flex-row overflow-hidden max-w-7xl w-full mx-auto p-3 md:p-4 gap-2 h-[calc(100vh-140px)] min-h-[580px]"
      >
        {/* LEFT: Code Editor (Compiler Section) */}
        <div
          style={isDesktop ? { width: `${editorWidthPct}%` } : undefined}
          className="flex-1 md:flex-none flex flex-col bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden shadow-xl min-w-[280px] h-full"
        >
          {/* Editor File Tab Header */}
          <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1 rounded-t-lg bg-slate-950 border-t-2 border-emerald-500 text-xs font-mono font-semibold text-white">
                <FileCode className="w-3.5 h-3.5 text-emerald-400" />
                <span>{FILE_NAMES[language]}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="hidden sm:flex items-center gap-1.5 text-[11px] text-emerald-400/90 font-mono">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                <span>IntelliSense (Ctrl+Space)</span>
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                Lines: {lineCount} | Chars: {code.length}
              </span>
            </div>
          </div>

          {/* Optional Stdin Area */}
          {showStdin && (
            <div className="p-3 bg-slate-950/90 border-b border-slate-800 shrink-0">
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

          {/* Textarea Editor with Line Numbers */}
          <div
            ref={editorAreaRef}
            className="flex-1 flex overflow-hidden bg-slate-950 font-mono text-xs relative min-h-0"
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
                        ? "text-rose-400 font-extrabold bg-rose-500/25 rounded-xs"
                        : "text-slate-600 hover:text-slate-400"
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
              placeholder="Write your code here..."
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

          {/* Editor Status Footer */}
          <div className="px-3 py-1.5 bg-slate-900 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between shrink-0">
            <span className="flex items-center gap-2">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Runtime:{" "}
                <strong className="text-slate-300">
                  {LANG_LABELS[language]}
                </strong>
              </span>
              <span className="text-slate-600">|</span>
              <span className="flex items-center gap-1 text-slate-300">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                IntelliSense:{" "}
                <span className={intellisenseEnabled ? "text-emerald-400 font-semibold" : "text-slate-500"}>
                  {intellisenseEnabled ? "Active" : "Off"}
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
            <span>
              Shortcut:{" "}
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                Ctrl
              </kbd>{" "}
              +{" "}
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                Enter
              </kbd>{" "}
              to Run
            </span>
          </div>
        </div>

        {/* Resizer Handle between Compiler and Output */}
        <div
          onMouseDown={startResizing}
          className="hidden md:flex w-2.5 items-center justify-center cursor-col-resize group shrink-0 select-none py-4"
          title="Drag left/right to resize Compiler and Output"
        >
          <div
            className={`w-1 h-20 rounded-full transition-colors ${isResizing ? "bg-emerald-500" : "bg-slate-700 group-hover:bg-emerald-400"}`}
          />
        </div>

        {/* RIGHT: Output Terminal */}
        <div
          style={
            isDesktop
              ? { width: `calc(${100 - editorWidthPct}% - 0.625rem)` }
              : undefined
          }
          className="flex-1 md:flex-none flex flex-col bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden shadow-xl min-w-[260px] h-full"
        >
          {/* Terminal Header */}
          <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-white tracking-wide">
                Output / Result
              </span>
            </div>

            <div className="flex items-center gap-2">
              {executionStats && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    executionStats.status === "success"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                  }`}
                >
                  {executionStats.status === "success"
                    ? "✔ Finished"
                    : "✖ Error"}
                  {executionStats.durationMs !== undefined &&
                    ` (${executionStats.durationMs}ms)`}
                </span>
              )}
            </div>
          </div>

          {/* Terminal Screen */}
          <div className="flex-1 bg-black/95 p-4 font-mono text-xs overflow-auto min-h-[140px] leading-relaxed">
            {isRunning && (
              <div className="flex items-center gap-2 text-emerald-400 py-2">
                <div className="w-3.5 h-3.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                <span>Compiling and executing {FILE_NAMES[language]}...</span>
              </div>
            )}

            {!isRunning && !terminalOutput && !terminalError && (
              <div className="text-slate-500 italic py-6 text-center flex flex-col items-center gap-1.5">
                <Terminal className="w-6 h-6 opacity-40" />
                <p>
                  Click &quot;Run&quot; to compile and execute your program.
                </p>
                <p className="text-[11px] text-slate-600">
                  Standard output and compiler diagnostics will appear here.
                </p>
              </div>
            )}

            {/* Standard Output */}
            {terminalOutput && (
              <pre className="text-emerald-400 whitespace-pre-wrap font-mono select-text">
                {terminalOutput}
              </pre>
            )}

            {/* Standard Error / Compilation Errors */}
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

          {/* Terminal Footer Specs */}
          <div className="px-3 py-1.5 bg-slate-900 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between shrink-0">
            <span className="text-slate-500">Compiler / Runtime:</span>
            <span className="text-slate-300 font-mono text-[11px]">
              {language === "java" && "OpenJDK 17 / JVM"}
              {language === "python" && "Python 3.13"}
              {language === "typescript" && "TypeScript 5.x / Node.js"}
              {language === "javascript" && "Node.js v20 (V8)"}
              {language === "csharp" && ".NET 8 / C# Compiler"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
