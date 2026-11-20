import { NextRequest, NextResponse } from 'next/server';
import { validateGeminiKeySyntax, sanitizeGeminiKey } from '@/lib/gemini-validator';
import {
  getQuestionsByLevelAndDifficulty,
  mapYearsToExperienceTier,
  INTERVIEW_KNOWLEDGE_BASE,
  InterviewQuestionItem,
} from '@/lib/interview-questions-bank';
import { QAInterviewAgent } from '@/lib/qa-interview-agent';

interface EvaluationResult {
  verdict: 'Correct' | 'Partially Correct' | 'Incorrect';
  turnScore: number;
  feedback: string;
  mistakesAndGaps: string[];
  whatUserMissed: string;
  probingQuestion: string;
  idealAnswer?: string;
  referenceCode?: string;
  bestPractice?: string;
  pitfallToAvoid?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      action,
      difficulty = 'Medium',
      experienceYears,
      experienceLevel,
      turns = [],
      currentAnswer = '',
      currentCode = '',
      questionList = [],
      skills = [],
    } = body;

    // Strictly user-provided Gemini API Key
    const rawApiKey = req.headers.get('x-gemini-api-key') || body.apiKey;
    const effectiveApiKey = sanitizeGeminiKey(rawApiKey || '');

    if (effectiveApiKey) {
      const syntaxCheck = validateGeminiKeySyntax(effectiveApiKey);
      if (!syntaxCheck.valid) {
        return NextResponse.json(
          {
            error: 'INVALID_GEMINI_KEY',
            message: syntaxCheck.error || 'The provided Gemini API key is malformed or invalid.',
            details: syntaxCheck.details,
          },
          { status: 400 }
        );
      }
    }

    // Action 1: Start interview via Autonomous Quality Engineering Interviewer Agent
    if (action === 'start') {
      const count = typeof body.count === 'number' && body.count > 0 ? body.count : 3;
      const track = body.track || body.category || '';
      const candidateSkills = Array.isArray(skills) && skills.length > 0 ? skills : Array.isArray(body.skills) ? body.skills : [];
      const initialSession = await QAInterviewAgent.generateInitialSession({
        difficulty,
        experienceYears: typeof experienceYears === 'number' ? experienceYears : undefined,
        experienceLevel,
        track,
        skills: candidateSkills,
        apiKey: effectiveApiKey,
        count,
      });
      return NextResponse.json(initialSession);
    }

    // Action 1.5: Real-time PREP / STAR Live Coach (Freemockinterview dynamic rubric)
    if (action === 'coach') {
      const candidateDraft = (currentAnswer || body.currentAnswer || '').trim();
      const wordCount = candidateDraft.split(/\s+/).filter(Boolean).length;
      const currentQIndex = turns.length;
      const activeQ = questionList[currentQIndex] || {};
      const questionText = body.question || body.currentQuestion || activeQ.question || '';
      const isBehavioral = /tell me about|describe a time|describe a scenario|how did you handle|how do you handle conflict|give an example of when|disagree|challenging bug|difficult deadline|production incident|major production defect/i.test(questionText) || (activeQ.category && activeQ.category.includes('Behavioral'));

      if (isBehavioral) {
        // STAR Evaluation: Situation, Task, Action, Result
        const hasSituation = /(when i was|at my previous|in our project|in my team|during a release|we were working on|our architecture|at the time|in a past role|in our)/i.test(candidateDraft) || wordCount >= 8;
        const hasTask = /(my task was|the goal was|the challenge was|needed to|we had to|responsible for|objective was|the issue was|the problem was|our task was)/i.test(candidateDraft);
        const hasAction = /(i implemented|i designed|i created|i analyzed|i investigated|i introduced|i refactored|i coordinated|i scheduled|first i|then i|my approach was)/i.test(candidateDraft);
        const hasResult = /(resulted in|reduced|reduction|increased|improved|saved|achieved|prevented|zero bugs|decreased flakiness|%|percent|successfully delivered|learned that|outcome was)/i.test(candidateDraft);

        let prepStage: 'Point' | 'Reason' | 'Example' | 'Impact' | 'Polished' = 'Point';
        let prepAdvice = 'Structure your response using the STAR method: Situation, Task, Action, and Result.';

        if (!hasSituation || wordCount < 4) {
          prepStage = 'Point';
          prepAdvice = 'Set the Situation: Briefly describe the context, team, or project background.';
        } else if (!hasTask) {
          prepStage = 'Reason';
          prepAdvice = 'Clarify the Task: What was the specific challenge, objective, or quality goal?';
        } else if (!hasAction) {
          prepStage = 'Example';
          prepAdvice = 'Detail your Action: What specific technical steps and decisions did YOU personally take?';
        } else if (!hasResult) {
          prepStage = 'Impact';
          prepAdvice = 'Conclude with the Result: Quantify your impact (e.g. % flakiness reduced, time saved, 0 regressions).';
        } else {
          prepStage = 'Polished';
          prepAdvice = 'Superb STAR answer! You clearly outlined Situation, Task, Action, and a quantified Result.';
        }

        return NextResponse.json({
          framework: 'STAR',
          prepStage,
          prepAdvice,
          hasPoint: hasSituation,
          hasReason: hasTask,
          hasExample: hasAction,
          hasImpact: hasResult,
          suggestions: [
            !hasSituation ? 'Set the project or team context in your opening sentence' : 'Clear Situation context established',
            !hasTask ? 'State the explicit task or challenge you were accountable for' : 'Task and core challenge clearly defined',
            !hasAction ? 'Detail the concrete technical actions and steps you executed' : 'Strong personal action steps articulated',
            !hasResult ? 'Quantify the business impact or technical outcome (metrics, % improved)' : 'Measurable outcome and lessons shared',
          ],
        });
      }

      // PREP Evaluation: Point, Reason, Example, Impact
      const hasPoint = /^(in\s+practice|the\s+difference|primarily|to\s+start|by\s+default|page\.|i\s+would|firstly|overall|page\.getbyrole)/i.test(candidateDraft) || wordCount >= 6;
      const hasReason = /(because|since|as\s+a\s+result|queries|mirror|exposes|structure|re-query|architecture|tradeoff|tree|accessibility|dom|encapsulat|isolat|decoupl|modular|in\s+order\s+to|enables|allows|separat|why)/i.test(candidateDraft);
      const hasExample = /(page\.|driver\.|locator|getbyrole|css|xpath|assert|expect|ci\/cd|pipeline|for\s+example|e\.g\.|const|await|refactor|class|function|method|test\()/i.test(candidateDraft);
      const hasImpact = /(flakiness|resilien|refactor|ci|break|fail|false.positive|speed|maintain|regression|reliability|prevent|save|reduc|cost)/i.test(candidateDraft);

      let prepAdvice = 'Lead with your main point, then back it up with architectural reason and concrete examples.';
      let prepStage: 'Point' | 'Reason' | 'Example' | 'Impact' | 'Polished' = 'Point';

      if (!hasPoint || wordCount < 4) {
        prepStage = 'Point';
        prepAdvice = 'Lead with your direct answer: state the clear distinction right away.';
      } else if (!hasReason) {
        prepStage = 'Reason';
        prepAdvice = 'Explain the architectural WHY: what mechanism (e.g. Accessibility Tree vs DOM) drives this?';
      } else if (!hasExample) {
        prepStage = 'Example';
        prepAdvice = 'Provide a concrete locator code snippet or test scenario (e.g. getByRole vs locator).';
      } else if (!hasImpact) {
        prepStage = 'Impact';
        prepAdvice = 'Quantify the impact: how does this prevent false positives or test flakiness in CI?';
      } else {
        prepStage = 'Polished';
        prepAdvice = 'Outstanding PREP structure! Your answer directly addresses Point, Reason, Example, and Impact.';
      }

      return NextResponse.json({
        framework: 'PREP',
        prepStage,
        prepAdvice,
        hasPoint,
        hasReason,
        hasExample,
        hasImpact,
        suggestions: [
          !hasPoint ? 'Directly state the distinction in the first sentence' : 'Strong direct opening point',
          !hasReason ? 'Clarify the underlying engine difference (Accessibility Tree vs HTML DOM)' : 'Clear technical reason explained',
          !hasExample ? 'Provide a code line comparing getByRole and CSS locator' : 'Concrete locator example provided',
          !hasImpact ? 'Explain impact on CI/CD test maintenance and flakiness' : 'Resilience & CI impact well articulated',
        ],
      });
    }

    // Action 1.6: Instant Architecture Hint
    if (action === 'hint') {
      const currentQ = questionList[turns.length] || {
        expectedFocus: 'Accessibility Tree vs DOM tree, resilience to UI refactoring, user perspective',
      };
      return NextResponse.json({
        hint: currentQ.expectedFocus
          ? `Key concepts to mention: ${currentQ.expectedFocus}`
          : 'Focus on how real users interact with the page versus internal HTML markup, and consider test resilience during UI redesigns.',
      });
    }

    // Action 2: Evaluate answer and either probe deeper or proceed to next question
    if (action === 'submit_answer') {
      const turnIndex = turns.length;
      const maxTurns = (Array.isArray(questionList) && questionList.length >= 3) ? questionList.length : 3;
      const isFinal = turnIndex >= maxTurns - 1;
      const currentQ = questionList[turnIndex] || {
        question: 'Technical Assessment',
        expectedFocus: 'Architecture, Clean Code, Test Resilience',
        answerSummary: 'Best practices in test engineering',
        bestPractice: 'Use event-driven assertions',
        pitfallToAvoid: 'Hardcoded sleeps and tight coupling',
      };

      // Perform evaluation (via Gemini if key available, or heuristic fallback)
      let evaluation: EvaluationResult = {
        verdict: 'Correct' as 'Correct' | 'Partially Correct' | 'Incorrect',
        turnScore: 82,
        feedback: 'Solid technical answer covering the fundamental concepts.',
        mistakesAndGaps: ['Consider detailing edge cases and high-concurrency race conditions.'],
        whatUserMissed: 'Deeper exploration of failure isolation under heavy CI worker loads.',
        probingQuestion: 'How would you measure the return on investment (ROI) and maintainability of this approach in a high-velocity CI/CD pipeline?',
        idealAnswer: currentQ.answerSummary || 'Best practices in test engineering and automation resilience.',
        referenceCode: currentQ.codeSnippet || '',
        bestPractice: currentQ.bestPractice || 'Use event-driven assertions and resilient user-facing locators.',
        pitfallToAvoid: currentQ.pitfallToAvoid || 'Hardcoded sleep delays and tight coupling.',
      };

      if (effectiveApiKey && validateGeminiKeySyntax(effectiveApiKey).valid) {
        try {
          evaluation = await evaluateWithGemini({
            apiKey: effectiveApiKey,
            question: currentQ.question,
            expectedFocus: currentQ.expectedFocus,
            answerSummary: currentQ.answerSummary,
            candidateAnswer: currentAnswer,
            candidateCode: currentCode,
            difficulty,
            experienceLevel: experienceLevel || (typeof experienceYears === 'number' ? mapYearsToExperienceTier(experienceYears) : '3-5 Years'),
            isFinal,
            qMeta: currentQ,
          });
        } catch (geminiErr) {
          console.warn('Live Gemini evaluation failed, falling back to heuristic evaluator:', geminiErr);
          evaluation = evaluateHeuristically(currentAnswer, currentCode, currentQ, difficulty);
        }
      } else {
        evaluation = evaluateHeuristically(currentAnswer, currentCode, currentQ, difficulty);
      }

      const evaluationPayload = {
        verdict: evaluation.verdict,
        turnScore: evaluation.turnScore,
        feedback: evaluation.feedback,
        mistakesAndGaps: evaluation.mistakesAndGaps || [],
        whatUserMissed: evaluation.whatUserMissed || '',
        probingQuestion: evaluation.probingQuestion,
        idealAnswer: currentQ.answerSummary || evaluation.idealAnswer || '',
        referenceCode: currentQ.codeSnippet || evaluation.referenceCode || '',
        bestPractice: currentQ.bestPractice || evaluation.bestPractice || '',
        pitfallToAvoid: currentQ.pitfallToAvoid || evaluation.pitfallToAvoid || '',
      };

      if (isFinal) {
        const report = await QAInterviewAgent.generateComprehensiveReport({
          apiKey: effectiveApiKey,
          turns,
          finalEvaluation: evaluation,
          questionList,
          candidateProfile: {
            difficulty,
            experienceYears: typeof experienceYears === 'number' ? experienceYears : undefined,
            experienceLevel,
            track: body.track || body.category,
            skills: Array.isArray(skills) && skills.length > 0 ? skills : Array.isArray(body.skills) ? body.skills : [],
          },
        });

        return NextResponse.json({
          isFinished: true,
          turnIndex,
          feedbackOnPrevious: evaluation.feedback,
          probingQuestion: evaluation.probingQuestion,
          evaluation: evaluationPayload,
          scorecard: report,
        });
      }

      // Adaptive next question dynamically evolved by the QA Interviewer Agent
      const nextQIndex = turnIndex + 1;
      const fallbackQ = questionList[nextQIndex] || {
        question: 'How do you design a resilient test automation architecture?',
        expectedFocus: 'Page Object Models, thread safety, and CI integration.',
        codeSnippet: '',
        category: 'Selenium & Playwright Automation',
      };

      const nextAdaptiveQuestion = await QAInterviewAgent.generateAdaptiveNextQuestion({
        apiKey: effectiveApiKey,
        turns,
        currentAnswer,
        currentCode,
        previousEvaluation: evaluation,
        nextIndex: nextQIndex,
        totalQuestions: questionList.length || 3,
        candidateProfile: {
          difficulty,
          experienceYears: typeof experienceYears === 'number' ? experienceYears : undefined,
          experienceLevel,
          track: body.track || body.category,
          skills: Array.isArray(skills) && skills.length > 0 ? skills : Array.isArray(body.skills) ? body.skills : [],
        },
        fallbackQuestion: fallbackQ,
      });

      return NextResponse.json({
        isFinished: false,
        turnIndex,
        feedbackOnPrevious: evaluation.feedback,
        probingQuestion: evaluation.probingQuestion,
        evaluation: evaluationPayload,
        nextQuestion: nextAdaptiveQuestion,
      });
    }

    return NextResponse.json({ error: 'Unknown interview action' }, { status: 400 });
  } catch (err) {
    console.error('Interview grill error:', err);
    return NextResponse.json({ error: 'Failed to process interview session' }, { status: 500 });
  }
}

