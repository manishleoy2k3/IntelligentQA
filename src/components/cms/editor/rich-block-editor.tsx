'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link as LinkIcon,
  Code as CodeIcon,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Pilcrow,
  List,
  ListOrdered,
  Quote,
  Table as TableIcon,
  Image as ImageIcon,
  AlertTriangle,
  Info,
  CheckCircle,
  HelpCircle,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Copy,
  Eye,
  Save,
  Clock,
  History,
  Sparkles,
  ExternalLink,
  UploadCloud,
  Check,
  ChevronDown,
  ChevronRight,
  Maximize2,
  Columns,
  Terminal,
  Video,
  Download,
  BookOpen,
} from 'lucide-react';
import { EditorBlock, EditorJSData, CMSRevision, CMSMediaItem } from '@/types/cms';
import MediaLibraryModal from '../media-library-modal';

interface RichBlockEditorProps {
  initialData: EditorJSData;
  onChange?: (data: EditorJSData) => void;
  onSave?: (data: EditorJSData) => Promise<void> | void;
  revisions?: CMSRevision[];
  onRestoreRevision?: (revisionId: string) => void;
  articleTitle?: string;
  isSaving?: boolean;
}

export default function RichBlockEditor({
  initialData,
  onChange,
  onSave,
  revisions = [],
  onRestoreRevision,
  articleTitle = 'Tutorial',
  isSaving = false,
}: RichBlockEditorProps) {
  const [blocks, setBlocks] = useState<EditorBlock[]>(
    initialData?.blocks?.length
      ? initialData.blocks
      : [
          {
            id: `blk-${Date.now()}`,
            type: 'paragraph',
            data: { text: '' },
          },
        ]
  );

  const [dirty, setDirty] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const [mediaTargetBlockId, setMediaTargetBlockId] = useState<string | null>(null);
  const [revisionsDrawerOpen, setRevisionsDrawerOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [copiedCodeIndex, setCopiedCodeIndex] = useState<string | null>(null);

  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync when initialData changes from outside (e.g. revision restore)
  useEffect(() => {
    if (initialData?.blocks && initialData.blocks.length > 0) {
      setBlocks(initialData.blocks);
      setDirty(false);
    }
  }, [initialData]);

  // Notify parent of changes
  const updateBlocks = useCallback(
    (newBlocks: EditorBlock[]) => {
      setBlocks(newBlocks);
      setDirty(true);
      if (onChange) {
        onChange({
          time: Date.now(),
          version: '2.28.0',
          blocks: newBlocks,
        });
      }
    },
    [onChange]
  );

  // Autosave setup (triggers after 12s of inactivity when dirty)
  useEffect(() => {
    if (dirty && onSave) {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = setTimeout(async () => {
        await onSave({
          time: Date.now(),
          version: '2.28.0',
          blocks,
        });
        setDirty(false);
        setLastSavedTime(new Date().toLocaleTimeString());
      }, 12000);
    }
    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [dirty, blocks, onSave]);

  // Warn before navigating away if dirty
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [dirty]);

  // Clipboard Paste Listener for Screenshots (Ctrl+V / Cmd+V)
  const handleGlobalPaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          const reader = new FileReader();
          reader.onloadend = async () => {
            const base64 = reader.result as string;
            try {
              const res = await fetch('/api/admin/media', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'x-admin-token': 'admin-session',
                },
                body: JSON.stringify({
                  base64,
                  alt: 'Pasted Screenshot',
                  category: 'Screenshots',
                }),
              });
              const data = await res.json();
              if (data.success && data.file) {
                // Insert new image block right after active block or at end
                const newImgBlock: EditorBlock = {
                  id: `blk-img-${Date.now()}`,
                  type: 'image',
                  data: {
                    file: { url: data.file.url },
                    caption: 'Figure: Pasted Screenshot',
                    alt: 'Pasted Screenshot',
                    alignment: 'center',
                    size: 'large',
                  },
                };
                insertBlockAfter(activeBlockId, newImgBlock);
              }
            } catch (err) {
              console.error('Failed to paste screenshot:', err);
            }
          };
          reader.readAsDataURL(file);
          break;
        }
      }
    }
  };

  // Block Manipulation Helpers
  const insertBlockAfter = (targetId: string | null, newBlock: EditorBlock) => {
    if (!targetId) {
      updateBlocks([...blocks, newBlock]);
      return;
    }
    const idx = blocks.findIndex((b) => b.id === targetId);
    if (idx === -1) {
      updateBlocks([...blocks, newBlock]);
    } else {
      const next = [...blocks];
      next.splice(idx + 1, 0, newBlock);
      updateBlocks(next);
    }
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === blocks.length - 1) return;
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const next = [...blocks];
    const [moved] = next.splice(index, 1);
    next.splice(targetIdx, 0, moved);
    updateBlocks(next);
  };

  const duplicateBlock = (index: number) => {
    const original = blocks[index];
    const cloned: EditorBlock = {
      ...JSON.parse(JSON.stringify(original)),
      id: `blk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    const next = [...blocks];
    next.splice(index + 1, 0, cloned);
    updateBlocks(next);
  };

  const removeBlock = (index: number) => {
    if (blocks.length <= 1) {
      updateBlocks([{ id: `blk-${Date.now()}`, type: 'paragraph', data: { text: '' } }]);
      return;
    }
    const next = blocks.filter((_, i) => i !== index);
    updateBlocks(next);
  };

  const updateBlockData = (id: string, partialData: any) => {
    const next = blocks.map((b) => {
      if (b.id === id) {
        return {
          ...b,
          data: {
            ...b.data,
            ...partialData,
          },
        } as EditorBlock;
      }
      return b;
    });
    updateBlocks(next);
  };

  const handleManualSave = async () => {
    if (onSave) {
      await onSave({
        time: Date.now(),
        version: '2.28.0',
        blocks,
      });
      setDirty(false);
      setLastSavedTime(new Date().toLocaleTimeString());
    }
  };

  return (
    <div
      className="flex flex-col h-full bg-[#0F0F11] border border-[#27272A] rounded-2xl overflow-hidden font-sans select-none text-[#F4F4F5]"
      onPaste={handleGlobalPaste}
    >
      {/* 1. Top Editor Navigation Bar */}
      <div className="px-5 py-3 border-b border-[#27272A] bg-[#141416] flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white">{articleTitle}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Editor.js Engine
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-[#A1A1AA]">
              {dirty ? (
                <span className="flex items-center gap-1 text-amber-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  Unsaved changes
                </span>
              ) : (
                <span className="flex items-center gap-1 text-emerald-400 font-medium">
                  <Check className="w-3 h-3 text-emerald-400" />
                  All changes saved {lastSavedTime ? `at ${lastSavedTime}` : ''}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Revisions Button */}
          <button
            type="button"
            onClick={() => setRevisionsDrawerOpen(!revisionsDrawerOpen)}
            className="px-3 py-1.5 rounded-lg border border-[#27272A] bg-[#1C1C20] hover:bg-[#27272A] text-xs text-[#D4D4D8] flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Revision History"
          >
            <History className="w-3.5 h-3.5 text-purple-400" />
            <span>Revisions ({revisions.length})</span>
          </button>

          {/* Media Library Button */}
          <button
            type="button"
            onClick={() => {
              setMediaTargetBlockId(null);
              setMediaModalOpen(true);
            }}
            className="px-3 py-1.5 rounded-lg border border-[#27272A] bg-[#1C1C20] hover:bg-[#27272A] text-xs text-[#D4D4D8] flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Open Media Library"
          >
            <ImageIcon className="w-3.5 h-3.5 text-sky-400" />
            <span>Media Library</span>
          </button>

          {/* Preview Toggle */}
          <button
            type="button"
            onClick={() => setPreviewMode(!previewMode)}
            className={`px-3 py-1.5 rounded-lg border text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
              previewMode
                ? 'bg-purple-600 border-purple-500 text-white'
                : 'border-[#27272A] bg-[#1C1C20] hover:bg-[#27272A] text-[#D4D4D8]'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{previewMode ? 'Edit Mode' : 'Preview Article'}</span>
          </button>

          {/* Save Button */}
          <button
            type="button"
            onClick={handleManualSave}
            disabled={isSaving}
            className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Saving...' : 'Save Now'}</span>
          </button>
        </div>
      </div>

      {/* 2. Block Formatting Insert Toolbar */}
      {!previewMode && (
        <div className="px-5 py-2.5 border-b border-[#27272A] bg-[#161619] flex flex-wrap items-center gap-1.5 shrink-0 overflow-x-auto text-xs">
          <span className="text-[11px] font-bold text-[#71717A] uppercase tracking-wider mr-1">
            Add Block:
          </span>

          {/* Heading Dropdown/Buttons */}
          <button
            type="button"
            onClick={() =>
              insertBlockAfter(activeBlockId, {
                id: `blk-${Date.now()}`,
                type: 'header',
                data: { text: 'Section Heading', level: 2 },
              })
            }
            className="px-2.5 py-1 rounded-md bg-[#222226] hover:bg-[#2E2E34] text-[#E4E4E7] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Heading2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>H2</span>
          </button>

          <button
            type="button"
            onClick={() =>
              insertBlockAfter(activeBlockId, {
                id: `blk-${Date.now()}`,
                type: 'header',
                data: { text: 'Sub-heading', level: 3 },
              })
            }
            className="px-2.5 py-1 rounded-md bg-[#222226] hover:bg-[#2E2E34] text-[#E4E4E7] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Heading3 className="w-3.5 h-3.5 text-teal-400" />
            <span>H3</span>
          </button>

          <button
            type="button"
            onClick={() =>
              insertBlockAfter(activeBlockId, {
                id: `blk-${Date.now()}`,
                type: 'paragraph',
                data: { text: '' },
              })
            }
            className="px-2.5 py-1 rounded-md bg-[#222226] hover:bg-[#2E2E34] text-[#E4E4E7] flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Pilcrow className="w-3.5 h-3.5 text-indigo-400" />
            <span>Text</span>
          </button>

          <div className="h-4 w-px bg-[#27272A] mx-1" />

          {/* Code & Terminal */}
          <button
            type="button"
            onClick={() =>
              insertBlockAfter(activeBlockId, {
                id: `blk-${Date.now()}`,
                type: 'code',
                data: {
                  code: '// Enter code snippet here\n',
                  language: 'java',
                  caption: 'Code Snippet',
                },
              })
            }
            className="px-2.5 py-1 rounded-md bg-[#222226] hover:bg-[#2E2E34] text-[#E4E4E7] flex items-center gap-1 cursor-pointer transition-colors"
          >
            <CodeIcon className="w-3.5 h-3.5 text-amber-400" />
            <span>Code</span>
          </button>

          <button
            type="button"
            onClick={() =>
              insertBlockAfter(activeBlockId, {
                id: `blk-${Date.now()}`,
                type: 'terminal',
                data: {
                  code: 'mvn test',
                  prompt: '$',
                  caption: 'Terminal Command',
                },
              })
            }
            className="px-2.5 py-1 rounded-md bg-[#222226] hover:bg-[#2E2E34] text-[#E4E4E7] flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Terminal className="w-3.5 h-3.5 text-sky-400" />
            <span>CLI</span>
          </button>

          {/* Media & Table */}
          <button
            type="button"
            onClick={() =>
              insertBlockAfter(activeBlockId, {
                id: `blk-img-${Date.now()}`,
                type: 'image',
                data: {
                  file: { url: '/images/selenium-architecture.svg' },
                  caption: 'Figure: Architecture & Technical Flow',
                  alt: 'Technical Diagram',
                  alignment: 'center',
                  size: 'large',
                },
              })
            }
            className="px-2.5 py-1 rounded-md bg-[#222226] hover:bg-[#2E2E34] text-[#E4E4E7] flex items-center gap-1 cursor-pointer transition-colors"
            title="Insert Image / Diagram Block"
          >
            <ImageIcon className="w-3.5 h-3.5 text-pink-400" />
            <span>Image</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMediaTargetBlockId(null);
              setMediaModalOpen(true);
            }}
            className="px-2.5 py-1 rounded-md bg-[#222226] hover:bg-[#2E2E34] text-sky-300 flex items-center gap-1 cursor-pointer transition-colors"
            title="Insert image from Media Library"
          >
            <UploadCloud className="w-3.5 h-3.5 text-sky-400" />
            <span>Library</span>
          </button>

          <button
            type="button"
            onClick={() =>
              insertBlockAfter(activeBlockId, {
                id: `blk-${Date.now()}`,
                type: 'table',
                data: {
                  withHeadings: true,
                  content: [
                    ['Header 1', 'Header 2', 'Header 3'],
                    ['Data A', 'Data B', 'Data C'],
                    ['Data X', 'Data Y', 'Data Z'],
                  ],
                },
              })
            }
            className="px-2.5 py-1 rounded-md bg-[#222226] hover:bg-[#2E2E34] text-[#E4E4E7] flex items-center gap-1 cursor-pointer transition-colors"
          >
            <TableIcon className="w-3.5 h-3.5 text-cyan-400" />
            <span>Table</span>
          </button>

          <div className="h-4 w-px bg-[#27272A] mx-1" />

          {/* Callouts & Step Guides */}
          <button
            type="button"
            onClick={() =>
              insertBlockAfter(activeBlockId, {
                id: `blk-${Date.now()}`,
                type: 'callout',
                data: {
                  type: 'info',
                  title: 'Pro Tip',
                  message: 'Enter helpful advice or context for the reader here.',
                },
              })
            }
            className="px-2.5 py-1 rounded-md bg-[#222226] hover:bg-[#2E2E34] text-[#E4E4E7] flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Info className="w-3.5 h-3.5 text-sky-400" />
            <span>Callout</span>
          </button>

          <button
            type="button"
            onClick={() =>
              insertBlockAfter(activeBlockId, {
                id: `blk-${Date.now()}`,
                type: 'stepByStep',
                data: {
                  title: 'Step-by-Step Instructions',
                  steps: [
                    {
                      stepNumber: 1,
                      title: 'Initial Setup',
                      explanation: 'Describe step 1 instructions.',
                    },
                    {
                      stepNumber: 2,
                      title: 'Execution & Verification',
                      explanation: 'Describe step 2 instructions.',
                    },
                  ],
                },
              })
            }
            className="px-2.5 py-1 rounded-md bg-[#222226] hover:bg-[#2E2E34] text-[#E4E4E7] flex items-center gap-1 cursor-pointer transition-colors"
          >
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Steps</span>
          </button>

          <button
            type="button"
            onClick={() =>
              insertBlockAfter(activeBlockId, {
                id: `blk-${Date.now()}`,
                type: 'faq',
                data: {
                  title: 'Frequently Asked Questions',
                  items: [
                    {
                      question: 'How do I resolve NoSuchElementException?',
                      answer:
                        'Use explicit wait (WebDriverWait) with ExpectedConditions.visibilityOfElementLocated.',
                    },
                  ],
                },
              })
            }
            className="px-2.5 py-1 rounded-md bg-[#222226] hover:bg-[#2E2E34] text-[#E4E4E7] flex items-center gap-1 cursor-pointer transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
            <span>FAQ</span>
          </button>

          <button
            type="button"
            onClick={() =>
              insertBlockAfter(activeBlockId, {
                id: `blk-${Date.now()}`,
                type: 'comparisonTable',
                data: {
                  title: 'Feature Comparison',
                  columns: ['Feature', 'Selenium', 'Playwright'],
                  rows: [
                    {
                      feature: 'Auto-Wait',
                      values: ['Manual WebDriverWait', 'Built-in auto-waiting'],
                    },
                    {
                      feature: 'CDP Support',
                      values: ['Selenium 4 only', 'Native bi-directional'],
                    },
                  ],
                },
              })
            }
            className="px-2.5 py-1 rounded-md bg-[#222226] hover:bg-[#2E2E34] text-[#E4E4E7] flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Columns className="w-3.5 h-3.5 text-rose-400" />
            <span>Compare</span>
          </button>
        </div>
      )}

      {/* 3. Editor Body & Live Preview */}
      <div className="flex-1 overflow-y-auto p-6 flex justify-center">
        {previewMode ? (
          /* Real-time Preview Mode */
          <div className="w-full max-w-4xl space-y-6 select-text">
            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300 flex items-center justify-between">
              <span>Previewing article rendering as seen by public learners</span>
              <button
                type="button"
                onClick={() => setPreviewMode(false)}
                className="underline hover:text-white"
              >
                Back to Edit
              </button>
            </div>
            <div className="prose prose-invert max-w-none space-y-6">
              {blocks.map((block) => (
                <PreviewBlockItem key={block.id} block={block} />
              ))}
            </div>
          </div>
        ) : (
          /* Interactive Block Editing Surface */
          <div className="w-full max-w-4xl space-y-4">
            {blocks.map((block, idx) => (
              <div
                key={block.id}
                onClick={() => setActiveBlockId(block.id)}
                className={`group relative rounded-xl border transition-all ${
                  activeBlockId === block.id
                    ? 'border-purple-500/60 bg-[#141417] shadow-lg ring-1 ring-purple-500/20'
                    : 'border-[#27272A]/70 bg-[#121215] hover:border-[#3F3F46]'
                } p-4`}
              >
                {/* Block Controls Header */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#27272A]/40 text-xs text-[#71717A]">
                  <span className="font-mono text-[10px] uppercase font-bold text-purple-400">
                    {block.type} Block
                  </span>

                  <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        moveBlock(idx, 'up');
                      }}
                      disabled={idx === 0}
                      className="p-1 rounded hover:bg-[#27272A] hover:text-white disabled:opacity-30 cursor-pointer"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        moveBlock(idx, 'down');
                      }}
                      disabled={idx === blocks.length - 1}
                      className="p-1 rounded hover:bg-[#27272A] hover:text-white disabled:opacity-30 cursor-pointer"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        duplicateBlock(idx);
                      }}
                      className="p-1 rounded hover:bg-[#27272A] hover:text-white cursor-pointer"
                      title="Duplicate Block"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeBlock(idx);
                      }}
                      className="p-1 rounded hover:bg-rose-500/20 text-rose-400 cursor-pointer"
                      title="Delete Block"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Block Type Editor Form */}
                <BlockEditorDispatcher
                  block={block}
                  onChange={(partial) => updateBlockData(block.id, partial)}
                  onOpenMediaModal={() => {
                    setMediaTargetBlockId(block.id);
                    setMediaModalOpen(true);
                  }}
                />
              </div>
            ))}

            {/* Bottom Add Block Bar */}
            <div className="py-6 flex items-center justify-center">
              <button
                type="button"
                onClick={() =>
                  insertBlockAfter(null, {
                    id: `blk-${Date.now()}`,
                    type: 'paragraph',
                    data: { text: '' },
                  })
                }
                className="px-4 py-2 rounded-xl border border-dashed border-[#27272A] hover:border-purple-500/60 bg-[#141416]/50 hover:bg-purple-500/10 text-xs font-semibold text-[#A1A1AA] hover:text-purple-300 flex items-center gap-2 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 text-purple-400" />
                <span>Add New Content Paragraph</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 4. Revision History Drawer */}
      {revisionsDrawerOpen && (
        <div className="fixed inset-y-0 right-0 z-50 w-96 bg-[#18181B] border-l border-[#27272A] shadow-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#27272A]">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-purple-400" />
                <h3 className="text-sm font-bold text-white">Revision History</h3>
              </div>
              <button
                type="button"
                onClick={() => setRevisionsDrawerOpen(false)}
                className="p-1 text-[#71717A] hover:text-white"
              >
                &times;
              </button>
            </div>

            <div className="mt-4 space-y-3 overflow-y-auto max-h-[70vh]">
              {revisions.length === 0 ? (
                <p className="text-xs text-[#71717A] py-8 text-center">
                  No prior revisions saved yet.
                </p>
              ) : (
                revisions.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-3.5 rounded-xl border border-[#27272A] bg-[#121215] space-y-2 hover:border-[#3F3F46]"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{rev.title}</span>
                      <span className="text-[10px] font-mono text-[#71717A]">
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#A1A1AA]">{rev.summary}</p>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-purple-400">By {rev.createdBy}</span>
                      {onRestoreRevision && (
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm('Restore this revision snapshot?')) {
                              onRestoreRevision(rev.id);
                              setRevisionsDrawerOpen(false);
                            }
                          }}
                          className="px-2.5 py-1 rounded bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white text-[10px] font-bold transition-colors cursor-pointer"
                        >
                          Restore Snapshot
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setRevisionsDrawerOpen(false)}
            className="w-full py-2 rounded-xl bg-[#27272A] hover:bg-[#323238] text-xs font-semibold text-white"
          >
            Close Revisions
          </button>
        </div>
      )}

      {/* Media Library Modal */}
      <MediaLibraryModal
        isOpen={mediaModalOpen}
        onClose={() => setMediaModalOpen(false)}
        onSelectImage={(media) => {
          if (mediaTargetBlockId) {
            updateBlockData(mediaTargetBlockId, {
              file: { url: media.url },
              alt: media.alt,
              caption: media.caption || media.alt,
            });
          } else {
            insertBlockAfter(activeBlockId, {
              id: `blk-img-${Date.now()}`,
              type: 'image',
              data: {
                file: { url: media.url },
                caption: media.caption || media.alt,
                alt: media.alt,
                alignment: 'center',
                size: 'large',
              },
            });
          }
        }}
      />
    </div>
  );
}

