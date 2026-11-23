const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

// =============================================================================
// PHASE 1 — LEARNING ACADEMY FRONTEND VERIFICATION TEST SUITE
// =============================================================================

test('Academy Frontend: All 12 required reusable UI components exist and export valid React components', () => {
  const componentFiles = [
    'src/components/learning/lesson-header.tsx',
    'src/components/learning/lesson-breadcrumb.tsx',
    'src/components/learning/lesson-section.tsx',
    'src/components/learning/architecture-diagram.tsx',
    'src/components/learning/code-block.tsx',
    'src/components/learning/info-callout.tsx',
    'src/components/learning/warning-callout.tsx',
    'src/components/learning/comparison-table.tsx',
    'src/components/learning/troubleshooting-section.tsx',
    'src/components/learning/previous-next-navigation.tsx',
    'src/components/learning/course-sidebar.tsx',
    'src/components/learning/course-search.tsx',
    'src/components/learning/academy-header.tsx',
    'src/components/learning/academy-shell.tsx',
  ];

  for (const relPath of componentFiles) {
    const fullPath = path.join(process.cwd(), relPath);
    assert.ok(fs.existsSync(fullPath), `Component file must exist: ${relPath}`);
    const code = fs.readFileSync(fullPath, 'utf-8');
    assert.ok(
      code.includes('export default function'),
      `Component ${relPath} must provide a default export`
    );
  }
});

test('Academy Frontend: Initial course navigation contains all 5 modules and 16 lessons', () => {
  const curriculumPath = path.join(process.cwd(), 'src/data/learning/academy-curriculum.ts');
  assert.ok(fs.existsSync(curriculumPath), 'Curriculum file must exist');

  const content = fs.readFileSync(curriculumPath, 'utf-8');

  // Verify 5 Modules
  assert.ok(content.includes('Introduction to AI'), 'Must include Introduction to AI module');
  assert.ok(content.includes('Prompt Engineering'), 'Must include Prompt Engineering module');
  assert.ok(content.includes('Context Engineering'), 'Must include Context Engineering module');
  assert.ok(content.includes('Model Context Protocol (MCP)'), 'Must include Model Context Protocol (MCP) module');
  assert.ok(content.includes('AI Agents for QA'), 'Must include AI Agents for QA module');

  // Verify all 16 required lessons
  const expectedLessons = [
    'What is Artificial Intelligence?',
    'What is Generative AI?',
    'What is an LLM?',
    'What is Prompt Engineering?',
    'Prompting Best Practices',
    'Advanced Prompt Patterns',
    'What is Context Engineering?',
    'RAG Architecture',
    'Context Management',
    'What is MCP?',
    'MCP Architecture',
    'Creating Custom MCP Servers',
    'Connecting External Tools',
    'What are AI Agents?',
    'Agentic Testing',
    'Building QA Automation Agents',
  ];

  for (const lessonTitle of expectedLessons) {
    assert.ok(
      content.includes(lessonTitle),
      `Curriculum must include lesson: "${lessonTitle}"`
    );
  }
});

test('Academy Frontend: Representative Demo Lessons contain complete rich content structures', () => {
  const curriculumPath = path.join(process.cwd(), 'src/data/learning/academy-curriculum.ts');
  const content = fs.readFileSync(curriculumPath, 'utf-8');

  // 1. What is an LLM?
  assert.ok(content.includes('les-what-is-llm'), 'Must contain What is an LLM demo lesson');
  assert.ok(content.includes('what-is-an-llm'), 'Must define slug what-is-an-llm');
  assert.ok(content.includes('End-to-End LLM Transformer Inference Pipeline'), 'LLM must have architecture diagram');
  assert.ok(content.includes('QAInferenceEngine'), 'LLM must have code example');
  assert.ok(content.includes('ContextWindowExceededError'), 'LLM must have troubleshooting errors');

  // 2. What is Prompt Engineering?
  assert.ok(content.includes('les-what-is-prompt-eng'), 'Must contain What is Prompt Engineering demo lesson');
  assert.ok(content.includes('what-is-prompt-engineering'), 'Must define slug what-is-prompt-engineering');
  assert.ok(content.includes('5-Tier Architecture of a Production QA Prompt'), 'Prompt Eng must have diagram');
  assert.ok(content.includes('buildApiTestPrompt'), 'Prompt Eng must have code example');
  assert.ok(content.includes('Flaky JSON Parsing'), 'Prompt Eng must have troubleshooting');

  // 3. What is MCP?
  assert.ok(content.includes('les-what-is-mcp'), 'Must contain What is MCP demo lesson');
  assert.ok(content.includes('what-is-mcp'), 'Must define slug what-is-mcp');
  assert.ok(content.includes('Model Context Protocol (MCP) Multi-Server Topology'), 'MCP must have diagram');
  assert.ok(content.includes('StdioServerTransport'), 'MCP must have code example');
  assert.ok(content.includes('JSON-RPC stdio stream'), 'MCP must have troubleshooting');
});

