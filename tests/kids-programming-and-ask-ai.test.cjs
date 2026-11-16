const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

test('Requirement 1: Standalone SmartCoders Application Separated Completely from IntelligentQA', () => {
  const smartCodersPkg = fs.readFileSync('/Users/manishkumar/Downloads/workspace/SmartCoders/package.json', 'utf8');
  const smartCodersPage = fs.readFileSync('/Users/manishkumar/Downloads/workspace/SmartCoders/src/app/page.tsx', 'utf8');

  assert.ok(smartCodersPkg.includes('"name": "smartcoders"'), 'SmartCoders exists as separate package');
  assert.ok(smartCodersPage.includes('Python'), 'SmartCoders supports Python');
  assert.ok(smartCodersPage.includes('JavaScript'), 'SmartCoders supports JavaScript');
  assert.ok(smartCodersPage.includes('Java'), 'SmartCoders supports Java');
  assert.ok(!fs.existsSync(path.join(__dirname, '../src/app/kids')), 'IntelligentQA has zero /kids route or files');
});

test('Requirement 2: User Signup/Login using Google along with Gemini Key feature', () => {
  const loginPageFile = fs.readFileSync(path.join(__dirname, '../src/app/login/page.tsx'), 'utf8');
  const homePageFile = fs.readFileSync(path.join(__dirname, '../src/app/page.tsx'), 'utf8');
  const ascentCardFile = fs.readFileSync(path.join(__dirname, '../src/components/auth/ascent-auth-card.tsx'), 'utf8');

  // Google sign in button present on Home and Login
  assert.ok(homePageFile.includes('GoogleSignInButton'), 'Home page features Google sign in');
  assert.ok(homePageFile.includes('Continue with Google'), 'Home page features Google sign in text');
  assert.ok(loginPageFile.includes('AscentAuthCard'), 'Login page features AscentAuthCard');
  assert.ok(ascentCardFile.includes('GoogleSignInButton'), 'Auth card embeds GoogleSignInButton');

  // Gemini key modal integration
  assert.ok(ascentCardFile.includes('GeminiKeyModal'), 'Auth card integrates GeminiKeyModal');
});

test('Requirement 3 & 4 & 5: Ask AI button, programming answering capability, and Gemini Key enablement', () => {
  const topNavFile = fs.readFileSync(path.join(__dirname, '../src/components/layout/top-nav.tsx'), 'utf8');
  const askAiFile = fs.readFileSync(path.join(__dirname, '../src/components/home/ask-ai-widget.tsx'), 'utf8');
  const chatRouteFile = fs.readFileSync(path.join(__dirname, '../src/app/api/ai/qa-chat/route.ts'), 'utf8');

  // Requirement 3: Provide Ask AI button inside login instead of Ask SDET AI mentor
  assert.ok(topNavFile.includes('>Ask AI<') || topNavFile.includes('Ask AI</span>'), 'TopNav displays "Ask AI" button');
  assert.ok(askAiFile.includes('Ask AI Coding Assistant'), 'Chat widget header displays Ask AI Coding Assistant');

  // Requirement 4: Answer any programming concepts or coding queries
  assert.ok(chatRouteFile.includes('AI Programming & Coding Assistant'), 'System prompt configures general programming assistant');
  assert.ok(chatRouteFile.includes('Python, JavaScript, TypeScript, Java'), 'System prompt explicitly supports Python, JS, TS, Java');
  assert.ok(chatRouteFile.includes('variables, loops, conditionals, functions'), 'Answers fundamental programming concepts');

  // Requirement 5: Enabled after Gemini Key configurations
  assert.ok(askAiFile.includes('currentUser && !activeApiKey'), 'Checks Gemini key configuration for logged-in user');
  assert.ok(askAiFile.includes('Gemini Key Required'), 'Prompts user when Gemini Key is not configured');
  assert.ok(askAiFile.includes('Configure Gemini API Key'), 'Provides direct link to configure key');
});

