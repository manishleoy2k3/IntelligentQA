import { z } from 'zod';

export type RAGSourceType =
  'course' | 'module' | 'lesson' | 'article' | 'interview_question' | 'document_source';

export type RAGPublicationStatus = 'published' | 'draft' | 'archived' | 'deleted';

export type RAGIndexingStatus =
  'pending' | 'processing' | 'completed' | 'failed' | 'superseded' | 'skipped';

export interface KnowledgeSource {
  id: string; // e.g., 'lesson:les-ai-qa-1-1'
  sourceType: RAGSourceType;
  sourceId: string;
  sourceTitle: string;
  courseId?: string | null;
  moduleId?: string | null;
  lessonId?: string | null;
  category?: string | null;
  topic?: string | null;
  publicationStatus: RAGPublicationStatus;
  currentContentHash: string;
  currentVersion: number;
  indexedContentHash?: string | null;
  indexedVersion?: number;
  embeddingProvider?: string;
  embeddingModel?: string;
  embeddingDimensions?: number;
  indexingStatus: RAGIndexingStatus;
  chunkCount: number;
  lastIndexedAt?: string | null;
  lastError?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeChunk {
  id: string;
  sourceType: RAGSourceType;
  sourceId: string;
  sourceTitle: string;
  courseId?: string | null;
  moduleId?: string | null;
  lessonId?: string | null;
  category?: string | null;
  topic?: string | null;
  contentVersion: number;
  contentHash: string;
  chunkIndex: number;
  chunkContent: string;
  tokenCount: number;
  embedding: number[];
  embeddingModel: string;
  embeddingVersion: string;
  publicationStatus: RAGPublicationStatus;
  isActive: boolean;
  metadata: Record<string, any>;
  indexedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface IndexingJob {
  id: string;
  jobType:
    | 'index_source'
    | 'reindex_source'
    | 'unpublish_source'
    | 'delete_source'
    | 'reconciliation_scan';
  sourceType: RAGSourceType;
  sourceId: string;
  contentHash?: string;
  version: number;
  status: RAGIndexingStatus;
  priority: number;
  attempts: number;
  maxAttempts: number;
  lastError?: string | null;
  metadata?: Record<string, any>;
  scheduledAt: string;
  startedAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Citation {
  sourceType: RAGSourceType;
  sourceId: string;
  sourceTitle: string;
  url: string;
  courseId?: string | null;
  moduleId?: string | null;
  lessonId?: string | null;
  similarity: number;
  version: number;
  hash: string;
  excerpt: string;
}

export interface RetrievalFilter {
  courseId?: string | null;
  category?: string | null;
  topic?: string | null;
  sourceType?: RAGSourceType | null;
  minSimilarity?: number;
  topK?: number;
}

export interface RetrievedChunk {
  chunk: KnowledgeChunk;
  similarity: number;
}

export interface RAGAnswerResult {
  question: string;
  answer: string;
  citations: Citation[];
  modelUsed: string;
  latencyMs: number;
  insufficientKnowledge: boolean;
  sourceCount: number;
  knowledgeFreshnessStatus: 'fresh' | 'stale' | 'fallback';
}

export interface InterviewPracticeEvaluation {
  score: number; // 0-100
  correctConcepts: string[];
  missingConcepts: string[];
  incorrectStatements: string[];
  improvedAnswer: string;
  constructiveFeedback: string;
  relatedLessonUrl?: string;
}

export interface FreshnessAuditSummary {
  totalPublishedSources: number;
  totalIndexedSources: number;
  totalActiveChunks: number;
  pendingJobs: number;
  processingJobs: number;
  failedJobs: number;
  supersededVersions: number;
  lastSuccessfulIndexingTime: string | null;
  freshnessStatus: 'fresh' | 'syncing' | 'stale' | 'reconciliation_needed';
  embeddingProvider?: string;
  embeddingModel?: string;
  embeddingDimensions?: number;
  persistenceLayer?: string;
}

// Zod Schemas for API validation
export const AskAIQuerySchema = z.object({
  question: z.string().min(1).max(2000),
  courseId: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  conversationId: z.string().optional(),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant', 'system']),
        content: z.string(),
      })
    )
    .optional(),
  apiKey: z.string().optional(),
});

export const PracticeAnswerSchema = z.object({
  questionId: z.string().min(1),
  userAnswer: z.string().min(1).max(5000),
  apiKey: z.string().optional(),
});