test('Academy Frontend: CodeBlock component supports copy to clipboard, line numbers, and theme tokens', () => {
  const codeBlockPath = path.join(process.cwd(), 'src/components/learning/code-block.tsx');
  const code = fs.readFileSync(codeBlockPath, 'utf-8');

  assert.ok(code.includes('navigator.clipboard.writeText'), 'Must implement clipboard copy');
  assert.ok(code.includes('showLineNumbers'), 'Must support line numbers');
  assert.ok(code.includes('copied'), 'Must have visual copied state indicator');
  assert.ok(code.includes('overflow-x-auto'), 'Must support horizontal scroll for long lines');
});

test('Academy Frontend: AcademyShell provides white/light theme by default and dark mode toggle', () => {
  const shellPath = path.join(process.cwd(), 'src/components/learning/academy-shell.tsx');
  const shellCode = fs.readFileSync(shellPath, 'utf-8');

  // Default theme requirement: "White/light theme by default"
  assert.ok(
    shellCode.includes("useState<'light' | 'dark'>('light')"),
    'Must default to light/white theme'
  );
  assert.ok(
    shellCode.includes('intelligentqa_academy_theme'),
    'Must persist theme preference in localStorage'
  );
  assert.ok(
    shellCode.includes('toggleTheme'),
    'Must provide toggleTheme function'
  );
  assert.ok(
    shellCode.includes("className={theme === 'dark' ? 'dark' : ''}"),
    'Must toggle dark class on container'
  );
});

test('Academy Frontend: CourseSidebar supports accordion expand/collapse, active lesson styling, and instant search filter', () => {
  const sidebarPath = path.join(process.cwd(), 'src/components/learning/course-sidebar.tsx');
  const sidebarCode = fs.readFileSync(sidebarPath, 'utf-8');

  assert.ok(sidebarCode.includes('toggleModule'), 'Must support expand/collapse of modules');
  assert.ok(sidebarCode.includes('filterQuery'), 'Must support live filtering of curriculum');
  assert.ok(sidebarCode.includes('activeLessonSlug'), 'Must highlight active lesson');
  assert.ok(sidebarCode.includes('border-l-2 border-emerald-500'), 'Must provide emerald accent highlight for active lesson');
});

test('Academy Frontend: Navigation supports previous/next links and keyboard shortcut for search', () => {
  const navPath = path.join(process.cwd(), 'src/components/learning/previous-next-navigation.tsx');
  const navCode = fs.readFileSync(navPath, 'utf-8');

  assert.ok(navCode.includes('Previous Lesson'), 'Must support Previous Lesson link');
  assert.ok(navCode.includes('Next Lesson'), 'Must support Next Lesson link');

  const shellPath = path.join(process.cwd(), 'src/components/learning/academy-shell.tsx');
  const shellCode = fs.readFileSync(shellPath, 'utf-8');
  assert.ok(
    shellCode.includes("e.key === 'k'") && shellCode.includes('metaKey'),
    'Must support Cmd/Ctrl+K keyboard shortcut for global search'
  );
});

test('Academy Frontend: Next.js App Router dynamic route /learning/[[...slug]] is configured with metadata', () => {
  const pagePath = path.join(process.cwd(), 'src/app/learning/[[...slug]]/page.tsx');
  assert.ok(fs.existsSync(pagePath), 'Route /learning/[[...slug]]/page.tsx must exist');

  const pageCode = fs.readFileSync(pagePath, 'utf-8');
  assert.ok(pageCode.includes('generateMetadata'), 'Must export generateMetadata for SEO');
  assert.ok(pageCode.includes('AcademyShell'), 'Must render AcademyShell');
  assert.ok(pageCode.includes('initialLessonSlug'), 'Must pass initialLessonSlug to AcademyShell');
});

test('Academy Frontend: AppShell coordinates Academy route and header links to Academy', () => {
  const appShellPath = path.join(process.cwd(), 'src/components/layout/app-shell.tsx');
  const appShellCode = fs.readFileSync(appShellPath, 'utf-8');

  assert.ok(
    appShellCode.includes("pathname?.startsWith('/learning')"),
    'AppShell must recognize /learning route'
  );

  const headerPath = path.join(process.cwd(), 'src/components/layout/header.tsx');
  const headerCode = fs.readFileSync(headerPath, 'utf-8');

  assert.ok(
    headerCode.includes("href: '/learning', label: 'Academy'"),
    'Header must link to /learning Academy'
  );
});
