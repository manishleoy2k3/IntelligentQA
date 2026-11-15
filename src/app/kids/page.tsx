'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Play,
  RotateCcw,
  CheckCircle2,
  Terminal,
  Code2,
  Rocket,
  BookOpen,
  ArrowRight,
  Laptop,
  Check,
  Copy,
  Flame,
  Award,
  Zap,
  HelpCircle,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';
import { DEFAULT_CODING_PROBLEMS, CodingProblem } from '@/lib/coding-problems';
import { QADatabase } from '@/lib/qa-db';
import GeminiKeyModal from '@/components/auth/gemini-key-modal';
import GoogleSignInButton from '@/components/auth/google-sign-in-button';

const KIDS_LANG_STARTERS: Record<string, string> = {
  python: `# 🚀 Kids Python Coding Lab!
# Write your code below and click "Run Code"

hero_name = "Alex"
power_level = 9000

print("Welcome to Python, " + hero_name + "!")
print(f"Power Level: {power_level}")

# Loop through 5 space stars
for star in range(1, 6):
    print("🌟 Star #" + str(star))
`,
  javascript: `// 🚀 Kids JavaScript Coding Lab!
// Write your code below and click "Run Code"

const heroName = "Alex";
const powerLevel = 9000;

console.log("Welcome to JavaScript, " + heroName + "!");
console.log("Power Level: " + powerLevel);

// Count 5 space stars
for (let star = 1; star <= 5; star++) {
    console.log("🌟 Star #" + star);
}
`,
  typescript: `// 🚀 Kids TypeScript Coding Lab!
// Type-safe coding for young software engineers

const heroName: string = "Alex";
const powerLevel: number = 9000;

console.log("Welcome to TypeScript, " + heroName + "!");
console.log("Power Level: " + powerLevel);

for (let star: number = 1; star <= 5; star++) {
    console.log("🌟 Star #" + star);
}
`,
  java: `public class Main {
    public static void main(String[] args) {
        String heroName = "Alex";
        int powerLevel = 9000;

        System.out.println("Welcome to Java, " + heroName + "!");
        System.out.println("Power Level: " + powerLevel);

        for (int star = 1; star <= 5; star++) {
            System.out.println("🌟 Star #" + star);
        }
    }
}
`,
};

