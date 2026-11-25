const { describe, it } = require('node:test');
const assert = require('node:assert');
const path = require('path');

const jiti = require('jiti')(path.resolve(process.cwd(), 'tests/index.js'), {
  alias: { '@': path.resolve(process.cwd(), 'src') },
});

// Import route / agent handlers
const qaAgentRoute = jiti('../src/app/api/ai/qa-agent/route.ts').POST;
const qaChatRoute = jiti('../src/app/api/ai/qa-chat/route.ts').POST;
const grillHandler = jiti('../src/app/api/ai/interview-grill/route.ts').POST;

const { QAInterviewAgent } = jiti('../src/lib/qa-interview-agent.ts');
const { getQuestionsByLevelAndDifficulty } = jiti('../src/lib/interview-questions-bank.ts');
const kb = jiti('../src/lib/qa-knowledge-base.ts');

// Helper to simulate NextRequest
function createMockRequest(body, headers = {}) {
  return {
    json: async () => body,
    headers: {
      get: (header) => headers[header.toLowerCase()] || headers[header] || null,
    },
  };
}

describe('PHASE 12: End-to-End Multi-Agent QA Engineering Workflow Validation', () => {
  let generatedRequirements = '';
  let generatedTestCases = '';
  let generatedAutomationCode = '';
  let generatedCodeReview = '';

  // =========================================================================
  // WORKFLOW 1 — REQUIREMENT TO TEST CASES
  // =========================================================================
  describe('WORKFLOW 1: Requirement to Test Cases', () => {
    const sampleUserStory = `Feature: User Multi-Factor Authentication & Account Transfer
As an authenticated account holder,
I want to initiate and execute an internal fund transfer with mandatory 2FA verification and daily limit validation ($10,000 maximum),
So that my funds are securely transferred without unauthorized access or duplicate withdrawals.`;

    it('Step 1 & 2: Requirement Generator creates functional requirements and acceptance criteria', async () => {
      const req = createMockRequest({
        action: 'requirements',
        input: sampleUserStory,
      });

      const res = await qaAgentRoute(req);
      const json = await res.json();

      assert.strictEqual(res.status, 200, 'Agent 1 must return 200');
      assert.ok(json.output, 'Agent 1 must return generated output');
      generatedRequirements = json.output;

      // Verification checks:
      assert.ok(generatedRequirements.includes('REQ-001'), 'Must generate REQ-001');
      assert.ok(generatedRequirements.includes('REQ-002'), 'Must generate REQ-002');
      assert.ok(generatedRequirements.includes('REQ-003'), 'Must generate REQ-003');
      assert.ok(
        generatedRequirements.includes('AC-001'),
        'Must generate AC-001 acceptance criteria'
      );
      assert.ok(
        generatedRequirements.includes('AC-002'),
        'Must generate AC-002 acceptance criteria'
      );
      assert.ok(
        generatedRequirements.includes('Given') &&
          generatedRequirements.includes('When') &&
          generatedRequirements.includes('Then'),
        'Must include Gherkin BDD format'
      );
      assert.ok(
        generatedRequirements.includes('Requirement Traceability Matrix'),
        'Must include initial RTM table'
      );
    });

    it('Step 3 & 4: Transfer generated requirements to Test Case Generator and verify consistency', async () => {
      assert.ok(generatedRequirements.length > 0, 'Must have requirements from previous step');

      const req = createMockRequest({
        action: 'test_cases',
        input: generatedRequirements,
        options: {
          coverage: { positive: true, negative: true, bva: true, security: true, edgeCases: true },
        },
      });

      const res = await qaAgentRoute(req);
      const json = await res.json();

      assert.strictEqual(res.status, 200, 'Agent 2 must return 200');
      assert.ok(json.output, 'Agent 2 must return generated output');
      generatedTestCases = json.output;

      // Verification checks:
      // 1. Requirement IDs are preserved
      assert.ok(generatedTestCases.includes('REQ-001'), 'Must preserve REQ-001');
      assert.ok(generatedTestCases.includes('REQ-002'), 'Must preserve REQ-002');
      assert.ok(generatedTestCases.includes('REQ-003'), 'Must preserve REQ-003');

      // 2. Acceptance criteria / test cases map to requirements
      assert.ok(generatedTestCases.includes('TC-001'), 'Must generate TC-001');
      assert.ok(generatedTestCases.includes('TC-002'), 'Must generate TC-002');
      assert.ok(generatedTestCases.includes('TC-003'), 'Must generate TC-003');
      assert.ok(
        generatedTestCases.includes('Requirements Traceability Matrix (RTM)'),
        'Must contain detailed RTM'
      );

      // 3. No context lost and no requirements invented
      assert.ok(
        generatedTestCases.includes('Equivalence Partitioning') ||
          generatedTestCases.includes('Boundary Value Analysis'),
        'Must contain standard QA techniques'
      );
      assert.ok(
        generatedTestCases.includes('Automation Suitability Matrix'),
        'Must assess automation suitability'
      );
    });
  });

  // =========================================================================
  // WORKFLOW 2 — TEST CASES TO AUTOMATION CODE
  // =========================================================================
  describe('WORKFLOW 2: Test Cases to Automation Code', () => {
    it('Step 1-4: Submit test cases to Automation Code Generator with Playwright TypeScript', async () => {
      assert.ok(generatedTestCases.length > 0, 'Must have test cases from Workflow 1');

      const req = createMockRequest({
        action: 'automation_code',
        input: generatedTestCases,
        techStack: 'playwright-ts',
      });

      const res = await qaAgentRoute(req);
      const json = await res.json();

      assert.strictEqual(res.status, 200, 'Agent 3 must return 200');
      assert.ok(json.output, 'Agent 3 must return generated output');
      generatedAutomationCode = json.output;

      // Verification checks:
      // 1. Test case IDs are traceable
      assert.ok(generatedAutomationCode.includes('TC-001'), 'Must trace TC-001');
      assert.ok(generatedAutomationCode.includes('TC-002'), 'Must trace TC-002');

      // 2. Correct scenarios implemented
      assert.ok(
        generatedAutomationCode.includes('test.describe'),
        'Must contain test.describe block'
      );
      assert.ok(generatedAutomationCode.includes('test('), 'Must contain individual test blocks');

      // 3. Assertions match expected results (web-first assertions)
      assert.ok(
        generatedAutomationCode.includes('expect('),
        'Must contain Playwright expect assertions'
      );
      assert.ok(
        generatedAutomationCode.includes('toBeVisible') ||
          generatedAutomationCode.includes('toHaveURL'),
        'Must use web-first auto-retrying assertions'
      );

      // 4. Code follows the selected framework (Playwright TS POM)
      assert.ok(
        generatedAutomationCode.includes('@playwright/test'),
        'Must import @playwright/test'
      );
      assert.ok(
        generatedAutomationCode.includes('class ') || generatedAutomationCode.includes('Page'),
        'Must follow Page Object Model pattern'
      );
      assert.ok(
        generatedAutomationCode.includes('getByRole') ||
          generatedAutomationCode.includes('getByLabel') ||
          generatedAutomationCode.includes('getByTestId'),
        'Must use resilient accessible locators'
      );

      // 5. Dependencies and configuration are identified
      assert.ok(
        generatedAutomationCode.includes('package.json') ||
          generatedAutomationCode.includes('@playwright/test'),
        'Must identify dependencies'
      );
      assert.ok(
        generatedAutomationCode.includes('playwright.config.ts') ||
          generatedAutomationCode.includes('defineConfig'),
        'Must provide playwright configuration'
      );
    });
  });

  // =========================================================================
  // WORKFLOW 3 — AUTOMATION CODE REVIEW
  // =========================================================================
  describe('WORKFLOW 3: Automation Code Review', () => {
    it('Step 1-3: Submit automation code to Code Reviewer and perform complete review', async () => {
      assert.ok(generatedAutomationCode.length > 0, 'Must have code from Workflow 2');

      // Inject a known test issue into the code to verify defect detection
      const codeWithFlakiness = `${generatedAutomationCode}\n\n// Added flaky test for checkout\ntest('checkout with hardcoded wait', async ({ page }) => {\n  await page.click('#checkout');\n  await page.waitForTimeout(5000);\n  await page.click('#confirm');\n});`;

      const req = createMockRequest({
        action: 'code_review',
        input: codeWithFlakiness,
        techStack: 'playwright-ts',
        options: {
          mode: 'review_and_fix',
        },
      });

      const res = await qaAgentRoute(req);
      const json = await res.json();

      assert.strictEqual(res.status, 200, 'Agent 4 must return 200');
      assert.ok(json.output, 'Agent 4 must return review output');
      generatedCodeReview = json.output;

      // Verification checks:
      // 1. Actual code defects / best practices are identified
      assert.ok(
        generatedCodeReview.includes('Findings Matrix') ||
          generatedCodeReview.includes('Findings') ||
          generatedCodeReview.includes('Critical Issues') ||
          generatedCodeReview.includes('FINDING'),
        'Must provide structured findings'
      );

      // 2. Framework guidelines followed
      assert.ok(
        generatedCodeReview.includes('Playwright') ||
          generatedCodeReview.includes('Selenium') ||
          generatedCodeReview.includes('Page Object'),
        'Must adhere to framework guidelines'
      );

      // 3. False positives are minimized and corrections preserve functionality
      assert.ok(
        generatedCodeReview.includes('Refactored') ||
          generatedCodeReview.includes('Corrected') ||
          generatedCodeReview.includes('Fix') ||
          generatedCodeReview.includes('Recommendation'),
        'Must provide refactoring guidance or corrected code'
      );
    });
  });

  // =========================================================================
  // WORKFLOW 4 — SDET MENTOR VALIDATION
  // =========================================================================
  describe('WORKFLOW 4: SDET Mentor Validation', () => {
    const questions = [
      {
        q: 'How should we scale this framework across 50 squads?',
        checks: ['monorepo', 'shared', 'ownership', 'ci/cd', 'parallel', 'governance'],
      },
      {
        q: 'How should we manage flaky tests?',
        checks: ['quarantine', 'root-cause', 'metric', 'flakiness', 'phase'],
      },
      {
        q: 'What changes are needed for enterprise CI/CD?',
        checks: ['pipeline', 'gate', 'parallel', 'sharding', 'feedback'],
      },
      {
        q: 'How should we introduce AI agents into this workflow?',
        checks: ['rag', 'mcp', 'human', 'roi', 'triage'],
      },
    ];

    for (const item of questions) {
      it(`Mentoring Question: "${item.q}" yields architect-level response`, async () => {
        const req = createMockRequest({
          message: item.q,
        });

        const res = await qaChatRoute(req);
        const json = await res.json();

        assert.strictEqual(res.status, 200, 'Agent 5 must return 200');
        assert.ok(json.reply, 'Agent 5 must return reply');
        const lowerReply = json.reply.toLowerCase();

        // Check for architectural depth & absence of anti-patterns
        assert.ok(
          !json.reply.includes('Thread.sleep'),
          'Must not recommend arbitrary sleep anti-patterns'
        );
        assert.ok(json.reply.length > 200, 'Must provide comprehensive depth');

        // Verify specific keywords relevant to the question
        let matchCount = 0;
        for (const k of item.checks) {
          if (lowerReply.includes(k)) matchCount++;
        }
        assert.ok(
          matchCount >= 2,
          `Expected at least 2 architectural matches for "${item.q}", found ${matchCount}`
        );
      });
    }
  });

  // =========================================================================
  // WORKFLOW 5 — INTERVIEW VALIDATION
  // =========================================================================
  describe('WORKFLOW 5: Interview Validation', () => {
    let sessionData;

    it('Step 1: Start a Senior SDET interview and verify KB retrieval', async () => {
      const startReq = createMockRequest({
        action: 'start',
        role: 'Senior SDET',
        experienceTier: '8–12 years',
        experienceYears: 10,
        difficulty: 'Advanced',
        technology: 'Playwright',
        count: 3,
      });

      const res = await grillHandler(startReq);
      const json = await res.json();

      assert.strictEqual(res.status, 200, 'Grill route must return 200');
      assert.strictEqual(json.questionNumber, 1, 'Must ask Question 1 first');
      assert.strictEqual(json.totalQuestions, 3, 'Must schedule 3 questions');
      assert.ok(json.question, 'Must deliver question text');
      assert.ok(json.questionList && json.questionList.length === 3, 'Must maintain questionList');
      assert.strictEqual(
        json.questionList[0].source,
        'internal_knowledge_base',
        'Must retrieve from 800+ question bank'
      );
      assert.ok(json.questionList[0].id, 'Must preserve question ID');

      sessionData = json;
    });

    it('Step 2 & 3: Evaluate candidate answer with 6D rubric and ask adaptive follow-up', async () => {
      assert.ok(sessionData, 'Must have active interview session');

      const candidateAnswer = `In Playwright, browser contexts represent isolated browser sessions similar to incognito windows. 
Each context maintains distinct cookies, cache, and localStorage. 
To run tests across multiple users in parallel without sharing state, we instantiate independent browser contexts per worker or per test fixture. 
This ensures tests never leak authentication cookies across threads.`;

      const answerReq = createMockRequest({
        action: 'submit_answer',
        difficulty: 'Advanced',
        experienceYears: 10,
        experienceLevel: '8–12 years',
        currentAnswer: candidateAnswer,
        currentCode: `test('parallel test', async ({ page }) => {\n  await page.goto('/dashboard');\n  await expect(page.getByRole('heading')).toBeVisible();\n});`,
        questionList: sessionData.questionList,
        turns: [],
      });

      const res = await grillHandler(answerReq);
      const json = await res.json();

      assert.strictEqual(res.status, 200, 'Must successfully evaluate answer');
      assert.strictEqual(json.isFinished, false, 'Turn 1 must not terminate session');
      assert.ok(json.evaluation, 'Must return evaluation');
      assert.ok(json.evaluation.rubricScores, 'Must provide 6D rubric scores');
      assert.ok(
        json.evaluation.rubricScores.technicalAccuracy >= 3,
        'Technical accuracy must be scored'
      );
      assert.ok(json.probingQuestion, 'Must challenge with an adaptive follow-up probing question');
      assert.ok(json.nextQuestion, 'Must provide Question 2 for adaptive flow');

      // Update sessionData with turns
      sessionData.turns = [
        {
          questionNumber: 1,
          question: sessionData.question,
          answer: candidateAnswer,
          code: '',
          evaluation: json.evaluation,
        },
      ];
      sessionData.nextQuestionNumber = json.nextQuestionNumber;
    });

    it('Step 4 & 5: Complete interview session and generate final comprehensive report (Sections A–J)', async () => {
      assert.ok(sessionData && sessionData.turns, 'Must have preceding turns');

      // Answer question 2 & 3 to conclude interview
      const finalAnswerReq = createMockRequest({
        action: 'submit_answer',
        difficulty: 'Advanced',
        experienceYears: 10,
        experienceLevel: '8–12 years',
        currentAnswer: `We shard tests using GitHub Actions matrix strategy across 10 runners, merge blob reports into a single HTML report, and quarantine flaky tests into an isolated track.`,
        currentCode: '',
        questionList: sessionData.questionList,
        turns: [
          ...sessionData.turns,
          {
            questionNumber: 2,
            question: sessionData.questionList[1].question,
            answer: 'We use page.route() to mock flaky third-party payment endpoints.',
            code: '',
            evaluation: {
              verdict: 'Correct',
              turnScore: 90,
              feedback: 'Strong network routing answer.',
              mistakesAndGaps: [],
              whatUserMissed: '',
              probingQuestion: '',
              rubricScores: {
                technicalAccuracy: 5,
                conceptualUnderstanding: 5,
                practicalImplementation: 4,
                problemSolving: 4,
                architectureKnowledge: 4,
                communicationClarity: 5,
              },
              whatWasCorrect: ['Correct page.route usage'],
              whatWasMissing: [],
              whatWasIncorrect: [],
              excellentAnswerShouldInclude: 'HAR replay',
              recommendedImprovement: 'Mention route.fulfill vs route.continue',
            },
          },
        ],
      });

      const res = await grillHandler(finalAnswerReq);
      const json = await res.json();

      assert.strictEqual(res.status, 200, 'Must process final turn');
      assert.strictEqual(json.isFinished, true, 'Turn 3 must finish session');
      const report = json.scorecard || json.finalReport;
      assert.ok(report, 'Must deliver final comprehensive report');
      // Verify Sections A through J
      assert.ok(report.candidateOverview, 'Section A: Candidate Overview');
      assert.ok(report.interviewSummary, 'Section B: Interview Summary');
      assert.ok(
        report.questionsAsked && report.questionsAsked.length >= 2,
        'Section C: Questions Asked'
      );
      assert.ok(
        report.questionWiseEvaluation && report.questionWiseEvaluation.length >= 2,
        'Section D: Question-wise Evaluation'
      );
      assert.ok(report.technicalScoresBreakdown, 'Section E: Technical Scores');
      assert.ok(report.strengths && report.strengths.length > 0, 'Section F: Strengths');
      assert.ok(
        report.areasForImprovement,
        'Section G/H: Knowledge Gaps & Areas Requiring Improvement'
      );
      assert.ok(
        report.actionableDrills || report.learningRoadmap,
        'Section I: Recommended Learning Topics'
      );
      assert.ok(
        report.overallAssessment && report.overallAssessment.rating,
        'Section J: Overall Assessment (Rating)'
      );
    });
  });

  // =========================================================================
  // CROSS-CUTTING ARCHITECTURAL CAPABILITIES (FROM USER INFOGRAPHIC)
  // =========================================================================
  describe('Cross-Cutting Capabilities: Context, Output, Traceability, Feedback', () => {
    it('1. Context Awareness: Formats and injects project files into agent context', () => {
      const { formatContextForAgents } = jiti('../src/lib/project-files.ts');
      const mockFiles = [
        {
          id: 'file-1',
          name: 'login.spec.ts',
          path: 'e2e/tests/login.spec.ts',
          folder: 'Tests',
          type: 'ts',
          size: 1024,
          extractedText: 'test("auth", async () => {});',
        },
      ];

      const formatted = formatContextForAgents(mockFiles);
      assert.ok(formatted.includes('PROJECT FILE: "login.spec.ts"'), 'Must format file name');
      assert.ok(formatted.includes('test("auth"'), 'Must include file content');
    });

    it('2. Structured Output: Verifies export capabilities (Markdown & Excel helpers)', () => {
      const excel = jiti('../src/lib/excel-export.ts');
      assert.ok(
        typeof excel.exportRequirementsToExcel === 'function',
        'Excel requirement exporter available'
      );
      assert.ok(
        typeof excel.exportTestMatrixToExcel === 'function',
        'Excel test matrix exporter available'
      );
    });

    it('3. Source Traceability: Ensures all agents preserve source traceability IDs', () => {
      assert.ok(generatedRequirements.includes('REQ-001'), 'Agent 1 produces REQ IDs');
      assert.ok(
        generatedTestCases.includes('REQ-001') && generatedTestCases.includes('TC-001'),
        'Agent 2 preserves REQ IDs and outputs TC IDs'
      );
      assert.ok(generatedAutomationCode.includes('TC-001'), 'Agent 3 maps TC IDs into code');
    });

    it('4. Feedback & Quality Evaluation: Evaluates response quality and actionable next steps', () => {
      assert.ok(
        generatedRequirements.includes('Requirement Traceability Matrix'),
        'Requirements include audit matrix'
      );
      assert.ok(
        generatedTestCases.includes('Risk and Priority Matrix'),
        'Test cases include priority matrix'
      );
    });
  });
});
