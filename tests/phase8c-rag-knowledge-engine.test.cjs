process.env.NODE_ENV = 'test';
process.env.ALLOW_MOCK_EMBEDDINGS = 'true';
process.env.ALLOW_LOCAL_STORAGE_FALLBACK = 'true';

const test = require('node:test');
const assert = require('node:assert');
const path = require('node:path');
const jiti = require('jiti')(path.join(__dirname, 'dummy.js'));

// Load components under test
const { ragStorage } = jiti('../src/lib/rag/storage.ts');
const { ragIndexer, RAGIndexer } = jiti('../src/lib/rag/indexer.ts');
const { ragRetriever } = jiti('../src/lib/rag/retrieval.ts');
const { ragEngine } = jiti('../src/lib/rag/engine.ts');
const { ragCache } = jiti('../src/lib/rag/cache.ts');
const { ragReconciler } = jiti('../src/lib/rag/reconciliation.ts');
const { practiceEvaluator } = jiti('../src/lib/rag/practice-evaluator.ts');
const { computeContentHash } = jiti('../src/lib/rag/hash.ts');
const { chunkContent } = jiti('../src/lib/rag/chunker.ts');
const { MockEmbeddingProvider } = jiti('../src/lib/rag/embedding-provider.ts');
const { academyStore } = jiti('../src/lib/academy-store.ts');
const { cmsStore } = jiti('../src/lib/cms-store.ts');
const { getAllInterviewQuestions } = jiti('../src/lib/interview-questions-bank.ts');

