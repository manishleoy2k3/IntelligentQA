import crypto from 'crypto';
import { RAGSourceType } from './types';

export type SyntheticQueryStyle =
  'beginner' | 'intermediate' | 'advanced' | 'practical' | 'interview';

export type SyntheticQueryStatus = 'pending_review' | 'approved' | 'rejected';

export interface SyntheticQueryRecord {
  id: string;
  sourceType: RAGSourceType;
  sourceId: string;
  queryText: string;
  queryStyle: SyntheticQueryStyle;
  synonyms: string[];
  status: SyntheticQueryStatus;
  batchId: string;
  createdAt: string;
  reviewedAt?: string | null;
}

export interface SyntheticSourceInput {
  sourceType: RAGSourceType;
  sourceId: string;
  sourceTitle: string;
  content: string;
  technology?: string | null;
  framework?: string | null;
  aliases?: string[];
}

const TECH_SYNONYM_MAP: Record<string, string[]> = {
  jmeter: ['Apache JMeter', 'JMeter'],
  playwright: ['Playwright', 'PW'],
  selenium: ['Selenium WebDriver', 'Selenium'],
  restassured: ['RestAssured', 'REST Assured'],
  pom: ['Page Object Model', 'POM'],
  api: ['API', 'REST API'],
  cicd: ['CI/CD', 'continuous integration and delivery'],
};

function detectSynonyms(text: string, aliases: string[] = []): string[] {
  const lower = text.toLowerCase();
  const found = new Set<string>(aliases);
  for (const [key, syns] of Object.entries(TECH_SYNONYM_MAP)) {
    if (lower.includes(key) || syns.some((s) => lower.includes(s.toLowerCase()))) {
      syns.forEach((s) => found.add(s));
    }
  }
  return Array.from(found);
}

/**
 * Provider-independent, deterministic synthetic query generator.
 * Generates ~3 realistic learner questions per published knowledge chunk
 * without inventing facts or silently calling paid APIs.
 */
export function generateQueriesForSource(
  source: SyntheticSourceInput,
  batchId = `batch-${Date.now()}`
): SyntheticQueryRecord[] {
  const title = source.sourceTitle.trim();
  const tech = source.technology || source.framework || 'this topic';
  const synonyms = detectSynonyms(`${title} ${source.content.slice(0, 400)}`, source.aliases || []);
  const now = new Date().toISOString();

  const candidates: Array<{ queryText: string; queryStyle: SyntheticQueryStyle }> = [
    {
      queryText: `How do I use ${title} in ${tech}?`,
      queryStyle: 'beginner',
    },
    {
      queryText: `What is the practical way to implement ${title}?`,
      queryStyle: 'practical',
    },
    {
      queryText:
        source.sourceType === 'interview_question'
          ? `Do we have interview questions about ${title}?`
          : `What are common interview questions on ${title}?`,
      queryStyle: 'interview',
    },
  ];

  // Deduplicate by normalized query text
  const seen = new Set<string>();
  const results: SyntheticQueryRecord[] = [];

  for (const item of candidates) {
    const norm = item.queryText.toLowerCase().trim();
    if (seen.has(norm)) continue;
    seen.add(norm);

    results.push({
      id: crypto.randomUUID(),
      sourceType: source.sourceType,
      sourceId: source.sourceId,
      queryText: item.queryText,
      queryStyle: item.queryStyle,
      synonyms,
      status: 'pending_review',
      batchId,
      createdAt: now,
      reviewedAt: null,
    });
  }

  return results;
}

export class SyntheticQueryStore {
  private records: SyntheticQueryRecord[] = [];

  addBatch(items: SyntheticQueryRecord[]): SyntheticQueryRecord[] {
    const existing = new Set(
      this.records.map((r) => `${r.sourceId}::${r.queryText.toLowerCase()}`)
    );
    const added: SyntheticQueryRecord[] = [];
    for (const item of items) {
      const key = `${item.sourceId}::${item.queryText.toLowerCase()}`;
      if (!existing.has(key)) {
        existing.add(key);
        this.records.push(item);
        added.push(item);
      }
    }
    return added;
  }

  list(status?: SyntheticQueryStatus): SyntheticQueryRecord[] {
    if (!status) return [...this.records];
    return this.records.filter((r) => r.status === status);
  }

  review(id: string, status: 'approved' | 'rejected'): SyntheticQueryRecord | null {
    const rec = this.records.find((r) => r.id === id);
    if (!rec) return null;
    rec.status = status;
    rec.reviewedAt = new Date().toISOString();
    return rec;
  }

  clear(): void {
    this.records = [];
  }
}

export const syntheticQueryStore = new SyntheticQueryStore();
