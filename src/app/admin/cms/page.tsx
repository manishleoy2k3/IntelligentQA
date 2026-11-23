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
import { getLessonDoc, LessonDoc } from '@/lib/qa-learning-docs';
// @ts-ignore
import { lessonDocToBlocks, blocksToLessonDoc } from '@/lib/cms-engine.js';
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

  // Course Lesson Editing Context
  const [editingLessonContext, setEditingLessonContext] = useState<{
    courseId: string;
    moduleId: string;
    lessonId: string;
    originalDoc: LessonDoc;
  } | null>(null);

  // Success Dialog after publication
  const [publishedSuccessArticle, setPublishedSuccessArticle] = useState<{
    title: string;
    url: string;
    type: 'article' | 'lesson';
    slug?: string;
  } | null>(null);

  // Course / Module / Lesson Modal
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [courseModalMode, setCourseModalMode] = useState<
    'edit_track' | 'add_module' | 'edit_module' | 'add_lesson' | 'edit_lesson'
  >('edit_track');
  const [trackForm, setTrackForm] = useState({ title: '', tagline: '', description: '' });
  const [moduleForm, setModuleForm] = useState({ title: '', moduleId: '' });
  const [lessonForm, setLessonForm] = useState({
    title: '',
    description: '',
    durationMinutes: 15,
    lessonId: '',
    moduleId: '',
  });

  // Delete Confirm Modal State
  const [showDeleteConfirmId, setShowDeleteConfirmId] = useState<string | null>(null);
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<{
    type: 'lesson' | 'module';
    id: string;
    courseId: string;
    moduleId?: string;
    title: string;
  } | null>(null);

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

  // Helper to load tracks for CMS excluding AI for QA
  const getCmsCourses = () => QADatabase.getTracks().filter((c) => c.id !== 'ai-qa');

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
      const cList = getCmsCourses();
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
    setEditingLessonContext(null);
    if (art) {
      setEditingArticle(art);
      setArticleTitle(art.title);
      setArticleSubtitle(art.subtitle || '');
      setArticleSlug(art.slug);
      setArticleDesc(art.shortDescription);
      setArticleCategory(art.category);
      setArticleTagsInput(art.tags.join(', '));
      setArticleFeaturedImg(art.featuredImage || '/images/selenium-architecture.svg');
      setArticleImgCaption(art.featuredImageCaption || 'Figure 1: Test Automation Architecture & Workflow');
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
      setArticleFeaturedImg('/images/selenium-architecture.svg');
      setArticleImgCaption('Figure 1: Test Automation Architecture & Workflow');
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

  // Open Course Lesson in CMS Rich Block Editor
  const handleOpenLessonCmsEditor = (courseId: string, moduleId: string, lesson: Lesson) => {
    setEditingArticle(null);
    const doc = getLessonDoc(lesson.id, courseId, lesson.title, lesson.description);
    const blocksData = lessonDocToBlocks(doc);

    setEditingLessonContext({
      courseId,
      moduleId,
      lessonId: lesson.id,
      originalDoc: doc,
    });

    setArticleTitle(lesson.title);
    setArticleSubtitle(doc.tagline || '');
    setArticleSlug(lesson.id);
    setArticleDesc(doc.overview || lesson.description || '');
    setArticleCategory(courseId);
    setArticleTagsInput('Course Lesson, Curriculum, Interactive Lab');
    setArticleFeaturedImg('');
    setArticleImgCaption('');
    setArticleStatus('published');
    setArticleContent(blocksData as any as EditorJSData);
    setArticleSeoTitle(`${lesson.title} | IntelligentQA Course`);
    setArticleSeoDesc(doc.overview || lesson.description || '');
    setArticleCanonical(`https://intelligentqa.io/tracks/${courseId}/${lesson.id}`);

    setIsEditorOpen(true);
  };

  // Save or Publish Article / Lesson
  const handleSaveArticle = async (newStatus?: ArticleStatus) => {
    if (!articleTitle.trim()) {
      showBanner('Please provide an article or lesson title.', 'error');
      return;
    }

    setIsSavingArticle(true);

    // 1. If editing a Course Curriculum Lesson
    if (editingLessonContext) {
      try {
        const updatedDoc = blocksToLessonDoc(articleContent, editingLessonContext.originalDoc);
        if (articleTitle) updatedDoc.title = articleTitle;
        updatedDoc.tagline = articleSubtitle || articleTitle;
        if (articleDesc) updatedDoc.overview = articleDesc;

        await QADatabase.saveLessonDocToDatabase(editingLessonContext.lessonId, updatedDoc);

        // Update track metadata and lesson object
        const course = courses.find((c) => c.id === editingLessonContext.courseId);
        if (course) {
          const mod = course.modules.find((m) => m.id === editingLessonContext.moduleId);
          const les = mod?.lessons.find((l) => l.id === editingLessonContext.lessonId);
          if (les) {
            les.title = articleTitle;
            if (articleDesc) les.description = articleDesc;
            await QADatabase.saveLessonToDatabase(
              editingLessonContext.courseId,
              editingLessonContext.moduleId,
              les,
              updatedDoc
            );
            QADatabase.saveTrack(course);
            setCourses(getCmsCourses());
          }
        }

        const lessonLiveUrl = `/tracks/${editingLessonContext.courseId}/${editingLessonContext.lessonId}`;
        showBanner(`🎉 Course lesson "${articleTitle}" published live to students!`, 'success');
        setPublishedSuccessArticle({
          title: articleTitle,
          url: lessonLiveUrl,
          type: 'lesson',
        });
      } catch (err: any) {
        showBanner(err.message || 'Failed to save course lesson', 'error');
      } finally {
        setIsSavingArticle(false);
      }
      return;
    }

    // 2. Standalone Article / Tutorial Saving
    const tagsArray = articleTagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const targetStatus = newStatus || articleStatus;
    const computedSlug = (
      articleSlug ||
      articleTitle
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
    ).toLowerCase();

    const payload: Partial<CMSArticle> = {
      id: editingArticle?.id,
      title: articleTitle,
      subtitle: articleSubtitle,
      slug: computedSlug,
      shortDescription: articleDesc,
      category: articleCategory,
      tags: tagsArray,
      featuredImage: articleFeaturedImg,
      featuredImageCaption: articleImgCaption,
      status: targetStatus,
      content: articleContent,
      seoTitle: articleSeoTitle || `${articleTitle} | IntelligentQA`,
      seoDescription: articleSeoDesc || articleDesc,
      canonicalUrl: articleCanonical || `https://intelligentqa.io/blog/${computedSlug}`,
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
        setEditingArticle(data.article);
        setArticleStatus(data.article.status);
        loadAllData();

        if (targetStatus === 'published') {
          const publicLiveUrl = `/blog/${data.article.slug}`;
          showBanner(`🎉 Article "${data.article.title}" published LIVE!`, 'success');
          setPublishedSuccessArticle({
            title: data.article.title,
            url: publicLiveUrl,
            type: 'article',
            slug: data.article.slug,
          });
        } else {
          showBanner(`Article "${data.article.title}" saved as draft!`, 'success');
        }
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
    setCourses(getCmsCourses());
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
      setCourses(getCmsCourses());
      showBanner(`Reordered lesson "${lesson.title}" ${direction}`);
    }
  };

  const handleToggleLessonDisabled = (courseId: string, moduleId: string, lessonId: string) => {
    QADatabase.toggleLessonDisabled(courseId as any, lessonId);
    setCourses(getCmsCourses());
    showBanner('Toggled lesson visibility status');
  };

  // Course / Module / Lesson Modal Openers
  const handleOpenEditTrackModal = (track: Track) => {
    setCourseModalMode('edit_track');
    setTrackForm({
      title: track.title,
      tagline: (track as any).tagline || '',
      description: track.description || '',
    });
    setShowCourseModal(true);
  };

  const handleOpenAddModuleModal = (courseId: string) => {
    setCourseModalMode('add_module');
    setModuleForm({ title: '', moduleId: '' });
    setShowCourseModal(true);
  };

  const handleOpenEditModuleModal = (courseId: string, mod: any) => {
    setCourseModalMode('edit_module');
    setModuleForm({ title: mod.title, moduleId: mod.id });
    setShowCourseModal(true);
  };

  const handleOpenAddLessonModal = (courseId: string, moduleId: string) => {
    setCourseModalMode('add_lesson');
    setLessonForm({
      title: '',
      description: '',
      durationMinutes: 15,
      lessonId: '',
      moduleId,
    });
    setShowCourseModal(true);
  };

  const handleOpenEditLessonModal = (courseId: string, moduleId: string, lesson: Lesson) => {
    setCourseModalMode('edit_lesson');
    setLessonForm({
      title: lesson.title,
      description: lesson.description || '',
      durationMinutes: lesson.durationMinutes || 15,
      lessonId: lesson.id,
      moduleId,
    });
    setShowCourseModal(true);
  };

  const handleSaveCourseModal = async () => {
    const course = courses.find((c) => c.id === selectedCourseId) || courses[0];
    if (!course) return;

    if (courseModalMode === 'edit_track') {
      if (!trackForm.title.trim()) {
        showBanner('Track title cannot be empty', 'error');
        return;
      }
      const updated = {
        ...course,
        title: trackForm.title.trim(),
        tagline: trackForm.tagline.trim(),
        description: trackForm.description.trim(),
      };
      QADatabase.saveTrack(updated);
      setCourses(getCmsCourses());
      showBanner(`Saved course details for "${updated.title}"`);
      setShowCourseModal(false);
      return;
    }

    if (courseModalMode === 'add_module') {
      if (!moduleForm.title.trim()) {
        showBanner('Module title cannot be empty', 'error');
        return;
      }
      const newModule: Module = {
        id: `mod-${Date.now()}`,
        trackId: course.id,
        order: course.modules.length + 1,
        title: moduleForm.title.trim(),
        description: '',
        lessons: [],
      };
      const updated = {
        ...course,
        modules: [...course.modules, newModule],
      };
      QADatabase.saveTrack(updated);
      setCourses(getCmsCourses());
      showBanner(`Added module "${newModule.title}" to ${course.title}`);
      setShowCourseModal(false);
      return;
    }

    if (courseModalMode === 'edit_module') {
      if (!moduleForm.title.trim()) {
        showBanner('Module title cannot be empty', 'error');
        return;
      }
      const updatedModules = course.modules.map((m) =>
        m.id === moduleForm.moduleId ? { ...m, title: moduleForm.title.trim() } : m
      );
      const updated = { ...course, modules: updatedModules };
      QADatabase.saveTrack(updated);
      setCourses(getCmsCourses());
      showBanner(`Updated module title to "${moduleForm.title.trim()}"`);
      setShowCourseModal(false);
      return;
    }

    if (courseModalMode === 'add_lesson') {
      if (!lessonForm.title.trim()) {
        showBanner('Lesson title cannot be empty', 'error');
        return;
      }
      const newLessonId = `lsn-${Date.now()}`;
      const targetModule = course.modules.find((m) => m.id === lessonForm.moduleId) || course.modules[0];
      const newLesson: Lesson = {
        id: newLessonId,
        trackId: course.id,
        moduleId: targetModule?.id || 'mod-1',
        title: lessonForm.title.trim(),
        description: lessonForm.description.trim() || 'Interactive lesson',
        durationMinutes: Number(lessonForm.durationMinutes) || 15,
        badge: (course.id.includes('playwright') ? 'Playwright' : course.id.includes('api') ? 'REST Assured' : 'Selenium') as any,
        level: 'Intermediate',
        disabled: false,
        order: (targetModule?.lessons?.length || 0) + 1,
        manualContext: {
          title: 'Manual Verification Flow',
          steps: ['Execute manual validation steps'],
          painPoints: ['Repetitive verification'],
        },
        automationContext: {
          playwrightTs: '// Playwright automated implementation',
          seleniumJava: '// Selenium automated implementation',
          explanation: lessonForm.description.trim() || 'Core concept',
          bestPractices: ['Use explicit assertions'],
          antiPatterns: ['Avoid hardcoded thread sleeps'],
        },
        aiAugmentation: {
          promptExample: 'Generate robust test assertions',
          agenticWorkflow: 'Inspect DOM and generate test script',
          selfHealingTip: 'Use dynamic resilient locators',
        },
        challenge: {
          instruction: lessonForm.description.trim() || 'Implement automation challenge',
          starterCode: {
            java: '// Add starter code here',
            typescript: '// Add starter code here',
          },
          solutionCode: {
            java: '// Add solution code here',
            typescript: '// Add solution code here',
          },
          validationRules: [],
        },
      };

      const starterDoc: Partial<LessonDoc> = {
        title: newLesson.title,
        category: course.id,
        tagline: newLesson.title,
        overview: newLesson.description,
        whyItMattersForManualQA: 'Critical automation building block.',
      };

      await QADatabase.saveLessonToDatabase(
        course.id,
        lessonForm.moduleId || course.modules[0]?.id,
        newLesson,
        starterDoc
      );
      setCourses(getCmsCourses());
      showBanner(`Added lesson "${newLesson.title}" to curriculum!`);
      setShowCourseModal(false);
      return;
    }

    if (courseModalMode === 'edit_lesson') {
      if (!lessonForm.title.trim()) {
        showBanner('Lesson title cannot be empty', 'error');
        return;
      }
      const mod = course.modules.find((m) => m.id === lessonForm.moduleId);
      const les = mod?.lessons.find((l) => l.id === lessonForm.lessonId);
      if (les) {
        les.title = lessonForm.title.trim();
        les.description = lessonForm.description.trim();
        les.durationMinutes = Number(lessonForm.durationMinutes) || 15;
        await QADatabase.saveLessonToDatabase(course.id, lessonForm.moduleId || mod!.id, les);
        setCourses(getCmsCourses());
        showBanner(`Updated details for "${les.title}"`);
      }
      setShowCourseModal(false);
      return;
    }
  };

  const handleConfirmDeleteLesson = (courseId: string, moduleId: string, lesson: Lesson) => {
    setShowDeleteConfirmId(lesson.id);
    setDeleteConfirmTarget({
      type: 'lesson',
      id: lesson.id,
      courseId,
      moduleId,
      title: lesson.title,
    });
  };

  const handleConfirmDeleteModule = (courseId: string, mod: any) => {
    setShowDeleteConfirmId(mod.id);
    setDeleteConfirmTarget({
      type: 'module',
      id: mod.id,
      courseId,
      title: mod.title,
    });
  };

  const handleExecuteDelete = () => {
    if (!deleteConfirmTarget) return;

    if (deleteConfirmTarget.type === 'lesson') {
      QADatabase.deleteLessonFromDatabase(deleteConfirmTarget.courseId, deleteConfirmTarget.id);
      setCourses(getCmsCourses());
      showBanner(`Deleted lesson "${deleteConfirmTarget.title}"`);
    } else if (deleteConfirmTarget.type === 'module') {
      const course = courses.find((c) => c.id === deleteConfirmTarget.courseId);
      if (course) {
        course.modules = course.modules.filter((m) => m.id !== deleteConfirmTarget.id);
        course.totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
        QADatabase.saveTrack(course);
        setCourses(getCmsCourses());
        showBanner(`Deleted module "${deleteConfirmTarget.title}"`);
      }
    }

    setShowDeleteConfirmId(null);
    setDeleteConfirmTarget(null);
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
          className={`fixed top-4 right-4 z-[100] px-4 py-2.5 rounded-xl border text-xs font-semibold shadow-2xl flex items-center gap-2 ${
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

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenEditTrackModal(currentCourse)}
                  className="px-3 py-1.5 rounded-xl border border-[#27272A] bg-[#18181C] hover:bg-[#27272A] text-xs font-semibold text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Edit Track Title & Description"
                >
                  <Edit2 className="w-3.5 h-3.5 text-purple-400" />
                  <span>Edit Course Info</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenAddModuleModal(currentCourse.id)}
                  className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
                  title="Add new Module to this Course"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Module</span>
                </button>
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
                  <div className="p-4 border-b border-[#27272A] bg-[#18181C] flex flex-wrap items-center justify-between gap-3">
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
                        className="p-1.5 rounded text-[#71717A] hover:text-white disabled:opacity-30 hover:bg-[#27272A]"
                        title="Move Module Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveModule(currentCourse.id, mIdx, 'down')}
                        disabled={mIdx === currentCourse.modules.length - 1}
                        className="p-1.5 rounded text-[#71717A] hover:text-white disabled:opacity-30 hover:bg-[#27272A]"
                        title="Move Module Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEditModuleModal(currentCourse.id, mod)}
                        className="p-1.5 rounded text-[#A1A1AA] hover:text-white hover:bg-[#27272A]"
                        title="Edit Module Title"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenAddLessonModal(currentCourse.id, mod.id)}
                        className="px-2.5 py-1 rounded-lg bg-[#27272A] hover:bg-purple-600/30 text-purple-300 text-xs font-semibold flex items-center gap-1 transition-colors"
                        title="Add Lesson to Module"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Lesson</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleConfirmDeleteModule(currentCourse.id, mod)}
                        className="p-1.5 rounded text-rose-400 hover:bg-rose-500/10"
                        title="Delete Module"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Lessons List in Module */}
                  <div className="p-4 space-y-2">
                    {mod.lessons.map((les, lIdx) => (
                      <div
                        key={les.id}
                        className={`p-3 rounded-xl border flex flex-wrap items-center justify-between gap-2 hover:border-[#3F3F46] transition-colors ${
                          les.disabled
                            ? 'bg-[#0e0e11] border-rose-900/30 opacity-75'
                            : 'bg-[#09090B] border-[#27272A]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-[#1A1A1E] text-[10px] font-mono text-[#A1A1AA] flex items-center justify-center font-bold">
                            {lIdx + 1}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-white">{les.title}</span>
                              {les.disabled && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold uppercase">
                                  Hidden
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-[#71717A] font-mono block">
                              {les.durationMinutes} mins • ID: {les.id}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleMoveLesson(currentCourse.id, mod.id, lIdx, 'up')}
                            disabled={lIdx === 0}
                            className="p-1 text-[#71717A] hover:text-white disabled:opacity-30 hover:bg-[#27272A] rounded"
                            title="Move Lesson Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveLesson(currentCourse.id, mod.id, lIdx, 'down')}
                            disabled={lIdx === mod.lessons.length - 1}
                            className="p-1 text-[#71717A] hover:text-white disabled:opacity-30 hover:bg-[#27272A] rounded"
                            title="Move Lesson Down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleLessonDisabled(currentCourse.id, mod.id, les.id)}
                            className={`p-1.5 rounded transition-colors ${
                              les.disabled
                                ? 'text-rose-400 bg-rose-500/10 hover:bg-rose-500/20'
                                : 'text-[#71717A] hover:text-white hover:bg-[#27272A]'
                            }`}
                            title={les.disabled ? 'Enable Lesson (Publish to students)' : 'Hide/Disable Lesson'}
                          >
                            {les.disabled ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEditLessonModal(currentCourse.id, mod.id, les)}
                            className="p-1.5 rounded text-[#A1A1AA] hover:text-white hover:bg-[#27272A]"
                            title="Edit Lesson Details (Title, Description, Duration)"
                          >
                            <Settings className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenLessonCmsEditor(currentCourse.id, mod.id, les)}
                            className="px-2.5 py-1 rounded-lg bg-purple-600/20 text-xs text-purple-300 hover:bg-purple-600 hover:text-white border border-purple-500/30 flex items-center gap-1 font-semibold transition-colors"
                            title="Edit Lesson Content using the Rich Block Editor"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span>Edit Content (CMS)</span>
                          </button>
                          <Link
                            href={`/tracks/${currentCourse.id}/${les.id}`}
                            target="_blank"
                            className="px-2.5 py-1 rounded-lg bg-[#1A1A1E] text-xs text-[#A1A1AA] hover:text-white hover:bg-[#27272A] flex items-center gap-1"
                            title="Preview in Student Workspace"
                          >
                            <span>Workspace</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleConfirmDeleteLesson(currentCourse.id, mod.id, les)}
                            className="p-1.5 rounded text-rose-400 hover:bg-rose-500/10"
                            title="Delete Lesson"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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
                onClick={() => {
                  setIsEditorOpen(false);
                  setEditingLessonContext(null);
                }}
                className="px-3 py-1.5 rounded-lg border border-[#27272A] bg-[#1A1A1E] text-xs text-[#A1A1AA] hover:text-white"
              >
                &larr; Back to CMS
              </button>
              <div>
                <span className="text-xs font-bold text-white">
                  {editingLessonContext
                    ? `Curriculum Lesson: ${editingLessonContext.courseId} / ${editingLessonContext.lessonId}`
                    : editingArticle
                    ? 'Edit Tutorial'
                    : 'New Technical Article'}
                </span>
                <span className="text-[10px] text-purple-400 ml-2 font-mono">
                  {editingLessonContext ? 'STUDENTS LIVE WORKSPACE' : `Status: ${articleStatus.toUpperCase()}`}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleSaveArticle('draft')}
                disabled={isSavingArticle}
                className="px-3.5 py-1.5 rounded-lg border border-[#27272A] bg-[#1E1E22] hover:bg-[#27272A] text-xs text-[#D4D4D8] font-semibold cursor-pointer"
              >
                Save as Draft
              </button>

              <button
                type="button"
                onClick={() => handleSaveArticle('published')}
                disabled={isSavingArticle}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{editingLessonContext ? 'Publish to Students' : 'Publish Article'}</span>
              </button>
            </div>
          </div>

          {/* Article / Lesson Metadata Bar */}
          <div className="px-6 py-3 border-b border-[#27272A] bg-[#151518] grid grid-cols-1 md:grid-cols-4 gap-3 text-xs shrink-0">
            <div>
              <label className="text-[10px] uppercase font-bold text-[#71717A] block mb-1">
                {editingLessonContext ? 'Lesson Title *' : 'Article Title *'}
              </label>
              <input
                type="text"
                placeholder={editingLessonContext ? 'Lesson Title...' : 'Selenium with Java Tutorial...'}
                value={articleTitle}
                onChange={(e) => setArticleTitle(e.target.value)}
                className="w-full px-2.5 py-1 bg-[#09090B] border border-[#27272A] rounded-lg text-white font-bold"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-[#71717A] block mb-1">
                {editingLessonContext ? 'Lesson ID / Path' : 'URL Slug (/blog/...)'}
              </label>
              <input
                type="text"
                placeholder="slug-or-id"
                value={articleSlug}
                disabled={!!editingLessonContext}
                onChange={(e) => setArticleSlug(e.target.value)}
                className="w-full px-2.5 py-1 bg-[#09090B] border border-[#27272A] rounded-lg text-purple-300 font-mono disabled:opacity-60"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-[#71717A] block mb-1">
                {editingLessonContext ? 'Course Track' : 'Category'}
              </label>
              {editingLessonContext ? (
                <input
                  type="text"
                  disabled
                  value={editingLessonContext.courseId}
                  className="w-full px-2.5 py-1 bg-[#09090B] border border-[#27272A] rounded-lg text-white disabled:opacity-60 font-mono"
                />
              ) : (
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
              )}
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-[#71717A] block mb-1">
                {editingLessonContext ? 'Tagline / Subtitle' : 'Tags (Comma separated)'}
              </label>
              <input
                type="text"
                placeholder={editingLessonContext ? 'Tagline / Summary...' : 'Selenium, Java, SDET'}
                value={editingLessonContext ? articleSubtitle : articleTagsInput}
                onChange={(e) =>
                  editingLessonContext
                    ? setArticleSubtitle(e.target.value)
                    : setArticleTagsInput(e.target.value)
                }
                className="w-full px-2.5 py-1 bg-[#09090B] border border-[#27272A] rounded-lg text-white"
              />
            </div>
          </div>

          {/* Featured Cover Image Bar */}
          {!editingLessonContext && (
            <div className="px-6 py-2.5 border-b border-[#27272A] bg-[#101013] flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
              <div className="flex items-center gap-3">
                <span className="text-[10px] uppercase font-bold text-[#71717A] tracking-wider shrink-0">
                  Featured Cover Image:
                </span>

                {articleFeaturedImg ? (
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-8 rounded-md border border-[#27272A] bg-[#09090B] overflow-hidden shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={articleFeaturedImg}
                        alt="Featured Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                    <span className="font-mono text-[11px] text-emerald-400 max-w-[220px] truncate">
                      {articleFeaturedImg}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setArticleFeaturedImg('');
                        setArticleImgCaption('');
                      }}
                      className="text-rose-400 hover:text-rose-300 text-[11px] font-semibold underline ml-1 cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <span className="text-[11px] text-[#71717A] italic">No cover image chosen</span>
                )}
              </div>

              {/* Action Buttons to Set / Upload Featured Image */}
              <div className="flex flex-wrap items-center gap-2">
                <label className="px-2.5 py-1 rounded-lg bg-[#1E1E22] hover:bg-[#27272A] border border-[#27272A] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm">
                  <UploadCloud className="w-3.5 h-3.5 text-purple-400" />
                  <span>Upload from PC</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const formData = new FormData();
                      formData.append('file', file);
                      formData.append('alt', articleTitle || file.name);
                      formData.append('category', 'Featured');
                      try {
                        const res = await fetch('/api/admin/media', {
                          method: 'POST',
                          headers: { 'x-admin-token': 'admin-session' },
                          body: formData,
                        });
                        const data = await res.json();
                        if (data.success && data.item) {
                          setArticleFeaturedImg(data.item.url);
                          setArticleImgCaption(articleTitle || file.name);
                          showBanner('Featured image uploaded & set!', 'success');
                        }
                      } catch (err: any) {
                        showBanner('Upload failed', 'error');
                      }
                    }}
                  />
                </label>

                <button
                  type="button"
                  onClick={() => setMediaModalOpen(true)}
                  className="px-2.5 py-1 rounded-lg bg-[#1E1E22] hover:bg-[#27272A] border border-[#27272A] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-sky-400" />
                  <span>Media Library</span>
                </button>

                {/* Quick Diagram Presets */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setArticleFeaturedImg('/images/selenium-architecture.svg');
                      setArticleImgCaption('Figure 1: Selenium WebDriver 4 Architecture Diagram & W3C Flow');
                      showBanner('Applied Selenium Architecture Diagram', 'success');
                    }}
                    className="px-2 py-0.5 rounded bg-[#18181C] hover:bg-purple-600/20 text-[10px] font-mono text-purple-300 border border-[#27272A] cursor-pointer"
                    title="Apply Selenium Architecture SVG"
                  >
                    + Architecture
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setArticleFeaturedImg('/images/locators-dom-inspector.svg');
                      setArticleImgCaption('Figure 2: Chrome DevTools DOM Elements & Priority Locators');
                      showBanner('Applied DOM Inspector Diagram', 'success');
                    }}
                    className="px-2 py-0.5 rounded bg-[#18181C] hover:bg-teal-600/20 text-[10px] font-mono text-teal-300 border border-[#27272A] cursor-pointer"
                    title="Apply DOM Inspector SVG"
                  >
                    + Locators
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setArticleFeaturedImg('/images/test-execution-report.svg');
                      setArticleImgCaption('Figure 3: TestNG & Allure Real-Time Execution Dashboard');
                      showBanner('Applied Execution Report SVG', 'success');
                    }}
                    className="px-2 py-0.5 rounded bg-[#18181C] hover:bg-amber-600/20 text-[10px] font-mono text-amber-300 border border-[#27272A] cursor-pointer"
                    title="Apply Execution Report SVG"
                  >
                    + Report
                  </button>
                </div>
              </div>
            </div>
          )}

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
              articleTitle={articleTitle || 'Untitled Content'}
              isSaving={isSavingArticle}
            />
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* PUBLISHED SUCCESS MODAL */}
      {/* ============================================================ */}
      {publishedSuccessArticle && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl border border-emerald-500/30 bg-[#121215] shadow-2xl p-6 sm:p-8 space-y-6 text-center animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] font-bold uppercase tracking-wider border border-emerald-500/20">
                Published Live Successfully
              </span>
              <h3 className="text-xl font-bold text-white">
                {publishedSuccessArticle.type === 'lesson'
                  ? 'Course Lesson Live for Students!'
                  : 'Article Published to Community!'}
              </h3>
              <p className="text-xs text-[#A1A1AA] max-w-md mx-auto">
                {publishedSuccessArticle.type === 'lesson'
                  ? `"${publishedSuccessArticle.title}" is now published and active inside the interactive workspace for all students.`
                  : `"${publishedSuccessArticle.title}" is now published and publicly accessible to all website visitors.`}
              </p>
            </div>

            {/* Public URL Box */}
            <div className="p-3.5 rounded-xl border border-[#27272A] bg-[#09090B] flex items-center justify-between gap-3 text-left">
              <div className="truncate">
                <span className="text-[10px] uppercase font-bold text-[#71717A] block">
                  {publishedSuccessArticle.type === 'lesson'
                    ? 'Student Workspace URL'
                    : 'Public Article URL'}
                </span>
                <span className="text-xs font-mono text-emerald-400 font-semibold truncate block">
                  {publishedSuccessArticle.url}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  const fullUrl =
                    typeof window !== 'undefined'
                      ? `${window.location.origin}${publishedSuccessArticle.url}`
                      : publishedSuccessArticle.url;
                  navigator.clipboard.writeText(fullUrl);
                  showBanner('Live URL copied to clipboard!', 'success');
                }}
                className="px-3 py-1.5 rounded-lg bg-[#1A1A1E] hover:bg-[#27272A] border border-[#27272A] text-xs font-semibold text-white flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Link</span>
              </button>
            </div>

            {/* Modal Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <a
                href={publishedSuccessArticle.url}
                target="_blank"
                rel="noreferrer"
                className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>View Live Page</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                type="button"
                onClick={() => {
                  setPublishedSuccessArticle(null);
                  setIsEditorOpen(false);
                  setEditingLessonContext(null);
                }}
                className="py-2.5 px-4 rounded-xl border border-[#27272A] bg-[#1E1E22] hover:bg-[#27272A] text-white font-semibold text-xs transition-colors cursor-pointer"
              >
                Return to CMS List
              </button>
            </div>

            <button
              type="button"
              onClick={() => setPublishedSuccessArticle(null)}
              className="text-xs text-[#71717A] hover:text-white underline pt-1 cursor-pointer block mx-auto"
            >
              Continue Editing
            </button>
          </div>
        </div>
      )}

      {/* Course / Module / Lesson Modal */}
      {showCourseModal && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl border border-[#27272A] bg-[#121215] shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
              <h3 className="text-sm font-bold text-white">
                {courseModalMode === 'edit_track' && 'Edit Course Details'}
                {courseModalMode === 'add_module' && 'Add New Module'}
                {courseModalMode === 'edit_module' && 'Edit Module Title'}
                {courseModalMode === 'add_lesson' && 'Add New Lesson to Module'}
                {courseModalMode === 'edit_lesson' && 'Edit Lesson Details'}
              </h3>
              <button
                type="button"
                onClick={() => setShowCourseModal(false)}
                className="p-1 rounded text-[#71717A] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Edit Track Form */}
            {courseModalMode === 'edit_track' && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-[#A1A1AA] font-semibold block mb-1">Track Title</label>
                  <input
                    type="text"
                    value={trackForm.title}
                    onChange={(e) => setTrackForm({ ...trackForm, title: e.target.value })}
                    className="w-full px-3 py-2 bg-[#09090B] border border-[#27272A] rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                    placeholder="e.g., Selenium with Java Mastery"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#A1A1AA] font-semibold block mb-1">Tagline / Subtitle</label>
                  <input
                    type="text"
                    value={trackForm.tagline}
                    onChange={(e) => setTrackForm({ ...trackForm, tagline: e.target.value })}
                    className="w-full px-3 py-2 bg-[#09090B] border border-[#27272A] rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                    placeholder="e.g., Industry-grade test automation from fundamentals to framework"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#A1A1AA] font-semibold block mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={trackForm.description}
                    onChange={(e) => setTrackForm({ ...trackForm, description: e.target.value })}
                    className="w-full px-3 py-2 bg-[#09090B] border border-[#27272A] rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                    placeholder="Detailed track description..."
                  />
                </div>
              </div>
            )}

            {/* Add / Edit Module Form */}
            {(courseModalMode === 'add_module' || courseModalMode === 'edit_module') && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-[#A1A1AA] font-semibold block mb-1">Module Title</label>
                  <input
                    type="text"
                    value={moduleForm.title}
                    onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                    className="w-full px-3 py-2 bg-[#09090B] border border-[#27272A] rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                    placeholder="e.g., Module 4: Page Object Model & Framework Design"
                  />
                </div>
              </div>
            )}

            {/* Add / Edit Lesson Form */}
            {(courseModalMode === 'add_lesson' || courseModalMode === 'edit_lesson') && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-[#A1A1AA] font-semibold block mb-1">Lesson Title</label>
                  <input
                    type="text"
                    value={lessonForm.title}
                    onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                    className="w-full px-3 py-2 bg-[#09090B] border border-[#27272A] rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                    placeholder="e.g., Mastering Dynamic Waits & Fluents"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#A1A1AA] font-semibold block mb-1">Short Description</label>
                  <textarea
                    rows={2}
                    value={lessonForm.description}
                    onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
                    className="w-full px-3 py-2 bg-[#09090B] border border-[#27272A] rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                    placeholder="Core concept summary..."
                  />
                </div>
                <div>
                  <label className="text-xs text-[#A1A1AA] font-semibold block mb-1">Estimated Duration (Minutes)</label>
                  <input
                    type="number"
                    min={5}
                    max={180}
                    value={lessonForm.durationMinutes}
                    onChange={(e) => setLessonForm({ ...lessonForm, durationMinutes: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#09090B] border border-[#27272A] rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            )}

            {/* Modal Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#27272A]">
              <button
                type="button"
                onClick={() => setShowCourseModal(false)}
                className="px-3 py-1.5 rounded-xl border border-[#27272A] bg-[#18181C] hover:bg-[#27272A] text-xs font-semibold text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveCourseModal}
                className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white shadow-md cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmId && deleteConfirmTarget && (
        <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl border border-rose-500/30 bg-[#121215] shadow-2xl p-6 space-y-4 text-center animate-in fade-in zoom-in duration-150">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white">Confirm Permanent Deletion</h3>
              <p className="text-xs text-[#A1A1AA]">
                Are you sure you want to delete {deleteConfirmTarget.type === 'lesson' ? 'lesson' : 'module'}{' '}
                <strong className="text-white">&quot;{deleteConfirmTarget.title}&quot;</strong>? This action cannot be undone.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirmId(null);
                  setDeleteConfirmTarget(null);
                }}
                className="py-2 px-3 rounded-xl border border-[#27272A] bg-[#18181C] hover:bg-[#27272A] text-xs font-semibold text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteDelete}
                className="py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-md cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Centralized Media Modal */}
      <MediaLibraryModal
        isOpen={mediaModalOpen}
        onClose={() => setMediaModalOpen(false)}
        onSelectImage={(media) => {
          setArticleFeaturedImg(media.url);
          setArticleImgCaption(media.caption || media.alt || articleTitle);
          setMediaModalOpen(false);
          showBanner('Featured image set from Media Library!', 'success');
        }}
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
