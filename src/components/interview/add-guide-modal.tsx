'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  FileSpreadsheet,
  Download,
  UploadCloud,
  CheckCircle2,
  RefreshCw,
  Send,
  Plus,
  AlertCircle,
  FileText,
  Upload,
  Copy,
  Check,
  CheckCheck,
  BookOpen,
  Layers,
  Edit3,
  Trash2,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Lightbulb,
  FileCheck2,
  Sparkles,
  Merge,
} from 'lucide-react';
import FormattedOverviewEditor from '@/components/ui/formatted-overview-editor';
import FormattedInterviewAnswer from '@/components/ui/formatted-interview-answer';
import { QADatabase } from '@/lib/qa-db';
import {
  ConceptGuide,
  TRACK_META,
  getStagedGuides,
  saveStagedGuide,
  updateStagedGuide,
  deleteStagedGuide,
  clearStagedGuides,
  confirmAndSubmitStagedGuides,
  submitStagedGuidesForApproval,
  generateConceptGuideTemplate,
  downloadConceptGuideTemplate,
  parseImportedGuides,
  consolidateGuidesIntoSingle,
  checkGuideDuplicate,
  extractTextFromOfficeZip,
} from '@/lib/concept-guides';

interface AddGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTrack?: string;
  onSuccess?: (msg: string) => void;
}

const COURSE_TRACK_OPTIONS = [
  { id: 'selenium', name: 'Selenium WebDriver + Java', stage: 'Stage 1' },
  { id: 'playwright', name: 'Playwright + TypeScript', stage: 'Stage 2' },
  { id: 'api-testing', name: 'Rest Assured (API) & Automation', stage: 'Stage 3' },
  { id: 'ai-qa', name: 'AI Academy', stage: 'Stage 4' },
  { id: 'articles', name: 'Tutorials & Articles', stage: 'Knowledge Hub' },
];

