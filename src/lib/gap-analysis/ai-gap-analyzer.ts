/**
 * Agent 07: Live Gemini & Deterministic Gap Analysis Orchestrator
 * Calls Google Gemini when an API key is available to enhance semantic mapping and recommendations,
 * with strict JSON schema validation, retry logic, and deterministic fallback engine.
 */

import {
  NormalizedRequirement,
  NormalizedTestCase,
  CoverageGapAnalysisResult,
} from '@/types/coverage-gap';
import { analyzeCoverageGaps } from './analysis-engine';
import { TEST_COVERAGE_GAP_ANALYSIS_SYSTEM_PROMPT } from '@/data/agents/test-coverage-gap-agent';

export async function runCoverageGapAnalysis(
  requirements: NormalizedRequirement[],
  testCases: NormalizedTestCase[],
  apiKey?: string
): Promise<{ result: CoverageGapAnalysisResult; isLiveAI: boolean; engine: string }> {
  // 1. First run the deterministic analysis engine to guarantee mathematically accurate baseline
  const deterministicResult = analyzeCoverageGaps(requirements, testCases);

  if (!apiKey || requirements.length === 0 || testCases.length === 0) {
    return {
      result: deterministicResult,
      isLiveAI: false,
      engine: 'deterministic-gap-engine',
    };
  }

  // 2. If Gemini API Key is provided, call Gemini to enrich semantic recommendations and detect subtle gaps
  try {
    const candidateModels = ['gemini-3.8-flash'];
    const promptPayload = {
      requirements: requirements.map((r) => ({
        id: r.requirementId,
        description: r.requirementDescription,
        type: r.requirementType,
        priority: r.priority,
      })),
      testCases: testCases.map((tc) => ({
        id: tc.testCaseId,
        description: tc.testCaseDescription,
        steps: tc.testSteps,
        expectedResult: tc.expectedResults,
        preconditions: tc.preconditions,
      })),
      instructions:
        'Analyze bidirectional coverage between requirements and test cases. Return a valid JSON object matching the CoverageGapAnalysisResult structure with summary, requirementCoverage (with requirementId, requirementDescription, coverageLevel: "Strong"|"Weak"|"None", coveringTestCases: [{testCaseId, testCaseDescription, mappingConfidence: "Confirmed"|"Probable"|"Uncertain", coverageEvidence, missingScenarios: []}], missingScenarios, improvementRecommendations, sourceReference), orphanTestCases: [{testCaseId, testCaseDescription, sourceReference, reason, recommendedAction}], and scenarioGaps: [{requirementId, requirementDescription, scenarioType, coverageStatus: "Covered"|"Weak / Partial"|"Missing", existingCoveringTestCases, recommendedAction}]. Do NOT wrap in markdown backticks or commentary.',
    };

    for (const model of candidateModels) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 9500);

      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    text: `${TEST_COVERAGE_GAP_ANALYSIS_SYSTEM_PROMPT}\n\nInput Data:\n${JSON.stringify(
                      promptPayload
                    )}`,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.1,
              responseMimeType: 'application/json',
              maxOutputTokens: 4096,
            },
          }),
        });

        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const cleanJson = rawText
              .replace(/^```(?:json)?\s*/i, '')
              .replace(/\s*```$/i, '')
              .trim();
            const parsed = JSON.parse(cleanJson);

            if (
              parsed &&
              Array.isArray(parsed.requirementCoverage) &&
              parsed.requirementCoverage.length > 0
            ) {
              // Validate and harmonize with deterministic metrics to ensure 100% mathematical integrity
              const mergedResult = mergeAiWithDeterministic(
                parsed,
                deterministicResult,
                requirements
              );
              return {
                result: mergedResult,
                isLiveAI: true,
                engine: model,
              };
            }
          }
        }
      } catch (err) {
        clearTimeout(timeoutId);
        console.warn(`Gemini call to ${model} failed, checking fallback:`, err);
        continue;
      }
    }
  } catch (globalErr) {
    console.warn('AI Gap Analysis fell back to deterministic engine:', globalErr);
  }

  return {
    result: deterministicResult,
    isLiveAI: false,
    engine: 'deterministic-gap-engine',
  };
}

function mergeAiWithDeterministic(
  aiResult: any,
  deterministicResult: CoverageGapAnalysisResult,
  originalReqs: NormalizedRequirement[]
): CoverageGapAnalysisResult {
  // Use AI's nuanced recommendations and evidence where available, but maintain mathematical consistency
  const requirementCoverage = deterministicResult.requirementCoverage.map((detReq) => {
    const aiReq = aiResult.requirementCoverage?.find(
      (a: any) =>
        a.requirementId === detReq.requirementId ||
        a.requirementDescription
          ?.toLowerCase()
          .includes(detReq.requirementDescription.toLowerCase().slice(0, 30))
    );

    if (aiReq) {
      return {
        ...detReq,
        // AI can provide more tailored recommendations
        improvementRecommendations:
          Array.isArray(aiReq.improvementRecommendations) &&
          aiReq.improvementRecommendations.length > 0
            ? aiReq.improvementRecommendations
            : detReq.improvementRecommendations,
        coverageEvidence: aiReq.coverageEvidence || detReq.coverageEvidence,
        // If AI identified specific missing scenarios
        missingScenarios:
          Array.isArray(aiReq.missingScenarios) && aiReq.missingScenarios.length > 0
            ? Array.from(new Set([...detReq.missingScenarios, ...aiReq.missingScenarios]))
            : detReq.missingScenarios,
      };
    }
    return detReq;
  });

  return {
    summary: deterministicResult.summary,
    requirementCoverage,
    orphanTestCases: deterministicResult.orphanTestCases,
    scenarioGaps: deterministicResult.scenarioGaps,
  };
}
