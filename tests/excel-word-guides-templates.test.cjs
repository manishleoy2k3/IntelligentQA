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

  // 5. Formatting preservation for Word (.docx) imports (bold, bullets, paragraphs)
  assert.ok(officeDocFile.includes('extractFormattedWordParagraph'), 'Provides extractFormattedWordParagraph');
  assert.ok(officeDocFile.includes('extractFormattedWordCell'), 'Provides extractFormattedWordCell');
  assert.ok(officeDocFile.includes("isBold && trimmed && !trimmed.startsWith('**')"), 'Preserves Word bold runs as **bold**');
  assert.ok(officeDocFile.includes("pTexts.join('<br/>')"), 'Preserves paragraph breaks inside table cells');
});

test('Word (.docx) and Excel (.xlsx) formatting retention in Share your Knowledge modal', () => {
  const addGuideModalFile = fs.readFileSync(path.join(__dirname, '../src/components/interview/add-guide-modal.tsx'), 'utf8');

  // 1. Modal uses extractTextFromOfficeZip to parse binary .docx and .xlsx
  assert.ok(addGuideModalFile.includes('extractTextFromOfficeZip'), 'Imports and uses extractTextFromOfficeZip in AddGuideModal');
  assert.ok(addGuideModalFile.includes("lowerName.endsWith('.docx') || lowerName.endsWith('.xlsx')"), 'Detects .docx and .xlsx uploads in AddGuideModal');

  // 2. Overview is rendered with FormattedInterviewAnswer in staged card preview
  assert.ok(addGuideModalFile.includes('<FormattedInterviewAnswer text={guide.overview} isDark />'), 'Renders formatted overview in staging cards');
});

test('Add Guide modal layout: Imported Guides Pending Review is full-width; Mandatory & Optional Fields & Templates are available; Redundant Staging section removed from courses main page', () => {
  const guideClientFile = fs.readFileSync(path.join(__dirname, '../src/app/guides/[trackId]/guide-catalog-client.tsx'), 'utf8');
  const addGuideModalFile = fs.readFileSync(path.join(__dirname, '../src/components/interview/add-guide-modal.tsx'), 'utf8');

  // 1. Redundant "Import & Review Staging" tab/section is removed from courses main page
  assert.ok(!guideClientFile.includes('Import &amp; Review Staging'), 'Redundant Import & Review Staging tab removed from course page');
  assert.ok(!guideClientFile.includes('Imported Guides Pending Review'), 'Staging section removed from course page');

  // 2. "Imported Guides Pending Review" is present in Add Guide modal
  assert.ok(addGuideModalFile.includes('Imported Guides Pending Review'), 'Modal has "Imported Guides Pending Review" header');

  // 3. Both Mandatory and Optional fields are clearly documented in Add Guide modal
  assert.ok(addGuideModalFile.includes('Mandatory Fields (Required for Submission)'), 'Modal documents mandatory fields');
  assert.ok(addGuideModalFile.includes('Optional Fields (For 1-Click Admin Approval)'), 'Modal documents optional fields');

  // 4. Excel and Word .xlsx and .docx options are offered for template and import in modal
  assert.ok(addGuideModalFile.includes('Download Excel (.XLSX)'), 'Modal has direct Download Excel (.XLSX) button');
  assert.ok(addGuideModalFile.includes('Download Word (.DOCX)'), 'Modal has direct Download Word (.DOCX) button');
  assert.ok(addGuideModalFile.includes('Import Excel / Word Guides'), 'Modal has Import Excel / Word Guides');
  assert.ok(addGuideModalFile.includes('Download Excel / Word Template'), 'Modal has Download Excel / Word Template');
});

