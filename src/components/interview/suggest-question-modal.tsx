'use client';

import React, { useState } from 'react';
import {
  X,
  FileSpreadsheet,
  Download,
  UploadCloud,
  CheckCircle2,
  RefreshCw,
  Send,
  HelpCircle,
  Code2,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { QADatabase } from '@/lib/qa-db';

interface SuggestQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SuggestQuestionModal({ isOpen, onClose }: SuggestQuestionModalProps) {
  const [activeTab, setActiveTab] = useState<'manual' | 'import'>('manual');

  // Manual typing state
  const [question, setQuestion] = useState('');
  const [technology, setTechnology] = useState('Selenium');
  const [difficulty, setDifficulty] = useState('Mid');
  const [topic, setTopic] = useState('');
  const [answerSummary, setAnswerSummary] = useState('');
  const [codeSnippet, setCodeSnippet] = useState('');
  const [bestPractice, setBestPractice] = useState('');
  const [pitfallToAvoid, setPitfallToAvoid] = useState('');

  // Import state
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccessMsg, setImportSuccessMsg] = useState('');
  const [importError, setImportError] = useState('');

  // Overall status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successBanner, setSuccessBanner] = useState('');
  const [errorBanner, setErrorBanner] = useState('');

  if (!isOpen) return null;

  // Template download in CSV/Excel-compatible format
  const handleDownloadTemplate = () => {
    const csvHeader =
      'Question,Technology,Difficulty,Topic,AnswerSummary,CodeSnippet,BestPractice,PitfallToAvoid\n';
    const sampleRow =
      '"How do you handle dynamic web tables with Selenium in Java?","Selenium","Mid","Dynamic Tables","Use relative XPath axes such as following-sibling and locate rows dynamically by key text.","WebElement row = driver.findElement(By.xpath(\\"//td[text()=\'Chrome\']/following-sibling::td[2]\\"));","Scope elements to row parent instead of global queries.","Never use Thread.sleep or hardcoded row index."\n';
    const blob = new Blob([csvHeader + sampleRow], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'IntelligentQA_Question_Import_Template.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  // Handle Manual Form Submission
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorBanner('');

    if (!question.trim()) {
      setErrorBanner('Please enter the question text (Mandatory field).');
      return;
    }
    if (!answerSummary.trim()) {
      setErrorBanner('Please enter the explanation/answer summary (Mandatory field).');
      return;
    }

    setIsSubmitting(true);
    try {
      const newQuestion = {
        id: `user-suggested-${Date.now()}`,
        question: question.trim(),
        technology,
        difficulty,
        topic: topic.trim() || 'General QA & SDET',
        answerSummary: answerSummary.trim(),
        codeSnippet: codeSnippet.trim() || undefined,
        bestPractice: bestPractice.trim() || 'Follow standard framework design patterns.',
        pitfallToAvoid: pitfallToAvoid.trim() || 'Avoid hardcoded waits or fragile locators.',
        dateAdded: new Date().toISOString(),
      };

      // Save to QADatabase / localStorage
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('intelligentqa_user_suggested_questions');
        const list = stored ? JSON.parse(stored) : [];
        list.unshift(newQuestion);
        localStorage.setItem('intelligentqa_user_suggested_questions', JSON.stringify(list));
        window.dispatchEvent(new Event('intelligentqa_questions_updated'));
      }

      setSuccessBanner(
        '🎉 Question submitted successfully! Thank you for contributing to the community.'
      );
      setTimeout(() => {
        setSuccessBanner('');
        onClose();
        // Reset form
        setQuestion('');
        setTopic('');
        setAnswerSummary('');
        setCodeSnippet('');
        setBestPractice('');
        setPitfallToAvoid('');
      }, 1800);
    } catch (err: any) {
      setErrorBanner(err?.message || 'Failed to submit question. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle CSV/Excel File Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportError('');
    setImportSuccessMsg('');

    try {
      const text = await file.text();
      const lines = text
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean);

      if (lines.length <= 1) {
        setImportError('The file appears to be empty or contains only a header.');
        setIsImporting(false);
        return;
      }

      // Check for header
      const dataRows = lines[0].toLowerCase().includes('question') ? lines.slice(1) : lines;
      let count = 0;
      const imported: any[] = [];

      for (const row of dataRows) {
        // Simple regex / split taking quotes into account
        const parts = row
          .split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
          .map((p) => p.replace(/^"|"$/g, '').trim());
        if (parts[0] && parts[0].length > 5) {
          imported.push({
            id: `imported-${Date.now()}-${count++}`,
            question: parts[0],
            technology: parts[1] || 'QA Automation',
            difficulty: parts[2] || 'Mid',
            topic: parts[3] || 'Community Contribution',
            answerSummary: parts[4] || 'Answer provided in imported template.',
            codeSnippet: parts[5] || undefined,
            bestPractice: parts[6] || 'Follow clean code and framework best practices.',
            pitfallToAvoid: parts[7] || 'Avoid flakiness and hardcoded parameters.',
          });
        }
      }

      if (imported.length > 0) {
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem('intelligentqa_user_suggested_questions');
          const list = stored ? JSON.parse(stored) : [];
          localStorage.setItem(
            'intelligentqa_user_suggested_questions',
            JSON.stringify([...imported, ...list])
          );
          window.dispatchEvent(new Event('intelligentqa_questions_updated'));
        }

        setImportSuccessMsg(`Imported ${imported.length} questions successfully!`);
        setTimeout(() => {
          onClose();
        }, 1600);
      } else {
        setImportError('No valid questions found. Please make sure the Question column has text.');
      }
    } catch (err: any) {
      setImportError('Failed to read file: ' + (err?.message || 'Invalid format'));
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#121212] border border-[#262626] w-full max-w-2xl rounded-[28px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-white">
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-[#222222] bg-[#161616]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#1F1F1F] border border-[#2B2B2B] text-[#81FF89] flex items-center justify-center shadow-xs">
              <HelpCircle className="w-5 h-5 text-[#81FF89]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Suggest or Contribute a Question
              </h2>
              <p className="text-xs text-zinc-400">
                Share a real interview question or coding problem with the SDET community
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#1F1F1F] hover:bg-[#282828] text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher: Manual Entry vs Import Template */}
        <div className="flex items-center border-b border-[#222222] bg-[#141414] px-5 pt-3 gap-6">
          <button
            type="button"
            onClick={() => setActiveTab('manual')}
            className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'manual'
                ? 'border-[#81FF89] text-[#81FF89]'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Option 1: Manual Typing (All Fields)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('import')}
            className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'import'
                ? 'border-[#81FF89] text-[#81FF89]'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Option 2: Download Template &amp; Import</span>
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 font-sans">
          {successBanner && (
            <div className="p-3.5 rounded-2xl bg-emerald-950/70 border border-emerald-500/40 text-xs text-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#81FF89] shrink-0" />
              <span>{successBanner}</span>
            </div>
          )}

          {errorBanner && (
            <div className="p-3.5 rounded-2xl bg-rose-950/70 border border-rose-500/40 text-xs text-rose-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorBanner}</span>
            </div>
          )}

          {/* TAB 1: Manual Form */}
          {activeTab === 'manual' ? (
            <form onSubmit={handleManualSubmit} className="space-y-4 text-left">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300 flex items-center justify-between">
                  <span>
                    Question Statement <span className="text-[#81FF89]">*</span>
                  </span>
                  <span className="text-[10px] text-zinc-500 font-normal">Mandatory</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="e.g. How do you implement retry logic for flaky tests in Playwright?"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F0F0F] border border-[#2B2B2B] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#81FF89] resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300">
                    Technology Stack <span className="text-[#81FF89]">*</span>
                  </label>
                  <select
                    value={technology}
                    onChange={(e) => setTechnology(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#0F0F0F] border border-[#2B2B2B] text-xs text-white focus:outline-none focus:border-[#81FF89] cursor-pointer"
                  >
                    <option value="Playwright">Playwright</option>
                    <option value="Selenium">Selenium</option>
                    <option value="Java">Core Java</option>
                    <option value="TypeScript">TypeScript</option>
                    <option value="API Testing">API Testing &amp; REST Assured</option>
                    <option value="Manual QA">Manual QA &amp; Strategy</option>
                    <option value="AI & LLM">AI &amp; LLM in QA</option>
                    <option value="Framework Design">Framework Design</option>
                    <option value="CI/CD">CI/CD &amp; Docker</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300">
                    Difficulty Level <span className="text-[#81FF89]">*</span>
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#0F0F0F] border border-[#2B2B2B] text-xs text-white focus:outline-none focus:border-[#81FF89] cursor-pointer"
                  >
                    <option value="Junior">Junior SDET (0-2 Yrs)</option>
                    <option value="Mid">Mid SDET (2-5 Yrs)</option>
                    <option value="Senior">Senior SDET (5-8 Yrs)</option>
                    <option value="Architect">Test Architect (8+ Yrs)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300">Topic / Subcategory</label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. Flaky Test Mitigation"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F0F0F] border border-[#2B2B2B] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#81FF89]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300 flex items-center justify-between">
                  <span>
                    Answer Summary &amp; Technical Explanation{' '}
                    <span className="text-[#81FF89]">*</span>
                  </span>
                  <span className="text-[10px] text-zinc-500 font-normal">Mandatory</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={answerSummary}
                  onChange={(e) => setAnswerSummary(e.target.value)}
                  placeholder="Explain the technical concept, architectural rationale, and real-world behavior..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F0F0F] border border-[#2B2B2B] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#81FF89] resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300">Code Snippet (Optional)</label>
                <textarea
                  rows={3}
                  value={codeSnippet}
                  onChange={(e) => setCodeSnippet(e.target.value)}
                  placeholder="// Paste illustrative test code, locator or config here"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F0F0F] border border-[#2B2B2B] font-mono text-xs text-[#81FF89] placeholder-zinc-600 focus:outline-none focus:border-[#81FF89] resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300">
                    Recommended Best Practice
                  </label>
                  <input
                    type="text"
                    value={bestPractice}
                    onChange={(e) => setBestPractice(e.target.value)}
                    placeholder="e.g. Configure retries in CI config instead of hardcoded loops."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F0F0F] border border-[#2B2B2B] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#81FF89]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300">Pitfall to Avoid</label>
                  <input
                    type="text"
                    value={pitfallToAvoid}
                    onChange={(e) => setPitfallToAvoid(e.target.value)}
                    placeholder="e.g. Never rely on retries to mask genuine race conditions."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F0F0F] border border-[#2B2B2B] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#81FF89]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-full bg-[#1E1E1E] hover:bg-[#282828] text-xs font-semibold text-zinc-300 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-full bg-[#81FF89] hover:bg-[#6ee776] text-black text-xs font-bold flex items-center gap-1.5 transition shadow-md cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Submitting...' : 'Submit Question'}</span>
                </button>
              </div>
            </form>
          ) : (
            /* TAB 2: Download Template & Import File */
            <div className="space-y-5 text-left">
              {/* Step 1: Download Template */}
              <div className="p-4 rounded-2xl bg-[#161616] border border-[#2B2B2B] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Download className="w-4 h-4 text-[#81FF89]" />
                    <span>Step 1: Download the Standard Template</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Includes columns for Question, Technology, Difficulty, Topic, Answer, Code, and
                    Best Practices.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="px-4 py-2 rounded-full bg-white hover:bg-zinc-200 text-black text-xs font-bold flex items-center gap-1.5 shrink-0 transition cursor-pointer shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Template</span>
                </button>
              </div>

              {/* Step 2: Fill & Upload */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-zinc-300">
                  Step 2: Fill the template and upload (.csv or .xlsx)
                </div>
                <div className="bg-[#141414] border-2 border-dashed border-[#2B2B2B] hover:border-[#81FF89]/60 rounded-2xl p-7 text-center space-y-2.5 transition-colors">
                  <input
                    type="file"
                    id="suggest-question-file-upload"
                    accept=".csv,.xlsx,.xls,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="suggest-question-file-upload"
                    className="cursor-pointer flex flex-col items-center justify-center gap-2"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-[#1F1F1F] border border-[#2B2B2B] flex items-center justify-center text-[#81FF89]">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <div className="text-sm font-bold text-white">
                      Click to Browse or Drop File Here
                    </div>
                    <div className="text-xs text-zinc-400">
                      Supports CSV, Excel (.xlsx), or formatted text exports
                    </div>
                  </label>

                  {isImporting && (
                    <div className="flex items-center justify-center gap-2 text-xs text-[#81FF89] font-semibold py-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Parsing template and validating fields...</span>
                    </div>
                  )}
                  {importSuccessMsg && (
                    <div className="text-xs text-[#81FF89] font-bold py-2">
                      ✓ {importSuccessMsg}
                    </div>
                  )}
                  {importError && (
                    <div className="text-xs text-rose-400 font-medium py-2">✕ {importError}</div>
                  )}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#181818] border border-[#262626] text-[11px] text-zinc-400 space-y-1">
                <span className="font-bold text-white">Mandatory Fields in Template:</span>
                <p>
                  1. <strong>Question</strong>: The complete interview or scenario question text.
                  <br />
                  2. <strong>AnswerSummary</strong>: The technical resolution and explanation.
                  <br />
                  3. <strong>Technology</strong> &amp; <strong>Difficulty</strong>: e.g. Playwright
                  / Selenium and Junior / Mid / Senior / Architect.
                </p>
              </div>

              <div className="flex items-center justify-end pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-full bg-[#1E1E1E] hover:bg-[#282828] text-xs font-semibold text-zinc-300 transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
