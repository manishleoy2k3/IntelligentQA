const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

test('Duplicate Detection Engine (guide-duplicate-detector.ts)', () => {
  const detectorFile = fs.readFileSync(
    path.join(__dirname, '../src/lib/guide-duplicate-detector.ts'),
    'utf8'
  );

  // 1. Core function and types exist
  assert.ok(
    detectorFile.includes('export function checkGuideDuplicate'),
    'Exports checkGuideDuplicate'
  );
  assert.ok(
    detectorFile.includes('export interface DuplicateCheckReport'),
    'Exports DuplicateCheckReport'
  );
  assert.ok(
    detectorFile.includes('jaccardSimilarity'),
    'Includes Jaccard keyword similarity calculation'
  );
  assert.ok(
    detectorFile.includes('phraseSimilarity'),
    'Includes phrase & title similarity calculation'
  );
  assert.ok(detectorFile.includes('normalizeCode'), 'Includes code normalization');

  // 2. Checks against both existing Concept Guides and Curriculum Lessons
  assert.ok(detectorFile.includes('getAllGuides'), 'Compares against all confirmed concept guides');
  assert.ok(
    detectorFile.includes('QADatabase.getTracks'),
    'Compares against all course curriculum lessons'
  );

  // 3. Classifications
  assert.ok(detectorFile.includes("'unique'"), 'Has unique status for clean guides');
  assert.ok(detectorFile.includes("'potential_duplicate'"), 'Has potential_duplicate status');
  assert.ok(detectorFile.includes("'duplicate'"), 'Has duplicate status for high similarity');
});

test('Concept Guides submission & admin approval workflow in concept-guides.ts', () => {
  const guidesLib = fs.readFileSync(path.join(__dirname, '../src/lib/concept-guides.ts'), 'utf8');

  // 1. ConceptGuide has moderation and duplicate fields
  assert.ok(guidesLib.includes('status?:'), 'ConceptGuide has status field');
  assert.ok(guidesLib.includes('pending_admin_approval'), 'Supports pending_admin_approval status');
  assert.ok(guidesLib.includes('duplicateScore?:'), 'Supports duplicateScore field');
  assert.ok(guidesLib.includes('duplicateStatus?:'), 'Supports duplicateStatus field');

  // 2. submitStagedGuidesForApproval function exists and queues for review
  assert.ok(
    guidesLib.includes('export function submitStagedGuidesForApproval'),
    'Provides submitStagedGuidesForApproval'
  );
  assert.ok(
    guidesLib.includes('QADatabase.submitContentForReview'),
    'Queues into QADatabase moderation queue'
  );
  assert.ok(
    guidesLib.includes('checkGuideDuplicate'),
    'Runs checkGuideDuplicate before submission'
  );
});

test('Guide Staging UI displays duplicate check badges and requires admin approval (inside Add Guide modal; removed from courses main page)', () => {
  const guideClient = fs.readFileSync(
    path.join(__dirname, '../src/components/interview/add-guide-modal.tsx'),
    'utf8'
  );
  const coursePage = fs.readFileSync(
    path.join(__dirname, '../src/app/guides/[trackId]/guide-catalog-client.tsx'),
    'utf8'
  );

  // 1. Courses main page has removed the redundant Import & Review Staging section
  assert.ok(
    !coursePage.includes('Import &amp; Review Staging'),
    'Removed redundant staging tab from course page'
  );

  // 2. Displays Duplicate Check Badges in modal
  assert.ok(
    guideClient.includes('checkGuideDuplicate'),
    'Computes duplicate check for each staged guide'
  );
  assert.ok(
    guideClient.includes('Duplicate Check: Clean'),
    'Displays Clean badge for unique content'
  );
  assert.ok(
    guideClient.includes('Duplicate Warning:'),
    'Displays Warning badge for similar content'
  );

  // 3. Shows Awaiting Admin Approval
  assert.ok(
    guideClient.includes('Awaiting Admin Approval') ||
      guideClient.includes('Admin Review Required'),
    'Shows admin approval status'
  );

  // 4. Actions distinguish Admin vs User
  assert.ok(guideClient.includes('Submit for Approval'), 'Non-admin users submit for approval');
  assert.ok(
    guideClient.includes('submitStagedGuidesForApproval'),
    'Invokes submitStagedGuidesForApproval on submit'
  );
});

test('Admin Control Center (/admin) has removed legacy Guide Approvals section & purges legacy queue', () => {
  const adminPage = fs.readFileSync(path.join(__dirname, '../src/app/admin/page.tsx'), 'utf8');

  // 1. Section definition has removed approvals
  assert.ok(!adminPage.includes("'approvals'"), 'Removes approvals from AdminSection');

  // 2. Overview does not have Guide Approvals tile
  assert.ok(
    !adminPage.includes('Guide Approvals & Duplicate Moderation'),
    'Removes Approvals tile in Overview'
  );
  assert.ok(
    !adminPage.includes("handleSelectSection('approvals')"),
    'Removes navigation to approvals section'
  );

  // 3. Approvals Section view removed & purges legacy queues
  assert.ok(
    !adminPage.includes("activeSection === 'approvals'"),
    'Removes activeSection === approvals view'
  );
  assert.ok(
    adminPage.includes('intelligentqa_moderation_queue'),
    'Purges legacy moderation queue in browser'
  );
  assert.ok(
    adminPage.includes('intelligentqa_staged_guides_'),
    'Purges legacy staged guides in browser'
  );
});
