import { NextRequest, NextResponse } from 'next/server';
import { AIFactory } from '@/lib/ai/ai-factory';
import { AIEnhancementRequest } from '@/lib/ai/types';
import { sanitizeGeminiKey } from '@/lib/gemini-validator';

// In-memory rate limiting and usage tracking for cost control & safety
interface RateLimitTracker {
  count: number;
  resetTime: number;
}
const rateLimitMap = new Map<string, RateLimitTracker>();
const MAX_REQUESTS_PER_MINUTE = 20;

function checkRateLimit(clientIp: string): boolean {
  const now = Date.now();
  const tracker = rateLimitMap.get(clientIp);

  if (!tracker || now > tracker.resetTime) {
    rateLimitMap.set(clientIp, { count: 1, resetTime: now + 60000 });
    return true;
  }

  if (tracker.count >= MAX_REQUESTS_PER_MINUTE) {
    return false;
  }

  tracker.count++;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'RATE_LIMITED',
            message: 'Too many requests. Please wait a moment before sending another AI enhancement request.',
          },
        },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { action, prompt, context, history, apiKey: bodyApiKey, model } = body;

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'BAD_REQUEST',
            message: 'Prompt is required.',
          },
        },
        { status: 400 }
      );
    }

    if (!context || !context.currentLesson || !context.course) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'BAD_REQUEST',
            message: 'Lesson context package (course, module, currentLesson) is required.',
          },
        },
        { status: 400 }
      );
    }

    // Determine API Key: Header > Body > Server ENV
    // Server environment GEMINI_API_KEY protects keys from ever leaking to client code.
    const headerKey = req.headers.get('x-gemini-api-key');
    const effectiveApiKey = sanitizeGeminiKey(headerKey || bodyApiKey || process.env.GEMINI_API_KEY || '');

    const requestPayload: AIEnhancementRequest = {
      action,
      prompt: prompt.trim(),
      context,
      history,
      apiKey: effectiveApiKey,
      model: model || process.env.GEMINI_MODEL || 'gemini-2.0-flash',
      temperature: 0.2,
      maxTokens: 4096,
    };

    const provider = AIFactory.getProvider('gemini');
    const result = await provider.generateEnhancement(requestPayload);

    if (!result.success) {
      const statusCode = 
        result.error?.code === 'API_KEY_MISSING' ? 403 :
        result.error?.code === 'INVALID_API_KEY' ? 401 :
        result.error?.code === 'RATE_LIMITED' ? 429 :
        result.error?.code === 'QUOTA_EXCEEDED' ? 429 : 500;

      return NextResponse.json(result, { status: statusCode });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[API /api/admin/learning/ai-enhance] Error:', error.message);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'PROVIDER_UNAVAILABLE',
          message: error.message || 'Internal server error occurred while processing AI request.',
        },
      },
      { status: 500 }
    );
  }
}
