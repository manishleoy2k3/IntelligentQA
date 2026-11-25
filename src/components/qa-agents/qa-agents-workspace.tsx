'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  FileText,
  ListChecks,
  Code2,
  ShieldCheck,
  MessageSquare,
  Copy,
  Check,
  Send,
  Download,
  Sparkles,
  RefreshCw,
  Terminal,
  Key,
  Lock,
  UserPlus,
  LogIn,
  Zap,
  BookOpen,
  UploadCloud,
  FileSpreadsheet,
  X,
  FileCheck,
  Layers,
  FolderKanban,
  Paperclip,
  CheckSquare,
  Square,
  Presentation,
  FileCode,
  Folder,
  ArrowRight,
  GripVertical,
  ChevronDown,
  GitCompare,
} from 'lucide-react';
import CoverageGapAnalyzer from '@/components/qa-agents/coverage-gap-analyzer';
import { QADatabase, DEMO_USER } from '@/lib/qa-db';
import GeminiKeyModal from '@/components/auth/gemini-key-modal';
import {
  exportRequirementsToExcel,
  exportTestMatrixToExcel,
  parseAmbiguityTableToRows,
  parseTestCaseTableToRows,
  generateExcelWorkbookXml,
} from '@/lib/excel-export';
import { parseRequirementsFile, ParsedRequirementFile } from '@/lib/file-parser';
import {
  ProjectFile,
  getProjectFiles,
  getProjectFolders,
  DEFAULT_PROJECT_FOLDERS,
  formatContextForAgents,
} from '@/lib/project-files';
import { CODE_REVIEWER_DEBUGGER_AGENT_MD } from '@/data/agents/code-reviewer-debugger-agent';

export type AgentTab =
  'requirements' | 'test_cases' | 'automation_code' | 'code_review' | 'chat' | 'gap_analysis';

const tabDefaultPrompts: Record<AgentTab, string> = {
  requirements:
    'The system should process payments quickly and notify users when transactions are completed.',
  test_cases:
    'User Account Transfer Workflow with 2FA Verification, Daily Limits ($10,000 max), and Idempotent Transaction Submissions.',
  automation_code:
    'Feature: Transfer Money between Savings and Checking accounts. Implement Page Object Model with web-first assertions.',
  code_review: `// Paste your error stack trace, flaky script, or upload project files for a comprehensive SDET code review and fix:

test("checkout workflow", async ({ page }) => {
  await page.click("#checkout");
  await page.waitForTimeout(5000);
  await page.click("#confirm");
});`,
  chat: '',
  gap_analysis: '',
};

export const AGENT_CONFIGS: Record<
  AgentTab,
  {
    num: string;
    tabName: string;
    title: string;
    badgeText: string;
    description: string;
    icon: any;
    color: string;
  }
> = {
  // 1. Requirement Generator -> 1. Requirement Analyzer
  requirements: {
    num: '1',
    tabName: '1. Requirement Analyzer',
    title: 'Requirement Analyzer',
    badgeText: '',
    description:
      'Analyze existing requirements and identify ambiguities, inconsistencies, missing clarity and undefined expectations across 7 core ambiguity categories.',
    icon: FileText,
    color: 'text-cyan-500',
  },
  test_cases: {
    num: '2',
    tabName: '2. Test Case Generator',
    title: 'Test Case Generator',
    badgeText: '',
    description:
      'Synthesize positive, negative, security, and edge-case test matrices with priority and preconditions from requirements or imported Word (.docx), Excel (.xlsx), and PDF documents.',
    icon: ListChecks,
    color: 'text-emerald-500',
  },
  automation_code: {
    num: '3',
    tabName: '3. Automation Generator',
    title: 'Automation Code Generator',
    badgeText: '',
    description:
      'Scaffold modular, production-ready Page Object Model code with resilient locators, assertions, and test scripts in Playwright, Selenium Java, or REST Assured.',
    icon: Code2,
    color: 'text-indigo-500',
  },
  code_review: {
    num: '4',
    tabName: '4. Code Reviewer & Debugger',
    title: 'QA Code Reviewer & Debugger Agent',
    badgeText: '',
    description:
      'Expert SDET Code Reviewer and Root-Cause Debugger for Selenium, Playwright, Rest Assured and Appium. Analyzes stack traces, fixes flaky tests, optimizes locators, and enforces clean code standards.',
    icon: ShieldCheck,
    color: 'text-amber-500',
  },
  chat: {
    num: '5',
    tabName: '5. Senior SDET Mentor Chat',
    title: 'Senior SDET Mentor Chat',
    badgeText: '',
    description:
      'Interactive technical coaching with an expert SDET mentor on framework architecture, CI/CD pipelines, flakiness triage, and interview mastery.',
    icon: MessageSquare,
    color: 'text-purple-500',
  },
  gap_analysis: {
    num: '7',
    tabName: 'Test Coverage Gap Analysis',
    title: 'Test Coverage Gap Analysis',
    badgeText: '',
    description:
      'Compare requirements against test cases, perform bidirectional traceability analysis, identify coverage gaps across 12 scenario dimensions, and generate multi-sheet Excel reports.',
    icon: GitCompare,
    color: 'text-rose-500',
  },
};

