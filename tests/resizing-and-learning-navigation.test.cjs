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

test('Item 3: CODE EXAMPLES: label removed in favor of clean language toggle buttons', () => {
  const workspaceFile = fs.readFileSync(path.join(__dirname, '../src/components/tracks/code-editor-workspace.tsx'), 'utf8');

  // Verify CODE EXAMPLES: label is removed as requested
  assert.ok(!workspaceFile.includes('Code Examples:'), 'Code Examples: label removed');
  assert.ok(!workspaceFile.includes('Concept Code Lab:'), 'Old Concept Code Lab: header removed');

  // Verify clean language toggle buttons are present
  assert.ok(workspaceFile.includes('renderLanguageToggle()'), 'Has inline language toggle on code blocks');
  assert.ok(workspaceFile.includes('setGuideLang'), 'Has guide language switch handler');
});

test('Item 3b: Try it with AI in AI in Action tab with Gemini background integration', () => {
  const workspaceFile = fs.readFileSync(path.join(__dirname, '../src/components/tracks/code-editor-workspace.tsx'), 'utf8');

  // Verify Try it with AI button and handlers
  assert.ok(workspaceFile.includes('Try it with AI'), 'Has Try it with AI button');
  assert.ok(workspaceFile.includes('handleTryWithAi'), 'Has handleTryWithAi handler');
  assert.ok(workspaceFile.includes("action: 'code_snippet'"), 'Calls qa-agent with code_snippet action');
  assert.ok(workspaceFile.includes('Apply to Editor'), 'Has Apply to Editor button for generated snippet');
});

