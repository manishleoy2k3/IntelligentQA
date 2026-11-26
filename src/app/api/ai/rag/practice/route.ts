import { NextRequest, NextResponse } from 'next/server';
import { PracticeAnswerSchema } from '@/lib/rag/types';
import { practiceEvaluator } from '@/lib/rag/practice-evaluator';
import { sanitizeGeminiKey } from '@/lib/gemini-validator';
import { checkRateLimit } from '@/lib/rag/rate-limiter';

export async function POST(req: NextRequest) {
  try {
    const rateLimit = checkRateLimit(req, 60, 60000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait before submitting more answers.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateLimit.retryAfterSeconds),
          },
        }
      );
    }

    const json = await req.json().catch(() => ({}));
    const parsed = PracticeAnswerSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid answer payload', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { questionId, userAnswer, apiKey: clientApiKey } = parsed.data;
    const headerKey = req.headers.get('x-gemini-api-key') || '';
    const rawKey =
      headerKey || clientApiKey || process.env.GEMINI_API_KEY || process.env.Gemini_API_KEY || '';
    const activeKey = sanitizeGeminiKey(rawKey);

    const evaluation = await practiceEvaluator.evaluateAnswer(questionId, userAnswer, activeKey);

    return NextResponse.json(evaluation, { status: 200 });
  } catch (error: any) {
    console.error('[API /api/ai/rag/practice] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to evaluate practice answer',
        message: error?.message || 'Internal error',
      },
      { status: 500 }
    );
  }
}
