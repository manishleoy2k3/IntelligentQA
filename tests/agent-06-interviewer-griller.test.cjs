const { describe, it } = require('node:test');
const assert = require('node:assert');
const path = require('path');

const jiti = require('jiti')(path.resolve(process.cwd(), 'tests/index.js'), {
  alias: { '@': path.resolve(process.cwd(), 'src') },
});

const {
  INTERVIEW_KNOWLEDGE_BASE,
  getAllInterviewQuestions,
  getQuestionsByLevelAndDifficulty,
  mapYearsToExperienceTier,
  normalizeDifficulty,
  normalizeExperienceRange,
} = jiti('../src/lib/interview-questions-bank.ts');

const {
  QAInterviewAgent,
  isIgnoranceOrNonAnswer,
} = jiti('../src/lib/qa-interview-agent.ts');

const {
  QAInterviewResearcher,
} = jiti('../src/lib/qa-interview-researcher.ts');

const grillHandler = jiti('../src/app/api/ai/interview-grill/route.ts').POST;

describe('AGENT 06 — AI Interviewer Griller Intelligence Audit & Verification Suite', () => {

  // =========================================================================
  // TEST 1: Playwright interview for candidate with 5–8 years exp at Advanced level
  // =========================================================================
  it('TEST 1: Start a Playwright interview for 5–8 years experience at Advanced level', async () => {
    // 1. Verify relevant question selection
    const questions = getQuestionsByLevelAndDifficulty({
      technology: 'Playwright',
      experienceTier: '5–8 years',
      experienceYears: 6,
      difficulty: 'Advanced',
      count: 3,
    });

    assert.strictEqual(questions.length, 3, 'Should return exactly 3 questions');
    for (const q of questions) {
      assert.strictEqual(q.source, 'internal_knowledge_base', 'Must be sourced from internal knowledge base');
      assert.ok(q.id, 'Must preserve question ID');
      const isPlaywright = (q.technology && q.technology.toLowerCase().includes('playwright')) ||
                           q.question.toLowerCase().includes('playwright') ||
                           (q.category && q.category.toLowerCase().includes('playwright'));
      assert.ok(isPlaywright, `Question ${q.id} must be Playwright-focused: ${q.question}`);
      assert.ok(q.difficulty === 'Hard' || q.difficulty === 'Architect' || q.difficulty === 'Medium', 'Should be calibrated for Advanced/Hard');
    }

    // 2. Verify start action returns Question 1 one-at-a-time
    const req = {
      json: async () => ({
        action: 'start',
        technology: 'Playwright',
        experienceTier: '5–8 years',
        experienceYears: 6,
        difficulty: 'Advanced',
        count: 3,
      }),
      headers: { get: () => null },
    };
    const res = await grillHandler(req);
    const body = await res.json();
    assert.strictEqual(body.questionNumber, 1, 'Must ask Question 1 first');
    assert.strictEqual(body.totalQuestions, 3, 'Total questions must be 3');
    assert.ok(body.question, 'Must deliver question text');
    assert.ok(body.questionList.length === 3, 'Question list must hold 3 turns');

    // 3. Verify detailed evaluation with 6D rubric and adaptive follow-up
    const answerReq = {
      json: async () => ({
        action: 'submit_answer',
        difficulty: 'Advanced',
        experienceYears: 6,
        experienceLevel: '5–8 years',
        currentAnswer: 'In Playwright, we isolate browser contexts per worker, encapsulate locators as private/readonly properties in Page Objects, expose user-centric action methods that return new page objects upon navigation, and strictly keep assertions in test specifications. We use storageState for authenticated sessions and page.route() for network mocking.',
        currentCode: `test('parallel test', async ({ page }) => {\n  await page.goto('/dashboard');\n  await expect(page.getByRole('heading')).toBeVisible();\n});`,
        questionList: body.questionList,
        turns: [],
      }),
      headers: { get: () => null },
    };
    const evalRes = await grillHandler(answerReq);
    const evalBody = await evalRes.json();
    assert.strictEqual(evalBody.isFinished, false, 'Turn 1 should not finish session');
    assert.ok(evalBody.evaluation, 'Must return detailed evaluation');
    assert.ok(evalBody.evaluation.rubricScores, 'Must include 6D rubric scores');
    assert.ok(evalBody.evaluation.rubricScores.technicalAccuracy >= 4, 'Should score high on accuracy');
    assert.ok(evalBody.probingQuestion, 'Must challenge with an adaptive follow-up probing question');
    assert.ok(evalBody.nextQuestion, 'Must provide Question 2 for adaptive flow');
  });

  // =========================================================================
  // TEST 2: Selenium Java interview for candidate with 2–5 years of experience
  // =========================================================================
  it('TEST 2: Start a Selenium Java interview for 2–5 years experience', async () => {
    const questions = getQuestionsByLevelAndDifficulty({
      technology: 'Selenium',
      skills: ['Selenium', 'Java'],
      experienceTier: '2–5 years',
      experienceYears: 3,
      difficulty: 'Intermediate',
      count: 3,
    });

    assert.strictEqual(questions.length, 3, 'Should return 3 questions');
    for (const q of questions) {
      assert.ok(q.id, 'Must preserve question ID');
      const hasSeleniumOrJava = (q.technology && (q.technology.includes('Selenium') || q.technology.includes('Java'))) ||
                                q.question.toLowerCase().includes('selenium') ||
                                q.question.toLowerCase().includes('webdriver') ||
                                q.question.toLowerCase().includes('java') ||
                                (q.category && q.category.includes('Selenium'));
      assert.ok(hasSeleniumOrJava, `Question ${q.id} must focus on Selenium or Java fundamentals`);
      assert.ok(q.answerSummary && q.answerSummary.length > 30, 'Must have stored answer explanation');
      assert.ok(q.codeSnippet !== undefined, 'Must support code snippet context');
    }
  });

  // =========================================================================
  // TEST 3: Test Architect interview for 15+ years of experience
  // =========================================================================
  it('TEST 3: Start a Test Architect interview for 15+ years of experience', async () => {
    const questions = getQuestionsByLevelAndDifficulty({
      role: 'Test Architect',
      difficulty: 'Architect',
      experienceTier: '15+ years',
      experienceYears: 16,
      count: 3,
    });

    assert.strictEqual(questions.length, 3, 'Should sample 3 architect scenarios');
    for (const q of questions) {
      assert.ok(q.difficulty === 'Architect' || q.difficulty === 'Hard', 'Must target Architect or Hard difficulty');
      assert.ok(q.minYears >= 6, `Architect question ${q.id} must require senior/lead years`);
      const isArchDomain = q.difficulty === 'Architect' ||
                           q.topic.toLowerCase().includes('architect') ||
                           q.topic.toLowerCase().includes('enterprise') ||
                           q.topic.toLowerCase().includes('sharding') ||
                           q.topic.toLowerCase().includes('eval') ||
                           q.topic.toLowerCase().includes('benchmarking') ||
                           q.category.includes('CI/CD') ||
                           q.category.includes('Reporting') ||
                           q.category.includes('Selenium & Playwright Automation');
      assert.ok(isArchDomain, `Question ${q.id} must cover architecture, scalability, or governance`);
    }

    // Verify presence of canonical enterprise scenarios in knowledge base
    const all = getAllInterviewQuestions();
    const squad50 = all.find(q => q.id === 'arch-fw-1' || q.id === 'q-pw-065');
    assert.ok(squad50, 'Must have 50-squad monorepo architecture question');
    const flakyQuarantine = all.find(q => q.id === 'fmi-qa-flaky-01');
    assert.ok(flakyQuarantine, 'Must have flaky test quarantine program question');
    const distributedGrid = all.find(q => q.id === 'arch-sel-1');
    assert.ok(distributedGrid, 'Must have distributed autoscaling grid scenario');
  });

  // =========================================================================
  // TEST 4: Give an incomplete answer -> Identify missing concepts & follow-up
  // =========================================================================
  it('TEST 4: Give an incomplete answer, verify missing concepts identified & meaningful follow-up', async () => {
    // Vague/Incomplete answer to Playwright browser contexts
    const qMeta = {
      id: 'q-pw-003',
      question: 'How does Playwright handle browser contexts?',
      expectedFocus: 'Browser contexts provide isolated sessions, cookies, and local storage per test worker, enabling parallel multi-user testing without shared auth state.',
      answerSummary: 'Browser contexts operate as fast, lightweight incognito sessions instantiated in milliseconds. Multiple contexts run within a single browser instance, each with isolated cookie jars and cache.',
      bestPractice: 'Use browser.newContext({ storageState }) for isolated multi-user auth.',
      pitfallToAvoid: 'Launching fresh browser instances per test or sharing global cookie state.',
    };

    const req = {
      json: async () => ({
        action: 'submit_answer',
        difficulty: 'Advanced',
        experienceYears: 6,
        currentAnswer: 'Browser contexts provide separate sessions.',
        currentCode: '',
        questionList: [qMeta, { question: 'Question 2', expectedFocus: 'Next topic' }],
        turns: [],
      }),
      headers: { get: () => null },
    };

    const res = await grillHandler(req);
    const body = await res.json();

    assert.strictEqual(body.evaluation.verdict, 'Partially Correct', 'Vague answer must be judged Partially Correct');
    assert.ok(body.evaluation.probingQuestion.includes('How would you use browser contexts to run multiple users in parallel without sharing authentication state?'),
      'Must challenge candidate with targeted follow-up on parallel multi-user isolation');
    assert.ok(body.evaluation.whatWasMissing.length > 0, 'Must identify explicit missing concepts');
    assert.ok(body.evaluation.whatWasCorrect.some(c => c.toLowerCase().includes('separate')),
      'Must identify what was correct');
  });

  // =========================================================================
  // TEST 5: Give an incorrect technical answer -> Identify incorrect info & adjust
  // =========================================================================
  it('TEST 5: Give an incorrect technical answer, verify error identified & correct concept explained', async () => {
    const qMeta = {
      id: 'q-sel-wait-1',
      question: 'How do you handle dynamic AJAX element loading in Selenium WebDriver?',
      expectedFocus: 'WebDriverWait explicit waits with ExpectedConditions, polling mechanism, avoiding Thread.sleep.',
      answerSummary: 'Use WebDriverWait with ExpectedConditions.elementToBeClickable() to poll the DOM event loop. Never use Thread.sleep.',
      bestPractice: 'Use explicit waits with customized polling intervals.',
      pitfallToAvoid: 'Using hardcoded Thread.sleep() delays.',
    };

    const req = {
      json: async () => ({
        action: 'submit_answer',
        difficulty: 'Medium',
        experienceYears: 3,
        currentAnswer: 'I just put Thread.sleep(5000) before clicking the button so it waits 5 seconds.',
        currentCode: 'Thread.sleep(5000); driver.findElement(By.id("submit")).click();',
        questionList: [qMeta, { question: 'Explain locator strategies in Selenium', expectedFocus: 'Locators' }],
        turns: [],
      }),
      headers: { get: () => null },
    };

    const res = await grillHandler(req);
    const body = await res.json();

    assert.strictEqual(body.evaluation.verdict, 'Incorrect', 'Static sleep must be judged Incorrect');
    assert.ok(body.evaluation.turnScore <= 35, 'Must penalize anti-pattern with low turn score');
    assert.ok(body.evaluation.whatWasIncorrect.some(inc => inc.toLowerCase().includes('sleep')),
      'Must explicitly flag Thread.sleep as incorrect anti-pattern');
    assert.ok(body.evaluation.whatUserMissed.toLowerCase().includes('wait'),
      'Must explain the correct concept (explicit/event-driven wait)');
    assert.ok(body.evaluation.rubricScores.technicalAccuracy <= 2, 'Technical accuracy rubric must be low');
  });

  // =========================================================================
  // TEST 6: Ask for an interview using only our internal 800+ questions
  // =========================================================================
  it('TEST 6: Ask for an interview using only internal 800+ questions, verify IDs & attribution', async () => {
    const req = {
      json: async () => ({
        action: 'start',
        sourcePreference: 'internal_knowledge_base',
        technology: 'Playwright',
        difficulty: 'Advanced',
        experienceYears: 7,
        count: 5,
      }),
      headers: { get: () => null },
    };

    const res = await grillHandler(req);
    const body = await res.json();

    assert.strictEqual(body.questionList.length, 5, 'Must return 5 internal questions');
    for (const q of body.questionList) {
      assert.strictEqual(q.source, 'internal_knowledge_base', 'Must have internal_knowledge_base source tag');
      assert.ok(q.id, 'Must preserve authentic question ID');
      // Ensure the ID exists in the original 800-question database
      const foundInKB = INTERVIEW_KNOWLEDGE_BASE.some(kbQ => kbQ.id === q.id);
      assert.ok(foundInKB, `Question ID "${q.id}" must exist in the authentic 800+ question bank`);
    }
  });

  // =========================================================================
  // TEST 7: Enable internet-researched questions -> Distinguish source & no fabrication
  // =========================================================================
  it('TEST 7: Enable internet-researched questions, verify transparent status & attribution', async () => {
    const researchResult = await QAInterviewResearcher.researchQuestion({
      technology: 'Playwright',
      difficulty: 'Architect',
      enableWebSearch: true,
    });

    assert.ok(researchResult.source, 'Must have a source attribute');
    if (QAInterviewResearcher.isWebSearchAvailable()) {
      assert.strictEqual(researchResult.source, 'external_research');
      assert.ok(researchResult.sourceCitation, 'Must provide source citation');
    } else {
      // In sandbox/offline environment without live search keys:
      assert.strictEqual(researchResult.isWebSearchActive, false, 'Must report web search is not active');
      assert.ok(researchResult.notes.includes('offline') || researchResult.notes.includes('unconfigured'),
        'Must transparently explain search status without fabricating citations');
      assert.ok(researchResult.source === 'ai_generated' || researchResult.source === 'internal_knowledge_base',
        'Must distinguish internal or AI source without pretending to be scraped web data');
    }
  });

  // =========================================================================
  // TEST 8: Session Lifecycle Controls (Pause, Resume, Repeat, Skip, End)
  // =========================================================================
  it('TEST 8: Support Pause, Resume, Repeat, Skip, and End interview actions', async () => {
    // 1. Pause
    const pauseRes = await grillHandler({
      json: async () => ({ action: 'pause', turns: [{ question: 'Q1', answer: 'A1' }] }),
      headers: { get: () => null },
    });
    const pauseBody = await pauseRes.json();
    assert.strictEqual(pauseBody.status, 'paused');

    // 2. Resume
    const resumeRes = await grillHandler({
      json: async () => ({
        action: 'resume',
        turns: [{ question: 'Q1', answer: 'A1' }],
        questionList: [{ question: 'Q1' }, { question: 'Q2: How do you mock APIs in Playwright?' }],
      }),
      headers: { get: () => null },
    });
    const resumeBody = await resumeRes.json();
    assert.strictEqual(resumeBody.status, 'active');

    // 3. Repeat
    const repeatRes = await grillHandler({
      json: async () => ({
        action: 'repeat',
        turns: [{ question: 'Q1', answer: 'A1' }],
        questionList: [{ question: 'Q1' }, { question: 'Q2: What is storageState?' }],
      }),
      headers: { get: () => null },
    });
    const repeatBody = await repeatRes.json();
    assert.ok(repeatBody.clarification.includes('storageState'));

    // 4. Skip
    const skipRes = await grillHandler({
      json: async () => ({
        action: 'skip',
        turns: [],
        questionList: [{ question: 'Q1' }, { question: 'Q2' }, { question: 'Q3' }],
      }),
      headers: { get: () => null },
    });
    const skipBody = await skipRes.json();
    assert.strictEqual(skipBody.skipped, true);
    assert.strictEqual(skipBody.evaluation.turnScore, 0);

    // 5. End early
    const endRes = await grillHandler({
      json: async () => ({
        action: 'end',
        turns: [{ question: 'Q1', answer: 'Solid Page Object Model answer', score: 85 }],
        questionList: [{ question: 'Q1' }, { question: 'Q2' }, { question: 'Q3' }],
      }),
      headers: { get: () => null },
    });
    const endBody = await endRes.json();
    assert.strictEqual(endBody.isFinished, true);
    assert.ok(endBody.scorecard, 'Must generate scorecard upon early ending');
    assert.ok(endBody.scorecard.overallAssessment, 'Scorecard must include Section J Overall Assessment');
    assert.ok(endBody.scorecard.overallAssessment.disclaimer.includes('Simulated interview assessment'),
      'Must include simulation disclaimer');
  });

  // =========================================================================
  // TEST 9: Comprehensive End-of-Interview Report (Sections A through J)
  // =========================================================================
  it('TEST 9: Generate comprehensive end-of-interview report containing Sections A through J', async () => {
    const report = await QAInterviewAgent.generateComprehensiveReport({
      turns: [
        {
          question: 'How do you design a scalable mono-repo test architecture?',
          answer: 'We use Nx monorepo with shared packages and matrix sharding.',
          feedback: 'Correct (88%): Strong architecture.',
          score: 88,
          rubricScores: {
            technicalAccuracy: 5,
            conceptualUnderstanding: 5,
            practicalImplementation: 4,
            problemSolving: 4,
            architectureKnowledge: 5,
            communicationClarity: 4,
          },
        },
      ],
      finalEvaluation: {
        verdict: 'Correct',
        turnScore: 85,
        feedback: 'Solid implementation of Page Object Model with web-first assertions.',
        mistakesAndGaps: [],
        whatUserMissed: '',
        probingQuestion: '',
        idealAnswer: 'Gold standard answer',
        rubricScores: {
          technicalAccuracy: 4,
          conceptualUnderstanding: 4,
          practicalImplementation: 5,
          problemSolving: 4,
          architectureKnowledge: 4,
          communicationClarity: 4,
        },
      },
      questionList: [
        { question: 'Q1', category: 'Selenium & Playwright Automation', source: 'internal_knowledge_base' },
        { question: 'Q2', category: 'API Testing & Automation', source: 'internal_knowledge_base' },
      ],
      candidateProfile: {
        role: 'Senior Automation Engineer',
        experienceLevel: '5–8 years',
        difficulty: 'Advanced',
        skills: ['Playwright', 'TypeScript', 'REST Assured'],
      },
    });

    // Section A: Candidate Overview
    assert.ok(report.candidateOverview, 'Must include Section A: Candidate Overview');
    assert.strictEqual(report.candidateOverview.role, 'Senior Automation Engineer');
    assert.strictEqual(report.candidateOverview.experienceLevel, '5–8 years');

    // Section B: Interview Summary
    assert.ok(report.interviewSummary, 'Must include Section B: Interview Summary');

    // Section C: Questions Asked
    assert.ok(Array.isArray(report.questionsAsked) && report.questionsAsked.length === 2,
      'Must include Section C: Questions Asked with source attribution');
    assert.strictEqual(report.questionsAsked[0].source, 'internal_knowledge_base');

    // Section D: Question-wise Evaluation
    assert.ok(Array.isArray(report.questionWiseEvaluation) && report.questionWiseEvaluation.length === 2,
      'Must include Section D: Question-wise Evaluation');
    assert.ok(report.questionWiseEvaluation[0].rubricScores.technicalAccuracy >= 4);

    // Section E: Technical Scores
    assert.ok(report.technicalScoresBreakdown, 'Must include Section E: Technical Scores Breakdown');
    assert.ok(report.technicalScoresBreakdown.rubricAverages.technicalAccuracy > 0);

    // Section F: Strengths
    assert.ok(Array.isArray(report.strengths) && report.strengths.length > 0, 'Must include Section F: Strengths');

    // Section G: Knowledge Gaps
    assert.ok(Array.isArray(report.knowledgeGaps) || Array.isArray(report.areasForImprovement),
      'Must include Section G/H: Knowledge Gaps & Areas for Improvement');

    // Section I: Recommended Learning Topics
    assert.ok(Array.isArray(report.learningRoadmap) && report.learningRoadmap.length > 0,
      'Must include Section I: Recommended Learning Topics');

    // Section J: Overall Assessment
    assert.ok(report.overallAssessment, 'Must include Section J: Overall Assessment');
    assert.ok(['Strong Hire', 'Hire', 'Borderline', 'Needs Improvement'].includes(report.overallAssessment.rating),
      'Rating must be one of Strong Hire, Hire, Borderline, Needs Improvement');
    assert.ok(report.overallAssessment.reasoning.length > 20, 'Must provide evidence-based reasoning');
    assert.ok(report.overallAssessment.disclaimer.includes('Simulated interview assessment'),
      'Must state simulation disclaimer');
  });
});
