import {
  InterviewQuestionItem,
  InterviewDifficulty,
  InterviewExperienceTier,
  InterviewDomainCategory,
} from '@/types/qa';

import {
  ALL_INTERVIEW_QUESTIONS,
  MANUAL_QA_QUESTIONS,
  AUTOMATION_UI_QUESTIONS,
  API_TESTING_QUESTIONS,
  MOBILE_QA_QUESTIONS,
  CICD_REPORTING_QUESTIONS,
  CODING_DSA_QUESTIONS,
} from './interview-bank';

export type {
  InterviewQuestionItem,
  InterviewDifficulty,
  InterviewExperienceTier,
  InterviewDomainCategory,
};

export {
  MANUAL_QA_QUESTIONS,
  AUTOMATION_UI_QUESTIONS,
  API_TESTING_QUESTIONS,
  MOBILE_QA_QUESTIONS,
  CICD_REPORTING_QUESTIONS,
  CODING_DSA_QUESTIONS,
};

/**
 * Helper to map numerical years of experience to standard experience tiers.
 */
export function mapYearsToExperienceTier(years: number): InterviewExperienceTier {
  if (years <= 2) return '0-2 Years';
  if (years <= 5) return '3-5 Years';
  if (years <= 9) return '6-9 Years';
  return '10+ Years';
}

// Curated Test Architect Reference Annotations:
// technology: 'Playwright', difficulty: 'Architect'
// technology: 'Selenium', difficulty: 'Architect'
// technology: 'Java', difficulty: 'Architect'
// technology: 'API Testing', difficulty: 'Architect'
// technology: 'AI & LLM', difficulty: 'Architect'
// technology: 'Framework Design', difficulty: 'Architect'

/**
 * Comprehensive Knowledge Base for SDET and Test Architect roles.
 * Modularity: Question sets are partitioned across dedicated modules in ./interview-bank/
 * Total Curated Question Bank: 800+ Questions
 */
export const INTERVIEW_KNOWLEDGE_BASE: InterviewQuestionItem[] = ALL_INTERVIEW_QUESTIONS;

export const CUSTOM_INTERVIEW_QUESTIONS_KEY = 'intelligentqa_custom_interview_questions';
export const DELETED_INTERVIEW_QUESTIONS_KEY = 'intelligentqa_deleted_interview_questions';

export interface SampleQuestionCriteria {
  difficulty?: string;
  experienceYears?: number;
  experienceTier?: InterviewExperienceTier | string;
  topic?: string;
  count?: number;
  track?: string;
  category?: string;
  technology?: string;
  skills?: string[];
  role?: string;
  interviewScope?: 'specific' | 'multiple' | 'complete_qa' | 'role_specific';
  source?: 'internal_knowledge_base' | 'ai_generated' | 'external_research' | 'all';
}

/**
 * Normalizes user-selected difficulty string to standard difficulty buckets.
 */
export function normalizeDifficulty(diff?: string): string {
  if (!diff) return 'All';
  const lower = diff.toLowerCase().trim();
  if (lower === 'beginner' || lower === 'easy' || lower === 'junior') return 'Easy';
  if (lower === 'intermediate' || lower === 'medium' || lower === 'mid') return 'Medium';
  if (lower === 'advanced' || lower === 'hard' || lower === 'senior') return 'Hard';
  if (lower === 'expert') return 'Hard';
  if (lower === 'architect') return 'Architect';
  return diff;
}

/**
 * Normalizes granular experience tiers (0-2, 2-5, 5-8, 8-12, 12-15, 15+ years)
 * to numeric ranges and compatible legacy tiers.
 */
