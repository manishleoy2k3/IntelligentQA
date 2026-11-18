const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

test('Admin Modification: Sidebar uses dynamic curriculumTracks with live update listener', () => {
  const sidebarPath = path.join(process.cwd(), 'src/components/layout/sidebar.tsx');
  const content = fs.readFileSync(sidebarPath, 'utf-8');

  assert.strictEqual(
    content.includes('curriculumTracks') && content.includes('intelligentqa_curriculum_updated'),
    true,
    'Sidebar must track live curriculumTracks state and listen for intelligentqa_curriculum_updated'
  );
  assert.strictEqual(
    content.includes('QADatabase.getTracks()'),
    true,
    'Sidebar must load tracks dynamically via QADatabase.getTracks()'
  );
});

test('Admin Modification: CodeEditorWorkspace dynamically re-syncs activeLesson on curriculum updates', () => {
  const workspacePath = path.join(process.cwd(), 'src/components/tracks/code-editor-workspace.tsx');
  const content = fs.readFileSync(workspacePath, 'utf-8');

  assert.strictEqual(
    content.includes('activeLesson') && content.includes('intelligentqa_curriculum_updated'),
    true,
    'Workspace must have activeLesson state updated via intelligentqa_curriculum_updated'
  );
  assert.strictEqual(
    content.includes('lsn = activeLesson') && content.includes('lsn.title'),
    true,
    'Workspace must render lsn.title from activeLesson'
  );
});

test('Admin Modification: Concept guide and snippet priority for Admin overrides in Selenium track', () => {
  const docsPath = path.join(process.cwd(), 'src/lib/qa-learning-docs.ts');
  const content = fs.readFileSync(docsPath, 'utf-8');

  assert.strictEqual(
    content.includes('getCustomLessonDocOverride(lessonId)'),
    true,
    'qa-learning-docs must check getCustomLessonDocOverride before hardcoded docs'
  );
  assert.strictEqual(
    content.includes('intelligentqa_db_sdet_tracks'),
    true,
    'getConceptCodeSnippet must check database tracks in intelligentqa_db_sdet_tracks'
  );
});

test('Admin Modification: Disk persistence in API route saves updates for SSR and all users', () => {
  const apiRoutePath = path.join(process.cwd(), 'src/app/api/db/curriculum/route.ts');
  const content = fs.readFileSync(apiRoutePath, 'utf-8');

  assert.strictEqual(
    content.includes('saveToDisk') && content.includes('curriculum-data-store.json'),
    true,
    'API route must persist curriculum updates to disk in curriculum-data-store.json'
  );
  assert.strictEqual(
    content.includes('loadFromDisk') && content.includes('serverTracks'),
    true,
    'API route must handle curriculum updates and maintain serverTracks'
  );
});

test('Admin Modification: Admin page populates productionCodeExample and saves to database', () => {
  const adminPagePath = path.join(process.cwd(), 'src/app/admin/page.tsx');
  const content = fs.readFileSync(adminPagePath, 'utf-8');

  assert.strictEqual(
    content.includes('productionCodeExample') && content.includes('saveLessonToDatabase'),
    true,
    'Admin page must save lesson with productionCodeExample to database'
  );
  assert.strictEqual(
    content.includes('QADatabase.saveLessonToDatabase(trackId, moduleId, lessonObj, docPayload)'),
    true,
    'Admin page must pass docPayload with lessonObj'
  );
});

test('Admin Modification: Track overview client component exists and reacts to updates', () => {
  const trackOverviewPath = path.join(process.cwd(), 'src/components/tracks/track-overview-client.tsx');
  assert.strictEqual(fs.existsSync(trackOverviewPath), true, 'track-overview-client.tsx must exist');

  const content = fs.readFileSync(trackOverviewPath, 'utf-8');
  assert.strictEqual(
    content.includes('intelligentqa_curriculum_updated') && content.includes('QADatabase.getTrackById'),
    true,
    'Track overview client must react to intelligentqa_curriculum_updated and query QADatabase.getTrackById'
  );
});
