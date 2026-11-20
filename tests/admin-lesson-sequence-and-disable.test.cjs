const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

test('Admin Sequence Control, Disable/Enable, and Delete Option Verification', () => {
  const sidebarFile = fs.readFileSync(path.join(__dirname, '../src/components/layout/sidebar.tsx'), 'utf8');
  const adminPage = fs.readFileSync(path.join(__dirname, '../src/app/admin/page.tsx'), 'utf8');
  const cmsPage = fs.readFileSync(path.join(__dirname, '../src/app/admin/cms/page.tsx'), 'utf8');
  const qadbFile = fs.readFileSync(path.join(__dirname, '../src/lib/qa-db.ts'), 'utf8');

  // 1. Verify QADatabase methods exist
  assert.ok(qadbFile.includes('moveLesson('), 'QADatabase provides moveLesson method');
  assert.ok(qadbFile.includes('toggleLessonDisabled('), 'QADatabase provides toggleLessonDisabled method');
  assert.ok(qadbFile.includes('deleteLesson('), 'QADatabase provides deleteLesson method');

  // 2. Left navigation controls
  assert.ok(sidebarFile.includes('QADatabase.moveLesson'), 'Sidebar allows moving lessons');
  assert.ok(sidebarFile.includes('QADatabase.toggleLessonDisabled'), 'Sidebar allows disabling lessons');
  assert.ok(sidebarFile.includes('QADatabase.deleteLesson'), 'Sidebar preserves delete lesson');
  assert.ok(sidebarFile.includes('!l.disabled'), 'Sidebar filters out disabled lessons for non-admins');

  // 3. Admin Center controls
  assert.ok(adminPage.includes('handleMoveLesson'), 'Admin page supports moving lessons');
  assert.ok(adminPage.includes('handleToggleLessonDisabled'), 'Admin page supports disabling lessons');
  assert.ok(adminPage.includes('handleConfirmDeleteLesson'), 'Admin page preserves delete lesson');

  // 4. Admin CMS controls
  assert.ok(cmsPage.includes('QADatabase.moveLesson'), 'Admin CMS page supports moving lessons');
  assert.ok(cmsPage.includes('QADatabase.toggleLessonDisabled'), 'Admin CMS page supports disabling lessons');
  assert.ok(cmsPage.includes('setShowDeleteConfirmId'), 'Admin CMS page preserves delete lesson');
});
