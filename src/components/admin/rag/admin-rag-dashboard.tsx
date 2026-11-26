'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Database,
  Layers,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  Play,
  RotateCcw,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  FileText,
  HelpCircle,
  GraduationCap,
  Eye,
  Trash2,
} from 'lucide-react';
import { KnowledgeSource, IndexingJob, FreshnessAuditSummary } from '@/lib/rag/types';

export default function AdminRAGDashboard() {
  const [summary, setSummary] = useState<FreshnessAuditSummary | null>(null);
  const [sources, setSources] = useState<KnowledgeSource[]>([]);
  const [jobs, setJobs] = useState<IndexingJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Filters
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Active Tab
  const [activeTab, setActiveTab] = useState<'overview' | 'sources' | 'jobs' | 'playground'>(
    'overview'
  );

  // Playground state
  const [playgroundQuery, setPlaygroundQuery] = useState('');
  const [playgroundCourse, setPlaygroundCourse] = useState('');
  const [isQueryingPlayground, setIsQueryingPlayground] = useState(false);
  const [playgroundResult, setPlaygroundResult] = useState<any | null>(null);

  const fetchStatus = async () => {
    setIsLoading(true);
    setActionError(null);
    try {
      const res = await fetch('/api/admin/rag/status');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setSummary(data.summary);
      setSources(data.sources || []);
      setJobs(data.jobs || []);
    } catch (err: any) {
      console.error('Failed to load RAG status:', err);
      setActionError(err?.message || 'Failed to connect to RAG engine');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleIndexAll = async () => {
    setActionNotice('Triggering full academy ingestion scan...');
    try {
      const res = await fetch('/api/admin/rag/index', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'index_all', batchSize: 50 }),
      });
      const data = await res.json();
      setActionNotice(
        `Ingestion queued! Queued: ${data.queued}, Processed batch: ${data.processed} (${data.succeeded} ok, ${data.failed} failed).`
      );
      fetchStatus();
    } catch (err: any) {
      setActionError(err?.message || 'Indexing failed');
    }
  };

  const handleReconcile = async () => {
    setActionNotice('Running reconciliation scan across curriculum and vector registry...');
    try {
      const res = await fetch('/api/admin/rag/reconcile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      const r = data.report;
      setActionNotice(
        `Reconciliation complete! Scanned: ${r.scannedCount}, Missing enqueued: ${r.missingSourcesQueued}, Outdated enqueued: ${r.outdatedSourcesQueued}, Retried: ${r.failedJobsRetried}.`
      );
      fetchStatus();
    } catch (err: any) {
      setActionError(err?.message || 'Reconciliation failed');
    }
  };

  const handleIndexSingle = async (sourceType: string, sourceId: string) => {
    setActionNotice(`Indexing source ${sourceType}:${sourceId}...`);
    try {
      const res = await fetch('/api/admin/rag/index', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'index_single', sourceType, sourceId }),
      });
      const data = await res.json();
      setActionNotice(`Source indexed successfully! Processed: ${data.processed}.`);
      fetchStatus();
    } catch (err: any) {
      setActionError(err?.message || 'Single source indexing failed');
    }
  };

  const handleRunPlayground = async () => {
    if (!playgroundQuery.trim() || isQueryingPlayground) return;
    setIsQueryingPlayground(true);
    try {
      const res = await fetch('/api/admin/rag/playground', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: playgroundQuery.trim(),
          courseId: playgroundCourse || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || data?.error) {
        setActionError(data?.error || `Playground query failed (${res.status})`);
        setPlaygroundResult(null);
        return;
      }
      setActionError(null);
      setPlaygroundResult(data);
    } catch (err: any) {
      console.error('Playground query error:', err);
      setActionError(err?.message || 'Playground query failed');
    } finally {
      setIsQueryingPlayground(false);
    }
  };

  // Filtered sources
  const filteredSources = sources.filter((s) => {
    const matchType = filterType === 'all' || s.sourceType === filterType;
    const matchStatus = filterStatus === 'all' || s.indexingStatus === filterStatus;
    const matchSearch =
      !searchTerm ||
      s.sourceTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.sourceId.toLowerCase().includes(searchTerm.toLowerCase());
    return matchType && matchStatus && matchSearch;
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Top Banner & Actions Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#141415] border border-[#262626]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Centralized RAG Knowledge Engine &amp; Freshness Monitor
              </h1>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase font-bold border ${
                  summary?.freshnessStatus === 'fresh'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : summary?.freshnessStatus === 'syncing'
                      ? 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                }`}
              >
                {summary?.freshnessStatus || 'Checking'}
              </span>
            </div>
            <p className="text-xs text-[#A1A1AA]">
              pgvector 768-dim embeddings, transactional outbox queue, and real-time freshness audit
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={fetchStatus}
            disabled={isLoading}
            className="p-2 rounded-lg border border-[#2E2E32] hover:border-neutral-600 text-neutral-300 hover:text-white transition"
            title="Refresh statistics"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleReconcile}
            className="px-3 py-1.5 rounded-lg border border-purple-500/40 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 text-xs font-semibold transition flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reconcile</span>
          </button>
          <button
            onClick={handleIndexAll}
            className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition flex items-center gap-1.5"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Index All Published</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {actionNotice && (
        <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/30 text-purple-300 text-xs flex items-center justify-between">
          <span>{actionNotice}</span>
          <button
            onClick={() => setActionNotice(null)}
            className="text-neutral-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}
      {actionError && (
        <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-500/30 text-red-300 text-xs flex items-center justify-between">
          <span>{actionError}</span>
          <button
            onClick={() => setActionError(null)}
            className="text-neutral-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* Summary KPI Cards */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-xl bg-[#141415] border border-[#262626]">
            <div className="text-[11px] font-mono text-neutral-400 uppercase">
              Published Sources
            </div>
            <div className="text-2xl font-extrabold text-white mt-1">
              {summary.totalPublishedSources}
            </div>
            <div className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>{summary.totalIndexedSources} Indexed &amp; Active</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#141415] border border-[#262626]">
            <div className="text-[11px] font-mono text-neutral-400 uppercase">
              Active Vector Chunks
            </div>
            <div className="text-2xl font-extrabold text-purple-400 mt-1">
              {summary.totalActiveChunks}
            </div>
            <div className="text-[10px] text-neutral-500 mt-1">
              HNSW Cosine Vector Index (768-dim)
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#141415] border border-[#262626]">
            <div className="text-[11px] font-mono text-neutral-400 uppercase">Outbox Job Queue</div>
            <div className="text-2xl font-extrabold text-white mt-1">
              {summary.pendingJobs}
              <span className="text-xs text-neutral-500 font-normal ml-1">pending</span>
            </div>
            <div className="text-[10px] text-neutral-400 mt-1">
              {summary.processingJobs} processing · {summary.failedJobs} failed
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#141415] border border-[#262626]">
            <div className="text-[11px] font-mono text-neutral-400 uppercase">
              Last Indexed Time
            </div>
            <div className="text-sm font-semibold text-white mt-2 truncate">
              {summary.lastSuccessfulIndexingTime
                ? new Date(summary.lastSuccessfulIndexingTime).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })
                : 'Initial Setup'}
            </div>
            <div className="text-[10px] text-neutral-500 mt-1">
              {summary.supersededVersions} superseded chunks retired
            </div>
          </div>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-[#262626] pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
            activeTab === 'overview'
              ? 'bg-purple-600 text-white'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
          }`}
        >
          Overview &amp; Architecture
        </button>
        <button
          onClick={() => setActiveTab('sources')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
            activeTab === 'sources'
              ? 'bg-purple-600 text-white'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
          }`}
        >
          Knowledge Sources ({sources.length})
        </button>
        <button
          onClick={() => setActiveTab('jobs')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
            activeTab === 'jobs'
              ? 'bg-purple-600 text-white'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
          }`}
        >
          Indexing Queue ({jobs.length})
        </button>
        <button
          onClick={() => setActiveTab('playground')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
            activeTab === 'playground'
              ? 'bg-purple-600 text-white'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-300" />
          <span>RAG Test Playground</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW & ARCHITECTURE */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-[#141415] border border-[#262626] space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-purple-400" />
              <span>Multi-Source Knowledge Pipeline</span>
            </h3>
            <p className="text-xs text-neutral-300 leading-relaxed">
              The centralized RAG knowledge engine normalizes published courses, modules, lessons,
              CMS articles, and all 800 interview questions into versioned chunks. Embeddings are
              indexed in Supabase pgvector with an HNSW index for sub-50ms semantic retrieval.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-[#1A1A1C] border border-[#2B2B30] space-y-1">
                <span className="text-[11px] font-mono text-purple-400 font-bold">
                  1. Content Sync
                </span>
                <p className="text-xs text-neutral-400">
                  Every CMS write operation automatically calculates a SHA-256 hash. If unchanged,
                  re-embedding is skipped.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#1A1A1C] border border-[#2B2B30] space-y-1">
                <span className="text-[11px] font-mono text-purple-400 font-bold">
                  2. Atomic Versioning
                </span>
                <p className="text-xs text-neutral-400">
                  New chunks are staged in background. Once validated, active pointer atomically
                  swaps, immediately retiring superseded versions.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#1A1A1C] border border-[#2B2B30] space-y-1">
                <span className="text-[11px] font-mono text-purple-400 font-bold">
                  3. Immediate Exclusion
                </span>
                <p className="text-xs text-neutral-400">
                  Unpublished or deleted records are excluded from retrieval immediately at query
                  time, guaranteeing zero leakage.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SOURCES TABLE */}
      {activeTab === 'sources' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-3 bg-[#141415] p-3 rounded-xl border border-[#262626]">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                type="text"
                placeholder="Filter by title or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-[#1A1A1C] border border-[#2B2B30] rounded-lg text-xs text-white placeholder-neutral-500 outline-none"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-[#1A1A1C] border border-[#2B2B30] text-xs text-white px-3 py-1.5 rounded-lg outline-none"
            >
              <option value="all">All Source Types</option>
              <option value="lesson">Lessons</option>
              <option value="interview_question">Interview Questions</option>
              <option value="course">Courses</option>
              <option value="article">Articles</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-[#1A1A1C] border border-[#2B2B30] text-xs text-white px-3 py-1.5 rounded-lg outline-none"
            >
              <option value="all">All Indexing Statuses</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-[#262626] bg-[#141415]">
            <table className="w-full text-left text-xs text-neutral-300">
              <thead className="bg-[#1A1A1C] text-neutral-400 font-mono text-[11px] uppercase border-b border-[#262626]">
                <tr>
                  <th className="py-2.5 px-3">Source Type</th>
                  <th className="py-2.5 px-3">Title / Topic</th>
                  <th className="py-2.5 px-3">Version</th>
                  <th className="py-2.5 px-3">Chunks</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Last Indexed</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262626]">
                {filteredSources.slice(0, 50).map((s) => (
                  <tr key={s.id} className="hover:bg-[#1A1A1D] transition">
                    <td className="py-2.5 px-3 font-mono capitalize text-purple-300">
                      {s.sourceType.replace('_', ' ')}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-white max-w-xs truncate">
                      {s.sourceTitle}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-neutral-400">
                      v{s.indexedVersion || 0} / v{s.currentVersion}
                    </td>
                    <td className="py-2.5 px-3 font-mono">{s.chunkCount}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono capitalize ${
                          s.indexingStatus === 'completed'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : s.indexingStatus === 'failed'
                              ? 'bg-red-500/10 text-red-400'
                              : 'bg-amber-500/10 text-amber-400'
                        }`}
                      >
                        {s.indexingStatus}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-neutral-400 text-[11px]">
                      {s.lastIndexedAt ? new Date(s.lastIndexedAt).toLocaleTimeString() : 'Never'}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => handleIndexSingle(s.sourceType, s.sourceId)}
                        className="px-2.5 py-1 rounded bg-[#27272A] hover:bg-purple-600 hover:text-white text-neutral-300 text-[11px] font-semibold transition"
                      >
                        Re-index
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: JOBS QUEUE */}
      {activeTab === 'jobs' && (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-xl border border-[#262626] bg-[#141415]">
            <table className="w-full text-left text-xs text-neutral-300">
              <thead className="bg-[#1A1A1C] text-neutral-400 font-mono text-[11px] uppercase border-b border-[#262626]">
                <tr>
                  <th className="py-2.5 px-3">Job ID</th>
                  <th className="py-2.5 px-3">Job Type</th>
                  <th className="py-2.5 px-3">Source Target</th>
                  <th className="py-2.5 px-3">Version</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Attempts</th>
                  <th className="py-2.5 px-3">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262626]">
                {jobs.map((j) => (
                  <tr key={j.id} className="hover:bg-[#1A1A1D] transition">
                    <td className="py-2 px-3 font-mono text-neutral-500 text-[10px]">
                      {j.id.slice(0, 8)}...
                    </td>
                    <td className="py-2 px-3 font-mono text-white text-xs">{j.jobType}</td>
                    <td className="py-2 px-3 font-mono text-purple-300">
                      {j.sourceType}:{j.sourceId}
                    </td>
                    <td className="py-2 px-3 font-mono text-neutral-400">v{j.version}</td>
                    <td className="py-2 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono capitalize ${
                          j.status === 'completed'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : j.status === 'failed'
                              ? 'bg-red-500/10 text-red-400'
                              : 'bg-amber-500/10 text-amber-400'
                        }`}
                      >
                        {j.status}
                      </span>
                    </td>
                    <td className="py-2 px-3 font-mono text-neutral-400">
                      {j.attempts} / {j.maxAttempts}
                    </td>
                    <td className="py-2 px-3 text-neutral-400 text-[11px]">
                      {new Date(j.createdAt).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: RAG TEST PLAYGROUND */}
      {activeTab === 'playground' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-[#141415] border border-[#262626] space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Interactive RAG Inspection Playground</span>
            </h3>
            <p className="text-xs text-neutral-400">
              Query the vector database directly, inspect cosine similarity scores, view matched
              chunks, and verify that generated answers reflect the newest published versions.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <input
                type="text"
                placeholder="Enter a test question (e.g. What is StaleElementReferenceException in Selenium?)..."
                value={playgroundQuery}
                onChange={(e) => setPlaygroundQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRunPlayground();
                }}
                className="flex-1 w-full p-2.5 rounded-xl bg-[#1A1A1C] border border-[#2B2B30] text-xs sm:text-sm text-white placeholder-neutral-500 outline-none focus:border-purple-500"
              />
              <select
                value={playgroundCourse}
                onChange={(e) => setPlaygroundCourse(e.target.value)}
                className="w-full sm:w-auto bg-[#1A1A1C] border border-[#2B2B30] text-xs text-white p-2.5 rounded-xl outline-none"
              >
                <option value="">All Courses (Global)</option>
                <option value="course-playwright-mastery">Playwright Mastery</option>
                <option value="course-selenium-mastery">Selenium Mastery</option>
                <option value="course-ai-qa-mastery">AI QA Mastery</option>
                <option value="course-cicd-devops">CI/CD DevOps</option>
              </select>
              <button
                onClick={handleRunPlayground}
                disabled={!playgroundQuery.trim() || isQueryingPlayground}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                {isQueryingPlayground ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Play className="w-3.5 h-3.5" />
                )}
                <span>Test Retrieval</span>
              </button>
            </div>
          </div>

          {/* Playground Results */}
          {playgroundResult && (
            <div className="space-y-6">
              {/* Generated Answer */}
              <div className="p-5 rounded-2xl bg-[#141415] border border-purple-500/30 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-purple-300">Synthesized Grounded Answer:</span>
                  <span className="font-mono text-neutral-400">
                    Model: {playgroundResult.answerResult?.modelUsed} (
                    {playgroundResult.answerResult?.latencyMs}ms)
                  </span>
                </div>
                <div className="prose prose-invert prose-xs max-w-none text-neutral-200 text-xs sm:text-sm whitespace-pre-line leading-relaxed">
                  {playgroundResult.answerResult?.answer}
                </div>
              </div>

              {/* Retrieved Chunks Audit */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                  Retrieved Knowledge Chunks ({playgroundResult.retrievedCount ?? 0} matches):
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(playgroundResult.chunks ?? []).map((chk: any, idx: number) => (
                    <div
                      key={chk.chunkId || idx}
                      className="p-4 rounded-xl bg-[#161618] border border-[#27272A] space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-white truncate">{chk.sourceTitle}</span>
                        <span className="font-mono text-emerald-400 font-bold">
                          {Math.round(chk.similarityScore * 100)}% match
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-neutral-400 font-mono">
                        <span>{chk.sourceType}</span>
                        <span>•</span>
                        <span>Chunk v{chk.contentVersion}</span>
                        <span>•</span>
                        <span
                          className={chk.isLatestVersion ? 'text-emerald-400' : 'text-amber-400'}
                        >
                          {chk.isLatestVersion ? 'Latest Version' : 'Outdated!'}
                        </span>
                      </div>
                      <p className="text-neutral-300 text-[11px] bg-[#1F1F22] p-2.5 rounded-lg border border-[#2B2B30] font-mono leading-relaxed">
                        {chk.chunkExcerpt}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
