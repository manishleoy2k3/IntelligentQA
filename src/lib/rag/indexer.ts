import crypto from 'crypto';

function uuidv4(): string {
  return crypto.randomUUID();
}
import {
  KnowledgeSource,
  KnowledgeChunk,
  IndexingJob,
  RAGSourceType,
  RAGPublicationStatus,
} from './types';
import { computeContentHash } from './hash';
import { chunkContent, ChunkInput } from './chunker';
import { EmbeddingProviderFactory, IEmbeddingProvider } from './embedding-provider';
import { ragStorage } from './storage';
import { academyStore } from '../academy-store';
import { cmsStore } from '../cms-store';
import { getAllInterviewQuestions } from '../interview-questions-bank';

export interface ExtractedSourcePayload {
  sourceType: RAGSourceType;
  sourceId: string;
  sourceTitle: string;
  courseId?: string | null;
  moduleId?: string | null;
  lessonId?: string | null;
  category?: string | null;
  topic?: string | null;
  publicationStatus: RAGPublicationStatus;
  rawText: string;
  htmlContent?: string;
  metadata?: Record<string, any>;
}

import { waitForAllSyncs } from './sync-tracker';

export class RAGIndexer {
  private embeddingProvider: IEmbeddingProvider;

  constructor(embeddingProvider?: IEmbeddingProvider) {
    this.embeddingProvider = embeddingProvider || EmbeddingProviderFactory.getProvider();
  }

  // ==========================================
  // 1. EXTRACT SOURCE DATA
  // ==========================================

  public extractSource(sourceType: RAGSourceType, sourceId: string): ExtractedSourcePayload | null {
    if (sourceType === 'lesson') {
      const res = academyStore.getLesson(sourceId);
      if (!res || !res.lesson) return null;
      const { lesson, course, module } = res;
      return {
        sourceType: 'lesson',
        sourceId: lesson.id,
        sourceTitle: lesson.title,
        courseId: course?.id || lesson.courseId,
        moduleId: module?.id || lesson.moduleId,
        lessonId: lesson.id,
        category: course?.categoryId || null,
        topic: module?.title || null,
        publicationStatus: (lesson.status as RAGPublicationStatus) || 'published',
        rawText: `${lesson.title}\n\n${lesson.summary || ''}\n\n${lesson.contentHtml || ''}`,
        htmlContent: lesson.contentHtml,
        metadata: {
          slug: lesson.slug,
          courseSlug: course?.slug,
          readTime: lesson.estimatedReadTime,
          wordCount: lesson.wordCount,
        },
      };
    }

    if (sourceType === 'course') {
      const course = academyStore.getCourse(sourceId);
      if (!course) return null;
      return {
        sourceType: 'course',
        sourceId: course.id,
        sourceTitle: course.title,
        courseId: course.id,
        category: course.categoryId,
        publicationStatus: (course.status as RAGPublicationStatus) || 'published',
        rawText: `Course: ${course.title}\nSubtitle: ${course.subtitle || ''}\nDescription: ${course.description || ''}\nLevel: ${course.level}`,
        metadata: {
          slug: course.slug,
          level: course.level,
          estimatedHours: course.estimatedHours,
        },
      };
    }

    if (sourceType === 'module') {
      for (const course of academyStore.getCourses({ includeDrafts: true })) {
        const mod = (course.modules || []).find((m) => m.id === sourceId || m.slug === sourceId);
        if (mod) {
          return {
            sourceType: 'module',
            sourceId: mod.id,
            sourceTitle: mod.title,
            courseId: course.id,
            moduleId: mod.id,
            publicationStatus: (mod.status as RAGPublicationStatus) || 'published',
            rawText: `Module: ${mod.title}\nDescription: ${mod.description || ''}`,
            metadata: {
              slug: mod.slug,
              sortOrder: mod.sortOrder,
            },
          };
        }
      }
      return null;
    }

    if (sourceType === 'interview_question') {
      const all = getAllInterviewQuestions();
      const q = all.find((item) => item.id === sourceId);
      if (!q) return null;
      return {
        sourceType: 'interview_question',
        sourceId: q.id,
        sourceTitle: q.question,
        category: q.category,
        topic: q.topic,
        publicationStatus: 'published',
        rawText: `Question: ${q.question}\nAnswer: ${q.answerSummary}\nBest Practice: ${q.bestPractice}\nPitfall: ${q.pitfallToAvoid}`,
        metadata: {
          difficulty: q.difficulty,
          technology: q.technology,
          expected_focus: q.expectedFocus,
          answer_summary: q.answerSummary,
          code_snippet: q.codeSnippet,
          best_practice: q.bestPractice,
          pitfall_to_avoid: q.pitfallToAvoid,
        },
      };
    }

    if (sourceType === 'article') {
      const art = cmsStore.getArticleById(sourceId);
      if (!art) return null;
      const textBlocks = (art.content?.blocks || [])
        .map((b: any) => b.data?.text || b.data?.message || '')
        .join('\n\n');
      return {
        sourceType: 'article',
        sourceId: art.id,
        sourceTitle: art.title,
        category: art.category,
        publicationStatus: (art.status as RAGPublicationStatus) || 'published',
        rawText: `Title: ${art.title}\nSummary: ${art.shortDescription}\n\n${textBlocks}`,
        htmlContent: textBlocks,
        metadata: {
          slug: art.slug,
          tags: art.tags,
          readingTime: art.readingTimeMinutes,
        },
      };
    }

    if (sourceType === 'document_source') {
      const doc = academyStore.getDocumentSource(sourceId);
      if (!doc) return null;
      let associatedLessonTitle = '';
      if (doc.lessonId) {
        const lRes = academyStore.getLesson(doc.lessonId);
        if (lRes?.lesson) associatedLessonTitle = lRes.lesson.title;
      }
      return {
        sourceType: 'document_source',
        sourceId: doc.id,
        sourceTitle: doc.originalFilename,
        lessonId: doc.lessonId || null,
        publicationStatus: 'published',
        rawText: `Document: ${doc.originalFilename}\nLesson: ${associatedLessonTitle}\nStorage Path: ${doc.storagePath}\nType: ${doc.mimeType}`,
        metadata: {
          originalFilename: doc.originalFilename,
          storagePath: doc.storagePath,
          mimeType: doc.mimeType,
          fileSizeBytes: doc.fileSizeBytes,
          fileHashSha256: doc.fileHashSha256,
          lessonId: doc.lessonId,
        },
      };
    }

    return null;
  }

