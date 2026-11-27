export interface EmbeddingModelSpec {
  model: string;
  provider: string;
  dimensions: number;
  contextWindow: number;
  license: string;
  hosting: string;
  estimatedLatencyMs: number;
  estimatedCostPer1MTokensUsd: number;
  suitability: string;
  recommendedForCode: boolean;
}

export const EMBEDDING_MODEL_CATALOG: EmbeddingModelSpec[] = [
  {
    model: 'gemini-embedding-001',
    provider: 'Google AI Studio / Gemini API',
    dimensions: 768,
    contextWindow: 2048,
    license: 'Proprietary (API)',
    hosting: 'Managed API (zero local GPU/RAM)',
    estimatedLatencyMs: 110,
    estimatedCostPer1MTokensUsd: 0.15,
    suitability:
      'High-quality general + technical QA; Matryoshka 768-dim compatible with existing pgvector HNSW index.',
    recommendedForCode: false,
  },
  {
    model: 'nomic-embed-text-v1.5',
    provider: 'Nomic AI (Ollama / ONNX)',
    dimensions: 768,
    contextWindow: 8192,
    license: 'Apache-2.0',
    hosting: 'Local CPU/GPU or self-hosted container',
    estimatedLatencyMs: 28,
    estimatedCostPer1MTokensUsd: 0,
    suitability:
      'Strong long-context technical docs & articles; 768-dim drop-in compatible with pgvector.',
    recommendedForCode: false,
  },
  {
    model: 'embeddinggemma-300m',
    provider: 'Google (Local ONNX / Transformers)',
    dimensions: 768,
    contextWindow: 2048,
    license: 'Gemma Terms of Use',
    hosting: 'Local CPU/GPU (~600MB RAM)',
    estimatedLatencyMs: 35,
    estimatedCostPer1MTokensUsd: 0,
    suitability: 'Compact on-device/edge embedding model for low-latency QA retrieval.',
    recommendedForCode: false,
  },
  {
    model: 'jina-embeddings-v2-base-code',
    provider: 'Jina AI (ONNX / HuggingFace)',
    dimensions: 768,
    contextWindow: 8192,
    license: 'Apache-2.0',
    hosting: 'Local CPU/GPU or self-hosted container',
    estimatedLatencyMs: 32,
    estimatedCostPer1MTokensUsd: 0,
    suitability:
      'Code-specialized 768-dim model for coding library, APIs, and multi-language snippets.',
    recommendedForCode: true,
  },
];

export interface BenchmarkCase {
  id: string;
  query: string;
  expectedSourceIds: string[];
  expectedSourceType?: string;
}

export interface BenchmarkMetrics {
  datasetSize: number;
  recallAt5: number;
  recallAt10: number;
  mrr: number;
  ndcgAt5: number;
  avgLatencyMs: number;
}

/**
 * Computes Recall@5, Recall@10, MRR, and nDCG@5 from ranked retrieved source IDs.
 */
export function computeRetrievalMetrics(
  results: Array<{ expectedIds: string[]; retrievedIds: string[]; latencyMs: number }>
): BenchmarkMetrics {
  const n = results.length || 1;
  let r5 = 0;
  let r10 = 0;
  let mrrSum = 0;
  let ndcg5Sum = 0;
  let latencySum = 0;

  for (const row of results) {
    latencySum += row.latencyMs;
    const expected = new Set(row.expectedIds);
    const top5 = row.retrievedIds.slice(0, 5);
    const top10 = row.retrievedIds.slice(0, 10);

    if (top5.some((id) => expected.has(id))) r5 += 1;
    if (top10.some((id) => expected.has(id))) r10 += 1;

    const firstRank = row.retrievedIds.findIndex((id) => expected.has(id));
    if (firstRank !== -1) {
      mrrSum += 1 / (firstRank + 1);
    }

    // nDCG@5 (binary relevance)
    let dcg = 0;
    for (let i = 0; i < top5.length; i++) {
      if (expected.has(top5[i])) {
        dcg += 1 / Math.log2(i + 2);
      }
    }
    const idealHits = Math.min(expected.size, 5);
    let idcg = 0;
    for (let i = 0; i < idealHits; i++) {
      idcg += 1 / Math.log2(i + 2);
    }
    ndcg5Sum += idcg > 0 ? dcg / idcg : 0;
  }

  return {
    datasetSize: results.length,
    recallAt5: Number((r5 / n).toFixed(4)),
    recallAt10: Number((r10 / n).toFixed(4)),
    mrr: Number((mrrSum / n).toFixed(4)),
    ndcgAt5: Number((ndcg5Sum / n).toFixed(4)),
    avgLatencyMs: Number((latencySum / n).toFixed(2)),
  };
}
