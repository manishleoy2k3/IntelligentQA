const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

test('Request 1: PRACTICE LABS, AI TOOLS & AGENTS, and Interview Bank are collapsible matching Courses', () => {
  const sidebarFile = fs.readFileSync(path.join(__dirname, '../src/components/layout/sidebar.tsx'), 'utf8');

  // Verify collapsible states exist
  assert.ok(sidebarFile.includes('practiceLabsOpen'), 'Has practiceLabsOpen state');
  assert.ok(sidebarFile.includes('setPracticeLabsOpen'), 'Has setPracticeLabsOpen state updater');
  assert.ok(sidebarFile.includes('aiToolsSectionOpen'), 'Has aiToolsSectionOpen state');
  assert.ok(sidebarFile.includes('setAiToolsSectionOpen'), 'Has setAiToolsSectionOpen state updater');
  assert.ok(sidebarFile.includes('interviewBankOpen'), 'Has interviewBankOpen state');
  assert.ok(sidebarFile.includes('setInterviewBankOpen'), 'Has setInterviewBankOpen state updater');

  // Verify all sections use Chevron toggles matching Courses
  assert.ok(sidebarFile.includes('onClick={() => setPracticeLabsOpen(!practiceLabsOpen)}'), 'Practice Labs toggleable on click');
  assert.ok(sidebarFile.includes('onClick={() => setAiToolsSectionOpen(!aiToolsSectionOpen)}'), 'AI Tools toggleable on click');
  assert.ok(sidebarFile.includes('onClick={() => setInterviewBankOpen(!interviewBankOpen)}'), 'Interview Bank toggleable on click');

  // Verify badge counts exist
  assert.ok(sidebarFile.includes('5 Labs'), 'Practice Labs displays 5 Labs badge');
  assert.ok(sidebarFile.includes('AI Suite'), 'AI Tools displays AI Suite badge');
  assert.ok(sidebarFile.includes('500+ Qs'), 'Interview Bank displays 500+ Qs badge');
});

test('Request 2: Fonts are standardized and consistent across parent and child items', () => {
  const sidebarFile = fs.readFileSync(path.join(__dirname, '../src/components/layout/sidebar.tsx'), 'utf8');

  // Parent buttons all share navItemClass (text-sm font-medium)
  assert.ok(sidebarFile.includes('navItemClass(isPracticeActive)'), 'Practice Labs parent uses navItemClass');
  assert.ok(sidebarFile.includes('navItemClass(isAiToolsActive)'), 'AI Tools parent uses navItemClass');
  assert.ok(sidebarFile.includes('navItemClass(isInterviewActive)'), 'Interview Bank parent uses navItemClass');

  // Child items have clean typography
  assert.ok(sidebarFile.includes('Web Automation Lab'), 'Renders readable subtext');
  assert.ok(sidebarFile.includes('API Testing Lab'), 'Renders readable subtext');
  assert.ok(sidebarFile.includes('Compiler &amp; Runner'), 'Renders readable subtext');
});

test('Request 3: Hands-On Coding Lab provides Problem Library, Add Problem, and Import/Upload options', () => {
  const codePageFile = fs.readFileSync(path.join(__dirname, '../src/app/sandbox/code/page.tsx'), 'utf8');
  const codingProblemsFile = fs.readFileSync(path.join(__dirname, '../src/lib/coding-problems.ts'), 'utf8');

  // Coding problems library
  assert.ok(codingProblemsFile.includes('DEFAULT_CODING_PROBLEMS'), 'Defines default coding problems');
  assert.ok(codingProblemsFile.includes('Two Sum'), 'Includes Two Sum problem');
  assert.ok(codingProblemsFile.includes('Valid Palindrome'), 'Includes Palindrome problem');
  assert.ok(codingProblemsFile.includes('saveCustomProblem'), 'Provides saveCustomProblem helper');
  assert.ok(codingProblemsFile.includes('parseImportedProblems'), 'Provides parseImportedProblems helper');

  // Coding Lab page features
  assert.ok(codePageFile.includes('Problem:'), 'Renders problem selection dropdown');
  assert.ok(codePageFile.includes('Add Problem'), 'Has Add Problem button');
  assert.ok(codePageFile.includes('Import / Upload'), 'Has Import / Upload button');
  assert.ok(codePageFile.includes('showAddModal'), 'Has Add Problem modal state');
  assert.ok(codePageFile.includes('showImportModal'), 'Has Import modal state');
  assert.ok(codePageFile.includes('handleFileUpload'), 'Supports file upload for JSON/CSV');
  assert.ok(codePageFile.includes('handleExportJSON'), 'Supports exporting library to JSON');
});
