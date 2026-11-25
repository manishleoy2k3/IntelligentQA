const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

test('Point 2: Sidebar tracks are collapsed by default to prevent heavy scrolling', () => {
  const sidebarFile = fs.readFileSync(
    path.join(__dirname, '../src/components/layout/sidebar.tsx'),
    'utf8'
  );

  // Verify openTracks defaults to false for all 4 tracks
  assert.ok(
    sidebarFile.includes("'selenium-java': false"),
    'Selenium track is collapsed by default'
  );
  assert.ok(
    sidebarFile.includes("'playwright-ts': false"),
    'Playwright track is collapsed by default'
  );
  assert.ok(
    sidebarFile.includes("'api-testing': false"),
    'Rest Assured track is collapsed by default'
  );
  assert.ok(sidebarFile.includes("'ai-qa': false"), 'AI for QA track is collapsed by default');

  // Verify track parent row is clickable and has toggleTrack
  assert.ok(
    sidebarFile.includes('onClick={() => toggleTrack(track.id)}'),
    'Track row toggles expand/collapse'
  );
});

test('Point 3: Code Editor Workspace has full-width clean reading guide with right-side editor panel removed', () => {
  const workspaceFile = fs.readFileSync(
    path.join(__dirname, '../src/components/tracks/code-editor-workspace.tsx'),
    'utf8'
  );

  // Verify full-width layout across all tracks
  assert.ok(workspaceFile.includes('w-full flex flex-col'), 'Has full-width guide layout');
  assert.ok(
    !workspaceFile.includes('RIGHT PANEL: Interactive Concept Code Lab'),
    'Right code example panel removed across all tracks'
  );

  // Verify redundant preset layout buttons are removed to free space for learning text
  assert.ok(
    !workspaceFile.includes('Reading (70%)'),
    'Reading preset button removed to free space'
  );
  assert.ok(
    !workspaceFile.includes('Balanced (50%)'),
    'Balanced preset button removed to free space'
  );
  assert.ok(!workspaceFile.includes('Code (30%)'), 'Code preset button removed to free space');
  assert.ok(!workspaceFile.includes('Full Text'), 'Full Text button removed');
});

test('Points 4 & 5: Course text explains concepts (OOPs pillars) and directs to Practice Labs', () => {
  const workspaceFile = fs.readFileSync(
    path.join(__dirname, '../src/components/tracks/code-editor-workspace.tsx'),
    'utf8'
  );

  // Verify OOPs concepts are explained in depth for manual testers
  assert.ok(
    workspaceFile.includes('Why Manual Testers Need OOPs for Automation'),
    'Explains why manual testers need OOPs'
  );
  assert.ok(
    workspaceFile.includes('1. Encapsulation (Data Hiding in POM)'),
    'Explains Encapsulation for POM'
  );
  assert.ok(
    workspaceFile.includes('2. Inheritance (BaseTest Code Reuse)'),
    'Explains Inheritance for BaseTest'
  );
  assert.ok(
    workspaceFile.includes('3. Polymorphism (Multi-Browser & Overloading)'),
    'Explains Polymorphism & dynamic dispatch'
  );
  assert.ok(
    workspaceFile.includes('4. Abstraction (Hiding Browser Complexity)'),
    'Explains Abstraction & WebDriver interface'
  );

  // Verify redundant "Ready to Practice on Live Elements?" is removed in favor of top toolbar link
  assert.ok(
    !workspaceFile.includes('Ready to Practice on Live Elements?'),
    'Redundant Ready to Practice callout removed'
  );
  assert.ok(
    workspaceFile.includes('Practice Lab'),
    'Toolbar provides direct Practice Lab access at top'
  );
  assert.ok(
    workspaceFile.includes('Step-by-Step Practical Implementation Guide'),
    'Has Playwright-docs style implementation guide'
  );
  assert.ok(
    workspaceFile.includes('Manual QA to Modern SDET Transition Bridge'),
    'Has manual-to-SDET transition comparative bridge'
  );
});

test('Point 1: Practice Sandboxes focus on active Code Compilers and safe redirect for retired web playground', () => {
  const nextConfig = fs.readFileSync(path.join(__dirname, '../next.config.mjs'), 'utf8');
  const codeSandboxPage = fs.readFileSync(
    path.join(__dirname, '../src/app/sandbox/code/page.tsx'),
    'utf8'
  );

  // Verify /sandbox/web safely redirects to /sandbox/code
  assert.ok(nextConfig.includes('/sandbox/web'), 'Configures /sandbox/web redirect');
  assert.ok(nextConfig.includes('/sandbox/code'), 'Redirects /sandbox/web to /sandbox/code');

  // Verify Code Sandbox supports multi-language execution
  assert.ok(codeSandboxPage.includes('java'), 'Supports Java');
  assert.ok(codeSandboxPage.includes('python'), 'Supports Python');
  assert.ok(codeSandboxPage.includes('javascript'), 'Supports JavaScript');
});