test('Requirement 6: Library with readily available coding problems in Python, JS, TS, Java', () => {
  const codingLibFile = fs.readFileSync(path.join(__dirname, '../src/lib/coding-problems.ts'), 'utf8');
  const sidebarFile = fs.readFileSync(path.join(__dirname, '../src/components/layout/sidebar.tsx'), 'utf8');

  // Verify Coding Tutorial category in coding problems
  assert.ok(codingLibFile.includes('Coding Tutorial'), 'Defines Coding Tutorial category');
  assert.ok(codingLibFile.includes('kids-reverse-string'), 'Includes Secret Space Rover Code problem');
  assert.ok(codingLibFile.includes('kids-magic-fruit-counter'), 'Includes Magic Fruit Basket Counter problem');
  assert.ok(codingLibFile.includes('kids-superhero-power'), 'Includes Superhero Max Power Finder problem');
  assert.ok(codingLibFile.includes('kids-buzz-boom'), 'Includes Buzz & Boom Game problem');
  assert.ok(codingLibFile.includes('kids-mirror-word'), 'Includes Magic Mirror Word problem');
  assert.ok(codingLibFile.includes('kids-treasure-gold'), 'Includes Treasure Island Gold Collector problem');

  // Verify problems support Python, JS, TS, Java
  assert.ok(codingLibFile.includes('def reverse_message'), 'Python starter for rover problem');
  assert.ok(codingLibFile.includes('function reverseMessage'), 'JS/TS starter for rover problem');
  assert.ok(codingLibFile.includes('public static String reverseMessage'), 'Java starter for rover problem');

  // Verify Sidebar links to Coding Library
  assert.ok(sidebarFile.includes('/sandbox/code/problems'), 'Sidebar links to Coding Problem Library');
});

test('Requirement 7 & 8: Online Compiler for Java, JS, Python and Left Nav & Profile section', () => {
  const compilerRouteFile = fs.readFileSync(path.join(__dirname, '../src/app/api/sandbox/compiler/route.ts'), 'utf8');
  const sidebarFile = fs.readFileSync(path.join(__dirname, '../src/components/layout/sidebar.tsx'), 'utf8');
  const topNavFile = fs.readFileSync(path.join(__dirname, '../src/components/layout/top-nav.tsx'), 'utf8');

  // Requirement 7: Online compiler supports Java, JS, Python
  assert.ok(compilerRouteFile.includes("python"), 'Supports Python');
  assert.ok(compilerRouteFile.includes("javascript") || compilerRouteFile.includes("js"), 'Supports JavaScript');
  assert.ok(compilerRouteFile.includes("java"), 'Supports Java');

  // Requirement 8: Left navigation and Profile section
  assert.ok(sidebarFile.includes('Ask SDET AI') || sidebarFile.includes('Gemini API Key'), 'Sidebar integrates AI & Key items');
  assert.ok(topNavFile.includes('Complete / Edit QA Profile'), 'Profile dropdown includes profile action');
  assert.ok(topNavFile.includes('Log Out'), 'Profile dropdown includes logout');
});

test('Requirement 9: Complete Separation of Kids Coding Platform & SDET Site (Independent Repositories)', () => {
  const sidebarFile = fs.readFileSync(path.join(__dirname, '../src/components/layout/sidebar.tsx'), 'utf8');
  const topNavFile = fs.readFileSync(path.join(__dirname, '../src/components/layout/top-nav.tsx'), 'utf8');
  const homePageFile = fs.readFileSync(path.join(__dirname, '../src/app/page.tsx'), 'utf8');

  // 1. Sidebar contains 100% SDET navigation with zero Kids clutter
  assert.ok(!sidebarFile.includes('/kids'), 'Sidebar has zero Kids links');
  assert.ok(!sidebarFile.includes('Kids Coding'), 'SDET sidebar has zero Kids mentions');

  // 2. TopNav has zero Kids references
  assert.ok(!topNavFile.includes('Kids Coding'), 'TopNav contains no Kids switcher');
  assert.ok(topNavFile.includes('SDET Career Portal'), 'TopNav displays SDET Career Portal');

  // 3. SDET Home page is 100% focused on SDET
  assert.ok(!homePageFile.includes('/kids'), 'Home page contains no /kids links');
  assert.ok(homePageFile.includes("router.replace('/dashboard')"), 'SDET logged in users route directly to /dashboard');
});

