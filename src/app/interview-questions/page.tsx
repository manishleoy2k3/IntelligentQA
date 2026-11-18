'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  Code2,
  HelpCircle,
  Copy,
  Check,
  Sparkles,
  Layers,
  FileSpreadsheet,
  UploadCloud,
  X,
  Download,
  Filter,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { getCuratedInterviewQuestions } from '@/lib/qa-knowledge-base';
import { getAllInterviewQuestions } from '@/lib/interview-questions-bank';
import { InterviewQuestionItem } from '@/types/qa';
import { QADatabase, DEMO_USER } from '@/lib/qa-db';
import AuthGuard from '@/components/auth/auth-guard';
import { parseRequirementsFile } from '@/lib/file-parser';
import { generateExcelWorkbookXml } from '@/lib/excel-export';
import FormattedInterviewAnswer from '@/components/ui/formatted-interview-answer';

export default function InterviewQuestionsPage() {
  const [questions, setQuestions] = useState<InterviewQuestionItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTech, setSelectedTech] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [showOnlyBookmarks, setShowOnlyBookmarks] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Pagination & Display Limit for fast 60fps rendering of 500+ items
  const [displayLimit, setDisplayLimit] = useState(24);

  // Import Modal state
  const [showImportModal, setShowImportModal] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccessMsg, setImportSuccessMsg] = useState('');
  const [importError, setImportError] = useState('');

  useEffect(() => {
    const loadQuestions = () => {
      const all = getAllInterviewQuestions();
      setQuestions(all);
    };
    loadQuestions();

    const user = QADatabase.getCurrentUser() || DEMO_USER;
    QADatabase.getBookmarks(user.id).then(bms => {
      setBookmarkedIds(bms.map(b => b.questionId));
    });

    if (typeof window !== 'undefined') {
      window.addEventListener('intelligentqa_interview_questions_changed', loadQuestions);
      return () => {
        window.removeEventListener('intelligentqa_interview_questions_changed', loadQuestions);
      };
    }
  }, []);

  // Reset display limit when filter criteria changes
  useEffect(() => {
    setDisplayLimit(24);
  }, [searchTerm, selectedTech, selectedDifficulty, showOnlyBookmarks]);

  const handleToggleBookmark = async (qId: string) => {
    const user = QADatabase.getCurrentUser() || DEMO_USER;
    const isNowBookmarked = await QADatabase.toggleBookmark(user.id, qId);
    if (isNowBookmarked) {
      setBookmarkedIds(prev => [...prev, qId]);
    } else {
      setBookmarkedIds(prev => prev.filter(id => id !== qId));
    }
  };

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Download sample Excel template for users to provide custom questions
  const handleDownloadTemplate = () => {
    const headers = ['Question', 'Technology', 'Difficulty', 'Topic', 'Answer Summary', 'Code Snippet', 'Best Practice', 'Pitfall to Avoid'];
    const sampleRows = [
      [
        'How do you architect distributed test execution for enterprise microservices?',
        'Playwright',
        'Architect',
        'Enterprise Architecture',
        'Isolate tests in ephemeral containers, shard across CI matrix jobs, and use consumer contract tests before E2E runs.',
        '// playwright.config.ts\nworkers: process.env.CI ? 4 : undefined,',
        'Shard tests with --shard=1/4 across CI runners to achieve sub-10 minute feedback.',
        'Sharing global database state across parallel test threads.'
      ],
      [
        'How do you handle multi-threaded WebDriver sessions in parallel TestNG execution?',
        'Selenium',
        'Architect',
        'Concurrency & Thread Safety',
        'Use ThreadLocal<WebDriver> with strict tlDriver.remove() in teardown to prevent thread pool memory leaks.',
        'private static final ThreadLocal<WebDriver> driver = new ThreadLocal<>();',
        'Always clean up with tlDriver.remove() inside an @AfterMethod listener.',
        'Using static WebDriver references shared across all test worker threads.'
      ],
      [
        'How do you test asynchronous Kafka message streams in integration tests?',
        'API Testing',
        'Architect',
        'Event-Driven Systems',
        'Use Awaitility with embedded or Testcontainers Kafka consumers to poll message offsets and assert payload schemas.',
        'Awaitility.await().atMost(5, SECONDS).untilAsserted(() -> Assert.assertTrue(records.count() > 0));',
        'Use Testcontainers for reproducible isolated Kafka broker testing.',
        'Using Thread.sleep(5000) waiting blindly for background events to publish.'
      ]
    ];

    const xml = generateExcelWorkbookXml('Interview Questions Template', headers, sampleRows);
    const blob = new Blob([xml], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `intelligentqa-questions-template.xls`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Import custom Excel / CSV questions file
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportError('');
    setImportSuccessMsg('');

    try {
      const parsed = await parseRequirementsFile(file);
      const text = parsed.extractedText;
      const lines = text.split('\n').filter(l => l.trim().length > 0);

      const newItems: InterviewQuestionItem[] = [];
      let currentItem: Partial<InterviewQuestionItem> | null = null;
      let count = 1;

      // Parse lines into question items
      for (const line of lines) {
        const trimmed = line.trim();
        // Check if line looks like a question or CSV row
        if (trimmed.includes(',') && (trimmed.includes('Playwright') || trimmed.includes('Selenium') || trimmed.includes('Java') || trimmed.includes('API') || trimmed.includes('Architect') || trimmed.includes('Senior'))) {
          // CSV-style split
          const parts = trimmed.split(',').map(p => p.trim().replace(/^"|"$/g, ''));
          if (parts.length >= 3 && parts[0].length > 10) {
            newItems.push({
              id: `imported-${Date.now()}-${count++}`,
              question: parts[0],
              technology: (parts[1] as any) || 'Framework Design',
              difficulty: (parts[2] as any) || 'Architect',
              topic: parts[3] || 'Imported Scenario',
              answerSummary: parts[4] || 'Custom answer provided via imported spreadsheet.',
              codeSnippet: parts[5] || '// Custom code pattern',
              bestPractice: parts[6] || 'Follow structured automated testing principles.',
              pitfallToAvoid: parts[7] || 'Avoid hardcoded sleeps and brittle locators.',
            });
            continue;
          }
        }

        // Question block parser
        if (trimmed.endsWith('?') || trimmed.startsWith('Q:') || trimmed.startsWith('Question:') || trimmed.match(/^[0-9]+\.\s+/)) {
          if (currentItem && currentItem.question) {
            newItems.push({
              id: `imported-${Date.now()}-${count++}`,
              technology: currentItem.technology || 'Playwright',
              difficulty: currentItem.difficulty || 'Architect',
              topic: currentItem.topic || 'Enterprise Practice',
              question: currentItem.question,
              answerSummary: currentItem.answerSummary || 'Verified technical answer.',
              codeSnippet: currentItem.codeSnippet,
              bestPractice: currentItem.bestPractice || 'Apply resilient test automation patterns.',
              pitfallToAvoid: currentItem.pitfallToAvoid || 'Omitting synchronization and assertions.',
            });
          }
          const cleanQ = trimmed.replace(/^(Q:|Question:|[0-9]+\.)\s*/i, '');
          const guessedTech = cleanQ.toLowerCase().includes('playwright')
            ? 'Playwright'
            : cleanQ.toLowerCase().includes('selenium')
            ? 'Selenium'
            : cleanQ.toLowerCase().includes('api') || cleanQ.toLowerCase().includes('rest')
            ? 'API Testing'
            : cleanQ.toLowerCase().includes('ai') || cleanQ.toLowerCase().includes('llm')
            ? 'AI & LLM'
            : cleanQ.toLowerCase().includes('java')
            ? 'Java'
            : 'Framework Design';

          const guessedDiff = cleanQ.toLowerCase().includes('architect') || cleanQ.toLowerCase().includes('enterprise') || cleanQ.toLowerCase().includes('scale')
            ? 'Architect'
            : cleanQ.toLowerCase().includes('senior') || cleanQ.toLowerCase().includes('ci/cd')
            ? 'Senior'
            : 'Mid';

          currentItem = {
            question: cleanQ,
            technology: guessedTech as any,
            difficulty: guessedDiff as any,
            topic: 'Custom Question Bank',
            answerSummary: '',
          };
        } else if (currentItem) {
          if (!currentItem.answerSummary) {
            currentItem.answerSummary = trimmed;
          } else {
            currentItem.answerSummary += ' ' + trimmed;
          }
        }
      }

      // Add last item
      if (currentItem && currentItem.question) {
        newItems.push({
          id: `imported-${Date.now()}-${count++}`,
          technology: currentItem.technology || 'Playwright',
          difficulty: currentItem.difficulty || 'Architect',
          topic: currentItem.topic || 'Enterprise Practice',
          question: currentItem.question,
          answerSummary: currentItem.answerSummary || 'Verified technical answer.',
          codeSnippet: currentItem.codeSnippet,
          bestPractice: currentItem.bestPractice || 'Apply resilient test automation patterns.',
          pitfallToAvoid: currentItem.pitfallToAvoid || 'Omitting synchronization and assertions.',
        });
      }

      if (newItems.length > 0) {
        setQuestions(prev => {
          const updated = [...newItems, ...prev];
          try {
            const existingCustom = JSON.parse(localStorage.getItem('intelligentqa_custom_interview_questions') || '[]');
            localStorage.setItem('intelligentqa_custom_interview_questions', JSON.stringify([...newItems, ...existingCustom]));
          } catch (e) {
            console.warn('Failed to save to localStorage:', e);
          }
          return updated;
        });
        setImportSuccessMsg(`Successfully imported ${newItems.length} questions from ${file.name}!`);
        setTimeout(() => {
          setShowImportModal(false);
          setImportSuccessMsg('');
        }, 1800);
      } else {
        setImportError('No structured questions could be extracted. Please use the Excel template format or ensure lines contain questions with question marks.');
      }
    } catch (err: any) {
      console.error('Import failed:', err);
      setImportError(`Failed to import file: ${err?.message || 'Unsupported format'}`);
    } finally {
      setIsImporting(false);
      e.target.value = '';
    }
  };

  const filteredQuestions = questions.filter(q => {
    const matchesSearch =
      q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.answerSummary.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTech = selectedTech === 'All' || q.technology === selectedTech;
    const matchesDifficulty = selectedDifficulty === 'All' || q.difficulty === selectedDifficulty;
    const matchesBookmark = !showOnlyBookmarks || bookmarkedIds.includes(q.id);

    return matchesSearch && matchesTech && matchesDifficulty && matchesBookmark;
  });

  const displayedQuestions = filteredQuestions.slice(0, displayLimit);

  return (
    <AuthGuard
      featureName="500+ SDET Interview Question Bank"
      description="Sign in to access 500+ scenario-based SDET interview questions with code snippets, architecture best practices, and search filters."
    >
      <div className="w-full max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>500+ Question Repository · Verified Solutions</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Curated 500+ SDET Interview Question Bank
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-1 max-w-2xl">
              Search real-world technical scenarios across Playwright, Selenium, Java OOPs, API Testing, and Framework Architecture spanning Junior to Test Architect.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Import Questions from Excel (.xlsx / .csv) Button */}
            <button
              onClick={() => setShowImportModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors shadow-sm cursor-pointer"
              title="Import your questions from an Excel spreadsheet or CSV file"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Import Questions (.xlsx / .csv)</span>
            </button>

            {/* Bookmark Filter */}
            <button
              onClick={() => setShowOnlyBookmarks(!showOnlyBookmarks)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                showOnlyBookmarks
                  ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <BookmarkCheck className="w-4 h-4" />
              <span>Bookmarked ({bookmarkedIds.length})</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Toolbar */}
        <div className="flex flex-col md:flex-row items-center gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="relative flex-1 w-full">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search 500+ questions by keyword, topic, or error name (e.g. StaleElement, Flakiness, Sharding, Architect)..."
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-sm sm:text-base text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Tech Selector */}
          <select
            value={selectedTech}
            onChange={e => setSelectedTech(e.target.value)}
            className="w-full md:w-auto px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-200 cursor-pointer"
          >
            <option value="All">All Tech Stacks (500+)</option>
            <option value="Playwright">Playwright</option>
            <option value="Selenium">Selenium</option>
            <option value="Java">Java</option>
            <option value="API Testing">API Testing</option>
            <option value="AI & LLM">AI &amp; LLM</option>
            <option value="Framework Design">Framework Design</option>
          </select>

          {/* Difficulty Selector - with rich Test Architect coverage */}
          <select
            value={selectedDifficulty}
            onChange={e => setSelectedDifficulty(e.target.value)}
            className="w-full md:w-auto px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-200 cursor-pointer"
          >
            <option value="All">All Seniorities</option>
            <option value="Junior">Junior SDET (0-2 Yrs)</option>
            <option value="Mid">Mid SDET (2-5 Yrs)</option>
            <option value="Senior">Senior SDET (5-8 Yrs)</option>
            <option value="Architect">Test Architect (8+ Yrs)</option>
          </select>
        </div>

        {/* Results Count & Active Filter Pills */}
        <div className="flex items-center justify-between text-xs text-slate-500 px-1 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span>Showing <strong>{displayedQuestions.length}</strong> of <strong>{filteredQuestions.length}</strong> matching questions (Total Bank: <strong>{questions.length}</strong>)</span>
            {(selectedTech !== 'All' || selectedDifficulty !== 'All' || searchTerm || showOnlyBookmarks) && (
              <button
                onClick={() => {
                  setSelectedTech('All');
                  setSelectedDifficulty('All');
                  setSearchTerm('');
                  setShowOnlyBookmarks(false);
                }}
                className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold ml-2 cursor-pointer"
              >
                Clear all filters
              </button>
            )}
          </div>
          {selectedDifficulty === 'Architect' && (
            <span className="text-purple-600 dark:text-purple-400 font-semibold bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-full border border-purple-200 dark:border-purple-800">
              ● High-Level Test Architecture Focus
            </span>
          )}
        </div>

        {/* Questions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {displayedQuestions.map(item => {
            const isBookmarked = bookmarkedIds.includes(item.id);
            return (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-sm flex flex-col justify-between space-y-5 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {item.technology}
                      </span>
                      <span
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                          item.difficulty === 'Architect'
                            ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800 font-bold'
                            : item.difficulty === 'Senior'
                            ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400'
                            : item.difficulty === 'Mid'
                            ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400'
                            : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                        }`}
                      >
                        {item.difficulty === 'Architect' ? 'Test Architect' : item.difficulty}
                      </span>
                      {item.topic && (
                        <span className="text-[11px] text-slate-400 truncate max-w-[150px] hidden sm:inline">
                          {item.topic}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleToggleBookmark(item.id)}
                      className="p-1.5 text-slate-400 hover:text-amber-500 rounded-lg transition-colors cursor-pointer"
                      title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Question'}
                    >
                      {isBookmarked ? (
                        <BookmarkCheck className="w-5 h-5 text-amber-500 fill-current" />
                      ) : (
                        <Bookmark className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  <h3 className="font-bold text-slate-900 dark:text-white text-lg sm:text-xl leading-snug">
                    {item.question}
                  </h3>

                  <div className="text-base text-slate-700 dark:text-slate-300 leading-relaxed">
                    <FormattedInterviewAnswer text={item.answerSummary} />
                  </div>

                  {item.codeSnippet && (
                    <div className="relative p-4 bg-slate-950 text-emerald-300 rounded-2xl font-mono text-xs sm:text-sm overflow-x-auto border border-slate-800">
                      <button
                        onClick={() => handleCopyCode(item.id, item.codeSnippet!)}
                        className="absolute right-2.5 top-2.5 p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        title="Copy Snippet"
                      >
                        {copiedId === item.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                      <pre className="whitespace-pre-wrap leading-relaxed">{item.codeSnippet}</pre>
                    </div>
                  )}
                </div>

                {/* Best Practice & Pitfall Pills */}
                <div className="pt-3.5 border-t border-slate-100 dark:border-slate-800 space-y-2 text-sm">
                  <div className="flex items-start gap-2 text-emerald-700 dark:text-emerald-400">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                    <span><strong>Best Practice:</strong> {item.bestPractice}</span>
                  </div>
                  <div className="flex items-start gap-2 text-rose-700 dark:text-rose-400">
                    <HelpCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span><strong>Pitfall to Avoid:</strong> {item.pitfallToAvoid}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Load More Button */}
        {filteredQuestions.length > displayLimit && (
          <div className="text-center pt-4 pb-8">
            <button
              onClick={() => setDisplayLimit(prev => prev + 24)}
              className="py-3 px-8 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:border-indigo-500 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-sm transition-all shadow-sm hover:shadow cursor-pointer"
            >
              Load More Questions ({filteredQuestions.length - displayLimit} remaining)
            </button>
          </div>
        )}

        {filteredQuestions.length === 0 && (
          <div className="text-center py-16 text-slate-500 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <HelpCircle className="w-10 h-10 mx-auto text-slate-400" />
            <p className="font-semibold text-slate-700 dark:text-slate-300">
              No questions matched your filter combination.
            </p>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Try selecting &quot;All Tech Stacks&quot; or clearing the search keyword. You can also import custom questions directly from your own Excel spreadsheet below.
            </p>
            <button
              onClick={() => {
                setSelectedTech('All');
                setSelectedDifficulty('All');
                setSearchTerm('');
                setShowOnlyBookmarks(false);
              }}
              className="py-2 px-4 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Import Questions Modal */}
        {showImportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/70 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      Import Questions from Excel
                    </h2>
                    <p className="text-xs text-slate-500">
                      Upload your spreadsheet (.xlsx, .xls, .csv) into the repository
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowImportModal(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  You can import your own Excel question bank. We support standard columns: <strong>Question</strong>, <strong>Technology</strong>, <strong>Difficulty</strong> (Junior, Mid, Senior, Architect), <strong>Topic</strong>, and <strong>Answer Summary</strong>.
                </p>

                {/* Upload Zone */}
                <div className="bg-slate-50 dark:bg-slate-950 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 rounded-xl p-6 text-center space-y-2 transition-colors">
                  <input
                    type="file"
                    id="excel-questions-file-input"
                    accept=".xlsx,.xls,.csv,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="excel-questions-file-input"
                    className="cursor-pointer flex flex-col items-center justify-center gap-2"
                  >
                    <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      Choose Excel or CSV File
                    </div>
                    <div className="text-xs text-slate-400">
                      Click to browse or drop your questions spreadsheet
                    </div>
                  </label>

                  {isImporting && (
                    <div className="flex items-center justify-center gap-2 text-xs text-emerald-600 font-semibold py-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Parsing spreadsheet and importing questions...</span>
                    </div>
                  )}
                  {importSuccessMsg && (
                    <div className="text-xs text-emerald-600 font-bold py-2">
                      ✓ {importSuccessMsg}
                    </div>
                  )}
                  {importError && (
                    <div className="text-xs text-rose-500 font-medium py-2">
                      ✕ {importError}
                    </div>
                  )}
                </div>

                {/* Download Template Option */}
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                  <div className="text-slate-600 dark:text-slate-400">
                    Need the Excel structure template?
                  </div>
                  <button
                    onClick={handleDownloadTemplate}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Template</span>
                  </button>
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setShowImportModal(false)}
                  className="py-2 px-5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