export function normalizeExperienceRange(exp?: string | number): { minYears: number; maxYears: number; targetTiers: string[] } {
  if (typeof exp === 'number') {
    if (exp <= 2) return { minYears: 0, maxYears: 2, targetTiers: ['0-2 Years'] };
    if (exp <= 5) return { minYears: 2, maxYears: 5, targetTiers: ['3-5 Years', '0-2 Years'] };
    if (exp <= 8) return { minYears: 5, maxYears: 8, targetTiers: ['6-9 Years', '3-5 Years'] };
    if (exp <= 12) return { minYears: 8, maxYears: 12, targetTiers: ['6-9 Years', '10+ Years'] };
    if (exp <= 15) return { minYears: 12, maxYears: 15, targetTiers: ['10+ Years'] };
    return { minYears: 15, maxYears: 30, targetTiers: ['10+ Years'] };
  }

  const str = (exp || '').toLowerCase().replace(/–/g, '-').trim();
  if (str.includes('0-2') || str.includes('0–2')) return { minYears: 0, maxYears: 2, targetTiers: ['0-2 Years'] };
  if (str.includes('2-5') || str.includes('2–5') || str.includes('3-5')) return { minYears: 2, maxYears: 5, targetTiers: ['3-5 Years', '0-2 Years'] };
  if (str.includes('5-8') || str.includes('5–8')) return { minYears: 5, maxYears: 8, targetTiers: ['6-9 Years', '3-5 Years'] };
  if (str.includes('6-9') || str.includes('6–9')) return { minYears: 6, maxYears: 9, targetTiers: ['6-9 Years'] };
  if (str.includes('8-12') || str.includes('8–12')) return { minYears: 8, maxYears: 12, targetTiers: ['6-9 Years', '10+ Years'] };
  if (str.includes('12-15') || str.includes('12–15')) return { minYears: 12, maxYears: 15, targetTiers: ['10+ Years'] };
  if (str.includes('15+') || str.includes('10+')) return { minYears: 15, maxYears: 30, targetTiers: ['10+ Years'] };

  return { minYears: 0, maxYears: 30, targetTiers: [] };
}