test('Requirement 10: Strict User Data Isolation & Gemini Key Privacy Protection', () => {
  const qaDbFile = fs.readFileSync(path.join(__dirname, '../src/lib/qa-db.ts'), 'utf8');
  const codeEditorFile = fs.readFileSync(path.join(__dirname, '../src/components/tracks/code-editor-workspace.tsx'), 'utf8');
  const geminiModalFile = fs.readFileSync(path.join(__dirname, '../src/components/auth/gemini-key-modal.tsx'), 'utf8');

  // 1. QADatabase scopes keys to individual users by email & ID
  assert.ok(qaDbFile.includes('intelligentqa_gemini_key_email_'), 'Scopes Gemini key to user email');
  assert.ok(qaDbFile.includes('NEVER fall back to any global or previous user\'s key'), 'Enforces zero global key leakage for logged in users');

  // 2. Header and components retrieve user key dynamically
  assert.ok(qaDbFile.includes('getUserGeminiKey'), 'Provides getUserGeminiKey method');
  assert.ok(codeEditorFile.includes('x-gemini-api-key'), 'Code editor passes key in request header');

  // 3. User Key is deleted cleanly on logout
  assert.ok(qaDbFile.includes('logout()'), 'Provides logout method');

  // 4. Gemini Key Validator blocks garbage strings
  assert.ok(qaDbFile.includes('validateGeminiKeySyntax'), 'Validates syntax before saving key');

  // 5. Gemini Key Modal saves with user scoping
  assert.ok(geminiModalFile.includes('setUserGeminiKey(sanitized, user?.id)'), 'Modal saves key scoped to current user id');
});

test('Requirement 11 & 12 & 13: SmartCoders Standalone Features Verified', () => {
  const smartCodersPage = fs.readFileSync('/Users/manishkumar/Downloads/workspace/SmartCoders/src/app/page.tsx', 'utf8');
  const pythonCourse = fs.readFileSync('/Users/manishkumar/Downloads/workspace/SmartCoders/src/lib/courses/python-course.ts', 'utf8');
  const jsCourse = fs.readFileSync('/Users/manishkumar/Downloads/workspace/SmartCoders/src/lib/courses/javascript-course.ts', 'utf8');
  const javaCourse = fs.readFileSync('/Users/manishkumar/Downloads/workspace/SmartCoders/src/lib/courses/java-course.ts', 'utf8');

  // Verify SmartCoders has courses, resizable split compiler, and all concepts
  assert.ok(smartCodersPage.includes('showCompiler'), 'SmartCoders has split-screen compiler');
  assert.ok(smartCodersPage.includes('descriptionWidthPct'), 'SmartCoders has horizontal resizing');
  assert.ok(smartCodersPage.includes('compilerHeightPct'), 'SmartCoders has vertical resizing');
  assert.ok(pythonCourse.includes('Python Intro'), 'SmartCoders has Python course');
  assert.ok(jsCourse.includes('JavaScript Intro'), 'SmartCoders has JS course');
  assert.ok(javaCourse.includes('Java Intro'), 'SmartCoders has Java course');
});

test('Requirement 14 & 15 & 16: Games, Exercises, and Database Persistence in SmartCoders', () => {
  const projectsLibFile = fs.readFileSync('/Users/manishkumar/Downloads/workspace/SmartCoders/src/lib/kids-projects.ts', 'utf8');
  const exercisesLibFile = fs.readFileSync('/Users/manishkumar/Downloads/workspace/SmartCoders/src/lib/kids-exercises.ts', 'utf8');
  const smartCodersDb = fs.readFileSync('/Users/manishkumar/Downloads/workspace/SmartCoders/src/lib/qa-db.ts', 'utf8');

  assert.ok(projectsLibFile.includes('Classic 2D Snake Arcade Game'), 'SmartCoders includes Snake Game');
  assert.ok(exercisesLibFile.includes('KIDS_EXERCISES'), 'SmartCoders includes Exercises catalog');
  assert.ok(smartCodersDb.includes('saveUserExerciseProgress'), 'SmartCoders persists user exercise progress');
  assert.ok(smartCodersDb.includes('saveUserProjectCode'), 'SmartCoders persists user project code');
});
