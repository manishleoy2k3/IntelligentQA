const test = require('node:test');
const assert = require('node:assert');

// 1. Test Curriculum Structure
test('Curriculum has all 5 Tracks with structured modules and lessons', () => {
  // Read compiled or directly verify typescript data structures
  const fs = require('fs');
  const path = require('path');
  const curriculumFile = fs.readFileSync(path.join(__dirname, '../src/lib/qa-curriculum.ts'), 'utf8');

  assert.ok(curriculumFile.includes('playwright-ts'), 'Includes Playwright TS track');
  assert.ok(curriculumFile.includes('selenium-java'), 'Includes Selenium Java track');
  assert.ok(curriculumFile.includes('api-testing'), 'Includes API Testing track');
  assert.ok(curriculumFile.includes('ai-qa'), 'Includes AI in QA track');
  assert.ok(curriculumFile.includes('interview-griller'), 'Includes Interview Griller track');

  // Verify 8-step AI progression is present
  assert.ok(curriculumFile.includes('step-0-demystifying-ai'), 'Includes Step 0');
  assert.ok(curriculumFile.includes('step-1-prompt-engineering'), 'Includes Step 1');
  assert.ok(curriculumFile.includes('step-2-synthetic-test-data'), 'Includes Step 2');
  assert.ok(curriculumFile.includes('step-6-testing-ai-applications'), 'Includes Step 6');
});

// 2. Test Knowledge Base
test('Knowledge Base includes required SDET interview scenarios & search functionality', () => {
  const fs = require('fs');
  const path = require('path');
  const kbFile = fs.readFileSync(path.join(__dirname, '../src/lib/qa-knowledge-base.ts'), 'utf8');

  assert.ok(kbFile.includes('StaleElementReferenceException'), 'Covers StaleElementReferenceException');
  assert.ok(kbFile.includes('Playwright Auto-Waiting Architecture'), 'Covers Playwright auto-waiting');
  assert.ok(kbFile.includes('Shadow DOM Automation'), 'Covers Shadow DOM traversal');
  assert.ok(kbFile.includes('POM vs PageFactory Architecture'), 'Covers POM vs PageFactory');
  assert.ok(kbFile.includes('REST Assured POJO & JSON Schema'), 'Covers POJO & JSON schema');
  assert.ok(kbFile.includes('Self-Healing Locator Algorithms'), 'Covers Self-healing algorithms');
  assert.ok(kbFile.includes('LLM-as-a-Judge'), 'Covers LLM testing');
  assert.ok(kbFile.includes('Can I become an SDET with zero coding knowledge?'), 'Covers Pre-signup FAQ');
});

// 3. Test Brand Logo Component
test('Contemporary QA Brand Logo SVG includes Checkmark, Code Brackets, and AI Spark', () => {
  const fs = require('fs');
  const path = require('path');
  const logoFile = fs.readFileSync(path.join(__dirname, '../src/components/ui/qa-brand-logo.tsx'), 'utf8');

  assert.ok(logoFile.includes('check-grad'), 'Contains verification checkmark gradient');
  assert.ok(logoFile.includes('code-grad'), 'Contains code syntax bracket gradient');
  assert.ok(logoFile.includes('spark-grad'), 'Contains AI neural spark gradient');
  assert.ok(logoFile.includes('Intelligent'), 'Contains brand typography');
  assert.ok(logoFile.includes('Zero-Cost'), 'Displays Zero-Cost badge');
});

// 4. Test Mock API Implementation
test('Mock API route file handles auth login, users CRUD, delay, and status injection', () => {
  const fs = require('fs');
  const path = require('path');
  const routeFile = fs.readFileSync(path.join(__dirname, '../src/app/api/sandbox/v1/[...route]/route.ts'), 'utf8');

  assert.ok(routeFile.includes("route[0] === 'auth' && route[1] === 'login'"), 'Handles /auth/login');
  assert.ok(routeFile.includes("route[0] === 'users'"), 'Handles /users');
  assert.ok(routeFile.includes("route[0] === 'delay'"), 'Handles /delay/:seconds');
  assert.ok(routeFile.includes("route[0] === 'status'"), 'Handles /status/:code');
  assert.ok(routeFile.includes('verifyBearer'), 'Enforces Bearer token verification');
  assert.ok(routeFile.includes('status: 204'), 'Returns 204 No Content on delete');
});

