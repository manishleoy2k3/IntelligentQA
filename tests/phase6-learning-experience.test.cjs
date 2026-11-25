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
const { getAllLessons, getLessonBySlug } = jiti('../src/data/learning/academy-curriculum.ts');

// =============================================================================
// PHASE 6 — ADVANCED LEARNING EXPERIENCE & USER FEATURES COMPREHENSIVE TEST SUITE
// =============================================================================

test('Phase 6 Requirement 1: User with NO progress has 0 visited, 0 completed, and 0% progress', () => {
  const testUserId = `test-user-empty-${Date.now()}`;
  const stats = academyStore.getUserLearningStats(testUserId);

  assert.strictEqual(stats.userId, testUserId);
  assert.strictEqual(stats.totalVisited, 0, 'New user should have 0 visited lessons');
  assert.strictEqual(stats.totalCompleted, 0, 'New user should have 0 completed lessons');
  assert.strictEqual(stats.overallPercentCompleted, 0, 'Overall progress should be 0%');
  assert.strictEqual(stats.lastAccessedLesson, null, 'No last accessed lesson for new user');
  assert.strictEqual(stats.completedLessons.length, 0, 'No completed lessons list for new user');
  assert.strictEqual(
    stats.recentlyViewedLessons.length,
    0,
    'No recently viewed lessons for new user'
  );

  // Verify all courses reflect 0% completed
  for (const cp of stats.courseProgress) {
    assert.strictEqual(cp.completedLessons, 0);
    assert.strictEqual(cp.percentCompleted, 0);
    for (const mp of cp.modules) {
      assert.strictEqual(mp.completedLessons, 0);
      assert.strictEqual(mp.percentCompleted, 0);
    }
  }
});

test('Phase 6 Requirement 1: User with PARTIAL progress tracks visited, completed, and last accessed lesson', () => {
  const testUserId = `test-user-partial-${Date.now()}`;
  const aiCourse = academyStore.getCourse('course-ai-qa-mastery');
  assert.ok(aiCourse && aiCourse.modules && aiCourse.modules.length > 0);

  const firstMod = aiCourse.modules[0];
  assert.ok(firstMod.lessons && firstMod.lessons.length >= 3);

  const lesson1 = firstMod.lessons[0];
  const lesson2 = firstMod.lessons[1];
  const lesson3 = firstMod.lessons[2];

  // 1. Visit lesson 1 (in_progress)
  academyStore.recordUserProgress({
    userId: testUserId,
    lessonId: lesson1.id,
    completionStatus: 'in_progress',
  });

  // 2. Mark lesson 2 as completed
  academyStore.recordUserProgress({
    userId: testUserId,
    lessonId: lesson2.id,
    completionStatus: 'completed',
  });

  // 3. Visit lesson 3 (in_progress)
  academyStore.recordUserProgress({
    userId: testUserId,
    lessonId: lesson3.id,
    completionStatus: 'in_progress',
  });

  const stats = academyStore.getUserLearningStats(testUserId);

  assert.strictEqual(stats.totalVisited, 3, 'Should have 3 visited lessons');
  assert.strictEqual(stats.totalCompleted, 1, 'Should have 1 completed lesson');
  assert.ok(stats.totalLessons >= 46, 'Should know total lessons');

  // Last accessed lesson should be lesson 3
  assert.ok(stats.lastAccessedLesson, 'Last accessed lesson should be recorded');
  assert.strictEqual(stats.lastAccessedLesson.lessonId, lesson3.id);
  assert.strictEqual(stats.lastAccessedLesson.lessonTitle, lesson3.title);
  assert.strictEqual(stats.lastAccessedLesson.courseTitle, aiCourse.title);

  // Check course progress calculation
  const aiCourseProgress = stats.courseProgress.find((c) => c.courseId === aiCourse.id);
  assert.ok(aiCourseProgress, 'AI Course progress must be found');
  assert.strictEqual(aiCourseProgress.completedLessons, 1);
  assert.strictEqual(aiCourseProgress.visitedLessons, 3);
  const expectedCoursePct = Math.round((1 / aiCourseProgress.totalLessons) * 100);
  assert.strictEqual(aiCourseProgress.percentCompleted, expectedCoursePct);

  // Check module progress calculation
  const modProgress = aiCourseProgress.modules.find((m) => m.moduleId === firstMod.id);
  assert.ok(modProgress, 'Module progress must be found');
  assert.strictEqual(modProgress.completedLessons, 1);
  assert.strictEqual(modProgress.visitedLessons, 3);
  const expectedModPct = Math.round((1 / modProgress.totalLessons) * 100);
  assert.strictEqual(modProgress.percentCompleted, expectedModPct);

  // Check completed lessons list
  assert.strictEqual(stats.completedLessons.length, 1);
  assert.strictEqual(stats.completedLessons[0].lessonId, lesson2.id);

  // Check recently viewed list
  assert.strictEqual(stats.recentlyViewedLessons.length, 3);
});

