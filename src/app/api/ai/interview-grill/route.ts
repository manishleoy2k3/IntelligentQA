import { NextRequest, NextResponse } from 'next/server';
import { validateGeminiKeySyntax, sanitizeGeminiKey } from '@/lib/gemini-validator';
import {
  getQuestionsByLevelAndDifficulty,
  mapYearsToExperienceTier,
  InterviewQuestionItem,
} from '@/lib/interview-questions-bank';

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
      const sampledQuestions = getQuestionsByLevelAndDifficulty({
        difficulty,
        experienceYears: typeof experienceYears === 'number' ? experienceYears : undefined,
        experienceTier: experienceLevel,
        count: 3,
      });

      const initialQ = sampledQuestions[0];
      return NextResponse.json({
        questionNumber: 1,
        totalQuestions: sampledQuestions.length,
        question: initialQ.question,
        category: initialQ.category || 'QA Engineering',
        expectedFocus: initialQ.expectedFocus || initialQ.answerSummary,
        codeContext: initialQ.codeSnippet || '',
        questionList: sampledQuestions.map(q => ({
          id: q.id,
          category: q.category,
          topic: q.topic,
          question: q.question,
          expectedFocus: q.expectedFocus || q.answerSummary,
          codeSnippet: q.codeSnippet || '',
          answerSummary: q.answerSummary,
          bestPractice: q.bestPractice,
          pitfallToAvoid: q.pitfallToAvoid,
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
      let evaluation = {
        feedback: 'Solid technical answer covering the fundamental concepts.',
        probingQuestion: 'How would you measure the return on investment (ROI) and maintainability of this approach in a high-velocity CI/CD pipeline?',
        turnScore: 82,
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
          });
        } catch (geminiErr) {
          console.warn('Live Gemini evaluation failed, falling back to heuristic evaluator:', geminiErr);
          evaluation = evaluateHeuristically(currentAnswer, currentCode, currentQ, difficulty);
        }
      } else {
        evaluation = evaluateHeuristically(currentAnswer, currentCode, currentQ, difficulty);
      }

      if (isFinal) {
        // Generate final comprehensive scorecard
        const technicalScore = Math.min(100, Math.max(60, evaluation.turnScore || 82));
        const architectureScore = Math.min(100, Math.max(55, Math.floor(technicalScore * 0.95 + (Math.random() * 8))));
        const communicationScore = Math.min(100, Math.max(65, Math.floor(technicalScore * 0.98 + (Math.random() * 6))));
        const overallScore = Math.round((technicalScore + architectureScore + communicationScore) / 3);

        const expLabel = experienceLevel || (typeof experienceYears === 'number' ? `${experienceYears} Years` : 'Mid-Level');

        return NextResponse.json({
          isFinished: true,
          feedbackOnPrevious: evaluation.feedback,
          scorecard: {
            overallScore,
            technicalScore,
            architectureScore,
            communicationScore,
            summary: `Candidate completed the ${difficulty.toUpperCase()} Technical Mock Interview (${expLabel}). Demonstrated clear competence in test automation principles, synchronization, and defect lifecycle management.`,
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
        feedbackOnPrevious: evaluation.feedback,
        probingQuestion: evaluation.probingQuestion,
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
): { feedback: string; probingQuestion: string; turnScore: number } {
  const trimmedAnswer = (answer || '').trim();
  const trimmedCode = (code || '').trim();
  const combined = (trimmedAnswer + ' ' + trimmedCode).toLowerCase();
  const totalWords = (trimmedAnswer + ' ' + trimmedCode).split(/\s+/).filter(Boolean).length;

  // 1. Check for empty or missing response
  if (!trimmedAnswer && !trimmedCode) {
    return {
      feedback: 'No answer or code was provided for this technical evaluation. Communication and explanation are critical for SDET roles.',
      probingQuestion: `To evaluate your technical proficiency, please explain your approach to: ${qMeta.expectedFocus || qMeta.question}`,
      turnScore: 35,
    };
  }

  // 2. Check for explicit anti-patterns (even in short answers)
  if (/sleep|waitfortimeout/i.test(combined)) {
    return {
      feedback: 'Flakiness risk detected: hardcoded sleep timers introduce non-deterministic execution and slow down CI pipelines. ',
      probingQuestion: 'Why are hardcoded sleep delays considered an anti-pattern in high-speed CI pipelines, and how would you replace them with event-driven synchronization or web-first assertions?',
      turnScore: 54,
    };
  }

  if (/\/html\/body|\/\/[a-z]+\[\d+\]/i.test(combined)) {
    return {
      feedback: 'Brittle locator risk: absolute XPaths break whenever DOM layout changes.',
      probingQuestion: 'How would you refactor this to use resilient user-facing accessible locators (getByRole, getByLabel) or semantic data-testid attributes?',
      turnScore: 56,
    };
  }

  // 3. Check for trivial / junk / dismissive responses
  const junkPatterns = ['idk', 'dont know', "don't know", 'no idea', 'skip', 'pass', 'n/a', 'na', 'test', 'hello', 'hi', 'yes', 'no', 'none', 'nothing'];
  const isJunk = totalWords < 4 && junkPatterns.some(j => combined === j || combined.startsWith(j + ' ') || combined.endsWith(' ' + j));
  if (isJunk || totalWords < 4) {
    return {
      feedback: 'Answer lacks technical substance or depth. As an SDET / Test Architect candidate, you are expected to articulate your design decisions, trade-offs, and failure handling.',
      probingQuestion: `Could you specifically walk through how you would address: ${qMeta.expectedFocus || 'the core technical requirements'}?`,
      turnScore: 42,
    };
  }

  // 4. Check for candidate clarifying questions (positive engineering behavior)
  const isClarification = (trimmedAnswer.endsWith('?') || /clarify|assume|assumption|requirement|constraint/i.test(trimmedAnswer)) && totalWords < 35;
  if (isClarification) {
    return {
      feedback: 'Good initiative asking clarifying questions on requirements and constraints before committing to an architecture.',
      probingQuestion: 'Assume high concurrency across distributed CI containers with 99.9% uptime requirement. Based on that, what specific technical pattern would you implement?',
      turnScore: 78,
    };
  }

  // 5. In-depth technical evaluation
  let feedback = '';
  let probingQuestion = '';
  let turnScore = 72;

  // Check hardcoded sleeps
  if (/sleep|waitfortimeout/i.test(combined)) {
    feedback += 'Flakiness risk detected: hardcoded sleep timers introduce non-deterministic execution in CI. ';
    probingQuestion = 'Why are hardcoded sleep delays considered an anti-pattern in high-speed CI pipelines, and how would you replace them with event-driven synchronization or web-first assertions?';
    turnScore -= 18;
  }
  // Check brittle locators
  else if (/\/html\/body|\/\/[a-z]+\[\d+\]/i.test(combined)) {
    feedback += 'Brittle locator risk: absolute XPaths break whenever DOM layout changes. ';
    probingQuestion = 'How would you refactor this to use resilient user-facing accessible locators (getByRole, getByLabel) or semantic data-testid attributes?';
    turnScore -= 12;
  }
  // Check architectural keywords
  else if (/sharding|storagestate|threadlocal|fluentwait|pom|actions api|contract testing|keda|idempotent|sliding window|hashmap|two pointers/i.test(combined)) {
    feedback += 'Excellent grasp of enterprise test architecture and design patterns. ';
    probingQuestion = 'How would you measure the return on investment (ROI) and monitor the flakiness rate of this solution across a large engineering organization?';
    turnScore += 16;
  }
  // Check expectedFocus keyword matches
  else {
    const focusWords = (qMeta.expectedFocus || '').toLowerCase().split(/[\s,;]+/).filter((w: string) => w.length > 4);
    const matchedWords = focusWords.filter((w: string) => combined.includes(w));
    if (matchedWords.length >= 2) {
      feedback += `Strong response directly addressing key focus areas including ${matchedWords.slice(0, 2).join(' and ')}. `;
      probingQuestion = 'How does this solution handle edge cases such as network latency spikes, database transaction rollbacks, or browser crash recovery?';
      turnScore += 10;
    } else if (totalWords > 40) {
      feedback += 'Detailed response covering key operational aspects. ';
      probingQuestion = 'Could you elaborate on how this pattern performs under high-concurrency parallel test execution on multi-core CI agents?';
      turnScore += 6;
    } else {
      feedback += 'Solid answer covering the basic concepts. Consider expanding on edge cases, synchronization, and failure isolation. ';
      probingQuestion = `How would you handle failure isolation and recovery when applying this approach to ${qMeta.topic || 'production workloads'}?`;
    }
  }

  return { feedback, probingQuestion, turnScore: Math.min(96, Math.max(35, turnScore)) };
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
}): Promise<{ feedback: string; probingQuestion: string; turnScore: number }> {
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
1. Provide constructive, direct feedback (2-3 sentences) pointing out strengths and any architectural gaps or risks (e.g. sleeps, brittle locators, lack of thread safety, missing error handling).
2. Generate one incisive, probing follow-up question that challenges their assumptions, asks about scaling, race conditions, or trade-offs.
3. Assign a score between 60 and 98 for this turn.

Respond strictly in valid JSON format with keys:
{
  "feedback": "...",
  "probingQuestion": "...",
  "turnScore": 85
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
    return {
      feedback: parsed.feedback || 'Good technical explanation.',
      probingQuestion: parsed.probingQuestion || 'How would you scale this pattern under 100+ parallel test workers?',
      turnScore: typeof parsed.turnScore === 'number' ? parsed.turnScore : 84,
    };
  } catch {
    return {
      feedback: text.slice(0, 200),
      probingQuestion: 'How would you optimize this solution for parallel CI runs?',
      turnScore: 82,
    };
  }
}
