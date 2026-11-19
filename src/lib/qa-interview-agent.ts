/**
 * Autonomous Quality Engineering Interviewer AI Agent
 *
 * Specializes exclusively in Quality Engineering, SDET, and Manual QA roles.
 * Adapts questions dynamically to the candidate's numerical experience years,
 * seniority tier (Junior, Mid, Senior, Principal/Architect), and demonstrated
 * competence across turns.
 */

import { validateGeminiKeySyntax, sanitizeGeminiKey } from './gemini-validator';
import {
  getQuestionsByLevelAndDifficulty,
  mapYearsToExperienceTier,
  INTERVIEW_KNOWLEDGE_BASE,
  InterviewQuestionItem,
  InterviewExperienceTier,
} from './interview-questions-bank';

export interface CandidateProfile {
  experienceYears?: number;
  experienceLevel?: string;
  experienceTier?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard' | string;
  track?: string;
  skills?: string[];
  apiKey?: string;
  count?: number;
}

export interface AdaptiveInterviewTurn {
  id: string;
  questionNumber: number;
  totalQuestions: number;
  question: string;
  category: string;
  topic: string;
  expectedFocus: string;
  codeContext?: string;
  answerSummary?: string;
  bestPractice?: string;
  pitfallToAvoid?: string;
}

export interface AgentEvaluation {
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

export interface ComprehensiveReport {
  overallScore: number;
  technicalScore: number;
  architectureScore: number;
  communicationScore: number;
  structureScore?: number;
  summary: string;
  hiringRecommendation: 'Strong Hire' | 'Hire' | 'Leaning Hire' | 'Needs Practice';
  seniorityCalibration: string;
  strengths: string[];
  areasForImprovement: string[];
  actionableDrills: string[];
  learningRoadmap: string[];
  questionBreakdown: {
    questionNumber: number;
    question: string;
    category?: string;
    verdict: 'Correct' | 'Partially Correct' | 'Incorrect';
    score: number;
    keyGap?: string;
  }[];
}

/**
 * Checks for admission of ignorance, pass, skip, or generic non-answers.
 */
export function isIgnoranceOrNonAnswer(answer: string, code: string): boolean {
  const trimmedAnswer = (answer || '').trim();
  const trimmedCode = (code || '').trim();

  if (!trimmedAnswer && !trimmedCode) return true;
  if (trimmedCode.length > 10 && /[{}();=><]/.test(trimmedCode)) return false;

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
    'test',
  ];

  for (const phrase of ignorancePhrases) {
    if (
      normalized === phrase ||
      normalized.startsWith(phrase + ' ') ||
      normalized.endsWith(' ' + phrase) ||
      normalized.includes(' ' + phrase + ' ')
    ) {
      if (totalWords <= 12) return true;
    }
  }

  if (totalWords < 3 && !/[{}();=><]/.test(trimmedCode)) return true;
  return false;
}

