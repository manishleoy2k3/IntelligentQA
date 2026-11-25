'use client';

import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  FileSpreadsheet,
  FileCode,
  UploadCloud,
  X,
  Play,
  RotateCcw,
  Download,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronRight,
  Search,
  ArrowUpDown,
  Filter,
  Layers,
  PieChart as PieChartIcon,
  HelpCircle,
  Sparkles,
  ExternalLink,
  ShieldAlert,
  GripVertical,
} from 'lucide-react';
import {
  NormalizedRequirement,
  NormalizedTestCase,
  CoverageGapAnalysisResult,
  CoverageLevel,
  RequirementCoverageItem,
} from '@/types/coverage-gap';
import {
  parseFileForRequirements,
  parseFileForTestCases,
  parsePastedRequirements,
  parsePastedTestCases,
} from '@/lib/gap-analysis/input-parser';
import { generateCoverageGapExcelWorkbook } from '@/lib/gap-analysis/excel-export';

interface UploadedFileItem {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  status: 'parsed' | 'error';
  itemCount: number;
  error?: string;
  items: any[];
}

const DEFAULT_SAMPLE_REQ = `REQ-101: User Authentication with 2FA
The system shall allow users to log in with email and password. If 2FA is enabled, prompt for a 6-digit TOTP code. Lock account for 15 minutes after 5 consecutive failed attempts.

REQ-102: Fund Transfer Workflow
Users can transfer funds between checking and savings accounts. The maximum daily limit is $10,000. Transactions exceeding $5,000 require secondary SMS authorization. Failed transfers must rollback completely.

REQ-103: Transaction History Export
The system shall generate and download transaction history as PDF or Excel within 3 seconds for up to 10,000 records.`;

const DEFAULT_SAMPLE_TC = `Test Case ID: TC_001
Description: Verify successful login with valid credentials and valid 2FA TOTP code
Steps:
1. Navigate to login page
2. Enter valid email and password
3. Enter valid 6-digit 2FA code
Expected Result: User dashboard displays successfully with HTTP 200 and auth session token.

Test Case ID: TC_002
Description: Verify account lockout after 5 consecutive failed login attempts
Steps:
1. Enter valid email and incorrect password 5 times consecutively
Expected Result: Account is locked for 15 minutes. Error message "Account temporarily locked" is displayed.

Test Case ID: TC_003
Description: Verify fund transfer under daily limit ($2,000)
Steps:
1. Initiate transfer of $2,000 from Checking to Savings
Expected Result: Funds transfer completes immediately with updated account balances and confirmation ID.

Test Case ID: TC_999 (Legacy Smoke)
Description: Verify application favicon and footer copyright year
Steps:
1. Inspect DOM head and footer tags
Expected Result: Favicon is loaded and current year is displayed in footer.`;

interface CoverageGapAnalyzerProps {
  apiKey?: string;
  onOpenKeyModal?: () => void;
}

