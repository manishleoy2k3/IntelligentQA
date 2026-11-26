import { NextRequest, NextResponse } from 'next/server';
import { AskAIQuerySchema } from '@/lib/rag/types';
import { ragEngine } from '@/lib/rag/engine';
import { sanitizeGeminiKey, validateGeminiKeySyntax } from '@/lib/gemini-validator';
import { checkRateLimit } from '@/lib/rag/rate-limiter';

export async function POST(req: NextRequest) {
  try {
    const rateLimit = checkRateLimit(req, 60, 60000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait before asking more questions.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateLimit.retryAfterSeconds),
          },
        }
      );
    }

    const json = await req.json().catch(() => ({}));
    const parsed = AskAIQuerySchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request payload', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { question, courseId, category, history, apiKey: clientApiKey } = parsed.data;

    // Check API Key: Header > Body > Server env
    const headerKey = req.headers.get('x-gemini-api-key') || '';
    const rawKey =
      headerKey || clientApiKey || process.env.GEMINI_API_KEY || process.env.Gemini_API_KEY || '';
    const activeKey = sanitizeGeminiKey(rawKey);

    // Call RAG Engine
    const result = await ragEngine.ask({
      question,
      courseId,
      category,
      history,
      apiKey: activeKey,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error('[API /api/ai/rag/ask] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to process RAG query',
        message: error?.message || 'Internal server error',
      },
      { status: 500 }
    );
  }
}
