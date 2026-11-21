'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  User,
  Flame,
  Award,
  BookOpen,
  CheckCircle2,
  Code2,
  Sparkles,
  ArrowRight,
  TrendingUp,
  FileText,
  Clock,
  ExternalLink,
  Eye,
  Trash2,
  Copy,
  Check,
  FileSpreadsheet,
  Download,
  X,
} from 'lucide-react';
import { QADatabase, DEMO_USER, getInitials } from '@/lib/qa-db';
import { UserProfile, UserProgress, QAGeneratedArtifact, InterviewSession } from '@/types/qa';
import { QA_TRACKS } from '@/lib/qa-curriculum';
import AuthGuard from '@/components/auth/auth-guard';
import ProfileModal from '@/components/profile/profile-modal';
import { exportRequirementsToExcel, exportTestMatrixToExcel } from '@/lib/excel-export';

export default function UserDashboardPage() {
  const [profile, setProfile] = useState<UserProfile>(DEMO_USER);
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [artifacts, setArtifacts] = useState<QAGeneratedArtifact[]>([]);
  const [interviews, setInterviews] = useState<InterviewSession[]>([]);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedArtifact, setSelectedArtifact] = useState<QAGeneratedArtifact | null>(null);
  const [copiedArtifact, setCopiedArtifact] = useState(false);

  useEffect(() => {
    const user = QADatabase.getCurrentUser() || DEMO_USER;
    setProfile(user);

    QADatabase.getProfile(user.id).then(p => p && setProfile(p));
    QADatabase.getProgress(user.id).then(setProgress);
    QADatabase.getArtifacts(user.id).then(setArtifacts);
    QADatabase.getInterviewSessions(user.id).then(setInterviews);

    const handleAuthChange = () => {
      const updated = QADatabase.getCurrentUser() || DEMO_USER;
      setProfile(updated);
      QADatabase.getProgress(updated.id).then(setProgress);
      QADatabase.getArtifacts(updated.id).then(setArtifacts);
      QADatabase.getInterviewSessions(updated.id).then(setInterviews);
    };

    const handleArtifactsChange = () => {
      const current = QADatabase.getCurrentUser() || DEMO_USER;
      QADatabase.getArtifacts(current.id).then(setArtifacts);
    };

    const handleProgressChange = () => {
      const current = QADatabase.getCurrentUser() || DEMO_USER;
      QADatabase.getProgress(current.id).then(setProgress);
      QADatabase.getProfile(current.id).then(p => p && setProfile(p));
    };

    window.addEventListener('intelligentqa_auth_changed', handleAuthChange);
    window.addEventListener('intelligentqa_artifacts_changed', handleArtifactsChange);
    window.addEventListener('intelligentqa_progress_updated', handleProgressChange);
    return () => {
      window.removeEventListener('intelligentqa_auth_changed', handleAuthChange);
      window.removeEventListener('intelligentqa_artifacts_changed', handleArtifactsChange);
      window.removeEventListener('intelligentqa_progress_updated', handleProgressChange);
    };
  }, []);

  const totalCompletedLessons = progress.filter(p => p.status === 'completed').length;

  const handleDeleteArtifact = async (e: React.MouseEvent, artId: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this artifact?')) {
      const user = QADatabase.getCurrentUser() || DEMO_USER;
      await QADatabase.deleteArtifact(user.id, artId);
      const updated = await QADatabase.getArtifacts(user.id);
      setArtifacts(updated);
      if (selectedArtifact?.id === artId) {
        setSelectedArtifact(null);
      }
    }
  };

  const handleCopyContent = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedArtifact(true);
    setTimeout(() => setCopiedArtifact(false), 2000);
  };

  const handleExportExcel = (art: QAGeneratedArtifact) => {
    if (art.agentType === 'requirements') {
      exportRequirementsToExcel(art.outputContent, `requirements-${art.id}`);
    } else {
      exportTestMatrixToExcel(art.outputContent, `test-cases-${art.id}`);
    }
  };

  const handleDownloadMarkdown = (art: QAGeneratedArtifact) => {
    const blob = new Blob([art.outputContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `artifact-${art.agentType}-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getAgentBadgeStyle = (agentType: string) => {
    switch (agentType) {
      case 'requirements':
        return 'bg-cyan-50 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800';
      case 'test_cases':
        return 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'automation_code':
        return 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
      case 'code_review':
        return 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      default:
        return 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';
    }
  };

  const getAgentLabel = (agentType: string) => {
    switch (agentType) {
      case 'requirements':
        return 'Requirement Generator';
      case 'test_cases':
        return 'Test Case Generator';
      case 'automation_code':
        return 'Automation Generator';
      case 'code_review':
        return 'Code Auditor';
      default:
        return 'Senior SDET Chat';
    }
  };

  return (
    <AuthGuard
      featureName="Your SDET Learning Dashboard"
      description="Sign in to view your learning progress, streak, code challenge submissions, and AI interview scorecards."
    >
      <div className="w-full max-w-7xl mx-auto p-4 md:p-6 space-y-8">
      {/* Profile Incomplete Banner */}
      {!profile.profileCompleted && (
        <div className="p-4 rounded-3xl bg-gradient-to-r from-emerald-950/70 via-slate-900 to-indigo-950 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-md">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-slate-200">
              <strong>Complete your QA Profile</strong>: Select your current testing background and years of experience so we can personalize your SDET track and interview rounds.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowProfileModal(true)}
            className="py-1.5 px-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-sm shrink-0 self-start sm:self-auto cursor-pointer"
          >
            Complete Profile
          </button>
        </div>
      )}

      {/* Profile Overview Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-6 md:p-8 shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-sky-500 text-slate-950 font-black text-2xl flex items-center justify-center shrink-0 shadow-lg">
            {getInitials(profile.displayName)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                {profile.displayName}
              </h1>
              {profile.profileCompleted && profile.targetRole && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {profile.targetRole}
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
              <span>{profile.email}</span>
              {profile.profileCompleted && typeof profile.experienceYears === 'number' && profile.experienceYears > 0 ? (
                <>
                  <span>·</span>
                  <span>{profile.experienceYears} Years QA Experience</span>
                </>
              ) : profile.profileCompleted && profile.experienceYears === 0 ? (
                <>
                  <span>·</span>
                  <span>Fresher / Beginner QA</span>
                </>
              ) : (
                <>
                  <span>·</span>
                  <button
                    type="button"
                    onClick={() => setShowProfileModal(true)}
                    className="text-emerald-400 hover:text-emerald-300 font-semibold underline decoration-dotted cursor-pointer"
                  >
                    + Add QA Experience &amp; Role
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={() => setShowProfileModal(true)}
                className="text-[11px] text-slate-300 hover:text-white px-2 py-0.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors ml-1 cursor-pointer font-medium"
              >
                Edit Profile
              </button>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-center px-4 py-2.5 bg-white/5 rounded-2xl border border-white/10">
            <div className="flex items-center justify-center gap-1.5 text-amber-400 font-extrabold text-xl">
              <Flame className="w-5 h-5 fill-current" />
              {profile.streakCount}
            </div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              Day Streak
            </div>
          </div>

          <div className="text-center px-4 py-2.5 bg-white/5 rounded-2xl border border-white/10">
            <div className="flex items-center justify-center gap-1.5 text-emerald-400 font-extrabold text-xl">
              <CheckCircle2 className="w-5 h-5" />
              {totalCompletedLessons}
            </div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              Completed
            </div>
          </div>
        </div>
      </div>

      {/* Track Progress Cards */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Your Track Progress
          </h2>
          <Link href="/tracks" className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
            View All 5 Tracks →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {QA_TRACKS.map(track => {
            const completedInTrack = progress.filter(
              p => p.trackId === track.id && p.status === 'completed'
            ).length;
            const pct = Math.min(Math.round((completedInTrack / track.totalLessons) * 100), 100);

            return (
              <div
                key={track.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${track.badgeColor}`}>
                    {track.title.split(' ')[0]}
                  </span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {completedInTrack === 0 ? 'Not Started' : `${pct}%`}
                  </span>
                </div>

                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-0.5">
                    {track.id === 'selenium-java'
                      ? 'Stage 1 · Core Foundation'
                      : track.id === 'playwright-ts'
                      ? 'Stage 2 · Modern Web Testing'
                      : track.id === 'api-testing'
                      ? 'Stage 3 · API Automation'
                      : track.id === 'ai-qa'
                      ? 'Stage 4 · AI Augmentation'
                      : 'Capstone · SDET Interview'}
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-lg sm:text-xl leading-snug">
                    {track.title}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1 line-clamp-2">{track.tagline}</p>
                </div>

                <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${pct}%` }} />
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-sm">
                  <span className="text-slate-500">
                    {completedInTrack === 0 ? 'Not Started' : `${completedInTrack} / ${track.totalLessons} Lessons`}
                  </span>
                  <Link
                    href={`/tracks/${track.id}`}
                    className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1.5"
                  >
                    {completedInTrack === 0 ? 'Start Course' : completedInTrack >= track.totalLessons ? 'Review Course' : 'Resume Course'}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Generated QA Artifacts Section - Dedicated, Interactive, with Excel Export & View */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Saved QA Artifacts &amp; History
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                {artifacts.length} Saved
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              All user stories, test matrices, automation code, and code review audits generated by your QA AI Agents are permanently saved here.
            </p>
          </div>
          <Link
            href="/qa-agents"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs transition-colors shrink-0 shadow-sm"
          >
            <span>Open QA Agents Suite</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {artifacts.length === 0 ? (
          <div className="text-center py-12 px-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            <Sparkles className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">
              No Artifacts Saved Yet
            </h3>
            <p className="text-slate-500 text-xs mt-1 max-w-md mx-auto">
              Run any prompt or import a document in the QA AI Agents Suite to generate and persist test matrices, requirements, or automation scripts.
            </p>
            <Link
              href="/qa-agents"
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs transition-colors"
            >
              Generate Your First Artifact →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {artifacts.map(art => (
              <div
                key={art.id}
                className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-3.5 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold border ${getAgentBadgeStyle(art.agentType)}`}>
                        {getAgentLabel(art.agentType)}
                      </span>
                      {art.techStack && (
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-medium bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                          {art.techStack}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(art.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1">
                    {art.title}
                  </h3>

                  {art.inputPrompt && (
                    <p className="text-xs text-slate-500 italic line-clamp-2 bg-white/50 dark:bg-slate-900/40 p-2 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
                      "{art.inputPrompt}"
                    </p>
                  )}
                </div>

                {/* Actions row */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/60 gap-2 flex-wrap">
                  <button
                    onClick={() => setSelectedArtifact(art)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-xs transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Content</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    {(art.agentType === 'requirements' || art.agentType === 'test_cases') && (
                      <button
                        onClick={() => handleExportExcel(art)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                        title="Export as Excel spreadsheet (.xls)"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Excel</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleDownloadMarkdown(art)}
                      className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                      title="Download as Markdown"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={(e) => handleDeleteArtifact(e, art.id)}
                      className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                      title="Delete Artifact"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mock Interview Records */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-xl">
                Interview Scorecards &amp; Feedback ({interviews.length})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Detailed ratings from SDET technical simulation rounds
              </p>
            </div>
          </div>
          <Link href="/interview-griller" className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline">
            Take New Interview →
          </Link>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
          {interviews.length === 0 ? (
            <p className="text-slate-500 py-6 text-center">No interview sessions completed yet. Try the AI Interview Griller!</p>
          ) : (
            interviews.slice(0, 5).map(inv => (
              <div key={inv.id} className="py-3 flex items-center justify-between gap-3">
                <div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-xs sm:max-w-md">
                    {inv.title}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5 uppercase">
                    Difficulty: {inv.difficulty} · Track: {inv.trackId}
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-sm text-emerald-600 dark:text-emerald-400">
                    {inv.overallScore}%
                  </span>
                  <span className="block text-[10px] text-slate-400">Grade</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Artifact Preview Modal */}
      {selectedArtifact && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-4xl w-full max-h-[88vh] overflow-hidden shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold border ${getAgentBadgeStyle(selectedArtifact.agentType)}`}>
                    {getAgentLabel(selectedArtifact.agentType)}
                  </span>
                  <span className="px-2 py-0.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {selectedArtifact.techStack}
                  </span>
                  <span className="text-xs text-slate-400">
                    {new Date(selectedArtifact.createdAt).toLocaleString()}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {selectedArtifact.title}
                </h2>
              </div>
              <button
                onClick={() => setSelectedArtifact(null)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {selectedArtifact.inputPrompt && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Input Prompt / Seed Requirement:
                  </span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 italic">
                    {selectedArtifact.inputPrompt}
                  </p>
                </div>
              )}

              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Generated Artifact Content:
                </span>
                <pre className="p-4 bg-slate-950 text-slate-100 rounded-xl text-xs font-mono whitespace-pre-wrap leading-relaxed border border-slate-800 max-h-[420px] overflow-y-auto">
                  {selectedArtifact.outputContent}
                </pre>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 flex-wrap bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyContent(selectedArtifact.outputContent)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  {copiedArtifact ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedArtifact ? 'Copied to Clipboard!' : 'Copy Content'}</span>
                </button>

                {(selectedArtifact.agentType === 'requirements' || selectedArtifact.agentType === 'test_cases') && (
                  <button
                    onClick={() => handleExportExcel(selectedArtifact)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-sm"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Export in Excel (.xls)</span>
                  </button>
                )}

                <button
                  onClick={() => handleDownloadMarkdown(selectedArtifact)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download .md</span>
                </button>
              </div>

              <button
                onClick={() => setSelectedArtifact(null)}
                className="px-4 py-2 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-xl text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Customization Modal */}
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onSaved={updated => setProfile(updated)}
      />
    </div>
    </AuthGuard>
  );
}