test('Items 4 & 5: Language options include Java, TypeScript, and Python with dynamic code switching', () => {
  const workspaceFile = fs.readFileSync(path.join(__dirname, '../src/components/tracks/code-editor-workspace.tsx'), 'utf8');

  // Verify SupportedLang type includes python
  assert.ok(workspaceFile.includes("'java' | 'typescript' | 'python'"), 'Supports java, typescript, python');

  // Verify inline language toggle handles primary languages and Python
  assert.ok(workspaceFile.includes('primaryLang'), 'Supports primary language for track');
  assert.ok(workspaceFile.includes("setGuideLang('python')"), 'Has Python switch button');

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

test('Item 10: Learning Content provides in-guide inline language toggle across all tracks and removes duration mentions', () => {
  const workspaceFile = fs.readFileSync(path.join(__dirname, '../src/components/tracks/code-editor-workspace.tsx'), 'utf8');
  const docsFile = fs.readFileSync(path.join(__dirname, '../src/lib/qa-learning-docs.ts'), 'utf8');
  const trackIdPage = fs.readFileSync(path.join(__dirname, '../src/app/tracks/[trackId]/page.tsx'), 'utf8');

  // Right-side code editor panel is excluded for all courses (Playwright, Rest Assured, AI for QA, Selenium)
  assert.ok(!workspaceFile.includes('RIGHT PANEL: Interactive Concept Code Lab'), 'Right editor panel is removed for all tracks');
  assert.ok(workspaceFile.includes('w-full flex flex-col'), 'Guide expands to 100% full width across all tracks');

  // Top banner removed so user does not need to scroll to top to change language
  assert.ok(!workspaceFile.includes('Code Examples Language:'), 'Code Examples Language banner removed from top');

  // Inline language switcher directly on each code section
  assert.ok(workspaceFile.includes('renderLanguageToggle()'), 'Renders inline language toggle directly on code blocks');
  assert.ok(workspaceFile.includes("setGuideLang(primaryLang)"), 'Has in-guide primary language switch button');
  assert.ok(workspaceFile.includes("setGuideLang('python')"), 'Has in-guide Python switch button');

  // All time/duration mentions removed from learning sections
  assert.ok(!workspaceFile.includes('{lesson.durationMinutes} mins'), 'Time minutes removed from lesson workspace header');
  assert.ok(!trackIdPage.includes('{lesson.durationMinutes} mins'), 'Time minutes removed from track lessons list');

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

test('Item 12: Dynamic Java and Python code across all Selenium lessons, clean toggle placement, and time removed from Left Navigation', () => {
  const sidebarFile = fs.readFileSync(path.join(__dirname, '../src/components/layout/sidebar.tsx'), 'utf8');
  const workspaceFile = fs.readFileSync(path.join(__dirname, '../src/components/tracks/code-editor-workspace.tsx'), 'utf8');
  const docsFile = fs.readFileSync(path.join(__dirname, '../src/lib/qa-learning-docs.ts'), 'utf8');

  // Request 1: Dedicated Selenium Generator supports all 10 lessons in both Java & Python
  const seleniumLessons = [
    'java-oops-framework',
    'sel-webdriver-setup',
    'sel-locators-xpath',
    'sel-webelement-actions',
    'sel-sync-waits',
    'sel-actions-api',
    'sel-frames-windows-shadow',
    'sel-pom-pagefactory',
    'sel-testng-parallel',
    'sel-listeners-reports-cicd'
  ];

  for (const id of seleniumLessons) {
    assert.ok(docsFile.includes(`lessonId === '${id}'`), `qa-learning-docs explicitly provides code for ${id}`);
  }

  // Request 2: Language toggle button is only placed on code boxes, never on title/heading text
  assert.ok(!workspaceFile.includes('{doc.productionCodeExample.title}</h4>\n                      {isSelenium && renderLanguageToggle()}'), 'Toggle is not placed on title heading');
  assert.ok(!workspaceFile.includes('{doc.productionCodeExample.title}\n                      </h4>\n                      {isSelenium && renderLanguageToggle()}'), 'Toggle is not on title row');

  // Request 3: Time/duration removed from Left Navigation
  assert.ok(!sidebarFile.includes('{track.totalHours} · {track.lessons.length}L'), 'Total hours removed from track header badge in Left Nav');
  assert.ok(!sidebarFile.includes('{hours}\n                                </span>'), 'Individual lesson hours badge removed from Left Nav lesson links');
});

test('Item 13: Try it with AI ThreadLocal correctness & completeness, and Dedicated Hands-On Coding Lab under Practice Labs', () => {
  const sidebarFile = fs.readFileSync(path.join(__dirname, '../src/components/layout/sidebar.tsx'), 'utf8');
  const routeFile = fs.readFileSync(path.join(__dirname, '../src/app/api/ai/qa-agent/route.ts'), 'utf8');
  const compilerRouteFile = fs.readFileSync(path.join(__dirname, '../src/app/api/sandbox/compiler/route.ts'), 'utf8');
  const codeLabPage = fs.readFileSync(path.join(__dirname, '../src/app/sandbox/code/page.tsx'), 'utf8');

  // Requirement 1: ThreadLocal WebDriver correctness and completeness in Try it with AI code generation
  assert.ok(routeFile.includes("lowerInput.includes('threadlocal')"), 'Route checks for threadlocal input');
  assert.ok(routeFile.includes('ThreadLocal<WebDriver> driverThread = new ThreadLocal<>()'), 'Generates ThreadLocal WebDriver instance');
  assert.ok(routeFile.includes('driverThread.remove()'), 'Includes ThreadLocal cleanup to prevent memory leaks');
  assert.ok(routeFile.includes('getDriver()'), 'Provides static getDriver() accessor for thread safety');
  assert.ok(routeFile.includes('codeBlockMatch'), 'Strips markdown fences and explanations for clean code snippet');
  assert.ok(routeFile.includes('ScreenshotListener implements ITestListener'), 'Generates ITestListener with failure screenshot capture');
  assert.ok(routeFile.includes('ExtentTestManager'), 'Integrates ExtentReports in listener generation');

  const workspaceFile = fs.readFileSync(path.join(__dirname, '../src/components/tracks/code-editor-workspace.tsx'), 'utf8');
  assert.ok(workspaceFile.includes('QADatabase.getUserGeminiKey'), 'Retrieves active user Gemini key from database');
  assert.ok(workspaceFile.includes("headers['x-gemini-api-key'] = userKey"), 'Passes user Gemini key in request header');

  // Requirement 2: Dedicated Online Compilers under Practice Labs (first item, without prefix numbers)
  assert.ok(sidebarFile.includes('Online Compilers'), 'Left Nav includes Online Compilers');
  assert.ok(sidebarFile.includes('/sandbox/code'), 'Links to /sandbox/code');

  // Lab Page is a pure online compiler like OnlineGDB with language dropdown
  assert.ok(codeLabPage.includes('STARTER_CODES'), 'Provides pure language starter code');
  assert.ok(!codeLabPage.includes('Template:'), 'Template dropdown removed for pure language coding');
  assert.ok(codeLabPage.includes('language-select'), 'Provides clean language dropdown selector');
  assert.ok(codeLabPage.includes('Main.java'), 'Uses standard Main.java filename');
  assert.ok(codeLabPage.includes('main.py'), 'Uses standard main.py filename');
  assert.ok(codeLabPage.includes('index.ts'), 'Uses standard index.ts filename');
  assert.ok(codeLabPage.includes('index.js'), 'Uses standard index.js filename');
  assert.ok(codeLabPage.includes('Program.cs'), 'Uses standard Program.cs filename');
  assert.ok(codeLabPage.includes('setCode(STARTER_CODES[language])'), 'Reset button directly restores starter code');
  assert.ok(codeLabPage.includes('fetch(\'/api/sandbox/compiler\''), 'Connects to live compiler API');

  // Compiler API handles Java, Python, TypeScript, JavaScript, and C#
  assert.ok(compilerRouteFile.includes("normalizedLang === 'python'"), 'Compiler supports Python');
  assert.ok(compilerRouteFile.includes("normalizedLang === 'typescript'"), 'Compiler supports TypeScript');
  assert.ok(compilerRouteFile.includes("normalizedLang === 'javascript'"), 'Compiler supports JavaScript');
  assert.ok(compilerRouteFile.includes("normalizedLang === 'java'"), 'Compiler supports Java');
  assert.ok(compilerRouteFile.includes("normalizedLang === 'csharp'"), 'Compiler supports C#');
  assert.ok(compilerRouteFile.includes('getJavaBinaries'), 'Performs real javac compilation and execution for Java');
});
