import { InterviewPracticeEvaluation } from './types';
import { getAllInterviewQuestions } from '../interview-questions-bank';
import { ragRetriever } from './retrieval';

export class InterviewPracticeEvaluator {
  public async evaluateAnswer(
    questionId: string,
    userAnswer: string,
    apiKey?: string
  ): Promise<InterviewPracticeEvaluation> {
    const allQuestions = getAllInterviewQuestions();
    const q = allQuestions.find((item) => item.id === questionId);

    if (!q) {
      throw new Error(`Interview question with ID "${questionId}" not found.`);
    }

    // Retrieve related lesson or guide from knowledge base
    const retrieved = await ragRetriever.retrieve(q.question, {
      topK: 2,
      minSimilarity: 0.4,
    });
    const citation =
      retrieved.length > 0
        ? ragRetriever.generateCitation(retrieved[0].chunk, retrieved[0].similarity)
        : null;

    const userText = userAnswer.toLowerCase();
    const expectedSummary = q.answerSummary.toLowerCase();
    const bestPractice = q.bestPractice.toLowerCase();
    const pitfall = q.pitfallToAvoid.toLowerCase();

    // Extract core concepts from question and expected focus
    const keywords = (q.expectedFocus || q.topic)
      .split(/[,;\s/]+/)
      .map((k) => k.trim().toLowerCase())
      .filter((k) => k.length > 3);

    const correctConcepts: string[] = [];
    const missingConcepts: string[] = [];
    const incorrectStatements: string[] = [];

    // Analyze concept coverage
    for (const kw of keywords) {
      if (userText.includes(kw)) {
        correctConcepts.push(`Demonstrated understanding of: "${kw}"`);
      } else {
        missingConcepts.push(`Key concept omitted: "${kw}"`);
      }
    }

    // Check if user hit the best practice
    const bpWords = bestPractice.split(/\s+/).slice(0, 5).join(' ');
    if (userText.includes('locator') || userText.includes('wait') || userText.includes('assert')) {
      correctConcepts.push('Applied relevant automation mechanics');
    }

    // Check for common pitfall triggers
    if (userText.includes('sleep') || userText.includes('thread.sleep')) {
      incorrectStatements.push(
        'Mentioned arbitrary sleep/Thread.sleep. In modern QA, explicit waits and auto-waiting must be used instead.'
      );
    }
    if (userText.includes('ignore exception') || userText.includes('empty catch')) {
      incorrectStatements.push(
        'Empty catch block or suppressing exceptions without logging undermines test fidelity.'
      );
    }

    // Calculate balanced score (0 - 100)
    let baseScore = 50;
    const conceptRatio = keywords.length > 0 ? correctConcepts.length / keywords.length : 0.7;
    baseScore += Math.round(conceptRatio * 35);

    if (userText.length > 150) baseScore += 10;
    if (userText.length > 350) baseScore += 5;
    if (incorrectStatements.length > 0) baseScore -= incorrectStatements.length * 15;

    const finalScore = Math.min(Math.max(baseScore, 20), 98);

    // Constructive feedback synthesis
    let feedback = `Your response demonstrates a foundational grasp of ${q.topic}. `;
    if (finalScore >= 80) {
      feedback += `Excellent articulation! You addressed the critical architectural principles and correctly focused on modern standards.`;
    } else if (finalScore >= 60) {
      feedback += `Solid answer, but could be strengthened by incorporating deeper explanation of the root cause and mentioning concrete framework best practices.`;
    } else {
      feedback += `The answer needs more technical depth. Focus specifically on explaining how the browser DOM or test runner behaves under the hood.`;
    }

    const improvedAnswer = `### Recommended Senior SDET Answer:\n\n${q.answerSummary}\n\n**Best Practice to Highlight:**\n${q.bestPractice}\n\n**Common Pitfall to Contrast:**\n${q.pitfallToAvoid}${q.codeSnippet ? `\n\n**Production Code Example:**\n\`\`\`\n${q.codeSnippet}\n\`\`\`` : ''}`;

    return {
      score: finalScore,
      correctConcepts:
        correctConcepts.length > 0 ? correctConcepts : ['Clear communication tone and terminology'],
      missingConcepts:
        missingConcepts.length > 0
          ? missingConcepts
          : ['Consider discussing scalability across multi-threaded runs'],
      incorrectStatements,
      improvedAnswer,
      constructiveFeedback: feedback,
      relatedLessonUrl: citation?.url,
    };
  }
}

export const practiceEvaluator = new InterviewPracticeEvaluator();
