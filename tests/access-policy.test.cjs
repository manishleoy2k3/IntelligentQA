const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

test('Guest Chat is limited to 3 questions in Ask AI SDET Mentor', () => {
  const askAiFile = fs.readFileSync(path.join(__dirname, '../src/components/home/ask-ai-widget.tsx'), 'utf8');

  assert.ok(askAiFile.includes('GUEST_MAX_QUESTIONS = 3'), 'Defines GUEST_MAX_QUESTIONS = 3');
  assert.ok(askAiFile.includes('isGuestLimitReached'), 'Calculates guest limit reached');
  assert.ok(askAiFile.includes('You have used your 3 free guest questions!'), 'Displays signup prompt when 3 questions reached');
  assert.ok(askAiFile.includes('Sign Up Free'), 'Includes Sign Up Free CTA');
  assert.ok(askAiFile.includes('/signup'), 'Links to signup page');
  assert.ok(askAiFile.includes('/login'), 'Links to login page');
});

test('Free preview lessons are open to guests and subsequent lessons require free signup', () => {
  const dbFile = fs.readFileSync(path.join(__dirname, '../src/lib/qa-db.ts'), 'utf8');

  assert.ok(dbFile.includes('isLessonLocked'), 'QADatabase exports isLessonLocked');
  assert.ok(dbFile.includes('if (isUserLoggedIn) return false'), 'All lessons are unlocked when user is logged in');
  assert.ok(dbFile.includes('pw-ts-basics'), 'First Playwright lesson is free preview');
  assert.ok(dbFile.includes('java-oops-framework'), 'First Java lesson is free preview');
  assert.ok(dbFile.includes('api-rest-crud'), 'First API lesson is free preview');

  const workspaceFile = fs.readFileSync(path.join(__dirname, '../src/components/tracks/code-editor-workspace.tsx'), 'utf8');
  assert.ok(workspaceFile.includes('isLocked'), 'CodeEditorWorkspace checks isLocked status');
  assert.ok(workspaceFile.includes('Lesson 2+ Unlocks With Free Account'), 'Shows overlay for locked lessons');
  assert.ok(workspaceFile.includes('disabled={isLocked}'), 'Disables code editor when locked');
});

test('User Gemini API Key is supported per-user to prevent shared quota burn', () => {
  const dbFile = fs.readFileSync(path.join(__dirname, '../src/lib/qa-db.ts'), 'utf8');
  assert.ok(dbFile.includes('getUserGeminiKey'), 'Provides getUserGeminiKey method');
  assert.ok(dbFile.includes('setUserGeminiKey'), 'Provides setUserGeminiKey method');

  const modalFile = fs.readFileSync(path.join(__dirname, '../src/components/auth/gemini-key-modal.tsx'), 'utf8');
  assert.ok(modalFile.includes('https://aistudio.google.com/app/apikey'), 'Directs user to Google AI Studio for free key');
  assert.ok(modalFile.includes('1,500 Requests per Day') || modalFile.includes('1,500 free requests'), 'Explains free tier quota');

  const qaAgentRoute = fs.readFileSync(path.join(__dirname, '../src/app/api/ai/qa-agent/route.ts'), 'utf8');
  assert.ok(qaAgentRoute.includes("req.headers.get('x-gemini-api-key')"), 'QA Agent forwards user key');

  const qaChatRoute = fs.readFileSync(path.join(__dirname, '../src/app/api/ai/qa-chat/route.ts'), 'utf8');
  assert.ok(qaChatRoute.includes("req.headers.get('x-gemini-api-key')"), 'QA Chat forwards user key');
});

test('Signup page unlocks all curriculum with zero cost guarantee', () => {
  const signupFile = fs.readFileSync(path.join(__dirname, '../src/app/signup/page.tsx'), 'utf8');

  assert.ok(signupFile.includes('Create Your Free Account'), 'Contains registration header');
  assert.ok(signupFile.includes('IntelligentQA Zero-Cost Guarantee'), 'States Zero-Cost Guarantee');
  assert.ok(signupFile.includes('QADatabase.signup'), 'Calls QADatabase.signup');
  assert.ok(signupFile.includes('GeminiKeyModal'), 'Includes GeminiKeyModal to prompt user after signup');
});

test('Header provides instant access to Gemini Key, Login, and Signup', () => {
  const headerFile = fs.readFileSync(path.join(__dirname, '../src/components/layout/header.tsx'), 'utf8');

  assert.ok(headerFile.includes('Gemini Key'), 'Header displays Gemini key management pill');
  assert.ok(headerFile.includes('Sign Up Free'), 'Header shows Sign Up Free button for guests');
  assert.ok(headerFile.includes('Log In'), 'Header shows Log In link for guests');
  assert.ok(headerFile.includes('intelligentqa_auth_changed'), 'Header reacts to auth changes');
  assert.ok(headerFile.includes('intelligentqa_key_changed'), 'Header reacts to key changes');
});
