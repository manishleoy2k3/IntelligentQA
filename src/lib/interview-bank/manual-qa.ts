import { InterviewQuestionItem } from '@/types/qa';
import { MANUAL_QA_CORE_QUESTIONS } from './manual-qa-core';
import { MANUAL_QA_SCENARIOS_QUESTIONS } from './manual-qa-scenarios';

export {
  MANUAL_QA_CORE_QUESTIONS,
  MANUAL_QA_SCENARIOS_QUESTIONS,
};

/**
 * Combined Manual QA Question Bank
 * Partitioned into manual-qa-core.ts and manual-qa-scenarios.ts (< 3000 lines each)
 */
export const MANUAL_QA_QUESTIONS: InterviewQuestionItem[] = [
  ...MANUAL_QA_CORE_QUESTIONS,
  ...MANUAL_QA_SCENARIOS_QUESTIONS,
];
