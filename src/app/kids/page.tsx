'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Play,
  RotateCcw,
  CheckCircle2,
  Terminal,
  Code2,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  Laptop,
  Check,
  Copy,
  FileDown,
  UploadCloud,
  Trash2,
  Lightbulb,
  Cpu,
  Layers,
  ChevronRight,
  Sparkles,
  Info,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import {
  LANGUAGE_COURSES,
  LanguageCourseMeta,
  CourseConcept,
  getStoredCustomLessons,
  deleteCustomLesson,
} from '@/lib/kids-courses';
import {
  KidsCourseTemplateModal,
  KidsCourseUploadModal,
} from '@/components/kids/kids-course-import-modals';
import { QADatabase } from '@/lib/qa-db';

const LANGUAGE_DEFAULTS: Record<'python' | 'javascript' | 'java', { starter: string; filename: string }> = {
  python: {
    starter: `# Python 3.12 Playground\nprint("Hello from Python!")\n\nscores = [95, 88, 92, 100, 78]\naverage = sum(scores) / len(scores)\nprint(f"Average score: {average:.1f}")\n`,
    filename: 'main.py',
  },
  javascript: {
    starter: `// JavaScript ES2024 Playground\nconsole.log("Hello from JavaScript!");\n\nconst scores = [95, 88, 92, 100, 78];\nconst average = scores.reduce((a, b) => a + b, 0) / scores.length;\nconsole.log(\`Average score: \${average.toFixed(1)}\`);\n`,
    filename: 'index.js',
  },
  java: {
    starter: `// Java 21 Playground\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello from Java 21!");\n\n        int[] scores = {95, 88, 92, 100, 78};\n        int sum = 0;\n        for (int s : scores) sum += s;\n        double avg = (double) sum / scores.length;\n        System.out.printf("Average score: %.1f%n", avg);\n    }\n}\n`,
    filename: 'Main.java',
  },
};

function KidsCoursesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // URL Query Parameters: ?lang=python | javascript | java & concept=intro
  const rawLang = searchParams.get('lang');
  const activeLang: 'python' | 'javascript' | 'java' =
    rawLang === 'javascript' || rawLang === 'java' ? rawLang : 'python';
  const conceptParam = searchParams.get('concept');

  // Course metadata and custom imported lessons
  const courseMeta = LANGUAGE_COURSES[activeLang];
  const [customLessons, setCustomLessons] = useState<CourseConcept[]>([]);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Staged / Selected Concept
  const allConcepts: CourseConcept[] = [...courseMeta.concepts, ...customLessons];
  const activeConcept: CourseConcept | undefined = conceptParam
    ? allConcepts.find((c) => c.id === conceptParam)
    : undefined;

  // Compiler IDE State
  const [showCompiler, setShowCompiler] = useState<boolean>(true);
  const [editorCode, setEditorCode] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [terminalOutput, setTerminalOutput] = useState<string>('');
  const [terminalError, setTerminalError] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const compilerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Ensure portal mode is set to kids
  useEffect(() => {
    if (typeof window !== 'undefined') {
      QADatabase.setPortalMode('kids');
    }
  }, []);

  // Reload custom lessons when active language changes
  const reloadCustomLessons = () => {
    const custom = getStoredCustomLessons(activeLang);
    setCustomLessons(custom);
  };

  useEffect(() => {
    reloadCustomLessons();
  }, [activeLang]);

  // Sync editor code whenever active concept or language changes
  useEffect(() => {
    if (activeConcept) {
      setEditorCode(activeConcept.starterCode);
      setTerminalOutput(`Ready to execute "${activeConcept.title}". Click "Run Code" or "Try it yourself"!`);
      setTerminalError('');
    } else {
      setEditorCode(LANGUAGE_DEFAULTS[activeLang].starter);
      setTerminalOutput(`Ready to execute ${courseMeta.name}. Click "Run Code" to test!`);
      setTerminalError('');
    }
  }, [activeLang, conceptParam, activeConcept?.id]);

  // Handle "Try it yourself" button click
  const handleTryItYourself = () => {
    setShowCompiler(true);
    if (activeConcept) {
      setEditorCode(activeConcept.starterCode);
      setTerminalOutput(`Loaded starter code for "${activeConcept.title}". Click "Run Code" to test output!`);
    } else {
      setEditorCode(LANGUAGE_DEFAULTS[activeLang].starter);
      setTerminalOutput(`Loaded ${courseMeta.name} playground. Click "Run Code" to execute!`);
    }
    setTerminalError('');
    setTimeout(() => {
      compilerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      textareaRef.current?.focus();
    }, 50);
  };

  // Run Code via backend execution engine
  const handleRunCode = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setTerminalOutput('Compiling and running code in live execution sandbox...');
    setTerminalError('');

    try {
      const res = await fetch('/api/sandbox/compiler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: activeLang,
          code: editorCode,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setTerminalError(data.error || 'Execution failed.');
        setTerminalOutput('');
      } else {
        const out = data.stdout || 'Program completed with no standard output.';
        setTerminalOutput(out);
        if (data.stderr) {
          setTerminalError(data.stderr);
        }
      }
    } catch (err: any) {
      setTerminalError(err.message || 'Network error running code.');
      setTerminalOutput('');
    } finally {
      setIsRunning(false);
    }
  };

  // Handle code copy
  const handleCopyCode = (snippet: string) => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(snippet);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  // Concept Navigation Helpers
  const activeIndex = activeConcept ? allConcepts.findIndex((c) => c.id === activeConcept.id) : -1;
  const prevConcept = activeIndex > 0 ? allConcepts[activeIndex - 1] : null;
  const nextConcept = activeIndex >= 0 && activeIndex < allConcepts.length - 1 ? allConcepts[activeIndex + 1] : null;

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* 1. TOP HEADER & LANGUAGE NAVIGATION */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-30 px-4 sm:px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Language Selector Tabs */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <Link
              href="/kids?lang=python"
              className={`py-1.5 px-3.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeLang === 'python'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
              }`}
            >
              <Terminal className="w-3.5 h-3.5 text-inherit" />
              <span>Python Course</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-black/20 text-inherit">3.12</span>
            </Link>

            <Link
              href="/kids?lang=javascript"
              className={`py-1.5 px-3.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeLang === 'javascript'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
              }`}
            >
              <Code2 className="w-3.5 h-3.5 text-inherit" />
              <span>JavaScript Course</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-black/20 text-inherit">ES2024</span>
            </Link>

            <Link
              href="/kids?lang=java"
              className={`py-1.5 px-3.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeLang === 'java'
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-extrabold'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
              }`}
            >
              <Laptop className="w-3.5 h-3.5 text-inherit" />
              <span>Java Course</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-black/20 text-inherit">21 LTS</span>
            </Link>
          </div>

          {/* Import Template & Import Course Content Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setShowTemplateModal(true)}
              className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Download standardized Import Template (JSON/CSV) with mandatory schema fields"
            >
              <FileDown className="w-3.5 h-3.5 text-amber-400" />
              <span>Import Template</span>
            </button>

            <button
              type="button"
              onClick={() => setShowUploadModal(true)}
              className="py-1.5 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md"
              title="Import and Upload new course concepts or guides"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Import Course Content</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. MAIN BODY: LANGUAGE HOME OR ACTIVE CONCEPT VIEW */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6">
        {!activeConcept ? (
          /* ========================================================= */
          /* LANGUAGE HOME PAGE (Overview, Architecture, Curriculum)   */
          /* ========================================================= */
          <div className="space-y-8 animate-in fade-in duration-150">
            {/* Language Overview Hero */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 shadow-xl relative overflow-hidden space-y-5">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${courseMeta.badgeColor}`}>
                    {courseMeta.version}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">Official Curriculum</span>
                </div>

                <button
                  type="button"
                  onClick={handleTryItYourself}
                  className="py-2 px-5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold text-xs shadow-lg transition flex items-center gap-2 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Try it yourself</span>
                </button>
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                  {courseMeta.name}
                </h1>
                <p className="text-sm sm:text-base text-amber-400 font-medium">
                  {courseMeta.tagline}
                </p>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed max-w-4xl">
                {courseMeta.description}
              </p>

              {/* 3 Overview Information Columns */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                {/* Why Learn */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Why Learn {activeLang.toUpperCase()}</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {courseMeta.whyLearn.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Industry Use Cases */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    <Layers className="w-4 h-4 text-emerald-400" />
                    <span>Industry Applications</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {courseMeta.useCases.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <ChevronRight className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Execution Model */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
                    <Cpu className="w-4 h-4 text-cyan-400" />
                    <span>Execution Architecture</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {courseMeta.executionModel}
                  </p>
                </div>
              </div>
            </div>

            {/* Curriculum Roadmap Header & Concepts Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="space-y-0.5">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-amber-400" />
                    <span>Curriculum Roadmap ({allConcepts.length} Learning Concepts)</span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Select any concept below or use the left navigation to start learning and running code.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleTryItYourself}
                  className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300"
                >
                  <span>Open Playground IDE</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* 9 Core Concepts Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allConcepts.map((concept, idx) => (
                  <div
                    key={concept.id}
                    className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 transition-all flex flex-col justify-between space-y-4 group shadow-sm"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-800 text-amber-400 border border-slate-700">
                          Concept #{concept.order || idx + 1}
                        </span>
                        {concept.id.startsWith('custom-') && (
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                            Imported
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition">
                        {concept.title}
                      </h3>

                      <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                        {concept.summary}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                      <Link
                        href={`/kids?lang=${activeLang}&concept=${concept.id}`}
                        className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold transition flex items-center justify-center gap-1.5"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                        <span>Learn Concept</span>
                      </Link>

                      <Link
                        href={`/kids?lang=${activeLang}&concept=${concept.id}&try=true`}
                        className="py-2 px-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
                        title="Open concept code directly in the online compiler"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Try it</span>
                      </Link>

                      {concept.id.startsWith('custom-') && (
                        <button
                          type="button"
                          onClick={() => {
                            deleteCustomLesson(concept.id, activeLang);
                            reloadCustomLessons();
                          }}
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                          title="Delete custom imported lesson"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Online Compiler Section on Language Home */}
            <div ref={compilerRef} className="pt-6 border-t border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Laptop className="w-4 h-4 text-blue-400" />
                    <span>{courseMeta.name} Quick Playground</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Write and execute live {activeLang} code in your browser with zero local setup.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditorCode(LANGUAGE_DEFAULTS[activeLang].starter)}
                  className="py-1 px-2.5 rounded-lg text-slate-400 hover:text-white text-xs font-mono flex items-center gap-1 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Starter</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Editor */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col shadow-sm">
                  <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
                    <span className="font-bold text-white">{LANGUAGE_DEFAULTS[activeLang].filename}</span>
                    <button
                      type="button"
                      disabled={isRunning}
                      onClick={handleRunCode}
                      className="py-1.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{isRunning ? 'Running...' : 'Run Code'}</span>
                    </button>
                  </div>
                  <textarea
                    ref={textareaRef}
                    rows={12}
                    value={editorCode}
                    onChange={(e) => setEditorCode(e.target.value)}
                    className="w-full flex-1 p-4 bg-slate-900 font-mono text-xs sm:text-sm text-slate-200 focus:outline-none resize-none leading-relaxed"
                    spellCheck={false}
                  />
                </div>

                {/* Terminal Output */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col shadow-sm">
                  <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
                    <span className="font-bold text-white">Execution Console / Output</span>
                    <button
                      type="button"
                      onClick={() => {
                        setTerminalOutput('');
                        setTerminalError('');
                      }}
                      className="hover:text-slate-200 transition text-[11px]"
                    >
                      Clear Console
                    </button>
                  </div>
                  <div className="p-4 bg-slate-950 font-mono text-xs text-slate-300 flex-1 min-h-[220px] overflow-y-auto space-y-2 whitespace-pre-wrap">
                    {terminalOutput && <div className="text-emerald-400">{terminalOutput}</div>}
                    {terminalError && (
                      <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
                        {terminalError}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ========================================================= */
          /* ACTIVE CONCEPT DETAIL + SPLIT COMPILER IDE VIEW            */
          /* ========================================================= */
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Concept Top Action Bar with "Try it yourself" Button */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Link href={`/kids?lang=${activeLang}`} className="hover:text-white transition">
                    {courseMeta.name}
                  </Link>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                  <span className="text-amber-400 font-semibold">{activeConcept.title}</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-white">
                  {activeConcept.title}
                </h1>
              </div>

              {/* Requirement 4: "Try it yourself" button on top of each concept */}
              <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
                <button
                  type="button"
                  onClick={handleTryItYourself}
                  className="py-2.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg transition flex items-center gap-2 cursor-pointer active:scale-95 animate-pulse"
                  title="Open compiler IDE on right side with live output below"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Try it yourself</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowCompiler(!showCompiler)}
                  className="py-2 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
                  title="Toggle compiler section"
                >
                  {showCompiler ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                  <span>{showCompiler ? 'Hide IDE' : 'Open IDE'}</span>
                </button>
              </div>
            </div>

            {/* Split Screen: Left = Concept Explanation, Right = Compiler IDE & Output Below */}
            <div className={`grid grid-cols-1 ${showCompiler ? 'lg:grid-cols-2' : ''} gap-6 items-start`}>
              {/* LEFT COLUMN: Concept Guide & Walkthrough */}
              <div className="space-y-5 bg-slate-900/60 border border-slate-800/80 rounded-3xl p-5 sm:p-6 shadow-sm">
                {/* Summary Callout */}
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs sm:text-sm text-amber-200 leading-relaxed flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-amber-400 font-bold block mb-1">Concept Summary</strong>
                    <span>{activeConcept.summary}</span>
                  </div>
                </div>

                {/* In-depth Overview */}
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-amber-400" />
                    <span>How It Works</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {activeConcept.overview}
                  </p>
                </div>

                {/* Key Points & Mechanisms */}
                {activeConcept.keyPoints && activeConcept.keyPoints.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Key Rules &amp; Principles</span>
                    </h3>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {activeConcept.keyPoints.map((point, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Code Blueprint Snippet */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white uppercase tracking-wider">Example Blueprint</span>
                    <button
                      type="button"
                      onClick={() => handleCopyCode(activeConcept.starterCode)}
                      className="text-slate-400 hover:text-amber-400 flex items-center gap-1 transition"
                    >
                      {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
                    </button>
                  </div>
                  <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed whitespace-pre-wrap">
                    {activeConcept.starterCode}
                  </pre>
                </div>

                {/* Best Practices */}
                {activeConcept.bestPractices && activeConcept.bestPractices.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>Best Practices</span>
                    </h3>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {activeConcept.bestPractices.map((bp, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <ChevronRight className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <span>{bp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Previous & Next Concept Footer Navigation */}
                <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3 text-xs">
                  {prevConcept ? (
                    <Link
                      href={`/kids?lang=${activeLang}&concept=${prevConcept.id}`}
                      className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 font-semibold flex items-center gap-1.5 transition"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span className="truncate max-w-[140px] sm:max-w-[200px]">{prevConcept.title}</span>
                    </Link>
                  ) : (
                    <Link
                      href={`/kids?lang=${activeLang}`}
                      className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 font-semibold transition"
                    >
                      ← {courseMeta.name} Home
                    </Link>
                  )}

                  {nextConcept ? (
                    <Link
                      href={`/kids?lang=${activeLang}&concept=${nextConcept.id}`}
                      className="py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center gap-1.5 transition ml-auto"
                    >
                      <span className="truncate max-w-[140px] sm:max-w-[200px]">{nextConcept.title}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  ) : (
                    <Link
                      href={`/kids?lang=${activeLang}`}
                      className="py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition ml-auto"
                    >
                      Course Complete! Return Home →
                    </Link>
                  )}
                </div>
              </div>

              {/* RIGHT COLUMN: Compiler IDE on top, Output Console directly below */}
              {showCompiler && (
                <div ref={compilerRef} className="space-y-4 sticky top-20">
                  {/* COMPILER IDE (TOP) */}
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden flex flex-col shadow-xl">
                    <div className="p-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-amber-400" />
                        <span className="font-bold text-white font-mono">
                          {activeLang.toUpperCase()} Compiler IDE
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditorCode(activeConcept.starterCode);
                            setTerminalOutput('Reset to original concept code.');
                            setTerminalError('');
                          }}
                          className="py-1 px-2.5 rounded-lg text-slate-400 hover:text-slate-200 text-xs font-mono flex items-center gap-1 transition"
                          title="Reset to concept starter code"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Reset</span>
                        </button>

                        <button
                          type="button"
                          disabled={isRunning}
                          onClick={handleRunCode}
                          className="py-1.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>{isRunning ? 'Running...' : 'Run Code'}</span>
                        </button>
                      </div>
                    </div>

                    <textarea
                      ref={textareaRef}
                      rows={13}
                      value={editorCode}
                      onChange={(e) => setEditorCode(e.target.value)}
                      className="w-full flex-1 p-4 bg-slate-900 font-mono text-xs sm:text-sm text-slate-200 focus:outline-none resize-none leading-relaxed border-0"
                      spellCheck={false}
                    />

                    <div className="p-2.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                      <span>{editorCode.split('\n').length} lines · {activeLang}</span>
                      <span>Press &quot;Run Code&quot; to compile and see output</span>
                    </div>
                  </div>

                  {/* COMPILER OUTPUT DIRECTLY BELOW IDE (BOTTOM) */}
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden flex flex-col shadow-xl">
                    <div className="p-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
                      <div className="flex items-center gap-2">
                        <Laptop className="w-4 h-4 text-blue-400" />
                        <span className="font-bold text-white">Execution Console / Output</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setTerminalOutput('');
                          setTerminalError('');
                        }}
                        className="hover:text-slate-200 transition text-[11px]"
                      >
                        Clear
                      </button>
                    </div>

                    <div className="p-4 bg-slate-950 font-mono text-xs text-slate-300 min-h-[160px] max-h-[300px] overflow-y-auto space-y-2 whitespace-pre-wrap">
                      {terminalOutput && (
                        <div className="text-emerald-400 font-semibold">{terminalOutput}</div>
                      )}
                      {terminalError && (
                        <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
                          {terminalError}
                        </div>
                      )}
                      {!terminalOutput && !terminalError && (
                        <div className="text-slate-600 italic">
                          Click &quot;Run Code&quot; or &quot;Try it yourself&quot; to execute and see output here.
                        </div>
                      )}
                    </div>

                    <div className="p-2.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Status: {isRunning ? 'Executing...' : 'Ready'}</span>
                      <span className="text-[10px]">In-Browser Execution Sandbox</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Modals for Standardized Template & Content Upload */}
      {showTemplateModal && (
        <KidsCourseTemplateModal
          isOpen={showTemplateModal}
          onClose={() => setShowTemplateModal(false)}
          language={activeLang}
        />
      )}

      {showUploadModal && (
        <KidsCourseUploadModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          language={activeLang}
          onCourseAdded={reloadCustomLessons}
        />
      )}
    </div>
  );
}

export default function KidsCodingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 p-8 text-white">Loading Courses...</div>}>
      <KidsCoursesContent />
    </Suspense>
  );
}
