'use client';

import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  BookOpen,
  Search,
  Plus,
  Upload,
  Download,
  Code2,
  Terminal,
  CheckCircle2,
  AlertCircle,
  X,
  ArrowRight,
  Laptop,
  Layers,
  Trash2,
  Tag,
  Copy,
  Check,
  Sparkles,
  Lightbulb,
  ShieldAlert,
  ArrowLeft,
  Filter,
} from 'lucide-react';
import {
  ConceptGuide,
  TRACK_META,
  getAllGuides,
  saveCustomGuide,
  deleteCustomGuide,
  parseImportedGuides,
  generateConceptGuideTemplate,
  downloadConceptGuideTemplate,
} from '@/lib/concept-guides';

export default function GuideCatalogClient({ initialTrackId = 'selenium' }: { initialTrackId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Normalize trackId
  const normalizedTrack =
    initialTrackId === 'selenium-java' ? 'selenium' : initialTrackId === 'playwright-ts' ? 'playwright' : initialTrackId;

  const [activeTrack, setActiveTrack] = useState<string>(normalizedTrack);
  const [guides, setGuides] = useState<ConceptGuide[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedLevel, setSelectedLevel] = useState<string>('All');

  // Modals
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [showTemplateModal, setShowTemplateModal] = useState<boolean>(false);
  const [templateFormat, setTemplateFormat] = useState<'json' | 'csv'>('json');
  const [templateCopied, setTemplateCopied] = useState<boolean>(false);
  const [selectedGuideForView, setSelectedGuideForView] = useState<ConceptGuide | null>(null);
  const [copiedCodeIndex, setCopiedCodeIndex] = useState<number | null>(null);
  const [bannerFeedback, setBannerFeedback] = useState<string | null>(null);

  // Add Guide Form State
  const [newTitle, setNewTitle] = useState<string>('');
  const [newCategory, setNewCategory] = useState<string>('Framework Architecture');
  const [newLevel, setNewLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [newSummary, setNewSummary] = useState<string>('');
  const [newOverview, setNewOverview] = useState<string>('');
  const [newMechanism, setNewMechanism] = useState<string>('');
  const [newCode, setNewCode] = useState<string>('');
  const [newCodeLang, setNewCodeLang] = useState<string>(activeTrack === 'playwright' ? 'typescript' : 'java');
  const [newInterviewTips, setNewInterviewTips] = useState<string>('');

  // Import Guide Form State
  const [importText, setImportText] = useState<string>('');
  const [importStatus, setImportStatus] = useState<{ error?: string; success?: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load guides
  const loadGuides = () => {
    const all = getAllGuides(activeTrack);
    setGuides(all);
  };

  useEffect(() => {
    loadGuides();
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

  const showBanner = (msg: string) => {
    setBannerFeedback(msg);
    setTimeout(() => setBannerFeedback(null), 3000);
  };

  // Switch Track Handler
  const handleTrackSwitch = (newTrack: string) => {
    setActiveTrack(newTrack);
    setSelectedCategory('All');
    setSelectedLevel('All');
    router.push(`/guides/${newTrack}`);
  };

  // Categories dynamically extracted
  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    guides.forEach(g => cats.add(g.category));
    return ['All', ...Array.from(cats)];
  }, [guides]);

  // Filtered guides
  const filteredGuides = useMemo(() => {
    return guides.filter(g => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = g.title.toLowerCase().includes(q);
        const matchesSummary = g.summary.toLowerCase().includes(q);
        const matchesCat = g.category.toLowerCase().includes(q);
        if (!matchesTitle && !matchesSummary && !matchesCat) return false;
      }
      if (selectedCategory !== 'All' && g.category !== selectedCategory) {
        return false;
      }
      if (selectedLevel !== 'All' && g.level !== selectedLevel) {
        return false;
      }
      return true;
    });
  }, [guides, searchQuery, selectedCategory, selectedLevel]);

  // Handle Add Guide
  const handleAddGuideSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newSummary.trim()) {
      alert('Please provide a Title and Summary for the Concept Guide.');
      return;
    }

    const created: ConceptGuide = {
      id: `custom-guide-${Date.now()}`,
      trackId: activeTrack as any,
      title: newTitle.trim(),
      category: newCategory.trim() || 'General',
      level: newLevel,
      summary: newSummary.trim(),
      overview: newOverview.trim() || newSummary.trim(),
      architectureOrMechanism: newMechanism.trim(),
      codeSnippets: newCode.trim()
        ? [{ language: newCodeLang, code: newCode.trim(), caption: `${newTitle} Implementation` }]
        : [],
      interviewTips: newInterviewTips.trim(),
      isCustom: true,
    };

    saveCustomGuide(created);
    loadGuides();
    setShowAddModal(false);

    // Reset
    setNewTitle('');
    setNewSummary('');
    setNewOverview('');
    setNewMechanism('');
    setNewCode('');
    setNewInterviewTips('');

    showBanner(`Concept Guide "${created.title}" added successfully!`);
  };

  // Handle File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const text = event.target?.result as string;
      if (text) {
        processImport(text);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const processImport = (text: string) => {
    const res = parseImportedGuides(text, activeTrack);
    if (res.error) {
      setImportStatus({ error: res.error });
    } else {
      loadGuides();
      setImportStatus({ success: `Successfully imported ${res.guides.length} concept guide(s)!` });
      setTimeout(() => {
        setShowImportModal(false);
        setImportStatus(null);
        setImportText('');
        showBanner(`Imported ${res.guides.length} concept guide(s) into ${TRACK_META[activeTrack]?.name || activeTrack}.`);
      }, 1200);
    }
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this custom concept guide?')) {
      deleteCustomGuide(id, activeTrack);
      loadGuides();
      if (selectedGuideForView?.id === id) {
        setSelectedGuideForView(null);
      }
      showBanner('Guide deleted.');
    }
  };

  const trackInfo = TRACK_META[activeTrack] || TRACK_META['selenium'];

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Top Breadcrumb & Title Bar */}
      <div className="border-b border-slate-800 bg-slate-900/90 px-4 py-3 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
                <Link href="/dashboard" className="hover:text-white transition">Dashboard</Link>
                <span>/</span>
                <Link href="/tracks" className="hover:text-white transition">Courses</Link>
                <span>/</span>
                <span className="text-blue-400 font-semibold">{trackInfo.name}</span>
                <span>/</span>
                <span className="text-white font-semibold">Concept Guides</span>
              </div>
              <h1 className="text-lg md:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                {trackInfo.name} Concept Guides
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {guides.length} Guides
                </span>
              </h1>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Import Template Button */}
            <button
              type="button"
              onClick={() => setShowTemplateModal(true)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition cursor-pointer"
              title="Download or preview standardized import template for concept guides"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Import Template</span>
            </button>

            {/* Import Guide Button */}
            <button
              type="button"
              onClick={() => setShowImportModal(true)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition cursor-pointer"
              title="Import concept guides via JSON or CSV"
            >
              <Upload className="w-3.5 h-3.5 text-blue-400" />
              <span>Import Guide</span>
            </button>

            {/* Add Guide Button */}
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Guide</span>
            </button>
          </div>
        </div>
      </div>

      {/* Track Selector Bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 shrink-0">
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto py-1">
          <span className="text-xs font-semibold text-slate-400 mr-2 shrink-0">Track:</span>
          {[
            { id: 'selenium', label: 'Selenium (Java & Python)' },
            { id: 'playwright', label: 'Playwright (TS & Python)' },
            { id: 'api-testing', label: 'Rest Assured (API)' },
            { id: 'ai-qa', label: 'AI for QA & Autonomous Agents' },
          ].map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => handleTrackSwitch(t.id)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                activeTrack === t.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-950/60 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Banner Feedback */}
      {bannerFeedback && (
        <div className="max-w-7xl mx-auto w-full px-4 pt-3">
          <div className="py-2 px-3 bg-emerald-950/80 border border-emerald-700/60 rounded-xl text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{bannerFeedback}</span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        {/* Search & Filters */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={`Search ${trackInfo.name} concept guides, code patterns, architecture...`}
                className="w-full bg-slate-950 border border-slate-700 hover:border-slate-600 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Level Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-semibold">Level:</span>
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                {['All', 'Beginner', 'Intermediate', 'Advanced'].map(lvl => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setSelectedLevel(lvl)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      selectedLevel === lvl
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Category Chips Filter */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-slate-800/80">
            <span className="text-[11px] font-semibold text-slate-500 mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" />
              Categories:
            </span>
            {availableCategories.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-blue-600/30 text-blue-300 border border-blue-500/50'
                    : 'bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-300 border border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Guides List Cards */}
        {filteredGuides.length === 0 ? (
          <div className="text-center py-12 bg-slate-900/40 rounded-2xl border border-slate-800/60 p-6 space-y-3">
            <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-slate-300">No concept guides match your filters</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Try adjusting your search query, selecting &quot;All&quot; categories, or click &quot;Import Guide&quot; to load your custom concept guides.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setSelectedLevel('All');
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredGuides.map(guide => (
              <div
                key={guide.id}
                onClick={() => setSelectedGuideForView(guide)}
                className="group bg-slate-900/70 hover:bg-slate-900 border border-slate-800 hover:border-blue-500/50 rounded-2xl p-4.5 flex flex-col justify-between shadow-lg transition-all hover:shadow-blue-500/5 cursor-pointer relative"
              >
                <div className="space-y-3">
                  {/* Badges & Meta */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700/80">
                      {guide.category}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          guide.level === 'Beginner'
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                            : guide.level === 'Intermediate'
                            ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                            : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                        }`}
                      >
                        {guide.level}
                      </span>
                      {guide.isCustom && (
                        <button
                          type="button"
                          onClick={e => handleDelete(guide.id, e)}
                          className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition"
                          title="Delete custom guide"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors leading-snug">
                    {guide.title}
                  </h3>

                  {/* Summary */}
                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                    {guide.summary}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                    <Code2 className="w-3.5 h-3.5 text-blue-400" />
                    <span>{guide.codeSnippets?.length || 0} code snippet(s)</span>
                  </div>

                  <span className="text-blue-400 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                    Read Guide →
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DETAILED GUIDE VIEWER MODAL / SLIDE-OVER */}
      {selectedGuideForView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                  {selectedGuideForView.category}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    selectedGuideForView.level === 'Beginner'
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      : selectedGuideForView.level === 'Intermediate'
                      ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                      : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                  }`}
                >
                  {selectedGuideForView.level}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedGuideForView(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-5 text-xs leading-relaxed">
              <div>
                <h2 className="text-xl font-extrabold text-white mb-2">
                  {selectedGuideForView.title}
                </h2>
                <p className="text-slate-400 text-xs bg-slate-950 p-3 rounded-xl border border-slate-800">
                  {selectedGuideForView.summary}
                </p>
              </div>

              {/* Detailed Overview */}
              <div className="space-y-2">
                <h3 className="text-xs uppercase font-bold tracking-wider text-slate-300 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                  Concept Overview &amp; Context
                </h3>
                <div className="text-slate-300 whitespace-pre-line leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                  {selectedGuideForView.overview}
                </div>
              </div>

              {/* Architecture / Mechanism */}
              {selectedGuideForView.architectureOrMechanism && (
                <div className="space-y-2">
                  <h3 className="text-xs uppercase font-bold tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-amber-400" />
                    Internal Architecture &amp; Mechanics
                  </h3>
                  <div className="text-slate-300 whitespace-pre-line leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
                    {selectedGuideForView.architectureOrMechanism}
                  </div>
                </div>
              )}

              {/* Code Snippets */}
              {selectedGuideForView.codeSnippets && selectedGuideForView.codeSnippets.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs uppercase font-bold tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-emerald-400" />
                    Production Code Implementation
                  </h3>
                  {selectedGuideForView.codeSnippets.map((snip, idx) => (
                    <div key={idx} className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-md">
                      <div className="px-3 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                        <span className="text-[11px] font-mono text-emerald-400 font-bold">
                          {snip.caption || `${snip.language.toUpperCase()} Snippet`}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(snip.code);
                            setCopiedCodeIndex(idx);
                            setTimeout(() => setCopiedCodeIndex(null), 2000);
                          }}
                          className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] flex items-center gap-1 transition"
                        >
                          {copiedCodeIndex === idx ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedCodeIndex === idx ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                      <pre className="p-4 font-mono text-xs text-slate-200 overflow-x-auto leading-relaxed whitespace-pre select-text">
                        {snip.code}
                      </pre>
                    </div>
                  ))}
                </div>
              )}

              {/* Best Practices & Anti-Patterns */}
              {((selectedGuideForView.bestPractices && selectedGuideForView.bestPractices.length > 0) ||
                (selectedGuideForView.antiPatterns && selectedGuideForView.antiPatterns.length > 0)) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedGuideForView.bestPractices && selectedGuideForView.bestPractices.length > 0 && (
                    <div className="p-3.5 bg-emerald-950/20 border border-emerald-800/50 rounded-xl space-y-2">
                      <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Recommended Best Practices
                      </h4>
                      <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                        {selectedGuideForView.bestPractices.map((bp, i) => (
                          <li key={i}>{bp}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedGuideForView.antiPatterns && selectedGuideForView.antiPatterns.length > 0 && (
                    <div className="p-3.5 bg-rose-950/20 border border-rose-800/50 rounded-xl space-y-2">
                      <h4 className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        Common Anti-Patterns
                      </h4>
                      <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                        {selectedGuideForView.antiPatterns.map((ap, i) => (
                          <li key={i}>{ap}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Interview Tips */}
              {selectedGuideForView.interviewTips && (
                <div className="p-3.5 bg-blue-950/30 border border-blue-800/50 rounded-xl space-y-1.5">
                  <h4 className="text-xs font-bold text-blue-300 flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                    Senior SDET Interview Insight
                  </h4>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {selectedGuideForView.interviewTips}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
              <Link
                href="/sandbox/code"
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition"
              >
                <Laptop className="w-3.5 h-3.5 text-blue-400" />
                <span>Test in Online Compilers</span>
              </Link>
              <button
                type="button"
                onClick={() => setSelectedGuideForView(null)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-md"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}

      {/* IMPORT TEMPLATE MODAL */}
      {showTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Header */}
            <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                  <Download className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{trackInfo.name} Concept Guide Import Template</h3>
                  <p className="text-[11px] text-slate-400">Standardized template schema with mandatory fields</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowTemplateModal(false);
                  setTemplateCopied(false);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 overflow-y-auto space-y-3.5 text-xs">
              {/* Mandatory Fields */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                <span className="text-[11px] font-bold text-slate-200">Mandatory Schema Fields:</span>
                <div className="flex flex-wrap gap-1.5 text-[10px] font-mono">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">title (Required)</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">category (Required)</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">level: Beginner|Intermediate|Advanced (Required)</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">summary (Required)</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">overview (Required)</span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400">codeSnippets (Optional)</span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400">interviewTips (Optional)</span>
                </div>
              </div>

              {/* Format Switcher */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setTemplateFormat('json')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                      templateFormat === 'json' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    JSON Template
                  </button>
                  <button
                    type="button"
                    onClick={() => setTemplateFormat('csv')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                      templateFormat === 'csv' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    CSV Template
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(generateConceptGuideTemplate(templateFormat, activeTrack));
                    setTemplateCopied(true);
                    setTimeout(() => setTemplateCopied(false), 2000);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1 transition"
                >
                  {templateCopied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Download className="w-3.5 h-3.5" />}
                  <span>{templateCopied ? 'Copied!' : 'Copy Template Code'}</span>
                </button>
              </div>

              {/* Preview */}
              <pre className="p-3 bg-black/90 text-emerald-400 border border-slate-800 rounded-xl font-mono text-[11px] overflow-auto max-h-[220px] whitespace-pre select-text">
                {generateConceptGuideTemplate(templateFormat, activeTrack)}
              </pre>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => downloadConceptGuideTemplate(templateFormat, activeTrack)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-md cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download {templateFormat.toUpperCase()} Template</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowTemplateModal(false);
                    setShowImportModal(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-md cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>Open Import Dialog</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* IMPORT GUIDE MODAL */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Header */}
            <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Import {trackInfo.name} Concept Guides</h3>
                  <p className="text-[11px] text-slate-400">Upload JSON or CSV file or paste guide definitions</p>
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

            {/* Body */}
            <div className="p-4 overflow-y-auto space-y-4 text-xs">
              {/* Template Download Notice */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Need the standard template?</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Required fields: <code className="text-emerald-400">title</code>, <code className="text-emerald-400">category</code>, <code className="text-emerald-400">level</code>, <code className="text-emerald-400">summary</code>, <code className="text-emerald-400">overview</code>.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => downloadConceptGuideTemplate('json', activeTrack)}
                    className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3 h-3" />
                    <span>.JSON</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadConceptGuideTemplate('csv', activeTrack)}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3 h-3" />
                    <span>.CSV</span>
                  </button>
                </div>
              </div>

              {/* File Upload Area */}
              <div
                className="p-4 rounded-xl border-2 border-dashed border-slate-700 hover:border-blue-500 bg-slate-950/70 text-center transition cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-8 h-8 text-blue-400 mx-auto mb-2 opacity-80" />
                <p className="font-semibold text-slate-200">Click to upload a .json or .csv guide file</p>
                <p className="text-[11px] text-slate-500 mt-1">Supports JSON array of concept guides or CSV format</p>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".json,.csv,.txt"
                  className="hidden"
                />
              </div>

              {/* Paste Textarea */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-400">Or Paste Raw JSON/CSV Content:</label>
                <textarea
                  rows={6}
                  value={importText}
                  onChange={e => setImportText(e.target.value)}
                  placeholder="Paste JSON array or CSV text here..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white placeholder-slate-600 font-mono text-[11px] focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Status Alerts */}
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

              {/* Footer Buttons */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
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
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold transition shadow-md cursor-pointer"
                >
                  Import Guides
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD GUIDE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Header */}
            <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Add New {trackInfo.name} Concept Guide</h3>
                  <p className="text-[11px] text-slate-400">Add custom SDET architectural concepts to your library</p>
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

            {/* Form */}
            <form onSubmit={handleAddGuideSubmit} className="p-4 overflow-y-auto space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300">
                    Guide Title <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    placeholder="e.g. ThreadLocal WebDriver Architecture"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300">Category / Topic</label>
                  <input
                    type="text"
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                    placeholder="e.g. Framework Design, Synchronization"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300">Difficulty Level</label>
                <select
                  value={newLevel}
                  onChange={e => setNewLevel(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300">
                  Short Summary <span className="text-rose-400">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={newSummary}
                  onChange={e => setNewSummary(e.target.value)}
                  placeholder="1-2 sentences summarizing what this concept solves..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300">Detailed Concept Overview</label>
                <textarea
                  rows={4}
                  value={newOverview}
                  onChange={e => setNewOverview(e.target.value)}
                  placeholder="Detailed multi-paragraph breakdown of the concept and architecture..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300">Sample Code Implementation</label>
                <div className="flex items-center gap-2 mb-1">
                  <select
                    value={newCodeLang}
                    onChange={e => setNewCodeLang(e.target.value)}
                    className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-white"
                  >
                    <option value="java">Java</option>
                    <option value="typescript">TypeScript</option>
                    <option value="python">Python</option>
                    <option value="json">JSON</option>
                  </select>
                </div>
                <textarea
                  rows={4}
                  value={newCode}
                  onChange={e => setNewCode(e.target.value)}
                  placeholder="// Paste sample implementation code here..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white placeholder-slate-600 font-mono text-[11px] focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300">Senior SDET Interview Tips</label>
                <textarea
                  rows={2}
                  value={newInterviewTips}
                  onChange={e => setNewInterviewTips(e.target.value)}
                  placeholder="Key talking points for interview discussions..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>

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
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition shadow-md"
                >
                  Save Guide
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
