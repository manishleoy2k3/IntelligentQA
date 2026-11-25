/**
 * Agent 07: Test Coverage Gap Analysis Engine
 * Domain Types and Data Contracts
 */

export type CoverageLevel = 'Strong' | 'Weak' | 'None';

export type MappingConfidence = 'Confirmed' | 'Probable' | 'Uncertain';

export type ScenarioType =
  | 'Positive / Happy Path'
  | 'Negative / Invalid Input'
  | 'Boundary Value'
  | 'Field Validation'
  | 'Business Rule Validation'
  | 'Conditional / Alternate Flow'
  | 'Exception Handling'
  | 'Authorization / Access Control'
  | 'Data Integrity'
  | 'Integration / Dependency Failure'
  | 'State Transition'
  | 'Duplicate Submission / Idempotency';

export interface NormalizedRequirement {
  requirementId: string;
  isGeneratedId: boolean;
  requirementDescription: string;
  requirementType?: string;
  priority?: string;
  sourceFile?: string;
  sourceWorksheet?: string;
  sourceRow?: string | number;
  sourceSection?: string;
  originalSourceText?: string;
}

export interface NormalizedTestCase {
  testCaseId: string;
  isGeneratedId: boolean;
  testCaseDescription: string;
  preconditions?: string;
  risk?: string;
  testSteps?: string;
  inputTestData?: string;
  expectedResults?: string;
  sourceFile?: string;
  sourceWorksheet?: string;
  sourceRow?: string | number;
  sourceSection?: string;
  originalSourceText?: string;
}

export interface CoveringTestCaseMapping {
  testCaseId: string;
  testCaseDescription: string;
  mappingConfidence: MappingConfidence;
  coverageEvidence: string;
  missingScenarios: string[];
  testSteps?: string;
  expectedResults?: string;
  sourceReference?: string;
  isUncertain?: boolean;
}

export interface RequirementCoverageItem {
  requirementId: string;
  requirementDescription: string;
  coverageLevel: CoverageLevel;
  coveringTestCases: CoveringTestCaseMapping[];
  missingScenarios: string[];
  improvementRecommendations: string[];
  sourceReference: string;
  isAmbiguous?: boolean;
  clarificationNeeded?: string;
  coverageEvidence?: string;
}

export interface OrphanTestCaseItem {
  testCaseId: string;
  testCaseDescription: string;
  sourceReference: string;
  reason: string;
  recommendedAction: string;
  preconditions?: string;
  testSteps?: string;
  expectedResults?: string;
}

export interface ScenarioGapItem {
  requirementId: string;
  requirementDescription: string;
  scenarioType: string;
  coverageStatus: 'Covered' | 'Weak / Partial' | 'Missing';
  existingCoveringTestCases: string;
  recommendedAction: string;
}

export interface CoverageDashboardSummary {
  totalRequirements: number;
  totalTestCases: number;
  coveragePercentage: number;
  requirementToTestTraceability: number;
  testToRequirementTraceability: number;
  strongCount: number;
  strongPercentage: number;
  weakCount: number;
  weakPercentage: number;
  noneCount: number;
  nonePercentage: number;
  orphanTestCaseCount: number;
  probableOrUncertainMappingCount: number;
  clarificationNeededCount: number;
  potentialDuplicateTestCasesCount: number;
  potentialDuplicateRequirementsCount: number;
  analysisTimestamp: string;
}

export interface CoverageGapAnalysisResult {
  summary: CoverageDashboardSummary;
  requirementCoverage: RequirementCoverageItem[];
  orphanTestCases: OrphanTestCaseItem[];
  scenarioGaps: ScenarioGapItem[];
}

export interface ParsedInputItem {
  id?: string;
  description: string;
  type?: string;
  priority?: string;
  preconditions?: string;
  steps?: string;
  testData?: string;
  expectedResult?: string;
  sourceFile: string;
  sourceWorksheet?: string;
  sourceRow?: string | number;
  sourceSection?: string;
  rawText?: string;
}

export interface IngestedDataset {
  requirements: NormalizedRequirement[];
  testCases: NormalizedTestCase[];
  warnings: string[];
  duplicateRequirements: string[];
  duplicateTestCases: string[];
}
