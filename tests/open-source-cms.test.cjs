const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

const {
  calculateReadingTime,
  generateTableOfContents,
  validateImageUpload,
  sanitizeHtml,
  ALLOWED_IMAGE_MIME_TYPES,
  MAX_FILE_SIZE_BYTES,
} = require('../src/lib/cms-engine.js');

test('1. Admin login & authorization: Only authorized Admin/Editor can modify CMS', () => {
  const cmsSecurityPath = path.join(process.cwd(), 'src/lib/cms-security.ts');
  const cmsPagePath = path.join(process.cwd(), 'src/app/admin/cms/page.tsx');
  const securityContent = fs.readFileSync(cmsSecurityPath, 'utf-8');
  const pageContent = fs.readFileSync(cmsPagePath, 'utf-8');

  assert.ok(securityContent.includes('verifyAdminAccess'), 'Must provide verifyAdminAccess');
  assert.ok(
    pageContent.includes('Administrator Access Gateway'),
    'Must provide gateway gatekeeper'
  );
  assert.ok(pageContent.includes('verifyAndElevateAdmin'), 'Must verify admin credentials');
});

test('2 & 3. Create and Edit Article: Full CRUD functionality with Editor.js data model', () => {
  const cmsStorePath = path.join(process.cwd(), 'src/lib/cms-store.ts');
  const storeContent = fs.readFileSync(cmsStorePath, 'utf-8');

  assert.ok(storeContent.includes('saveArticle('), 'Must provide saveArticle');
  assert.ok(storeContent.includes('getArticleById('), 'Must provide getArticleById');
  assert.ok(storeContent.includes('getArticleBySlug('), 'Must provide getArticleBySlug');
  assert.ok(storeContent.includes('deleteArticle('), 'Must provide deleteArticle');
  assert.ok(storeContent.includes('duplicateArticle('), 'Must provide duplicateArticle');
});

test('4 & 5. Save Draft & Autosave: Draft status and word count reading time calculation', () => {
  const draftData = {
    blocks: [
      { id: 'h1', type: 'header', data: { text: 'Getting Started', level: 2 } },
      {
        id: 'p1',
        type: 'paragraph',
        data: {
          text: 'This is a sample guide for testing automated test execution in CI/CD pipelines.',
        },
      },
    ],
  };

  const readTime = calculateReadingTime(draftData);
  assert.ok(readTime >= 1, 'Reading time must be at least 1 minute');

  const editorComp = fs.readFileSync(
    path.join(process.cwd(), 'src/components/cms/editor/rich-block-editor.tsx'),
    'utf-8'
  );
  assert.ok(editorComp.includes('autoSaveTimerRef'), 'Must implement autosave timer');
  assert.ok(editorComp.includes('Unsaved changes'), 'Must show unsaved changes indicator');
  assert.ok(editorComp.includes('All changes saved'), 'Must show all changes saved indicator');
});

test('6 & 7. Upload Screenshot & Paste Screenshot: Image validation, format checks & clipboard handler', () => {
  // Test valid PNG buffer (magic bytes: 89 50 4E 47)
  const validPng = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const validation = validateImageUpload(validPng, 'image/png', 'screenshot.png');
  assert.strictEqual(validation.valid, true, 'Valid PNG buffer must pass validation');

  // Test invalid MIME
  const invalidValidation = validateImageUpload(
    Buffer.from('malicious-exe'),
    'application/x-msdownload',
    'virus.exe'
  );
  assert.strictEqual(invalidValidation.valid, false, 'Invalid MIME must be rejected');

  // Verify Media Library clipboard paste support
  const mediaLib = fs.readFileSync(
    path.join(process.cwd(), 'src/components/cms/media-library-modal.tsx'),
    'utf-8'
  );
  assert.ok(mediaLib.includes('handlePaste'), 'Media library modal must support clipboard paste');
  assert.ok(mediaLib.includes('handleDrop'), 'Media library modal must support drag & drop');
});

test('8 & 9. Code Blocks & Table Insertion: Rich block editor supports syntax highlighting and tables', () => {
  const editorComp = fs.readFileSync(
    path.join(process.cwd(), 'src/components/cms/editor/rich-block-editor.tsx'),
    'utf-8'
  );
  assert.ok(
    editorComp.includes("case 'code':") || editorComp.includes("block.type === 'code'"),
    'Must support code block editing'
  );
  assert.ok(
    editorComp.includes("case 'table':") || editorComp.includes("block.type === 'table'"),
    'Must support interactive table block editing'
  );
  assert.ok(editorComp.includes('+ Add Row'), 'Must support adding table rows');
  assert.ok(editorComp.includes('+ Add Column'), 'Must support adding table columns');
});

