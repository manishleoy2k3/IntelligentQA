import { ragStorage } from './storage';
import { ragIndexer } from './indexer';
import { academyStore } from '../academy-store';
import { cmsStore } from '../cms-store';
import { getAllInterviewQuestions } from '../interview-questions-bank';
import { computeContentHash } from './hash';

export interface ReconciliationReport {
  scannedCount: number;
  missingSourcesQueued: number;
  outdatedSourcesQueued: number;
  deactivatedOrphanCount: number;
  failedJobsRetried: number;
  timestamp: string;
}

export class RAGReconciler {
  /**
   * Comprehensive reconciliation scan:
   * 1. Inspects all courses, modules, lessons, articles, and interview questions.
   * 2. Detects missing sources or hash mismatches.
   * 3. Detects orphaned chunks whose source was deleted or unpublished.
   * 4. Retries failed jobs.
   */
  public async runReconciliationScan(): Promise<ReconciliationReport> {
    const report: ReconciliationReport = {
      scannedCount: 0,
      missingSourcesQueued: 0,
      outdatedSourcesQueued: 0,
      deactivatedOrphanCount: 0,
      failedJobsRetried: 0,
      timestamp: new Date().toISOString(),
    };

    const existingSources = await ragStorage.getKnowledgeSources();
    const sourceMap = new Map(existingSources.map((s) => [`${s.sourceType}:${s.sourceId}`, s]));

    // 1. Scan Lessons
    const courses = academyStore.getCourses({ includeDrafts: true });
    const liveLessonIds = new Set<string>();

    for (const c of courses) {
      for (const m of c.modules || []) {
        for (const l of m.lessons || []) {
          liveLessonIds.add(l.id);
          report.scannedCount++;

          const key = `lesson:${l.id}`;
          const existing = sourceMap.get(key);

          if (l.status === 'published') {
            const raw = `${l.title}\n\n${l.summary || ''}\n\n${l.contentHtml || ''}`;
            const hash = computeContentHash({
              rawText: raw,
              title: l.title,
            });

            if (!existing) {
              await ragIndexer.syncSourceEvent('lesson', l.id, 'upsert', 'published');
              report.missingSourcesQueued++;
            } else if (existing.indexedContentHash !== hash) {
              await ragIndexer.syncSourceEvent('lesson', l.id, 'upsert', 'published');
              report.outdatedSourcesQueued++;
            }
          } else {
            // Lesson is draft/archived: ensure deactivated
            if (existing && existing.publicationStatus === 'published') {
              await ragStorage.deactivateSourceChunks('lesson', l.id, 'draft');
              report.deactivatedOrphanCount++;
            }
          }
        }
      }
    }

    // 2. Scan Interview Questions
    const questions = getAllInterviewQuestions();
    for (const q of questions) {
      report.scannedCount++;
      const key = `interview_question:${q.id}`;
      const existing = sourceMap.get(key);

      const raw = `Question: ${q.question}\nAnswer: ${q.answerSummary}\nBest Practice: ${q.bestPractice}\nPitfall: ${q.pitfallToAvoid}`;
      const hash = computeContentHash({
        rawText: raw,
        title: q.question,
      });

      if (!existing) {
        await ragIndexer.syncSourceEvent('interview_question', q.id, 'upsert', 'published');
        report.missingSourcesQueued++;
      } else if (existing.indexedContentHash !== hash) {
        await ragIndexer.syncSourceEvent('interview_question', q.id, 'upsert', 'published');
        report.outdatedSourcesQueued++;
      }
    }

    // 3. Scan Articles
    const articles = cmsStore.getArticles();
    for (const a of articles) {
      report.scannedCount++;
      const key = `article:${a.id}`;
      const existing = sourceMap.get(key);

      if (a.status === 'published') {
        const textBlocks = (a.content?.blocks || [])
          .map((b: any) => b.data?.text || '')
          .join('\n\n');
        const hash = computeContentHash({
          rawText: textBlocks,
          title: a.title,
        });

        if (!existing) {
          await ragIndexer.syncSourceEvent('article', a.id, 'upsert', 'published');
          report.missingSourcesQueued++;
        } else if (existing.indexedContentHash !== hash) {
          await ragIndexer.syncSourceEvent('article', a.id, 'upsert', 'published');
          report.outdatedSourcesQueued++;
        }
      } else {
        if (existing && existing.publicationStatus === 'published') {
          await ragStorage.deactivateSourceChunks('article', a.id, 'draft');
          report.deactivatedOrphanCount++;
        }
      }
    }

    // 4. Abandoned Job Recovery & Retry Failed Jobs
    const allJobs = await ragStorage.getAllJobs();
    const now = Date.now();
    for (const job of allJobs) {
      // Recover abandoned processing jobs (serverless crash or timeout > 5m)
      if (job.status === 'processing' && job.startedAt) {
        const startedTime = new Date(job.startedAt).getTime();
        if (now - startedTime > 5 * 60 * 1000) {
          const nextStatus = job.attempts >= job.maxAttempts ? 'failed' : 'pending';
          await ragStorage.updateJob(job.id, {
            status: nextStatus,
            lastError: 'Abandoned job recovered by reconciliation scanner (timeout > 5m)',
          });
        }
      }

      if (job.status === 'failed') {
        await ragStorage.updateJob(job.id, {
          status: 'pending',
          attempts: 0,
          scheduledAt: new Date().toISOString(),
        });
        report.failedJobsRetried++;
      }
    }

    // Process initial batch of repair jobs immediately
    await ragIndexer.processBatch(25);

    return report;
  }
}

export const ragReconciler = new RAGReconciler();