export default function KidsCodingPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [hasGeminiKey, setHasGeminiKey] = useState<boolean>(false);
  const [showKeyModal, setShowKeyModal] = useState<boolean>(false);

  // Compiler state
  const [selectedLang, setSelectedLang] = useState<'python' | 'javascript' | 'typescript' | 'java'>('python');
  const [code, setCode] = useState<string>(KIDS_LANG_STARTERS.python);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [terminalOutput, setTerminalOutput] = useState<string>('Ready to run code. Click "Run Code" above!');
  const [terminalError, setTerminalError] = useState<string>('');

  // Kids Problems
  const kidsProblems = DEFAULT_CODING_PROBLEMS.filter(p => p.category.includes('Kids Coding'));

  useEffect(() => {
    if (typeof window !== 'undefined') {
      QADatabase.setPortalMode('kids');
      const user = QADatabase.getCurrentUser();
      setCurrentUser(user);
      setHasGeminiKey(Boolean(QADatabase.getUserGeminiKey(user?.id)));

      const handleAuth = () => {
        const u = QADatabase.getCurrentUser();
        setCurrentUser(u);
        setHasGeminiKey(Boolean(QADatabase.getUserGeminiKey(u?.id)));
      };
      window.addEventListener('intelligentqa_auth_changed', handleAuth);
      window.addEventListener('intelligentqa_key_changed', handleAuth);
      return () => {
        window.removeEventListener('intelligentqa_auth_changed', handleAuth);
        window.removeEventListener('intelligentqa_key_changed', handleAuth);
      };
    }
  }, []);

  const handleLangChange = (lang: 'python' | 'javascript' | 'typescript' | 'java') => {
    setSelectedLang(lang);
    setCode(KIDS_LANG_STARTERS[lang] || '');
    setTerminalOutput(`Switched to ${lang}. Click "Run Code" to test!`);
    setTerminalError('');
  };

  const handleLoadProblem = (prob: CodingProblem) => {
    const starter = prob.starterTemplates[selectedLang] || prob.starterTemplates.python;
    setCode(starter);
    setTerminalOutput(`Loaded "${prob.title}" in ${selectedLang}. Click "Run Code" to test your solution!`);
    setTerminalError('');
    // Scroll to compiler
    document.getElementById('kids-compiler')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleRunCode = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setTerminalOutput('Compiling & running your code...');
    setTerminalError('');

    try {
      const res = await fetch('/api/sandbox/compiler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: selectedLang,
          code,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setTerminalError(data.error || 'Execution failed.');
        setTerminalOutput('');
      } else {
        setTerminalOutput(data.stdout || 'Program executed with no output.');
        if (data.stderr) setTerminalError(data.stderr);
      }
    } catch (e: any) {
      setTerminalError(e.message || 'Network error running code.');
    } finally {
      setIsRunning(false);
    }
  };

  const handleOpenAskAI = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('intelligentqa_open_ask_ai'));
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* 1. HERO HEADER */}
      <section className="relative overflow-hidden border-b border-slate-800 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 py-12 px-4 sm:px-6">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-amber-500/15 via-orange-500/15 to-indigo-500/15 blur-3xl pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-xs">
            <Rocket className="w-4 h-4 text-amber-400 animate-bounce" />
            <span>100% Free Coding for Junior Developers &amp; Kids (Ages 10–14)</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Learn Programming the Fun Way with{' '}
            <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 bg-clip-text text-transparent">
              Python, JS &amp; Java!
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Solve secret rover missions, superhero power finders, and treasure island quests.
            Code directly in your browser with zero installation, and ask the live <strong>Ask AI</strong> helper whenever you get stuck!
          </p>

          <div className="flex items-center justify-center gap-3 flex-wrap pt-2">
            <a
              href="#kids-compiler"
              className="py-3 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs sm:text-sm shadow-lg hover:shadow-orange-500/20 transition cursor-pointer flex items-center gap-2"
            >
              <Laptop className="w-4 h-4" />
              <span>Launch Online Compiler</span>
            </a>

            <a
              href="#problems"
              className="py-3 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm border border-slate-700 transition cursor-pointer flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <span>Explore Coding Library ({kidsProblems.length} Missions)</span>
            </a>

            <button
              type="button"
              onClick={handleOpenAskAI}
              className="py-3 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-md transition cursor-pointer flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Ask AI Coding Assistant</span>
            </button>
          </div>

          {/* Quick Perks Bar */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-5 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              No Software to Install
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Python, JS, TS &amp; Java
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Live In-Browser Execution
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              100% Free Forever
            </span>
          </div>
        </div>
      </section>

      {/* 2. AUTH & GEMINI KEY HELPER CARD (Requirement 2 & 5) */}
      <section className="max-w-5xl mx-auto w-full px-4 sm:px-6 pt-6">
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
              <Sparkles className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="space-y-0.5">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Sign in with Google &amp; Enable Live AI Answers
                {currentUser && hasGeminiKey && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono">
                    AI Active
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Save your progress with 1-click Google sign-in. Enter your free Google Gemini API key to unlock the <strong>Ask AI</strong> coding mentor for unlimited live programming answers.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {!currentUser ? (
              <GoogleSignInButton buttonText="Sign In with Google" className="py-2.5 px-4 text-xs" />
            ) : !hasGeminiKey ? (
              <button
                type="button"
                onClick={() => setShowKeyModal(true)}
                className="py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer"
              >
                <KeyRound className="w-4 h-4" />
                <span>Configure Gemini Key</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleOpenAskAI}
                className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer"
              >
                <Zap className="w-4 h-4" />
                <span>Ask AI Assistant</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 3. KIDS CODING PROBLEM LIBRARY (Requirement 6) */}
      <section id="problems" className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              <span>📚 Readily Available Coding Challenges (Ages 10–14)</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-bold font-mono">
                {kidsProblems.length} Challenges
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Click any challenge to load its starter code directly into the compiler below in Python, JS, TS, or Java!
            </p>
          </div>

          <Link
            href="/sandbox/code/problems"
            className="text-xs font-bold text-amber-400 hover:text-amber-300 inline-flex items-center gap-1"
          >
            <span>Full Problem Library →</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {kidsProblems.map((prob) => (
            <div
              key={prob.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-amber-500/40 transition flex flex-col justify-between space-y-4 shadow-sm group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    Ages 10–14
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">
                    {prob.difficulty}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition">
                  {prob.title}
                </h3>

                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                  {prob.description}
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {['Python', 'JS', 'TS', 'Java'].map((l) => (
                    <span
                      key={l}
                      className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-semibold"
                    >
                      {l}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleLoadProblem(prob)}
                    className="flex-1 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Load in Compiler</span>
                  </button>

                  <Link
                    href={`/sandbox/code/problems/${prob.id}`}
                    className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
                    title="View Full Problem Statement"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. ONLINE COMPILER (Requirement 7) */}
      <section id="kids-compiler" className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              <Laptop className="w-5 h-5 text-amber-400" />
              <span>Kids Online Compiler &amp; Runner</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Write, compile, and execute Python, JavaScript, TypeScript, and Java code live!
            </p>
          </div>

          {/* Language Selector */}
          <div className="inline-flex rounded-xl p-1 bg-slate-900 border border-slate-800 text-xs">
            {(['python', 'javascript', 'typescript', 'java'] as const).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => handleLangChange(lang)}
                className={`px-3 py-1.5 rounded-lg font-bold capitalize transition cursor-pointer ${
                  selectedLang === lang
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        {/* Compiler Workspace: Editor & Output side by side on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Editor Area */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col shadow-sm">
            <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="font-mono text-slate-400 text-[11px] ml-1">
                  main.{selectedLang === 'python' ? 'py' : selectedLang === 'javascript' ? 'js' : selectedLang === 'typescript' ? 'ts' : 'java'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCode(KIDS_LANG_STARTERS[selectedLang] || '')}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold flex items-center gap-1 transition"
                  title="Reset code template"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>

                <button
                  type="button"
                  disabled={isRunning}
                  onClick={handleRunCode}
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{isRunning ? 'Running...' : 'Run Code'}</span>
                </button>
              </div>
            </div>

            <textarea
              rows={16}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full bg-slate-950 p-4 font-mono text-xs text-amber-200/90 leading-relaxed focus:outline-none resize-none flex-1"
              spellCheck={false}
            />
          </div>

          {/* Terminal / Output Area */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col shadow-sm">
            <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-slate-200">Terminal Output</span>
              </div>

              <span className="text-[10px] text-slate-500 font-mono">
                {selectedLang.toUpperCase()} Engine
              </span>
            </div>

            <div className="p-4 bg-slate-950 font-mono text-xs flex-1 min-h-[300px] overflow-y-auto space-y-2">
              {terminalError ? (
                <div className="text-rose-400 whitespace-pre-wrap leading-relaxed">
                  <div className="text-[10px] font-bold text-rose-500 uppercase tracking-wider mb-1">
                    ⚠ Error Detected:
                  </div>
                  {terminalError}
                </div>
              ) : (
                <div className="text-emerald-300 whitespace-pre-wrap leading-relaxed">
                  {terminalOutput}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Gemini Key Modal */}
      {showKeyModal && <GeminiKeyModal isOpen={showKeyModal} onClose={() => setShowKeyModal(false)} />}
    </div>
  );
}
