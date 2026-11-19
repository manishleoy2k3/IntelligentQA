const { describe, it } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

// Load TypeScript modules via jiti with root context and alias
const jiti = require('jiti')(process.cwd() + '/tests/index.js', {
  alias: { '@': path.resolve(process.cwd(), 'src') }
});
const {
  INTERVIEW_KNOWLEDGE_BASE,
  getQuestionsByLevelAndDifficulty,
  mapYearsToExperienceTier,
  getAllInterviewQuestions,
} = jiti('../src/lib/interview-questions-bank.ts');

const { QADatabase } = jiti('../src/lib/qa-db.ts');

describe('QA Interview Griller - Knowledge Base & Agent Training Suite', () => {
  it('should contain comprehensive questions across all 8 mandatory QA engineering domains', () => {
    assert(INTERVIEW_KNOWLEDGE_BASE.length >= 20, `Knowledge base should have extensive items, found ${INTERVIEW_KNOWLEDGE_BASE.length}`);

    const categories = new Set(INTERVIEW_KNOWLEDGE_BASE.map(q => q.category));
    const requiredDomains = [
      'Manual QA Processes',
      'Coding & DSA',
      'Selenium & Playwright Automation',
      'Reporting',
      'CI/CD Pipelines',
      'API Testing & Automation',
      'Mobile Manual Testing (Android & iOS)',
      'Mobile Automation (Appium)',
    ];

    for (const domain of requiredDomains) {
      assert(categories.has(domain), `Missing required knowledge base domain: "${domain}"`);
      const itemsInDomain = INTERVIEW_KNOWLEDGE_BASE.filter(q => q.category === domain);
      assert(itemsInDomain.length >= 2, `Domain "${domain}" should have multiple questions, found ${itemsInDomain.length}`);
    }
  });

  it('should correctly tag every question with difficulty, experience level, best practices, and pitfalls to avoid', () => {
    const validDifficulties = new Set(['Easy', 'Medium', 'Hard', 'Architect', 'Senior', 'Mid', 'Junior']);
    const validTiers = new Set(['0-2 Years', '3-5 Years', '6-9 Years', '10+ Years']);

    for (const q of INTERVIEW_KNOWLEDGE_BASE) {
      assert(q.id, 'Every question must have a unique id');
      assert(validDifficulties.has(q.difficulty), `Question ${q.id} has invalid difficulty: ${q.difficulty}`);
      assert(validTiers.has(q.experienceLevel), `Question ${q.id} has invalid experience tier: ${q.experienceLevel}`);
      assert(typeof q.minYears === 'number' && typeof q.maxYears === 'number', `Question ${q.id} missing min/max years`);
      assert(q.question && q.question.trim().length > 20, `Question ${q.id} has insufficient question text`);
      assert(q.answerSummary && q.answerSummary.trim().length > 30, `Question ${q.id} has insufficient answer summary`);
      assert(q.bestPractice && q.bestPractice.trim().length > 10, `Question ${q.id} missing best practice`);
      assert(q.pitfallToAvoid && q.pitfallToAvoid.trim().length > 10, `Question ${q.id} missing pitfall to avoid`);
    }
  });

  it('should accurately map numerical experience years to standard experience tiers', () => {
    assert.strictEqual(mapYearsToExperienceTier(0), '0-2 Years');
    assert.strictEqual(mapYearsToExperienceTier(1), '0-2 Years');
    assert.strictEqual(mapYearsToExperienceTier(2), '0-2 Years');
    assert.strictEqual(mapYearsToExperienceTier(3), '3-5 Years');
    assert.strictEqual(mapYearsToExperienceTier(5), '3-5 Years');
    assert.strictEqual(mapYearsToExperienceTier(6), '6-9 Years');
    assert.strictEqual(mapYearsToExperienceTier(9), '6-9 Years');
    assert.strictEqual(mapYearsToExperienceTier(10), '10+ Years');
    assert.strictEqual(mapYearsToExperienceTier(15), '10+ Years');
    assert.strictEqual(mapYearsToExperienceTier(25), '10+ Years');
  });

  it('should sample questions matching difficulty and experience years without requiring a topic', () => {
    const easyJunior = getQuestionsByLevelAndDifficulty({
      difficulty: 'Easy',
      experienceYears: 1,
      count: 3,
    });

    assert.strictEqual(easyJunior.length, 3);
    for (const q of easyJunior) {
      assert.strictEqual(q.difficulty, 'Easy');
      assert.strictEqual(q.experienceLevel, '0-2 Years');
    }

    const hardArchitect = getQuestionsByLevelAndDifficulty({
      difficulty: 'Hard',
      experienceYears: 12,
      count: 3,
    });

    assert.strictEqual(hardArchitect.length, 3);
    for (const q of hardArchitect) {
      assert(q.difficulty === 'Hard' || q.difficulty === 'Architect');
    }
  });

  it('should guarantee complete, relevant questions for all 12 combinations of difficulty and experience level', () => {
    const tiers = ['0-2 Years', '3-5 Years', '6-9 Years', '10+ Years'];
    const difficulties = ['Easy', 'Medium', 'Hard'];

    for (const tier of tiers) {
      for (const diff of difficulties) {
        const sampled = getQuestionsByLevelAndDifficulty({
          difficulty: diff,
          experienceTier: tier,
          count: 3,
        });

        assert.strictEqual(sampled.length, 3, `Expected 3 questions for ${tier} + ${diff}, got ${sampled.length}`);

        for (const q of sampled) {
          assert(q.id, `Question missing ID for ${tier} + ${diff}`);
          assert(q.question && q.question.length > 25, `Question text incomplete for ${tier} + ${diff}`);
          assert(q.expectedFocus && q.expectedFocus.length > 15, `Expected focus missing for ${tier} + ${diff}`);
          assert(q.answerSummary && q.answerSummary.length > 25, `Answer summary missing for ${tier} + ${diff}`);
          assert(q.bestPractice && q.bestPractice.length > 10, `Best practice missing for ${tier} + ${diff}`);
          assert(q.pitfallToAvoid && q.pitfallToAvoid.length > 10, `Pitfall to avoid missing for ${tier} + ${diff}`);
        }

        // Verify distinct questions (no duplicates in the 3 questions)
        const ids = new Set(sampled.map(q => q.id));
        assert.strictEqual(ids.size, 3, `Duplicate questions returned for ${tier} + ${diff}`);
      }
    }
  });

  it('should ensure category diversity when sampling 3 questions for a mock interview round', () => {
    const sample = getQuestionsByLevelAndDifficulty({
      difficulty: 'Medium',
      experienceTier: '3-5 Years',
      count: 3,
    });

    assert.strictEqual(sample.length, 3);
    const categories = sample.map(q => q.category);
    const uniqueCategories = new Set(categories);
    // Should touch diverse categories
    assert(uniqueCategories.size >= 2, `Sampled questions should span diverse domains, got: ${categories.join(', ')}`);
  });

  it('should handle edge cases and malformed inputs gracefully without throwing errors', () => {
    // Malformed difficulty string
    const fallback1 = getQuestionsByLevelAndDifficulty({
      difficulty: 'UNKNOWN_DIFFICULTY',
      count: 3,
    });
    assert.strictEqual(fallback1.length, 3);

    // Negative experience years
    const fallback2 = getQuestionsByLevelAndDifficulty({
      experienceYears: -5,
      count: 3,
    });
    assert.strictEqual(fallback2.length, 3);

    // Extremely high count beyond bank size
    const highCount = getQuestionsByLevelAndDifficulty({
      difficulty: 'Easy',
      count: 100,
    });
    assert(highCount.length > 0 && highCount.length <= INTERVIEW_KNOWLEDGE_BASE.length);
  });

  it('should integrate with QADatabase knowledge base and session methods', async () => {
    const kb = QADatabase.getInterviewKnowledgeBase({ difficulty: 'Hard' });
    assert(kb.length > 0);
    assert(kb.every(q => q.difficulty === 'Hard'));

    const sampled = QADatabase.sampleInterviewQuestions({
      difficulty: 'Easy',
      experienceTier: '0-2 Years',
      count: 2,
    });
    assert.strictEqual(sampled.length, 2);

    // Save and retrieve interview session
    const saved = await QADatabase.saveInterviewSession('test-usr-1', {
      trackId: 'interview-griller',
      title: 'Technical Mock: 3-5 Years (Medium)',
      difficulty: 'Medium',
      experienceLevel: '3-5 Years',
      interviewMode: 'audio',
      overallScore: 88,
      technicalScore: 85,
      communicationScore: 90,
      architectureScore: 89,
      summaryFeedback: 'Strong candidate in automation framework design and API testing.',
      strengths: ['Clear POM design', 'Understands thread safety'],
      areasForImprovement: ['Practice contract testing'],
      messages: [],
    });

    assert(saved.id.startsWith('int_'));
    assert.strictEqual(saved.interviewMode, 'audio');
    assert.strictEqual(saved.overallScore, 88);

    const history = await QADatabase.getInterviewSessions('test-usr-1');
    assert(history.length >= 1);
    assert.strictEqual(history[0].id, saved.id);
  });

  it('should verify "SELECT TARGET INTERVIEW TOPIC" is completely removed from the UI component', () => {
    const uiPath = path.join(__dirname, '../src/components/interview/interview-griller-modal.tsx');
    const content = fs.readFileSync(uiPath, 'utf8');

    // Verify topic selector is eliminated
    assert(!content.includes('Select Target Interview Topic'), 'UI must NOT contain "Select Target Interview Topic"');
    assert(!content.includes("topic === 'framework-design'"), 'UI must not filter by static topic IDs');

    // Verify Difficulty Level selector is present
    assert(content.includes('Select Difficulty Level'), 'UI must have Difficulty Level selector');
    assert(content.includes("'Easy'"), 'UI must support Easy difficulty');
    assert(content.includes("'Medium'"), 'UI must support Medium difficulty');
    assert(content.includes("'Hard'"), 'UI must support Hard difficulty');

    // Verify Experience Level selector is present
    assert(content.includes('Select Experience Level'), 'UI must have Experience Level selector');
    assert(content.includes('0-2 Years'), 'UI must support 0-2 Years');
    assert(content.includes('3-5 Years'), 'UI must support 3-5 Years');
    assert(content.includes('6-9 Years'), 'UI must support 6-9 Years');
    assert(content.includes('10+ Years'), 'UI must support 10+ Years');

    // Verify Audio and Voice format support is implemented
    assert(content.includes('Audio & Voice Mock Mode') || content.includes('Audio &amp; Voice Mock Mode') || content.includes('Audio Mode'), 'UI must support Audio Mock Mode');
    assert(content.includes('Chat & Code Mode') || content.includes('Chat &amp; Code Mode'), 'UI must support Chat & Code Mode');
    assert(content.includes('speechSynthesis') || content.includes('speakText'), 'UI must implement speech synthesis for reading questions');
    assert(content.includes('webkitSpeechRecognition') || content.includes('SpeechRecognition'), 'UI must implement speech recognition for candidate answers');
  });

  describe('API Route /api/ai/interview-grill - Integration & Adversarial Breaking Tests', () => {
    const { POST } = jiti('../src/app/api/ai/interview-grill/route.ts');

    it('should start an interview session and return initial question without requiring a topic', async () => {
      const mockReq = {
        json: async () => ({
          action: 'start',
          difficulty: 'Easy',
          experienceYears: 1,
          experienceLevel: '0-2 Years',
        }),
        headers: { get: () => null },
      };

      const res = await POST(mockReq);
      assert.strictEqual(res.status, 200);
      const data = await res.json();

      assert.strictEqual(data.questionNumber, 1);
      assert.strictEqual(data.totalQuestions, 3);
      assert(data.question && data.question.length > 10);
      assert(data.category);
      assert(data.expectedFocus);
      assert(Array.isArray(data.questionList) && data.questionList.length === 3);
    });

    it('should verify start action returns non-empty questions for Hard + 3-5 Years (user screenshot scenario)', async () => {
      const mockReq = {
        json: async () => ({
          action: 'start',
          difficulty: 'Hard',
          experienceYears: 4,
          experienceLevel: '3-5 Years',
          interviewMode: 'chat',
        }),
        headers: { get: () => null },
      };

      const res = await POST(mockReq);
      assert.strictEqual(res.status, 200);
      const data = await res.json();

      assert.strictEqual(data.questionNumber, 1, 'Question number must be 1');
      assert.strictEqual(data.totalQuestions, 3, 'Total questions must be 3');
      assert(data.question && data.question.trim().length > 20, 'Question text must NEVER be empty');
      assert(data.category && data.category !== '', 'Category must be defined');
      assert(data.expectedFocus && data.expectedFocus.trim().length > 10, 'Expected focus must be defined');
      assert(Array.isArray(data.questionList) && data.questionList.length === 3);
      assert(data.questionList[0].question === data.question);
    });

    it('should evaluate candidate answer on turn 1 and return feedback with probing question', async () => {
      const mockReq = {
        json: async () => ({
          action: 'submit_answer',
          difficulty: 'Medium',
          experienceYears: 4,
          turns: [],
          currentAnswer: 'I design Page Object Models with explicit waits, isolating locators inside component classes and exposing business methods.',
          currentCode: 'await page.getByRole("button", { name: "Submit" }).click();',
          questionList: [
            { question: 'Explain POM and synchronization', expectedFocus: 'Decoupling and auto-waiting' },
            { question: 'How do you test REST APIs?', expectedFocus: 'Status codes and serialization' },
            { question: 'Explain CI sharding', expectedFocus: 'Parallel workers' },
          ],
        }),
        headers: { get: () => null },
      };

      const res = await POST(mockReq);
      assert.strictEqual(res.status, 200);
      const data = await res.json();

      assert.strictEqual(data.isFinished, false);
      assert(data.feedbackOnPrevious && data.feedbackOnPrevious.length > 5);
      assert(data.probingQuestion && data.probingQuestion.length > 10);
      assert.strictEqual(data.nextQuestion.questionNumber, 2);
    });

    it('should catch anti-patterns like Thread.sleep and penalize with probing flakiness question', async () => {
      const mockReq = {
        json: async () => ({
          action: 'submit_answer',
          difficulty: 'Medium',
          experienceYears: 3,
          turns: [],
          currentAnswer: 'I usually add Thread.sleep(5000) whenever the element is not found on the page so it waits 5 seconds.',
          currentCode: 'Thread.sleep(5000);',
          questionList: [{ question: 'How to handle timing issues?', expectedFocus: 'Explicit waits' }],
        }),
        headers: { get: () => null },
      };

      const res = await POST(mockReq);
      const data = await res.json();

      assert(data.feedbackOnPrevious.toLowerCase().includes('flakiness') || data.feedbackOnPrevious.toLowerCase().includes('sleep'));
      assert(data.probingQuestion.toLowerCase().includes('sleep') || data.probingQuestion.toLowerCase().includes('delay') || data.probingQuestion.toLowerCase().includes('anti-pattern'));
    });

    it('should flag dismissive or empty answers and prompt candidate on core technical requirements', async () => {
      // Test junk response "idk"
      const junkReq = {
        json: async () => ({
          action: 'submit_answer',
          difficulty: 'Hard',
          experienceYears: 10,
          turns: [],
          currentAnswer: 'idk',
          currentCode: '',
          questionList: [{ question: 'How do you architect an enterprise test platform?', expectedFocus: 'CI sharding and auth caching' }],
        }),
        headers: { get: () => null },
      };

      const junkRes = await (await POST(junkReq)).json();
      assert(junkRes.feedbackOnPrevious.includes('substance') || junkRes.feedbackOnPrevious.includes('depth'));
      assert(junkRes.probingQuestion.includes('specifically walk through'));

      // Test empty response ""
      const emptyReq = {
        json: async () => ({
          action: 'submit_answer',
          difficulty: 'Hard',
          experienceYears: 10,
          turns: [],
          currentAnswer: '',
          currentCode: '',
          questionList: [{ question: 'How do you architect an enterprise test platform?', expectedFocus: 'CI sharding and auth caching' }],
        }),
        headers: { get: () => null },
      };

      const emptyRes = await (await POST(emptyReq)).json();
      assert(emptyRes.feedbackOnPrevious.includes('No answer or code was provided'));
    });

    it('should positively recognize and probe when a candidate asks clarifying requirements questions', async () => {
      const clarifyReq = {
        json: async () => ({
          action: 'submit_answer',
          difficulty: 'Hard',
          experienceYears: 10,
          turns: [],
          currentAnswer: 'Before proposing the framework, could you clarify whether we need to support legacy mobile web browsers or solely modern evergreen browsers?',
          currentCode: '',
          questionList: [{ question: 'Framework selection', expectedFocus: 'Browser support' }],
        }),
        headers: { get: () => null },
      };

      const data = await (await POST(clarifyReq)).json();
      assert(data.feedbackOnPrevious.toLowerCase().includes('clarifying') || data.feedbackOnPrevious.toLowerCase().includes('initiative'));
    });

    it('should detect brittle absolute XPath locators and ask for accessible or semantic locators', async () => {
      const xpathReq = {
        json: async () => ({
          action: 'submit_answer',
          difficulty: 'Medium',
          experienceYears: 4,
          turns: [],
          currentAnswer: 'I locate the checkout button using driver.findElement(By.xpath("/html/body/div[2]/div/form/button[1]"))',
          currentCode: 'driver.findElement(By.xpath("/html/body/div[2]/div/form/button[1]")).click();',
          questionList: [{ question: 'Locator strategy', expectedFocus: 'Accessible locators' }],
        }),
        headers: { get: () => null },
      };

      const data = await (await POST(xpathReq)).json();
      assert(data.feedbackOnPrevious.toLowerCase().includes('brittle') || data.feedbackOnPrevious.toLowerCase().includes('xpath'));
      assert(data.probingQuestion.toLowerCase().includes('accessible') || data.probingQuestion.toLowerCase().includes('refactor'));
    });

    it('should generate final comprehensive scorecard on turn 3 (isFinal)', async () => {
      const mockReq = {
        json: async () => ({
          action: 'submit_answer',
          difficulty: 'Hard',
          experienceYears: 8,
          experienceLevel: '6-9 Years',
          turns: [
            { question: 'Q1', answer: 'A1' },
            { question: 'Q2', answer: 'A2' },
          ],
          currentAnswer: 'We shard our Playwright test suite across 20 GitHub Actions runner containers using matrix jobs, caching storageState auth cookies.',
          currentCode: 'npx playwright test --shard=${{ matrix.shard }}/20',
          questionList: [
            { question: 'Q1' },
            { question: 'Q2' },
            { question: 'Q3' },
          ],
        }),
        headers: { get: () => null },
      };

      const res = await POST(mockReq);
      assert.strictEqual(res.status, 200);
      const data = await res.json();

      assert.strictEqual(data.isFinished, true);
      assert(data.scorecard, 'Scorecard must be present on final turn');
      assert(typeof data.scorecard.overallScore === 'number');
      assert(typeof data.scorecard.technicalScore === 'number');
      assert(typeof data.scorecard.architectureScore === 'number');
      assert(typeof data.scorecard.communicationScore === 'number');
      assert(data.scorecard.summary && data.scorecard.summary.length > 20);
      assert(Array.isArray(data.scorecard.strengths) && data.scorecard.strengths.length >= 2);
      assert(Array.isArray(data.scorecard.areasForImprovement) && data.scorecard.areasForImprovement.length >= 2);
    });

    it('should reject unknown interview actions with HTTP 400 error', async () => {
      const mockReq = {
        json: async () => ({
          action: 'unknown_action_xyz',
        }),
        headers: { get: () => null },
      };

      const res = await POST(mockReq);
      assert.strictEqual(res.status, 400);
      const data = await res.json();
      assert.strictEqual(data.error, 'Unknown interview action');
    });

    it('should return structured judgment evaluation with verdict, turnScore, mistakesAndGaps, and idealAnswer', async () => {
      const testReq = {
        json: async () => ({
          action: 'submit_answer',
          difficulty: 'Medium',
          experienceYears: 4,
          experienceLevel: '3-5 Years',
          turns: [],
          currentAnswer: 'In my framework I design Page Object Models where pages expose user actions returning other pages, and assertions verify business outcomes rather than DOM implementation details.',
          currentCode: 'export class LoginPage { async login(u: string, p: string) { ... } }',
          questionList: [
            {
              question: 'How do you structure Page Object Model in Playwright?',
              expectedFocus: 'Page Object Models, locators, and clean code',
              answerSummary: 'Encapsulate page locators and user actions within dedicated page classes while asserting business flows.',
              codeSnippet: 'export class DashboardPage { ... }',
              bestPractice: 'Use event-driven assertions and resilient user-facing locators',
              pitfallToAvoid: 'Exposing raw locator handles and hardcoded sleeps',
            },
          ],
        }),
        headers: { get: () => null },
      };

      const res = await POST(testReq);
      assert.strictEqual(res.status, 200);
      const data = await res.json();

      assert(data.evaluation, 'Evaluation object must be present in response');
      assert(['Correct', 'Partially Correct', 'Incorrect'].includes(data.evaluation.verdict), `Invalid verdict: ${data.evaluation.verdict}`);
      assert(typeof data.evaluation.turnScore === 'number' && data.evaluation.turnScore >= 0 && data.evaluation.turnScore <= 100);
      assert(Array.isArray(data.evaluation.mistakesAndGaps), 'mistakesAndGaps must be an array');
      assert(data.evaluation.idealAnswer && data.evaluation.idealAnswer.length > 20, 'idealAnswer must be returned for candidate comparison');
      assert(data.evaluation.bestPractice, 'bestPractice must be returned');
      assert(data.evaluation.pitfallToAvoid, 'pitfallToAvoid must be returned');
    });

    it('should judge "I do not know" strictly as Incorrect with score of 0', async () => {
      const ignoranceCases = [
        'I do not know',
        'i do not know',
        'i dont know',
        "don't know",
        'idk',
        'no idea',
        'skip',
        'pass',
        'have no idea',
        'not sure',
      ];

      for (const phrase of ignoranceCases) {
        const testReq = {
          json: async () => ({
            action: 'submit_answer',
            difficulty: 'Hard',
            experienceYears: 8,
            turns: [],
            currentAnswer: phrase,
            currentCode: '',
            questionList: [
              {
                question: 'How do you design automated Quality Gates in a Continuous Deployment pipeline that automatically promotes code to production without manual QA sign-offs?',
                category: 'CI/CD Pipelines',
                expectedFocus: 'Automated test suite pyramid, SonarQube quality gate, synthetic smoke tests, automated rollback on APM error spike',
                answerSummary: 'Stage gates: 1) PR Gate: Unit tests + contract tests + static linting pass 100%. 2) Build Gate: SonarQube code quality gate passes (zero vulnerabilities, 80% coverage). 3) Staging Gate: Ephemeral container deploy with synthetic API tests. 4) CD Gate: Canary 10% deploy with automated rollback if Datadog APM 5xx error rate spikes > 1%.',
                bestPractice: 'Use ephemeral environments and telemetry-driven automated canary rollbacks.',
                pitfallToAvoid: 'Relying on manual QA verification in a continuous deployment pipeline.',
              },
            ],
          }),
          headers: { get: () => null },
        };

        const res = await POST(testReq);
        const data = await res.json();

        assert(data.evaluation, `Evaluation required for "${phrase}"`);
        assert.strictEqual(
          data.evaluation.verdict,
          'Incorrect',
          `Verdict for "${phrase}" must be "Incorrect", got "${data.evaluation.verdict}"`
        );
        assert.strictEqual(
          data.evaluation.turnScore,
          0,
          `Turn score for "${phrase}" must be 0, got ${data.evaluation.turnScore}`
        );
        assert(
          data.evaluation.mistakesAndGaps.some(m => m.toLowerCase().includes('do not know') || m.toLowerCase().includes('zero')),
          `mistakesAndGaps should note lack of technical solution for "${phrase}"`
        );
        assert(
          data.evaluation.idealAnswer.includes('SonarQube'),
          'idealAnswer must contain model answer for candidate to learn'
        );
      }
    });

    it('should judge hardcoded sleeps as flawed and identify static sleep in mistakesAndGaps', async () => {
      const sleepReq = {
        json: async () => ({
          action: 'submit_answer',
          difficulty: 'Hard',
          experienceYears: 8,
          turns: [],
          currentAnswer: 'I just put Thread.sleep(5000) or page.waitForTimeout(5000) whenever the element is loading slowly',
          currentCode: 'Thread.sleep(5000);',
          questionList: [
            {
              question: 'How do you handle dynamic element synchronization in CI?',
              expectedFocus: 'Web-first assertions, explicit waits, event-driven polling',
              answerSummary: 'Never use hardcoded sleeps; use polling conditions and web-first assertions.',
              bestPractice: 'Always use event-driven synchronization',
              pitfallToAvoid: 'Static sleeps cause flakiness and slow pipelines',
            },
          ],
        }),
        headers: { get: () => null },
      };

      const res = await POST(sleepReq);
      const data = await res.json();

      assert(data.evaluation, 'Evaluation object required');
      assert.strictEqual(data.evaluation.verdict, 'Incorrect');
      assert(data.evaluation.turnScore <= 35, `Score should be heavily penalized for sleep anti-pattern, got ${data.evaluation.turnScore}`);
      const mistakesText = data.evaluation.mistakesAndGaps.join(' ').toLowerCase();
      assert(mistakesText.includes('sleep') || mistakesText.includes('wait'), `mistakesAndGaps should flag sleep: ${mistakesText}`);
    });

    it('should judge dismissive "idk" as Incorrect with score of 0 and explain what user missed', async () => {
      const junkReq = {
        json: async () => ({
          action: 'submit_answer',
          difficulty: 'Medium',
          experienceYears: 4,
          turns: [],
          currentAnswer: 'idk',
          currentCode: '',
          questionList: [
            {
              question: 'Explain how you test REST APIs using Rest Assured',
              expectedFocus: 'given/when/then, JSON schema validation, status codes',
              answerSummary: 'Use given().when().then() BDD structure to validate payload and headers.',
            },
          ],
        }),
        headers: { get: () => null },
      };

      const res = await POST(junkReq);
      const data = await res.json();

      assert(data.evaluation, 'Evaluation object required');
      assert.strictEqual(data.evaluation.verdict, 'Incorrect');
      assert.strictEqual(data.evaluation.turnScore, 0, `Score for idk must be 0, got ${data.evaluation.turnScore}`);
      assert(data.evaluation.whatUserMissed && data.evaluation.whatUserMissed.length > 10);
    });

    it('should verify UI code has Judgment & Comparison card and explicit Next Question button before advancing', () => {
      const modalPath = path.resolve(process.cwd(), 'src/components/interview/interview-griller-modal.tsx');
      const modalCode = fs.readFileSync(modalPath, 'utf8');

      // 1. Must have currentEvaluation state
      assert(modalCode.includes('currentEvaluation'), 'Must track currentEvaluation state in modal');

      // 2. Must render verdict badges
      assert(modalCode.includes('Interviewer Judgment'), 'Must display Interviewer Judgment section');
      assert(modalCode.includes('Verdict: Correct'), 'Must support Correct verdict');
      assert(modalCode.includes('Verdict: Partially Correct'), 'Must support Partially Correct verdict');
      assert(modalCode.includes('Verdict: Incorrect'), 'Must support Incorrect verdict');

      // 3. Must render mistakes & gaps and suggested correct answer
      assert(modalCode.includes('What You Missed / Mistakes'), 'Must show identified mistakes & gaps');
      assert(modalCode.includes('Suggested Correct Answer'), 'Must show suggested correct answer comparison');
      assert(modalCode.includes('Side-by-Side Comparison'), 'Must render side-by-side comparison');

      // 4. Must provide explicit Proceed to Next Question button
      assert(modalCode.includes('Proceed to Next Question'), 'Must include explicit "Proceed to Next Question" button');
      assert(modalCode.includes('handleProceedToNextQuestion'), 'Must have handleProceedToNextQuestion callback');

      // 5. Must NOT auto-advance without user clicking next
      assert(!modalCode.includes('setCurrentQuestion(data.nextQuestion.question); setUserAnswer(\'\');'), 'Must not auto-advance question on submit');
    });
  });
});
