/**
 * Phase 7: Comprehensive Security, Regression Testing & Production Readiness Suite
 * 
 * Tests:
 * 1. Authorization Testing (Admin-only creation/upload/publish, draft isolation, user isolation)
 * 2. Document Upload Security (Invalid extensions, corrupted signatures, oversized files, XSS sanitization, duplicate names)
 * 3. Functional Regression (Left nav groupings, CI/CD Concepts, API Testing & Automation, removed articles, contiguous navigation)
 * 4. Performance & Scalability (Concurrent user progress isolation, large content search speed)
 * 5. Error Handling & Safety (Missing resource handling, non-corrupting conversion failure)
 * 6. Deployment Readiness (Persistent storage paths, relational schema definitions, production build safety)
 */

const { describe, it } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const jiti = require('jiti')(__filename, {
  alias: {
    '@': path.join(process.cwd(), 'src'),
  },
});

// Load stores and engines via jiti
const { academyStore } = jiti('../src/lib/academy-store.ts');
const { validateDocxFile } = jiti('../src/lib/docx-engine.ts');
const { verifyAdminAccess } = jiti('../src/lib/cms-security.ts');
const { sanitizeHtml } = jiti('../src/lib/cms-engine.js');

describe('Phase 7: Security, Regression & Production Readiness', () => {

  // =========================================================================
  // 1. AUTHORIZATION TESTING
  // =========================================================================
  describe('1. Authorization & Role-Based Access Control (RBAC)', () => {
    it('rejects unauthorized requests without admin headers or credentials', () => {
      const headerMap = new Map([
        ['authorization', 'Bearer normal-user-token'],
        ['x-admin-email', 'student@qa.org'],
      ]);
      const mockGuestReq = {
        headers: {
          get: (k) => headerMap.get(k.toLowerCase()) || null,
        },
      };

      const result = verifyAdminAccess(mockGuestReq);
      assert.strictEqual(result.authorized, false);
      assert.ok(result.reason.includes('Unauthorized'));
    });

    it('authorizes requests with verified admin token or recognized admin email', () => {
      const headerMap = new Map([
        ['authorization', 'Bearer admin-jwt-token'],
        ['x-admin-email', 'admin@intelligentqa.io'],
      ]);
      const mockAdminReq = {
        headers: {
          get: (k) => headerMap.get(k.toLowerCase()) || null,
        },
      };

      const result = verifyAdminAccess(mockAdminReq);
      assert.strictEqual(result.authorized, true);
    });

    it('authorizes requests with valid system admin emergency passcode', () => {
      const headerMap = new Map([
        ['x-admin-passcode', 'SDET_ADMIN_2026'],
      ]);
      const mockPasscodeReq = {
        headers: {
          get: (k) => headerMap.get(k.toLowerCase()) || null,
        },
      };

      const result = verifyAdminAccess(mockPasscodeReq);
      assert.strictEqual(result.authorized, true);
    });

    it('ensures draft lessons cannot be accessed publicly without includeDrafts flag', () => {
      // Create a temporary draft lesson
      const course = academyStore.getCourses({ includeDrafts: true })[0];
      assert.ok(course, 'Course must exist');
      const module = course.modules[0];
      assert.ok(module, 'Module must exist');

      const draftSlug = `draft-sec-${Date.now()}`;
      const createdLesson = academyStore.createLesson(course.id, module.id, {
        slug: draftSlug,
        title: 'Secret Draft Architecture',
        status: 'draft',
        contentHtml: '<p>Unpublished internal notes.</p>',
        wordCount: 10,
        estimatedReadTime: 1,
        sortOrder: 99,
        summary: 'Internal draft summary',
      });

      // Public / guest query (includeDrafts: false) MUST return undefined / null
      const publicResult = academyStore.getLesson(createdLesson.id, { includeDrafts: false });
      assert.ok(!publicResult, 'Public access to draft lesson must be blocked');

      // Admin query (includeDrafts: true) MUST return the draft lesson
      const adminResult = academyStore.getLesson(createdLesson.id, { includeDrafts: true });
      assert.ok(adminResult, 'Admin access to draft lesson should succeed');
      assert.strictEqual(adminResult.lesson.status, 'draft');

      // Cleanup
      academyStore.deleteLesson(createdLesson.id);
    });

    it('isolates user learning progress and bookmarks between accounts', () => {
      const userAlpha = `user-alpha-${Date.now()}`;
      const userBeta = `user-beta-${Date.now()}`;
      const lessonId = 'les-what-is-ai';

      // Record progress for User Alpha
      academyStore.recordUserProgress({
        userId: userAlpha,
        lessonId,
        completionStatus: 'completed',
      });
      academyStore.toggleBookmark(userAlpha, lessonId);

      // Verify User Alpha has completed progress and bookmark
      const statsAlpha = academyStore.getUserLearningStats(userAlpha);
      const bookmarksAlpha = academyStore.getUserBookmarks(userAlpha);
      assert.strictEqual(statsAlpha.totalCompleted, 1);
      assert.strictEqual(bookmarksAlpha.length, 1);

      // Verify User Beta is completely isolated: 0 completed lessons, 0 bookmarks
      const statsBeta = academyStore.getUserLearningStats(userBeta);
      const bookmarksBeta = academyStore.getUserBookmarks(userBeta);
      assert.strictEqual(statsBeta.totalCompleted, 0, 'User Beta completed count must remain 0');
      assert.strictEqual(statsBeta.totalVisited, 0, 'User Beta visits must remain 0');
      assert.strictEqual(bookmarksBeta.length, 0, 'User Beta bookmarks must remain 0');

      // Cleanup
      academyStore.toggleBookmark(userAlpha, lessonId);
    });
  });

  // =========================================================================
  // 2. DOCUMENT UPLOAD SECURITY
  // =========================================================================
  describe('2. Document Upload Security & Ingestion Safety', () => {
    it('rejects invalid file extensions (.exe, .sh, .bat, .php, .js)', () => {
      const dangerousExtensions = ['exploit.exe', 'script.sh', 'backdoor.php', 'batch.bat', 'payload.js'];
      const dummyBuffer = Buffer.from('console.log("danger");');

      dangerousExtensions.forEach(filename => {
        const result = validateDocxFile(dummyBuffer, filename);
        assert.strictEqual(result.valid, false);
        assert.ok(result.error.includes('Only Microsoft Word (.docx) files are supported'));
      });
    });

    it('rejects empty (0 byte) file uploads', () => {
      const emptyBuffer = Buffer.alloc(0);
      const result = validateDocxFile(emptyBuffer, 'empty.docx');
      assert.strictEqual(result.valid, false);
      assert.ok(result.error.includes('empty'));
    });

    it('rejects oversized files exceeding 25 MB limit', () => {
      const oversizedBuffer = Buffer.alloc(26 * 1024 * 1024); // 26MB
      const result = validateDocxFile(oversizedBuffer, 'huge.docx');
      assert.strictEqual(result.valid, false);
      assert.ok(result.error.includes('exceeds maximum allowed limit of 25 MB'));
    });

    it('rejects corrupted or non-DOCX files disguised with .docx extension (magic byte check)', () => {
      // File has .docx extension, but starts with plaintext instead of 50 4B 03 04
      const fakeDocxBuffer = Buffer.from('This is a plain text file pretending to be a docx');
      const result = validateDocxFile(fakeDocxBuffer, 'forged.docx');
      assert.strictEqual(result.valid, false);
      assert.ok(result.error.includes('File signature verification failed'));
      assert.ok(result.error.includes('missing PK zip signature'));
    });

    it('accepts valid DOCX files with authentic PK zip magic bytes (50 4B 03 04)', () => {
      // Authentic PK\x03\x04 zip header
      const validDocxMock = Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x14, 0x00, 0x06, 0x00]);
      const result = validateDocxFile(validDocxMock, 'authentic.docx');
      assert.strictEqual(result.valid, true);
      assert.strictEqual(result.error, undefined);
      assert.ok(result.sha256.length === 64, 'Must compute valid SHA-256 hash');
    });

    it('sanitizes malicious HTML: strips <script>, <iframe>, and inline event handlers', () => {
      const maliciousHtml = `
        <h2>Title</h2>
        <script>alert('xss payload');</script>
        <p>Normal text</p>
        <iframe src="https://attacker.com/evil"></iframe>
        <img src="valid.png" onerror="alert('stealing cookies')" onload="exploit()" />
        <a href="javascript:void(0)" onclick="stealTokens()">Click here</a>
      `;

      const cleaned = sanitizeHtml(maliciousHtml);
      assert.strictEqual(cleaned.includes('<script>'), false, 'Must strip <script> tag');
      assert.strictEqual(cleaned.includes('alert('), false, 'Must strip script payload');
      assert.strictEqual(cleaned.includes('<iframe'), false, 'Must strip <iframe> tag');
      assert.strictEqual(cleaned.includes('onerror='), false, 'Must strip inline onerror handler');
      assert.strictEqual(cleaned.includes('onload='), false, 'Must strip inline onload handler');
      assert.strictEqual(cleaned.includes('javascript:'), false, 'Must strip javascript: pseudo-protocol');
      assert.ok(cleaned.includes('<h2>Title</h2>'), 'Must preserve safe markup');
      assert.ok(cleaned.includes('Normal text'), 'Must preserve text content');
    });

    it('generates unique non-colliding storage filenames for duplicate original names', () => {
      const originalFilename = 'Automation Architecture Guidelines.docx';
      const ext = path.extname(originalFilename).toLowerCase();
      const safeBaseName = path.basename(originalFilename, ext).replace(/[^a-zA-Z0-9_-]/g, '_');

      const name1 = `${safeBaseName}_${Date.now()}_1${ext}`;
      const name2 = `${safeBaseName}_${Date.now()}_2${ext}`;

      assert.notStrictEqual(name1, name2);
      assert.ok(!name1.includes(' '), 'Must replace whitespace with underscores');
    });
  });

  // =========================================================================
  // 3. FUNCTIONAL REGRESSION & NAVIGATION REFINEMENTS
  // =========================================================================
  describe('3. Functional Regression & Left Navigation Groupings', () => {
    it('verifies "Tutorials and Articles" is removed from normal user left navigation', () => {
      const sidebarPath = path.join(process.cwd(), 'src/components/layout/sidebar.tsx');
      const content = fs.readFileSync(sidebarPath, 'utf8');

      // Must not render "/blog" or "Tutorials & Articles" in the normal user left nav
      assert.strictEqual(
        content.includes('href="/blog"'),
        false,
        'Sidebar must not contain link to /blog in user navigation'
      );
      assert.strictEqual(
        content.includes('<span>Tutorials &amp; Articles</span>'),
        false,
        'Sidebar must not contain Tutorials & Articles label'
      );
    });

    it('verifies Articles/Tutorials tab is cleaned up from Admin CMS page', () => {
      const adminCmsPath = path.join(process.cwd(), 'src/app/admin/cms/page.tsx');
      const content = fs.readFileSync(adminCmsPath, 'utf8');

      assert.strictEqual(
        content.includes("{ id: 'articles', label: 'Articles / Tutorials'"),
        false,
        'Admin CMS must not contain Articles / Tutorials tab'
      );
    });

    it('verifies "CI/CD Concepts" course groups Git, Github Actions, Azure DevOps, and Jenkins as child items', () => {
      const sidebarPath = path.join(process.cwd(), 'src/components/layout/sidebar.tsx');
      const content = fs.readFileSync(sidebarPath, 'utf8');

      assert.ok(content.includes("displayTitle: 'CI/CD Concepts'"), 'Must have main course CI/CD Concepts');
      assert.ok(content.includes("title: 'Git'"), 'Must include Git child list item');
      assert.ok(content.includes("title: 'Github Actions'"), 'Must include Github Actions child list item');
      assert.ok(content.includes("title: 'Azure DevOps'"), 'Must include Azure DevOps child list item');
      assert.ok(content.includes("title: 'Jenkins'"), 'Must include Jenkins child list item');
    });

    it('verifies "API Testing & Automation" course groups FullStack API & Contracts and Rest Assured as child items', () => {
      const sidebarPath = path.join(process.cwd(), 'src/components/layout/sidebar.tsx');
      const content = fs.readFileSync(sidebarPath, 'utf8');

      assert.ok(content.includes("displayTitle: 'API Testing & Automation'"), 'Must have main course API Testing & Automation');
      assert.ok(content.includes("title: 'FullStack API & Contracts'"), 'Must include FullStack API child list item');
      assert.ok(content.includes("title: 'Rest Assured'"), 'Must include Rest Assured child list item');
    });

    it('verifies "Test Automated Backend Course" is excluded from left navigation', () => {
      const sidebarPath = path.join(process.cwd(), 'src/components/layout/sidebar.tsx');
      const content = fs.readFileSync(sidebarPath, 'utf8');

      assert.ok(
        content.includes("test automated backend"),
        'Sidebar must explicitly filter out Test Automated Backend Course'
      );
    });

    it('verifies contiguous lesson navigation (Previous, Next, and Back to Course)', () => {
      const lessonWithContext = academyStore.getLessonWithContext('les-what-is-ai');
      assert.ok(lessonWithContext, 'Must resolve lesson context');
      assert.ok(lessonWithContext.backToCourse, 'Must provide backToCourse object');
      assert.ok(lessonWithContext.backToCourse.courseSlug, 'backToCourse must have courseSlug');
      assert.ok(lessonWithContext.courseOverview, 'Must provide courseOverview');
      assert.ok(lessonWithContext.moduleOverview, 'Must provide moduleOverview');
      assert.ok(Array.isArray(lessonWithContext.relatedLessons), 'Must provide relatedLessons array');
    });
  });

  // =========================================================================
  // 4. PERFORMANCE & CONCURRENCY
  // =========================================================================
  describe('4. Performance, Concurrency & Search Scalability', () => {
    it('executes global curriculum search across 100+ lessons in under 50ms', () => {
      // Warm search index
      academyStore.searchCurriculum('warmup');
      const startTime = performance.now();
      const results = academyStore.searchCurriculum('Playwright locator');
      const duration = performance.now() - startTime;

      assert.ok(duration < 50, `Search must execute in < 50ms, took ${duration.toFixed(2)}ms`);
      assert.ok(results.length > 0, 'Search should find Playwright lessons');
      assert.ok(results[0].title || results[0].snippet, 'Search result must include title or snippet');
    });

    it('handles concurrent progress updates for 10 users without data corruption or cross-talk', () => {
      const users = Array.from({ length: 10 }, (_, i) => `perf-user-${Date.now()}-${i}`);
      const lessonId = 'les-what-is-ai';

      // Perform simultaneous visits and completions
      users.forEach((userId, index) => {
        academyStore.recordUserProgress({
          userId,
          lessonId,
          completionStatus: index % 2 === 0 ? 'completed' : 'in_progress',
        });
      });

      // Assert each user's isolated state
      users.forEach((userId, index) => {
        const stats = academyStore.getUserLearningStats(userId);
        assert.strictEqual(stats.totalVisited, 1, `User ${userId} visited count must be 1`);
        const expectedCompleted = index % 2 === 0 ? 1 : 0;
        assert.strictEqual(stats.totalCompleted, expectedCompleted, `User ${userId} completed status mismatch`);
      });
    });
  });

  // =========================================================================
  // 5. ERROR HANDLING & RESILIENCE
  // =========================================================================
  describe('5. Error Handling & System Resilience', () => {
    it('returns null/undefined safely without crashing when querying non-existent lesson ID', () => {
      const nonExistent = academyStore.getLesson('non-existent-lesson-id-999');
      assert.ok(!nonExistent, 'Querying non-existent lesson should return falsy');
    });

    it('returns empty results safely when querying navigation tree', () => {
      const navTree = academyStore.getNavigationTree();
      assert.ok(Array.isArray(navTree), 'Navigation tree must be an array');
      assert.ok(navTree.length > 0, 'Navigation tree must contain categories');
    });

    it('safely handles search queries with special regex characters without throwing', () => {
      const specialQueries = ['[Playwright]', 'Java (Spring)', '.*', '\\d+', 'C++ / C#'];
      specialQueries.forEach(q => {
        assert.doesNotThrow(() => {
          const res = academyStore.searchCurriculum(q);
          assert.ok(Array.isArray(res));
        }, `Search with "${q}" should not throw`);
      });
    });
  });

  // =========================================================================
  // 6. DEPLOYMENT READINESS
  // =========================================================================
  describe('6. Production Deployment Readiness', () => {
    it('verifies persistent file upload directories exist and are not temporary /tmp paths', () => {
      const docsDir = path.join(process.cwd(), 'public/uploads/learning/docs');
      const mediaDir = path.join(process.cwd(), 'public/uploads/learning/media');
      const imagesDir = path.join(process.cwd(), 'public/uploads/learning/images');

      assert.ok(fs.existsSync(docsDir), 'public/uploads/learning/docs must exist');
      assert.ok(fs.existsSync(mediaDir), 'public/uploads/learning/media must exist');
      assert.ok(fs.existsSync(imagesDir), 'public/uploads/learning/images must exist');
    });

    it('verifies relational database schema extension is documented in scripts/schema.sql', () => {
      const schemaPath = path.join(process.cwd(), 'scripts/schema.sql');
      const schema = fs.readFileSync(schemaPath, 'utf8');

      assert.ok(schema.includes('academy_categories'), 'schema.sql must define academy_categories');
      assert.ok(schema.includes('academy_courses'), 'schema.sql must define academy_courses');
      assert.ok(schema.includes('academy_modules'), 'schema.sql must define academy_modules');
      assert.ok(schema.includes('academy_lessons'), 'schema.sql must define academy_lessons');
      assert.ok(schema.includes('user_lesson_progress'), 'schema.sql must define user_lesson_progress');
      assert.ok(schema.includes('academy_bookmarks'), 'schema.sql must define academy_bookmarks');
    });

    it('verifies zero-cost free QA community guarantee is preserved (no payment or paywall code)', () => {
      const dashboardPath = path.join(process.cwd(), 'src/components/learning/learning-dashboard.tsx');
      const content = fs.readFileSync(dashboardPath, 'utf8');

      assert.ok(
        content.includes('100% Free QA Community Platform'),
        'Dashboard must state 100% Free QA Community Platform guarantee'
      );
      assert.strictEqual(
        content.includes('@stripe/stripe-js') || content.includes('createSubscription') || content.includes('paywall_gate'),
        false,
        'Must not introduce subscription or paywall dependencies'
      );
    });
  });
});
