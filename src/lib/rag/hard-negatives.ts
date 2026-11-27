import crypto from 'crypto';
import { RetrievedChunk, RAGSourceType } from './types';

export type HardNegativeStatus = 'pending_review' | 'verified_negative' | 'false_negative';

export interface HardNegativeCandidate {
  id: string;
  syntheticQueryId?: string | null;
  queryText: string;
  positiveSourceId: string;
  negativeSourceId: string;
  negativeSourceType: RAGSourceType;
  similarityScore: number;
  retrievalMethod: 'lexical' | 'vector' | 'hybrid';
  status: HardNegativeStatus;
  createdAt: string;
  reviewedAt?: string | null;
}

export interface HardNegativeMiningConfig {
  minSimilarity?: number;
  maxSimilarity?: number;
  maxNegativesPerQuery?: number;
}

/**
 * Selects hard-negative candidates from retrieved results within a configurable
 * similarity band, excluding the positive source ID.
 * Candidates default to 'pending_review' so admins can verify relevance.
 */
export function mineHardNegativesFromResults(
  queryText: string,
  positiveSourceId: string,
  candidates: RetrievedChunk[],
  config: HardNegativeMiningConfig = {},
  syntheticQueryId?: string | null
): HardNegativeCandidate[] {
  const minSim = config.minSimilarity ?? 0.35;
  const maxSim = config.maxSimilarity ?? 0.88;
  const limit = config.maxNegativesPerQuery ?? 3;
  const now = new Date().toISOString();

  const seenSourceIds = new Set<string>([positiveSourceId]);
  const mined: HardNegativeCandidate[] = [];

  for (const item of candidates) {
    const sid = item.chunk.sourceId;
    if (seenSourceIds.has(sid)) continue;
    if (item.similarity < minSim || item.similarity > maxSim) continue;

    seenSourceIds.add(sid);
    mined.push({
      id: crypto.randomUUID(),
      syntheticQueryId: syntheticQueryId ?? null,
      queryText,
      positiveSourceId,
      negativeSourceId: sid,
      negativeSourceType: item.chunk.sourceType,
      similarityScore: item.similarity,
      retrievalMethod: 'hybrid',
      status: 'pending_review',
      createdAt: now,
      reviewedAt: null,
    });

    if (mined.length >= limit) break;
  }

  return mined;
}

export class HardNegativeStore {
  private candidates: HardNegativeCandidate[] = [];

  addCandidates(items: HardNegativeCandidate[]): HardNegativeCandidate[] {
    const existing = new Set(
      this.candidates.map(
        (c) => `${c.positiveSourceId}::${c.negativeSourceId}::${c.queryText.toLowerCase()}`
      )
    );
    const added: HardNegativeCandidate[] = [];
    for (const item of items) {
      const key = `${item.positiveSourceId}::${item.negativeSourceId}::${item.queryText.toLowerCase()}`;
      if (!existing.has(key)) {
        existing.add(key);
        this.candidates.push(item);
        added.push(item);
      }
    }
    return added;
  }

  list(status?: HardNegativeStatus): HardNegativeCandidate[] {
    if (!status) return [...this.candidates];
    return this.candidates.filter((c) => c.status === status);
  }

  review(id: string, status: 'verified_negative' | 'false_negative'): HardNegativeCandidate | null {
    const rec = this.candidates.find((c) => c.id === id);
    if (!rec) return null;
    rec.status = status;
    rec.reviewedAt = new Date().toISOString();
    return rec;
  }

  clear(): void {
    this.candidates = [];
  }
}

export const hardNegativeStore = new HardNegativeStore();