export class QAInterviewAgent {
  /**
   * Generates a dynamic, unpredictable initial interview session tailored to the candidate's
   * exact years of experience, difficulty level, and target QA track.
   */
  static async generateInitialSession(profile: CandidateProfile): Promise<{
    questionNumber: number;
    totalQuestions: number;
    question: string;
    category: string;
    expectedFocus: string;
    codeContext: string;
    questionList: any[];
  }> {
    const count = typeof profile.count === 'number' && profile.count > 0 ? profile.count : 3;
    const diff = profile.difficulty || 'Medium';
    const tier = (profile.experienceLevel as InterviewExperienceTier) ||
      (typeof profile.experienceYears === 'number' ? mapYearsToExperienceTier(profile.experienceYears) : '3-5 Years');
    const track = profile.track || 'Test Automation';
    const skills = profile.skills || [];

    const apiKey = sanitizeGeminiKey(profile.apiKey || '');
    if (apiKey && validateGeminiKeySyntax(apiKey).valid) {
      try {
        const aiPlan = await this.generateSessionWithAI({
          apiKey,
          difficulty: diff,
          experienceTier: tier,
          experienceYears: profile.experienceYears,
          track,
          skills,
          count,
        });

        if (aiPlan && aiPlan.length >= count) {
          const first = aiPlan[0];
          return {
            questionNumber: 1,
            totalQuestions: count,
            question: first.question,
            category: first.category,
            expectedFocus: first.expectedFocus,
            codeContext: first.codeSnippet || '',
            questionList: aiPlan,
          };
        }
      } catch (err) {
        console.warn('AI Session generation failed, falling back to curated bank:', err);
      }
    }

    // High-fidelity fallback from Knowledge Base
    let sampled = getQuestionsByLevelAndDifficulty({
      difficulty: diff,
      experienceYears: profile.experienceYears,
      experienceTier: tier,
      count,
      track,
      skills,
    });

    if (!sampled || sampled.length === 0) {
      sampled = INTERVIEW_KNOWLEDGE_BASE.slice(0, count);
    }

    const initialQ = sampled[0] || INTERVIEW_KNOWLEDGE_BASE[0];
    return {
      questionNumber: 1,
      totalQuestions: sampled.length,
      question: initialQ.question,
      category: initialQ.category || 'QA Engineering',
      expectedFocus: initialQ.expectedFocus || initialQ.answerSummary,
      codeContext: initialQ.codeSnippet || '',
      questionList: sampled.map((q, idx) => ({
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
    };
  }

  /**
   * Uses Gemini to generate unpredictable, role-calibrated interview loops for Quality Engineering.
   */
  private static async generateSessionWithAI(params: {
    apiKey: string;
    difficulty: string;
    experienceTier: string;
    experienceYears?: number;
    track: string;
    skills?: string[];
    count: number;
  }): Promise<any[]> {
    const hasSkills = Array.isArray(params.skills) && params.skills.length > 0;
    const skillsList = hasSkills ? params.skills!.join(', ') : params.track;

    const prompt = `You are the Lead Quality Engineering & SDET Interviewer at a premier technology company.
Generate an authentic, high-impact ${params.count}-turn technical mock interview plan for a candidate in Quality Engineering.

Candidate Calibration:
- Candidate Selected Tech Stack & Skills: ${skillsList}
- Role Track: ${params.track}
- Seniority Tier: ${params.experienceTier} (${params.experienceYears ? `${params.experienceYears} Years Experience` : 'Mid-Level'})
- Target Difficulty: ${params.difficulty}

STRICT INSTRUCTION:
Every interview question MUST evaluate the candidate's proficiency in their selected skills (${skillsList}).
Do not generate questions on tools or frameworks that are unrelated to their declared tech stack.

DESIGN 3 DISTINCT SEQUENTIAL INTERVIEW TURNS:
Turn 1: Core Test Design / Architecture / Strategy (Scenario-based challenge, real-world context)
Turn 2: Technical Deep-Dive / Implementation (Code snippet, locator strategy, network mocking, or concurrency/race condition)
Turn 3: System Reliability / Production Incident / Incident Triage (Complex edge cases, flaky pipeline quarantine, or release quality gates)

Provide strictly valid JSON in this structure:
{
  "questions": [
    {
      "id": "agent-q1",
      "category": "Selenium & Playwright Automation | API Testing & Automation | Manual QA Processes | CI/CD Pipelines | Coding & DSA | Mobile Automation (Appium)",
      "topic": "Concise topic title",
      "question": "Realistic, non-trivial interview question specifically calibrated for ${params.experienceTier} candidate.",
      "expectedFocus": "3-5 architectural or testing keywords candidate must address",
      "answerSummary": "Gold standard model answer covering key engineering principles (2-3 sentences)",
      "codeSnippet": "// Optional code snippet if applicable (or empty string)",
      "bestPractice": "Key industry best practice for this problem",
      "pitfallToAvoid": "Major anti-pattern to avoid"
    }
  ]
}`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${params.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 2048,
            responseMimeType: 'application/json',
          },
        }),
      }
    );

    if (!res.ok) throw new Error(`Gemini session generator returned ${res.status}`);
    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Empty plan from Gemini');

