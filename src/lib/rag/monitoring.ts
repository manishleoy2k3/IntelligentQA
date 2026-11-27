import crypto from 'crypto';
import { EMBEDDING_MODEL_CATALOG, BenchmarkMetrics } from './benchmark';
import { EmbeddingProviderFactory } from './embedding-provider';

export type AdminQueryFlag =
  | 'correct_retrieval'
  | 'wrong_retrieval'
  | 'missing_source'
  | 'incorrect_ranking'
  | 'incorrect_answer';

export interface RetrievalAnalyticsEvent {
  id: string;
  queryHash: string;
  queryPreview: string;
  queryCategory: string;
  technology: string | null;
  intent: string;
  resultCount: number;
  topSimilarity: number;
  latencyMs: number;
  embeddingModel: string;
  embeddingVersion: string;
  adminFlag?: AdminQueryFlag | null;
  createdAt: string;
}

class RetrievalMonitoringStore {
  private events: RetrievalAnalyticsEvent[] = [];
  private latestBenchmark: BenchmarkMetrics | null = null;

  recordQuery(
    input: Omit<RetrievalAnalyticsEvent, 'id' | 'queryHash' | 'createdAt'>
  ): RetrievalAnalyticsEvent {
    const event: RetrievalAnalyticsEvent = {
      id: crypto.randomUUID(),
      queryHash: crypto
        .createHash('sha256')
        .update(input.queryPreview.toLowerCase())
        .digest('hex')
        .slice(0, 16),
      ...input,
      queryPreview: input.queryPreview.slice(0, 200),
      createdAt: new Date().toISOString(),
    };
    this.events.unshift(event);
    if (this.events.length > 500) {
      this.events = this.events.slice(0, 500);
    }
    return event;
  }

  flagQuery(id: string, flag: AdminQueryFlag): RetrievalAnalyticsEvent | null {
    const ev = this.events.find((e) => e.id === id);
    if (!ev) return null;
    ev.adminFlag = flag;
    return ev;
  }

  setLatestBenchmark(metrics: BenchmarkMetrics): void {
    this.latestBenchmark = metrics;
  }

  getDashboardSummary() {
    const total = this.events.length;
    const noResults = this.events.filter((e) => e.resultCount === 0).length;
    const lowConfidence = this.events.filter(
      (e) => e.topSimilarity > 0 && e.topSimilarity < 0.45
    ).length;

    const flagBreakdown: Record<string, number> = {};
    for (const ev of this.events) {
      if (ev.adminFlag) {
        flagBreakdown[ev.adminFlag] = (flagBreakdown[ev.adminFlag] || 0) + 1;
      }
    }

    const activeModel = EmbeddingProviderFactory.getActiveProviderMetadata();

    return {
      totalQueriesLogged: total,
      noResultQueryRate: total > 0 ? Number((noResults / total).toFixed(4)) : 0,
      lowConfidenceQueries: lowConfidence,
      flagBreakdown,
      activeEmbeddingModel: activeModel,
      latestBenchmark: this.latestBenchmark,
      supportedModelsCatalog: EMBEDDING_MODEL_CATALOG,
      recentEvents: this.events.slice(0, 25),
    };
  }
}

export const retrievalMonitoring = new RetrievalMonitoringStore();