export default function QAAgentsWorkspace() {
  const [activeTab, setActiveTab] = useState<AgentTab>('requirements');
  const [techStack, setTechStack] = useState<'playwright-ts' | 'selenium-java' | 'restassured'>(
    'playwright-ts'
  );
  const [inputPrompt, setInputPrompt] = useState<string>(tabDefaultPrompts.requirements);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [outputResult, setOutputResult] = useState<string>('');
  const [usedEngine, setUsedEngine] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [showKeyModal, setShowKeyModal] = useState<boolean>(false);

  // File Import state for Test Case Generator
  const [importedFile, setImportedFile] = useState<ParsedRequirementFile | null>(null);
  const [isParsingFile, setIsParsingFile] = useState<boolean>(false);
  const [fileParseError, setFileParseError] = useState<string>('');
  const [reqViewMode, setReqViewMode] = useState<'table' | 'raw'>('table');
  const [tcViewMode, setTcViewMode] = useState<'table' | 'raw'>('table');

  // Coverage filters for Test Case Generator
  const [coverageFilters, setCoverageFilters] = useState({
    positive: true,
    negative: true,
    bva: true,
    security: true,
    edgeCases: true,
  });

  // Review Mode for Code Reviewer Agent (REVIEW ONLY vs REVIEW AND FIX)
  const [reviewMode, setReviewMode] = useState<'review_and_fix' | 'review_only'>('review_and_fix');

  // Project Files Context Integration (Accessible across ALL AI QA Agents)
  const [attachedProjectFiles, setAttachedProjectFiles] = useState<ProjectFile[]>([]);
  const [allProjectFiles, setAllProjectFiles] = useState<ProjectFile[]>([]);
  const [allProjectFolders, setAllProjectFolders] = useState<string[]>(DEFAULT_PROJECT_FOLDERS);
  const [showAttachFilesModal, setShowAttachFilesModal] = useState<boolean>(false);
  const [selectedModalFileIds, setSelectedModalFileIds] = useState<string[]>([]);
  const [modalFolderFilter, setModalFolderFilter] = useState<string>('All');

  // Agent Spec Modal State (for QA learning how Agents are architected)
  const [showAgentSpecModal, setShowAgentSpecModal] = useState<boolean>(false);
  const [agentSpecTab, setAgentSpecTab] = useState<'rendered' | 'raw'>('rendered');
  const [copiedAgentMd, setCopiedAgentMd] = useState<boolean>(false);

  // Auth and Key state
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [geminiKey, setGeminiKey] = useState<string>('');
  const [aiPref, setAiPref] = useState<'enabled' | 'opted_out' | 'unset'>('unset');

  // Resizable layout state for Requirement Analyzer
  const [reqSplitPercent, setReqSplitPercent] = useState<number>(50);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isLg, setIsLg] = useState<boolean>(true);
  const splitContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(min-width: 1024px)');
    setIsLg(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsLg(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const handleResizePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handlePointerMove = (e: PointerEvent) => {
      if (!splitContainerRef.current) return;
      const rect = splitContainerRef.current.getBoundingClientRect();
      if (rect.width <= 0) return;
      const clientX = e.clientX;
      const offset = clientX - rect.left;
      const percent = (offset / rect.width) * 100;
      // Clamp between 20% and 80% so both panels remain usable
      setReqSplitPercent(Math.max(20, Math.min(80, percent)));
    };

    const handlePointerUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDragging]);

  // Handoff Workflows (from code_reviewer_debugger_agent.md)
  const handleHandoffToAutomation = () => {
    setActiveTab('automation_code');
    setInputPrompt(
      `Rewrite and refactor this module applying all recommended POM and clean-code improvements:\n\n${inputPrompt}`
    );
    setOutputResult('');
  };

  const handleHandoffToTestCases = () => {
    setActiveTab('test_cases');
    setInputPrompt(
      `Suggest additional edge-case tests based on the bugs and flakiness uncovered during debugging:\n\n${inputPrompt}`
    );
    setOutputResult('');
  };

  const loadProjectFilesData = useCallback(async (userId?: string) => {
    try {
      const uId = userId || QADatabase.getCurrentUser()?.id || 'default';
      const [loadedFiles, loadedFolders] = await Promise.all([
        getProjectFiles(uId),
        getProjectFolders(uId),
      ]);
      setAllProjectFiles(loadedFiles);

      // Merge all folders: default folders + loaded folders + folders found on any files
      const fileFolders = loadedFiles.map((f) => f.folder).filter(Boolean);
      const mergedFolders = Array.from(
        new Set([...DEFAULT_PROJECT_FOLDERS, ...loadedFolders, ...fileFolders])
      ).filter(Boolean);
      setAllProjectFolders(mergedFolders);

      // Check if user came from Project Files page with preselected files
      if (typeof window !== 'undefined') {
        const preselectedRaw = window.localStorage.getItem('intelligentqa_selected_agent_files');
        if (preselectedRaw) {
          try {
            const preselectedIds: string[] = JSON.parse(preselectedRaw);
            const matches = loadedFiles.filter((f) => preselectedIds.includes(f.id));
            if (matches.length > 0) {
              setAttachedProjectFiles(matches);
            }
          } catch {}
          window.localStorage.removeItem('intelligentqa_selected_agent_files');
        }
      }
    } catch (err) {
      console.warn('Could not load project files for agents:', err);
    }
  }, []);

  const handleOpenAttachModal = useCallback(async () => {
    const user = QADatabase.getCurrentUser();
    await loadProjectFilesData(user?.id);
    setSelectedModalFileIds(attachedProjectFiles.map((f) => f.id));
    setShowAttachFilesModal(true);
  }, [attachedProjectFiles, loadProjectFilesData]);

  const syncState = useCallback(() => {
    if (typeof window !== 'undefined') {
      const user = QADatabase.getCurrentUser();
      setCurrentUser(user);
      const key = QADatabase.getUserGeminiKey(user?.id);
      setGeminiKey(key);
      const pref = QADatabase.getAiPreference(user?.id);
      setAiPref(pref);
      loadProjectFilesData(user?.id);
    }
  }, [loadProjectFilesData]);

  useEffect(() => {
    syncState();
    const handleAuth = () => syncState();
    const handleKey = () => syncState();
    const handleAiPref = () => syncState();
    const handleProjectFiles = () => {
      const user = QADatabase.getCurrentUser();
      loadProjectFilesData(user?.id);
    };

    window.addEventListener('intelligentqa_auth_changed', handleAuth);
    window.addEventListener('intelligentqa_key_changed', handleKey);
    window.addEventListener('intelligentqa_ai_pref_changed', handleAiPref);
    window.addEventListener('intelligentqa_project_files_updated', handleProjectFiles);

    // Support query parameter tab and sidebar custom events
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab') as AgentTab;
    if (
      tabParam &&
      [
        'requirements',
        'test_cases',
        'automation_code',
        'code_review',
        'chat',
        'gap_analysis',
      ].includes(tabParam)
    ) {
      handleTabSwitch(tabParam);
    }

    const handleSwitch = (e: any) => {
      if (
        e.detail?.tab &&
        [
          'requirements',
          'test_cases',
          'automation_code',
          'code_review',
          'chat',
          'gap_analysis',
        ].includes(e.detail.tab)
      ) {
        handleTabSwitch(e.detail.tab);
      }
    };
    window.addEventListener('intelligentqa_switch_agent_tab', handleSwitch);

    return () => {
      window.removeEventListener('intelligentqa_auth_changed', handleAuth);
      window.removeEventListener('intelligentqa_key_changed', handleKey);
      window.removeEventListener('intelligentqa_ai_pref_changed', handleAiPref);
      window.removeEventListener('intelligentqa_project_files_updated', handleProjectFiles);
      window.removeEventListener('intelligentqa_switch_agent_tab', handleSwitch);
    };
  }, [syncState, loadProjectFilesData]);

  const handleTabSwitch = (newTab: AgentTab) => {
    setActiveTab(newTab);
    setOutputResult('');
    setSavedSuccess(false);

    // If prompt is empty or one of defaults, switch to the new tab default
    const isDefault = Object.values(tabDefaultPrompts).some((p) => p === inputPrompt);
    if (!inputPrompt.trim() || isDefault) {
      setInputPrompt(tabDefaultPrompts[newTab] || '');
    }
  };

  // Handle file import for Test Case Generator
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsingFile(true);
    setFileParseError('');

    try {
      const parsed = await parseRequirementsFile(file);
      setImportedFile(parsed);
      if (parsed.extractedText) {
        setInputPrompt(parsed.extractedText);
      } else {
        setFileParseError(
          'Could not extract readable text from this file. Please paste requirements directly.'
        );
      }
    } catch (err: any) {
      console.error('File parsing error:', err);
      setFileParseError(`Failed to parse file: ${err?.message || 'Unsupported format'}`);
    } finally {
      setIsParsingFile(false);
      // Reset input value so re-selecting same file triggers change
      e.target.value = '';
    }
  };

  // Chat agent specific state
  const [chatMessages, setChatMessages] = useState<
    { role: 'user' | 'assistant'; text: string; code?: string }[]
  >([
    {
      role: 'assistant',
      text: 'Hello! I am your IntelligentQA Senior SDET Mentor. Ask me anything about test architecture, fixing flakiness, designing CI/CD pipelines, or preparing for SDET technical interviews.',
    },
  ]);
  const [chatInput, setChatInput] = useState('');

  const abortControllerRef = useRef<AbortController | null>(null);
  const chatAbortControllerRef = useRef<AbortController | null>(null);

  const handleGenerate = async () => {
    if (!inputPrompt.trim()) return;

    // Strictly protect server quota: require user's Gemini key
    if (!geminiKey) {
      setOutputResult(
        'Error: Personal Gemini API Key is required to run AI agents. Please configure your free Google AI Studio key under AI Tools and Agents in the left navigation.'
      );
      return;
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;
    setIsGenerating(true);
    setOutputResult('');
    setSavedSuccess(false);

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (geminiKey) {
        headers['x-gemini-api-key'] = geminiKey;
      }

      // Combine user input with any attached project files context
      const fullInput =
        attachedProjectFiles.length > 0
          ? `${inputPrompt}\n\n${formatContextForAgents(attachedProjectFiles)}`
          : inputPrompt;

      const res = await fetch('/api/ai/qa-agent', {
        method: 'POST',
        headers,
        signal: controller.signal,
        body: JSON.stringify({
          action: activeTab,
          input: fullInput,
          techStack,
          apiKey: geminiKey,
          options: {
            coverage: coverageFilters,
            sourceFile: importedFile?.fileName,
            attachedFilesCount: attachedProjectFiles.length,
            mode: reviewMode,
          },
        }),
      });

      const data = await res.json();
      if (data.output) {
        setOutputResult(data.output);
        setUsedEngine(data.engine || 'intelligent-local');

        // Persist to local database automatically
        const userId = currentUser?.id || DEMO_USER.id;
        await QADatabase.saveArtifact(userId, {
          agentType: activeTab,
          title: inputPrompt.slice(0, 40) + '...',
          techStack,
          inputPrompt,
          outputContent: data.output,
        });
        setSavedSuccess(true);
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return;
      }
      console.error('Generation failed:', err);
      setOutputResult('Error generating agent response. Please check your network or try again.');
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  const handleSendChat = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();
    setChatMessages((prev) => [...prev, { role: 'user', text: userMsg }]);
    setChatInput('');
    const controller = new AbortController();
    chatAbortControllerRef.current = controller;
    setIsGenerating(true);

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (geminiKey) {
        headers['x-gemini-api-key'] = geminiKey;
      }

      const fullChatMessage =
        attachedProjectFiles.length > 0
          ? `${userMsg}\n\n${formatContextForAgents(attachedProjectFiles)}`
          : userMsg;

      const res = await fetch('/api/ai/qa-chat', {
        method: 'POST',
        headers,
        signal: controller.signal,
        body: JSON.stringify({
          message: fullChatMessage,
          apiKey: geminiKey,
        }),
      });
      const data = await res.json();
      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant', text: data.reply || 'Advisory response received.' },
      ]);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return;
      }
      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant', text: 'Sorry, unable to contact the SDET AI service right now.' },
      ]);
    } finally {
      setIsGenerating(false);
      chatAbortControllerRef.current = null;
    }
  };

  // Cancel Handler for all QA Generation Agents
  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (isGenerating) {
      setIsGenerating(false);
    } else {
      setInputPrompt('');
      setImportedFile(null);
      setFileParseError('');
    }
  };

  // Cancel Handler for SDET Mentor Chat
  const handleCancelChat = () => {
    if (chatAbortControllerRef.current) {
      chatAbortControllerRef.current.abort();
      chatAbortControllerRef.current = null;
    }
    if (isGenerating) {
      setIsGenerating(false);
    } else {
      setChatInput('');
    }
  };

  // Save Dropdown state
  const [showSaveDropdown, setShowSaveDropdown] = useState<boolean>(false);
  const saveDropdownRef = useRef<HTMLDivElement>(null);

  // Copy Dropdown state
  const [showCopyDropdown, setShowCopyDropdown] = useState<boolean>(false);
  const copyDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (saveDropdownRef.current && !saveDropdownRef.current.contains(e.target as Node)) {
        setShowSaveDropdown(false);
      }
      if (copyDropdownRef.current && !copyDropdownRef.current.contains(e.target as Node)) {
        setShowCopyDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getJsonPayload = () => {
    if (!outputResult) return null;
    let jsonPayload: any;
    if (activeTab === 'requirements') {
      const tableRows = parseAmbiguityTableToRows(outputResult);
      jsonPayload = {
        agent: 'Requirement Analyzer',
        tab: activeTab,
        timestamp: new Date().toISOString(),
        ambiguityItems: tableRows,
        content: outputResult,
      };
    } else if (activeTab === 'test_cases') {
      const tcRows = parseTestCaseTableToRows(outputResult);
      jsonPayload = {
        agent: 'Test Case Generator',
        tab: activeTab,
        timestamp: new Date().toISOString(),
        totalTestCases: new Set(tcRows.map((r) => r.testCaseNo)).size,
        totalSteps: tcRows.length,
        testCases: tcRows,
        content: outputResult,
      };
    } else {
      jsonPayload = {
        agent: AGENT_CONFIGS[activeTab]?.title || activeTab,
        tab: activeTab,
        techStack:
          activeTab === 'automation_code' || activeTab === 'code_review' ? techStack : undefined,
        timestamp: new Date().toISOString(),
        content: outputResult,
      };
    }
    return jsonPayload;
  };

  const copyToClipboard = () => {
    if (!outputResult) return;
    navigator.clipboard.writeText(outputResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyAsMarkdown = () => {
    copyToClipboard();
  };

  const copyAsJson = () => {
    const payload = getJsonPayload();
    if (!payload) return;
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadMarkdown = () => {
    if (!outputResult) return;
    const blob = new Blob([outputResult], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `intelligentqa-${activeTab}-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportExcel = () => {
    if (!outputResult) return;
    if (activeTab === 'requirements') {
      exportRequirementsToExcel(outputResult);
      return;
    }
    if (activeTab === 'test_cases') {
      exportTestMatrixToExcel(outputResult);
      return;
    }
    // Generic line/table exporter for automation code & code review
    const lines = outputResult.split('\n');
    const headers = ['Line #', 'Code / Analysis Content'];
    const dataRows = lines.map((l, idx) => [String(idx + 1), l]);
    const xml = generateExcelWorkbookXml(
      AGENT_CONFIGS[activeTab]?.title || 'Export',
      headers,
      dataRows
    );
    const blob = new Blob([xml], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `intelligentqa-${activeTab}-${Date.now()}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportJson = () => {
    const jsonPayload = getJsonPayload();
    if (!jsonPayload) return;
    const blob = new Blob([JSON.stringify(jsonPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `intelligentqa-${activeTab}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const currentAgent = AGENT_CONFIGS[activeTab] || AGENT_CONFIGS.requirements;
  const AgentIcon = currentAgent.icon;

  const getFileIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t === 'pdf') return <FileText className="w-3.5 h-3.5 text-rose-500 shrink-0" />;
    if (t === 'xlsx' || t === 'xls' || t === 'csv')
      return <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500 shrink-0" />;
    if (t === 'pptx' || t === 'ppt')
      return <Presentation className="w-3.5 h-3.5 text-amber-500 shrink-0" />;
    if (t === 'md' || t === 'txt' || t === 'json')
      return <FileCode className="w-3.5 h-3.5 text-cyan-500 shrink-0" />;
    return <FileCheck className="w-3.5 h-3.5 text-blue-500 shrink-0" />;
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header - Dynamically customized to the chosen QA Agent */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          {currentAgent.badgeText ? (
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400 mb-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              {currentAgent.badgeText}
            </div>
          ) : null}
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <AgentIcon className={`w-7 h-7 ${currentAgent.color}`} />
            {currentAgent.title}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1 max-w-3xl">
            {currentAgent.description}
          </p>
          {activeTab === 'code_review' && (
            <div className="mt-2.5 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowAgentSpecModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800 transition cursor-pointer"
                title="View code_reviewer_debugger_agent.md specification to learn how this Agent was designed"
              >
                <FileCode className="w-3.5 h-3.5 text-amber-500" />
                <span>View Agent (code_reviewer_debugger_agent.md)</span>
              </button>
              <span className="text-slate-500 dark:text-zinc-400 text-xs hidden sm:inline">
                • Learn how SDET Agents are architected
              </span>
            </div>
          )}
        </div>

        {/* Right Controls: Tech Stack (Only on code/audit tabs) & Spec View */}
        <div className="flex items-center gap-3 flex-wrap">
          {activeTab === 'code_review' && (
            <button
              type="button"
              onClick={() => setShowAgentSpecModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/60 transition cursor-pointer shadow-xs"
              title="Inspect code_reviewer_debugger_agent.md specification"
            >
              <FileCode className="w-3.5 h-3.5 text-amber-500" />
              <span>View Agent</span>
            </button>
          )}

          {/* Tech Stack Selector: STRICTLY visible only for Automation Generator and Code Auditor */}
          {(activeTab === 'automation_code' || activeTab === 'code_review') && (
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs">
              <span className="text-slate-500 font-medium px-2">Stack:</span>
              <button
                onClick={() => setTechStack('playwright-ts')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                  techStack === 'playwright-ts'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                Playwright TS
              </button>
              <button
                onClick={() => setTechStack('selenium-java')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                  techStack === 'selenium-java'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                Selenium Java
              </button>
              <button
                onClick={() => setTechStack('restassured')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                  techStack === 'restassured'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                REST Assured
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Guidance Banners */}
      {!currentUser ? (
        <div className="p-3.5 bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 rounded-2xl flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2 text-sky-900 dark:text-sky-200">
            <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0" />
            <span>
              <strong>Guest Preview Mode:</strong> Test any QA Agent below. Create a free account to
              persist generated test plans, code, and test matrices permanently.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/signup"
              className="py-1 px-3 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg text-xs transition-colors"
            >
              Sign Up Free
            </Link>
            <Link
              href="/login"
              className="py-1 px-3 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
            >
              Log In
            </Link>
          </div>
        </div>
      ) : !geminiKey && aiPref === 'opted_out' ? (
        <div className="p-3.5 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-2xl flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-200">
            <BookOpen className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>
              <strong>Core Automation Mode Active:</strong> You chose to learn core automation
              first. Whenever you want to activate Autonomous AI Agents, connect your personal free
              Google AI Studio key at $0.00 cost.
            </span>
          </div>
          <button
            onClick={() => setShowKeyModal(true)}
            className="py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Activate Free AI Features
          </button>
        </div>
      ) : !geminiKey ? (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-2xl flex items-center justify-between flex-wrap gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-amber-900 dark:text-amber-200">
            <Lock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>AI Agents Disabled:</strong> All automated test generation and quality audits
              are disabled until you configure your personal free Gemini key under{' '}
              <strong>AI Tools and Agents</strong> in the left navigation to prevent shared server
              token burn.
            </span>
          </div>
          <button
            onClick={() => setShowKeyModal(true)}
            className="py-1.5 px-3.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs transition-colors shrink-0 cursor-pointer"
          >
            Configure Key →
          </button>
        </div>
      ) : null}

      {/* Main Workspace Area */}
      {activeTab === 'gap_analysis' ? (
        <CoverageGapAnalyzer apiKey={geminiKey} onOpenKeyModal={() => setShowKeyModal(true)} />
      ) : activeTab !== 'chat' ? (
        <div
          ref={splitContainerRef}
          className={`flex flex-col lg:flex-row items-stretch gap-6 lg:gap-0 relative ${
            isDragging ? 'select-none cursor-col-resize' : ''
          }`}
        >
          {/* LEFT COLUMN: Tailored Input Prompt, File Import, & Triggers */}
          <div
            style={isLg ? { width: `calc(${reqSplitPercent}% - 8px)` } : undefined}
            className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 md:p-6 space-y-4 shadow-sm flex flex-col justify-between ${
              isLg ? 'shrink-0 min-w-[280px]' : ''
            }`}
          >
            <div className="space-y-3.5">
              {/* Header Label: Strict target visibility */}
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  {activeTab === 'requirements' && (
                    <>
                      <FileText className="w-4 h-4 text-cyan-500" />
                      <span>Requirements Analysis</span>
                    </>
                  )}
                  {activeTab === 'test_cases' && (
                    <>
                      <ListChecks className="w-4 h-4 text-emerald-500" />
                      <span>Import Requirements</span>
                    </>
                  )}
                  {activeTab === 'automation_code' && (
                    <>
                      <Code2 className="w-4 h-4 text-indigo-500" />
                      <span>Test Scenario to Automate</span>
                    </>
                  )}
                  {activeTab === 'code_review' && (
                    <>
                      <ShieldCheck className="w-4 h-4 text-amber-500" />
                      <span>Automation Code to Audit</span>
                    </>
                  )}
                </label>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Target is STRICTLY HIDDEN on Requirement Generator and Test Case Generator */}
                  {activeTab === 'automation_code' || activeTab === 'code_review' ? (
                    <span className="text-[11px] text-slate-400">
                      Target:{' '}
                      <strong className="text-emerald-600 font-semibold">{techStack}</strong>
                    </span>
                  ) : null}

                  {/* Mode Selector for Code Reviewer Agent */}
                  {activeTab === 'code_review' && (
                    <div className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-300 dark:border-slate-700 text-[11px]">
                      <button
                        type="button"
                        onClick={() => setReviewMode('review_and_fix')}
                        className={`px-2 py-0.5 rounded-md font-semibold transition cursor-pointer ${
                          reviewMode === 'review_and_fix'
                            ? 'bg-amber-500 text-white shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                        title="Review code and provide complete corrected drop-in code"
                      >
                        Review &amp; Fix
                      </button>
                      <button
                        type="button"
                        onClick={() => setReviewMode('review_only')}
                        className={`px-2 py-0.5 rounded-md font-semibold transition cursor-pointer ${
                          reviewMode === 'review_only'
                            ? 'bg-amber-500 text-white shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                        title="Analyze and report findings without changing code"
                      >
                        Review Only
                      </button>
                    </div>
                  )}

                  {/* Attach Project Files Button */}
                  <button
                    type="button"
                    onClick={handleOpenAttachModal}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer shadow-xs ${
                      attachedProjectFiles.length > 0
                        ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-400 dark:border-blue-700 text-blue-700 dark:text-blue-300 font-bold'
                        : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-zinc-300'
                    }`}
                    title="Attach project requirements, test matrices, specs (.pdf, .md, .xlsx, .pptx) into agent context"
                  >
                    <Paperclip className="w-3.5 h-3.5 text-blue-500" />
                    <span>Attach Project Files</span>
                    {attachedProjectFiles.length > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full bg-blue-600 text-white font-mono text-[10px]">
                        {attachedProjectFiles.length}
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* Attached Project Files Tray */}
              {attachedProjectFiles.length > 0 && (
                <div className="p-3 bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 dark:text-blue-200">
                      <FolderKanban className="w-4 h-4 text-blue-500" />
                      <span>
                        Attached Project Context ({attachedProjectFiles.length} file
                        {attachedProjectFiles.length > 1 ? 's' : ''})
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleOpenAttachModal}
                        className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                      >
                        + Add More
                      </button>
                      <button
                        type="button"
                        onClick={() => setAttachedProjectFiles([])}
                        className="text-[11px] font-semibold text-slate-400 hover:text-rose-500 cursor-pointer"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {attachedProjectFiles.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 text-xs shadow-2xs"
                      >
                        {getFileIcon(file.type)}
                        <span className="font-semibold text-slate-900 dark:text-white truncate max-w-[150px]">
                          {file.name}
                        </span>
                        <span className="text-[10px] text-blue-600 dark:text-blue-400 font-mono">
                          ({(file.size / 1024).toFixed(1)}KB)
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setAttachedProjectFiles((prev) => prev.filter((f) => f.id !== file.id))
                          }
                          className="p-0.5 text-slate-400 hover:text-rose-500 rounded cursor-pointer"
                          title="Remove from context"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <p className="text-[11px] text-blue-700 dark:text-blue-300">
                    ✓ Grounding Active: The agent will ingest the extracted requirements from these{' '}
                    {attachedProjectFiles.length} file(s) into its prompt context.
                  </p>
                </div>
              )}

              {/* SPECIALIZED FEATURE: File Import (Word, Excel, PDF) for Requirement Analyzer and Test Case Generator */}
              {(activeTab === 'requirements' || activeTab === 'test_cases') && (
                <div className="bg-slate-50 dark:bg-slate-950/70 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-cyan-500/70 dark:hover:border-cyan-500/70 rounded-xl p-3.5 space-y-2 transition-colors">
                  {!importedFile ? (
                    <div>
                      <input
                        type="file"
                        id="test-case-file-import"
                        accept=".docx,.xlsx,.xls,.csv,.pdf,.txt,.md"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <label
                        htmlFor="test-case-file-import"
                        className="cursor-pointer flex flex-col items-center justify-center gap-1.5 py-1.5"
                      >
                        <div
                          className={`w-9 h-9 rounded-full ${
                            activeTab === 'requirements'
                              ? 'bg-cyan-100 dark:bg-cyan-950/80 text-cyan-600 dark:text-cyan-400'
                              : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400'
                          } flex items-center justify-center shadow-sm`}
                        >
                          <UploadCloud className="w-5 h-5" />
                        </div>
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {activeTab === 'requirements'
                            ? 'Import Requirements Document (.docx, .xlsx, .pdf, text)'
                            : 'Import Requirements Document'}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center max-w-sm">
                          {activeTab === 'requirements' ? (
                            <>
                              Upload your requirements file (<strong>Word .docx</strong>,{' '}
                              <strong>Excel .xlsx / .xls / .csv</strong>, <strong>PDF</strong>, or
                              text) to detect ambiguities and inconsistencies automatically.
                            </>
                          ) : (
                            <>
                              Upload your requirements file (<strong>Excel .xlsx / .csv</strong>,{' '}
                              <strong>Word .docx</strong>, <strong>PDF .pdf</strong>, or text) to
                              generate test cases automatically.
                            </>
                          )}
                        </p>
                      </label>

                      {isParsingFile && (
                        <div
                          className={`flex items-center justify-center gap-2 text-xs ${
                            activeTab === 'requirements' ? 'text-cyan-600' : 'text-emerald-600'
                          } py-1 font-semibold`}
                        >
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Extracting requirements from document...</span>
                        </div>
                      )}
                      {fileParseError && (
                        <div className="text-xs text-rose-500 font-medium py-1 text-center">
                          {fileParseError}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div
                      className={`flex items-center justify-between p-2.5 ${
                        activeTab === 'requirements'
                          ? 'bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-300 dark:border-cyan-800'
                          : 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800'
                      } rounded-lg text-left`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <FileSpreadsheet
                          className={`w-5 h-5 ${
                            activeTab === 'requirements' ? 'text-cyan-600' : 'text-emerald-600'
                          } shrink-0`}
                        />
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {importedFile.fileName}
                          </div>
                          <div
                            className={`text-[10px] ${
                              activeTab === 'requirements'
                                ? 'text-cyan-600 dark:text-cyan-400'
                                : 'text-emerald-600 dark:text-emerald-400'
                            } font-medium`}
                          >
                            {importedFile.summary} · {(importedFile.fileSize / 1024).toFixed(1)} KB
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setImportedFile(null);
                          setInputPrompt(tabDefaultPrompts[activeTab]);
                        }}
                        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-500 hover:text-slate-800 dark:hover:text-white text-xs shrink-0 cursor-pointer"
                        title="Remove file"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Textarea Input */}
              <textarea
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                rows={activeTab === 'test_cases' ? 8 : 11}
                className="w-full p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none leading-relaxed"
                placeholder={
                  activeTab === 'requirements'
                    ? 'Paste your requirements, user story, PRD notes, or acceptance criteria here to detect ambiguities, inconsistencies, and undefined expectations (e.g., "The system should process payments quickly and notify users when transactions are completed.")'
                    : activeTab === 'test_cases'
                      ? 'Paste requirement text or import an Excel/Word/PDF document above to synthesize positive, negative, and boundary test cases...'
                      : activeTab === 'code_review'
                        ? 'Paste your test automation code to inspect for flakiness, hardcoded waits (Thread.sleep/waitForTimeout), and brittle XPaths...'
                        : 'Describe the feature or workflow to generate Page Object Model code for...'
                }
              />

              {/* Quick Presets tailored to active agent */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-400">
                  {activeTab === 'requirements'
                    ? 'Sample Requirements to Analyze:'
                    : activeTab === 'test_cases'
                      ? 'Sample Test Case Requirements:'
                      : activeTab === 'code_review'
                        ? 'Sample Flaky Scripts:'
                        : 'Sample Automation Workflows:'}
                </span>
                <div className="flex flex-wrap gap-1.5 text-[11px]">
                  {activeTab === 'requirements' && (
                    <>
                      <button
                        onClick={() =>
                          setInputPrompt(
                            'The system should process payments quickly and notify users when transactions are completed.'
                          )
                        }
                        className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg cursor-pointer"
                        title="Direct Chat Input (Test 1)"
                      >
                        Payment Notification
                      </button>
                      <button
                        onClick={() =>
                          setInputPrompt('Users should be able to manage their profiles.')
                        }
                        className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg cursor-pointer"
                        title="Functional Ambiguity (Test 2)"
                      >
                        Profile CRUD
                      </button>
                      <button
                        onClick={() =>
                          setInputPrompt(
                            'The application should handle failed login attempts appropriately.'
                          )
                        }
                        className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg cursor-pointer"
                        title="Behavioural Ambiguity (Test 3)"
                      >
                        Failed Login
                      </button>
                      <button
                        onClick={() => setInputPrompt('Eligible customers can receive discounts.')}
                        className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg cursor-pointer"
                        title="Conditional Ambiguity (Test 4)"
                      >
                        Discounts
                      </button>
                      <button
                        onClick={() =>
                          setInputPrompt('Expired accounts should be deactivated automatically.')
                        }
                        className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg cursor-pointer"
                        title="Temporal Ambiguity (Test 5)"
                      >
                        Account Expiry
                      </button>
                      <button
                        onClick={() =>
                          setInputPrompt(
                            'The application should provide fast and user-friendly search.'
                          )
                        }
                        className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg cursor-pointer"
                        title="Semantic Ambiguity (Test 6)"
                      >
                        Fast Search
                      </button>
                      <button
                        onClick={() =>
                          setInputPrompt('Refunds must be approved before they are processed.')
                        }
                        className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg cursor-pointer"
                        title="Process Ambiguity (Test 7)"
                      >
                        Refund Approvals
                      </button>
                      <button
                        onClick={() =>
                          setInputPrompt(
                            'The application should support a high number of concurrent transactions.'
                          )
                        }
                        className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg cursor-pointer"
                        title="Quantitative Ambiguity (Test 8)"
                      >
                        High Concurrency
                      </button>
                      <button
                        onClick={() =>
                          setInputPrompt(
                            'Feature: Dual Notification Dispatch. The user must always receive SMS alerts and simultaneously cannot receive any SMS messages when notification is disabled. These conflicting rules apply.'
                          )
                        }
                        className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-rose-500 rounded-lg cursor-pointer"
                        title="Conflicting Requirements (Test 11)"
                      >
                        Conflicting Rules
                      </button>
                      <button
                        onClick={() =>
                          setInputPrompt(
                            'The user must enter a password containing at least 12 characters, including one uppercase letter, one lowercase letter, one digit and one special character.'
                          )
                        }
                        className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-emerald-500 rounded-lg cursor-pointer"
                        title="Clear Requirement (Test 12)"
                      >
                        Clear Password Spec
                      </button>
                    </>
                  )}

                  {activeTab === 'test_cases' && (
                    <>
                      <button
                        onClick={() =>
                          setInputPrompt(
                            'User Account Transfer Workflow with 2FA Verification, Daily Limits ($10,000 max), and Idempotent Transaction Submissions.'
                          )
                        }
                        className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg cursor-pointer"
                      >
                        Payment Gateway Matrix
                      </button>
                      <button
                        onClick={() =>
                          setInputPrompt(
                            'User Registration Workflow: Email verification with 6-digit OTP (expires in 5 mins), password strength validation (8+ chars, symbol, number), and terms checkbox.'
                          )
                        }
                        className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg cursor-pointer"
                      >
                        Registration &amp; OTP
                      </button>
                      <button
                        onClick={() =>
                          setInputPrompt(
                            'Search & Filter Product Catalog: Filter by Category, Price Range Slider ($0 - $500), Rating (1-5 stars), and Sort by (Price Asc/Desc, Newest).'
                          )
                        }
                        className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg cursor-pointer"
                      >
                        Filter &amp; Pagination
                      </button>
                    </>
                  )}

                  {activeTab === 'automation_code' && (
                    <>
                      <button
                        onClick={() =>
                          setInputPrompt(
                            'Feature: User Login Workflow with email and password inputs, submit button, and welcome message verification. Write Page Object Model with web-first assertions.'
                          )
                        }
                        className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg cursor-pointer"
                      >
                        Web POM Login
                      </button>
                      <button
                        onClick={() =>
                          setInputPrompt(
                            'REST API: POST /api/v1/auth/login with valid credentials, verify 200 OK, extract JWT bearer token, and send authenticated GET /api/v1/users/profile.'
                          )
                        }
                        className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg cursor-pointer"
                      >
                        API Chained Auth
                      </button>
                    </>
                  )}

                  {activeTab === 'code_review' && (
                    <>
                      <button
                        onClick={() =>
                          setInputPrompt(
                            '// TEST 1: Playwright code with fixed timeout where locator assertion is appropriate\ntest("checkout order workflow", async ({ page }) => {\n  await page.goto("/checkout");\n  await page.click("#checkout");\n  await page.waitForTimeout(5000); // Fixed timeout sleep\n  await page.click("#confirm");\n});'
                          )
                        }
                        className="px-2 py-1 bg-amber-100 dark:bg-amber-950/60 hover:bg-amber-200 dark:hover:bg-amber-900 text-amber-800 dark:text-amber-200 font-medium rounded-lg cursor-pointer"
                        title="TEST 1: Fixed timeout sleep vs web-first assertion"
                      >
                        TEST 1: Playwright Timeout
                      </button>
                      <button
                        onClick={() =>
                          setInputPrompt(
                            '// TEST 2: Selenium Java code with missing driver cleanup\npackage com.enterprise.qa;\n\nimport org.openqa.selenium.WebDriver;\nimport org.openqa.selenium.chrome.ChromeDriver;\nimport org.testng.annotations.Test;\n\npublic class UserLoginTest {\n    @Test\n    public void testUserAuthentication() {\n        WebDriver driver = new ChromeDriver();\n        driver.get("https://app.enterprise.io/login");\n        // Missing @AfterMethod or teardown calling driver.quit()\n    }\n}'
                          )
                        }
                        className="px-2 py-1 bg-amber-100 dark:bg-amber-950/60 hover:bg-amber-200 dark:hover:bg-amber-900 text-amber-800 dark:text-amber-200 font-medium rounded-lg cursor-pointer"
                        title="TEST 2: Selenium WebDriver missing driver.quit() cleanup"
                      >
                        TEST 2: Selenium Lifecycle
                      </button>
                      <button
                        onClick={() =>
                          setInputPrompt(
                            '// TEST 3: REST Assured code with missing response assertions\npackage com.enterprise.qa.api;\n\nimport io.restassured.RestAssured;\nimport static io.restassured.RestAssured.given;\nimport org.testng.annotations.Test;\n\npublic class AuthApiTest {\n    @Test\n    public void testLoginApi() {\n        given()\n            .contentType("application/json")\n            .body("{\\"email\\":\\"user@enterprise.io\\", \\"password\\":\\"Secret123\\"}")\n        .when()\n            .post("/api/v1/auth/login");\n        // Missing .then().statusCode(200) or response body validations!\n    }\n}'
                          )
                        }
                        className="px-2 py-1 bg-amber-100 dark:bg-amber-950/60 hover:bg-amber-200 dark:hover:bg-amber-900 text-amber-800 dark:text-amber-200 font-medium rounded-lg cursor-pointer"
                        title="TEST 3: REST Assured missing HTTP status and body assertions"
                      >
                        TEST 3: REST Assured Assertions
                      </button>
                      <button
                        onClick={() =>
                          setInputPrompt(
                            '// TEST 4: Test containing hardcoded API token\nconst axios = require("axios");\n\ndescribe("Payments Gateway API Tests", () => {\n  const API_KEY = "Bearer sk_live_9a8b7c6d5e4f3a2b1c0d_prod_secret_token"; // Hardcoded token\n\n  it("should retrieve billing invoice", async () => {\n    const res = await axios.get("https://api.gateway.io/v1/invoices", {\n      headers: { Authorization: API_KEY },\n    });\n    expect(res.status).toBe(200);\n  });\n});'
                          )
                        }
                        className="px-2 py-1 bg-red-100 dark:bg-red-950/60 hover:bg-red-200 dark:hover:bg-red-900 text-red-800 dark:text-red-200 font-medium rounded-lg cursor-pointer"
                        title="TEST 4: Hardcoded secret token security defect"
                      >
                        TEST 4: Security Token
                      </button>
                      <button
                        onClick={() =>
                          setInputPrompt(
                            '// TEST 5: Uploaded multi-file framework project\n--- File: src/test/java/com/enterprise/qa/base/BaseTest.java ---\npackage com.enterprise.qa.base;\nimport org.openqa.selenium.WebDriver;\nimport org.openqa.selenium.chrome.ChromeDriver;\nimport org.testng.annotations.BeforeMethod;\npublic class BaseTest {\n    public static WebDriver driver; // Static driver causes parallel collision\n    @BeforeMethod\n    public void setup() {\n        driver = new ChromeDriver();\n    }\n    // Missing @AfterMethod teardown\n}\n\n--- File: src/main/java/com/enterprise/qa/pages/LoginPage.java ---\npackage com.enterprise.qa.pages;\nimport org.openqa.selenium.By;\nimport org.openqa.selenium.WebDriver;\nimport org.testng.Assert;\npublic class LoginPage {\n    private WebDriver driver;\n    public LoginPage(WebDriver driver) { this.driver = driver; }\n    public void login(String user, String pass) {\n        driver.findElement(By.id("user")).sendKeys(user);\n        driver.findElement(By.id("pass")).sendKeys(pass);\n        driver.findElement(By.id("loginBtn")).click();\n        Assert.assertTrue(driver.findElement(By.id("dashboard")).isDisplayed()); // Assertion in POM!\n    }\n}\n\n--- File: src/test/java/com/enterprise/qa/tests/LoginTest.java ---\npackage com.enterprise.qa.tests;\nimport com.enterprise.qa.base.BaseTest;\nimport com.enterprise.qa.pages.LoginPage;\nimport org.testng.annotations.Test;\npublic class LoginTest extends BaseTest {\n    @Test\n    public void testLogin() {\n        driver.get("https://app.enterprise.io/login");\n        LoginPage loginPage = new LoginPage(driver);\n        loginPage.login("admin", "admin123");\n    }\n}'
                          )
                        }
                        className="px-2 py-1 bg-indigo-100 dark:bg-indigo-950/60 hover:bg-indigo-200 dark:hover:bg-indigo-900 text-indigo-800 dark:text-indigo-200 font-medium rounded-lg cursor-pointer"
                        title="TEST 5: Multi-file framework architectural analysis"
                      >
                        TEST 5: Multi-File Framework
                      </button>
                      <button
                        onClick={() =>
                          setInputPrompt(
                            'test("checkout", async ({ page }) => {\n  await page.click("#checkout");\n  await page.waitForTimeout(5000);\n  await page.click("#confirm");\n});'
                          )
                        }
                        className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg cursor-pointer"
                      >
                        Mode B: Flaky Sleep
                      </button>
                      <button
                        onClick={() =>
                          setInputPrompt(
                            'WebElement btn = driver.findElement(By.xpath("/html/body/div[2]/div[1]/form/div[4]/button"));\nbtn.click();\nThread.sleep(3000);'
                          )
                        }
                        className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg cursor-pointer"
                      >
                        Mode B: Brittle XPath
                      </button>
                      <button
                        onClick={() =>
                          setInputPrompt(
                            'org.openqa.selenium.StaleElementReferenceException: stale element reference: stale element not found in the current frame\n  (Session info: chrome=122.0.6261.94)\n  at org.openqa.selenium.remote.ErrorCodec.decode(ErrorCodec.java:167)\n  at org.openqa.selenium.By$ByXPath.findElement(By.java:353)\n  at com.company.qa.pages.CheckoutPage.clickConfirm(CheckoutPage.java:42)\n  at com.company.qa.tests.CheckoutTest.testCheckout(CheckoutTest.java:28)'
                          )
                        }
                        className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg cursor-pointer"
                      >
                        Mode A: StaleElement Trace
                      </button>
                      <button
                        onClick={() =>
                          setInputPrompt(
                            'TimeoutError: page.waitForSelector: Timeout 30000ms exceeded.\n=========================== logs ===========================\nwaiting for locator("#submit-order") to be visible\n============================================================\n  at /tests/e2e/payment.spec.ts:34:16'
                          )
                        }
                        className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg cursor-pointer"
                      >
                        Mode A: TimeoutError Trace
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Action Trigger Button */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
              <span className="text-xs text-slate-400">
                {!geminiKey ? '● AI Disabled (Key Required)' : ''}
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={!isGenerating && !inputPrompt.trim() && !importedFile}
                  className="py-3 px-5 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-sm transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Cancel generation or clear input"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={!geminiKey || isGenerating || !inputPrompt.trim()}
                  className="py-3 px-6 bg-gradient-to-r from-emerald-600 to-indigo-600 hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  {!geminiKey ? (
                    <>
                      <Lock className="w-4 h-4" />
                      Gemini Key Required (Disabled)
                    </>
                  ) : isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      {activeTab === 'requirements'
                        ? 'Analyzing Requirements...' /* 'Generating Requirements...' */
                        : activeTab === 'test_cases'
                          ? 'Generating Test Cases...'
                          : activeTab === 'automation_code'
                            ? 'Generating Code...'
                            : 'Auditing Code...'}
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      {/* Rename button specifically for Requirement Generator (Req 2) and Test Case Generator (Req 4) */}
                      {activeTab === 'requirements'
                        ? 'Analyze Requirements' /* 'Generate Requirements' */
                        : activeTab === 'test_cases'
                          ? 'Generate Test Cases'
                          : activeTab === 'automation_code'
                            ? 'Generate Automation Code'
                            : 'Audit & Refactor Code'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Resizer Divider Bar (Across all QA Agent pages on desktop) */}
          <div
            onPointerDown={handleResizePointerDown}
            onDoubleClick={() => setReqSplitPercent(50)}
            className="hidden lg:flex flex-col items-center justify-center w-6 -mx-2 group cursor-col-resize z-10 shrink-0 select-none py-4"
            title="Drag to resize panels (Double-click to reset to 50:50)"
          >
            {/* Quick preset ratio buttons */}
            <div className="flex flex-col gap-1 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setReqSplitPercent(35);
                }}
                className="px-1 py-0.5 text-[9px] font-mono rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-cyan-500 hover:text-white"
                title="Preset 35:65"
              >
                35:65
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setReqSplitPercent(50);
                }}
                className="px-1 py-0.5 text-[9px] font-mono rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-cyan-500 hover:text-white"
                title="Preset 50:50"
              >
                50:50
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setReqSplitPercent(65);
                }}
                className="px-1 py-0.5 text-[9px] font-mono rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-cyan-500 hover:text-white"
                title="Preset 65:35"
              >
                65:35
              </button>
            </div>

            <div
              className={`w-1.5 h-full min-h-[300px] rounded-full transition-all flex items-center justify-center ${
                isDragging
                  ? 'bg-cyan-500 shadow-md ring-2 ring-cyan-400/50'
                  : 'bg-slate-200 dark:bg-slate-700/80 group-hover:bg-cyan-400 group-hover:w-2'
              }`}
            >
              <GripVertical
                className={`w-3.5 h-3.5 transition-colors ${
                  isDragging
                    ? 'text-white'
                    : 'text-slate-400 dark:text-slate-500 group-hover:text-cyan-900 dark:group-hover:text-cyan-100'
                }`}
              />
            </div>
          </div>

          {/* RIGHT COLUMN: Tailored Output Artifact with Unified Save */}
          <div
            style={isLg ? { width: `calc(${100 - reqSplitPercent}% - 8px)` } : undefined}
            className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 md:p-6 space-y-4 shadow-sm flex flex-col justify-between ${
              isLg ? 'flex-1 min-w-[320px]' : ''
            }`}
          >
            <div className="space-y-3 flex-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <span>
                    {activeTab === 'requirements'
                      ? 'Requirement Ambiguity Analysis'
                      : activeTab === 'test_cases'
                        ? 'Test case Generated'
                        : activeTab === 'automation_code'
                          ? 'Scaffolded Automation Code'
                          : 'Quality Audit & Refactoring Report'}
                  </span>
                </label>

                {outputResult && (
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* View Switcher for Requirements */}
                    {activeTab === 'requirements' &&
                      parseAmbiguityTableToRows(outputResult).length > 0 && (
                        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                          <button
                            type="button"
                            onClick={() => setReqViewMode('table')}
                            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition cursor-pointer ${
                              reqViewMode === 'table'
                                ? 'bg-cyan-600 text-white shadow-xs'
                                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                            }`}
                          >
                            Table View
                          </button>
                          <button
                            type="button"
                            onClick={() => setReqViewMode('raw')}
                            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition cursor-pointer ${
                              reqViewMode === 'raw'
                                ? 'bg-cyan-600 text-white shadow-xs'
                                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                            }`}
                          >
                            Markdown
                          </button>
                        </div>
                      )}

                    {/* View Switcher for Test Cases */}
                    {activeTab === 'test_cases' &&
                      parseTestCaseTableToRows(outputResult).length > 0 && (
                        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                          <button
                            type="button"
                            onClick={() => setTcViewMode('table')}
                            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition cursor-pointer ${
                              tcViewMode === 'table'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                            }`}
                          >
                            Table View
                          </button>
                          <button
                            type="button"
                            onClick={() => setTcViewMode('raw')}
                            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition cursor-pointer ${
                              tcViewMode === 'raw'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                            }`}
                          >
                            Markdown
                          </button>
                        </div>
                      )}

                    {/* Unified COPY Dropdown across all QA Agents */}
                    <div className="relative inline-block text-left" ref={copyDropdownRef}>
                      <button
                        type="button"
                        onClick={() => {
                          setShowCopyDropdown((prev) => !prev);
                          setShowSaveDropdown(false);
                        }}
                        className="p-1.5 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-lg text-xs flex items-center gap-1.5 transition-colors font-bold cursor-pointer shadow-xs"
                        title="Copy output"
                      >
                        {copied ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                        )}
                        <span>{copied ? 'COPIED!' : 'COPY'}</span>
                        <ChevronDown
                          className={`w-3.5 h-3.5 transition-transform duration-200 ${
                            showCopyDropdown ? 'rotate-180' : ''
                          }`}
                        />
                      </button>

                      {showCopyDropdown && (
                        <div className="absolute right-0 mt-1.5 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1.5 z-40 animate-in fade-in zoom-in-95">
                          <button
                            type="button"
                            onClick={() => {
                              copyAsMarkdown();
                              setShowCopyDropdown(false);
                            }}
                            className="w-full px-3 py-2 text-left text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer transition-colors"
                            title="Copy output as Markdown"
                          >
                            <FileCode className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                            <span className="font-medium">As Markdown (.md)</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              copyAsJson();
                              setShowCopyDropdown(false);
                            }}
                            className="w-full px-3 py-2 text-left text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer transition-colors"
                            title="Copy output as JSON"
                          >
                            <FileText className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            <span className="font-medium">As JSON (.json)</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Unified SAVE Dropdown across all QA Agents */}
                    <div className="relative inline-block text-left" ref={saveDropdownRef}>
                      <button
                        type="button"
                        onClick={() => {
                          setShowSaveDropdown((prev) => !prev);
                          setShowCopyDropdown(false);
                        }}
                        className="p-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs flex items-center gap-1.5 transition-colors font-bold cursor-pointer shadow-xs"
                        title="Save or Export output"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>SAVE</span>
                        <ChevronDown
                          className={`w-3.5 h-3.5 transition-transform duration-200 ${
                            showSaveDropdown ? 'rotate-180' : ''
                          }`}
                        />
                      </button>

                      {showSaveDropdown && (
                        <div className="absolute right-0 mt-1.5 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1.5 z-40 animate-in fade-in zoom-in-95">
                          <button
                            type="button"
                            onClick={() => {
                              copyToClipboard();
                              setShowSaveDropdown(false);
                            }}
                            className="w-full px-3 py-2 text-left text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer transition-colors"
                          >
                            {copied ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            ) : (
                              <Copy className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            )}
                            <span className="font-medium">{copied ? 'Copied!' : 'Copy'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              handleExportExcel();
                              setShowSaveDropdown(false);
                            }}
                            className="w-full px-3 py-2 text-left text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer transition-colors"
                            title="Export in Excel (.xlsx)"
                          >
                            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            <span className="font-medium">As Excel (.xlsx)</span>
                            <span className="sr-only">Export in Excel</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              downloadMarkdown();
                              setShowSaveDropdown(false);
                            }}
                            className="w-full px-3 py-2 text-left text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer transition-colors"
                          >
                            <FileCode className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                            <span className="font-medium">As Markdown (.md)</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              handleExportJson();
                              setShowSaveDropdown(false);
                            }}
                            className="w-full px-3 py-2 text-left text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            <span className="font-medium">As JSON (.json)</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Output Content Container */}
              <div className="min-h-[340px] max-h-[560px] overflow-y-auto p-4 bg-slate-950 text-slate-200 rounded-xl font-mono text-xs leading-relaxed border border-slate-800">
                {outputResult ? (
                  activeTab === 'requirements' &&
                  reqViewMode === 'table' &&
                  parseAmbiguityTableToRows(outputResult).length > 0 ? (
                    <div className="space-y-4 font-sans not-italic text-left">
                      {/* Structured Ambiguity Table */}
                      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60">
                        <table className="w-full text-left text-xs border-collapse min-w-[760px]">
                          <thead>
                            <tr className="border-b border-slate-800 bg-slate-900 text-slate-300 text-[11px] font-bold uppercase tracking-wider">
                              <th className="py-2.5 px-3 w-12 text-center">#</th>
                              <th className="py-2.5 px-3 min-w-[150px]">Ambiguity Title</th>
                              <th className="py-2.5 px-3 min-w-[200px]">Ambiguity</th>
                              <th className="py-2.5 px-3 min-w-[100px]">Type</th>
                              <th className="py-2.5 px-3 min-w-[80px]">Priority</th>
                              <th className="py-2.5 px-3 min-w-[100px]">Line Number</th>
                              <th className="py-2.5 px-3 min-w-[220px]">Recommendation</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/80">
                            {parseAmbiguityTableToRows(outputResult).map((row, idx) => (
                              <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                                <td className="py-2.5 px-3 text-center font-mono text-slate-400 font-bold text-[11px]">
                                  {row.serialNumber}
                                </td>
                                <td className="py-2.5 px-3 font-semibold text-slate-100">
                                  {row.title}
                                </td>
                                <td className="py-2.5 px-3 text-slate-300 leading-relaxed text-[11px]">
                                  {row.ambiguity}
                                </td>
                                <td className="py-2.5 px-3">
                                  <span
                                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold border ${
                                      row.type === 'Functional'
                                        ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                                        : row.type === 'Behavioural'
                                          ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                                          : row.type === 'Conditional'
                                            ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                                            : row.type === 'Temporal'
                                              ? 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                                              : row.type === 'Semantic'
                                                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                                                : row.type === 'Process'
                                                  ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
                                                  : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                                    }`}
                                  >
                                    {row.type}
                                  </span>
                                </td>
                                <td className="py-2.5 px-3">
                                  <span
                                    className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                      row.priority.toLowerCase() === 'high'
                                        ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                                        : row.priority.toLowerCase() === 'medium'
                                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                                          : 'bg-blue-500/20 text-blue-400 border-blue-500/40'
                                    }`}
                                  >
                                    {row.priority}
                                  </span>
                                </td>
                                <td className="py-2.5 px-3">
                                  <span className="font-mono text-[10px] text-cyan-300 bg-cyan-950/40 border border-cyan-800/60 px-1.5 py-0.5 rounded">
                                    {row.lineNumber}
                                  </span>
                                </td>
                                <td className="py-2.5 px-3 text-slate-300 leading-relaxed text-[11px]">
                                  {row.recommendation}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Summary Section */}
                      {outputResult.includes('## Analysis Summary') && (
                        <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-2 text-xs">
                          <div className="font-bold text-cyan-400 uppercase tracking-wider text-[11px]">
                            Analysis Summary &amp; Quality Assessment
                          </div>
                          <div className="text-slate-300 text-[11px] leading-relaxed whitespace-pre-wrap font-sans">
                            {outputResult
                              .split('## Analysis Summary')[1]
                              ?.split('## Questions Requiring')[0]
                              ?.trim()}
                          </div>
                        </div>
                      )}

                      {/* Clarification Questions Section */}
                      {outputResult.includes('## Questions Requiring') && (
                        <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-2 text-xs">
                          <div className="font-bold text-amber-400 uppercase tracking-wider text-[11px]">
                            Questions Requiring Business / Product Owner Clarification
                          </div>
                          <div className="text-slate-300 text-[11px] leading-relaxed whitespace-pre-wrap font-sans">
                            {outputResult
                              .split(
                                '## Questions Requiring Business/Product Owner Clarification'
                              )[1]
                              ?.trim()}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : activeTab === 'test_cases' &&
                    tcViewMode === 'table' &&
                    parseTestCaseTableToRows(outputResult).length > 0 ? (
                    <div className="space-y-4 font-sans not-italic text-left">
                      {/* Structured 8-Column Test Cases Matrix */}
                      {(() => {
                        const tcRows = parseTestCaseTableToRows(outputResult);
                        const uniqueTcs = new Set(tcRows.map((r) => r.testCaseNo));
                        const highCount = tcRows.filter(
                          (r) => r.risk.toLowerCase() === 'high'
                        ).length;
                        const medCount = tcRows.filter(
                          (r) => r.risk.toLowerCase() === 'medium'
                        ).length;
                        const lowCount = tcRows.filter(
                          (r) => r.risk.toLowerCase() === 'low'
                        ).length;

                        return (
                          <>
                            {/* Summary Metrics Banner */}
                            <div className="flex items-center justify-between flex-wrap gap-2 p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs">
                              <div className="flex items-center gap-3 flex-wrap">
                                <span className="text-slate-300 font-semibold">
                                  Test Cases:{' '}
                                  <strong className="text-emerald-400 font-mono text-sm">
                                    {uniqueTcs.size}
                                  </strong>
                                </span>
                                <span className="text-slate-500">|</span>
                                <span className="text-slate-300 font-semibold">
                                  Executable Steps:{' '}
                                  <strong className="text-cyan-400 font-mono text-sm">
                                    {tcRows.length}
                                  </strong>
                                </span>
                              </div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border bg-rose-500/20 text-rose-400 border-rose-500/40">
                                  {highCount} High Risk Steps
                                </span>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border bg-amber-500/20 text-amber-400 border-amber-500/40">
                                  {medCount} Med Risk
                                </span>
                                {lowCount > 0 && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border bg-emerald-500/20 text-emerald-400 border-emerald-500/40">
                                    {lowCount} Low Risk
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Structured 8-Column Table with Horizontal Scroll Support */}
                            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60 shadow-inner">
                              <table className="w-full text-left text-xs border-collapse min-w-[1080px]">
                                <thead>
                                  <tr className="border-b border-slate-800 bg-slate-900 text-slate-300 text-[11px] font-bold uppercase tracking-wider">
                                    <th className="py-2.5 px-3 min-w-[100px]">Test case No.</th>
                                    <th className="py-2.5 px-3 min-w-[210px]">
                                      Test Case Description
                                    </th>
                                    <th className="py-2.5 px-3 min-w-[170px]">Pre-Conditions</th>
                                    <th className="py-2.5 px-3 min-w-[120px]">
                                      Risk (High, Medium, Low)
                                    </th>
                                    <th className="py-2.5 px-3 w-16 text-center">Step Number</th>
                                    <th className="py-2.5 px-3 min-w-[240px]">
                                      Test Step Description
                                    </th>
                                    <th className="py-2.5 px-3 min-w-[150px]">Input Test Data</th>
                                    <th className="py-2.5 px-3 min-w-[240px]">Expected Result</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/80">
                                  {tcRows.map((row, idx) => (
                                    <tr
                                      key={idx}
                                      className="hover:bg-slate-800/40 transition-colors"
                                    >
                                      <td className="py-2.5 px-3 font-mono font-bold text-emerald-400 text-[11px] whitespace-nowrap">
                                        {row.testCaseNo}
                                      </td>
                                      <td className="py-2.5 px-3 font-medium text-slate-100 leading-snug">
                                        {row.testCaseDescription}
                                      </td>
                                      <td className="py-2.5 px-3 text-slate-300 text-[11px]">
                                        {row.preConditions}
                                      </td>
                                      <td className="py-2.5 px-3">
                                        <span
                                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                            row.risk.toLowerCase() === 'high'
                                              ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                                              : row.risk.toLowerCase() === 'medium'
                                                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                                                : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                                          }`}
                                        >
                                          {row.risk}
                                        </span>
                                      </td>
                                      <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-300 text-[11px]">
                                        {row.stepNumber}
                                      </td>
                                      <td className="py-2.5 px-3 text-slate-200 leading-relaxed text-[11px] whitespace-pre-wrap">
                                        {row.testStepDescription}
                                      </td>
                                      <td className="py-2.5 px-3">
                                        <span className="font-mono text-[11px] text-cyan-300 bg-cyan-950/40 border border-cyan-800/60 px-2 py-0.5 rounded inline-block whitespace-pre-wrap">
                                          {row.inputTestData}
                                        </span>
                                      </td>
                                      <td className="py-2.5 px-3 text-slate-200 leading-relaxed text-[11px] whitespace-pre-wrap">
                                        {row.expectedResult}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>

                            {/* Strategy Summary if present */}
                            {outputResult.includes('## 1. Test Strategy Summary') && (
                              <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-2 text-xs">
                                <div className="font-bold text-emerald-400 uppercase tracking-wider text-[11px]">
                                  Test Strategy &amp; Techniques
                                </div>
                                <div className="text-slate-300 text-[11px] leading-relaxed whitespace-pre-wrap font-sans">
                                  {outputResult
                                    .split('## 1. Test Strategy Summary')[1]
                                    ?.split('## 2. Scope of Testing')[0]
                                    ?.trim()}
                                </div>
                              </div>
                            )}

                            {/* RTM if present */}
                            {outputResult.includes('## 7. Requirements Traceability Matrix') && (
                              <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-2 text-xs">
                                <div className="font-bold text-indigo-400 uppercase tracking-wider text-[11px]">
                                  Requirements Traceability Matrix (RTM)
                                </div>
                                <div className="text-slate-300 text-[11px] leading-relaxed whitespace-pre-wrap font-sans">
                                  {outputResult
                                    .split('## 7. Requirements Traceability Matrix (RTM)')[1]
                                    ?.split('## 8. Automation Suitability Matrix')[0]
                                    ?.trim()}
                                </div>
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap">{outputResult}</div>
                  )
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2 py-16">
                    <Terminal className="w-8 h-8 opacity-40" />
                    <p className="text-xs">
                      {activeTab === 'requirements'
                        ? 'Ambiguity analysis table, summary, and clarification questions will appear here after clicking Analyze Requirements.'
                        : activeTab === 'test_cases'
                          ? 'Test case Generated will appear here after clicking Generate Test Cases.'
                          : activeTab === 'automation_code'
                            ? 'Scaffolded Page Object Model code will appear here.'
                            : 'Code quality score and refactored script will appear here.'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Agent Handoffs from code_reviewer_debugger_agent.md */}
            {activeTab === 'code_review' && outputResult && (
              <div className="p-3.5 bg-amber-500/10 border border-amber-300 dark:border-amber-800 rounded-xl space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-300">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Agent Handoffs (from code_reviewer_debugger_agent.md)</span>
                  </div>
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono">
                    Multi-Agent Chain
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleHandoffToAutomation}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                    title="Send to Automation Generator to refactor full module"
                  >
                    <span>Refactor Full Suite → Agent 3</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleHandoffToTestCases}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                    title="Send to Test Case Generator to suggest edge-case tests"
                  >
                    <span>Generate Missing Edge Tests → Agent 2</span>
                  </button>
                </div>
              </div>
            )}

            {savedSuccess && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-xl text-emerald-700 dark:text-emerald-300 text-xs flex items-center justify-between gap-2 shadow-sm">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span className="font-semibold">
                    Artifact saved to your personal dashboard and history.
                  </span>
                </div>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-1 font-bold text-emerald-800 dark:text-emerald-200 hover:underline px-2.5 py-1 bg-emerald-100 dark:bg-emerald-900/60 rounded-lg text-xs"
                >
                  View on Dashboard →
                </Link>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* 5. Senior SDET Chat Mentor View */
        <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm flex flex-col h-[600px]">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 font-bold text-xs">
                    QA
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-none'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-none border border-slate-200/50 dark:border-slate-700/50'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isGenerating && (
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-500" />
                Senior SDET AI is formulating advice...
              </div>
            )}
          </div>

          {/* Chat Input & Attached Project Files */}
          <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
            {/* Attached Context Files Tray in Chat */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleOpenAttachModal}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer shadow-xs ${
                    attachedProjectFiles.length > 0
                      ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-400 dark:border-blue-700 text-blue-700 dark:text-blue-300 font-bold'
                      : 'bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-zinc-300'
                  }`}
                  title="Attach project requirements, test matrices, specs (.pdf, .md, .xlsx, .pptx) into mentor context"
                >
                  <Paperclip className="w-3.5 h-3.5 text-blue-500" />
                  <span>Attach Project Files</span>
                  {attachedProjectFiles.length > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-blue-600 text-white font-mono text-[10px]">
                      {attachedProjectFiles.length}
                    </span>
                  )}
                </button>
              </div>

              {attachedProjectFiles.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  {attachedProjectFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-100/70 dark:bg-blue-950/80 border border-blue-300 dark:border-blue-800 text-[11px] font-semibold text-blue-900 dark:text-blue-200"
                    >
                      {getFileIcon(file.type)}
                      <span className="truncate max-w-[120px]">{file.name}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setAttachedProjectFiles((prev) => prev.filter((f) => f.id !== file.id))
                        }
                        className="text-slate-400 hover:text-rose-500 cursor-pointer ml-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setAttachedProjectFiles([])}
                    className="text-[10px] text-slate-400 hover:text-rose-500 underline ml-1 cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <input
                type="text"
                disabled={!geminiKey}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                placeholder={
                  !geminiKey
                    ? 'Gemini API Key required in Left Navigation under AI Tools & Agents to chat...'
                    : 'Ask about locators, framework architecture, or attached project specs...'
                }
                className="flex-1 px-4 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                type="button"
                onClick={handleCancelChat}
                disabled={!isGenerating && !chatInput.trim()}
                className="py-3 px-4 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                title="Cancel chat message"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
              <button
                onClick={handleSendChat}
                disabled={!geminiKey || isGenerating || !chatInput.trim()}
                className="py-3 px-5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-colors flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed shrink-0 shadow-sm"
              >
                {!geminiKey ? <Lock className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                {!geminiKey ? 'Locked' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: ATTACH PROJECT FILES TO AGENT CONTEXT                 */}
      {/* ============================================================ */}
      {showAttachFilesModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs p-4 flex items-center justify-center min-h-screen">
          <div className="relative my-auto w-full max-w-2xl bg-white dark:bg-[#141414] border border-slate-200 dark:border-[#262626] rounded-3xl shadow-2xl p-6 space-y-4 max-h-[85vh] flex flex-col font-sans">
            <div className="flex items-start justify-between pb-3 border-b border-slate-200 dark:border-[#262626] shrink-0">
              <div className="flex items-center gap-2">
                <FolderKanban className="w-5 h-5 text-blue-500" />
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Attach Project Files to AI QA Agent Context
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Select multiple files using the checkboxes below to ground this agent with real
                    project documentation.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAttachFilesModal(false)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Controls: Folder Filter & Select All */}
            <div className="flex items-center justify-between gap-3 shrink-0 flex-wrap">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-semibold text-slate-600 dark:text-zinc-300">Folder:</span>
                <select
                  value={modalFolderFilter}
                  onChange={(e) => setModalFolderFilter(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-[#0F0F0F] border border-slate-300 dark:border-[#333] text-xs font-semibold text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                >
                  <option value="All">All Folders ({allProjectFiles.length})</option>
                  {allProjectFolders.map((folder) => {
                    const count = allProjectFiles.filter((f) => f.folder === folder).length;
                    return (
                      <option key={folder} value={folder}>
                        {folder} ({count})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const visibleFiles = allProjectFiles.filter(
                      (f) => modalFolderFilter === 'All' || f.folder === modalFolderFilter
                    );
                    const visibleIds = visibleFiles.map((f) => f.id);
                    const allVisibleSelected =
                      visibleIds.length > 0 &&
                      visibleIds.every((id) => selectedModalFileIds.includes(id));
                    if (allVisibleSelected) {
                      setSelectedModalFileIds((prev) =>
                        prev.filter((id) => !visibleIds.includes(id))
                      );
                    } else {
                      setSelectedModalFileIds((prev) =>
                        Array.from(new Set([...prev, ...visibleIds]))
                      );
                    }
                  }}
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  {(() => {
                    const visibleFiles = allProjectFiles.filter(
                      (f) => modalFolderFilter === 'All' || f.folder === modalFolderFilter
                    );
                    const visibleIds = visibleFiles.map((f) => f.id);
                    const allVisibleSelected =
                      visibleIds.length > 0 &&
                      visibleIds.every((id) => selectedModalFileIds.includes(id));
                    return allVisibleSelected ? 'Clear Folder' : 'Select All';
                  })()}
                </button>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {selectedModalFileIds.length} Selected
                </span>
              </div>
            </div>

            {/* Modal Files List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-[#242424] border border-slate-200 dark:border-[#262626] rounded-2xl">
              {allProjectFiles.filter(
                (f) => modalFolderFilter === 'All' || f.folder === modalFolderFilter
              ).length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 space-y-2">
                  <p>
                    No project files found in{' '}
                    {modalFolderFilter === 'All' ? 'the vault' : `folder "${modalFolderFilter}"`}.
                  </p>
                  <Link
                    href="/project-files"
                    className="text-blue-500 font-bold hover:underline inline-block"
                  >
                    Go to Project Files to upload documents →
                  </Link>
                </div>
              ) : (
                allProjectFiles
                  .filter((f) => modalFolderFilter === 'All' || f.folder === modalFolderFilter)
                  .map((file) => {
                    const isChecked = selectedModalFileIds.includes(file.id);

                    return (
                      <div
                        key={file.id}
                        onClick={() => {
                          setSelectedModalFileIds((prev) =>
                            prev.includes(file.id)
                              ? prev.filter((id) => id !== file.id)
                              : [...prev, file.id]
                          );
                        }}
                        className={`p-3 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-[#1C1C1C] cursor-pointer transition ${
                          isChecked ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <button
                            type="button"
                            className="text-slate-400 hover:text-blue-500 shrink-0"
                          >
                            {isChecked ? (
                              <CheckSquare className="w-4 h-4 text-blue-500" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>

                          <div className="flex items-center gap-2 min-w-0">
                            {getFileIcon(file.type)}
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                {file.name}
                              </div>
                              <div className="text-[10px] text-slate-500 dark:text-zinc-400 truncate">
                                {file.folder} • {(file.size / 1024).toFixed(1)} KB • {file.summary}
                              </div>
                            </div>
                          </div>
                        </div>

                        <span className="text-[10px] uppercase font-mono font-bold text-slate-400 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#222]">
                          .{file.type}
                        </span>
                      </div>
                    );
                  })
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-[#262626] shrink-0 flex-wrap gap-2">
              <Link
                href="/project-files"
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <span>Upload more in Project Files Vault</span>
                <ArrowRight className="w-3 h-3" />
              </Link>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAttachFilesModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-200 dark:bg-[#222] text-slate-700 dark:text-zinc-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const matched = allProjectFiles.filter((f) =>
                      selectedModalFileIds.includes(f.id)
                    );
                    setAttachedProjectFiles(matched);
                    setShowAttachFilesModal(false);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md cursor-pointer"
                >
                  Attach to Context ({selectedModalFileIds.length})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: VIEW AGENT SPECIFICATION (.md)                         */}
      {/* ============================================================ */}
      {showAgentSpecModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs p-4 flex items-center justify-center min-h-screen">
          <div className="relative my-auto w-full max-w-3xl bg-white dark:bg-[#141414] border border-slate-200 dark:border-[#262626] rounded-3xl shadow-2xl p-6 space-y-4 max-h-[90vh] flex flex-col font-sans">
            <div className="flex items-start justify-between pb-3 border-b border-slate-200 dark:border-[#262626] shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
                  <FileCode className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      code_reviewer_debugger_agent.md
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                      Agent Blueprint
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                    How Autonomous SDET Agents are architected with YAML frontmatter, tools,
                    handoffs, and execution modes.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAgentSpecModal(false)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* View Mode Toggle & Copy Action */}
            <div className="flex items-center justify-between gap-2 shrink-0 flex-wrap">
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#1C1C1C] p-1 rounded-xl border border-slate-200 dark:border-[#2A2A2A]">
                <button
                  type="button"
                  onClick={() => setAgentSpecTab('rendered')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    agentSpecTab === 'rendered'
                      ? 'bg-white dark:bg-[#282828] text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Architecture Guide
                </button>
                <button
                  type="button"
                  onClick={() => setAgentSpecTab('raw')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    agentSpecTab === 'raw'
                      ? 'bg-white dark:bg-[#282828] text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Raw Markdown (.md)
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(CODE_REVIEWER_DEBUGGER_AGENT_MD);
                  setCopiedAgentMd(true);
                  setTimeout(() => setCopiedAgentMd(false), 2000);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-[#222] hover:bg-slate-200 dark:hover:bg-[#2A2A2A] text-slate-700 dark:text-zinc-300 transition cursor-pointer border border-slate-300 dark:border-[#333]"
              >
                {copiedAgentMd ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{copiedAgentMd ? 'Copied .md!' : 'Copy Agent .md'}</span>
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {agentSpecTab === 'rendered' ? (
                <div className="space-y-4 text-xs leading-relaxed text-slate-700 dark:text-zinc-300">
                  {/* Frontmatter summary card */}
                  <div className="bg-slate-50 dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#2A2A2A] rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#2A2A2A] pb-2">
                      <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                        1. YAML Frontmatter Schema (Agent Metadata)
                      </span>
                      <span className="font-mono text-[10px] text-amber-500">
                        name: CodeReviewerAndDebugger
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div>
                        <strong className="text-slate-900 dark:text-white">Description:</strong>
                        <p className="text-slate-500 dark:text-zinc-400 mt-0.5">
                          Expert SDET Code Reviewer and Root-Cause Debugger for Selenium,
                          Playwright, Rest Assured and Appium. Analyzes stack traces, fixes flaky
                          tests, optimizes locators, and enforces clean code standards.
                        </p>
                      </div>
                      <div>
                        <strong className="text-slate-900 dark:text-white">Active Tools:</strong>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {['read', 'edit', 'search', 'file_upload/parse_context', 'execute'].map(
                            (tool) => (
                              <span
                                key={tool}
                                className="px-2 py-0.5 rounded-md font-mono text-[10px] bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                              >
                                {tool}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200 dark:border-[#2A2A2A]">
                      <strong className="text-slate-900 dark:text-white">
                        Multi-Agent Handoffs:
                      </strong>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1.5">
                        <div className="p-2.5 rounded-xl bg-white dark:bg-[#141414] border border-slate-200 dark:border-[#333]">
                          <div className="font-bold text-indigo-600 dark:text-indigo-400 text-[11px]">
                            Handoff 1: Refactor Full Suite
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-zinc-400">
                            Target: <strong>AutomationCodeGenerator</strong> (Agent 3)
                          </div>
                        </div>
                        <div className="p-2.5 rounded-xl bg-white dark:bg-[#141414] border border-slate-200 dark:border-[#333]">
                          <div className="font-bold text-emerald-600 dark:text-emerald-400 text-[11px]">
                            Handoff 2: Generate Missing Edge Tests
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-zinc-400">
                            Target: <strong>TestCaseGenerator</strong> (Agent 2)
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Core capabilities */}
                  <div className="bg-slate-50 dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#2A2A2A] rounded-2xl p-4 space-y-2">
                    <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                      2. Core Responsibilities &amp; Guardrails
                    </span>
                    <ul className="list-disc pl-4 space-y-1 text-slate-600 dark:text-zinc-300">
                      <li>
                        <strong>Root-Cause Stack Trace Analysis:</strong> Diagnose common automation
                        exceptions (StaleElementReferenceException, TimeoutError,
                        ElementClickInterceptedException, NullPointerException).
                      </li>
                      <li>
                        <strong>Flakiness Elimination:</strong> Detect race conditions, improper
                        waits, shared mutable state across threads, and brittle XPaths.
                      </li>
                      <li>
                        <strong>SDET Code Review:</strong> Page Object Model separation, SOLID
                        principles, exception handling, and assertion quality.
                      </li>
                      <li>
                        <strong>Strict Scope Guardrail:</strong> Declines non-QA/engineering
                        inquiries to stay laser-focused.
                      </li>
                    </ul>
                  </div>

                  {/* Execution Modes */}
                  <div className="bg-slate-50 dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#2A2A2A] rounded-2xl p-4 space-y-2">
                    <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                      3. Two Distinct Execution Modes
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div className="p-3 rounded-xl bg-white dark:bg-[#141414] border border-slate-200 dark:border-[#333] space-y-1">
                        <div className="font-bold text-amber-600 dark:text-amber-400">
                          Mode A: Debugging &amp; Error Resolution
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                          For error logs and failing stack traces: 1. Root Cause Explanation → 2.
                          Exact Fix with inline comments → 3. Prevention Checklist.
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-white dark:bg-[#141414] border border-slate-200 dark:border-[#333] space-y-1">
                        <div className="font-bold text-indigo-600 dark:text-indigo-400">
                          Mode B: Code Quality Review
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                          For pull requests and script audits: 1. Strengths → 2. Critical Issues
                          (Must Fix) → 3. Refactoring Recommendations.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <pre className="p-4 bg-slate-950 text-slate-200 rounded-2xl font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
                  {CODE_REVIEWER_DEBUGGER_AGENT_MD}
                </pre>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-[#262626] shrink-0">
              <span className="text-[11px] text-slate-400">
                Source: <code>code_reviewer_debugger_agent.md</code>
              </span>
              <button
                type="button"
                onClick={() => setShowAgentSpecModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-200 dark:bg-[#222] text-slate-700 dark:text-zinc-300 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gemini Key Modal */}
      <GeminiKeyModal
        isOpen={showKeyModal}
        onClose={() => setShowKeyModal(false)}
        onSaved={() => {
          syncState();
          setShowKeyModal(false);
        }}
        reason="Connect your personal free Google AI Studio key (15 RPM / 1,500 requests/day at zero cost) so all IntelligentQA autonomous agents execute in real-time with zero platform quota limits."
      />
    </div>
  );
}