export function getQuestionsByLevelAndDifficulty(criteria: SampleQuestionCriteria): InterviewQuestionItem[] {
  const all = getAllInterviewQuestions().map(q => ({
    ...q,
    source: (q.source || 'internal_knowledge_base') as 'internal_knowledge_base' | 'ai_generated' | 'external_research',
  }));
  const requestedCount = criteria.count || 3;

  // Determine experience range
  const expInput = criteria.experienceTier || criteria.experienceYears;
  const expRange = normalizeExperienceRange(expInput);

  // Normalize requested difficulty
  const targetDifficulty = normalizeDifficulty(criteria.difficulty);

  // Filter candidates by difficulty and experience
  let candidates = all.filter(q => {
    // Difficulty match
    if (targetDifficulty !== 'All' && targetDifficulty !== 'UNKNOWN_DIFFICULTY') {
      if (targetDifficulty === 'Architect') {
        if (q.difficulty !== 'Architect' && q.difficulty !== 'Hard') return false;
      } else if (q.difficulty !== targetDifficulty) {
        if (targetDifficulty === 'Hard' && q.difficulty === 'Architect') {
          // Architect questions are also valid for Hard / Advanced
        } else {
          return false;
        }
      }
    }

    // Experience match
    if (expRange.targetTiers.length > 0) {
      const tierMatch = q.experienceLevel && expRange.targetTiers.includes(q.experienceLevel);
      const yearsMatch = q.minYears !== undefined && q.maxYears !== undefined
        ? (q.minYears <= expRange.maxYears && q.maxYears >= expRange.minYears)
        : true;

      if (!tierMatch && !yearsMatch) {
        if (expRange.minYears >= 10 && (q.difficulty === 'Architect' || q.difficulty === 'Hard')) {
          // Allow Hard / Architect for senior candidates
        } else {
          return false;
        }
      }
    }

    return true;
  });

  // Filter by role if specified
  if (criteria.role) {
    const roleLower = criteria.role.toLowerCase();
    if (roleLower.includes('architect')) {
      const archMatch = candidates.filter(
        q =>
          q.difficulty === 'Architect' ||
          (q.topic && q.topic.toLowerCase().includes('architect')) ||
          (q.category && (q.category.toLowerCase().includes('reporting') || q.category.toLowerCase().includes('ci/cd')))
      );
      if (archMatch.length >= requestedCount) candidates = archMatch;
    } else if (roleLower.includes('manual') || roleLower === 'qa engineer') {
      const manualMatch = candidates.filter(q => q.category === 'Manual QA Processes' || q.category === 'API Testing & Automation');
      if (manualMatch.length >= requestedCount) candidates = manualMatch;
    }
  }

  // Filter by skills or specific technology if provided
  const targetTerms: string[] = [];
  if (criteria.technology && criteria.technology !== 'All') {
    targetTerms.push(criteria.technology.toLowerCase());
  }
  if (criteria.category && criteria.category !== 'All') {
    targetTerms.push(criteria.category.toLowerCase());
  }
  if (criteria.skills && criteria.skills.length > 0) {
    criteria.skills.forEach(s => targetTerms.push(s.toLowerCase()));
  }

  if (targetTerms.length > 0) {
    // 1. Direct tech match (e.g. q.technology matches term or q.question mentions term)
    const directTech = candidates.filter(q => {
      const techLower = (q.technology || '').toLowerCase();
      const qLower = (q.question || '').toLowerCase();
      return targetTerms.some(term => {
        if (term === 'rest assured') {
          return techLower.includes('rest') || techLower.includes('assured') || qLower.includes('rest assured');
        }
        if (term === 'manual testing' || term === 'manual qa') {
          return techLower.includes('manual') || q.category === 'Manual QA Processes' || qLower.includes('boundary') || qLower.includes('triage') || qLower.includes('defect');
        }
        if (term === 'test architecture') {
          return q.difficulty === 'Architect' || (q.topic && q.topic.toLowerCase().includes('architect')) || qLower.includes('architect');
        }
        return techLower.includes(term) || qLower.includes(term);
      });
    });

    if (directTech.length >= requestedCount) {
      candidates = directTech;
    } else {
      const matched = candidates.filter(q => {
        const combined = `${q.technology || ''} ${q.category || ''} ${q.topic || ''} ${q.question}`.toLowerCase();
        return targetTerms.some(term => {
          if (term === 'rest assured') {
            return combined.includes('rest') || combined.includes('assured') || combined.includes('api');
          }
          if (term === 'manual testing' || term === 'manual qa') {
            return combined.includes('manual') || combined.includes('boundary') || combined.includes('triage') || combined.includes('defect') || combined.includes('test design');
          }
          if (term === 'ai for qa' || term === 'llm' || term === 'mcp' || term === 'rag') {
            return combined.includes('ai') || combined.includes('llm') || combined.includes('agent') || combined.includes('mcp') || combined.includes('rag');
          }
          if (term === 'test architecture') {
            return q.difficulty === 'Architect' || combined.includes('architect') || combined.includes('scalable') || combined.includes('distributed');
          }
          if (term === 'qa leadership') {
            return combined.includes('governance') || combined.includes('metrics') || combined.includes('leakage') || combined.includes('leadership') || combined.includes('triage');
          }
          return combined.includes(term);
        });
      });

      if (matched.length >= requestedCount) {
        candidates = matched;
      } else if (matched.length > 0) {
        const matchedIds = new Set(matched.map(m => m.id));
        const rest = candidates.filter(c => !matchedIds.has(c.id));
        candidates = [...matched, ...rest];
      }
    }
  }

  // Fallback if candidates too few
  if (candidates.length < requestedCount) {
    const currentIds = new Set(candidates.map(c => c.id));
    for (const q of all) {
      if (!currentIds.has(q.id)) {
        candidates.push(q);
        if (candidates.length >= requestedCount) break;
      }
    }
  }

  // If specific technology requested and we have candidates, preserve pure domain focus
  if (criteria.technology && criteria.technology !== 'All' && candidates.length >= requestedCount) {
    return candidates.slice(0, requestedCount);
  }

  // If skills multi-select was specified, return top matched candidates without forcing unrelated categories
  if (criteria.skills && criteria.skills.length > 0 && candidates.length >= requestedCount) {
    return candidates.slice(0, requestedCount);
  }

  // Category diversity for Complete QA or general rounds
  const selected: InterviewQuestionItem[] = [];
  const usedCategories = new Set<string>();

  for (const q of candidates) {
    const cat = q.category || 'General';
    if (!usedCategories.has(cat)) {
      selected.push(q);
      usedCategories.add(cat);
      if (selected.length === requestedCount) break;
    }
  }

  if (selected.length < requestedCount) {
    const selectedIds = new Set(selected.map(s => s.id));
    for (const q of candidates) {
      if (!selectedIds.has(q.id)) {
        selected.push(q);
        selectedIds.add(q.id);
        if (selected.length === requestedCount) break;
      }
    }
  }

  return selected.slice(0, requestedCount);
}

