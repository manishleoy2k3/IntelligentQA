'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  ShieldCheck,
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  UploadCloud,
  RotateCcw,
  Terminal,
  Code2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Search,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Check,
  X,
  FileText,
  Layers,
  Copy,
  Users,
  Clock,
  Lock,
  LayoutDashboard,
  Folder,
  Tag as TagIcon,
  Image as ImageIcon,
  Send,
  Globe,
  Settings,
  Archive,
  Calendar,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { QADatabase } from '@/lib/qa-db';
import { Track, Module, Lesson, ModerationItem } from '@/types/qa';
import {
  CMSArticle,
  CMSCategory,
  CMSTag,
  CMSMediaItem,
  CMSStats,
  EditorJSData,
  ArticleStatus,
} from '@/types/cms';
import RichBlockEditor from '@/components/cms/editor/rich-block-editor';
import MediaLibraryModal from '@/components/cms/media-library-modal';

type CMSTab =
  | 'dashboard'
  | 'articles'
  | 'courses'
  | 'categories'
  | 'tags'
  | 'media'
  | 'drafts'
  | 'published'
  | 'seo'
  | 'approvals'
  | 'team';

function CMSPortalContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawTab = searchParams.get('tab') as CMSTab | null;

  const [activeTab, setActiveTab] = useState<CMSTab>(rawTab || 'dashboard');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  // Security Passcode Gate
  const [gatePasscode, setGatePasscode] = useState('');
  const [gateError, setGateError] = useState<string | null>(null);

  // CMS Data Stores
  const [stats, setStats] = useState<CMSStats | null>(null);
  const [articles, setArticles] = useState<CMSArticle[]>([]);
  const [categories, setCategories] = useState<CMSCategory[]>([]);
  const [tags, setTags] = useState<CMSTag[]>([]);
  const [courses, setCourses] = useState<Track[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('selenium-java');

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Article Editing & Creation State
  const [editingArticle, setEditingArticle] = useState<CMSArticle | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isSavingArticle, setIsSavingArticle] = useState(false);

  // Article Meta Inputs
  const [articleTitle, setArticleTitle] = useState('');
  const [articleSubtitle, setArticleSubtitle] = useState('');
  const [articleSlug, setArticleSlug] = useState('');
  const [articleDesc, setArticleDesc] = useState('');
  const [articleCategory, setArticleCategory] = useState('UI Automation');
  const [articleTagsInput, setArticleTagsInput] = useState('');
  const [articleFeaturedImg, setArticleFeaturedImg] = useState('');
  const [articleImgCaption, setArticleImgCaption] = useState('');
  const [articleStatus, setArticleStatus] = useState<ArticleStatus>('draft');
  const [articleContent, setArticleContent] = useState<EditorJSData>({ blocks: [] });
  const [articleSeoTitle, setArticleSeoTitle] = useState('');
  const [articleSeoDesc, setArticleSeoDesc] = useState('');
  const [articleCanonical, setArticleCanonical] = useState('');

  // Course / Module / Lesson Modal
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [editingCourseTarget, setEditingCourseTarget] = useState<{
    courseId: string;
    moduleId?: string;
    lesson?: Lesson | null;
  } | null>(null);

  // Delete Confirm Modal State
  const [showDeleteConfirmId, setShowDeleteConfirmId] = useState<string | null>(null);

  // Moderation & Approvals (Preserving test requirements)
  const [submissions, setSubmissions] = useState<ModerationItem[]>([]);
  const [previewSubmission, setPreviewSubmission] = useState<ModerationItem | null>(null);
  const [rejectingSubmission, setRejectingSubmission] = useState<ModerationItem | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Team & RBAC (Preserving test requirements)
  const [adminEmails, setAdminEmails] = useState<string[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [adminSecret, setAdminSecret] = useState('');
  const [isEditingSecret, setIsEditingSecret] = useState(false);
  const [newSecretInput, setNewSecretInput] = useState('');

  // Media Library Modal
  const [mediaModalOpen, setMediaModalOpen] = useState(false);

  // Toast Banner
  const [banner, setBanner] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const showBanner = (message: string, type: 'success' | 'error' = 'success') => {
    setBanner({ message, type });
    setTimeout(() => setBanner(null), 3500);
  };

  // 1. Initial Authentication & Load
  useEffect(() => {
    const user = QADatabase.getCurrentUser();
    setCurrentUser(user);
    const adminCheck = user?.role === 'admin' || QADatabase.isAdmin(user);
    setIsAdmin(adminCheck);

    if (adminCheck) {
      loadAllData();
    }
  }, []);

  const loadAllData = async () => {
    try {
      // Load stats
      const statsRes = await fetch('/api/admin/cms?action=stats');
      const statsData = await statsRes.json();
      if (statsData.success) setStats(statsData.stats);

      // Load articles
      const artRes = await fetch('/api/admin/cms?action=articles');
      const artData = await artRes.json();
      if (artData.success) setArticles(artData.articles);

      // Load categories
      const catRes = await fetch('/api/admin/cms?action=categories');
      const catData = await catRes.json();
      if (catData.success) setCategories(catData.categories);

      // Load tags
      const tagRes = await fetch('/api/admin/cms?action=tags');
      const tagData = await tagRes.json();
      if (tagData.success) setTags(tagData.tags);

      // Load courses
      const cList = QADatabase.getTracks();
      setCourses(cList);

      // Load moderation & admin team
      const subs = QADatabase.getPendingSubmissions();
      setSubmissions(subs);
      const emails = QADatabase.getAdminEmails();
      setAdminEmails(emails);
      const sec = QADatabase.getAdminSecret();
      setAdminSecret(sec);
    } catch (err) {
      console.error('Failed to load CMS data:', err);
    }
  };

  const handleGateUnlock = () => {
    const ok = QADatabase.verifyAndElevateAdmin(gatePasscode);
    if (ok) {
      setIsAdmin(true);
      setGateError(null);
      loadAllData();
      showBanner('Administrator access verified and elevated.');
    } else {
      setGateError('Incorrect security passcode. Access denied.');
    }
  };

  // Open Article Editor
  const handleOpenArticleEditor = (art?: CMSArticle) => {
    if (art) {
      setEditingArticle(art);
      setArticleTitle(art.title);
      setArticleSubtitle(art.subtitle || '');
      setArticleSlug(art.slug);
      setArticleDesc(art.shortDescription);
      setArticleCategory(art.category);
      setArticleTagsInput(art.tags.join(', '));
      setArticleFeaturedImg(art.featuredImage || '');
      setArticleImgCaption(art.featuredImageCaption || '');
      setArticleStatus(art.status);
      setArticleContent(art.content || { blocks: [] });
      setArticleSeoTitle(art.seoTitle || '');
      setArticleSeoDesc(art.seoDescription || '');
      setArticleCanonical(art.canonicalUrl || '');
    } else {
      // New article
      setEditingArticle(null);
      setArticleTitle('');
      setArticleSubtitle('');
      setArticleSlug('');
      setArticleDesc('');
      setArticleCategory(categories[0]?.name || 'UI Automation');
      setArticleTagsInput('Selenium, Java, Automation');
      setArticleFeaturedImg('');
      setArticleImgCaption('');
      setArticleStatus('draft');
      setArticleContent({
        time: Date.now(),
        version: '2.28.0',
        blocks: [
          {
            id: `blk-${Date.now()}`,
            type: 'paragraph',
            data: { text: 'Start drafting your technical tutorial here...' },
          },
        ],
      });
      setArticleSeoTitle('');
      setArticleSeoDesc('');
      setArticleCanonical('');
    }
    setIsEditorOpen(true);
  };

  // Save Article
  const handleSaveArticle = async (newStatus?: ArticleStatus) => {
    if (!articleTitle.trim()) {
      showBanner('Please provide an article title.', 'error');
      return;
    }

    setIsSavingArticle(true);
    const tagsArray = articleTagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const payload: Partial<CMSArticle> = {
      id: editingArticle?.id,
      title: articleTitle,
      subtitle: articleSubtitle,
      slug: (articleSlug || articleTitle.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')).toLowerCase(),
      shortDescription: articleDesc,
      category: articleCategory,
      tags: tagsArray,
      featuredImage: articleFeaturedImg,
      featuredImageCaption: articleImgCaption,
      status: newStatus || articleStatus,
      content: articleContent,
      seoTitle: articleSeoTitle || `${articleTitle} | IntelligentQA`,
      seoDescription: articleSeoDesc || articleDesc,
      canonicalUrl: articleCanonical || `https://intelligentqa.io/blog/${articleSlug}`,
    };

    try {
      const res = await fetch('/api/admin/cms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': 'admin-session',
        },
        body: JSON.stringify({
          action: 'save_article',
          article: payload,
          author: currentUser || { id: 'usr-admin-001', displayName: 'Course Administrator' },
        }),
      });

      const data = await res.json();
      if (data.success && data.article) {
        showBanner(`Article "${data.article.title}" saved successfully!`);
        setEditingArticle(data.article);
        setArticleStatus(data.article.status);
        loadAllData();
      } else {
        showBanner(data.error || 'Failed to save article', 'error');
      }
    } catch (err: any) {
      showBanner(err.message || 'Save error', 'error');
    } finally {
      setIsSavingArticle(false);
    }
  };

  // Duplicate Article
  const handleDuplicateArticle = async (id: string) => {
    try {
      const res = await fetch('/api/admin/cms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'duplicate_article', id, author: currentUser }),
      });
      const data = await res.json();
      if (data.success) {
        showBanner(`Duplicated: ${data.article.title}`);
        loadAllData();
      }
    } catch (err: any) {
      showBanner(err.message || 'Duplication error', 'error');
    }
  };

  // Delete Article
  const handleDeleteArticle = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      const res = await fetch(`/api/admin/cms?action=article&id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        showBanner(`Deleted "${title}"`);
        loadAllData();
      }
    } catch (err: any) {
      showBanner(err.message || 'Delete error', 'error');
    }
  };

  // Restore Revision
  const handleRestoreRevision = async (revId: string) => {
    if (!editingArticle) return;
    try {
      const res = await fetch('/api/admin/cms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'restore_revision',
          articleId: editingArticle.id,
          revisionId: revId,
          user: currentUser,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setEditingArticle(data.article);
        setArticleContent(data.article.content);
        showBanner('Revision snapshot restored successfully!');
      }
    } catch (err: any) {
      showBanner(err.message || 'Restore error', 'error');
    }
  };

  // Course Module Reordering
  const handleMoveModule = (courseId: string, moduleIndex: number, direction: 'up' | 'down') => {
    const course = courses.find((c) => c.id === courseId);
    if (!course) return;
    if (direction === 'up' && moduleIndex === 0) return;
    if (direction === 'down' && moduleIndex === course.modules.length - 1) return;

    const targetIdx = direction === 'up' ? moduleIndex - 1 : moduleIndex + 1;
    const nextModules = [...course.modules];
    const [moved] = nextModules.splice(moduleIndex, 1);
    nextModules.splice(targetIdx, 0, moved);

    const updatedTrack = { ...course, modules: nextModules };
    QADatabase.saveTrack(updatedTrack);
    setCourses(QADatabase.getTracks());
    showBanner(`Reordered module "${moved.title}" ${direction}`);
  };

  // Course Lesson Reordering & Sequence Controls
  const handleMoveLesson = (
    courseId: string,
    moduleId: string,
    lessonIndex: number,
    direction: 'up' | 'down'
  ) => {
    const course = courses.find((c) => c.id === courseId);
    if (!course) return;
    const mod = course.modules.find((m) => m.id === moduleId);
    if (!mod) return;
    const lesson = mod.lessons[lessonIndex];
    if (lesson) {
      QADatabase.moveLesson(courseId as any, lesson.id, direction);
      setCourses(QADatabase.getTracks());
      showBanner(`Reordered lesson "${lesson.title}" ${direction}`);
    }
  };

  const handleToggleLessonDisabled = (courseId: string, moduleId: string, lessonId: string) => {
    QADatabase.toggleLessonDisabled(courseId as any, lessonId);
    setCourses(QADatabase.getTracks());
    showBanner('Toggled lesson visibility status');
  };

  // Moderation Handlers (Preserving test compatibility)
  const approveSubmission = (subId: string) => {
    const ok = QADatabase.approveSubmission(subId, currentUser?.displayName || 'Admin');
    if (ok) {
      setSubmissions(QADatabase.getPendingSubmissions());
      showBanner('Content submission approved and published!');
    }
  };

  const rejectSubmission = (subId: string, reason: string) => {
    const ok = QADatabase.rejectSubmission(subId, reason, currentUser?.displayName || 'Admin');
    if (ok) {
      setSubmissions(QADatabase.getPendingSubmissions());
      setRejectingSubmission(null);
      setRejectionReason('');
      showBanner('Submission rejected with reason provided.');
    }
  };

  // Filter Articles
  const filteredArticles = articles.filter((art) => {
    const matchSearch =
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchCat = categoryFilter === 'all' || art.category === categoryFilter;
    const matchStatus = statusFilter === 'all' || art.status === statusFilter;
    return matchSearch && matchCat && matchStatus;
  });

  // Selected Course
  const currentCourse = courses.find((c) => c.id === selectedCourseId) || courses[0];

  // If Non-Admin: Show Security Passcode Gate
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#09090B] flex items-center justify-center p-4 font-sans text-slate-100">
        <div className="w-full max-w-md p-8 rounded-3xl border border-[#27272A] bg-[#121215] shadow-2xl space-y-6 text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center">
            <Lock className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-xl font-extrabold text-white">Administrator Access Gateway</h1>
            <p className="text-xs text-[#A1A1AA]">
              Enter the master passcode to unlock the Open-Source Content Management System
            </p>
          </div>

          <div className="space-y-3">
            <input
              type="password"
              placeholder="Master Admin Security Passcode"
              value={gatePasscode}
              onChange={(e) => setGatePasscode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGateUnlock()}
              className="w-full px-4 py-2.5 bg-[#09090B] border border-[#27272A] rounded-xl text-sm text-white focus:outline-none focus:border-purple-500 text-center font-mono"
            />
            {gateError && <p className="text-xs text-rose-400">{gateError}</p>}
            <button
              type="button"
              onClick={handleGateUnlock}
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg transition-colors cursor-pointer"
            >
              Verify &amp; Unlock CMS Console
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090B] text-slate-100 font-sans flex flex-col">
      {/* Toast Banner */}
      {banner && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded-xl border text-xs font-semibold shadow-2xl flex items-center gap-2 ${
            banner.type === 'error'
              ? 'bg-rose-950/90 border-rose-500 text-rose-200'
              : 'bg-emerald-950/90 border-emerald-500 text-emerald-200'
          }`}
        >
          {banner.type === 'error' ? (
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          ) : (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          )}
          <span>{banner.message}</span>
        </div>
      )}

      {/* Top Banner Navigation */}
      <header className="border-b border-[#27272A] bg-[#121215] px-6 py-4 flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold text-white">Open-Source CMS Console</h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                100% Free &amp; Open Source
              </span>
            </div>
            <p className="text-xs text-[#A1A1AA]">
              Publish and format technical tutorials, rich articles, and structured courses without code
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/blog"
            target="_blank"
            className="px-3 py-1.5 rounded-lg border border-[#27272A] bg-[#1A1A1E] hover:bg-[#27272A] text-xs text-[#D4D4D8] flex items-center gap-1.5 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-purple-400" />
            <span>View Public Blog</span>
          </Link>

          <button
            type="button"
            onClick={() => handleOpenArticleEditor()}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Article</span>
          </button>
        </div>
      </header>

      {/* Sub Navigation Menu */}
      <nav className="border-b border-[#27272A] bg-[#141417] px-6 flex items-center gap-1 overflow-x-auto text-xs shrink-0 select-none">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'articles', label: 'Articles / Tutorials', icon: FileText },
          { id: 'courses', label: 'Courses & Hierarchy', icon: Layers },
          { id: 'categories', label: 'Categories', icon: Folder },
          { id: 'tags', label: 'Tags', icon: TagIcon },
          { id: 'media', label: 'Media Library', icon: ImageIcon },
          { id: 'drafts', label: 'Drafts', icon: Edit2 },
          { id: 'published', label: 'Published Content', icon: CheckCircle2 },
          { id: 'seo', label: 'SEO Management', icon: Globe },
          { id: 'approvals', label: 'Approvals Queue', icon: CheckCircle2 },
          { id: 'team', label: 'Admin Team & RBAC', icon: Users },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as CMSTab)}
              className={`py-3.5 px-3.5 border-b-2 font-semibold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'border-purple-500 text-purple-300 bg-purple-500/5'
                  : 'border-transparent text-[#A1A1AA] hover:text-white hover:bg-[#1A1A1E]/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Main Content Body */}
      <div className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
        {/* ============================================================ */}
        {/* TAB 1: DASHBOARD METRICS */}
        {/* ============================================================ */}
        {activeTab === 'dashboard' && stats && (
          <div className="space-y-8">
            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl border border-[#27272A] bg-[#121215] space-y-1 shadow-md">
                <span className="text-xs text-[#71717A] uppercase font-bold tracking-wider">
                  Total Courses
                </span>
                <div className="text-3xl font-extrabold text-white">{stats.totalCourses}</div>
                <p className="text-[11px] text-emerald-400">Structured curricula tracks</p>
              </div>

              <div className="p-5 rounded-2xl border border-[#27272A] bg-[#121215] space-y-1 shadow-md">
                <span className="text-xs text-[#71717A] uppercase font-bold tracking-wider">
                  Total Articles
                </span>
                <div className="text-3xl font-extrabold text-white">{stats.totalArticles}</div>
                <p className="text-[11px] text-purple-400">Tutorials &amp; Masterclasses</p>
              </div>

              <div className="p-5 rounded-2xl border border-[#27272A] bg-[#121215] space-y-1 shadow-md">
                <span className="text-xs text-[#71717A] uppercase font-bold tracking-wider">
                  Published Articles
                </span>
                <div className="text-3xl font-extrabold text-emerald-400">
                  {stats.publishedArticles}
                </div>
                <p className="text-[11px] text-[#A1A1AA]">Live on public blog</p>
              </div>

              <div className="p-5 rounded-2xl border border-[#27272A] bg-[#121215] space-y-1 shadow-md">
                <span className="text-xs text-[#71717A] uppercase font-bold tracking-wider">
                  Draft Articles
                </span>
                <div className="text-3xl font-extrabold text-amber-400">{stats.draftArticles}</div>
                <p className="text-[11px] text-[#A1A1AA]">In-progress manuscripts</p>
              </div>
            </div>

            {/* Recently Updated & Published Split */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recently Updated Content */}
              <div className="p-6 rounded-2xl border border-[#27272A] bg-[#121215] space-y-4 shadow-md">
                <div className="flex items-center justify-between pb-3 border-b border-[#27272A]">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-purple-400" />
                    <span>Recently Updated Content</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab('articles')}
                    className="text-xs text-purple-400 hover:underline"
                  >
                    View All &rarr;
                  </button>
                </div>

                <div className="space-y-3">
                  {stats.recentlyUpdated.map((art) => (
                    <div
                      key={art.id}
                      onClick={() => handleOpenArticleEditor(art)}
                      className="p-3.5 rounded-xl border border-[#27272A] bg-[#18181C] hover:border-purple-500/40 transition-colors cursor-pointer flex items-center justify-between"
                    >
                      <div>
                        <h4 className="text-xs font-bold text-white">{art.title}</h4>
                        <div className="flex items-center gap-2 text-[10px] text-[#71717A] mt-1">
                          <span className="text-purple-400">{art.category}</span>
                          <span>•</span>
                          <span>Updated {new Date(art.updatedDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          art.status === 'published'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-amber-500/10 text-amber-400'
                        }`}
                      >
                        {art.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recently Published Content */}
              <div className="p-6 rounded-2xl border border-[#27272A] bg-[#121215] space-y-4 shadow-md">
                <div className="flex items-center justify-between pb-3 border-b border-[#27272A]">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Recently Published Content</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab('published')}
                    className="text-xs text-emerald-400 hover:underline"
                  >
                    View All &rarr;
                  </button>
                </div>

                <div className="space-y-3">
                  {stats.recentlyPublished.map((art) => (
                    <div
                      key={art.id}
                      className="p-3.5 rounded-xl border border-[#27272A] bg-[#18181C] flex items-center justify-between"
                    >
                      <div>
                        <h4 className="text-xs font-bold text-white">{art.title}</h4>
                        <div className="flex items-center gap-2 text-[10px] text-[#71717A] mt-1">
                          <span className="text-emerald-400">{art.category}</span>
                          <span>•</span>
                          <span>Published {new Date(art.publishedDate || 0).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <Link
                        href={`/blog/${art.slug}`}
                        target="_blank"
                        className="p-1.5 rounded-lg bg-[#27272A] text-[#D4D4D8] hover:text-white"
                        title="View Live"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: ARTICLES / TUTORIALS MANAGEMENT */}
        {/* ============================================================ */}
        {(activeTab === 'articles' || activeTab === 'drafts' || activeTab === 'published') && (
          <div className="space-y-6">
            {/* Filter and Search Bar */}
            <div className="p-4 rounded-2xl border border-[#27272A] bg-[#121215] flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-[280px]">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#71717A]" />
                  <input
                    type="text"
                    placeholder="Search articles by title or tags..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 bg-[#09090B] border border-[#27272A] rounded-xl text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-purple-500"
                  />
                </div>

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-[#09090B] border border-[#27272A] rounded-xl text-xs text-[#D4D4D8] px-3 py-1.5 focus:outline-none focus:border-purple-500"
                >
                  <option value="all">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>

                <select
                  value={activeTab === 'drafts' ? 'draft' : activeTab === 'published' ? 'published' : statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  disabled={activeTab === 'drafts' || activeTab === 'published'}
                  className="bg-[#09090B] border border-[#27272A] rounded-xl text-xs text-[#D4D4D8] px-3 py-1.5 focus:outline-none focus:border-purple-500 disabled:opacity-50"
                >
                  <option value="all">All Statuses</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="in_review">In Review</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => handleOpenArticleEditor()}
                className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>New Article</span>
              </button>
            </div>

            {/* Article Table */}
            <div className="rounded-2xl border border-[#27272A] bg-[#121215] overflow-hidden shadow-lg">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#27272A] bg-[#18181C] text-[#A1A1AA] uppercase font-bold tracking-wider">
                    <th className="p-4">Title &amp; Slug</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Author</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Reading Time</th>
                    <th className="p-4">Last Updated</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E1E22]">
                  {filteredArticles.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-10 text-center text-[#71717A]">
                        No articles match the current filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredArticles.map((art) => (
                      <tr key={art.id} className="hover:bg-[#151519] transition-colors">
                        <td className="p-4 max-w-sm">
                          <div className="font-bold text-white line-clamp-1">{art.title}</div>
                          <div className="text-[11px] font-mono text-purple-400 truncate">
                            /blog/{art.slug}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded-md bg-[#1C1C20] text-[#D4D4D8] border border-[#27272A]">
                            {art.category}
                          </span>
                        </td>
                        <td className="p-4 text-[#A1A1AA]">{art.createdBy.name}</td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              art.status === 'published'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                : art.status === 'draft'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                                : 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                            }`}
                          >
                            {art.status}
                          </span>
                        </td>
                        <td className="p-4 text-[#A1A1AA]">{art.readingTimeMinutes} mins</td>
                        <td className="p-4 text-[#71717A]">
                          {new Date(art.updatedDate).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-right space-x-1">
                          <button
                            type="button"
                            onClick={() => handleOpenArticleEditor(art)}
                            className="p-1.5 rounded-lg text-[#A1A1AA] hover:text-white hover:bg-[#27272A]"
                            title="Edit Article"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDuplicateArticle(art.id)}
                            className="p-1.5 rounded-lg text-[#A1A1AA] hover:text-white hover:bg-[#27272A]"
                            title="Duplicate Article"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          {art.status === 'published' && (
                            <Link
                              href={`/blog/${art.slug}`}
                              target="_blank"
                              className="p-1.5 rounded-lg text-emerald-400 hover:bg-[#27272A] inline-block"
                              title="View Live"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeleteArticle(art.id, art.title)}
                            className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10"
                            title="Delete Article"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 3: COURSES & CONTENT HIERARCHY */}
        {/* ============================================================ */}
        {activeTab === 'courses' && currentCourse && (
          <div className="space-y-6">
            {/* Course Selector Header */}
            <div className="p-5 rounded-2xl border border-[#27272A] bg-[#121215] flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-xs text-[#71717A] uppercase font-bold">Select Track:</span>
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="bg-[#09090B] border border-[#27272A] rounded-xl text-xs text-white font-bold px-3 py-1.5 focus:outline-none focus:border-purple-500"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="text-xs text-[#A1A1AA]">
                Reorder modules and lessons with drag or up/down controls. Each lesson maintains its own content.
              </div>
            </div>

            {/* Modules Accordion Hierarchy */}
            <div className="space-y-4">
              {currentCourse.modules.map((mod, mIdx) => (
                <div
                  key={mod.id}
                  className="rounded-2xl border border-[#27272A] bg-[#121215] overflow-hidden shadow-md"
                >
                  {/* Module Header with Reordering Controls */}
                  <div className="p-4 border-b border-[#27272A] bg-[#18181C] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono text-[10px] font-bold uppercase">
                        Module {mIdx + 1}
                      </span>
                      <h3 className="text-sm font-bold text-white">{mod.title}</h3>
                      <span className="text-xs text-[#71717A]">({mod.lessons.length} lessons)</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleMoveModule(currentCourse.id, mIdx, 'up')}
                        disabled={mIdx === 0}
                        className="p-1 rounded text-[#71717A] hover:text-white disabled:opacity-30"
                        title="Move Module Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveModule(currentCourse.id, mIdx, 'down')}
                        disabled={mIdx === currentCourse.modules.length - 1}
                        className="p-1 rounded text-[#71717A] hover:text-white disabled:opacity-30"
                        title="Move Module Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Lessons List in Module */}
                  <div className="p-4 space-y-2">
                    {mod.lessons.map((les, lIdx) => (
                      <div
                        key={les.id}
                        className="p-3 rounded-xl border border-[#27272A] bg-[#09090B] flex items-center justify-between hover:border-[#3F3F46] transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-[#1A1A1E] text-[10px] font-mono text-[#A1A1AA] flex items-center justify-center font-bold">
                            {lIdx + 1}
                          </span>
                          <div>
                            <span className="text-xs font-semibold text-white">{les.title}</span>
                            <span className="text-[10px] text-[#71717A] ml-2 font-mono">
                              ({les.durationMinutes} mins)
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleMoveLesson(currentCourse.id, mod.id, lIdx, 'up')}
                            disabled={lIdx === 0}
                            className="p-1 text-[#71717A] hover:text-white disabled:opacity-30"
                            title="Move Lesson Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveLesson(currentCourse.id, mod.id, lIdx, 'down')}
                            disabled={lIdx === mod.lessons.length - 1}
                            className="p-1 text-[#71717A] hover:text-white disabled:opacity-30"
                            title="Move Lesson Down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <Link
                            href={`/tracks/${currentCourse.id}/${les.id}`}
                            className="px-2.5 py-1 rounded-lg bg-[#1A1A1E] text-xs text-purple-300 hover:bg-[#27272A]"
                          >
                            Open Workspace
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 4: CATEGORIES */}
        {/* ============================================================ */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-[#27272A] bg-[#121215] overflow-hidden shadow-lg p-6 space-y-4">
              <h3 className="text-sm font-bold text-white">Content Taxonomy &amp; Categories</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((c) => (
                  <div
                    key={c.id}
                    className="p-4 rounded-xl border border-[#27272A] bg-[#18181C] space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-white">{c.name}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
                        {c.count} items
                      </span>
                    </div>
                    <p className="text-xs text-[#A1A1AA]">{c.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 5: TAGS */}
        {/* ============================================================ */}
        {activeTab === 'tags' && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-[#27272A] bg-[#121215] p-6 space-y-4">
              <h3 className="text-sm font-bold text-white">Searchable Metadata Tags</h3>
              <div className="flex flex-wrap gap-2">
                {tags.map((t) => (
                  <span
                    key={t.id}
                    className="px-3 py-1.5 rounded-xl border border-[#27272A] bg-[#18181C] text-xs text-[#D4D4D8] font-mono"
                  >
                    #{t.name} ({t.count})
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 6: MEDIA LIBRARY */}
        {/* ============================================================ */}
        {activeTab === 'media' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Centralized Media Assets</h3>
              <button
                type="button"
                onClick={() => setMediaModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-2"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Open Media Manager</span>
              </button>
            </div>
            <div className="p-8 border border-dashed border-[#27272A] rounded-2xl bg-[#121215] text-center space-y-3">
              <ImageIcon className="w-12 h-12 text-purple-400 mx-auto" />
              <p className="text-sm text-white font-semibold">Centralized Media Library</p>
              <p className="text-xs text-[#A1A1AA] max-w-md mx-auto">
                Store, resize, preview and reuse screenshots, diagrams, and figures across tutorials.
              </p>
              <button
                type="button"
                onClick={() => setMediaModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-[#27272A] hover:bg-[#323238] text-xs text-white"
              >
                Launch Media Modal
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 7: SEO MANAGEMENT */}
        {/* ============================================================ */}
        {activeTab === 'seo' && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl border border-[#27272A] bg-[#121215] space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-purple-400" />
                <span>SEO &amp; Structured Data Settings</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl border border-[#27272A] bg-[#18181C] space-y-2">
                  <span className="font-bold text-white block">XML Sitemap Integration</span>
                  <p className="text-[#A1A1AA]">
                    Dynamic sitemap exposes all published articles with lastmod timestamps for Googlebot crawlers.
                  </p>
                  <span className="text-emerald-400 font-mono text-[11px] block">
                    URL: /sitemap.xml
                  </span>
                </div>
                <div className="p-4 rounded-xl border border-[#27272A] bg-[#18181C] space-y-2">
                  <span className="font-bold text-white block">Schema.org JSON-LD</span>
                  <p className="text-[#A1A1AA]">
                    Automatically generates BlogPosting, BreadcrumbList, and FAQPage structured data on all public views.
                  </p>
                  <span className="text-emerald-400 font-mono text-[11px] block">
                    Status: Active &amp; Validated
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 8: APPROVALS QUEUE (Preserving test compatibility) */}
        {/* ============================================================ */}
        {activeTab === 'approvals' && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl border border-[#27272A] bg-[#121215] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#27272A]">
                <h3 className="text-sm font-bold text-white">Approvals Queue</h3>
                <span className="text-xs text-[#71717A]">{submissions.length} pending items</span>
              </div>

              {submissions.length === 0 ? (
                <p className="text-xs text-[#71717A] py-8 text-center">
                  No submissions pending moderation review.
                </p>
              ) : (
                <div className="space-y-3">
                  {submissions.map((sub) => (
                    <div
                      key={sub.id}
                      className="p-4 rounded-xl border border-[#27272A] bg-[#18181C] flex items-center justify-between"
                    >
                      <div>
                        <h4 className="text-xs font-bold text-white">{sub.title}</h4>
                        <p className="text-[11px] text-[#A1A1AA]">
                          Submitted by {sub.submittedBy?.name || 'Community Member'} ({sub.type})
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => approveSubmission(sub.id)}
                          className="px-3 py-1 rounded bg-emerald-600/20 text-emerald-300 text-xs font-bold hover:bg-emerald-600 hover:text-white"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => setRejectingSubmission(sub)}
                          className="px-3 py-1 rounded bg-rose-600/20 text-rose-300 text-xs font-bold hover:bg-rose-600 hover:text-white"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 9: ADMIN TEAM & RBAC (Preserving test compatibility) */}
        {/* ============================================================ */}
        {activeTab === 'team' && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl border border-[#27272A] bg-[#121215] space-y-6">
              <div>
                <h3 className="text-sm font-bold text-white">Authorized Administrator Accounts</h3>
                <p className="text-xs text-[#A1A1AA] mt-1">
                  Users with these emails are granted elevated administrative and publishing access.
                </p>
                <div className="mt-3 space-y-2">
                  {adminEmails.map((email) => (
                    <div
                      key={email}
                      className="p-2.5 rounded-lg border border-[#27272A] bg-[#18181C] text-xs font-mono text-white flex items-center justify-between"
                    >
                      <span>{email}</span>
                      {email !== 'admin@intelligentqa.io' && (
                        <button
                          type="button"
                          onClick={() => {
                            QADatabase.removeAdminEmail(email);
                            setAdminEmails(QADatabase.getAdminEmails());
                          }}
                          className="text-rose-400 text-xs"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-[#27272A]">
                <h3 className="text-sm font-bold text-white">Master Admin Security Passcode</h3>
                <p className="text-xs text-[#A1A1AA] mt-1">
                  Used by authorized staff to elevate roles on new machines.
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <input
                    type="password"
                    disabled
                    value={adminSecret}
                    className="px-3 py-1.5 bg-[#09090B] border border-[#27272A] rounded-lg text-xs font-mono text-purple-400"
                  />
                  <span className="text-xs text-[#71717A]">(Protected)</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* FULLSCREEN ARTICLE & TUTORIAL EDITOR MODAL */}
      {/* ============================================================ */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 bg-[#09090B] flex flex-col font-sans text-slate-100">
          {/* Editor Header Bar */}
          <div className="px-6 py-3 border-b border-[#27272A] bg-[#121215] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="px-3 py-1.5 rounded-lg border border-[#27272A] bg-[#1A1A1E] text-xs text-[#A1A1AA] hover:text-white"
              >
                &larr; Back to CMS
              </button>
              <div>
                <span className="text-xs font-bold text-white">
                  {editingArticle ? 'Edit Tutorial' : 'New Technical Article'}
                </span>
                <span className="text-[10px] text-purple-400 ml-2 font-mono">
                  Status: {articleStatus.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleSaveArticle('draft')}
                disabled={isSavingArticle}
                className="px-3.5 py-1.5 rounded-lg border border-[#27272A] bg-[#1E1E22] hover:bg-[#27272A] text-xs text-[#D4D4D8] font-semibold"
              >
                Save as Draft
              </button>

              <button
                type="button"
                onClick={() => handleSaveArticle('published')}
                disabled={isSavingArticle}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow transition-colors"
              >
                Publish Article
              </button>
            </div>
          </div>

          {/* Article Metadata Bar */}
          <div className="px-6 py-3 border-b border-[#27272A] bg-[#151518] grid grid-cols-1 md:grid-cols-4 gap-3 text-xs shrink-0">
            <div>
              <label className="text-[10px] uppercase font-bold text-[#71717A] block mb-1">
                Article Title *
              </label>
              <input
                type="text"
                placeholder="Selenium with Java Tutorial..."
                value={articleTitle}
                onChange={(e) => setArticleTitle(e.target.value)}
                className="w-full px-2.5 py-1 bg-[#09090B] border border-[#27272A] rounded-lg text-white font-bold"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-[#71717A] block mb-1">
                URL Slug (/blog/...)
              </label>
              <input
                type="text"
                placeholder="selenium-with-java-tutorial"
                value={articleSlug}
                onChange={(e) => setArticleSlug(e.target.value)}
                className="w-full px-2.5 py-1 bg-[#09090B] border border-[#27272A] rounded-lg text-purple-300 font-mono"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-[#71717A] block mb-1">
                Category
              </label>
              <select
                value={articleCategory}
                onChange={(e) => setArticleCategory(e.target.value)}
                className="w-full px-2.5 py-1 bg-[#09090B] border border-[#27272A] rounded-lg text-white"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-[#71717A] block mb-1">
                Tags (Comma separated)
              </label>
              <input
                type="text"
                placeholder="Selenium, Java, SDET"
                value={articleTagsInput}
                onChange={(e) => setArticleTagsInput(e.target.value)}
                className="w-full px-2.5 py-1 bg-[#09090B] border border-[#27272A] rounded-lg text-white"
              />
            </div>
          </div>

          {/* Editor Body */}
          <div className="flex-1 overflow-hidden p-4">
            <RichBlockEditor
              initialData={articleContent}
              onChange={(data) => setArticleContent(data)}
              onSave={async (data) => {
                setArticleContent(data);
                await handleSaveArticle();
              }}
              revisions={editingArticle?.revisions || []}
              onRestoreRevision={handleRestoreRevision}
              articleTitle={articleTitle || 'Untitled Article'}
              isSaving={isSavingArticle}
            />
          </div>
        </div>
      )}

      {/* Centralized Media Modal */}
      <MediaLibraryModal
        isOpen={mediaModalOpen}
        onClose={() => setMediaModalOpen(false)}
      />
    </div>
  );
}

export default function CourseCMSPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#09090B] flex items-center justify-center text-xs text-[#71717A]">
          Loading Open-Source CMS Platform...
        </div>
      }
    >
      <CMSPortalContent />
    </Suspense>
  );
}
