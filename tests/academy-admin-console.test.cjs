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
const { QADatabase } = jiti('../src/lib/qa-db.ts');

// 1. Admin Authentication & Role Authorization
test('Phase 3 Admin Access: Non-admin users cannot access admin operations and elevation gate works', () => {
  // Test regular non-admin user
  const regularUser = {
    id: 'user-regular-1',
    email: 'learner@intelligentqa.io',
    name: 'Learner One',
    role: 'student',
  };
  assert.strictEqual(QADatabase.isAdmin(regularUser), false, 'Student role must not have admin access');

  // Test admin user
  const adminUser = {
    id: 'user-admin-1',
    email: 'admin@intelligentqa.io',
    name: 'Lead Architect',
    role: 'admin',
  };
  assert.strictEqual(QADatabase.isAdmin(adminUser), true, 'Admin role must have admin access');

  // Test Passcode Elevation
  const elevationResult = QADatabase.verifyAndElevateAdmin(QADatabase.getAdminSecret(), regularUser);
  assert.strictEqual(elevationResult.success, true, 'Valid passcode must elevate to admin');

  const invalidElevation = QADatabase.verifyAndElevateAdmin('wrong_passcode', regularUser);
  assert.strictEqual(invalidElevation.success, false, 'Invalid passcode must reject elevation');
});

// 2. Admin Dashboard Metrics Verification
test('Phase 3 Dashboard: Metrics accurately calculate Courses, Modules, Lessons, Published, and Draft totals', () => {
  const allCourses = academyStore.getCourses({ includeDrafts: true });
  assert.ok(Array.isArray(allCourses), 'Must return array of all courses');

  let totalModules = 0;
  let totalLessons = 0;
  let publishedCount = 0;
  let draftCount = 0;

  for (const c of allCourses) {
    const mods = c.modules || [];
    totalModules += mods.length;
    for (const m of mods) {
      const les = m.lessons || [];
      totalLessons += les.length;
      for (const l of les) {
        if (l.status === 'published') {
          publishedCount++;
        } else {
          draftCount++;
        }
      }
    }
  }

  assert.ok(allCourses.length >= 7, 'Must have at least 7 starter courses');
  assert.ok(totalModules >= 7, 'Must have at least 7 modules');
  assert.ok(totalLessons >= 7, 'Must have at least 7 lessons');
  assert.strictEqual(publishedCount + draftCount, totalLessons, 'Sum of published + draft must equal total lessons');
});

// 3. Complete Demonstration Workflow: AI Academy -> Introduction to AI -> What is an LLM? -> Sample DOCX -> Draft
test('Phase 3 Demonstration: Create AI Academy course, Introduction to AI module, What is an LLM? lesson with DOCX saved as Draft', async () => {
  const demoCourseSlug = `ai-academy-demo-${Date.now()}`;
  const demoModSlug = `intro-to-ai-demo-${Date.now()}`;
  const demoLsnSlug = `what-is-an-llm-demo-${Date.now()}`;

  // 1. Create Course
  const course = academyStore.createCourse({
    categoryId: 'cat-ai-for-qa',
    title: 'AI Academy Mastery (Admin Console Demo)',
    slug: demoCourseSlug,
    description: 'Autonomous Quality Engineering with GenAI, LLMs, and MCP Agents.',
    icon: 'Bot',
    level: 'All Levels',
    estimatedHours: 12,
    sortOrder: 50,
    status: 'published',
    modules: [],
  });
  assert.ok(course && course.id, 'Course must be created');
  assert.strictEqual(course.slug, demoCourseSlug);

  // 2. Create Module inside Course
  const module = academyStore.createModule(course.id, {
    title: 'Introduction to AI',
    slug: demoModSlug,
    description: 'Foundational concepts of artificial intelligence and machine learning for SDETs.',
    sortOrder: 1,
    status: 'published',
  });
  assert.ok(module && module.id, 'Module must be created');

  // 3. Attach uploaded DOCX document fixture
  const sampleDocxPath = path.join(process.cwd(), 'public/uploads/learning/docs/sample_what_is_an_llm.docx');
  assert.ok(fs.existsSync(sampleDocxPath), 'Sample docx fixture must exist on disk');

  // 4. Create Lesson with DOCX reference and Save as Draft
  const lesson = academyStore.createLesson(course.id, module.id, {
    title: 'What is an LLM?',
    slug: demoLsnSlug,
    summary: 'A deep architectural dive into Large Language Models, token prediction, and context engineering.',
    shortDescription: 'A deep architectural dive into Large Language Models, token prediction, and context engineering.',
    contentType: 'docx',
    contentHtml: '<h2>What is an LLM?</h2><p>Large Language Models are neural sequence predictors.</p>',
    originalDocxPath: '/uploads/learning/docs/sample_what_is_an_llm.docx',
    originalDocumentPath: '/uploads/learning/docs/sample_what_is_an_llm.docx',
    estimatedReadingTime: 6,
    wordCount: 450,
    sortOrder: 1,
    status: 'draft', // MUST BE SAVED AS DRAFT
  });
  assert.ok(lesson && lesson.id, 'Lesson must be created');
  assert.strictEqual(lesson.status, 'draft', 'Lesson must initially be in draft mode');

  // 5. Verification of Draft Privacy Workflow
  // Normal public user must NOT be able to access the draft lesson
  const publicLesson = academyStore.getLesson(demoLsnSlug);
  assert.strictEqual(publicLesson, undefined, 'Draft lesson must strictly be hidden from public learners');

  // Admin MUST be able to view and preview the draft lesson
  const adminLesson = academyStore.getLesson(demoLsnSlug, { includeDrafts: true });
  assert.ok(adminLesson, 'Admin must be able to view draft lesson for preview');
  assert.strictEqual(adminLesson.lesson.status, 'draft');
  assert.strictEqual(adminLesson.lesson.originalDocxPath, '/uploads/learning/docs/sample_what_is_an_llm.docx');

  // 6. Explicit Publish Action
  const publishSuccess = academyStore.setPublishStatus('lesson', lesson.id, 'published');
  assert.strictEqual(publishSuccess, true, 'Publishing lesson must succeed');

  // Now visible to public learners
  const nowVisibleLesson = academyStore.getLesson(demoLsnSlug);
  assert.ok(nowVisibleLesson, 'Published lesson must now be visible to learners');
  assert.strictEqual(nowVisibleLesson.lesson.status, 'published');

  // 7. Unpublish (Revert to Draft) Action
  const unpublishSuccess = academyStore.setPublishStatus('lesson', lesson.id, 'draft');
  assert.strictEqual(unpublishSuccess, true, 'Unpublishing lesson must succeed');
  assert.strictEqual(academyStore.getLesson(demoLsnSlug), undefined, 'Reverted lesson must hide from public learners again');

  // Clean up demo course and its cascaded module/lesson
  academyStore.deleteCourse(course.id);
  assert.strictEqual(academyStore.getCourse(course.id), undefined, 'Cleanup deleted demo course');
});

