/**
 * AI Provider Types and Abstract Interface
 * Designed for provider independence (Gemini, OpenAI, Anthropic, etc.)
 */

export interface AIChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface LessonContextPackage {
  // A. Course Context
  course: {
    name: string;
    description?: string;
    objectives?: string[];
    category?: string;
  };
  // B. Module Context
  module: {
    name: string;
    description?: string;
    position?: number;
    relatedLessons?: string[];
  };
  // C. Current Lesson Context
  currentLesson: {
    id: string;
    title: string;
    description?: string;
    contentHtml: string;
    headings?: string[];
    diagrams?: string[];
    codeExamples?: string[];
    tables?: string[];
    learningObjectives?: string[];
    technicalExplanations?: string[];
  };
  // D. Curriculum Context
  curriculum?: {
    previousLessonTitle?: string;
    nextLessonTitle?: string;
    relatedLessons?: string[];
    moduleHierarchy?: string[];
    standardizedLessonTemplate?: string[];
  };
  // E. Audience Context
  audience?: string[];
  selectedText?: string;
}

export type EnhancementResponseType = 
  | 'full_lesson'
  | 'selected_section'
  | 'additional_content'
  | 'diagram'
  | 'code_example'
  | 'technical_review'
  | 'general_guidance';

export interface TechnicalReviewMetric {
  name: string;
  score: number; // 0-100
  maxScore: number; // 100
  weight?: number;
  benchmark?: string;
  description: string;
}

export interface TechnicalRecommendation {
  type: 'Good' | 'Missing' | 'Improve' | 'Warning';
  category: 'Concepts' | 'Architecture' | 'Code Examples' | 'Failures' | 'Objectives' | 'Best Practices' | 'Other';
  title: string;
  detail: string;
  actionableStep?: string;
}

export interface TechnicalReviewData {
  overallScore: number; // 0-100
  status: 'Strong' | 'Needs Improvement' | 'Critical Issues';
  metrics: {
    completeness: TechnicalReviewMetric;   // e.g. 88/100 Technical completeness
    practicalDepth: TechnicalReviewMetric; // e.g. 72/100 Practical depth
    codeExamples?: TechnicalReviewMetric;
    diagrams?: TechnicalReviewMetric;
    failureHandling?: TechnicalReviewMetric;
    [key: string]: TechnicalReviewMetric | undefined;
  };
  recommendations: TechnicalRecommendation[];
  summaryVerbatim?: string;
}

export interface AIStructuredResponse {
  response_type: EnhancementResponseType;
  summary: string;
  generated_content: string;
  review?: TechnicalReviewData;
  diagrams?: Array<{
    type: 'svg' | 'architecture' | 'image';
    title: string;
    syntax: string;
    explanation: string;
  }>;
  code_examples?: Array<{
    language: string;
    title: string;
    code: string;
    explanation: string;
  }>;
  technical_warnings?: string[];
  assumptions?: string[];
  suggested_actions?: string[];
}

export interface AIEnhancementRequest {
  action?: 
    | 'improve_content'
    | 'expand_explanation'
    | 'add_examples'
    | 'add_diagram'
    | 'add_failures'
    | 'add_interview_questions'
    | 'technical_review'
    | 'rewrite_selected'
    | 'create_lesson'
    | 'simplify_explanation'
    | 'custom_chat';
  prompt: string;
  context: LessonContextPackage;
  history?: AIChatMessage[];
  apiKey?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface AIEnhancementResponse {
  success: boolean;
  data?: AIStructuredResponse;
  rawText?: string;
  modelUsed?: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
  error?: {
    code: 'API_KEY_MISSING' | 'INVALID_API_KEY' | 'QUOTA_EXCEEDED' | 'RATE_LIMITED' | 'NETWORK_ERROR' | 'INVALID_MODEL' | 'RESPONSE_TOO_LARGE' | 'PROVIDER_UNAVAILABLE' | 'BAD_REQUEST';
    message: string;
    details?: string;
  };
}

export interface AIProvider {
  name: string;
  generateEnhancement(request: AIEnhancementRequest): Promise<AIEnhancementResponse>;
}
