import { getSupabaseClient } from './client';
import type { InterviewQuestionRecord } from './types';
import type {
  InterviewDifficulty,
  InterviewDomainCategory,
  InterviewExperienceTier,
  InterviewQuestionItem,
} from '@/types/qa';

export function mapYearsToExperienceTier(years: number): InterviewExperienceTier {
  if (years <= 2) return '0-2 Years (Junior)';
  if (years <= 5) return '2-5 Years (Mid-Level)';
  if (years <= 8) return '5-8 Years (Senior)';
  return '8+ Years (Lead / Architect)';
}

export function mapRecordToInterviewQuestion(row: InterviewQuestionRecord): InterviewQuestionItem {
  return {
    id: row.id,
    technology: row.technology,
    category: row.category as InterviewDomainCategory,
    difficulty: row.difficulty as InterviewDifficulty,
    experienceLevel: (row.experience_level ?? undefined) as InterviewExperienceTier | undefined,
    minYears: row.min_years,
    maxYears: row.max_years,
    topic: row.topic,
    question: row.question,
    expectedFocus: row.expected_focus ?? undefined,
    answerSummary: row.answer_summary,
    codeSnippet: row.code_snippet || undefined,
    bestPractice: row.best_practice,
    pitfallToAvoid: row.pitfall_to_avoid,
    source: 'internal_knowledge_base',
  };
}

/**
 * Fetches all published interview questions from Supabase.
 */
export async function fetchAllInterviewQuestions(): Promise<InterviewQuestionItem[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('interview_questions')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: true });

  if (error || !data) {
    console.error('[supabase/interview-questions] Failed to fetch:', error?.message);
    return [];
  }

  return (data as InterviewQuestionRecord[]).map(mapRecordToInterviewQuestion);
}

/**
 * Fetches published interview questions filtered by technology, difficulty, and/or experience years.
 */
export async function fetchQuestionsByLevelAndDifficulty(options?: {
  technology?: string;
  difficulty?: string;
  experienceYears?: number;
  limit?: number;
}): Promise<InterviewQuestionItem[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  let query = supabase.from('interview_questions').select('*').eq('status', 'published');

  if (options?.technology && options.technology !== 'All') {
    query = query.ilike('technology', `%${options.technology}%`);
  }

  if (options?.difficulty && options.difficulty !== 'All') {
    query = query.eq('difficulty', options.difficulty);
  }

  if (typeof options?.experienceYears === 'number') {
    query = query
      .lte('min_years', options.experienceYears)
      .gte('max_years', options.experienceYears);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error || !data) {
    console.error('[supabase/interview-questions] Failed to filter:', error?.message);
    return [];
  }

  return (data as InterviewQuestionRecord[]).map(mapRecordToInterviewQuestion);
}

export interface QAKnowledgeSearchResult {
  id: string;
  category: 'ai-qa' | 'api' | 'career-faq' | 'framework' | 'playwright' | 'selenium';
  topic: string;
  keywords: string[];
  question: string;
  shortAnswer: string;
  detailedAnswer: string;
  answer: string;
  codeExample?: string;
  interviewTips: string;
  pitfalls: string;
  bestPractices: string[];
  antiPatterns: string[];
}

/**
 * Searches published interview questions in Supabase by keyword.
 */
export async function searchQAKnowledgeFromSupabase(
  query: string,
  limit = 5
): Promise<QAKnowledgeSearchResult[]> {
  const supabase = getSupabaseClient();
  if (!supabase || !query.trim()) return [];

  const term = query.trim().replace(/[%_]/g, '');
  const { data, error } = await supabase
    .from('interview_questions')
    .select(
      'id, category, technology, topic, question, answer_summary, code_snippet, best_practice, pitfall_to_avoid'
    )
    .eq('status', 'published')
    .or(`question.ilike.%${term}%,topic.ilike.%${term}%,answer_summary.ilike.%${term}%`)
    .limit(limit);

  if (error || !data) {
    return [];
  }

  return data.map((row: Record<string, any>) => ({
    id: row.id,
    category: (row.category as QAKnowledgeSearchResult['category']) || 'framework',
    topic: row.topic,
    keywords: [row.technology, row.topic, row.category].filter(Boolean),
    question: row.question,
    shortAnswer: row.answer_summary,
    detailedAnswer: row.answer_summary,
    answer: row.answer_summary,
    codeExample: row.code_snippet || undefined,
    interviewTips: row.best_practice || '',
    pitfalls: row.pitfall_to_avoid || '',
    bestPractices: row.best_practice ? [row.best_practice] : [],
    antiPatterns: row.pitfall_to_avoid ? [row.pitfall_to_avoid] : [],
  }));
}
