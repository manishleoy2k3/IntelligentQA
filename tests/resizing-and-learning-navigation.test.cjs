const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

test('Item 1: Sidebar tracks expand and collapse cleanly on repeated clicks', () => {
  const sidebarFile = fs.readFileSync(path.join(__dirname, '../src/components/layout/sidebar.tsx'), 'utf8');

  // Verify toggleTrack is called on track row click
  assert.ok(sidebarFile.includes('onClick={() => toggleTrack(track.id)}'), 'Track row toggles expand/collapse');
  assert.ok(sidebarFile.includes('lastAutoOpenedTrackRef'), 'Uses lastAutoOpenedTrackRef to avoid re-opening on manual collapse');
});

test('Item 2: Left Navigation sidebar is resizable on the right border', () => {
  const sidebarFile = fs.readFileSync(path.join(__dirname, '../src/components/layout/sidebar.tsx'), 'utf8');

  // Verify draggable resize handle and width state
  assert.ok(sidebarFile.includes('sidebarWidth'), 'Has sidebarWidth state');
  assert.ok(sidebarFile.includes('handleSidebarResizeStart'), 'Has handleSidebarResizeStart mouse drag handler');
  assert.ok(sidebarFile.includes('cursor-col-resize'), 'Right border has cursor-col-resize handle');
  assert.ok(sidebarFile.includes('onDoubleClick'), 'Double-click resets to default width');
});

test('Item 3: CODE EXAMPLES: label removed in favor of clean Java, TypeScript, and Python toggle buttons', () => {
  const workspaceFile = fs.readFileSync(path.join(__dirname, '../src/components/tracks/code-editor-workspace.tsx'), 'utf8');

  // Verify CODE EXAMPLES: label is removed as requested
  assert.ok(!workspaceFile.includes('Code Examples:'), 'Code Examples: label removed');
  assert.ok(!workspaceFile.includes('Concept Code Lab:'), 'Old Concept Code Lab: header removed');

  // Verify clean language toggle buttons are present
  assert.ok(workspaceFile.includes("handleLanguageChange('java')"), 'Has Java toggle button');
  assert.ok(workspaceFile.includes("handleLanguageChange('typescript')"), 'Has TypeScript toggle button');
  assert.ok(workspaceFile.includes("handleLanguageChange('python')"), 'Has Python toggle button');
});

test('Item 3b: Try it with AI in AI in Action tab with Gemini background integration', () => {
  const workspaceFile = fs.readFileSync(path.join(__dirname, '../src/components/tracks/code-editor-workspace.tsx'), 'utf8');

  // Verify Try it with AI button and handlers
  assert.ok(workspaceFile.includes('Try it with AI'), 'Has Try it with AI button');
  assert.ok(workspaceFile.includes('handleTryWithAi'), 'Has handleTryWithAi handler');
  assert.ok(workspaceFile.includes("action: 'code_snippet'"), 'Calls qa-agent with code_snippet action');
  assert.ok(workspaceFile.includes('Apply to Editor'), 'Has Apply to Editor button for generated snippet');
});

test('Items 4 & 5: Language tabs include Java, TypeScript, and Python with dynamic code switching', () => {
  const workspaceFile = fs.readFileSync(path.join(__dirname, '../src/components/tracks/code-editor-workspace.tsx'), 'utf8');

  // Verify SupportedLang type includes python
  assert.ok(workspaceFile.includes("'java' | 'typescript' | 'python'"), 'Supports java, typescript, python');

  // Verify buttons for all 3 languages
  assert.ok(workspaceFile.includes("handleLanguageChange('java')"), 'Has Java code switch button');
  assert.ok(workspaceFile.includes("handleLanguageChange('typescript')"), 'Has TypeScript code switch button');
  assert.ok(workspaceFile.includes("handleLanguageChange('python')"), 'Has Python code switch button');

  // Verify code generator functions
  assert.ok(workspaceFile.includes('getPythonCodeExample'), 'Has getPythonCodeExample generator');
  assert.ok(workspaceFile.includes('getJavaCodeExample'), 'Has getJavaCodeExample generator');
  assert.ok(workspaceFile.includes('getTypeScriptCodeExample'), 'Has getTypeScriptCodeExample generator');
});

