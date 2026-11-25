export type TrackId = 'playwright-ts' | 'selenium-java' | 'api-testing' | 'ai-qa';

export type TechnologyBadge =
  'playwright' | 'typescript' | 'selenium' | 'java' | 'api-testing' | 'ai-qa' | 'interview';

export interface Lesson {
  id: string;
  moduleId: string;
  trackId: TrackId;
  title: string;
  description: string;
  durationMinutes: number;
  badge: TechnologyBadge;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Senior' | 'Architect';
  disabled?: boolean;
  order?: number;
  manualContext: {
    title: string;
    steps: string[];
    painPoints: string[];
  };
  automationContext: {
    playwrightTs: string;
    seleniumJava?: string;
    restAssuredJava?: string;
    explanation: string;
    bestPractices: string[];
    antiPatterns: string[];
  };
  aiAugmentation: {
    promptExample: string;
    agenticWorkflow: string;
    selfHealingTip: string;
  };
  challenge: {
    instruction: string;
    starterCode: {
      typescript?: string;
      java?: string;
    };
    solutionCode: {
      typescript?: string;
      java?: string;
    };
    validationRules: {
      requiredPatterns: string[];
      forbiddenPatterns: string[];
      description: string;
    }[];
  };
}

export interface Module {
  id: string;
  trackId: TrackId;
  title: string;
  description: string;
  order: number;
  lessons: Lesson[];
}

export interface Track {
  id: TrackId;
  title: string;
  tagline: string;
  description: string;
  color: string;
  badgeColor: string;
  iconName: string;
  totalLessons: number;
  estimatedHours: number;
  modules: Module[];
}

export interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
  targetRole: 'Manual QA' | 'Automation Tester' | 'SDET' | 'QA Lead' | 'Test Architect' | string;
  primaryTrack: TrackId;
  experienceYears?: number;
  streakCount: number;
  lastActiveDate: string;
  geminiApiKey?: string;
  authProvider?: 'google' | 'email' | 'phone';
  phoneNumber?: string;
  aiPreference?: 'enabled' | 'opted_out';
  role?: 'admin' | 'user';
  profileCompleted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserProgress {
  id: string;
  userId: string;
  trackId: TrackId;
  moduleId: string;
  lessonId: string;
  status: 'in-progress' | 'completed';
  completedAt?: string;
}

export interface CodeSubmission {
  id: string;
  userId: string;
  challengeId: string;
  language: 'typescript' | 'java' | 'python';
  codeContent: string;
  status: 'passed' | 'failed' | 'review_requested';
  testOutput?: string;
  aiReviewFeedback?: string;
  createdAt: string;
}

export interface QAGeneratedArtifact {
  id: string;
  userId: string;
  agentType:
    'requirements' | 'test_cases' | 'automation_code' | 'code_review' | 'chat' | 'gap_analysis';
  title: string;
  techStack: 'playwright-ts' | 'selenium-java' | 'restassured' | 'playwright-api';
  inputPrompt: string;
  outputContent: string;
  createdAt: string;
}

