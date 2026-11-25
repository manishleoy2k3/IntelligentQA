const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

test('Code Reviewer & Debugger Agent: System Prompt & API Contract matches code_reviewer_debugger_agent.md', () => {
  const routePath = path.join(__dirname, '../src/app/api/ai/qa-agent/route.ts');
  const routeContent = fs.readFileSync(routePath, 'utf8');

  // Verify Staff SDET role & strict guardrails
  assert.ok(
    routeContent.includes('Staff SDET and Automation Architect'),
    'Includes Staff SDET role description'
  );
  assert.ok(
    routeContent.includes('Strict Scope Guardrail'),
    'Includes strict scope guardrails for QA/automation'
  );
  assert.ok(
    routeContent.includes('Root-Cause Stack Trace Analysis'),
    'Covers stack trace analysis'
  );
  assert.ok(routeContent.includes('Flakiness Elimination'), 'Covers flakiness elimination');

  // Verify Mode A and Mode B
  assert.ok(
    routeContent.includes('Mode A: Debugging & Error Resolution'),
    'Defines Mode A execution process'
  );
  assert.ok(
    routeContent.includes('Mode B: Pull Request / Code Quality Review'),
    'Defines Mode B execution process'
  );

  // Verify Output instructions: plain text with bullet points and code
  assert.ok(
    routeContent.includes(
      'Output should be in plain text along with relevant code and structured bullet points'
    ),
    'Mandates plain text with bullet points and code without repeating'
  );

  // Verify User Gemini Key enforcement
  assert.ok(
    routeContent.includes('x-gemini-api-key') || routeContent.includes('effectiveApiKey'),
    'Enforces user Gemini API key'
  );
});

test('Code Reviewer & Debugger Agent: UI Workspace has "View Agent" link, handoffs, and .md modal', () => {
  const workspacePath = path.join(__dirname, '../src/components/qa-agents/qa-agents-workspace.tsx');
  const workspaceContent = fs.readFileSync(workspacePath, 'utf8');

  // Verify Tab 4 naming & description
  assert.ok(
    workspaceContent.includes('QA Code Reviewer & Debugger Agent'),
    'Tab 4 title matches agent'
  );
  assert.ok(
    workspaceContent.includes('Staff SDET & Architect • Agent 4'),
    'Tab 4 badge matches agent'
  );
  assert.ok(
    workspaceContent.includes('code_reviewer_debugger_agent.md'),
    'References code_reviewer_debugger_agent.md file'
  );

  // Verify "View Agent" button exists
  assert.ok(workspaceContent.includes('View Agent'), 'Workspace renders "View Agent" button');
  assert.ok(
    workspaceContent.includes('showAgentSpecModal'),
    'Provides modal to display agent .md content'
  );

  // Verify multi-agent handoffs from agent .md specification
  assert.ok(
    workspaceContent.includes('Refactor Full Suite'),
    'Provides Refactor Full Suite handoff button'
  );
  assert.ok(
    workspaceContent.includes('Generate Missing Edge Tests'),
    'Provides Generate Missing Edge Tests handoff button'
  );
});

test('Agent Spec Data: code-reviewer-debugger-agent.ts holds exact .md content for QA learners', () => {
  const agentDataPath = path.join(__dirname, '../src/data/agents/code-reviewer-debugger-agent.ts');
  const agentDataContent = fs.readFileSync(agentDataPath, 'utf8');

  assert.ok(agentDataContent.includes('name: CodeReviewerAndDebugger'), 'Holds frontmatter name');
  assert.ok(
    agentDataContent.includes('AutomationCodeGenerator'),
    'Holds AutomationCodeGenerator handoff'
  );
  assert.ok(agentDataContent.includes('TestCaseGenerator'), 'Holds TestCaseGenerator handoff');
  assert.ok(
    agentDataContent.includes('Mode A: Debugging & Error Resolution'),
    'Holds Mode A details'
  );
  assert.ok(
    agentDataContent.includes('Mode B: Pull Request / Code Quality Review'),
    'Holds Mode B details'
  );
});
