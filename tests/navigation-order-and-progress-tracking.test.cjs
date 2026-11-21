const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

test('1. Sidebar Navigation: AI QA Agents is placed BELOW Interview Questions in the left navigation', () => {
  const sidebarPath = path.join(__dirname, '../src/components/layout/sidebar.tsx');
  const sidebarContent = fs.readFileSync(sidebarPath, 'utf8');

  const interviewIdx = sidebarContent.indexOf('href="/interview-questions"');
  const aiAgentsIdx = sidebarContent.indexOf('AI QA Agents');

  assert.ok(interviewIdx !== -1, 'Interview Questions link must exist in sidebar');
  assert.ok(aiAgentsIdx !== -1, 'AI QA Agents must exist in sidebar');
  assert.ok(
    interviewIdx < aiAgentsIdx,
    `Expected Interview Questions (pos ${interviewIdx}) to appear BEFORE AI QA Agents (pos ${aiAgentsIdx}) in sidebar left navigation`
  );
});

test('2. Course Overview: Guest preview banner and "Start Free Preview" button are removed from course sections', () => {
  const trackOverviewPath = path.join(__dirname, '../src/components/tracks/track-overview-client.tsx');
  const trackContent = fs.readFileSync(trackOverviewPath, 'utf8');

  // Verify guest preview callout and button are removed
  assert.ok(
    !trackContent.includes('100% Free Learning Portal:'),
    '100% Free Learning Portal guest preview callout must be removed'
  );
  assert.ok(
    !trackContent.includes('Start Free Preview:'),
    'Start Free Preview button must be removed'
  );
  assert.ok(
    !trackContent.includes('Free Guest Preview'),
    'Free Guest Preview badge in module lessons must be removed'
  );
  assert.ok(
    !trackContent.includes('Free with Signup'),
    'Free with Signup lock badge in module lessons must be removed'
  );

  // Verify modern track progress and action are present
  assert.ok(trackContent.includes('Track Progress'), 'Track Progress section should be present');
  assert.ok(trackContent.includes('percentCompleted'), 'Percent completed calculation should be present');
  assert.ok(trackContent.includes('completedLessonIds'), 'Completed lesson tracking should be present');
});

test('3. Progress Tracking & Check: QADatabase, CodeEditorWorkspace, Dashboard, and Tracks update and persist completion', () => {
  const dbPath = path.join(__dirname, '../src/lib/qa-db.ts');
  const dbContent = fs.readFileSync(dbPath, 'utf8');

  assert.ok(dbContent.includes('markLessonComplete'), 'markLessonComplete must exist in qa-db');
  assert.ok(dbContent.includes('toggleLessonStatus'), 'toggleLessonStatus must exist in qa-db');
  assert.ok(
    dbContent.includes('intelligentqa_progress_updated'),
    'QADatabase must dispatch intelligentqa_progress_updated event on completion'
  );

  const workspacePath = path.join(__dirname, '../src/components/tracks/code-editor-workspace.tsx');
  const workspaceContent = fs.readFileSync(workspacePath, 'utf8');

  assert.ok(
    workspaceContent.includes('markLessonComplete'),
    'CodeEditorWorkspace must call markLessonComplete upon visiting'
  );
  assert.ok(
    workspaceContent.includes('Completed ✓'),
    'CodeEditorWorkspace must render a completion check button'
  );
  assert.ok(
    workspaceContent.includes('Section Completed'),
    'CodeEditorWorkspace must render a Section Completed footer card'
  );
  assert.ok(
    workspaceContent.includes('Next Lesson:'),
    'CodeEditorWorkspace must include navigation to Next Lesson'
  );

  const dashboardPath = path.join(__dirname, '../src/app/dashboard/page.tsx');
  const dashboardContent = fs.readFileSync(dashboardPath, 'utf8');
  assert.ok(
    dashboardContent.includes('intelligentqa_progress_updated'),
    'Dashboard must listen to intelligentqa_progress_updated'
  );

  const tracksPath = path.join(__dirname, '../src/app/tracks/page.tsx');
  const tracksContent = fs.readFileSync(tracksPath, 'utf8');
  assert.ok(
    tracksContent.includes('intelligentqa_progress_updated'),
    'Tracks page must listen to intelligentqa_progress_updated'
  );
});