    const parsed = JSON.parse(text);
    if (Array.isArray(parsed.questions) && parsed.questions.length >= params.count) {
      return parsed.questions;
    }
    throw new Error('Malformed questions array from Gemini');
  }

  /**
   * Adapts the next interview question dynamically based on candidate's previous responses.
   * If candidate performed well, increases technical depth; if candidate had gaps, probes recovery.
   */
  static async generateAdaptiveNextQuestion(params: {
    apiKey?: string;
    turns: any[];
    currentAnswer: string;
    currentCode: string;
    previousEvaluation: AgentEvaluation;
    nextIndex: number;
    totalQuestions: number;
    candidateProfile: CandidateProfile;
    fallbackQuestion: any;
  }): Promise<{
    questionNumber: number;
    totalQuestions: number;
    question: string;
    category: string;
    expectedFocus: string;
    codeContext: string;
    answerSummary?: string;
    bestPractice?: string;
    pitfallToAvoid?: string;
  }> {
    const apiKey = sanitizeGeminiKey(params.apiKey || '');
    if (apiKey && validateGeminiKeySyntax(apiKey).valid) {
      try {
        const prompt = `You are an adaptive SDET & QA Technical Interviewer AI Agent.
The candidate just completed Turn ${params.nextIndex} of ${params.totalQuestions}.

Candidate Background:
- Experience: ${params.candidateProfile.experienceLevel || 'Mid-Level SDET'} (${params.candidateProfile.difficulty || 'Medium'})
- Target Track: ${params.candidateProfile.track || 'Test Automation'}
${params.candidateProfile.skills && params.candidateProfile.skills.length > 0 ? `- Selected Tech Stack: ${params.candidateProfile.skills.join(', ')}` : ''}

Previous Turn Summary:
- Candidate Score: ${params.previousEvaluation.turnScore}% (${params.previousEvaluation.verdict})
- Identified Mistakes/Gaps: ${params.previousEvaluation.mistakesAndGaps.join('; ') || 'None'}
- Candidate Response: "${params.currentAnswer.slice(0, 300)}"

ADAPTIVE QUESTIONING INSTRUCTION:
${
  params.previousEvaluation.turnScore >= 75
    ? 'The candidate gave a strong answer. Generate a challenging next question that tests deeper architecture, concurrency, failure isolation, or enterprise CI/CD scaling.'
    : 'The candidate exhibited gaps or anti-patterns. Generate a follow-up question in the same domain that evaluates whether they understand proper synchronization, boundary conditions, or clean assertion design.'
}

Respond strictly in valid JSON:
{
  "question": "Dynamic, non-generic interview question for Turn ${params.nextIndex + 1}",
  "category": "${params.fallbackQuestion.category || 'QA Engineering'}",
  "topic": "Concise topic",
  "expectedFocus": "Key criteria candidate must explain",
  "answerSummary": "Gold standard answer (2-3 sentences)",
  "codeSnippet": "// Optional code snippet if applicable",
  "bestPractice": "Key industry best practice",
  "pitfallToAvoid": "Critical pitfall to avoid"
}`;

        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
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

        if (res.ok) {
          const data = await res.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            const parsed = JSON.parse(text);
            if (parsed.question && parsed.question.length > 20) {
              return {
                questionNumber: params.nextIndex + 1,
                totalQuestions: params.totalQuestions,
                question: parsed.question,
                category: parsed.category || params.fallbackQuestion.category || 'QA Engineering',
                expectedFocus: parsed.expectedFocus || params.fallbackQuestion.expectedFocus,
                codeContext: parsed.codeSnippet || params.fallbackQuestion.codeSnippet || '',
                answerSummary: parsed.answerSummary || params.fallbackQuestion.answerSummary,
                bestPractice: parsed.bestPractice || params.fallbackQuestion.bestPractice,
                pitfallToAvoid: parsed.pitfallToAvoid || params.fallbackQuestion.pitfallToAvoid,
              };
            }
          }
        }
      } catch (err) {
        console.warn('Adaptive next question failed, using planned question:', err);
      }
    }

    return {
      questionNumber: params.nextIndex + 1,
      totalQuestions: params.totalQuestions,
      question: params.fallbackQuestion.question,
      category: params.fallbackQuestion.category || 'QA Engineering',
      expectedFocus: params.fallbackQuestion.expectedFocus || params.fallbackQuestion.answerSummary,
      codeContext: params.fallbackQuestion.codeSnippet || '',
      answerSummary: params.fallbackQuestion.answerSummary,
      bestPractice: params.fallbackQuestion.bestPractice,
      pitfallToAvoid: params.fallbackQuestion.pitfallToAvoid,
    };
  }

  /**
   * Generates a deep diagnostic report synthesizing the entire interview loop.
   */
  static async generateComprehensiveReport(params: {
    apiKey?: string;
    turns: any[];
    finalEvaluation: AgentEvaluation;
    questionList: any[];
    candidateProfile: CandidateProfile;
  }): Promise<ComprehensiveReport> {
    const turnScores: number[] = params.turns.map((t: any) => {
      const match = t.feedback?.match(/\((\d+)%\)/);
      return match ? parseInt(match[1], 10) : (typeof t.score === 'number' ? t.score : 60);
    });
    turnScores.push(params.finalEvaluation.turnScore);

    const avgScore = Math.round(turnScores.reduce((a, b) => a + b, 0) / turnScores.length);
    const technicalScore = Math.min(100, Math.max(0, avgScore));
    const architectureScore = Math.min(100, Math.max(0, Math.round(technicalScore * (params.finalEvaluation.verdict === 'Incorrect' ? 0.8 : 0.95))));
    const communicationScore = params.finalEvaluation.turnScore === 0 ? 15 : Math.min(100, Math.max(15, Math.round(technicalScore * 0.98)));
    const overallScore = Math.round((technicalScore + architectureScore + communicationScore) / 3);

    const hiringRecommendation: 'Strong Hire' | 'Hire' | 'Leaning Hire' | 'Needs Practice' =
      overallScore >= 88 ? 'Strong Hire' : overallScore >= 75 ? 'Hire' : overallScore >= 55 ? 'Leaning Hire' : 'Needs Practice';

    const apiKey = sanitizeGeminiKey(params.apiKey || '');
    if (apiKey && validateGeminiKeySyntax(apiKey).valid) {
      try {
        const transcriptSummary = params.turns.map((t, idx) =>
          `Turn ${idx + 1}: Q: "${t.question}" | Ans: "${(t.answer || '').slice(0, 200)}" | Feedback: "${t.feedback}"`
        ).join('\n') + `\nTurn ${params.turns.length + 1}: Ans: "${params.finalEvaluation.feedback}"`;

        const prompt = `You are the Principal Staff QA Architect conducting a final talent calibration for a candidate.
Candidate Info:
- Experience: ${params.candidateProfile.experienceLevel || 'Mid-Level'} (${params.candidateProfile.experienceYears || '3-5'} YOE)
- Track: ${params.candidateProfile.track || 'Quality Engineering'}
- Overall Calculated Score: ${overallScore}%

Full Interview Transcript:
${transcriptSummary}

GENERATE A DIAGNOSTIC TALENT REPORT:
1. "summary": 2-3 sentence executive summary of overall performance.
2. "seniorityCalibration": Calibrated seniority level based on actual performance (e.g. "Calibrated at Senior SDET (6-8 YOE)" or "Performing at Associate QA level with gaps in framework design").
3. "strengths": 3 specific engineering strengths demonstrated by this candidate.
4. "areasForImprovement": 3 explicit technical gaps uncovered during this interview.
5. "actionableDrills": 2-3 concrete, high-impact practice drills to tighten before real interviews.
6. "learningRoadmap": 3 recommended deep-dive topics to reach the next tier in Quality Engineering.

Respond strictly in valid JSON:
{
  "summary": "...",
  "seniorityCalibration": "...",
  "strengths": ["...", "...", "..."],
  "areasForImprovement": ["...", "...", "..."],
  "actionableDrills": ["...", "..."],
  "learningRoadmap": ["...", "...", "..."]
}`;

        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 1500,
                responseMimeType: 'application/json',
              },
            }),
          }
        );

        if (res.ok) {
          const data = await res.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            const parsed = JSON.parse(text);
            return {
              overallScore,
              technicalScore,
              architectureScore,
              communicationScore,
              hiringRecommendation,
              summary: parsed.summary || `Candidate completed the Technical Mock Interview with ${overallScore}% score.`,
              seniorityCalibration: parsed.seniorityCalibration || `Calibrated at ${params.candidateProfile.experienceLevel || 'Mid-Level SDET'} level.`,
              strengths: Array.isArray(parsed.strengths) && parsed.strengths.length > 0 ? parsed.strengths : ['Solid understanding of core testing methodology'],
              areasForImprovement: Array.isArray(parsed.areasForImprovement) && parsed.areasForImprovement.length > 0 ? parsed.areasForImprovement : ['Deepen edge case validation'],
              actionableDrills: Array.isArray(parsed.actionableDrills) && parsed.actionableDrills.length > 0 ? parsed.actionableDrills : ['Practice web-first assertions'],
              learningRoadmap: Array.isArray(parsed.learningRoadmap) && parsed.learningRoadmap.length > 0 ? parsed.learningRoadmap : ['Distributed test sharding in CI/CD'],
              questionBreakdown: this.buildQuestionBreakdown(params.turns, params.finalEvaluation, params.questionList),
            };
          }
        }
      } catch (err) {
        console.warn('AI comprehensive report generation failed, using dynamic heuristic fallback:', err);
      }
    }

    // Dynamic Heuristic Fallback
    const allGaps: string[] = [];
    params.turns.forEach((t: any) => {
      if (Array.isArray(t.mistakesAndGaps)) allGaps.push(...t.mistakesAndGaps);
      else if (t.feedback && t.feedback.includes('):')) {
        const p = t.feedback.split('):')[1];
        if (p) allGaps.push(p.trim());
      }
    });
    if (params.finalEvaluation.mistakesAndGaps) allGaps.push(...params.finalEvaluation.mistakesAndGaps);
    const uniqueGaps = Array.from(new Set(allGaps.filter(g => g && g.length > 8))).slice(0, 4);

    const dynamicStrengths = [
      technicalScore >= 70
        ? 'Demonstrated solid grasp of modern QA automation principles and design patterns'
        : 'Identified fundamental testing objectives and problem context',
      overallScore >= 75
        ? 'Articulated root causes of test flakiness and avoided arbitrary sleep timers'
        : 'Demonstrated clear understanding of modular automation patterns and separation of concerns',
    ];

    const dynamicAreasForImprovement = uniqueGaps.length > 0 ? uniqueGaps : [
      'Further optimize parallel CI sharding and ephemeral cloud browser container scaling',
      'Deepen contract testing (Pact) and synthetic monitoring practices for distributed microservices',
    ];

    const seniorityCalibration = overallScore >= 85
      ? `Performing at Senior SDET / Lead level (${params.candidateProfile.experienceTier || '3-5 Years'})`
      : overallScore >= 60
      ? `Calibrated at ${params.candidateProfile.experienceTier || 'Mid-Level SDET'} with good technical foundations`
      : `Performing at Junior / Associate level with critical architectural gaps`;

    return {
      overallScore,
      technicalScore,
      architectureScore,
      communicationScore,
      hiringRecommendation,
      seniorityCalibration,
      summary: `Candidate completed the ${params.candidateProfile.difficulty || 'Medium'} Technical Mock Interview (${params.candidateProfile.experienceLevel || 'Mid-Level'}). Overall performance showed ${overallScore >= 75 ? 'strong' : overallScore >= 50 ? 'moderate' : 'insufficient'} technical knowledge across test architecture, quality gates, and automation practices.`,
      strengths: dynamicStrengths,
      areasForImprovement: dynamicAreasForImprovement,
      actionableDrills: [
        'Review the Gold Standard model answers in the side-by-side comparison modal',
        'Structure technical responses using PREP (Point -> Reason -> Example -> Impact) and behavioral responses with STAR',
      ],
      learningRoadmap: [
        'Web-First Synchronous Assertions vs Arbitrary Thread Sleeps',
        'Dynamic CI Sharding & Ephemeral Testcontainers in GitHub Actions',
        'Consumer-Driven Contract Testing (Pact) for Distributed Microservices',
      ],
      questionBreakdown: this.buildQuestionBreakdown(params.turns, params.finalEvaluation, params.questionList),
    };
  }

  private static buildQuestionBreakdown(turns: any[], finalEvaluation: AgentEvaluation, questionList: any[]) {
    return [
      ...turns.map((t: any, idx: number) => {
        const qMeta = questionList[idx] || {};
        const scoreMatch = t.feedback?.match(/\((\d+)%\)/);
        const score = scoreMatch ? parseInt(scoreMatch[1], 10) : 65;
        const verdict: 'Correct' | 'Partially Correct' | 'Incorrect' =
          score >= 80 ? 'Correct' : score >= 50 ? 'Partially Correct' : 'Incorrect';
        return {
          questionNumber: idx + 1,
          question: t.question || qMeta.question || `Question ${idx + 1}`,
          category: qMeta.category || 'QA Engineering',
          verdict,
          score,
          keyGap: t.mistakesAndGaps?.[0] || 'Minor gaps identified in design pattern.',
        };
      }),
      {
        questionNumber: turns.length + 1,
        question: questionList[turns.length]?.question || 'Final Technical Assessment',
        category: questionList[turns.length]?.category || 'QA Engineering',
        verdict: finalEvaluation.verdict,
        score: finalEvaluation.turnScore,
        keyGap: finalEvaluation.mistakesAndGaps?.[0] || finalEvaluation.whatUserMissed || 'Addressed core technical criteria.',
      },
    ];
  }
}