test('=== PHASE 8C: FUNCTIONAL VERIFICATION SUITE ===', async (t) => {
  await t.test('1. Initial Ingestion Pipeline', async () => {
    // Ingest all published content
    const scanResult = await ragIndexer.ingestAllPublishedContent();
    assert.ok(
      scanResult.queued > 800,
      `Expected at least 800 queued items, got ${scanResult.queued}`
    );

    // Process batch of jobs
    const batchResult = await ragIndexer.processBatch(50);
    assert.ok(batchResult.processed > 0, 'Processed at least 1 job');
    assert.strictEqual(batchResult.failed, 0, 'Initial batch should have zero failures');
  });

  await t.test('2. Verification of Exactly 800 Interview Questions in Ingestion Source', () => {
    const questions = getAllInterviewQuestions();
    assert.strictEqual(questions.length, 800, 'Must have exactly 800 interview questions');

    // Test interview question chunking preserves question, answer, and pitfalls
    const sampleQ = questions[0];
    const chunks = chunkContent({
      sourceType: 'interview_question',
      sourceId: sampleQ.id,
      sourceTitle: sampleQ.question,
      category: sampleQ.category,
      topic: sampleQ.topic,
      rawText: sampleQ.answerSummary,
      metadata: {
        answer_summary: sampleQ.answerSummary,
        best_practice: sampleQ.bestPractice,
        pitfall_to_avoid: sampleQ.pitfallToAvoid,
        code_snippet: sampleQ.codeSnippet,
      },
    });

    assert.ok(chunks.length >= 1, 'Interview question must produce at least 1 core chunk');
    assert.ok(chunks[0].chunkContent.includes('Question:'), 'Chunk must contain question');
    assert.ok(chunks[0].chunkContent.includes('Answer:'), 'Chunk must contain answer');
    assert.ok(
      chunks[0].chunkContent.includes('Best Practice:'),
      'Chunk must preserve best practice'
    );
    assert.ok(chunks[0].chunkContent.includes('Pitfall to Avoid:'), 'Chunk must preserve pitfall');
  });

  await t.test('3. Deterministic Hashing and Chunk Metadata Traceability', () => {
    const hash1 = computeContentHash({ text: 'Playwright locator auto-waiting', title: 'PW 101' });
    const hash2 = computeContentHash({ text: 'Playwright locator auto-waiting', title: 'PW 101' });
    const hash3 = computeContentHash({ text: 'Selenium explicit wait', title: 'Selenium 101' });

    assert.strictEqual(hash1, hash2, 'Identical content must yield identical SHA-256 hash');
    assert.notStrictEqual(hash1, hash3, 'Different content must yield different hash');
  });

  await t.test('4. Embedding Provider Vector Fidelity (768 Dimensions)', async () => {
    const provider = new MockEmbeddingProvider();
    assert.strictEqual(provider.dimensions, 768, 'Must be 768 dimensions');

    const vec = await provider.generateEmbedding('Software test automation with Playwright');
    assert.strictEqual(vec.length, 768, 'Vector length must be exactly 768');

    // Verify unit vector normalization (L2 norm ≈ 1.0)
    let sumSq = 0;
    for (const val of vec) sumSq += val * val;
    const norm = Math.sqrt(sumSq);
    assert.ok(Math.abs(norm - 1.0) < 0.05, `Vector must be normalized, got ${norm}`);
  });

  await t.test('5. Semantic Retrieval and Course-Specific vs Global Filtering', async () => {
    // Stage an active lesson for retrieval
    await ragIndexer.syncSourceEvent('lesson', 'les-pw-test-fixtures-01', 'upsert', 'published');

    // Save and activate chunk
    const testChunk = {
      id: 'chk-pw-fixtures-test',
      sourceType: 'lesson',
      sourceId: 'les-pw-test-fixtures-01',
      sourceTitle: 'Playwright Fixtures and Browser Contexts',
      courseId: 'course-playwright-mastery',
      moduleId: 'mod-pw-fixtures',
      lessonId: 'les-pw-test-fixtures-01',
      category: 'cat-playwright',
      topic: 'Fixtures',
      contentVersion: 1,
      contentHash: 'hash-pw-fixtures',
      chunkIndex: 0,
      chunkContent:
        'Lesson: Playwright Fixtures and Browser Contexts\n\nPlaywright fixtures allow isolated browser contexts per test worker. Using test.extend(), fixtures provide dependency injection and automatic teardown without shared state.',
      tokenCount: 45,
      embedding: await new MockEmbeddingProvider().generateEmbedding(
        'Playwright fixtures browser context test.extend'
      ),
      embeddingModel: 'text-embedding-004',
      embeddingVersion: 'v1',
      publicationStatus: 'published',
      isActive: true,
      metadata: {},
      indexedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await ragStorage.saveKnowledgeChunks([testChunk]);
    await ragStorage.activateChunkVersion('lesson', 'les-pw-test-fixtures-01', 1, 'published');

    // Retrieve globally
    const globalMatches = await ragRetriever.retrieve('Playwright fixtures browser context', {
      topK: 3,
      minSimilarity: 0.4,
    });
    assert.ok(globalMatches.length > 0, 'Must find fixture chunk in global retrieval');

    // Retrieve course-specific
    const courseMatches = await ragRetriever.retrieve('Playwright fixtures', {
      courseId: 'course-playwright-mastery',
      topK: 3,
      minSimilarity: 0.4,
    });
    assert.ok(courseMatches.length > 0, 'Must find chunk when courseId matches');

    // Non-matching course restriction
    const wrongCourseMatches = await ragRetriever.retrieve('Playwright fixtures', {
      courseId: 'course-selenium-mastery',
      topK: 3,
      minSimilarity: 0.85,
    });
    assert.strictEqual(
      wrongCourseMatches.filter((m) => m.chunk.courseId === 'course-playwright-mastery').length,
      0,
      'Must exclude chunks outside course filter'
    );
  });

  await t.test('6. Citations with Valid Source Links', async () => {
    const chunk = {
      id: 'chk-cite-01',
      sourceType: 'lesson',
      sourceId: 'les-playwright-mastery-1-1-playwright-architecture-browser-',
      sourceTitle: 'Playwright Architecture & Browser Contexts',
      courseId: 'course-playwright-mastery',
      moduleId: 'mod-playwright-mastery-1',
      lessonId: 'les-playwright-mastery-1-1-playwright-architecture-browser-',
      contentVersion: 1,
      contentHash: 'hash-pw-cite',
      chunkIndex: 0,
      chunkContent: 'Playwright browser contexts architecture.',
      tokenCount: 20,
      embedding: [],
      embeddingModel: 'text-embedding-004',
      embeddingVersion: 'v1',
      publicationStatus: 'published',
      isActive: true,
      metadata: {},
      indexedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const citation = ragRetriever.generateCitation(chunk, 0.88);
    assert.strictEqual(citation.sourceTitle, 'Playwright Architecture & Browser Contexts');
    assert.ok(
      citation.url.startsWith('/learning/'),
      `URL must be a valid learning path, got ${citation.url}`
    );
    assert.strictEqual(citation.similarity, 0.88);
  });

  await t.test('7. Insufficient Knowledge Base Response', async () => {
    const res = await ragEngine.ask({
      question: 'Quantum molecular astrophysics and celestial satellite trajectory calculations',
      bypassCache: true,
    });

    assert.strictEqual(res.insufficientKnowledge, true);
    assert.strictEqual(res.citations.length, 0);
    assert.ok(
      res.answer.includes('does not currently contain') ||
        res.answer.includes('prevent AI hallucinations'),
      'Must clearly communicate lack of evidence'
    );
  });

  await t.test('8. Interview Practice Mode Scoring & Feedback', async () => {
    const questions = getAllInterviewQuestions();
    const q = questions[0];

    const evaluation = await practiceEvaluator.evaluateAnswer(
      q.id,
      'StaleElementReferenceException happens when DOM node is detached. In Selenium we handle it with dynamic explicit waits or re-locating the element. Playwright auto-waiting avoids it. Avoid Thread.sleep.',
      'test-key'
    );

    assert.ok(
      evaluation.score >= 40 && evaluation.score <= 100,
      `Score must be 0-100, got ${evaluation.score}`
    );
    assert.ok(evaluation.correctConcepts.length > 0, 'Must detect correct concepts');
    assert.ok(evaluation.improvedAnswer.length > 50, 'Must provide improved answer');
    assert.ok(evaluation.constructiveFeedback.length > 20, 'Must provide constructive feedback');
  });
});

test('=== PHASE 8C: MANDATORY RAG FRESHNESS TESTS (A through I) ===', async (t) => {
  // Setup clean test state
  ragCache.clear();

  await t.test(
    'Test A — New lesson: Auto-indexed and immediately retrievable with citation',
    async () => {
      const testLessonId = `les-freshness-a-${Date.now()}`;
      const newLessonContent = `
      <h2>Kubernetes Container Testing for SDETs</h2>
      <p>Testcontainers allow spinning up ephemeral PostgreSQL and Redis instances inside test runner pods.</p>
    `;

      // 1. Create and publish new lesson via store
      academyStore.createLesson('course-cicd-concepts', 'mod-cicd-1-git', {
        title: 'Containerized Testing with Testcontainers',
        slug: `testcontainers-qa-${Date.now()}`,
        summary: 'Ephemeral test container isolation.',
        contentHtml: newLessonContent,
        wordCount: 120,
        estimatedReadTime: 2,
        sortOrder: 99,
        status: 'published',
      });

      // 2. Process outbox queue
      await ragIndexer.processBatch(5);

      // 3. User queries knowledge engine
      const answer = await ragEngine.ask({
        question: 'How do you use Testcontainers for isolated database testing in QA?',
        bypassCache: true,
      });

      assert.ok(answer.sourceCount > 0, 'Must retrieve chunks for the new lesson');
      assert.ok(answer.citations.some((c) => c.sourceTitle.includes('Testcontainers')));
      assert.strictEqual(answer.insufficientKnowledge, false);
    }
  );

  await t.test(
    'Test B — Updated lesson: New version created, old chunks retired, new content reflected',
    async () => {
      const lessonSlug = 'playwright-architecture-browser-contexts';
      const initialLesson = academyStore.getLesson(lessonSlug);
      assert.ok(initialLesson, 'Base lesson must exist');

      const updatedText = `
      <h2>Playwright Modern Trace Viewer v2026</h2>
      <p>The revised Playwright architecture now supports live DOM snapshots and network timeline scrubbing with zero flaky retries.</p>
    `;

      // 1. Update lesson content
      academyStore.updateLesson(initialLesson.lesson.id, {
        contentHtml: updatedText,
        summary: 'Updated Trace Viewer v2026 architecture.',
      });

      // Process indexing job
      await ragIndexer.processBatch(5);

      // 2. Verify source version incremented
      const source = await ragStorage.getKnowledgeSource('lesson', initialLesson.lesson.id);
      assert.ok(source, 'Source must exist in registry');
      assert.ok(source.currentVersion >= 2, 'Version must increment on content edit');

      // 3. Query updated content
      const response = await ragEngine.ask({
        question: 'What is the updated Playwright Trace Viewer v2026 capability?',
        bypassCache: true,
      });

      assert.ok(response.citations.length > 0);
      // Confirm retired chunks are not returned
      const activeChunks = await ragStorage.getActiveChunks({ courseId: initialLesson.course.id });
      const oldVersionChunks = activeChunks.filter(
        (c) => c.sourceId === initialLesson.lesson.id && c.contentVersion < source.currentVersion
      );
      assert.strictEqual(
        oldVersionChunks.length,
        0,
        'No superseded old version chunks can be active'
      );
    }
  );

  await t.test(
    'Test C — Unpublished lesson: Immediately excluded from retrieval and cache invalidated',
    async () => {
      const lessonRes = academyStore.getLesson('playwright-architecture-browser-contexts');
      assert.ok(lessonRes);
      const targetId = lessonRes.lesson.id;

      // First ensure answer is cached
      await ragEngine.ask({ question: 'Explain Playwright browser contexts', bypassCache: false });

      // 1. Admin unpublishes the lesson
      academyStore.setPublishStatus('lesson', targetId, 'draft');

      // 2. Verify immediate exclusion: active chunks must be 0
      const activeChunks = await ragStorage.getActiveChunks();
      const unpubChunks = activeChunks.filter((c) => c.sourceId === targetId);
      assert.strictEqual(
        unpubChunks.length,
        0,
        'Unpublished lesson chunks must be IMMEDIATELY deactivated'
      );

      // 3. Cached answer must be invalidated
      const cached = ragCache.get('Explain Playwright browser contexts', null);
      assert.strictEqual(
        cached,
        null,
        'Cache must be immediately invalidated for unpublished source'
      );

      // Restore for remaining tests
      academyStore.setPublishStatus('lesson', targetId, 'published');
      await ragIndexer.processBatch(5);
    }
  );

  await t.test(
    'Test D — Deleted lesson: Chunks purged and safely excluded from retrieval',
    async () => {
      // Create temporary lesson
      const tempLesson = academyStore.createLesson('course-cicd-concepts', 'mod-cicd-1-git', {
        title: 'Ephemeral Lesson To Be Deleted',
        slug: `temp-delete-${Date.now()}`,
        contentHtml: '<p>Delete me soon.</p>',
        status: 'published',
      });

      await ragIndexer.processBatch(5);

      // Verify indexed
      const beforeChunks = await ragStorage.getActiveChunks();
      assert.ok(beforeChunks.some((c) => c.sourceId === tempLesson.id));

      // Admin deletes lesson
      academyStore.deleteLesson(tempLesson.id);

      // Verify immediately excluded
      const afterChunks = await ragStorage.getActiveChunks();
      assert.strictEqual(
        afterChunks.some((c) => c.sourceId === tempLesson.id),
        false,
        'Deleted lesson chunks must be purged from active retrieval'
      );
    }
  );

  await t.test(
    'Test E — Failed indexing: Visible in audit, retryable without corrupted active state',
    async () => {
      class FailingEmbeddingProvider extends MockEmbeddingProvider {
        async generateBatchEmbeddings() {
          throw new Error('SIMULATED_PROVIDER_NETWORK_TIMEOUT_503');
        }
      }

      const failingIndexer = new RAGIndexer(new FailingEmbeddingProvider());

      const failingJob = {
        id: 'job-failing-test-01',
        jobType: 'index_source',
        sourceType: 'lesson',
        sourceId: 'les-playwright-mastery-1-1-playwright-architecture-browser-',
        version: 99,
        status: 'pending',
        priority: 10,
        attempts: 0,
        maxAttempts: 2,
        scheduledAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await ragStorage.enqueueJob(failingJob);

      // Execute failing job
      const runResult = await failingIndexer.processJob(failingJob);
      assert.strictEqual(runResult.success, false);
      assert.ok(runResult.error.includes('SIMULATED_PROVIDER_NETWORK_TIMEOUT_503'));

      // Check job and source visibility
      const jobs = await ragStorage.getAllJobs();
      const failed = jobs.find((j) => j.id === failingJob.id);
      assert.ok(failed, 'Failed job must be preserved');
      assert.ok(failed.attempts > 0, 'Attempts must increment');

      // Confirm that a failed job does NOT activate corrupted version 99 chunks
      const activeChunks = await ragStorage.getActiveChunks();
      assert.strictEqual(
        activeChunks.filter(
          (c) =>
            c.sourceId === 'les-playwright-mastery-1-1-playwright-architecture-browser-' &&
            c.contentVersion === 99
        ).length,
        0,
        'Failed indexing version must not be active'
      );
    }
  );

  await t.test(
    'Test F — Duplicate indexing events: Idempotent processing with zero duplicate active chunks',
    async () => {
      const sourceId = 'iq-pw-001';

      // Trigger duplicate sync calls for same version
      await ragIndexer.syncSourceEvent('interview_question', sourceId, 'upsert', 'published');
      await ragIndexer.syncSourceEvent('interview_question', sourceId, 'upsert', 'published');
      await ragIndexer.syncSourceEvent('interview_question', sourceId, 'upsert', 'published');

      await ragIndexer.processBatch(10);

      const activeChunks = await ragStorage.getActiveChunks();
      const sourceChunks = activeChunks.filter((c) => c.sourceId === sourceId);

      // Verify no duplicated chunk indexes
      const indices = new Set();
      for (const c of sourceChunks) {
        assert.strictEqual(indices.has(c.chunkIndex), false, 'Duplicate chunk index detected!');
        indices.add(c.chunkIndex);
      }
    }
  );

  await t.test('Test G — Concurrent updates: Newer version supersedes older version', async () => {
    const srcId = 'les-concurrent-test';

    // Enqueue version 1 and version 2
    const jobV1 = {
      id: 'job-conc-v1',
      jobType: 'index_source',
      sourceType: 'lesson',
      sourceId: srcId,
      version: 1,
      status: 'pending',
      priority: 5,
      attempts: 0,
      maxAttempts: 3,
      scheduledAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const jobV2 = {
      id: 'job-conc-v2',
      jobType: 'index_source',
      sourceType: 'lesson',
      sourceId: srcId,
      version: 2,
      status: 'pending',
      priority: 5,
      attempts: 0,
      maxAttempts: 3,
      scheduledAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await ragStorage.enqueueJob(jobV1);
    await ragStorage.enqueueJob(jobV2);

    // Verify v1 marked superseded by v2
    const allJobs = await ragStorage.getAllJobs();
    const foundV1 = allJobs.find((j) => j.id === 'job-conc-v1');
    assert.strictEqual(foundV1.status, 'superseded', 'Older job must be marked superseded');
  });

  await t.test(
    'Test H — Reconciliation: Detects missed event and repairs active knowledge base',
    async () => {
      // Simulate an out-of-sync source: create a lesson without calling sync
      const reconLesson = academyStore.createLesson('course-cicd-concepts', 'mod-cicd-1-git', {
        title: 'Reconciliation Repair Test Lesson',
        slug: `recon-test-${Date.now()}`,
        contentHtml: '<p>Reconciliation must find and index this.</p>',
        status: 'published',
      });

      // Run reconciliation scan
      const report = await ragReconciler.runReconciliationScan();
      assert.ok(report.scannedCount > 0);
      assert.ok(
        report.missingSourcesQueued > 0 || report.outdatedSourcesQueued > 0,
        'Must detect and enqueue repair jobs'
      );

      // Verify lesson became active
      const active = await ragStorage.getActiveChunks();
      assert.ok(active.some((c) => c.sourceId === reconLesson.id));
    }
  );

  await t.test(
    'Test I — Conversation freshness: Subsequent questions retrieve latest version instead of stale context',
    async () => {
      // 1. Turn 1: Ask question
      const turn1 = await ragEngine.ask({
        question: 'What are Playwright browser contexts?',
        bypassCache: false,
      });
      assert.ok(turn1.citations.length > 0);

      // 2. Admin updates the lesson in the background
      const target = academyStore.getLesson('playwright-architecture-browser-contexts');
      if (target) {
        academyStore.updateLesson(target.lesson.id, {
          summary: 'Turn 2 fresh updated context: Multi-context browser partitioning.',
        });
        await ragIndexer.processBatch(5);
      }

      // 3. Turn 2: Follow-up question in same conversation
      const turn2 = await ragEngine.ask({
        question: 'How do browser contexts isolate cookies and storage?',
        history: [
          { role: 'user', content: 'What are Playwright browser contexts?' },
          { role: 'assistant', content: turn1.answer },
        ],
        bypassCache: false,
      });

      // Confirm that turn 2 retrieved the current active version, not a stale cached version
      assert.ok(turn2.citations.length > 0);
      const source = await ragStorage.getKnowledgeSource('lesson', target.lesson.id);
      if (source) {
        const turn2Citation = turn2.citations.find((c) => c.sourceId === target.lesson.id);
        if (turn2Citation) {
          assert.strictEqual(
            turn2Citation.version,
            source.currentVersion,
            'Follow-up question must retrieve newest version'
          );
        }
      }
    }
  );
});