export interface QAAgentSession {
  id: string;
  userId: string;
  title: string;
  agentType: string;
  messages: {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: string;
    codeSnippet?: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface InterviewSession {
  id: string;
  userId: string;
  trackId: string;
  title: string;
  difficulty: string;
  experienceLevel?: string;
  interviewMode?: 'chat' | 'audio';
  overallScore?: number;
  technicalScore?: number;
  communicationScore?: number;
  architectureScore?: number;
  summaryFeedback?: string;
  strengths?: string[];
  areasForImprovement?: string[];
  completedAt?: string;
  createdAt: string;
  messages: {
    id: string;
    role: 'interviewer' | 'candidate';
    content: string;
    codeSnippet?: string;
    aiEvaluation?: string;
    timestamp: string;
  }[];
}

export interface QuestionBookmark {
  id: string;
  userId: string;
  questionId: string;
  notes?: string;
  createdAt: string;
}

export type InterviewDifficulty =
  | 'Easy'
  | 'Medium'
  | 'Hard'
  | 'Junior'
  | 'Mid'
  | 'Senior'
  | 'Beginner'
  | 'Intermediate'
  | 'Advanced'
  | 'Expert'
  | 'Architect'
  | string;

export type InterviewExperienceTier =
  | '0-2 Years'
  | '3-5 Years'
  | '6-9 Years'
  | '10+ Years'
  | '0–2 years'
  | '2–5 years'
  | '5–8 years'
  | '8–12 years'
  | '12–15 years'
  | '15+ years'
  | '0-2 years'
  | '2-5 years'
  | '5-8 years'
  | '8-12 years'
  | '12-15 years'
  | '15+ years'
  | string;

export type InterviewDomainCategory =
  | 'Manual QA Processes'
  | 'Coding & DSA'
  | 'Selenium & Playwright Automation'
  | 'Reporting'
  | 'CI/CD Pipelines'
  | 'API Testing & Automation'
  | 'Mobile Manual Testing (Android & iOS)'
  | 'Mobile Automation (Appium)'
  | 'Manual Testing'
  | 'Selenium'
  | 'Playwright'
  | 'Rest Assured'
  | 'Appium'
  | 'Java'
  | 'TypeScript'
  | 'Python'
  | 'API Testing'
  | 'CI/CD'
  | 'Git'
  | 'GitHub Actions'
  | 'Performance Testing'
  | 'JMeter'
  | 'APM'
  | 'AI for QA'
  | 'LLM'
  | 'MCP'
  | 'RAG'
  | 'Test Architecture'
  | 'QA Leadership'
  | string;

export interface RubricScores {
  technicalAccuracy: number; // 1-5
  conceptualUnderstanding: number; // 1-5
  practicalImplementation: number; // 1-5
  problemSolving: number; // 1-5
  architectureKnowledge: number; // 1-5
  communicationClarity: number; // 1-5
}

export interface DetailedEvaluationFeedback {
  whatWasCorrect: string[];
  whatWasMissing: string[];
  whatWasIncorrect: string[];
  excellentAnswerShouldInclude: string;
  recommendedImprovement: string;
}

export interface InterviewQuestionItem {
  id: string;
  technology?: string;
  category?: InterviewDomainCategory;
  difficulty: InterviewDifficulty;
  experienceLevel?: InterviewExperienceTier;
  minYears?: number;
  maxYears?: number;
  topic: string;
  question: string;
  expectedFocus?: string;
  answerSummary: string;
  codeSnippet?: string;
  bestPractice: string;
  pitfallToAvoid: string;
  source?: 'internal_knowledge_base' | 'ai_generated' | 'external_research';
  sourceCitation?: string;
}

export interface DiagnosticQuestion {
  id: string;
  category: 'manual-basics' | 'programming-logic' | 'locators-dom' | 'api-concepts';
  question: string;
  options: {
    id: string;
    label: string;
    recommendedTrack?: TrackId;
    scoreWeight: number;
  }[];
}

export interface ModerationItem {
  id: string;
  type: 'guide' | 'problem';
  title: string;
  trackOrLanguage: string;
  category?: string;
  summary: string;
  submittedBy: {
    id: string;
    name: string;
    email: string;
  };
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  contentPayload: any;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface AdminUserEntry {
  email: string;
  role: 'super_admin' | 'admin';
  addedAt: string;
  addedBy?: string;
}

export interface UserExerciseProgressRecord {
  id: string;
  userId: string;
  language: 'python' | 'javascript' | 'java';
  userAnswers: Record<string, number>;
  score: number;
  totalAnswered: number;
  updatedAt: string;
}

export interface UserCodingProjectRecord {
  id: string;
  userId: string;
  language: 'python' | 'javascript' | 'java';
  projectId: string;
  code: string;
  updatedAt: string;
}
