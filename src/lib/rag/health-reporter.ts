import { ragStorage } from './storage';
import { academyStore } from '../academy-store';
import { cmsStore } from '../cms-store';
import { getAllInterviewQuestions } from '../interview-questions-bank';
import { EmbeddingProviderFactory } from './embedding-provider';

export interface RAGProductionHealthReport {
  publishedCourses: number;
  publishedModules: number;
  publishedLessons: number;
  publishedCmsArticles: number;
  interviewQuestions: number;
  publishedDocumentSources: number;
  successfullyIndexedSources: number;
  activeChunks: number;
  pendingJobs: number;
  failedJobs: number;
  supersededInactiveChunks: number;
  sourcesMissingFromActiveIndex: Array<{
    sourceType: string;
    sourceId: string;
    sourceTitle: string;
  }>;
  all800InterviewQuestionsIndexed: boolean;
  indexedInterviewQuestionsCount: number;
  embeddingProvider: string;
  embeddingModel: string;
  embeddingDimensions: number;
  persistenceLayer: string;
  timestamp: string;
}

export async function generateProductionHealthReport(): Promise<RAGProductionHealthReport> {
  // 1. Read Actual Published Entities from Authoritative Stores
  const courses = academyStore.getCourses();
  let moduleCount = 0;
  let lessonCount = 0;
  const publishedLessons: Array<{ id: string; title: string }> = [];

  for (const c of courses) {
    for (const m of c.modules || []) {
      if (m.status === 'published') {
        moduleCount++;
        for (const l of m.lessons || []) {
          if (l.status === 'published') {
            lessonCount++;
            publishedLessons.push({ id: l.id, title: l.title });
          }
        }
      }
    }
  }

  const articles = cmsStore.getArticles({ status: 'published' });
  const allInterviewQuestions = getAllInterviewQuestions();
  const docSources = academyStore.getDocumentSources();

  // 2. Read Actual Storage / Database State
  const audit = await ragStorage.getAuditSummary();
  const allStoredSources = await ragStorage.getKnowledgeSources();
  const allStoredJobs = await ragStorage.getAllJobs();

  const indexedSourcesMap = new Map<string, (typeof allStoredSources)[0]>();
  for (const s of allStoredSources) {
    if (s.indexingStatus === 'completed' && s.indexedVersion === s.currentVersion) {
      indexedSourcesMap.set(`${s.sourceType}:${s.sourceId}`, s);
    }
  }

  // 3. Find sources missing from the active index
  const missingSources: Array<{ sourceType: string; sourceId: string; sourceTitle: string }> = [];

  for (const c of courses) {
    const key = `course:${c.id}`;
    if (!indexedSourcesMap.has(key)) {
      missingSources.push({ sourceType: 'course', sourceId: c.id, sourceTitle: c.title });
    }
  }

  for (const l of publishedLessons) {
    const key = `lesson:${l.id}`;
    if (!indexedSourcesMap.has(key)) {
      missingSources.push({ sourceType: 'lesson', sourceId: l.id, sourceTitle: l.title });
    }
  }

  for (const a of articles) {
    const key = `article:${a.id}`;
    if (!indexedSourcesMap.has(key)) {
      missingSources.push({ sourceType: 'article', sourceId: a.id, sourceTitle: a.title });
    }
  }

  let indexedIQCount = 0;
  for (const q of allInterviewQuestions) {
    const key = `interview_question:${q.id}`;
    if (indexedSourcesMap.has(key)) {
      indexedIQCount++;
    } else {
      missingSources.push({
        sourceType: 'interview_question',
        sourceId: q.id,
        sourceTitle: q.question,
      });
    }
  }

  for (const d of docSources) {
    const key = `document_source:${d.id}`;
    if (!indexedSourcesMap.has(key)) {
      missingSources.push({
        sourceType: 'document_source',
        sourceId: d.id,
        sourceTitle: d.originalFilename,
      });
    }
  }

  const activeChunks = await ragStorage.getActiveChunks();
  const inactiveChunksCount = audit.supersededVersions;

  const providerMeta = EmbeddingProviderFactory.getActiveProviderMetadata();

  return {
    publishedCourses: courses.length,
    publishedModules: moduleCount,
    publishedLessons: lessonCount,
    publishedCmsArticles: articles.length,
    interviewQuestions: allInterviewQuestions.length,
    publishedDocumentSources: docSources.length,
    successfullyIndexedSources: indexedSourcesMap.size,
    activeChunks: activeChunks.length,
    pendingJobs: audit.pendingJobs,
    failedJobs: audit.failedJobs,
    supersededInactiveChunks: inactiveChunksCount,
    sourcesMissingFromActiveIndex: missingSources,
    all800InterviewQuestionsIndexed: indexedIQCount === 800,
    indexedInterviewQuestionsCount: indexedIQCount,
    embeddingProvider: audit.embeddingProvider || providerMeta.name,
    embeddingModel: audit.embeddingModel || providerMeta.model,
    embeddingDimensions: audit.embeddingDimensions || providerMeta.dimensions,
    persistenceLayer: audit.persistenceLayer || 'Local Storage (Test/Dev)',
    timestamp: new Date().toISOString(),
  };
}
