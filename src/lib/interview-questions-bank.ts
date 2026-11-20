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
  skills?: string[];
}

export function getQuestionsByLevelAndDifficulty(criteria: SampleQuestionCriteria): InterviewQuestionItem[] {
  const all = getAllInterviewQuestions();
  const requestedCount = criteria.count || 3;

  // Determine target experience tier
  let targetTier: string | null = criteria.experienceTier || null;
  if (!targetTier && typeof criteria.experienceYears === 'number') {
    targetTier = mapYearsToExperienceTier(Math.max(0, criteria.experienceYears));
  }

  // Normalize requested difficulty
  let targetDifficulty: string = criteria.difficulty || 'All';
  if (targetDifficulty === 'Junior') targetDifficulty = 'Easy';
  if (targetDifficulty === 'Mid') targetDifficulty = 'Medium';
  if (targetDifficulty === 'Senior') targetDifficulty = 'Hard';

  // Filter candidates
  let candidates = all.filter(q => {
    // Difficulty match
    if (targetDifficulty !== 'All' && targetDifficulty !== 'UNKNOWN_DIFFICULTY') {
      if (targetDifficulty === 'Architect') {
        if (q.difficulty !== 'Architect' && q.difficulty !== 'Hard') return false;
      } else if (q.difficulty !== targetDifficulty) {
        return false;
      }
    }

    // Experience tier match
    if (targetTier && q.experienceLevel && q.experienceLevel !== targetTier) {
      if (targetTier === '10+ Years' && (q.difficulty === 'Architect' || q.difficulty === 'Hard')) {
        // Allow hard / architect questions for 10+ years
      } else {
        return false;
      }
    }

    return true;
  });

  // Filter by skills if provided
  if (criteria.skills && criteria.skills.length > 0) {
    const skillTerms = criteria.skills.map(s => s.toLowerCase());
    const matched = candidates.filter(q => {
      const combined = `${q.technology || ''} ${q.category || ''} ${q.topic || ''} ${q.question}`.toLowerCase();
      return skillTerms.some(term => {
        if (term === 'rest assured') {
          return combined.includes('rest') || combined.includes('assured') || combined.includes('api');
        }
        if (term === 'manual qa') {
          return combined.includes('manual') || combined.includes('boundary') || combined.includes('triage') || combined.includes('defect') || combined.includes('test design');
        }
        return combined.includes(term);
      });
    });
    if (matched.length >= requestedCount) {
      candidates = matched;
    } else if (matched.length > 0) {
      // Prioritize matched, fill remaining with other candidates
      const matchedIds = new Set(matched.map(m => m.id));
      const rest = candidates.filter(c => !matchedIds.has(c.id));
      candidates = [...matched, ...rest];
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

  // Ensure category diversity if possible
  const selected: InterviewQuestionItem[] = [];
  const usedCategories = new Set<string>();

  // Pass 1: Select distinct categories
  for (const q of candidates) {
    const cat = q.category || 'General';
    if (!usedCategories.has(cat)) {
      selected.push(q);
      usedCategories.add(cat);
      if (selected.length === requestedCount) break;
    }
  }

  // Pass 2: Fill remaining up to requestedCount
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

