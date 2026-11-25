const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

test('Requirement 1: Sidebar keeps all AI Agents as child menu below QA AI Agents with key protection', () => {
  const sidebarFile = fs.readFileSync(
    path.join(__dirname, '../src/components/layout/sidebar.tsx'),
    'utf8'
  );

  // Verify parent menu with Agents
  assert.ok(
    sidebarFile.includes('AI QA Agents') || sidebarFile.includes('QA AI Agents'),
    'Parent menu QA AI Agents exists'
  );
  assert.ok(sidebarFile.includes('Agents'), 'Displays Agents badge');
  assert.ok(sidebarFile.includes('qaAgentsOpen'), 'Has collapsible state for QA AI Agents');

  // Verify all 5 child agents in left navigation
  assert.ok(sidebarFile.includes('/qa-agents?tab=requirements'), 'Has child link to requirements');
  assert.ok(sidebarFile.includes('Requirement Generator'), 'Child menu has Requirement Generator');

  assert.ok(sidebarFile.includes('/qa-agents?tab=test_cases'), 'Has child link to test cases');
  assert.ok(sidebarFile.includes('Test Case Generator'), 'Child menu has Test Case Generator');

  assert.ok(
    sidebarFile.includes('/qa-agents?tab=automation_code'),
    'Has child link to automation code'
  );
  assert.ok(
    sidebarFile.includes('Automation Code Generator') ||
      sidebarFile.includes('Automation Generator'),
    'Child menu has Automation Code Generator'
  );

  assert.ok(sidebarFile.includes('/qa-agents?tab=code_review'), 'Has child link to code review');
  assert.ok(
    sidebarFile.includes('Code Reviewer') || sidebarFile.includes('Code Auditor'),
    'Child menu has Code Reviewer'
  );

  assert.ok(sidebarFile.includes('/qa-agents?tab=chat'), 'Has child link to chat');
  assert.ok(sidebarFile.includes('Senior SDET Mentor'), 'Child menu has Senior SDET Mentor');

  // Verify child menu clicks check Gemini key
  assert.ok(sidebarFile.includes('handleAgentClick'), 'Child links trigger handleAgentClick');
  assert.ok(
    sidebarFile.includes('QADatabase.getUserGeminiKey'),
    'Checks user Gemini key before navigating'
  );
});

test('Requirement 2: Requirement Generator and Generate Requirements button renaming', () => {
  const workspaceFile = fs.readFileSync(
    path.join(__dirname, '../src/components/qa-agents/qa-agents-workspace.tsx'),
    'utf8'
  );
  const agentApiFile = fs.readFileSync(
    path.join(__dirname, '../src/app/api/ai/qa-agent/route.ts'),
    'utf8'
  );

  // Tab renamed
  assert.ok(
    workspaceFile.includes('1. Requirement Generator'),
    'Tab renamed from Requirements Clarifier to Requirement Generator'
  );

  // Button renamed
  assert.ok(
    workspaceFile.includes("activeTab === 'requirements'"),
    'Distinguishes requirements tab'
  );
  assert.ok(
    workspaceFile.includes("'Generate Requirements'"),
    "Button text is 'Generate Requirements' on requirements tab"
  );
  assert.ok(
    workspaceFile.includes("'Generating Requirements...'"),
    "Button loading state says 'Generating Requirements...'"
  );

  // Backend API prompt updated
  assert.ok(
    agentApiFile.includes('Requirement Generator Agent'),
    'API route identifies as Requirement Generator Agent'
  );
});

