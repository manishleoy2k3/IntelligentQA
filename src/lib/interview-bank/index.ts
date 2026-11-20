import { InterviewQuestionItem } from '@/types/qa';
import { MANUAL_QA_QUESTIONS } from './manual-qa';
import { AUTOMATION_UI_QUESTIONS } from './automation-ui';
import { API_TESTING_QUESTIONS } from './api-testing';
import { MOBILE_QA_QUESTIONS } from './mobile-qa';
import { CICD_REPORTING_QUESTIONS } from './cicd-reporting';
import { CODING_DSA_QUESTIONS } from './coding-dsa';

export {
  MANUAL_QA_QUESTIONS,
  AUTOMATION_UI_QUESTIONS,
  API_TESTING_QUESTIONS,
  MOBILE_QA_QUESTIONS,
  CICD_REPORTING_QUESTIONS,
  CODING_DSA_QUESTIONS,
};

export const ALL_INTERVIEW_QUESTIONS: InterviewQuestionItem[] = [
  ...AUTOMATION_UI_QUESTIONS,
  ...MANUAL_QA_QUESTIONS,
  ...API_TESTING_QUESTIONS,
  ...MOBILE_QA_QUESTIONS,
  ...CICD_REPORTING_QUESTIONS,
  ...CODING_DSA_QUESTIONS,
];
