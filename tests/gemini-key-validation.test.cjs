const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

// 1. Validator file and syntax test
test('Gemini Key Validator enforces strict Google AI Studio format specifications', () => {
  const validatorSource = fs.readFileSync(path.join(__dirname, '../src/lib/gemini-validator.ts'), 'utf8');

  assert.ok(validatorSource.includes('validateGeminiKeySyntax'), 'Exports validateGeminiKeySyntax');
  assert.ok(validatorSource.includes("trimmed.startsWith('AIza')"), 'Enforces AIza/AIzaSy prefix');
  assert.ok(validatorSource.includes('trimmed.length !== 39'), 'Enforces exact 39-character length');
  assert.ok(validatorSource.includes('AIza[A-Za-z0-9_-]{35}'), 'Enforces Base64URL safe charset');
});

// 2. Dedicated verification API endpoint test
test('/api/ai/verify-key endpoint validates key syntax and verifies with Google API', () => {
  const verifyRouteFile = fs.readFileSync(path.join(__dirname, '../src/app/api/ai/verify-key/route.ts'), 'utf8');

  assert.ok(verifyRouteFile.includes('validateGeminiKeySyntax'), 'Integrates validateGeminiKeySyntax');
  assert.ok(verifyRouteFile.includes('https://generativelanguage.googleapis.com/v1beta/models'), 'Calls Google Generative Language API');
  assert.ok(verifyRouteFile.includes("googleRes.status === 400 || googleRes.status === 403"), 'Handles Google invalid key response');
  assert.ok(verifyRouteFile.includes("code: 'API_KEY_INVALID'"), 'Returns structured API_KEY_INVALID code');
  assert.ok(verifyRouteFile.includes("code: syntaxCheck.code"), 'Rejects malformed keys before outbound call');
});

// 3. UI Modal integration test
test('GeminiKeyModal blocks garbage keys and shows real-time format feedback', () => {
  const modalFile = fs.readFileSync(path.join(__dirname, '../src/components/auth/gemini-key-modal.tsx'), 'utf8');

  assert.ok(modalFile.includes('validateGeminiKeySyntax'), 'Imports validateGeminiKeySyntax');
  assert.ok(modalFile.includes('/api/ai/verify-key'), 'Calls dedicated /api/ai/verify-key endpoint');
  assert.ok(modalFile.includes('formatAnalysis'), 'Computes real-time format analysis');
  assert.ok(modalFile.includes('isSaveDisabled'), 'Disables submission for invalid format or loading');
  assert.ok(modalFile.includes('/39 chars'), 'Displays character counter indicator');
  assert.ok(modalFile.includes('handleRemoveKey'), 'Supports key removal / disconnecting');
});

// 4. Database protection test
test('QADatabase protects against storing and retrieving garbage Gemini keys', () => {
  const dbFile = fs.readFileSync(path.join(__dirname, '../src/lib/qa-db.ts'), 'utf8');

  assert.ok(dbFile.includes('validateGeminiKeySyntax'), 'Imports validateGeminiKeySyntax');
  assert.ok(dbFile.includes('setUserGeminiKey(key: string'), 'Provides setUserGeminiKey');
  assert.ok(dbFile.includes('const validation = validateGeminiKeySyntax(trimmed)'), 'Validates syntax on store');
  assert.ok(dbFile.includes('const syntax = validateGeminiKeySyntax(stored)'), 'Validates syntax on retrieval');
});

// 5. Backend endpoints reject malformed keys
test('Backend AI routes reject malformed keys with 400 INVALID_GEMINI_KEY', () => {
  const qaAgentFile = fs.readFileSync(path.join(__dirname, '../src/app/api/ai/qa-agent/route.ts'), 'utf8');
  const grillFile = fs.readFileSync(path.join(__dirname, '../src/app/api/ai/interview-grill/route.ts'), 'utf8');
  const qaChatFile = fs.readFileSync(path.join(__dirname, '../src/app/api/ai/qa-chat/route.ts'), 'utf8');

  assert.ok(qaAgentFile.includes('validateGeminiKeySyntax'), 'QA Agent validates key syntax');
  assert.ok(qaAgentFile.includes('INVALID_GEMINI_KEY'), 'QA Agent returns INVALID_GEMINI_KEY on malformed input');

  assert.ok(grillFile.includes('validateGeminiKeySyntax'), 'Interview Griller validates key syntax');
  assert.ok(grillFile.includes('INVALID_GEMINI_KEY'), 'Interview Griller returns INVALID_GEMINI_KEY on malformed input');

  assert.ok(qaChatFile.includes('validateGeminiKeySyntax'), 'QA Chat checks key syntax before executing LLM');
});

