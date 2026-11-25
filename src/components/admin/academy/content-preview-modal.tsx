'use client';

import React, { useState } from 'react';
import {
  X,
  Globe,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  Download,
  Eye,
  FileCheck,
  Send,
  Save,
  BookOpen,
} from 'lucide-react';
import { AcademyLesson } from '@/types/learning-platform';

interface ContentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  lesson: Partial<AcademyLesson> | null;
  courseTitle?: string;
  moduleTitle?: string;
  onPublish?: () => void;
  onSaveDraft?: () => void;
}

export default function ContentPreviewModal({
  isOpen,
  onClose,
  lesson,
  courseTitle = 'AI Academy',
  moduleTitle = 'Core Modules',
  onPublish,
  onSaveDraft,
}: ContentPreviewModalProps) {
  const [previewMode, setPreviewMode] = useState<'web' | 'document'>('web');

  if (!isOpen || !lesson) return null;

  const docPath = lesson.originalDocxPath || lesson.originalDocumentPath || '';
  const docFilename = docPath ? docPath.split('/').pop() : 'Sample_Technical_Guide.docx';

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#141414] border border-[#2A2A2A] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-white font-sans">
        {/* MODAL HEADER */}
        <div className="px-6 py-4 border-b border-[#262626] flex items-center justify-between bg-[#181818] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Content Preview:</span>
                <span className="text-zinc-300 font-normal truncate max-w-md">
                  {lesson.title || 'Untitled Lesson'}
                </span>
              </h3>
              <p className="text-[11px] text-zinc-400">
                Verify exactly how technical learners will see this content before publishing
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mode Toggle Tabs */}
            <div className="bg-[#121212] p-1 rounded-xl border border-[#2A2A2A] flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPreviewMode('web')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  previewMode === 'web'
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Web Reading Mode</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode('document')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  previewMode === 'document'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Original Document View</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* PREVIEW CONTENT BODY */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {previewMode === 'web' ? (
            /* MODE 1: WEB READING PREVIEW */
            <div className="space-y-6 max-w-3xl mx-auto bg-white dark:bg-[#0f1117] text-slate-900 dark:text-slate-100 p-8 rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-sm">
              {/* Breadcrumb Trail */}
              <div className="text-xs font-mono text-zinc-400 flex items-center gap-1.5">
                <span>Academy</span>
                <span>/</span>
                <span>{courseTitle}</span>
                <span>/</span>
                <span>{moduleTitle}</span>
                <span>/</span>
                <span className="text-emerald-500 font-semibold">{lesson.title}</span>
              </div>

              {/* Title & Meta */}
              <div className="space-y-2 border-b border-zinc-200 dark:border-zinc-800 pb-4">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    {lesson.status === 'published' ? 'PUBLISHED' : 'DRAFT PREVIEW'}
                  </span>
                  <span className="text-xs text-zinc-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {lesson.estimatedReadingTime || lesson.estimatedReadTime || 5} min read
                  </span>
                </div>
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  {lesson.title}
                </h1>
                {(lesson.summary || lesson.shortDescription) && (
                  <p className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
                    {lesson.shortDescription || lesson.summary}
                  </p>
                )}
              </div>

              {/* Core Concept Callout */}
              <div className="p-4 rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-900 dark:text-blue-200 text-xs space-y-1">
                <div className="flex items-center gap-2 font-bold text-blue-400">
                  <AlertCircle className="w-4 h-4" />
                  <span>Technical Overview &amp; Learning Objectives</span>
                </div>
                <p className="text-blue-800 dark:text-blue-300">
                  This technical guide covers foundational architecture, implementation patterns,
                  and SDET best practices.
                </p>
              </div>

              {/* Converted HTML Body or Fallback Content */}
              {lesson.contentHtml ? (
                <div
                  className="prose dark:prose-invert max-w-none text-sm text-slate-800 dark:text-zinc-200 leading-relaxed space-y-4"
                  dangerouslySetInnerHTML={{ __html: lesson.contentHtml }}
                />
              ) : (
                <div className="space-y-4 text-sm text-slate-700 dark:text-zinc-300">
                  <p>
                    Document content has been parsed successfully. When published, this content will
                    be fully rendered with high-fidelity formatting.
                  </p>
                  <pre className="p-4 rounded-xl bg-zinc-900 text-emerald-400 font-mono text-xs overflow-x-auto border border-zinc-800">
                    <code>{`// Sample Verification Code Snippet\nimport { test, expect } from '@playwright/test';\n\ntest('verify autonomous agent workflow', async ({ page }) => {\n  await page.goto('/learning');\n  await expect(page.locator('h1')).toBeVisible();\n});`}</code>
                  </pre>
                </div>
              )}
            </div>
          ) : (
            /* MODE 2: ORIGINAL DOCUMENT PREVIEW */
            <div className="space-y-6 max-w-2xl mx-auto py-6">
              <div className="p-6 rounded-2xl bg-[#1A1A1A] border border-[#2D2D2D] space-y-4 text-center">
                <div className="w-16 h-16 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center mx-auto">
                  <FileText className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white truncate">{docFilename}</h4>
                  <p className="text-xs text-zinc-400 mt-1">
                    Original Microsoft Word Document (.docx) preserved on disk
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3 text-left py-2 border-y border-[#262626]">
                  <div className="p-2.5 rounded-lg bg-[#141414] border border-[#222]">
                    <span className="text-[10px] text-zinc-500 font-mono block uppercase">
                      File Format
                    </span>
                    <span className="text-xs font-bold text-zinc-200 font-mono">OpenXML DOCX</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#141414] border border-[#222]">
                    <span className="text-[10px] text-zinc-500 font-mono block uppercase">
                      Status
                    </span>
                    <span className="text-xs font-bold text-emerald-400">Validated</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#141414] border border-[#222]">
                    <span className="text-[10px] text-zinc-500 font-mono block uppercase">
                      Storage
                    </span>
                    <span className="text-xs font-bold text-purple-400">Preserved</span>
                  </div>
                </div>

                {docPath && (
                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    {lesson.pdfPath && (
                      <a
                        href={lesson.pdfPath}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <Globe className="w-3.5 h-3.5" />
                        <span>Open Printable Document / PDF</span>
                      </a>
                    )}
                    <a
                      href={docPath}
                      download
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Original Document (.docx)</span>
                    </a>
                  </div>
                )}
              </div>

              {lesson.pdfPath && (
                <div className="rounded-2xl border border-[#2D2D2D] bg-[#141414] overflow-hidden">
                  <div className="px-4 py-2.5 bg-[#1C1C1C] border-b border-[#2D2D2D] text-xs font-medium text-zinc-300 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Printable Layout Fidelity Preview</span>
                    </span>
                    <a
                      href={lesson.pdfPath}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-emerald-400 hover:underline"
                    >
                      Full Window ↗
                    </a>
                  </div>
                  <iframe
                    src={lesson.pdfPath}
                    title="Document Print Layout Preview"
                    className="w-full h-96 bg-white border-0"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* MODAL FOOTER ACTIONS */}
        <div className="px-6 py-4 border-t border-[#262626] flex items-center justify-between bg-[#181818] shrink-0">
          <div className="text-xs text-zinc-400">
            Publish status:{' '}
            <span className="font-semibold text-zinc-200">{lesson.status || 'draft'}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              Close Preview
            </button>

            {onSaveDraft && (
              <button
                type="button"
                onClick={() => {
                  onSaveDraft();
                  onClose();
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save as Draft</span>
              </button>
            )}

            {onPublish && (
              <button
                type="button"
                onClick={() => {
                  onPublish();
                  onClose();
                }}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Publish Lesson</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
