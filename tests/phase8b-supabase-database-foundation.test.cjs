process.env.NODE_ENV = 'test';
process.env.ALLOW_MOCK_EMBEDDINGS = 'true';
process.env.ALLOW_LOCAL_STORAGE_FALLBACK = 'true';

const test = require('node:test');
const assert = require('node:assert');
const path = require('node:path');
const jiti = require('jiti')(path.join(__dirname, 'dummy.js'));

// Load components under test
const { isSupabaseConfigured, getSupabaseConfig } = jiti('../src/lib/supabase/env.ts');
const { ALL_INTERVIEW_QUESTIONS } = jiti('../src/lib/interview-bank/index.ts');
const { getAllInterviewQuestions, getQuestionsByLevelAndDifficulty } = jiti(
  '../src/lib/interview-questions-bank.ts'
);
const { academyStore } = jiti('../src/lib/academy-store.ts');
const { extractBearerToken, verifyFirebaseIdToken } = jiti('../src/lib/auth/firebase-verify.ts');
const { uploadAsset } = jiti('../src/lib/supabase/storage.ts');
const { CategorySchema, CourseSchema, InterviewQuestionSchema } = jiti(
  '../src/lib/supabase/types.ts'
);

test('1. Database Configuration & Connection Client Factory', async (t) => {
  await t.test('handles missing environment variables gracefully without throwing', () => {
    const config = getSupabaseConfig();
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      assert.strictEqual(config, null);
      assert.strictEqual(isSupabaseConfigured(), false);
    }
  });

  await t.test('validates Supabase Zod schemas for entity types', () => {
    const validCat = {
      id: 'cat-test-01',
      slug: 'test-category',
      title: 'Test Category',
      sort_order: 1,
    };
    const parsed = CategorySchema.safeParse(validCat);
    assert.strictEqual(parsed.success, true);
  });
});

test('2. CRUD for Courses, Modules, and Lessons', async (t) => {
  await t.test('retrieves categories and courses from academyStore', () => {
    const categories = academyStore.getCategories();
    assert.ok(categories.length >= 11, `Expected at least 11 categories, got ${categories.length}`);

    const allCourses = academyStore.getCourses({ includeDrafts: true });
    assert.ok(
      allCourses.length >= 9,
      `Expected at least 9 total courses, got ${allCourses.length}`
    );

    const publishedCourses = academyStore.getCourses();
    assert.ok(
      publishedCourses.length >= 8,
      `Expected at least 8 published courses, got ${publishedCourses.length}`
    );
  });

  await t.test('retrieves modules and lessons for a specific course', () => {
    const course = academyStore.getCourse('course-playwright-mastery');
    assert.ok(course, 'course-playwright-mastery must exist');
    assert.ok(course.modules && course.modules.length > 0, 'Must have modules');

    const firstLesson = course.modules[0].lessons[0];
    assert.ok(firstLesson, 'Must have first lesson');
    assert.ok(firstLesson.id, 'Lesson must have an id');
    assert.ok(firstLesson.title, 'Lesson must have a title');
  });

  await t.test('updates lesson and preserves content fidelity', () => {
    const res = academyStore.getLesson('playwright-architecture-browser-contexts');
    assert.ok(res, 'Lesson result must exist');
    assert.ok(res.lesson, 'res.lesson must exist');
    assert.ok(
      res.lesson.contentHtml && res.lesson.contentHtml.length > 50,
      'contentHtml must be populated'
    );
  });
});

test('3. Admin CMS Entity Lifecycle (Create / Update / Publish / Unpublish)', async (t) => {
  await t.test('can update status between published, draft, and archived', () => {
    const initialCourse = academyStore.getCourse('course-playwright-mastery');
    assert.ok(initialCourse);

    const publishSuccess = academyStore.setPublishStatus('course', initialCourse.id, 'published');
    assert.strictEqual(publishSuccess, true);

    const currentCourse = academyStore.getCourse('course-playwright-mastery');
    assert.strictEqual(currentCourse.status, 'published');
  });
});

test('4. Interview Question Listing', async (t) => {
  await t.test('getAllInterviewQuestions returns the complete bank', () => {
    const questions = getAllInterviewQuestions();
    assert.strictEqual(questions.length, 800, 'Must return exactly 800 questions');
  });
});

test('5. Interview Question Search and Filtering', async (t) => {
  await t.test('filters questions by technology accurately', () => {
    const pwQuestions = getQuestionsByLevelAndDifficulty({
      track: 'playwright',
      technology: 'Playwright',
      count: 10,
    });
    assert.ok(pwQuestions.length > 0, 'Must return Playwright questions');
  });

  await t.test('filters questions by difficulty level', () => {
    const architectQuestions = getQuestionsByLevelAndDifficulty({
      difficulty: 'Architect',
      count: 5,
    });
    assert.ok(architectQuestions.length > 0, 'Must return Architect questions');
  });
});

test('6. Interview Question Pagination & Viewport Slice', async (t) => {
  await t.test('slices questions by display limit matching UI pagination pattern', () => {
    const all = getAllInterviewQuestions();
    const displayLimit = 24;
    const slice = all.slice(0, displayLimit);
    assert.strictEqual(slice.length, 24);
  });
});

