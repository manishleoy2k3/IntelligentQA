/**
 * Agent 07: Coverage Gap Analysis & Traceability Engine
 * Performs bidirectional mapping, scenario-level gap detection,
 * coverage strength classification (Strong, Weak, None), orphan test case detection,
 * and mathematical metric synthesis.
 */

import {
  NormalizedRequirement,
  NormalizedTestCase,
  CoverageGapAnalysisResult,
  RequirementCoverageItem,
  CoveringTestCaseMapping,
  OrphanTestCaseItem,
  ScenarioGapItem,
  CoverageLevel,
  MappingConfidence,
  ScenarioType,
} from '@/types/coverage-gap';

const SCENARIO_DIMENSIONS: {
  type: ScenarioType;
  indicators: string[];
  testIndicators: string[];
}[] = [
  {
    type: 'Positive / Happy Path',
    indicators: [
      'valid',
      'success',
      'successful',
      'standard',
      'normal',
      'complete',
      'allow',
      'can',
      'should',
      'must',
    ],
    testIndicators: [
      'valid',
      'success',
      'successful',
      '200',
      '201',
      'happy path',
      'passes',
      'correct',
      'positive',
    ],
  },
  {
    type: 'Negative / Invalid Input',
    indicators: [
      'invalid',
      'reject',
      'error',
      'wrong',
      'fail',
      'prohibit',
      'disallow',
      'not allow',
      'prevent',
      'format',
      'characters',
    ],
    testIndicators: [
      'invalid',
      'reject',
      'error',
      'fail',
      '400',
      '422',
      'validation error',
      'incorrect',
      'negative',
      'blank',
      'null',
      'empty',
    ],
  },
  {
    type: 'Boundary Value',
    indicators: [
      'min',
      'max',
      'minimum',
      'maximum',
      'limit',
      'range',
      'boundary',
      'exceed',
      'up to',
      'between',
      'at least',
      'threshold',
      'ceiling',
      'floor',
    ],
    testIndicators: [
      'min',
      'max',
      'boundary',
      'limit',
      'bva',
      'exceed',
      'overflow',
      'edge',
      'exact limit',
      '+1',
      '-1',
    ],
  },
  {
    type: 'Field Validation',
    indicators: [
      'field',
      'input',
      'mandatory',
      'optional',
      'length',
      'format',
      'pattern',
      'regex',
      'email',
      'phone',
      'alphanumeric',
      'special characters',
    ],
    testIndicators: [
      'field',
      'mandatory',
      'required',
      'length',
      'format',
      'pattern',
      'special char',
      'whitespace',
      'blank',
    ],
  },
  {
    type: 'Business Rule Validation',
    indicators: [
      'rule',
      'policy',
      'condition',
      'eligible',
      'discount',
      'tier',
      'threshold',
      'daily limit',
      'calculation',
      'fee',
      'rate',
      'approval',
    ],
    testIndicators: [
      'business rule',
      'rule',
      'policy',
      'eligible',
      'tier',
      'calculation',
      'fee',
      'discount',
      'threshold',
      'daily limit',
    ],
  },
  {
    type: 'Conditional / Alternate Flow',
    indicators: ['otherwise', 'unless', 'alternate flow', 'fallback', 'opt-in', 'opt-out'],
    testIndicators: [
      'alternate flow',
      'fallback',
      'opt-out',
      'secondary path',
      'conditional',
      'branch',
    ],
  },
  {
    type: 'Exception Handling',
    indicators: [
      'exception',
      'system crash',
      'server crash',
      'timeout error',
      'network outage',
      'unhandled exception',
    ],
    testIndicators: [
      'exception',
      'timeout',
      'retry',
      'unhandled',
      '500',
      '503',
      'network error',
      'server error',
      'abort',
    ],
  },
  {
    type: 'Authorization / Access Control',
    indicators: [
      'permission',
      'role',
      'admin',
      'token',
      'jwt',
      '2fa',
      'mfa',
      'unauthorized',
      'forbidden',
      'access control',
    ],
    testIndicators: [
      '401',
      '403',
      'unauthorized',
      'forbidden',
      'rbac',
      'permission denied',
      'role',
      'token',
      '2fa',
      'mfa',
      'auth',
    ],
  },
  {
    type: 'Data Integrity',
    indicators: [
      'persist to database',
      'audit log',
      'data consistency',
      'rollback transaction',
      'acid compliance',
    ],
    testIndicators: [
      'persist',
      'db',
      'database',
      'rollback',
      'audit log',
      'data integrity',
      'consistency',
      'stored',
    ],
  },
  {
    type: 'Integration / Dependency Failure',
    indicators: [
      'third-party api',
      'external gateway',
      'downstream service',
      'webhook failure',
      'microservice dependency',
    ],
    testIndicators: [
      'mock',
      'stub',
      'downstream failure',
      'gateway timeout',
      'third party down',
      '502',
      '504',
      'circuit breaker',
    ],
  },
  {
    type: 'State Transition',
    indicators: [
      'state transition',
      'status change',
      'lifecycle transition',
      'from pending to',
      'state machine',
    ],
    testIndicators: [
      'state transition',
      'status change',
      'lifecycle',
      'from pending to',
      'from active to',
      'state machine',
    ],
  },
  {
    type: 'Duplicate Submission / Idempotency',
    indicators: [
      'duplicate submission',
      'idempotent',
      'idempotency',
      'double click',
      'replay attack',
      'concurrent submission',
    ],
    testIndicators: [
      'duplicate',
      'idempotent',
      'double submit',
      'concurrent request',
      'replay attack',
      'double click',
    ],
  },
];

