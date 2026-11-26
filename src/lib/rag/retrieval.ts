import { KnowledgeChunk, RetrievalFilter, RetrievedChunk, Citation } from './types';
import { EmbeddingProviderFactory, IEmbeddingProvider } from './embedding-provider';
import { ragStorage } from './storage';
import { getSupabaseAdminClient } from '../supabase/admin';
import { isSupabaseConfigured } from '../supabase/env';
import { academyStore } from '../academy-store';
import { getAllInterviewQuestions } from '../interview-questions-bank';

export type QueryIntent = 'question_bank_discovery' | 'general_qa';

const DISCOVERY_PATTERNS = [
  /\b(do we have|is there|are there|do you have|show me|find|give me|list)\b.*\b(interview\s*questions?|questions?)\b/i,
  /\b(interview\s*questions?)\b.*\b(on|about|for|related to)\b/i,
];

const QUERY_STOP_WORDS = new Set([
  'what',
  'when',
  'where',
  'which',
  'that',
  'this',
  'with',
  'from',
  'have',
  'does',
  'your',
  'there',
  'about',
  'related',
  'show',
  'find',
  'give',
  'list',
  'some',
  'interview',
  'question',
  'questions',
  'apache',
  'testing',
  'please',
  'tell',
]);

export function detectQueryIntent(query: string): QueryIntent {
  const q = query.trim();
  if (DISCOVERY_PATTERNS.some((re) => re.test(q))) {
    return 'question_bank_discovery';
  }
  return 'general_qa';
}

