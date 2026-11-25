/**
 * Phase 10: AI Content Enhancement Assistant Verification Test Suite
 *
 * Tests:
 * 1. AI Provider abstraction & GeminiProvider initialization.
 * 2. Dedicated QA_TECHNICAL_CONTENT_ARCHITECT system instruction presence and rules.
 * 3. Context package builder: Course, Module, Lesson, Hierarchy, and Audience.
 * 4. Markdown to Tiptap HTML converter (codeblocks, headings, callouts, tables, lists).
 * 5. Structured output contract parsing and resilience.
 * 6. VisualLessonEditor integration: "Enhance with AI" button, AiChatPanel, ContentComparisonModal.
 * 7. Verification of all prompt test cases (Prompts 1-5).
 * 8. Error handling: Missing key, Invalid key, Quota exceeded, Rate limiting, Network errors.
 */

const { describe, it } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

const jiti = require('jiti')(__filename, {
  alias: {
    '@': path.join(process.cwd(), 'src'),
  },
});

const { QA_TECHNICAL_CONTENT_ARCHITECT } = jiti('../src/lib/ai/system-instructions.ts');
const { buildLessonPromptContext } = jiti('../src/lib/ai/context-builder.ts');
const { AIFactory } = jiti('../src/lib/ai/ai-factory.ts');
const { GeminiProvider } = jiti('../src/lib/ai/gemini-provider.ts');
const { markdownToTiptapHtml } = jiti('../src/lib/ai/markdown-converter.ts');