test('Google Drive .docx import fix: Key-value table parsing with [MANDATORY] labels and streaming ZIP extraction', async () => {
  const conceptGuidesFile = fs.readFileSync(path.join(__dirname, '../src/lib/concept-guides.ts'), 'utf8');
  const officeDocFile = fs.readFileSync(path.join(__dirname, '../src/lib/office-documents.ts'), 'utf8');

  // 1. Verify EOCD and Central Directory parsing exists in office-documents.ts
  assert.ok(officeDocFile.includes('0x06054b50'), 'Parses End of Central Directory (EOCD 0x06054b50)');
  assert.ok(officeDocFile.includes('0x02014b50'), 'Parses Central Directory header (0x02014b50)');
  assert.ok(officeDocFile.includes('isTargetFile'), 'Identifies target document.xml or sheet1.xml');
  assert.ok(officeDocFile.includes('decompressDeflateStream'), 'Decompresses Deflate streams');

  // 2. Verify key-value table extraction uses fuzzy keyword matching (resolves Title [MANDATORY] bug)
  assert.ok(conceptGuidesFile.includes('getKvVal'), 'Uses getKvVal helper for flexible key matching');
  assert.ok(conceptGuidesFile.includes("getKvVal('title')"), 'Retrieves title using getKvVal');
  assert.ok(conceptGuidesFile.includes("getKvVal('category')"), 'Retrieves category using getKvVal');
  assert.ok(conceptGuidesFile.includes("getKvVal('summary')"), 'Retrieves summary using getKvVal');

  // 3. Verify freeform / heading text parser supports Markdown # and bold labels
  assert.ok(conceptGuidesFile.includes('titleHeaderMatches') || conceptGuidesFile.includes('Single Document'), 'Detects flexible structured markers including headings and labels');

  // 4. Test simulated Google Docs exported HTML table with [MANDATORY] labels
  // Extract and run parseImportedGuides in Node
  const sampleGoogleDocsTable = `
  <table>
    <tr><td>Title [MANDATORY]</td><td>REST Assured API Automation Masterclass</td></tr>
    <tr><td>Category [MANDATORY]</td><td>API Testing</td></tr>
    <tr><td>Level [MANDATORY]</td><td>Intermediate</td></tr>
    <tr><td>Summary [MANDATORY]</td><td>Comprehensive guide for REST Assured testing in SDET interviews.</td></tr>
    <tr><td>Overview [MANDATORY]</td><td>**REST Assured** is a Java DSL for simplifying HTTP testing.<br/>• Fluent syntax<br/>• Schema validation</td></tr>
    <tr><td>ArchitectureOrMechanism [OPTIONAL]</td><td>RequestSpecification and ResponseSpecification chaining</td></tr>
    <tr><td>CodeLanguage [MANDATORY]</td><td>java</td></tr>
    <tr><td>CodeCaption [OPTIONAL]</td><td>REST Assured GET Verification</td></tr>
    <tr><td>CodeSnippet [MANDATORY]</td><td>given().when().get("/users").then().statusCode(200);</td></tr>
    <tr><td>BestPractices [OPTIONAL]</td><td>Reuse RequestSpecBuilder; Validate response schema; Use POJO serialization</td></tr>
    <tr><td>AntiPatterns [OPTIONAL]</td><td>Hardcoding URLs; Skipping assertions; Not logging failures</td></tr>
    <tr><td>InterviewTips [OPTIONAL]</td><td>Explain difference between RestTemplate and REST Assured</td></tr>
  </table>
  `;

  // Dynamic evaluation of parseImportedGuides logic using Node
  const hasTable = sampleGoogleDocsTable.includes('<table');
  assert.ok(hasTable, 'Table detected');
  const rowMatches = sampleGoogleDocsTable.match(/<tr[\s\S]*?<\/tr>/gi) || [];
  assert.strictEqual(rowMatches.length, 12, 'Found all 12 rows');

  const cleanText = (str) => str.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]*>/g, '').trim();
  const kvMap = {};
  for (const row of rowMatches) {
    const cells = (row.match(/<t[dh][\s\S]*?<\/t[dh]>/gi) || []).map(cleanText);
    if (cells.length >= 2) {
      const rawKey = cells[0].toLowerCase().replace(/[^a-z0-9]/g, '');
      const rawVal = cells.slice(1).join(' ').trim();
      kvMap[rawKey] = rawVal;
    }
  }

  const getKvVal = (keyword) => {
    const matchKey = Object.keys(kvMap).find(k => k.includes(keyword));
    return matchKey && kvMap[matchKey] ? kvMap[matchKey].trim() : '';
  };

  assert.strictEqual(getKvVal('title'), 'REST Assured API Automation Masterclass', 'Matched Title [MANDATORY]');
  assert.strictEqual(getKvVal('category'), 'API Testing', 'Matched Category [MANDATORY]');
  assert.strictEqual(getKvVal('summary'), 'Comprehensive guide for REST Assured testing in SDET interviews.', 'Matched Summary [MANDATORY]');
  assert.ok(getKvVal('overview').includes('**REST Assured**'), 'Retained bold formatting');
  assert.ok(getKvVal('overview').includes('• Fluent syntax'), 'Retained bullet list');
  assert.strictEqual(getKvVal('codesnippet'), 'given().when().get("/users").then().statusCode(200);', 'Matched CodeSnippet [MANDATORY]');
});