test('Phase 6 Requirement 1: User with COMPLETED course achieves 100% completion percentage', () => {
  const testUserId = `test-user-full-${Date.now()}`;
  const aiCourse = academyStore.getCourse('course-ai-qa-mastery');
  assert.ok(aiCourse && aiCourse.modules);

  const firstMod = aiCourse.modules[0];
  const modLessons = firstMod.lessons || [];

  // Mark all lessons in first module as completed
  for (const lsn of modLessons) {
    academyStore.recordUserProgress({
      userId: testUserId,
      lessonId: lsn.id,
      completionStatus: 'completed',
    });
  }

  const stats = academyStore.getUserLearningStats(testUserId);
  const aiCourseProgress = stats.courseProgress.find((c) => c.courseId === aiCourse.id);
  assert.ok(aiCourseProgress);

  const modProgress = aiCourseProgress.modules.find((m) => m.moduleId === firstMod.id);
  assert.ok(modProgress);
  assert.strictEqual(modProgress.completedLessons, modLessons.length);
  assert.strictEqual(
    modProgress.percentCompleted,
    100,
    'Module with all completed lessons must be 100%'
  );
});

test('Phase 6 Requirement 2: Bookmarks — Add, retrieve, check, and remove lesson bookmarks', () => {
  const testUserId = `test-user-bm-${Date.now()}`;
  const lesson = getLessonBySlug('what-is-artificial-intelligence') || getAllLessons()[0];
  assert.ok(lesson);

  // Check initially not bookmarked
  assert.strictEqual(academyStore.isLessonBookmarked(testUserId, lesson.id), false);

  // Add bookmark via toggle
  const res1 = academyStore.toggleBookmark(testUserId, lesson.id);
  assert.strictEqual(res1.bookmarked, true, 'Lesson should now be bookmarked');
  assert.ok(res1.bookmark);
  assert.strictEqual(res1.bookmark.lessonId, lesson.id);
  assert.strictEqual(academyStore.isLessonBookmarked(testUserId, lesson.id), true);

  // Retrieve user bookmarks
  const bms = academyStore.getUserBookmarks(testUserId);
  assert.strictEqual(bms.length, 1);
  assert.strictEqual(bms[0].lessonId, lesson.id);

  // Toggle again -> removes bookmark
  const res2 = academyStore.toggleBookmark(testUserId, lesson.id);
  assert.strictEqual(res2.bookmarked, false, 'Second toggle should remove bookmark');
  assert.strictEqual(academyStore.isLessonBookmarked(testUserId, lesson.id), false);
  assert.strictEqual(academyStore.getUserBookmarks(testUserId).length, 0);

  // Add back then use removeBookmark explicitly
  academyStore.toggleBookmark(testUserId, lesson.id);
  assert.strictEqual(academyStore.isLessonBookmarked(testUserId, lesson.id), true);
  const removed = academyStore.removeBookmark(testUserId, lesson.id);
  assert.strictEqual(removed, true);
  assert.strictEqual(academyStore.isLessonBookmarked(testUserId, lesson.id), false);
});

