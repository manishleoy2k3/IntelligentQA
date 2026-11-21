// 100% Free & Open-Source Core CMS Engine & Utilities
// Compatible with both Node.js CJS and Next.js ESM runtimes

function calculateReadingTime(data) {
  if (!data || !Array.isArray(data.blocks)) return 1;
  let wordCount = 0;

  for (const block of data.blocks) {
    if (block.type === 'paragraph' || block.type === 'header' || block.type === 'quote') {
      const text = block.data.text || '';
      wordCount += text.replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length;
    } else if (block.type === 'list' && Array.isArray(block.data.items)) {
      for (const item of block.data.items) {
        wordCount += item.replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length;
      }
    } else if (block.type === 'callout') {
      const text = (block.data.title || '') + ' ' + (block.data.message || '');
      wordCount += text.split(/\s+/).filter(Boolean).length;
    } else if (block.type === 'stepByStep' && Array.isArray(block.data.steps)) {
      for (const step of block.data.steps) {
        const text = (step.title || '') + ' ' + (step.summary || '') + ' ' + (step.explanation || '');
        wordCount += text.split(/\s+/).filter(Boolean).length;
      }
    } else if (block.type === 'faq' && Array.isArray(block.data.items)) {
      for (const item of block.data.items) {
        const text = (item.question || '') + ' ' + (item.answer || '');
        wordCount += text.split(/\s+/).filter(Boolean).length;
      }
    } else if (block.type === 'code' && block.data.code) {
      wordCount += Math.floor(block.data.code.split('\n').length * 2);
    }
  }

  const minutes = Math.ceil(wordCount / 200);
  return Math.max(1, minutes);
}

function generateTableOfContents(data) {
  if (!data || !Array.isArray(data.blocks)) return [];
  const toc = [];
  const seenIds = new Set();

  for (const block of data.blocks) {
    if (block.type === 'header' && (block.data.level === 2 || block.data.level === 3)) {
      const plainText = (block.data.text || '').replace(/<[^>]*>/g, '').trim();
      if (!plainText) continue;

      let baseId = plainText
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-');
      if (!baseId) baseId = 'heading';

      let id = baseId;
      let counter = 1;
      while (seenIds.has(id)) {
        id = `${baseId}-${counter}`;
        counter++;
      }
      seenIds.add(id);

      toc.push({
        id,
        text: plainText,
        level: block.data.level,
      });
    }
  }

  return toc;
}

const ALLOWED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
];

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB limit

function validateImageUpload(fileBuffer, mimeType, filename) {
  if (fileBuffer.length > MAX_FILE_SIZE_BYTES) {
    return { valid: false, error: 'File size exceeds 10MB limit' };
  }

  if (!ALLOWED_IMAGE_MIME_TYPES.includes(mimeType.toLowerCase())) {
    return {
      valid: false,
      error: `Invalid file format: ${mimeType}. Allowed formats: JPEG, PNG, WebP, GIF, SVG.`,
    };
  }

  const cleanName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  if (cleanName.includes('..') || cleanName.includes('/') || cleanName.includes('\\')) {
    return { valid: false, error: 'Malicious filename path detected' };
  }

  if (mimeType === 'image/png') {
    if (fileBuffer[0] !== 0x89 || fileBuffer[1] !== 0x50 || fileBuffer[2] !== 0x4e || fileBuffer[3] !== 0x47) {
      return { valid: false, error: 'File content does not match PNG signature' };
    }
  } else if (mimeType === 'image/jpeg') {
    if (fileBuffer[0] !== 0xff || fileBuffer[1] !== 0xd8) {
      return { valid: false, error: 'File content does not match JPEG signature' };
    }
  }

  return { valid: true };
}

function sanitizeHtml(html) {
  if (!html) return '';
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/\bon\w+="[^"]*"/gi, '')
    .replace(/\bon\w+='[^']*'/gi, '')
    .replace(/\bon\w+=\w+/gi, '')
    .replace(/javascript:[^"']*/gi, '');
}

module.exports = {
  calculateReadingTime,
  generateTableOfContents,
  validateImageUpload,
  sanitizeHtml,
  ALLOWED_IMAGE_MIME_TYPES,
  MAX_FILE_SIZE_BYTES,
};
