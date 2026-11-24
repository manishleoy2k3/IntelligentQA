import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import Link from '@tiptap/extension-link';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { Callout } from './extensions/callout-extension';
import { ResizableImage } from './extensions/resizable-image-extension';
import { lowlight } from './extensions/lowlight-config';

/**
 * Standard, canonical extensions configuration used consistently
 * by both the Admin WYSIWYG Editor and the Server-side / Client-side Renderers.
 */
export const sharedTiptapExtensions = [
  StarterKit.configure({
    codeBlock: false,
    heading: {
      levels: [1, 2, 3, 4],
    },
  }),
  Underline,
  Highlight.configure({
    multicolor: true,
  }),
  TextAlign.configure({
    types: ['heading', 'paragraph', 'image'],
  }),
  Table.configure({
    resizable: true,
  }),
  TableRow,
  TableHeader,
  TableCell,
  Link.configure({
    openOnClick: false,
    HTMLAttributes: {
      class: 'text-emerald-600 dark:text-emerald-400 underline font-semibold hover:text-emerald-500',
      rel: 'noopener noreferrer',
      target: '_blank',
    },
  }),
  CodeBlockLowlight.configure({
    lowlight,
    defaultLanguage: 'typescript',
    HTMLAttributes: {
      class: 'tiptap-code-block rounded-2xl bg-[#0F0F12] border border-[#27272A] p-4 text-emerald-300 font-mono text-xs my-4 overflow-x-auto shadow-inner',
    },
  }),
  Callout,
  ResizableImage,
];
