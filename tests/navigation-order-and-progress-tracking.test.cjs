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

test('4. Dashboard Track Categories & AI for QA Course Refinements', () => {
  const dashboardPath = path.join(__dirname, '../src/app/dashboard/page.tsx');
  const dashboardContent = fs.readFileSync(dashboardPath, 'utf8');

  // Verify categories
  assert.ok(
    dashboardContent.includes("track.id === 'api-testing' ? 'Rest Assured (API)'"),
    'Dashboard must display "Rest Assured (API)" category instead of "REST"'
  );
  assert.ok(
    dashboardContent.includes("track.id === 'ai-qa' ? 'AI for QA'"),
    'Dashboard must display "AI for QA" category instead of "Step-by-Step"'
  );
  assert.ok(
    dashboardContent.includes('View All 4 Tracks →'),
    'Dashboard header should link to View All 4 Tracks'
  );
  assert.ok(
    !dashboardContent.includes('QA Interview Mastery & Coding Griller'),
    'Dashboard must not list QA Interview Mastery & Coding Griller as a course'
  );

  const curriculumPath = path.join(__dirname, '../src/lib/qa-curriculum.ts');
  const curriculumContent = fs.readFileSync(curriculumPath, 'utf8');
  assert.ok(
    curriculumContent.includes("title: 'AI for QA'"),
    'Course title must be "AI for QA"'
  );
  assert.ok(
    !curriculumContent.includes("title: 'QA Interview Mastery & Coding Griller'"),
    'Course QA Interview Mastery & Coding Griller must be completely removed from QA_TRACKS'
  );
});

test('Add Guide button opens centered modal matching Gemini Key with Course Category and full Import & Staging content', () => {
  const topNavPath = path.join(__dirname, '../src/components/layout/top-nav.tsx');
  const topNavContent = fs.readFileSync(topNavPath, 'utf8');

  // Verify Add Guide button opens the modal instead of navigating to a page
  assert.ok(
    topNavContent.includes('setShowAddGuideModal(true)'),
    'Add Guide button in top nav triggers setShowAddGuideModal(true)'
  );
  assert.ok(
    topNavContent.includes('<AddGuideModal'),
    'top-nav renders AddGuideModal'
  );

  const modalPath = path.join(__dirname, '../src/components/interview/add-guide-modal.tsx');
  const modalContent = fs.readFileSync(modalPath, 'utf8');

  // Centering check: matches GeminiKeyModal, centered with min-h-screen my-auto, no pt-14
  assert.ok(
    modalContent.includes('min-h-screen') && modalContent.includes('flex items-center justify-center') && modalContent.includes('my-auto'),
    'Modal is centered on the middle of the page using min-h-screen flex items-center justify-center and my-auto'
  );
  assert.ok(
    !modalContent.includes('pt-14'),
    'Modal must not have pt-14 offset that pushes it down and crops it at the top'
  );

  // Extra field: Course Category
  assert.ok(
    modalContent.includes('Course Category (Where this guide will be listed after Admin approval):'),
    'Modal contains explicit Course Category field specifying where the guide will be listed after Admin approval'
  );
  assert.ok(
    modalContent.includes('Selenium WebDriver + Java') &&
    modalContent.includes('Playwright + TypeScript') &&
    modalContent.includes('Rest Assured (API)') &&
    modalContent.includes('AI for QA'),
    'Course Category options support Selenium, Playwright, Rest Assured, and AI for QA'
  );

  // Import and Review Staging content inside the modal
  assert.ok(
    modalContent.includes('Review Staging') || modalContent.includes('Imported Guides Pending Review'),
    'Modal includes Staging & Review tab/section'
  );
  assert.ok(
    modalContent.includes('Duplicate Check: Clean') || modalContent.includes('checkGuideDuplicate'),
    'Modal runs automated duplicate check for staged guides'
  );
  assert.ok(
    modalContent.includes('Download Excel (.XLSX)') && modalContent.includes('Download Word (.DOCX)'),
    'Modal provides direct Excel and Word template downloads'
  );
  assert.ok(
    modalContent.includes('Mandatory Fields (Required for Submission)'),
    'Modal provides field specifications'
  );
});

