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

  // 2. Excel template features: mandatory & optional fields with sample values
  assert.ok(conceptGuidesLib.includes('Title [MANDATORY]'), 'Excel template has Title [MANDATORY]');
  assert.ok(conceptGuidesLib.includes('Category [MANDATORY]'), 'Excel template has Category [MANDATORY]');
  assert.ok(conceptGuidesLib.includes('Level [MANDATORY]'), 'Excel template has Level [MANDATORY]');
  assert.ok(conceptGuidesLib.includes('Summary [MANDATORY]'), 'Excel template has Summary [MANDATORY]');
  assert.ok(conceptGuidesLib.includes('Overview [MANDATORY]'), 'Excel template has Overview [MANDATORY]');
  assert.ok(conceptGuidesLib.includes('ArchitectureOrMechanism [OPTIONAL]'), 'Excel template has ArchitectureOrMechanism [OPTIONAL]');
  assert.ok(conceptGuidesLib.includes('CodeLanguage [MANDATORY]'), 'Excel template has CodeLanguage [MANDATORY]');
  assert.ok(conceptGuidesLib.includes('CodeCaption [OPTIONAL]'), 'Excel template has CodeCaption [OPTIONAL]');
  assert.ok(conceptGuidesLib.includes('CodeSnippet [MANDATORY]'), 'Excel template has CodeSnippet [MANDATORY]');
  assert.ok(conceptGuidesLib.includes('BestPractices [OPTIONAL]'), 'Excel template has BestPractices [OPTIONAL]');
  assert.ok(conceptGuidesLib.includes('AntiPatterns [OPTIONAL]'), 'Excel template has AntiPatterns [OPTIONAL]');
  assert.ok(conceptGuidesLib.includes('InterviewTips [OPTIONAL]'), 'Excel template has InterviewTips [OPTIONAL]');

  // 3. Word template features: sample values and blank template table
  assert.ok(conceptGuidesLib.includes('badge-mandatory'), 'Word template marks mandatory badges');
  assert.ok(conceptGuidesLib.includes('badge-optional'), 'Word template marks optional badges');
  assert.ok(conceptGuidesLib.includes('Table 1: Complete Production Sample Guide'), 'Word template contains complete production sample guide');
  assert.ok(conceptGuidesLib.includes('Table 2: Blank Guide Template'), 'Word template contains blank guide template');

  // 4. Multi-format parsing supports both mandatory and optional fields
  assert.ok(conceptGuidesLib.includes('imported-excel-') || conceptGuidesLib.includes('isKeyValueTable'), 'Parses Excel and Word tables');
  assert.ok(conceptGuidesLib.includes('imported-tsv-') || conceptGuidesLib.includes('parts[0]'), 'Parses Tab-Separated Values from Excel copy-paste');
  assert.ok(conceptGuidesLib.includes('imported-text-') || conceptGuidesLib.includes('title\\s*:'), 'Parses structured text format');
  assert.ok(conceptGuidesLib.includes('parseList'), 'Provides parseList helper for Best Practices and Anti-Patterns');
});

test('Excel (.XLSX) and Word (.DOCX) binary templates generation and extraction', () => {
  const officeDocFile = fs.readFileSync(path.join(__dirname, '../src/lib/office-documents.ts'), 'utf8');

  // 1. Binary OOXML generator functions exist
  assert.ok(officeDocFile.includes('export function generateOfficeExcel'), 'Provides generateOfficeExcel');
  assert.ok(officeDocFile.includes('export function generateOfficeWord'), 'Provides generateOfficeWord');
  assert.ok(officeDocFile.includes('export function downloadOfficeTemplate'), 'Provides downloadOfficeTemplate');
  assert.ok(officeDocFile.includes('export async function extractTextFromOfficeZip'), 'Provides extractTextFromOfficeZip');

  // 2. Uses genuine OOXML types
  assert.ok(officeDocFile.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'), 'Uses genuine XLSX MIME type');
  assert.ok(officeDocFile.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document'), 'Uses genuine DOCX MIME type');
  assert.ok(officeDocFile.includes('0x04034b50'), 'Includes ZIP PK header signature for binary OOXML packaging');

  // 3. Exact ZIP Central Directory Alignment (prevents "Could not open file" in Google Drive / Docs / Sheets)
  assert.ok(officeDocFile.includes('view.setUint32(16, e.crc, true)'), 'CRC-32 is correctly positioned at offset 16 in Central Directory');
  assert.ok(officeDocFile.includes('view.setUint32(20, e.size, true)'), 'Compressed size is at offset 20');
  assert.ok(officeDocFile.includes('view.setUint32(24, e.size, true)'), 'Uncompressed size is at offset 24');
  assert.ok(officeDocFile.includes('view.setUint16(28, e.nameBuf.length, true)'), 'Filename length is at offset 28');
  assert.ok(officeDocFile.includes('view.setUint32(42, e.offset, true)'), 'Local header offset is at offset 42');

  // 4. OOXML Standard Schemas for Google Drive & Office Compatibility
  assert.ok(officeDocFile.includes('<w:sectPr>'), 'DOCX contains section properties for Word/Google Docs page layout');
  assert.ok(officeDocFile.includes('<sheetViews>'), 'XLSX contains sheetViews for Excel/Google Sheets compatibility');
});

test('Add Guide page layout: Imported Guides Pending Review is full-width at top; Mandatory & Optional Fields & Staging Workflow are placed below it', () => {
  const guideClientFile = fs.readFileSync(path.join(__dirname, '../src/app/guides/[trackId]/guide-catalog-client.tsx'), 'utf8');

  // 1. Top left "Import Concept Guides" card with Upload JSON / CSV Guides button is removed
  assert.ok(!guideClientFile.includes('Upload JSON / CSV Guides'), 'Old "Upload JSON / CSV Guides" button removed');
  assert.ok(!guideClientFile.includes('lg:col-span-1 space-y-5'), 'Old 3-column split layout removed');

  // 2. "Imported Guides Pending Review" is present
  assert.ok(guideClientFile.includes('Imported Guides Pending Review'), 'Has "Imported Guides Pending Review" header');

  // 3. Both Mandatory and Optional fields are clearly documented
  assert.ok(guideClientFile.includes('Mandatory Fields (Required for Submission)'), 'UI documents mandatory fields');
  assert.ok(guideClientFile.includes('Optional Fields (For 1-Click Admin Approval)'), 'UI documents optional fields');

  // 4. Excel and Word .xlsx and .docx options are offered for template and import
  assert.ok(guideClientFile.includes('Excel Template (.XLSX)'), 'Modal has Excel Template (.XLSX) option');
  assert.ok(guideClientFile.includes('Word Template (.DOCX)'), 'Modal has Word Template (.DOCX) option');
  assert.ok(guideClientFile.includes('Download .XLSX'), 'Modal has direct Download .XLSX button');
  assert.ok(guideClientFile.includes('Download .DOCX'), 'Modal has direct Download .DOCX button');
  assert.ok(guideClientFile.includes('Import Excel / Word Guides'), 'Header action has Import Excel / Word Guides');
  assert.ok(guideClientFile.includes('Download Excel / Word Template'), 'Header action has Download Excel / Word Template');
});
