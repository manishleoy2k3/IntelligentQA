'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
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
  Trash2,
  ChevronDown,
  BookOpen,
} from 'lucide-react';

export type SupportedLang = 'java' | 'python' | 'typescript' | 'javascript' | 'csharp';

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

export default function OnlineCompilerPage() {
  const [language, setLanguage] = useState<SupportedLang>('java');
  const [code, setCode] = useState<string>(STARTER_CODES.java);
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
  const [resetFeedback, setResetFeedback] = useState<boolean>(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Switch Language
  const handleLanguageChange = (newLang: SupportedLang) => {
    setLanguage(newLang);
    setCode(STARTER_CODES[newLang]);
    setTerminalOutput('');
    setTerminalError('');
    setExecutionStats(null);
  };

  // Explicit Reset Handler: restores default starter code for current language
  const handleReset = () => {
    setCode(STARTER_CODES[language]);
    setTerminalOutput('');
    setTerminalError('');
    setExecutionStats(null);
    setStdinInput('');
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
    setTerminalOutput('');
    setTerminalError('');
    setExecutionStats(null);
  };

  // Indentation support: 4 spaces on Tab key & Ctrl/Cmd+Enter to run
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
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
    }

    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleRunCode();
    }
  };

  // Compile & Execute API Call
  const handleRunCode = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setTerminalOutput('Compiling and executing...');
    setTerminalError('');

    try {
      const res = await fetch('/api/sandbox/compiler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
                Online Code Compiler
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {LANG_LABELS[language]}
                </span>
              </h1>
              <p className="text-[11px] text-slate-400">
                Write, compile, and execute Java, Python, TypeScript, JavaScript, and C# programs online.
              </p>
            </div>
          </div>

          {/* Quick Links: Problem Library & Practice Labs */}
          <div className="flex items-center gap-2 text-xs">
            <Link
              href="/sandbox/code/problems"
              className="text-emerald-300 hover:text-white px-2.5 py-1 rounded bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-700/60 font-semibold transition flex items-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Coding Library (10+ Problems)</span>
            </Link>
            <Link
              href="/sandbox/web"
              className="text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 transition"
            >
              1. Selenium Lab
            </Link>
            <Link
              href="/sandbox/web?mode=playwright"
              className="text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 transition"
            >
              2. Playwright Lab
            </Link>
            <Link
              href="/sandbox/api"
              className="text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 transition"
            >
              3. API Lab
            </Link>
          </div>
        </div>
      </div>

      {/* Main Action Toolbar with Language Dropdown & Run Buttons */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Language Selector Dropdown */}
          <div className="flex items-center gap-2.5">
            <label htmlFor="language-select" className="text-xs font-semibold text-slate-300">
              Language:
            </label>
            <div className="relative">
              <select
                id="language-select"
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value as SupportedLang)}
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

          {/* Action Buttons: Run, Reset, Clear, Copy, Stdin */}
          <div className="flex items-center gap-2">
            {/* Run Button (Green prominent) */}
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
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition cursor-pointer"
              title="Reset code to default starter program"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            {/* Clear Console Output */}
            <button
              type="button"
              onClick={handleClearTerminal}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition cursor-pointer"
              title="Clear terminal output"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>

            {/* Copy Code */}
            <button
              type="button"
              onClick={handleCopyCode}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition cursor-pointer"
              title="Copy code to clipboard"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            {/* Stdin Toggle */}
            <button
              type="button"
              onClick={() => setShowStdin(!showStdin)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                showStdin
                  ? 'bg-blue-600/20 border-blue-500/40 text-blue-300'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-400 hover:text-white'
              }`}
              title="Toggle standard input"
            >
              Stdin {showStdin ? '▲' : '▼'}
            </button>
          </div>
        </div>

        {/* Reset Confirmation Banner */}
        {resetFeedback && (
          <div className="max-w-7xl mx-auto mt-2 py-1 px-3 bg-emerald-950/80 border border-emerald-700/60 rounded-lg text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in duration-150">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Code reset to default {LANG_LABELS[language]} starter program.</span>
          </div>
        )}
      </div>

      {/* Main Workspace Layout: Top = Compiler Editor, Bottom = Output Terminal (Below Compiler) */}
      <div className="flex-1 flex flex-col overflow-hidden max-w-7xl w-full mx-auto p-3 md:p-4 gap-4">
        {/* TOP: Code Editor (Compiler Section) */}
        <div className="flex-[3] min-h-[380px] flex flex-col bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          {/* Editor File Tab Header */}
          <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1 rounded-t-lg bg-slate-950 border-t-2 border-emerald-500 text-xs font-mono font-semibold text-white">
                <FileCode className="w-3.5 h-3.5 text-emerald-400" />
                <span>{FILE_NAMES[language]}</span>
              </div>
            </div>

            <span className="text-[11px] text-slate-400 font-mono">
              Lines: {lineCount} | Chars: {code.length}
            </span>
          </div>

          {/* Optional Stdin Area */}
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

          {/* Textarea Editor with Line Numbers */}
          <div className="flex-1 flex overflow-hidden bg-slate-950 font-mono text-xs relative min-h-[260px]">
            {/* Line Numbers */}
            <div className="py-4 px-3 bg-slate-900/60 text-slate-600 text-right select-none border-r border-slate-800/80 shrink-0">
              {lineNumbers.map((num) => (
                <div key={num} className="leading-6">
                  {num}
                </div>
              ))}
            </div>

            {/* Code Input */}
            <textarea
              ref={textareaRef}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={handleKeyDown}
              spellCheck={false}
              className="flex-1 w-full p-4 bg-transparent text-slate-200 font-mono text-xs leading-6 resize-none focus:outline-none focus:ring-0 whitespace-pre overflow-auto"
              placeholder="Write your code here..."
            />
          </div>

          {/* Editor Status Footer */}
          <div className="px-3 py-1.5 bg-slate-900 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Runtime: <strong className="text-slate-300">{LANG_LABELS[language]}</strong>
            </span>
            <span>Shortcut: <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">Enter</kbd> to Run</span>
          </div>
        </div>

        {/* BOTTOM: Output Terminal (Directly Below Compiler Section) */}
        <div className="flex-[2] min-h-[220px] max-h-[360px] flex flex-col bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          {/* Terminal Header */}
          <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
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

              <button
                type="button"
                onClick={handleClearTerminal}
                className="text-[11px] text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 transition"
              >
                Clear
              </button>
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
                <p>Click &quot;Run&quot; to compile and execute your program.</p>
                <p className="text-[11px] text-slate-600">Standard output and compiler diagnostics will appear here.</p>
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
          <div className="px-3 py-1.5 bg-slate-900 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span className="text-slate-500">Compiler / Runtime:</span>
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
  );
}
