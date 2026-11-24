import { generateHTML } from '@tiptap/html';
import { sharedTiptapExtensions } from './tiptap-schema';

/**
 * Converts canonical Tiptap JSON to production-ready HTML
 * using the exact same Tiptap extension schema as the visual editor.
 */
export function renderTiptapJsonToHtml(tiptapJson: any): string {
  if (!tiptapJson || typeof tiptapJson !== 'object') {
    return '';
  }

  try {
    return generateHTML(tiptapJson, sharedTiptapExtensions);
  } catch (error) {
    console.error('Failed to render Tiptap JSON to HTML:', error);
    return '';
  }
}
