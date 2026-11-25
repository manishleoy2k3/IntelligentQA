const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

// 1. Schema & Relational DDL Verification
test('Phase 2 DB Schema: scripts/schema.sql contains all required Academy entities and columns', () => {
  const schemaPath = path.join(process.cwd(), 'scripts/schema.sql');
  assert.ok(fs.existsSync(schemaPath), 'scripts/schema.sql must exist');
  const schema = fs.readFileSync(schemaPath, 'utf-8');

  // Course entity
  assert.ok(
    schema.includes('CREATE TABLE IF NOT EXISTS academy_courses'),
    'Must include academy_courses'
  );
  assert.ok(schema.includes('icon VARCHAR(64)'), 'Courses must have icon');
  assert.ok(schema.includes('thumbnail VARCHAR(512)'), 'Courses must have thumbnail');
  assert.ok(schema.includes('display_order INT'), 'Courses must have display_order');
  assert.ok(schema.includes('status VARCHAR(32)'), 'Courses must have status');

  // Module entity
  assert.ok(
    schema.includes('CREATE TABLE IF NOT EXISTS academy_modules'),
    'Must include academy_modules'
  );
  assert.ok(schema.includes('course_id VARCHAR(64)'), 'Modules must reference course_id');
  assert.ok(schema.includes('display_order INT'), 'Modules must have display_order');

  // Lesson entity
  assert.ok(
    schema.includes('CREATE TABLE IF NOT EXISTS academy_lessons'),
    'Must include academy_lessons'
  );
  assert.ok(schema.includes('module_id VARCHAR(64)'), 'Lessons must reference module_id');
  assert.ok(schema.includes('short_description TEXT'), 'Lessons must have short_description');
  assert.ok(schema.includes('content_type VARCHAR(32)'), 'Lessons must have content_type');
  assert.ok(
    schema.includes('original_document_path VARCHAR(512)'),
    'Lessons must have original_document_path'
  );
  assert.ok(
    schema.includes('rendered_html_path VARCHAR(512)'),
    'Lessons must have rendered_html_path'
  );
  assert.ok(schema.includes('pdf_path VARCHAR(512)'), 'Lessons must have pdf_path');
  assert.ok(
    schema.includes('estimated_reading_time INT'),
    'Lessons must have estimated_reading_time'
  );

  // Lesson Assets entity
  assert.ok(
    schema.includes('CREATE TABLE IF NOT EXISTS academy_lesson_assets'),
    'Must include academy_lesson_assets'
  );
  assert.ok(schema.includes('asset_type VARCHAR(64)'), 'Lesson Assets must have asset_type');
  assert.ok(
    schema.includes('original_filename VARCHAR(255)'),
    'Lesson Assets must have original_filename'
  );

  // User Lesson Progress entity
  assert.ok(
    schema.includes('CREATE TABLE IF NOT EXISTS user_lesson_progress'),
    'Must include user_lesson_progress'
  );
  assert.ok(
    schema.includes('completion_status VARCHAR(32)'),
    'User progress must track completion_status'
  );
  assert.ok(
    schema.includes('last_accessed_at TIMESTAMP'),
    'User progress must track last_accessed_at'
  );
  assert.ok(schema.includes('completed_at TIMESTAMP'), 'User progress must track completed_at');
});

// 2. TypeScript Types Verification
test('Phase 2 Types: src/types/learning-platform.ts exports AcademyLessonAsset and UserLessonProgress', () => {
  const typesPath = path.join(process.cwd(), 'src/types/learning-platform.ts');
  assert.ok(fs.existsSync(typesPath), 'src/types/learning-platform.ts must exist');
  const types = fs.readFileSync(typesPath, 'utf-8');

  assert.ok(
    types.includes('export interface AcademyLessonAsset'),
    'Must export AcademyLessonAsset'
  );
  assert.ok(
    types.includes('export interface UserLessonProgress'),
    'Must export UserLessonProgress'
  );
  assert.ok(types.includes('export type AcademyPublishStatus'), 'Must export AcademyPublishStatus');
});

