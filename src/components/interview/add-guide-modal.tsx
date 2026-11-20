'use client';

import React, { useState, useRef } from 'react';
import {
  X,
  FileSpreadsheet,
  Download,
  UploadCloud,
  CheckCircle2,
  RefreshCw,
  Send,
  Plus,
  Code2,
  AlertCircle,
  FileText,
  Upload,
  Copy,
  Check,
  BookOpen,
} from 'lucide-react';
import { QADatabase } from '@/lib/qa-db';
import {
  ConceptGuide,
  TRACK_META,
  saveStagedGuide,
  generateConceptGuideTemplate,
  downloadConceptGuideTemplate,
  parseImportedGuides,
} from '@/lib/concept-guides';

interface AddGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTrack?: string;
  onSuccess?: (msg: string) => void;
}

export default function AddGuideModal({
  isOpen,
  onClose,
  defaultTrack = 'selenium',
  onSuccess,
}: AddGuideModalProps) {
  const [activeTab, setActiveTab] = useState<'manual' | 'import' | 'template'>('manual');
  const [selectedTrack, setSelectedTrack] = useState<string>(defaultTrack);

  // Manual Guide state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Framework Architecture');
  const [level, setLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [summary, setSummary] = useState('');
  const [overview, setOverview] = useState('');
  const [mechanism, setMechanism] = useState('');
  const [codeLang, setCodeLang] = useState('java');
  const [codeSnippet, setCodeSnippet] = useState('');
  const [interviewTips, setInterviewTips] = useState('');

  // Import state
  const [importText, setImportText] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccessMsg, setImportSuccessMsg] = useState('');
  const [importError, setImportError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Template state
  const [templateFormat, setTemplateFormat] = useState<'json' | 'csv'>('json');
  const [templateCopied, setTemplateCopied] = useState(false);

  // Overall status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorBanner, setErrorBanner] = useState('');

  if (!isOpen) return null;

  const handleCopyTemplate = async () => {
    try {
      const templateStr = generateConceptGuideTemplate(templateFormat, selectedTrack);
      await navigator.clipboard.writeText(templateStr);
      setTemplateCopied(true);
      setTimeout(() => setTemplateCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorBanner('');

    if (!title.trim()) {
      setErrorBanner('Please enter the Concept Title (Mandatory).');
      return;
    }
    if (!summary.trim()) {
      setErrorBanner('Please enter a Summary (Mandatory).');
      return;
    }

    setIsSubmitting(true);
    try {
      const newGuide: ConceptGuide = {
        id: `guide-${Date.now()}`,
        trackId: selectedTrack,
        title: title.trim(),
        category: category.trim() || 'General',
        level,
        summary: summary.trim(),
        overview: overview.trim() || summary.trim(),
        architectureOrMechanism: mechanism.trim(),
        codeSnippets: codeSnippet.trim()
          ? [{ language: codeLang, code: codeSnippet.trim(), caption: `${title.trim()} Implementation` }]
          : [],
        interviewTips: interviewTips.trim(),
        isCustom: true,
      };

      const u = QADatabase.getCurrentUser();
      const isAdmin = QADatabase.isAdmin(u);

      if (!isAdmin) {
        QADatabase.submitContentForReview({
          type: 'guide',
          title: newGuide.title,
          trackOrLanguage: selectedTrack,
          category: newGuide.category,
          summary: newGuide.summary,
          submittedBy: {
            id: u?.id || 'guest',
            name: u?.displayName || 'Community Student',
            email: u?.email || 'student@intelligentqa.io',
          },
          contentPayload: newGuide,
        });
        if (onSuccess) onSuccess(`🎉 Guide "${newGuide.title}" submitted for Admin review!`);
      } else {
        saveStagedGuide(newGuide);
        if (onSuccess) onSuccess(`✔ Guide "${newGuide.title}" added to staging review list.`);
      }

      // Reset and close
      setTitle('');
      setSummary('');
      setOverview('');
      setMechanism('');
      setCodeSnippet('');
      setInterviewTips('');
      onClose();
    } catch (err: any) {
      setErrorBanner(err?.message || 'Failed to save guide.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleParseImport = (text: string) => {
    setIsImporting(true);
    setImportError('');
    setImportSuccessMsg('');

    try {
      const result = parseImportedGuides(text, selectedTrack);
      if (result.error || !result.guides || result.guides.length === 0) {
        setImportError(result.error || 'Could not find valid guides. Please verify your JSON array or CSV headers.');
        setIsImporting(false);
        return;
      }

      result.guides.forEach((g: ConceptGuide) => saveStagedGuide(g));
      setImportSuccessMsg(`Successfully staged ${result.guides.length} guide(s) for ${TRACK_META[selectedTrack]?.name || selectedTrack}!`);
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess(`🎉 Imported and staged ${result.guides.length} guide(s)!`);
      }, 1500);
    } catch (err: any) {
      setImportError(err?.message || 'Failed to parse guide import.');
    } finally {
      setIsImporting(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = evt => {
      const content = evt.target?.result as string;
      if (content) {
        setImportText(content);
        handleParseImport(content);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 pt-14 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#121212] border border-[#262626] w-full max-w-3xl rounded-[28px] shadow-2xl overflow-hidden flex flex-col max-h-[82vh] text-white">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 border-b border-[#222222] bg-[#161616] gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#1F1F1F] border border-[#2B2B2B] text-[#81FF89] flex items-center justify-center shadow-xs shrink-0">
              <BookOpen className="w-5 h-5 text-[#81FF89]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Import Guide &amp; Management
              </h2>
              <p className="text-xs text-zinc-400">
                Author new architecture guides, import JSON/CSV files, or download templates
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Quick action button pills matching 2nd image */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#0F0F0F] border border-[#262626]">
              <button
                type="button"
                onClick={() => setActiveTab('template')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'template'
                    ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-500/50 shadow-sm ring-1 ring-emerald-400/30'
                    : 'text-zinc-300 hover:text-white bg-[#131C2E] hover:bg-[#1C283E] border border-slate-700/60'
                }`}
                title="Download or copy guide import template"
              >
                <Download className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-medium">Import Template</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('import')}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md ${
                  activeTab === 'import'
                    ? 'bg-blue-600 text-white ring-2 ring-blue-400/40 shadow-blue-500/20'
                    : 'bg-blue-600 hover:bg-blue-500 text-white'
                }`}
                title="Upload JSON/CSV guide or paste text"
              >
                <Upload className="w-4 h-4 text-white shrink-0" />
                <span>Import Guide</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('manual')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'manual'
                    ? 'bg-slate-800 text-white border border-slate-600 shadow-sm ring-1 ring-slate-400/30'
                    : 'text-zinc-300 hover:text-white bg-[#131C2E] hover:bg-[#1C283E] border border-slate-700/60'
                }`}
                title="Manually author a new guide"
              >
                <Plus className="w-4 h-4 text-zinc-400 shrink-0" />
                <span>Add Guide</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#1F1F1F] hover:bg-[#282828] text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-1"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 font-sans">
          {errorBanner && (
            <div className="p-3.5 rounded-2xl bg-rose-950/70 border border-rose-500/40 text-xs text-rose-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorBanner}</span>
            </div>
          )}

          {/* Target Track Selector */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#161616] border border-[#262626]">
            <span className="text-xs font-semibold text-zinc-300">Course / Technology Track:</span>
            <select
              value={selectedTrack}
              onChange={e => setSelectedTrack(e.target.value)}
              className="bg-[#0F0F0F] border border-[#2B2B2B] text-xs text-white rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#81FF89] cursor-pointer"
            >
              <option value="selenium">Selenium (Java)</option>
              <option value="playwright">Playwright</option>
              <option value="api-testing">API Testing (REST Assured)</option>
              <option value="ai-qa">AI &amp; LLM in QA</option>
            </select>
          </div>

          {/* TAB 1: ADD GUIDE (Manual) */}
          {activeTab === 'manual' && (
            <form onSubmit={handleManualSubmit} className="space-y-4 text-left">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300 flex items-center justify-between">
                  <span>Concept Title <span className="text-[#81FF89]">*</span></span>
                  <span className="text-[10px] text-zinc-500 font-normal">Mandatory</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Dynamic Locators & Resilience in Single Page Apps"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F0F0F] border border-[#2B2B2B] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#81FF89]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300">
                    Category / Group
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    placeholder="e.g. Synchronization, POM, Network"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F0F0F] border border-[#2B2B2B] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#81FF89]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300">
                    Difficulty Level
                  </label>
                  <select
                    value={level}
                    onChange={e => setLevel(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#0F0F0F] border border-[#2B2B2B] text-xs text-white focus:outline-none focus:border-[#81FF89] cursor-pointer"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300 flex items-center justify-between">
                  <span>Summary (1-2 sentences) <span className="text-[#81FF89]">*</span></span>
                  <span className="text-[10px] text-zinc-500 font-normal">Mandatory</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={summary}
                  onChange={e => setSummary(e.target.value)}
                  placeholder="Concise overview explaining why this concept matters..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F0F0F] border border-[#2B2B2B] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#81FF89] resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300">
                  Full Overview &amp; Explanation
                </label>
                <textarea
                  rows={3}
                  value={overview}
                  onChange={e => setOverview(e.target.value)}
                  placeholder="In-depth explanation, tradeoffs, and architectural concepts..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F0F0F] border border-[#2B2B2B] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#81FF89] resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300">
                  Underlying Mechanism / Architecture
                </label>
                <textarea
                  rows={2}
                  value={mechanism}
                  onChange={e => setMechanism(e.target.value)}
                  placeholder="How it works under the hood (e.g. CDP, protocol, event loop)..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F0F0F] border border-[#2B2B2B] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#81FF89] resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1 space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300">
                    Language
                  </label>
                  <select
                    value={codeLang}
                    onChange={e => setCodeLang(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#0F0F0F] border border-[#2B2B2B] text-xs text-white focus:outline-none focus:border-[#81FF89] cursor-pointer"
                  >
                    <option value="java">Java</option>
                    <option value="typescript">TypeScript</option>
                    <option value="python">Python</option>
                    <option value="csharp">C#</option>
                  </select>
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300">
                    Code Snippet (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={codeSnippet}
                    onChange={e => setCodeSnippet(e.target.value)}
                    placeholder="// Illustrative test snippet or design pattern"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F0F0F] border border-[#2B2B2B] font-mono text-xs text-[#81FF89] placeholder-zinc-600 focus:outline-none focus:border-[#81FF89] resize-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300">
                  SDET Interview Tips &amp; Tradeoffs
                </label>
                <input
                  type="text"
                  value={interviewTips}
                  onChange={e => setInterviewTips(e.target.value)}
                  placeholder="e.g. Always explain synchronization alternatives in Selenium vs Playwright."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F0F0F] border border-[#2B2B2B] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#81FF89]"
                />
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
                  <span>{isSubmitting ? 'Saving...' : 'Add Guide'}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: IMPORT GUIDE */}
          {activeTab === 'import' && (
            <div className="space-y-4 text-left">
              {importSuccessMsg && (
                <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-emerald-200 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#81FF89] shrink-0" />
                  <span>{importSuccessMsg}</span>
                </div>
              )}
              {importError && (
                <div className="p-3 bg-rose-950/40 border border-rose-500/40 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{importError}</span>
                </div>
              )}

              {/* Upload Drag & Drop Area */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#2B2B2B] hover:border-[#81FF89]/60 rounded-2xl p-7 text-center space-y-2.5 bg-[#141414] hover:bg-[#181818] transition-colors cursor-pointer"
              >
                <UploadCloud className="w-10 h-10 text-[#81FF89] mx-auto" />
                <div className="text-sm font-bold text-white">
                  Click to Browse or Drop JSON / CSV File
                </div>
                <p className="text-xs text-zinc-400">
                  Supports JSON array of concept guides or CSV exports
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,.csv,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {/* Or Paste Raw Text */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300 block">
                  Or paste JSON / CSV text directly:
                </label>
                <textarea
                  rows={4}
                  value={importText}
                  onChange={e => setImportText(e.target.value)}
                  placeholder='Paste JSON array [{"title": "...", "category": "...", "summary": "..."}] or CSV content'
                  className="w-full bg-[#0F0F0F] border border-[#2B2B2B] rounded-xl p-3 text-xs text-white font-mono placeholder-zinc-600 focus:outline-none focus:border-[#81FF89]"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('template')}
                  className="text-xs font-bold text-[#81FF89] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Need an Import Template?</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-full bg-[#1E1E1E] hover:bg-[#282828] text-xs font-semibold text-zinc-300 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={!importText.trim() || isImporting}
                    onClick={() => handleParseImport(importText)}
                    className="px-5 py-2.5 rounded-full bg-[#81FF89] hover:bg-[#6ee776] disabled:opacity-50 text-black text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
                  >
                    {isImporting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                    <span>Parse &amp; Import</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: IMPORT GUIDE TEMPLATE */}
          {activeTab === 'template' && (
            <div className="space-y-4 text-left">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="inline-flex rounded-xl p-1 bg-[#0F0F0F] border border-[#2B2B2B] text-xs">
                  <button
                    type="button"
                    onClick={() => setTemplateFormat('json')}
                    className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition cursor-pointer ${
                      templateFormat === 'json'
                        ? 'bg-[#81FF89] text-black shadow-xs'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>JSON Template</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTemplateFormat('csv')}
                    className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition cursor-pointer ${
                      templateFormat === 'csv'
                        ? 'bg-[#81FF89] text-black shadow-xs'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>CSV Template</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyTemplate}
                    className="px-3 py-1.5 rounded-lg bg-[#1E1E1E] hover:bg-[#282828] text-zinc-200 text-xs font-semibold flex items-center gap-1.5 border border-[#2B2B2B] transition cursor-pointer"
                  >
                    {templateCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#81FF89]" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-zinc-300" />
                        <span>Copy Template</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => downloadConceptGuideTemplate(templateFormat, selectedTrack)}
                    className="px-3 py-1.5 rounded-lg bg-[#81FF89] hover:bg-[#6ee776] text-black text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download .{templateFormat.toUpperCase()}</span>
                  </button>
                </div>
              </div>

              {/* Template Preview */}
              <div className="bg-[#0A0A0A] rounded-2xl p-4 border border-[#262626] max-h-60 overflow-y-auto font-mono text-xs text-zinc-300">
                <pre className="whitespace-pre-wrap">
                  {generateConceptGuideTemplate(templateFormat, selectedTrack)}
                </pre>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#161616] border border-[#262626] text-[11px] text-zinc-400 space-y-1">
                <span className="font-bold text-white">Template Mandatory Columns / Properties:</span>
                <p>
                  1. <strong>title</strong>: Concept guide title.<br />
                  2. <strong>summary</strong>: High-level overview and why it matters.<br />
                  3. <strong>category</strong> &amp; <strong>level</strong>: Framework domain and Beginner/Intermediate/Advanced.
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('import')}
                  className="text-xs font-bold text-[#81FF89] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Ready to upload? Go to Import Guide</span>
                </button>

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