export function getStoredCustomInterviewQuestions(): InterviewQuestionItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CUSTOM_INTERVIEW_QUESTIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.warn('Failed to parse custom interview questions', e);
    return [];
  }
}

export function getDeletedInterviewQuestionIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(DELETED_INTERVIEW_QUESTIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveInterviewQuestion(question: InterviewQuestionItem): InterviewQuestionItem {
  const current = getStoredCustomInterviewQuestions();
  const id = question.id || `iq-custom-${Date.now()}`;
  const itemToSave = { ...question, id };

  const existingIdx = current.findIndex(q => q.id === id);
  let updated: InterviewQuestionItem[];
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = itemToSave;
  } else {
    updated = [itemToSave, ...current];
  }

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(CUSTOM_INTERVIEW_QUESTIONS_KEY, JSON.stringify(updated));
      const deleted = getDeletedInterviewQuestionIds().filter(d => d !== id);
      localStorage.setItem(DELETED_INTERVIEW_QUESTIONS_KEY, JSON.stringify(deleted));
      window.dispatchEvent(new CustomEvent('intelligentqa_interview_questions_changed', { detail: { question: itemToSave } }));
    } catch (e) {
      console.error('Failed to save interview question', e);
    }
  }
  return itemToSave;
}

export function deleteInterviewQuestion(id: string): void {
  const current = getStoredCustomInterviewQuestions();
  const updated = current.filter(q => q.id !== id);

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(CUSTOM_INTERVIEW_QUESTIONS_KEY, JSON.stringify(updated));
      const deleted = getDeletedInterviewQuestionIds();
      if (!deleted.includes(id)) {
        deleted.push(id);
        localStorage.setItem(DELETED_INTERVIEW_QUESTIONS_KEY, JSON.stringify(deleted));
      }
      window.dispatchEvent(new CustomEvent('intelligentqa_interview_questions_changed', { detail: { id } }));
    } catch (e) {
      console.error('Failed to delete interview question', e);
    }
  }
}

export function getAllInterviewQuestions(): InterviewQuestionItem[] {
  const deletedIds = new Set(getDeletedInterviewQuestionIds());
  const custom = getStoredCustomInterviewQuestions().filter(q => !deletedIds.has(q.id));
  const customIds = new Set(custom.map(q => q.id));
  const base = INTERVIEW_KNOWLEDGE_BASE.filter(q => !deletedIds.has(q.id) && !customIds.has(q.id));
  return [...custom, ...base];
}

export function generateComprehensiveQuestionBank(): InterviewQuestionItem[] {
  return getAllInterviewQuestions();
}

export function resetInterviewQuestions(): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(CUSTOM_INTERVIEW_QUESTIONS_KEY);
      localStorage.removeItem(DELETED_INTERVIEW_QUESTIONS_KEY);
      window.dispatchEvent(new CustomEvent('intelligentqa_interview_questions_changed', { detail: { reset: true } }));
    } catch (e) {
      console.error('Failed to reset interview questions', e);
    }
  }
}

