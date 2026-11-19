const { describe, it } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const fs = require('fs');

const jiti = require('jiti')(path.resolve(process.cwd(), 'tests/interview-griller.test.cjs'), {
  alias: { '@': path.resolve(process.cwd(), 'src') }
});

const {
  INTERVIEW_KNOWLEDGE_BASE,
  getQuestionsByLevelAndDifficulty,
} = jiti('../src/lib/interview-questions-bank.ts');

const { POST } = jiti('../src/app/api/ai/interview-grill/route.ts');

describe('FreeMockInterview Knowledge Base & Validations Suite', () => {
  it('should have new Freemockinterview questions added with complete metadata', () => {
    const fmiIds = [
      'fmi-pw-route-01',
      'fmi-pw-storage-01',
      'fmi-qa-bva-01',
      'fmi-qa-triage-01',
      'fmi-qa-flaky-01',
      'fmi-api-idempotency-01',
      'fmi-api-contract-01',
      'fmi-api-ratelimit-01',
      'fmi-mob-webview-01',
      'fmi-mob-biometrics-01',
      'fmi-mob-crash-01',
      'fmi-mob-deeplink-01',
      'fmi-cicd-matrix-01',
      'fmi-cicd-testcontainers-01',
      'fmi-rep-allure-01',
      'fmi-rep-slack-01',
      'fmi-dsa-sliding-01',
      'fmi-dsa-concurrency-01',
    ];

    for (const id of fmiIds) {
      const q = INTERVIEW_KNOWLEDGE_BASE.find(item => item.id === id);
      assert(q, `Expected question ${id} to exist in INTERVIEW_KNOWLEDGE_BASE`);
      assert(q.question && q.question.length > 25, `Question text incomplete for ${id}`);
      assert(q.expectedFocus && q.expectedFocus.length > 15, `Expected focus incomplete for ${id}`);
      assert(q.answerSummary && q.answerSummary.length > 30, `Answer summary incomplete for ${id}`);
      assert(q.bestPractice && q.bestPractice.length > 10, `Best practice incomplete for ${id}`);
      assert(q.pitfallToAvoid && q.pitfallToAvoid.length > 10, `Pitfall incomplete for ${id}`);
    }
  });

  it('should validate STAR framework in live coach for behavioral questions', async () => {
    const coachReq = {
      json: async () => ({
        action: 'coach',
        question: 'Tell me about a time you had a disagreement with a developer over a critical bug.',
        currentAnswer: 'When I was at Acme Corp in our payment squad, my task was to release the checkout feature on time without defects. I investigated the race condition in the database and scheduled a triage meeting with the dev lead. This resulted in reducing checkout flakiness by 40% and prevented production regressions.',
        turns: [],
        questionList: [{ question: 'Tell me about a time you had a disagreement with a developer over a critical bug.', category: 'Behavioral & Leadership' }],
      }),
      headers: { get: () => null },
    };

    const res = await POST(coachReq);
    const data = await res.json();

    assert.strictEqual(data.framework, 'STAR');
    assert.strictEqual(data.prepStage, 'Polished');
    assert.strictEqual(data.hasPoint, true);
    assert.strictEqual(data.hasReason, true);
    assert.strictEqual(data.hasExample, true);
    assert.strictEqual(data.hasImpact, true);
  });

  it('should validate PREP framework in live coach for technical questions', async () => {
    const coachReq = {
      json: async () => ({
        action: 'coach',
        question: 'What is the difference between getByRole and CSS selectors in Playwright?',
        currentAnswer: 'The difference is page.getByRole queries the browser Accessibility Tree because it mirrors real user interactions. For example, await page.getByRole("button").click(). This reduces flakiness in CI pipelines when CSS changes.',
        turns: [],
        questionList: [{ question: 'What is the difference between getByRole and CSS selectors in Playwright?' }],
      }),
      headers: { get: () => null },
    };

    const res = await POST(coachReq);
    const data = await res.json();

    assert.strictEqual(data.framework, 'PREP');
    assert.strictEqual(data.prepStage, 'Polished');
    assert.strictEqual(data.hasPoint, true);
    assert.strictEqual(data.hasReason, true);
    assert.strictEqual(data.hasExample, true);
    assert.strictEqual(data.hasImpact, true);
  });

  it('should penalize action-only automation code that lacks assertions', async () => {
    const submitReq = {
      json: async () => ({
        action: 'submit_answer',
        currentAnswer: 'I will navigate to the page and click the submit button.',
        currentCode: 'await page.goto("/login");\nawait page.locator("#username").fill("admin");\nawait page.locator("#submit").click();',
        turns: [],
        questionList: [{
          id: 'test-actions',
          question: 'Write a test to verify successful login.',
          expectedFocus: 'Assertions, expect(page).toHaveURL(), validating user dashboard',
          answerSummary: 'Navigate, fill credentials, click submit, and assert user dashboard is visible.',
          bestPractice: 'Always assert on final page state',
          pitfallToAvoid: 'Writing actions without assertions',
        }],
      }),
      headers: { get: () => null },
    };

    const res = await POST(submitReq);
    const data = await res.json();

    assert.strictEqual(data.evaluation.verdict, 'Partially Correct');
    assert(data.evaluation.turnScore <= 45, `Expected score <= 45 for missing assertions, got ${data.evaluation.turnScore}`);
    assert(data.evaluation.feedback.includes('zero assertions') || data.evaluation.mistakesAndGaps.some(g => g.includes('assertions')));
  });

  it('should penalize missing await in Playwright asynchronous actions', async () => {
    const submitReq = {
      json: async () => ({
        action: 'submit_answer',
        currentAnswer: 'Here is the playwright script to click the button.',
        currentCode: 'page.goto("/home");\npage.click("#btn");\nexpect(page).toBeDefined();',
        turns: [],
        questionList: [{
          id: 'test-pw-async',
          technology: 'Playwright',
          question: 'How do you click a button in Playwright?',
          expectedFocus: 'await page.click, actionability checks',
          answerSummary: 'Use await page.getByRole("button").click() with web-first assertions.',
          bestPractice: 'Always await asynchronous promises',
          pitfallToAvoid: 'Omitting await in async functions',
        }],
      }),
      headers: { get: () => null },
    };

    const res = await POST(submitReq);
    const data = await res.json();

    assert.strictEqual(data.evaluation.verdict, 'Partially Correct');
    assert(data.evaluation.feedback.includes('missing `await`') || data.evaluation.mistakesAndGaps.some(g => g.includes('await')));
  });

  it('should generate dynamic multi-turn scorecard with hiring recommendation and actionable drills on final turn', async () => {
    const finalReq = {
      json: async () => ({
        action: 'submit_answer',
        currentAnswer: 'We configure storageState in playwright.config.ts to authenticate once and reuse credentials across parallel workers.',
        currentCode: 'export default defineConfig({ use: { storageState: "auth.json" } });',
        turns: [
          {
            question: 'How do you handle flaky tests?',
            answer: 'We quarantine flaky tests and fix them within 72 hours SLA.',
            feedback: 'Correct (85%): Strong explanation of flaky test governance.',
            mistakesAndGaps: ['Detail Flakiness Index metric calculation'],
          },
          {
            question: 'How do you test API idempotency?',
            answer: 'We send duplicate requests with the same Idempotency-Key and verify database count is 1.',
            feedback: 'Correct (90%): Excellent grasp of idempotency keys.',
            mistakesAndGaps: [],
          },
        ],
        questionList: [
          { question: 'How do you handle flaky tests?', category: 'Manual QA Processes' },
          { question: 'How do you test API idempotency?', category: 'API Testing & Automation' },
          {
            question: 'How do you configure storageState in Playwright?',
            category: 'Selenium & Playwright Automation',
            expectedFocus: 'storageState, global setup, multi-role auth',
            answerSummary: 'Authenticate once in setup project and reuse session storageState in feature tests.',
            bestPractice: 'Use API login in setup',
            pitfallToAvoid: 'Logging in before every test',
          },
        ],
      }),
      headers: { get: () => null },
    };

    const res = await POST(finalReq);
    const data = await res.json();

    assert.strictEqual(data.isFinished, true);
    assert(data.scorecard, 'Scorecard must be returned on final turn');
    assert(typeof data.scorecard.overallScore === 'number');
    assert(typeof data.scorecard.technicalScore === 'number');
    assert(typeof data.scorecard.architectureScore === 'number');
    assert(typeof data.scorecard.communicationScore === 'number');
    assert(Array.isArray(data.scorecard.strengths) && data.scorecard.strengths.length > 0);
    assert(Array.isArray(data.scorecard.areasForImprovement) && data.scorecard.areasForImprovement.length > 0);

    // Freemockinterview specific additions
    assert(data.scorecard.hiringRecommendation, 'Must provide hiringRecommendation');
    assert(['Strong Hire', 'Hire', 'Leaning Hire', 'Needs Practice'].includes(data.scorecard.hiringRecommendation));
    assert(Array.isArray(data.scorecard.actionableDrills) && data.scorecard.actionableDrills.length > 0);
    assert(Array.isArray(data.scorecard.questionBreakdown) && data.scorecard.questionBreakdown.length === 3);
  });
});