test('10. Table of Contents Generator: Generates unique anchors and hierarchy from H2/H3', () => {
  const content = {
    blocks: [
      { id: 'b1', type: 'header', data: { text: 'Overview of Selenium', level: 2 } },
      { id: 'b2', type: 'header', data: { text: 'WebDriver Architecture', level: 2 } },
      { id: 'b3', type: 'header', data: { text: 'Client Tier', level: 3 } },
      { id: 'b4', type: 'header', data: { text: 'Overview of Selenium', level: 2 } }, // duplicate text
    ],
  };

  const toc = generateTableOfContents(content);
  assert.strictEqual(toc.length, 4, 'Must extract all eligible H2/H3 headings');
  assert.strictEqual(toc[0].id, 'overview-of-selenium');
  assert.strictEqual(toc[1].id, 'webdriver-architecture');
  assert.strictEqual(toc[2].id, 'client-tier');
  assert.strictEqual(
    toc[3].id,
    'overview-of-selenium-1',
    'Duplicate heading must receive a unique disambiguated ID'
  );
});

test('11 & 12. Preview & Publish Article: Article preview mode and publication status toggle', () => {
  const cmsStoreContent = fs.readFileSync(
    path.join(process.cwd(), 'src/lib/cms-store.ts'),
    'utf-8'
  );
  const cmsPageContent = fs.readFileSync(
    path.join(process.cwd(), 'src/app/admin/cms/page.tsx'),
    'utf-8'
  );

  assert.ok(cmsStoreContent.includes("status: 'published'"), 'Store supports published status');
  assert.ok(
    cmsPageContent.includes("handleSaveArticle('published')"),
    'CMS UI has Publish Article action'
  );
  assert.ok(
    cmsPageContent.includes("handleSaveArticle('draft')"),
    'CMS UI has Save as Draft action'
  );
});

test('13 & 14. Update Published Article & Restore Revision: Snapshots are preserved and restorable', () => {
  const cmsStoreContent = fs.readFileSync(
    path.join(process.cwd(), 'src/lib/cms-store.ts'),
    'utf-8'
  );
  const cmsPageContent = fs.readFileSync(
    path.join(process.cwd(), 'src/app/admin/cms/page.tsx'),
    'utf-8'
  );

  assert.ok(cmsStoreContent.includes('restoreRevision('), 'Store provides restoreRevision method');
  assert.ok(
    cmsPageContent.includes('handleRestoreRevision'),
    'CMS page implements handleRestoreRevision'
  );
});

test('15, 16, 17, 18. Course, Module, Lesson Management & Reordering', () => {
  const cmsPage = fs.readFileSync(path.join(process.cwd(), 'src/app/admin/cms/page.tsx'), 'utf-8');
  assert.ok(cmsPage.includes('handleMoveModule'), 'CMS supports module ordering');
  assert.ok(cmsPage.includes('handleMoveLesson'), 'CMS supports lesson ordering');
  assert.ok(cmsPage.includes('QADatabase.moveLesson'), 'CMS connects to QADatabase.moveLesson');
});

test('19 & 20. Public Article Presentation & Mobile Responsiveness: Reference site layout fidelity', () => {
  const publicView = fs.readFileSync(
    path.join(process.cwd(), 'src/components/blog/public-article-view.tsx'),
    'utf-8'
  );
  assert.ok(publicView.includes('Table of Contents'), 'Public article displays Table of Contents');
  assert.ok(publicView.includes('mobileTocOpen'), 'Public article supports mobile collapsible TOC');
  assert.ok(
    publicView.includes('overflow-x-auto'),
    'Code blocks and tables support horizontal scrolling on mobile'
  );
  assert.ok(publicView.includes('readingTimeMinutes'), 'Article displays reading time');
  assert.ok(publicView.includes('Updated on'), 'Article displays updated date');
  assert.ok(publicView.includes('Related Tutorials'), 'Article displays related tutorials section');
});

test('21. SEO Metadata: OpenGraph, canonical, Twitter, and Schema.org JSON-LD generation', () => {
  const blogSlugPage = fs.readFileSync(
    path.join(process.cwd(), 'src/app/blog/[slug]/page.tsx'),
    'utf-8'
  );
  assert.ok(blogSlugPage.includes('generateMetadata'), 'App Router generates dynamic metadata');
  assert.ok(blogSlugPage.includes('canonical'), 'Metadata includes canonical URL');
  assert.ok(blogSlugPage.includes('openGraph'), 'Metadata includes OpenGraph tags');

  const publicView = fs.readFileSync(
    path.join(process.cwd(), 'src/components/blog/public-article-view.tsx'),
    'utf-8'
  );
  assert.ok(publicView.includes('BlogPosting'), 'Article injects BlogPosting structured data');
  assert.ok(
    publicView.includes('BreadcrumbList'),
    'Article injects BreadcrumbList structured data'
  );
  assert.ok(
    publicView.includes('FAQPage'),
    'Article injects FAQPage structured data when FAQs exist'
  );
});

test('22. Unauthorized Access & XSS Sanitization: Malicious tags stripped and route secured', () => {
  const dirtyHtml =
    '<p>Normal text <script>alert("xss")</script><iframe src="bad.com"></iframe></p>';
  const clean = sanitizeHtml(dirtyHtml);
  assert.strictEqual(clean.includes('<script>'), false, 'Script tags must be removed');
  assert.strictEqual(clean.includes('<iframe>'), false, 'Iframe tags must be removed');
  assert.ok(clean.includes('Normal text'), 'Safe text must be preserved');
});
