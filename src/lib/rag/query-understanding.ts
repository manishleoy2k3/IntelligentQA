import { RetrievedChunk } from './types';
import { DEFAULT_CODING_PROBLEMS } from '../coding-problems';

export const TECHNOLOGY_ALIASES: Record<string, string[]> = {
  jmeter: ['apache jmeter', 'jmeter', 'load testing', 'thread group'],
  'apache jmeter': ['jmeter', 'apache jmeter'],
  api: ['api', 'rest api', 'restful', 'http', 'endpoint'],
  'rest api': ['api', 'rest api', 'restassured'],
  'ui automation': ['ui automation', 'browser automation', 'playwright', 'selenium'],
  'browser automation': ['browser automation', 'ui automation', 'playwright', 'selenium'],
  pom: ['pom', 'page object model'],
  'page object model': ['page object model', 'pom'],
  'ci/cd': ['ci/cd', 'continuous integration', 'continuous delivery', 'github actions', 'jenkins'],
  playwright: ['playwright', 'pw', 'route interception', 'api mocking'],
  selenium: ['selenium', 'webdriver', 'selenium webdriver'],
};

/**
 * Expands a query with known technology aliases and acronyms.
 */
export function expandQueryAliases(query: string): string[] {
  const lower = query.toLowerCase();
  const expanded = new Set<string>();

  for (const [key, aliases] of Object.entries(TECHNOLOGY_ALIASES)) {
    if (lower.includes(key)) {
      aliases.forEach((a) => expanded.add(a));
    }
  }
  return Array.from(expanded);
}

/**
 * Detects whether the user is asking for a code example or coding problem.
 */
export function isCodeExampleQuery(query: string): boolean {
  return /\b(code|snippet|example|implement|function|class|method|script|intercept|mock|java|python|typescript|javascript|csharp)\b/i.test(
    query
  );
}

/**
 * Searches the canonical coding library (DEFAULT_CODING_PROBLEMS) lexically
 * with language and framework awareness.
 */
export function searchCodingLibraryLexical(query: string, topK = 5): RetrievedChunk[] {
  const lower = query.toLowerCase();
  const terms = lower.split(/[^a-z0-9+.#-]+/).filter((t) => t.length >= 2);
  if (terms.length === 0) return [];

  const langMatch = lower.match(/\b(java|python|typescript|javascript|csharp)\b/i);
  const requestedLang = langMatch ? langMatch[1].toLowerCase() : null;

  const results: RetrievedChunk[] = [];
  for (const problem of DEFAULT_CODING_PROBLEMS) {
    const titleLower = problem.title.toLowerCase();
    const catLower = problem.category.toLowerCase();
    const descLower = problem.description.toLowerCase();

    let hits = 0;
    let titleHits = 0;
    for (const t of terms) {
      if (titleLower.includes(t) || catLower.includes(t)) {
        hits++;
        titleHits++;
      } else if (descLower.includes(t)) {
        hits++;
      }
    }

    if (hits > 0) {
      const langKey = (requestedLang as keyof typeof problem.starterTemplates) || 'typescript';
      const codeSnippet = problem.starterTemplates[langKey] || problem.starterTemplates.java || '';
      const score = Math.min(0.45 + titleHits * 0.2 + hits * 0.06, 0.94);

      results.push({
        chunk: {
          id: `coding-lexical-${problem.id}`,
          sourceType: 'coding_problem',
          sourceId: problem.id,
          sourceTitle: problem.title,
          courseId: null,
          moduleId: null,
          lessonId: null,
          category: problem.category,
          topic: problem.category,
          programmingLanguage: langKey,
          sourceUrl: `/sandbox/code?problem=${problem.id}`,
          contentVersion: 1,
          contentHash: '',
          chunkIndex: 0,
          chunkContent: `Coding Problem: ${problem.title}\nDifficulty: ${problem.difficulty}\nCategory: ${problem.category}\n\n${problem.description}\n\nCode (${langKey}):\n${codeSnippet.slice(0, 600)}`,
          tokenCount: Math.ceil(problem.description.length / 4),
          embedding: [],
          embeddingModel: 'lexical-code',
          embeddingVersion: 'v1',
          publicationStatus: 'published',
          isActive: true,
          metadata: {
            difficulty: problem.difficulty,
            programmingLanguage: langKey,
          },
          indexedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        similarity: Number(score.toFixed(4)),
      });
    }
  }

  results.sort((a, b) => b.similarity - a.similarity);
  return results.slice(0, topK);
}

/**
 * Reciprocal Rank Fusion (RRF) combining multiple ranked retrieval lists.
 * Preserves strong lexical matches even when vector similarity is below threshold.
 */
export function reciprocalRankFusion(
  rankedLists: RetrievedChunk[][],
  k = 60,
  topK = 10
): RetrievedChunk[] {
  const scores = new Map<string, { item: RetrievedChunk; rrfScore: number }>();

  for (const list of rankedLists) {
    list.forEach((item, idx) => {
      const key = `${item.chunk.sourceType}:${item.chunk.sourceId}:${item.chunk.chunkIndex}`;
      const contrib = 1 / (k + idx + 1);
      const existing = scores.get(key);
      if (existing) {
        existing.rrfScore += contrib;
        if (item.similarity > existing.item.similarity) {
          existing.item = item;
        }
      } else {
        scores.set(key, { item, rrfScore: contrib });
      }
    });
  }

  return Array.from(scores.values())
    .sort((a, b) => b.rrfScore - a.rrfScore)
    .slice(0, topK)
    .map((entry) => entry.item);
}