test('Requirement 3: Export in Excel option for generated Requirements', () => {
  const workspaceFile = fs.readFileSync(
    path.join(__dirname, '../src/components/qa-agents/qa-agents-workspace.tsx'),
    'utf8'
  );
  const excelLibFile = fs.readFileSync(path.join(__dirname, '../src/lib/excel-export.ts'), 'utf8');

  // Export in Excel button in workspace
  assert.ok(
    workspaceFile.includes('Export in Excel'),
    'Export in Excel button exists in workspace'
  );
  assert.ok(
    workspaceFile.includes('exportRequirementsToExcel'),
    'Calls exportRequirementsToExcel for requirements'
  );

  // Excel generation logic in lib
  assert.ok(
    excelLibFile.includes('parseRequirementsToRows'),
    'Parses markdown requirements into structured tabular rows'
  );
  assert.ok(
    excelLibFile.includes('generateExcelWorkbookXml'),
    'Generates valid XML SpreadsheetML workbook'
  );
  assert.ok(excelLibFile.includes('application/vnd.ms-excel'), 'Uses Excel application MIME type');
  assert.ok(excelLibFile.includes('.xls'), 'Exports as spreadsheet file');
  assert.ok(excelLibFile.includes('Scenario:'), 'Extracts Gherkin scenario titles');
  assert.ok(excelLibFile.includes('REQ-'), 'Generates requirement IDs');
});

test('Requirement 4: Test Case Generator with multi-format file import (Word, Excel, PDF)', () => {
  const workspaceFile = fs.readFileSync(
    path.join(__dirname, '../src/components/qa-agents/qa-agents-workspace.tsx'),
    'utf8'
  );
  const fileParserFile = fs.readFileSync(path.join(__dirname, '../src/lib/file-parser.ts'), 'utf8');

  // Tab renamed
  assert.ok(
    workspaceFile.includes('2. Test Case Generator'),
    'Tab renamed from Test Case Synthesizer to Test Case Generator'
  );

  // File import input & capabilities
  assert.ok(
    workspaceFile.includes('accept=".docx,.xlsx,.xls,.csv,.pdf,.txt,.md"'),
    'Accepts Word, Excel, PDF, CSV, Text'
  );
  assert.ok(workspaceFile.includes('Import Requirements Document'), 'Provides File Import UI zone');
  assert.ok(workspaceFile.includes('handleFileUpload'), 'Handles file uploads');
  assert.ok(workspaceFile.includes('parseRequirementsFile'), 'Calls parseRequirementsFile');

  // Action button renamed
  assert.ok(
    workspaceFile.includes("'Generate Test Cases'"),
    "Button text is 'Generate Test Cases'"
  );
  assert.ok(
    workspaceFile.includes("'Generating Test Cases...'"),
    "Button loading state is 'Generating Test Cases...'"
  );

  // Parser supports word, excel, pdf
  assert.ok(fileParserFile.includes('parseDocxFile'), 'Parses Word docx');
  assert.ok(fileParserFile.includes('parseExcelFile'), 'Parses Excel xlsx/xls/csv');
  assert.ok(fileParserFile.includes('parsePdfFile'), 'Parses PDF documents');
});

test('Requirement 5: Target: playwright-ts is strictly hidden on Requirement and Test case generator Agents', () => {
  const workspaceFile = fs.readFileSync(
    path.join(__dirname, '../src/components/qa-agents/qa-agents-workspace.tsx'),
    'utf8'
  );

  // Top Stack selector condition: strictly only for automation_code and code_review
  assert.ok(
    workspaceFile.includes("activeTab === 'automation_code' || activeTab === 'code_review'"),
    'Stack selector is restricted to code and audit tabs'
  );

  // Input header target indicator: only rendered when activeTab is automation_code or code_review
  assert.ok(
    workspaceFile.includes("activeTab === 'automation_code' || activeTab === 'code_review' ?"),
    'Target display is conditioned only on code and audit tabs'
  );
  assert.ok(
    !workspaceFile.includes('Output: <strong className="text-cyan-600 dark:text-cyan-400 font-semibold">Gherkin BDD'),
    'Output: Gherkin BDD is removed as requested'
  );
  assert.ok(
    workspaceFile.includes(
      'QA Test Matrix'
    ),
    'Test Case Generator displays QA Test Matrix instead of Target'
  );
});