// ----------------------------------------------------
// Dispatcher for Editing Each Block Type
// ----------------------------------------------------
function BlockEditorDispatcher({
  block,
  onChange,
  onOpenMediaModal,
}: {
  block: EditorBlock;
  onChange: (partial: any) => void;
  onOpenMediaModal: () => void;
}) {
  switch (block.type) {
    case 'header':
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <select
              value={block.data.level}
              onChange={(e) => onChange({ level: Number(e.target.value) })}
              className="px-2 py-1 bg-[#1A1A1E] border border-[#27272A] rounded text-xs text-emerald-400 font-bold focus:outline-none"
            >
              <option value={1}>H1 Heading</option>
              <option value={2}>H2 Major Section</option>
              <option value={3}>H3 Sub-section</option>
              <option value={4}>H4 Minor</option>
            </select>
            <input
              type="text"
              value={block.data.anchor || ''}
              onChange={(e) => onChange({ anchor: e.target.value })}
              placeholder="Anchor ID (e.g. setup-webdriver)"
              className="flex-1 px-2.5 py-1 bg-[#1A1A1E] border border-[#27272A] rounded text-xs font-mono text-[#A1A1AA] focus:outline-none focus:border-purple-500"
            />
          </div>
          <input
            type="text"
            value={block.data.text}
            onChange={(e) => onChange({ text: e.target.value })}
            placeholder="Type section heading..."
            className="w-full px-3 py-2 bg-[#1A1A1E] border border-[#27272A] rounded-lg text-base font-bold text-white focus:outline-none focus:border-purple-500"
          />
        </div>
      );

    case 'paragraph':
      return (
        <div className="space-y-1">
          <textarea
            rows={3}
            value={block.data.text}
            onChange={(e) => onChange({ text: e.target.value })}
            placeholder="Write paragraph content... Supports HTML like <strong>, <em>, <code>, <a href='...'>"
            className="w-full p-3 bg-[#1A1A1E] border border-[#27272A] rounded-lg text-sm text-[#E4E4E7] leading-relaxed focus:outline-none focus:border-purple-500 font-sans"
          />
        </div>
      );

    case 'code':
      return (
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#71717A]">Language:</span>
              <select
                value={block.data.language || 'java'}
                onChange={(e) => onChange({ language: e.target.value })}
                className="px-2.5 py-1 bg-[#1A1A1E] border border-[#27272A] rounded text-xs text-amber-400 font-mono font-bold focus:outline-none"
              >
                <option value="java">Java</option>
                <option value="typescript">TypeScript</option>
                <option value="python">Python</option>
                <option value="bash">Bash / Shell</option>
                <option value="xml">XML / POM</option>
                <option value="json">JSON</option>
                <option value="sql">SQL</option>
                <option value="html">HTML</option>
                <option value="css">CSS</option>
              </select>
            </div>
            <input
              type="text"
              value={block.data.caption || ''}
              onChange={(e) => onChange({ caption: e.target.value })}
              placeholder="Code caption / filename (e.g. WebDriverTest.java)"
              className="flex-1 px-2.5 py-1 bg-[#1A1A1E] border border-[#27272A] rounded text-xs text-white focus:outline-none focus:border-purple-500"
            />
          </div>
          <textarea
            rows={8}
            value={block.data.code}
            onChange={(e) => onChange({ code: e.target.value })}
            placeholder="// Paste Java / TypeScript code here..."
            className="w-full p-3 bg-[#0A0A0C] border border-[#27272A] rounded-lg text-xs font-mono text-emerald-300 leading-relaxed focus:outline-none focus:border-purple-500"
          />
        </div>
      );

    case 'terminal':
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={block.data.prompt || '$'}
              onChange={(e) => onChange({ prompt: e.target.value })}
              className="w-12 px-2 py-1 bg-[#1A1A1E] border border-[#27272A] rounded text-xs font-mono text-sky-400 text-center"
            />
            <input
              type="text"
              value={block.data.caption || ''}
              onChange={(e) => onChange({ caption: e.target.value })}
              placeholder="Terminal caption (e.g. Maven CLI Execution)"
              className="flex-1 px-2.5 py-1 bg-[#1A1A1E] border border-[#27272A] rounded text-xs text-white"
            />
          </div>
          <input
            type="text"
            value={block.data.code}
            onChange={(e) => onChange({ code: e.target.value })}
            placeholder="mvn test -Dtest=SeleniumTest"
            className="w-full px-3 py-2 bg-[#09090B] border border-[#27272A] rounded-lg text-xs font-mono text-white focus:outline-none focus:border-purple-500"
          />
        </div>
      );

    case 'image': {
      const imgUrl = block.data.file?.url || (block.data as any).url || '';
      return (
        <div className="space-y-3 p-4 rounded-xl border border-[#27272A] bg-[#0E0F14]">
          {/* Top Actions: Direct File Upload, Media Library, Preset SVG Diagrams */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#27272A]/60">
            <div className="flex items-center gap-2">
              <label className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm">
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Upload from Computer</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const formData = new FormData();
                    formData.append('file', file);
                    formData.append('alt', file.name.replace(/\.[^/.]+$/, ''));
                    formData.append('category', 'Tutorials');
                    try {
                      const res = await fetch('/api/admin/media', {
                        method: 'POST',
                        headers: { 'x-admin-token': 'admin-session' },
                        body: formData,
                      });
                      const data = await res.json();
                      if (data.success && data.item) {
                        onChange({
                          file: { url: data.item.url },
                          caption: block.data.caption || data.item.alt,
                          alt: data.item.alt,
                        });
                      }
                    } catch (err) {
                      console.error('Direct block upload failed', err);
                    }
                  }}
                />
              </label>

              <button
                type="button"
                onClick={onOpenMediaModal}
                className="px-3 py-1.5 rounded-lg bg-[#1E1E24] hover:bg-[#2A2A32] border border-[#2B2B36] text-white text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <ImageIcon className="w-3.5 h-3.5 text-sky-400" />
                <span>Media Library</span>
              </button>

              {imgUrl && (
                <button
                  type="button"
                  onClick={() => onChange({ file: { url: '' } })}
                  className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Clear Image
                </button>
              )}
            </div>

            {/* Instant QA Diagram Presets */}
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-[#71717A] uppercase font-bold mr-1">Presets:</span>
              <button
                type="button"
                onClick={() =>
                  onChange({
                    file: { url: '/images/selenium-architecture.svg' },
                    caption:
                      'Figure 1.1: 4-Tier Selenium WebDriver 4 Architecture & W3C Standard Protocol Flow',
                    alt: 'Selenium 4 Architecture Diagram',
                  })
                }
                className="px-2 py-0.5 rounded bg-[#1A1A22] hover:bg-purple-600/20 text-[10px] font-mono text-purple-300 border border-[#2B2B3A] cursor-pointer"
                title="Insert 4-Tier Selenium Architecture Diagram"
              >
                + Architecture
              </button>
              <button
                type="button"
                onClick={() =>
                  onChange({
                    file: { url: '/images/locators-dom-inspector.svg' },
                    caption: 'Figure 1.2: Chrome DevTools DOM Elements & Priority Locators',
                    alt: 'DOM Locators Inspector Screenshot',
                  })
                }
                className="px-2 py-0.5 rounded bg-[#1A1A22] hover:bg-teal-600/20 text-[10px] font-mono text-teal-300 border border-[#2B2B3A] cursor-pointer"
                title="Insert DOM Locator Inspector Diagram"
              >
                + Locators
              </button>
              <button
                type="button"
                onClick={() =>
                  onChange({
                    file: { url: '/images/test-execution-report.svg' },
                    caption: 'Figure 1.3: Real-Time TestNG & Allure Test Execution Dashboard',
                    alt: 'TestNG Execution Metrics Report',
                  })
                }
                className="px-2 py-0.5 rounded bg-[#1A1A22] hover:bg-amber-600/20 text-[10px] font-mono text-amber-300 border border-[#2B2B3A] cursor-pointer"
                title="Insert TestNG Execution Report Diagram"
              >
                + Report
              </button>
            </div>
          </div>

          {/* Image URL Manual Input */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#71717A] shrink-0">Image URL:</span>
            <input
              type="text"
              value={imgUrl}
              onChange={(e) => onChange({ file: { url: e.target.value } })}
              placeholder="Paste public URL (https://... or /images/...) or use upload button above"
              className="flex-1 px-3 py-1.5 bg-[#141418] border border-[#27272A] rounded-lg text-xs font-mono text-emerald-400 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Visual Image Preview */}
          {imgUrl ? (
            <div className="relative rounded-xl overflow-hidden border border-[#27272A] bg-[#070709] p-2 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imgUrl}
                alt={block.data.alt || 'Tutorial screenshot'}
                className="max-h-72 w-auto object-contain rounded-lg mx-auto"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          ) : (
            <div className="py-8 border border-dashed border-[#27272A] rounded-xl bg-[#121216] text-center space-y-1">
              <ImageIcon className="w-8 h-8 text-[#52525B] mx-auto" />
              <p className="text-xs text-[#A1A1AA] font-semibold">
                No image selected for this block
              </p>
              <p className="text-[11px] text-[#71717A]">
                Click "Upload from Computer", "Media Library", or choose one of the Presets above.
              </p>
            </div>
          )}

          {/* Caption & ALT metadata inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] uppercase font-bold text-[#71717A] block mb-1">
                Figure Caption (Shown to readers)
              </label>
              <input
                type="text"
                value={block.data.caption || ''}
                onChange={(e) => onChange({ caption: e.target.value })}
                placeholder="Figure 1.1: Architecture & Technical Flow"
                className="w-full px-2.5 py-1.5 bg-[#141418] border border-[#27272A] rounded-lg text-xs text-white"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-[#71717A] block mb-1">
                ALT Description (Accessibility &amp; SEO)
              </label>
              <input
                type="text"
                value={block.data.alt || ''}
                onChange={(e) => onChange({ alt: e.target.value })}
                placeholder="Descriptive text for search crawlers & screen readers"
                className="w-full px-2.5 py-1.5 bg-[#141418] border border-[#27272A] rounded-lg text-xs text-white"
              />
            </div>
          </div>

          {/* Sizing & Alignment toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-[#71717A] text-[11px]">Size:</span>
              {(['small', 'medium', 'large', 'full'] as const).map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => onChange({ size: sz })}
                  className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold capitalize cursor-pointer ${
                    (block.data.size || 'large') === sz
                      ? 'bg-purple-600 text-white'
                      : 'bg-[#18181E] text-[#A1A1AA] hover:text-white'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[#71717A] text-[11px]">Alignment:</span>
              {(['left', 'center', 'right', 'full'] as const).map((al) => (
                <button
                  key={al}
                  type="button"
                  onClick={() => onChange({ alignment: al })}
                  className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold capitalize cursor-pointer ${
                    (block.data.alignment || 'center') === al
                      ? 'bg-purple-600 text-white'
                      : 'bg-[#18181E] text-[#A1A1AA] hover:text-white'
                  }`}
                >
                  {al}
                </button>
              ))}
            </div>
          </div>
        </div>
      );
    }

    case 'callout':
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <select
              value={block.data.type}
              onChange={(e) => onChange({ type: e.target.value })}
              className="px-2.5 py-1 bg-[#1A1A1E] border border-[#27272A] rounded text-xs font-bold text-sky-400 focus:outline-none"
            >
              <option value="info">Info / Tip (Sky)</option>
              <option value="warning">Warning (Amber)</option>
              <option value="tip">Pro-Tip (Emerald)</option>
              <option value="danger">Danger (Rose)</option>
            </select>
            <input
              type="text"
              value={block.data.title}
              onChange={(e) => onChange({ title: e.target.value })}
              placeholder="Callout title (e.g. Always quit the driver)"
              className="flex-1 px-2.5 py-1 bg-[#1A1A1E] border border-[#27272A] rounded text-xs font-bold text-white"
            />
          </div>
          <textarea
            rows={2}
            value={block.data.message}
            onChange={(e) => onChange({ message: e.target.value })}
            placeholder="Enter callout explanation text..."
            className="w-full p-2.5 bg-[#1A1A1E] border border-[#27272A] rounded-lg text-xs text-[#D4D4D8]"
          />
        </div>
      );

    case 'table':
      return (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-white">Interactive Table Editor</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const currentCols = block.data.content[0]?.length || 2;
                  const newRow = new Array(currentCols).fill('Cell');
                  onChange({ content: [...block.data.content, newRow] });
                }}
                className="px-2 py-1 rounded bg-[#27272A] hover:bg-[#323238] text-[11px] text-white"
              >
                + Add Row
              </button>
              <button
                type="button"
                onClick={() => {
                  const nextContent = block.data.content.map((row) => [...row, 'Header']);
                  onChange({ content: nextContent });
                }}
                className="px-2 py-1 rounded bg-[#27272A] hover:bg-[#323238] text-[11px] text-white"
              >
                + Add Column
              </button>
            </div>
          </div>

          <div className="overflow-x-auto border border-[#27272A] rounded-xl bg-[#09090B]">
            <table className="w-full text-xs">
              <tbody>
                {block.data.content.map((row, rIdx) => (
                  <tr
                    key={rIdx}
                    className={
                      rIdx === 0 && block.data.withHeadings
                        ? 'bg-[#18181C] font-bold text-white border-b border-[#27272A]'
                        : 'border-b border-[#27272A]/50'
                    }
                  >
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="p-1.5 border-r border-[#27272A]/40 min-w-[120px]">
                        <input
                          type="text"
                          value={cell}
                          onChange={(e) => {
                            const newContent = block.data.content.map((r, r_i) =>
                              r_i === rIdx
                                ? r.map((c, c_i) => (c_i === cIdx ? e.target.value : c))
                                : r
                            );
                            onChange({ content: newContent });
                          }}
                          className="w-full bg-transparent p-1 text-xs focus:outline-none text-[#E4E4E7]"
                        />
                      </td>
                    ))}
                    <td className="w-8 p-1 text-center">
                      {block.data.content.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const next = block.data.content.filter((_, i) => i !== rIdx);
                            onChange({ content: next });
                          }}
                          className="text-rose-400 hover:text-rose-300"
                        >
                          &times;
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );

    case 'stepByStep':
      return (
        <div className="space-y-3">
          <input
            type="text"
            value={block.data.title || ''}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="Step Guide Title (e.g. 4-Step WebDriver Scaffolding)"
            className="w-full px-3 py-1.5 bg-[#1A1A1E] border border-[#27272A] rounded-lg text-xs font-bold text-white"
          />
          {block.data.steps.map((st, sIdx) => (
            <div
              key={sIdx}
              className="p-3 rounded-lg border border-[#27272A] bg-[#09090B] space-y-2"
            >
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center">
                  {st.stepNumber || sIdx + 1}
                </span>
                <input
                  type="text"
                  value={st.title}
                  onChange={(e) => {
                    const newSteps = [...block.data.steps];
                    newSteps[sIdx] = { ...st, title: e.target.value };
                    onChange({ steps: newSteps });
                  }}
                  placeholder="Step title"
                  className="flex-1 px-2.5 py-1 bg-[#1A1A1E] border border-[#27272A] rounded text-xs font-bold text-white"
                />
                <button
                  type="button"
                  onClick={() => {
                    const newSteps = block.data.steps.filter((_, i) => i !== sIdx);
                    onChange({ steps: newSteps });
                  }}
                  className="text-rose-400 text-xs"
                >
                  Remove
                </button>
              </div>
              <textarea
                rows={2}
                value={st.explanation}
                onChange={(e) => {
                  const newSteps = [...block.data.steps];
                  newSteps[sIdx] = { ...st, explanation: e.target.value };
                  onChange({ steps: newSteps });
                }}
                placeholder="Step instructions and guidance..."
                className="w-full p-2 bg-[#1A1A1E] border border-[#27272A] rounded text-xs text-[#D4D4D8]"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() => {
              const newStep = {
                stepNumber: block.data.steps.length + 1,
                title: `Step ${block.data.steps.length + 1}`,
                explanation: 'Instructions here.',
              };
              onChange({ steps: [...block.data.steps, newStep] });
            }}
            className="text-xs text-emerald-400 font-semibold"
          >
            + Add Another Step
          </button>
        </div>
      );

    case 'faq':
      return (
        <div className="space-y-3">
          <input
            type="text"
            value={block.data.title || ''}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="FAQ Section Title"
            className="w-full px-3 py-1.5 bg-[#1A1A1E] border border-[#27272A] rounded-lg text-xs font-bold text-white"
          />
          {block.data.items.map((item, fIdx) => (
            <div
              key={fIdx}
              className="p-3 rounded-lg border border-[#27272A] bg-[#09090B] space-y-2"
            >
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={item.question}
                  onChange={(e) => {
                    const nextItems = [...block.data.items];
                    nextItems[fIdx] = { ...item, question: e.target.value };
                    onChange({ items: nextItems });
                  }}
                  placeholder="Question text..."
                  className="flex-1 px-2.5 py-1 bg-[#1A1A1E] border border-[#27272A] rounded text-xs font-bold text-white"
                />
                <button
                  type="button"
                  onClick={() => {
                    const nextItems = block.data.items.filter((_, i) => i !== fIdx);
                    onChange({ items: nextItems });
                  }}
                  className="text-rose-400 text-xs"
                >
                  Remove
                </button>
              </div>
              <textarea
                rows={2}
                value={item.answer}
                onChange={(e) => {
                  const nextItems = [...block.data.items];
                  nextItems[fIdx] = { ...item, answer: e.target.value };
                  onChange({ items: nextItems });
                }}
                placeholder="Comprehensive answer..."
                className="w-full p-2 bg-[#1A1A1E] border border-[#27272A] rounded text-xs text-[#D4D4D8]"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() => {
              onChange({
                items: [
                  ...block.data.items,
                  { question: 'New Question?', answer: 'Detailed answer.' },
                ],
              });
            }}
            className="text-xs text-purple-400 font-semibold"
          >
            + Add FAQ Item
          </button>
        </div>
      );

    case 'comparisonTable':
      return (
        <div className="space-y-3">
          <input
            type="text"
            value={block.data.title || ''}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="Comparison Table Title"
            className="w-full px-3 py-1.5 bg-[#1A1A1E] border border-[#27272A] rounded-lg text-xs font-bold text-white"
          />
          <div className="grid grid-cols-3 gap-2">
            {block.data.columns.map((col, cIdx) => (
              <input
                key={cIdx}
                type="text"
                value={col}
                onChange={(e) => {
                  const newCols = [...block.data.columns];
                  newCols[cIdx] = e.target.value;
                  onChange({ columns: newCols });
                }}
                className="px-2.5 py-1 bg-[#1A1A1E] border border-[#27272A] rounded text-xs font-bold text-emerald-400"
              />
            ))}
          </div>
          {block.data.rows.map((row, rIdx) => (
            <div
              key={rIdx}
              className="grid grid-cols-3 gap-2 p-2 rounded bg-[#09090B] border border-[#27272A]"
            >
              <input
                type="text"
                value={row.feature}
                onChange={(e) => {
                  const nextRows = [...block.data.rows];
                  nextRows[rIdx] = { ...row, feature: e.target.value };
                  onChange({ rows: nextRows });
                }}
                className="px-2 py-1 bg-[#141417] border border-[#27272A] rounded text-xs font-semibold text-white"
              />
              {row.values.map((val, vIdx) => (
                <input
                  key={vIdx}
                  type="text"
                  value={val}
                  onChange={(e) => {
                    const nextRows = [...block.data.rows];
                    const nextVals = [...row.values];
                    nextVals[vIdx] = e.target.value;
                    nextRows[rIdx] = { ...row, values: nextVals };
                    onChange({ rows: nextRows });
                  }}
                  className="px-2 py-1 bg-[#141417] border border-[#27272A] rounded text-xs text-[#D4D4D8]"
                />
              ))}
            </div>
          ))}
          <button
            type="button"
            onClick={() => {
              onChange({
                rows: [
                  ...block.data.rows,
                  {
                    feature: 'New Feature',
                    values: new Array(block.data.columns.length - 1).fill('Value'),
                  },
                ],
              });
            }}
            className="text-xs text-rose-400 font-semibold"
          >
            + Add Comparison Row
          </button>
        </div>
      );

    default:
      return (
        <div className="text-xs text-[#71717A]">Editing for {block.type} block is configured.</div>
      );
  }
}

// ----------------------------------------------------
// Preview Renderer for Article Blocks
// ----------------------------------------------------
function PreviewBlockItem({ block }: { block: EditorBlock }) {
  const [copied, setCopied] = useState(false);

  switch (block.type) {
    case 'header': {
      const Tag =
        block.data.level === 1
          ? 'h1'
          : block.data.level === 2
            ? 'h2'
            : block.data.level === 3
              ? 'h3'
              : 'h4';
      const styles =
        block.data.level === 2
          ? 'text-2xl font-extrabold text-white mt-8 mb-3 pb-2 border-b border-[#27272A]'
          : block.data.level === 3
            ? 'text-xl font-bold text-white mt-6 mb-2'
            : 'text-lg font-bold text-[#E4E4E7] mt-4 mb-2';
      return (
        <Tag id={block.data.anchor} className={styles}>
          {block.data.text}
        </Tag>
      );
    }

    case 'paragraph':
      return (
        <p
          className="text-sm sm:text-base text-[#D4D4D8] leading-relaxed"
          dangerouslySetInnerHTML={{ __html: block.data.text }}
        />
      );

    case 'code':
      return (
        <div className="rounded-2xl border border-[#27272A] bg-[#09090B] overflow-hidden shadow-lg my-4">
          <div className="px-4 py-2 border-b border-[#27272A] bg-[#141416] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-amber-400 uppercase">
                {block.data.language || 'code'}
              </span>
              {block.data.caption && (
                <span className="text-xs text-[#71717A]">• {block.data.caption}</span>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(block.data.code);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="p-1 rounded text-[#71717A] hover:text-white flex items-center gap-1 text-xs"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <pre className="p-4 overflow-x-auto text-xs font-mono text-emerald-300 leading-relaxed">
            <code>{block.data.code}</code>
          </pre>
        </div>
      );

    case 'terminal':
      return (
        <div className="rounded-xl border border-[#27272A] bg-[#09090B] p-3 my-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-white">
            <span className="text-sky-400 font-bold">{block.data.prompt || '$'}</span>
            <span>{block.data.code}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(block.data.code);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="text-xs text-[#71717A] hover:text-white"
          >
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      );

    case 'image': {
      const imgUrl = block.data.file?.url || (block.data as any).url;
      if (!imgUrl) return null;
      return (
        <figure className="my-6 text-center">
          <div className="rounded-2xl border border-[#27272A] overflow-hidden bg-[#09090B] inline-block max-w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imgUrl}
              alt={block.data.alt || 'Tutorial diagram'}
              className="max-h-[460px] w-auto mx-auto object-contain"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
          {block.data.caption && (
            <figcaption className="mt-2 text-xs text-[#A1A1AA] italic">
              {block.data.caption}
            </figcaption>
          )}
        </figure>
      );
    }

    case 'callout': {
      const isWarn = block.data.type === 'warning';
      const isTip = block.data.type === 'tip';
      const isDanger = block.data.type === 'danger';
      const bg = isWarn
        ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
        : isTip
          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
          : isDanger
            ? 'bg-rose-500/10 border-rose-500/30 text-rose-200'
            : 'bg-sky-500/10 border-sky-500/30 text-sky-200';
      return (
        <div className={`p-4 rounded-xl border ${bg} my-4 space-y-1`}>
          <div className="font-bold text-sm text-white flex items-center gap-2">
            {isWarn ? (
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            ) : (
              <Info className="w-4 h-4 text-sky-400" />
            )}
            <span>{block.data.title}</span>
          </div>
          <p className="text-xs sm:text-sm text-[#D4D4D8] leading-relaxed">{block.data.message}</p>
        </div>
      );
    }

    case 'table':
      return (
        <div className="overflow-x-auto my-6 border border-[#27272A] rounded-2xl bg-[#09090B]">
          <table className="w-full text-left text-xs sm:text-sm">
            <tbody>
              {block.data.content.map((row, rIdx) => (
                <tr
                  key={rIdx}
                  className={
                    rIdx === 0 && block.data.withHeadings
                      ? 'bg-[#18181C] font-bold text-white border-b border-[#27272A]'
                      : 'border-b border-[#27272A]/50 hover:bg-[#121215]'
                  }
                >
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="p-3 border-r border-[#27272A]/40">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case 'stepByStep':
      return (
        <div className="space-y-4 my-6">
          {block.data.title && <h3 className="text-lg font-bold text-white">{block.data.title}</h3>}
          {block.data.steps.map((st, i) => (
            <div key={i} className="p-4 rounded-2xl border border-[#27272A] bg-[#121215] space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center">
                  {st.stepNumber || i + 1}
                </span>
                <span className="font-bold text-sm text-white">{st.title}</span>
                {st.badge && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono">
                    {st.badge}
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-[#D4D4D8] pl-8">{st.explanation}</p>
            </div>
          ))}
        </div>
      );

    case 'faq':
      return (
        <div className="space-y-3 my-6">
          {block.data.title && <h3 className="text-lg font-bold text-white">{block.data.title}</h3>}
          {block.data.items.map((item, i) => (
            <details
              key={i}
              className="p-4 rounded-xl border border-[#27272A] bg-[#121215] group cursor-pointer"
            >
              <summary className="font-bold text-sm text-white flex items-center justify-between list-none">
                <span>{item.question}</span>
                <ChevronDown className="w-4 h-4 text-[#71717A] group-open:rotate-180 transition-transform" />
              </summary>
              <p className="mt-3 text-xs sm:text-sm text-[#A1A1AA] leading-relaxed pt-2 border-t border-[#27272A]">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      );

    case 'comparisonTable':
      return (
        <div className="my-6 border border-[#27272A] rounded-2xl overflow-hidden bg-[#09090B]">
          {block.data.title && (
            <div className="p-3 bg-[#18181C] border-b border-[#27272A] text-xs font-bold text-white">
              {block.data.title}
            </div>
          )}
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-[#141416] border-b border-[#27272A]">
                {block.data.columns.map((c, i) => (
                  <th key={i} className="p-3 text-left font-bold text-emerald-400">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.data.rows.map((row, rIdx) => (
                <tr key={rIdx} className="border-b border-[#27272A]/50 hover:bg-[#121215]">
                  <td className="p-3 font-semibold text-white border-r border-[#27272A]/40">
                    {row.feature}
                  </td>
                  {row.values.map((v, vIdx) => (
                    <td key={vIdx} className="p-3 text-[#D4D4D8] border-r border-[#27272A]/40">
                      {v}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    default:
      return null;
  }
}