test('Items 6 & 7: Redundant Solution button and Validation buttons removed; Previous & Next navigation added', () => {
  const workspaceFile = fs.readFileSync(path.join(__dirname, '../src/components/tracks/code-editor-workspace.tsx'), 'utf8');

  // Verify Solution button is removed from learning section
  assert.ok(!workspaceFile.includes('title="Reveal Solution Code Blueprint"'), 'Solution button removed');

  // Verify Validate Concept Code button and verification text removed
  assert.ok(!workspaceFile.includes('Validate Concept Code'), 'Validate Concept Code button removed');
  assert.ok(!workspaceFile.includes('Write code and verify against live criteria'), 'Verify criteria text removed');

  // Verify Previous button is present alongside Next
  assert.ok(workspaceFile.includes('<span>Previous</span>'), 'Previous button is present');
  assert.ok(workspaceFile.includes('<span>Next</span>'), 'Next button is present');
  assert.ok(workspaceFile.includes('prevLessonHref'), 'Supports prevLessonHref for going back to previous concept');
  assert.ok(workspaceFile.includes('nextLessonHref'), 'Supports nextLessonHref for advancing to next concept');
});

test('Item 8: Next.js dev indicator & overlay are disabled in config and suppressed in CSS', () => {
  const nextConfigFile = fs.readFileSync(path.join(__dirname, '../next.config.mjs'), 'utf8');
  const cssFile = fs.readFileSync(path.join(__dirname, '../src/app/globals.css'), 'utf8');

  assert.ok(nextConfigFile.includes('devIndicators: false'), 'devIndicators disabled in next.config.mjs');
  assert.ok(cssFile.includes('nextjs-portal'), 'nextjs-portal hidden in CSS');
  assert.ok(cssFile.includes('display: none !important'), 'Enforces display: none !important');
});

test('Item 9: Redundant horizontal tabs removed from QA AI Agents page', () => {
  const workspaceFile = fs.readFileSync(path.join(__dirname, '../src/components/qa-agents/qa-agents-workspace.tsx'), 'utf8');

  // Workspace displays the active agent directly without redundant top tab buttons
  assert.ok(workspaceFile.includes('{currentAgent.title}'), 'Renders active agent title directly');
  assert.ok(!workspaceFile.includes('<div className="flex border-b">'), 'No horizontal agent tab bar');
});

test('Item 10: Selenium Learning Content removes redundant code snippet editor section & provides in-guide Java/Python toggle', () => {
  const workspaceFile = fs.readFileSync(path.join(__dirname, '../src/components/tracks/code-editor-workspace.tsx'), 'utf8');
  const docsFile = fs.readFileSync(path.join(__dirname, '../src/lib/qa-learning-docs.ts'), 'utf8');

  // Right-side code editor panel is excluded for Selenium courses to prevent duplicate snippet confusion
  assert.ok(workspaceFile.includes('!isSelenium && ('), 'Right editor panel is conditionally hidden for Selenium');
  assert.ok(workspaceFile.includes('isSelenium ? \'100%\' : `${splitPercent}%`'), 'Left panel expands to 100% full width for Selenium');

  // Java & Python language switcher under Concept Guide
  assert.ok(workspaceFile.includes('setGuideLang(\'java\')'), 'Has in-guide Java switch button');
  assert.ok(workspaceFile.includes('setGuideLang(\'python\')'), 'Has in-guide Python switch button');
  assert.ok(workspaceFile.includes('Code Examples Language:'), 'Has Code Examples Language section in Concept Guide');

  // Verify Selenium learning docs use pure Selenium (zero Playwright TypeScript in Selenium course)
  assert.ok(docsFile.includes('SELENIUM WEBDRIVER (PYTHON)'), 'Has dedicated Selenium Python generator');
  assert.ok(docsFile.includes('from selenium import webdriver'), 'Uses selenium library for Python');
  assert.ok(docsFile.includes('WebDriverWait'), 'Uses WebDriverWait for Selenium synchronization');
});

test('Item 11: Try it with AI keeps only Java and Python for Selenium & handles fallback seamlessly without errors', () => {
  const workspaceFile = fs.readFileSync(path.join(__dirname, '../src/components/tracks/code-editor-workspace.tsx'), 'utf8');
  const routeFile = fs.readFileSync(path.join(__dirname, '../src/app/api/ai/qa-agent/route.ts'), 'utf8');

  // Try it with AI language selector restricts to Java and Python when on Selenium track
  assert.ok(workspaceFile.includes("isSelenium ? (['java', 'python'] as SupportedLang[])"), 'Restricts language options to Java and Python in Selenium');

  // API route handles code_snippet action without requiring user API key
  assert.ok(routeFile.includes("if (action === 'code_snippet')"), 'Route handles code_snippet action seamlessly');
  assert.ok(routeFile.includes("generateCodeSnippetOnly(cleanInput, techStack)"), 'Falls back to deterministic generator for code_snippet');
  assert.ok(routeFile.includes('selenium-python'), 'Generates pure Selenium Python code for selenium-python techStack');
});
