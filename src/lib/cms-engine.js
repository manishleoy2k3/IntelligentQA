// 100% Free & Open-Source Core CMS Engine & Utilities
// Compatible with both Node.js CJS and Next.js ESM runtimes

function calculateReadingTime(data) {
  if (!data || !Array.isArray(data.blocks)) return 1;
  let wordCount = 0;

  for (const block of data.blocks) {
    if (block.type === 'paragraph' || block.type === 'header' || block.type === 'quote') {
      const text = block.data.text || '';
      wordCount += text
        .replace(/<[^>]*>/g, ' ')
        .split(/\s+/)
        .filter(Boolean).length;
    } else if (block.type === 'list' && Array.isArray(block.data.items)) {
      for (const item of block.data.items) {
        wordCount += item
          .replace(/<[^>]*>/g, ' ')
          .split(/\s+/)
          .filter(Boolean).length;
      }
    } else if (block.type === 'callout') {
      const text = (block.data.title || '') + ' ' + (block.data.message || '');
      wordCount += text.split(/\s+/).filter(Boolean).length;
    } else if (block.type === 'stepByStep' && Array.isArray(block.data.steps)) {
      for (const step of block.data.steps) {
        const text =
          (step.title || '') + ' ' + (step.summary || '') + ' ' + (step.explanation || '');
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
    if (
      fileBuffer[0] !== 0x89 ||
      fileBuffer[1] !== 0x50 ||
      fileBuffer[2] !== 0x4e ||
      fileBuffer[3] !== 0x47
    ) {
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

// Convert a structured LessonDoc into Editor.js blocks
function lessonDocToBlocks(doc) {
  if (!doc) return { time: Date.now(), version: '2.28.0', blocks: [] };

  // If the lesson already has custom-saved rich CMS blocks, preserve them directly
  if (Array.isArray(doc.customBlocks) && doc.customBlocks.length > 0) {
    return {
      time: Date.now(),
      version: '2.28.0',
      blocks: doc.customBlocks,
    };
  }

  const blocks = [];

  if (doc.title) {
    blocks.push({
      id: `blk-h-${Date.now()}-1`,
      type: 'header',
      data: { text: doc.title, level: 2 },
    });
  }

  if (doc.overview) {
    blocks.push({
      id: `blk-p-${Date.now()}-2`,
      type: 'paragraph',
      data: { text: doc.overview },
    });
  }

  if (doc.whyItMattersForManualQA) {
    blocks.push({
      id: `blk-c-${Date.now()}-3`,
      type: 'callout',
      data: {
        type: 'info',
        title: 'Why It Matters for Manual QA',
        message: doc.whyItMattersForManualQA,
      },
    });
  }

  if (doc.architectureUnderTheHood?.flowOrMechanism) {
    blocks.push({
      id: `blk-c-${Date.now()}-4`,
      type: 'callout',
      data: {
        type: 'tip',
        title: doc.architectureUnderTheHood.title || 'Architecture & Mechanism',
        message: `${doc.architectureUnderTheHood.flowOrMechanism}\n\nKey Takeaway: ${doc.architectureUnderTheHood.keyTakeaway || ''}`,
      },
    });
  }

  if (Array.isArray(doc.stepByStepGuide) && doc.stepByStepGuide.length > 0) {
    blocks.push({
      id: `blk-s-${Date.now()}-5`,
      type: 'stepByStep',
      data: {
        title: 'Step-by-Step Practical Implementation',
        steps: doc.stepByStepGuide.map((s, idx) => ({
          stepNumber: s.stepNumber || idx + 1,
          title: s.title || `Step ${idx + 1}`,
          badge: s.badge || 'Implementation',
          summary: s.summary || '',
          explanation: s.explanation || '',
          codeSnippet: s.codeSnippet,
          proTip: s.proTip,
        })),
      },
    });
  }

  if (doc.productionCodeExample?.code) {
    blocks.push({
      id: `blk-code-${Date.now()}-6`,
      type: 'code',
      data: {
        language: doc.productionCodeExample.language || 'java',
        code: doc.productionCodeExample.code,
        caption: doc.productionCodeExample.title || 'Production Code Template',
      },
    });
  }

  if (Array.isArray(doc.manualToAutomatedBridge) && doc.manualToAutomatedBridge.length > 0) {
    blocks.push({
      id: `blk-tbl-${Date.now()}-7`,
      type: 'table',
      data: {
        withHeadings: true,
        content: [
          ['Manual Action', 'Automated Approach', 'Why It Matters'],
          ...doc.manualToAutomatedBridge.map((row) => [
            row.manualAction || '',
            row.automatedApproach || '',
            row.whyItMatters || '',
          ]),
        ],
      },
    });
  }

  if (doc.interviewQnA?.question) {
    blocks.push({
      id: `blk-faq-${Date.now()}-8`,
      type: 'faq',
      data: {
        title: 'Top Interview Question & Answer',
        items: [
          {
            question: doc.interviewQnA.question,
            answer: doc.interviewQnA.answer,
          },
        ],
      },
    });
  }

  // Fallback starter blocks if doc is sparse
  if (blocks.length === 0) {
    blocks.push(
      {
        id: `blk-h-${Date.now()}-init-1`,
        type: 'header',
        data: { text: doc.title || 'Course Lesson', level: 2 },
      },
      {
        id: `blk-p-${Date.now()}-init-2`,
        type: 'paragraph',
        data: {
          text:
            doc.overview ||
            'Welcome to this interactive course lesson. Use the CMS rich block editor to build diagrams, code, and guides.',
        },
      }
    );
  }

  return {
    time: Date.now(),
    version: '2.28.0',
    blocks,
  };
}

// Convert Editor.js blocks back into LessonDoc
function blocksToLessonDoc(editorData, existingDoc) {
  const doc = { ...(existingDoc || {}) };
  if (!editorData?.blocks || !Array.isArray(editorData.blocks)) return doc;

  // Preserve all blocks so custom blocks (images, diagrams, callouts, steps) persist losslessly
  doc.customBlocks = editorData.blocks;

  let titleAssigned = false;
  let overviewAssigned = false;

  for (const block of editorData.blocks) {
    if (!block || !block.data) continue;

    // Header block -> Lesson Title
    if (block.type === 'header' && block.data.text && !titleAssigned) {
      doc.title = block.data.text;
      titleAssigned = true;
    }
    // Paragraph block -> Lesson Overview
    else if (block.type === 'paragraph' && block.data.text && !overviewAssigned) {
      doc.overview = block.data.text;
      overviewAssigned = true;
    }
    // Callout blocks
    else if (block.type === 'callout') {
      const calloutTitle = (block.data.title || '').toLowerCase();
      if (
        calloutTitle.includes('architecture') ||
        calloutTitle.includes('mechanism') ||
        calloutTitle.includes('under the hood')
      ) {
        doc.architectureUnderTheHood = {
          title: block.data.title || 'Architecture & Mechanism',
          flowOrMechanism: block.data.message || '',
          keyTakeaway:
            doc.architectureUnderTheHood?.keyTakeaway || 'Mastered via CMS Course Editor',
        };
      } else {
        doc.whyItMattersForManualQA = block.data.message || block.data.title || '';
      }
    }
    // Code block
    else if (block.type === 'code' && block.data.code) {
      doc.productionCodeExample = {
        title: block.data.caption || doc.productionCodeExample?.title || 'Production Code Example',
        description: 'Generated via CMS Course Editor',
        code: block.data.code,
        language: block.data.language || doc.productionCodeExample?.language || 'java',
        annotations: doc.productionCodeExample?.annotations || [],
      };
    }
    // Step-by-step block
    else if (block.type === 'stepByStep' && Array.isArray(block.data.steps)) {
      doc.stepByStepGuide = block.data.steps.map((s, idx) => ({
        stepNumber: s.stepNumber || idx + 1,
        title: s.title || `Step ${idx + 1}`,
        badge: s.badge || 'Implementation',
        summary: s.summary || '',
        explanation: s.explanation || '',
        codeSnippet: s.codeSnippet || '',
        proTip: s.proTip || '',
      }));
    }
    // Table block -> Manual to Automated Bridge
    else if (
      block.type === 'table' &&
      Array.isArray(block.data.content) &&
      block.data.content.length > 1
    ) {
      const rows = block.data.content.slice(1);
      doc.manualToAutomatedBridge = rows.map((r) => ({
        manualAction: r[0] || '',
        automatedApproach: r[1] || '',
        whyItMatters: r[2] || '',
      }));
    }
    // FAQ block
    else if (
      block.type === 'faq' &&
      Array.isArray(block.data.items) &&
      block.data.items.length > 0
    ) {
      doc.interviewQnA = {
        question: block.data.items[0].question || '',
        answer: block.data.items[0].answer || '',
      };
    }
  }

  return doc;
}

module.exports = {
  calculateReadingTime,
  generateTableOfContents,
  validateImageUpload,
  sanitizeHtml,
  ALLOWED_IMAGE_MIME_TYPES,
  MAX_FILE_SIZE_BYTES,
  lessonDocToBlocks,
  blocksToLessonDoc,
};
