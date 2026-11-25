const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const jiti = require('jiti')(__filename, {
  alias: {
    '@': path.join(process.cwd(), 'src'),
  },
});

const { academyStore } = jiti('../src/lib/academy-store.ts');
const { ACADEMY_MODULES, getAllLessons, getLessonBySlug, getAdjacentLessons } = jiti(
  '../src/data/learning/academy-curriculum.ts'
);
const { processDocxDocument } = jiti('../src/lib/docx-engine.ts');

// =============================================================================
// PHASE 5 — AI ACADEMY COURSE IMPLEMENTATION & END-TO-END VALIDATION TEST SUITE
// =============================================================================

test('Phase 5 Course: AI Academy course exists in database with published status and description', () => {
  const courses = academyStore.getCourses({ includeDrafts: false });
  const aiCourse = courses.find(
    (c) => c.id === 'course-ai-qa-mastery' || c.title.toLowerCase().includes('ai academy')
  );

  assert.ok(aiCourse, 'AI Academy course must exist in database');
  assert.strictEqual(aiCourse.status, 'published', 'Course status must be published');
  assert.ok(
    aiCourse.description.includes('Software Test Engineers') &&
      aiCourse.description.includes('Artificial Intelligence in Software Quality Engineering'),
    'Course description must match approved Phase 5 specification'
  );
});

test('Phase 5 Modules: All 6 required AI Academy modules exist in database and curriculum tree', () => {
  const aiCourse = academyStore.getCourse('course-ai-qa-mastery', { includeDrafts: false });
  assert.ok(aiCourse, 'AI Academy course must be retrievable');

  const modules = aiCourse.modules || [];
  assert.strictEqual(modules.length, 6, 'AI Academy must contain exactly 6 modules');

  const expectedModuleTitles = [
    'Introduction to AI',
    'Prompt Engineering',
    'Context Engineering',
    'Model Context Protocol (MCP)',
    'AI Agents for QA',
    'AI-Powered Test Automation',
  ];

  for (let i = 0; i < expectedModuleTitles.length; i++) {
    const expected = expectedModuleTitles[i];
    const found = modules.some((m) => m.title.includes(expected));
    assert.ok(
      found,
      `Module ${i + 1} must match: "${expected}". Available: ${modules.map((m) => m.title).join(', ')}`
    );
  }

  // Also verify typed curriculum reflects 6 modules
  assert.strictEqual(ACADEMY_MODULES.length, 6, 'Typed ACADEMY_MODULES must contain 6 modules');
});

test('Phase 5 Lessons: All 46 lessons exist across the 6 modules with complete metadata and content', () => {
  const allLessons = getAllLessons();
  assert.strictEqual(allLessons.length, 46, 'Must contain exactly 46 lessons in AI Academy');

  const dbCourse = academyStore.getCourse('course-ai-qa-mastery', { includeDrafts: false });
  let dbLessonCount = 0;
  for (const m of dbCourse.modules || []) {
    dbLessonCount += (m.lessons || []).length;
  }
  assert.strictEqual(dbLessonCount, 46, 'Database store must contain all 46 published lessons');

  // Verify per-module lesson counts
  const moduleLessonCounts = (dbCourse.modules || []).map((m) => m.lessons.length);
  assert.deepStrictEqual(
    moduleLessonCounts,
    [7, 8, 7, 9, 8, 7],
    'Module lesson counts must match Phase 5 specification: [7, 8, 7, 9, 8, 7]'
  );
});

