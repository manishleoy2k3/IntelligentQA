'use client';

import React, { useState, useRef, useEffect } from 'react';
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
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Plus,
  Upload,
  Download,
  X,
  Layers,
  Sparkles,
  FileText,
  ListPlus,
  HelpCircle,
  Code2,
} from 'lucide-react';
import {
  CodingProblem,
  DEFAULT_CODING_PROBLEMS,
  getAllProblems,
  saveCustomProblem,
  deleteCustomProblem,
  parseImportedProblems,
} from '@/lib/coding-problems';

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
  const [codingProblems, setCodingProblems] = useState<CodingProblem[]>(DEFAULT_CODING_PROBLEMS);
  const [selectedProblemId, setSelectedProblemId] = useState<string>('two-sum');
  const [showProblemPanel, setShowProblemPanel] = useState<boolean>(true);

  // Editor states
  const [code, setCode] = useState<string>(
    DEFAULT_CODING_PROBLEMS[0]?.starterTemplates?.java || STARTER_CODES.java
  );
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
  const [bannerFeedback, setBannerFeedback] = useState<string | null>(null);

  // Modals
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showImportModal, setShowImportModal] = useState<boolean>(false);

  // Add Problem Form
  const [newTitle, setNewTitle] = useState<string>('');
  const [newDifficulty, setNewDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Easy');
  const [newCategory, setNewCategory] = useState<string>('Automation & Logic');
  const [newDescription, setNewDescription] = useState<string>('');
  const [newConstraints, setNewConstraints] = useState<string>('');
  const [newExampleInput, setNewExampleInput] = useState<string>('');
  const [newExampleOutput, setNewExampleOutput] = useState<string>('');
  const [newExplanation, setNewExplanation] = useState<string>('');
  const [newCustomStarter, setNewCustomStarter] = useState<string>('');

  // Import Form
  const [importText, setImportText] = useState<string>('');
  const [importStatus, setImportStatus] = useState<{ error?: string; success?: string } | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load problems from localStorage on mount
  useEffect(() => {
    const all = getAllProblems();
    setCodingProblems(all);
  }, []);

  const selectedProblem = codingProblems.find(p => p.id === selectedProblemId) || null;

  // Change problem selection
  const handleSelectProblem = (problemId: string) => {
    setSelectedProblemId(problemId);
    if (problemId === 'freeform') {
      setCode(STARTER_CODES[language]);
      showBanner(`Switched to Freeform ${LANG_LABELS[language]} Scratchpad.`);
    } else {
      const prob = codingProblems.find(p => p.id === problemId);
      if (prob) {
        const template = prob.starterTemplates[language] || STARTER_CODES[language];
        setCode(template);
        showBanner(`Loaded problem: ${prob.title}`);
      }
    }
    setTerminalOutput('');
    setTerminalError('');
    setExecutionStats(null);
  };

  // Switch Language
  const handleLanguageChange = (newLang: SupportedLang) => {
    setLanguage(newLang);
    if (selectedProblemId === 'freeform' || !selectedProblem) {
      setCode(STARTER_CODES[newLang]);
    } else {
      const template = selectedProblem.starterTemplates[newLang] || STARTER_CODES[newLang];
      setCode(template);
    }
    setTerminalOutput('');
    setTerminalError('');
    setExecutionStats(null);
  };

  // Reset Handler
  const handleReset = () => {
    if (selectedProblemId === 'freeform' || !selectedProblem) {
      setCode(STARTER_CODES[language]);
      showBanner(`Code reset to default ${LANG_LABELS[language]} starter.`);
    } else {
      setCode(selectedProblem.starterTemplates[language] || STARTER_CODES[language]);
      showBanner(`Code reset to starter template for ${selectedProblem.title}`);
    }
    setTerminalOutput('');
    setTerminalError('');
    setExecutionStats(null);
    setStdinInput('');

    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const showBanner = (msg: string) => {
    setBannerFeedback(msg);
    setTimeout(() => setBannerFeedback(null), 3000);
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

  // Navigate Problems (Next / Previous)
  const handlePrevProblem = () => {
    const idx = codingProblems.findIndex(p => p.id === selectedProblemId);
    if (idx > 0) {
      handleSelectProblem(codingProblems[idx - 1].id);
    }
  };

  const handleNextProblem = () => {
    const idx = codingProblems.findIndex(p => p.id === selectedProblemId);
    if (idx < codingProblems.length - 1) {
      handleSelectProblem(codingProblems[idx + 1].id);
    }
  };

  // Delete Custom Problem
  const handleDeleteProblem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this custom problem?')) {
      deleteCustomProblem(id);
      const updated = getAllProblems();
      setCodingProblems(updated);
      if (selectedProblemId === id) {
        handleSelectProblem(updated[0]?.id || 'freeform');
      }
      showBanner('Custom problem deleted.');
    }
  };

  // Save New Custom Problem
  const handleSaveNewProblem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      alert('Please enter a problem title.');
      return;
    }

    const examples: CodingProblem['examples'] = [];
    if (newExampleInput.trim() || newExampleOutput.trim()) {
      examples.push({
        input: newExampleInput.trim() || 'N/A',
        output: newExampleOutput.trim() || 'N/A',
        explanation: newExplanation.trim() || undefined,
      });
    }

    const constraints = newConstraints
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    const created = saveCustomProblem({
      title: newTitle.trim(),
      difficulty: newDifficulty,
      category: newCategory.trim() || 'Custom',
      description: newDescription.trim() || 'Custom problem description.',
      constraints,
      examples,
      starterTemplates: {
        java: newCustomStarter.trim() || `public class Main {\n    public static void main(String[] args) {\n        // Problem: ${newTitle}\n        System.out.println("Solution for ${newTitle}");\n    }\n}`,
        python: newCustomStarter.trim() || `# Problem: ${newTitle}\ndef solve():\n    pass\n\nif __name__ == "__main__":\n    print("Solution for ${newTitle}")`,
        typescript: newCustomStarter.trim() || `// Problem: ${newTitle}\nconsole.log("Solution for ${newTitle}");`,
        javascript: newCustomStarter.trim() || `// Problem: ${newTitle}\nconsole.log("Solution for ${newTitle}");`,
        csharp: newCustomStarter.trim() || `using System;\nclass Program {\n    static void Main() {\n        Console.WriteLine("Solution for ${newTitle}");\n    }\n}`,
      },
    });

    const updated = getAllProblems();
    setCodingProblems(updated);
    setSelectedProblemId(created.id);
    setCode(created.starterTemplates[language]);
    setShowAddModal(false);

    // Reset fields
    setNewTitle('');
    setNewDescription('');
    setNewConstraints('');
    setNewExampleInput('');
    setNewExampleOutput('');
    setNewExplanation('');
    setNewCustomStarter('');

    showBanner(`Problem "${created.title}" created successfully!`);
  };

  // File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const text = event.target?.result as string;
      if (text) {
        setImportText(text);
        processImport(text);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Process text import
  const processImport = (text: string) => {
    const res = parseImportedProblems(text);
    if (res.error) {
      setImportStatus({ error: res.error });
    } else {
      const updated = getAllProblems();
      setCodingProblems(updated);
      setImportStatus({ success: `Successfully imported ${res.problems.length} coding problem(s)!` });
      if (res.problems.length > 0) {
        handleSelectProblem(res.problems[0].id);
      }
      setTimeout(() => {
        setShowImportModal(false);
        setImportStatus(null);
        setImportText('');
        showBanner(`Imported ${res.problems.length} problem(s) into your library.`);
      }, 1200);
    }
  };

  // Export current library to JSON
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(codingProblems, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', `sdet_coding_problems_${new Date().toISOString().slice(0, 10)}.json`);
    dlAnchorElem.click();
    showBanner('Coding problems exported to JSON file.');
  };

  // Samples for import
  const loadSampleJson = () => {
    const sample = [
      {
        title: "Count Vowels in a String",
        difficulty: "Easy",
        category: "Strings",
        description: "Given a string text, return the total count of vowels (a, e, i, o, u) case-insensitively.",
        constraints: ["1 <= text.length <= 10^5"],
        examples: [
          {
            input: "text = 'Quality Assurance'",
            output: "7",
            explanation: "Vowels: u, a, i, y (not counted), A, u, a, e = 7"
          }
        ]
      }
    ];
    setImportText(JSON.stringify(sample, null, 2));
  };

  const loadSampleCsv = () => {
    const sample = `Title,Difficulty,Category,Description
Reverse Integer,Medium,Math,Given a signed 32-bit integer x return x with its digits reversed.
Check Subset Array,Easy,Arrays,Given two arrays arr1 and arr2 check if arr2 is a subset of arr1.`;
    setImportText(sample);
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
                Hands-On SDET Coding Lab
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {LANG_LABELS[language]}
                </span>
                {selectedProblem && (
                  <span className="hidden sm:inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {selectedProblem.category}
                  </span>
                )}
              </h1>
              <p className="text-[11px] text-slate-400">
                Solve real SDET interview coding challenges with live multi-language compilation (Java, Python, TypeScript, JS, C#).
              </p>
            </div>
          </div>

          {/* Quick Problem Library Actions */}
          <div className="flex items-center gap-2 text-xs">
            {/* Add Custom Problem */}
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition flex items-center gap-1.5 cursor-pointer text-xs font-semibold"
              title="Add a custom coding problem manually"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-400" />
              <span>Add Problem</span>
            </button>

            {/* Import / Upload Questions */}
            <button
              type="button"
              onClick={() => setShowImportModal(true)}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition flex items-center gap-1.5 cursor-pointer text-xs font-semibold"
              title="Import or upload coding questions from JSON or CSV"
            >
              <Upload className="w-3.5 h-3.5 text-blue-400" />
              <span>Import / Upload</span>
            </button>

            {/* Toggle Problem Panel */}
            <button
              type="button"
              onClick={() => setShowProblemPanel(!showProblemPanel)}
              className={`px-2.5 py-1 rounded-lg border transition flex items-center gap-1.5 cursor-pointer text-xs font-semibold ${
                showProblemPanel
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
              }`}
              title="Toggle problem statement panel"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{showProblemPanel ? 'Hide Problem' : 'Show Problem'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Action Toolbar: Language, Problem Selector, Run, Reset, Clear */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Left group: Problem Selector & Language Selector */}
          <div className="flex items-center flex-wrap gap-2.5">
            {/* Problem Selector Dropdown */}
            <div className="flex items-center gap-1.5">
              <label htmlFor="problem-select" className="text-xs font-semibold text-slate-300">
                Problem:
              </label>
              <div className="relative">
                <select
                  id="problem-select"
                  value={selectedProblemId}
                  onChange={(e) => handleSelectProblem(e.target.value)}
                  className="bg-slate-950 border border-slate-700 hover:border-slate-600 rounded-xl px-3 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-blue-500 cursor-pointer shadow-xs pr-8 transition-colors appearance-none max-w-[240px] truncate"
                >
                  <option value="freeform">⚡ Freeform Playground (No Problem)</option>
                  <optgroup label="Available SDET Coding Problems">
                    {codingProblems.map((prob) => (
                      <option key={prob.id} value={prob.id}>
                        {prob.difficulty === 'Easy' ? '🟢' : prob.difficulty === 'Medium' ? '🟡' : '🔴'} {prob.title}
                        {prob.isCustom ? ' (Custom)' : ''}
                      </option>
                    ))}
                  </optgroup>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Language Selector Dropdown (Java, Python, TypeScript, JavaScript, C#) */}
            <div className="flex items-center gap-1.5">
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
          </div>

          {/* Right group: Run, Reset, Clear, Copy, Stdin */}
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
              title="Reset code to starter program"
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

        {/* Feedback Banner */}
        {bannerFeedback && (
          <div className="max-w-7xl mx-auto mt-2 py-1 px-3 bg-emerald-950/80 border border-emerald-700/60 rounded-lg text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in duration-150">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>{bannerFeedback}</span>
          </div>
        )}
      </div>

      {/* Main Workspace: Problem Details (Left) + Editor (Center) + Terminal (Right) */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden max-w-7xl w-full mx-auto p-3 md:p-4 gap-4">
        {/* Panel 1: Problem Statement & Test Cases (Collapsible) */}
        {showProblemPanel && selectedProblem && (
          <div className="lg:w-[360px] xl:w-[400px] flex flex-col bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl shrink-0">
            {/* Header with Navigation */}
            <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 truncate">
                <BookOpen className="w-4 h-4 text-blue-400 shrink-0" />
                <span className="text-xs font-bold text-white truncate">Problem Description</span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={handlePrevProblem}
                  className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition disabled:opacity-40"
                  title="Previous Problem"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleNextProblem}
                  className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition disabled:opacity-40"
                  title="Next Problem"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                {selectedProblem.isCustom && (
                  <button
                    type="button"
                    onClick={(e) => handleDeleteProblem(selectedProblem.id, e)}
                    className="p-1 rounded bg-rose-950/60 hover:bg-rose-900 text-rose-400 hover:text-rose-200 transition ml-1"
                    title="Delete custom problem"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Scrollable Problem Content */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
              {/* Title & Badges */}
              <div>
                <h2 className="text-sm font-bold text-white mb-2 leading-tight">
                  {selectedProblem.title}
                </h2>
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      selectedProblem.difficulty === 'Easy'
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        : selectedProblem.difficulty === 'Medium'
                        ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                        : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                    }`}
                  >
                    {selectedProblem.difficulty}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {selectedProblem.category}
                  </span>
                  {selectedProblem.isCustom && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      User Added
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="text-slate-300 leading-relaxed whitespace-pre-line bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                {selectedProblem.description}
              </div>

              {/* Examples */}
              {selectedProblem.examples.length > 0 && (
                <div className="space-y-2.5">
                  <h3 className="font-bold text-slate-200 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-blue-400" />
                    Examples
                  </h3>
                  {selectedProblem.examples.map((ex, i) => (
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
              {selectedProblem.constraints && selectedProblem.constraints.length > 0 && (
                <div className="space-y-1.5">
                  <h3 className="font-bold text-slate-200 text-[11px] uppercase tracking-wider">
                    Constraints
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px]">
                    {selectedProblem.constraints.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Bottom Problem Bar */}
            <div className="p-2.5 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-[11px]">
              <span className="text-slate-400 font-medium">
                {codingProblems.findIndex(p => p.id === selectedProblemId) + 1} of {codingProblems.length} Problems
              </span>
              <button
                type="button"
                onClick={handleReset}
                className="text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer flex items-center gap-1"
                title="Reload starter code for current language"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reload Template</span>
              </button>
            </div>
          </div>
        )}

        {/* Panel 2: Code Editor */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          {/* Editor File Tab Header */}
          <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1 rounded-t-lg bg-slate-950 border-t-2 border-emerald-500 text-xs font-mono font-semibold text-white">
                <FileCode className="w-3.5 h-3.5 text-emerald-400" />
                <span>{FILE_NAMES[language]}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                Lines: {lineCount} | Chars: {code.length}
              </span>
            </div>
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
          <div className="flex-1 flex overflow-hidden bg-slate-950 font-mono text-xs relative min-h-[380px]">
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
              placeholder="Write your solution code here..."
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

        {/* Panel 3: Output Terminal */}
        <div className="lg:w-[420px] xl:w-[460px] flex flex-col bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden shadow-xl shrink-0">
          {/* Terminal Header */}
          <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-white tracking-wide">Output</span>
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
          <div className="flex-1 bg-black/95 p-4 font-mono text-xs overflow-auto min-h-[300px] leading-relaxed">
            {isRunning && (
              <div className="flex items-center gap-2 text-emerald-400 py-2">
                <div className="w-3.5 h-3.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                <span>Compiling and executing {FILE_NAMES[language]}...</span>
              </div>
            )}

            {!isRunning && !terminalOutput && !terminalError && (
              <div className="text-slate-500 italic py-12 text-center flex flex-col items-center gap-2">
                <Terminal className="w-8 h-8 opacity-40" />
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
              <div className="mt-3 p-3 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-300 whitespace-pre-wrap font-mono">
                <div className="flex items-center gap-1.5 font-bold text-rose-400 mb-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>Compilation / Runtime Diagnostic:</span>
                </div>
                {terminalError}
              </div>
            )}
          </div>

          {/* Terminal Footer Specs */}
          <div className="p-3 bg-slate-900 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
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

      {/* MODAL 1: ADD CODING PROBLEM MANUALLY */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                  <ListPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Add Custom Coding Problem</h3>
                  <p className="text-[11px] text-slate-400">Create a new challenge to practice in your library.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveNewProblem} className="p-4 overflow-y-auto space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Problem Title <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Reverse a Linked List / Count Occurrences"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Difficulty</label>
                  <select
                    value={newDifficulty}
                    onChange={(e) => setNewDifficulty(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Easy">Easy (🟢)</option>
                    <option value="Medium">Medium (🟡)</option>
                    <option value="Hard">Hard (🔴)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Category</label>
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="e.g. Strings, Arrays, RegEx"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Problem Description / Statement <span className="text-rose-400">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Explain the input parameters, expected behavior, and SDET relevance..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Sample Input</label>
                  <input
                    type="text"
                    value={newExampleInput}
                    onChange={(e) => setNewExampleInput(e.target.value)}
                    placeholder="e.g. s = 'automation'"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500 font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Sample Output</label>
                  <input
                    type="text"
                    value={newExampleOutput}
                    onChange={(e) => setNewExampleOutput(e.target.value)}
                    placeholder="e.g. 'noitamotua'"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500 font-mono text-[11px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Explanation (Optional)</label>
                <input
                  type="text"
                  value={newExplanation}
                  onChange={(e) => setNewExplanation(e.target.value)}
                  placeholder="Brief explanation of the output"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Constraints (One per line, optional)</label>
                <textarea
                  rows={2}
                  value={newConstraints}
                  onChange={(e) => setNewConstraints(e.target.value)}
                  placeholder="1 <= s.length <= 10^5&#10;Input contains only alphanumeric characters"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Custom Starter Code (Optional)</label>
                <textarea
                  rows={3}
                  value={newCustomStarter}
                  onChange={(e) => setNewCustomStarter(e.target.value)}
                  placeholder="Leave blank to automatically generate starter boilerplates for all 5 languages..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono text-[11px]"
                />
              </div>

              {/* Action buttons */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition shadow-md"
                >
                  Save Problem
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: IMPORT / UPLOAD CODING PROBLEMS */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Import or Upload Coding Problems</h3>
                  <p className="text-[11px] text-slate-400">Upload a JSON or CSV file, or paste your question list.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowImportModal(false);
                  setImportStatus(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 overflow-y-auto space-y-4 text-xs">
              {/* Option A: File Upload */}
              <div className="p-4 rounded-xl border-2 border-dashed border-slate-700 hover:border-blue-500 bg-slate-950/70 text-center transition cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-8 h-8 text-blue-400 mx-auto mb-2 opacity-80" />
                <p className="font-semibold text-slate-200">Click to upload a .json or .csv file</p>
                <p className="text-[11px] text-slate-500 mt-1">Supports JSON array of questions or CSV format</p>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".json,.csv,.txt"
                  className="hidden"
                />
              </div>

              {/* Quick Template Helpers */}
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-400">Or Paste Raw Content:</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={loadSampleJson}
                    className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold underline"
                  >
                    Paste Sample JSON
                  </button>
                  <span className="text-slate-600">|</span>
                  <button
                    type="button"
                    onClick={loadSampleCsv}
                    className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold underline"
                  >
                    Paste Sample CSV
                  </button>
                </div>
              </div>

              {/* Textarea for JSON/CSV */}
              <textarea
                rows={6}
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder="Paste JSON array or CSV text here..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white placeholder-slate-600 font-mono text-[11px] focus:outline-none focus:border-blue-500"
              />

              {/* Status / Feedback */}
              {importStatus?.error && (
                <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{importStatus.error}</span>
                </div>
              )}

              {importStatus?.success && (
                <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-800 text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{importStatus.success}</span>
                </div>
              )}

              {/* Action buttons */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleExportJSON}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition"
                  title="Download all available questions as JSON"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Library (JSON)</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowImportModal(false);
                      setImportStatus(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={!importText.trim()}
                    onClick={() => processImport(importText)}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold transition shadow-md"
                  >
                    Import Questions
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