// Helper: Tokenize text into words / stems
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 1 && !STOP_WORDS.has(w));
}

const STOP_WORDS = new Set([
  'the',
  'and',
  'for',
  'with',
  'that',
  'this',
  'from',
  'have',
  'user',
  'system',
  'should',
  'must',
  'when',
  'will',
  'then',
  'each',
  'such',
  'into',
  'than',
  'more',
  'some',
  'what',
  'which',
  'their',
  'there',
  'been',
  'were',
  'being',
]);

// Determine if a scenario type is genuinely relevant to the requirement
function isScenarioRelevantToRequirement(
  reqText: string,
  scenario: (typeof SCENARIO_DIMENSIONS)[number]
): boolean {
  const lower = reqText.toLowerCase();

  // Positive is always relevant
  if (scenario.type === 'Positive / Happy Path') return true;

  // For others, check if requirement contains related keywords or domain concepts
  return scenario.indicators.some((ind) => lower.includes(ind));
}

// Compute mapping between a single requirement and test case
function evaluateRelationship(
  req: NormalizedRequirement,
  tc: NormalizedTestCase
): {
  confidence: MappingConfidence | null;
  evidence: string;
  missingScenarios: string[];
} {
  const reqDesc = req.requirementDescription.toLowerCase();
  const tcDesc = tc.testCaseDescription.toLowerCase();
  const tcSteps = (tc.testSteps || '').toLowerCase();
  const tcExpected = (tc.expectedResults || '').toLowerCase();
  const tcPre = (tc.preconditions || '').toLowerCase();
  const tcData = (tc.inputTestData || '').toLowerCase();

  const combinedTc = `${tcDesc} ${tcSteps} ${tcExpected} ${tcPre} ${tcData}`;

  // 1. Explicit ID Check
  const reqIdClean = req.requirementId.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  const tcFullRaw = `${tc.originalSourceText || ''} ${tcDesc} ${tcSteps}`
    .replace(/[^a-zA-Z0-9]/g, '')
    .toLowerCase();

  const hasExplicitIdMatch = reqIdClean.length >= 2 && tcFullRaw.includes(reqIdClean);

  // 2. Keyword overlap
  const reqTokens = tokenize(req.requirementDescription);
  const tcTokens = tokenize(combinedTc);

  if (reqTokens.length === 0) {
    return { confidence: null, evidence: '', missingScenarios: [] };
  }

  const matches = reqTokens.filter((token) => tcTokens.includes(token));
  const overlapRatio = matches.length / reqTokens.length;

  // 3. Step & Expected Result Evidence Check
  const hasStepValidation = tcSteps.length > 5;
  const hasExpectedResult = tcExpected.length > 5;
  const specificExpectedResult =
    hasExpectedResult &&
    !tcExpected.includes('should work') &&
    !tcExpected.includes('as expected') &&
    !tcExpected.includes('success');

  // Classification logic
  if (hasExplicitIdMatch) {
    let evidence = `Explicit Requirement ID '${req.requirementId}' referenced in Test Case.`;
    if (specificExpectedResult) {
      evidence += ` Verifiable expected result: "${tc.expectedResults?.slice(0, 80)}...".`;
    }
    return { confidence: 'Confirmed', evidence, missingScenarios: [] };
  }

  // Strong semantic match: high overlap + steps/expected result confirm behavior
  if (overlapRatio >= 0.45 && (hasStepValidation || specificExpectedResult)) {
    const evidence = `High semantic alignment (${Math.round(overlapRatio * 100)}% keyword overlap on [${matches.slice(0, 4).join(', ')}]) with step execution and verified expected outcome.`;
    return { confidence: 'Confirmed', evidence, missingScenarios: [] };
  }

  // Probable match: moderate overlap or description matches but steps are sparse
  if (overlapRatio >= 0.3 || (overlapRatio >= 0.25 && matches.length >= 2)) {
    const evidence = `Moderate semantic overlap (${Math.round(overlapRatio * 100)}% on [${matches.slice(0, 3).join(', ')}]). Requires manual confirmation as explicit ID link is absent.`;
    return { confidence: 'Probable', evidence, missingScenarios: [] };
  }

  // Uncertain match: low overlap or keyword-only collision without functional context
  if (overlapRatio >= 0.15 && matches.length >= 1) {
    const evidence = `Keyword collision on [${matches.join(', ')}] with insufficient validation depth in test steps or expected results.`;
    return { confidence: 'Uncertain', evidence, missingScenarios: [] };
  }

  return { confidence: null, evidence: '', missingScenarios: [] };
}

