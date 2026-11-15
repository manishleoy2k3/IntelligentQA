const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

test('Requirement 1: Free Programming for Kids button on Home Page', () => {
  const homePageFile = fs.readFileSync(path.join(__dirname, '../src/app/page.tsx'), 'utf8');

  // Verify Free Programming for Kids button is on the Home page
  assert.ok(homePageFile.includes('Free Programming for Kids'), 'Home page contains Free Programming for Kids button');
  assert.ok(homePageFile.includes('href="/kids"'), 'Button links to /kids hub');
  assert.ok(homePageFile.includes('Ages 10–14'), 'Mentions target age group 10-14');
  assert.ok(homePageFile.includes('Python, JavaScript, Java'), 'Mentions supported languages');
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

test('Requirement 6: Library with readily available coding problems for Kids 10-14 in Python, JS, TS, Java', () => {
  const codingLibFile = fs.readFileSync(path.join(__dirname, '../src/lib/coding-problems.ts'), 'utf8');
  const kidsPageFile = fs.readFileSync(path.join(__dirname, '../src/app/kids/page.tsx'), 'utf8');

  // Verify Kids category in coding problems
  assert.ok(codingLibFile.includes('Kids Coding (Ages 10-14)'), 'Defines Kids Coding (Ages 10-14) category');
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

  // Verify Kids page displays problem library
  assert.ok(kidsPageFile.includes('Readily Available Coding Challenges'), 'Kids page has Coding Challenges section');
  assert.ok(kidsPageFile.includes('kidsProblems.map'), 'Maps over kids problems');
});

test('Requirement 7 & 8: Online Compiler for Java, JS, Python and Left Nav & Profile section', () => {
  const kidsPageFile = fs.readFileSync(path.join(__dirname, '../src/app/kids/page.tsx'), 'utf8');
  const codeCompilerFile = fs.readFileSync(path.join(__dirname, '../src/app/sandbox/code/page.tsx'), 'utf8');
  const sidebarFile = fs.readFileSync(path.join(__dirname, '../src/components/layout/sidebar.tsx'), 'utf8');
  const topNavFile = fs.readFileSync(path.join(__dirname, '../src/components/layout/top-nav.tsx'), 'utf8');

  // Requirement 7: Online Compiler for Java, Javascript, Python
  assert.ok(kidsPageFile.includes('Kids Online Compiler &amp; Runner'), 'Kids page has Online Compiler');
  assert.ok(kidsPageFile.includes("['python', 'javascript', 'typescript', 'java']"), 'Compiler supports Python, JS, TS, Java');
  assert.ok(codeCompilerFile.includes('Online Python Compiler'), 'Sandbox code compiler supports Python');
  assert.ok(codeCompilerFile.includes('Online JavaScript Runner'), 'Sandbox code compiler supports JavaScript');
  assert.ok(codeCompilerFile.includes('Online Java Compiler'), 'Sandbox code compiler supports Java');

  // Requirement 8: Left Navigation and Profile section at Top
  assert.ok(sidebarFile.includes('href="/kids"'), 'Sidebar left navigation links to /kids');
  assert.ok(sidebarFile.includes('Kids Coding (10–14)'), 'Sidebar displays Kids Coding');
  assert.ok(topNavFile.includes('profileMenuOpen'), 'TopNav provides Profile section at Top');
  assert.ok(topNavFile.includes('currentUser'), 'TopNav manages user profile session');
});