export function extractSearchTerms(query: string): string[] {
  const normalized = query
    .toLowerCase()
    .replace(/\bapache\s+jmeter\b/g, 'jmeter')
    .replace(/\bperformance\s+testing\b/g, 'performance');

  const rawTokens = normalized.split(/[^a-z0-9+.#-]+/).filter(Boolean);
  const terms = rawTokens.filter((t) => t.length >= 2 && !QUERY_STOP_WORDS.has(t));
  return Array.from(new Set(terms));
}

export function searchInterviewQuestionsLexical(query: string, topK = 8): RetrievedChunk[] {
  const terms = extractSearchTerms(query);
  if (terms.length === 0) return [];

  const questions = getAllInterviewQuestions();
  const matched: RetrievedChunk[] = [];

  for (const q of questions) {
    const titleLower = q.question.toLowerCase();
    const topicLower = (q.topic || '').toLowerCase();
    const techLower = (q.technology || '').toLowerCase();
    const catLower = (q.category || '').toLowerCase();
    const answerLower = (q.answerSummary || '').toLowerCase();

    let hits = 0;
    let titleOrTopicHits = 0;
    for (const t of terms) {
      const inTitleOrTopic =
        titleLower.includes(t) ||
        topicLower.includes(t) ||
        techLower.includes(t) ||
        catLower.includes(t);
      const inAnswer = answerLower.includes(t);
      if (inTitleOrTopic || inAnswer) {
        hits++;
        if (inTitleOrTopic) titleOrTopicHits++;
      }
    }

    if (hits > 0) {
      const score = Math.min(0.45 + titleOrTopicHits * 0.2 + hits * 0.08, 0.95);
      matched.push({
        chunk: {
          id: `iq-lexical-${q.id}`,
          sourceType: 'interview_question',
          sourceId: q.id,
          sourceTitle: q.question,
          courseId: null,
          moduleId: null,
          lessonId: null,
          category: q.category || 'Interview Question',
          topic: q.topic || null,
          contentVersion: 1,
          contentHash: '',
          chunkIndex: 0,
          chunkContent: `Question: ${q.question}\n\nAnswer: ${q.answerSummary || ''}`,
          tokenCount: Math.ceil((q.question.length + (q.answerSummary || '').length) / 4),
          embedding: [],
          embeddingModel: 'lexical-hybrid',
          embeddingVersion: 'v1',
          publicationStatus: 'published',
          isActive: true,
          metadata: {
            category: q.category,
            topic: q.topic,
            technology: q.technology,
            difficulty: q.difficulty,
          },
          indexedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        similarity: Number(score.toFixed(4)),
      });
    }
  }

  matched.sort((a, b) => b.similarity - a.similarity);
  return matched.slice(0, topK);
}

export class RAGRetriever {
  private embeddingProvider: IEmbeddingProvider;

  constructor(embeddingProvider?: IEmbeddingProvider) {
    this.embeddingProvider = embeddingProvider || EmbeddingProviderFactory.getProvider();
  }

  /**
   * Cosine similarity between two unit vectors: dot product.
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;
    let dot = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
    }
    return dot;
  }

  public async retrieve(query: string, filter: RetrievalFilter = {}): Promise<RetrievedChunk[]> {
    const minSim = filter.minSimilarity ?? 0.22;
    const topK = filter.topK ?? 6;

    // 1. Generate query embedding
    const queryVector = await this.embeddingProvider.generateEmbedding(query);

    // 2. Try Supabase pgvector RPC first if configured and reachable
    if (isSupabaseConfigured() && process.env.NODE_ENV !== 'test') {
      try {
        const supabase = getSupabaseAdminClient();
        if (supabase) {
          let rpcName = 'match_knowledge_rag';
          let rpcParams: Record<string, any> = {
            query_embedding: queryVector,
            match_threshold: minSim,
            match_count: topK,
            filter_course_id: filter.courseId || null,
            filter_category: filter.category || null,
            filter_source_type: filter.sourceType || null,
          };

          let { data, error } = await supabase.rpc(rpcName, rpcParams);

          // If match_knowledge_rag is not found, fallback to existing match_knowledge_chunks RPC
          if (
            error &&
            (error.code === 'PGRST202' || error.message.includes('match_knowledge_rag'))
          ) {
            rpcName = 'match_knowledge_chunks';
            const mappedType =
              filter.sourceType &&
              ['lesson', 'interview_question', 'documentation', 'code_example'].includes(
                filter.sourceType
              )
                ? filter.sourceType
                : null;
            const res = await supabase.rpc(rpcName, {
              query_embedding: queryVector,
              match_threshold: minSim,
              match_count: topK,
              filter_course_id: filter.courseId || null,
              filter_source_type: mappedType,
            });
            data = res.data;
            error = res.error;
          }

          if (!error && Array.isArray(data) && data.length > 0) {
            return data.map((item: any) => {
              const meta = (item.metadata || {}) as Record<string, any>;
              return {
                chunk: {
                  id: item.id,
                  sourceType: (meta.realSourceType || item.source_type) as any,
                  sourceId: item.source_id,
                  sourceTitle: item.source_title || meta.sourceTitle || '',
                  courseId: item.course_id,
                  moduleId: item.module_id || meta.moduleId || null,
                  lessonId: item.lesson_id,
                  category: item.category || meta.category || null,
                  topic: item.topic || meta.topic || null,
                  contentVersion: item.content_version || meta.contentVersion || 1,
                  contentHash: item.content_hash || meta.contentHash || '',
                  chunkIndex: item.chunk_index || 0,
                  chunkContent: item.chunk_content,
                  tokenCount: Math.ceil(item.chunk_content.length / 4),
                  embedding: queryVector,
                  embeddingModel: meta.embeddingModel || 'text-embedding-004',
                  embeddingVersion: meta.embeddingVersion || 'v1',
                  publicationStatus: meta.publicationStatus || 'published',
                  isActive: true,
                  metadata: meta,
                  indexedAt: new Date().toISOString(),
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                },
                similarity: Number(item.similarity.toFixed(4)),
              };
            });
          }
        }
      } catch (err: any) {
        console.warn('[RAGRetriever] Supabase pgvector RPC notice:', err?.message);
      }
    }

    // 3. High-performance In-Memory pgvector similarity search
    // Fetch only active, published chunks
    const candidates = await ragStorage.getActiveChunks({
      courseId: filter.courseId,
      category: filter.category,
      sourceType: filter.sourceType,
    });

    const scored: RetrievedChunk[] = [];
    const STOP_WORDS = new Set([
      'and',
      'the',
      'for',
      'with',
      'that',
      'this',
      'are',
      'from',
      'have',
      'has',
      'what',
      'how',
      'why',
      'can',
      'you',
      'about',
      'your',
      'which',
    ]);
    const queryTokens = query
      .toLowerCase()
      .split(/\W+/)
      .filter((t) => t.length > 3 && !STOP_WORDS.has(t));

    for (const chunk of candidates) {
      // Vector Cosine Similarity
      const vectorSim = this.cosineSimilarity(queryVector, chunk.embedding);

      // Lightweight hybrid keyword boost (0.05 - 0.15 boost for exact term matches)
      let keywordBoost = 0;
      const contentLower = chunk.chunkContent.toLowerCase();
      for (const t of queryTokens) {
        if (contentLower.includes(t)) keywordBoost += 0.03;
      }
      keywordBoost = Math.min(keywordBoost, 0.15);

      const totalScore = vectorSim + keywordBoost;

      if (totalScore >= minSim) {
        scored.push({
          chunk,
          similarity: Number(totalScore.toFixed(4)),
        });
      }
    }

    // Sort descending by similarity
    scored.sort((a, b) => b.similarity - a.similarity);

    // Suppress redundant chunks from same source if already top-ranked
    const deduplicated: RetrievedChunk[] = [];
    const seenSources = new Map<string, number>();

    for (const item of scored) {
      const srcKey = `${item.chunk.sourceType}:${item.chunk.sourceId}`;
      const count = seenSources.get(srcKey) || 0;
      if (count < 2) {
        // Allow at most 2 chunks per source
        deduplicated.push(item);
        seenSources.set(srcKey, count + 1);
      }
      if (deduplicated.length >= topK) break;
    }

    // 4. Keyword fallback over Interview Questions if vector search returned 0 matches
    if (
      deduplicated.length === 0 &&
      queryTokens.length > 0 &&
      (!filter.sourceType || filter.sourceType === 'interview_question')
    ) {
      const questions = getAllInterviewQuestions();
      const matched: RetrievedChunk[] = [];
      for (const q of questions) {
        const answerText = q.answerSummary || '';
        const haystack =
          `${q.question} ${answerText} ${q.topic || ''} ${q.category || ''} ${q.technology || ''}`.toLowerCase();
        const hits = queryTokens.filter((t) => haystack.includes(t)).length;
        if (hits > 0) {
          const score = Math.min(0.45 + hits * 0.1, 0.85);
          matched.push({
            chunk: {
              id: `iq-fallback-${q.id}`,
              sourceType: 'interview_question',
              sourceId: q.id,
              sourceTitle: q.question,
              courseId: null,
              moduleId: null,
              lessonId: null,
              category: q.category || 'Interview Question',
              topic: q.topic || null,
              contentVersion: 1,
              contentHash: '',
              chunkIndex: 0,
              chunkContent: `Question: ${q.question}\n\nAnswer: ${answerText}`,
              tokenCount: Math.ceil((q.question.length + answerText.length) / 4),
              embedding: queryVector,
              embeddingModel: 'keyword-fallback',
              embeddingVersion: 'v1',
              publicationStatus: 'published',
              isActive: true,
              metadata: { category: q.category, topic: q.topic, difficulty: q.difficulty },
              indexedAt: new Date().toISOString(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            similarity: Number(score.toFixed(4)),
          });
        }
      }
      matched.sort((a, b) => b.similarity - a.similarity);
      return matched.slice(0, topK);
    }

    return deduplicated;
  }

  /**
   * Generates working citation URLs matching Next.js routes.
   */
  public generateCitation(chunk: KnowledgeChunk, similarity: number): Citation {
    let url = '/courses';

    if (chunk.sourceType === 'lesson') {
      const res = academyStore.getLesson(chunk.sourceId);
      if (res && res.course && res.lesson) {
        url = `/learning/${res.course.slug}/${res.lesson.slug}`;
      } else {
        url = `/learning?lesson=${chunk.sourceId}`;
      }
    } else if (chunk.sourceType === 'course') {
      const course = academyStore.getCourse(chunk.sourceId);
      url = course ? `/courses/${course.slug}` : `/courses`;
    } else if (chunk.sourceType === 'article') {
      const meta = chunk.metadata || {};
      url = meta.slug ? `/blog/${meta.slug}` : `/blog`;
    } else if (chunk.sourceType === 'interview_question') {
      url = `/interview-questions?search=${encodeURIComponent(chunk.sourceTitle)}`;
    }

    // Extract brief excerpt (first 140 chars)
    const excerpt = chunk.chunkContent
      .replace(/^[#\s•\n]+/, '')
      .replace(/\n+/g, ' ')
      .slice(0, 160)
      .trim();

    return {
      sourceType: chunk.sourceType,
      sourceId: chunk.sourceId,
      sourceTitle: chunk.sourceTitle,
      url,
      courseId: chunk.courseId,
      moduleId: chunk.moduleId,
      lessonId: chunk.lessonId,
      similarity,
      version: chunk.contentVersion,
      hash: chunk.contentHash,
      excerpt: `${excerpt}...`,
    };
  }
}

export const ragRetriever = new RAGRetriever();