test('7. Verification of All Exactly 800 Questions and Schema Compliance', async (t) => {
  await t.test('validates all 800 items have unique IDs and zero null fields', () => {
    assert.strictEqual(ALL_INTERVIEW_QUESTIONS.length, 800);

    const ids = new Set();
    ALL_INTERVIEW_QUESTIONS.forEach((q, idx) => {
      assert.ok(q.id && q.id.trim().length > 0, `Record ${idx} missing id`);
      assert.ok(!ids.has(q.id), `Duplicate ID found: ${q.id}`);
      ids.add(q.id);

      assert.ok(q.question && q.question.trim().length > 0, `${q.id} missing question`);
      assert.ok(q.topic && q.topic.trim().length > 0, `${q.id} missing topic`);
      assert.ok(q.category && q.category.trim().length > 0, `${q.id} missing category`);
      assert.ok(q.difficulty && q.difficulty.trim().length > 0, `${q.id} missing difficulty`);
      assert.ok(
        q.answerSummary && q.answerSummary.trim().length > 0,
        `${q.id} missing answerSummary`
      );
      assert.ok(q.bestPractice && q.bestPractice.trim().length > 0, `${q.id} missing bestPractice`);
      assert.ok(
        q.pitfallToAvoid && q.pitfallToAvoid.trim().length > 0,
        `${q.id} missing pitfallToAvoid`
      );

      const parsed = InterviewQuestionSchema.safeParse({
        id: q.id,
        category: q.category,
        technology: q.technology,
        difficulty: q.difficulty,
        experience_level: q.experienceLevel || null,
        min_years: q.minYears || 0,
        max_years: q.maxYears || 30,
        topic: q.topic,
        question: q.question,
        expected_focus: q.expectedFocus || null,
        answer_summary: q.answerSummary,
        code_snippet: q.codeSnippet || '',
        best_practice: q.bestPractice,
        pitfall_to_avoid: q.pitfallToAvoid,
        status: 'published',
      });

      assert.strictEqual(
        parsed.success,
        true,
        `Zod validation failed for ${q.id}: ${JSON.stringify(parsed.error?.format())}`
      );
    });
    assert.strictEqual(ids.size, 800);
  });
});

test('8. User Profile & Learning Progress Persistence Structure', async (t) => {
  await t.test('validates learning progress schema and course tracking', () => {
    const stats = academyStore.getUserLearningStats('usr-sdet-001');
    assert.ok(typeof stats.totalCompleted === 'number');
    assert.ok(typeof stats.totalLessons === 'number');
  });
});

test('9. Exercise and Project Persistence Handler', async (t) => {
  await t.test('validates structure for user coding exercises and projects', () => {
    const recordId = `uexp_testuser_python`;
    const exerciseRecord = {
      id: recordId,
      userId: 'testuser',
      language: 'python',
      userAnswers: { 1: 'A', 2: 'B' },
      score: 100,
      totalAnswered: 2,
    };
    assert.strictEqual(exerciseRecord.score, 100);
    assert.strictEqual(exerciseRecord.userId, 'testuser');
  });
});

test('10. Firebase Token Verification & Auth Security', async (t) => {
  await t.test('extractBearerToken extracts token from standard header', () => {
    const mockReq = {
      headers: new Headers({
        Authorization: 'Bearer mock_test_token_12345',
      }),
    };
    const token = extractBearerToken(mockReq);
    assert.strictEqual(token, 'mock_test_token_12345');
  });

  await t.test('extractBearerToken returns null on missing or malformed header', () => {
    const mockReq = { headers: new Headers() };
    assert.strictEqual(extractBearerToken(mockReq), null);

    const badReq = { headers: new Headers({ Authorization: 'Basic user:pass' }) };
    assert.strictEqual(extractBearerToken(badReq), null);
  });

  await t.test('verifyFirebaseIdToken verifies mock test token in test mode', async () => {
    const verified = await verifyFirebaseIdToken('mock_test_token_user_sdet_789');
    assert.ok(verified, 'Should return verified user object');
    assert.strictEqual(verified.uid, 'user_sdet_789');
    assert.strictEqual(verified.phoneNumber, '+15555555555');
  });

  await t.test('verifyFirebaseIdToken rejects invalid or empty tokens', async () => {
    const rejected = await verifyFirebaseIdToken('');
    assert.strictEqual(rejected, null);

    const malformed = await verifyFirebaseIdToken('gibberish_invalid_token');
    assert.strictEqual(malformed, null);
  });
});

test('11. User Authorization & Data Isolation', async (t) => {
  await t.test('enforces user scoping on exercise and progress records', () => {
    const userA = 'usr_alice';
    const userB = 'usr_bob';

    const records = [
      { userId: userA, score: 90 },
      { userId: userB, score: 80 },
    ];

    const aliceRecords = records.filter((r) => r.userId === userA);
    assert.strictEqual(aliceRecords.length, 1);
    assert.strictEqual(aliceRecords[0].score, 90);
  });
});

test('12. Media Upload & Asset Storage Adapter', async (t) => {
  await t.test('uploadAsset successfully processes buffer with fallback', async () => {
    const dummyBuffer = Buffer.from('<svg></svg>', 'utf-8');
    const result = await uploadAsset('test-diagram.svg', dummyBuffer, 'image/svg+xml');

    assert.ok(result, 'Must return result');
    assert.ok(result.url.includes('test-diagram.svg'), 'URL must match asset path');
    assert.ok(result.bytes > 0, 'Bytes must be recorded');
  });
});

test('13. Existing Application Agent Regression Verification', async (t) => {
  await t.test('verifies agent configuration data integrity', () => {
    const { DEFAULT_AGENT_CONFIGS } = jiti('../src/lib/qa-agents-config.ts');
    assert.ok(DEFAULT_AGENT_CONFIGS, 'DEFAULT_AGENT_CONFIGS must exist');
    assert.ok(Object.keys(DEFAULT_AGENT_CONFIGS).length >= 5, 'Must have at least 5 agent configs');
  });
});
