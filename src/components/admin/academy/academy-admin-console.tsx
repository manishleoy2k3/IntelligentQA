'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  BookOpen,
  FolderPlus,
  FilePlus,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Send,
  Save,
  CheckCircle2,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Layers,
  FileText,
  Search,
  RefreshCw,
  Folder,
  ChevronRight,
  ChevronDown,
  Clock,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Check,
  X,
  UploadCloud,
  FileCheck,
  Code,
  Image as ImageIcon,
  Workflow,
  ListPlus,
  Terminal,
} from 'lucide-react';
import {
  AcademyCourse,
  AcademyModule,
  AcademyLesson,
  AcademyCategory,
  AcademyPublishStatus,
} from '@/types/learning-platform';
import DocxUploadDropzone, { UploadedDocInfo } from './docx-upload-dropzone';
import ContentPreviewModal from './content-preview-modal';
import VisualLessonEditor from '@/components/editor/visual-lesson-editor';

interface AcademyAdminConsoleProps {
  onNotify?: (msg: string, type?: 'success' | 'error') => void;
}

export default function AcademyAdminConsole({ onNotify }: AcademyAdminConsoleProps) {
  // Navigation Tabs: Default to 'curriculum' so admins immediately manage courses
  const [activeTab, setActiveTab] = useState<'dashboard' | 'curriculum'>('curriculum');

  // Filter & Search State
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Data State
  const [categories, setCategories] = useState<AcademyCategory[]>([]);
  const [courses, setCourses] = useState<AcademyCourse[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Toast Banner
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const notify = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ message: msg, type });
    onNotify?.(msg, type);
    setTimeout(() => setToast(null), 4000);
  };

  // =========================================================================
  // MODAL STATES
  // =========================================================================
  // 1. Course Modal
  const [showCourseModal, setShowCourseModal] = useState<boolean>(false);
  const [editingCourse, setEditingCourse] = useState<AcademyCourse | null>(null);
  const [courseTitle, setCourseTitle] = useState<string>('');
  const [courseSlug, setCourseSlug] = useState<string>('');
  const [courseCategory, setCourseCategory] = useState<string>('cat-ai-for-qa');
  const [courseDesc, setCourseDesc] = useState<string>('');
  const [courseIcon, setCourseIcon] = useState<string>('BookOpen');
  const [courseLevel, setCourseLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels'>('All Levels');
  const [courseHours, setCourseHours] = useState<number>(10);
  const [courseStatus, setCourseStatus] = useState<AcademyPublishStatus>('published');

  // 2. Module Modal
  const [showModuleModal, setShowModuleModal] = useState<boolean>(false);
  const [editingModule, setEditingModule] = useState<{ courseId: string; module: AcademyModule | null } | null>(null);
  const [moduleTitle, setModuleTitle] = useState<string>('');
  const [moduleSlug, setModuleSlug] = useState<string>('');
  const [moduleDesc, setModuleDesc] = useState<string>('');
  const [moduleStatus, setModuleStatus] = useState<AcademyPublishStatus>('published');

  // 3. Lesson Modal
  const [showLessonModal, setShowLessonModal] = useState<boolean>(false);
  const [editingLessonTarget, setEditingLessonTarget] = useState<{
    courseId: string;
    moduleId: string;
    lesson: AcademyLesson | null;
  } | null>(null);
  const [lessonTitle, setLessonTitle] = useState<string>('');
  const [lessonSlug, setLessonSlug] = useState<string>('');
  const [lessonSummary, setLessonSummary] = useState<string>('');
  const [lessonContentHtml, setLessonContentHtml] = useState<string>('');
  const [lessonBlockData, setLessonBlockData] = useState<any>(null);
  const [lessonDocPath, setLessonDocPath] = useState<string>('');
  const [lessonStatus, setLessonStatus] = useState<AcademyPublishStatus>('draft');
  const [lessonReadTime, setLessonReadTime] = useState<number>(5);
  const [showVisualEditor, setShowVisualEditor] = useState<boolean>(false);
  const [activeVisualLesson, setActiveVisualLesson] = useState<{
    course: AcademyCourse;
    module: AcademyModule;
    lesson: AcademyLesson;
  } | null>(null);

  // Phase 8: Standard Lesson Sections & Diagram Builder state
  const [lessonEditorTab, setLessonEditorTab] = useState<'content' | 'diagram' | 'docx'>('content');
  const [diagramType, setDiagramType] = useState<string>('pipeline');
  const [diagramTitle, setDiagramTitle] = useState<string>('System Architecture Flow');
  const [diagramCaption, setDiagramCaption] = useState<string>('Component relationship and execution flow');
  const [diagramMermaid, setDiagramMermaid] = useState<string>('graph TD\n  Client[Test Client] -->|W3C HTTP| Driver[Browser Driver]\n  Driver --> Browser[Browser Process]');
  const [diagramImageUrl, setDiagramImageUrl] = useState<string>('');
  const [diagramAltText, setDiagramAltText] = useState<string>('');
  const [diagramSourceAttr, setDiagramSourceAttr] = useState<string>('');
  const [selectedSectionTemplate, setSelectedSectionTemplate] = useState<string>('overview');

  // 4. Content Preview Modal
  const [previewingLesson, setPreviewingLesson] = useState<{
    lesson: Partial<AcademyLesson>;
    courseTitle: string;
    moduleTitle: string;
  } | null>(null);

  // Auto-slug generator
  const slugify = (text: string) =>
    text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

  const notifyCurriculumUpdated = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('intelligentqa_curriculum_updated'));
    }
  };

  // =========================================================================
  // LOAD DATA FROM APIS
  // =========================================================================
  const fetchCurriculum = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Categories
      const catRes = await fetch('/api/learning/categories');
      if (catRes.ok) {
        const catJson = await catRes.json();
        if (catJson.success && Array.isArray(catJson.data)) {
          setCategories(catJson.data);
        }
      }

      // 2. Fetch Courses (including drafts for Admin)
      const coursesRes = await fetch('/api/learning/courses?includeDrafts=true', {
        headers: { 'x-admin-token': 'admin' },
      });
      if (coursesRes.ok) {
        const coursesJson = await coursesRes.json();
        if (coursesJson.success && Array.isArray(coursesJson.data)) {
          setCourses(coursesJson.data);
          if (!selectedCourseId && coursesJson.data.length > 0) {
            setSelectedCourseId(coursesJson.data[0].id);
          }
          notifyCurriculumUpdated();
        }
      }
    } catch (err: any) {
      notify(err.message || 'Failed to fetch learning data', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [selectedCourseId]);

  useEffect(() => {
    fetchCurriculum();
  }, [fetchCurriculum]);

  // =========================================================================
  // DASHBOARD METRICS CALCULATION
  // =========================================================================
  const totalCourses = courses.length;
  let totalModules = 0;
  let totalLessons = 0;
  let publishedLessonsCount = 0;
  let draftLessonsCount = 0;
  const allLessonsWithCourse: Array<{
    lesson: AcademyLesson;
    course: AcademyCourse;
    module: AcademyModule;
  }> = [];

  for (const c of courses) {
    const mods = c.modules || [];
    totalModules += mods.length;
    for (const m of mods) {
      const les = m.lessons || [];
      totalLessons += les.length;
      for (const l of les) {
        if (l.status === 'published') {
          publishedLessonsCount++;
        } else {
          draftLessonsCount++;
        }
        allLessonsWithCourse.push({ lesson: l, course: c, module: m });
      }
    }
  }

  // Recently updated lessons (sorted by updatedAt)
  const recentlyUpdatedLessons = [...allLessonsWithCourse]
    .sort((a, b) => new Date(b.lesson.updatedAt || 0).getTime() - new Date(a.lesson.updatedAt || 0).getTime())
    .slice(0, 8);

  // Selected course object
  const activeCourse = courses.find((c) => c.id === selectedCourseId) || courses[0];

  // Accordion toggle
  const toggleModuleAccordion = (modId: string) => {
    setExpandedModules((prev) => ({
      ...prev,
      [modId]: !prev[modId],
    }));
  };

  // =========================================================================
  // COURSE CRUD HANDLERS
  // =========================================================================
  const handleOpenAddCourse = () => {
    setEditingCourse(null);
    setCourseTitle('');
    setCourseSlug('');
    setCourseCategory(categories[0]?.id || 'cat-ai-for-qa');
    setCourseDesc('');
    setCourseIcon('BookOpen');
    setCourseLevel('All Levels');
    setCourseHours(10);
    setCourseStatus('published');
    setShowCourseModal(true);
  };

  const handleOpenEditCourse = (course: AcademyCourse) => {
    setEditingCourse(course);
    setCourseTitle(course.title);
    setCourseSlug(course.slug);
    setCourseCategory(course.categoryId);
    setCourseDesc(course.description || '');
    setCourseIcon(course.icon || 'BookOpen');
    setCourseLevel(course.level || 'All Levels');
    setCourseHours(course.estimatedHours || 10);
    setCourseStatus(course.status);
    setShowCourseModal(true);
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseTitle.trim()) {
      notify('Course title is required', 'error');
      return;
    }
    const finalSlug = courseSlug.trim() || slugify(courseTitle);

    try {
      if (editingCourse) {
        // PUT update
        const res = await fetch(`/api/admin/learning/courses/${editingCourse.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-token': 'admin',
          },
          body: JSON.stringify({
            title: courseTitle.trim(),
            slug: finalSlug,
            categoryId: courseCategory,
            description: courseDesc.trim(),
            icon: courseIcon,
            level: courseLevel,
            estimatedHours: Number(courseHours),
            status: courseStatus,
          }),
        });
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.error || 'Failed to update course');
        notify(`Course "${courseTitle}" updated successfully.`);
      } else {
        // POST create
        const res = await fetch('/api/admin/learning/courses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-token': 'admin',
          },
          body: JSON.stringify({
            categoryId: courseCategory,
            title: courseTitle.trim(),
            slug: finalSlug,
            description: courseDesc.trim(),
            icon: courseIcon,
            level: courseLevel,
            estimatedHours: Number(courseHours),
            status: courseStatus,
          }),
        });
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.error || 'Failed to create course');
        notify(`Course "${courseTitle}" created successfully.`);
        if (json.data?.id) setSelectedCourseId(json.data.id);
      }

      setShowCourseModal(false);
      fetchCurriculum();
    } catch (err: any) {
      notify(err.message, 'error');
    }
  };

  const handleToggleCoursePublish = async (course: AcademyCourse) => {
    const nextStatus: AcademyPublishStatus = course.status === 'published' ? 'draft' : 'published';
    try {
      const res = await fetch('/api/admin/learning/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': 'admin',
        },
        body: JSON.stringify({
          entityType: 'course',
          id: course.id,
          status: nextStatus,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to update status');
      notify(`Course is now ${nextStatus === 'published' ? 'Published' : 'Draft'}.`);
      fetchCurriculum();
    } catch (err: any) {
      notify(err.message, 'error');
    }
  };

  const handleReorderCourses = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= courses.length) return;

    const reordered = [...courses];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    try {
      const res = await fetch('/api/admin/learning/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': 'admin',
        },
        body: JSON.stringify({
          type: 'course',
          orderedIds: reordered.map((c) => c.id),
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to reorder');
      notify('Courses reordered successfully.');
      fetchCurriculum();
    } catch (err: any) {
      notify(err.message, 'error');
    }
  };

  const handleDeleteCourse = async (courseId: string, title: string) => {
    if (!confirm(`Are you sure you want to permanently delete course "${title}" and all its modules and lessons? This action cannot be undone.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/learning/courses/${courseId}`, {
        method: 'DELETE',
        headers: { 'x-admin-token': 'admin' },
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to delete course');
      notify(`Course "${title}" deleted successfully.`);
      setSelectedCourseId('');
      fetchCurriculum();
    } catch (err: any) {
      notify(err.message, 'error');
    }
  };

  // =========================================================================
  // MODULE CRUD HANDLERS
  // =========================================================================
  const handleOpenAddModule = (courseId: string) => {
    setEditingModule({ courseId, module: null });
    setModuleTitle('');
    setModuleSlug('');
    setModuleDesc('');
    setModuleStatus('published');
    setShowModuleModal(true);
  };

  const handleOpenEditModule = (courseId: string, mod: AcademyModule) => {
    setEditingModule({ courseId, module: mod });
    setModuleTitle(mod.title);
    setModuleSlug(mod.slug);
    setModuleDesc(mod.description || '');
    setModuleStatus(mod.status);
    setShowModuleModal(true);
  };

  const handleSaveModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingModule || !moduleTitle.trim()) {
      notify('Module title is required', 'error');
      return;
    }
    const finalSlug = moduleSlug.trim() || slugify(moduleTitle);

    try {
      if (editingModule.module) {
        // PUT update
        const res = await fetch(`/api/admin/learning/modules/${editingModule.module.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-token': 'admin',
          },
          body: JSON.stringify({
            courseId: editingModule.courseId,
            title: moduleTitle.trim(),
            slug: finalSlug,
            description: moduleDesc.trim(),
            status: moduleStatus,
          }),
        });
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.error || 'Failed to update module');
        notify(`Module "${moduleTitle}" updated successfully.`);
      } else {
        // POST create
        const res = await fetch('/api/admin/learning/modules', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-token': 'admin',
          },
          body: JSON.stringify({
            courseId: editingModule.courseId,
            title: moduleTitle.trim(),
            slug: finalSlug,
            description: moduleDesc.trim(),
            status: moduleStatus,
          }),
        });
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.error || 'Failed to create module');
        notify(`Module "${moduleTitle}" created successfully.`);
      }

      setShowModuleModal(false);
      fetchCurriculum();
    } catch (err: any) {
      notify(err.message, 'error');
    }
  };

  const handleToggleModulePublish = async (mod: AcademyModule) => {
    const nextStatus: AcademyPublishStatus = mod.status === 'published' ? 'draft' : 'published';
    try {
      const res = await fetch('/api/admin/learning/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': 'admin',
        },
        body: JSON.stringify({
          entityType: 'module',
          id: mod.id,
          status: nextStatus,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to update status');
      notify(`Module is now ${nextStatus === 'published' ? 'Published' : 'Draft'}.`);
      fetchCurriculum();
    } catch (err: any) {
      notify(err.message, 'error');
    }
  };

  const handleDeleteModule = async (courseId: string, modId: string) => {
    if (!confirm('Are you sure you want to delete this module? Lessons inside it will also be deleted.')) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/learning/modules/${modId}?courseId=${courseId}`, {
        method: 'DELETE',
        headers: { 'x-admin-token': 'admin' },
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to delete module');
      notify('Module deleted successfully.');
      fetchCurriculum();
    } catch (err: any) {
      notify(err.message, 'error');
    }
  };

  // =========================================================================
  // LESSON CRUD HANDLERS
  // =========================================================================
  const handleOpenAddLesson = (courseId: string, moduleId: string) => {
    setEditingLessonTarget({ courseId, moduleId, lesson: null });
    setLessonTitle('');
    setLessonSlug('');
    setLessonSummary('');
    setLessonContentHtml('');
    setLessonDocPath('');
    setLessonStatus('draft'); // Default to draft for new lessons
    setLessonReadTime(5);
    setShowLessonModal(true);
  };

  const handleOpenEditLesson = (courseId: string, moduleId: string, lesson: AcademyLesson) => {
    // If the lesson exists, open directly into the new Visual WYSIWYG Editor
    const course = courses.find((c) => c.id === courseId);
    const mod = course?.modules?.find((m) => m.id === moduleId);

    if (course && mod) {
      setActiveVisualLesson({
        course,
        module: mod,
        lesson,
      });
      setShowVisualEditor(true);
      return;
    }

    setEditingLessonTarget({ courseId, moduleId, lesson });
    setLessonTitle(lesson.title);
    setLessonSlug(lesson.slug);
    setLessonSummary(lesson.shortDescription || lesson.summary || '');
    setLessonContentHtml(lesson.contentHtml || '');
    setLessonBlockData(lesson.blockData || null);
    setLessonDocPath(lesson.originalDocxPath || lesson.originalDocumentPath || '');
    setLessonStatus(lesson.status);
    setLessonReadTime(lesson.estimatedReadingTime || lesson.estimatedReadTime || 5);
    setShowLessonModal(true);
  };

  const handleOpenVisualEditorFromModal = () => {
    if (!editingLessonTarget?.lesson) return;
    const course = courses.find((c) => c.id === editingLessonTarget.courseId);
    const mod = course?.modules?.find((m) => m.id === editingLessonTarget.moduleId);
    if (course && mod) {
      setActiveVisualLesson({
        course,
        module: mod,
        lesson: {
          ...editingLessonTarget.lesson,
          title: lessonTitle,
          slug: lessonSlug,
          summary: lessonSummary,
          contentHtml: lessonContentHtml,
          blockData: lessonBlockData,
          status: lessonStatus,
        },
      });
      setShowLessonModal(false);
      setShowVisualEditor(true);
    }
  };

  const handleVisualEditorSaveDraft = async (contentHtml: string, blockData?: any): Promise<boolean> => {
    if (!activeVisualLesson) return false;
    try {
      const res = await fetch(`/api/admin/learning/lessons/${activeVisualLesson.lesson.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': 'admin',
        },
        body: JSON.stringify({
          contentHtml,
          blockData: blockData || activeVisualLesson.lesson.blockData,
          status: 'draft',
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to auto-save');
      notify(`Draft saved for "${activeVisualLesson.lesson.title}"`);
      fetchCurriculum();
      return true;
    } catch (err: any) {
      notify(err.message, 'error');
      return false;
    }
  };

  const handleVisualEditorPublish = async (contentHtml: string, blockData?: any): Promise<boolean> => {
    if (!activeVisualLesson) return false;
    try {
      const res = await fetch(`/api/admin/learning/lessons/${activeVisualLesson.lesson.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': 'admin',
        },
        body: JSON.stringify({
          contentHtml,
          blockData: blockData || activeVisualLesson.lesson.blockData,
          status: 'published',
          publishedAt: new Date().toISOString(),
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to publish lesson');
      notify(`Lesson "${activeVisualLesson.lesson.title}" published successfully!`);
      setActiveVisualLesson((prev) =>
        prev
          ? {
              ...prev,
              lesson: {
                ...prev.lesson,
                contentHtml,
                status: 'published',
              },
            }
          : null
      );
      fetchCurriculum();
      return true;
    } catch (err: any) {
      notify(err.message, 'error');
      return false;
    }
  };

  const STANDARD_SECTION_TEMPLATES: Record<string, string> = {
    overview: `
<div class="rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 space-y-4 my-6">
  <div class="border-b border-slate-100 dark:border-neutral-800 pb-3">
    <h3 class="text-xl font-bold text-slate-900 dark:text-white mt-1">Lesson Overview</h3>
  </div>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
    <div class="p-4 rounded-xl bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700">
      <h4 class="font-bold uppercase text-slate-500 mb-1">What is this concept?</h4>
      <p class="text-slate-700 dark:text-neutral-300 leading-relaxed">Core technical definition and architecture role in modern test suites.</p>
    </div>
    <div class="p-4 rounded-xl bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700">
      <h4 class="font-bold uppercase text-slate-500 mb-1">Why is it important?</h4>
      <p class="text-slate-700 dark:text-neutral-300 leading-relaxed">Prevents flakiness, accelerates execution velocity, and provides regression confidence.</p>
    </div>
    <div class="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
      <h4 class="font-bold uppercase text-emerald-500 mb-1">Where is it used?</h4>
      <p class="text-slate-700 dark:text-neutral-300 leading-relaxed">Applied in continuous integration pipelines and end-to-end regression frameworks.</p>
    </div>
  </div>
</div>`,

    objectives: `
<div class="rounded-2xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/30 dark:bg-indigo-950/20 p-6 space-y-3 my-6">
  <h3 class="text-xl font-bold text-slate-900 dark:text-white">Learning Objectives</h3>
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
    <div class="p-3 rounded-xl bg-white dark:bg-neutral-800 border border-indigo-100 dark:border-indigo-900 text-slate-700 dark:text-neutral-200 font-medium">✓ Master core architecture and runtime behavior</div>
    <div class="p-3 rounded-xl bg-white dark:bg-neutral-800 border border-indigo-100 dark:border-indigo-900 text-slate-700 dark:text-neutral-200 font-medium">✓ Synthesize deterministic automation tests</div>
    <div class="p-3 rounded-xl bg-white dark:bg-neutral-800 border border-indigo-100 dark:border-indigo-900 text-slate-700 dark:text-neutral-200 font-medium">✓ Diagnose and troubleshoot common exceptions</div>
    <div class="p-3 rounded-xl bg-white dark:bg-neutral-800 border border-indigo-100 dark:border-indigo-900 text-slate-700 dark:text-neutral-200 font-medium">✓ Answer senior SDET & architect interview scenarios</div>
  </div>
</div>`,

    concept: `
<div class="rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 space-y-4 my-6">
  <div class="border-b border-slate-100 dark:border-neutral-800 pb-3">
    <h3 class="text-xl font-bold text-slate-900 dark:text-white mt-1">Concept Explanation</h3>
  </div>
  <p class="text-sm text-slate-700 dark:text-neutral-300 leading-relaxed">In modern quality engineering, deterministic verification guarantees reliable feedback loops across distributed architectures.</p>
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
    <div class="p-3 rounded-xl bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-xs">
      <strong class="block text-slate-900 dark:text-white mb-1">Deterministic Verification</strong>
      <span class="text-slate-600 dark:text-neutral-400">Identical outcomes on every run under identical preconditions.</span>
    </div>
    <div class="p-3 rounded-xl bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-xs">
      <strong class="block text-slate-900 dark:text-white mb-1">State Isolation</strong>
      <span class="text-slate-600 dark:text-neutral-400">Independent test fixtures preventing cascading side effects.</span>
    </div>
  </div>
</div>`,

    code: `
<div class="my-6 space-y-4">
  <div class="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden font-mono text-xs shadow-sm">
    <div class="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex justify-between items-center text-slate-300">
      <span class="font-bold text-slate-200">EnterpriseTest.ts</span>
      <span class="px-2 py-0.5 rounded bg-slate-800 text-emerald-400 text-[10px] font-bold uppercase">TYPESCRIPT</span>
    </div>
    <pre class="p-4 text-[#81FF89] overflow-x-auto leading-relaxed"><code>import { test, expect } from '@playwright/test';

test('deterministic enterprise verification', async ({ page }) => {
  await page.goto('/dashboard');
  const target = page.getByRole('button', { name: 'Submit' });
  await expect(target).toBeVisible();
  await target.click();
  await expect(page.locator('.status')).toHaveText('Success');
});</code></pre>
  </div>
</div>`,

    usecases: `
<div class="rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 space-y-4 my-6">
  <h3 class="text-xl font-bold text-slate-900 dark:text-white">Real-World QA Applications</h3>
  <div class="p-4 rounded-xl bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 space-y-1.5 text-xs">
    <h4 class="font-bold text-slate-900 dark:text-white">Continuous Pull Request Quality Gate</h4>
    <p class="text-slate-600 dark:text-neutral-400"><strong>Scenario:</strong> Validating critical user journeys on every PR merge before deployment.</p>
    <p class="text-emerald-600 dark:text-emerald-400"><strong>Enterprise Scale:</strong> Executing 500+ parallel tests in under 10 minutes in CI.</p>
  </div>
</div>`,

    troubleshooting: `
<div class="rounded-2xl border border-red-200 dark:border-red-950 bg-white dark:bg-neutral-900 p-6 space-y-4 my-6">
  <h3 class="text-xl font-bold text-slate-900 dark:text-white">Common Errors &amp; Fixes</h3>
  <div class="p-4 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50/20 dark:bg-red-950/20 text-xs space-y-2">
    <h4 class="font-bold font-mono text-red-600 dark:text-red-400">TimeoutException / StaleElementReferenceException</h4>
    <p class="text-slate-600 dark:text-neutral-400"><strong>Root Cause:</strong> Dynamic DOM update unmounted element before interaction.</p>
    <p class="text-slate-600 dark:text-neutral-400"><strong>Fix:</strong> Re-locate element dynamically using explicit expected condition polling.</p>
  </div>
</div>`,

    bestpractices: `
<div class="rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 space-y-4 my-6">
  <h3 class="text-xl font-bold text-slate-900 dark:text-white">Enterprise Standards</h3>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
    <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700">
      <strong class="text-slate-900 dark:text-white block mb-1">Zero Hardcoded Sleep Timers</strong>
      <p class="text-slate-600 dark:text-neutral-300">Always utilize event-driven polling waits instead of static thread sleep intervals.</p>
    </div>
    <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700">
      <strong class="text-slate-900 dark:text-white block mb-1">Fail-Fast Preconditions</strong>
      <p class="text-slate-600 dark:text-neutral-300">Verify environment connectivity and database seeding before launching heavy UI browser sessions.</p>
    </div>
  </div>
</div>`,

    interview: `
<div class="rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 space-y-4 my-6">
  <h3 class="text-xl font-bold text-slate-900 dark:text-white">Interview Questions</h3>
  <div class="p-4 rounded-xl border border-slate-200 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-800/50 text-xs space-y-1.5">
    <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-500/10 text-rose-500 border border-rose-500/20">Architect-Level</span>
    <strong class="text-slate-900 dark:text-white block">How do you scale test execution across 100+ parallel workers without resource deadlocks?</strong>
    <p class="text-slate-600 dark:text-neutral-400 leading-relaxed font-sans">Isolate test state per worker using ephemeral containers, seed test data via background API calls rather than UI, and shard test execution evenly.</p>
  </div>
</div>`,

    summary: `
<div class="rounded-2xl border border-emerald-200 dark:border-emerald-950 bg-emerald-50/20 dark:bg-emerald-950/20 p-6 space-y-4 my-6">
  <h3 class="text-xl font-bold text-slate-900 dark:text-white">Key Takeaways</h3>
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
    <div class="p-3 rounded-xl bg-white dark:bg-neutral-800 border border-emerald-100 dark:border-emerald-900/50 text-slate-700 dark:text-neutral-300">✓ Deterministic assertions and dynamic waits are mandatory</div>
    <div class="p-3 rounded-xl bg-white dark:bg-neutral-800 border border-emerald-100 dark:border-emerald-900/50 text-slate-700 dark:text-neutral-300">✓ Abstract low-level APIs behind reusable Page Objects</div>
  </div>
</div>`,
  };

  const handleInsertSectionTemplate = (sectionKey: string) => {
    const template = STANDARD_SECTION_TEMPLATES[sectionKey];
    if (template) {
      setLessonContentHtml((prev) => (prev ? prev + '\n' + template : template));
      notify(`Inserted ${sectionKey} section template into lesson editor.`);
    }
  };

  const handleInsertDiagram = () => {
    let diagramHtml = '';
    if (diagramType === 'mermaid') {
      diagramHtml = `
<div class="my-6 rounded-2xl border border-slate-200 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-900 p-6 space-y-4">
  <div class="border-b border-slate-200 dark:border-neutral-800 pb-3 flex justify-between items-center">
    <div>
      <h4 class="text-lg font-bold text-slate-900 dark:text-white">${diagramTitle || 'Mermaid Architecture Diagram'}</h4>
      ${diagramCaption ? `<p class="text-xs text-slate-500">${diagramCaption}</p>` : ''}
    </div>
    <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-500 font-bold uppercase">Mermaid</span>
  </div>
  <pre class="mermaid text-xs p-4 rounded-xl bg-slate-900 text-emerald-400 font-mono overflow-x-auto"><code>${diagramMermaid}</code></pre>
  ${diagramSourceAttr ? `<p class="text-[10px] text-slate-400">Source: ${diagramSourceAttr}</p>` : ''}
</div>`;
    } else if (diagramType === 'image') {
      diagramHtml = `
<div class="my-6 rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 space-y-4">
  <div class="border-b border-slate-200 dark:border-neutral-800 pb-3">
    <h4 class="text-lg font-bold text-slate-900 dark:text-white">${diagramTitle || 'Technical Illustration'}</h4>
  </div>
  <figure class="space-y-2 text-center">
    <img src="${diagramImageUrl || '/assets/diagram-placeholder.png'}" alt="${diagramAltText || diagramTitle}" class="rounded-xl mx-auto max-h-96 object-contain border border-slate-200 dark:border-neutral-800 shadow-sm" />
    ${diagramCaption ? `<figcaption class="text-xs text-slate-500">${diagramCaption}</figcaption>` : ''}
  </figure>
  ${diagramSourceAttr ? `<p class="text-[10px] text-slate-400 text-right">Source: ${diagramSourceAttr}</p>` : ''}
</div>`;
    } else {
      diagramHtml = `
<div class="my-6 rounded-2xl border border-slate-200 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-900 p-6 space-y-4">
  <div class="border-b border-slate-200 dark:border-neutral-800 pb-3 flex justify-between items-center">
    <div>
      <h4 class="text-lg font-bold text-slate-900 dark:text-white">${diagramTitle || 'Component Execution Flow'}</h4>
      ${diagramCaption ? `<p class="text-xs text-slate-500">${diagramCaption}</p>` : ''}
    </div>
    <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-500 font-bold uppercase">${diagramType}</span>
  </div>
  <div class="flex flex-col md:flex-row items-center gap-3 overflow-x-auto py-2">
    <div class="flex-1 min-w-[150px] p-3 rounded-xl bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-center">
      <span class="text-[10px] font-mono font-bold text-slate-400 uppercase">Input</span>
      <h5 class="text-xs font-bold text-slate-900 dark:text-white">1. Precondition Fixture</h5>
    </div>
    <div class="text-slate-400 font-bold">→</div>
    <div class="flex-1 min-w-[150px] p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-400 text-center ring-1 ring-emerald-400/30">
      <span class="text-[10px] font-mono font-bold text-emerald-600 uppercase">Action</span>
      <h5 class="text-xs font-bold text-slate-900 dark:text-white">2. Execution Engine</h5>
    </div>
    <div class="text-slate-400 font-bold">→</div>
    <div class="flex-1 min-w-[150px] p-3 rounded-xl bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-center">
      <span class="text-[10px] font-mono font-bold text-slate-400 uppercase">Output</span>
      <h5 class="text-xs font-bold text-slate-900 dark:text-white">3. Deterministic Assertion</h5>
    </div>
  </div>
</div>`;
    }

    setLessonContentHtml((prev) => (prev ? prev + '\n' + diagramHtml : diagramHtml));
    setLessonEditorTab('content');
    notify(`Inserted ${diagramType} diagram into lesson content.`);
  };

  const handleSaveLesson = async (overrideStatus?: AcademyPublishStatus) => {
    if (!editingLessonTarget || !lessonTitle.trim()) {
      notify('Lesson title is required', 'error');
      return;
    }
    const finalSlug = lessonSlug.trim() || slugify(lessonTitle);
    const finalStatus = overrideStatus || lessonStatus;

    try {
      if (editingLessonTarget.lesson) {
        // PUT update
        const res = await fetch(`/api/admin/learning/lessons/${editingLessonTarget.lesson.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-token': 'admin',
          },
          body: JSON.stringify({
            title: lessonTitle.trim(),
            slug: finalSlug,
            summary: lessonSummary.trim(),
            shortDescription: lessonSummary.trim(),
            contentHtml: lessonContentHtml,
            originalDocxPath: lessonDocPath || null,
            originalDocumentPath: lessonDocPath || null,
            estimatedReadingTime: Number(lessonReadTime),
            status: finalStatus,
          }),
        });
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.error || 'Failed to update lesson');
        notify(`Lesson "${lessonTitle}" saved as ${finalStatus}.`);
      } else {
        // POST create
        const res = await fetch('/api/admin/learning/lessons', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-token': 'admin',
          },
          body: JSON.stringify({
            courseId: editingLessonTarget.courseId,
            moduleId: editingLessonTarget.moduleId,
            title: lessonTitle.trim(),
            slug: finalSlug,
            summary: lessonSummary.trim(),
            shortDescription: lessonSummary.trim(),
            contentHtml: lessonContentHtml,
            originalDocxPath: lessonDocPath || null,
            originalDocumentPath: lessonDocPath || null,
            estimatedReadingTime: Number(lessonReadTime),
            status: finalStatus,
          }),
        });
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.error || 'Failed to create lesson');
        notify(`Lesson "${lessonTitle}" created as ${finalStatus}.`);
      }

      setShowLessonModal(false);
      fetchCurriculum();
    } catch (err: any) {
      notify(err.message, 'error');
    }
  };

  const handleToggleLessonPublish = async (lesson: AcademyLesson) => {
    const nextStatus: AcademyPublishStatus = lesson.status === 'published' ? 'draft' : 'published';
    try {
      const res = await fetch('/api/admin/learning/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': 'admin',
        },
        body: JSON.stringify({
          entityType: 'lesson',
          id: lesson.id,
          status: nextStatus,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to update status');
      notify(`Lesson is now ${nextStatus === 'published' ? 'Published' : 'Draft'}.`);
      fetchCurriculum();
    } catch (err: any) {
      notify(err.message, 'error');
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm('Are you sure you want to delete this lesson? This action cannot be undone.')) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/learning/lessons/${lessonId}`, {
        method: 'DELETE',
        headers: { 'x-admin-token': 'admin' },
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to delete lesson');
      notify('Lesson deleted successfully.');
      fetchCurriculum();
    } catch (err: any) {
      notify(err.message, 'error');
    }
  };

  const handleOpenPreviewModal = (lesson: Partial<AcademyLesson>, cTitle: string, mTitle: string) => {
    setPreviewingLesson({
      lesson,
      courseTitle: cTitle,
      moduleTitle: mTitle,
    });
  };

  return (
    <div className="space-y-6 text-white font-sans">
      {/* Toast Banner Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-xs font-semibold animate-in slide-in-from-bottom duration-200 ${
            toast.type === 'success'
              ? 'bg-emerald-600 text-white border border-emerald-500/40'
              : 'bg-red-600 text-white border border-red-500/40'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-white" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-white" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* 1. TOP HEADER & WORKSPACE NAVIGATION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#262626]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
              LEARNING ACADEMY CMS
            </span>
            <span className="text-xs text-zinc-400">Content Management Console</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mt-1">
            Course &amp; Lesson Management
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Tab Switcher */}
          <div className="bg-[#181818] p-1 rounded-xl border border-[#2D2D2D] flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('curriculum')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'curriculum'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Curriculum Tree</span>
            </button>
          </div>

          <button
            type="button"
            onClick={fetchCurriculum}
            className="p-2 rounded-xl bg-[#181818] border border-[#2D2D2D] text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Reload Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. DASHBOARD VIEW (METRICS & RECENT LESSONS) */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* 6 Key Metrics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-4 rounded-2xl bg-[#161616] border border-[#262626] space-y-1">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Courses</span>
              <p className="text-2xl font-black text-white">{totalCourses}</p>
              <p className="text-[10px] text-zinc-400">Total Tracks</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#161616] border border-[#262626] space-y-1">
              <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">Modules</span>
              <p className="text-2xl font-black text-white">{totalModules}</p>
              <p className="text-[10px] text-zinc-400">Chapters</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#161616] border border-[#262626] space-y-1">
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">Total Lessons</span>
              <p className="text-2xl font-black text-white">{totalLessons}</p>
              <p className="text-[10px] text-zinc-400">All Curriculum</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#161616] border border-emerald-500/20 space-y-1">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Published</span>
              <p className="text-2xl font-black text-emerald-300">{publishedLessonsCount}</p>
              <p className="text-[10px] text-zinc-400">Live to Learners</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#161616] border border-amber-500/20 space-y-1">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Drafts</span>
              <p className="text-2xl font-black text-amber-300">{draftLessonsCount}</p>
              <p className="text-[10px] text-zinc-400">Private / Staged</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#161616] border border-[#262626] space-y-1">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Categories</span>
              <p className="text-2xl font-black text-white">{categories.length}</p>
              <p className="text-[10px] text-zinc-400">Taxonomies</p>
            </div>
          </div>

          {/* Quick Actions Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-[#181818] border border-[#282828]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold text-zinc-200">
                Ready to add curriculum items?
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleOpenAddCourse}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create New Course</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('curriculum')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#222222] hover:bg-[#2C2C2C] text-zinc-200 text-xs font-semibold transition-all border border-[#333333] cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Manage Curriculum Tree</span>
              </button>
            </div>
          </div>

          {/* Recently Updated Lessons Table */}
          <div className="p-5 rounded-2xl bg-[#161616] border border-[#262626] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">Recently Updated Lessons</h3>
                <p className="text-[11px] text-zinc-400">Latest technical documentation entries across all courses</p>
              </div>
            </div>

            {recentlyUpdatedLessons.length === 0 ? (
              <div className="py-8 text-center text-xs text-zinc-500">
                No lessons recorded yet.
              </div>
            ) : (
              <div className="divide-y divide-[#222222] border-t border-[#222222]">
                {recentlyUpdatedLessons.map(({ lesson, course, module }) => (
                  <div
                    key={lesson.id}
                    className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-[#1A1A1A] px-2 rounded-xl transition-colors"
                  >
                    <div className="space-y-0.5 truncate flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full ${
                            lesson.status === 'published'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {lesson.status.toUpperCase()}
                        </span>
                        <h4 className="text-xs font-bold text-white truncate">{lesson.title}</h4>
                      </div>
                      <p className="text-[10px] text-zinc-400 truncate">
                        {course.title} • {module.title}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenPreviewModal(lesson, course.title, module.title)}
                        className="p-1.5 rounded-lg bg-[#222222] hover:bg-[#2C2C2C] text-zinc-300 hover:text-white transition-colors cursor-pointer"
                        title="Preview Lesson"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleLessonPublish(lesson)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono transition-colors cursor-pointer ${
                          lesson.status === 'published'
                            ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                        }`}
                        title={lesson.status === 'published' ? 'Unpublish (revert to Draft)' : 'Publish to learners'}
                      >
                        {lesson.status === 'published' ? 'Unpublish' : 'Publish'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEditLesson(course.id, module.id, lesson)}
                        className="p-1.5 rounded-lg bg-[#222222] hover:bg-[#2C2C2C] text-zinc-300 hover:text-white transition-colors cursor-pointer"
                        title="Edit Lesson"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. CURRICULUM TREE VIEW (COURSES, MODULES & LESSONS MANAGEMENT) */}
      {activeTab === 'curriculum' && (
        <div className="space-y-6">
          {/* Quick Metrics KPI Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            <div className="p-3.5 rounded-xl bg-[#161616] border border-[#262626]">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">Courses</span>
              <p className="text-xl font-black text-white mt-0.5">{totalCourses}</p>
              <p className="text-[10px] text-zinc-400">Total Tracks</p>
            </div>
            <div className="p-3.5 rounded-xl bg-[#161616] border border-[#262626]">
              <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider block">Modules</span>
              <p className="text-xl font-black text-white mt-0.5">{totalModules}</p>
              <p className="text-[10px] text-zinc-400">Active Chapters</p>
            </div>
            <div className="p-3.5 rounded-xl bg-[#161616] border border-[#262626]">
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block">Lessons</span>
              <p className="text-xl font-black text-white mt-0.5">{totalLessons}</p>
              <p className="text-[10px] text-zinc-400">All Technical Content</p>
            </div>
            <div className="p-3.5 rounded-xl bg-[#161616] border border-emerald-500/20">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">Published</span>
              <p className="text-xl font-black text-emerald-300 mt-0.5">{publishedLessonsCount}</p>
              <p className="text-[10px] text-zinc-400">Live to Learners</p>
            </div>
            <div className="p-3.5 rounded-xl bg-[#161616] border border-amber-500/20">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">Drafts</span>
              <p className="text-xl font-black text-amber-300 mt-0.5">{draftLessonsCount}</p>
              <p className="text-[10px] text-zinc-400">Private / Staged</p>
            </div>
          </div>

          {/* Course Selector Tabs */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
              {courses.map((course) => {
                const isSelected = course.id === selectedCourseId;
                const totalCourseLessons = (course.modules || []).reduce((acc, m) => acc + (m.lessons?.length || 0), 0);
                return (
                  <button
                    key={course.id}
                    type="button"
                    onClick={() => setSelectedCourseId(course.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500 text-white shadow-md font-bold'
                        : 'bg-[#181818] text-zinc-400 hover:text-white hover:bg-zinc-800 border border-[#262626]'
                    }`}
                  >
                    <span>{course.title}</span>
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.2 rounded ${
                        isSelected ? 'bg-emerald-700 text-white' : 'bg-zinc-800 text-zinc-400'
                      }`}
                      title={`${course.modules?.length || 0} Modules • ${totalCourseLessons} Lessons`}
                    >
                      {totalCourseLessons}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={handleOpenAddCourse}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#222222] hover:bg-[#2A2A2A] text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Course</span>
            </button>
          </div>

          {/* Active Course Banner & Action Card */}
          {activeCourse && (
            <div className="p-5 rounded-2xl bg-[#161616] border border-[#2A2A2A] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full ${
                        activeCourse.status === 'published'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {activeCourse.status.toUpperCase()}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400">
                      Slug: {activeCourse.slug}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white tracking-tight">{activeCourse.title}</h3>
                  {activeCourse.description && (
                    <p className="text-xs text-zinc-400 max-w-2xl">{activeCourse.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <a
                    href="/learning"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Preview in Academy</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => handleToggleCoursePublish(activeCourse)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-colors cursor-pointer ${
                      activeCourse.status === 'published'
                        ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30'
                        : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm'
                    }`}
                  >
                    {activeCourse.status === 'published' ? 'Unpublish' : 'Publish Course'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenEditCourse(activeCourse)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#222222] hover:bg-[#2C2C2C] text-zinc-200 text-xs font-semibold border border-[#333] transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Course</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteCourse(activeCourse.id, activeCourse.title)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold border border-red-500/30 transition-colors cursor-pointer"
                    title="Delete Course"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenAddModule(activeCourse.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md transition-colors cursor-pointer"
                  >
                    <FolderPlus className="w-3.5 h-3.5" />
                    <span>Add Module</span>
                  </button>
                </div>
              </div>

              {/* Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-[#262626]">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search lessons by title or keyword..."
                    className="w-full pl-9 pr-8 py-1.5 rounded-xl bg-[#1C1C1C] border border-[#2D2D2D] text-white text-xs placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Status Filter Pills */}
                  <div className="bg-[#1C1C1C] p-1 rounded-xl border border-[#2D2D2D] flex items-center gap-1 text-xs">
                    {(['all', 'published', 'draft'] as const).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setStatusFilter(st)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold capitalize transition-all cursor-pointer ${
                          statusFilter === st
                            ? 'bg-emerald-500 text-white shadow-sm'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        {st === 'all' ? 'All' : st}
                      </button>
                    ))}
                  </div>

                  {/* Expand / Collapse All */}
                  <button
                    type="button"
                    onClick={() => {
                      const allExpanded = Object.values(expandedModules).every(Boolean);
                      const nextState: Record<string, boolean> = {};
                      activeCourse.modules?.forEach((m) => {
                        nextState[m.id] = !allExpanded;
                      });
                      setExpandedModules(nextState);
                    }}
                    className="px-2.5 py-1 rounded-xl bg-[#1C1C1C] border border-[#2D2D2D] text-zinc-400 hover:text-white text-[11px] font-semibold cursor-pointer"
                  >
                    Toggle All
                  </button>
                </div>
              </div>

              {/* Modules Accordion Tree */}
              <div className="space-y-3 pt-2">
                {(!activeCourse.modules || activeCourse.modules.length === 0) ? (
                  <div className="py-8 text-center text-xs text-zinc-500 border-2 border-dashed border-[#222] rounded-xl">
                    No modules created for this course yet. Click "Add Module" to begin.
                  </div>
                ) : (
                  activeCourse.modules.map((mod) => {
                    const lessons = mod.lessons || [];
                    const filteredLessons = lessons.filter((l) => {
                      if (statusFilter !== 'all' && l.status !== statusFilter) return false;
                      if (searchQuery.trim()) {
                        const q = searchQuery.toLowerCase().trim();
                        return (
                          l.title.toLowerCase().includes(q) ||
                          l.slug.toLowerCase().includes(q) ||
                          (l.summary && l.summary.toLowerCase().includes(q))
                        );
                      }
                      return true;
                    });

                    const isExpanded = searchQuery.trim() ? true : (expandedModules[mod.id] ?? true);

                    return (
                      <div
                        key={mod.id}
                        className="rounded-xl bg-[#1A1A1A] border border-[#2D2D2D] overflow-hidden"
                      >
                        {/* Module Header Row */}
                        <div className="p-3.5 flex items-center justify-between gap-3 bg-[#1F1F1F]">
                          <div
                            onClick={() => toggleModuleAccordion(mod.id)}
                            className="flex items-center gap-2.5 truncate flex-1 min-w-0 cursor-pointer"
                          >
                            <button
                              type="button"
                              className="text-zinc-400 hover:text-white"
                            >
                              {isExpanded ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                            </button>
                            <Folder className="w-4 h-4 text-amber-400 shrink-0" />
                            <h4 className="text-xs font-bold text-white truncate">{mod.title}</h4>
                            <span
                              className={`text-[9px] font-mono px-2 py-0.2 rounded-full ${
                                mod.status === 'published'
                                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                              }`}
                            >
                              {mod.status}
                            </span>
                            <span className="text-[10px] font-mono text-zinc-400">
                              ({filteredLessons.length}{filteredLessons.length !== lessons.length ? ` / ${lessons.length}` : ''} Lessons)
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleToggleModulePublish(mod)}
                              className="px-2 py-1 rounded text-[10px] font-mono font-bold bg-[#141414] text-zinc-300 hover:text-white transition-colors cursor-pointer"
                              title={mod.status === 'published' ? 'Unpublish Module' : 'Publish Module'}
                            >
                              {mod.status === 'published' ? 'Unpublish' : 'Publish'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenAddLesson(activeCourse.id, mod.id)}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold transition-colors cursor-pointer"
                            >
                              <FilePlus className="w-3 h-3" />
                              <span>Add Lesson</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEditModule(activeCourse.id, mod)}
                              className="p-1.5 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                              title="Edit Module"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteModule(activeCourse.id, mod.id)}
                              className="p-1.5 text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
                              title="Delete Module"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Lessons List inside Module */}
                        {isExpanded && (
                          <div className="p-3 space-y-2 border-t border-[#262626]">
                            {filteredLessons.length === 0 ? (
                              <div className="py-4 text-center text-xs text-zinc-500">
                                {lessons.length === 0
                                  ? 'No lessons inside this module yet. Click "Add Lesson" to create one.'
                                  : 'No lessons match your search filter.'}
                              </div>
                            ) : (
                              filteredLessons.map((lsn) => (
                                <div
                                  key={lsn.id}
                                  className="p-2.5 rounded-lg bg-[#141414] border border-[#242424] flex items-center justify-between gap-3 hover:border-zinc-700 transition-all"
                                >
                                  <div className="flex items-center gap-2.5 truncate flex-1 min-w-0">
                                    <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                                    <div className="truncate">
                                      <div className="flex items-center gap-2">
                                        <h5 className="text-xs font-semibold text-white truncate">
                                          {lsn.title}
                                        </h5>
                                        <span
                                          className={`text-[9px] font-mono px-2 py-0.2 rounded-full ${
                                            lsn.status === 'published'
                                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                              : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                                          }`}
                                        >
                                          {lsn.status.toUpperCase()}
                                        </span>
                                        {lsn.originalDocxPath && (
                                          <span className="text-[8px] font-mono px-1.5 py-0.2 rounded bg-purple-500/15 text-purple-300 border border-purple-500/30">
                                            DOCX
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-[10px] text-zinc-400 truncate">
                                        Slug: {lsn.slug} • {lsn.estimatedReadingTime || lsn.estimatedReadTime || 5} min read
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => handleOpenPreviewModal(lsn, activeCourse.title, mod.title)}
                                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#202020] hover:bg-[#282828] text-zinc-300 hover:text-white text-[11px] font-medium transition-colors cursor-pointer"
                                      title="Preview Lesson"
                                    >
                                      <Eye className="w-3 h-3" />
                                      <span>Preview</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleToggleLessonPublish(lsn)}
                                      className={`px-2 py-1 rounded text-[10px] font-mono font-bold transition-colors cursor-pointer ${
                                        lsn.status === 'published'
                                          ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
                                          : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                                      }`}
                                    >
                                      {lsn.status === 'published' ? 'Unpublish' : 'Publish'}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleOpenEditLesson(activeCourse.id, mod.id, lsn)}
                                      className="p-1.5 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                                      title="Edit Lesson & DOCX Document"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteLesson(lsn.id)}
                                      className="p-1.5 text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
                                      title="Delete Lesson"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MODALS SECTION                                                         */}
      {/* ========================================================================= */}

      {/* 4A. CREATE / EDIT COURSE MODAL */}
      {showCourseModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div className="relative w-full max-w-lg bg-[#161616] border border-[#2A2A2A] rounded-2xl shadow-2xl p-6 space-y-4 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-[#262626]">
              <h3 className="text-sm font-bold text-white">
                {editingCourse ? 'Edit Course' : 'Create New Course'}
              </h3>
              <button
                type="button"
                onClick={() => setShowCourseModal(false)}
                className="text-zinc-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCourse} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-zinc-300">Course Title *</label>
                <input
                  type="text"
                  value={courseTitle}
                  onChange={(e) => {
                    setCourseTitle(e.target.value);
                    if (!editingCourse) setCourseSlug(slugify(e.target.value));
                  }}
                  placeholder="e.g. AI Academy Mastery"
                  className="w-full px-3 py-2 rounded-xl bg-[#202020] border border-[#333] text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-zinc-300">Slug (URL Path) *</label>
                <input
                  type="text"
                  value={courseSlug}
                  onChange={(e) => setCourseSlug(e.target.value)}
                  placeholder="e.g. ai-for-qa-mastery"
                  className="w-full px-3 py-2 rounded-xl bg-[#202020] border border-[#333] text-white font-mono focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-zinc-300">Learning Category</label>
                <select
                  value={courseCategory}
                  onChange={(e) => setCourseCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#202020] border border-[#333] text-white focus:outline-none focus:border-emerald-500"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-zinc-300">Description</label>
                <textarea
                  value={courseDesc}
                  onChange={(e) => setCourseDesc(e.target.value)}
                  placeholder="Course technical overview and curriculum summary..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl bg-[#202020] border border-[#333] text-white focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-zinc-300">Level</label>
                  <select
                    value={courseLevel}
                    onChange={(e) => setCourseLevel(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-[#202020] border border-[#333] text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="All Levels">All Levels</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-zinc-300">Publish Status</label>
                  <select
                    value={courseStatus}
                    onChange={(e) => setCourseStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-[#202020] border border-[#333] text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft (Private)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#262626]">
                <button
                  type="button"
                  onClick={() => setShowCourseModal(false)}
                  className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold"
                >
                  {editingCourse ? 'Save Changes' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4B. CREATE / EDIT MODULE MODAL */}
      {showModuleModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div className="relative w-full max-w-md bg-[#161616] border border-[#2A2A2A] rounded-2xl shadow-2xl p-6 space-y-4 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-[#262626]">
              <h3 className="text-sm font-bold text-white">
                {editingModule?.module ? 'Edit Module' : 'Create New Module'}
              </h3>
              <button
                type="button"
                onClick={() => setShowModuleModal(false)}
                className="text-zinc-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveModule} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-zinc-300">Module Title *</label>
                <input
                  type="text"
                  value={moduleTitle}
                  onChange={(e) => {
                    setModuleTitle(e.target.value);
                    if (!editingModule?.module) setModuleSlug(slugify(e.target.value));
                  }}
                  placeholder="e.g. Introduction to AI"
                  className="w-full px-3 py-2 rounded-xl bg-[#202020] border border-[#333] text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-zinc-300">Slug *</label>
                <input
                  type="text"
                  value={moduleSlug}
                  onChange={(e) => setModuleSlug(e.target.value)}
                  placeholder="e.g. introduction-to-ai"
                  className="w-full px-3 py-2 rounded-xl bg-[#202020] border border-[#333] text-white font-mono focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-zinc-300">Description</label>
                <textarea
                  value={moduleDesc}
                  onChange={(e) => setModuleDesc(e.target.value)}
                  placeholder="Module objectives and topic scope..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl bg-[#202020] border border-[#333] text-white focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-zinc-300">Publish Status</label>
                <select
                  value={moduleStatus}
                  onChange={(e) => setModuleStatus(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-[#202020] border border-[#333] text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft (Private)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#262626]">
                <button
                  type="button"
                  onClick={() => setShowModuleModal(false)}
                  className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold"
                >
                  {editingModule?.module ? 'Save Changes' : 'Create Module'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4C. CREATE / EDIT LESSON MODAL WITH WORD DOCUMENT UPLOAD */}
      {showLessonModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div className="relative w-full max-w-4xl max-h-[92vh] bg-[#161616] border border-[#2A2A2A] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-white">
            <div className="px-6 py-4 border-b border-[#262626] flex items-center justify-between bg-[#191919] shrink-0">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>{editingLessonTarget?.lesson ? 'Edit Lesson' : 'Create Technical Lesson'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowLessonModal(false)}
                className="text-zinc-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs flex-1">
              <div>
                <label className="block font-semibold mb-1 text-zinc-300">Lesson Title *</label>
                <input
                  type="text"
                  value={lessonTitle}
                  onChange={(e) => {
                    setLessonTitle(e.target.value);
                    if (!editingLessonTarget?.lesson) setLessonSlug(slugify(e.target.value));
                  }}
                  placeholder="e.g. What is an LLM?"
                  className="w-full px-3 py-2 rounded-xl bg-[#202020] border border-[#333] text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-zinc-300">Slug (URL Path) *</label>
                <input
                  type="text"
                  value={lessonSlug}
                  onChange={(e) => setLessonSlug(e.target.value)}
                  placeholder="e.g. what-is-an-llm"
                  className="w-full px-3 py-2 rounded-xl bg-[#202020] border border-[#333] text-white font-mono focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-zinc-300">Short Description / Summary</label>
                <textarea
                  value={lessonSummary}
                  onChange={(e) => setLessonSummary(e.target.value)}
                  placeholder="Concise overview of what SDETs and QA engineers will learn..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl bg-[#202020] border border-[#333] text-white focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              {/* VISUAL WYSIWYG EDITOR CALLOUT BANNER */}
              {editingLessonTarget?.lesson && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-purple-900/30 via-indigo-900/20 to-emerald-900/20 border border-purple-500/40 flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono font-bold uppercase text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                      Word / Docs Visual Editor
                    </span>
                    <h4 className="text-xs font-bold text-white">Visual WYSIWYG Content Studio</h4>
                    <p className="text-[11px] text-zinc-300">
                      Edit this lesson visually with rich text, code highlighting, tables, callouts, and images. Zero HTML required.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenVisualEditorFromModal}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg transition-colors cursor-pointer shrink-0"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Open Visual Editor</span>
                  </button>
                </div>
              )}

              {/* EDITOR MODE TABS */}
              <div className="space-y-3">
                <div className="flex items-center gap-1 p-1 bg-[#1A1A1A] rounded-xl border border-[#2D2D2D]">
                  <button
                    type="button"
                    onClick={() => setLessonEditorTab('content')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-colors ${
                      lessonEditorTab === 'content'
                        ? 'bg-emerald-500 text-slate-950 shadow-sm'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Code className="w-3.5 h-3.5" />
                    <span>Technical Content & Code (HTML)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLessonEditorTab('diagram')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-colors ${
                      lessonEditorTab === 'diagram'
                        ? 'bg-emerald-500 text-slate-950 shadow-sm'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Workflow className="w-3.5 h-3.5" />
                    <span>Visual Diagram Builder</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLessonEditorTab('docx')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-colors ${
                      lessonEditorTab === 'docx'
                        ? 'bg-emerald-500 text-slate-950 shadow-sm'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Word Document (.docx)</span>
                  </button>
                </div>

                {/* TAB 1: TECHNICAL CONTENT & INSERT STANDARD SECTION */}
                {lessonEditorTab === 'content' && (
                  <div className="space-y-2.5 p-4 rounded-xl bg-[#1A1A1A] border border-[#262626]">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#262626] pb-2.5">
                      <span className="font-semibold text-zinc-200 flex items-center gap-1.5">
                        <Code className="w-4 h-4 text-emerald-400" />
                        <span>Standard Lesson Content (HTML)</span>
                      </span>
                      <div className="flex items-center gap-2">
                        <select
                          value={selectedSectionTemplate}
                          onChange={(e) => setSelectedSectionTemplate(e.target.value)}
                          className="px-2.5 py-1.5 rounded-lg bg-[#222] border border-[#333] text-zinc-200 text-xs focus:outline-none"
                        >
                          <option value="overview">Overview</option>
                          <option value="objectives">Learning Objectives</option>
                          <option value="concept">Concept Explanation</option>
                          <option value="code">Code Example</option>
                          <option value="usecases">QA Use Cases</option>
                          <option value="troubleshooting">Troubleshooting</option>
                          <option value="bestpractices">Best Practices</option>
                          <option value="interview">Interview Questions</option>
                          <option value="summary">Lesson Summary</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => handleInsertSectionTemplate(selectedSectionTemplate)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-colors cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Insert Section</span>
                        </button>
                      </div>
                    </div>

                    <textarea
                      value={lessonContentHtml}
                      onChange={(e) => setLessonContentHtml(e.target.value)}
                      placeholder="<div class='standard-lesson-container'>...</div>"
                      rows={10}
                      className="w-full p-3 rounded-xl bg-[#141414] border border-[#2D2D2D] text-emerald-300 font-mono text-xs focus:outline-none focus:border-emerald-500 leading-relaxed resize-y"
                    />
                    <p className="text-[10px] text-zinc-400 flex items-center justify-between">
                      <span>Supports 13 standardized lesson sections with responsive styling & syntax highlights.</span>
                      <span>Characters: {lessonContentHtml.length}</span>
                    </p>
                  </div>
                )}

                {/* TAB 2: VISUAL DIAGRAM BUILDER */}
                {lessonEditorTab === 'diagram' && (
                  <div className="space-y-4 p-4 rounded-xl bg-[#1A1A1A] border border-[#262626]">
                    <div className="flex items-center justify-between border-b border-[#262626] pb-2.5">
                      <span className="font-semibold text-zinc-200 flex items-center gap-1.5">
                        <Workflow className="w-4 h-4 text-emerald-400" />
                        <span>Visual Technical Diagram Builder</span>
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400 uppercase bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        Zero Paid API Dependency
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-zinc-400 font-medium mb-1">Diagram Type</label>
                        <select
                          value={diagramType}
                          onChange={(e) => setDiagramType(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-[#202020] border border-[#333] text-white focus:outline-none focus:border-emerald-500"
                        >
                          <option value="pipeline">Pipeline / Execution Flow</option>
                          <option value="architecture">System Architecture / Layered</option>
                          <option value="client-server">Client-Server Model</option>
                          <option value="sequence">Sequence Flow</option>
                          <option value="mermaid">Mermaid.js Code</option>
                          <option value="image">Uploaded PNG / JPG / SVG / WebP</option>
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-zinc-400 font-medium mb-1">Diagram Title</label>
                        <input
                          type="text"
                          value={diagramTitle}
                          onChange={(e) => setDiagramTitle(e.target.value)}
                          placeholder="e.g. Selenium WebDriver 4 Architecture"
                          className="w-full px-3 py-2 rounded-xl bg-[#202020] border border-[#333] text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-zinc-400 font-medium mb-1">Caption / Description</label>
                      <input
                        type="text"
                        value={diagramCaption}
                        onChange={(e) => setDiagramCaption(e.target.value)}
                        placeholder="e.g. Execution flow from Client Language Bindings to Browser Engine"
                        className="w-full px-3 py-2 rounded-xl bg-[#202020] border border-[#333] text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    {diagramType === 'mermaid' ? (
                      <div>
                        <label className="block text-zinc-400 font-medium mb-1">Mermaid Definition Code</label>
                        <textarea
                          value={diagramMermaid}
                          onChange={(e) => setDiagramMermaid(e.target.value)}
                          rows={5}
                          className="w-full p-3 rounded-xl bg-[#141414] border border-[#2D2D2D] text-emerald-400 font-mono text-xs focus:outline-none focus:border-emerald-500 leading-relaxed"
                          placeholder="graph TD&#10;  A[Client] --> B[Server]"
                        />
                      </div>
                    ) : diagramType === 'image' ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-zinc-400 font-medium mb-1">Image URL / Path</label>
                            <input
                              type="text"
                              value={diagramImageUrl}
                              onChange={(e) => setDiagramImageUrl(e.target.value)}
                              placeholder="/assets/diagrams/selenium-arch.svg"
                              className="w-full px-3 py-2 rounded-xl bg-[#202020] border border-[#333] text-white focus:outline-none focus:border-emerald-500 font-mono text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-zinc-400 font-medium mb-1">Alternative Text (Alt)</label>
                            <input
                              type="text"
                              value={diagramAltText}
                              onChange={(e) => setDiagramAltText(e.target.value)}
                              placeholder="Selenium W3C architecture diagram"
                              className="w-full px-3 py-2 rounded-xl bg-[#202020] border border-[#333] text-white focus:outline-none focus:border-emerald-500"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-zinc-400 font-medium mb-1">Source Attribution (Optional)</label>
                          <input
                            type="text"
                            value={diagramSourceAttr}
                            onChange={(e) => setDiagramSourceAttr(e.target.value)}
                            placeholder="e.g. Official Selenium Documentation (W3C standard)"
                            className="w-full px-3 py-2 rounded-xl bg-[#202020] border border-[#333] text-white focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl bg-[#141414] border border-[#262626] text-zinc-400 text-xs">
                        Will generate an interactive SVG/CSS-powered <strong>{diagramType}</strong> execution diagram with component breakdowns and step transitions.
                      </div>
                    )}

                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={handleInsertDiagram}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs transition-colors cursor-pointer shadow-md"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Insert Diagram into Lesson</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* TAB 3: DEDICATED WORD DOCUMENT UPLOAD ZONE */}
                {lessonEditorTab === 'docx' && (
                  <div className="space-y-1.5 p-4 rounded-xl bg-[#1A1A1A] border border-[#262626]">
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-semibold text-zinc-200 flex items-center gap-2">
                        <UploadCloud className="w-4 h-4 text-emerald-400" />
                        <span>Upload Word Document (.docx)</span>
                      </label>
                      <span className="text-[10px] text-zinc-400 font-mono">Preserves Original Format</span>
                    </div>

                    <DocxUploadDropzone
                      lessonId={editingLessonTarget?.lesson?.id}
                      currentDocumentPath={lessonDocPath}
                      onUploaded={(info: UploadedDocInfo) => {
                        setLessonDocPath(info.filePath);
                        if (info.contentHtml) {
                          setLessonContentHtml(info.contentHtml);
                        }
                        if (info.metadata?.estimated_reading_time_minutes) {
                          setLessonReadTime(info.metadata.estimated_reading_time_minutes);
                        }
                        notify(`Uploaded & processed "${info.originalFilename}" with format preservation.`);
                      }}
                      onClear={() => setLessonDocPath('')}
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-zinc-300">Estimated Reading Time</label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={lessonReadTime}
                    onChange={(e) => setLessonReadTime(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-[#202020] border border-[#333] text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-zinc-300">Initial Publish Status</label>
                  <select
                    value={lessonStatus}
                    onChange={(e) => setLessonStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-[#202020] border border-[#333] text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="draft">Draft (Recommended for initial upload)</option>
                    <option value="published">Publish Immediately</option>
                  </select>
                </div>
              </div>
            </div>

            {/* MODAL FOOTER */}
            <div className="px-6 py-4 border-t border-[#262626] flex items-center justify-between bg-[#191919] shrink-0">
              <button
                type="button"
                onClick={() =>
                  handleOpenPreviewModal(
                    {
                      title: lessonTitle || 'Untitled Lesson',
                      slug: lessonSlug,
                      summary: lessonSummary,
                      shortDescription: lessonSummary,
                      originalDocxPath: lessonDocPath,
                      status: lessonStatus,
                    },
                    activeCourse?.title || 'Course',
                    'Module'
                  )
                }
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#222222] hover:bg-[#2C2C2C] text-zinc-300 hover:text-white text-xs font-semibold border border-[#333] transition-colors cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview Lesson</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSaveLesson('draft')}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save as Draft</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveLesson('published')}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-md transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Publish Lesson</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4D. CONTENT PREVIEW MODAL (WEB & DOCUMENT MODES) */}
      <ContentPreviewModal
        isOpen={!!previewingLesson}
        onClose={() => setPreviewingLesson(null)}
        lesson={previewingLesson?.lesson || null}
        courseTitle={previewingLesson?.courseTitle}
        moduleTitle={previewingLesson?.moduleTitle}
        onPublish={
          previewingLesson?.lesson?.id
            ? () => {
                const target = previewingLesson.lesson as AcademyLesson;
                handleToggleLessonPublish(target);
              }
            : undefined
        }
        onSaveDraft={() => notify('Lesson saved in Draft mode.')}
      />

      {/* 4E. FULL-SCREEN VISUAL WYSIWYG LESSON EDITOR (WORD / GOOGLE DOCS STYLE) */}
      {showVisualEditor && activeVisualLesson && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md p-2 sm:p-6 overflow-hidden flex flex-col">
          <VisualLessonEditor
            courseTitle={activeVisualLesson.course.title}
            moduleTitle={activeVisualLesson.module.title}
            lessonTitle={activeVisualLesson.lesson.title}
            lessonId={activeVisualLesson.lesson.id}
            initialHtml={activeVisualLesson.lesson.contentHtml || ''}
            initialBlockData={activeVisualLesson.lesson.blockData}
            status={activeVisualLesson.lesson.status}
            courseContext={{
              description: activeVisualLesson.course.description,
              category: activeVisualLesson.course.categoryId,
            }}
            moduleContext={{
              description: activeVisualLesson.module.description,
              position: activeVisualLesson.module.sortOrder,
              relatedLessons: activeVisualLesson.module.lessons?.map((l: any) => l.title) || [],
            }}
            curriculumContext={{
              moduleHierarchy: [activeVisualLesson.course.title, activeVisualLesson.module.title, activeVisualLesson.lesson.title],
            }}
            onSaveDraft={handleVisualEditorSaveDraft}
            onPublish={handleVisualEditorPublish}
            onPreview={(html) =>
              setPreviewingLesson({
                lesson: {
                  ...activeVisualLesson.lesson,
                  contentHtml: html,
                },
                courseTitle: activeVisualLesson.course.title,
                moduleTitle: activeVisualLesson.module.title,
              })
            }
            onCancel={() => {
              setShowVisualEditor(false);
              setActiveVisualLesson(null);
            }}
          />
        </div>
      )}
    </div>
  );
}