test('Phase 6 Requirement 3: Global Course Search across course, module, lesson titles and published content', () => {
  // 1. Search by Course Title keyword
  const courseResults = academyStore.searchCurriculum('Selenium');
  assert.ok(courseResults.length > 0, 'Should find results matching Selenium');
  assert.ok(courseResults.some((r) => r.courseTitle.includes('Selenium')));

  // 2. Search by Module Title keyword
  const moduleResults = academyStore.searchCurriculum('Prompt Engineering');
  assert.ok(moduleResults.length > 0, 'Should find results matching Prompt Engineering module');
  assert.ok(moduleResults.some((r) => r.moduleTitle.includes('Prompt Engineering')));

  // 3. Search by Lesson Title keyword
  const lessonResults = academyStore.searchCurriculum('Actionability');
  assert.ok(lessonResults.length > 0, 'Should find results matching Actionability');
  assert.ok(lessonResults[0].lessonSlug.length > 0);

  // 4. Search by Published Content keyword
  const contentResults = academyStore.searchCurriculum('Self-Healing');
  assert.ok(contentResults.length > 0, 'Should find content matching Self-Healing');
  assert.ok(
    contentResults.some((r) => r.snippet && r.snippet.toLowerCase().includes('self-healing'))
  );

  // 5. Verify direct link and structure
  for (const item of contentResults) {
    assert.ok(item.id, 'Result must have id');
    assert.ok(item.title, 'Result must have title');
    assert.ok(item.lessonSlug, 'Result must have lessonSlug for direct linking');
    assert.ok(item.moduleTitle, 'Result must have moduleTitle');
    assert.ok(item.courseTitle, 'Result must have courseTitle');
  }
});

test('Phase 6 Requirement 4: Lesson Navigation — Previous, Next, Back to Course, and Breadcrumbs', () => {
  const allLessons = getAllLessons();
  assert.ok(allLessons.length > 1);

  const middleLesson = allLessons[1];
  const ctx = academyStore.getLessonWithContext(middleLesson.slug);
  assert.ok(ctx, 'Lesson context must be retrievable');

  // Verify previous lesson
  assert.ok(ctx.previousLesson, 'Middle lesson must have previous lesson');
  assert.ok(ctx.previousLesson.title);
  assert.ok(ctx.previousLesson.slug);

  // Verify next lesson
  assert.ok(ctx.nextLesson, 'Middle lesson must have next lesson');
  assert.ok(ctx.nextLesson.title);
  assert.ok(ctx.nextLesson.slug);

  // Verify backToCourse pointer
  assert.ok(ctx.backToCourse, 'Must provide backToCourse pointer');
  assert.ok(ctx.backToCourse.courseTitle);

  // Verify Breadcrumbs
  assert.ok(Array.isArray(ctx.breadcrumbs), 'Breadcrumbs must be array');
  assert.ok(
    ctx.breadcrumbs.length >= 4,
    'Breadcrumbs must trace Academy -> Category -> Course -> Module -> Lesson'
  );
  assert.strictEqual(ctx.breadcrumbs[0].label, 'Academy');
  assert.ok(
    ctx.breadcrumbs[ctx.breadcrumbs.length - 1].active,
    'Last breadcrumb must be active current lesson'
  );
});

