const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

test('Requirement 1: Autonomous SDET Suite and similar badge text removed from all QA Agents pages', () => {
  const workspaceFile = fs.readFileSync(
    path.join(__dirname, '../src/components/qa-agents/qa-agents-workspace.tsx'),
    'utf8'
  );
  const configFile = fs.readFileSync(
    path.join(__dirname, '../src/lib/qa-agents-config.ts'),
    'utf8'
  );

  // Badge text for all agents is cleared
  assert.ok(
    !workspaceFile.includes("badgeText: 'Autonomous SDET Suite"),
    'Workspace does not have badgeText Autonomous SDET Suite'
  );
  assert.ok(
    !workspaceFile.includes("badgeText: 'Staff SDET"),
    'Workspace does not have badgeText Staff SDET'
  );
  assert.ok(
    !configFile.includes("badgeText: 'Autonomous SDET Suite"),
    'Config does not have badgeText Autonomous SDET Suite'
  );
  assert.ok(
    !configFile.includes("badgeText: 'Staff SDET"),
    'Config does not have badgeText Staff SDET'
  );

  // Header badge conditionally renders only when badgeText is truthy
  assert.ok(
    workspaceFile.includes('currentAgent.badgeText ?'),
    'Badge conditionally renders only when badgeText is truthy'
  );
});

test('Requirement 2: Synthesized QA Test Matrix is renamed to Test case Generated', () => {
  const workspaceFile = fs.readFileSync(
    path.join(__dirname, '../src/components/qa-agents/qa-agents-workspace.tsx'),
    'utf8'
  );

  assert.ok(
    workspaceFile.includes("'Test case Generated'"),
    "Output title has 'Test case Generated'"
  );
  assert.ok(
    !workspaceFile.includes("'Synthesized QA Test Matrix'"),
    "Old 'Synthesized QA Test Matrix' label is completely removed"
  );
});

test('Requirement 3: Left and right sections resizable across all QA Agent pages', () => {
  const workspaceFile = fs.readFileSync(
    path.join(__dirname, '../src/components/qa-agents/qa-agents-workspace.tsx'),
    'utf8'
  );

  // Resizer divider is available across all two-column QA agent pages on desktop
  assert.ok(workspaceFile.includes('reqSplitPercent'), 'Has reqSplitPercent state');
  assert.ok(workspaceFile.includes('isDragging'), 'Has isDragging state');
  assert.ok(workspaceFile.includes('splitContainerRef'), 'Has splitContainerRef');
  assert.ok(workspaceFile.includes('cursor-col-resize'), 'Has cursor-col-resize handle');
  assert.ok(workspaceFile.includes('GripVertical'), 'Includes GripVertical icon');

  // Quick preset ratio buttons are rendered
  assert.ok(workspaceFile.includes('35:65'), 'Includes 35:65 quick preset');
  assert.ok(workspaceFile.includes('50:50'), 'Includes 50:50 quick preset');
  assert.ok(workspaceFile.includes('65:35'), 'Includes 65:35 quick preset');
});

test('Requirement 4: Output: QA Test Matrix is removed', () => {
  const workspaceFile = fs.readFileSync(
    path.join(__dirname, '../src/components/qa-agents/qa-agents-workspace.tsx'),
    'utf8'
  );

  assert.ok(
    !workspaceFile.includes('Output:'),
    'Output indicator label is completely removed'
  );
  assert.ok(
    !workspaceFile.includes('QA Test Matrix</strong>'),
    'Output: QA Test Matrix badge is removed'
  );
});

test('Requirement 5: Requirements Specification & Import renamed to Import Requirements', () => {
  const workspaceFile = fs.readFileSync(
    path.join(__dirname, '../src/components/qa-agents/qa-agents-workspace.tsx'),
    'utf8'
  );

  assert.ok(
    workspaceFile.includes('<span>Import Requirements</span>'),
    'Import Requirements label is present'
  );
  assert.ok(
    !workspaceFile.includes('<span>Requirements Specification &amp; Import</span>'),
    'Old Requirements Specification & Import label is removed'
  );
});

test('Requirement 6: via deterministic-agent-engine is removed', () => {
  const workspaceFile = fs.readFileSync(
    path.join(__dirname, '../src/components/qa-agents/qa-agents-workspace.tsx'),
    'utf8'
  );

  assert.ok(
    !workspaceFile.includes('via {usedEngine}'),
    'via {usedEngine} badge is completely removed'
  );
  assert.ok(
    !workspaceFile.includes('DETERMINISTIC'),
    'DETERMINISTIC text is removed from workspace'
  );
});

