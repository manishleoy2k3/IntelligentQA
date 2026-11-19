import { NextRequest, NextResponse } from 'next/server';
import { validateGeminiKeySyntax, sanitizeGeminiKey } from '@/lib/gemini-validator';
import {
  getQuestionsByLevelAndDifficulty,
  mapYearsToExperienceTier,
  INTERVIEW_KNOWLEDGE_BASE,
  InterviewQuestionItem,
} from '@/lib/interview-questions-bank';

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
    } = body;

    // Strictly user-provided Gemini API Key
    const rawApiKey = req.headers.get('x-gemini-api-key') || body.apiKey;
    const effectiveApiKey = sanitizeGeminiKey(rawApiKey || '');

    // Action 1: Start interview / sample initial questions
    if (action === 'start') {
      let sampledQuestions = getQuestionsByLevelAndDifficulty({
        difficulty,
        experienceYears: typeof experienceYears === 'number' ? experienceYears : undefined,
        experienceTier: experienceLevel,
        count: 3,
      });

      if (!sampledQuestions || sampledQuestions.length === 0) {
        sampledQuestions = INTERVIEW_KNOWLEDGE_BASE.slice(0, 3);
      }

      const initialQ = sampledQuestions[0] || INTERVIEW_KNOWLEDGE_BASE[0];
      return NextResponse.json({
        questionNumber: 1,
        totalQuestions: Math.max(1, sampledQuestions.length),
        question: initialQ.question,
        category: initialQ.category || 'QA Engineering',
        expectedFocus: initialQ.expectedFocus || initialQ.answerSummary || 'Core architectural and testing principles',
        codeContext: initialQ.codeSnippet || '',
        questionList: sampledQuestions.map((q, idx) => ({
          id: q.id || `q-${idx}`,
          category: q.category || 'QA Engineering',
          topic: q.topic || 'Technical Assessment',
          question: q.question,
          expectedFocus: q.expectedFocus || q.answerSummary || '',
          codeSnippet: q.codeSnippet || '',
          answerSummary: q.answerSummary || '',
          bestPractice: q.bestPractice || '',
          pitfallToAvoid: q.pitfallToAvoid || '',
        })),
      });
    }

    // Action 2: Evaluate answer and either probe deeper or proceed to next question
    if (action === 'submit_answer') {
      const turnIndex = turns.length;
      const isFinal = turnIndex >= 2; // 3 questions total (0, 1, 2)
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
        // Generate final comprehensive scorecard
        const technicalScore = Math.min(100, Math.max(50, evaluation.turnScore || 82));
        const architectureScore = Math.min(100, Math.max(45, Math.floor(technicalScore * 0.95 + (Math.random() * 8))));
        const communicationScore = Math.min(100, Math.max(50, Math.floor(technicalScore * 0.98 + (Math.random() * 6))));
        const overallScore = Math.round((technicalScore + architectureScore + communicationScore) / 3);

        const expLabel = experienceLevel || (typeof experienceYears === 'number' ? `${experienceYears} Years` : 'Mid-Level');

        return NextResponse.json({
          isFinished: true,
          turnIndex,
          feedbackOnPrevious: evaluation.feedback,
          evaluation: evaluationPayload,
          scorecard: {
            overallScore,
            technicalScore,
            architectureScore,
            communicationScore,
            summary: `Candidate completed the ${difficulty.toUpperCase()} Technical Mock Interview (${expLabel}). Demonstrated ${evaluation.verdict === 'Correct' ? 'strong' : evaluation.verdict === 'Partially Correct' ? 'moderate' : 'developing'} competence across test automation principles, synchronization, and defect lifecycle management.`,
            strengths: [
              'Articulated root causes of test flakiness and avoided arbitrary sleep timers',
              'Demonstrated clear understanding of modular automation patterns and separation of concerns',
              'Applied appropriate locator and synchronization strategies for reliable execution',
            ],
            areasForImprovement: [
              'Further optimize parallel CI sharding and ephemeral cloud browser container scaling',
              'Deepen contract testing (Pact) and synthetic monitoring practices for distributed microservices',
            ],
          },
        });
      }

      // Next question
      const nextQIndex = turnIndex + 1;
      const nextQ = questionList[nextQIndex] || {
        question: 'How do you design a resilient test automation architecture?',
        expectedFocus: 'Page Object Models, thread safety, and CI integration.',
        codeSnippet: '',
      };

      return NextResponse.json({
        isFinished: false,
        turnIndex,
        feedbackOnPrevious: evaluation.feedback,
        probingQuestion: evaluation.probingQuestion,
        evaluation: evaluationPayload,
        nextQuestion: {
          questionNumber: nextQIndex + 1,
          totalQuestions: questionList.length || 3,
          question: nextQ.question,
          category: nextQ.category || 'QA Engineering',
          expectedFocus: nextQ.expectedFocus || nextQ.answerSummary,
          codeContext: nextQ.codeSnippet || '',
        },
      });
    }

    return NextResponse.json({ error: 'Unknown interview action' }, { status: 400 });
  } catch (err) {
    console.error('Interview grill error:', err);
    return NextResponse.json({ error: 'Failed to process interview session' }, { status: 500 });
  }
}