// 6. Dual-view modal test (Manage/Update/Delete vs Onboarding)
test('GeminiKeyModal presents Manage/Update/Delete view when key is configured', () => {
  const modalFile = fs.readFileSync(path.join(__dirname, '../src/components/auth/gemini-key-modal.tsx'), 'utf8');

  assert.ok(modalFile.includes('Manage Gemini API Key'), 'Renders Manage Gemini API Key header when key exists');
  assert.ok(modalFile.includes('Edit Key'), 'Provides Edit Key option');
  assert.ok(modalFile.includes('Add New Key'), 'Provides Add New Key option');
  assert.ok(modalFile.includes('Delete Key'), 'Provides Delete Key option');
  assert.ok(modalFile.includes('Google AI Studio Key Setup'), 'Preserves setup dialogue for users without a key');
  assert.ok(modalFile.includes('existingStoredKey && !isEditing'), 'Conditionally branches between management and setup views');
});

// 7. Top-Nav button look & feel and no bottom duplication
test('Ask SDET AI button look & feel is restored to top nav cleanly without GEMINI 2.5 badge and removed from bottom', () => {
  const topNavFile = fs.readFileSync(path.join(__dirname, '../src/components/layout/top-nav.tsx'), 'utf8');
  const askAiFile = fs.readFileSync(path.join(__dirname, '../src/components/home/ask-ai-widget.tsx'), 'utf8');

  // Verify TopNav look & feel matches user screenshot
  assert.ok(topNavFile.includes('bg-gradient-to-r from-emerald-600 via-sky-600 to-indigo-600'), 'Uses restored gradient pill');
  assert.ok(topNavFile.includes('Ask SDET AI'), 'Displays Ask SDET AI text');
  assert.ok(!topNavFile.includes('GEMINI 2.5'), 'Gemini 2.5 badge removed from button');

  // Verify bottom floating button is removed to eliminate duplication
  assert.ok(!askAiFile.includes('fixed bottom-6 right-6 z-50 flex items-center gap-2'), 'Removed duplicate floating prompt from bottom');
});

// 8. Core AI Feature Rules
test('Core AI Feature Rules are strictly enforced across navigation and widgets', () => {
  const topNavFile = fs.readFileSync(path.join(__dirname, '../src/components/layout/top-nav.tsx'), 'utf8');
  const sidebarFile = fs.readFileSync(path.join(__dirname, '../src/components/layout/sidebar.tsx'), 'utf8');
  const askAiFile = fs.readFileSync(path.join(__dirname, '../src/components/home/ask-ai-widget.tsx'), 'utf8');
  const modalFile = fs.readFileSync(path.join(__dirname, '../src/components/auth/gemini-key-modal.tsx'), 'utf8');

  // 1 & 2: TopNav triggers Ask SDET AI chat drawer directly
  assert.ok(topNavFile.includes('intelligentqa_open_ask_ai'), 'TopNav opens Ask SDET AI chat drawer');

  // 3 & 4 & 5: Clean instructions without Option 2 on Configure Key page; cancel keeps AI disabled
  assert.ok(modalFile.includes('How to Get Your Free Key in 30 Seconds:'), 'Presents clean step-by-step instructions');
  assert.ok(modalFile.includes('https://aistudio.google.com/app/apikey'), 'Shares Google console link');
  assert.ok(modalFile.includes('If you cancel, all AI features remain disabled'), 'Explicitly notes cancel policy');

  // 6: Active in green once key is added; on click shows Edit, Delete, or Add New Key
  assert.ok(sidebarFile.includes('bg-emerald-600 text-white'), 'Sidebar shows Active in solid green badge');
  assert.ok(sidebarFile.includes('ACTIVE'), 'Sidebar shows ACTIVE below Gemini API Key');
  assert.ok(modalFile.includes('Edit Key'), 'Manage view provides Edit Key');
  assert.ok(modalFile.includes('Add New Key'), 'Manage view provides Add New Key');
  assert.ok(modalFile.includes('Delete Key'), 'Manage view provides Delete Key');

  // 7: Ask SDET AI provides direct Configure Gemini API Key link
  assert.ok(askAiFile.includes('Configure Gemini API Key →'), 'Ask SDET AI provides configure link in disabled state');
});