/**
 * Detects whether the candidate admitted ignorance, passed, skipped, or submitted a non-answer.
 */
function isIgnoranceOrNonAnswer(answer: string, code: string): boolean {
  const trimmedAnswer = (answer || '').trim();
  const trimmedCode = (code || '').trim();

  // If both answer and code are completely empty
  if (!trimmedAnswer && !trimmedCode) return true;

  // If code is provided with substantial syntax, it's not a non-answer
  if (trimmedCode.length > 10 && /[{}();=><]/.test(trimmedCode)) {
    return false;
  }

  const combined = (trimmedAnswer + ' ' + trimmedCode).toLowerCase();
  const normalized = combined.replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
  const totalWords = normalized.split(/\s+/).filter(Boolean).length;

  const ignorancePhrases = [
    'i do not know',
    'i dont know',
    'i don t know',
    'do not know',
    'dont know',
    'don t know',
    'idk',
    'no idea',
    'have no idea',
    'i have no idea',
    'no clue',
    'have no clue',
    'not sure',
    'i am not sure',
    'i m not sure',
    'im not sure',
    'do not have any idea',
    'dont have any idea',
    'cant answer',
    'can t answer',
    'cannot answer',
    'unable to answer',
    'never worked on this',
    'never worked with this',
    'not familiar with this',
    'not familiar',
    'no experience in this',
    'no experience with this',
    'no experience',
    'skip',
    'pass',
    'next',
    'no answer',
    'none',
    'nothing',
    'na',
    'n a',
    'hello',
    'hi',
    'hey',
    'test',
  ];

  for (const phrase of ignorancePhrases) {
    if (
      normalized === phrase ||
      normalized.startsWith(phrase + ' ') ||
      normalized.endsWith(' ' + phrase) ||
      normalized.includes(' ' + phrase + ' ')
    ) {
      // If the answer is primarily this phrase without meaningful technical architecture
      if (totalWords <= 12) return true;
    }
  }

  // Very short response with zero technical code or depth
  if (totalWords < 3 && !/[{}();=><]/.test(trimmedCode)) {
    return true;
  }

  return false;
}

