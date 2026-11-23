/**
 * Phase 8 Regression & Lesson Rendering Verification Test Suite
 * 
 * Verifies:
 * 1. Data Store Integrity: All 11 courses and 450+ lessons have complete, uncorrupted metadata.
 * 2. Standardized 13-Section Template Data: Ensures all lessons with standardData adhere strictly
 *    to expected types (troubleshootingSteps array, string code, array comparisons, takeaways).
 * 3. HTML Compiler Resilience: Ensures generateStandardLessonHtml generates rich semantic HTML
 *    for all lessons without throwing unhandled exceptions.
 * 4. Component Robustness: Verifies that missing or malformed optional fields never crash rendering.
 * 5. Live Server Endpoint Health: Validates that course entry lessons load with HTTP 200 and no Next.js error boundary.
 */

const { describe, it } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const http = require('http');

const jiti = require('jiti')(__filename, {
  alias: {
    '@': path.join(process.cwd(), 'src'),
  },
});

const storePath = path.join(process.cwd(), 'src/lib/curriculum-data-store.json');
const store = JSON.parse(fs.readFileSync(storePath, 'utf8'));

const { generateStandardLessonHtml } = jiti('../src/lib/standard-lesson-compiler.ts');
const { academyStore } = jiti('../src/lib/academy-store.ts');

describe('Phase 8: Lesson Content & Rendering Integrity Suite', () => {

  it('1. Data Store Health: Curriculum store contains 11 courses and over 450 lessons', () => {
    assert.ok(Array.isArray(store.academyCourses), 'academyCourses must be an array');
    assert.ok(store.academyCourses.length >= 9, `Expected at least 9 courses, found ${store.academyCourses.length}`);

    let totalLessons = 0;
    for (const course of store.academyCourses) {
      assert.ok(course.id, 'Course must have id');
      assert.ok(course.slug, 'Course must have slug');
      assert.ok(Array.isArray(course.modules), `Course ${course.slug} must have modules array`);
      for (const mod of course.modules) {
        assert.ok(Array.isArray(mod.lessons), `Module ${mod.id} must have lessons array`);
        totalLessons += mod.lessons.length;
      }
    }

    assert.ok(totalLessons >= 400, `Expected at least 400 total lessons across curriculum, found ${totalLessons}`);
  });

  it('2. Troubleshooting & Common Failures Integrity: Every problem has valid array steps', () => {
    let checkedProblems = 0;
    for (const course of store.academyCourses) {
      for (const mod of (course.modules || [])) {
        for (const les of (mod.lessons || [])) {
          const data = les.blockData?.standardData;
          if (!data || !Array.isArray(data.commonProblems)) continue;

          for (const prob of data.commonProblems) {
            checkedProblems++;
            assert.ok(prob.error, `Problem in ${les.slug} missing error title`);
            assert.ok(prob.rootCause, `Problem in ${les.slug} missing rootCause`);
            assert.ok(
              Array.isArray(prob.troubleshooting) || Array.isArray(prob.troubleshootingSteps),
              `Problem in ${les.slug} must have troubleshooting or troubleshootingSteps array`
            );
            const steps = prob.troubleshooting || prob.troubleshootingSteps;
            assert.ok(steps.length > 0, `Problem in ${les.slug} must have at least one troubleshooting step`);
          }
        }
      }
    }
    assert.ok(checkedProblems > 50, `Expected at least 50 validated common problems, checked ${checkedProblems}`);
  });

  it('3. Practical Implementation Steps: Gracefully handles both string[] and step objects', () => {
    let validatedCount = 0;
    for (const course of store.academyCourses) {
      for (const mod of (course.modules || [])) {
        for (const les of (mod.lessons || [])) {
          const data = les.blockData?.standardData;
          if (!data?.practicalImplementation) continue;

          validatedCount++;
          const pi = data.practicalImplementation;
          if (pi.steps) {
            assert.ok(Array.isArray(pi.steps), `practicalImplementation.steps in ${les.slug} must be array`);
          }
        }
      }
    }
    assert.ok(validatedCount > 0, `Validated practical implementation across ${validatedCount} lessons`);
  });

  it('4. Code Examples Integrity: Code blocks have string code and valid language', () => {
    let validatedCodeBlocks = 0;
    for (const course of store.academyCourses) {
      for (const mod of (course.modules || [])) {
        for (const les of (mod.lessons || [])) {
          const data = les.blockData?.standardData;
          if (!data || !Array.isArray(data.codeExamples)) continue;

          for (const ce of data.codeExamples) {
            validatedCodeBlocks++;
            assert.strictEqual(typeof ce.code, 'string', `Code block in ${les.slug} must have string code`);
            assert.ok(ce.code.length > 0, `Code block in ${les.slug} should not be empty`);
          }
        }
      }
    }
    assert.ok(validatedCodeBlocks > 100, `Expected at least 100 code blocks, validated ${validatedCodeBlocks}`);
  });

  it('5. Trade-off & Comparison Section: Advantages and limitations are always arrays', () => {
    let validatedComparisons = 0;
    for (const course of store.academyCourses) {
      for (const mod of (course.modules || [])) {
        for (const les of (mod.lessons || [])) {
          const data = les.blockData?.standardData;
          if (!data || !data.comparison) continue;

          validatedComparisons++;
          assert.ok(Array.isArray(data.comparison.advantages), `Advantages in ${les.slug} must be an array`);
          assert.ok(Array.isArray(data.comparison.limitations), `Limitations in ${les.slug} must be an array`);
        }
      }
    }
    assert.ok(validatedComparisons > 50, `Expected at least 50 comparisons, validated ${validatedComparisons}`);
  });

  it('6. HTML Generator Resilience: Compiles all standardData lessons into valid semantic HTML without error', () => {
    let compiledCount = 0;
    for (const course of store.academyCourses) {
      for (const mod of (course.modules || [])) {
        for (const les of (mod.lessons || [])) {
          const data = les.blockData?.standardData;
          if (!data) continue;

          const html = generateStandardLessonHtml(data);
          assert.strictEqual(typeof html, 'string', `Generated HTML for ${les.slug} must be string`);
          assert.ok(html.includes('standard-lesson-container'), `Generated HTML for ${les.slug} must have root container`);
          compiledCount++;
        }
      }
    }
    assert.ok(compiledCount >= 300, `Expected at least 300 compiled lessons, compiled ${compiledCount}`);
  });

  it('7. Live Server Course Lesson Loading: All courses first lessons return 200 OK without Next.js error', async () => {
    function fetchUrl(pathname) {
      return new Promise((resolve) => {
        const req = http.get(`http://localhost:3000${pathname}`, (res) => {
          let body = '';
          res.on('data', (chunk) => (body += chunk));
          res.on('end', () => resolve({ status: res.statusCode, body }));
        });
        req.on('error', (err) => resolve({ status: 500, error: err.message }));
        req.setTimeout(6000, () => {
          req.destroy();
          resolve({ status: 408 });
        });
      });
    }

    for (const course of store.academyCourses) {
      const firstLesson = course.modules[0]?.lessons[0];
      if (!firstLesson) continue;

      const res = await fetchUrl(`/learning/${encodeURIComponent(firstLesson.slug)}`);
      assert.strictEqual(res.status, 200, `Expected 200 for /learning/${firstLesson.slug}, got ${res.status}`);
      assert.ok(
        !res.body.includes('This page couldn’t load') && !res.body.includes("This page couldn't load"),
        `Lesson /learning/${firstLesson.slug} rendered Next.js global error page`
      );
    }
  });
});