export default function CoverageGapAnalyzer({ apiKey, onOpenKeyModal }: CoverageGapAnalyzerProps) {
  // Input States
  const [reqText, setReqText] = useState<string>(DEFAULT_SAMPLE_REQ);
  const [tcText, setTcText] = useState<string>(DEFAULT_SAMPLE_TC);

  const [reqFiles, setReqFiles] = useState<UploadedFileItem[]>([]);
  const [tcFiles, setTcFiles] = useState<UploadedFileItem[]>([]);

  const [combineReq, setCombineReq] = useState<boolean>(true);
  const [combineTc, setCombineTc] = useState<boolean>(true);

  const [inputError, setInputError] = useState<string>('');

  // Processing & Results
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<CoverageGapAnalysisResult | null>(null);
  const [analysisError, setAnalysisError] = useState<string>('');
  const [usedEngine, setUsedEngine] = useState<string>('');
  const [isLiveAI, setIsLiveAI] = useState<boolean>(false);

  // Filters & Interactivity
  const [selectedFilter, setSelectedFilter] = useState<'All' | 'Strong' | 'Weak' | 'None'>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortField, setSortField] = useState<'id' | 'level' | 'coveringCount'>('id');
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [expandedReqIds, setExpandedReqIds] = useState<Set<string>>(new Set());

  // Section references
  const reportRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const reqFileInputRef = useRef<HTMLInputElement>(null);
  const tcFileInputRef = useRef<HTMLInputElement>(null);

  // Resizable layout state for Requirements vs Test Cases input split
  const [inputSplitPercent, setInputSplitPercent] = useState<number>(50);
  const [isInputDragging, setIsInputDragging] = useState<boolean>(false);
  const [isLg, setIsLg] = useState<boolean>(true);
  const inputSplitContainerRef = useRef<HTMLDivElement>(null);

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
    setIsInputDragging(true);
  };

  useEffect(() => {
    if (!isInputDragging) return;

    const handlePointerMove = (e: PointerEvent) => {
      if (!inputSplitContainerRef.current) return;
      const rect = inputSplitContainerRef.current.getBoundingClientRect();
      if (rect.width <= 0) return;
      const clientX = e.clientX;
      const offset = clientX - rect.left;
      const percent = (offset / rect.width) * 100;
      setInputSplitPercent(Math.max(20, Math.min(80, percent)));
    };

    const handlePointerUp = () => {
      setIsInputDragging(false);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isInputDragging]);

  // File Upload Handlers
  const handleReqFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setInputError('');
    const newItems: UploadedFileItem[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = file.name.split('.').pop()?.toLowerCase();
      const validExts = ['xls', 'xlsx', 'md', 'json'];

      if (!ext || !validExts.includes(ext)) {
        setInputError(
          `Unsupported file "${file.name}". Supported formats: .xls, .xlsx, .md, .json`
        );
        continue;
      }

      try {
        const items = await parseFileForRequirements(file);
        newItems.push({
          id: `${file.name}-${Date.now()}-${i}`,
          file,
          name: file.name,
          size: file.size,
          type: ext.toUpperCase(),
          status: 'parsed',
          itemCount: items.length,
          items,
        });
      } catch (err: any) {
        newItems.push({
          id: `${file.name}-${Date.now()}-${i}`,
          file,
          name: file.name,
          size: file.size,
          type: ext.toUpperCase(),
          status: 'error',
          itemCount: 0,
          error: err?.message || 'Failed to parse file',
          items: [],
        });
      }
    }

    setReqFiles((prev) => [...prev, ...newItems]);
    if (reqFileInputRef.current) reqFileInputRef.current.value = '';
  };

  const handleTcFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setInputError('');
    const newItems: UploadedFileItem[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = file.name.split('.').pop()?.toLowerCase();
      const validExts = ['xls', 'xlsx', 'md', 'json'];

      if (!ext || !validExts.includes(ext)) {
        setInputError(
          `Unsupported file "${file.name}". Supported formats: .xls, .xlsx, .md, .json`
        );
        continue;
      }

      try {
        const items = await parseFileForTestCases(file);
        newItems.push({
          id: `${file.name}-${Date.now()}-${i}`,
          file,
          name: file.name,
          size: file.size,
          type: ext.toUpperCase(),
          status: 'parsed',
          itemCount: items.length,
          items,
        });
      } catch (err: any) {
        newItems.push({
          id: `${file.name}-${Date.now()}-${i}`,
          file,
          name: file.name,
          size: file.size,
          type: ext.toUpperCase(),
          status: 'error',
          itemCount: 0,
          error: err?.message || 'Failed to parse file',
          items: [],
        });
      }
    }

    setTcFiles((prev) => [...prev, ...newItems]);
    if (tcFileInputRef.current) tcFileInputRef.current.value = '';
  };

  const removeReqFile = (id: string) => {
    setReqFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const removeTcFile = (id: string) => {
    setTcFiles((prev) => prev.filter((f) => f.id !== id));
  };

  // Run Analysis
  const handleAnalyze = async () => {
    setInputError('');
    setAnalysisError('');

    // 1. Gather Requirements
    let finalReqs: NormalizedRequirement[] = [];
    if (reqFiles.length > 0) {
      for (const f of reqFiles) {
        if (f.status === 'parsed') {
          finalReqs.push(...(f.items as NormalizedRequirement[]));
        }
      }
      if (combineReq && reqText.trim()) {
        const textReqs = parsePastedRequirements(reqText, 'Pasted Requirements');
        finalReqs.push(...textReqs);
      }
    } else if (reqText.trim()) {
      finalReqs = parsePastedRequirements(reqText, 'Pasted Requirements');
    }

    // 2. Gather Test Cases
    let finalTcs: NormalizedTestCase[] = [];
    if (tcFiles.length > 0) {
      for (const f of tcFiles) {
        if (f.status === 'parsed') {
          finalTcs.push(...(f.items as NormalizedTestCase[]));
        }
      }
      if (combineTc && tcText.trim()) {
        const textTcs = parsePastedTestCases(tcText, 'Pasted Test Cases');
        finalTcs.push(...textTcs);
      }
    } else if (tcText.trim()) {
      finalTcs = parsePastedTestCases(tcText, 'Pasted Test Cases');
    }

    // 3. Validation
    if (finalReqs.length === 0 || finalTcs.length === 0) {
      setInputError(
        'Both datasets must contain at least one valid requirement and one valid test case.'
      );
      return;
    }

    // Abort prior running analysis
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsAnalyzing(true);
    setLoadingStep('Parsing and normalizing input datasets...');

    try {
      // Progress Simulation Steps
      setTimeout(() => {
        if (!controller.signal.aborted) {
          setLoadingStep('Analyzing bidirectional traceability & scenario mapping...');
        }
      }, 400);

      setTimeout(() => {
        if (!controller.signal.aborted) {
          setLoadingStep('Classifying coverage strength and evaluating orphan test cases...');
        }
      }, 900);

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (apiKey) {
        headers['x-gemini-api-key'] = apiKey;
      }

      const res = await fetch('/api/ai/qa-agent', {
        method: 'POST',
        headers,
        signal: controller.signal,
        body: JSON.stringify({
          action: 'gap_analysis',
          requirements: finalReqs,
          testCases: finalTcs,
          apiKey,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || errData.error || 'Coverage Gap Analysis failed');
      }

      const data = await res.json();
      if (!data.result) {
        throw new Error('Analysis completed with malformed result structure.');
      }

      setAnalysisResult(data.result);
      setIsLiveAI(Boolean(data.isLiveAI));
      setUsedEngine(data.engine || 'deterministic-gap-engine');

      // Scroll smoothly to dashboard / report
      setTimeout(() => {
        reportRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Analysis aborted.');
        return;
      }
      console.error('Analysis error:', err);
      setAnalysisError(err?.message || 'An error occurred during coverage gap analysis.');
      setAnalysisResult(null);
    } finally {
      setIsAnalyzing(false);
      setLoadingStep('');
    }
  };

  // Reset Everything to Initial State
  const handleReset = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    setReqText('');
    setTcText('');
    setReqFiles([]);
    setTcFiles([]);
    setCombineReq(true);
    setCombineTc(true);
    setInputError('');
    setAnalysisError('');
    setAnalysisResult(null);
    setIsAnalyzing(false);
    setLoadingStep('');
    setSelectedFilter('All');
    setSearchQuery('');
    setExpandedReqIds(new Set());
    if (reqFileInputRef.current) reqFileInputRef.current.value = '';
    if (tcFileInputRef.current) tcFileInputRef.current.value = '';
  };

  // Download Detailed Report (.xlsx)
  const handleDownloadExcel = () => {
    if (!analysisResult) return;
    try {
      const buffer = generateCoverageGapExcelWorkbook(analysisResult);
      const blob = new Blob([buffer as any], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `intelligentqa-coverage-gap-analysis-${Date.now()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export Excel report:', err);
    }
  };

  // Filtered & Sorted Report Rows
  const filteredRows = useMemo(() => {
    if (!analysisResult) return [];
    let rows = [...analysisResult.requirementCoverage];

    // Filter by category
    if (selectedFilter !== 'All') {
      rows = rows.filter((r) => r.coverageLevel === selectedFilter);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      rows = rows.filter(
        (r) =>
          r.requirementId.toLowerCase().includes(q) ||
          r.requirementDescription.toLowerCase().includes(q) ||
          r.coveringTestCases.some((c) => c.testCaseId.toLowerCase().includes(q))
      );
    }

    // Sorting
    rows.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'id') {
        cmp = a.requirementId.localeCompare(b.requirementId, undefined, { numeric: true });
      } else if (sortField === 'level') {
        const order: Record<CoverageLevel, number> = { Strong: 3, Weak: 2, None: 1 };
        cmp = order[a.coverageLevel] - order[b.coverageLevel];
      } else if (sortField === 'coveringCount') {
        cmp = a.coveringTestCases.length - b.coveringTestCases.length;
      }
      return sortAsc ? cmp : -cmp;
    });

    return rows;
  }, [analysisResult, selectedFilter, searchQuery, sortField, sortAsc]);

  const toggleExpand = (id: string) => {
    setExpandedReqIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-8">
      {/* SECTION A: TWO CLEARLY SEPARATED RESIZABLE INPUT PANELS */}
      <div
        ref={inputSplitContainerRef}
        className={`flex flex-col lg:flex-row items-stretch gap-6 lg:gap-0 relative ${
          isInputDragging ? 'select-none cursor-col-resize' : ''
        }`}
      >
        {/* Panel 1: Requirements Input */}
        <div
          style={isLg ? { width: `calc(${inputSplitPercent}% - 12px)` } : undefined}
          className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between ${
            isLg ? 'shrink-0 min-w-[280px]' : ''
          }`}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center text-xs font-bold font-mono">
                  1
                </span>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Requirements Input
                </h3>
              </div>
            </div>

            {/* Paste Area */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                Paste Requirements Text
              </label>
              <textarea
                value={reqText}
                onChange={(e) => setReqText(e.target.value)}
                rows={7}
                placeholder="Paste functional requirements, user stories, acceptance criteria, or markdown tables..."
                className="w-full text-xs font-mono bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-y"
              />
            </div>

            {/* File Upload Area */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Upload Requirements Files
                </label>
                {reqFiles.length > 0 && reqText.trim() && (
                  <label className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={combineReq}
                      onChange={(e) => setCombineReq(e.target.checked)}
                      className="rounded border-slate-300 text-cyan-600 focus:ring-cyan-500 w-3.5 h-3.5"
                    />
                    <span>Combine file + pasted text</span>
                  </label>
                )}
              </div>

              <div
                onClick={() => reqFileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-cyan-500 dark:hover:border-cyan-400 rounded-xl p-3.5 text-center cursor-pointer transition bg-slate-50/50 dark:bg-slate-950/40"
              >
                <input
                  ref={reqFileInputRef}
                  type="file"
                  multiple
                  accept=".xls,.xlsx,.md,.json,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/markdown,application/json"
                  onChange={handleReqFileUpload}
                  className="hidden"
                />
                <div className="flex items-center justify-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                  <UploadCloud className="w-4 h-4 text-cyan-500" />
                  <span>
                    Drop or click to upload <strong>.xlsx, .xls, .md, .json</strong> files
                  </span>
                </div>
              </div>

              {/* Uploaded Files List */}
              {reqFiles.length > 0 && (
                <div className="mt-2.5 space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {reqFiles.map((f) => (
                    <div
                      key={f.id}
                      className={`flex items-center justify-between text-xs p-2 rounded-lg border ${
                        f.status === 'error'
                          ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300'
                          : 'bg-slate-100 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        {f.type === 'XLSX' || f.type === 'XLS' ? (
                          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        ) : (
                          <FileCode className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                        )}
                        <span className="font-semibold truncate">{f.name}</span>
                        <span className="text-[10px] text-slate-500">
                          ({formatFileSize(f.size)})
                        </span>
                        {f.status === 'parsed' ? (
                          <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold px-1.5 py-0.2 rounded">
                            {f.itemCount} reqs
                          </span>
                        ) : (
                          <span className="text-[10px] bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold px-1.5 py-0.2 rounded">
                            Error
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => removeReqFile(f.id)}
                        className="text-slate-400 hover:text-rose-500 transition p-1"
                        title="Remove file"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Resizer Divider Bar (Desktop Horizontal Resizer) */}
        <div
          onPointerDown={handleResizePointerDown}
          onDoubleClick={() => setInputSplitPercent(50)}
          className="hidden lg:flex flex-col items-center justify-center w-6 -mx-0 group cursor-col-resize z-10 shrink-0 select-none py-4"
          title="Drag to resize panels (Double-click to reset to 50:50)"
        >
          {/* Quick preset ratio buttons */}
          <div className="flex flex-col gap-1 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setInputSplitPercent(35);
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
                setInputSplitPercent(50);
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
                setInputSplitPercent(65);
              }}
              className="px-1 py-0.5 text-[9px] font-mono rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-cyan-500 hover:text-white"
              title="Preset 65:35"
            >
              65:35
            </button>
          </div>

          <div
            className={`w-1.5 h-full min-h-[300px] rounded-full transition-all flex items-center justify-center ${
              isInputDragging
                ? 'bg-cyan-500 shadow-md ring-2 ring-cyan-400/50'
                : 'bg-slate-200 dark:bg-slate-700/80 group-hover:bg-cyan-400 group-hover:w-2'
            }`}
          >
            <GripVertical
              className={`w-3.5 h-3.5 transition-colors ${
                isInputDragging
                  ? 'text-white'
                  : 'text-slate-400 dark:text-slate-500 group-hover:text-cyan-900 dark:group-hover:text-cyan-100'
              }`}
            />
          </div>
        </div>

        {/* Panel 2: Test Cases Input */}
        <div
          style={isLg ? { width: `calc(${100 - inputSplitPercent}% - 12px)` } : undefined}
          className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between ${
            isLg ? 'shrink-0 min-w-[280px]' : ''
          }`}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-bold font-mono">
                  2
                </span>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Test Cases Input
                </h3>
              </div>
            </div>

            {/* Paste Area */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                Paste Test Cases Text
              </label>
              <textarea
                value={tcText}
                onChange={(e) => setTcText(e.target.value)}
                rows={7}
                placeholder="Paste test matrices, test step sequences, expected results, or JSON test suites..."
                className="w-full text-xs font-mono bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-y"
              />
            </div>

            {/* File Upload Area */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Upload Test Cases Files
                </label>
                {tcFiles.length > 0 && tcText.trim() && (
                  <label className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={combineTc}
                      onChange={(e) => setCombineTc(e.target.checked)}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
                    />
                    <span>Combine file + pasted text</span>
                  </label>
                )}
              </div>

              <div
                onClick={() => tcFileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-400 rounded-xl p-3.5 text-center cursor-pointer transition bg-slate-50/50 dark:bg-slate-950/40"
              >
                <input
                  ref={tcFileInputRef}
                  type="file"
                  multiple
                  accept=".xls,.xlsx,.md,.json,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/markdown,application/json"
                  onChange={handleTcFileUpload}
                  className="hidden"
                />
                <div className="flex items-center justify-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                  <UploadCloud className="w-4 h-4 text-emerald-500" />
                  <span>
                    Drop or click to upload <strong>.xlsx, .xls, .md, .json</strong> files
                  </span>
                </div>
              </div>

              {/* Uploaded Files List */}
              {tcFiles.length > 0 && (
                <div className="mt-2.5 space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {tcFiles.map((f) => (
                    <div
                      key={f.id}
                      className={`flex items-center justify-between text-xs p-2 rounded-lg border ${
                        f.status === 'error'
                          ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300'
                          : 'bg-slate-100 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        {f.type === 'XLSX' || f.type === 'XLS' ? (
                          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        ) : (
                          <FileCode className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                        )}
                        <span className="font-semibold truncate">{f.name}</span>
                        <span className="text-[10px] text-slate-500">
                          ({formatFileSize(f.size)})
                        </span>
                        {f.status === 'parsed' ? (
                          <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold px-1.5 py-0.2 rounded">
                            {f.itemCount} test cases
                          </span>
                        ) : (
                          <span className="text-[10px] bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold px-1.5 py-0.2 rounded">
                            Error
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => removeTcFile(f.id)}
                        className="text-slate-400 hover:text-rose-500 transition p-1"
                        title="Remove file"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* VALIDATION OR ERROR MESSAGES */}
      {inputError && (
        <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-xl flex items-center gap-2 text-xs text-amber-900 dark:text-amber-200">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{inputError}</span>
        </div>
      )}

      {analysisError && (
        <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 rounded-xl flex items-center gap-2 text-xs text-rose-900 dark:text-rose-200">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{analysisError}</span>
        </div>
      )}

      {/* SECTION B: ACTION BAR WITH PRIMARY BUTTONS */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white shadow-md transition cursor-pointer"
          >
            {isAnalyzing ? (
              <>
                <RotateCcw className="w-4 h-4 animate-spin" />
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>ANALYZE</span>
              </>
            )}
          </button>

          <button
            onClick={handleReset}
            disabled={isAnalyzing}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 transition cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>RESET</span>
          </button>
        </div>

        {/* Download Detailed Report (.xlsx) Button */}
        <div>
          <button
            onClick={handleDownloadExcel}
            disabled={!analysisResult || isAnalyzing}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 text-white shadow-xs transition cursor-pointer disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            <span>Download Detailed Report (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* LOADING STATE WITH MEANINGFUL PROGRESS MESSAGES */}
      {isAnalyzing && (
        <div className="p-6 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-2xl text-center space-y-3">
          <div className="flex items-center justify-center">
            <RotateCcw className="w-6 h-6 text-indigo-600 dark:text-indigo-400 animate-spin" />
          </div>
          <div className="text-sm font-bold text-indigo-950 dark:text-indigo-200">
            {loadingStep || 'Evaluating requirements against test suite...'}
          </div>
          <p className="text-xs text-indigo-700 dark:text-indigo-400 max-w-md mx-auto">
            Computing bidirectional traceability, validating 12 scenario dimensions, and detecting
            coverage gaps across your test cases.
          </p>
        </div>
      )}

      {/* SECTION C: OVERVIEW DASHBOARD */}
      {analysisResult && (
        <div ref={reportRef} className="space-y-6 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <PieChartIcon className="w-5 h-5 text-indigo-500" />
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Coverage Overview Dashboard
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Analyzed at {new Date(analysisResult.summary.analysisTimestamp).toLocaleString()}{' '}
                via{' '}
                <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                  {usedEngine}
                </span>{' '}
                ({isLiveAI ? 'Live Gemini AI' : 'Deterministic Engine'})
              </p>
            </div>
            {selectedFilter !== 'All' && (
              <button
                onClick={() => setSelectedFilter('All')}
                className="self-start sm:self-auto flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 transition"
              >
                <span>Clear Chart Filter ({selectedFilter})</span>
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* 5 Primary Metrics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
            {/* 1. Total Requirements */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
                <span>Total Reqs</span>
                <span title="Count of unique valid requirement records analyzed">
                  <Info className="w-3.5 h-3.5 text-slate-400" />
                </span>
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {analysisResult.summary.totalRequirements}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Unique specifications</div>
            </div>

            {/* 2. Total Test Cases */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
                <span>Total Test Cases</span>
                <span title="Count of unique valid test case records analyzed">
                  <Info className="w-3.5 h-3.5 text-slate-400" />
                </span>
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {analysisResult.summary.totalTestCases}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Unique test procedures</div>
            </div>

            {/* 3. Coverage % */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
                <span>Coverage %</span>
                <span title="(Reqs with at least 1 Weak or Strong test case / Total reqs) * 100">
                  <Info className="w-3.5 h-3.5 text-slate-400" />
                </span>
              </div>
              <div
                className={`text-2xl font-black mt-1 ${
                  analysisResult.summary.coveragePercentage >= 80
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : analysisResult.summary.coveragePercentage >= 50
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {analysisResult.summary.coveragePercentage}%
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Weak &amp; Strong coverage</div>
            </div>

            {/* 4. Req-to-Test Traceability % */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
                <span>Req → Test %</span>
                <span title="(Reqs having Confirmed or Probable mapping / Total reqs) * 100">
                  <Info className="w-3.5 h-3.5 text-slate-400" />
                </span>
              </div>
              <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
                {analysisResult.summary.requirementToTestTraceability}%
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Confirmed &amp; Probable</div>
            </div>

            {/* 5. Test-to-Req Traceability % */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs col-span-2 md:col-span-1">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
                <span>Test → Req %</span>
                <span title="(Test cases mapped to at least 1 requirement [Confirmed or Probable] / Total TCs) * 100">
                  <Info className="w-3.5 h-3.5 text-slate-400" />
                </span>
              </div>
              <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">
                {analysisResult.summary.testToRequirementTraceability}%
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Non-orphan test cases</div>
            </div>
          </div>

          {/* Coverage Quality Breakdown & Interactive Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Interactive Pie Chart Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
                  <span>Coverage Quality Pie Chart</span>
                  <span className="text-[11px] text-slate-500 font-normal">
                    Click slice to filter
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Distribution of requirements across coverage quality levels.
                </p>

                {/* SVG Interactive Pie Chart */}
                <div className="flex items-center justify-center my-4 relative">
                  <svg
                    width="180"
                    height="180"
                    viewBox="0 0 100 100"
                    className="transform -rotate-90"
                  >
                    {(() => {
                      const total = analysisResult.summary.totalRequirements || 1;
                      const sPct = analysisResult.summary.strongCount / total;
                      const wPct = analysisResult.summary.weakCount / total;
                      const nPct = analysisResult.summary.noneCount / total;

                      // Circumference of radius 38 is ~238.76
                      const C = 2 * Math.PI * 38;
                      const sStroke = sPct * C;
                      const wStroke = wPct * C;
                      const nStroke = nPct * C;

                      const sOffset = 0;
                      const wOffset = -sStroke;
                      const nOffset = -(sStroke + wStroke);

                      return (
                        <>
                          {/* Strong Segment */}
                          <circle
                            cx="50"
                            cy="50"
                            r="38"
                            fill="transparent"
                            stroke="#10B981"
                            strokeWidth="18"
                            strokeDasharray={`${sStroke} ${C}`}
                            strokeDashoffset={sOffset}
                            className="cursor-pointer transition-all hover:opacity-80"
                            onClick={() =>
                              setSelectedFilter((prev) => (prev === 'Strong' ? 'All' : 'Strong'))
                            }
                          >
                            <title>
                              Strong: {analysisResult.summary.strongCount} (
                              {analysisResult.summary.strongPercentage}%)
                            </title>
                          </circle>

                          {/* Weak Segment */}
                          <circle
                            cx="50"
                            cy="50"
                            r="38"
                            fill="transparent"
                            stroke="#F59E0B"
                            strokeWidth="18"
                            strokeDasharray={`${wStroke} ${C}`}
                            strokeDashoffset={wOffset}
                            className="cursor-pointer transition-all hover:opacity-80"
                            onClick={() =>
                              setSelectedFilter((prev) => (prev === 'Weak' ? 'All' : 'Weak'))
                            }
                          >
                            <title>
                              Weak: {analysisResult.summary.weakCount} (
                              {analysisResult.summary.weakPercentage}%)
                            </title>
                          </circle>

                          {/* None Segment */}
                          <circle
                            cx="50"
                            cy="50"
                            r="38"
                            fill="transparent"
                            stroke="#EF4444"
                            strokeWidth="18"
                            strokeDasharray={`${nStroke} ${C}`}
                            strokeDashoffset={nOffset}
                            className="cursor-pointer transition-all hover:opacity-80"
                            onClick={() =>
                              setSelectedFilter((prev) => (prev === 'None' ? 'All' : 'None'))
                            }
                          >
                            <title>
                              None: {analysisResult.summary.noneCount} (
                              {analysisResult.summary.nonePercentage}%)
                            </title>
                          </circle>
                        </>
                      );
                    })()}
                  </svg>
                  <div className="absolute text-center pointer-events-none">
                    <span className="text-xl font-black text-slate-900 dark:text-white">
                      {analysisResult.summary.totalRequirements}
                    </span>
                    <span className="block text-[10px] text-slate-500 font-semibold uppercase">
                      Reqs
                    </span>
                  </div>
                </div>
              </div>

              {/* Chart Legend with Click-to-Filter Buttons */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() =>
                    setSelectedFilter((prev) => (prev === 'Strong' ? 'All' : 'Strong'))
                  }
                  className={`p-2 rounded-xl text-center border transition cursor-pointer ${
                    selectedFilter === 'Strong'
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Strong</span>
                  </div>
                  <div className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
                    {analysisResult.summary.strongCount}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {analysisResult.summary.strongPercentage}%
                  </div>
                </button>

                <button
                  onClick={() => setSelectedFilter((prev) => (prev === 'Weak' ? 'All' : 'Weak'))}
                  className={`p-2 rounded-xl text-center border transition cursor-pointer ${
                    selectedFilter === 'Weak'
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span>Weak</span>
                  </div>
                  <div className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
                    {analysisResult.summary.weakCount}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {analysisResult.summary.weakPercentage}%
                  </div>
                </button>

                <button
                  onClick={() => setSelectedFilter((prev) => (prev === 'None' ? 'All' : 'None'))}
                  className={`p-2 rounded-xl text-center border transition cursor-pointer ${
                    selectedFilter === 'None'
                      ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    <span>None</span>
                  </div>
                  <div className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
                    {analysisResult.summary.noneCount}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {analysisResult.summary.nonePercentage}%
                  </div>
                </button>
              </div>
            </div>

            {/* Secondary Quality Indicators */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-indigo-500" />
                  <span>Quality &amp; Risk Health Indicators</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Traceability integrity flags requiring technical team or product owner attention.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-4">
                  {/* Indicator 1: Orphan Test Cases */}
                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Orphan Test Cases
                      </span>
                      <span
                        className={`text-xs font-mono font-black px-2 py-0.5 rounded ${
                          analysisResult.summary.orphanTestCaseCount > 0
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                            : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        {analysisResult.summary.orphanTestCaseCount}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                      Tests with zero confirmed requirement linkages. Review in the Orphan Test
                      Cases section below.
                    </p>
                  </div>

                  {/* Indicator 2: Probable / Uncertain Mappings */}
                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Probable / Uncertain Links
                      </span>
                      <span
                        className={`text-xs font-mono font-black px-2 py-0.5 rounded ${
                          analysisResult.summary.probableOrUncertainMappingCount > 0
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                            : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        {analysisResult.summary.probableOrUncertainMappingCount}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                      Relationships based on partial semantic matching without explicit ID links.
                      Flagged for manual review.
                    </p>
                  </div>

                  {/* Indicator 3: Clarification Needed */}
                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Ambiguous Requirements
                      </span>
                      <span
                        className={`text-xs font-mono font-black px-2 py-0.5 rounded ${
                          analysisResult.summary.clarificationNeededCount > 0
                            ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                            : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        {analysisResult.summary.clarificationNeededCount}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                      Requirements with subjective adjectives (e.g. &ldquo;quickly&rdquo;,
                      &ldquo;user-friendly&rdquo;) requiring PO clarification.
                    </p>
                  </div>

                  {/* Indicator 4: Potential Duplicates */}
                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Potential Duplicate Tests
                      </span>
                      <span
                        className={`text-xs font-mono font-black px-2 py-0.5 rounded ${
                          analysisResult.summary.potentialDuplicateTestCasesCount > 0
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                            : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        {analysisResult.summary.potentialDuplicateTestCasesCount}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                      Test cases sharing identical descriptions or repetitive validation targets.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <span>
                  Deterministically verified across all uploaded worksheets and text entries.
                </span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {analysisResult.summary.totalRequirements} Reqs •{' '}
                  {analysisResult.summary.totalTestCases} Tests
                </span>
              </div>
            </div>
          </div>

          {/* SECTION D: DETAILED COVERAGE GAP ANALYSIS REPORT */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Detailed Coverage Gap Analysis Report
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Bidirectional matrix with exact 4 mandatory columns, confidence ratings, and
                  actionable improvements.
                </p>
              </div>

              {/* Search & Sort Controls */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search Req ID, text, TC..."
                    className="text-xs pl-8 pr-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-48"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Filter Selector */}
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
                  {(['All', 'Strong', 'Weak', 'None'] as const).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedFilter(cat)}
                      className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                        selectedFilter === cat
                          ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Sort Toggle */}
                <button
                  onClick={() => {
                    setSortAsc(!sortAsc);
                  }}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  title="Toggle Sort Order"
                >
                  <ArrowUpDown className="w-3.5 h-3.5" />
                  <span>{sortAsc ? 'Asc' : 'Desc'}</span>
                </button>
              </div>
            </div>

            {/* Matrix Table with 4 Mandatory Columns */}
            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 font-bold">
                    <th className="p-3 w-4/12 min-w-[280px]">Requirements</th>
                    <th className="p-3 w-2/12 min-w-[130px] text-center">Coverage Level</th>
                    <th className="p-3 w-3/12 min-w-[260px]">Covering Test Cases</th>
                    <th className="p-3 w-3/12 min-w-[280px]">Improvement Recommendations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                  {filteredRows.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-slate-500">
                        <AlertCircle className="w-6 h-6 mx-auto mb-2 text-slate-400" />
                        <span className="block font-semibold">
                          No requirements match the selected filter.
                        </span>
                        <button
                          onClick={() => {
                            setSelectedFilter('All');
                            setSearchQuery('');
                          }}
                          className="mt-2 text-xs font-bold text-indigo-600 hover:underline"
                        >
                          Clear filters to see all records
                        </button>
                      </td>
                    </tr>
                  ) : (
                    filteredRows.map((req) => {
                      const isExpanded = expandedReqIds.has(req.requirementId);
                      return (
                        <React.Fragment key={req.requirementId}>
                          <tr className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                            {/* Column 1: Requirements */}
                            <td className="p-3 align-top">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => toggleExpand(req.requirementId)}
                                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                  >
                                    {isExpanded ? (
                                      <ChevronDown className="w-3.5 h-3.5" />
                                    ) : (
                                      <ChevronRight className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                  <span className="font-mono font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[11px]">
                                    {req.requirementId}
                                  </span>
                                  {req.isAmbiguous && (
                                    <span className="text-[10px] font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 px-1.5 py-0.2 rounded">
                                      Ambiguity
                                    </span>
                                  )}
                                </div>
                                <p className="text-slate-800 dark:text-slate-200 text-xs leading-relaxed pl-5 font-normal">
                                  {req.requirementDescription}
                                </p>
                                <div className="pl-5 text-[10px] text-slate-400 font-mono">
                                  Source: {req.sourceReference}
                                </div>
                              </div>
                            </td>

                            {/* Column 2: Coverage Level */}
                            <td className="p-3 align-top text-center">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                  req.coverageLevel === 'Strong'
                                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                                    : req.coverageLevel === 'Weak'
                                      ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                                      : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                                }`}
                              >
                                {req.coverageLevel === 'Strong' ? (
                                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                ) : req.coverageLevel === 'Weak' ? (
                                  <AlertTriangle className="w-3 h-3 text-amber-500" />
                                ) : (
                                  <AlertCircle className="w-3 h-3 text-rose-500" />
                                )}
                                <span>{req.coverageLevel}</span>
                              </span>
                            </td>

                            {/* Column 3: Covering Test Cases */}
                            <td className="p-3 align-top">
                              {req.coveringTestCases.length === 0 ? (
                                <span className="text-slate-400 dark:text-slate-500 italic">
                                  No covering test case found.
                                </span>
                              ) : (
                                <div className="space-y-2">
                                  {req.coveringTestCases.map((tc) => (
                                    <div
                                      key={tc.testCaseId}
                                      className="p-2 rounded-lg bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 space-y-1"
                                    >
                                      <div className="flex items-center justify-between gap-1 flex-wrap">
                                        <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-[11px]">
                                          {tc.testCaseId}
                                        </span>
                                        <span
                                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                                            tc.mappingConfidence === 'Confirmed'
                                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                              : tc.mappingConfidence === 'Probable'
                                                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                                          }`}
                                        >
                                          {tc.mappingConfidence}
                                        </span>
                                      </div>
                                      <p className="text-[11px] text-slate-700 dark:text-slate-300 line-clamp-2">
                                        {tc.testCaseDescription}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </td>

                            {/* Column 4: Improvement Recommendations */}
                            <td className="p-3 align-top">
                              <div className="space-y-1.5">
                                {req.improvementRecommendations.map((rec, rIdx) => (
                                  <div
                                    key={rIdx}
                                    className={`text-xs p-2 rounded-lg border ${
                                      req.coverageLevel === 'Strong'
                                        ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-300'
                                        : 'bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200'
                                    }`}
                                  >
                                    {rec}
                                  </div>
                                ))}
                                {req.missingScenarios.length > 0 && (
                                  <div className="text-[10px] text-amber-700 dark:text-amber-300 font-medium">
                                    Missing dimensions: {req.missingScenarios.join(', ')}
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>

                          {/* Expanded Evidence & Step Details Row */}
                          {isExpanded && (
                            <tr className="bg-slate-50/90 dark:bg-slate-950/60">
                              <td colSpan={4} className="p-4 pl-9 space-y-3">
                                <div className="text-xs font-bold text-slate-900 dark:text-white">
                                  Coverage Evidence &amp; Execution Step Audit for{' '}
                                  {req.requirementId}:
                                </div>
                                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 space-y-2">
                                  <div>
                                    <strong>Evidence Analysis:</strong>{' '}
                                    {req.coverageEvidence ||
                                      'Verified against test specifications.'}
                                  </div>
                                  {req.clarificationNeeded && (
                                    <div className="text-purple-600 dark:text-purple-400 font-medium">
                                      <strong>Clarification Directive:</strong>{' '}
                                      {req.clarificationNeeded}
                                    </div>
                                  )}
                                  {req.coveringTestCases.length > 0 && (
                                    <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                                      {req.coveringTestCases.map((tc) => (
                                        <div key={tc.testCaseId} className="text-[11px] space-y-1">
                                          <div className="font-bold text-slate-900 dark:text-white">
                                            [{tc.testCaseId}] Steps &amp; Expected Outcome:
                                          </div>
                                          {tc.testSteps && (
                                            <div className="font-mono text-slate-600 dark:text-slate-400 whitespace-pre-wrap pl-2 border-l border-slate-300 dark:border-slate-700">
                                              {tc.testSteps}
                                            </div>
                                          )}
                                          {tc.expectedResults && (
                                            <div className="text-emerald-700 dark:text-emerald-300 pl-2">
                                              Expected: {tc.expectedResults}
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* SECTION E: ORPHAN TEST CASES / UNMAPPED TEST CASES */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  <span>Orphan Test Cases / Unmapped Test Cases</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Test cases that do not map to any validated business requirement.
                </p>
              </div>
              <span className="text-xs font-mono font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2.5 py-1 rounded-full">
                {analysisResult.orphanTestCases.length} Orphans
              </span>
            </div>

            {analysisResult.orphanTestCases.length === 0 ? (
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>Zero orphan test cases!</strong> Every test case in the suite maps to at
                  least one documented business requirement.
                </span>
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 font-bold">
                      <th className="p-3 w-1/6">Test Case ID</th>
                      <th className="p-3 w-3/6">Test Case Description</th>
                      <th className="p-3 w-2/6">Reason &amp; Recommended Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                    {analysisResult.orphanTestCases.map((o) => (
                      <tr
                        key={o.testCaseId}
                        className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
                      >
                        <td className="p-3 align-top font-mono font-bold text-slate-900 dark:text-white">
                          {o.testCaseId}
                          <div className="text-[10px] text-slate-400 font-normal mt-0.5">
                            {o.sourceReference}
                          </div>
                        </td>
                        <td className="p-3 align-top text-slate-800 dark:text-slate-200">
                          {o.testCaseDescription}
                          {o.expectedResults && (
                            <div className="text-[11px] text-slate-500 mt-1">
                              <strong>Expected:</strong> {o.expectedResults}
                            </div>
                          )}
                        </td>
                        <td className="p-3 align-top space-y-1">
                          <div className="text-amber-700 dark:text-amber-400 font-medium">
                            {o.reason}
                          </div>
                          <div className="text-slate-600 dark:text-slate-400">
                            <strong>Action:</strong> {o.recommendedAction}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