/**
 * Heuristic evaluator when live Gemini API is unreachable or key is not provided.
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

  // 1. Check for empty or missing response
  if (!trimmedAnswer && !trimmedCode) {
    return {
      verdict: 'Incorrect',
      turnScore: 35,
      feedback: 'No answer or code was provided for this technical evaluation. Communication, thought process, and architectural rationale are critical for SDET roles.',
      mistakesAndGaps: [
        'No technical answer or explanation was submitted',
        'No code demonstration or design pattern was provided',
        `Did not address the expected focus: ${qMeta.expectedFocus || qMeta.question}`,
      ],
      whatUserMissed: 'Complete technical explanation, architectural trade-offs, and code implementation.',
      probingQuestion: `To evaluate your technical proficiency, please explain your approach to: ${qMeta.expectedFocus || qMeta.question}`,
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
      verdict: isVeryDetailed ? 'Partially Correct' : 'Incorrect',
      turnScore: isVeryDetailed ? 55 : 46,
      feedback: 'Flakiness risk detected: hardcoded sleep timers (e.g. Thread.sleep, waitForTimeout) introduce non-deterministic execution and severely slow down CI pipelines.',
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

  // Check brittle locators
  if (/\/html\/body|\/\/[a-z]+\[\d+\]/i.test(combined)) {
    return {
      verdict: 'Partially Correct',
      turnScore: 56,
      feedback: 'Brittle locator risk: absolute XPaths break whenever the DOM layout or styling changes, causing high test maintenance overhead.',
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

  // 3. Check for trivial / junk / dismissive responses
  const junkPatterns = ['idk', 'dont know', "don't know", 'no idea', 'skip', 'pass', 'n/a', 'na', 'test', 'hello', 'hi', 'yes', 'no', 'none', 'nothing'];
  const isJunk = totalWords < 4 && junkPatterns.some(j => combined === j || combined.startsWith(j + ' ') || combined.endsWith(' ' + j));
  if (isJunk || totalWords < 4) {
    return {
      verdict: 'Incorrect',
      turnScore: 40,
      feedback: 'Answer lacks technical substance, depth, and clarity. In technical interviews for SDET and Test Architect roles, you are expected to articulate your design decisions, trade-offs, and failure handling.',
      mistakesAndGaps: [
        'Answer is too brief or dismissive with zero architectural detail',
        'Missed implementation details, locators/synchronization strategies, and test structure',
      ],
      whatUserMissed: `Missed fundamental concepts of ${qMeta.topic || qMeta.category || 'QA engineering'}: ${qMeta.expectedFocus || idealAnswer}`,
      probingQuestion: `Could you specifically walk through how you would address: ${qMeta.expectedFocus || 'the core technical requirements'}?`,
      idealAnswer,
      referenceCode,
      bestPractice,
      pitfallToAvoid,
    };
  }

  // 4. Check for candidate clarifying questions (positive engineering behavior)
  const isClarification = (trimmedAnswer.endsWith('?') || /clarify|assume|assumption|requirement|constraint/i.test(trimmedAnswer)) && totalWords < 35;
  if (isClarification) {
    return {
      verdict: 'Partially Correct',
      turnScore: 78,
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

  // 5. In-depth technical evaluation
  const focusWords = (qMeta.expectedFocus || '').toLowerCase().split(/[\s,;]+/).filter((w: string) => w.length > 4);
  const matchedWords = focusWords.filter((w: string) => combined.includes(w));
  const hasArchKeywords = /sharding|storagestate|threadlocal|fluentwait|pom|actions api|contract testing|keda|idempotent|sliding window|hashmap|two pointers|allure|retry|pact/i.test(combined);

  if (hasArchKeywords || matchedWords.length >= 2) {
    const turnScore = Math.min(96, Math.max(82, 82 + (matchedWords.length * 4) + (totalWords > 40 ? 4 : 0)));
    return {
      verdict: 'Correct',
      turnScore,
      feedback: `Strong response directly addressing key focus areas including ${matchedWords.length > 0 ? matchedWords.slice(0, 2).join(' and ') : 'enterprise test architecture'}. Demonstrates solid grasp of synchronization and design patterns.`,
      mistakesAndGaps: [
        'Minor edge case: Ensure handling of transient network latency spikes, database rollbacks, or browser worker crashes under extreme load.',
      ],
      whatUserMissed: 'Deeper trade-off analysis between test execution speed and infrastructure cost.',
      probingQuestion: 'How does this solution handle edge cases such as network latency spikes, database transaction rollbacks, or browser crash recovery?',
      idealAnswer,
      referenceCode,
      bestPractice,
      pitfallToAvoid,
    };
  }

  if (totalWords >= 30) {
    return {
      verdict: 'Partially Correct',
      turnScore: 72,
      feedback: 'Solid foundational answer covering the basic concept. However, SDET roles require deeper architectural depth, failure isolation, and concrete code patterns.',
      mistakesAndGaps: [
        'Answer covers general concepts but lacks concrete enterprise-grade code implementation',
        'Could demonstrate stronger edge case handling and CI container concurrency',
      ],
      whatUserMissed: `Detailed implementation specifics for: ${qMeta.expectedFocus || idealAnswer}`,
      probingQuestion: 'Could you elaborate on how this pattern performs under high-concurrency parallel test execution on multi-core CI agents?',
      idealAnswer,
      referenceCode,
      bestPractice,
      pitfallToAvoid,
    };
  }

  return {
    verdict: 'Partially Correct',
    turnScore: 64,
    feedback: 'Basic answer provided, but lacks technical depth and precision expected at this experience level.',
    mistakesAndGaps: [
      'Explanation is high-level and lacks specific design patterns or code structure',
      'Did not address synchronization or failure recovery',
    ],
    whatUserMissed: `Core architectural considerations: ${qMeta.expectedFocus || idealAnswer}`,
    probingQuestion: `How would you handle failure isolation and recovery when applying this approach to ${qMeta.topic || 'production workloads'}?`,
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
  const prompt = `You are a Senior Principal SDET & Test Architect interviewer at a Tier-1 tech company conducting a high-stakes technical mock interview.
Role target: ${params.experienceLevel} (${params.difficulty} difficulty).

Interview Question Asked:
"${params.question}"

Expected Key Focus / Model Answer:
"${params.expectedFocus || params.answerSummary}"

Candidate's Answer:
"${params.candidateAnswer || '(No explanation provided)'}"

Candidate's Code Snippet:
"${params.candidateCode || '(No code provided)'}"

Evaluate the candidate's answer with rigorous technical standards:
1. Determine the verdict: strictly one of "Correct", "Partially Correct", or "Incorrect".
2. Assign a turnScore between 35 and 98 based on technical accuracy, completeness, and best practices.
3. Provide constructive feedback (2-3 sentences) evaluating strengths and flaws.
4. List 1 to 3 specific mistakes, anti-patterns, or gaps in "mistakesAndGaps" (e.g. sleeps, brittle locators, missing assertions, concurrency bugs).
5. Briefly summarize in "whatUserMissed" what key concept or practice they omitted.
6. Generate one incisive, probing follow-up question in "probingQuestion".

Respond strictly in valid JSON format with keys:
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
          temperature: 0.3,
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
      turnScore: typeof parsed.turnScore === 'number' ? parsed.turnScore : 82,
      feedback: parsed.feedback || 'Technical explanation evaluated.',
      mistakesAndGaps: Array.isArray(parsed.mistakesAndGaps) && parsed.mistakesAndGaps.length > 0
        ? parsed.mistakesAndGaps
        : ['Ensure full coverage of edge cases and concurrency'],
      whatUserMissed: parsed.whatUserMissed || 'Deeper exploration of edge cases and failure recovery.',
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