test('Phase 6 Requirement 5: Learning Experience — Reading time, updated date, overviews, related lessons, and print', () => {
  const lesson = getAllLessons()[0];
  const ctx = academyStore.getLessonWithContext(lesson.slug);
  assert.ok(ctx);

  // Estimated reading time
  const readTime = ctx.lesson.estimatedReadingTime || ctx.lesson.estimatedReadTime;
  assert.ok(
    typeof readTime === 'number' && readTime > 0,
    'Estimated reading time must be a positive number'
  );

  // Last updated date
  assert.ok(ctx.lesson.updatedAt || ctx.lesson.createdAt, 'Updated or created date must exist');

  // Course Overview
  assert.ok(ctx.courseOverview, 'Course overview must exist in context');
  assert.ok(ctx.courseOverview.totalModules > 0);
  assert.ok(ctx.courseOverview.totalLessons > 0);
  assert.ok(ctx.courseOverview.level);

  // Module Overview
  assert.ok(ctx.moduleOverview, 'Module overview must exist in context');
  assert.ok(ctx.moduleOverview.title);
  assert.ok(ctx.moduleOverview.totalLessons > 0);

  // Related Lessons
  assert.ok(Array.isArray(ctx.relatedLessons), 'Related lessons must be an array');
  assert.ok(ctx.relatedLessons.length > 0, 'Should recommend at least 1 related lesson');
  for (const rel of ctx.relatedLessons) {
    assert.ok(rel.title);
    assert.ok(rel.slug);
    assert.ok(rel.moduleTitle);
  }

  // Print Styles exist in globals.css
  const globalsCss = fs.readFileSync(path.join(process.cwd(), 'src/app/globals.css'), 'utf-8');
  assert.ok(globalsCss.includes('@media print'), 'Print-friendly CSS must exist in globals.css');
  assert.ok(globalsCss.includes('.no-print'), '.no-print rule must exist in globals.css');
});

test('Phase 6 Requirement 6: User Dashboard — Dedicated Learning Dashboard component exists with free QA community guarantee', () => {
  const dashboardPath = path.join(process.cwd(), 'src/components/learning/learning-dashboard.tsx');
  assert.ok(fs.existsSync(dashboardPath), 'LearningDashboard component file must exist');

  const content = fs.readFileSync(dashboardPath, 'utf-8');
  assert.ok(
    content.includes('Enrolled Courses & Progress'),
    'Must include Enrolled Courses & Progress section'
  );
  assert.ok(content.includes('Recently Viewed'), 'Must include Recently Viewed lessons section');
  assert.ok(content.includes('Completed Lessons'), 'Must include Completed Lessons section');
  assert.ok(content.includes('My Bookmarks'), 'Must include My Bookmarks section');
  assert.ok(
    content.includes('100% Free QA Community Platform'),
    'Must confirm free community platform without paywalls'
  );

  // Verify User Dashboard page integrates LearningDashboard
  const userDashPath = path.join(process.cwd(), 'src/app/dashboard/page.tsx');
  const userDashContent = fs.readFileSync(userDashPath, 'utf-8');
  assert.ok(
    userDashContent.includes('<LearningDashboard'),
    'User Dashboard page must render LearningDashboard'
  );
});

test('Phase 6 Requirement 7: Performance — Lazy loading images, lightweight tree, and caching headers', () => {
  // 1. Verify lightweight navigation tree does not include bulky contentHtml
  const tree = academyStore.getNavigationTree({ includeDrafts: false });
  assert.ok(tree.length > 0);
  for (const cat of tree) {
    for (const course of cat.courses) {
      for (const mod of course.modules) {
        for (const lsn of mod.lessons) {
          assert.strictEqual(
            lsn.contentHtml,
            undefined,
            'Navigation tree must not download lesson contentHtml unnecessarily'
          );
          assert.strictEqual(
            lsn.blockData,
            undefined,
            'Navigation tree must not download blockData'
          );
        }
      }
    }
  }

  // 2. Verify cache-control headers on lesson API route
  const lessonRoutePath = path.join(process.cwd(), 'src/app/api/learning/lessons/[id]/route.ts');
  const lessonRouteContent = fs.readFileSync(lessonRoutePath, 'utf-8');
  assert.ok(
    lessonRouteContent.includes('Cache-Control'),
    'Lesson API must declare Cache-Control header'
  );

  // 3. Verify client caching mechanism in academy-shell.tsx
  const shellPath = path.join(process.cwd(), 'src/components/learning/academy-shell.tsx');
  const shellContent = fs.readFileSync(shellPath, 'utf-8');
  assert.ok(
    shellContent.includes('lessonClientCache'),
    'academy-shell must implement client-side lesson caching'
  );
  assert.ok(
    shellContent.includes('loading="lazy"'),
    'academy-shell must optimize images with lazy loading'
  );
});
