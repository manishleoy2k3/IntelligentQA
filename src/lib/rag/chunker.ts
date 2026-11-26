import { RAGSourceType } from './types';

export interface ChunkInput {
  sourceType: RAGSourceType;
  sourceId: string;
  sourceTitle: string;
  courseId?: string | null;
  moduleId?: string | null;
  lessonId?: string | null;
  category?: string | null;
  topic?: string | null;
  rawText: string;
  htmlContent?: string;
  metadata?: Record<string, any>;
}

export interface GeneratedChunk {
  chunkIndex: number;
  chunkContent: string;
  tokenCount: number;
  metadata: Record<string, any>;
}

/**
 * Intelligent chunking strategy with context preservation:
 * - Lessons: Split by headings (h2, h3, #, ##) and paragraphs; preserves code blocks and tables.
 * - Interview Questions: Keeps Question + Expected Answer + Code + Pitfalls in atomic unit chunks.
 * - Articles: Preserves header sections and callout blocks.
 * - Course/Module: Encapsulates syllabus overview and architectural highlights.
 */
export function chunkContent(input: ChunkInput): GeneratedChunk[] {
  const { sourceType, rawText, sourceTitle } = input;

  if (sourceType === 'interview_question') {
    return chunkInterviewQuestion(input);
  }

  if (sourceType === 'lesson') {
    return chunkLesson(input);
  }

  if (sourceType === 'article') {
    return chunkArticle(input);
  }

  // Default: generic intelligent text chunking
  return chunkGenericText(rawText, sourceTitle, input.metadata || {});
}

/**
 * Interview Questions Chunking Strategy:
 * Preserves question, answer, pitfall, and code snippet in a unified chunk so RAG
 * retrieval retrieves the entire cohesive concept without separating answer from pitfalls.
 */
function chunkInterviewQuestion(input: ChunkInput): GeneratedChunk[] {
  const meta = input.metadata || {};
  const question = input.sourceTitle || meta.question || '';
  const answer = meta.answer_summary || meta.answer || input.rawText || '';
  const code = meta.code_snippet ? `\n\nCode Example:\n\`\`\`\n${meta.code_snippet}\n\`\`\`` : '';
  const bestPractice = meta.best_practice ? `\n\nBest Practice:\n${meta.best_practice}` : '';
  const pitfall = meta.pitfall_to_avoid
    ? `\n\nCommon Pitfall to Avoid:\n${meta.pitfall_to_avoid}`
    : '';
  const expectedFocus = meta.expected_focus
    ? `\n\nKey Concepts Focus:\n${meta.expected_focus}`
    : '';

  const mainChunk =
    `Category: ${input.category || 'QA'}\nTopic: ${input.topic || 'Testing'}\nQuestion: ${question}\n\nAnswer:\n${answer}${expectedFocus}${bestPractice}${pitfall}${code}`.trim();

  const chunks: GeneratedChunk[] = [
    {
      chunkIndex: 0,
      chunkContent: mainChunk,
      tokenCount: estimateTokenCount(mainChunk),
      metadata: {
        ...meta,
        chunkType: 'interview_core',
        question,
      },
    },
  ];

  // If there's an extensive code snippet or extra explanation, add secondary chunk
  if (meta.code_snippet && meta.code_snippet.length > 250) {
    const codeChunk = `Question Reference: ${question}\n\nTechnical Code Implementation:\n\`\`\`\n${meta.code_snippet}\n\`\`\`\n\nEngineering Note: ${meta.best_practice || 'Follow strict typing and exception handling.'}`;
    chunks.push({
      chunkIndex: 1,
      chunkContent: codeChunk,
      tokenCount: estimateTokenCount(codeChunk),
      metadata: {
        ...meta,
        chunkType: 'interview_code',
        question,
      },
    });
  }

  return chunks;
}

/**
 * Lesson Chunking Strategy:
 * Cleans HTML to structured Markdown sections, splits on headers while preserving code blocks.
 */