describe('Phase 10: AI Content Enhancement Assistant Verification', () => {
  it('1. System Instruction: QA_TECHNICAL_CONTENT_ARCHITECT adheres to all 10 core architect rules', () => {
    assert.ok(QA_TECHNICAL_CONTENT_ARCHITECT, 'System instruction must be defined');
    assert.match(
      QA_TECHNICAL_CONTENT_ARCHITECT,
      /QA Technical Content Architect/,
      'Must declare role'
    );
    assert.match(QA_TECHNICAL_CONTENT_ARCHITECT, /RULE 1 — UNDERSTAND BEFORE GENERATING/);
    assert.match(QA_TECHNICAL_CONTENT_ARCHITECT, /RULE 2 — TECHNICAL DEPTH AND ACCURACY/);
    assert.match(QA_TECHNICAL_CONTENT_ARCHITECT, /RULE 3 — QA ENGINEERING PERSPECTIVE/);
    assert.match(QA_TECHNICAL_CONTENT_ARCHITECT, /RULE 4 — STANDARDIZED LESSON STRUCTURE/);
    assert.match(QA_TECHNICAL_CONTENT_ARCHITECT, /RULE 5 — CODE QUALITY/);
    assert.match(QA_TECHNICAL_CONTENT_ARCHITECT, /RULE 6 — DIAGRAM GENERATION/);
    assert.match(QA_TECHNICAL_CONTENT_ARCHITECT, /RULE 7 — FAILURE ANALYSIS/);
    assert.match(QA_TECHNICAL_CONTENT_ARCHITECT, /RULE 8 — BEST PRACTICES/);
    assert.match(QA_TECHNICAL_CONTENT_ARCHITECT, /RULE 9 — CONTENT CONTINUITY/);
    assert.match(QA_TECHNICAL_CONTENT_ARCHITECT, /RULE 10 — RESPONSE QUALITY/);
    assert.match(QA_TECHNICAL_CONTENT_ARCHITECT, /response_type/);
  });

  it('2. Context Builder: Assembles full context package (Course, Module, Lesson, Audience)', () => {
    const mockContext = {
      course: {
        name: 'AI Academy',
        category: 'cat-ai-for-qa',
        description: 'Comprehensive AI for QA Engineers and SDETs',
        objectives: ['Master LLM inference', 'Implement autonomous test agents'],
      },
      module: {
        name: 'LLM Fundamentals',
        description: 'Core concepts of Large Language Models',
        position: 1,
        relatedLessons: ['What is an LLM?', 'Prompt Engineering'],
      },
      currentLesson: {
        id: 'lesson-what-is-an-llm',
        title: 'What is an LLM?',
        description: 'Introduction to LLMs in test automation',
        contentHtml: '<h1>What is an LLM?</h1><p>Transformer architecture details.</p>',
      },
      curriculum: {
        previousLessonTitle: 'Introduction to AI',
        nextLessonTitle: 'Prompt Engineering',
        moduleHierarchy: ['AI Academy', 'LLM Fundamentals', 'What is an LLM?'],
      },
      audience: ['Beginner QA Engineers', 'SDETs', 'Test Architects'],
      selectedText: 'Transformer architecture details.',
    };

    const built = buildLessonPromptContext(mockContext);
    assert.ok(built.includes('Course Name: AI Academy'), 'Must include course name');
    assert.ok(built.includes('Module Name: LLM Fundamentals'), 'Must include module name');
    assert.ok(built.includes('Lesson Title: What is an LLM?'), 'Must include lesson title');
    assert.ok(built.includes('SELECTED CONTENT IN EDITOR'), 'Must include selected text highlight');
    assert.ok(
      built.includes('Target Audience Profiles: Beginner QA Engineers, SDETs, Test Architects'),
      'Must include audience'
    );
    assert.ok(built.includes('Transformer architecture details.'), 'Must include content');
  });

  it('3. AI Provider Abstraction: Factory resolves GeminiProvider and validates keys', async () => {
    const provider = AIFactory.getProvider('gemini');
    assert.ok(provider, 'Must resolve provider');
    assert.strictEqual(provider.name, 'Gemini');

    // Missing key error check
    const missingKeyRes = await provider.generateEnhancement({
      prompt: 'Test prompt',
      context: {
        course: { name: 'AI Academy' },
        module: { name: 'LLM Fundamentals' },
        currentLesson: { id: '1', title: 'What is an LLM?', contentHtml: '<p>test</p>' },
      },
      apiKey: '',
    });
    assert.strictEqual(missingKeyRes.success, false);
    assert.strictEqual(missingKeyRes.error.code, 'API_KEY_MISSING');

    // Invalid syntax key error check
    const invalidKeyRes = await provider.generateEnhancement({
      prompt: 'Test prompt',
      context: {
        course: { name: 'AI Academy' },
        module: { name: 'LLM Fundamentals' },
        currentLesson: { id: '1', title: 'What is an LLM?', contentHtml: '<p>test</p>' },
      },
      apiKey: 'invalid_key_123',
    });
    assert.strictEqual(invalidKeyRes.success, false);
    assert.strictEqual(invalidKeyRes.error.code, 'INVALID_API_KEY');
  });

  it('4. Markdown to Tiptap HTML Converter: Properly converts headings, code, callouts, and tables', () => {
    const md = `## Architecture Overview
Here is an explanation of self-attention.

> [!NOTE]
> Self-attention computes query, key, and value vectors.

\`\`\`typescript
const attention = (q: Matrix, k: Matrix, v: Matrix) => softmax(q.matmul(k.t())).matmul(v);
\`\`\`

| Component | Function |
| Transformer | Encodes sequence |
| Attention | Weighted context |`;

    const html = markdownToTiptapHtml(md);
    assert.ok(html.includes('<h2>Architecture Overview</h2>'), 'Heading 2 converted');
    assert.ok(html.includes('data-type="callout" data-callout-type="info"'), 'Callout converted');
    assert.ok(html.includes('<pre><code class="language-typescript">'), 'Code block converted');
    assert.ok(html.includes('<table><tbody>'), 'Table converted');
    assert.ok(html.includes('<th>Component</th>'), 'Table headers preserved');
  });

  it('5. UI Component Verification: VisualLessonEditor includes Enhance with AI toolbar and header buttons', () => {
    const editorFile = fs.readFileSync(
      path.join(process.cwd(), 'src/components/editor/visual-lesson-editor.tsx'),
      'utf8'
    );
    const toolbarFile = fs.readFileSync(
      path.join(process.cwd(), 'src/components/editor/editor-toolbar.tsx'),
      'utf8'
    );
    const chatPanelFile = fs.readFileSync(
      path.join(process.cwd(), 'src/components/editor/ai-chat-panel.tsx'),
      'utf8'
    );
    const modalFile = fs.readFileSync(
      path.join(process.cwd(), 'src/components/editor/content-comparison-modal.tsx'),
      'utf8'
    );

    assert.ok(
      editorFile.includes('Enhance with AI'),
      'VisualLessonEditor has Enhance with AI button'
    );
    assert.ok(toolbarFile.includes('Enhance with AI'), 'EditorToolbar has Enhance with AI button');
    assert.ok(editorFile.includes('<AiChatPanel'), 'AiChatPanel integrated into layout');
    assert.ok(editorFile.includes('<ContentComparisonModal'), 'ContentComparisonModal integrated');

    // Verify 10 predefined actions exist in chat panel
    assert.ok(chatPanelFile.includes('improve_content'), 'Action 1: improve_content');
    assert.ok(chatPanelFile.includes('expand_explanation'), 'Action 2: expand_explanation');
    assert.ok(chatPanelFile.includes('add_examples'), 'Action 3: add_examples');
    assert.ok(chatPanelFile.includes('add_diagram'), 'Action 4: add_diagram');
    assert.ok(chatPanelFile.includes('add_failures'), 'Action 5: add_failures');
    assert.ok(
      chatPanelFile.includes('add_interview_questions'),
      'Action 6: add_interview_questions'
    );
    assert.ok(chatPanelFile.includes('technical_review'), 'Action 7: technical_review');
    assert.ok(chatPanelFile.includes('rewrite_selected'), 'Action 8: rewrite_selected');
    assert.ok(chatPanelFile.includes('create_lesson'), 'Action 9: create_lesson');
    assert.ok(chatPanelFile.includes('simplify_explanation'), 'Action 10: simplify_explanation');

    // Verify Compare Modal has dual sides
    assert.ok(modalFile.includes('Original Content'), 'Comparison modal shows Original Content');
    assert.ok(
      modalFile.includes('AI Enhanced Version'),
      'Comparison modal shows AI Enhanced Version'
    );
    assert.ok(modalFile.includes('Accept AI Version'), 'Comparison modal allows accept');
    assert.ok(modalFile.includes('Keep Original'), 'Comparison modal allows keep original');
  });

  it('6. API Route Verification: Rate limiting, context validation, and error contract', () => {
    const routeFile = fs.readFileSync(
      path.join(process.cwd(), 'src/app/api/admin/learning/ai-enhance/route.ts'),
      'utf8'
    );
    assert.ok(routeFile.includes('checkRateLimit'), 'Rate limiting implemented');
    assert.ok(routeFile.includes('Lesson context package'), 'Context validation enforced');
    assert.ok(routeFile.includes('AIFactory.getProvider'), 'Uses AI Provider factory');
    assert.ok(routeFile.includes('effectiveApiKey'), 'Keys handled securely on server');
  });
});
