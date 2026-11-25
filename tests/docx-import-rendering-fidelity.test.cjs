const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

const jiti = require('jiti')(__filename, {
  alias: {
    '@': path.join(process.cwd(), 'src'),
  },
});

const { validateDocxFile, processDocxDocument } = jiti('../src/lib/docx-engine.ts');
const { academyStore } = jiti('../src/lib/academy-store.ts');
const { POST: uploadDocHandler } = jiti('../src/app/api/admin/learning/documents/upload/route.ts');

const FIDELITY_DOCX_PATH = path.join(
  process.cwd(),
  'public/uploads/learning/docs/fidelity_test_suite_v4.docx'
);

// 1. File Validation & Security Engine
test('Phase 4 Security & Validation: Rejects invalid signatures, bad extensions, and oversized files', () => {
  // Test 1: Invalid extension
  const txtBuffer = Buffer.from('Just plain text');
  const txtVal = validateDocxFile(txtBuffer, 'malicious_script.txt');
  assert.strictEqual(txtVal.valid, false);
  assert.ok(txtVal.error.includes('.docx'), 'Must enforce .docx extension');

  // Test 2: Invalid binary signature (not PK\x03\x04)
  const badSigBuffer = Buffer.from([0x00, 0x11, 0x22, 0x33, 0x44]);
  const badSigVal = validateDocxFile(badSigBuffer, 'corrupted_doc.docx');
  assert.strictEqual(badSigVal.valid, false);
  assert.ok(badSigVal.error.includes('PK zip signature'), 'Must check PK zip magic bytes');

  // Test 3: Empty file
  const emptyVal = validateDocxFile(Buffer.alloc(0), 'empty.docx');
  assert.strictEqual(emptyVal.valid, false);
  assert.ok(emptyVal.error.includes('0 bytes'), 'Must reject empty files');

  // Test 4: Valid docx signature
  assert.ok(fs.existsSync(FIDELITY_DOCX_PATH), 'Fidelity test docx fixture must exist on disk');
  const validBuffer = fs.readFileSync(FIDELITY_DOCX_PATH);
  const validVal = validateDocxFile(validBuffer, 'fidelity_test_suite_v4.docx');
  assert.strictEqual(validVal.valid, true);
  assert.ok(validVal.fileSizeBytes > 0);
  assert.strictEqual(typeof validVal.sha256, 'string');
});

