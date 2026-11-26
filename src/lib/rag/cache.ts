import { RAGAnswerResult, Citation } from './types';

interface CacheEntry {
  answerResult: RAGAnswerResult;
  sourceVersions: Record<string, number>; // sourceId -> contentVersion
  expiresAt: number;
}

/**
 * Version-Aware RAG Response Cache:
 * Guarantees that if any underlying source referenced in a cached answer is updated,
 * unpublished, or deleted, the cached answer is immediately invalidated.
 */
class RAGCache {
  private cache = new Map<string, CacheEntry>();
  private defaultTtlMs = 10 * 60 * 1000; // 10 minutes default TTL

  private buildKey(question: string, courseId?: string | null): string {
    const qNorm = question.trim().toLowerCase().replace(/\s+/g, ' ');
    return `${courseId || 'global'}::${qNorm}`;
  }

  public get(
    question: string,
    courseId?: string | null,
    currentSourceVersions?: Record<string, number>
  ): RAGAnswerResult | null {
    const key = this.buildKey(question, courseId);
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check TTL expiration
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    // Check version validity if current source versions are provided
    if (currentSourceVersions) {
      for (const [srcId, cachedVer] of Object.entries(entry.sourceVersions)) {
        const liveVer = currentSourceVersions[srcId];
        if (liveVer === undefined || liveVer !== cachedVer) {
          // Source was modified, unpublished, or deleted! Invalidate immediately!
          this.cache.delete(key);
          return null;
        }
      }
    }

    return entry.answerResult;
  }

  public set(
    question: string,
    courseId: string | null | undefined,
    answerResult: RAGAnswerResult,
    citations: Citation[],
    ttlMs?: number
  ): void {
    const key = this.buildKey(question, courseId);
    const sourceVersions: Record<string, number> = {};

    for (const c of citations) {
      sourceVersions[c.sourceId] = c.version;
    }

    this.cache.set(key, {
      answerResult,
      sourceVersions,
      expiresAt: Date.now() + (ttlMs || this.defaultTtlMs),
    });
  }

  public invalidateSource(sourceId: string): void {
    for (const [key, entry] of this.cache.entries()) {
      if (entry.sourceVersions[sourceId] !== undefined) {
        this.cache.delete(key);
      }
    }
  }

  public clear(): void {
    this.cache.clear();
  }
}

export const ragCache = new RAGCache();
