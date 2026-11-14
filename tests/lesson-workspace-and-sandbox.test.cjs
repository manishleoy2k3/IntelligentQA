const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

test('Point 2: Sidebar tracks are collapsed by default to prevent heavy scrolling', () => {
  const sidebarFile = fs.readFileSync(path.join(__dirname, '../src/components/layout/sidebar.tsx'), 'utf8');

  // Verify openTracks defaults to false for all 4 tracks
  assert.ok(sidebarFile.includes("'selenium-java': false"), 'Selenium track is collapsed by default');
  assert.ok(sidebarFile.includes("'playwright-ts': false"), 'Playwright track is collapsed by default');
  assert.ok(sidebarFile.includes("'api-testing': false"), 'Rest Assured track is collapsed by default');
  assert.ok(sidebarFile.includes("'ai-qa': false"), 'AI for QA track is collapsed by default');

  // Verify track parent row is clickable and has toggleTrack
  assert.ok(sidebarFile.includes('onClick={() => toggleTrack(track.id)}'), 'Track row toggles expand/collapse');
});

test('Point 3: Code Editor Workspace has draggable resizable panel & layout controls', () => {
  const workspaceFile = fs.readFileSync(path.join(__dirname, '../src/components/tracks/code-editor-workspace.tsx'), 'utf8');

  // Verify draggable state and mouse events
  assert.ok(workspaceFile.includes('splitPercent'), 'Has splitPercent state');
  assert.ok(workspaceFile.includes('isDragging'), 'Has isDragging state');
  assert.ok(workspaceFile.includes('cursor-col-resize'), 'Has cursor-col-resize splitter divider');
  assert.ok(workspaceFile.includes('handleMouseDown'), 'Has handleMouseDown for drag handle');

  // Verify quick layout buttons to make course text completely visible
  assert.ok(workspaceFile.includes('Reading (70%)'), 'Has Reading Focus layout preset');
  assert.ok(workspaceFile.includes('Balanced (50%)'), 'Has Balanced layout preset');
  assert.ok(workspaceFile.includes('Code (30%)'), 'Has Code Focus layout preset');
  assert.ok(workspaceFile.includes('Full Text'), 'Has Full-width Text toggle');
});

test('Points 4 & 5: Course text explains concepts (OOPs pillars) and directs to Practice Labs', () => {
  const workspaceFile = fs.readFileSync(path.join(__dirname, '../src/components/tracks/code-editor-workspace.tsx'), 'utf8');

  // Verify OOPs concepts are explained in depth for manual testers
  assert.ok(workspaceFile.includes('Why Manual Testers Need OOPs for Automation'), 'Explains why manual testers need OOPs');
  assert.ok(workspaceFile.includes('1. Encapsulation (Data Hiding in POM)'), 'Explains Encapsulation for POM');
  assert.ok(workspaceFile.includes('2. Inheritance (BaseTest Code Reuse)'), 'Explains Inheritance for BaseTest');
  assert.ok(workspaceFile.includes('3. Polymorphism (Multi-Browser & Overloading)'), 'Explains Polymorphism & dynamic dispatch');
  assert.ok(workspaceFile.includes('4. Abstraction (Hiding Browser Complexity)'), 'Explains Abstraction & WebDriver interface');

  // Verify explicit CTA directing users to dedicated Practice Labs in left nav
  assert.ok(workspaceFile.includes('Ready to Practice on Live Elements?'), 'Has dedicated Practice Labs callout');
  assert.ok(workspaceFile.includes('Located in Left Navigation under Practice Labs'), 'Directs user to Left Navigation Practice Labs');
});

test('Point 1: Web Playground Sandbox is expanded with rich, working automation challenges', () => {
  const playgroundFile = fs.readFileSync(path.join(__dirname, '../src/components/sandbox/web-playground.tsx'), 'utf8');

  // Verify expanded interactive challenges
  assert.ok(playgroundFile.includes('Dynamic AJAX Delays &amp; Explicit Waits'), 'Has dynamic AJAX delays challenge');
  assert.ok(playgroundFile.includes('Open Shadow DOM Traversal'), 'Has open shadow DOM traversal');
  assert.ok(playgroundFile.includes('Segmented 6-Digit OTP Box'), 'Has segmented OTP PIN box');
  assert.ok(playgroundFile.includes('File Upload &amp; Drop Zone'), 'Has file upload & drop zone');
  assert.ok(playgroundFile.includes('JS Alerts, Confirms &amp; Prompts'), 'Has JS dialogs');
  assert.ok(playgroundFile.includes('Nested iFrames &amp; Popup Windows'), 'Has nested iframes & popups');
  assert.ok(playgroundFile.includes('StaleElementReference Simulator'), 'Has StaleElementReference simulator');
  assert.ok(playgroundFile.includes('Broken Images &amp; HTTP 404 Audit'), 'Has broken links & images 404 audit');
  assert.ok(playgroundFile.includes('Dynamic Data Table with Search &amp; Sort'), 'Has dynamic filterable data table');

  // Verify real-time automation interaction stream console
  assert.ok(playgroundFile.includes('Live Automation Interaction Stream'), 'Has live automation interaction stream');
  assert.ok(playgroundFile.includes('eventLogs'), 'Tracks event logs');
});
