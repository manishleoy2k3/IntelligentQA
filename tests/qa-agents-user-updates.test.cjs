const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

test('Requirement 1: Autonomous SDET Suite • Agent 1 badge is removed', () => {
  const workspaceFile = fs.readFileSync(
    path.join(__dirname, '../src/components/qa-agents/qa-agents-workspace.tsx'),
    'utf8'
  );
  const configFile = fs.readFileSync(
    path.join(__dirname, '../src/lib/qa-agents-config.ts'),
    'utf8'
  );

  // Badge text for requirements is empty
  assert.ok(
    !workspaceFile.includes("badgeText: 'Autonomous SDET Suite • Agent 1'"),
    'Workspace does not have badgeText Autonomous SDET Suite • Agent 1'
  );
  assert.ok(
    !configFile.includes("badgeText: 'Autonomous SDET Suite • Agent 1'"),
    'Config does not have badgeText Autonomous SDET Suite • Agent 1'
  );

  // Header badge only renders if currentAgent.badgeText is truthy
  assert.ok(
    workspaceFile.includes('currentAgent.badgeText ?'),
    'Badge conditionally renders only when badgeText is truthy'
  );
});

test('Requirement 2: Gemini 2.0 Key Active is removed from right panel/section of all QA Agents', () => {
  const workspaceFile = fs.readFileSync(
    path.join(__dirname, '../src/components/qa-agents/qa-agents-workspace.tsx'),
    'utf8'
  );

  // No Gemini 2.0 Key Active button in right controls
  assert.ok(
    !workspaceFile.includes('Gemini 2.0 Key Active'),
    'Gemini 2.0 Key Active is completely removed from right controls'
  );
});

test('Requirement 3: Renamed to REQUIREMENTS ANALYSIS', () => {
  const workspaceFile = fs.readFileSync(
    path.join(__dirname, '../src/components/qa-agents/qa-agents-workspace.tsx'),
    'utf8'
  );

  // Requirements Analysis is present in the label
  assert.ok(
    workspaceFile.includes('<span>Requirements Analysis</span>'),
    'Requirements Analysis label is rendered'
  );
  assert.ok(
    !workspaceFile.includes('Requirements Specification &amp; Analysis'),
    'Old Requirements Specification & Analysis is removed'
  );
});

test('Requirement 4: Output: Gherkin BDD & Ambiguity Analysis is removed', () => {
  const workspaceFile = fs.readFileSync(
    path.join(__dirname, '../src/components/qa-agents/qa-agents-workspace.tsx'),
    'utf8'
  );

  assert.ok(
    !workspaceFile.includes('Gherkin BDD &amp; Ambiguity Analysis'),
    'Gherkin BDD & Ambiguity Analysis output indicator is removed'
  );
  assert.ok(
    !workspaceFile.includes('Gherkin BDD'),
    'Gherkin BDD output indicator is removed'
  );
});

test('Requirement 5: Left and right section of Requirement Analyzer page are resizable', () => {
  const workspaceFile = fs.readFileSync(
    path.join(__dirname, '../src/components/qa-agents/qa-agents-workspace.tsx'),
    'utf8'
  );

  // State and ref for resizing
  assert.ok(workspaceFile.includes('reqSplitPercent'), 'Has reqSplitPercent state');
  assert.ok(workspaceFile.includes('isDragging'), 'Has isDragging state');
  assert.ok(workspaceFile.includes('splitContainerRef'), 'Has splitContainerRef');
  assert.ok(workspaceFile.includes('handleResizePointerDown'), 'Has handleResizePointerDown handler');
  assert.ok(workspaceFile.includes('cursor-col-resize'), 'Has cursor-col-resize styling');
  assert.ok(workspaceFile.includes('GripVertical'), 'Includes GripVertical icon for visual drag handle');

  // Quick preset buttons for instant toggling
  assert.ok(workspaceFile.includes('35:65'), 'Includes 35:65 quick preset');
  assert.ok(workspaceFile.includes('50:50'), 'Includes 50:50 quick preset');
  assert.ok(workspaceFile.includes('65:35'), 'Includes 65:35 quick preset');
});

test('Requirement 6: Real-time Gemini Flash is removed', () => {
  const workspaceFile = fs.readFileSync(
    path.join(__dirname, '../src/components/qa-agents/qa-agents-workspace.tsx'),
    'utf8'
  );

  assert.ok(
    !workspaceFile.includes('Real-time Gemini Flash'),
    'Real-time Gemini Flash indicator is removed'
  );
});