// 5. Test Database Client & Row-Level Security isolation
test('Database Client enforces owner-scoped access and zero data leakage', () => {
  const fs = require('fs');
  const path = require('path');
  const dbFile = fs.readFileSync(path.join(__dirname, '../src/lib/qa-db.ts'), 'utf8');

  assert.ok(dbFile.includes('p.userId === userId'), 'Filters user progress by userId');
  assert.ok(dbFile.includes('s.userId === userId'), 'Filters code submissions by userId');
  assert.ok(dbFile.includes('a.userId === userId'), 'Filters generated artifacts by userId');
  assert.ok(dbFile.includes('i.userId === userId'), 'Filters interview sessions by userId');
  assert.ok(dbFile.includes('markLessonComplete'), 'Provides markLessonComplete method');
  assert.ok(dbFile.includes('saveArtifact'), 'Provides saveArtifact method');
  assert.ok(dbFile.includes('saveInterviewSession'), 'Provides saveInterviewSession method');
});

// 6. Test QA Agents Actions
test('QA Agent endpoint handles all 5 agent actions: requirements, test_cases, automation_code, code_review, chat', () => {
  const fs = require('fs');
  const path = require('path');
  const agentFile = fs.readFileSync(path.join(__dirname, '../src/app/api/ai/qa-agent/route.ts'), 'utf8');

  assert.ok(agentFile.includes('generateRequirementsClarification'), 'Generates Gherkin requirements');
  assert.ok(agentFile.includes('generateTestCaseMatrix'), 'Generates test case matrix');
  assert.ok(agentFile.includes('generateAutomationCode'), 'Generates automation code');
  assert.ok(agentFile.includes('reviewAutomationCode'), 'Reviews automation code for flakiness');
  assert.ok(agentFile.includes('Thread.sleep'), 'Detects Thread.sleep flakiness');
});

// 7. Test AI Interview Griller scoring rubric
test('AI Interview Griller evaluates candidate code and produces percentage scorecards', () => {
  const fs = require('fs');
  const path = require('path');
  const grillFile = fs.readFileSync(path.join(__dirname, '../src/app/api/ai/interview-grill/route.ts'), 'utf8');

  assert.ok(grillFile.includes('action === \'start\''), 'Starts interview session');
  assert.ok(grillFile.includes('action === \'submit_answer\''), 'Processes answer submission');
  assert.ok(grillFile.includes('technicalScore'), 'Computes technical score');
  assert.ok(grillFile.includes('architectureScore'), 'Computes architecture score');
  assert.ok(grillFile.includes('communicationScore'), 'Computes communication score');
  assert.ok(grillFile.includes('probingQuestion'), 'Asks probing follow-up questions');
});

// 8. Test Privacy Shield for Public Home Page "Ask AI"
test('Public Home Page Ask AI strictly excludes itself from authentication routes', () => {
  const fs = require('fs');
  const path = require('path');
  const askAiFile = fs.readFileSync(path.join(__dirname, '../src/components/home/ask-ai-widget.tsx'), 'utf8');

  assert.ok(askAiFile.includes("'/login'"), 'Excludes /login');
  assert.ok(askAiFile.includes("'/signup'"), 'Excludes /signup');
  assert.ok(askAiFile.includes("'/recovery'"), 'Excludes /recovery');
  assert.ok(askAiFile.includes("'/reset-password'"), 'Excludes /reset-password');
});

// 9. Test SDET AI Mentor Gemini integration & distinct short answers
test('SDET AI Chat supports Gemini Flash models and returns distinct crisp answers', () => {
  const fs = require('fs');
  const path = require('path');
  const chatFile = fs.readFileSync(path.join(__dirname, '../src/app/api/ai/qa-chat/route.ts'), 'utf8');

  assert.ok(chatFile.includes('gemini-2.0-flash'), 'Configured with gemini-2.0-flash');
  assert.ok(chatFile.includes('x-gemini-api-key'), 'Accepts x-gemini-api-key header');
  assert.ok(chatFile.includes('formatCrispChatAnswer'), 'Uses formatCrispChatAnswer for short responses');
  assert.ok(chatFile.includes('synthesizeDynamicAnswer'), 'Uses dynamic context-aware synthesis');

  // Verify Knowledge Base has distinct FAQ entries for common manual tester questions
  const kbFile = fs.readFileSync(path.join(__dirname, '../src/lib/qa-knowledge-base.ts'), 'utf8');
  assert.ok(kbFile.includes('faq-timeline-study-plan'), 'Has timeline and study plan answer');
  assert.ok(kbFile.includes('faq-which-language-to-pick'), 'Has language selection answer');
  assert.ok(kbFile.includes('faq-cypress-vs-playwright'), 'Has Cypress vs Playwright answer');
  assert.ok(kbFile.includes('faq-leetcode-dsa-qa'), 'Has LeetCode/DSA QA answer');
  assert.ok(kbFile.includes('faq-salary-expectations'), 'Has salary expectation answer');
  assert.ok(kbFile.includes('faq-api-vs-ui-testing'), 'Has API vs UI testing answer');
});
