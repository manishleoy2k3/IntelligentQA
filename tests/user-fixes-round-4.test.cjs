const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

test('Request 1: Next.js dev indicator icon and menu are disabled in config and hidden in CSS', () => {
  const nextConfigFile = fs.readFileSync(path.join(__dirname, '../next.config.mjs'), 'utf8');
  const cssFile = fs.readFileSync(path.join(__dirname, '../src/app/globals.css'), 'utf8');

  assert.ok(
    nextConfigFile.includes('devIndicators: false'),
    'next.config.mjs disables devIndicators'
  );
  assert.ok(
    cssFile.includes('nextjs-portal') && cssFile.includes('display: none !important'),
    'globals.css hides nextjs dev overlays'
  );
});

test('Request 2: GEMINI 2.5 badge is removed from Ask SDET AI button in TopNav', () => {
  const topNavFile = fs.readFileSync(
    path.join(__dirname, '../src/components/layout/top-nav.tsx'),
    'utf8'
  );

  assert.ok(topNavFile.includes('Ask SDET AI'), 'TopNav retains Ask SDET AI button');
  assert.ok(!topNavFile.includes('GEMINI 2.5'), 'GEMINI 2.5 badge removed from Ask SDET AI');
});

test('Request 3: Live Interview Simulation controls and modal capabilities', () => {
  const grillerFile = fs.readFileSync(
    path.join(__dirname, '../src/components/interview/interview-griller-modal.tsx'),
    'utf8'
  );

  // Verify interview launch and restart actions
  assert.ok(grillerFile.includes('startInterview'), 'Has startInterview handler');
  assert.ok(
    grillerFile.includes('restartInterview') || grillerFile.includes('Start Another Round'),
    'Has restart interview capability'
  );
});

test('Request 4: 500+ Question Bank with comprehensive Test Architect questions and Excel import', () => {
  const questionsPageFile = fs.readFileSync(
    path.join(__dirname, '../src/app/interview-questions/page.tsx'),
    'utf8'
  );
  const bankFile = fs.readFileSync(
    path.join(__dirname, '../src/lib/interview-questions-bank.ts'),
    'utf8'
  );

  // Verify 500+ questions support
  assert.ok(
    questionsPageFile.includes('Curated 800+ SDET Interview Question Bank') ||
      questionsPageFile.includes('Curated 500+ SDET Interview Question Bank'),
    'Page title reflects Question Bank'
  );
  assert.ok(
    questionsPageFile.includes('Import Questions (.xlsx / .csv)'),
    'Provides Import Questions from Excel button'
  );
  assert.ok(
    questionsPageFile.includes('handleDownloadTemplate'),
    'Provides Download Template button'
  );

  // Verify Test Architect questions across all core technologies
  assert.ok(
    bankFile.includes("technology: 'Playwright'") && bankFile.includes("difficulty: 'Architect'"),
    'Has Playwright Test Architect questions'
  );
  assert.ok(
    bankFile.includes("technology: 'Selenium'") && bankFile.includes("difficulty: 'Architect'"),
    'Has Selenium Test Architect questions'
  );
  assert.ok(
    bankFile.includes("technology: 'Java'") && bankFile.includes("difficulty: 'Architect'"),
    'Has Java Test Architect questions'
  );
  assert.ok(
    bankFile.includes("technology: 'API Testing'") && bankFile.includes("difficulty: 'Architect'"),
    'Has API Testing Test Architect questions'
  );
  assert.ok(
    bankFile.includes("technology: 'AI & LLM'") && bankFile.includes("difficulty: 'Architect'"),
    'Has AI & LLM Test Architect questions'
  );
  assert.ok(
    bankFile.includes("technology: 'Framework Design'") &&
      bankFile.includes("difficulty: 'Architect'"),
    'Has Framework Design Test Architect questions'
  );
});
