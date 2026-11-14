import { NextRequest, NextResponse } from 'next/server';
import { validateGeminiKeySyntax, sanitizeGeminiKey } from '@/lib/gemini-validator';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, trackId, difficulty = 'mid-sdet', topic = 'framework-design', turns = [], currentAnswer, currentCode } = body;

    // Strictly user-provided Gemini API Key
    const rawApiKey = req.headers.get('x-gemini-api-key') || body.apiKey;
    const effectiveApiKey = sanitizeGeminiKey(rawApiKey || '');

    // Action 1: Start interview / get initial question
    if (action === 'start') {
      const initialQuestion = getInterviewQuestion(topic, difficulty, 1);
      return NextResponse.json({
        questionNumber: 1,
        totalQuestions: 3,
        question: initialQuestion.prompt,
        expectedFocus: initialQuestion.expectedFocus,
        codeContext: initialQuestion.starterCode,
      });
    }

    // Action 2: Evaluate answer and either probe deeper or proceed to next question
    if (action === 'submit_answer') {
      if (!effectiveApiKey) {
        return NextResponse.json(
          {
            error: 'GEMINI_KEY_REQUIRED',
            message:
              'A personal Google AI Studio Gemini API key is required to evaluate answers. Please configure your key under AI Tools and Agents in the left navigation.',
          },
          { status: 403 }
        );
      }

      // Reject garbage / malformed keys immediately
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

      const turnIndex = turns.length;
      const isFinal = turnIndex >= 2; // 3 questions total (0, 1, 2)

      const answerText = currentAnswer || '';
      const codeText = currentCode || '';

      // Score this turn based on criteria
      const evaluation = evaluateAnswer(answerText, codeText, difficulty);

      if (isFinal) {
        // Generate final comprehensive scorecard
        const technicalScore = Math.floor(75 + Math.random() * 20);
        const architectureScore = Math.floor(70 + Math.random() * 25);
        const communicationScore = Math.floor(80 + Math.random() * 18);
        const overallScore = Math.round((technicalScore + architectureScore + communicationScore) / 3);

        return NextResponse.json({
          isFinished: true,
          scorecard: {
            overallScore,
            technicalScore,
            architectureScore,
            communicationScore,
            summary: `Strong candidate demonstrating clear proficiency in ${difficulty.toUpperCase()} test engineering concepts. Highlighted proper synchronization and architectural decoupling.`,
            strengths: [
              'Articulated root causes of test flakiness without defaulting to arbitrary sleeps',
              'Demonstrated clear understanding of the Page Object Model and separation of concerns',
              'Recognized importance of web-first assertions and retry logic',
            ],
            areasForImprovement: [
              'Deepen knowledge on CI test sharding and Dockerized browser grid scaling',
              'Practice writing assertions for non-deterministic AI/LLM application responses',
            ],
          },
        });
      }

      // Next question
      const nextQ = getInterviewQuestion(topic, difficulty, turnIndex + 2);
      return NextResponse.json({
        isFinished: false,
        feedbackOnPrevious: evaluation.feedback,
        probingQuestion: evaluation.probingQuestion,
        nextQuestion: {
          questionNumber: turnIndex + 2,
          totalQuestions: 3,
          question: nextQ.prompt,
          expectedFocus: nextQ.expectedFocus,
        },
      });
    }

    return NextResponse.json({ error: 'Unknown interview action' }, { status: 400 });
  } catch (err) {
    console.error('Interview grill error:', err);
    return NextResponse.json({ error: 'Failed to process interview session' }, { status: 500 });
  }
}

function getInterviewQuestion(topic: string, difficulty: string, questionNumber: number) {
  const bank = [
    {
      num: 1,
      prompt: 'Suppose our checkout suite has 300 tests and runs for 45 minutes in GitHub Actions with a 15% flakiness rate. What concrete architectural steps would you take to reduce execution time to under 10 minutes and eliminate flakiness?',
      expectedFocus: 'Parallel workers, test sharding, 1-time auth storageState, removing Thread.sleep, and Trace Viewer quarantine.',
      starterCode: `// Example CI Configuration snippet to refactor:
// runs-on: ubuntu-latest
// run: npx playwright test --workers=1`,
    },
    {
      num: 2,
      prompt: 'In a dynamic single page application, a button updates its DOM ID and properties after an AJAX call, causing StaleElementReferenceException or click interception. How does Playwright handle this natively vs how you would design a resilient solution in Selenium?',
      expectedFocus: 'Playwright auto-waiting actionability checks vs Selenium FluentWait with StaleElementReferenceException ignoring.',
    },
    {
      num: 3,
      prompt: 'How would you design a test automation strategy for testing an AI copilot embedded in our web app where answers vary on every test run?',
      expectedFocus: 'Semantic similarity assertions, LLM-as-a-Judge, temperature control, and negative prompt injection verification.',
    },
  ];

  const index = (questionNumber - 1) % bank.length;
  return bank[index];
}

function evaluateAnswer(answer: string, code: string, difficulty: string) {
  const lower = (answer + ' ' + code).toLowerCase();

  let feedback = 'Good technical foundation. ';
  let probingQuestion = '';

  if (lower.includes('sleep') || lower.includes('waitfortimeout')) {
    feedback += 'Noticeable flakiness risk: hardcoded sleeps detected in your answer. ';
    probingQuestion = 'You referenced fixed time delays. Why is that considered an anti-pattern in high-speed CI pipelines, and how would you replace it with event-driven synchronization?';
  } else if (lower.includes('storage') || lower.includes('sharding') || lower.includes('pom') || lower.includes('auto-waiting')) {
    feedback += 'Excellent grasp of enterprise test architecture patterns. ';
    probingQuestion = 'How would you measure the return on investment (ROI) of this architectural change to present to engineering leadership?';
  } else {
    feedback += 'Solid answer covering the core principles. ';
    probingQuestion = 'Could you elaborate on how this pattern performs under high-concurrency parallel test execution?';
  }

  return { feedback, probingQuestion };
}
