const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

test('Knowledge base provides distinct, targeted short answers for manual tester inquiries', () => {
  const kbContent = fs.readFileSync(path.join(__dirname, '../src/lib/qa-knowledge-base.ts'), 'utf8');

  // Verify that key manual tester questions have their own unique shortAnswer
  const zeroCodingMatch = kbContent.includes('Yes, 100%. Every senior SDET started somewhere.');
  const timelineMatch = kbContent.includes('12 to 16 weeks (3–4 months)');
  const whichLanguageMatch = kbContent.includes('TypeScript with Playwright** is the top recommendation');
  const leetcodeMatch = kbContent.includes('95% of SDET interviews do NOT ask Hard/Medium LeetCode');
  const diffMatch = kbContent.includes('A Manual QA verifies software through the browser/app UI');
  const salaryMatch = kbContent.includes('50% to 100%+ salary increase');
  const apiMatch = kbContent.includes('100x faster than UI testing');

  assert.ok(zeroCodingMatch, 'Has zero coding answer');
  assert.ok(timelineMatch, 'Has timeline answer');
  assert.ok(whichLanguageMatch, 'Has which language answer');
  assert.ok(leetcodeMatch, 'Has leetcode/dsa answer');
  assert.ok(diffMatch, 'Has QA vs SDET answer');
  assert.ok(salaryMatch, 'Has salary answer');
  assert.ok(apiMatch, 'Has API vs UI answer');

  // Verify formatCrispChatAnswer ensures concise answers
  assert.ok(kbContent.includes('function formatCrispChatAnswer'), 'Has formatCrispChatAnswer');
  assert.ok(kbContent.includes('function synthesizeDynamicAnswer'), 'Has synthesizeDynamicAnswer');
});
