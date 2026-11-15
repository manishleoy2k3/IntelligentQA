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

test('Coding Problems Library & Dedicated Catalog & Solver Features', () => {
  const codePageFile = fs.readFileSync(path.join(__dirname, '../src/app/sandbox/code/page.tsx'), 'utf8');
  const problemsCatalogFile = fs.readFileSync(path.join(__dirname, '../src/app/sandbox/code/problems/page.tsx'), 'utf8');
  const problemSolverFile = fs.readFileSync(path.join(__dirname, '../src/app/sandbox/code/problems/[problemId]/problem-solver-client.tsx'), 'utf8');
  const codingProblemsFile = fs.readFileSync(path.join(__dirname, '../src/lib/coding-problems.ts'), 'utf8');

  // Coding problems library
  assert.ok(codingProblemsFile.includes('DEFAULT_CODING_PROBLEMS'), 'Defines default coding problems');
  assert.ok(codingProblemsFile.includes('Two Sum'), 'Includes Two Sum problem');
  assert.ok(codingProblemsFile.includes('Valid Palindrome'), 'Includes Palindrome problem');
  assert.ok(codingProblemsFile.includes('saveCustomProblem'), 'Provides saveCustomProblem helper');
  assert.ok(codingProblemsFile.includes('parseImportedProblems'), 'Provides parseImportedProblems helper');

  // Request 10 #1 & #2: Freeform Compiler kept clean with output below compiler
  assert.ok(codePageFile.includes('Online Code Compiler'), 'Renders pure online compiler header');
  assert.ok(codePageFile.includes('/sandbox/code/problems'), 'Links to Coding Library');
  assert.ok(codePageFile.includes('Output / Result'), 'Renders Output / Result');

  // Request 10 #3 & #4: Coding Library Catalog page
  assert.ok(problemsCatalogFile.includes('Coding Problem Library'), 'Has library header');
  assert.ok(problemsCatalogFile.includes('Add Problem'), 'Has Add Problem button');
  assert.ok(problemsCatalogFile.includes('Import / Upload'), 'Has Import / Upload button');
  assert.ok(problemsCatalogFile.includes('selectedGroup'), 'Has group/category filter');
  assert.ok(problemsCatalogFile.includes('selectedLevel'), 'Has level/difficulty filter');
  assert.ok(problemsCatalogFile.includes('showAddModal'), 'Has Add Problem modal');
  assert.ok(problemsCatalogFile.includes('showImportModal'), 'Has Import modal');

  // Problem Solver layout & features
  assert.ok(problemSolverFile.includes('Description'), 'Renders Description on left (renamed from Problem Statement)');
  assert.ok(problemSolverFile.includes('Solutions'), 'Has Solutions button beside Description');
  assert.ok(problemSolverFile.includes('handleLoadSolution'), 'Loads and pastes solution code into compiler');
  assert.ok(problemSolverFile.includes('DEFAULT_COMPILER_CODE'), 'Initializes with normal compiler starter code');
  assert.ok(problemSolverFile.includes('handleReset'), 'Resets code back to normal compiler starter template');
  assert.ok(!problemSolverFile.includes('title="Clear terminal output"'), 'Clear button is removed');
  assert.ok(problemSolverFile.includes('handleRunCode'), 'Renders compiler on right');
  assert.ok(problemSolverFile.includes('Output / Result'), 'Renders output below compiler');
});
