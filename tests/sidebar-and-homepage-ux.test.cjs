const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

test('Logged in users on Home Page are immediately routed to Dashboard and do not see marketing landing details', () => {
  const homePageFile = fs.readFileSync(path.join(__dirname, '../src/app/page.tsx'), 'utf8');

  // Verify router.replace('/dashboard') is called for authenticated users
  assert.ok(
    homePageFile.includes("router.replace('/dashboard')"),
    'Redirects logged in users to /dashboard'
  );
  assert.ok(
    homePageFile.includes('Loading your SDET Learning Dashboard'),
    'Shows smooth loading state while routing'
  );
  assert.ok(
    homePageFile.includes('if (currentUser)'),
    'Guards marketing content from logged-in members'
  );
});

test('Side Left Navigation incorporates AscentWealth layout with Courses parent menu and child tracks', () => {
  const sidebarFile = fs.readFileSync(
    path.join(__dirname, '../src/components/layout/sidebar.tsx'),
    'utf8'
  );

  // 1. Dashboard top-level link
  assert.ok(sidebarFile.includes('/dashboard'), 'Sidebar links to /dashboard');
  assert.ok(sidebarFile.includes('Dashboard'), 'Sidebar has Dashboard nav item');

  // 2. Courses parent menu with child / sub-menu tracks
  assert.ok(sidebarFile.includes('Courses'), 'Sidebar has Courses parent menu');
  assert.ok(sidebarFile.includes('coursesOpen'), 'Courses parent menu has expandable state');
  assert.ok(sidebarFile.includes('Selenium (Java)'), 'Courses includes Selenium (Java) child item');
  assert.ok(sidebarFile.includes('/tracks/selenium-java'), 'Links to /tracks/selenium-java');
  assert.ok(sidebarFile.includes('Playwright (TS)'), 'Courses includes Playwright (TS) child item');
  assert.ok(sidebarFile.includes('/tracks/playwright-ts'), 'Links to /tracks/playwright-ts');
  assert.ok(
    sidebarFile.includes('Rest Assured (API)'),
    'Courses includes Rest Assured (API) child item'
  );
  assert.ok(sidebarFile.includes('/tracks/api-testing'), 'Links to /tracks/api-testing');
  assert.ok(
    sidebarFile.includes('AI Academy') || sidebarFile.includes('AI for QA'),
    'Courses includes AI for QA child item'
  );
  assert.ok(sidebarFile.includes('/tracks/ai-qa'), 'Links to /tracks/ai-qa');

  // 3. Practice Labs
  assert.ok(sidebarFile.includes('Online Compilers'), 'Sidebar has Online Compilers');
  assert.ok(sidebarFile.includes('/sandbox/code'), 'Links to /sandbox/code');
  assert.ok(sidebarFile.includes('Coding Library'), 'Sidebar has Coding Library');
  assert.ok(sidebarFile.includes('/sandbox/code/problems'), 'Links to /sandbox/code/problems');
  assert.ok(sidebarFile.includes('API Testing Lab'), 'Sidebar has API Testing Lab');
  assert.ok(sidebarFile.includes('/sandbox/api'), 'Links to /sandbox/api');

  // 4. AI Agents & Interview Griller
  assert.ok(sidebarFile.includes('QA AI Agents'), 'Sidebar has QA AI Agents');
  assert.ok(sidebarFile.includes('/qa-agents'), 'Links to /qa-agents');
  assert.ok(
    sidebarFile.includes('AI Mock Interviewer') || sidebarFile.includes('AI Interview Griller'),
    'Sidebar has AI Interview Griller'
  );
  assert.ok(sidebarFile.includes('/interview-griller'), 'Links to /interview-griller');

  // 5. Interview Bank
  assert.ok(
    sidebarFile.includes('Interview Questions Bank') || sidebarFile.includes('Interview Questions'),
    'Sidebar has Interview Questions'
  );
  assert.ok(sidebarFile.includes('/interview-questions'), 'Links to /interview-questions');

  // 6. User Profile removed from bottom left navigation (hosted exclusively in TopNav)
  assert.ok(
    !sidebarFile.includes('getInitials(currentUser.displayName)'),
    'Removed user profile from bottom left navigation'
  );

  // 7. Clean logo: ZERO-COST removed from top of left navigation
  assert.ok(
    sidebarFile.includes('showZeroCostBadge={false}'),
    'Removes ZERO-COST from top of left navigation'
  );
});