export function analyzeCoverageGaps(
  requirements: NormalizedRequirement[],
  testCases: NormalizedTestCase[]
): CoverageGapAnalysisResult {
  const timestamp = new Date().toISOString();

  if (requirements.length === 0 || testCases.length === 0) {
    return {
      summary: {
        totalRequirements: requirements.length,
        totalTestCases: testCases.length,
        coveragePercentage: 0,
        requirementToTestTraceability: 0,
        testToRequirementTraceability: 0,
        strongCount: 0,
        strongPercentage: 0,
        weakCount: 0,
        weakPercentage: 0,
        noneCount: 0,
        nonePercentage: 0,
        orphanTestCaseCount: testCases.length,
        probableOrUncertainMappingCount: 0,
        clarificationNeededCount: 0,
        potentialDuplicateTestCasesCount: 0,
        potentialDuplicateRequirementsCount: 0,
        analysisTimestamp: timestamp,
      },
      requirementCoverage: [],
      orphanTestCases: testCases.map((tc) => ({
        testCaseId: tc.testCaseId,
        testCaseDescription: tc.testCaseDescription,
        sourceReference: formatSource(tc),
        reason: 'Zero requirements available for mapping.',
        recommendedAction: 'Provide requirement specifications to establish traceability.',
        preconditions: tc.preconditions,
        testSteps: tc.testSteps,
        expectedResults: tc.expectedResults,
      })),
      scenarioGaps: [],
    };
  }

  // Detect duplicates in requirements & test cases
  const seenReqDesc = new Set<string>();
  let duplicateReqCount = 0;
  for (const r of requirements) {
    const key = r.requirementDescription.toLowerCase().trim();
    if (seenReqDesc.has(key)) duplicateReqCount++;
    else seenReqDesc.add(key);
  }

  const seenTcDesc = new Set<string>();
  let duplicateTcCount = 0;
  for (const t of testCases) {
    const key = t.testCaseDescription.toLowerCase().trim();
    if (seenTcDesc.has(key)) duplicateTcCount++;
    else seenTcDesc.add(key);
  }

  // Track reverse traceability (Test Case -> Requirements)
  const tcMappedReqs = new Map<string, { reqId: string; confidence: MappingConfidence }[]>();
  for (const tc of testCases) {
    tcMappedReqs.set(tc.testCaseId, []);
  }

  const requirementCoverage: RequirementCoverageItem[] = [];
  const scenarioGaps: ScenarioGapItem[] = [];
  let probableOrUncertainCount = 0;
  let clarificationNeededCount = 0;

  // Process each requirement
  for (const req of requirements) {
    const coveringList: CoveringTestCaseMapping[] = [];
    const lowerReq = req.requirementDescription.toLowerCase();

    // Check ambiguity: vague words like "quickly", "fast", "user-friendly", "robust", "as appropriate"
    const isAmbiguous =
      /\b(quickly|fast|user-friendly|intuitive|seamless|efficient|robust|appropriate|reasonable|etc)\b/i.test(
        req.requirementDescription
      );
    let clarificationNeeded = '';
    if (isAmbiguous) {
      clarificationNeeded = `Requirement contains subjective/non-quantified terms. Define explicit SLA, latency limits, or deterministic acceptance criteria.`;
      clarificationNeededCount++;
    }

    for (const tc of testCases) {
      const { confidence, evidence } = evaluateRelationship(req, tc);
      if (confidence) {
        if (confidence === 'Probable' || confidence === 'Uncertain') {
          probableOrUncertainCount++;
        }

        coveringList.push({
          testCaseId: tc.testCaseId,
          testCaseDescription: tc.testCaseDescription,
          mappingConfidence: confidence,
          coverageEvidence: evidence,
          missingScenarios: [],
          testSteps: tc.testSteps,
          expectedResults: tc.expectedResults,
          sourceReference: formatSource(tc),
          isUncertain: confidence === 'Uncertain',
        });

        if (confidence === 'Confirmed' || confidence === 'Probable') {
          tcMappedReqs.get(tc.testCaseId)?.push({
            reqId: req.requirementId,
            confidence,
          });
        }
      }
    }

    // Determine relevant scenario dimensions
    const relevantScenarios = SCENARIO_DIMENSIONS.filter((sc) =>
      isScenarioRelevantToRequirement(req.requirementDescription, sc)
    );

    const missingScenarios: string[] = [];
    const combinedCoveringText = coveringList
      .map(
        (c) =>
          `${c.testCaseDescription} ${c.testSteps || ''} ${c.expectedResults || ''} ${c.coverageEvidence}`
      )
      .join(' ')
      .toLowerCase();

    for (const sc of relevantScenarios) {
      const isCovered = sc.testIndicators.some((ind) => combinedCoveringText.includes(ind));
      let status: 'Covered' | 'Weak / Partial' | 'Missing' = 'Missing';
      let recAction = '';

      if (isCovered) {
        status = 'Covered';
      } else {
        missingScenarios.push(sc.type);
        if (sc.type === 'Negative / Invalid Input') {
          recAction = `Add negative test cases validating system rejection of invalid inputs or unauthorized operations.`;
        } else if (sc.type === 'Boundary Value') {
          recAction = `Add boundary value tests validating minimum, maximum, and out-of-range thresholds.`;
        } else if (sc.type === 'Business Rule Validation') {
          recAction = `Add dedicated test cases verifying specific business logic formulas, constraints, and decision rules.`;
        } else if (sc.type === 'Authorization / Access Control') {
          recAction = `Add security test cases verifying role-based access restrictions and token validation.`;
        } else if (sc.type === 'Exception Handling') {
          recAction = `Add test cases verifying system resilience under timeout, downstream service outage, or network drops.`;
        } else if (sc.type === 'Duplicate Submission / Idempotency') {
          recAction = `Add idempotency tests simulating rapid double-clicks or repeated transaction payloads.`;
        } else {
          recAction = `Create targeted test cases addressing the uncovered ${sc.type} acceptance criteria.`;
        }
      }

      scenarioGaps.push({
        requirementId: req.requirementId,
        requirementDescription: req.requirementDescription,
        scenarioType: sc.type,
        coverageStatus: status,
        existingCoveringTestCases:
          coveringList
            .filter((c) => !c.isUncertain)
            .map((c) => c.testCaseId)
            .join(', ') || 'None',
        recommendedAction: recAction || 'Coverage verified.',
      });
    }

    // Classification (Strong, Weak, None)
    let coverageLevel: CoverageLevel = 'None';
    const improvementRecommendations: string[] = [];
    let coverageEvidence = '';

    const confirmedMappings = coveringList.filter((c) => c.mappingConfidence === 'Confirmed');
    const probableMappings = coveringList.filter((c) => c.mappingConfidence === 'Probable');

    if (confirmedMappings.length === 0 && probableMappings.length === 0) {
      coverageLevel = 'None';
      coverageEvidence =
        'No covering test case found matching requirement scope or acceptance criteria.';
      improvementRecommendations.push(
        `Author new test cases covering core positive flow and critical negative/edge conditions for requirement ${req.requirementId}.`
      );
    } else {
      // We have some mappings. Is it Strong or Weak?
      // Check if negative/boundary scenarios are missing
      const needsNegative = relevantScenarios.some((s) => s.type === 'Negative / Invalid Input');
      const hasNegativeCovered = !missingScenarios.includes('Negative / Invalid Input');

      const needsBoundary = relevantScenarios.some((s) => s.type === 'Boundary Value');
      const hasBoundaryCovered = !missingScenarios.includes('Boundary Value');

      const onlyPositive = needsNegative && !hasNegativeCovered;
      const missingCriticalBoundary = needsBoundary && !hasBoundaryCovered;
      const isProbableOnly = confirmedMappings.length === 0 && probableMappings.length > 0;

      // Check if expected results are vague across all mappings
      const allVague = coveringList.every(
        (c) =>
          !c.expectedResults ||
          c.expectedResults.length < 6 ||
          c.expectedResults.toLowerCase().includes('should work') ||
          c.expectedResults.toLowerCase().includes('as expected')
      );

      if (
        isProbableOnly ||
        onlyPositive ||
        missingCriticalBoundary ||
        allVague ||
        (missingScenarios.length >= 2 && confirmedMappings.length < 2)
      ) {
        coverageLevel = 'Weak';

        const weakReasons: string[] = [];
        if (isProbableOnly) {
          weakReasons.push(
            'Mapping relies purely on probable semantic similarity without explicit requirement verification.'
          );
        }
        if (onlyPositive) {
          weakReasons.push(
            'Only positive/happy path is tested; mandatory negative scenarios are missing.'
          );
          improvementRecommendations.push(
            'Add negative test cases for invalid inputs, failed authorizations, or rejected conditions.'
          );
        }
        if (missingCriticalBoundary) {
          weakReasons.push('Key boundary values and threshold limits are untested.');
          improvementRecommendations.push(
            'Define boundary value tests for minimum and maximum permitted values.'
          );
        }
        if (allVague) {
          weakReasons.push(
            'Test cases contain vague or unspecific expected results lacking verifiable assertions.'
          );
          improvementRecommendations.push(
            'Specify concrete, verifiable assertions and expected HTTP/UI response codes.'
          );
        }
        if (missingScenarios.length > 0 && improvementRecommendations.length === 0) {
          improvementRecommendations.push(
            `Add test cases covering missing scenario dimensions: ${missingScenarios.join(', ')}.`
          );
        }

        coverageEvidence = `Weak coverage: ${weakReasons.join(' ')}`;
      } else {
        coverageLevel = 'Strong';
        coverageEvidence = `Strong coverage: validated by ${confirmedMappings.length} confirmed test case(s) addressing core positive and key boundary/negative conditions with verifiable expected results.`;
        improvementRecommendations.push(
          'Coverage appears adequate based on the supplied requirements and test cases.'
        );
      }
    }

    if (isAmbiguous) {
      improvementRecommendations.push(`Clarification Need: ${clarificationNeeded}`);
    }

    requirementCoverage.push({
      requirementId: req.requirementId,
      requirementDescription: req.requirementDescription,
      coverageLevel,
      coveringTestCases: coveringList,
      missingScenarios,
      improvementRecommendations,
      sourceReference: formatSource(req),
      isAmbiguous,
      clarificationNeeded,
      coverageEvidence,
    });
  }

  // Identify Orphan Test Cases (Test cases with 0 Confirmed or Probable mappings)
  const orphanTestCases: OrphanTestCaseItem[] = [];
  for (const tc of testCases) {
    const mappings = tcMappedReqs.get(tc.testCaseId) || [];
    if (mappings.length === 0) {
      // Classify reason
      let reason = 'Test case does not map to any supplied requirement.';
      let recAction =
        'Verify whether this test case covers an unwritten business requirement, an exploratory scenario, or is obsolete.';

      const lower = tc.testCaseDescription.toLowerCase();
      if (lower.includes('regression') || lower.includes('smoke')) {
        reason =
          'General regression/smoke suite test case without explicit link to a functional specification.';
        recAction =
          'Link to the parent architecture or feature specification, or retain as regression baseline.';
      } else if (
        lower.includes('deprecated') ||
        lower.includes('old') ||
        lower.includes('legacy')
      ) {
        reason = 'Potentially obsolete or legacy test case.';
        recAction =
          'Review with team and retire if the underlying feature has been decommissioned.';
      }

      orphanTestCases.push({
        testCaseId: tc.testCaseId,
        testCaseDescription: tc.testCaseDescription,
        sourceReference: formatSource(tc),
        reason,
        recommendedAction: recAction,
        preconditions: tc.preconditions,
        testSteps: tc.testSteps,
        expectedResults: tc.expectedResults,
      });
    }
  }

  // Calculate Metrics
  const totalReqs = requirements.length;
  const totalTcs = testCases.length;

  const strongCount = requirementCoverage.filter((r) => r.coverageLevel === 'Strong').length;
  const weakCount = requirementCoverage.filter((r) => r.coverageLevel === 'Weak').length;
  const noneCount = requirementCoverage.filter((r) => r.coverageLevel === 'None').length;

  // Coverage % = (Reqs with at least one meaningful mapped test case [Strong or Weak] / Total reqs) * 100
  const coveragePercentage =
    totalReqs > 0 ? Number((((strongCount + weakCount) / totalReqs) * 100).toFixed(1)) : 0;

  // Req-to-Test Traceability % = (Reqs with Confirmed or clearly evidenced Probable mapping / Total reqs) * 100
  const traceableReqsCount = requirementCoverage.filter((r) =>
    r.coveringTestCases.some(
      (c) => c.mappingConfidence === 'Confirmed' || c.mappingConfidence === 'Probable'
    )
  ).length;
  const reqToTestTraceability =
    totalReqs > 0 ? Number(((traceableReqsCount / totalReqs) * 100).toFixed(1)) : 0;

  // Test-to-Req Traceability % = (Test cases mapped to >= 1 requirement [Confirmed or Probable] / Total TCs) * 100
  const traceableTcsCount = totalTcs - orphanTestCases.length;
  const testToReqTraceability =
    totalTcs > 0 ? Number(((traceableTcsCount / totalTcs) * 100).toFixed(1)) : 0;

  const strongPercentage = totalReqs > 0 ? Number(((strongCount / totalReqs) * 100).toFixed(1)) : 0;
  const weakPercentage = totalReqs > 0 ? Number(((weakCount / totalReqs) * 100).toFixed(1)) : 0;
  const nonePercentage = totalReqs > 0 ? Number(((noneCount / totalReqs) * 100).toFixed(1)) : 0;

  return {
    summary: {
      totalRequirements: totalReqs,
      totalTestCases: totalTcs,
      coveragePercentage,
      requirementToTestTraceability: reqToTestTraceability,
      testToRequirementTraceability: testToReqTraceability,
      strongCount,
      strongPercentage,
      weakCount,
      weakPercentage,
      noneCount,
      nonePercentage,
      orphanTestCaseCount: orphanTestCases.length,
      probableOrUncertainMappingCount: probableOrUncertainCount,
      clarificationNeededCount,
      potentialDuplicateTestCasesCount: duplicateTcCount,
      potentialDuplicateRequirementsCount: duplicateReqCount,
      analysisTimestamp: timestamp,
    },
    requirementCoverage,
    orphanTestCases,
    scenarioGaps,
  };
}

function formatSource(item: NormalizedRequirement | NormalizedTestCase): string {
  const parts: string[] = [];
  if (item.sourceFile) parts.push(item.sourceFile);
  if (item.sourceWorksheet) parts.push(`Sheet: ${item.sourceWorksheet}`);
  if (item.sourceSection) parts.push(`Section: ${item.sourceSection}`);
  if (item.sourceRow) parts.push(`Row ${item.sourceRow}`);
  return parts.length > 0 ? parts.join(' / ') : 'Source Reference Available';
}