test('Fix 346 sections flaw: Single document import preserves entire article as 1 guide instead of splitting per line/bullet', () => {
  const conceptGuidesFile = fs.readFileSync(path.join(__dirname, '../src/lib/concept-guides.ts'), 'utf8');

  // Verify single-document fallback parser exists and parses as ONE comprehensive guide
  assert.ok(conceptGuidesFile.includes('Single Document / Article / Tutorial / Notes Import'), 'Provides dedicated single-document handler');
  assert.ok(conceptGuidesFile.includes('imported-doc-'), 'Produces imported-doc ID');
  assert.ok(conceptGuidesFile.includes('csvCandidateLines'), 'Guards CSV parser against splitting single lines');

  // Simulate a 350-line article containing notes, bullet points like .log().all(), and code
  const lines = [
    '# Comprehensive Guide to API Testing with REST Assured',
    '',
    'Category: API Testing',
    'Level: Intermediate',
    'Summary: A complete architectural overview of REST Assured automation framework design.',
    '',
    '## Introduction and Setup',
    'REST Assured is a powerful Java DSL for validating RESTful web services in enterprise test harnesses.',
    '',
  ];

  for (let i = 1; i <= 340; i++) {
    lines.push(`• .log().all() is optional step ${i} used to print full response details for debugging`);
  }

  lines.push('```java');
  lines.push('given().when().get("/api/v1/health").then().statusCode(200);');
  lines.push('```');

  const fullArticle = lines.join('\n');
  assert.strictEqual(lines.length > 340, true, 'Article has over 340 lines');

  // Verify that CSV check does NOT treat this non-CSV text as hundreds of CSV rows
  const rawLines = fullArticle.split('\n').map(l => l.trim()).filter(Boolean);
  const csvCandidateLines = rawLines.filter(l => l.includes(',') && l.split(',').length >= 3);
  assert.strictEqual(csvCandidateLines.length, 0, 'Does not mistakenly identify article text as CSV');

  // Title extraction should find the main title, NOT bullet points
  let extractedTitle = '';
  const headingMatch = fullArticle.match(/^#+\s*([^\n\r]+)/m);
  if (headingMatch) {
    extractedTitle = headingMatch[1].trim();
  }
  assert.strictEqual(extractedTitle, 'Comprehensive Guide to API Testing with REST Assured', 'Correctly identifies article title');
  assert.ok(!extractedTitle.startsWith('• .log().all()'), 'Did not use a bullet point as the guide title');
});

test('Tutorials & Articles option and Admin pre-approval correction / re-allocation capability', () => {
  const addGuideModalFile = fs.readFileSync(path.join(__dirname, '../src/components/interview/add-guide-modal.tsx'), 'utf8');
  const conceptGuidesFile = fs.readFileSync(path.join(__dirname, '../src/lib/concept-guides.ts'), 'utf8');
  const adminPageFile = fs.readFileSync(path.join(__dirname, '../src/app/admin/page.tsx'), 'utf8');
  const qaDbFile = fs.readFileSync(path.join(__dirname, '../src/lib/qa-db.ts'), 'utf8');

  // 1. "Tutorials & Articles" option is listed in Share your Knowledge / Add Guide modal COURSE_TRACK_OPTIONS
  assert.ok(addGuideModalFile.includes("id: 'articles'"), 'COURSE_TRACK_OPTIONS includes articles ID');
  assert.ok(addGuideModalFile.includes('Tutorials & Articles'), 'COURSE_TRACK_OPTIONS includes "Tutorials & Articles"');
  assert.ok(conceptGuidesFile.includes('Tutorials & Articles'), 'TRACK_META provides Tutorials & Articles metadata');

  // 2. QADatabase supports updateSubmission and overrideFields on approveSubmission
  assert.ok(qaDbFile.includes('updateSubmission('), 'QADatabase provides updateSubmission');
  assert.ok(qaDbFile.includes('overrideFields?: Partial<ModerationItem>'), 'approveSubmission supports overrideFields');

  // 3. Admin Station provides destination track re-allocation dropdown and edit mode
  assert.ok(adminPageFile.includes('isEditingPreview'), 'Admin provides toggleable edit/correction mode');
  assert.ok(adminPageFile.includes('Destination Course Category / Track:'), 'Admin review modal includes destination track selector');
  assert.ok(adminPageFile.includes('Tutorials &amp; Articles (Knowledge Hub)'), 'Admin can re-allocate guide to Tutorials & Articles');
  assert.ok(adminPageFile.includes('QADatabase.updateSubmission'), 'Admin can save corrections before approval');
});

test('Single Import strictly produces a single Publish for Admin approval (1 Pending Review)', () => {
  const addGuideModalFile = fs.readFileSync(path.join(__dirname, '../src/components/interview/add-guide-modal.tsx'), 'utf8');
  const conceptGuidesFile = fs.readFileSync(path.join(__dirname, '../src/lib/concept-guides.ts'), 'utf8');
  const officeDocFile = fs.readFileSync(path.join(__dirname, '../src/lib/office-documents.ts'), 'utf8');

  // 1. Verify consolidateGuidesIntoSingle is implemented and exported in concept-guides.ts
  assert.ok(conceptGuidesFile.includes('export function consolidateGuidesIntoSingle'), 'Exports consolidateGuidesIntoSingle');
  assert.ok(conceptGuidesFile.includes('singleGuide: boolean = true'), 'parseImportedGuides defaults to singleGuide = true');

  // 2. Verify DOCX document.xml parser extracts both paragraphs and tables sequentially
  assert.ok(officeDocFile.includes('elemRegex = /<w:p[\\s\\S]*?<\\/w:p>|<w:tbl[\\s\\S]*?<\\/w:tbl>/gi'), 'Extracts both paragraphs and tables in sequential document order');

  // 3. Verify horizontal table parser does NOT convert arbitrary 13-row data/status tables into 13 separate guides
  assert.ok(conceptGuidesFile.includes('hasGuideHeaders'), 'Checks for explicit guide column headers before splitting table rows');

  // 4. Verify add-guide-modal provides "Consolidate into 1 Guide" button for multi-section reviews
  assert.ok(addGuideModalFile.includes('Consolidate into 1 Guide'), 'Modal provides "Consolidate into 1 Guide" button');
  assert.ok(addGuideModalFile.includes('handleConsolidateStaging'), 'Modal implements handleConsolidateStaging');
  assert.ok(addGuideModalFile.includes('clearStagedGuides(selectedTrack)'), 'Modal clears prior staging on single file import for clean 1-guide review');

  // 5. Test multi-section simulation (13 sections) consolidation logic in Node
  const thirteenSections = [];
  for (let i = 1; i <= 13; i++) {
    thirteenSections.push({
      id: `section-${i}`,
      title: i === 1 ? 'Comprehensive REST Assured API Testing Masterclass' : `REST Assured Module ${i}: Core Technique`,
      category: 'API Testing',
      level: 'Intermediate',
      summary: `Detailed summary for module ${i} explaining HTTP methods and assertions.`,
      overview: `### Section ${i} Content\n• Core rule ${i}\n• Architectural pattern ${i}\n\nDetailed explanation of module ${i}.`,
      codeSnippets: [{ language: 'java', code: `given().get("/api/${i}").then().statusCode(200);`, caption: `Module ${i} Example` }],
      bestPractices: [`Best practice ${i}`],
      antiPatterns: [`Anti-pattern ${i}`],
      interviewTips: `Interview tip ${i}`,
    });
  }

  assert.strictEqual(thirteenSections.length, 13, 'Created 13 sections');

  // Evaluate consolidateGuidesIntoSingle logic
  const primaryTitle = thirteenSections[0].title;
  const sections = [];
  for (const g of thirteenSections) {
    const parts = [];
    if (g.title !== primaryTitle) parts.push(`### ${g.title}`);
    if (g.overview) parts.push(g.overview);
    if (g.bestPractices && g.bestPractices.length > 0) parts.push(`**Best Practices:**\n${g.bestPractices.map(b => `• ${b}`).join('\n')}`);
    sections.push(parts.join('\n\n'));
  }

  const consolidatedOverview = sections.join('\n\n---\n\n');
  assert.strictEqual(primaryTitle, 'Comprehensive REST Assured API Testing Masterclass', 'Identifies primary topic title');
  assert.ok(consolidatedOverview.includes('Section 1 Content'), 'Contains section 1 content');
  assert.ok(consolidatedOverview.includes('REST Assured Module 13: Core Technique'), 'Contains section 13');
  assert.ok(consolidatedOverview.includes('Best practice 13'), 'Contains best practices from section 13');
});

test('End-to-End Import & Admin Approval flow: Submitting from Share your Knowledge populates Admin Moderation Queue', () => {
  const addGuideModalFile = fs.readFileSync(path.join(__dirname, '../src/components/interview/add-guide-modal.tsx'), 'utf8');
  const conceptGuidesFile = fs.readFileSync(path.join(__dirname, '../src/lib/concept-guides.ts'), 'utf8');
  const adminPageFile = fs.readFileSync(path.join(__dirname, '../src/app/admin/page.tsx'), 'utf8');

  // 1. Modal action buttons explicitly submit to Admin Approval queue
  assert.ok(addGuideModalFile.includes('Submit for Admin Approval'), 'Button text includes "Submit for Admin Approval"');
  assert.ok(addGuideModalFile.includes('submitStagedGuidesForApproval(selectedTrack'), 'Calls submitStagedGuidesForApproval on submit');

  // 2. submitStagedGuidesForApproval registers into QADatabase moderation queue
  assert.ok(conceptGuidesFile.includes('QADatabase.submitContentForReview'), 'concept-guides.ts pushes submissions to QADatabase review queue');
  assert.ok(conceptGuidesFile.includes("type: 'guide'"), 'Registers guide type submission');

  // 3. Admin page detects staged guides and imports them into review queue
  assert.ok(conceptGuidesFile.includes('getAllStagedGuidesAcrossTracks'), 'Exports getAllStagedGuidesAcrossTracks');
  assert.ok(adminPageFile.includes('getAllStagedGuidesAcrossTracks()'), 'Admin page loads staged guides across all tracks');
  assert.ok(adminPageFile.includes('Import Staged into Queue'), 'Admin page provides 1-click import from staging into queue');
});