test('AppShell dynamically coordinates Side Left Navigation and Top Header for logged-in members', () => {
  const appShellFile = fs.readFileSync(
    path.join(__dirname, '../src/components/layout/app-shell.tsx'),
    'utf8'
  );
  const headerFile = fs.readFileSync(
    path.join(__dirname, '../src/components/layout/header.tsx'),
    'utf8'
  );

  assert.ok(appShellFile.includes('Sidebar'), 'Integrates Sidebar component');
  assert.ok(appShellFile.includes('Header'), 'Integrates Header component');
  assert.ok(
    appShellFile.includes('currentUser && !isAuthRoute'),
    'Renders sidebar specifically for logged-in members'
  );
  assert.ok(appShellFile.includes('mobileSidebarOpen'), 'Manages responsive mobile drawer state');
  assert.ok(
    appShellFile.includes('className="md:hidden"'),
    'Hides redundant top bar on desktop for logged-in members'
  );
  assert.ok(
    !headerFile.includes('SDET Learning Workspace'),
    'Removed redundant SDET Learning Workspace from top bar'
  );
});

test('TopNav contains Ask SDET AI, Notifications, and Profiles at top right corner', () => {
  const topNavFile = fs.readFileSync(
    path.join(__dirname, '../src/components/layout/top-nav.tsx'),
    'utf8'
  );

  // 1. "Ask SDET AI" button
  assert.ok(topNavFile.includes('Ask SDET AI'), 'Includes Ask SDET AI button in top right');
  assert.ok(topNavFile.includes('intelligentqa_open_ask_ai'), 'Fires Ask AI drawer event');

  // 2. Notifications bell with dropdown
  assert.ok(topNavFile.includes('Bell'), 'Includes Notifications icon');
  assert.ok(topNavFile.includes('notificationsOpen'), 'Manages notifications dropdown state');

  // 3. Profiles dropdown menu
  assert.ok(topNavFile.includes('user-profile-menu-container'), 'Contains profile menu container');
  assert.ok(
    topNavFile.includes('getInitials(currentUser.displayName)'),
    'Displays user initials avatar'
  );
  assert.ok(topNavFile.includes('Complete / Edit QA Profile'), 'Provides profile completion modal');
  assert.ok(topNavFile.includes('Log Out'), 'Provides logout inside profile dropdown');
});

test('Sidebar keeps Gemini API Key under AI Tools & Agents and all AI features are disabled without key', () => {
  const sidebarFile = fs.readFileSync(
    path.join(__dirname, '../src/components/layout/sidebar.tsx'),
    'utf8'
  );
  const askAiFile = fs.readFileSync(
    path.join(__dirname, '../src/components/home/ask-ai-widget.tsx'),
    'utf8'
  );
  const qaAgentsFile = fs.readFileSync(
    path.join(__dirname, '../src/components/qa-agents/qa-agents-workspace.tsx'),
    'utf8'
  );
  const grillFile = fs.readFileSync(
    path.join(__dirname, '../src/components/interview/interview-griller-modal.tsx'),
    'utf8'
  );

  // 1. Gemini key is accessible in navigation
  assert.ok(
    sidebarFile.includes('AI QA Agents') || sidebarFile.includes('AI Tools & Agents'),
    'Sidebar has AI Tools & Agents section'
  );
  assert.ok(
    sidebarFile.includes('Gemini') || topNavFile.includes('Gemini API Key'),
    'Navigation provides Gemini API Key configuration'
  );

  // 2. Ask SDET AI is disabled for logged-in users without key
  assert.ok(
    askAiFile.includes('currentUser && !activeApiKey'),
    'Ask AI detects logged-in user without key'
  );
  assert.ok(
    askAiFile.includes('AI Mentor Disabled · Gemini Key Required'),
    'Ask AI displays locked notice'
  );

  // 3. QA AI Agents are disabled without key
  assert.ok(
    qaAgentsFile.includes('!geminiKey || isGenerating'),
    'QA Agents disables Run button without key'
  );
  assert.ok(
    qaAgentsFile.includes('Gemini Key Required (Disabled)'),
    'QA Agents shows key required button label'
  );

  // 4. Interview Griller is disabled without key
  assert.ok(
    grillFile.includes('currentUser && !geminiKey'),
    'Interview Griller checks user key requirement'
  );
  assert.ok(
    grillFile.includes('setShowKeyModal(true)'),
    'Interview Griller opens key modal if key missing'
  );
});
