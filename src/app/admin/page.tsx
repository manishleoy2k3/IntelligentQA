'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  ShieldCheck,
  BookOpen,
  Terminal,
  Bot,
  HelpCircle,
  Users,
  Plus,
  Edit2,
  Trash2,
  RotateCcw,
  Search,
  CheckCircle2,
  AlertCircle,
  Eye,
  Check,
  X,
  FileText,
  Layers,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Laptop,
  Code2,
  Lock,
  Download,
  UploadCloud,
  FileSpreadsheet,
  ChevronRight,
  Copy,
  Clock,
} from 'lucide-react';
import { QADatabase } from '@/lib/qa-db';
import { Track, Lesson, ModerationItem, UserProfile, InterviewQuestionItem } from '@/types/qa';
import {
  CodingProblem,
  DEFAULT_CODING_PROBLEMS,
  getAllProblems,
  saveCustomProblem,
  deleteCustomProblem,
} from '@/lib/coding-problems';
import {
  AgentConfigItem,
  DEFAULT_AGENT_CONFIGS,
  getStoredAgentConfigs,
  saveAgentConfig,
  deleteAgentConfig,
  resetAgentConfigs,
} from '@/lib/qa-agents-config';
import {
  getAllInterviewQuestions,
  saveInterviewQuestion,
  deleteInterviewQuestion,
  resetInterviewQuestions,
} from '@/lib/interview-questions-bank';
import { getLessonDoc, LessonDoc } from '@/lib/qa-learning-docs';
import FormattedInterviewAnswer from '@/components/ui/formatted-interview-answer';
import { checkGuideDuplicate, DuplicateCheckReport } from '@/lib/guide-duplicate-detector';

type AdminSection = 'overview' | 'course' | 'labs' | 'agents' | 'interviews' | 'team' | 'approvals';

function AdminDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawSection = searchParams.get('section');
  const activeSection: AdminSection =
    rawSection === 'course' ||
    rawSection === 'labs' ||
    rawSection === 'agents' ||
    rawSection === 'interviews' ||
    rawSection === 'team' ||
    rawSection === 'approvals'
      ? rawSection
      : 'overview';

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [gatePasscode, setGatePasscode] = useState<string>('');
  const [gateError, setGateError] = useState<string | null>(null);

  // Data Stores
  const [tracks, setTracks] = useState<Track[]>([]);
  const [selectedTrackId, setSelectedTrackId] = useState<string>('selenium-java');
  const [codingProblems, setCodingProblems] = useState<CodingProblem[]>([]);
  const [agentConfigs, setAgentConfigs] = useState<AgentConfigItem[]>([]);
  const [interviewQuestions, setInterviewQuestions] = useState<InterviewQuestionItem[]>([]);
  const [adminEmails, setAdminEmails] = useState<string[]>([]);
  const [adminSecret, setAdminSecret] = useState<string>('');
  const [submissions, setSubmissions] = useState<ModerationItem[]>([]);
  const [approvalsFilter, setApprovalsFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [previewSubmission, setPreviewSubmission] = useState<ModerationItem | null>(null);
  const [rejectingSubmission, setRejectingSubmission] = useState<ModerationItem | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState<string>('');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('All');
  const [techFilter, setTechFilter] = useState<string>('All');
  const [labsSubTab, setLabsSubTab] = useState<'coding' | 'web' | 'api'>('coding');

  // Banner Toast
  const [bannerMsg, setBannerMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const triggerBanner = (text: string, type: 'success' | 'error' = 'success') => {
    setBannerMsg({ text, type });
    setTimeout(() => setBannerMsg(null), 4000);
  };

  // Modals state
  // 1. Course Modals
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [editingLessonTarget, setEditingLessonTarget] = useState<{
    trackId: string;
    moduleId: string;
    lesson: Lesson | null;
  } | null>(null);
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonModule, setLessonModule] = useState('Automation Basics');
  const [lessonDuration, setLessonDuration] = useState(20);
  const [lessonSummary, setLessonSummary] = useState('');
  const [lessonOverview, setLessonOverview] = useState('');
  const [lessonStarterCode, setLessonStarterCode] = useState('');
  const [lessonSolutionCode, setLessonSolutionCode] = useState('');
  const [lessonBestPractices, setLessonBestPractices] = useState('');
  const [lessonWhyItMatters, setLessonWhyItMatters] = useState('');
  const [lessonArchFlow, setLessonArchFlow] = useState('');
  const [lessonInterviewQ, setLessonInterviewQ] = useState('');
  const [lessonInterviewA, setLessonInterviewA] = useState('');

  // 2. Practice Lab Modals
  const [showProblemModal, setShowProblemModal] = useState(false);
  const [editingProblem, setEditingProblem] = useState<CodingProblem | null>(null);
  const [problemTitle, setProblemTitle] = useState('');
  const [problemDifficulty, setProblemDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Easy');
  const [problemCategory, setProblemCategory] = useState('Strings & Arrays');
  const [problemDesc, setProblemDesc] = useState('');
  const [problemInput, setProblemInput] = useState('');
  const [problemOutput, setProblemOutput] = useState('');
  const [problemConstraints, setProblemConstraints] = useState('');
  const [problemJava, setProblemJava] = useState('');
  const [problemPython, setProblemPython] = useState('');
  const [problemTs, setProblemTs] = useState('');

  // 3. AI Agent Modals
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [editingAgent, setEditingAgent] = useState<AgentConfigItem | null>(null);
  const [agentTitle, setAgentTitle] = useState('');
  const [agentTabName, setAgentTabName] = useState('');
  const [agentBadge, setAgentBadge] = useState('');
  const [agentDescription, setAgentDescription] = useState('');
  const [agentDefaultPrompt, setAgentDefaultPrompt] = useState('');
  const [agentSystemPrompt, setAgentSystemPrompt] = useState('');

  // 4. Interview Question Modals
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<InterviewQuestionItem | null>(null);
  const [iqQuestion, setIqQuestion] = useState('');
  const [iqTech, setIqTech] = useState<'Playwright' | 'Selenium' | 'Java' | 'TypeScript' | 'API Testing' | 'AI & LLM' | 'Framework Design'>('Playwright');
  const [iqDifficulty, setIqDifficulty] = useState<'Junior' | 'Mid' | 'Senior' | 'Architect'>('Senior');
  const [iqTopic, setIqTopic] = useState('Enterprise Architecture');
  const [iqAnswer, setIqAnswer] = useState('');
  const [iqCode, setIqCode] = useState('');
  const [iqBest, setIqBest] = useState('');
  const [iqPitfall, setIqPitfall] = useState('');

  // Delete Confirm Dialog state
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: 'lesson' | 'problem' | 'agent' | 'interview' | 'track';
    id: string;
    extraId?: string;
    title: string;
  } | null>(null);

  // New admin email state
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newPasscodeInput, setNewPasscodeInput] = useState('');
  const [isEditingPasscode, setIsEditingPasscode] = useState(false);

  // Reload all stores
  const reloadData = () => {
    setTracks(QADatabase.getTracks());
    setCodingProblems(getAllProblems());
    setAgentConfigs(getStoredAgentConfigs());
    setInterviewQuestions(getAllInterviewQuestions());
    setAdminEmails(QADatabase.getAdminEmails());
    setAdminSecret(QADatabase.getAdminSecret());
    setSubmissions(QADatabase.getAllSubmissions());
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const u = QADatabase.getCurrentUser();
      setCurrentUser(u);
      setIsAdmin(QADatabase.isAdmin(u));
      reloadData();

      const syncHandler = () => {
        const updated = QADatabase.getCurrentUser();
        setCurrentUser(updated);
        setIsAdmin(QADatabase.isAdmin(updated));
        reloadData();
      };

      window.addEventListener('intelligentqa_auth_changed', syncHandler);
      window.addEventListener('intelligentqa_role_changed', syncHandler);
      window.addEventListener('intelligentqa_curriculum_updated', reloadData);
      window.addEventListener('intelligentqa_problems_changed', reloadData);
      window.addEventListener('intelligentqa_agent_configs_changed', reloadData);
      window.addEventListener('intelligentqa_interview_questions_changed', reloadData);
      window.addEventListener('intelligentqa_admin_list_changed', reloadData);
      window.addEventListener('intelligentqa_moderation_updated', reloadData);

      return () => {
        window.removeEventListener('intelligentqa_auth_changed', syncHandler);
        window.removeEventListener('intelligentqa_role_changed', syncHandler);
        window.removeEventListener('intelligentqa_curriculum_updated', reloadData);
        window.removeEventListener('intelligentqa_problems_changed', reloadData);
        window.removeEventListener('intelligentqa_agent_configs_changed', reloadData);
        window.removeEventListener('intelligentqa_interview_questions_changed', reloadData);
        window.removeEventListener('intelligentqa_admin_list_changed', reloadData);
        window.removeEventListener('intelligentqa_moderation_updated', reloadData);
      };
    }
  }, []);

  // Passcode verification for unauthenticated elevation
  const handleVerifyPasscode = (e: React.FormEvent) => {
    e.preventDefault();
    setGateError(null);
    const res = QADatabase.verifyAndElevateAdmin(gatePasscode, currentUser);
    if (res.success) {
      setIsAdmin(true);
      triggerBanner(res.message);
      reloadData();
    } else {
      setGateError(res.message);
    }
  };

  // Navigating between sections
  const handleSelectSection = (sec: AdminSection) => {
    if (sec === 'overview') {
      router.push('/admin');
    } else {
      router.push(`/admin?section=${sec}`);
    }
    setSearchQuery('');
  };

  // =========================================================================
  // SECTION 1: COURSE (EDIT & DELETE)
  // =========================================================================
  const handleOpenAddLesson = () => {
    setEditingLessonTarget({
      trackId: selectedTrackId,
      moduleId: 'mod-custom-1',
      lesson: null,
    });
    setLessonTitle('');
    setLessonModule('Automation Basics');
    setLessonDuration(20);
    setLessonSummary('');
    setLessonOverview('');
    setLessonStarterCode('// Production starter automation code template');
    setLessonSolutionCode('// Production solution code');
    setLessonBestPractices('Always use resilient web-first assertions.\nAvoid hardcoded Thread.sleep() or static delays.');
    setLessonWhyItMatters('Accelerates test execution and eliminates flakiness.');
    setLessonArchFlow('Test Script <== WebSocket/CDP Protocol ==> Browser Runtime');
    setLessonInterviewQ('How do you design a maintainable test automation suite for this scenario?');
    setLessonInterviewA('Abstract locators into Page Objects and decouple test data from test actions.');
    setShowLessonModal(true);
  };

  const handleOpenEditLesson = (lesson: Lesson, moduleId: string) => {
    setEditingLessonTarget({
      trackId: selectedTrackId,
      moduleId,
      lesson,
    });
    const doc = getLessonDoc(lesson.id, selectedTrackId, lesson.title, lesson.description);
    setLessonTitle(lesson.title);
    setLessonModule(moduleId);
    setLessonDuration(lesson.durationMinutes || 20);
    setLessonSummary(lesson.description || '');
    setLessonOverview(doc.overview || (lesson as any).overview || '');
    setLessonStarterCode(
      lesson.challenge?.starterCode?.typescript ||
      lesson.challenge?.starterCode?.java ||
      doc.productionCodeExample?.code ||
      lesson.automationContext?.playwrightTs ||
      lesson.automationContext?.seleniumJava ||
      '// Production starter code'
    );
    setLessonSolutionCode(
      lesson.challenge?.solutionCode?.typescript ||
      lesson.challenge?.solutionCode?.java ||
      ''
    );
    setLessonBestPractices(
      Array.isArray(doc.bestPractices) ? doc.bestPractices.join('\n') : ''
    );
    setLessonWhyItMatters(doc.whyItMattersForManualQA || 'Automates manual test steps into fast automated checks.');
    setLessonArchFlow(doc.architectureUnderTheHood?.flowOrMechanism || 'Test Script <==> Target System');
    setLessonInterviewQ(doc.interviewQnA?.question || 'How is this pattern implemented in production?');
    setLessonInterviewA(doc.interviewQnA?.answer || 'By applying industry standard locator strategies.');
    setShowLessonModal(true);
  };

  const handleSaveLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLessonTarget || !lessonTitle.trim()) return;

    const trackId = editingLessonTarget.trackId;
    const lessonId = editingLessonTarget.lesson?.id || `les-${Date.now()}`;
    const moduleId = lessonModule || editingLessonTarget.moduleId || 'mod-custom-1';

    const lessonObj: Lesson = {
      id: lessonId,
      moduleId,
      trackId: trackId as any,
      title: lessonTitle.trim(),
      description: lessonSummary.trim(),
      durationMinutes: Number(lessonDuration) || 20,
      badge: (trackId.includes('ts') ? 'playwright' : 'selenium') as any,
      level: 'Intermediate',
      manualContext: {
        title: 'Manual Verification',
        steps: ['Execute verification steps'],
        painPoints: ['Manual execution is repetitive and slow'],
      },
      automationContext: {
        playwrightTs: lessonStarterCode.trim(),
        seleniumJava: lessonStarterCode.trim(),
        explanation: lessonOverview.trim(),
        bestPractices: lessonBestPractices.split('\n').map(s => s.trim()).filter(Boolean),
        antiPatterns: ['Hardcoded Thread.sleep()'],
      },
      aiAugmentation: {
        promptExample: 'Generate automated tests',
        agenticWorkflow: 'Analyze DOM elements',
        selfHealingTip: 'Use resilient locators',
      },
      challenge: {
        instruction: lessonOverview.trim() || 'Implement automation test',
        starterCode: {
          typescript: lessonStarterCode.trim(),
          java: lessonStarterCode.trim(),
        },
        solutionCode: {
          typescript: lessonSolutionCode.trim(),
          java: lessonSolutionCode.trim(),
        },
        validationRules: [],
      },
    };

    const docPayload: Partial<LessonDoc> = {
      title: lessonObj.title,
      category: `${trackId} • ${moduleId}`,
      tagline: lessonSummary.trim() || lessonObj.title,
      overview: lessonOverview.trim(),
      whyItMattersForManualQA: lessonWhyItMatters.trim(),
      architectureUnderTheHood: {
        title: 'Architecture & Engine Mechanisms',
        flowOrMechanism: lessonArchFlow.trim(),
        keyTakeaway: 'Resilient test automation with zero arbitrary sleeps.',
      },
      bestPractices: lessonBestPractices.split('\n').map(s => s.trim()).filter(Boolean),
      interviewQnA: {
        question: lessonInterviewQ.trim(),
        answer: lessonInterviewA.trim(),
      },
      productionCodeExample: {
        title: `${lessonObj.title} - Implementation`,
        description: lessonSummary.trim() || lessonObj.title,
        code: lessonStarterCode.trim() || lessonSolutionCode.trim(),
        language: trackId.includes('java') ? 'java' : (trackId.includes('python') ? 'python' : 'typescript'),
        annotations: [],
      },
    };

    QADatabase.saveLessonToDatabase(trackId, moduleId, lessonObj, docPayload)
      .then(() => {
        triggerBanner(`✅ Saved lesson "${lessonObj.title}" successfully.`);
        reloadData();
      })
      .catch(() => {
        QADatabase.saveLesson(trackId, moduleId, lessonObj);
        triggerBanner(`✅ Saved lesson "${lessonObj.title}" locally.`);
        reloadData();
      });

    setShowLessonModal(false);
  };

  const handleConfirmDeleteLesson = (trackId: string, lessonId: string, title: string) => {
    setDeleteConfirm({
      type: 'lesson',
      id: lessonId,
      extraId: trackId,
      title,
    });
  };

  const executeDeleteLesson = (trackId: string, lessonId: string) => {
    QADatabase.deleteLessonFromDatabase(trackId, lessonId);
    triggerBanner(`🗑️ Deleted lesson from track.`);
    reloadData();
    setDeleteConfirm(null);
  };

  // =========================================================================
  // SECTION 2: PRACTICE LABS (EDIT & DELETE)
  // =========================================================================
  const handleOpenAddProblem = () => {
    setEditingProblem(null);
    setProblemTitle('');
    setProblemDifficulty('Easy');
    setProblemCategory('Strings & Arrays');
    setProblemDesc('');
    setProblemInput('s = "hello"');
    setProblemOutput('"olleh"');
    setProblemConstraints('1 <= s.length <= 10^5');
    setProblemJava('public class Solution {\n    public static void main(String[] args) {\n        // Enter solution\n    }\n}');
    setProblemPython('def solve():\n    pass\n\nif __name__ == "__main__":\n    solve()');
    setProblemTs('function solve(): void {\n    // Enter solution\n}\nsolve();');
    setShowProblemModal(true);
  };

  const handleOpenEditProblem = (prob: CodingProblem) => {
    setEditingProblem(prob);
    setProblemTitle(prob.title);
    setProblemDifficulty(prob.difficulty);
    setProblemCategory(prob.category || 'General');
    setProblemDesc(prob.description);
    setProblemInput(prob.examples?.[0]?.input || '');
    setProblemOutput(prob.examples?.[0]?.output || '');
    setProblemConstraints(prob.constraints?.join('\n') || '');
    setProblemJava(prob.starterTemplates?.java || '');
    setProblemPython(prob.starterTemplates?.python || '');
    setProblemTs(prob.starterTemplates?.typescript || prob.starterTemplates?.javascript || '');
    setShowProblemModal(true);
  };

  const handleSaveProblem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!problemTitle.trim()) return;

    const probId = editingProblem?.id || `prob-${Date.now()}`;
    const newProb: Partial<CodingProblem> & { title: string; difficulty: 'Easy' | 'Medium' | 'Hard' } = {
      id: probId,
      title: problemTitle.trim(),
      difficulty: problemDifficulty,
      category: problemCategory.trim() || 'General',
      description: problemDesc.trim(),
      constraints: problemConstraints.split('\n').map(s => s.trim()).filter(Boolean),
      examples: [
        {
          input: problemInput.trim() || 'sample input',
          output: problemOutput.trim() || 'sample output',
        },
      ],
      starterTemplates: {
        java: problemJava.trim(),
        python: problemPython.trim(),
        typescript: problemTs.trim(),
        javascript: problemTs.trim(),
        csharp: problemJava.trim(),
      },
    };

    saveCustomProblem(newProb);
    triggerBanner(`✅ Saved practice lab problem "${problemTitle}".`);
    reloadData();
    setShowProblemModal(false);
  };

  const handleConfirmDeleteProblem = (id: string, title: string) => {
    setDeleteConfirm({
      type: 'problem',
      id,
      title,
    });
  };

  const executeDeleteProblem = (id: string) => {
    deleteCustomProblem(id);
    triggerBanner(`🗑️ Deleted practice lab problem.`);
    reloadData();
    setDeleteConfirm(null);
  };

  // =========================================================================
  // SECTION 3: AI TOOLS & AGENTS (EDIT & DELETE)
  // =========================================================================
  const handleOpenAddAgent = () => {
    setEditingAgent(null);
    setAgentTitle('');
    setAgentTabName('');
    setAgentBadge('Autonomous SDET Suite • Custom');
    setAgentDescription('');
    setAgentDefaultPrompt('');
    setAgentSystemPrompt('');
    setShowAgentModal(true);
  };

  const handleOpenEditAgent = (agent: AgentConfigItem) => {
    setEditingAgent(agent);
    setAgentTitle(agent.title);
    setAgentTabName(agent.tabName);
    setAgentBadge(agent.badgeText);
    setAgentDescription(agent.description);
    setAgentDefaultPrompt(agent.defaultPrompt);
    setAgentSystemPrompt(agent.systemPrompt);
    setShowAgentModal(true);
  };

  const handleSaveAgent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentTitle.trim()) return;

    const id = editingAgent?.id || `agent-custom-${Date.now()}`;
    const tabKey = editingAgent?.tabKey || agentTitle.toLowerCase().replace(/[^a-z0-9]/g, '_');

    const agentObj: AgentConfigItem = {
      id,
      tabKey,
      num: editingAgent?.num || '+',
      tabName: agentTabName.trim() || agentTitle.trim(),
      title: agentTitle.trim(),
      badgeText: agentBadge.trim() || 'Custom AI Agent',
      description: agentDescription.trim(),
      defaultPrompt: agentDefaultPrompt.trim(),
      systemPrompt: agentSystemPrompt.trim(),
      color: editingAgent?.color || 'text-purple-400',
      isCustom: editingAgent ? editingAgent.isCustom : true,
    };

    saveAgentConfig(agentObj);
    triggerBanner(`✅ Saved AI Tool configuration for "${agentTitle}".`);
    reloadData();
    setShowAgentModal(false);
  };

  const handleConfirmDeleteAgent = (id: string, title: string) => {
    setDeleteConfirm({
      type: 'agent',
      id,
      title,
    });
  };

  const executeDeleteAgent = (id: string) => {
    deleteAgentConfig(id);
    triggerBanner(`🗑️ Removed/Reset agent configuration.`);
    reloadData();
    setDeleteConfirm(null);
  };

  // =========================================================================
  // SECTION 4: INTERVIEW BANKS (EDIT & DELETE)
  // =========================================================================
  const handleOpenAddInterview = () => {
    setEditingQuestion(null);
    setIqQuestion('');
    setIqTech('Playwright');
    setIqDifficulty('Senior');
    setIqTopic('Enterprise Architecture');
    setIqAnswer('');
    setIqCode('');
    setIqBest('Structure test suites using modular Page Objects.');
    setIqPitfall('Hardcoding arbitrary waits or brittle selectors.');
    setShowInterviewModal(true);
  };

  const handleOpenEditInterview = (item: InterviewQuestionItem) => {
    setEditingQuestion(item);
    setIqQuestion(item.question);
    setIqTech((item.technology as any) || 'Playwright');
    setIqDifficulty((item.difficulty as any) || 'Mid');
    setIqTopic(item.topic || 'General');
    setIqAnswer(item.answerSummary);
    setIqCode(item.codeSnippet || '');
    setIqBest(item.bestPractice || '');
    setIqPitfall(item.pitfallToAvoid || '');
    setShowInterviewModal(true);
  };

  const handleSaveInterview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!iqQuestion.trim()) return;

    const id = editingQuestion?.id || `iq-custom-${Date.now()}`;
    const questionObj: InterviewQuestionItem = {
      id,
      technology: iqTech,
      difficulty: iqDifficulty,
      topic: iqTopic.trim() || 'General',
      question: iqQuestion.trim(),
      answerSummary: iqAnswer.trim(),
      codeSnippet: iqCode.trim(),
      bestPractice: iqBest.trim(),
      pitfallToAvoid: iqPitfall.trim(),
    };

    saveInterviewQuestion(questionObj);
    triggerBanner(`✅ Saved interview scenario.`);
    reloadData();
    setShowInterviewModal(false);
  };

  const handleConfirmDeleteInterview = (id: string, title: string) => {
    setDeleteConfirm({
      type: 'interview',
      id,
      title,
    });
  };

  const executeDeleteInterview = (id: string) => {
    deleteInterviewQuestion(id);
    triggerBanner(`🗑️ Deleted interview question from question bank.`);
    reloadData();
    setDeleteConfirm(null);
  };

  // =========================================================================
  // SECTION 5: TEAM & RBAC MANAGEMENT
  // =========================================================================
  const handleAddAdminEmail = (e: React.FormEvent) => {
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
  };

  const handleRemoveAdminEmail = (email: string) => {
    const res = QADatabase.removeAdminEmail(email);
    if (res.success) {
      triggerBanner(res.message);
      reloadData();
    } else {
      triggerBanner(res.message, 'error');
    }
  };

  const handleSavePasscode = (e: React.FormEvent) => {
    e.preventDefault();
    const res = QADatabase.setAdminSecret(newPasscodeInput);
    if (res.success) {
      triggerBanner(res.message);
      setIsEditingPasscode(false);
      reloadData();
    } else {
      triggerBanner(res.message, 'error');
    }
  };

  // Execute confirmed deletion
  const handleExecuteDelete = () => {
    if (!deleteConfirm) return;
    if (deleteConfirm.type === 'lesson' && deleteConfirm.extraId) {
      executeDeleteLesson(deleteConfirm.extraId, deleteConfirm.id);
    } else if (deleteConfirm.type === 'problem') {
      executeDeleteProblem(deleteConfirm.id);
    } else if (deleteConfirm.type === 'agent') {
      executeDeleteAgent(deleteConfirm.id);
    } else if (deleteConfirm.type === 'interview') {
      executeDeleteInterview(deleteConfirm.id);
    }
  };

  // If not admin, render secure unlock gateway
  if (!isAdmin) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#161616] border border-[#2B2B2B] rounded-3xl p-8 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white tracking-tight">Admin Gateway</h2>
            <p className="text-xs text-[#A1A1AA] leading-relaxed">
              This area is restricted to authorized platform administrators. Please enter the master security passcode or sign in with an administrator account.
            </p>
          </div>

          <form onSubmit={handleVerifyPasscode} className="space-y-4">
            <input
              type="password"
              value={gatePasscode}
              onChange={e => setGatePasscode(e.target.value)}
              placeholder="Enter master admin passcode..."
              className="w-full px-4 py-3 rounded-xl border border-[#2B2B2B] bg-[#0F0F0F] text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
            {gateError && (
              <p className="text-xs text-rose-400 bg-rose-950/40 p-2.5 rounded-lg border border-rose-900">
                {gateError}
              </p>
            )}
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm transition-all shadow-md cursor-pointer"
            >
              Verify Passcode &amp; Access Admin
            </button>
          </form>

          <div className="pt-4 border-t border-[#262626] flex items-center justify-center gap-3 text-xs">
            <button
              type="button"
              onClick={() => {
                QADatabase.switchToAdminSession();
                setIsAdmin(true);
                reloadData();
              }}
              className="text-purple-400 hover:text-purple-300 font-semibold hover:underline cursor-pointer flex items-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>1-Click Admin Session (admin@intelligentqa.io)</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active track object
  const currentTrack = tracks.find(t => t.id === selectedTrackId) || tracks[0];

  return (
    <div className="flex-1 bg-[#111111] text-white font-sans p-4 sm:p-8 min-h-screen">
      {/* Toast Banner */}
      {bannerMsg && (
        <div
          className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-2xl border text-xs font-bold flex items-center gap-3 animate-in fade-in duration-200 ${
            bannerMsg.type === 'error'
              ? 'bg-rose-950/90 text-rose-200 border-rose-800'
              : 'bg-emerald-950/90 text-emerald-200 border-emerald-800'
          }`}
        >
          {bannerMsg.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          <span>{bannerMsg.text}</span>
        </div>
      )}

      {/* TOP HEADER & SECTION NAVIGATION TABS */}
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#262626]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold text-purple-400 bg-purple-500/15 px-2.5 py-0.5 rounded-full border border-purple-500/30">
                SYSTEM ADMINISTRATOR
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
              Admin Control Center
            </h1>
          </div>
        </div>

        {/* SECTION NAVIGATION TABS */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#222222]">
          {[
            { id: 'overview', label: 'Dashboard Overview', icon: Layers },
            { id: 'course', label: 'Course', icon: BookOpen, count: tracks.reduce((acc, t) => acc + (t.modules?.reduce((mAcc, m) => mAcc + m.lessons.length, 0) || 0), 0) },
            { id: 'approvals', label: 'Guide Approvals', icon: ShieldCheck, count: submissions.filter((s) => s.status === 'pending').length },
            { id: 'labs', label: 'Practice Labs', icon: Terminal, count: codingProblems.length },
            { id: 'agents', label: 'AI Tools and Agents', icon: Bot, count: agentConfigs.length },
            { id: 'interviews', label: 'Interview Banks', icon: HelpCircle, count: interviewQuestions.length },
            { id: 'team', label: 'Admin Team & RBAC', icon: Users, count: adminEmails.length },
          ].map((tab) => {
            const Icon = tab.icon;
            const isTabActive = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleSelectSection(tab.id as AdminSection)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isTabActive
                    ? 'bg-purple-600/30 text-white border border-purple-500/50 shadow-sm'
                    : 'text-[#A1A1AA] hover:text-white hover:bg-[#1A1A1A]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isTabActive ? 'text-purple-400' : 'text-zinc-500'}`} />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                      isTabActive ? 'bg-purple-500/30 text-purple-200' : 'bg-[#222222] text-[#888888]'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* =================================================================== */}
        {/* VIEW 1: DASHBOARD OVERVIEW (CLICK ANY SECTION TO OPEN FOR EDIT/DEL)  */}
        {/* =================================================================== */}
        {activeSection === 'overview' && (
          <div className="space-y-8 animate-in fade-in duration-150">
            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-[#161616] border border-[#262626] space-y-1">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Course Tracks</span>
                <p className="text-2xl font-black text-white">{tracks.length}</p>
                <p className="text-[11px] text-zinc-400">
                  {tracks.reduce((acc, t) => acc + (t.modules?.reduce((mAcc, m) => mAcc + m.lessons.length, 0) || 0), 0)} Total Lessons
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#161616] border border-[#262626] space-y-1">
                <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">Practice Labs</span>
                <p className="text-2xl font-black text-white">{codingProblems.length}</p>
                <p className="text-[11px] text-zinc-400">Coding Problems &amp; Sandboxes</p>
              </div>

              <div className="p-5 rounded-2xl bg-[#161616] border border-[#262626] space-y-1">
                <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">AI Tools &amp; Agents</span>
                <p className="text-2xl font-black text-white">{agentConfigs.length}</p>
                <p className="text-[11px] text-zinc-400">Autonomous SDET Agents</p>
              </div>

              <div className="p-5 rounded-2xl bg-[#161616] border border-[#262626] space-y-1">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Interview Banks</span>
                <p className="text-2xl font-black text-white">{interviewQuestions.length}</p>
                <p className="text-[11px] text-zinc-400">Curated &amp; Architect Scenarios</p>
              </div>
            </div>

            {/* 4 CORE SECTIONS AS BIG CLICKABLE TILES (Exact user requirement) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight">Platform Content Sections</h2>
                  <p className="text-xs text-zinc-400">
                    Click any section below to open its dedicated view with complete Edit and Delete rights.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* 1. COURSE SECTION TILE */}
                <div
                  onClick={() => handleSelectSection('course')}
                  className="p-6 rounded-3xl bg-[#161616] border border-[#2A2A2A] hover:border-emerald-500/60 hover:bg-[#1A1A1A] transition-all cursor-pointer group shadow-lg space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      {tracks.length} Tracks • {tracks.reduce((acc, t) => acc + (t.modules?.reduce((mAcc, m) => mAcc + m.lessons.length, 0) || 0), 0)} Lessons
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                      Course
                    </h3>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#262626]">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {tracks.map(t => (
                        <span key={t.id} className="text-[10px] px-2 py-0.5 rounded bg-[#222222] text-zinc-300">
                          {t.title.split(' ')[0]}
                        </span>
                      ))}
                    </div>
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <span>Edit &amp; Delete Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>

                {/* 2. PRACTICE LABS SECTION TILE */}
                <div
                  onClick={() => handleSelectSection('labs')}
                  className="p-6 rounded-3xl bg-[#161616] border border-[#2A2A2A] hover:border-sky-500/60 hover:bg-[#1A1A1A] transition-all cursor-pointer group shadow-lg space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-sky-400 flex items-center justify-center">
                      <Terminal className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/30">
                      {codingProblems.length} Challenges
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-sky-300 transition-colors">
                      Practice Labs
                    </h3>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#262626]">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#222222] text-zinc-300">Algorithmic</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#222222] text-zinc-300">Web Sandbox</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#222222] text-zinc-300">API Testing</span>
                    </div>
                    <span className="text-xs font-bold text-sky-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <span>Edit &amp; Delete Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>

                {/* 3. AI TOOLS AND AGENTS SECTION TILE */}
                <div
                  onClick={() => handleSelectSection('agents')}
                  className="p-6 rounded-3xl bg-[#161616] border border-[#2A2A2A] hover:border-purple-500/60 hover:bg-[#1A1A1A] transition-all cursor-pointer group shadow-lg space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center">
                      <Bot className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30">
                      {agentConfigs.length} Agents Configured
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
                      AI Tools and Agents
                    </h3>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#262626]">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#222222] text-zinc-300">Gherkin BDD</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#222222] text-zinc-300">POM Gen</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#222222] text-zinc-300">Flakiness Auditor</span>
                    </div>
                    <span className="text-xs font-bold text-purple-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <span>Edit &amp; Delete Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>

                {/* 4. INTERVIEW BANKS SECTION TILE */}
                <div
                  onClick={() => handleSelectSection('interviews')}
                  className="p-6 rounded-3xl bg-[#161616] border border-[#2A2A2A] hover:border-amber-500/60 hover:bg-[#1A1A1A] transition-all cursor-pointer group shadow-lg space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                      <HelpCircle className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                      {interviewQuestions.length} Questions
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                      Interview Banks
                    </h3>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#262626]">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#222222] text-zinc-300">Architect Scenarios</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#222222] text-zinc-300">CI/CD Sharding</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#222222] text-zinc-300">Shadow DOM</span>
                    </div>
                    <span className="text-xs font-bold text-amber-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <span>Edit &amp; Delete Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>

                {/* 5. GUIDE APPROVALS & MODERATION TILE */}
                <div
                  onClick={() => handleSelectSection('approvals')}
                  className="p-6 rounded-3xl bg-[#161616] border border-[#2A2A2A] hover:border-emerald-500/60 hover:bg-[#1A1A1A] transition-all cursor-pointer group shadow-lg space-y-4 md:col-span-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                      {submissions.filter((s) => s.status === 'pending').length} Pending Admin Approval
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                      Guide Approvals &amp; Duplicate Moderation
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1">
                      Review community &amp; user-submitted guides, inspect automated duplicate checks across existing lessons &amp; guides, and publish approved content directly to courses.
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#262626]">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#222222] text-zinc-300">Automated Duplicate Check</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#222222] text-zinc-300">Similarity Scoring</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#222222] text-zinc-300">Course Publishing</span>
                    </div>
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <span>Review &amp; Approve Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* VIEW 2: COURSE SECTION (FULL EDIT & DELETE CAPABILITIES)            */}
        {/* =================================================================== */}
        {activeSection === 'course' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Header & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <button
                  type="button"
                  onClick={() => handleSelectSection('overview')}
                  className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 mb-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span>Back to Dashboard</span>
                </button>
                <h2 className="text-xl font-bold text-white">Course Management</h2>
                <p className="text-xs text-zinc-400">Add, edit, and delete modules, lessons, and production guides.</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleOpenAddLesson}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Lesson</span>
                </button>
              </div>
            </div>

            {/* Track Switcher Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {tracks.map((track) => (
                <button
                  key={track.id}
                  type="button"
                  onClick={() => setSelectedTrackId(track.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedTrackId === track.id
                      ? 'bg-emerald-600 text-white shadow'
                      : 'bg-[#1C1C1C] text-zinc-400 hover:text-white border border-[#2B2B2B]'
                  }`}
                >
                  <span>{track.title}</span>
                </button>
              ))}
            </div>

            {/* Lessons List for Selected Track */}
            <div className="bg-[#161616] rounded-3xl border border-[#262626] p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white text-sm">{currentTrack?.title} Curriculum</h3>
                  <span className="text-[10px] font-mono text-zinc-400 bg-[#222222] px-2 py-0.5 rounded-full">
                    {currentTrack?.modules?.reduce((acc, m) => acc + m.lessons.length, 0) || 0} Lessons
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                {currentTrack?.modules?.map((module) => (
                  <div key={module.id} className="space-y-2">
                    <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider px-1">
                      {module.title}
                    </div>

                    <div className="divide-y divide-[#222222] border border-[#262626] rounded-2xl bg-[#1A1A1A] overflow-hidden">
                      {module.lessons.map((lesson) => (
                        <div
                          key={lesson.id}
                          className="p-4 flex items-center justify-between gap-4 hover:bg-[#202020] transition-colors"
                        >
                          <div className="min-w-0 space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-white truncate">{lesson.title}</span>
                              <span className="text-[10px] px-2 py-0.5 rounded bg-[#262626] text-zinc-300 font-mono">
                                {lesson.durationMinutes}m
                              </span>
                            </div>
                            <p className="text-xs text-zinc-400 line-clamp-1">{lesson.description}</p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {/* EDIT BUTTON */}
                            <button
                              type="button"
                              onClick={() => handleOpenEditLesson(lesson, module.id)}
                              className="p-2 rounded-xl bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 border border-sky-500/30 transition-colors cursor-pointer"
                              title="Edit Lesson"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>

                            {/* DELETE BUTTON */}
                            <button
                              type="button"
                              onClick={() => handleConfirmDeleteLesson(selectedTrackId, lesson.id, lesson.title)}
                              className="p-2 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 transition-colors cursor-pointer"
                              title="Delete Lesson"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* VIEW 3: PRACTICE LABS (FULL EDIT & DELETE CAPABILITIES)             */}
        {/* =================================================================== */}
        {activeSection === 'labs' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <button
                  type="button"
                  onClick={() => handleSelectSection('overview')}
                  className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 mb-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span>Back to Dashboard</span>
                </button>
                <h2 className="text-xl font-bold text-white">Practice Labs Management</h2>
                <p className="text-xs text-zinc-400">Edit and delete coding problems, lab environments, and starter test cases.</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleOpenAddProblem}
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Practice Lab</span>
                </button>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#161616] p-4 rounded-2xl border border-[#262626]">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search challenges by title, category, language..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#0F0F0F] border border-[#2A2A2A] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex items-center gap-2">
                {['All', 'Easy', 'Medium', 'Hard'].map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setDifficultyFilter(diff)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      difficultyFilter === diff
                        ? 'bg-sky-600 text-white'
                        : 'bg-[#222222] text-zinc-400 hover:text-white'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            {/* Coding Problems Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {codingProblems
                .filter(p => {
                  if (difficultyFilter !== 'All' && p.difficulty !== difficultyFilter) return false;
                  if (searchQuery.trim()) {
                    const q = searchQuery.toLowerCase();
                    return p.title.toLowerCase().includes(q) || (p.category && p.category.toLowerCase().includes(q));
                  }
                  return true;
                })
                .map((prob) => (
                  <div
                    key={prob.id}
                    className="p-5 rounded-2xl bg-[#161616] border border-[#262626] hover:border-[#383838] transition-all flex flex-col justify-between gap-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                            prob.difficulty === 'Easy'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : prob.difficulty === 'Medium'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          }`}
                        >
                          {prob.difficulty}
                        </span>
                        <span className="text-[11px] font-medium text-zinc-400">{prob.category}</span>
                      </div>

                      <h3 className="font-bold text-white text-sm">{prob.title}</h3>
                      <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">{prob.description}</p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-[#222222]">
                      <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
                        {prob.starterTemplates?.java && <span className="px-1.5 py-0.5 rounded bg-[#222222]">Java</span>}
                        {prob.starterTemplates?.python && <span className="px-1.5 py-0.5 rounded bg-[#222222]">Python</span>}
                        {prob.starterTemplates?.typescript && <span className="px-1.5 py-0.5 rounded bg-[#222222]">TS</span>}
                      </div>

                      <div className="flex items-center gap-2">
                        {/* EDIT BUTTON */}
                        <button
                          type="button"
                          onClick={() => handleOpenEditProblem(prob)}
                          className="p-2 rounded-xl bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 border border-sky-500/30 transition-colors cursor-pointer"
                          title="Edit Problem"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* DELETE BUTTON */}
                        <button
                          type="button"
                          onClick={() => handleConfirmDeleteProblem(prob.id, prob.title)}
                          className="p-2 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 transition-colors cursor-pointer"
                          title="Delete Problem"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* VIEW 4: AI TOOLS & AGENTS (FULL EDIT & DELETE CAPABILITIES)        */}
        {/* =================================================================== */}
        {activeSection === 'agents' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <button
                  type="button"
                  onClick={() => handleSelectSection('overview')}
                  className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 mb-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span>Back to Dashboard</span>
                </button>
                <h2 className="text-xl font-bold text-white">AI Tools and Autonomous Agents</h2>
                <p className="text-xs text-zinc-400">
                  Configure the 5 SDET agents, prompts, system rules, and custom QA agent pipelines.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleOpenAddAgent}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Custom Agent</span>
                </button>
              </div>
            </div>

            {/* Agents List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {agentConfigs.map((agent) => (
                <div
                  key={agent.id}
                  className="p-6 rounded-3xl bg-[#161616] border border-[#262626] hover:border-purple-500/40 transition-all space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30">
                        {agent.badgeText}
                      </span>
                      {agent.isCustom && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                          CUSTOM
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="font-bold text-base text-white">{agent.title}</h3>
                      <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{agent.description}</p>
                    </div>

                    {/* Prompts Preview */}
                    <div className="p-3 bg-[#0F0F0F] rounded-xl border border-[#222222] space-y-1.5 text-xs font-mono">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                        Default User Prompt:
                      </span>
                      <p className="text-zinc-300 line-clamp-2 leading-relaxed">
                        {agent.defaultPrompt || 'No starter prompt defined.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-[#222222]">
                    <span className="text-[11px] text-zinc-500 font-mono">Tab: {agent.tabKey}</span>

                    <div className="flex items-center gap-2">
                      {/* EDIT BUTTON */}
                      <button
                        type="button"
                        onClick={() => handleOpenEditAgent(agent)}
                        className="px-3 py-1.5 rounded-xl bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 border border-purple-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit Agent</span>
                      </button>

                      {/* DELETE / RESET BUTTON */}
                      <button
                        type="button"
                        onClick={() => handleConfirmDeleteAgent(agent.id, agent.title)}
                        className="p-1.5 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 transition-colors cursor-pointer"
                        title={agent.isCustom ? 'Delete Agent' : 'Reset to Factory Defaults'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* VIEW 5: INTERVIEW BANKS (FULL EDIT & DELETE CAPABILITIES)           */}
        {/* =================================================================== */}
        {activeSection === 'interviews' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <button
                  type="button"
                  onClick={() => handleSelectSection('overview')}
                  className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 mb-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span>Back to Dashboard</span>
                </button>
                <h2 className="text-xl font-bold text-white">Interview Banks Management</h2>
                <p className="text-xs text-zinc-400">
                  Add, edit, and delete real-world SDET scenarios, system design questions, and answers.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleOpenAddInterview}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Question</span>
                </button>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#161616] p-4 rounded-2xl border border-[#262626]">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search questions by keyword, topic, or technology..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#0F0F0F] border border-[#2A2A2A] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {['All', 'Playwright', 'Selenium', 'API Testing', 'Java', 'Architect'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTechFilter(t)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      techFilter === t
                        ? 'bg-amber-600 text-white'
                        : 'bg-[#222222] text-zinc-400 hover:text-white'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Questions Table / List */}
            <div className="space-y-3">
              {interviewQuestions
                .filter(q => {
                  if (techFilter !== 'All' && !(q.technology || '').toLowerCase().includes(techFilter.toLowerCase()) && q.difficulty !== techFilter) return false;
                  if (searchQuery.trim()) {
                    const query = searchQuery.toLowerCase();
                    return q.question.toLowerCase().includes(query) || (q.topic && q.topic.toLowerCase().includes(query));
                  }
                  return true;
                })
                .slice(0, 50)
                .map((item) => (
                  <div
                    key={item.id}
                    className="p-5 rounded-2xl bg-[#161616] border border-[#262626] hover:border-[#333333] transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                            {item.technology}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                            {item.difficulty}
                          </span>
                          <span className="text-xs text-zinc-400 font-medium">{item.topic}</span>
                        </div>
                        <h3 className="font-bold text-sm text-white leading-relaxed">{item.question}</h3>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {/* EDIT BUTTON */}
                        <button
                          type="button"
                          onClick={() => handleOpenEditInterview(item)}
                          className="p-2 rounded-xl bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/30 transition-colors cursor-pointer"
                          title="Edit Question"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* DELETE BUTTON */}
                        <button
                          type="button"
                          onClick={() => handleConfirmDeleteInterview(item.id, item.question)}
                          className="p-2 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 transition-colors cursor-pointer"
                          title="Delete Question"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="p-3.5 bg-[#0F0F0F] rounded-xl border border-[#222222] text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap">
                      <span className="font-bold text-zinc-400 block mb-1">Answer: </span>
                      <FormattedInterviewAnswer text={item.answerSummary} isDark />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* VIEW 6: TEAM & RBAC MANAGEMENT                                     */}
        {/* =================================================================== */}
        {activeSection === 'team' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <button
                  type="button"
                  onClick={() => handleSelectSection('overview')}
                  className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 mb-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span>Back to Dashboard</span>
                </button>
                <h2 className="text-xl font-bold text-white">Admin Team &amp; RBAC</h2>
                <p className="text-xs text-zinc-400">Manage authorized administrator accounts and master passcodes.</p>
              </div>
            </div>

            {/* Add Admin Form */}
            <div className="p-6 rounded-3xl bg-[#161616] border border-[#262626] space-y-4">
              <h3 className="font-bold text-white text-sm">Add New Administrator</h3>
              <form onSubmit={handleAddAdminEmail} className="flex gap-3">
                <input
                  type="email"
                  required
                  value={newAdminEmail}
                  onChange={e => setNewAdminEmail(e.target.value)}
                  placeholder="Enter colleague's email address..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[#0F0F0F] border border-[#2A2A2A] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  Grant Admin Privileges
                </button>
              </form>
            </div>

            {/* Admin Accounts List */}
            <div className="p-6 rounded-3xl bg-[#161616] border border-[#262626] space-y-4">
              <h3 className="font-bold text-white text-sm">Authorized Administrator Accounts</h3>
              <div className="divide-y divide-[#222222]">
                {adminEmails.map((email) => {
                  const isPrimary = email.toLowerCase() === 'admin@intelligentqa.io';
                  return (
                    <div key={email} className="py-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-white">{email}</span>
                        {isPrimary && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
                            PRIMARY OWNER
                          </span>
                        )}
                      </div>

                      {!isPrimary && (
                        <button
                          type="button"
                          onClick={() => handleRemoveAdminEmail(email)}
                          className="text-xs text-rose-400 hover:text-rose-300 hover:underline cursor-pointer"
                        >
                          Revoke Privileges
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Master Security Passcode */}
            <div className="p-6 rounded-3xl bg-[#161616] border border-[#262626] space-y-4">
              <h3 className="font-bold text-white text-sm">Master Admin Security Passcode</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                This passcode allows authorized administrators to unlock the Admin Portal without prior email pre-registration.
              </p>

              {isEditingPasscode ? (
                <form onSubmit={handleSavePasscode} className="flex gap-3">
                  <input
                    type="text"
                    required
                    value={newPasscodeInput}
                    onChange={e => setNewPasscodeInput(e.target.value)}
                    className="flex-1 px-4 py-2 rounded-xl bg-[#0F0F0F] border border-[#2A2A2A] text-xs text-white"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold"
                  >
                    Save Passcode
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingPasscode(false)}
                    className="px-3 py-2 rounded-xl bg-zinc-800 text-zinc-400 text-xs"
                  >
                    Cancel
                  </button>
                </form>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-purple-300 bg-[#0F0F0F] px-3 py-1.5 rounded-lg border border-[#2A2A2A]">
                    {adminSecret}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setNewPasscodeInput(adminSecret);
                      setIsEditingPasscode(true);
                    }}
                    className="text-xs text-purple-400 hover:underline cursor-pointer"
                  >
                    Update Passcode
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* VIEW 7: GUIDE APPROVALS & DUPLICATE MODERATION SECTION              */}
        {/* =================================================================== */}
        {activeSection === 'approvals' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Header & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <button
                  type="button"
                  onClick={() => handleSelectSection('overview')}
                  className="text-xs text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer mb-2"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Dashboard Overview</span>
                </button>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-extrabold text-white tracking-tight">
                    Course Guide Approvals &amp; Duplicate Check
                  </h2>
                  <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                    {submissions.filter((s) => s.status === 'pending').length} Pending
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-1">
                  Review incoming concept guides, verify automated duplicate similarity reports, and approve guides to publish directly into course libraries.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={reloadData}
                  className="px-3.5 py-2 rounded-xl bg-[#161616] hover:bg-[#202020] text-zinc-300 text-xs font-bold border border-[#2B2B2B] flex items-center gap-1.5 transition cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Refresh Queue</span>
                </button>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-[#161616] border border-[#262626]">
                <div className="text-xs text-zinc-400">Total Submissions</div>
                <div className="text-2xl font-black text-white mt-1">{submissions.length}</div>
              </div>
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                <div className="text-xs text-amber-400 font-bold">Pending Approval</div>
                <div className="text-2xl font-black text-amber-300 mt-1">
                  {submissions.filter((s) => s.status === 'pending').length}
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
                <div className="text-xs text-emerald-400 font-bold">Approved &amp; Live</div>
                <div className="text-2xl font-black text-emerald-300 mt-1">
                  {submissions.filter((s) => s.status === 'approved').length}
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30">
                <div className="text-xs text-rose-400 font-bold">Rejected</div>
                <div className="text-2xl font-black text-rose-300 mt-1">
                  {submissions.filter((s) => s.status === 'rejected').length}
                </div>
              </div>
            </div>

            {/* Filter Tabs & Search */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#161616] border border-[#262626] p-3 rounded-2xl">
              <div className="flex items-center gap-1.5 flex-wrap">
                {(['all', 'pending', 'approved', 'rejected'] as const).map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setApprovalsFilter(filter)}
                    className={`py-1.5 px-3.5 rounded-xl text-xs font-bold capitalize transition cursor-pointer ${
                      approvalsFilter === filter
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'bg-[#1E1E1E] text-zinc-400 hover:text-white border border-[#2B2B2B]'
                    }`}
                  >
                    {filter === 'all' ? 'All' : filter === 'pending' ? 'Pending Review' : filter} (
                    {filter === 'all'
                      ? submissions.length
                      : submissions.filter((s) => s.status === filter).length}
                    )
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search submissions by title or author..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#0F0F0F] border border-[#2B2B2B] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/50"
                />
              </div>
            </div>

            {/* Submissions Queue Cards */}
            <div className="space-y-3">
              {submissions.filter((s) => (approvalsFilter === 'all' ? true : s.status === approvalsFilter))
                .filter((s) =>
                  searchQuery
                    ? s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      s.submittedBy?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      s.submittedBy?.email?.toLowerCase().includes(searchQuery.toLowerCase())
                    : true
                ).length === 0 ? (
                <div className="p-12 text-center rounded-3xl bg-[#161616] border border-[#262626] space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-500 flex items-center justify-center mx-auto">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-white">No Submissions Found</h4>
                  <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                    There are no guides matching the selected filter ({approvalsFilter}). New user imports and submissions will appear here.
                  </p>
                </div>
              ) : (
                submissions
                  .filter((s) => (approvalsFilter === 'all' ? true : s.status === approvalsFilter))
                  .filter((s) =>
                    searchQuery
                      ? s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        s.submittedBy?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        s.submittedBy?.email?.toLowerCase().includes(searchQuery.toLowerCase())
                      : true
                  )
                  .map((sub) => {
                    // Compute automated duplicate check
                    const dupCheck = checkGuideDuplicate({
                      title: sub.title,
                      summary: sub.summary,
                      overview: sub.contentPayload?.overview,
                      code: sub.contentPayload?.codeSnippets?.[0]?.code || sub.contentPayload?.code,
                      category: sub.category,
                      trackId: sub.trackOrLanguage,
                    });

                    return (
                      <div
                        key={sub.id}
                        className="p-5 rounded-2xl bg-[#161616] border border-[#262626] hover:border-[#333333] transition-all space-y-3 shadow-sm"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div className="space-y-1.5 max-w-2xl">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                                {sub.type === 'guide' ? 'Concept Guide' : 'Coding Problem'}
                              </span>
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#202020] text-zinc-300">
                                Track: {sub.trackOrLanguage}
                              </span>
                              {sub.category && (
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                  {sub.category}
                                </span>
                              )}

                              {/* Automated Duplicate Check Badge */}
                              {dupCheck.status === 'unique' ? (
                                <span
                                  className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1"
                                  title={dupCheck.recommendation}
                                >
                                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                                  <span>Duplicate Check: Clean (0% match - Unique Content)</span>
                                </span>
                              ) : dupCheck.status === 'potential_duplicate' ? (
                                <span
                                  className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1"
                                  title={dupCheck.recommendation}
                                >
                                  <AlertCircle className="w-3 h-3 text-amber-400" />
                                  <span>
                                    Duplicate Warning: {dupCheck.similarityScore}% match with &quot;{dupCheck.highestMatch?.title}&quot;
                                  </span>
                                </span>
                              ) : (
                                <span
                                  className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center gap-1"
                                  title={dupCheck.recommendation}
                                >
                                  <AlertCircle className="w-3 h-3 text-rose-400" />
                                  <span>
                                    High Duplicate Risk: {dupCheck.similarityScore}% match with &quot;{dupCheck.highestMatch?.title}&quot; ({dupCheck.highestMatch?.trackName})
                                  </span>
                                </span>
                              )}

                              {/* Status Badge */}
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                  sub.status === 'approved'
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                    : sub.status === 'rejected'
                                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                                    : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                }`}
                              >
                                {sub.status.toUpperCase()}
                              </span>
                            </div>

                            <h3 className="text-base font-bold text-white">{sub.title}</h3>

                            <p className="text-xs text-zinc-300 leading-relaxed line-clamp-2">
                              {sub.summary}
                            </p>

                            <div className="flex items-center gap-3 text-[11px] text-zinc-500 pt-1">
                              <span>
                                Submitted by: <strong className="text-zinc-300">{sub.submittedBy?.name || 'Community Member'}</strong> ({sub.submittedBy?.email || 'user@example.com'})
                              </span>
                              <span>•</span>
                              <span>Date: {new Date(sub.submittedAt).toLocaleDateString()}</span>
                              {sub.rejectionReason && (
                                <>
                                  <span>•</span>
                                  <span className="text-rose-400 font-semibold">
                                    Reason: {sub.rejectionReason}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Admin Moderation Actions */}
                          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                            {/* Review Full Content */}
                            <button
                              type="button"
                              onClick={() => setPreviewSubmission(sub)}
                              className="px-3 py-1.5 rounded-xl bg-[#222222] hover:bg-[#2A2A2A] text-zinc-200 text-xs font-semibold flex items-center gap-1.5 border border-[#333333] transition cursor-pointer"
                              title="Review full guide content & duplicate comparison"
                            >
                              <Eye className="w-3.5 h-3.5 text-blue-400" />
                              <span>Review Content</span>
                            </button>

                            {sub.status === 'pending' && (
                              <>
                                {/* Reject Button */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setRejectingSubmission(sub);
                                    setRejectionReasonInput('');
                                  }}
                                  className="px-3 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-xs font-semibold flex items-center gap-1.5 border border-rose-800/50 transition cursor-pointer"
                                  title="Reject this submission with feedback"
                                >
                                  <X className="w-3.5 h-3.5 text-rose-400" />
                                  <span>Reject</span>
                                </button>

                                {/* Approve & Publish Button (User requirement: added to course only after approval) */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const res = QADatabase.approveSubmission(sub.id, currentUser?.email);
                                    if (res.success) {
                                      triggerBanner(`🎉 ${res.message}`);
                                      reloadData();
                                    } else {
                                      triggerBanner(res.message, 'error');
                                    }
                                  }}
                                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition cursor-pointer"
                                  title="Approve guide and add it directly into the live course curriculum"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Approve &amp; Add to Course</span>
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        )}
      </div>

      {/* =================================================================== */}
      {/* MODAL: SUBMISSION PREVIEW & DUPLICATE COMPARISON MODAL              */}
      {/* =================================================================== */}
      {previewSubmission && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-3xl bg-[#161616] border border-[#2B2B2B] rounded-3xl p-6 sm:p-8 space-y-5 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#262626]">
              <div>
                <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider">
                  Submission Details &amp; Duplicate Check
                </span>
                <h3 className="font-bold text-white text-lg mt-0.5">{previewSubmission.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewSubmission(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-[#222222] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Duplicate Check Report Banner */}
            {(() => {
              const report = checkGuideDuplicate({
                title: previewSubmission.title,
                summary: previewSubmission.summary,
                overview: previewSubmission.contentPayload?.overview,
                code: previewSubmission.contentPayload?.codeSnippets?.[0]?.code || previewSubmission.contentPayload?.code,
                category: previewSubmission.category,
                trackId: previewSubmission.trackOrLanguage,
              });

              return (
                <div
                  className={`p-4 rounded-2xl border ${
                    report.status === 'unique'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : report.status === 'potential_duplicate'
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  } space-y-2`}
                >
                  <div className="flex items-center gap-2 font-bold text-sm">
                    {report.status === 'unique' ? (
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-400" />
                    )}
                    <span>
                      {report.status === 'unique'
                        ? 'Automated Duplicate Check: PASSED'
                        : `Duplicate Alert: ${report.similarityScore}% Similarity Found`}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">{report.recommendation}</p>

                  {report.highestMatch && (
                    <div className="text-[11px] bg-black/40 p-2.5 rounded-xl border border-white/10 mt-2 space-y-1">
                      <div className="font-semibold text-white">
                        Closest Existing Item: {report.highestMatch.title} ({report.highestMatch.type === 'guide' ? 'Concept Guide' : 'Curriculum Lesson'})
                      </div>
                      <div className="text-zinc-400">
                        Course Track: <span className="text-zinc-200">{report.highestMatch.trackName}</span> • Reason: {report.highestMatch.matchReason}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Guide Core Info */}
            <div className="space-y-4 text-xs">
              <div>
                <label className="text-[11px] font-bold text-zinc-400 uppercase">Summary</label>
                <p className="text-zinc-200 mt-1 leading-relaxed bg-[#0F0F0F] p-3 rounded-xl border border-[#262626]">
                  {previewSubmission.summary}
                </p>
              </div>

              {previewSubmission.contentPayload?.overview && (
                <div>
                  <label className="text-[11px] font-bold text-zinc-400 uppercase">Full Overview</label>
                  <div className="text-zinc-200 mt-1 leading-relaxed bg-[#0F0F0F] p-3 rounded-xl border border-[#262626] whitespace-pre-wrap max-h-48 overflow-y-auto">
                    {previewSubmission.contentPayload.overview}
                  </div>
                </div>
              )}

              {/* Code Snippet Preview */}
              {(previewSubmission.contentPayload?.codeSnippets?.[0]?.code || previewSubmission.contentPayload?.code) && (
                <div>
                  <label className="text-[11px] font-bold text-zinc-400 uppercase">
                    Code Snippet ({previewSubmission.contentPayload?.codeSnippets?.[0]?.language || 'code'})
                  </label>
                  <pre className="text-zinc-200 font-mono text-[11px] mt-1 bg-[#0A0A0A] p-3 rounded-xl border border-[#262626] overflow-x-auto max-h-48">
                    {previewSubmission.contentPayload?.codeSnippets?.[0]?.code || previewSubmission.contentPayload?.code}
                  </pre>
                </div>
              )}

              {/* Best Practices & Anti-patterns */}
              {previewSubmission.contentPayload?.bestPractices?.length > 0 && (
                <div>
                  <label className="text-[11px] font-bold text-emerald-400 uppercase">Best Practices</label>
                  <ul className="list-disc list-inside mt-1 text-zinc-300 space-y-1">
                    {previewSubmission.contentPayload.bestPractices.map((bp: string, i: number) => (
                      <li key={i}>{bp}</li>
                    ))}
                  </ul>
                </div>
              )}

              {previewSubmission.contentPayload?.interviewTips && (
                <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl text-amber-200">
                  <strong className="text-amber-400 font-bold">Interview Tips:</strong> {previewSubmission.contentPayload.interviewTips}
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-[#262626]">
              <button
                type="button"
                onClick={() => setPreviewSubmission(null)}
                className="px-4 py-2 rounded-xl bg-[#222222] hover:bg-[#2A2A2A] text-zinc-300 text-xs font-semibold cursor-pointer"
              >
                Close
              </button>

              {previewSubmission.status === 'pending' && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setRejectingSubmission(previewSubmission);
                      setPreviewSubmission(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-xs font-bold border border-rose-800/50 cursor-pointer"
                  >
                    Reject Submission
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const res = QADatabase.approveSubmission(previewSubmission.id, currentUser?.email);
                      if (res.success) {
                        triggerBanner(`🎉 ${res.message}`);
                        setPreviewSubmission(null);
                        reloadData();
                      } else {
                        triggerBanner(res.message, 'error');
                      }
                    }}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Approve &amp; Publish to Course</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL: REJECT SUBMISSION WITH FEEDBACK REASON                       */}
      {/* =================================================================== */}
      {rejectingSubmission && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#161616] border border-[#2B2B2B] rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#262626]">
              <h3 className="font-bold text-white text-base">Reject Guide Submission</h3>
              <button
                type="button"
                onClick={() => setRejectingSubmission(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-[#222222] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-400">
              Provide feedback for rejecting &quot;<strong className="text-zinc-200">{rejectingSubmission.title}</strong>&quot;.
            </p>

            <textarea
              rows={3}
              value={rejectionReasonInput}
              onChange={(e) => setRejectionReasonInput(e.target.value)}
              placeholder="e.g. Duplicate of existing lesson, incomplete code example, or missing architectural explanations."
              className="w-full p-3 rounded-xl bg-[#0F0F0F] border border-[#2B2B2B] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/50"
            />

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#262626]">
              <button
                type="button"
                onClick={() => setRejectingSubmission(null)}
                className="px-3.5 py-1.5 rounded-xl bg-[#222222] text-zinc-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const res = QADatabase.rejectSubmission(
                    rejectingSubmission.id,
                    rejectionReasonInput || 'Content does not meet site requirements.',
                    currentUser?.email
                  );
                  if (res.success) {
                    triggerBanner(`Rejected "${rejectingSubmission.title}".`);
                    setRejectingSubmission(null);
                    reloadData();
                  }
                }}
                className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 1: LESSON EDIT / ADD MODAL                                    */}
      {/* =================================================================== */}
      {showLessonModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-[#161616] border border-[#2B2B2B] rounded-3xl p-6 sm:p-8 space-y-5 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#262626]">
              <h3 className="font-bold text-white text-base">
                {editingLessonTarget?.lesson ? 'Edit Course Lesson' : 'Add New Course Lesson'}
              </h3>
              <button
                type="button"
                onClick={() => setShowLessonModal(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-[#222222]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLesson} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300">Lesson Title</label>
                  <input
                    type="text"
                    required
                    value={lessonTitle}
                    onChange={e => setLessonTitle(e.target.value)}
                    placeholder="e.g. Dynamic Locators & Shadow DOM"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#0F0F0F] border border-[#2B2B2B] text-xs text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300">Module / Category</label>
                  <input
                    type="text"
                    value={lessonModule}
                    onChange={e => setLessonModule(e.target.value)}
                    placeholder="e.g. Automation Basics"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#0F0F0F] border border-[#2B2B2B] text-xs text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300">Summary / Learning Objective</label>
                <input
                  type="text"
                  value={lessonSummary}
                  onChange={e => setLessonSummary(e.target.value)}
                  placeholder="Brief description of the lesson"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0F0F0F] border border-[#2B2B2B] text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300">Step-by-Step Overview &amp; Guide</label>
                <textarea
                  rows={3}
                  value={lessonOverview}
                  onChange={e => setLessonOverview(e.target.value)}
                  placeholder="Explain the architectural pattern and testing steps..."
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0F0F0F] border border-[#2B2B2B] text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300">Starter Code Template</label>
                <textarea
                  rows={4}
                  value={lessonStarterCode}
                  onChange={e => setLessonStarterCode(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0F0F0F] border border-[#2B2B2B] text-xs font-mono text-zinc-300"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300">Solution Code</label>
                <textarea
                  rows={4}
                  value={lessonSolutionCode}
                  onChange={e => setLessonSolutionCode(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0F0F0F] border border-[#2B2B2B] text-xs font-mono text-zinc-300"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300">Best Practices (One per line)</label>
                <textarea
                  rows={2}
                  value={lessonBestPractices}
                  onChange={e => setLessonBestPractices(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0F0F0F] border border-[#2B2B2B] text-xs text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#262626]">
                <button
                  type="button"
                  onClick={() => setShowLessonModal(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Save Lesson
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 2: PRACTICE LAB PROBLEM EDIT / ADD MODAL                      */}
      {/* =================================================================== */}
      {showProblemModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-[#161616] border border-[#2B2B2B] rounded-3xl p-6 sm:p-8 space-y-5 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#262626]">
              <h3 className="font-bold text-white text-base">
                {editingProblem ? 'Edit Practice Lab Problem' : 'Add Practice Lab Problem'}
              </h3>
              <button
                type="button"
                onClick={() => setShowProblemModal(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-[#222222]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProblem} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-zinc-300">Problem Title</label>
                  <input
                    type="text"
                    required
                    value={problemTitle}
                    onChange={e => setProblemTitle(e.target.value)}
                    placeholder="e.g. Valid Parentheses for Test Assertions"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#0F0F0F] border border-[#2B2B2B] text-xs text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300">Difficulty</label>
                  <select
                    value={problemDifficulty}
                    onChange={e => setProblemDifficulty(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0F0F0F] border border-[#2B2B2B] text-xs text-white"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300">Category</label>
                <input
                  type="text"
                  value={problemCategory}
                  onChange={e => setProblemCategory(e.target.value)}
                  placeholder="e.g. Locators & DOM Traversal"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0F0F0F] border border-[#2B2B2B] text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300">Description</label>
                <textarea
                  rows={3}
                  value={problemDesc}
                  onChange={e => setProblemDesc(e.target.value)}
                  placeholder="Explain the problem scenario and expected outcome..."
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0F0F0F] border border-[#2B2B2B] text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300">Starter Java Code</label>
                <textarea
                  rows={3}
                  value={problemJava}
                  onChange={e => setProblemJava(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0F0F0F] border border-[#2B2B2B] text-xs font-mono text-zinc-300"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300">Starter Python Code</label>
                <textarea
                  rows={3}
                  value={problemPython}
                  onChange={e => setProblemPython(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0F0F0F] border border-[#2B2B2B] text-xs font-mono text-zinc-300"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#262626]">
                <button
                  type="button"
                  onClick={() => setShowProblemModal(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Save Problem
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 3: AI TOOL / AGENT EDIT MODAL                                 */}
      {/* =================================================================== */}
      {showAgentModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-[#161616] border border-[#2B2B2B] rounded-3xl p-6 sm:p-8 space-y-5 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#262626]">
              <h3 className="font-bold text-white text-base">
                {editingAgent ? `Edit AI Agent: ${editingAgent.title}` : 'Add Custom AI Agent'}
              </h3>
              <button
                type="button"
                onClick={() => setShowAgentModal(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-[#222222]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAgent} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300">Agent Name / Title</label>
                  <input
                    type="text"
                    required
                    value={agentTitle}
                    onChange={e => setAgentTitle(e.target.value)}
                    placeholder="e.g. Performance Load Analyzer"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#0F0F0F] border border-[#2B2B2B] text-xs text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300">Badge Text</label>
                  <input
                    type="text"
                    value={agentBadge}
                    onChange={e => setAgentBadge(e.target.value)}
                    placeholder="e.g. Autonomous SDET Suite • Agent 6"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#0F0F0F] border border-[#2B2B2B] text-xs text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300">Description</label>
                <textarea
                  rows={2}
                  value={agentDescription}
                  onChange={e => setAgentDescription(e.target.value)}
                  placeholder="Explain what this autonomous agent achieves..."
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0F0F0F] border border-[#2B2B2B] text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300">Default Starter User Prompt</label>
                <textarea
                  rows={3}
                  value={agentDefaultPrompt}
                  onChange={e => setAgentDefaultPrompt(e.target.value)}
                  placeholder="Default prompt pre-filled for users..."
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0F0F0F] border border-[#2B2B2B] text-xs font-mono text-zinc-300"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300">System Prompt &amp; Behavioral Guidelines</label>
                <textarea
                  rows={4}
                  value={agentSystemPrompt}
                  onChange={e => setAgentSystemPrompt(e.target.value)}
                  placeholder="Instructions guiding Gemini model behavior for this agent..."
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0F0F0F] border border-[#2B2B2B] text-xs font-mono text-zinc-300"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#262626]">
                <button
                  type="button"
                  onClick={() => setShowAgentModal(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Save Agent Configuration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 4: INTERVIEW QUESTION EDIT / ADD MODAL                         */}
      {/* =================================================================== */}
      {showInterviewModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-[#161616] border border-[#2B2B2B] rounded-3xl p-6 sm:p-8 space-y-5 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#262626]">
              <h3 className="font-bold text-white text-base">
                {editingQuestion ? 'Edit Interview Question' : 'Add Interview Question'}
              </h3>
              <button
                type="button"
                onClick={() => setShowInterviewModal(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-[#222222]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveInterview} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300">Technology</label>
                  <select
                    value={iqTech}
                    onChange={e => setIqTech(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0F0F0F] border border-[#2B2B2B] text-xs text-white"
                  >
                    <option value="Playwright">Playwright</option>
                    <option value="Selenium">Selenium</option>
                    <option value="API Testing">API Testing</option>
                    <option value="Java">Java</option>
                    <option value="TypeScript">TypeScript</option>
                    <option value="AI & LLM">AI &amp; LLM</option>
                    <option value="Framework Design">Framework Design</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300">Difficulty</label>
                  <select
                    value={iqDifficulty}
                    onChange={e => setIqDifficulty(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0F0F0F] border border-[#2B2B2B] text-xs text-white"
                  >
                    <option value="Junior">Junior</option>
                    <option value="Mid">Mid</option>
                    <option value="Senior">Senior</option>
                    <option value="Architect">Architect</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300">Topic</label>
                  <input
                    type="text"
                    value={iqTopic}
                    onChange={e => setIqTopic(e.target.value)}
                    placeholder="e.g. Concurrency &amp; CI/CD"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#0F0F0F] border border-[#2B2B2B] text-xs text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300">Question</label>
                <textarea
                  rows={3}
                  required
                  value={iqQuestion}
                  onChange={e => setIqQuestion(e.target.value)}
                  placeholder="Enter the technical scenario or interview question..."
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0F0F0F] border border-[#2B2B2B] text-xs text-white"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-zinc-300">Answer Summary</label>
                  <span className="text-[10px] text-zinc-500 font-mono">Keeps exact paragraphs, bullets &amp; code formatting</span>
                </div>
                <textarea
                  rows={6}
                  value={iqAnswer}
                  onChange={e => setIqAnswer(e.target.value)}
                  placeholder="Paste or write detailed technical explanation... Exact formatting, line breaks, bullet points, and code blocks from your source will be preserved."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0F0F0F] border border-[#2B2B2B] text-xs font-sans text-white leading-relaxed whitespace-pre-wrap"
                />
                {iqAnswer.trim() && (
                  <div className="p-3 bg-[#141414] rounded-xl border border-[#252525] text-xs text-zinc-300 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-emerald-400 block">Live Formatted Preview:</span>
                    <FormattedInterviewAnswer text={iqAnswer} isDark />
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300">Code Snippet (Optional)</label>
                <textarea
                  rows={3}
                  value={iqCode}
                  onChange={e => setIqCode(e.target.value)}
                  placeholder="// Code example illustrating the pattern..."
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0F0F0F] border border-[#2B2B2B] text-xs font-mono text-zinc-300"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300">Best Practice</label>
                  <input
                    type="text"
                    value={iqBest}
                    onChange={e => setIqBest(e.target.value)}
                    placeholder="Recommended approach"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#0F0F0F] border border-[#2B2B2B] text-xs text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300">Pitfall to Avoid</label>
                  <input
                    type="text"
                    value={iqPitfall}
                    onChange={e => setIqPitfall(e.target.value)}
                    placeholder="Common rookie mistake"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#0F0F0F] border border-[#2B2B2B] text-xs text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#262626]">
                <button
                  type="button"
                  onClick={() => setShowInterviewModal(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Save Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 5: UNIVERSAL DELETE CONFIRMATION MODAL                        */}
      {/* =================================================================== */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#161616] border border-rose-900/50 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="font-bold text-white text-base">Confirm Deletion</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Are you sure you want to delete <span className="font-bold text-white">"{deleteConfirm.title}"</span>? This action will remove it from the platform.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-semibold hover:bg-zinc-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[85vh] flex items-center justify-center bg-[#111111]">
          <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full" />
        </div>
      }
    >
      <AdminDashboardContent />
    </Suspense>
  );
}