function chunkLesson(input: ChunkInput): GeneratedChunk[] {
  const text = cleanHtmlToMarkdown(input.htmlContent || input.rawText);
  const sections = splitByHeadings(text);

  const chunks: GeneratedChunk[] = [];
  let chunkIdx = 0;

  for (const section of sections) {
    if (!section.trim()) continue;

    // If section is reasonably sized (< 1500 chars), keep as single chunk
    if (section.length <= 1500) {
      const content = `Lesson: ${input.sourceTitle}\nTopic: ${input.topic || ''}\n\n${section.trim()}`;
      chunks.push({
        chunkIndex: chunkIdx++,
        chunkContent: content,
        tokenCount: estimateTokenCount(content),
        metadata: {
          ...input.metadata,
          sectionHeader: extractFirstHeading(section),
        },
      });
    } else {
      // Split large sections by paragraphs with overlap
      const paragraphs = section.split(/\n\n+/);
      let currentBuffer = `Lesson: ${input.sourceTitle}\n\n`;

      for (const p of paragraphs) {
        if (currentBuffer.length + p.length > 1200 && currentBuffer.length > 150) {
          chunks.push({
            chunkIndex: chunkIdx++,
            chunkContent: currentBuffer.trim(),
            tokenCount: estimateTokenCount(currentBuffer),
            metadata: {
              ...input.metadata,
              sectionHeader: extractFirstHeading(currentBuffer),
            },
          });
          // 150-char overlap
          const overlap = currentBuffer.slice(-150);
          currentBuffer = `Lesson: ${input.sourceTitle} (continued)\n...${overlap}\n\n${p}\n\n`;
        } else {
          currentBuffer += `${p}\n\n`;
        }
      }

      if (currentBuffer.trim().length > 100) {
        chunks.push({
          chunkIndex: chunkIdx++,
          chunkContent: currentBuffer.trim(),
          tokenCount: estimateTokenCount(currentBuffer),
          metadata: {
            ...input.metadata,
            sectionHeader: extractFirstHeading(currentBuffer),
          },
        });
      }
    }
  }

  if (chunks.length === 0) {
    const fallbackContent = `Lesson: ${input.sourceTitle}\n\n${input.rawText.slice(0, 1000)}`;
    chunks.push({
      chunkIndex: 0,
      chunkContent: fallbackContent,
      tokenCount: estimateTokenCount(fallbackContent),
      metadata: input.metadata || {},
    });
  }

  return chunks;
}

/**
 * CMS Article Chunking:
 * Preserves title, summary, and article sections.
 */
function chunkArticle(input: ChunkInput): GeneratedChunk[] {
  const meta = input.metadata || {};
  const cleaned = cleanHtmlToMarkdown(input.htmlContent || input.rawText);
  const sections = splitByHeadings(cleaned);

  const chunks: GeneratedChunk[] = [];
  let chunkIdx = 0;

  for (const s of sections) {
    if (!s.trim()) continue;
    const content = `Article: ${input.sourceTitle}\nCategory: ${input.category || 'QA'}\n\n${s.trim()}`;
    chunks.push({
      chunkIndex: chunkIdx++,
      chunkContent: content,
      tokenCount: estimateTokenCount(content),
      metadata: {
        ...meta,
        sectionHeader: extractFirstHeading(s),
      },
    });
  }

  if (chunks.length === 0) {
    const fallback = `Article: ${input.sourceTitle}\n\n${input.rawText.slice(0, 1000)}`;
    chunks.push({
      chunkIndex: 0,
      chunkContent: fallback,
      tokenCount: estimateTokenCount(fallback),
      metadata: meta,
    });
  }

  return chunks;
}

function chunkGenericText(
  text: string,
  title: string,
  metadata: Record<string, any>
): GeneratedChunk[] {
  const maxLen = 1000;
  const chunks: GeneratedChunk[] = [];
  let idx = 0;

  for (let i = 0; i < text.length; i += 850) {
    const slice = text.slice(i, i + maxLen).trim();
    if (!slice) continue;
    chunks.push({
      chunkIndex: idx++,
      chunkContent: `Source: ${title}\n\n${slice}`,
      tokenCount: estimateTokenCount(slice),
      metadata,
    });
  }

  return chunks;
}

function cleanHtmlToMarkdown(html: string): string {
  if (!html) return '';
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '\n\n# $1\n\n')
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '\n\n## $1\n\n')
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '\n\n### $1\n\n')
    .replace(/<pre><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, '\n\n```\n$1\n```\n\n')
    .replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`')
    .replace(/<li[^>]*>(.*?)<\/li>/gi, '\n• $1')
    .replace(/<p[^>]*>(.*?)<\/p>/gi, '\n\n$1\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function splitByHeadings(markdown: string): string[] {
  const parts = markdown.split(/(?=\n#{1,3}\s+)/g);
  return parts.filter((p) => p.trim().length > 0);
}

function extractFirstHeading(text: string): string {
  const match = text.match(/^#{1,3}\s+(.+)$/m);
  return match ? match[1].trim() : '';
}

function estimateTokenCount(text: string): number {
  return Math.ceil(text.length / 4);
}
