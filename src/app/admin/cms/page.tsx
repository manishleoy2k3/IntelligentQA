'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  UploadCloud,
  FileDown,
  RotateCcw,
  Terminal,
  Code2,
  Laptop,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Search,
  Eye,
  Check,
  X,
  FileText,
  Layers,
  Copy,
  Users,
  Clock,
  Lock,
} from 'lucide-react';
import { QADatabase } from '@/lib/qa-db';
import { Track, Lesson, ModerationItem } from '@/types/qa';
import { CourseConcept, LanguageCourseMeta } from '@/lib/kids-courses';

export default function CourseCMSPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [activePortal, setActivePortal] = useState<'sdet' | 'kids' | 'approvals' | 'team'>('sdet');

  // Selected Course
  const [selectedSdetTrackId, setSelectedSdetTrackId] = useState<string>('selenium-java');
  const [selectedKidsLang, setSelectedKidsLang] = useState<'python' | 'javascript' | 'java'>('python');

  // Loaded Course Content from Database
  const [sdetTracks, setSdetTracks] = useState<Track[]>([]);
  const [kidsCourses, setKidsCourses] = useState<Record<string, LanguageCourseMeta> | null>(null);

  // Moderation & Approvals
  const [submissions, setSubmissions] = useState<ModerationItem[]>([]);
  const [previewItem, setPreviewItem] = useState<ModerationItem | null>(null);
  const [rejectingItem, setRejectingItem] = useState<ModerationItem | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [submissionFilter, setSubmissionFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  // Team & RBAC
  const [adminEmails, setAdminEmails] = useState<string[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState<string>('');
  const [adminSecret, setAdminSecret] = useState<string>('');
  const [isEditingSecret, setIsEditingSecret] = useState<boolean>(false);
  const [newSecretInput, setNewSecretInput] = useState<string>('');

  // Passcode gate for non-admins
  const [gatePasscode, setGatePasscode] = useState<string>('');
  const [gateError, setGateError] = useState<string | null>(null);

  // Search Filter
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showEditModal, setShowEditModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showDeleteConfirmId, setShowDeleteConfirmId] = useState<string | null>(null);

  // Edit / Add Form State
  const [editingTarget, setEditingTarget] = useState<{
    isKids: boolean;
    courseId: string;
    moduleId?: string;
    item: any | null; // null for new
  } | null>(null);

  const [formTitle, setFormTitle] = useState('');
  const [formModule, setFormModule] = useState('');
  const [formSummary, setFormSummary] = useState('');
  const [formOverview, setFormOverview] = useState('');
  const [formStarterCode, setFormStarterCode] = useState('');
  const [formSolutionCode, setFormSolutionCode] = useState('');
  const [formBestPractices, setFormBestPractices] = useState('');

  // Import Modal State
  const [importJsonText, setImportJsonText] = useState('');
  const [importStatus, setImportStatus] = useState<string>('');
  const [bannerMsg, setBannerMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Helper notification
  const triggerBanner = (text: string, type: 'success' | 'error' = 'success') => {
    setBannerMsg({ text, type });
    setTimeout(() => setBannerMsg(null), 4000);
  };

  // Reload data from Database
  const reloadData = () => {
    const tracks = QADatabase.getTracks();
    setSdetTracks(tracks);
    const courses = QADatabase.getKidsCourses();
    setKidsCourses(courses);
    const subs = QADatabase.getAllSubmissions();
    setSubmissions(subs);
    const admins = QADatabase.getAdminEmails();
    setAdminEmails(admins);
    setAdminSecret(QADatabase.getAdminSecret());
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const u = QADatabase.getCurrentUser();
      setCurrentUser(u);
      setIsAdmin(QADatabase.isAdmin(u));
      reloadData();

      const handleAuthOrRole = () => {
        const updated = QADatabase.getCurrentUser();
        setCurrentUser(updated);
        setIsAdmin(QADatabase.isAdmin(updated));
        reloadData();
      };

      window.addEventListener('intelligentqa_auth_changed', handleAuthOrRole);
      window.addEventListener('intelligentqa_role_changed', handleAuthOrRole);
      window.addEventListener('intelligentqa_curriculum_updated', reloadData);
      window.addEventListener('intelligentqa_kids_courses_updated', reloadData);
      window.addEventListener('intelligentqa_moderation_updated', reloadData);
      window.addEventListener('intelligentqa_admin_list_changed', reloadData);
      return () => {
        window.removeEventListener('intelligentqa_auth_changed', handleAuthOrRole);
        window.removeEventListener('intelligentqa_role_changed', handleAuthOrRole);
        window.removeEventListener('intelligentqa_curriculum_updated', reloadData);
        window.removeEventListener('intelligentqa_kids_courses_updated', reloadData);
        window.removeEventListener('intelligentqa_moderation_updated', reloadData);
        window.removeEventListener('intelligentqa_admin_list_changed', reloadData);
      };
    }
  }, []);

  // Open Edit / Add Modal
  const handleOpenAdd = (isKids: boolean) => {
    setEditingTarget({
      isKids,
      courseId: isKids ? selectedKidsLang : selectedSdetTrackId,
      item: null,
    });
    setFormTitle('');
    setFormModule(isKids ? 'Core Fundamentals' : 'Automation Basics');
    setFormSummary('');
    setFormOverview('');
    setFormStarterCode(isKids ? '# Write starter code here' : '// Automation starter template');
    setFormSolutionCode('');
    setFormBestPractices('');
    setShowEditModal(true);
  };

  const handleOpenEdit = (item: any, isKids: boolean, moduleId?: string) => {
    setEditingTarget({
      isKids,
      courseId: isKids ? selectedKidsLang : selectedSdetTrackId,
      moduleId,
      item,
    });
    setFormTitle(item.title || '');
    setFormModule(item.module || moduleId || 'General');
    setFormSummary(item.summary || item.description || '');
    setFormOverview(item.overview || item.exercise || '');
    setFormStarterCode(item.starterCode || item.code || '');
    setFormSolutionCode(item.solutionCode || '');
    setFormBestPractices(
      Array.isArray(item.bestPractices)
        ? item.bestPractices.join('\n')
        : typeof item.bestPractices === 'string'
        ? item.bestPractices
        : ''
    );
    setShowEditModal(true);
  };

  // Save Lesson / Concept into Database
  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTarget || !formTitle.trim()) return;

    if (editingTarget.isKids) {
      const lang = editingTarget.courseId as 'python' | 'javascript' | 'java';
      const conceptId = editingTarget.item?.id || `concept-${Date.now()}`;
      const bestPracticesList = formBestPractices
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

      const concept: CourseConcept = {
        id: conceptId,
        title: formTitle.trim(),
        order: editingTarget.item?.order || 10,
        language: lang,
        summary: formSummary.trim(),
        overview: formOverview.trim(),
        keyPoints: [],
        starterCode: formStarterCode.trim(),
        solutionCode: formSolutionCode.trim(),
        bestPractices: bestPracticesList,
      };

      QADatabase.saveKidsConcept(concept);
      triggerBanner(`✅ Concept "${concept.title}" saved into ${lang.toUpperCase()} database.`);
    } else {
      const trackId = editingTarget.courseId as any;
      const lessonId = editingTarget.item?.id || `les-${Date.now()}`;
      const moduleId = editingTarget.moduleId || 'mod-custom-1';

      const lesson: Lesson = {
        id: lessonId,
        moduleId,
        trackId,
        title: formTitle.trim(),
        description: formSummary.trim(),
        durationMinutes: editingTarget.item?.durationMinutes || 20,
        badge: (trackId.includes('ts') ? 'playwright' : 'selenium') as any,
        level: 'Intermediate',
        manualContext: {
          title: 'Manual Verification',
          steps: ['Execute manual test steps'],
          painPoints: ['Manual execution is slow and error-prone'],
        },
        automationContext: {
          playwrightTs: formStarterCode.trim(),
          seleniumJava: formStarterCode.trim(),
          explanation: formOverview.trim(),
          bestPractices: formBestPractices.split('\n').map(s => s.trim()).filter(Boolean),
          antiPatterns: [],
        },
        aiAugmentation: {
          promptExample: 'Generate automated tests',
          agenticWorkflow: 'Analyze DOM locators',
          selfHealingTip: 'Use resilient locators',
        },
        challenge: {
          instruction: formOverview.trim() || 'Write test code',
          starterCode: {
            typescript: formStarterCode.trim(),
            java: formStarterCode.trim(),
          },
          solutionCode: {
            typescript: formSolutionCode.trim(),
            java: formSolutionCode.trim(),
          },
          validationRules: [],
        },
      };

      QADatabase.saveLesson(trackId, moduleId, lesson);
      triggerBanner(`✅ Lesson "${lesson.title}" saved into ${trackId} database.`);
    }

    reloadData();
    setShowEditModal(false);
  };

  // Delete Lesson / Concept from Database
  const handleDeleteItem = (id: string, isKids: boolean) => {
    if (isKids) {
      QADatabase.deleteKidsConcept(selectedKidsLang, id);
      triggerBanner(`🗑 Concept removed from ${selectedKidsLang} course database.`);
    } else {
      QADatabase.deleteLesson(selectedSdetTrackId, id);
      triggerBanner(`🗑 Lesson removed from ${selectedSdetTrackId} track database.`);
    }
    reloadData();
    setShowDeleteConfirmId(null);
  };

  // Batch Import JSON / CSV into Database
  const handleBatchImport = () => {
    if (!importJsonText.trim()) return;
    try {
      const parsed = JSON.parse(importJsonText);
      const items = Array.isArray(parsed) ? parsed : [parsed];

      if (activePortal === 'kids') {
        items.forEach((item, idx) => {
          const concept: CourseConcept = {
            id: item.id || `custom-${selectedKidsLang}-${Date.now()}-${idx}`,
            title: item.title || `Concept ${idx + 1}`,
            order: 10 + idx,
            language: selectedKidsLang,
            summary: item.summary || 'Imported programming concept.',
            overview: item.overview || '',
            keyPoints: item.keyPoints || [],
            starterCode: item.starterCode || item.code || '# Write code here',
            solutionCode: item.solutionCode || '',
            bestPractices: item.bestPractices || [],
          };
          QADatabase.saveKidsConcept(concept);
        });
        triggerBanner(`🎉 Imported ${items.length} concepts into ${selectedKidsLang.toUpperCase()} database.`);
      } else {
        items.forEach((item, idx) => {
          const lesson: Lesson = {
            id: item.id || `les-${Date.now()}-${idx}`,
            moduleId: 'mod-custom-imported',
            trackId: selectedSdetTrackId as any,
            title: item.title || `Lesson ${idx + 1}`,
            description: item.summary || item.description || '',
            durationMinutes: item.durationMinutes || 25,
            badge: (selectedSdetTrackId.includes('ts') ? 'playwright' : 'selenium') as any,
            level: 'Intermediate',
            manualContext: {
              title: item.title || 'Verification Step',
              steps: ['Review requirements', 'Verify behavior'],
              painPoints: ['Manual regression is slow'],
            },
            automationContext: {
              playwrightTs: item.starterCode || item.code || '// Test code here',
              seleniumJava: item.starterCode || item.code || '// Test code here',
              explanation: item.overview || '',
              bestPractices: item.bestPractices || [],
              antiPatterns: [],
            },
            aiAugmentation: {
              promptExample: 'Generate automated validation tests',
              agenticWorkflow: 'Inspect selectors and assertions',
              selfHealingTip: 'Rely on semantic roles',
            },
            challenge: {
              instruction: item.overview || 'Complete the automation challenge',
              starterCode: {
                typescript: item.starterCode || item.code || '// Code here',
                java: item.starterCode || item.code || '// Code here',
              },
              solutionCode: {
                typescript: item.solutionCode || '// Solution',
                java: item.solutionCode || '// Solution',
              },
              validationRules: [],
            },
          };
          QADatabase.saveLesson(selectedSdetTrackId, 'mod-custom-imported', lesson);
        });
        triggerBanner(`🎉 Imported ${items.length} lessons into ${selectedSdetTrackId} database.`);
      }

      reloadData();
      setImportJsonText('');
      setShowImportModal(false);
    } catch (err: any) {
      setImportStatus('Invalid JSON format: ' + err.message);
    }
  };

  // Export Course Content as JSON
  const handleExportCourse = () => {
    let exportData: any;
    let filename = '';
    if (activePortal === 'kids') {
      exportData = kidsCourses?.[selectedKidsLang];
      filename = `${selectedKidsLang}_course_database_export.json`;
    } else {
      exportData = sdetTracks.find((t) => t.id === selectedSdetTrackId);
      filename = `${selectedSdetTrackId}_track_database_export.json`;
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    triggerBanner(`📥 Exported course database to ${filename}`);
  };

  // Active track / course for display
  const currentSdetTrack = sdetTracks.find((t) => t.id === selectedSdetTrackId) || sdetTracks[0];
  const currentKidsCourse = kidsCourses?.[selectedKidsLang];

  // RBAC Access Guard: if not admin, show access restricted screen with secure passcode verification
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-3xl bg-purple-500/10 border border-purple-500/20 text-purple-400 mx-auto flex items-center justify-center">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-black text-white">Course CMS Access Restricted</h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              The Course Content Management System is restricted to authorized <strong>Administrators</strong>.
              Normal students and users cannot view or edit course contents.
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const res = QADatabase.verifyAndElevateAdmin(gatePasscode, currentUser);
              if (res.success) {
                setIsAdmin(true);
                triggerBanner(res.message);
                reloadData();
              } else {
                setGateError(res.message);
              }
            }}
            className="p-5 rounded-2xl bg-slate-950 border border-slate-800/80 text-xs text-slate-300 space-y-3 text-left"
          >
            <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
              Enter Administrator Passcode
            </div>
            <p className="text-[11px] text-slate-400">
              Only platform administrators with the master security passcode can unlock access for <span className="font-mono text-purple-400">{currentUser?.email || 'this session'}</span>.
            </p>

            <input
              type="password"
              value={gatePasscode}
              onChange={(e) => {
                setGatePasscode(e.target.value);
                setGateError(null);
              }}
              placeholder="Enter master admin passcode..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              autoFocus
            />

            {gateError && (
              <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[11px] flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{gateError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={!gatePasscode.trim()}
              className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Verify &amp; Unlock CMS</span>
            </button>
          </form>

          <Link
            href="/dashboard"
            className="inline-block text-xs font-semibold text-slate-400 hover:text-white transition"
          >
            ← Return to Learning Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col">
      {/* 1. TOP CMS NAV & ROLE STATUS */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-30 px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <ShieldCheck className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black text-white">Course Content Management System (CMS)</h1>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  ADMIN ACTIVE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Manage, edit, upload, and publish course content across SDET and Coding Tutorials.
              </p>
            </div>
          </div>

          {/* Quick Actions & Role Switch */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => {
                QADatabase.switchToStudentSession();
                setIsAdmin(false);
              }}
              className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold border border-slate-700 transition"
              title="Test the site as a regular student"
            >
              Switch to Student View
            </button>

            <button
              type="button"
              onClick={handleExportCourse}
              className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition"
              title="Export current course database to JSON"
            >
              <FileDown className="w-3.5 h-3.5 text-blue-400" />
              <span>Export JSON</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setShowImportModal(true);
                setImportStatus('');
              }}
              className="py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition"
              title="Batch import course content"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Batch Upload</span>
            </button>

            <button
              type="button"
              onClick={() => handleOpenAdd(activePortal === 'kids')}
              className="py-1.5 px-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 shadow-md transition"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add {activePortal === 'kids' ? 'Concept' : 'Lesson'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Floating Banner */}
      {bannerMsg && (
        <div
          className={`fixed top-18 right-6 z-50 p-4 rounded-2xl shadow-2xl text-xs font-bold border animate-in slide-in-from-top-4 flex items-center gap-2 ${
            bannerMsg.type === 'success'
              ? 'bg-emerald-950 border-emerald-500 text-emerald-200'
              : 'bg-rose-950 border-rose-500 text-rose-200'
          }`}
        >
          {bannerMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
          <span>{bannerMsg.text}</span>
        </div>
      )}

      {/* 2. MAIN CMS WORKSPACE */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
        {/* Category Switcher: 4 Portals */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2 p-1 bg-slate-900 rounded-2xl border border-slate-800 flex-wrap">
            <button
              type="button"
              onClick={() => setActivePortal('sdet')}
              className={`py-2 px-4 rounded-xl text-xs font-extrabold transition flex items-center gap-2 cursor-pointer ${
                activePortal === 'sdet'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>SDET Courses ({sdetTracks.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActivePortal('kids')}
              className={`py-2 px-4 rounded-xl text-xs font-extrabold transition flex items-center gap-2 cursor-pointer ${
                activePortal === 'kids'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Coding Courses (3)</span>
            </button>

            <button
              type="button"
              onClick={() => setActivePortal('approvals')}
              className={`py-2 px-4 rounded-xl text-xs font-extrabold transition flex items-center gap-2 cursor-pointer ${
                activePortal === 'approvals'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Approvals Queue</span>
              {submissions.filter(s => s.status === 'pending').length > 0 && (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 font-bold">
                  {submissions.filter(s => s.status === 'pending').length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActivePortal('team')}
              className={`py-2 px-4 rounded-xl text-xs font-extrabold transition flex items-center gap-2 cursor-pointer ${
                activePortal === 'team'
                  ? 'bg-purple-700 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Admin Team &amp; RBAC</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-purple-500/20 text-purple-300">
                {adminEmails.length}
              </span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        {/* VIEW 1 & 2: SDET & KIDS CURRICULUM MANAGEMENT */}
        {(activePortal === 'sdet' || activePortal === 'kids') && (
          <div className="space-y-6">

        {/* Course Selector Sub-Tabs */}
        {activePortal === 'sdet' ? (
          <div className="flex items-center gap-2 flex-wrap">
            {sdetTracks.map((track) => (
              <button
                key={track.id}
                type="button"
                onClick={() => setSelectedSdetTrackId(track.id)}
                className={`py-2 px-4 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                  selectedSdetTrackId === track.id
                    ? 'bg-slate-800 text-white border border-purple-500/50 shadow-sm'
                    : 'bg-slate-900/80 hover:bg-slate-850 text-slate-400 border border-slate-800'
                }`}
              >
                <span>{track.title}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300">
                  {track.totalLessons} Lessons
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 flex-wrap">
            {(['python', 'javascript', 'java'] as const).map((lang) => {
              const meta = kidsCourses?.[lang];
              return (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setSelectedKidsLang(lang)}
                  className={`py-2 px-4 rounded-xl text-xs font-bold capitalize transition flex items-center gap-2 ${
                    selectedKidsLang === lang
                      ? 'bg-slate-800 text-white border border-amber-500/50 shadow-sm'
                      : 'bg-slate-900/80 hover:bg-slate-850 text-slate-400 border border-slate-800'
                  }`}
                >
                  {lang === 'python' ? <Terminal className="w-3.5 h-3.5 text-amber-500" /> : lang === 'javascript' ? <Code2 className="w-3.5 h-3.5 text-emerald-500" /> : <Laptop className="w-3.5 h-3.5 text-cyan-500" />}
                  <span>{meta?.name || lang}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400">
                    {meta?.concepts.length || 9} Concepts
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Selected Course Overview Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-900/60 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-slate-400">Active Course:</span>
              <span className="text-sm font-bold text-white">
                {activePortal === 'sdet' ? currentSdetTrack?.title : currentKidsCourse?.name}
              </span>
            </div>
            <p className="text-xs text-slate-400 line-clamp-2 max-w-2xl">
              {activePortal === 'sdet' ? currentSdetTrack?.description : currentKidsCourse?.description}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => {
                if (activePortal === 'sdet') {
                  QADatabase.resetTracksToDefault();
                  triggerBanner('🔄 Reset SDET tracks to factory defaults.');
                } else {
                  QADatabase.resetKidsCoursesToDefault();
                  triggerBanner('🔄 Reset Coding courses to factory defaults.');
                }
                reloadData();
              }}
              className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-slate-200 text-xs font-semibold transition flex items-center gap-1.5"
              title="Reset course contents back to original template"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Defaults</span>
            </button>

            <Link
              href={activePortal === 'sdet' ? `/tracks/${selectedSdetTrackId}` : `/kids?lang=${selectedKidsLang}`}
              target="_blank"
              className="py-1.5 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 border border-slate-700"
            >
              <Eye className="w-3.5 h-3.5 text-blue-400" />
              <span>Live Preview</span>
            </Link>
          </div>
        </div>

        {/* Content Management Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs font-bold text-slate-400">
            <span>Course Content Repository ({activePortal === 'sdet' ? currentSdetTrack?.totalLessons : currentKidsCourse?.concepts.length} Items)</span>
            <span className="text-slate-500 font-normal">Stored in IntelligentQA DB</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-mono text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4 w-12">#</th>
                  <th className="py-3 px-4">Title &amp; Module</th>
                  <th className="py-3 px-4">Summary</th>
                  <th className="py-3 px-4 w-32">Status / Type</th>
                  <th className="py-3 px-4 w-36 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {activePortal === 'sdet' ? (
                  /* SDET Lessons Rows */
                  currentSdetTrack?.modules.flatMap((mod) =>
                    mod.lessons
                      .filter((les) =>
                        searchQuery
                          ? les.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            les.description.toLowerCase().includes(searchQuery.toLowerCase())
                          : true
                      )
                      .map((les, idx) => (
                        <tr key={les.id} className="hover:bg-slate-850/50 transition">
                          <td className="py-3.5 px-4 font-mono text-slate-500">{idx + 1}</td>
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-white text-xs">{les.title}</div>
                            <div className="text-[11px] text-purple-400 font-mono mt-0.5">{mod.title}</div>
                          </td>
                          <td className="py-3.5 px-4 text-slate-400 max-w-md truncate">
                            {les.description}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                              {les.durationMinutes}m lesson
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(les, false, mod.id)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition cursor-pointer"
                                title="Edit lesson content in database"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setShowDeleteConfirmId(les.id)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition cursor-pointer"
                                title="Delete lesson from database"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                  )
                ) : (
                  /* Kids Concepts Rows */
                  currentKidsCourse?.concepts
                    .filter((con) =>
                      searchQuery
                        ? con.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          con.summary.toLowerCase().includes(searchQuery.toLowerCase())
                        : true
                    )
                    .map((con, idx) => (
                      <tr key={con.id} className="hover:bg-slate-850/50 transition">
                        <td className="py-3.5 px-4 font-mono text-slate-500">{con.order || idx + 1}</td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-white text-xs">{con.title}</div>
                          <div className="text-[11px] text-amber-400 font-mono mt-0.5">{con.language.toUpperCase()}</div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-400 max-w-md truncate">
                          {con.summary}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                            {con.id.startsWith('custom-') ? 'Custom Imported' : 'Core Concept'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(con, true)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition cursor-pointer"
                              title="Edit concept content in database"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowDeleteConfirmId(con.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition cursor-pointer"
                              title="Delete concept from database"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
          </div>
        )}

        {/* VIEW 3: APPROVALS & MODERATION QUEUE */}
        {activePortal === 'approvals' && (
          <div className="space-y-6">
            {/* Summary KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
                <div className="text-xs text-slate-400">Total Submissions</div>
                <div className="text-2xl font-black text-white mt-1">{submissions.length}</div>
              </div>
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl">
                <div className="text-xs text-amber-400 font-bold">Pending Review</div>
                <div className="text-2xl font-black text-amber-300 mt-1">
                  {submissions.filter((s) => s.status === 'pending').length}
                </div>
              </div>
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl">
                <div className="text-xs text-emerald-400 font-bold">Approved &amp; Published</div>
                <div className="text-2xl font-black text-emerald-300 mt-1">
                  {submissions.filter((s) => s.status === 'approved').length}
                </div>
              </div>
              <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl">
                <div className="text-xs text-rose-400 font-bold">Rejected</div>
                <div className="text-2xl font-black text-rose-300 mt-1">
                  {submissions.filter((s) => s.status === 'rejected').length}
                </div>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2">
              {(['all', 'pending', 'approved', 'rejected'] as const).map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setSubmissionFilter(filter)}
                  className={`py-1.5 px-3.5 rounded-xl text-xs font-bold capitalize transition cursor-pointer ${
                    submissionFilter === filter
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {filter} ({filter === 'all' ? submissions.length : submissions.filter((s) => s.status === filter).length})
                </button>
              ))}
            </div>

            {/* Submissions Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
              <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs font-bold text-slate-400">
                <span>Community Submissions Queue</span>
                <span className="text-slate-500 font-normal">Review, approve, or reject user contributions</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-mono text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Title &amp; Target</th>
                      <th className="py-3 px-4">Submitted By</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 w-44 text-right">Moderation Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {submissions.length === 0 ||
                    submissions.filter((s) => (submissionFilter === 'all' ? true : s.status === submissionFilter)).length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-500">
                          No submissions found in this category.
                        </td>
                      </tr>
                    ) : (
                      submissions
                        .filter((s) => (submissionFilter === 'all' ? true : s.status === submissionFilter))
                        .filter((s) =>
                          searchQuery
                            ? s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              s.submittedBy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              s.submittedBy.email.toLowerCase().includes(searchQuery.toLowerCase())
                            : true
                        )
                        .map((item) => (
                          <tr key={item.id} className="hover:bg-slate-850/50 transition">
                            <td className="py-3.5 px-4">
                              <span
                                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                                  item.type === 'guide'
                                    ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                                    : item.type === 'problem'
                                    ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                                    : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                }`}
                              >
                                {item.type === 'guide' ? 'Guide' : item.type === 'problem' ? 'Coding Problem' : 'Coding Concept'}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 max-w-xs">
                              <div className="font-bold text-white text-xs">{item.title}</div>
                              <div className="text-[11px] text-slate-400 font-mono mt-0.5 truncate">
                                Target: {item.trackOrLanguage}
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="font-semibold text-slate-200">{item.submittedBy.name}</div>
                              <div className="text-[11px] text-slate-500 font-mono">{item.submittedBy.email}</div>
                            </td>
                            <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">
                              {new Date(item.submittedAt).toLocaleDateString()}
                            </td>
                            <td className="py-3.5 px-4">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                  item.status === 'approved'
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                    : item.status === 'rejected'
                                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                                    : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                }`}
                              >
                                {item.status.toUpperCase()}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setPreviewItem(item)}
                                  className="p-1.5 rounded-lg text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 transition cursor-pointer"
                                  title="Review Submission Content"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>

                                {item.status === 'pending' && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const res = QADatabase.approveSubmission(item.id, currentUser?.email);
                                        if (res.success) {
                                          triggerBanner(`🎉 ${res.message}`);
                                          reloadData();
                                        }
                                      }}
                                      className="py-1 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition flex items-center gap-1 cursor-pointer shadow-xs"
                                      title="Approve and publish to live site"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                      <span>Approve</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => setRejectingItem(item)}
                                      className="py-1 px-2.5 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white font-bold text-[11px] transition flex items-center gap-1 cursor-pointer"
                                      title="Reject with feedback"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                      <span>Reject</span>
                                    </button>
                                  </>
                                )}

                                {item.status !== 'pending' && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      QADatabase.deleteSubmission(item.id);
                                      triggerBanner('🗑 Removed submission from moderation history.');
                                      reloadData();
                                    }}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition cursor-pointer"
                                    title="Delete from history"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 4: ADMIN TEAM & RBAC MANAGEMENT */}
        {activePortal === 'team' && (
          <div className="space-y-6">
            {/* Section 1: Authorized Administrators */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-400" />
                    <span>Authorized Administrator Accounts</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Users with these email addresses automatically receive full Admin privileges upon signing in.
                  </p>
                </div>

                {/* Add Admin Form */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!newAdminEmail.trim()) return;
                    const res = QADatabase.addAdminEmail(newAdminEmail.trim());
                    if (res.success) {
                      triggerBanner(res.message);
                      setNewAdminEmail('');
                      reloadData();
                    } else {
                      triggerBanner(res.message, 'error');
                    }
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="email"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    placeholder="Enter colleague email..."
                    className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 w-64"
                  />
                  <button
                    type="submit"
                    disabled={!newAdminEmail.trim()}
                    className="py-2 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Admin</span>
                  </button>
                </form>
              </div>

              {/* Admin Accounts List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {adminEmails.map((email) => {
                  const isSuper = email.toLowerCase() === 'admin@intelligentqa.io';
                  return (
                    <div
                      key={email}
                      className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-white truncate font-mono">{email}</div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.2 rounded-full mt-1 inline-block ${
                            isSuper
                              ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                              : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          }`}
                        >
                          {isSuper ? 'Primary Super Admin' : 'Course Admin'}
                        </span>
                      </div>

                      {!isSuper && (
                        <button
                          type="button"
                          onClick={() => {
                            const res = QADatabase.removeAdminEmail(email);
                            if (res.success) {
                              triggerBanner(res.message);
                              reloadData();
                            } else {
                              triggerBanner(res.message, 'error');
                            }
                          }}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition cursor-pointer"
                          title="Revoke Admin privileges"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Section 2: Master Security Passcode */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Lock className="w-5 h-5 text-amber-400" />
                    <span>Master Admin Security Passcode</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    This passcode allows authorized administrators to unlock the CMS without pre-registration.
                  </p>
                </div>

                {!isEditingSecret ? (
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingSecret(true);
                      setNewSecretInput(adminSecret);
                    }}
                    className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold border border-slate-700 transition cursor-pointer"
                  >
                    Change Passcode
                  </button>
                ) : null}
              </div>

              {!isEditingSecret ? (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400">Current Passcode:</span>
                    <code className="text-xs font-mono font-bold text-amber-400 px-2.5 py-1 rounded bg-black/40 border border-amber-500/30">
                      {adminSecret}
                    </code>
                  </div>
                  <span className="text-[11px] text-slate-500">Keep this secret and share only with vetted instructors.</span>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const res = QADatabase.setAdminSecret(newSecretInput);
                    if (res.success) {
                      setAdminSecret(newSecretInput);
                      setIsEditingSecret(false);
                      triggerBanner(res.message);
                    } else {
                      triggerBanner(res.message, 'error');
                    }
                  }}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3"
                >
                  <input
                    type="text"
                    value={newSecretInput}
                    onChange={(e) => setNewSecretInput(e.target.value)}
                    placeholder="Enter new master passcode..."
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition cursor-pointer"
                  >
                    Save Passcode
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingSecret(false)}
                    className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
                  >
                    Cancel
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </main>

      {/* PREVIEW SUBMISSION MODAL */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Review User Submission</h3>
                  <p className="text-[11px] text-slate-400">
                    Submitted by {previewItem.submittedBy.name} ({previewItem.submittedBy.email})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="space-y-1">
                <div className="text-[10px] uppercase font-bold text-slate-400">Title</div>
                <div className="text-sm font-bold text-white">{previewItem.title}</div>
              </div>

              <div className="space-y-1">
                <div className="text-[10px] uppercase font-bold text-slate-400">Summary / Description</div>
                <p className="text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800">
                  {previewItem.summary}
                </p>
              </div>

              {previewItem.contentPayload?.code && (
                <div className="space-y-1">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Code Snippet</div>
                  <pre className="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-[11px] text-emerald-400 overflow-x-auto">
                    {previewItem.contentPayload.code}
                  </pre>
                </div>
              )}

              {previewItem.contentPayload?.starterTemplates && (
                <div className="space-y-1">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Starter Templates</div>
                  <pre className="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-[11px] text-cyan-400 overflow-x-auto max-h-48">
                    {JSON.stringify(previewItem.contentPayload.starterTemplates, null, 2)}
                  </pre>
                </div>
              )}

              {previewItem.rejectionReason && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300">
                  <span className="font-bold">Rejection Reason: </span>
                  <span>{previewItem.rejectionReason}</span>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-800 flex items-center justify-between shrink-0 bg-slate-950">
              <span className="text-[11px] text-slate-500">Status: {previewItem.status.toUpperCase()}</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewItem(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold transition cursor-pointer"
                >
                  Close
                </button>
                {previewItem.status === 'pending' && (
                  <button
                    type="button"
                    onClick={() => {
                      const res = QADatabase.approveSubmission(previewItem.id, currentUser?.email);
                      if (res.success) {
                        triggerBanner(`🎉 ${res.message}`);
                        setPreviewItem(null);
                        reloadData();
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Check className="w-4 h-4" />
                    <span>Approve &amp; Publish</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REJECT SUBMISSION MODAL */}
      {rejectingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 text-rose-400">
                <X className="w-4 h-4" />
                <span>Reject Submission</span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  setRejectingItem(null);
                  setRejectionReason('');
                }}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Rejecting &quot;<strong>{rejectingItem.title}</strong>&quot;. Enter optional feedback for the contributor:
            </p>

            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g., Code snippet lacks locator resilience or does not meet formatting standards..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 h-24"
              autoFocus
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setRejectingItem(null);
                  setRejectionReason('');
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const res = QADatabase.rejectSubmission(rejectingItem.id, rejectionReason, currentUser?.email);
                  if (res.success) {
                    triggerBanner(`Submission "${rejectingItem.title}" rejected.`);
                    setRejectingItem(null);
                    setRejectionReason('');
                    reloadData();
                  }
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition cursor-pointer shadow-md"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. EDIT / ADD LESSON MODAL */}
      {showEditModal && editingTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <Edit2 className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {editingTarget.item ? 'Edit Course Content' : 'Create New Course Content'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Saves directly into the persistent course database.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Title *</label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Page Object Model Architecture"
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Module / Category *</label>
                  <input
                    type="text"
                    required
                    value={formModule}
                    onChange={(e) => setFormModule(e.target.value)}
                    placeholder="e.g. Advanced Framework Design"
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Concise Summary</label>
                <input
                  type="text"
                  value={formSummary}
                  onChange={(e) => setFormSummary(e.target.value)}
                  placeholder="Short explanation of what this lesson teaches"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Detailed Walkthrough / Overview</label>
                <textarea
                  rows={4}
                  value={formOverview}
                  onChange={(e) => setFormOverview(e.target.value)}
                  placeholder="In-depth conceptual explanation, architecture mechanisms, and design patterns..."
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500 leading-relaxed"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Starter Code (Pre-loaded into Online Compiler)</label>
                <textarea
                  rows={5}
                  value={formStarterCode}
                  onChange={(e) => setFormStarterCode(e.target.value)}
                  placeholder="// Code snippet loaded in compiler"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-emerald-300 focus:outline-none focus:border-purple-500 leading-relaxed"
                  spellCheck={false}
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Best Practices (1 per line)</label>
                <textarea
                  rows={3}
                  value={formBestPractices}
                  onChange={(e) => setFormBestPractices(e.target.value)}
                  placeholder="Encapsulate locators in private fields\nNever hardcode sleep pauses in test automation"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500 leading-relaxed"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="py-2.5 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-6 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition shadow-md cursor-pointer"
                >
                  Save to Database
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. BATCH IMPORT MODAL */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <UploadCloud className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">
                  Batch Import to {activePortal === 'kids' ? selectedKidsLang.toUpperCase() : selectedSdetTrackId}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Paste JSON array of lessons or concepts with <code>title</code>, <code>summary</code>, <code>overview</code>, and <code>starterCode</code>.
            </p>

            <textarea
              rows={8}
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              placeholder='[
  {
    "title": "Lesson Title",
    "summary": "Short summary",
    "overview": "Detailed explanation",
    "starterCode": "console.log(\"Hello\");"
  }
]'
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            />

            {importStatus && (
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                {importStatus}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBatchImport}
                className="py-2 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md cursor-pointer"
              >
                Upload &amp; Save to Database
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. CONFIRM DELETE DIALOGUE */}
      {showDeleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm p-6 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 mx-auto flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white">Delete Course Content?</h4>
              <p className="text-xs text-slate-400">
                This item will be permanently removed from the course database.
              </p>
            </div>
            <div className="flex items-center gap-2 justify-center pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirmId(null)}
                className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteItem(showDeleteConfirmId, activePortal === 'kids')}
                className="py-2 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
