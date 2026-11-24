'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';

import EditorToolbar from './editor-toolbar';
import ImageUploadModal from './image-upload-modal';
import DiagramStudioModal from '@/components/diagram/diagram-studio-modal';
import AiChatPanel from './ai-chat-panel';
import ContentComparisonModal from './content-comparison-modal';
import AiTechnicalReviewModal from '@/components/admin/academy/ai-technical-review-modal';
import { sharedTiptapExtensions } from './tiptap-schema';
import { renderTiptapJsonToHtml } from './tiptap-renderer';
import { LessonContextPackage } from '@/lib/ai/types';
import ThemeToggle from '@/components/layout/theme-toggle';

import {
  Save,
  Send,
  Eye,
  RotateCcw,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Code,
  Layout,
  ChevronRight,
  BookOpen,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

export interface VisualLessonEditorProps {
  courseTitle: string;
  moduleTitle: string;
  lessonTitle: string;
  lessonId: string;
  initialHtml: string;
  initialBlockData?: any;
  status: 'draft' | 'published' | 'archived';
  onSaveDraft: (contentHtml: string, blockData?: any) => Promise<boolean>;
  onPublish: (contentHtml: string, blockData?: any) => Promise<boolean>;
  onPreview: (contentHtml: string) => void;
  onCancel: () => void;
  courseContext?: {
    description?: string;
    objectives?: string[];
    category?: string;
  };
  moduleContext?: {
    description?: string;
    position?: number;
    relatedLessons?: string[];
  };
  curriculumContext?: {
    previousLessonTitle?: string;
    nextLessonTitle?: string;
    moduleHierarchy?: string[];
  };
}

export default function VisualLessonEditor({
  courseTitle,
  moduleTitle,
  lessonTitle,
  lessonId,
  initialHtml,
  initialBlockData,
  status,
  onSaveDraft,
  onPublish,
  onPreview,
  onCancel,
  courseContext,
  moduleContext,
  curriculumContext,
}: VisualLessonEditorProps) {
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved' | 'error' | 'publish-error'>('saved');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [lastSavedTime, setLastSavedTime] = useState<string>('Just now');
  const [showImageModal, setShowImageModal] = useState<boolean>(false);
  const [showDiagramStudio, setShowDiagramStudio] = useState<boolean>(false);
  const [diagramStudioPrompt, setDiagramStudioPrompt] = useState<string>('');
  const [showAiAssistant, setShowAiAssistant] = useState<boolean>(false);
  const [showReviewModal, setShowReviewModal] = useState<boolean>(false);
  const [showCompareModal, setShowCompareModal] = useState<boolean>(false);
  const [compareEnhancedHtml, setCompareEnhancedHtml] = useState<string>('');
  const [mode, setMode] = useState<'visual' | 'code'>('visual');
  const [rawHtml, setRawHtml] = useState<string>(initialHtml || '');

  // Split-pane resizing & maximize/minimize controls for Enhance with AI
  const [aiPanelWidth, setAiPanelWidth] = useState<number>(500);
  const [aiPanelState, setAiPanelState] = useState<'normal' | 'maximized' | 'minimized'>('normal');
  const [isDraggingResize, setIsDraggingResize] = useState<boolean>(false);

  // Restore user's preferred AI panel width from storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('intelligentqa_ai_panel_width');
        if (saved) {
          const parsed = parseInt(saved, 10);
          if (parsed >= 320 && parsed <= 1200) {
            setAiPanelWidth(parsed);
          }
        }
      } catch (e) {}
    }
  }, []);

  const handleStartResize = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingResize(true);
    const startX = e.clientX;
    const startWidth = aiPanelWidth;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const delta = startX - moveEvent.clientX;
      const newWidth = Math.max(340, Math.min(window.innerWidth - 360, startWidth + delta));
      setAiPanelWidth(newWidth);
      try {
        localStorage.setItem('intelligentqa_ai_panel_width', String(newWidth));
      } catch (err) {}
    };

    const onMouseUp = () => {
      setIsDraggingResize(false);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const handleToggleMaximizeAi = () => {
    setAiPanelState((prev) => (prev === 'maximized' ? 'normal' : 'maximized'));
  };

  const handleToggleMinimizeAi = () => {
    setAiPanelState((prev) => (prev === 'minimized' ? 'normal' : 'minimized'));
  };

  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialMount = useRef<boolean>(true);

  // Initialize Tiptap Editor with canonical shared schema
  const editor = useEditor({
    extensions: [
      ...sharedTiptapExtensions,
      Placeholder.configure({
        placeholder: 'Write your comprehensive technical lesson content here. Start typing or insert headings, code snippets, tables, and architecture diagrams...',
      }),
      CharacterCount,
    ],
    content: initialBlockData?.tiptapJson || initialHtml || '<p>Start writing your lesson content...</p>',
    editorProps: {
      attributes: {
        class:
          'tiptap-canvas prose dark:prose-invert max-w-none focus:outline-none min-h-[500px] p-6 sm:p-10 font-sans leading-relaxed text-slate-800 dark:text-[#E2E8F0] selection:bg-emerald-500/30',
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setRawHtml(html);
      setSaveStatus('unsaved');

      // Debounced Auto-Save (3.5 seconds)
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
      autoSaveTimerRef.current = setTimeout(() => {
        handleAutoSave();
      }, 3500);
    },
    immediatelyRender: false,
  });

  const handleAutoSave = useCallback(async () => {
    if (!editor) return;
    setSaveStatus('saving');
    try {
      const currentHtml = editor.getHTML();
      const currentJson = editor.getJSON();
      const success = await onSaveDraft(currentHtml, { tiptapJson: currentJson });
      if (success) {
        setSaveStatus('saved');
        setLastSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      } else {
        setSaveStatus('error');
      }
    } catch {
      setSaveStatus('error');
    }
  }, [editor, onSaveDraft]);

  // Clean timer on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, []);

  // Update rawHtml when editor changes or mode switches
  const handleSwitchToCode = () => {
    if (editor) {
      setRawHtml(editor.getHTML());
    }
    setMode('code');
  };

  const handleSwitchToVisual = () => {
    if (editor && rawHtml) {
      editor.commands.setContent(rawHtml);
    }
    setMode('visual');
  };

  const handleManualSaveDraft = async () => {
    const htmlToSave = mode === 'visual' && editor ? editor.getHTML() : rawHtml;
    const jsonToSave = editor ? editor.getJSON() : undefined;
    setSaveStatus('saving');
    const success = await onSaveDraft(htmlToSave, jsonToSave ? { tiptapJson: jsonToSave } : undefined);
    if (success) {
      setSaveStatus('saved');
      setLastSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } else {
      setSaveStatus('error');
    }
  };

  const handleManualPublish = async () => {
    const htmlToSave = mode === 'visual' && editor ? editor.getHTML() : rawHtml;
    const jsonToSave = editor ? editor.getJSON() : undefined;
    setSaveStatus('saving');
    try {
      const success = await onPublish(htmlToSave, jsonToSave ? { tiptapJson: jsonToSave } : undefined);
      if (success) {
        setSaveStatus('saved');
        setLastSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      } else {
        setSaveStatus('publish-error');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error publishing lesson');
      setSaveStatus('publish-error');
    }
  };

  const handleInsertImage = (options: {
    src: string;
    alt?: string;
    caption?: string;
    width?: string;
    alignment?: 'left' | 'center' | 'right';
  }) => {
    if (!editor) return;
    editor.chain().focus().setImage(options).run();
  };

  // AI Content Handlers
  const handleAiInsertContent = (contentHtml: string) => {
    if (!editor || !contentHtml) return;
    // Insert at current cursor position
    editor.chain().focus().insertContent(contentHtml).run();
    setSaveStatus('unsaved');
  };

  const handleAiReplaceContent = (contentHtml: string) => {
    if (!contentHtml) return;
    if (editor) {
      editor.commands.setContent(contentHtml);
    }
    setRawHtml(contentHtml);
    setSaveStatus('unsaved');
  };

  const handleAiReplaceSelected = (contentHtml: string) => {
    if (!editor || !contentHtml) return;
    // Replace current selection with content
    editor.chain().focus().insertContent(contentHtml).run();
    setSaveStatus('unsaved');
  };

  const handleOpenCompare = (enhancedHtml: string) => {
    setCompareEnhancedHtml(enhancedHtml);
    setShowCompareModal(true);
  };

  const handleAcceptCompare = (enhancedHtml: string) => {
    handleAiReplaceContent(enhancedHtml);
    setShowCompareModal(false);
  };

  // Construct Context Package for AI
  const currentContentForAi = mode === 'visual' && editor ? editor.getHTML() : rawHtml;
  const selectedTextForAi = editor && !editor.state.selection.empty
    ? editor.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to, ' ')
    : undefined;

  const lessonContextPackage: LessonContextPackage = {
    course: {
      name: courseTitle,
      description: courseContext?.description,
      objectives: courseContext?.objectives,
      category: courseContext?.category,
    },
    module: {
      name: moduleTitle,
      description: moduleContext?.description,
      position: moduleContext?.position,
      relatedLessons: moduleContext?.relatedLessons,
    },
    currentLesson: {
      id: lessonId,
      title: lessonTitle,
      contentHtml: currentContentForAi,
    },
    curriculum: curriculumContext,
  };

  return (
    <div className="flex flex-col h-full bg-slate-100/90 dark:bg-[#121215] border border-slate-200 dark:border-[#27272A] rounded-3xl overflow-hidden shadow-2xl transition-colors">
      {/* =================================================================== */}
      {/* A. EDITOR HEADER: BREADCRUMBS, STATUS, LAST SAVED, ACTIONS          */}
      {/* =================================================================== */}
      <header className="bg-white dark:bg-[#18181B] border-b border-slate-200 dark:border-[#27272A] px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 transition-colors">
        <div className="space-y-1">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400 flex-wrap">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" />
              <span>{courseTitle}</span>
            </span>
            <ChevronRight className="w-3 h-3 text-slate-400 dark:text-zinc-600" />
            <span className="text-slate-700 dark:text-zinc-300 font-medium">{moduleTitle}</span>
            <ChevronRight className="w-3 h-3 text-slate-400 dark:text-zinc-600" />
            <span className="text-slate-900 dark:text-white font-bold">{lessonTitle}</span>
          </div>

          <div className="flex items-center gap-3 pt-0.5">
            <span
              className={`text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                status === 'published'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
              }`}
            >
              {status}
            </span>

            {/* Auto-Save & Timestamp indicator */}
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-zinc-400 font-mono">
              {saveStatus === 'saving' && (
                <span className="flex items-center gap-1 text-cyan-500 dark:text-cyan-400">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  <span>Saving...</span>
                </span>
              )}
              {saveStatus === 'saved' && (
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Saved at {lastSavedTime}</span>
                </span>
              )}
              {saveStatus === 'unsaved' && (
                <span className="flex items-center gap-1 text-amber-500 dark:text-amber-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Unsaved changes</span>
                </span>
              )}
              {saveStatus === 'error' && (
                <span className="flex items-center gap-1 text-rose-500 dark:text-rose-400 font-semibold" title={errorMessage}>
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errorMessage || 'Error saving draft'}</span>
                </span>
              )}
              {saveStatus === 'publish-error' && (
                <span className="flex items-center gap-1 text-rose-500 dark:text-rose-400 font-semibold" title={errorMessage}>
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errorMessage || 'Error publishing lesson'}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Mode Switcher */}
          <div className="flex items-center bg-slate-100 dark:bg-[#121215] border border-slate-200 dark:border-[#27272A] rounded-xl p-0.5 text-xs mr-2">
            <button
              type="button"
              onClick={handleSwitchToVisual}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                mode === 'visual'
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Layout className="w-3.5 h-3.5" />
              <span>Visual Editor</span>
            </button>
            <button
              type="button"
              onClick={handleSwitchToCode}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                mode === 'code'
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>HTML Source</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => onPreview(mode === 'visual' && editor ? editor.getHTML() : rawHtml)}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#202025] dark:hover:bg-[#2A2A30] text-slate-700 dark:text-zinc-200 hover:text-slate-900 dark:hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200 dark:border-transparent"
            title="Preview student rendered view"
          >
            <Eye className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span>Preview</span>
          </button>

          {/* Prominent Header Review Content Button */}
          <button
            type="button"
            onClick={() => setShowReviewModal(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 dark:text-purple-300 hover:text-purple-900 dark:hover:text-white border border-purple-500/30"
            title="AI Technical Review & Content Audit"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>Review Content</span>
          </button>

          {/* Prominent Header Enhance with AI Button */}
          <button
            type="button"
            onClick={() => {
              if (showAiAssistant && aiPanelState === 'minimized') {
                setAiPanelState('normal');
              } else {
                setShowAiAssistant((prev) => !prev);
              }
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
              showAiAssistant && aiPanelState !== 'minimized'
                ? 'bg-purple-600 text-white shadow-purple-500/20'
                : 'bg-purple-600/10 hover:bg-purple-600/20 text-purple-700 dark:text-purple-300 hover:text-purple-900 dark:hover:text-white border border-purple-500/30'
            }`}
            title="Open AI Content Enhancement Assistant"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>Enhance with AI</span>
          </button>

          <button
            type="button"
            onClick={handleManualSaveDraft}
            disabled={saveStatus === 'saving'}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 dark:bg-[#1F2937] dark:hover:bg-[#374151] text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5 text-zinc-300" />
            <span>Save Draft</span>
          </button>

          <button
            type="button"
            onClick={handleManualPublish}
            disabled={saveStatus === 'saving'}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Publish Lesson</span>
          </button>

          {/* Theme Switcher Toggle (Normal Light / Dark Mode) */}
          <ThemeToggle showLabel={false} />

          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-white text-xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </header>

      {/* =================================================================== */}
      {/* B. FORMATTING TOOLBAR                                               */}
      {/* =================================================================== */}
      {mode === 'visual' && (
        <EditorToolbar
          editor={editor}
          onOpenImageModal={() => setShowImageModal(true)}
          onOpenAiAssistant={() => setShowAiAssistant((prev) => !prev)}
          onOpenDiagramStudio={() => {
            setDiagramStudioPrompt(lessonTitle || courseTitle || '');
            setShowDiagramStudio(true);
          }}
        />
      )}

      {/* =================================================================== */}
      {/* C. MAIN EDITING BODY: DUAL SPLIT (CANVAS + AI ASSISTANT PANEL)      */}
      {/* =================================================================== */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left / Main Editor Area */}
        <div
          className={`overflow-y-auto p-4 sm:p-8 bg-slate-100/70 dark:bg-[#09090B] flex justify-center transition-all ${
            showAiAssistant && aiPanelState === 'maximized'
              ? 'hidden'
              : 'flex-1 min-w-0'
          }`}
        >
          {mode === 'visual' ? (
            <div className="w-full max-w-4xl bg-white dark:bg-[#141417] border border-slate-200 dark:border-[#27272A] rounded-3xl shadow-xl min-h-[700px] flex flex-col transition-all">
              <EditorContent editor={editor} className="flex-1" />

              {/* Character & Word Count Footer */}
              {editor && (
                <div className="px-8 py-3 border-t border-slate-200 dark:border-[#27272A] text-slate-500 dark:text-zinc-500 font-mono text-[11px] flex items-center justify-between select-none">
                  <span>
                    {editor.storage.characterCount.words()} words • {editor.storage.characterCount.characters()} characters
                  </span>
                  <span className="text-slate-400 dark:text-zinc-600">Visual WYSIWYG Mode (Tiptap Engine)</span>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full max-w-4xl bg-white dark:bg-[#141417] border border-slate-200 dark:border-[#27272A] rounded-3xl p-6 flex flex-col space-y-3 shadow-md">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 pb-2 border-b border-slate-200 dark:border-[#27272A]">
                <span className="font-mono text-cyan-600 dark:text-cyan-400">Raw HTML Source Mode</span>
                <span>Changes sync automatically to visual editor when switching back</span>
              </div>
              <textarea
                value={rawHtml}
                onChange={(e) => {
                  setRawHtml(e.target.value);
                  setSaveStatus('unsaved');
                }}
                rows={25}
                className="w-full flex-1 p-4 rounded-xl bg-slate-50 dark:bg-[#09090B] border border-slate-200 dark:border-[#27272A] text-emerald-700 dark:text-emerald-400 font-mono text-xs focus:outline-none focus:border-purple-500 resize-y leading-relaxed"
              />
            </div>
          )}
        </div>

        {/* Resizable Divider Handle (only shown in normal split mode) */}
        {showAiAssistant && aiPanelState === 'normal' && (
          <div
            onMouseDown={handleStartResize}
            className={`w-2.5 hover:w-3 select-none relative z-10 flex items-center justify-center shrink-0 transition-colors cursor-col-resize group ${
              isDraggingResize
                ? 'bg-purple-600 shadow-md'
                : 'bg-slate-200 hover:bg-purple-500/50 dark:bg-[#202025] dark:hover:bg-purple-600/50'
            }`}
            title="Drag left/right to resize Editor and AI panel"
          >
            <div className="h-10 w-1 rounded-full bg-slate-400 dark:bg-zinc-600 group-hover:bg-white transition-colors" />
          </div>
        )}

        {/* Right / AI Content Assistant Panel */}
        {showAiAssistant && (
          <AiChatPanel
            isOpen={showAiAssistant}
            onClose={() => setShowAiAssistant(false)}
            context={lessonContextPackage}
            onInsertContent={handleAiInsertContent}
            onReplaceContent={handleAiReplaceContent}
            onReplaceSelected={handleAiReplaceSelected}
            onOpenCompare={handleOpenCompare}
            onOpenDiagramStudio={(p) => {
              setDiagramStudioPrompt(p || '');
              setShowDiagramStudio(true);
            }}
            selectedEditorText={selectedTextForAi}
            width={aiPanelWidth}
            panelState={aiPanelState}
            onToggleMaximize={handleToggleMaximizeAi}
            onToggleMinimize={handleToggleMinimizeAi}
          />
        )}
      </div>

      {/* Image Upload / Insert Modal */}
      <ImageUploadModal
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        onInsertImage={handleInsertImage}
      />

      {/* Diagram Studio Modal (Phase 11 Engine) */}
      {showDiagramStudio && (
        <DiagramStudioModal
          isOpen={showDiagramStudio}
          onClose={() => setShowDiagramStudio(false)}
          initialPrompt={diagramStudioPrompt}
          lessonContext={{
            courseTitle,
            moduleTitle,
            lessonTitle,
            currentContent: mode === 'visual' && editor ? editor.getHTML() : rawHtml,
            lessonId,
          }}
          onInsertDiagram={(diagramHtml) => {
            if (mode === 'visual' && editor) {
              editor.chain().focus().insertContent(diagramHtml).run();
              setRawHtml(editor.getHTML());
              setSaveStatus('unsaved');
            } else {
              setRawHtml((prev) => prev + '\n' + diagramHtml);
              setSaveStatus('unsaved');
            }
          }}
        />
      )}

      {/* AI Technical Review Modal */}
      {showReviewModal && (
        <AiTechnicalReviewModal
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          lessonId={lessonId}
          lessonTitle={lessonTitle}
          courseTitle={courseTitle}
          moduleTitle={moduleTitle}
          contentHtml={mode === 'visual' && editor ? editor.getHTML() : rawHtml}
          contextPackage={lessonContextPackage}
        />
      )}

      {/* Side-by-Side Diff Comparison Modal */}
      <ContentComparisonModal
        isOpen={showCompareModal}
        onClose={() => setShowCompareModal(false)}
        originalHtml={currentContentForAi}
        enhancedHtml={compareEnhancedHtml}
        onAccept={handleAcceptCompare}
        onKeepOriginal={() => setShowCompareModal(false)}
      />
    </div>
  );
}
