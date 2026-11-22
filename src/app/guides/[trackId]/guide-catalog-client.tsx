"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
  ShieldCheck,
  AlertTriangle,
  Clock,
  Send,
} from "lucide-react";
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
  submitStagedGuidesForApproval,
  checkGuideDuplicate,
  deleteCustomGuide,
  parseImportedGuides,
  generateConceptGuideTemplate,
  downloadConceptGuideTemplate,
  extractTextFromOfficeZip,
} from "@/lib/concept-guides";
import { QADatabase } from "@/lib/qa-db";
import TrackTutorialView from "@/components/guides/track-tutorial-view";
import { TRACK_TUTORIALS } from "@/lib/track-tutorials";

export default function GuideCatalogClient({
  initialTrackId = "selenium",
}: {
  initialTrackId: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Normalize trackId strictly to the current course
  const normalizedTrack =
    initialTrackId === "selenium-java"
      ? "selenium"
      : initialTrackId === "playwright-ts"
        ? "playwright"
        : initialTrackId;

  const [activeTrack] = useState<string>(normalizedTrack);
  const trackInfo = TRACK_META[activeTrack] || {
    id: activeTrack,
    name: "Automation",
    tag: "Core",
    color: "emerald",
    badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  };

  const [isAdmin, setIsAdmin] = useState<boolean>(true);

  // Tabs: 'tutorial' (Step-by-Step Tutorial & Setup) vs 'confirmed-guides' (Architecture Concept Guides)
  const [activeTab, setActiveTab] = useState<
    "tutorial" | "confirmed-guides"
  >(() => {
    if (typeof window !== "undefined") {
      const tabParam = new URLSearchParams(window.location.search).get("tab");
      if (tabParam === "guides" || tabParam === "import") return "confirmed-guides";
    }
    return "tutorial";
  });

  const currentTutorial =
    TRACK_TUTORIALS[activeTrack] ||
    (activeTrack === "selenium" || activeTrack === "selenium-java" ? TRACK_TUTORIALS["selenium"] : undefined) ||
    (activeTrack === "playwright" || activeTrack === "playwright-ts" ? TRACK_TUTORIALS["playwright"] : undefined) ||
    (activeTrack === "api-testing" ? TRACK_TUTORIALS["api-testing"] : undefined) ||
    (activeTrack === "ai-qa" ? TRACK_TUTORIALS["ai-qa"] : undefined);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const u = QADatabase.getCurrentUser();
      const adminStatus = QADatabase.isAdmin(u);
      setIsAdmin(adminStatus);
      const tabParam = searchParams.get("tab");
      if (tabParam === "guides" || tabParam === "import") {
        setActiveTab("confirmed-guides");
      } else if (tabParam === "tutorial") {
        setActiveTab("tutorial");
      }
      const handleAuth = () => {
        const updated = QADatabase.getCurrentUser();
        const nextAdmin = QADatabase.isAdmin(updated);
        setIsAdmin(nextAdmin);
      };
      window.addEventListener("intelligentqa_auth_changed", handleAuth);
      window.addEventListener("intelligentqa_role_changed", handleAuth);
      return () => {
        window.removeEventListener("intelligentqa_auth_changed", handleAuth);
        window.removeEventListener("intelligentqa_role_changed", handleAuth);
      };
    }
  }, [searchParams]);

  // Staged (Imported) Guides
  const [stagedGuides, setStagedGuides] = useState<ConceptGuide[]>([]);

  // Modals
  const [showTemplateModal, setShowTemplateModal] = useState<boolean>(false);
  const [templateFormat, setTemplateFormat] = useState<"xlsx" | "docx" | "excel" | "word" | "json" | "csv">("xlsx");
  const [templateCopied, setTemplateCopied] = useState<boolean>(false);

  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [importText, setImportText] = useState<string>("");
  const [importStatus, setImportStatus] = useState<{
    error?: string;
    success?: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit Staged Guide Modal
  const [editingGuide, setEditingGuide] = useState<ConceptGuide | null>(null);
  const [editTitle, setEditTitle] = useState<string>("");
  const [editCategory, setEditCategory] = useState<string>("");
  const [editLevel, setEditLevel] = useState<
    "Beginner" | "Intermediate" | "Advanced"
  >("Intermediate");
  const [editSummary, setEditSummary] = useState<string>("");
  const [editOverview, setEditOverview] = useState<string>("");
  const [editMechanism, setEditMechanism] = useState<string>("");
  const [editCode, setEditCode] = useState<string>("");
  const [editCodeLang, setEditCodeLang] = useState<string>("java");
  const [editInterviewTips, setEditInterviewTips] = useState<string>("");

  // Add Manual Guide Modal
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>("");
  const [newCategory, setNewCategory] = useState<string>(
    "Framework Architecture",
  );
  const [newLevel, setNewLevel] = useState<
    "Beginner" | "Intermediate" | "Advanced"
  >("Intermediate");
  const [newSummary, setNewSummary] = useState<string>("");
  const [newOverview, setNewOverview] = useState<string>("");
  const [newMechanism, setNewMechanism] = useState<string>("");
  const [newCode, setNewCode] = useState<string>("");
  const [newCodeLang, setNewCodeLang] = useState<string>(
    activeTrack === "playwright" ? "typescript" : "java",
  );
  const [newInterviewTips, setNewInterviewTips] = useState<string>("");

  // View Details Modal
  const [selectedGuideForView, setSelectedGuideForView] =
    useState<ConceptGuide | null>(null);
  const [copiedCodeIndex, setCopiedCodeIndex] = useState<number | null>(null);

  // Feedback Banner
  const [bannerFeedback, setBannerFeedback] = useState<string | null>(null);

  const showBanner = (msg: string) => {
    setBannerFeedback(msg);
    setTimeout(() => setBannerFeedback(null), 4000);
  };

  // Load Staged guides
  const loadData = () => {
    setStagedGuides(getStagedGuides(activeTrack));
  };

  useEffect(() => {
    loadData();
  }, [activeTrack]);

  // Handle URL query action params (e.g. ?action=template or ?action=import)
  useEffect(() => {
    const action = searchParams?.get("action");
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
          type: "guide",
          title: g.title,
          trackOrLanguage: activeTrack,
          category: g.category,
          summary: g.summary,
          submittedBy: {
            id: u?.id || "guest",
            name: u?.displayName || "Community Student",
            email: u?.email || "student@intelligentqa.io",
          },
          contentPayload: g,
        });
      });
      setImportStatus({
        success: `🎉 ${result.guides.length} guide(s) submitted for Admin review and approval!`,
      });
      setImportText("");
      showBanner(
        `🎉 ${result.guides.length} guide(s) submitted for Admin review and approval!`,
      );
      return;
    }

    setStagedGuides(getStagedGuides(activeTrack));
    setImportStatus({
      success: `Successfully parsed ${result.guides.length} guide(s) into staging! Review them in the Add Guide modal, edit or delete as needed, then Confirm & Submit.`,
    });
    setImportText("");
    setActiveTab("confirmed-guides");
    showBanner(
      `📥 ${result.guides.length} guide(s) loaded into staging review.`,
    );
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const lowerName = file.name.toLowerCase();
    if (lowerName.endsWith(".xlsx") || lowerName.endsWith(".docx")) {
      try {
        const buffer = await file.arrayBuffer();
        const extracted = await extractTextFromOfficeZip(
          buffer,
          lowerName.endsWith(".docx") ? "docx" : "xlsx"
        );
        if (extracted) {
          handleParseImport(extracted);
          if (fileInputRef.current) fileInputRef.current.value = "";
          return;
        }
      } catch (err) {
        console.warn("Office ZIP extraction fallback:", err);
      }
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      handleParseImport(content);
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
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
    setEditMechanism(guide.architectureOrMechanism || "");
    setEditCode(guide.codeSnippets?.[0]?.code || "");
    setEditCodeLang(
      guide.codeSnippets?.[0]?.language ||
        (activeTrack === "playwright" ? "typescript" : "java"),
    );
    setEditInterviewTips(guide.interviewTips || "");
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
    showBanner("✔ Imported guide updated successfully in staging!");
  };

  const handleDeleteStaged = (id: string) => {
    deleteStagedGuide(id, activeTrack);
    setStagedGuides(getStagedGuides(activeTrack));
    showBanner("🗑 Removed guide from import staging.");
  };

  // ==========================================
  // CONFIRM & SUBMIT ACTIONS (Requirements 5 & 6)
  // ==========================================
  const handleConfirmAndSubmitAll = () => {
    if (stagedGuides.length === 0) return;
    if (isAdmin) {
      const res = confirmAndSubmitStagedGuides(activeTrack);
      setStagedGuides([]);
      loadData();
      showBanner(
        `🎉 Confirmed and saved ${res.count} guide(s) to ${trackInfo.name} Guide List! Staging list cleared.`,
      );
    } else {
      const res = submitStagedGuidesForApproval(activeTrack);
      setStagedGuides([]);
      showBanner(
        `📬 Submitted for Admin Approval: ${res.count} guide(s) queued for Admin review! Admins will verify duplicate checks and approve before adding to the course.`,
      );
    }
  };

  const handleConfirmSingle = (guideId: string) => {
    if (isAdmin) {
      const res = confirmAndSubmitStagedGuides(activeTrack, [guideId]);
      setStagedGuides(getStagedGuides(activeTrack));
      loadData();
      showBanner(`🎉 Confirmed and saved guide to ${trackInfo.name} Guide List!`);
    } else {
      const res = submitStagedGuidesForApproval(activeTrack, [guideId]);
      setStagedGuides(getStagedGuides(activeTrack));
      showBanner(`📬 Submitted for Admin Approval: Guide queued for duplicate review and approval.`);
    }
  };

  // Add Manual Guide
  const handleAddManualGuide = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newSummary.trim()) {
      showBanner("Title and Summary are mandatory.");
      return;
    }

    const newGuide: ConceptGuide = {
      id: `custom-guide-${Date.now()}`,
      trackId: activeTrack,
      title: newTitle.trim(),
      category: newCategory.trim() || "General",
      level: newLevel,
      summary: newSummary.trim(),
      overview: newOverview.trim() || newSummary.trim(),
      architectureOrMechanism: newMechanism.trim(),
      codeSnippets: newCode.trim()
        ? [
            {
              language: newCodeLang,
              code: newCode.trim(),
              caption: `${newTitle.trim()} Implementation`,
            },
          ]
        : [],
      interviewTips: newInterviewTips.trim(),
      isCustom: true,
    };

    if (!isAdmin) {
      const u = QADatabase.getCurrentUser();
      QADatabase.submitContentForReview({
        type: "guide",
        title: newGuide.title,
        trackOrLanguage: activeTrack,
        category: newGuide.category,
        summary: newGuide.summary,
        submittedBy: {
          id: u?.id || "guest",
          name: u?.displayName || "Community Student",
          email: u?.email || "student@intelligentqa.io",
        },
        contentPayload: newGuide,
      });
      setShowAddModal(false);
      setNewTitle("");
      setNewSummary("");
      setNewOverview("");
      setNewMechanism("");
      setNewCode("");
      setNewInterviewTips("");
      showBanner(
        `🎉 Guide "${newGuide.title}" submitted for Admin review and approval!`,
      );
      return;
    }

    saveStagedGuide(newGuide);
    setStagedGuides(getStagedGuides(activeTrack));
    setShowAddModal(false);
    setNewTitle("");
    setNewSummary("");
    setNewOverview("");
    setNewMechanism("");
    setNewCode("");
    setNewInterviewTips("");
    setActiveTab("confirmed-guides");
    showBanner("✔ Guide added to staging review list.");
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
                <Link href="/dashboard" className="hover:text-white transition">
                  Dashboard
                </Link>
                <span>/</span>
                <span className="text-slate-300 font-semibold">
                  {activeTrack === "selenium" || activeTrack === "selenium-java"
                    ? "Selenium (Java)"
                    : trackInfo.name}
                </span>
                <span>/</span>
                <span className="text-blue-400 font-bold">
                  Architecture &amp; Concepts Library
                </span>
              </div>
              <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-white flex items-center gap-2 mt-0.5">
                {activeTrack === "selenium" || activeTrack === "selenium-java"
                  ? "Selenium (Java)"
                  : trackInfo.name}
                {trackInfo.tag && (
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${trackInfo.badgeClass}`}
                  >
                    {trackInfo.tag}
                  </span>
                )}
              </h1>
            </div>
          </div>

          {/* Quick Header Actions: Hidden from page header and accessible via the top-bar modal */}
          {isAdmin && (
            <div className="hidden sr-only">
              <button type="button" onClick={() => setShowTemplateModal(true)}>
                Import Template
              </button>
              <button type="button" onClick={() => setShowImportModal(true)}>
                Import Guide
              </button>
              <button type="button" onClick={() => setShowAddModal(true)}>
                Share your Knowledge
              </button>
              <span className="sr-only">Add Guide</span>
            </div>
          )}
        </div>

        {/* Tab Switcher: Step-by-Step Tutorial vs Concept Guides vs Import/Staging */}
        <div className="flex items-center gap-2 border-b border-slate-800 pt-3 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveTab("tutorial")}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "tutorial"
                ? "bg-slate-900 text-emerald-400 border-t-2 border-x border-slate-800 border-t-emerald-500 shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-slate-900/40"
            }`}
          >
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span>Step-by-Step Tutorial &amp; Setup</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
              Setup &amp; Code
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("confirmed-guides")}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "confirmed-guides"
                ? "bg-slate-900 text-emerald-400 border-t-2 border-x border-slate-800 border-t-emerald-500 shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-slate-900/40"
            }`}
          >
            <Layers className="w-4 h-4 text-sky-400" />
            <span>Architecture Concept Guides</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
              Library
            </span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        {/* ======================================================== */}
        {/* TAB 0: STEP-BY-STEP TUTORIAL & SETUP (GfG / Docs Edition) */}
        {/* ======================================================== */}
        {activeTab === "tutorial" && currentTutorial && (
          <TrackTutorialView tutorial={currentTutorial} />
        )}

        {/* ======================================================== */}
        {/* TAB 1: CONFIRMED GUIDES LIST                             */}
        {/* ======================================================== */}
        {activeTab === "confirmed-guides" && (
          <div className="space-y-5">
            {/* Generic details of Selenium Java Automation Framework with architectural diagram */}
            {(activeTrack === "selenium" ||
              activeTrack === "selenium-java") && (
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-sm">
                <div className="border-b border-slate-800 pb-4">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-2">
                    <span>Enterprise Architecture Overview</span>
                  </div>
                  <h3 className="text-lg font-extrabold text-white tracking-tight">
                    Selenium WebDriver + Java Enterprise Framework Architecture
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Industry-standard layered test automation architecture
                    utilizing Core Java, Selenium 4 W3C WebDriver, TestNG
                    multi-threading, and Page Object Model (POM) with decoupled
                    reporting and continuous delivery.
                  </p>
                </div>

                {/* Architecture Workflow Diagram */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Layered Framework Pipeline
                  </div>
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3 font-sans">
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-center text-xs">
                      {/* Layer 1 */}
                      <div className="bg-slate-900 border border-blue-500/30 rounded-xl p-3 space-y-1">
                        <span className="text-[10px] font-mono font-bold text-blue-400">
                          LAYER 1
                        </span>
                        <div className="font-bold text-white text-xs">
                          Test Runner
                        </div>
                        <div className="text-[10px] text-slate-400">
                          TestNG / JUnit 5 · Parallel Execution
                        </div>
                      </div>
                      {/* Layer 2 */}
                      <div className="bg-slate-900 border border-emerald-500/30 rounded-xl p-3 space-y-1">
                        <span className="text-[10px] font-mono font-bold text-emerald-400">
                          LAYER 2
                        </span>
                        <div className="font-bold text-white text-xs">
                          Page Objects
                        </div>
                        <div className="text-[10px] text-slate-400">
                          POM · Encapsulated Locators &amp; Actions
                        </div>
                      </div>
                      {/* Layer 3 */}
                      <div className="bg-slate-900 border border-amber-500/30 rounded-xl p-3 space-y-1">
                        <span className="text-[10px] font-mono font-bold text-amber-400">
                          LAYER 3
                        </span>
                        <div className="font-bold text-white text-xs">
                          Driver Factory
                        </div>
                        <div className="text-[10px] text-slate-400">
                          ThreadLocal&lt;WebDriver&gt; · W3C Protocols
                        </div>
                      </div>
                      {/* Layer 4 */}
                      <div className="bg-slate-900 border border-purple-500/30 rounded-xl p-3 space-y-1">
                        <span className="text-[10px] font-mono font-bold text-purple-400">
                          LAYER 4
                        </span>
                        <div className="font-bold text-white text-xs">
                          Reports &amp; CI/CD
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Allure · Docker Grid · GitHub Actions
                        </div>
                      </div>
                    </div>

                    {/* Visual Connector Flow */}
                    <div className="p-3 bg-slate-900/70 rounded-xl border border-slate-800/80 font-mono text-[11px] text-slate-300 space-y-1">
                      <div className="text-emerald-400 font-bold">
                        Execution Lifecycle Flow:
                      </div>
                      <div className="text-slate-400">
                        Test Suites (testng.xml) ➔ BaseTest (@BeforeMethod) ➔
                        ThreadLocal DriverFactory ➔ Page Action ➔ Explicit
                        WebDriverWait ➔ Assertions (AssertJ) ➔ Listeners
                        (@AfterMethod) ➔ Allure Reports
                      </div>
                    </div>
                  </div>
                </div>

                {/* Framework Pillars Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 space-y-1.5">
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span>1. Robust Dynamic Synchronization</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Eliminates test flakiness by replacing rigid{" "}
                      <code className="text-rose-400">Thread.sleep()</code> with
                      dynamic{" "}
                      <code className="text-emerald-400">WebDriverWait</code>{" "}
                      &amp; <code className="text-emerald-400">FluentWait</code>{" "}
                      polling against expected conditions.
                    </p>
                  </div>

                  <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 space-y-1.5">
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-400" />
                      <span>2. Thread-Safe Parallel Scaling</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Utilizes{" "}
                      <code className="text-blue-400">
                        ThreadLocal&lt;WebDriver&gt;
                      </code>{" "}
                      ensuring each parallel test runs isolated in its own JVM
                      thread without race conditions or browser
                      cross-contamination.
                    </p>
                  </div>

                  <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 space-y-1.5">
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      <span>3. Clean Page Object Model</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Decouples UI locators (
                      <code className="text-amber-400">By.id</code>,{" "}
                      <code className="text-amber-400">By.xpath</code>) and user
                      actions from test validations, providing single-point
                      maintenance when application DOM updates.
                    </p>
                  </div>

                  <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 space-y-1.5">
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-purple-400" />
                      <span>4. Cross-Browser &amp; Headless Ready</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Integrates Selenium 4 Selenium Manager for automated
                      browser driver resolution across Chrome, Firefox, and Edge
                      with containerized CI execution.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Playwright Enterprise Framework Architecture */}
            {(activeTrack === 'playwright' || activeTrack === 'playwright-ts') && (
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-sm">
                <div className="border-b border-slate-800 pb-4">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
                    <span>Enterprise Architecture Overview</span>
                  </div>
                  <h3 className="text-lg font-extrabold text-white tracking-tight">
                    Playwright + TypeScript Modern Automation Architecture
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Modern high-velocity end-to-end testing platform utilizing direct WebSocket Chrome DevTools Protocol (CDP), isolated BrowserContexts, built-in auto-waiting fixtures, and multi-machine CI sharding.
                  </p>
                </div>

                {/* Architecture Workflow Diagram */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Layered Framework Pipeline
                  </div>
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3 font-sans">
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-center text-xs">
                      {/* Layer 1 */}
                      <div className="bg-slate-900 border border-blue-500/30 rounded-xl p-3 space-y-1">
                        <span className="text-[10px] font-mono font-bold text-blue-400">LAYER 1</span>
                        <div className="font-bold text-white text-xs">Test Runner</div>
                        <div className="text-[10px] text-slate-400">Playwright Runner · Parallel Workers</div>
                      </div>
                      {/* Layer 2 */}
                      <div className="bg-slate-900 border border-emerald-500/30 rounded-xl p-3 space-y-1">
                        <span className="text-[10px] font-mono font-bold text-emerald-400">LAYER 2</span>
                        <div className="font-bold text-white text-xs">Fixtures &amp; Pages</div>
                        <div className="text-[10px] text-slate-400">Custom Fixtures · POM · Locators</div>
                      </div>
                      {/* Layer 3 */}
                      <div className="bg-slate-900 border border-amber-500/30 rounded-xl p-3 space-y-1">
                        <span className="text-[10px] font-mono font-bold text-amber-400">LAYER 3</span>
                        <div className="font-bold text-white text-xs">Browser Engine</div>
                        <div className="text-[10px] text-slate-400">CDP WebSockets · Isolated Contexts</div>
                      </div>
                      {/* Layer 4 */}
                      <div className="bg-slate-900 border border-purple-500/30 rounded-xl p-3 space-y-1">
                        <span className="text-[10px] font-mono font-bold text-purple-400">LAYER 4</span>
                        <div className="font-bold text-white text-xs">Trace &amp; CI/CD</div>
                        <div className="text-[10px] text-slate-400">Trace Viewer · Sharding · GitHub Actions</div>
                      </div>
                    </div>

                    {/* Visual Connector Flow */}
                    <div className="p-3 bg-slate-900/70 rounded-xl border border-slate-800/80 font-mono text-[11px] text-slate-300 space-y-1">
                      <div className="text-emerald-400 font-bold">Execution Lifecycle Flow:</div>
                      <div className="text-slate-400">
                        Test Specs (.spec.ts) ➔ Worker Fixture (Browser) ➔ Isolated BrowserContext (storageState) ➔ Page Actions ➔ Built-in Auto-Waiting ➔ Web-First Assertions (expect) ➔ Trace Viewer (.zip) ➔ HTML Report
                      </div>
                    </div>
                  </div>
                </div>

                {/* Framework Pillars Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 space-y-1.5">
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span>1. Zero-Sleep Dynamic Auto-Waiting</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Eliminates test flakiness by verifying 5 actionability criteria (visible, stable, enabled, editable, receiving events) before every click or fill action automatically.
                    </p>
                  </div>

                  <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 space-y-1.5">
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-400" />
                      <span>2. Sub-Millisecond BrowserContext Isolation</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Creates lightweight incognito browser contexts per test in milliseconds, sharing authenticated session states via <code className="text-blue-400">storageState.json</code> without repetitive logins.
                    </p>
                  </div>

                  <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 space-y-1.5">
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      <span>3. Native Network Interception &amp; Mocking</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Intercepts HTTP/REST requests directly with <code className="text-amber-400">page.route()</code> to stub responses, mock network latency, or simulate 500 error scenarios without external proxies.
                    </p>
                  </div>

                  <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 space-y-1.5">
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-purple-400" />
                      <span>4. Time-Travel Trace Viewer Diagnostics</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Captures full DOM snapshots, action filmstrips, console messages, and network HAR recordings with <code className="text-purple-400">trace: &apos;on-first-retry&apos;</code> with 0% overhead on passing tests.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* REST Assured Enterprise API Architecture */}
            {activeTrack === 'api-testing' && (
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-sm">
                <div className="border-b border-slate-800 pb-4">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20 mb-2">
                    <span>Enterprise Architecture Overview</span>
                  </div>
                  <h3 className="text-lg font-extrabold text-white tracking-tight">
                    REST Assured + Java Enterprise API Architecture
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Industry-standard layered API automation architecture leveraging Given-When-Then BDD syntax, Request/Response Specifications, Jackson POJO serialization, and JSON Schema contract validation.
                  </p>
                </div>

                {/* Architecture Workflow Diagram */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Layered Framework Pipeline
                  </div>
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3 font-sans">
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-center text-xs">
                      {/* Layer 1 */}
                      <div className="bg-slate-900 border border-blue-500/30 rounded-xl p-3 space-y-1">
                        <span className="text-[10px] font-mono font-bold text-blue-400">LAYER 1</span>
                        <div className="font-bold text-white text-xs">Test Runner</div>
                        <div className="text-[10px] text-slate-400">TestNG / JUnit 5 · Data Providers</div>
                      </div>
                      {/* Layer 2 */}
                      <div className="bg-slate-900 border border-emerald-500/30 rounded-xl p-3 space-y-1">
                        <span className="text-[10px] font-mono font-bold text-emerald-400">LAYER 2</span>
                        <div className="font-bold text-white text-xs">API Services</div>
                        <div className="text-[10px] text-slate-400">Given-When-Then BDD · Endpoints</div>
                      </div>
                      {/* Layer 3 */}
                      <div className="bg-slate-900 border border-purple-500/30 rounded-xl p-3 space-y-1">
                        <span className="text-[10px] font-mono font-bold text-purple-400">LAYER 3</span>
                        <div className="font-bold text-white text-xs">Specs &amp; POJOs</div>
                        <div className="text-[10px] text-slate-400">RequestSpecBuilder · Jackson SerDe</div>
                      </div>
                      {/* Layer 4 */}
                      <div className="bg-slate-900 border border-amber-500/30 rounded-xl p-3 space-y-1">
                        <span className="text-[10px] font-mono font-bold text-amber-400">LAYER 4</span>
                        <div className="font-bold text-white text-xs">Contracts &amp; CI/CD</div>
                        <div className="text-[10px] text-slate-400">JsonSchemaValidator · Allure Gates</div>
                      </div>
                    </div>

                    {/* Visual Connector Flow */}
                    <div className="p-3 bg-slate-900/70 rounded-xl border border-slate-800/80 font-mono text-[11px] text-slate-300 space-y-1">
                      <div className="text-purple-400 font-bold">Execution Lifecycle Flow:</div>
                      <div className="text-slate-400">
                        Test Suites (@Test) ➔ BaseApiTest (reqSpec) ➔ Request Body POJO (Serialization) ➔ HTTP Client Wire ➔ Response (HTTP 200) ➔ JSON Schema Validator ➔ JSONPath / AssertJ ➔ Allure Reports
                      </div>
                    </div>
                  </div>
                </div>

                {/* Framework Pillars Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 space-y-1.5">
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-purple-400" />
                      <span>1. Declarative Given-When-Then BDD</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Structures API tests into fluent, readable blocks separating preconditions (<code className="text-purple-400">given()</code>), HTTP verbs (<code className="text-purple-400">when()</code>), and assertions (<code className="text-purple-400">then()</code>).
                    </p>
                  </div>

                  <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 space-y-1.5">
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-400" />
                      <span>2. Reusable Specification Builders</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Consolidates base URIs, Bearer tokens, headers, and SLA response time checks into reusable <code className="text-blue-400">RequestSpecification</code> &amp; <code className="text-blue-400">ResponseSpecification</code> templates.
                    </p>
                  </div>

                  <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 space-y-1.5">
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span>3. Type-Safe POJO Serialization</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Leverages Jackson / Gson object mappers to serialize Java objects into JSON payloads and deserialize responses into typed objects, avoiding fragile string parsing.
                    </p>
                  </div>

                  <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 space-y-1.5">
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      <span>4. Automated Schema Contract Guardrails</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Validates 100% of the JSON response payload against RFC Draft-07 schemas using <code className="text-amber-400">matchesJsonSchemaInClasspath</code> to block contract breaking changes in CI/CD.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* AI for QA Enterprise Architecture */}
            {activeTrack === 'ai-qa' && (
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-sm">
                <div className="border-b border-slate-800 pb-4">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[11px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-2">
                    <span>Enterprise Architecture Overview</span>
                  </div>
                  <h3 className="text-lg font-extrabold text-white tracking-tight">
                    AI for QA &amp; Autonomous Agentic Testing Architecture
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Next-generation intelligent quality engineering leveraging LLM reasoning loops, autonomous test generation agents, dynamic locator self-healing, and automated root cause analysis (RCA).
                  </p>
                </div>

                {/* Architecture Workflow Diagram */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Layered Framework Pipeline
                  </div>
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3 font-sans">
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-center text-xs">
                      {/* Layer 1 */}
                      <div className="bg-slate-900 border border-cyan-500/30 rounded-xl p-3 space-y-1">
                        <span className="text-[10px] font-mono font-bold text-cyan-400">LAYER 1</span>
                        <div className="font-bold text-white text-xs">Agentic Planner</div>
                        <div className="text-[10px] text-slate-400">ReAct Loop · Task Decomposition</div>
                      </div>
                      {/* Layer 2 */}
                      <div className="bg-slate-900 border border-blue-500/30 rounded-xl p-3 space-y-1">
                        <span className="text-[10px] font-mono font-bold text-blue-400">LAYER 2</span>
                        <div className="font-bold text-white text-xs">Prompt &amp; RAG</div>
                        <div className="text-[10px] text-slate-400">DOM Tree Reduction · Few-Shot QA</div>
                      </div>
                      {/* Layer 3 */}
                      <div className="bg-slate-900 border border-emerald-500/30 rounded-xl p-3 space-y-1">
                        <span className="text-[10px] font-mono font-bold text-emerald-400">LAYER 3</span>
                        <div className="font-bold text-white text-xs">Self-Healing Engine</div>
                        <div className="text-[10px] text-slate-400">Playwright/Selenium · Semantic Recovery</div>
                      </div>
                      {/* Layer 4 */}
                      <div className="bg-slate-900 border border-purple-500/30 rounded-xl p-3 space-y-1">
                        <span className="text-[10px] font-mono font-bold text-purple-400">LAYER 4</span>
                        <div className="font-bold text-white text-xs">Vision &amp; RCA</div>
                        <div className="text-[10px] text-slate-400">Multimodal Diff · Defect Reporting</div>
                      </div>
                    </div>

                    {/* Visual Connector Flow */}
                    <div className="p-3 bg-slate-900/70 rounded-xl border border-slate-800/80 font-mono text-[11px] text-slate-300 space-y-1">
                      <div className="text-cyan-400 font-bold">Execution Lifecycle Flow:</div>
                      <div className="text-slate-400">
                        User Story / Requirement ➔ QA Agent Planner ➔ Reduced DOM Snapshot ➔ LLM Reasoning (Gemini / Claude) ➔ Action Dispatch (Playwright/Selenium) ➔ Self-Healing Recovery ➔ Vision Diff ➔ Jira Bug Report
                      </div>
                    </div>
                  </div>
                </div>

                {/* Framework Pillars Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 space-y-1.5">
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-cyan-400" />
                      <span>1. Autonomous Scenario Generation</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Converts acceptance criteria and Jira user stories directly into executable BDD test scenarios and Playwright/Selenium suites using targeted QA system prompts.
                    </p>
                  </div>

                  <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 space-y-1.5">
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span>2. Semantic Self-Healing Locators</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Dynamically recalculates broken locators at runtime by matching element visual positions, accessibility roles, and semantic parent trees without manual test maintenance.
                    </p>
                  </div>

                  <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 space-y-1.5">
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-400" />
                      <span>3. Synthetic Test Data Synthesis</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Generates edge-case, localized, and privacy-compliant (PII-safe) synthetic payloads on demand to stress test validation constraints and boundary conditions.
                    </p>
                  </div>

                  <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 space-y-1.5">
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-purple-400" />
                      <span>4. Automated Root Cause Analysis (RCA)</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Analyzes failure stack traces, browser console errors, and network HAR recordings to automatically classify whether failures are real product bugs or transient network flakiness.
                    </p>
                  </div>
                </div>
              </div>
            )}
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
                <h3 className="text-base font-bold text-white">
                  Edit Imported Guide
                </h3>
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
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Concept Title (Mandatory)
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Category / Group
                  </label>
                  <input
                    type="text"
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Level
                  </label>
                  <select
                    value={editLevel}
                    onChange={(e) => setEditLevel(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Summary (1-2 sentences)
                </label>
                <textarea
                  rows={2}
                  value={editSummary}
                  onChange={(e) => setEditSummary(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Full Overview &amp; Explanation
                </label>
                <textarea
                  rows={4}
                  value={editOverview}
                  onChange={(e) => setEditOverview(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Underlying Mechanism / Architecture
                </label>
                <textarea
                  rows={2}
                  value={editMechanism}
                  onChange={(e) => setEditMechanism(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Code Language
                  </label>
                  <select
                    value={editCodeLang}
                    onChange={(e) => setEditCodeLang(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="java">Java</option>
                    <option value="typescript">TypeScript</option>
                    <option value="python">Python</option>
                    <option value="csharp">C#</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Code Snippet
                  </label>
                  <textarea
                    rows={4}
                    value={editCode}
                    onChange={(e) => setEditCode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 font-mono text-[11px] text-emerald-300 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  SDET Interview Tips
                </label>
                <textarea
                  rows={2}
                  value={editInterviewTips}
                  onChange={(e) => setEditInterviewTips(e.target.value)}
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

            {/* Format Toggle: Excel (.XLSX) and Word (.DOCX) */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="inline-flex rounded-xl p-1 bg-slate-950 border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setTemplateFormat("xlsx")}
                  className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition cursor-pointer ${
                    templateFormat === "xlsx" || templateFormat === "excel"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Excel Template (.XLSX)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTemplateFormat("docx")}
                  className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition cursor-pointer ${
                    templateFormat === "docx" || templateFormat === "word"
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-blue-300" />
                  <span>Word Template (.DOCX)</span>
                </button>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
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

                {/* Direct Download .XLSX Button */}
                <button
                  type="button"
                  onClick={() =>
                    downloadConceptGuideTemplate("xlsx", activeTrack)
                  }
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                  title="Download genuine Microsoft Excel (.xlsx) file"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .XLSX</span>
                </button>

                {/* Direct Download .DOCX Button */}
                <button
                  type="button"
                  onClick={() =>
                    downloadConceptGuideTemplate("docx", activeTrack)
                  }
                  className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                  title="Download genuine Microsoft Word (.docx) file"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .DOCX</span>
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
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: IMPORT GUIDE (Excel & Word Upload & Paste)      */}
      {/* ======================================================== */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold text-white">
                  Import Excel / Word Concept Guides
                </h3>
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
                <span className="font-bold text-white">Click to upload Excel or Word document</span> or
                drag and drop
              </div>
              <p className="text-[11px] text-slate-500">
                Supports Excel (.xlsx, .xls) and Word (.docx, .doc) files or tables
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.docx,.doc,.txt,.csv,.json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {/* Or Paste Raw Text */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">
                Or paste rows from Excel / Word directly:
              </label>
              <textarea
                rows={5}
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder="Paste rows directly from Excel cells (table) or Word document, or raw text"
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
                className="text-xs font-bold text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Need an Excel or Word template?</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!importText.trim()}
                  onClick={() => handleParseImport(importText)}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold cursor-pointer shadow-md"
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
        <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 pt-14 overflow-y-auto">
          <form
            onSubmit={handleAddManualGuide}
            className="bg-[#121212] border border-[#262626] rounded-[28px] max-w-3xl w-full p-5 sm:p-6 space-y-4 shadow-2xl my-auto max-h-[82vh] overflow-hidden flex flex-col text-white"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#222222] gap-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#1F1F1F] border border-[#2B2B2B] flex items-center justify-center text-[#81FF89]">
                  <Plus className="w-5 h-5 text-[#81FF89]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Add Guide &amp; Management
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Author custom guides, import from file, or download
                    templates
                  </p>
                </div>
              </div>

              {/* Action buttons matching the modal requirement */}
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <div className="flex items-center gap-2 p-1 rounded-xl bg-[#0B0F19] border border-[#1E293B]">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setShowTemplateModal(true);
                    }}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 text-zinc-300 hover:text-white bg-[#131C2E] hover:bg-[#1C283E] border border-slate-700/60 transition cursor-pointer"
                    title="Download guide template"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Import Template</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setShowImportModal(true);
                    }}
                    className="px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white shadow-md transition cursor-pointer"
                    title="Import JSON/CSV guide"
                  >
                    <Upload className="w-3.5 h-3.5 text-white" />
                    <span>Import Guide</span>
                  </button>

                  <button
                    type="button"
                    className="px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 bg-slate-800 text-white border border-slate-600 cursor-default"
                  >
                    <Plus className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Share your Knowledge</span>
                    <span className="sr-only">Add Guide</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-8 h-8 rounded-full bg-[#1F1F1F] hover:bg-[#282828] text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3 max-h-[65vh] overflow-y-auto pr-1">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Concept Title (Mandatory)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Dynamic Locators & Resilience in Single Page Apps"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[#0F0F0F] border border-[#2B2B2B] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#81FF89]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Category / Group
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Synchronization, POM, Network"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-[#0F0F0F] border border-[#2B2B2B] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#81FF89]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Difficulty Level
                  </label>
                  <select
                    value={newLevel}
                    onChange={(e) => setNewLevel(e.target.value as any)}
                    className="w-full bg-[#0F0F0F] border border-[#2B2B2B] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#81FF89] cursor-pointer"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Summary (1-2 sentences)
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Concise overview explaining why this concept matters"
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                  className="w-full bg-[#0F0F0F] border border-[#2B2B2B] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#81FF89] resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Full Overview &amp; Explanation
                </label>
                <textarea
                  rows={3}
                  placeholder="In-depth explanation, tradeoffs, and architectural concepts..."
                  value={newOverview}
                  onChange={(e) => setNewOverview(e.target.value)}
                  className="w-full bg-[#0F0F0F] border border-[#2B2B2B] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#81FF89] resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Underlying Mechanism / Architecture
                </label>
                <textarea
                  rows={2}
                  placeholder="How it works under the hood..."
                  value={newMechanism}
                  onChange={(e) => setNewMechanism(e.target.value)}
                  className="w-full bg-[#0F0F0F] border border-[#2B2B2B] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#81FF89] resize-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Code Language
                  </label>
                  <select
                    value={newCodeLang}
                    onChange={(e) => setNewCodeLang(e.target.value)}
                    className="w-full bg-[#0F0F0F] border border-[#2B2B2B] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#81FF89]"
                  >
                    <option value="java">Java</option>
                    <option value="typescript">TypeScript</option>
                    <option value="python">Python</option>
                    <option value="csharp">C#</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Code Implementation
                  </label>
                  <textarea
                    rows={3}
                    placeholder="// Add working code implementation"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    className="w-full bg-[#0F0F0F] border border-[#2B2B2B] rounded-xl p-2.5 font-mono text-[11px] text-[#81FF89] focus:outline-none focus:border-[#81FF89] resize-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  SDET Interview Tips
                </label>
                <textarea
                  rows={2}
                  placeholder="Common interview questions or architectural tradeoffs..."
                  value={newInterviewTips}
                  onChange={(e) => setNewInterviewTips(e.target.value)}
                  className="w-full bg-[#0F0F0F] border border-[#2B2B2B] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#81FF89] resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#222222]">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold cursor-pointer shadow-md"
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
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Summary
                </h4>
                <p className="text-slate-200">{selectedGuideForView.summary}</p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Architectural Overview
                </h4>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 whitespace-pre-wrap text-slate-300">
                  {selectedGuideForView.overview}
                </div>
              </div>

              {selectedGuideForView.architectureOrMechanism && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Underlying Mechanism
                  </h4>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[11px] text-indigo-300 whitespace-pre-wrap">
                    {selectedGuideForView.architectureOrMechanism}
                  </div>
                </div>
              )}

              {selectedGuideForView.codeSnippets?.map((snip, sIdx) => (
                <div key={sIdx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-semibold uppercase">
                      {snip.language}: {snip.caption || "Code Example"}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(snip.code);
                        setCopiedCodeIndex(sIdx);
                        setTimeout(() => setCopiedCodeIndex(null), 2000);
                      }}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 transition"
                    >
                      {copiedCodeIndex === sIdx ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      <span>
                        {copiedCodeIndex === sIdx ? "Copied!" : "Copy"}
                      </span>
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
                  <p className="text-slate-300 text-[11px]">
                    {selectedGuideForView.interviewTips}
                  </p>
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
