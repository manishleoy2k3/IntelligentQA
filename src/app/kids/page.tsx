'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
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
  UploadCloud,
  FileDown,
  FolderPlus,
  Trash2,
} from 'lucide-react';
import { DEFAULT_CODING_PROBLEMS, CodingProblem } from '@/lib/coding-problems';
import {
  DEFAULT_KIDS_COURSES,
  getStoredCustomLessons,
  deleteCustomLesson,
  KidLesson,
} from '@/lib/kids-courses';
import {
  KidsCourseTemplateModal,
  KidsCourseUploadModal,
} from '@/components/kids/kids-course-import-modals';
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

function KidsCoursesContent() {
  const searchParams = useSearchParams();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [hasGeminiKey, setHasGeminiKey] = useState<boolean>(false);
  const [showKeyModal, setShowKeyModal] = useState<boolean>(false);

  // Selected Course Track: Python, JavaScript, Java
  const [selectedCourseLang, setSelectedCourseLang] = useState<'python' | 'javascript' | 'java'>('python');
  const [customLessons, setCustomLessons] = useState<KidLesson[]>([]);

  // Modals for Import Template & Import / Upload
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Compiler state
  const [selectedLang, setSelectedLang] = useState<'python' | 'javascript' | 'typescript' | 'java'>('python');
  const [code, setCode] = useState<string>(KIDS_LANG_STARTERS.python);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [terminalOutput, setTerminalOutput] = useState<string>('Ready to run code. Click "Run Code" above!');
  const [terminalError, setTerminalError] = useState<string>('');

  // Coding Library Problems (Renamed from Kids Problem Library)
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

  // Sync course language from query parameter (?lang=python | javascript | java)
  useEffect(() => {
    const langParam = searchParams.get('lang');
    if (langParam === 'python' || langParam === 'javascript' || langParam === 'java') {
      setSelectedCourseLang(langParam);
      setSelectedLang(langParam);
      setCode(KIDS_LANG_STARTERS[langParam] || '');
    }
  }, [searchParams]);

  // Load custom stored lessons for active language
  const refreshCustomLessons = () => {
    const stored = getStoredCustomLessons(selectedCourseLang);
    setCustomLessons(stored);
  };

  useEffect(() => {
    refreshCustomLessons();
  }, [selectedCourseLang]);

  const handleCourseTrackChange = (lang: 'python' | 'javascript' | 'java') => {
    setSelectedCourseLang(lang);
    setSelectedLang(lang);
    setCode(KIDS_LANG_STARTERS[lang] || '');
    setTerminalOutput(`Switched to ${lang}. Click "Run Code" to test!`);
    setTerminalError('');
  };

  const handleLangChange = (lang: 'python' | 'javascript' | 'typescript' | 'java') => {
    setSelectedLang(lang);
    setCode(KIDS_LANG_STARTERS[lang] || '');
    setTerminalOutput(`Switched to ${lang}. Click "Run Code" to test!`);
    setTerminalError('');
  };

  const handleLoadLessonIntoCompiler = (lesson: KidLesson) => {
    setSelectedLang(lesson.language);
    setCode(lesson.starterCode);
    setTerminalOutput(`Loaded lesson: "${lesson.title}". Complete the mission and click "Run Code"!`);
    setTerminalError('');
    document.getElementById('kids-compiler')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDeleteCustomLesson = (id: string) => {
    deleteCustomLesson(id, selectedCourseLang);
    refreshCustomLessons();
  };

  const handleLoadProblem = (prob: CodingProblem) => {
    const starter = prob.starterTemplates[selectedLang] || prob.starterTemplates.python;
    setCode(starter);
    setTerminalOutput(`Loaded "${prob.title}" in ${selectedLang}. Click "Run Code" to test your solution!`);
    setTerminalError('');
    document.getElementById('kids-compiler')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleRunCode = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setTerminalOutput('Running code in live sandbox runner...');
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
      if (!res.ok || data.error) {
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

  const activeTrack = DEFAULT_KIDS_COURSES[selectedCourseLang];
  const allLessons = [...activeTrack.lessons, ...customLessons];

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* 1. COURSES HERO HEADER */}
      <section className="relative overflow-hidden border-b border-slate-800 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 py-10 px-4 sm:px-6">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-amber-500/15 via-orange-500/15 to-indigo-500/15 blur-3xl pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-xs">
            <Rocket className="w-4 h-4 text-amber-400 animate-bounce" />
            <span>100% Free Programming Courses for Kids &amp; Beginners (Ages 10–14)</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Learn Programming with{' '}
            <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 bg-clip-text text-transparent">
              Python, JavaScript &amp; Java!
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Step-by-step programming courses covering variables, loops, logic, and functions.
            Practice inside zero-setup browser compilers, and import your own custom lesson guides anytime.
          </p>

          {/* Quick Shortcuts */}
          <div className="flex items-center justify-center gap-3 flex-wrap pt-1">
            <a
              href="#courses-content"
              className="py-2.5 px-5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              <span>Browse Course Lessons</span>
            </a>

            <a
              href="#kids-compiler"
              className="py-2.5 px-5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm border border-slate-700 transition flex items-center gap-2"
            >
              <Laptop className="w-4 h-4 text-blue-400" />
              <span>Online Compilers</span>
            </a>

            <a
              href="#problems"
              className="py-2.5 px-5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm border border-slate-700 transition flex items-center gap-2"
            >
              <Award className="w-4 h-4 text-emerald-400" />
              <span>Coding Library</span>
            </a>
          </div>
        </div>
      </section>

      {/* 2. AUTH & GEMINI KEY HELPER CARD */}
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
                Save your progress with 1-click Google sign-in. Connect your free Google Gemini API key to unlock the <strong>Ask AI</strong> assistant for live coding help.
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
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Key Connected</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 3. COURSES PAGE: TRACK SELECTOR, IMPORT TEMPLATE & IMPORT/UPLOAD BUTTONS */}
      <section id="courses-content" className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          {/* Track Language Tabs: Python, JavaScript, Java */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => handleCourseTrackChange('python')}
              className={`py-2 px-4 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                selectedCourseLang === 'python'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              <Terminal className="w-4 h-4" />
              <span>Python Course</span>
            </button>

            <button
              type="button"
              onClick={() => handleCourseTrackChange('javascript')}
              className={`py-2 px-4 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                selectedCourseLang === 'javascript'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span>JavaScript Course</span>
            </button>

            <button
              type="button"
              onClick={() => handleCourseTrackChange('java')}
              className={`py-2 px-4 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                selectedCourseLang === 'java'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              <Laptop className="w-4 h-4" />
              <span>Java Course</span>
            </button>
          </div>

          {/* Import Template & Import/Upload Action Buttons (Requirement 3) */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setShowTemplateModal(true)}
              className="py-2 px-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
              title="Download standardized Import Template (JSON/CSV) with mandatory schema fields"
            >
              <FileDown className="w-4 h-4 text-amber-400" />
              <span>Import Template</span>
            </button>

            <button
              type="button"
              onClick={() => setShowUploadModal(true)}
              className="py-2 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer"
              title="Import and Upload new course lessons or guides"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Import Course Content</span>
            </button>
          </div>
        </div>

        {/* Course Overview Banner */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-900/60 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <span>{activeTrack.title}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {activeTrack.badge}
              </span>
            </h2>
            <span className="text-xs font-mono font-bold text-amber-400">
              {allLessons.length} Total Lessons ({customLessons.length} Custom Imported)
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">
            {activeTrack.summary} Click <strong>Open in Compiler</strong> on any lesson below to test the code interactively. Use <strong>Import Template</strong> and <strong>Import Course Content</strong> to expand the curriculum.
          </p>
        </div>

        {/* Lessons List Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allLessons.map((lesson, idx) => (
            <div
              key={lesson.id}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 hover:border-amber-500/40 transition flex flex-col justify-between space-y-4 shadow-sm group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-amber-400 border border-slate-700">
                    {lesson.module}
                  </span>
                  {lesson.id.startsWith('custom-') ? (
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                      Imported
                    </span>
                  ) : (
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-semibold">
                      Lesson #{idx + 1}
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition">
                  {lesson.title}
                </h3>

                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                  {lesson.summary}
                </p>

                {lesson.exercise && (
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] text-slate-300">
                    <strong className="text-amber-400">Challenge: </strong>
                    {lesson.exercise}
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleLoadLessonIntoCompiler(lesson)}
                  className="flex-1 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition flex items-center justify-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Open in Compiler</span>
                </button>

                {lesson.id.startsWith('custom-') && (
                  <button
                    type="button"
                    onClick={() => handleDeleteCustomLesson(lesson.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                    title="Delete custom imported lesson"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. ONLINE COMPILER FOR JAVA, JAVASCRIPT, PYTHON & TYPESCRIPT */}
      <section id="kids-compiler" className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              <Laptop className="w-5 h-5 text-blue-400" />
              <span>Kids Online Compiler &amp; Runner</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Write, edit, and run code directly in your browser with zero setup.
            </p>
          </div>

          {/* Language Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800">
            {(['python', 'javascript', 'typescript', 'java'] as const).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => handleLangChange(lang)}
                className={`py-1.5 px-3 rounded-lg text-xs font-bold capitalize transition ${
                  selectedLang === lang
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {lang === 'typescript' ? 'TS' : lang === 'javascript' ? 'JS' : lang}
              </button>
            ))}
          </div>
        </div>

        {/* Editor & Terminal Output */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left: Code Editor Area */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col shadow-sm">
            <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
              <span className="font-bold text-white capitalize">{selectedLang} Editor</span>
              <button
                type="button"
                onClick={() => setCode(KIDS_LANG_STARTERS[selectedLang] || '')}
                className="hover:text-amber-400 flex items-center gap-1 transition"
                title="Reset starter template"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>

            <textarea
              rows={14}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full flex-1 p-4 bg-slate-900 font-mono text-xs sm:text-sm text-slate-200 focus:outline-none resize-none leading-relaxed"
              spellCheck={false}
            />

            <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                {code.split('\n').length} lines · {selectedLang}
              </span>

              <button
                type="button"
                disabled={isRunning}
                onClick={handleRunCode}
                className="py-2 px-5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-60 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-sm transition active:scale-95 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isRunning ? 'Running...' : 'Run Code'}</span>
              </button>
            </div>
          </div>

          {/* Right: Terminal Console Output */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col shadow-sm">
            <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
              <span className="font-bold text-white">Execution Console / Output</span>
              <span className="text-[10px] text-slate-500">In-Browser Sandbox</span>
            </div>

            <div className="p-4 bg-slate-950 font-mono text-xs text-slate-300 flex-1 min-h-[240px] overflow-y-auto space-y-2 whitespace-pre-wrap">
              {terminalOutput && <div className="text-emerald-400">{terminalOutput}</div>}
              {terminalError && (
                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
                  {terminalError}
                </div>
              )}
            </div>

            <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
              <span>Status: {isRunning ? 'Executing...' : 'Idle'}</span>
              <button
                type="button"
                onClick={() => {
                  setTerminalOutput('Console cleared.');
                  setTerminalError('');
                }}
                className="hover:text-slate-300 transition"
              >
                Clear Console
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CODING LIBRARY (Renamed from Kids Problem Library) */}
      <section id="problems" className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              <span>📚 Coding Library (Readily Available Coding Challenges)</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-bold font-mono">
                {kidsProblems.length} Challenges
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Select any coding challenge to load its template directly into the compiler in Python, JS, TS, or Java!
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

                <button
                  type="button"
                  onClick={() => handleLoadProblem(prob)}
                  className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-white font-bold text-xs transition flex items-center justify-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Load into Compiler</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Modals */}
      {showKeyModal && (
        <GeminiKeyModal
          isOpen={showKeyModal}
          onClose={() => setShowKeyModal(false)}
          onSaved={() => {
            setShowKeyModal(false);
            setHasGeminiKey(Boolean(QADatabase.getUserGeminiKey(currentUser?.id)));
          }}
          reason="Enter your free Google Gemini API key to activate AI programming answers."
        />
      )}

      {showTemplateModal && (
        <KidsCourseTemplateModal
          isOpen={showTemplateModal}
          onClose={() => setShowTemplateModal(false)}
          language={selectedCourseLang}
        />
      )}

      {showUploadModal && (
        <KidsCourseUploadModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          language={selectedCourseLang}
          onCourseAdded={refreshCustomLessons}
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