// 2. High-Fidelity Element Preservation & Asset Extraction
test('Phase 4 Fidelity Engine: Preserves Headings, Lists, Tables, Code Blocks, Hyperlinks, and Extracts Images', () => {
  const result = processDocxDocument({
    docxFilePath: FIDELITY_DOCX_PATH,
    lessonId: 'les-fidelity-engine-test',
    originalFilename: 'fidelity_test_suite_v4.docx',
  });

  assert.strictEqual(result.success, true, 'Processing must succeed without error');
  const html = result.html;

  // 1. Multiple heading levels with anchor IDs
  assert.ok(html.includes('<h1 id="'), 'Must generate H1 with id');
  assert.ok(html.includes('<h2 id="'), 'Must generate H2 with id');
  assert.ok(html.includes('<h3 id="'), 'Must generate H3 with id');
  assert.ok(html.includes('Autonomous Quality Engineering Architecture'), 'Must preserve H1 text');
  assert.ok(html.includes('Core Transformer Pipeline'), 'Must preserve H2 text');

  // 2. Paragraphs & Formatted text
  assert.ok(html.includes('<strong>Bold Text Example</strong>'), 'Must preserve Bold text');
  assert.ok(html.includes('<em>Italic Text Example</em>'), 'Must preserve Italic text');
  assert.ok(
    html.includes('<u>') && html.includes('Bold-Italic-Underlined Text') && html.includes('</u>'),
    'Must preserve Underline text'
  );

  // 3. Special characters & symbols
  assert.ok(
    html.includes('&lt;tag&gt;') && html.includes('&quot;quotes&quot;'),
    'Special characters encoded safely'
  );
  assert.ok(html.includes('© 2026'), 'Must preserve copyright symbol');
  assert.ok(html.includes('λ lambda'), 'Must preserve unicode lambda');
  assert.ok(html.includes('✓ checkmark'), 'Must preserve checkmark');

  // 4. Nested and Numbered Lists
  assert.ok(html.includes('<ul') && html.includes('</ul>'), 'Must generate unordered bullet lists');
  assert.ok(html.includes('Root Bullet Item: Quality Engineering Foundations'), 'Root bullet text');
  assert.ok(
    html.includes('Nested Bullet Level 1: Deterministic Element Locators'),
    'Nested bullet text'
  );
  assert.ok(html.includes('<ol class="list-decimal'), 'Must generate ordered list tag');
  assert.ok(
    html.includes('Initialize Test Driver and Browser Context'),
    'Numbered list step 1 content preserved'
  );

  // 5. Tables
  assert.ok(html.includes('<table') && html.includes('</table>'), 'Must generate HTML table');
  assert.ok(html.includes('<th') || html.includes('Capability'), 'Table header preserved');
  assert.ok(
    html.includes('Headings &amp; Structure') || html.includes('Headings & Structure'),
    'Table cell 1'
  );
  assert.ok(html.includes('100% Semantic Match'), 'Table cell 2');

  // 6. Image Extraction & Preservation
  assert.strictEqual(result.extractedImages.length, 2, 'Must extract both embedded PNG images');
  assert.ok(
    html.includes('<figure') && html.includes('<img src="/uploads/learning/images/'),
    'Image tag embedded in HTML'
  );
  assert.ok(
    html.includes('Figure 1') || html.includes('QE Architecture Diagram'),
    'Image caption preserved'
  );

  // Verify extracted image files actually exist on disk
  for (const img of result.extractedImages) {
    assert.ok(
      fs.existsSync(img.storage_path),
      `Extracted image file must exist on disk: ${img.storage_path}`
    );
    assert.ok(fs.statSync(img.storage_path).size > 0, 'Extracted image must not be empty');
  }

  // 7. Code Blocks & Copy Button
  assert.ok(html.includes('<pre') && html.includes('<code'), 'Must render preformatted code block');
  assert.ok(
    html.includes('SeleniumEnterpriseTest') || html.includes('ChromeDriver'),
    'Java code text preserved'
  );
  assert.ok(
    html.includes('import { test, expect } from &#x27;@playwright/test&#x27;') ||
      html.includes('@playwright/test'),
    'TypeScript code text preserved'
  );
  assert.ok(html.includes('Copy Code'), 'Must render interactive Copy Code button');
  assert.ok(!html.includes('<script>'), 'Must never execute or include raw scripts');

  // 8. Hyperlinks with safe attributes
  assert.ok(html.includes('href="https://playwright.dev"'), 'Hyperlink target URL preserved');
  assert.ok(html.includes('target="_blank"'), 'External link has target _blank');
  assert.ok(html.includes('rel="noopener noreferrer"'), 'External link has safe rel attribute');

  // 9. Page Break
  assert.ok(html.includes('docx-page-break') || html.includes('Page Break'), 'Page break rendered');

  // 10. Printable HTML / PDF layout companion
  assert.ok(result.pdfPath.endsWith('_print.html'), 'Generated printable companion HTML');
  const printDiskPath = path.join(process.cwd(), 'public', result.pdfPath);
  assert.ok(fs.existsSync(printDiskPath), 'Printable HTML file must exist on disk');
  const printContent = fs.readFileSync(printDiskPath, 'utf-8');
  assert.ok(
    printContent.includes('@page') && printContent.includes('@media print'),
    'Printable layout contains CSS paged media rules'
  );
});

