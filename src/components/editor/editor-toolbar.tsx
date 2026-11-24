'use client';

import React, { useState } from 'react';
import { Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Highlighter,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Pilcrow,
  Quote,
  Minus,
  Table as TableIcon,
  Code2,
  Link2,
  Image as ImageIcon,
  AlertCircle,
  HelpCircle,
  Lightbulb,
  CheckCircle,
  ShieldAlert,
  Undo,
  Redo,
  Upload,
  Plus,
  Trash2,
  Sparkles,
  Workflow,
} from 'lucide-react';
import { SUPPORTED_LANGUAGES } from './extensions/lowlight-config';

interface EditorToolbarProps {
  editor: Editor | null;
  onOpenImageModal: () => void;
  onOpenAiAssistant?: () => void;
  onOpenDiagramStudio?: () => void;
}

export default function EditorToolbar({
  editor,
  onOpenImageModal,
  onOpenAiAssistant,
  onOpenDiagramStudio,
}: EditorToolbarProps) {
  const [showTableMenu, setShowTableMenu] = useState(false);
  const [showCalloutMenu, setShowCalloutMenu] = useState(false);
  const [showCodeLangMenu, setShowCodeLangMenu] = useState(false);

  if (!editor) {
    return null;
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter Hyperlink URL (e.g. https://example.com):', previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const insertCallout = (type: 'info' | 'warning' | 'important' | 'tip' | 'best-practice') => {
    editor.chain().focus().setCallout({ type }).run();
    setShowCalloutMenu(false);
  };

  const insertCodeBlock = (language: string) => {
    editor.chain().focus().setCodeBlock({ language }).run();
    setShowCodeLangMenu(false);
  };

  return (
    <div className="sticky top-0 z-30 bg-white dark:bg-[#18181B] border-b border-slate-200 dark:border-[#27272A] p-2 flex flex-wrap items-center gap-1 select-none shadow-sm text-slate-700 dark:text-zinc-300 transition-colors">
      {/* HISTORY GROUP */}
      <div className="flex items-center gap-0.5 pr-1.5 border-r border-slate-200 dark:border-[#27272A]">
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#27272A] hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
          title="Undo (Ctrl+Z)"
        >
          <Undo className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#27272A] hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
          title="Redo (Ctrl+Y)"
        >
          <Redo className="w-4 h-4" />
        </button>
      </div>

      {/* HEADINGS & PARAGRAPH DROPDOWN / BUTTONS */}
      <div className="flex items-center gap-0.5 px-1.5 border-r border-slate-200 dark:border-[#27272A]">
        <button
          type="button"
          onClick={() => editor.chain().focus().setParagraph().run()}
          className={`p-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
            editor.isActive('paragraph') ? 'bg-purple-600/20 text-purple-700 dark:text-purple-300 font-bold' : 'hover:bg-slate-100 dark:hover:bg-[#27272A] hover:text-slate-900 dark:hover:text-white'
          }`}
          title="Normal Paragraph"
        >
          <Pilcrow className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
            editor.isActive('heading', { level: 1 }) ? 'bg-purple-600/20 text-purple-700 dark:text-purple-300' : 'hover:bg-slate-100 dark:hover:bg-[#27272A] hover:text-slate-900 dark:hover:text-white'
          }`}
          title="Heading 1"
        >
          <Heading1 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
            editor.isActive('heading', { level: 2 }) ? 'bg-purple-600/20 text-purple-700 dark:text-purple-300' : 'hover:bg-slate-100 dark:hover:bg-[#27272A] hover:text-slate-900 dark:hover:text-white'
          }`}
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
            editor.isActive('heading', { level: 3 }) ? 'bg-purple-600/20 text-purple-700 dark:text-purple-300' : 'hover:bg-slate-100 dark:hover:bg-[#27272A] hover:text-slate-900 dark:hover:text-white'
          }`}
          title="Heading 3"
        >
          <Heading3 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
          className={`p-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
            editor.isActive('heading', { level: 4 }) ? 'bg-purple-600/20 text-purple-700 dark:text-purple-300' : 'hover:bg-slate-100 dark:hover:bg-[#27272A] hover:text-slate-900 dark:hover:text-white'
          }`}
          title="Heading 4"
        >
          <Heading4 className="w-4 h-4" />
        </button>
      </div>

      {/* TEXT FORMATTING GROUP */}
      <div className="flex items-center gap-0.5 px-1.5 border-r border-[#27272A]">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            editor.isActive('bold') ? 'bg-purple-600/30 text-purple-300 font-bold' : 'hover:bg-[#27272A] hover:text-white'
          }`}
          title="Bold (Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            editor.isActive('italic') ? 'bg-purple-600/30 text-purple-300' : 'hover:bg-[#27272A] hover:text-white'
          }`}
          title="Italic (Ctrl+I)"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            editor.isActive('underline') ? 'bg-purple-600/30 text-purple-300' : 'hover:bg-[#27272A] hover:text-white'
          }`}
          title="Underline (Ctrl+U)"
        >
          <UnderlineIcon className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            editor.isActive('strike') ? 'bg-purple-600/30 text-purple-300' : 'hover:bg-[#27272A] hover:text-white'
          }`}
          title="Strikethrough"
        >
          <Strikethrough className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            editor.isActive('highlight') ? 'bg-yellow-500/30 text-yellow-300' : 'hover:bg-[#27272A] hover:text-white'
          }`}
          title="Highlight Text"
        >
          <Highlighter className="w-4 h-4" />
        </button>
      </div>

      {/* ALIGNMENT GROUP */}
      <div className="flex items-center gap-0.5 px-1.5 border-r border-[#27272A]">
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            editor.isActive({ textAlign: 'left' }) ? 'bg-purple-600/30 text-purple-300' : 'hover:bg-[#27272A] hover:text-white'
          }`}
          title="Align Left"
        >
          <AlignLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            editor.isActive({ textAlign: 'center' }) ? 'bg-purple-600/30 text-purple-300' : 'hover:bg-[#27272A] hover:text-white'
          }`}
          title="Align Center"
        >
          <AlignCenter className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            editor.isActive({ textAlign: 'right' }) ? 'bg-purple-600/30 text-purple-300' : 'hover:bg-[#27272A] hover:text-white'
          }`}
          title="Align Right"
        >
          <AlignRight className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            editor.isActive({ textAlign: 'justify' }) ? 'bg-purple-600/30 text-purple-300' : 'hover:bg-[#27272A] hover:text-white'
          }`}
          title="Justify"
        >
          <AlignJustify className="w-4 h-4" />
        </button>
      </div>

      {/* LISTS GROUP */}
      <div className="flex items-center gap-0.5 px-1.5 border-r border-[#27272A]">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            editor.isActive('bulletList') ? 'bg-purple-600/30 text-purple-300' : 'hover:bg-[#27272A] hover:text-white'
          }`}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            editor.isActive('orderedList') ? 'bg-purple-600/30 text-purple-300' : 'hover:bg-[#27272A] hover:text-white'
          }`}
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            editor.isActive('blockquote') ? 'bg-purple-600/30 text-purple-300' : 'hover:bg-[#27272A] hover:text-white'
          }`}
          title="Blockquote"
        >
          <Quote className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="p-1.5 rounded-lg hover:bg-[#27272A] hover:text-white transition-colors cursor-pointer"
          title="Horizontal Rule"
        >
          <Minus className="w-4 h-4" />
        </button>
      </div>

      {/* INSERT ITEMS (LINK, IMAGE, TABLE, CODE, CALLOUTS) */}
      <div className="flex items-center gap-1 pl-1.5 relative">
        {/* Link Button */}
        <button
          type="button"
          onClick={setLink}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            editor.isActive('link') ? 'bg-purple-600/30 text-purple-300 font-bold' : 'hover:bg-[#27272A] hover:text-white'
          }`}
          title="Insert / Edit Hyperlink"
        >
          <Link2 className="w-4 h-4" />
        </button>

        {/* Image Modal Button */}
        <button
          type="button"
          onClick={onOpenImageModal}
          className="p-1.5 rounded-lg hover:bg-[#27272A] hover:text-white text-emerald-400 transition-colors cursor-pointer flex items-center gap-1"
          title="Insert Image / Upload PNG, JPG, WebP, SVG"
        >
          <ImageIcon className="w-4 h-4" />
          <span className="text-xs font-semibold hidden md:inline">Image</span>
        </button>

        {/* Dedicated Diagram Studio Button */}
        {onOpenDiagramStudio && (
          <button
            type="button"
            onClick={onOpenDiagramStudio}
            className="p-1.5 rounded-lg hover:bg-[#27272A] hover:text-white text-cyan-400 transition-colors cursor-pointer flex items-center gap-1 bg-cyan-500/10 border border-cyan-500/20"
            title="Professional AI Architecture Diagram & Infographic Studio"
          >
            <Workflow className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-cyan-400 hidden lg:inline">Diagram Studio</span>
          </button>
        )}

        {/* Code Block Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowCodeLangMenu(!showCodeLangMenu)}
            className={`p-1.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer ${
              editor.isActive('codeBlock') ? 'bg-purple-600/30 text-purple-300' : 'hover:bg-[#27272A] hover:text-white'
            }`}
            title="Insert Code Block with Syntax Highlighting"
          >
            <Code2 className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-semibold hidden md:inline">Code</span>
          </button>
          {showCodeLangMenu && (
            <div className="absolute left-0 mt-1 w-44 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#333] rounded-xl shadow-2xl py-1 z-50 max-h-60 overflow-y-auto">
              <div className="px-3 py-1 text-[10px] font-mono font-bold text-slate-500 dark:text-zinc-400 uppercase border-b border-slate-200 dark:border-[#2A2A2E]">
                Select Language
              </div>
              {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                  key={lang.value}
                  type="button"
                  onClick={() => insertCodeBlock(lang.value)}
                  className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-zinc-200 hover:bg-purple-600/10 dark:hover:bg-purple-600/30 hover:text-purple-700 dark:hover:text-white flex items-center justify-between"
                >
                  <span>{lang.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Table Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowTableMenu(!showTableMenu)}
            className={`p-1.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer ${
              editor.isActive('table') ? 'bg-purple-600/20 text-purple-700 dark:text-purple-300' : 'hover:bg-slate-100 dark:hover:bg-[#27272A] hover:text-slate-900 dark:hover:text-white'
            }`}
            title="Table Management"
          >
            <TableIcon className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
            <span className="text-xs font-semibold hidden md:inline">Table</span>
          </button>
          {showTableMenu && (
            <div className="absolute left-0 mt-1 w-48 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#333] rounded-xl shadow-2xl p-2 z-50 space-y-1">
              <button
                type="button"
                onClick={() => {
                  editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
                  setShowTableMenu(false);
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-[#2A2A2E] flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                <span>Insert Table (3x3)</span>
              </button>
              <div className="border-t border-slate-200 dark:border-[#2A2A2E] pt-1 space-y-0.5">
                <button
                  type="button"
                  onClick={() => {
                    editor.chain().focus().addRowAfter().run();
                    setShowTableMenu(false);
                  }}
                  disabled={!editor.can().addRowAfter()}
                  className="w-full text-left px-2.5 py-1 rounded text-xs text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-[#2A2A2E] disabled:opacity-40"
                >
                  Add Row Below
                </button>
                <button
                  type="button"
                  onClick={() => {
                    editor.chain().focus().deleteRow().run();
                    setShowTableMenu(false);
                  }}
                  disabled={!editor.can().deleteRow()}
                  className="w-full text-left px-2.5 py-1 rounded text-xs text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-[#2A2A2E] disabled:opacity-40"
                >
                  Delete Row
                </button>
                <button
                  type="button"
                  onClick={() => {
                    editor.chain().focus().addColumnAfter().run();
                    setShowTableMenu(false);
                  }}
                  disabled={!editor.can().addColumnAfter()}
                  className="w-full text-left px-2.5 py-1 rounded text-xs text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-[#2A2A2E] disabled:opacity-40"
                >
                  Add Column Right
                </button>
                <button
                  type="button"
                  onClick={() => {
                    editor.chain().focus().deleteColumn().run();
                    setShowTableMenu(false);
                  }}
                  disabled={!editor.can().deleteColumn()}
                  className="w-full text-left px-2.5 py-1 rounded text-xs text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-[#2A2A2E] disabled:opacity-40"
                >
                  Delete Column
                </button>
                <button
                  type="button"
                  onClick={() => {
                    editor.chain().focus().deleteTable().run();
                    setShowTableMenu(false);
                  }}
                  disabled={!editor.can().deleteTable()}
                  className="w-full text-left px-2.5 py-1 rounded text-xs text-rose-500 hover:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20 disabled:opacity-40 flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Delete Table</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Callouts Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowCalloutMenu(!showCalloutMenu)}
            className="p-1.5 rounded-lg flex items-center gap-1 hover:bg-slate-100 dark:hover:bg-[#27272A] hover:text-slate-900 dark:hover:text-white text-amber-500 dark:text-amber-400 transition-colors cursor-pointer"
            title="Insert Callout (Info, Warning, Important, Tip, Best Practice)"
          >
            <AlertCircle className="w-4 h-4" />
            <span className="text-xs font-semibold hidden md:inline">Callout</span>
          </button>
          {showCalloutMenu && (
            <div className="absolute right-0 mt-1 w-52 bg-white dark:bg-[#1E1E22] border border-slate-200 dark:border-[#333] rounded-xl shadow-2xl p-2 z-50 space-y-1">
              <button
                type="button"
                onClick={() => insertCallout('info')}
                className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-sky-600 dark:text-sky-300 hover:bg-sky-500/10 dark:hover:bg-sky-500/20 flex items-center gap-2"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Information Callout</span>
              </button>
              <button
                type="button"
                onClick={() => insertCallout('tip')}
                className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-emerald-600 dark:text-emerald-300 hover:bg-emerald-500/10 dark:hover:bg-emerald-500/20 flex items-center gap-2"
              >
                <Lightbulb className="w-3.5 h-3.5" />
                <span>Tip / Pro Tip</span>
              </button>
              <button
                type="button"
                onClick={() => insertCallout('important')}
                className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-indigo-600 dark:text-indigo-300 hover:bg-indigo-500/10 dark:hover:bg-indigo-500/20 flex items-center gap-2"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Important Note</span>
              </button>
              <button
                type="button"
                onClick={() => insertCallout('warning')}
                className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-amber-600 dark:text-amber-300 hover:bg-amber-500/10 dark:hover:bg-amber-500/20 flex items-center gap-2"
              >
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Warning Callout</span>
              </button>
              <button
                type="button"
                onClick={() => insertCallout('best-practice')}
                className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-purple-600 dark:text-purple-300 hover:bg-purple-500/10 dark:hover:bg-purple-500/20 flex items-center gap-2"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Best Practice</span>
              </button>
            </div>
          )}
        </div>

        {/* ENHANCE WITH AI BUTTON */}
        {onOpenAiAssistant && (
          <div className="pl-1.5 ml-1 border-l border-slate-200 dark:border-[#27272A]">
            <button
              type="button"
              onClick={onOpenAiAssistant}
              className="px-3 py-1.5 rounded-xl bg-purple-600/10 hover:bg-purple-600/20 dark:bg-purple-600/20 dark:hover:bg-purple-600/30 text-purple-700 dark:text-purple-300 hover:text-purple-900 dark:hover:text-white border border-purple-500/30 hover:border-purple-500/60 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm group"
              title="Enhance with AI Assistant"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 group-hover:rotate-12 transition-transform" />
              <span className="text-xs font-bold">Enhance with AI</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
