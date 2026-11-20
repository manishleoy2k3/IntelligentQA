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
import { CodingProblem, DEFAULT_CODING_PROBLEMS, getStoredCustomProblems, saveCustomProblem, deleteCustomProblem } from '@/lib/coding-problems';
import { getLessonDoc, LessonDoc } from '@/lib/qa-learning-docs';
import { checkGuideDuplicate } from '@/lib/guide-duplicate-detector';


export default function CourseCMSPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [activePortal, setActivePortal] = useState<'sdet' | 'problems' | 'approvals' | 'team'>('sdet');

  // Selected Course
  const [selectedSdetTrackId, setSelectedSdetTrackId] = useState<string>('selenium-java');

  // Loaded Course Content from Database
  const [sdetTracks, setSdetTracks] = useState<Track[]>([]);

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

  // Enhanced Lesson Guide Fields
  const [formWhyItMatters, setFormWhyItMatters] = useState('');
  const [formArchFlow, setFormArchFlow] = useState('');
  const [formProductionCode, setFormProductionCode] = useState('');
  const [formInterviewQuestion, setFormInterviewQuestion] = useState('');
  const [formInterviewAnswer, setFormInterviewAnswer] = useState('');
  const [formActiveTab, setFormActiveTab] = useState<'basics' | 'guide' | 'code'>('basics');

  // Coding Problems State
  const [allCodingProblems, setAllCodingProblems] = useState<CodingProblem[]>([]);
  const [showProblemModal, setShowProblemModal] = useState(false);
  const [editingProblem, setEditingProblem] = useState<CodingProblem | null>(null);
  const [problemTitle, setProblemTitle] = useState('');
  const [problemDifficulty, setProblemDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Easy');
  const [problemCategory, setProblemCategory] = useState('Strings & Arrays');
  const [problemDescription, setProblemDescription] = useState('');
  const [problemExampleInput, setProblemExampleInput] = useState('');
  const [problemExampleOutput, setProblemExampleOutput] = useState('');
  const [problemConstraints, setProblemConstraints] = useState('');
  const [problemStarterJava, setProblemStarterJava] = useState('');
  const [problemStarterPython, setProblemStarterPython] = useState('');
  const [problemStarterTs, setProblemStarterTs] = useState('');
  const [showDeleteProblemId, setShowDeleteProblemId] = useState<string | null>(null);
  const [isSavingToDb, setIsSavingToDb] = useState(false);

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
    const subs = QADatabase.getAllSubmissions();
    setSubmissions(subs);
    const admins = QADatabase.getAdminEmails();
    setAdminEmails(admins);
    setAdminSecret(QADatabase.getAdminSecret());

    // Load Coding Problems (combining custom problems with default library)
    const customProblems = getStoredCustomProblems();
    const problemIds = new Set(customProblems.map(p => p.id));
    const mergedProblems = [...customProblems, ...DEFAULT_CODING_PROBLEMS.filter(p => !problemIds.has(p.id))];
    setAllCodingProblems(mergedProblems);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const u = QADatabase.getCurrentUser();
      setCurrentUser(u);
      setIsAdmin(QADatabase.isAdmin(u));
      reloadData();

      // Proactively sync latest database curriculum from server API
      QADatabase.syncCurriculumFromDatabase().then((res) => {
        if (res.success) {
          reloadData();
        }
      });

      const handleAuthOrRole = () => {
        const updated = QADatabase.getCurrentUser();
        setCurrentUser(updated);
        setIsAdmin(QADatabase.isAdmin(updated));
        reloadData();
      };

      window.addEventListener('intelligentqa_auth_changed', handleAuthOrRole);
      window.addEventListener('intelligentqa_role_changed', handleAuthOrRole);
      window.addEventListener('intelligentqa_curriculum_updated', reloadData);
      window.addEventListener('intelligentqa_moderation_updated', reloadData);
      window.addEventListener('intelligentqa_admin_list_changed', reloadData);
      return () => {
        window.removeEventListener('intelligentqa_auth_changed', handleAuthOrRole);
        window.removeEventListener('intelligentqa_role_changed', handleAuthOrRole);
        window.removeEventListener('intelligentqa_curriculum_updated', reloadData);
        window.removeEventListener('intelligentqa_moderation_updated', reloadData);
        window.removeEventListener('intelligentqa_admin_list_changed', reloadData);
      };
    }
  }, []);

  // Open Edit / Add Modal
  const handleOpenAdd = () => {
    setEditingTarget({
      courseId: selectedSdetTrackId,
      item: null,
    });
    setFormTitle('');
    setFormModule('Automation Basics');
    setFormSummary('');
    setFormOverview('');
    setFormStarterCode('// Automation starter template');
    setFormSolutionCode('');
    setFormBestPractices('');
    setFormWhyItMatters('Eliminates slow, repetitive manual test validation and enforces regression safety.');
    setFormArchFlow('Test Script <== WebDriver / WebSocket ==> Browser Engine');
    setFormProductionCode('// Production-grade test implementation with assertions');
    setFormInterviewQuestion('How do you design a maintainable automation suite for this concept?');
    setFormInterviewAnswer('By decoupling test scenarios from locators and wrapping actions into reusable Page Objects.');
    setFormActiveTab('basics');
    setShowEditModal(true);
  };

  const handleOpenEdit = (item: any, moduleId?: string) => {
    setEditingTarget({
      courseId: selectedSdetTrackId,
      moduleId,
      item,
    });
    setFormTitle(item.title || '');
    setFormModule(item.module || moduleId || 'General');
    setFormSummary(item.summary || item.description || '');

    // Pull detailed doc from repository/database to pre-fill guide fields
    const existingDoc = getLessonDoc(item.id, selectedSdetTrackId, item.title, item.description);

    setFormOverview(existingDoc.overview || item.overview || item.exercise || '');
    setFormStarterCode(item.starterCode || item.challenge?.starterCode?.typescript || item.challenge?.starterCode?.java || item.code || '// Automation starter template');
    setFormSolutionCode(item.solutionCode || item.challenge?.solutionCode?.typescript || item.challenge?.solutionCode?.java || '');
    setFormBestPractices(
      Array.isArray(existingDoc.bestPractices)
        ? existingDoc.bestPractices.join('\n')
        : Array.isArray(item.bestPractices)
        ? item.bestPractices.join('\n')
        : ''
    );
    setFormWhyItMatters(existingDoc.whyItMattersForManualQA || 'Automates manual testing verification steps.');
    setFormArchFlow(existingDoc.architectureUnderTheHood?.flowOrMechanism || 'Test Execution Engine <==> Target Browser / API');
    setFormProductionCode(existingDoc.productionCodeExample?.code || item.starterCode || '');
    setFormInterviewQuestion(existingDoc.interviewQnA?.question || 'How is this pattern implemented in production?');
    setFormInterviewAnswer(existingDoc.interviewQnA?.answer || 'By applying industry standard locator strategies and assertions.');
    setFormActiveTab('basics');
    setShowEditModal(true);
  };

  // Save Lesson / Concept into Database
  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTarget || !formTitle.trim()) return;


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

      // Construct comprehensive LessonDoc to save alongside lesson metadata
      const lessonDocPayload: Partial<LessonDoc> = {
        title: lesson.title,
        category: `${trackId} • ${formModule.trim() || 'Core Curriculum'}`,
        tagline: formSummary.trim() || lesson.title,
        overview: formOverview.trim(),
        whyItMattersForManualQA: formWhyItMatters.trim() || 'Accelerates manual test verification and prevents regression issues.',
        architectureUnderTheHood: {
          title: 'Architecture & Engine Mechanisms',
          flowOrMechanism: formArchFlow.trim() || 'Test Script <== Direct Protocol ==> Target System',
          keyTakeaway: 'Deterministic execution with zero arbitrary sleeps and resilient selectors.',
        },
        stepByStepGuide: [
          {
            stepNumber: 1,
            title: 'Implementation & Configuration',
            summary: formSummary.trim(),
            explanation: formOverview.trim(),
            proTip: 'Always verify actions using auto-retrying assertions.',
          }
        ],
        manualToAutomatedBridge: [
          {
            manualAction: 'Perform user steps manually in browser / tool',
            automatedApproach: 'Script automated assertions using page locators',
            whyItMatters: 'Guarantees continuous regression feedback.',
          }
        ],
        productionCodeExample: {
          title: 'Production Automation Code Example',
          description: 'Industrial-grade implementation adhering to design patterns.',
          language: trackId.includes('ts') ? 'typescript' : 'java',
          code: formProductionCode.trim() || formStarterCode.trim(),
          annotations: [],
        },
        bestPractices: formBestPractices.split('\n').map(s => s.trim()).filter(Boolean),
        antiPatterns: ['Hardcoding Thread.sleep() or arbitrary time pauses'],
        interviewQnA: {
          question: formInterviewQuestion.trim() || 'How do you structure this in an automation framework?',
          answer: formInterviewAnswer.trim() || 'By abstracting locators and assertions into reusable components.',
        },
      };

      setIsSavingToDb(true);
      QADatabase.saveLessonToDatabase(trackId, moduleId, lesson, lessonDocPayload).then(() => {
        setIsSavingToDb(false);
        triggerBanner(`✅ Published "${lesson.title}" to Central Database for all users.`);
        reloadData();
      }).catch((e) => {
        setIsSavingToDb(false);
        triggerBanner(`✅ Saved lesson locally and published to database.`);
        reloadData();
      });

    setShowEditModal(false);
  };

  // Delete Lesson / Concept from Database
  const handleDeleteItem = (id: string) => {
    QADatabase.deleteLessonFromDatabase(selectedSdetTrackId, id);
    triggerBanner(`🗑 Lesson removed from ${selectedSdetTrackId} track database for all users.`);
    reloadData();
    setShowDeleteConfirmId(null);
  };

  // Open Add Coding Problem Modal
  const handleOpenAddProblem = () => {
    setEditingProblem(null);
    setProblemTitle('');
    setProblemDifficulty('Easy');
    setProblemCategory('Strings & Arrays');
    setProblemDescription('');
    setProblemExampleInput('s = "hello"');
    setProblemExampleOutput('"olleh"');
    setProblemConstraints('1 <= s.length <= 10^5');
    setProblemStarterJava('public class Solution {\n    public static void main(String[] args) {\n        // Solution\n    }\n}');
    setProblemStarterPython('def solve():\n    pass\n\nif __name__ == "__main__":\n    solve()');
    setProblemStarterTs('function solve(): void {\n    // Solution\n}\nsolve();');
    setShowProblemModal(true);
  };

  // Open Edit Coding Problem Modal
  const handleOpenEditProblem = (prob: CodingProblem) => {
    setEditingProblem(prob);
    setProblemTitle(prob.title);
    setProblemDifficulty(prob.difficulty);
    setProblemCategory(prob.category);
    setProblemDescription(prob.description);
    setProblemExampleInput(prob.examples?.[0]?.input || '');
    setProblemExampleOutput(prob.examples?.[0]?.output || '');
    setProblemConstraints(prob.constraints?.join('\n') || '');
    setProblemStarterJava(prob.starterTemplates?.java || '');
    setProblemStarterPython(prob.starterTemplates?.python || '');
    setProblemStarterTs(prob.starterTemplates?.typescript || prob.starterTemplates?.javascript || '');
    setShowProblemModal(true);
  };

  // Save Coding Problem to Database
  const handleSaveProblem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!problemTitle.trim()) return;

    const probId = editingProblem?.id || `prob-${Date.now()}`;
    const newProblem: CodingProblem = {
      id: probId,
      title: problemTitle.trim(),
      difficulty: problemDifficulty,
      category: problemCategory.trim() || 'General',
      description: problemDescription.trim(),
      constraints: problemConstraints.split('\n').map(s => s.trim()).filter(Boolean),
      examples: [
        {
          input: problemExampleInput.trim() || 'sample input',
          output: problemExampleOutput.trim() || 'sample output',
        }
      ],
      starterTemplates: {
        java: problemStarterJava.trim() || 'public class Solution {\n    public static void main(String[] args) {\n    }\n}',
        python: problemStarterPython.trim() || 'def solve():\n    pass',
        typescript: problemStarterTs.trim() || 'function solve(): void {\n}',
        javascript: problemStarterTs.trim() || 'function solve() {\n}',
        csharp: '// C# solution template',
      },
      isCustom: true,
    };

    setIsSavingToDb(true);
    QADatabase.saveCodingProblemToDatabase(newProblem).then(() => {
      setIsSavingToDb(false);
      triggerBanner(`✅ Coding Problem "${newProblem.title}" saved to Database for all users.`);
      reloadData();
      setShowProblemModal(false);
    }).catch(() => {
      setIsSavingToDb(false);
      triggerBanner(`✅ Problem saved to Database.`);
      reloadData();
      setShowProblemModal(false);
    });
  };

  // Delete Coding Problem from Database
  const handleDeleteProblem = (probId: string) => {
    deleteCustomProblem(probId);
    QADatabase.deleteCodingProblemFromDatabase(probId);
    triggerBanner(`🗑 Problem removed from Database for all users.`);
    reloadData();
    setShowDeleteProblemId(null);
  };

  // Batch Import JSON / CSV into Database
  const handleBatchImport = () => {
    if (!importJsonText.trim()) return;
    try {
      const parsed = JSON.parse(importJsonText);
      const items = Array.isArray(parsed) ? parsed : [parsed];


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
    exportData = sdetTracks.find((t) => t.id === selectedSdetTrackId);
    filename = `${selectedSdetTrackId}_track_database_export.json`;

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
            <Link
              href="/admin"
              className="py-1.5 px-3 rounded-xl bg-purple-600/30 hover:bg-purple-600/40 text-purple-300 text-xs font-bold border border-purple-500/40 transition flex items-center gap-1.5 shadow-sm"
              title="Go to unified Admin Dashboard"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Dashboard</span>
            </Link>

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

            {activePortal === 'problems' ? (
              <button
                type="button"
                onClick={() => handleOpenAddProblem()}
                className="py-1.5 px-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 shadow-md transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Problem</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleOpenAdd()}
                className="py-1.5 px-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 shadow-md transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Lesson</span>
              </button>
            )}
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
              onClick={() => setActivePortal('problems')}
              className={`py-2 px-4 rounded-xl text-xs font-extrabold transition flex items-center gap-2 cursor-pointer ${
                activePortal === 'problems'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span>Coding Library ({allCodingProblems.length})</span>
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
        {activePortal === 'sdet' && (
          <div className="space-y-6">

        {/* Course Selector Sub-Tabs */}
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

        {/* Selected Course Overview Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-900/60 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-slate-400">Active Course:</span>
              <span className="text-sm font-bold text-white">
                {currentSdetTrack?.title}
              </span>
            </div>
            <p className="text-xs text-slate-400 line-clamp-2 max-w-2xl">
              {currentSdetTrack?.description}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => {
                QADatabase.resetTracksToDefault();
                triggerBanner('🔄 Reset SDET tracks to factory defaults.');
                reloadData();
              }}
              className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-slate-200 text-xs font-semibold transition flex items-center gap-1.5"
              title="Reset course contents back to original template"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Defaults</span>
            </button>

            <Link
              href={`/tracks/${selectedSdetTrackId}`}
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
            <span>Course Content Repository ({currentSdetTrack?.totalLessons} Lessons)</span>
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
                {currentSdetTrack?.modules.flatMap((mod) =>
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
                                onClick={() => handleOpenEdit(les, mod.id)}
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
                  )}
              </tbody>
            </table>
          </div>
        </div>
          </div>
        )}

        {/* VIEW: CODING PROBLEMS MANAGEMENT */}
        {activePortal === 'problems' && (
          <div className="space-y-6">
            {/* Overview Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-900/60 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-slate-400">Database:</span>
                  <span className="text-sm font-bold text-white">Centralized Coding Problems Library</span>
                </div>
                <p className="text-xs text-slate-400 max-w-2xl">
                  Manage coding challenges, interview problems, test templates, and starter solutions across Java, Python, and TypeScript. All changes publish immediately to every student.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => handleOpenAddProblem()}
                  className="py-1.5 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Problem</span>
                </button>
                <Link
                  href="/sandbox/code/problems"
                  target="_blank"
                  className="py-1.5 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 border border-slate-700"
                >
                  <Eye className="w-3.5 h-3.5 text-blue-400" />
                  <span>View Student Page</span>
                </Link>
              </div>
            </div>

            {/* Problems Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
              <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs font-bold text-slate-400">
                <span>Coding Problem Repository ({allCodingProblems.length} Problems)</span>
                <span className="text-emerald-400 font-mono text-[11px] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Synced to Database
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-mono text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4 w-12">#</th>
                      <th className="py-3 px-4">Title &amp; Category</th>
                      <th className="py-3 px-4 w-28">Difficulty</th>
                      <th className="py-3 px-4">Description</th>
                      <th className="py-3 px-4 w-28">Origin</th>
                      <th className="py-3 px-4 w-28 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {allCodingProblems
                      .filter((p) =>
                        searchQuery
                          ? p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            p.description.toLowerCase().includes(searchQuery.toLowerCase())
                          : true
                      )
                      .map((prob, idx) => (
                        <tr key={prob.id} className="hover:bg-slate-850/50 transition">
                          <td className="py-3.5 px-4 font-mono text-slate-500">{idx + 1}</td>
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-white text-xs">{prob.title}</div>
                            <div className="text-[11px] text-emerald-400 font-mono mt-0.5">{prob.category}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                                prob.difficulty === 'Easy'
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : prob.difficulty === 'Medium'
                                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              }`}
                            >
                              {prob.difficulty}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-400 max-w-sm truncate">
                            {prob.description}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                              {prob.isCustom ? 'Custom DB' : 'Curated'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenEditProblem(prob)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition cursor-pointer"
                                title="Edit problem in database"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setShowDeleteProblemId(prob.id)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition cursor-pointer"
                                title="Delete problem from database"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
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
                              {item.type === 'guide' && (() => {
                                const dup = checkGuideDuplicate({
                                  title: item.title,
                                  summary: item.summary,
                                  overview: item.contentPayload?.overview,
                                  code: item.contentPayload?.codeSnippets?.[0]?.code || item.contentPayload?.code,
                                  trackId: item.trackOrLanguage,
                                });
                                return (
                                  <div className="mt-1">
                                    {dup.status === 'unique' ? (
                                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                        Duplicate: Clean (0% match)
                                      </span>
                                    ) : dup.status === 'potential_duplicate' ? (
                                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                                        Duplicate Warning: {dup.similarityScore}%
                                      </span>
                                    ) : (
                                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30">
                                        Duplicate Risk: {dup.similarityScore}%
                                      </span>
                                    )}
                                  </div>
                                );
                              })()}
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

            {/* Modal Internal Tabs */}
            <div className="px-5 pt-3 border-b border-slate-800 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFormActiveTab('basics')}
                className={`pb-2 px-3 text-xs font-bold transition border-b-2 ${
                  formActiveTab === 'basics'
                    ? 'border-purple-500 text-white'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                1. Lesson Metadata
              </button>
              <button
                type="button"
                onClick={() => setFormActiveTab('guide')}
                className={`pb-2 px-3 text-xs font-bold transition border-b-2 ${
                  formActiveTab === 'guide'
                    ? 'border-purple-500 text-white'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                2. Comprehensive Guide &amp; Architecture
              </button>
              <button
                type="button"
                onClick={() => setFormActiveTab('code')}
                className={`pb-2 px-3 text-xs font-bold transition border-b-2 ${
                  formActiveTab === 'code'
                    ? 'border-purple-500 text-white'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                3. Production Code &amp; Solutions
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="p-5 overflow-y-auto space-y-4 text-xs max-h-[70vh]">
              {formActiveTab === 'basics' && (
                <div className="space-y-4">
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
                    <label className="font-semibold text-slate-300">Concise Summary / Tagline</label>
                    <input
                      type="text"
                      value={formSummary}
                      onChange={(e) => setFormSummary(e.target.value)}
                      placeholder="Short explanation of what this lesson teaches"
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-300">Detailed Walkthrough / Concept Overview</label>
                    <textarea
                      rows={5}
                      value={formOverview}
                      onChange={(e) => setFormOverview(e.target.value)}
                      placeholder="In-depth conceptual explanation, design patterns, and engineering principles..."
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500 leading-relaxed"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-300">Why It Matters for Manual QA (Career Transition)</label>
                    <textarea
                      rows={3}
                      value={formWhyItMatters}
                      onChange={(e) => setFormWhyItMatters(e.target.value)}
                      placeholder="Explain how this translates manual QA intuition into automated SDET code..."
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500 leading-relaxed"
                    />
                  </div>
                </div>
              )}

              {formActiveTab === 'guide' && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-300">Under the Hood Architecture (Mechanism / Data Flow)</label>
                    <textarea
                      rows={3}
                      value={formArchFlow}
                      onChange={(e) => setFormArchFlow(e.target.value)}
                      placeholder="e.g. Test Script (Node.js) <== WebSocket (CDP) ==> Browser Rendering Engine"
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-cyan-300 focus:outline-none focus:border-purple-500 leading-relaxed"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-300">Best Practices (1 per line)</label>
                    <textarea
                      rows={4}
                      value={formBestPractices}
                      onChange={(e) => setFormBestPractices(e.target.value)}
                      placeholder="Encapsulate locators in private fields\nNever hardcode sleep pauses in test automation\nFavor web-first auto-retrying assertions"
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500 leading-relaxed"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-300">SDET Interview Question</label>
                      <input
                        type="text"
                        value={formInterviewQuestion}
                        onChange={(e) => setFormInterviewQuestion(e.target.value)}
                        placeholder="e.g. How do you handle flaky dynamic elements in CI/CD?"
                        className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-300">Interview Model Answer</label>
                      <textarea
                        rows={2}
                        value={formInterviewAnswer}
                        onChange={(e) => setFormInterviewAnswer(e.target.value)}
                        placeholder="Model architectural answer expected in SDET interviews..."
                        className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {formActiveTab === 'code' && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-300">Production Code Example (Guide Tab Snippet)</label>
                    <textarea
                      rows={6}
                      value={formProductionCode}
                      onChange={(e) => setFormProductionCode(e.target.value)}
                      placeholder="// Robust, production-grade test automation implementation"
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-emerald-300 focus:outline-none focus:border-purple-500 leading-relaxed"
                      spellCheck={false}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-300">Starter Code (Pre-loaded into Online Compiler)</label>
                    <textarea
                      rows={5}
                      value={formStarterCode}
                      onChange={(e) => setFormStarterCode(e.target.value)}
                      placeholder="// Code template loaded in interactive compiler workspace"
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-amber-300 focus:outline-none focus:border-purple-500 leading-relaxed"
                      spellCheck={false}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-300">Solution Code (Unlocked on demand)</label>
                    <textarea
                      rows={5}
                      value={formSolutionCode}
                      onChange={(e) => setFormSolutionCode(e.target.value)}
                      placeholder="// Complete passing solution code"
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-blue-300 focus:outline-none focus:border-purple-500 leading-relaxed"
                      spellCheck={false}
                    />
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                <span className="text-[11px] text-slate-400">
                  Published to server database &amp; synchronized across all learners.
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="py-2.5 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingToDb}
                    className="py-2.5 px-6 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold transition shadow-md cursor-pointer flex items-center gap-1.5"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>{isSavingToDb ? 'Publishing...' : 'Save & Publish to Database'}</span>
                  </button>
                </div>
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
                  Batch Import to {selectedSdetTrackId}
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

      {/* CODING PROBLEM EDIT / CREATE MODAL */}
      {showProblemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                  <Code2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {editingProblem ? 'Edit Coding Problem' : 'Create New Coding Problem'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Saves directly to centralized database for all platform users.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowProblemModal(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProblem} className="p-5 overflow-y-auto space-y-4 text-xs max-h-[70vh]">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="font-semibold text-slate-300">Problem Title *</label>
                  <input
                    type="text"
                    required
                    value={problemTitle}
                    onChange={(e) => setProblemTitle(e.target.value)}
                    placeholder="e.g. Reverse Linked List / Validate Log Structure"
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Difficulty</label>
                  <select
                    value={problemDifficulty}
                    onChange={(e) => setProblemDifficulty(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Category</label>
                <input
                  type="text"
                  value={problemCategory}
                  onChange={(e) => setProblemCategory(e.target.value)}
                  placeholder="e.g. Strings & HashMaps, Arrays, Dynamic Programming"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Problem Description *</label>
                <textarea
                  rows={4}
                  required
                  value={problemDescription}
                  onChange={(e) => setProblemDescription(e.target.value)}
                  placeholder="Detailed problem description, real-world SDET context, and requirements..."
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500 leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Example Input</label>
                  <input
                    type="text"
                    value={problemExampleInput}
                    onChange={(e) => setProblemExampleInput(e.target.value)}
                    placeholder="e.g. nums = [2, 7, 11, 15], target = 9"
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Example Output</label>
                  <input
                    type="text"
                    value={problemExampleOutput}
                    onChange={(e) => setProblemExampleOutput(e.target.value)}
                    placeholder="e.g. [0, 1]"
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Constraints (1 per line)</label>
                <textarea
                  rows={2}
                  value={problemConstraints}
                  onChange={(e) => setProblemConstraints(e.target.value)}
                  placeholder="2 <= nums.length <= 10^4\nOnly one valid answer exists"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Java Starter Template</label>
                <textarea
                  rows={4}
                  value={problemStarterJava}
                  onChange={(e) => setProblemStarterJava(e.target.value)}
                  placeholder="public class Solution {\n    public static void main(String[] args) {\n    }\n}"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-emerald-300 focus:outline-none focus:border-emerald-500"
                  spellCheck={false}
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Python Starter Template</label>
                <textarea
                  rows={4}
                  value={problemStarterPython}
                  onChange={(e) => setProblemStarterPython(e.target.value)}
                  placeholder="def solve():\n    pass"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-emerald-300 focus:outline-none focus:border-emerald-500"
                  spellCheck={false}
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                <span className="text-[11px] text-slate-400">
                  Published to server database &amp; synchronized across all learners.
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowProblemModal(false)}
                    className="py-2.5 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingToDb}
                    className="py-2.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold transition shadow-md cursor-pointer flex items-center gap-1.5"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>{isSavingToDb ? 'Saving...' : 'Save to Database'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE CODING PROBLEM DIALOGUE */}
      {showDeleteProblemId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm p-6 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 mx-auto flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white">Delete Coding Problem?</h4>
              <p className="text-xs text-slate-400">
                This problem will be permanently deleted from the database for all users.
              </p>
            </div>
            <div className="flex items-center gap-2 justify-center pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteProblemId(null)}
                className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteProblem(showDeleteProblemId)}
                className="py-2 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer"
              >
                Confirm Delete
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
                onClick={() => handleDeleteItem(showDeleteConfirmId)}
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