// 3. Document Upload API Integration & Automated Reprocessing
test('Phase 4 API Integration: Multipart DOCX upload parses, extracts assets, and updates lesson', async () => {
  // 1. Create a lesson to receive the uploaded docx
  const demoCourseSlug = `fidelity-course-${Date.now()}`;
  const course = academyStore.createCourse({
    categoryId: 'cat-ai-for-qa',
    title: 'Fidelity Assessment Track',
    slug: demoCourseSlug,
    description: 'Document import testing course',
    icon: 'FileText',
    level: 'All Levels',
    estimatedHours: 4,
    sortOrder: 99,
    status: 'draft',
    modules: [],
  });
  assert.ok(course && course.id);

  const module = academyStore.createModule(course.id, {
    title: 'Document Fidelity Module',
    slug: `fidelity-module-${Date.now()}`,
    description: 'Testing document engine',
    sortOrder: 1,
    status: 'draft',
  });
  assert.ok(module && module.id);

  const lesson = academyStore.createLesson(course.id, module.id, {
    title: 'Automated Document Ingestion Test',
    slug: `fidelity-lesson-${Date.now()}`,
    summary: 'Testing full upload, extraction, and rendering',
    shortDescription: 'Testing full upload, extraction, and rendering',
    contentType: 'docx',
    sortOrder: 1,
    status: 'draft',
  });
  assert.ok(lesson && lesson.id);

  // 2. Call upload API with multipart FormData
  const fileBuffer = fs.readFileSync(FIDELITY_DOCX_PATH);
  const fileBlob = new Blob([fileBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });
  const formData = new FormData();
  formData.append('file', fileBlob, 'fidelity_test_suite_v4.docx');
  formData.append('lessonId', lesson.id);
  formData.append('assetType', 'attachment');

  const uploadReq = new Request('http://localhost:3000/api/admin/learning/documents/upload', {
    method: 'POST',
    headers: {
      'x-admin-token': 'admin',
    },
    body: formData,
  });

  const uploadRes = await uploadDocHandler(uploadReq);
  assert.strictEqual(uploadRes.status, 201, 'Upload API must return 201 Created');
  const json = await uploadRes.json();

  assert.strictEqual(json.success, true);
  assert.ok(json.data.filePath.endsWith('.docx'), 'Original DOCX path stored');
  assert.ok(json.data.processing, 'Must return processing metadata');
  assert.strictEqual(json.data.processing.success, true);
  assert.strictEqual(json.data.processing.extractedImages.length, 2);

  // 3. Verify lesson in academyStore was automatically updated with converted content
  const updatedLesson = academyStore.getLesson(lesson.slug, { includeDrafts: true });
  assert.ok(updatedLesson && updatedLesson.lesson);
  assert.ok(updatedLesson.lesson.contentHtml.length > 500, 'Lesson must contain rendered HTML');
  assert.ok(
    updatedLesson.lesson.contentHtml.includes('Autonomous Quality Engineering Architecture'),
    'Lesson contains converted headings'
  );
  assert.ok(
    updatedLesson.lesson.originalDocxPath.includes('.docx'),
    'Lesson links to original DOCX'
  );
  assert.ok(
    updatedLesson.lesson.pdfPath.includes('_print.html'),
    'Lesson links to printable PDF layout'
  );

  // 4. Verify Reprocessing on replacement: upload again with fresh request
  const reprocessFormData = new FormData();
  reprocessFormData.append('file', fileBlob, 'fidelity_test_suite_v4.docx');
  reprocessFormData.append('lessonId', lesson.id);
  reprocessFormData.append('assetType', 'attachment');

  const reprocessReq = new Request('http://localhost:3000/api/admin/learning/documents/upload', {
    method: 'POST',
    headers: {
      'x-admin-token': 'admin',
    },
    body: reprocessFormData,
  });

  const reprocessRes = await uploadDocHandler(reprocessReq);
  assert.strictEqual(reprocessRes.status, 201, 'Reprocessing on document replacement succeeds');

  // Cleanup
  academyStore.deleteCourse(course.id);
});
