/**
 * Standard Lesson Content Template Types
 * Supporting Phase 8 Learning Academy Standardization
 */

import { ArchitectureNode, ArchitectureConnection, DiagramData } from '@/data/learning/academy-curriculum';

export type SupportedLanguage =
  | 'java'
  | 'javascript'
  | 'typescript'
  | 'python'
  | 'json'
  | 'yaml'
  | 'bash'
  | 'sql'
  | 'xml'
  | 'csharp'
  | 'html';

export interface CodeExampleItem {
  language: SupportedLanguage | string;
  title: string;
  filename?: string;
  code: string;
  explanation?: string;
  lineNumbers?: boolean;
}

export interface TroubleshootingScenario {
  error: string;
  rootCause: string;
  troubleshooting: string[];
  debuggingTechnique?: string;
  codeFix?: string;
}

export interface TroubleshootingItem extends TroubleshootingScenario {}

export interface BestPracticeItem {
  title: string;
  category: 'Industry Standard' | 'Performance' | 'Maintainability' | 'Security';
  recommendation: string;
  impact?: string;
}

export interface InterviewQuestionItem {
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Architect';
  question: string;
  answer: string;
  sampleCodeOrScenario?: string;
}

export interface TechnicalInterviewQuestion extends InterviewQuestionItem {}

export interface TechnicalDiagramConfig {
  type: 'pipeline' | 'layers' | 'client-server' | 'agent-loop' | 'sequence' | 'svg' | 'mermaid' | 'image';
  title: string;
  caption?: string;
  nodes?: ArchitectureNode[];
  connections?: ArchitectureConnection[];
  svgContent?: string;
  mermaidCode?: string;
  imageUrl?: string;
  altText?: string;
  sourceAttribution?: string;
  componentsExplanation?: Array<{
    name: string;
    role: string;
    details: string;
  }>;
}

export interface StandardLessonTemplateData {
  // 1. Lesson Overview
  overview?: {
    whatIsIt: string;
    whyImportant: string;
    whereUsed: string;
  };

  // 2. Learning Objectives
  learningObjectives?: string[];

  // 3. Concept Explanation
  conceptExplanation?: {
    theory: string[];
    terminology?: Array<{ term: string; definition: string }>;
    keyConcepts?: string[];
    practicalUnderstanding?: string;
  };

  // 4. Architecture / Technical Diagram
  architectureDiagram?: TechnicalDiagramConfig;

  // 5. How It Works
  howItWorks?: {
    steps: Array<{
      stepNumber: number;
      title: string;
      description: string;
      component?: string;
    }>;
    internalMechanism?: string;
    responsibilities?: Array<{ component: string; responsibility: string }>;
  };

  // 6. Practical Implementation
  practicalImplementation?: {
    overview: string;
    steps: Array<{
      stepNumber: number;
      action: string;
      details?: string;
      snippet?: string;
    }>;
  };

  // 7. Code Examples
  codeExamples?: CodeExampleItem[];

  // 8. Real-World QA Use Cases
  qaUseCases?: Array<{
    title: string;
    scenario: string;
    enterpriseApplication: string;
  }>;

  // 9. Common Problems and Failures
  commonProblems?: TroubleshootingScenario[];

  // 10. Best Practices
  bestPractices?: BestPracticeItem[];

  // 11. Comparison and Alternatives
  comparison?: {
    title: string;
    alternativeApproach: string;
    advantages: string[];
    limitations: string[];
    headers?: string[];
    matrix?: string[][];
  };

  // 12. Interview Questions
  interviewQuestions?: InterviewQuestionItem[];

  // 13. Lesson Summary
  summary?: {
    takeaways: string[];
    keyTerminology: string[];
    whatToLearnNext?: {
      title: string;
      slug?: string;
      description?: string;
    };
  };
}
