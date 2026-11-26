import { NextRequest, NextResponse } from 'next/server';
import {
  ragRetriever,
  detectQueryIntent,
  searchInterviewQuestionsLexical,
} from '@/lib/rag/retrieval';
import { ragEngine } from '@/lib/rag/engine';
import { ragStorage } from '@/lib/rag/storage';
import { verifyAdminAccess } from '@/lib/cms-security';

export async function POST(req: NextRequest) {
  try {
    const auth = verifyAdminAccess(req);
    if (!auth.authorized) {
      return NextResponse.json(
        { error: auth.reason || 'Unauthorized: Admin role required for RAG playground' },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { question, courseId, minSimilarity = 0.2, topK = 6 } = body;

    if (!question || typeof question !== 'string') {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }

    const detectedIntent = detectQueryIntent(question);
    const lexicalResults = searchInterviewQuestionsLexical(question, topK);

    // 1. Run raw retrieval
    const retrieved = await ragRetriever.retrieve(question, {
      courseId: courseId || undefined,
      minSimilarity,
      topK,
    });

    const detailedChunks = await Promise.all(
      retrieved.map(async (r) => {
        const source = await ragStorage.getKnowledgeSource(r.chunk.sourceType, r.chunk.sourceId);
        const citation = ragRetriever.generateCitation(r.chunk, r.similarity);
        return {
          chunkId: r.chunk.id,
          sourceType: r.chunk.sourceType,
          sourceId: r.chunk.sourceId,
          sourceTitle: r.chunk.sourceTitle,
          similarityScore: r.similarity,
          contentVersion: r.chunk.contentVersion,
          currentSourceVersion: source?.currentVersion || r.chunk.contentVersion,
          isLatestVersion: (source?.currentVersion || 1) === r.chunk.contentVersion,
          publicationStatus: r.chunk.publicationStatus,
          citationUrl: citation.url,
          chunkExcerpt: r.chunk.chunkContent.slice(0, 300) + '...',
          fullChunkContent: r.chunk.chunkContent,
        };
      })
    );

    // 2. Generate full RAG response
    const answerResult = await ragEngine.ask({
      question,
      courseId: courseId || undefined,
      bypassCache: true, // Always test fresh in playground
    });

    return NextResponse.json({
      question,
      selectedCourseId: courseId || 'All Courses (Global)',
      retrievedCount: detailedChunks.length,
      chunks: detailedChunks,
      answerResult,
      diagnostics: {
        originalQuery: question,
        detectedIntent,
        sourcesSearched: ['interview_question_bank', 'vector_index'],
        lexicalResultsCount: lexicalResults.length,
        vectorResultsCount: retrieved.length,
        appliedFilters: { courseId: courseId || null, minSimilarity, topK },
        citations: answerResult.citations,
      },
    });
  } catch (err: any) {
    console.error('[API /api/admin/rag/playground] Error:', err);
    return NextResponse.json({ error: err?.message || 'Playground query error' }, { status: 500 });
  }
}
