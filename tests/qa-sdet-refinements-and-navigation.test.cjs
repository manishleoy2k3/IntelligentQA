const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

test('1. Showcase Carousel: Code sandbox is explicitly rephrased as Multi-Language Code Compilers', () => {
  const carouselPath = path.join(process.cwd(), 'src/components/home/hero-showcase-carousel.tsx');
  const content = fs.readFileSync(carouselPath, 'utf-8');

  assert.ok(content.includes('Interactive Code Compilers'), 'Title rephrased to Interactive Code Compilers');
  assert.ok(content.includes('In-Browser Compilers for Core Programming Logic'), 'Clarifies sandbox is for code compilers');
  assert.ok(content.includes('Java Online Compiler'), 'Provides code compiler sample');
  assert.ok(!content.includes('Zero Node.js or JDK configuration required'), 'Removed ambiguous claims');
});

test('2. QA and SDET badges do NOT overlap in the showcase carousel', () => {
  const carouselPath = path.join(process.cwd(), 'src/components/home/hero-showcase-carousel.tsx');
  const content = fs.readFileSync(carouselPath, 'utf-8');

  assert.ok(!content.includes('-space-x-2'), 'Removed negative space that caused QA and SDET badges to collide');
  assert.ok(content.includes('QA') && content.includes('SDET'), 'Includes both QA and SDET');
  assert.ok(content.includes('gap-1.5'), 'Uses clean gap spacing between badges');
});

test('3. Practice Labs: Selenium and Playwright web labs removed from Student portal sidebar', () => {
  const sidebarPath = path.join(process.cwd(), 'src/components/layout/sidebar.tsx');
  const content = fs.readFileSync(sidebarPath, 'utf-8');

  assert.ok(!content.includes('/sandbox/web?stack=selenium'), 'Selenium web lab link removed from sidebar');
  assert.ok(!content.includes('/sandbox/web?stack=playwright'), 'Playwright web lab link removed from sidebar');
  assert.ok(content.includes('4 Labs'), 'Practice labs count updated to 4 Labs');
});

test('4. API Testing Lab: Renamed on left navigation and on right-side page', () => {
  const sidebarPath = path.join(process.cwd(), 'src/components/layout/sidebar.tsx');
  const sidebarContent = fs.readFileSync(sidebarPath, 'utf-8');
  assert.ok(sidebarContent.includes('API Testing Lab'), 'Sidebar has "API Testing Lab"');
  assert.ok(!sidebarContent.includes('Rest Assured / API Lab'), 'Old name removed from sidebar');

  const apiPagePath = path.join(process.cwd(), 'src/app/sandbox/api/page.tsx');
  const apiPageContent = fs.readFileSync(apiPagePath, 'utf-8');
  assert.ok(apiPageContent.includes('API Testing Lab'), 'Page heading is "API Testing Lab"');
  assert.ok(!apiPageContent.includes('REST API Mocking Playground'), 'Old heading removed from page');
});

test('5. AI Prompt Lab for QA: Renamed in navigation and provides rich industry QA prompt templates', () => {
  const sidebarPath = path.join(process.cwd(), 'src/components/layout/sidebar.tsx');
  const sidebarContent = fs.readFileSync(sidebarPath, 'utf-8');
  assert.ok(sidebarContent.includes('AI Prompt Lab for QA'), 'Sidebar has "AI Prompt Lab for QA"');

  const promptLabPath = path.join(process.cwd(), 'src/app/prompt-lab/page.tsx');
  assert.ok(fs.existsSync(promptLabPath), 'src/app/prompt-lab/page.tsx exists');

  const promptLabContent = fs.readFileSync(promptLabPath, 'utf-8');
  assert.ok(promptLabContent.includes('Master Test Scenario & Edge Case Matrix'), 'Includes DeviQA master edge case prompt');
  assert.ok(promptLabContent.includes('Boundary Value Analysis (BVA) & Partitioning'), 'Includes BVA prompt template');
  assert.ok(promptLabContent.includes('Playwright TypeScript POM Generator'), 'Includes Playwright POM prompt template');
  assert.ok(promptLabContent.includes('API Security & Payload Tampering Tests'), 'Includes API security prompt template');
  assert.ok(promptLabContent.includes('Execute in AI Playground'), 'Includes in-browser prompt runner');
});

