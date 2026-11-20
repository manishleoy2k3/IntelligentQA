const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

test('Excel and Word templates generation and multi-format parsing in concept-guides.ts', () => {
  const conceptGuidesLib = fs.readFileSync(path.join(__dirname, '../src/lib/concept-guides.ts'), 'utf8');

  // 1. Generator exports exist
  assert.ok(conceptGuidesLib.includes('export function generateExcelTemplate'), 'Provides generateExcelTemplate function');
  assert.ok(conceptGuidesLib.includes('export function generateWordTemplate'), 'Provides generateWordTemplate function');
  assert.ok(conceptGuidesLib.includes('export function downloadConceptGuideTemplate'), 'Provides downloadConceptGuideTemplate function');

  // 2. Excel template features
  assert.ok(conceptGuidesLib.includes('application/vnd.ms-excel'), 'Excel template uses Excel MIME type');
  assert.ok(conceptGuidesLib.includes('extension = \'xls\''), 'Excel template uses .xls extension');
  assert.ok(conceptGuidesLib.includes('SDET Concept Guides'), 'Excel template includes worksheet header');

  // 3. Word template features
  assert.ok(conceptGuidesLib.includes('application/msword'), 'Word template uses Word MIME type');
  assert.ok(conceptGuidesLib.includes('extension = \'doc\''), 'Word template uses .doc extension');

  // 4. Multi-format parsing
  assert.ok(conceptGuidesLib.includes('imported-excel-') || conceptGuidesLib.includes('isKeyValueTable'), 'Parses Excel and Word tables');
  assert.ok(conceptGuidesLib.includes('imported-tsv-') || conceptGuidesLib.includes('parts[0]'), 'Parses Tab-Separated Values from Excel copy-paste');
  assert.ok(conceptGuidesLib.includes('imported-text-') || conceptGuidesLib.includes('title\\s*:'), 'Parses structured text format');
});

test('Add Guide page layout: Imported Guides Pending Review is full-width at top; Mandatory Fields & Staging Workflow are placed below it', () => {
  const guideClientFile = fs.readFileSync(path.join(__dirname, '../src/app/guides/[trackId]/guide-catalog-client.tsx'), 'utf8');

  // 1. Top left "Import Concept Guides" card with Upload JSON / CSV Guides button is removed
  assert.ok(!guideClientFile.includes('Upload JSON / CSV Guides'), 'Old "Upload JSON / CSV Guides" button removed');
  assert.ok(!guideClientFile.includes('lg:col-span-1 space-y-5'), 'Old 3-column split layout removed');

  // 2. "Imported Guides Pending Review" is present
  assert.ok(guideClientFile.includes('Imported Guides Pending Review'), 'Has "Imported Guides Pending Review" header');

  // 3. "Mandatory Fields in Template:" and "Staging Workflow" are positioned below
  const pendingReviewIndex = guideClientFile.indexOf('Imported Guides Pending Review');
  const mandatoryFieldsIndex = guideClientFile.indexOf('Mandatory Fields in Template:');
  const stagingWorkflowIndex = guideClientFile.indexOf('Staging Workflow');

  assert.ok(mandatoryFieldsIndex > pendingReviewIndex, 'Mandatory Fields is placed below Imported Guides Pending Review');
  assert.ok(stagingWorkflowIndex > pendingReviewIndex, 'Staging Workflow is placed below Imported Guides Pending Review');

  // 4. Excel and Word options are offered for template and import
  assert.ok(guideClientFile.includes('Excel Template (.XLS)'), 'Modal has Excel Template (.XLS) option');
  assert.ok(guideClientFile.includes('Word Template (.DOC)'), 'Modal has Word Template (.DOC) option');
  assert.ok(guideClientFile.includes('Import Excel / Word Guides'), 'Header action has Import Excel / Word Guides');
  assert.ok(guideClientFile.includes('Download Excel / Word Template'), 'Header action has Download Excel / Word Template');
});