// 3. Store Business Rules & Logic
test('Phase 2 Store: Course, Module, Lesson CRUD, Validation, and Public Visibility Filtering', async () => {
  const jiti = require('jiti')(__filename);
  const { academyStore } = jiti('../src/lib/academy-store.ts');
  assert.ok(academyStore, 'academyStore singleton must exist');

  // A. Public Visibility: Draft courses/modules/lessons omitted from public queries
  const initialPublicCourses = academyStore.getCourses();
  assert.ok(Array.isArray(initialPublicCourses), 'Must return array of courses');
  for (const c of initialPublicCourses) {
    assert.strictEqual(c.status, 'published', 'Public courses must strictly be published');
    for (const m of c.modules || []) {
      assert.strictEqual(m.status, 'published', 'Public modules must strictly be published');
      for (const l of m.lessons || []) {
        assert.strictEqual(l.status, 'published', 'Public lessons must strictly be published');
      }
    }
  }

  // B. Course Creation with Unique Slug Check
  const testCourseSlug = `test-backend-course-${Date.now()}`;
  const course = academyStore.createCourse({
    categoryId: 'cat-selenium',
    title: 'Test Automated Backend Course',
    slug: testCourseSlug,
    description: 'Integration test course',
    level: 'Intermediate',
    estimatedHours: 8,
    sortOrder: 99,
    status: 'draft', // Created as draft
    modules: [],
  });
  assert.ok(course && course.id, 'Created course must have an ID');
  assert.strictEqual(course.slug, testCourseSlug);

  // Duplicate course slug must be rejected
  assert.throws(
    () => {
      academyStore.createCourse({
        categoryId: 'cat-selenium',
        title: 'Duplicate Slug Course',
        slug: testCourseSlug,
        level: 'Beginner',
        sortOrder: 100,
        status: 'published',
        modules: [],
      });
    },
    /already in use/i,
    'Duplicate course slug must throw error'
  );

  // Public getCourse on draft must return undefined
  const publicDraftCourse = academyStore.getCourse(testCourseSlug);
  assert.strictEqual(publicDraftCourse, undefined, 'Draft course must not be visible publicly');

  // Admin getCourse with includeDrafts must return the draft course
  const adminDraftCourse = academyStore.getCourse(testCourseSlug, { includeDrafts: true });
  assert.ok(adminDraftCourse, 'Draft course must be visible to admin');
  assert.strictEqual(adminDraftCourse.status, 'draft');

  // C. Module Creation under Course
  const testModSlug = `test-mod-${Date.now()}`;
  const module = academyStore.createModule(course.id, {
    title: 'Test Backend Module 1',
    slug: testModSlug,
    description: 'Module testing',
    sortOrder: 1,
    status: 'published',
  });
  assert.ok(module && module.id, 'Module must be created');

  // Duplicate module slug in same course must be rejected
  assert.throws(
    () => {
      academyStore.createModule(course.id, {
        title: 'Duplicate Module Slug',
        slug: testModSlug,
        sortOrder: 2,
        status: 'published',
      });
    },
    /already in use/i,
    'Duplicate module slug must throw error'
  );

  // D. Lesson Creation under Module
  const testLsnSlug = `test-lsn-${Date.now()}`;
  const lesson = academyStore.createLesson(course.id, module.id, {
    title: 'Test Backend Lesson 1.1',
    slug: testLsnSlug,
    summary: 'Lesson summary for test',
    contentHtml: '<h3>Backend Lesson Test</h3>',
    wordCount: 120,
    estimatedReadTime: 2,
    sortOrder: 1,
    status: 'published',
  });
  assert.ok(lesson && lesson.id, 'Lesson must be created');

  // Duplicate lesson slug in same module must be rejected
  assert.throws(
    () => {
      academyStore.createLesson(course.id, module.id, {
        title: 'Duplicate Lesson Slug',
        slug: testLsnSlug,
        contentHtml: '<p>dup</p>',
        sortOrder: 2,
        status: 'published',
      });
    },
    /already in use/i,
    'Duplicate lesson slug must throw error'
  );

  // E. Publishing and Unpublishing
  const pubSuccess = academyStore.setPublishStatus('course', course.id, 'published');
  assert.strictEqual(pubSuccess, true, 'Publishing course must succeed');
  const nowPublicCourse = academyStore.getCourse(testCourseSlug);
  assert.ok(nowPublicCourse, 'Course is now publicly accessible');
  assert.strictEqual(nowPublicCourse.status, 'published');

  // F. User Lesson Progress Tracking
  const testUserId = `test-user-${Date.now()}`;
  const recorded = academyStore.recordUserProgress({
    userId: testUserId,
    lessonId: lesson.id,
    completionStatus: 'completed',
  });
  assert.ok(recorded && recorded.id, 'Progress must be recorded');
  assert.strictEqual(recorded.completionStatus, 'completed');
  assert.ok(recorded.completedAt, 'completedAt must be populated');

  const retrievedProgress = academyStore.getUserProgress(testUserId, lesson.id);
  assert.strictEqual(retrievedProgress.length, 1, 'Should find 1 progress item');
  assert.strictEqual(retrievedProgress[0].completionStatus, 'completed');

  // G. Lesson Assets Management
  const asset = academyStore.saveLessonAsset({
    lessonId: lesson.id,
    assetType: 'diagram',
    filePath: '/uploads/learning/media/diagram_test.png',
    originalFilename: 'diagram_test.png',
    displayOrder: 1,
  });
  assert.ok(asset && asset.id, 'Lesson asset must be saved');

  const assets = academyStore.getLessonAssets(lesson.id);
  assert.ok(
    assets.some((a) => a.id === asset.id),
    'Asset must be attached to lesson'
  );

  // Clean up: Safe deletion of test course (cascades to test module and lesson without touching other courses)
  const delSuccess = academyStore.deleteCourse(course.id);
  assert.strictEqual(delSuccess, true, 'Course deletion must succeed');
  assert.strictEqual(academyStore.getCourse(course.id), undefined, 'Course must no longer exist');
});

