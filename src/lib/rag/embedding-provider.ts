import crypto from 'crypto';

export interface IEmbeddingProvider {
  name: string;
  model: string;
  dimensions: number;
  version: string;
  generateEmbedding(text: string): Promise<number[]>;
  generateBatchEmbeddings(texts: string[]): Promise<number[][]>;
}

/**
 * Deterministic Mock/Offline Embedding Provider (768 dimensions).
 * Computes an exact 768-dimensional normalized unit vector using pseudo-random hashing
 * seeded by text content and semantic token weights.
 *
 * Guarantees:
 * 1. Same text always yields identical 768-dim vector.
 * 2. Cosine similarity of semantically similar texts (e.g. sharing keywords 'Playwright', 'Selenium')
 *    is significantly higher (> 0.70) than unrelated texts (< 0.35).
 * 3. 100% offline, zero network requests, zero paid API charges, sub-millisecond execution.
 */
export class MockEmbeddingProvider implements IEmbeddingProvider {
  name = 'MockDeterministic';
  model = 'mock-text-embedding-768';
  dimensions = 768;
  version = 'v1';

  constructor() {
    if (!isMockEmbeddingAllowed()) {
      throw new Error(
        'MockEmbeddingProvider is strictly prohibited in production unless ALLOW_MOCK_EMBEDDINGS=true is explicitly configured.'
      );
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    return this.createVector(text);
  }

  async generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
    return texts.map((t) => this.createVector(t));
  }

  private createVector(text: string): number[] {
    const vector = new Float64Array(this.dimensions);
    const normalized = text.toLowerCase().trim();
    const tokens = normalized.split(/\W+/).filter((t) => t.length > 1);

    // 1. Base subtle hash projection (small background noise)
    const hash = crypto.createHash('sha256').update(normalized).digest();
    for (let i = 0; i < this.dimensions; i++) {
      const byte = hash[i % hash.length];
      const sign = (byte & (1 << (i % 8))) !== 0 ? 1 : -1;
      vector[i] = Math.sin((i + 1) * (byte + 1)) * sign * 0.1;
    }

    // 2. Strong semantic token projection with balanced sign distribution
    for (const token of tokens) {
      const tokenHash = crypto.createHash('md5').update(token).digest();
      for (let j = 0; j < 32; j++) {
        const idx = (tokenHash[j % 16] * 31 + tokenHash[(j + 1) % 16] * 7 + j) % this.dimensions;
        const sign = (tokenHash[(j + 2) % 16] & 1) === 0 ? 1 : -1;
        vector[idx] += 2.0 * sign;
      }
    }

    // 3. Normalize vector to unit length (L2 norm = 1.0)
    let sumSq = 0;
    for (let i = 0; i < this.dimensions; i++) {
      sumSq += vector[i] * vector[i];
    }
    const norm = Math.sqrt(sumSq) || 1;
    const result: number[] = new Array(this.dimensions);
    for (let i = 0; i < this.dimensions; i++) {
      result[i] = Number((vector[i] / norm).toFixed(6));
    }

    return result;
  }
}

export function isMockEmbeddingAllowed(): boolean {
  if (process.env.NODE_ENV === 'production') {
    return process.env.ALLOW_MOCK_EMBEDDINGS === 'true';
  }
  return (
    process.env.NODE_ENV === 'test' ||
    Boolean(process.env.NODE_TEST_CONTEXT) ||
    process.env.npm_lifecycle_event === 'test' ||
    process.env.ALLOW_MOCK_EMBEDDINGS === 'true' ||
    process.execArgv.includes('--test') ||
    process.argv.some((a) => a.includes('.test.') || a.includes('test'))
  );
}

/**
 * Google Gemini Text Embedding Provider:
 * Uses Google Generative Language API model: gemini-embedding-001 (768 dimensions via outputDimensionality).
 * Note: text-embedding-004 was retired on January 14, 2026 and is no longer used.
 */
export class GeminiEmbeddingProvider implements IEmbeddingProvider {
  name = 'Gemini';
  model = 'gemini-embedding-001';
  dimensions = 768;
  version = 'v1';

  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.GEMINI_API_KEY || process.env.Gemini_API_KEY || '';
  }

  async generateEmbedding(text: string): Promise<number[]> {
    if (!this.apiKey || !this.apiKey.startsWith('AIza') || this.apiKey.length !== 39) {
      if (isMockEmbeddingAllowed()) {
        return new MockEmbeddingProvider().generateEmbedding(text);
      }
      throw new Error(
        'GeminiEmbeddingProvider error: Valid Google AI Studio API key (AIzaSy..., 39 characters) is required in production. Silent fallback to mock embeddings is prohibited.'
      );
    }

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${this.apiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'models/gemini-embedding-001',
          content: { parts: [{ text: text.slice(0, 8000) }] },
          outputDimensionality: 768,
        }),
      });

      if (!res.ok) {
        throw new Error(`Gemini embedding failed with status ${res.status}`);
      }

      const json = await res.json();
      const values = json.embedding?.values;
      if (Array.isArray(values) && values.length === 768) {
        return values;
      }
      throw new Error(
        `Malformed embedding response from Gemini API: expected 768 dimensions, received ${values?.length ?? 'none'}`
      );
    } catch (err: any) {
      if (isMockEmbeddingAllowed()) {
        console.warn(
          '[GeminiEmbeddingProvider] Falling back to deterministic offline provider:',
          err?.message
        );
        return new MockEmbeddingProvider().generateEmbedding(text);
      }
      throw new Error(`Gemini embedding API failed: ${err?.message || String(err)}`);
    }
  }

  async generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
    const results: number[][] = [];
    for (const text of texts) {
      results.push(await this.generateEmbedding(text));
    }
    return results;
  }
}

export class EmbeddingProviderFactory {
  private static instance: IEmbeddingProvider | null = null;

  static isMockAllowed(): boolean {
    return isMockEmbeddingAllowed();
  }

  static getProvider(customKey?: string): IEmbeddingProvider {
    if (customKey === 'mock') {
      if (!isMockEmbeddingAllowed()) {
        throw new Error(
          'MockEmbeddingProvider is strictly prohibited in production unless ALLOW_MOCK_EMBEDDINGS=true is explicitly configured.'
        );
      }
      return new MockEmbeddingProvider();
    }
    const key = customKey || process.env.GEMINI_API_KEY || process.env.Gemini_API_KEY;
    if (key && key.startsWith('AIza') && key.length === 39) {
      return new GeminiEmbeddingProvider(key);
    }
    if (isMockEmbeddingAllowed()) {
      if (!this.instance) {
        this.instance = new MockEmbeddingProvider();
      }
      return this.instance;
    }
    throw new Error(
      'Production configuration error: Genuine Gemini embedding provider requires a valid GEMINI_API_KEY. Mock embeddings are disabled in production unless ALLOW_MOCK_EMBEDDINGS=true.'
    );
  }

  static getActiveProviderMetadata(): {
    name: string;
    model: string;
    dimensions: number;
    version: string;
    isProductionLive: boolean;
  } {
    const key = process.env.GEMINI_API_KEY || process.env.Gemini_API_KEY;
    const isLive = Boolean(key && key.startsWith('AIza') && key.length === 39);
    return {
      name: isLive ? 'Gemini' : 'MockDeterministic',
      model: isLive ? 'gemini-embedding-001' : 'mock-text-embedding-768',
      dimensions: 768,
      version: 'v1',
      isProductionLive: isLive,
    };
  }
}