export default function AddGuideModal({
  isOpen,
  onClose,
  defaultTrack = 'selenium',
  onSuccess,
}: AddGuideModalProps) {
  // Normalize initial track
  const normalizedInitialTrack =
    defaultTrack === 'selenium-java'
      ? 'selenium'
      : defaultTrack === 'playwright-ts'
        ? 'playwright'
        : defaultTrack || 'selenium';

  const [selectedTrack, setSelectedTrack] = useState<string>(normalizedInitialTrack);
  const [activeTab, setActiveTab] = useState<'staging' | 'import' | 'template' | 'manual'>(
    'staging'
  );
  const [stagedGuides, setStagedGuides] = useState<ConceptGuide[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [statusBanner, setStatusBanner] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Import state
  const [importText, setImportText] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Template state
  const [templateFormat, setTemplateFormat] = useState<'xlsx' | 'docx' | 'json' | 'csv'>('xlsx');
  const [templateCopied, setTemplateCopied] = useState(false);

  // Edit in Staging state
  const [editingGuide, setEditingGuide] = useState<ConceptGuide | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editLevel, setEditLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>(
    'Intermediate'
  );
  const [editTrack, setEditTrack] = useState<string>('selenium');
  const [editSummary, setEditSummary] = useState('');
  const [editOverview, setEditOverview] = useState('');
  const [editMechanism, setEditMechanism] = useState('');
  const [editCodeLang, setEditCodeLang] = useState('java');
  const [editCode, setEditCode] = useState('');
  const [editInterviewTips, setEditInterviewTips] = useState('');

  // Sync track and staged items when modal opens or track changes
  useEffect(() => {
    if (isOpen) {
      const u = QADatabase.getCurrentUser();
      setIsAdmin(QADatabase.isAdmin(u));
      const loaded = getStagedGuides(selectedTrack);
      setStagedGuides(loaded);
      // Set default language based on track
      if (selectedTrack === 'playwright') {
        setCodeLang('typescript');
      } else if (selectedTrack === 'ai-qa') {
        setCodeLang('python');
      } else {
        setCodeLang('java');
      }
    }
  }, [isOpen, selectedTrack]);

  // Handle track selector change
  const handleTrackChange = (newTrack: string) => {
    setSelectedTrack(newTrack);
    const loaded = getStagedGuides(newTrack);
    setStagedGuides(loaded);
    if (newTrack === 'playwright') {
      setCodeLang('typescript');
    } else if (newTrack === 'ai-qa') {
      setCodeLang('python');
    } else {
      setCodeLang('java');
    }
  };

  const showBanner = (type: 'success' | 'error' | 'info', message: string) => {
    setStatusBanner({ type, message });
    setTimeout(() => {
      setStatusBanner(null);
    }, 4500);
  };

  if (!isOpen) return null;

  const currentTrackMeta =
    COURSE_TRACK_OPTIONS.find((t) => t.id === selectedTrack) || COURSE_TRACK_OPTIONS[0];

  // ==========================================
  // STAGED GUIDES ACTIONS (Review, Edit, Delete, Submit)
  // ==========================================
  const handleOpenEdit = (guide: ConceptGuide) => {
    setEditingGuide(guide);
    setEditTrack(guide.trackId || selectedTrack);
    setEditTitle(guide.title);
    setEditCategory(guide.category);
    setEditLevel(guide.level);
    setEditSummary(guide.summary);
    setEditOverview(guide.overview || guide.summary);
    setEditMechanism(guide.architectureOrMechanism || '');
    setEditCode(guide.codeSnippets?.[0]?.code || '');
    setEditCodeLang(
      guide.codeSnippets?.[0]?.language ||
        (selectedTrack === 'playwright'
          ? 'typescript'
          : selectedTrack === 'ai-qa'
            ? 'python'
            : 'java')
    );
    setEditInterviewTips(guide.interviewTips || '');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGuide) return;

    const updated: ConceptGuide = {
      ...editingGuide,
      trackId: editTrack,
      title: editTitle.trim() || editingGuide.title,
      category: editCategory.trim() || editingGuide.category,
      level: editLevel,
      summary: editSummary.trim() || editingGuide.summary,
      overview: editOverview.trim() || editingGuide.overview,
      architectureOrMechanism: editMechanism.trim(),
      codeSnippets: editCode.trim()
        ? [
            {
              language: editCodeLang,
              code: editCode.trim(),
              caption: `${editTitle.trim() || editingGuide.title} Code Implementation`,
            },
          ]
        : [],
      interviewTips: editInterviewTips.trim(),
      isCustom: true,
    };

    if (editingGuide.trackId && editingGuide.trackId !== editTrack) {
      deleteStagedGuide(editingGuide.id, editingGuide.trackId);
    }
    updateStagedGuide(updated);
    setStagedGuides(getStagedGuides(selectedTrack));
    setEditingGuide(null);
    showBanner('success', `✔ Staged guide "${updated.title}" updated successfully.`);
  };

  const handleDeleteStaged = (id: string) => {
    deleteStagedGuide(id, selectedTrack);
    const updated = getStagedGuides(selectedTrack);
    setStagedGuides(updated);
    showBanner('info', '🗑 Removed guide from staging review.');
  };

  const handleClearStaging = () => {
    clearStagedGuides(selectedTrack);
    setStagedGuides([]);
    showBanner('info', `Staging cleared for ${currentTrackMeta.name}.`);
  };

  const handleConfirmSingle = (guideId: string) => {
    // Submit to Admin Moderation queue so it shows up in Admin Approval section
    const res = submitStagedGuidesForApproval(selectedTrack, [guideId]);
    setStagedGuides(getStagedGuides(selectedTrack));
    const submittedTitle = res.submitted[0]?.title || 'Guide';
    showBanner(
      'success',
      `📬 Guide "${submittedTitle}" submitted for Admin approval! It is now listed under Admin -> Guide Approvals.`
    );
    if (onSuccess) onSuccess(`Guide "${submittedTitle}" submitted for Admin approval!`);
  };

  const handleConfirmAndSubmitAll = () => {
    if (stagedGuides.length === 0) return;
    const res = submitStagedGuidesForApproval(selectedTrack);
    setStagedGuides([]);
    showBanner(
      'success',
      `📬 Submitted ${res.count} guide(s) for Admin approval into ${currentTrackMeta.name}! Review and approve them in Admin -> Guide Approvals.`
    );
    if (onSuccess) onSuccess(`Submitted ${res.count} guide(s) for Admin approval!`);
  };

  const handleDirectPublish = (guideId?: string) => {
    // When Admin explicitly wants 1-click publishing: also log to moderation queue as approved
    const toPublish = guideId ? stagedGuides.filter((g) => g.id === guideId) : stagedGuides;
    const u = QADatabase.getCurrentUser();
    for (const g of toPublish) {
      const mod = QADatabase.submitContentForReview({
        type: 'guide',
        title: g.title,
        trackOrLanguage: selectedTrack,
        category: g.category,
        summary: g.summary,
        submittedBy: {
          id: u?.id || 'admin',
          name: u?.displayName || 'Admin',
          email: u?.email || 'admin@intelligentqa.io',
        },
        contentPayload: g,
      });
      QADatabase.approveSubmission(mod.id, u?.email);
    }
    const res = confirmAndSubmitStagedGuides(selectedTrack, guideId ? [guideId] : undefined);
    setStagedGuides(getStagedGuides(selectedTrack));
    showBanner(
      'success',
      `🎉 Published ${res.count} guide(s) directly to ${currentTrackMeta.name}!`
    );
    if (onSuccess) onSuccess(`Published ${res.count} guide(s) to ${currentTrackMeta.name}!`);
  };

  // ==========================================
  // IMPORT ACTIONS (Dropzone, Parse, Staging)
  // ==========================================
  const handleConsolidateStaging = () => {
    if (stagedGuides.length <= 1) return;
    const consolidated = consolidateGuidesIntoSingle(stagedGuides, selectedTrack);
    clearStagedGuides(selectedTrack);
    saveStagedGuide(consolidated);
    const reloaded = getStagedGuides(selectedTrack);
    setStagedGuides(reloaded);
    showBanner(
      'success',
      `✔ Consolidated ${stagedGuides.length} sections into 1 single comprehensive guide ready for Admin approval!`
    );
  };

  const handleParseImport = (text: string, forceSingleGuide: boolean = true) => {
    setIsImporting(true);
    try {
      const result = parseImportedGuides(text, selectedTrack, true, forceSingleGuide);
      if (result.error || !result.guides || result.guides.length === 0) {
        showBanner(
          'error',
          result.error || 'Could not find valid guides. Please verify your format.'
        );
        setIsImporting(false);
        return;
      }

      // Enforce single comprehensive guide for single file/article imports
      let guidesToStage = result.guides;
      if (forceSingleGuide && guidesToStage.length > 1) {
        guidesToStage = [consolidateGuidesIntoSingle(guidesToStage, selectedTrack)];
      }

      // Clear any prior staging of this track so the user gets 1 clean guide to publish
      clearStagedGuides(selectedTrack);
      guidesToStage.forEach((g: ConceptGuide) => saveStagedGuide(g));
      const reloaded = getStagedGuides(selectedTrack);
      setStagedGuides(reloaded);
      setImportText('');
      showBanner(
        'success',
        `🎉 Successfully imported 1 comprehensive guide for ${currentTrackMeta.name}! (1 Pending for Admin approval)`
      );
      setActiveTab('staging');
    } catch (err: any) {
      showBanner('error', err?.message || 'Failed to parse guide import.');
    } finally {
      setIsImporting(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const lowerName = file.name.toLowerCase();
    if (lowerName.endsWith('.docx') || lowerName.endsWith('.xlsx')) {
      try {
        const buffer = await file.arrayBuffer();
        const extracted = await extractTextFromOfficeZip(
          buffer,
          lowerName.endsWith('.docx') ? 'docx' : 'xlsx'
        );
        if (extracted && extracted.trim()) {
          setImportText(extracted);
          handleParseImport(extracted, true);
          e.target.value = '';
          return;
        } else {
          showBanner(
            'error',
            `Could not extract guide data from "${file.name}". Please ensure the Word/Excel document contains tables or text.`
          );
          e.target.value = '';
          return;
        }
      } catch (err: any) {
        console.warn('Office ZIP extraction error:', err);
        showBanner(
          'error',
          `Failed to read "${file.name}": ${err?.message || 'Unsupported or corrupted format'}`
        );
        e.target.value = '';
        return;
      }
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      if (content) {
        setImportText(content);
        handleParseImport(content, true);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // ==========================================
  // TEMPLATE ACTIONS
  // ==========================================
  const handleCopyTemplate = async () => {
    try {
      const templateStr = generateConceptGuideTemplate(templateFormat as any, selectedTrack);
      await navigator.clipboard.writeText(templateStr);
      setTemplateCopied(true);
      setTimeout(() => setTemplateCopied(false), 2000);
      showBanner('info', 'Template copied to clipboard.');
    } catch (e) {
      console.error(e);
    }
  };

  // ==========================================
  // MANUAL GUIDE SUBMISSION
  // ==========================================
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !summary.trim()) {
      showBanner('error', 'Title and Summary are mandatory.');
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
          ? [
              {
                language: codeLang,
                code: codeSnippet.trim(),
                caption: `${title.trim()} Implementation`,
              },
            ]
          : [],
        interviewTips: interviewTips.trim(),
        isCustom: true,
      };

      const u = QADatabase.getCurrentUser();
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
        showBanner(
          'success',
          `🎉 Guide "${newGuide.title}" submitted for Admin review under ${currentTrackMeta.name}!`
        );
        if (onSuccess) onSuccess(`Guide "${newGuide.title}" submitted for Admin review!`);
      } else {
        saveStagedGuide(newGuide);
        setStagedGuides(getStagedGuides(selectedTrack));
        showBanner(
          'success',
          `✔ Guide "${newGuide.title}" added to staging for ${currentTrackMeta.name}.`
        );
        setActiveTab('staging');
      }

      // Reset fields
      setTitle('');
      setSummary('');
      setOverview('');
      setMechanism('');
      setCodeSnippet('');
      setInterviewTips('');
    } catch (err: any) {
      showBanner('error', err?.message || 'Failed to submit guide.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting && !isImporting) onClose();
      }}
      className="fixed inset-0 z-[100] overflow-y-auto bg-black/80 backdrop-blur-md p-4 sm:p-6 flex items-center justify-center min-h-screen animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative my-auto w-full max-w-4xl bg-[#141414] border border-[#262626] rounded-3xl shadow-2xl p-5 sm:p-7 space-y-5 max-h-[88vh] overflow-y-auto font-sans text-white">
        {/* ======================================================== */}
        {/* MODAL HEADER                                             */}
        {/* ======================================================== */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#262626]">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-400">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                <span>Add &amp; Import Guide Management</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Review staged guides, import JSON/CSV/Excel/Word files, or author new technical
                architecture guides
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-[#262626] transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Notification Banner */}
        {statusBanner && (
          <div
            className={`p-3.5 rounded-2xl text-xs flex items-center gap-2.5 transition-all ${
              statusBanner.type === 'success'
                ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-200'
                : statusBanner.type === 'error'
                  ? 'bg-rose-950/60 border border-rose-500/40 text-rose-200'
                  : 'bg-blue-950/60 border border-blue-500/40 text-blue-200'
            }`}
          >
            {statusBanner.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : statusBanner.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            ) : (
              <FileCheck2 className="w-4 h-4 text-blue-400 shrink-0" />
            )}
            <span className="flex-1">{statusBanner.message}</span>
          </div>
        )}

        {/* ======================================================== */}
        {/* MANDATORY FIELD: COURSE CATEGORY SELECTOR                */}
        {/* ======================================================== */}
        <div className="p-4 rounded-2xl bg-[#1A1A1A] border border-[#2E2E2E] space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <label
                htmlFor="course-category-select"
                className="text-xs font-bold text-white flex items-center gap-1.5"
              >
                <Layers className="w-4 h-4 text-purple-400" />
                <span>Course Category (Where this guide will be listed after Admin approval):</span>
              </label>
              <p className="text-[11px] text-zinc-400">
                Choose the target curriculum track where this guide belongs.
              </p>
            </div>

            <select
              id="course-category-select"
              value={selectedTrack}
              onChange={(e) => handleTrackChange(e.target.value)}
              className="bg-[#0F0F0F] border border-[#3A3A3A] text-xs font-semibold text-white rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-purple-500 cursor-pointer shadow-xs min-w-[260px]"
            >
              {COURSE_TRACK_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.name} ({opt.stage})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 pt-1 border-t border-[#262626] text-[11px] text-zinc-400 flex-wrap">
            <span className="font-semibold text-zinc-300">Target Track:</span>
            <span className="px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30 font-bold">
              {currentTrackMeta.name}
            </span>
            <span>•</span>
            <span>
              Guides approved by Admin will automatically be listed under this course track.
            </span>
          </div>
        </div>

        {/* ======================================================== */}
        {/* TABS NAVIGATION                                          */}
        {/* ======================================================== */}
        <div className="flex items-center gap-2 border-b border-[#262626] pb-1 overflow-x-auto">
          <button
            type="button"
            onClick={() => {
              setActiveTab('staging');
              setEditingGuide(null);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === 'staging'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-[#1F1F1F]'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>Review Staging</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                activeTab === 'staging'
                  ? 'bg-purple-800 text-white'
                  : 'bg-zinc-800 text-purple-400 border border-purple-500/30'
              }`}
            >
              {stagedGuides.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('import');
              setEditingGuide(null);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === 'import'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-[#1F1F1F]'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Import Guides</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('template');
              setEditingGuide(null);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === 'template'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-[#1F1F1F]'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Download Templates</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('manual');
              setEditingGuide(null);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === 'manual'
                ? 'bg-zinc-200 text-black shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-[#1F1F1F]'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Create Guide (Manual)</span>
          </button>
        </div>

        {/* ======================================================== */}
        {/* TAB 1: REVIEW STAGING (Imported Guides Pending Review)   */}
        {/* ======================================================== */}
        {activeTab === 'staging' && !editingGuide && (
          <div className="space-y-4">
            {/* Header Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#262626]">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-white">Imported Guides Pending Review</h4>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-bold border border-blue-500/30 font-mono">
                  {stagedGuides.length} Pending
                </span>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setActiveTab('template')}
                  className="px-3 py-1.5 rounded-lg bg-[#1F1F1F] hover:bg-[#2A2A2A] text-zinc-300 text-xs font-semibold flex items-center gap-1.5 border border-[#333] transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Download Excel / Word Template</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('import')}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Import Excel / Word Guides</span>
                </button>

                {stagedGuides.length > 0 && (
                  <>
                    {stagedGuides.length > 1 && (
                      <button
                        type="button"
                        onClick={handleConsolidateStaging}
                        className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold border border-amber-500/40 flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                        title="Consolidate all sections into 1 single comprehensive guide for Admin approval"
                      >
                        <Merge className="w-3.5 h-3.5" />
                        <span>Consolidate into 1 Guide</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleClearStaging}
                      className="px-3 py-1.5 rounded-lg bg-[#1F1F1F] hover:bg-rose-950/60 text-zinc-400 hover:text-rose-300 text-xs font-semibold border border-[#333] transition cursor-pointer"
                    >
                      Clear Staging
                    </button>

                    <button
                      type="button"
                      onClick={handleConfirmAndSubmitAll}
                      className="px-3.5 py-1.5 rounded-lg text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition cursor-pointer bg-purple-600 hover:bg-purple-500"
                      title="Submit all staged guides to the Admin Approval queue in Admin Dashboard"
                    >
                      <Send className="w-4 h-4" />
                      <span>
                        {isAdmin
                          ? `Submit for Admin Approval (${stagedGuides.length})`
                          : `Submit for Approval (${stagedGuides.length})`}
                      </span>
                    </button>

                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => handleDirectPublish()}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 text-xs font-semibold flex items-center gap-1 border border-emerald-500/40 transition cursor-pointer"
                        title="Publish directly to course without going through Admin review"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        <span>Direct Publish All</span>
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* EMPTY STATE */}
            {stagedGuides.length === 0 ? (
              <div className="bg-[#181818] border border-[#262626] rounded-2xl p-8 text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#222222] text-purple-400 flex items-center justify-center mx-auto border border-[#333]">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">
                    No Imported Guides Pending Review for {currentTrackMeta.name}
                  </h4>
                  <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
                    Your staging area is empty. Download the Excel (.XLSX) or Word (.DOCX) template
                    below to prepare your concepts, or click <strong>Import Guides</strong> to
                    upload and review.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('template')}
                    className="px-4 py-2 rounded-xl bg-[#222] hover:bg-[#2A2A2A] text-zinc-200 text-xs font-semibold border border-[#333] transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Download className="w-4 h-4 text-emerald-400" />
                    <span>Download Template (.XLSX / .DOCX)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('import')}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Import Excel / Word Guides</span>
                  </button>
                </div>
              </div>
            ) : (
              /* LIST OF STAGED GUIDES */
              <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                {stagedGuides.map((guide) => {
                  const dupCheck = checkGuideDuplicate({
                    title: guide.title,
                    summary: guide.summary,
                    overview: guide.overview,
                    code: guide.codeSnippets?.[0]?.code,
                    category: guide.category,
                    trackId: selectedTrack,
                  });

                  return (
                    <div
                      key={guide.id}
                      className="bg-[#181818] border border-[#282828] rounded-2xl p-4 sm:p-5 hover:border-[#383838] transition space-y-3 shadow-xs"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                              {guide.category}
                            </span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
                              {guide.level}
                            </span>

                            {/* Automated Duplicate Check Badge */}
                            {dupCheck.status === 'unique' ? (
                              <span
                                className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1"
                                title={dupCheck.recommendation}
                              >
                                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                                <span>Duplicate Check: Clean (0% duplicate)</span>
                              </span>
                            ) : dupCheck.status === 'potential_duplicate' ? (
                              <span
                                className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1"
                                title={dupCheck.recommendation}
                              >
                                <AlertTriangle className="w-3 h-3 text-amber-400" />
                                <span>
                                  Duplicate Warning: {dupCheck.similarityScore}% match with &quot;
                                  {dupCheck.highestMatch?.title}&quot;
                                </span>
                              </span>
                            ) : (
                              <span
                                className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center gap-1"
                                title={dupCheck.recommendation}
                              >
                                <AlertCircle className="w-3 h-3 text-rose-400" />
                                <span>
                                  High Duplicate Risk: {dupCheck.similarityScore}% match with &quot;
                                  {dupCheck.highestMatch?.title}&quot;
                                </span>
                              </span>
                            )}

                            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>
                                {isAdmin ? 'Admin Review Required' : 'Awaiting Admin Approval'}
                              </span>
                            </span>
                          </div>

                          <h4 className="text-base font-bold text-white">{guide.title}</h4>
                        </div>

                        {/* Card Action Buttons */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(guide)}
                            className="p-1.5 rounded-lg bg-[#222] hover:bg-[#2A2A2A] text-zinc-300 hover:text-white border border-[#333] transition cursor-pointer"
                            title="Edit this imported guide"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteStaged(guide.id)}
                            className="p-1.5 rounded-lg bg-[#222] hover:bg-rose-950/60 text-zinc-400 hover:text-rose-300 border border-[#333] transition cursor-pointer"
                            title="Delete this imported guide from staging"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleConfirmSingle(guide.id)}
                            className="px-3 py-1.5 rounded-lg text-white text-xs font-semibold flex items-center gap-1 transition cursor-pointer shadow-xs bg-purple-600 hover:bg-purple-500"
                            title="Submit this guide for Admin approval (will appear under Admin -> Guide Approvals)"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>
                              {isAdmin ? 'Submit for Admin Approval' : 'Submit for Approval'}
                            </span>
                          </button>

                          {isAdmin && (
                            <button
                              type="button"
                              onClick={() => handleDirectPublish(guide.id)}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 text-xs font-semibold flex items-center gap-1 border border-emerald-500/40 transition cursor-pointer"
                              title="Publish directly to curriculum"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Direct Publish</span>
                            </button>
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-zinc-300 leading-relaxed">{guide.summary}</p>

                      {/* Formatted Overview Preview if present */}
                      {guide.overview && guide.overview !== guide.summary && (
                        <div className="bg-[#111] p-3 rounded-xl border border-[#222] text-xs text-zinc-300">
                          <div className="text-[10px] uppercase font-bold text-zinc-500 mb-1">
                            Overview &amp; Explanation (Formatted):
                          </div>
                          <FormattedInterviewAnswer text={guide.overview} isDark />
                        </div>
                      )}

                      {/* Code preview if present */}
                      {guide.codeSnippets?.[0] && (
                        <div className="bg-[#0D0D0D] rounded-xl p-3 border border-[#262626] font-mono text-[11px] text-zinc-300 overflow-x-auto max-h-28">
                          <div className="text-[10px] text-zinc-500 font-sans mb-1 uppercase font-bold">
                            {guide.codeSnippets[0].language}:{' '}
                            {guide.codeSnippets[0].caption || 'Code Preview'}
                          </div>
                          <pre>
                            {guide.codeSnippets[0].code.slice(0, 260)}
                            {guide.codeSnippets[0].code.length > 260 ? '...' : ''}
                          </pre>
                        </div>
                      )}

                      {guide.interviewTips && (
                        <div className="text-[11px] text-amber-300/90 flex items-start gap-1.5 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
                          <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <span>
                            <strong>Interview Tip:</strong> {guide.interviewTips}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Template Field Specification Reference */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div className="bg-[#181818] border border-[#282828] rounded-2xl p-4 space-y-2 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-white">
                  <FileSpreadsheet className="w-4 h-4 text-purple-400" />
                  <span>Mandatory Fields (Required for Submission):</span>
                </div>
                <ul className="list-disc list-inside text-zinc-400 space-y-1 text-[11px]">
                  <li>
                    <strong className="text-zinc-200">title</strong>: Name of the architecture
                    concept
                  </li>
                  <li>
                    <strong className="text-zinc-200">category</strong>: Domain or module group
                  </li>
                  <li>
                    <strong className="text-zinc-200">level</strong>: Beginner | Intermediate |
                    Advanced
                  </li>
                  <li>
                    <strong className="text-zinc-200">summary</strong>: Concise 1-2 sentence
                    definition
                  </li>
                  <li>
                    <strong className="text-zinc-200">overview</strong>: In-depth technical
                    explanation
                  </li>
                  <li>
                    <strong className="text-zinc-200">codeSnippet &amp; codeLanguage</strong>:
                    Complete code implementation
                  </li>
                </ul>
              </div>

              <div className="bg-[#181818] border border-[#282828] rounded-2xl p-4 space-y-2 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-white">
                  <FileCheck2 className="w-4 h-4 text-emerald-400" />
                  <span>Optional Fields (For 1-Click Admin Approval):</span>
                </div>
                <ul className="list-disc list-inside text-zinc-400 space-y-1 text-[11px]">
                  <li>
                    <strong className="text-zinc-200">architectureOrMechanism</strong>: Deep-dive
                    into internal mechanics
                  </li>
                  <li>
                    <strong className="text-zinc-200">codeCaption</strong>: Descriptive label for
                    code snippet
                  </li>
                  <li>
                    <strong className="text-zinc-200">bestPractices</strong>: Semicolon-separated
                    recommendations
                  </li>
                  <li>
                    <strong className="text-zinc-200">interviewTips</strong>: SDET interview talking
                    points
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* INLINE EDIT FORM FOR STAGED GUIDE                         */}
        {/* ======================================================== */}
        {editingGuide && (
          <form
            onSubmit={handleSaveEdit}
            className="space-y-4 bg-[#181818] border border-blue-500/40 rounded-2xl p-5"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#2A2A2A]">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-blue-400" />
                <h4 className="text-sm font-bold text-white">
                  Edit Staged Guide: {editingGuide.title}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setEditingGuide(null)}
                className="text-xs text-zinc-400 hover:text-white"
              >
                Cancel Edit
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1 sm:col-span-1">
                <label className="text-xs font-bold text-zinc-300">Target Track / Category</label>
                <select
                  value={editTrack}
                  onChange={(e) => setEditTrack(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0F0F0F] border border-[#333] text-xs text-white"
                >
                  {COURSE_TRACK_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.name} ({opt.stage})
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-bold text-zinc-300">Title</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0F0F0F] border border-[#333] text-xs text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300">Category Tag</label>
                <input
                  type="text"
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0F0F0F] border border-[#333] text-xs text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300">Level</label>
                <select
                  value={editLevel}
                  onChange={(e) => setEditLevel(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0F0F0F] border border-[#333] text-xs text-white"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-300">Summary (Mandatory)</label>
              <textarea
                rows={2}
                required
                value={editSummary}
                onChange={(e) => setEditSummary(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#0F0F0F] border border-[#333] text-xs text-white resize-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-300">
                Full Overview &amp; Explanation
              </label>
              <FormattedOverviewEditor
                value={editOverview}
                onChange={setEditOverview}
                placeholder="In-depth explanation, tradeoffs, and architectural concepts..."
                minRows={4}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-300">Code Snippet</label>
              <textarea
                rows={3}
                value={editCode}
                onChange={(e) => setEditCode(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#0F0F0F] border border-[#333] font-mono text-xs text-emerald-400 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingGuide(null)}
                className="px-4 py-2 rounded-xl bg-[#222] hover:bg-[#2C2C2C] text-xs font-semibold text-zinc-300 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white transition cursor-pointer shadow-md"
              >
                Save Changes to Staging
              </button>
            </div>
          </form>
        )}

        {/* ======================================================== */}
        {/* TAB 2: IMPORT GUIDES (Upload & Raw Text Paste)            */}
        {/* ======================================================== */}
        {activeTab === 'import' && (
          <div className="space-y-4">
            {/* Upload Drag & Drop Area */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#333] hover:border-purple-400 rounded-2xl p-7 text-center space-y-2.5 bg-[#161616] hover:bg-[#1A1A1A] transition-colors cursor-pointer"
            >
              <UploadCloud className="w-10 h-10 text-purple-400 mx-auto" />
              <div className="text-sm font-bold text-white">
                Click to Browse or Drop Excel / Word / JSON / CSV File
              </div>
              <p className="text-xs text-zinc-400">
                Supports .xlsx, .docx, .json, .csv, and tab-separated (.tsv) files for{' '}
                <span className="font-semibold text-purple-300">{currentTrackMeta.name}</span>
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.docx,.json,.csv,.tsv,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {/* Paste Raw Text Area */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300 block">
                Or paste text directly (Excel TSV rows, JSON array, or Word format):
              </label>
              <textarea
                rows={5}
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder='Paste JSON array [{"title": "...", "category": "...", "summary": "..."}] or copy/pasted rows from Excel/Word'
                className="w-full bg-[#0F0F0F] border border-[#2B2B2B] rounded-xl p-3 text-xs text-white font-mono placeholder-zinc-600 focus:outline-none focus:border-purple-400 resize-none"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('template')}
                className="text-xs font-bold text-purple-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Need a template? Download Excel / Word Templates</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-full bg-[#1F1F1F] hover:bg-[#282828] text-xs font-semibold text-zinc-300 transition cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  disabled={!importText.trim() || isImporting}
                  onClick={() => handleParseImport(importText)}
                  className="px-5 py-2 rounded-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  {isImporting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Parse &amp; Import into Staging</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: DOWNLOAD TEMPLATES                                 */}
        {/* ======================================================== */}
        {activeTab === 'template' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#181818] border border-[#282828] space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-white">
                    Download Pre-Formatted Concept Guide Templates
                  </h4>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Pre-filled with authentic samples for {currentTrackMeta.name} and clear
                    mandatory &amp; optional field markers.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => downloadConceptGuideTemplate('xlsx', selectedTrack)}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Download Excel (.XLSX)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => downloadConceptGuideTemplate('docx', selectedTrack)}
                    className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Download Word (.DOCX)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => downloadConceptGuideTemplate('json', selectedTrack)}
                    className="px-3 py-2 rounded-xl bg-[#242424] hover:bg-[#2C2C2C] text-zinc-200 text-xs font-semibold flex items-center gap-1.5 border border-[#333] transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>JSON</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => downloadConceptGuideTemplate('csv', selectedTrack)}
                    className="px-3 py-2 rounded-xl bg-[#242424] hover:bg-[#2C2C2C] text-zinc-200 text-xs font-semibold flex items-center gap-1.5 border border-[#333] transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>CSV</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Template Preview with Copy */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-300">
                  JSON / Text Template Preview ({currentTrackMeta.name}):
                </span>
                <button
                  type="button"
                  onClick={handleCopyTemplate}
                  className="px-3 py-1.5 rounded-lg bg-[#202020] hover:bg-[#2A2A2A] text-zinc-200 text-xs font-semibold flex items-center gap-1.5 border border-[#333] transition cursor-pointer"
                >
                  {templateCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-zinc-300" />
                      <span>Copy JSON Template</span>
                    </>
                  )}
                </button>
              </div>

              <div className="bg-[#0A0A0A] rounded-2xl p-4 border border-[#262626] max-h-56 overflow-y-auto font-mono text-xs text-zinc-300">
                <pre className="whitespace-pre-wrap">
                  {generateConceptGuideTemplate('json', selectedTrack)}
                </pre>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('import')}
                className="text-xs font-bold text-purple-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Ready to upload? Go to Import Guides</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-full bg-[#1F1F1F] hover:bg-[#282828] text-xs font-semibold text-zinc-300 transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: MANUAL GUIDE SUBMISSION                            */}
        {/* ======================================================== */}
        {activeTab === 'manual' && (
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300 flex items-center justify-between">
                <span>
                  Concept Title <span className="text-purple-400">*</span>
                </span>
                <span className="text-[10px] text-zinc-500 font-normal">Mandatory</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Dynamic Locators &amp; Resilience in Single Page Apps"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F0F0F] border border-[#2B2B2B] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300">Category / Group</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. Synchronization, POM, Network"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F0F0F] border border-[#2B2B2B] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300">Difficulty Level</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#0F0F0F] border border-[#2B2B2B] text-xs text-white focus:outline-none focus:border-purple-400 cursor-pointer"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300 flex items-center justify-between">
                <span>
                  Summary (1-2 sentences) <span className="text-purple-400">*</span>
                </span>
                <span className="text-[10px] text-zinc-500 font-normal">Mandatory</span>
              </label>
              <textarea
                required
                rows={2}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Concise overview explaining why this concept matters..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F0F0F] border border-[#2B2B2B] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-400 resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300">
                Full Overview &amp; Explanation
              </label>
              <FormattedOverviewEditor
                value={overview}
                onChange={setOverview}
                placeholder="In-depth explanation, tradeoffs, and architectural concepts. Paste retains bullet points, bold lines, and code..."
                minRows={5}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300">
                Underlying Mechanism / Architecture
              </label>
              <textarea
                rows={2}
                value={mechanism}
                onChange={(e) => setMechanism(e.target.value)}
                placeholder="How it works under the hood (e.g. CDP, protocol, event loop)..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F0F0F] border border-[#2B2B2B] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-400 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-1 space-y-1.5">
                <label className="text-xs font-bold text-zinc-300">Language</label>
                <select
                  value={codeLang}
                  onChange={(e) => setCodeLang(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#0F0F0F] border border-[#2B2B2B] text-xs text-white focus:outline-none focus:border-purple-400 cursor-pointer"
                >
                  <option value="java">Java</option>
                  <option value="typescript">TypeScript</option>
                  <option value="python">Python</option>
                  <option value="csharp">C#</option>
                </select>
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-zinc-300">Code Snippet (Optional)</label>
                <textarea
                  rows={3}
                  value={codeSnippet}
                  onChange={(e) => setCodeSnippet(e.target.value)}
                  placeholder="// Illustrative test snippet or design pattern"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F0F0F] border border-[#2B2B2B] font-mono text-xs text-emerald-400 placeholder-zinc-600 focus:outline-none focus:border-purple-400 resize-none"
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
                onChange={(e) => setInterviewTips(e.target.value)}
                placeholder="e.g. Always explain synchronization alternatives in Selenium vs Playwright."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F0F0F] border border-[#2B2B2B] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-400"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-full bg-[#1F1F1F] hover:bg-[#282828] text-xs font-semibold text-zinc-300 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-full bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-md cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>
                  {isSubmitting
                    ? 'Submitting...'
                    : isAdmin
                      ? 'Add to Staging'
                      : 'Submit for Admin Approval'}
                </span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