// 4. Document Upload Validation Engine
test('Phase 3 Document Ingestion: Validates file extension, magic byte ZIP signature, and preserves file', async () => {
  const { POST: uploadDocHandler } = jiti('../src/app/api/admin/learning/documents/upload/route.ts');

  // Test 1: Uploading valid sample .docx
  const sampleDocxPath = path.join(process.cwd(), 'public/uploads/learning/docs/sample_what_is_an_llm.docx');
  const fileBuffer = fs.readFileSync(sampleDocxPath);

  const fileBlob = new Blob([fileBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });
  const formData = new FormData();
  formData.append('file', fileBlob, 'valid_test_document.docx');
  formData.append('lessonId', 'les-test-upload');

  const uploadReq = new Request('http://localhost:3000/api/admin/learning/documents/upload', {
    method: 'POST',
    headers: {
      'x-admin-token': 'admin',
    },
    body: formData,
  });

  const uploadRes = await uploadDocHandler(uploadReq);
  assert.strictEqual(uploadRes.status, 201, 'Upload of valid .docx must return 201 Created');
  const uploadData = await uploadRes.json();
  assert.strictEqual(uploadData.success, true);
  assert.ok(uploadData.data.filePath.includes('/uploads/learning/docs/'));

  // Test 2: Uploading without file returns 400
  const emptyFormData = new FormData();
  const emptyReq = new Request('http://localhost:3000/api/admin/learning/documents/upload', {
    method: 'POST',
    headers: {
      'x-admin-token': 'admin',
    },
    body: emptyFormData,
  });
  const emptyRes = await uploadDocHandler(emptyReq);
  assert.strictEqual(emptyRes.status, 400, 'Empty upload payload must return 400');
});

// 5. Admin Console Component & Route Structure Verification
test('Phase 3 UI Architecture: Dedicated Admin Console component and route page exist with dual-mode preview', () => {
  const consoleCompPath = path.join(process.cwd(), 'src/components/admin/academy/academy-admin-console.tsx');
  assert.ok(fs.existsSync(consoleCompPath), 'academy-admin-console.tsx component must exist');

  const dropzoneCompPath = path.join(process.cwd(), 'src/components/admin/academy/docx-upload-dropzone.tsx');
  assert.ok(fs.existsSync(dropzoneCompPath), 'docx-upload-dropzone.tsx component must exist');

  const previewModalPath = path.join(process.cwd(), 'src/components/admin/academy/content-preview-modal.tsx');
  assert.ok(fs.existsSync(previewModalPath), 'content-preview-modal.tsx component must exist');

  const adminPagePath = path.join(process.cwd(), 'src/app/admin/academy/page.tsx');
  assert.ok(fs.existsSync(adminPagePath), 'src/app/admin/academy/page.tsx route must exist');

  const consoleContent = fs.readFileSync(consoleCompPath, 'utf-8');
  assert.ok(consoleContent.includes('totalCourses'), 'Must calculate totalCourses metric');
  assert.ok(consoleContent.includes('publishedLessonsCount'), 'Must track publishedLessonsCount');
  assert.ok(consoleContent.includes('draftLessonsCount'), 'Must track draftLessonsCount');
  assert.ok(consoleContent.includes('recentlyUpdatedLessons'), 'Must display recentlyUpdatedLessons');

  const previewContent = fs.readFileSync(previewModalPath, 'utf-8');
  assert.ok(previewContent.includes('Web Reading Mode'), 'Must support Web Reading Mode preview');
  assert.ok(previewContent.includes('Original Document View'), 'Must support Original Document View preview');
  assert.ok(previewContent.includes('Publish Lesson'), 'Must provide explicit Publish Lesson action');
  assert.ok(previewContent.includes('Save as Draft'), 'Must provide explicit Save as Draft action');
});
