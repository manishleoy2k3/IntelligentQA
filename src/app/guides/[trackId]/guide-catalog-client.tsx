'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  BookOpen,
  Search,
  Plus,
  Upload,
  Download,
  Code2,
  CheckCircle2,
  AlertCircle,
  X,
  Trash2,
  Edit3,
  Copy,
  Check,
  Sparkles,
  Lightbulb,
  ArrowRight,
  UploadCloud,
  FileText,
  FileSpreadsheet,
  CheckCheck,
  Layers,
} from 'lucide-react';
import {
  ConceptGuide,
  TRACK_META,
  getAllGuides,
  getStagedGuides,
  saveStagedGuide,
  updateStagedGuide,
  deleteStagedGuide,
  clearStagedGuides,
  confirmAndSubmitStagedGuides,
  deleteCustomGuide,
  parseImportedGuides,
  generateConceptGuideTemplate,
  downloadConceptGuideTemplate,
} from '@/lib/concept-guides';
import { QADatabase } from '@/lib/qa-db';

export default function GuideCatalogClient({ initialTrackId = 'selenium' }: { initialTrackId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Normalize trackId strictly to the current course
  const normalizedTrack =
    initialTrackId === 'selenium-java' ? 'selenium' : initialTrackId === 'playwright-ts' ? 'playwright' : initialTrackId;

  const [activeTrack] = useState<string>(normalizedTrack);
  const trackInfo = TRACK_META[activeTrack] || {
    id: activeTrack,
    name: 'Automation',
    tag: 'Core',
    color: 'emerald',
    badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  };

  const [isAdmin, setIsAdmin] = useState<boolean>(true);

  // Tabs: 'import-staging' (Import & Staged Review) vs 'confirmed-guides' (Guide List like Selenium / Playwright)
  const [activeTab, setActiveTab] = useState<'import-staging' | 'confirmed-guides'>('confirmed-guides');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const u = QADatabase.getCurrentUser();
      const adminStatus = QADatabase.isAdmin(u);
      setIsAdmin(adminStatus);
      if (adminStatus && searchParams.get('tab') === 'import') {
        setActiveTab('import-staging');
      }
      const handleAuth = () => {
        const updated = QADatabase.getCurrentUser();
        const nextAdmin = QADatabase.isAdmin(updated);
        setIsAdmin(nextAdmin);
        if (!nextAdmin) {
          setActiveTab('confirmed-guides');
        }
      };
      window.addEventListener('intelligentqa_auth_changed', handleAuth);
      window.addEventListener('intelligentqa_role_changed', handleAuth);
      return () => {
        window.removeEventListener('intelligentqa_auth_changed', handleAuth);
        window.removeEventListener('intelligentqa_role_changed', handleAuth);
      };
    }
  }, [searchParams]);

  // Staged (Imported) Guides vs Confirmed Guides
  const [stagedGuides, setStagedGuides] = useState<ConceptGuide[]>([]);
  const [confirmedGuides, setConfirmedGuides] = useState<ConceptGuide[]>([]);

  // Search in Confirmed Guides
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [showTemplateModal, setShowTemplateModal] = useState<boolean>(false);
  const [templateFormat, setTemplateFormat] = useState<'json' | 'csv'>('json');
  const [templateCopied, setTemplateCopied] = useState<boolean>(false);

  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [importText, setImportText] = useState<string>('');
  const [importStatus, setImportStatus] = useState<{ error?: string; success?: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit Staged Guide Modal
  const [editingGuide, setEditingGuide] = useState<ConceptGuide | null>(null);
  const [editTitle, setEditTitle] = useState<string>('');
  const [editCategory, setEditCategory] = useState<string>('');
  const [editLevel, setEditLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [editSummary, setEditSummary] = useState<string>('');
  const [editOverview, setEditOverview] = useState<string>('');
  const [editMechanism, setEditMechanism] = useState<string>('');
  const [editCode, setEditCode] = useState<string>('');
  const [editCodeLang, setEditCodeLang] = useState<string>('java');
  const [editInterviewTips, setEditInterviewTips] = useState<string>('');

  // Add Manual Guide Modal
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newCategory, setNewCategory] = useState<string>('Framework Architecture');
  const [newLevel, setNewLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [newSummary, setNewSummary] = useState<string>('');
  const [newOverview, setNewOverview] = useState<string>('');
  const [newMechanism, setNewMechanism] = useState<string>('');
  const [newCode, setNewCode] = useState<string>('');
  const [newCodeLang, setNewCodeLang] = useState<string>(activeTrack === 'playwright' ? 'typescript' : 'java');
  const [newInterviewTips, setNewInterviewTips] = useState<string>('');

  // View Details Modal
  const [selectedGuideForView, setSelectedGuideForView] = useState<ConceptGuide | null>(null);
  const [copiedCodeIndex, setCopiedCodeIndex] = useState<number | null>(null);

  // Feedback Banner
  const [bannerFeedback, setBannerFeedback] = useState<string | null>(null);

  const showBanner = (msg: string) => {
    setBannerFeedback(msg);
    setTimeout(() => setBannerFeedback(null), 4000);
  };

  // Load Staged and Confirmed guides
  const loadData = () => {
    setStagedGuides(getStagedGuides(activeTrack));
    setConfirmedGuides(getAllGuides(activeTrack));
  };

  useEffect(() => {
    loadData();
  }, [activeTrack]);

  // Handle URL query action params (e.g. ?action=template or ?action=import)
  useEffect(() => {
    const action = searchParams?.get('action');
    if (action === 'template') {
      setShowTemplateModal(true);
    } else if (action === 'import') {
      setShowImportModal(true);
    } else if (action === 'add') {
      setShowAddModal(true);
    }
  }, [searchParams]);

  // ==========================================
  // IMPORT ACTIONS
  // ==========================================
  const handleParseImport = (rawContent: string) => {
    setImportStatus(null);
    const result = parseImportedGuides(rawContent, activeTrack, true);

    if (result.error) {
      setImportStatus({ error: result.error });
      return;
    }

    if (!isAdmin) {
      const u = QADatabase.getCurrentUser();
      result.guides.forEach((g) => {
        QADatabase.submitContentForReview({
          type: 'guide',
          title: g.title,
          trackOrLanguage: activeTrack,
          category: g.category,
          summary: g.summary,
          submittedBy: {
            id: u?.id || 'guest',
            name: u?.displayName || 'Community Student',
            email: u?.email || 'student@intelligentqa.io',
          },
          contentPayload: g,
        });
      });
      setImportStatus({
        success: `🎉 ${result.guides.length} guide(s) submitted for Admin review and approval!`,
      });
      setImportText('');
      showBanner(`🎉 ${result.guides.length} guide(s) submitted for Admin review and approval!`);
      return;
    }

    setStagedGuides(getStagedGuides(activeTrack));
    setImportStatus({
      success: `Successfully parsed ${result.guides.length} guide(s) into staging! Review them below, edit or delete as needed, then Confirm & Submit.`,
    });
    setImportText('');
    setActiveTab('import-staging');
    showBanner(`📥 ${result.guides.length} guide(s) loaded into staging review.`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      handleParseImport(content);
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ==========================================
  // EDIT & DELETE ACTIONS (Requirement 4)
  // ==========================================
  const handleOpenEdit = (guide: ConceptGuide) => {
    setEditingGuide(guide);
    setEditTitle(guide.title);
    setEditCategory(guide.category);
    setEditLevel(guide.level);
    setEditSummary(guide.summary);
    setEditOverview(guide.overview || guide.summary);
    setEditMechanism(guide.architectureOrMechanism || '');
    setEditCode(guide.codeSnippets?.[0]?.code || '');
    setEditCodeLang(guide.codeSnippets?.[0]?.language || (activeTrack === 'playwright' ? 'typescript' : 'java'));
    setEditInterviewTips(guide.interviewTips || '');
  };

  const handleSaveEdit = () => {
    if (!editingGuide) return;
    const updated: ConceptGuide = {
      ...editingGuide,
      title: editTitle.trim() || editingGuide.title,
      category: editCategory.trim() || editingGuide.category,
      level: editLevel,
      summary: editSummary.trim() || editingGuide.summary,
      overview: editOverview.trim() || editingGuide.overview,
      architectureOrMechanism: editMechanism.trim(),
      codeSnippets: [
        {
          language: editCodeLang,
          code: editCode,
          caption: `${editTitle || editingGuide.title} Code Implementation`,
        },
      ],
      interviewTips: editInterviewTips.trim(),
      isCustom: true,
    };

    updateStagedGuide(updated);
    setStagedGuides(getStagedGuides(activeTrack));
    setEditingGuide(null);
    showBanner('✔ Imported guide updated successfully in staging!');
  };

  const handleDeleteStaged = (id: string) => {
    deleteStagedGuide(id, activeTrack);
    setStagedGuides(getStagedGuides(activeTrack));
    showBanner('🗑 Removed guide from import staging.');
  };

  // ==========================================
  // CONFIRM & SUBMIT ACTIONS (Requirements 5 & 6)
  // ==========================================
  const handleConfirmAndSubmitAll = () => {
    if (stagedGuides.length === 0) return;
    const res = confirmAndSubmitStagedGuides(activeTrack);
    setStagedGuides([]);
    setConfirmedGuides(getAllGuides(activeTrack));
    showBanner(`🎉 Confirmed and saved ${res.count} guide(s) to ${trackInfo.name} Guide List! Staging list cleared.`);
  };

  const handleConfirmSingle = (guideId: string) => {
    const res = confirmAndSubmitStagedGuides(activeTrack, [guideId]);
    setStagedGuides(getStagedGuides(activeTrack));
    setConfirmedGuides(getAllGuides(activeTrack));
    showBanner(`🎉 Confirmed and saved guide to ${trackInfo.name} Guide List!`);
  };

  // Delete from Confirmed List
  const handleDeleteConfirmed = (id: string) => {
    deleteCustomGuide(id, activeTrack);
    setConfirmedGuides(getAllGuides(activeTrack));
    showBanner('🗑 Deleted custom guide from guide list.');
  };

  // Filter confirmed guides for search
  const filteredConfirmedGuides = useMemo(() => {
    if (!searchQuery.trim()) return confirmedGuides;
    const q = searchQuery.toLowerCase();
    return confirmedGuides.filter(
      g => g.title.toLowerCase().includes(q) || g.summary.toLowerCase().includes(q) || g.category.toLowerCase().includes(q)
    );
  }, [confirmedGuides, searchQuery]);

  // Add Manual Guide
  const handleAddManualGuide = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newSummary.trim()) {
      showBanner('Title and Summary are mandatory.');
      return;
    }

    const newGuide: ConceptGuide = {
      id: `custom-guide-${Date.now()}`,
      trackId: activeTrack,
      title: newTitle.trim(),
      category: newCategory.trim() || 'General',
      level: newLevel,
      summary: newSummary.trim(),
      overview: newOverview.trim() || newSummary.trim(),
      architectureOrMechanism: newMechanism.trim(),
      codeSnippets: newCode.trim()
        ? [{ language: newCodeLang, code: newCode.trim(), caption: `${newTitle.trim()} Implementation` }]
        : [],
      interviewTips: newInterviewTips.trim(),
      isCustom: true,
    };

    if (!isAdmin) {
      const u = QADatabase.getCurrentUser();
      QADatabase.submitContentForReview({
        type: 'guide',
        title: newGuide.title,
        trackOrLanguage: activeTrack,
        category: newGuide.category,
        summary: newGuide.summary,
        submittedBy: {
          id: u?.id || 'guest',
          name: u?.displayName || 'Community Student',
          email: u?.email || 'student@intelligentqa.io',
        },
        contentPayload: newGuide,
      });
      setShowAddModal(false);
      setNewTitle('');
      setNewSummary('');
      setNewOverview('');
      setNewMechanism('');
      setNewCode('');
      setNewInterviewTips('');
      showBanner(`🎉 Guide "${newGuide.title}" submitted for Admin review and approval!`);
      return;
    }

    saveStagedGuide(newGuide);
    setStagedGuides(getStagedGuides(activeTrack));
    setShowAddModal(false);
    setNewTitle('');
    setNewSummary('');
    setNewOverview('');
    setNewMechanism('');
    setNewCode('');
    setNewInterviewTips('');
    setActiveTab('import-staging');
    showBanner('✔ Guide added to staging review list.');
  };

  const handleCopyTemplate = () => {
    const template = generateConceptGuideTemplate(templateFormat, activeTrack);
    navigator.clipboard.writeText(template);
    setTemplateCopied(true);
    setTimeout(() => setTemplateCopied(false), 2500);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Feedback Banner */}
      {bannerFeedback && (
        <div className="bg-emerald-600 text-white text-xs font-semibold px-4 py-2 text-center sticky top-0 z-50 shadow-md flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{bannerFeedback}</span>
        </div>
      )}

      {/* Top Header: Scoped strictly to the selected course (Requirement 2) */}
      <div className="border-b border-slate-800 bg-slate-900/95 px-4 py-4 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                <Link href="/dashboard" className="hover:text-white transition">Dashboard</Link>
                <span>/</span>
                <span className="text-slate-300 font-semibold">{activeTrack === 'selenium' || activeTrack === 'selenium-java' ? 'Selenium (Java)' : trackInfo.name}</span>
                <span>/</span>
                <span className="text-blue-400 font-bold">Guide Import &amp; Management</span>
              </div>
              <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-white flex items-center gap-2 mt-0.5">
                {activeTrack === 'selenium' || activeTrack === 'selenium-java' ? 'Selenium (Java)' : `${trackInfo.name} - Guide Import & Management`}
                {trackInfo.tag && (
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${trackInfo.badgeClass}`}>
                    {trackInfo.tag}
                  </span>
                )}
              </h1>
            </div>
          </div>

          {/* Quick Header Actions */}
          {isAdmin && (
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setShowTemplateModal(true)}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-2 border border-slate-700 transition cursor-pointer shadow-xs"
                title="Download or preview standard JSON/CSV import template"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Import Template</span>
              </button>

              <button
                type="button"
                onClick={() => setShowImportModal(true)}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow-md transition cursor-pointer"
                title="Import guides from JSON or CSV"
              >
                <Upload className="w-4 h-4" />
                <span>Import Guide</span>
              </button>

              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition cursor-pointer"
              >
                <Plus className="w-4 h-4 text-slate-400" />
                <span>Add Guide</span>
              </button>
            </div>
          )}
        </div>

        {/* Tab Switcher: Import & Staging vs Confirmed Guide List */}
        {isAdmin && (
          <div className="max-w-7xl mx-auto flex items-center gap-3 mt-4 pt-3 border-t border-slate-800/80">
            <button
              type="button"
              onClick={() => setActiveTab('import-staging')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'import-staging'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700'
              }`}
            >
              <UploadCloud className="w-4 h-4" />
              <span>Import &amp; Staging</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                activeTab === 'import-staging' ? 'bg-blue-800 text-white' : 'bg-slate-700 text-slate-300'
              }`}>
                {stagedGuides.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('confirmed-guides')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'confirmed-guides'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>{trackInfo.name} Guides List</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                activeTab === 'confirmed-guides' ? 'bg-blue-800 text-white' : 'bg-slate-700 text-slate-300'
              }`}>
                {confirmedGuides.length}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        {/* ======================================================== */}
        {/* TAB 1: IMPORT & STAGING (Requirements 3, 4, 5, 6)       */}
        {/* ======================================================== */}
        {activeTab === 'import-staging' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Import Controls & Template Guide */}
            <div className="lg:col-span-1 space-y-5">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <UploadCloud className="w-5 h-5 text-blue-400" />
                  <h3 className="text-sm font-bold text-white">Import Concept Guides</h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Upload your architecture guides or interview concepts using the standardized template. Imported items will appear on the right for review, editing, and confirmation.
                </p>

                {/* Import Buttons */}
                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowImportModal(true)}
                    className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-md"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload JSON / CSV Guides</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowTemplateModal(true)}
                    className="w-full py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700 transition cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-emerald-400" />
                    <span>Download Import Template</span>
                  </button>
                </div>

                {/* Template Fields Card */}
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5 text-xs">
                  <div className="font-semibold text-slate-300">Mandatory Fields in Template:</div>
                  <ul className="list-disc list-inside text-slate-400 space-y-0.5 text-[11px]">
                    <li><strong className="text-slate-200">title</strong>: Name of the architecture concept</li>
                    <li><strong className="text-slate-200">category</strong>: Domain or module group</li>
                    <li><strong className="text-slate-200">level</strong>: Beginner | Intermediate | Advanced</li>
                    <li><strong className="text-slate-200">summary</strong>: Concise 1-2 sentence definition</li>
                    <li><strong className="text-slate-200">overview</strong>: Detailed explanation</li>
                  </ul>
                </div>
              </div>

              {/* Status Note */}
              <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl space-y-2 text-xs text-slate-400">
                <div className="flex items-center gap-2 font-semibold text-slate-300">
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                  <span>Staging Workflow</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Imported guides remain in this staging list until you click <strong>Confirm &amp; Submit</strong>. You can edit any field or remove incorrect guides before saving. Once confirmed, they are permanently saved into your <strong>{trackInfo.name} Guide List</strong> and cleared from this import page.
                </p>
              </div>
            </div>

            {/* Right Column: SHOW ONLY IMPORTED GUIDES (Requirement 3) */}
            <div className="lg:col-span-2 space-y-4">
              {/* Header Bar for Staged List */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-white">Imported Guides Pending Review</h2>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-bold border border-blue-500/30 font-mono">
                    {stagedGuides.length} Pending
                  </span>
                </div>

                {/* Confirm & Submit All Button (Requirement 5) */}
                {stagedGuides.length > 0 && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        clearStagedGuides(activeTrack);
                        setStagedGuides([]);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-red-950/60 text-slate-400 hover:text-red-400 text-xs font-semibold border border-slate-700 transition cursor-pointer"
                      title="Discard all staged items"
                    >
                      Clear Staging
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmAndSubmitAll}
                      className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition cursor-pointer"
                      title="Save all staged guides into confirmed guide list"
                    >
                      <CheckCheck className="w-4 h-4" />
                      <span>Confirm &amp; Submit All ({stagedGuides.length})</span>
                    </button>
                  </div>
                )}
              </div>

              {/* EMPTY STATE */}
              {stagedGuides.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto border border-slate-700">
                    <UploadCloud className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-white">No Imported Guides Pending Review</h3>
                    <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                      Your staging area is empty. Click <strong>Import Guide</strong> to upload a JSON or CSV file of concepts, or download the template to prepare your questions.
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowTemplateModal(true)}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer"
                    >
                      Download Template
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowImportModal(true)}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition cursor-pointer"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Import Guides</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* LIST OF IMPORTED GUIDES WITH EDIT & DELETE (Requirements 3 & 4) */
                <div className="space-y-3">
                  {stagedGuides.map((guide, idx) => (
                    <div
                      key={guide.id}
                      className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition space-y-3 shadow-xs"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                              {guide.category}
                            </span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                              {guide.level}
                            </span>
                            <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                              Pending Confirmation
                            </span>
                          </div>
                          <h4 className="text-base font-bold text-white hover:text-blue-400 transition cursor-pointer" onClick={() => setSelectedGuideForView(guide)}>
                            {guide.title}
                          </h4>
                        </div>

                        {/* Card Actions: Edit, Delete, Confirm Single (Requirements 4 & 5) */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {/* Edit Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(guide)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition cursor-pointer"
                            title="Edit this imported guide"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                          </button>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => handleDeleteStaged(guide.id)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-950/60 text-slate-300 hover:text-red-400 border border-slate-700 transition cursor-pointer"
                            title="Delete this imported guide from staging"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Single Confirm Button */}
                          <button
                            type="button"
                            onClick={() => handleConfirmSingle(guide.id)}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1 transition cursor-pointer shadow-xs"
                            title="Confirm and add only this guide"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Confirm</span>
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        {guide.summary}
                      </p>

                      {/* Code preview if present */}
                      {guide.codeSnippets?.[0] && (
                        <div className="bg-slate-950 rounded-xl p-3 border border-slate-800/80 font-mono text-[11px] text-slate-300 overflow-x-auto max-h-28">
                          <div className="text-[10px] text-slate-500 font-sans mb-1 uppercase font-bold">
                            {guide.codeSnippets[0].language}: {guide.codeSnippets[0].caption || 'Snippet Preview'}
                          </div>
                          <pre>{guide.codeSnippets[0].code.slice(0, 300)}{guide.codeSnippets[0].code.length > 300 ? '...' : ''}</pre>
                        </div>
                      )}

                      {guide.interviewTips && (
                        <div className="text-[11px] text-amber-300/90 flex items-start gap-1.5 bg-amber-500/5 p-2 rounded-lg border border-amber-500/10">
                          <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <span><strong>Interview Tip:</strong> {guide.interviewTips}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: CONFIRMED GUIDES LIST (Requirement 5)             */}
        {/* ======================================================== */}
        {activeTab === 'confirmed-guides' && (
          <div className="space-y-5">
            {/* Search Bar & Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  {trackInfo.name} Confirmed Guides Library
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold font-mono">
                    {filteredConfirmedGuides.length} Guides
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  All active concept guides available for study, practice labs, and interview preparation.
                </p>
              </div>

              {/* Search input */}
              <div className="relative min-w-[260px]">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search confirmed guides..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Guides Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredConfirmedGuides.map(guide => (
                <div
                  key={guide.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition flex flex-col justify-between space-y-4 shadow-sm"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {guide.category}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                          {guide.level}
                        </span>
                        {isAdmin && guide.isCustom && (
                          <button
                            type="button"
                            onClick={() => handleDeleteConfirmed(guide.id)}
                            className="p-1 rounded hover:bg-red-950/60 text-slate-500 hover:text-red-400 transition"
                            title="Delete custom guide"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-white hover:text-blue-400 transition cursor-pointer" onClick={() => setSelectedGuideForView(guide)}>
                      {guide.title}
                    </h3>

                    <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                      {guide.summary}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-500">
                      {guide.codeSnippets?.length || 0} Code Snippet(s)
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedGuideForView(guide)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 font-semibold text-xs flex items-center gap-1 transition cursor-pointer"
                    >
                      <span>Read Guide</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* MODAL 1: EDIT STAGED GUIDE (Requirement 4)               */}
      {/* ======================================================== */}
      {editingGuide && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold text-white">Edit Imported Guide</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingGuide(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Concept Title (Mandatory)</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Category / Group</label>
                  <input
                    type="text"
                    value={editCategory}
                    onChange={e => setEditCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Level</label>
                  <select
                    value={editLevel}
                    onChange={e => setEditLevel(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Summary (1-2 sentences)</label>
                <textarea
                  rows={2}
                  value={editSummary}
                  onChange={e => setEditSummary(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Full Overview &amp; Explanation</label>
                <textarea
                  rows={4}
                  value={editOverview}
                  onChange={e => setEditOverview(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Underlying Mechanism / Architecture</label>
                <textarea
                  rows={2}
                  value={editMechanism}
                  onChange={e => setEditMechanism(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Code Language</label>
                  <select
                    value={editCodeLang}
                    onChange={e => setEditCodeLang(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="java">Java</option>
                    <option value="typescript">TypeScript</option>
                    <option value="python">Python</option>
                    <option value="csharp">C#</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Code Snippet</label>
                  <textarea
                    rows={4}
                    value={editCode}
                    onChange={e => setEditCode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 font-mono text-[11px] text-emerald-300 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">SDET Interview Tips</label>
                <textarea
                  rows={2}
                  value={editInterviewTips}
                  onChange={e => setEditInterviewTips(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setEditingGuide(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: IMPORT TEMPLATE (Download & Copy)               */}
      {/* ======================================================== */}
      {showTemplateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Download className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">
                  {trackInfo.name} Guide Import Template
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowTemplateModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Format Toggle */}
            <div className="flex items-center justify-between">
              <div className="inline-flex rounded-xl p-1 bg-slate-950 border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setTemplateFormat('json')}
                  className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition ${
                    templateFormat === 'json'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>JSON Template</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTemplateFormat('csv')}
                  className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition ${
                    templateFormat === 'csv'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
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
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition cursor-pointer"
                >
                  {templateCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-blue-400" />
                      <span>Copy Template</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => downloadConceptGuideTemplate(templateFormat, activeTrack)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .{templateFormat.toUpperCase()}</span>
                </button>
              </div>
            </div>

            {/* Template Preview */}
            <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 max-h-80 overflow-y-auto font-mono text-xs text-slate-300">
              <pre className="whitespace-pre-wrap">
                {generateConceptGuideTemplate(templateFormat, activeTrack)}
              </pre>
            </div>

            <div className="flex items-center justify-end pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowTemplateModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: IMPORT GUIDE (File Upload & Raw Paste)          */}
      {/* ======================================================== */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold text-white">Import Concept Guides</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {importStatus?.error && (
              <div className="p-3 bg-red-950/40 border border-red-800/80 rounded-xl text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{importStatus.error}</span>
              </div>
            )}

            {importStatus?.success && (
              <div className="p-3 bg-emerald-950/40 border border-emerald-800/80 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{importStatus.success}</span>
              </div>
            )}

            {/* File Upload Area */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-2xl p-6 text-center space-y-2 bg-slate-950/50 hover:bg-slate-950 transition cursor-pointer"
            >
              <UploadCloud className="w-8 h-8 text-blue-400 mx-auto" />
              <div className="text-xs text-slate-300">
                <span className="font-bold text-white">Click to upload</span> or drag and drop
              </div>
              <p className="text-[11px] text-slate-500">Supports JSON array of guides or CSV file</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,.csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {/* Or Paste Raw Text */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">Or paste JSON / CSV text directly:</label>
              <textarea
                rows={5}
                value={importText}
                onChange={e => setImportText(e.target.value)}
                placeholder='Paste raw JSON like [{"title": "...", "category": "...", "summary": "..."}] or CSV content'
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setShowImportModal(false);
                  setShowTemplateModal(true);
                }}
                className="text-xs font-bold text-blue-400 hover:underline flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Need a template?</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!importText.trim()}
                  onClick={() => handleParseImport(importText)}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold"
                >
                  Parse &amp; Stage
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: ADD MANUAL GUIDE                                */}
      {/* ======================================================== */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <form
            onSubmit={handleAddManualGuide}
            className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl my-8"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold text-white">Add Manual Concept Guide</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Concept Title (Mandatory)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Dynamic Locators & Resilience in Single Page Apps"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Category / Group</label>
                  <input
                    type="text"
                    placeholder="e.g., Synchronization, POM, Network"
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Difficulty Level</label>
                  <select
                    value={newLevel}
                    onChange={e => setNewLevel(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Summary (1-2 sentences)</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Concise overview explaining why this concept matters"
                  value={newSummary}
                  onChange={e => setNewSummary(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Full Overview &amp; Explanation</label>
                <textarea
                  rows={4}
                  placeholder="In-depth explanation, tradeoffs, and architectural concepts..."
                  value={newOverview}
                  onChange={e => setNewOverview(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Underlying Mechanism / Architecture</label>
                <textarea
                  rows={2}
                  placeholder="How it works under the hood..."
                  value={newMechanism}
                  onChange={e => setNewMechanism(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Code Language</label>
                  <select
                    value={newCodeLang}
                    onChange={e => setNewCodeLang(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="java">Java</option>
                    <option value="typescript">TypeScript</option>
                    <option value="python">Python</option>
                    <option value="csharp">C#</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Code Implementation</label>
                  <textarea
                    rows={4}
                    placeholder="// Add working code implementation"
                    value={newCode}
                    onChange={e => setNewCode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 font-mono text-[11px] text-emerald-300 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">SDET Interview Tips</label>
                <textarea
                  rows={2}
                  placeholder="Common interview questions or architectural tradeoffs..."
                  value={newInterviewTips}
                  onChange={e => setNewInterviewTips(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
              >
                Stage Guide
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 5: VIEW GUIDE DETAILS                              */}
      {/* ======================================================== */}
      {selectedGuideForView && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full p-6 space-y-5 shadow-2xl my-8">
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {selectedGuideForView.category}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                    {selectedGuideForView.level}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-white">
                  {selectedGuideForView.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedGuideForView(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1 text-xs leading-relaxed text-slate-300">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Summary</h4>
                <p className="text-slate-200">{selectedGuideForView.summary}</p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Architectural Overview</h4>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 whitespace-pre-wrap text-slate-300">
                  {selectedGuideForView.overview}
                </div>
              </div>

              {selectedGuideForView.architectureOrMechanism && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Underlying Mechanism</h4>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[11px] text-indigo-300 whitespace-pre-wrap">
                    {selectedGuideForView.architectureOrMechanism}
                  </div>
                </div>
              )}

              {selectedGuideForView.codeSnippets?.map((snip, sIdx) => (
                <div key={sIdx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-semibold uppercase">{snip.language}: {snip.caption || 'Code Example'}</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(snip.code);
                        setCopiedCodeIndex(sIdx);
                        setTimeout(() => setCopiedCodeIndex(null), 2000);
                      }}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 transition"
                    >
                      {copiedCodeIndex === sIdx ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedCodeIndex === sIdx ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[11px] text-emerald-300 overflow-x-auto">
                    <pre>{snip.code}</pre>
                  </div>
                </div>
              ))}

              {selectedGuideForView.interviewTips && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                    <Lightbulb className="w-4 h-4" />
                    <span>SDET Interview Tips &amp; Tradeoffs</span>
                  </div>
                  <p className="text-slate-300 text-[11px]">{selectedGuideForView.interviewTips}</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedGuideForView(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
