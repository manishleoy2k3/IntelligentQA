import { NextRequest, NextResponse } from 'next/server';
import { sanitizeGeminiKey } from '@/lib/gemini-validator';
import { runCoverageGapAnalysis } from '@/lib/gap-analysis/ai-gap-analyzer';
import { parsePastedRequirements, parsePastedTestCases } from '@/lib/gap-analysis/input-parser';
import { NormalizedRequirement, NormalizedTestCase } from '@/types/coverage-gap';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawApiKey = req.headers.get('x-gemini-api-key') || body.apiKey;
    const effectiveApiKey = sanitizeGeminiKey(rawApiKey || '');

    let requirements: NormalizedRequirement[] = Array.isArray(body.requirements)
      ? body.requirements
      : [];
    let testCases: NormalizedTestCase[] = Array.isArray(body.testCases) ? body.testCases : [];

    if (requirements.length === 0 && body.requirementsText) {
      requirements = parsePastedRequirements(body.requirementsText);
    }
    if (testCases.length === 0 && body.testCasesText) {
      testCases = parsePastedTestCases(body.testCasesText);
    }

    if (requirements.length === 0 || testCases.length === 0) {
      return NextResponse.json(
        {
          error: 'MISSING_DATASETS',
          message:
            'Both datasets must contain at least one valid requirement and one valid test case.',
        },
        { status: 400 }
      );
    }

    const { result, isLiveAI, engine } = await runCoverageGapAnalysis(
      requirements,
      testCases,
      effectiveApiKey
    );

    return NextResponse.json({
      action: 'gap_analysis',
      result,
      isLiveAI,
      engine,
    });
  } catch (err: any) {
    console.error('QA Gap Analysis route error:', err);
    return NextResponse.json(
      { error: 'Internal server error analyzing coverage gap', details: err?.message },
      { status: 500 }
    );
  }
}
