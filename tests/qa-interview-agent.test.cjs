const { describe, it } = require('node:test');
const assert = require('node:assert');
const path = require('path');

const jiti = require('jiti')(path.resolve(process.cwd(), 'tests/interview-griller.test.cjs'), {
  alias: { '@': path.resolve(process.cwd(), 'src') }
});

const {
  QAInterviewAgent,
  isIgnoranceOrNonAnswer,
} = jiti('../src/lib/qa-interview-agent.ts');

describe('Autonomous QA Interviewer AI Agent Suite', () => {
  it('should detect ignorance and non-answers accurately', () => {
    assert.strictEqual(isIgnoranceOrNonAnswer('', ''), true);
    assert.strictEqual(isIgnoranceOrNonAnswer('idk', ''), true);
    assert.strictEqual(isIgnoranceOrNonAnswer('I do not know', ''), true);
    assert.strictEqual(isIgnoranceOrNonAnswer('no idea at all', ''), true);
    assert.strictEqual(isIgnoranceOrNonAnswer('pass', ''), true);
    assert.strictEqual(isIgnoranceOrNonAnswer('skip', ''), true);
    assert.strictEqual(isIgnoranceOrNonAnswer('hi', ''), true);

    // Valid answers must NOT be flagged as ignorance
    assert.strictEqual(
      isIgnoranceOrNonAnswer('We use Page Object Model with web-first assertions and retry logic in CI.', ''),
      false
    );
    assert.strictEqual(
      isIgnoranceOrNonAnswer('', 'await expect(page.getByRole("button")).toBeVisible();'),
      false
    );
  });

  it('should generate initial session tailored to candidate experience level without predictable patterns', async () => {
    // 1. Junior (0-2 YOE)
    const juniorSession = await QAInterviewAgent.generateInitialSession({
      experienceYears: 1,
      experienceLevel: '0-2 Years',
      difficulty: 'Easy',
      track: 'Manual QA Processes',
      count: 3,
    });
    assert.strictEqual(juniorSession.questionNumber, 1);
    assert.strictEqual(juniorSession.totalQuestions, 3);
    assert(juniorSession.question && juniorSession.question.length > 20);
    assert.strictEqual(juniorSession.questionList.length, 3);

    // 2. Architect (10+ YOE)
    const archSession = await QAInterviewAgent.generateInitialSession({
      experienceYears: 14,
      experienceLevel: '10+ Years',
      difficulty: 'Hard',
      track: 'Selenium & Playwright Automation',
      count: 3,
    });
    assert.strictEqual(archSession.questionNumber, 1);
    assert.strictEqual(archSession.totalQuestions, 3);
    assert(archSession.question && archSession.question.length > 20);
    assert.strictEqual(archSession.questionList.length, 3);
  });

  it('should adaptively evolve the next question with correct sequential turn indexing', async () => {
    const fallbackQ = {
      question: 'How do you test microservice contracts using Pact?',
      category: 'API Testing & Automation',
      expectedFocus: 'Consumer contracts, provider verification, can-i-deploy CLI',
      answerSummary: 'Pact allows consumers to define contract JSON files for provider verification.',
      bestPractice: 'Run can-i-deploy in CI',
      pitfallToAvoid: 'Relying on end-to-end staging clusters',
    };

    const nextQ = await QAInterviewAgent.generateAdaptiveNextQuestion({
      turns: [
        {
          question: 'Explain POM and synchronization',
          answer: 'I use Page Object Model and web-first expect locators.',
          feedback: 'Correct (85%): Strong explanation.',
        },
      ],
      currentAnswer: 'I use Page Object Model and web-first expect locators.',
      currentCode: '',
      previousEvaluation: {
        verdict: 'Correct',
        turnScore: 85,
        feedback: 'Strong answer',
        mistakesAndGaps: [],
        whatUserMissed: '',
        probingQuestion: 'How do you handle microservices?',
      },
      nextIndex: 1, // Turn 1 just finished, next is Turn 2
      totalQuestions: 3,
      candidateProfile: {
        difficulty: 'Medium',
        experienceYears: 4,
        experienceLevel: '3-5 Years',
        track: 'Test Automation',
      },
      fallbackQuestion: fallbackQ,
    });

    assert.strictEqual(nextQ.questionNumber, 2);
    assert.strictEqual(nextQ.totalQuestions, 3);
    assert(nextQ.question && nextQ.question.length > 15);
    assert(nextQ.expectedFocus && nextQ.expectedFocus.length > 10);
  });

  it('should synthesize a deep comprehensive report with seniority calibration, actionable drills, and learning roadmap', async () => {
    const report = await QAInterviewAgent.generateComprehensiveReport({
      turns: [
        {
          question: 'How do you prevent flaky tests in CI?',
          answer: 'We quarantine flaky tests and avoid Thread.sleep with event-driven web-first assertions.',
          feedback: 'Correct (88%): Strong synchronization grasp.',
          mistakesAndGaps: [],
        },
        {
          question: 'How do you test REST API idempotency?',
          answer: 'We send duplicate requests with Idempotency-Key header and verify DB charges.',
          feedback: 'Correct (92%): Excellent grasp of idempotency.',
          mistakesAndGaps: [],
        },
      ],
      finalEvaluation: {
        verdict: 'Correct',
        turnScore: 85,
        feedback: 'Solid contract testing explanation.',
        mistakesAndGaps: ['Detail pact broker webhook trigger'],
        whatUserMissed: 'Pact broker webhook automated verification',
        probingQuestion: '',
      },
      questionList: [
        { question: 'How do you prevent flaky tests in CI?', category: 'Manual QA Processes' },
        { question: 'How do you test REST API idempotency?', category: 'API Testing & Automation' },
        { question: 'Explain Pact contract testing', category: 'API Testing & Automation' },
      ],
      candidateProfile: {
        difficulty: 'Hard',
        experienceYears: 6,
        experienceLevel: '6-9 Years',
        track: 'SDET',
      },
    });

    assert(typeof report.overallScore === 'number' && report.overallScore >= 80);
    assert(typeof report.technicalScore === 'number');
    assert(typeof report.architectureScore === 'number');
    assert(typeof report.communicationScore === 'number');

    assert(['Strong Hire', 'Hire'].includes(report.hiringRecommendation), `Expected Strong Hire or Hire, got ${report.hiringRecommendation}`);
    assert(report.seniorityCalibration && report.seniorityCalibration.length > 10);
    assert(Array.isArray(report.strengths) && report.strengths.length >= 2);
    assert(Array.isArray(report.areasForImprovement) && report.areasForImprovement.length >= 1);
    assert(Array.isArray(report.actionableDrills) && report.actionableDrills.length >= 2);
    assert(Array.isArray(report.learningRoadmap) && report.learningRoadmap.length >= 2);
    assert.strictEqual(report.questionBreakdown.length, 3);
  });
});