  // ==========================================
  // 2. DISPATCH AUTOMATIC SYNC EVENT
  // ==========================================

  public async syncSourceEvent(
    sourceType: RAGSourceType,
    sourceId: string,
    operation: 'upsert' | 'unpublish' | 'delete',
    forcedPublicationStatus?: RAGPublicationStatus
  ): Promise<void> {
    const registryKey = `${sourceType}:${sourceId}`;
    const existing = await ragStorage.getKnowledgeSource(sourceType, sourceId);

    if (operation === 'delete') {
      await ragStorage.deactivateSourceChunks(sourceType, sourceId, 'deleted');
      await ragStorage.deleteSource(sourceType, sourceId);
      return;
    }

    if (operation === 'unpublish') {
      await ragStorage.deactivateSourceChunks(sourceType, sourceId, 'draft');
      return;
    }

    // Upsert / Change flow
    const extracted = this.extractSource(sourceType, sourceId);
    if (!extracted) {
      if (existing) {
        await ragStorage.deactivateSourceChunks(sourceType, sourceId, 'deleted');
      }
      return;
    }

    const effectiveStatus = forcedPublicationStatus || extracted.publicationStatus;

    // IMMEDIATE CONTROL: If unpublished or draft, immediately deactivate chunks
    if (effectiveStatus !== 'published') {
      await ragStorage.deactivateSourceChunks(sourceType, sourceId, effectiveStatus);
      return;
    }

    // Compute deterministic hash
    const contentHash = computeContentHash({
      rawText: extracted.rawText,
      metadata: extracted.metadata,
      title: extracted.sourceTitle,
      category: extracted.category,
      topic: extracted.topic,
    });

    const nextVersion = (existing?.currentVersion || 0) + 1;

    // Check if meaningful content is unchanged
    if (
      existing &&
      existing.indexedContentHash === contentHash &&
      existing.publicationStatus === 'published' &&
      existing.indexingStatus === 'completed'
    ) {
      // Content has not changed! Skip unnecessary re-embedding
      return;
    }

    // Upsert registry entry
    const updatedSource: KnowledgeSource = {
      id: registryKey,
      sourceType,
      sourceId,
      sourceTitle: extracted.sourceTitle,
      courseId: extracted.courseId,
      moduleId: extracted.moduleId,
      lessonId: extracted.lessonId,
      category: extracted.category,
      topic: extracted.topic,
      publicationStatus: effectiveStatus,
      currentContentHash: contentHash,
      currentVersion: nextVersion,
      indexedContentHash: existing?.indexedContentHash || null,
      indexedVersion: existing?.indexedVersion || 0,
      embeddingProvider: this.embeddingProvider.name,
      embeddingModel: this.embeddingProvider.model,
      embeddingDimensions: this.embeddingProvider.dimensions,
      indexingStatus: 'pending',
      chunkCount: existing?.chunkCount || 0,
      lastIndexedAt: existing?.lastIndexedAt || null,
      lastError: null,
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await ragStorage.upsertKnowledgeSource(updatedSource);

    // Enqueue transactional outbox job
    const isUpdate = Boolean(existing);
    const priority = isUpdate ? 100 : sourceType === 'lesson' ? 10 : 5;
    const job: IndexingJob = {
      id: uuidv4(),
      jobType: isUpdate ? 'reindex_source' : 'index_source',
      sourceType,
      sourceId,
      contentHash,
      version: nextVersion,
      status: 'pending',
      priority,
      attempts: 0,
      maxAttempts: 3,
      scheduledAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await ragStorage.enqueueJob(job);
  }

  // ==========================================
  // 3. EXECUTE INDEXING JOB WITH SAFE REPLACEMENT
  // ==========================================

  public async processJob(job: IndexingJob): Promise<{ success: boolean; error?: string }> {
    await ragStorage.updateJob(job.id, {
      status: 'processing',
      startedAt: new Date().toISOString(),
      attempts: job.attempts + 1,
    });

    try {
      const extracted = this.extractSource(job.sourceType, job.sourceId);
      if (!extracted) {
        await ragStorage.deactivateSourceChunks(job.sourceType, job.sourceId, 'deleted');
        await ragStorage.updateJob(job.id, {
          status: 'completed',
          completedAt: new Date().toISOString(),
        });
        return { success: true };
      }

      // Check current publication status immediately
      if (extracted.publicationStatus !== 'published') {
        await ragStorage.deactivateSourceChunks(
          job.sourceType,
          job.sourceId,
          extracted.publicationStatus
        );
        await ragStorage.updateJob(job.id, {
          status: 'skipped',
          completedAt: new Date().toISOString(),
        });
        return { success: true };
      }

      const contentHash = computeContentHash({
        rawText: extracted.rawText,
        metadata: extracted.metadata,
        title: extracted.sourceTitle,
        category: extracted.category,
        topic: extracted.topic,
      });

      // 1. Generate Intelligent Chunks
      const chunkInput: ChunkInput = {
        sourceType: job.sourceType,
        sourceId: job.sourceId,
        sourceTitle: extracted.sourceTitle,
        courseId: extracted.courseId,
        moduleId: extracted.moduleId,
        lessonId: extracted.lessonId,
        category: extracted.category,
        topic: extracted.topic,
        rawText: extracted.rawText,
        htmlContent: extracted.htmlContent,
        metadata: extracted.metadata,
      };

      const rawChunks = chunkContent(chunkInput);
      if (rawChunks.length === 0) {
        throw new Error('Chunking resulted in 0 chunks for source: ' + job.sourceId);
      }

      // 2. Generate Embeddings (in batch)
      const textsToEmbed = rawChunks.map((rc) => rc.chunkContent);
      const embeddings = await this.embeddingProvider.generateBatchEmbeddings(textsToEmbed);

      if (embeddings.length !== rawChunks.length) {
        throw new Error('Mismatch between chunk count and embedding count');
      }

      // 3. Stage new chunks with new content_version
      const now = new Date().toISOString();
      const stagedChunks: KnowledgeChunk[] = rawChunks.map((rc, idx) => ({
        id: uuidv4(),
        sourceType: job.sourceType,
        sourceId: job.sourceId,
        sourceTitle: extracted.sourceTitle,
        courseId: extracted.courseId,
        moduleId: extracted.moduleId,
        lessonId: extracted.lessonId,
        category: extracted.category,
        topic: extracted.topic,
        contentVersion: job.version,
        contentHash,
        chunkIndex: rc.chunkIndex,
        chunkContent: rc.chunkContent,
        tokenCount: rc.tokenCount,
        embedding: embeddings[idx],
        embeddingModel: this.embeddingProvider.model,
        embeddingVersion: this.embeddingProvider.version,
        publicationStatus: 'published',
        isActive: false, // Inactive until atomic activation!
        metadata: rc.metadata,
        indexedAt: now,
        createdAt: now,
        updatedAt: now,
      }));

      // Validate staged chunks
      for (const chunk of stagedChunks) {
        if (!chunk.embedding || chunk.embedding.length !== 768) {
          throw new Error(
            `Validation failed: embedding vector length must be exactly 768 (got ${chunk.embedding?.length ?? 0})`
          );
        }
        if (chunk.embeddingModel !== this.embeddingProvider.model) {
          throw new Error(
            `Embedding model mismatch: expected ${this.embeddingProvider.model}, received ${chunk.embeddingModel}`
          );
        }
      }

      // Save staged chunks
      await ragStorage.saveKnowledgeChunks(stagedChunks);

      // 4. ATOMIC ACTIVATION: Mark new version active, retire old chunks
      const activatedCount = await ragStorage.activateChunkVersion(
        job.sourceType,
        job.sourceId,
        job.version,
        'published'
      );

      // 5. Update Source Registry
      const source = await ragStorage.getKnowledgeSource(job.sourceType, job.sourceId);
      if (source) {
        source.indexedContentHash = contentHash;
        source.indexedVersion = job.version;
        source.indexingStatus = 'completed';
        source.chunkCount = activatedCount;
        source.embeddingProvider = this.embeddingProvider.name;
        source.embeddingModel = this.embeddingProvider.model;
        source.embeddingDimensions = this.embeddingProvider.dimensions;
        source.lastIndexedAt = now;
        source.lastError = null;
        source.updatedAt = now;
        await ragStorage.upsertKnowledgeSource(source);
      }

      // Mark Job Completed
      await ragStorage.updateJob(job.id, {
        status: 'completed',
        completedAt: now,
      });

      return { success: true };
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      console.error(`[RAGIndexer] Job ${job.id} failed:`, errMsg);

      const isFinalAttempt = job.attempts + 1 >= job.maxAttempts;
      const nextStatus = isFinalAttempt ? 'failed' : 'pending';

      await ragStorage.updateJob(job.id, {
        status: nextStatus,
        lastError: errMsg,
      });

      const source = await ragStorage.getKnowledgeSource(job.sourceType, job.sourceId);
      if (source) {
        source.indexingStatus = nextStatus;
        source.lastError = errMsg;
        source.updatedAt = new Date().toISOString();
        await ragStorage.upsertKnowledgeSource(source);
      }

      return { success: false, error: errMsg };
    }
  }

  // ==========================================
  // 4. BATCH PROCESSOR (Vercel-compatible)
  // ==========================================

  public async processBatch(batchSize: number = 25): Promise<{
    processed: number;
    succeeded: number;
    failed: number;
  }> {
    await waitForAllSyncs();
    const pendingJobs = await ragStorage.getPendingJobs(batchSize);
    let succeeded = 0;
    let failed = 0;

    for (const job of pendingJobs) {
      const res = await this.processJob(job);
      if (res.success) succeeded++;
      else failed++;
    }

    return {
      processed: pendingJobs.length,
      succeeded,
      failed,
    };
  }

  public async processSourceJobs(sourceType: RAGSourceType, sourceId: string): Promise<number> {
    const jobs = await ragStorage.getAllJobs();
    let count = 0;
    for (const j of jobs) {
      if (
        j.sourceType === sourceType &&
        j.sourceId === sourceId &&
        (j.status === 'pending' || j.status === 'processing')
      ) {
        await this.processJob(j);
        count++;
      }
    }
    return count;
  }

  // ==========================================
  // 5. FULL ACADEMY INGESTION SCAN
  // ==========================================

  public async ingestAllPublishedContent(): Promise<{ queued: number }> {
    let queued = 0;

    // 1. Courses
    const courses = academyStore.getCourses({ includeDrafts: true });
    for (const c of courses) {
      if (c.status === 'published') {
        await this.syncSourceEvent('course', c.id, 'upsert', 'published');
        queued++;
      }
      for (const m of c.modules || []) {
        if (m.status === 'published') {
          await this.syncSourceEvent('module', m.id, 'upsert', 'published');
          queued++;
        }
        for (const l of m.lessons || []) {
          if (l.status === 'published') {
            await this.syncSourceEvent('lesson', l.id, 'upsert', 'published');
            queued++;
          }
        }
      }
    }

    // 2. CMS Articles
    const articles = cmsStore.getArticles({ status: 'published' });
    for (const a of articles) {
      if (a.status === 'published') {
        await this.syncSourceEvent('article', a.id, 'upsert', 'published');
        queued++;
      }
    }

    // 3. All 800 Interview Questions
    const questions = getAllInterviewQuestions();
    for (const q of questions) {
      await this.syncSourceEvent('interview_question', q.id, 'upsert', 'published');
      queued++;
    }

    // 4. Published Document Sources
    const docSources = academyStore.getDocumentSources();
    for (const d of docSources) {
      await this.syncSourceEvent('document_source', d.id, 'upsert', 'published');
      queued++;
    }

    return { queued };
  }
}

export const ragIndexer = new RAGIndexer();