/**
 * Heuristic evaluator when live Gemini API is unreachable or key is not provided.
 * Uses the Questions Bank expectedFocus, answerSummary, bestPractice, and pitfallToAvoid.
 */
function evaluateHeuristically(
  answer: string,
  code: string,
  qMeta: any,
  difficulty: string
): EvaluationResult {
  const trimmedAnswer = (answer || '').trim();
  const trimmedCode = (code || '').trim();
  const combined = (trimmedAnswer + ' ' + trimmedCode).toLowerCase();
  const totalWords = (trimmedAnswer + ' ' + trimmedCode).split(/\s+/).filter(Boolean).length;

  const idealAnswer = qMeta.answerSummary || 'Standard test engineering best practices and architectural patterns.';
  const referenceCode = qMeta.codeSnippet || '';
  const bestPractice = qMeta.bestPractice || 'Use event-driven assertions, explicit synchronization, and resilient locators.';
  const pitfallToAvoid = qMeta.pitfallToAvoid || 'Hardcoded sleep timers, brittle locators, and shared mutable state.';

  // 1. Check for empty or missing response: SCORE 0
  if (!trimmedAnswer && !trimmedCode) {
    return {
      verdict: 'Incorrect',
      turnScore: 0,
      feedback: 'No answer or code was provided for this technical evaluation. In an SDET or Test Architect interview, this receives a score of 0. Review the suggested model answer below to prepare.',
      mistakesAndGaps: [
        'No technical answer or explanation was submitted',
        'No code demonstration or design pattern was provided',
        `Did not address the expected focus: ${qMeta.expectedFocus || qMeta.question}`,
      ],
      whatUserMissed: idealAnswer,
      probingQuestion: `To evaluate your technical proficiency, could you specifically walk through how you would address: ${qMeta.expectedFocus || qMeta.question}?`,
      idealAnswer,
      referenceCode,
      bestPractice,
      pitfallToAvoid,
    };
  }

  // 2. Check for admission of ignorance, non-answer, skip, or junk: SCORE 0
  if (isIgnoranceOrNonAnswer(trimmedAnswer, trimmedCode)) {
    return {
      verdict: 'Incorrect',
      turnScore: 0,
      feedback: 'Answer lacks technical depth and substance (candidate stated they do not know the answer). In an SDET or Test Architect interview, this receives a score of 0. Review the suggested model answer and reference implementation below to prepare.',
      mistakesAndGaps: [
        'Candidate stated they do not know the answer / no technical solution was submitted',
        `Zero coverage of required architecture: ${qMeta.expectedFocus || qMeta.question}`,
        'No implementation strategy, quality gate criteria, or code snippet provided',
      ],
      whatUserMissed: idealAnswer,
      probingQuestion: `To evaluate your technical proficiency, could you specifically walk through how you would address: ${qMeta.expectedFocus || qMeta.question}?`,
      idealAnswer,
      referenceCode,
      bestPractice,
      pitfallToAvoid,
    };
  }

  // 2. Check for explicit anti-patterns: hardcoded sleeps
  if (/sleep|waitfortimeout/i.test(combined)) {
    const isVeryDetailed = totalWords > 50;
    return {
      verdict: 'Incorrect',
      turnScore: isVeryDetailed ? 35 : 25,
      feedback: 'Flakiness risk detected: hardcoded sleep timers (e.g. Thread.sleep, waitForTimeout) introduce non-deterministic execution and severely slow down CI pipelines. In SDET interviews, static sleeps are heavily penalized.',
      mistakesAndGaps: [
        'Introduced hardcoded sleep / static wait delay (critical anti-pattern)',
        'Failed to use event-driven synchronization or polling mechanisms',
        'Vulnerable to race conditions and intermittent build failures in CI',
      ],
      whatUserMissed: 'Explicit event-driven wait (e.g. WebDriverWait, expect(locator).toBeVisible(), polling conditions) instead of arbitrary sleep.',
      probingQuestion: 'Why are hardcoded sleep delays considered an anti-pattern in high-speed CI pipelines, and how would you replace them with event-driven synchronization or web-first assertions?',
      idealAnswer,
      referenceCode,
      bestPractice,
      pitfallToAvoid,
    };
  }

  // 3. Check for brittle locators: absolute XPaths
  if (/\/html\/body|\/\/[a-z]+\[\d+\]/i.test(combined)) {
    return {
      verdict: 'Incorrect',
      turnScore: 35,
      feedback: 'Brittle locator risk: absolute XPaths break whenever the DOM layout or styling changes, causing high test maintenance overhead. Modern frameworks require user-facing accessible queries or semantic test IDs.',
      mistakesAndGaps: [
        'Used absolute XPath locator (/html/body...) which is highly brittle',
        'Ignored resilient locator strategies like accessible user-facing queries or semantic data-testids',
      ],
      whatUserMissed: 'User-facing accessible locators (getByRole, getByLabel) or semantic test-ids that survive UI redesigns.',
      probingQuestion: 'How would you refactor this to use resilient user-facing accessible locators (getByRole, getByLabel) or semantic data-testid attributes?',
      idealAnswer,
      referenceCode,
      bestPractice,
      pitfallToAvoid,
    };
  }

  // 3.5 Automation Anti-Pattern: Action-only code with zero assertions
  const hasActions = /click\(|fill\(|type\(|sendkeys\(|findelement|fetch\(|request\.|driver\.get|page\.goto/i.test(trimmedCode);
  const hasAssertions = /expect\(|assert|verify|should|assertequals|statuscode|tobevisible|tohavetext/i.test(trimmedCode + ' ' + trimmedAnswer);
  if (hasActions && !hasAssertions && totalWords < 50) {
    return {
      verdict: 'Partially Correct',
      turnScore: 40,
      feedback: 'Automation anti-pattern: test script triggers user actions (clicks/navigation) but contains zero assertions. An automated test without verification will pass even if the application suffers critical regression bugs.',
      mistakesAndGaps: [
        'Automated script lacks explicit assertions (expect / assert / verify)',
        'Test fails to validate actual state against expected business criteria',
      ],
      whatUserMissed: 'Explicit web-first assertion (e.g. expect(locator).toBeVisible() or assertEquals).',
      probingQuestion: 'How would you add explicit web-first assertions to verify both successful state changes and error boundary responses?',
      idealAnswer,
      referenceCode,
      bestPractice,
      pitfallToAvoid,
    };
  }

  // 3.6 Playwright / Async Flaw: Missing await on asynchronous actions
  if (/playwright/i.test(qMeta.technology || qMeta.question || '') && /page\.(click|fill|goto|waitFor)/i.test(trimmedCode) && !/await\s+page/i.test(trimmedCode)) {
    return {
      verdict: 'Partially Correct',
      turnScore: 45,
      feedback: 'Concurrency flaw: missing `await` on asynchronous Playwright actions. In Node.js, unawaited promises cause silent test exits, race conditions, and non-deterministic test results in CI.',
      mistakesAndGaps: [
        'Missing `await` keyword on asynchronous page actions',
        'Vulnerable to Node event-loop race conditions and false-positive passes',
      ],
      whatUserMissed: 'Awaiting all asynchronous Playwright promises to guarantee deterministic execution.',
      probingQuestion: 'Why does omitting `await` in Playwright cause tests to pass falsely or fail unpredictably in headless CI environments?',
      idealAnswer,
      referenceCode,
      bestPractice,
      pitfallToAvoid,
    };
  }

  // 3.7 Parallel Execution Flaw: Static WebDriver causing thread collision
  if (/parallel/i.test(qMeta.topic || qMeta.question || '') && /static\s+webdriver|public\s+static\s+driver/i.test(combined)) {
    return {
      verdict: 'Incorrect',
      turnScore: 35,
      feedback: 'Thread-safety failure: declaring WebDriver as a static variable causes race conditions and session crossovers during parallel test execution.',
      mistakesAndGaps: [
        'Declared WebDriver as static in a multi-threaded parallel execution context',
        'Failed to use ThreadLocal<WebDriver> or worker process isolation',
      ],
      whatUserMissed: 'ThreadLocal<WebDriver> wrapper or isolated worker processes to prevent thread collisions.',
      probingQuestion: 'How does ThreadLocal<WebDriver> ensure test isolation across parallel threads in TestNG or JUnit?',
      idealAnswer,
      referenceCode,
      bestPractice,
      pitfallToAvoid,
    };
  }

  // 4. Candidate asked clarifying questions (positive engineering behavior before design)
  const isClarification = (trimmedAnswer.endsWith('?') || /clarify|assume|assumption|requirement|constraint/i.test(trimmedAnswer)) && totalWords < 35;
  if (isClarification) {
    return {
      verdict: 'Partially Correct',
      turnScore: 65,
      feedback: 'Good initiative asking clarifying questions on requirements and constraints before committing to an architecture.',
      mistakesAndGaps: [
        'Candidate clarified requirements but has not yet specified the concrete design pattern or implementation code',
      ],
      whatUserMissed: 'Concrete architectural implementation and failure handling after clarifying requirements.',
      probingQuestion: 'Assume high concurrency across distributed CI containers with 99.9% uptime requirement. Based on that, what specific technical pattern would you implement?',
      idealAnswer,
      referenceCode,
      bestPractice,
      pitfallToAvoid,
    };
  }

  // 5. Concept coverage analysis against expectedFocus & answerSummary from Question Bank
  const focusClean = (qMeta.expectedFocus || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
  const stopWords = new Set(['and', 'the', 'with', 'for', 'from', 'that', 'this', 'into', 'using', 'about', 'your', 'will', 'should', 'such', 'when', 'what', 'have']);
  const focusKeywords = focusClean.split(/\s+/).filter((w: string) => w.length > 3 && !stopWords.has(w));
  const matchedKeywords = focusKeywords.filter((w: string) => combined.includes(w));
  const matchRatio = focusKeywords.length > 0 ? (matchedKeywords.length / focusKeywords.length) : 0;

  const hasArchKeywords = /sharding|storagestate|threadlocal|fluentwait|pom|actions api|contract testing|keda|idempotent|sliding window|hashmap|two pointers|allure|retry|pact|sonarqube|quality gate|canary|synthetic|rollback/i.test(combined);
  const hasCode = trimmedCode.length > 15 && /[{}();=><]/.test(trimmedCode);

  // High coverage: candidate addressed >= 50% of expected criteria or strong arch patterns
  if ((matchRatio >= 0.5 || matchedKeywords.length >= 3 || (hasArchKeywords && matchedKeywords.length >= 2)) && totalWords >= 20) {
    const turnScore = Math.min(96, Math.max(82, 80 + (matchedKeywords.length * 3) + (hasCode ? 6 : 0) + (totalWords > 40 ? 4 : 0)));
    return {
      verdict: 'Correct',
      turnScore,
      feedback: `Strong technical explanation directly addressing key requirements including ${matchedKeywords.slice(0, 3).join(', ')}. Demonstrates solid grasp of enterprise test architecture.`,
      mistakesAndGaps: [
        'Minor: Ensure automated failure isolation, alert thresholds, and distributed container recovery are documented.',
      ],
      whatUserMissed: 'Deeper trade-off analysis between execution speed and cloud infrastructure cost.',
      probingQuestion: 'How does this solution handle edge cases such as network latency spikes, database transaction rollbacks, or browser crash recovery?',
      idealAnswer,
      referenceCode,
      bestPractice,
      pitfallToAvoid,
    };
  }

  // Moderate coverage: candidate understood the general concept but missed major criteria
  if (matchedKeywords.length >= 1 || (totalWords >= 25 && hasArchKeywords)) {
    const turnScore = Math.min(75, Math.max(50, 48 + (matchedKeywords.length * 7) + (hasCode ? 8 : 0)));
    return {
      verdict: 'Partially Correct',
      turnScore,
      feedback: `Answer covers foundational elements (${matchedKeywords.join(', ') || 'general concepts'}) but lacks the full architectural depth, failure isolation, and quality gate triggers expected at this experience level.`,
      mistakesAndGaps: [
        `Missed core criteria from expected focus: ${qMeta.expectedFocus || idealAnswer}`,
        hasCode ? 'Code snippet lacks edge case and error handling' : 'No reference implementation code was provided',
      ],
      whatUserMissed: `Detailed implementation specifics for: ${qMeta.expectedFocus || idealAnswer}`,
      probingQuestion: `How would you handle failure isolation and recovery when applying this approach to ${qMeta.topic || 'production workloads'}?`,
      idealAnswer,
      referenceCode,
      bestPractice,
      pitfallToAvoid,
    };
  }

  // Minimal / superficial / off-topic content (e.g. 5-15 words repeating the question or generic fluff)
  return {
    verdict: 'Incorrect',
    turnScore: Math.min(30, Math.max(10, totalWords * 2)),
    feedback: 'Answer lacks technical depth and precision. In SDET and Test Architect interviews, candidate is expected to provide structured technical patterns, stage definitions, and failure handling.',
    mistakesAndGaps: [
      `Did not cover the required architecture: ${qMeta.expectedFocus || idealAnswer}`,
      'Explanation is too brief or generic with zero concrete implementation detail',
    ],
    whatUserMissed: idealAnswer,
    probingQuestion: `Could you specifically walk through how you would address: ${qMeta.expectedFocus || 'the core technical requirements'}?`,
    idealAnswer,
    referenceCode,
    bestPractice,
    pitfallToAvoid,
  };
}

/**
 * Live Google Gemini evaluation for SDET and Test Architect roles.
 */
async function evaluateWithGemini(params: {
  apiKey: string;
  question: string;
  expectedFocus: string;
  answerSummary: string;
  candidateAnswer: string;
  candidateCode: string;
  difficulty: string;
  experienceLevel: string;
  isFinal: boolean;
  qMeta: any;
}): Promise<EvaluationResult> {
  // Upfront check for non-answers or admission of ignorance: guarantees score 0 immediately
  if (isIgnoranceOrNonAnswer(params.candidateAnswer, params.candidateCode)) {
    return evaluateHeuristically(params.candidateAnswer, params.candidateCode, params.qMeta, params.difficulty);
  }

  const prompt = `You are a strict, Senior Principal SDET & Test Architect technical interviewer at a Tier-1 tech company.
You are evaluating a candidate's answer against the Gold Standard Model Answer and criteria from our enterprise QA Knowledge Bank.
Role target: ${params.experienceLevel} (${params.difficulty} difficulty).

Interview Question Asked:
"${params.question}"

Domain / Category:
"${params.qMeta?.category || 'QA Engineering'}"

Expected Key Focus:
"${params.expectedFocus || params.qMeta?.expectedFocus || ''}"

Gold Standard Model Answer:
"${params.answerSummary || params.qMeta?.answerSummary || ''}"

Recommended Best Practice:
"${params.qMeta?.bestPractice || ''}"

Pitfall to Avoid:
"${params.qMeta?.pitfallToAvoid || ''}"

Candidate's Answer:
"${params.candidateAnswer || '(No explanation provided)'}"

Candidate's Code Snippet:
"${params.candidateCode || '(No code provided)'}"

CRITICAL RIGOROUS SCORING RULES:
1. NON-ANSWER / IGNORANCE:
   - If the candidate says "I do not know", "I don't know", "idk", "no idea", "not sure", "skip", "pass", or gives zero technical explanation, YOU MUST assign turnScore: 0 and verdict: "Incorrect".
2. SEVERE ANTI-PATTERNS & CRITICAL FLAWS:
   - If the candidate proposes hardcoded sleeps (Thread.sleep, waitForTimeout), brittle absolute XPaths, ignores thread-safety in parallel tests, or gives generic buzzword fluff with no technical substance, assign turnScore between 15 and 40 and verdict: "Incorrect".
3. PARTIALLY CORRECT (HAS GAPS):
   - If the candidate understands some concepts but misses major criteria from the Expected Focus / Model Answer (e.g. misses rollback strategies, synthetic smoke tests, container isolation, or code), assign turnScore between 45 and 75 and verdict: "Partially Correct".
4. CORRECT:
   - If the candidate provides a sound, production-grade explanation addressing the key criteria from the Model Answer, assign turnScore between 80 and 98 and verdict: "Correct".

Provide:
1. "verdict": strictly "Correct", "Partially Correct", or "Incorrect".
2. "turnScore": integer from 0 to 100 based strictly on the rules above.
3. "feedback": direct, professional critique (2-3 sentences).
4. "mistakesAndGaps": array of 1 to 3 specific mistakes, anti-patterns, or missing criteria when compared to the Model Answer.
5. "whatUserMissed": clear summary of the core concepts omitted.
6. "probingQuestion": incisive follow-up interview question.

Respond strictly in valid JSON format:
{
  "verdict": "Correct" | "Partially Correct" | "Incorrect",
  "turnScore": 85,
  "feedback": "...",
  "mistakesAndGaps": ["..."],
  "whatUserMissed": "...",
  "probingQuestion": "..."
}`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${params.apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1024,
          responseMimeType: 'application/json',
        },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('Empty response from Gemini');
  }

  try {
    const parsed = JSON.parse(text);
    const validVerdicts = ['Correct', 'Partially Correct', 'Incorrect'];
    const verdict = validVerdicts.includes(parsed.verdict) ? parsed.verdict : 'Partially Correct';

    return {
      verdict,
      turnScore: typeof parsed.turnScore === 'number' ? parsed.turnScore : (verdict === 'Incorrect' ? 25 : 70),
      feedback: parsed.feedback || 'Technical explanation evaluated.',
      mistakesAndGaps: Array.isArray(parsed.mistakesAndGaps) && parsed.mistakesAndGaps.length > 0
        ? parsed.mistakesAndGaps
        : [`Did not cover expected criteria: ${params.qMeta?.expectedFocus || params.expectedFocus}`],
      whatUserMissed: parsed.whatUserMissed || params.qMeta?.answerSummary || 'Core architectural considerations.',
      probingQuestion: parsed.probingQuestion || 'How would you scale this pattern under 100+ parallel test workers?',
      idealAnswer: params.qMeta?.answerSummary || '',
      referenceCode: params.qMeta?.codeSnippet || '',
      bestPractice: params.qMeta?.bestPractice || '',
      pitfallToAvoid: params.qMeta?.pitfallToAvoid || '',
    };
  } catch {
    return evaluateHeuristically(params.candidateAnswer, params.candidateCode, params.qMeta, params.difficulty);
  }
}