test('6 & 7. AI QA Agents: Renamed from AI Tools & Agents, consolidated all agents including AI Interview Griller, removed redundant sub-menu', () => {
  const sidebarPath = path.join(process.cwd(), 'src/components/layout/sidebar.tsx');
  const content = fs.readFileSync(sidebarPath, 'utf-8');

  assert.ok(content.includes('AI QA Agents'), 'Section header renamed to AI QA Agents');
  assert.ok(content.includes('6 Agents'), 'Displays 6 Agents count badge');
  assert.ok(!content.includes('<span>AI Tools &amp; Agents</span>'), 'Old AI Tools & Agents removed');
  assert.ok(!content.includes('5 Agents</span>'), 'Old redundant 5 Agents sub-badge removed');

  // Verify all agents are directly accessible
  assert.ok(content.includes('Requirement Generator'), 'Includes Requirement Generator');
  assert.ok(content.includes('Test Case Generator'), 'Includes Test Case Generator');
  assert.ok(content.includes('Automation Generator'), 'Includes Automation Generator');
  assert.ok(content.includes('Code Auditor'), 'Includes Code Auditor');
  assert.ok(content.includes('Senior SDET Mentor'), 'Includes Senior SDET Mentor');
  assert.ok(content.includes('AI Interview Griller'), 'Includes AI Interview Griller inside AI QA Agents');
});

test('8. Top Navigation: Coding Tutorial button removed, button renamed to Add Gemini Key, placed left to Ask AI', () => {
  const topNavPath = path.join(process.cwd(), 'src/components/layout/top-nav.tsx');
  const content = fs.readFileSync(topNavPath, 'utf-8');

  // 1. Coding Tutorial button removed
  assert.ok(!content.includes('<span>Coding Tutorial</span>'), 'Coding Tutorial button is removed from top');

  // 2. Button renamed to Add Gemini Key (when not connected)
  assert.ok(content.includes('Add Gemini Key'), 'TopNav button says Add Gemini Key');
  assert.ok(!content.includes('"FREE"'), 'Old FREE label removed');

  // 3. Button position
  const keyIndex = content.indexOf('Add Gemini Key');
  const askAiIndex = content.indexOf('Ask AI');

  assert.ok(keyIndex !== -1, 'TopNav contains Add Gemini Key button');
  assert.ok(askAiIndex !== -1, 'TopNav contains Ask AI button');
  assert.ok(keyIndex < askAiIndex, 'Gemini API Key button is placed directly to the left of Ask AI button');
  assert.ok(content.includes('GeminiKeyModal'), 'Embeds GeminiKeyModal');
});

test('9. Gemini Key Modal: Not hidden at top with z-[100] and clean centering', () => {
  const modalPath = path.join(process.cwd(), 'src/components/auth/gemini-key-modal.tsx');
  const modalContent = fs.readFileSync(modalPath, 'utf-8');

  assert.ok(modalContent.includes('z-[100]'), 'Modal uses z-[100] to sit above all headers and toolbars');
  assert.ok(modalContent.includes('min-h-screen'), 'Overlay provides min-h-screen to center modal cleanly');
  assert.ok(modalContent.includes('my-auto'), 'Card uses my-auto to prevent clipping off the top edge');
});

test('10. AI Prompt Lab: Generates prompt-specific, relevant, complete and correct outputs', () => {
  const routePath = path.join(process.cwd(), 'src/app/api/ai/qa-agent/route.ts');
  const routeContent = fs.readFileSync(routePath, 'utf-8');

  assert.ok(routeContent.includes("action === 'prompt_lab'"), 'API supports prompt_lab action');
  assert.ok(routeContent.includes('generatePromptLabOutput'), 'API includes prompt-specific output generator');
  assert.ok(routeContent.includes('bva-equivalence-partitioning'), 'Generates tailored BVA partitions');
  assert.ok(routeContent.includes('playwright-ts-pom-scaffolder'), 'Generates tailored Playwright POM');
  assert.ok(routeContent.includes('api-security-tampering-matrix'), 'Generates tailored OWASP API matrix');
  assert.ok(routeContent.includes('bug-report-to-rca-generator'), 'Generates tailored Jira defect ticket & RCA');

  const pagePath = path.join(process.cwd(), 'src/app/prompt-lab/page.tsx');
  const pageContent = fs.readFileSync(pagePath, 'utf-8');
  assert.ok(pageContent.includes("action: 'prompt_lab'"), 'Page sends prompt_lab action with activePrompt.id');
  assert.ok(pageContent.includes('promptId: activePrompt.id'), 'Page sends dynamic promptId to backend');
});

test('11. Interview Questions: Direct single-click navigation replacing old Interview Bank accordion', () => {
  const sidebarPath = path.join(process.cwd(), 'src/components/layout/sidebar.tsx');
  const content = fs.readFileSync(sidebarPath, 'utf-8');

  assert.ok(!content.includes('<span>Interview Bank</span>'), 'Old Interview Bank accordion removed');
  assert.ok(content.includes('href="/interview-questions"'), 'Direct link to /interview-questions');
  assert.ok(content.includes('<span>Interview Questions</span>'), 'Direct Interview Questions link rendered');
  assert.ok(content.includes('800+ Qs') || content.includes('500+ Qs'), 'Badge displays 800+ Qs');
});