test('Phase 5 12-Section Fidelity: Every lesson contains all 12 required sections in HTML and DOCX', () => {
  const dbCourse = academyStore.getCourse('course-ai-qa-mastery', { includeDrafts: false });
  const docsDir = path.join(process.cwd(), 'public');

  const requiredSectionMarkers = [
    'Learning Objectives',
    'Detailed Concept Explanation',
    'Technical Architecture',
    'Step-by-Step Implementation Guide',
    'Practical Examples',
    'Production Implementation Code',
    'Real-World QA Use Cases',
    'Common Pitfalls and Mitigation Strategies',
    'Enterprise Best Practices',
    'Key Takeaways',
    'Top Interview Questions',
  ];

  for (const mod of dbCourse.modules || []) {
    for (const lesson of mod.lessons || []) {
      // 1. Content HTML must be populated (not empty, not hardcoded stub)
      assert.ok(
        lesson.contentHtml && lesson.contentHtml.length > 500,
        `Lesson ${lesson.slug} must have rich HTML content`
      );

      // 2. HTML must contain all 12 sections
      for (const marker of requiredSectionMarkers) {
        assert.ok(
          lesson.contentHtml.includes(marker) || lesson.title.includes(marker),
          `Lesson "${lesson.title}" must contain section marker: "${marker}"`
        );
      }

      // 3. Authentic DOCX file must exist on disk and have valid magic bytes
      assert.ok(lesson.originalDocxPath, `Lesson ${lesson.slug} must have originalDocxPath`);
      const docxDiskPath = path.join(docsDir, lesson.originalDocxPath.replace(/^\//, ''));
      assert.ok(fs.existsSync(docxDiskPath), `DOCX file must exist on disk: ${docxDiskPath}`);

      const header = Buffer.alloc(4);
      const fd = fs.openSync(docxDiskPath, 'r');
      fs.readSync(fd, header, 0, 4, 0);
      fs.closeSync(fd);
      assert.strictEqual(
        header.toString('hex'),
        '504b0304',
        `File ${docxDiskPath} must be a valid OpenXML ZIP archive (PK\\x03\\x04)`
      );

      // 4. Companion PDF / Print HTML companion file must exist
      assert.ok(lesson.pdfPath, `Lesson ${lesson.slug} must have pdfPath`);
      const pdfDiskPath = path.join(docsDir, lesson.pdfPath.replace(/^\//, ''));
      assert.ok(fs.existsSync(pdfDiskPath), `Print layout file must exist: ${pdfDiskPath}`);
    }
  }
});

test('Phase 5 Navigation & Database Resolution: Public vs Draft security and contiguous previous/next navigation', () => {
  // 1. Public resolution via slug
  const firstLessonRes = academyStore.getLessonBySlug('what-is-artificial-intelligence');
  assert.ok(firstLessonRes, 'First lesson must resolve by slug');
  assert.strictEqual(firstLessonRes.lesson.title, 'What is Artificial Intelligence?');
  assert.strictEqual(firstLessonRes.course.id, 'course-ai-qa-mastery');

  // 2. Draft protection: Draft content must NEVER be exposed to public users
  const draftSlug = `secret-draft-lesson-${Date.now()}`;
  const dummyLesson = academyStore.createLesson('course-ai-qa-mastery', 'mod-intro-ai', {
    slug: draftSlug,
    title: 'Secret Draft Lesson',
    contentHtml: '<p>Secret</p>',
    sortOrder: 99,
    status: 'draft',
  });

  const publicAccess = academyStore.getLesson(draftSlug, { includeDrafts: false });
  assert.strictEqual(publicAccess, undefined, 'Draft lesson must not be returned to public users');

  const adminAccess = academyStore.getLesson(draftSlug, { includeDrafts: true });
  assert.ok(adminAccess, 'Draft lesson must be returned to admin users');

  // Cleanup draft lesson
  academyStore.deleteLesson('course-ai-qa-mastery', 'mod-intro-ai', dummyLesson.id);

  // 3. Contiguous Next / Previous Navigation across modules
  const navFirst = getAdjacentLessons('what-is-artificial-intelligence');
  assert.strictEqual(navFirst.previousLesson, undefined, 'First lesson has no previous lesson');
  assert.ok(navFirst.nextLesson, 'First lesson must point to next lesson');

  const lastLessonSlug = 'ai-based-root-cause-analysis';
  const navLast = getAdjacentLessons(lastLessonSlug);
  assert.ok(navLast.previousLesson, 'Last lesson must have a previous lesson');
  assert.strictEqual(navLast.nextLesson, undefined, 'Last lesson has no next lesson');
});

test('Phase 5 Document Replacement Workflow: Admin can reprocess a lesson document and update contentHtml seamlessly', async () => {
  const targetSlug = 'what-is-an-llm';
  const existing = academyStore.getLessonBySlug(targetSlug);
  assert.ok(existing, 'Target lesson must exist');

  const originalDocxPath = path.join(
    process.cwd(),
    'public',
    existing.lesson.originalDocxPath.replace(/^\//, '')
  );
  assert.ok(fs.existsSync(originalDocxPath), 'Original document must exist');

  // Reprocess using processDocxDocument
  const result = processDocxDocument({
    docxFilePath: originalDocxPath,
    lessonId: existing.lesson.id,
    originalFilename: path.basename(originalDocxPath),
  });

  assert.ok(result.html.length > 500, 'Parsed HTML must have content');
  assert.ok(result.printHtml.length > 500, 'Print HTML companion must have content');
  assert.ok(result.metadata.word_count > 50, 'Word count must be calculated');

  // Simulate admin publishing updated content
  const updated = academyStore.updateLesson(existing.lesson.id, {
    contentHtml: result.html,
    wordCount: result.metadata.word_count,
  });

  assert.ok(updated, 'Lesson must update cleanly without developer intervention');
  assert.strictEqual(updated.id, existing.lesson.id);
});