// 4. API Route Handlers Architecture Verification
test('Phase 2 APIs: All Public and Admin Learning Route files exist and enforce security', () => {
  const publicRoutes = [
    'src/app/api/learning/courses/route.ts',
    'src/app/api/learning/courses/[id]/route.ts',
    'src/app/api/learning/courses/[id]/modules/route.ts',
    'src/app/api/learning/lessons/route.ts',
    'src/app/api/learning/lessons/[id]/route.ts',
    'src/app/api/learning/modules/[id]/lessons/route.ts',
    'src/app/api/learning/progress/route.ts',
  ];

  const adminRoutes = [
    'src/app/api/admin/learning/courses/route.ts',
    'src/app/api/admin/learning/courses/[id]/route.ts',
    'src/app/api/admin/learning/modules/route.ts',
    'src/app/api/admin/learning/modules/[id]/route.ts',
    'src/app/api/admin/learning/lessons/route.ts',
    'src/app/api/admin/learning/lessons/[id]/route.ts',
    'src/app/api/admin/learning/publish/route.ts',
    'src/app/api/admin/learning/reorder/route.ts',
    'src/app/api/admin/learning/documents/upload/route.ts',
    'src/app/api/admin/learning/documents/[id]/route.ts',
  ];

  for (const rel of publicRoutes) {
    const full = path.join(process.cwd(), rel);
    assert.ok(fs.existsSync(full), `Public route must exist: ${rel}`);
  }

  for (const rel of adminRoutes) {
    const full = path.join(process.cwd(), rel);
    assert.ok(fs.existsSync(full), `Admin route must exist: ${rel}`);
    const code = fs.readFileSync(full, 'utf-8');
    assert.ok(
      code.includes('verifyAdminAccess'),
      `Admin route ${rel} must enforce verifyAdminAccess authorization`
    );
    assert.ok(code.includes('401'), `Admin route ${rel} must return 401 on unauthorized access`);
  }
});

// 5. API Route Handlers Functional Execution Test
test('Phase 2 API Handlers: Public vs Admin Permissions, Validation, and Progress APIs', async () => {
  const jiti = require('jiti')(__filename, {
    alias: {
      '@': path.join(process.cwd(), 'src'),
    },
  });
  const { GET: getCoursesHandler } = jiti('../src/app/api/learning/courses/route.ts');
  const { POST: postAdminCourseHandler } = jiti('../src/app/api/admin/learning/courses/route.ts');
  const { GET: getProgressHandler, POST: postProgressHandler } = jiti(
    '../src/app/api/learning/progress/route.ts'
  );
  const { POST: postPublishHandler } = jiti('../src/app/api/admin/learning/publish/route.ts');

  // Test 1: Public GET courses returns success
  const publicReq = new Request('http://localhost:3000/api/learning/courses');
  const publicRes = await getCoursesHandler(publicReq);
  assert.strictEqual(publicRes.status, 200);
  const publicData = await publicRes.json();
  assert.strictEqual(publicData.success, true);
  assert.ok(Array.isArray(publicData.data));

  // Test 2: Admin POST without auth credentials must return 401 Unauthorized
  const unauthReq = new Request('http://localhost:3000/api/admin/learning/courses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      categoryId: 'cat-selenium',
      title: 'Hacker Course',
      slug: 'hacker-course',
    }),
  });
  const unauthRes = await postAdminCourseHandler(unauthReq);
  assert.strictEqual(unauthRes.status, 401, 'Unauthorized request must receive 401 status');

  // Test 3: Admin POST with invalid payload (missing required slug) returns 400 Bad Request
  const invalidReq = new Request('http://localhost:3000/api/admin/learning/courses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-token': 'admin',
    },
    body: JSON.stringify({
      categoryId: 'cat-selenium',
      title: 'Incomplete Course',
      // slug missing
    }),
  });
  const invalidRes = await postAdminCourseHandler(invalidReq);
  assert.strictEqual(invalidRes.status, 400, 'Missing slug must return 400 Bad Request');

  // Test 4: User Progress API GET & POST
  const testUser = `usr_api_test_${Date.now()}`;
  const testLesson = 'les-api-test';

  const setProgReq = new Request('http://localhost:3000/api/learning/progress', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: testUser,
      lessonId: testLesson,
      completionStatus: 'completed',
    }),
  });
  const setProgRes = await postProgressHandler(setProgReq);
  assert.strictEqual(setProgRes.status, 200);
  const setProgData = await setProgRes.json();
  assert.strictEqual(setProgData.success, true);
  assert.strictEqual(setProgData.data.completionStatus, 'completed');

  const getProgReq = new Request(
    `http://localhost:3000/api/learning/progress?userId=${testUser}&lessonId=${testLesson}`
  );
  const getProgRes = await getProgressHandler(getProgReq);
  assert.strictEqual(getProgRes.status, 200);
  const getProgData = await getProgRes.json();
  assert.strictEqual(getProgData.success, true);
  assert.strictEqual(getProgData.data[0].completionStatus, 'completed');
});
