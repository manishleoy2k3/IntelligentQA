import { RAGSourceType, RAGPublicationStatus } from './types';
import { ragCache } from './cache';
import { ragStorage } from './storage';
import { ragIndexer } from './indexer';
import { trackSyncPromise } from './sync-tracker';

/**
 * Universal Content-Change Synchronization Hook:
 * Called whenever an administrator or CMS operation mutates course content,
 * lessons, modules, interview questions, or CMS articles.
 *
 * Guarantees:
 * 1. Immediate invalidation of any cached answers referencing this source.
 * 2. Immediate deactivation of chunks if unpublished or deleted.
 * 3. Enqueuing of transactional indexing job.
 * 4. Asynchronous batch processing trigger.
 */
let isBatchRunning = false;

export function syncContentChange(
  sourceType: RAGSourceType,
  sourceId: string,
  operation: 'upsert' | 'unpublish' | 'delete',
  status?: RAGPublicationStatus
): Promise<void> {
  const syncPromise = (async () => {
    try {
      // 1. Immediately invalidate cache
      ragCache.invalidateSource(sourceId);

      // 2. Immediate retrieval exclusion for unpublish / delete
      if (
        operation === 'unpublish' ||
        operation === 'delete' ||
        (status && status !== 'published')
      ) {
        await ragStorage.deactivateSourceChunks(
          sourceType,
          sourceId,
          operation === 'delete' ? 'deleted' : status || 'draft'
        );
      }

      // 3. Queue event in transactional outbox
      await ragIndexer.syncSourceEvent(sourceType, sourceId, operation, status);

      // 4. Immediately process the indexing job for this specific source for instant freshness
      if (operation === 'upsert' && (!status || status === 'published')) {
        await ragIndexer.processSourceJobs(sourceType, sourceId);
      }

      // 5. Trigger background processor batch (non-blocking, single flight)
      if (!isBatchRunning && process.env.NODE_ENV !== 'test') {
        isBatchRunning = true;
        Promise.resolve().then(async () => {
          try {
            await ragIndexer.processBatch(5);
          } catch (e: any) {
            console.warn('[syncContentChange] Async batch execution notice:', e?.message);
          } finally {
            isBatchRunning = false;
          }
        });
      }
    } catch (err: any) {
      console.error('[syncContentChange] Fatal error synchronizing content change:', err?.message);
    }
  })();

  trackSyncPromise(syncPromise);
  return syncPromise;
}
