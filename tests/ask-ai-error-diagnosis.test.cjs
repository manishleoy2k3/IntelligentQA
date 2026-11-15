const { describe, it } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

describe('Ask AI Debugging Intelligence & Clean UI', () => {
  const askAiWidgetPath = path.join(__dirname, '../src/components/home/ask-ai-widget.tsx');
  const qaChatRoutePath = path.join(__dirname, '../src/app/api/ai/qa-chat/route.ts');
  const qaKnowledgeBasePath = path.join(__dirname, '../src/lib/qa-knowledge-base.ts');

  const askAiContent = fs.readFileSync(askAiWidgetPath, 'utf8');
  const qaChatContent = fs.readFileSync(qaChatRoutePath, 'utf8');
  const qaKbContent = fs.readFileSync(qaKnowledgeBasePath, 'utf8');

  it('Requirement 3: Suggested question chips (faqChips) are completely removed from Ask AI chat modal', () => {
    assert.strictEqual(askAiContent.includes('faqChips'), false, 'faqChips array must be removed');
    assert.strictEqual(askAiContent.includes('0 Coding Background?'), false, '"0 Coding Background?" chip must be removed');
    assert.strictEqual(askAiContent.includes('Playwright vs Selenium?'), false, '"Playwright vs Selenium?" chip must be removed');
    assert.strictEqual(askAiContent.includes('Quick FAQ Pills'), false, 'Quick FAQ pills container must be removed');
  });

  it('Requirement 2: diagnoseCodeError is defined and integrated in qa-knowledge-base.ts', () => {
    assert.ok(qaKbContent.includes('export function diagnoseCodeError'), 'diagnoseCodeError function must be exported');
    assert.ok(qaKbContent.includes('catatonit'), 'diagnoseCodeError must detect catatonit container errors');
    assert.ok(qaKbContent.includes('eol while scanning string literal'), 'diagnoseCodeError must detect Python EOL string literal errors');
    assert.ok(qaKbContent.includes('indentationerror'), 'diagnoseCodeError must detect IndentationError');
    assert.ok(qaKbContent.includes('cannot find symbol'), 'diagnoseCodeError must detect Java cannot find symbol');
  });

  it('Requirement 2: /api/ai/qa-chat prioritizes diagnoseCodeError before generic FAQs', () => {
    assert.ok(qaChatContent.includes('diagnoseCodeError(query)'), 'Route must invoke diagnoseCodeError');
    const diagIndex = qaChatContent.indexOf('diagnoseCodeError(query)');
    const searchKbIndex = qaChatContent.indexOf('searchQAKnowledge(query)');
    assert.ok(diagIndex < searchKbIndex, 'diagnoseCodeError must execute before searchQAKnowledge');
  });

  it('Requirement 2: QA Chat route systemPrompt includes error & debugging guidelines', () => {
    assert.ok(qaChatContent.includes('ERROR & DEBUGGING RULES'), 'Prompt must instruct model on error debugging');
    assert.ok(qaChatContent.includes('Environment / Sandbox Infrastructure Error'), 'Prompt must distinguish environment crashes from code bugs');
    assert.ok(qaChatContent.includes('This is NOT an error in your code'), 'Must reassure users when infrastructure crashes occur');
  });
});