test('Requirement 7: Unified SAVE dropdown with Copy, As Excel(.xlsx), As Markdown(.md), and As JSON(.json)', () => {
  const workspaceFile = fs.readFileSync(
    path.join(__dirname, '../src/components/qa-agents/qa-agents-workspace.tsx'),
    'utf8'
  );

  // SAVE dropdown button
  assert.ok(workspaceFile.includes('<span>SAVE</span>'), 'SAVE button exists in workspace');
  assert.ok(workspaceFile.includes('showSaveDropdown'), 'Has showSaveDropdown state');

  // Dropdown options
  assert.ok(workspaceFile.includes('As Excel (.xlsx)'), 'Has As Excel (.xlsx) option');
  assert.ok(workspaceFile.includes('As Markdown (.md)'), 'Has As Markdown (.md) option');
  assert.ok(workspaceFile.includes('As JSON (.json)'), 'Has As JSON (.json) option');
  assert.ok(workspaceFile.includes('copyToClipboard'), 'Has copy option');

  // Export handlers
  assert.ok(workspaceFile.includes('handleExportExcel'), 'Has handleExportExcel handler');
  assert.ok(workspaceFile.includes('handleExportJson'), 'Has handleExportJson handler');
});

test('Requirement 8: Dedicated COPY dropdown with As Markdown(.md) and As JSON(.json)', () => {
  const workspaceFile = fs.readFileSync(
    path.join(__dirname, '../src/components/qa-agents/qa-agents-workspace.tsx'),
    'utf8'
  );

  // COPY dropdown button exists
  assert.ok(
    workspaceFile.includes('<span>{copied ? \'COPIED!\' : \'COPY\'}</span>'),
    'COPY button exists in workspace'
  );
  assert.ok(workspaceFile.includes('showCopyDropdown'), 'Has showCopyDropdown state');
  assert.ok(workspaceFile.includes('copyDropdownRef'), 'Has copyDropdownRef');

  // Copy handlers
  assert.ok(workspaceFile.includes('copyAsMarkdown'), 'Has copyAsMarkdown handler');
  assert.ok(workspaceFile.includes('copyAsJson'), 'Has copyAsJson handler');

  // Options rendered in COPY dropdown
  assert.ok(
    workspaceFile.includes('title="Copy output as Markdown"'),
    'Has Copy as Markdown action button'
  );
  assert.ok(
    workspaceFile.includes('title="Copy output as JSON"'),
    'Has Copy as JSON action button'
  );
});

test('Requirement 9: Cancel option left to Generate button on All QA Agents', () => {
  const workspaceFile = fs.readFileSync(
    path.join(__dirname, '../src/components/qa-agents/qa-agents-workspace.tsx'),
    'utf8'
  );

  // Cancel button for QA Generation agents
  assert.ok(workspaceFile.includes('handleCancel'), 'Has handleCancel handler');
  assert.ok(workspaceFile.includes('abortControllerRef'), 'Has abortControllerRef for cancelling requests');
  assert.ok(
    workspaceFile.includes('title="Cancel generation or clear input"'),
    'Has Cancel button for QA Generation agents'
  );

  // Cancel button is placed immediately before handleGenerate button in the DOM
  const cancelBtnIdx = workspaceFile.indexOf('onClick={handleCancel}');
  const generateBtnIdx = workspaceFile.indexOf('onClick={handleGenerate}');
  assert.ok(cancelBtnIdx !== -1, 'Cancel button exists');
  assert.ok(generateBtnIdx !== -1, 'Generate button exists');
  assert.ok(
    cancelBtnIdx < generateBtnIdx,
    'Cancel button is situated directly to the left of Generate button'
  );

  // Cancel button for Mentor Chat
  assert.ok(workspaceFile.includes('handleCancelChat'), 'Has handleCancelChat handler');
  const cancelChatBtnIdx = workspaceFile.indexOf('onClick={handleCancelChat}');
  const sendChatBtnIdx = workspaceFile.indexOf('onClick={handleSendChat}');
  assert.ok(cancelChatBtnIdx !== -1, 'Mentor chat cancel button exists');
  assert.ok(sendChatBtnIdx !== -1, 'Mentor chat send button exists');
  assert.ok(
    cancelChatBtnIdx < sendChatBtnIdx,
    'Mentor chat cancel button is situated directly to the left of Send button'
  );
});
